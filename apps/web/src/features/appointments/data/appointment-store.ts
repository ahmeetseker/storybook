import { useSyncExternalStore } from 'react'
import type { Appointment, AppointmentType } from '../domain/appointment-types'

/**
 * Oturum ömürlü mock store — favorites/taslak/oturum ile aynı kalıcılık
 * sözleşmesi: sekme ömrü boyunca korunur, sekme kapanınca sıfırlanır. Gerçek
 * backend geldiğinde bu modülün dışa açtığı imzalar API istemcisiyle bire
 * bir değiştirilebilir.
 *
 * sessionStorage'a yazılır çünkü site footer'ındaki "Hesabım" bağlantısı
 * SPA navigasyonu DEĞİL, TAM sayfa yüklemesi yapıyor (uçtan uca doğrulamada
 * `window` nesnesinin sıfırlandığı gözlemlendi). Salt bellek içi bir modül
 * durumu bu geçişte kayboluyor ve /hesabim/randevularim doğal akışta hep
 * boş görünüyordu — takip özelliği fiilen erişilemez hâldeydi. sessionStorage
 * tam sayfa yüklemesinde de hayatta kaldığı için bu boşluğu kapatır.
 */

/** Hızlı yanıt veren ofisin talebi bu süre sonunda mock olarak onaylanır */
export const AUTO_CONFIRM_DELAY_MS = 4000

export interface CreateAppointmentInput {
  officeId: string
  officeName: string
  date: string
  slot: string
  type: AppointmentType
  note?: string
  /** Ofis hızlı yanıtlıyorsa talep kısa gecikmeyle onaylanmış görünür */
  autoConfirm: boolean
}

const STORAGE_KEY = 'arsam:randevular'

interface PersistedRecord {
  appointment: Appointment
  /** Hydrate sırasında yarım kalmış onay zamanlayıcısını tamamlamak için gerekli. */
  autoConfirm: boolean
}

interface PersistedState {
  records: PersistedRecord[]
  nextId: number
}

let appointments: Appointment[] = []
let nextId = 1
/** appointments dizisinde tutulmayan tek bilgi: id → autoConfirm eşlemesi. */
const autoConfirmFlags = new Map<string, boolean>()
const listeners = new Set<() => void>()

/** SSR'da sessionStorage yok; özel pencere/kota gibi durumlarda erişim atabilir. */
function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function persist() {
  const store = storage()
  if (!store) return
  try {
    const records: PersistedRecord[] = appointments.map((appointment) => ({
      appointment,
      autoConfirm: autoConfirmFlags.get(appointment.id) ?? false,
    }))
    const state: PersistedState = { records, nextId }
    store.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* Kota dolu ya da erişim engelli: bellek içi durum akışa devam eder. */
  }
}

/**
 * sessionStorage'dan modül durumunu okur. Modül yüklenirken ve testlerde
 * "sayfa yenilendi" senaryosunu simüle etmek için çağrılır.
 */
function hydrate() {
  const store = storage()
  if (!store) return
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<PersistedState> | null
    if (!parsed || !Array.isArray(parsed.records)) return

    const nextAppointments: Appointment[] = []
    const nextFlags = new Map<string, boolean>()
    for (const record of parsed.records) {
      const appointment = record?.appointment
      if (!appointment || typeof appointment !== 'object' || !appointment.id) continue
      const autoConfirm = Boolean(record.autoConfirm)
      nextFlags.set(appointment.id, autoConfirm)
      // Yarım kalmış onay zamanlayıcısı: sayfa 4sn dolmadan tam yenilendiyse
      // setTimeout kaybolur ve pending kayıt sonsuza dek beklemede kalırdı.
      // Kalan süreyi createdAt farkından yeniden hesaplayıp zamanlayıcıyı
      // yeniden kurmak kırılgan ve test etmesi zor (gerçek saat/duvar saati
      // karışımı); ofis zaten "hızlı yanıtlıyor" kabul edildiği için hydrate
      // anında doğrudan confirmed'a geçmek daha basit ve deterministiktir.
      if (appointment.status === 'pending' && autoConfirm) {
        nextAppointments.push({ ...appointment, status: 'confirmed' })
      } else {
        nextAppointments.push(appointment)
      }
    }
    appointments = nextAppointments
    autoConfirmFlags.clear()
    for (const [id, flag] of nextFlags) autoConfirmFlags.set(id, flag)
    if (typeof parsed.nextId === 'number' && parsed.nextId > nextId) nextId = parsed.nextId
  } catch {
    // Bozuk/ayrıştırılamayan JSON: boş durumla devam et, akışı kırma.
    appointments = []
    autoConfirmFlags.clear()
  }
}

hydrate()

function notify() {
  persist()
  for (const listener of listeners) listener()
}

function patch(id: string, status: Appointment['status'], onlyIfPending: boolean) {
  const current = appointments.find((item) => item.id === id)
  if (!current || (onlyIfPending && current.status !== 'pending')) return
  appointments = appointments.map((item) => (item.id === id ? { ...item, status } : item))
  notify()
}

export function createAppointment(input: CreateAppointmentInput): Appointment {
  const { autoConfirm, ...fields } = input
  const appointment: Appointment = {
    id: `randevu-${nextId++}`,
    ...fields,
    status: 'pending',
    createdAt: Date.now(),
  }
  autoConfirmFlags.set(appointment.id, autoConfirm)
  // En yeni başa: takip listesi son talebi ilk gösterir.
  appointments = [appointment, ...appointments]
  notify()
  if (autoConfirm) {
    // İptal edilmiş kaydı geri açmamak için yalnız pending → confirmed.
    setTimeout(() => patch(appointment.id, 'confirmed', true), AUTO_CONFIRM_DELAY_MS)
  }
  return appointment
}

export function cancelAppointment(id: string): void {
  patch(id, 'cancelled', false)
}

export function listAppointments(): Appointment[] {
  return appointments
}

export function subscribeAppointments(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppointments(): Appointment[] {
  return useSyncExternalStore(subscribeAppointments, listAppointments, listAppointments)
}

/** Yalnız testler için: modül durumunu ve sessionStorage'daki kaydı sıfırlar */
export function resetAppointmentStore(): void {
  appointments = []
  nextId = 1
  listeners.clear()
  autoConfirmFlags.clear()
  const store = storage()
  if (!store) return
  try {
    store.removeItem(STORAGE_KEY)
  } catch {
    /* yoksayılır */
  }
}

/**
 * Yalnız testler için: modülü yeniden import etmeden "sayfa yenilendi"
 * senaryosunu simüle eder — sessionStorage'daki durumu belleğe geri okur.
 */
export function __rehydrateForTests(): void {
  hydrate()
}
