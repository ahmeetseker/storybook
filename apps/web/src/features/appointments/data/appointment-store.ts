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
  version: number
  records: PersistedRecord[]
  nextId: number
}

/**
 * Kalıcı JSON'un şema sürümü. Kayıt şeklini (alan adı, tip, format)
 * DEĞİŞTİRDİĞİMİZDE bunu artırırız; hydrate() sürüm uyuşmazlığında TÜM
 * payload'ı atar — eski/yarım yorumlanmış alanlarla "doğru görünen ama
 * yanlış" bir randevu üretmektense boş listeyle başlamak daha güvenli.
 * Takip listesi zaten mock/oturum ömürlü olduğu için bu kayıp zararsızdır.
 */
const SCHEMA_VERSION = 1

const APPOINTMENT_STATUSES: ReadonlySet<Appointment['status']> = new Set(['pending', 'confirmed', 'cancelled'])
const APPOINTMENT_TYPES: ReadonlySet<AppointmentType> = new Set(['office', 'video'])
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const SLOT_RE = /^\d{2}:\d{2}$/

/**
 * Tek bir kaydın şeklini doğrular. Sürüm doğru olsa bile kayıt elle
 * düzenlenmiş/bozulmuş sessionStorage'dan gelebilir (ör. `date: "geçersiz"`)
 * — bunu `AccountAppointmentsPage` `dateFmt.format(parseDay(item.date))`
 * ile biçimlendirirken Date RangeError fırlatıp TÜM sayfayı çökertiyordu.
 * Kayıt bazında doğrulayıp yalnız GEÇERSİZ kaydı atarız (tüm payload'ı değil)
 * çünkü tek bozuk randevu yüzünden kullanıcının diğer geçerli randevularının
 * da kaybolması gereksiz bir kayıp olurdu.
 */
function isValidPersistedRecord(record: unknown): record is PersistedRecord {
  if (!record || typeof record !== 'object') return false
  const appointment = (record as { appointment?: unknown }).appointment
  if (!appointment || typeof appointment !== 'object') return false
  const a = appointment as Partial<Appointment>
  if (!a.id) return false
  if (typeof a.date !== 'string' || !DATE_KEY_RE.test(a.date)) return false
  if (typeof a.slot !== 'string' || !SLOT_RE.test(a.slot)) return false
  if (!a.status || !APPOINTMENT_STATUSES.has(a.status)) return false
  if (!a.type || !APPOINTMENT_TYPES.has(a.type)) return false
  return true
}

/**
 * useSyncExternalStore'un `getServerSnapshot`'ı için SABİT boş referans.
 * `hydrate()` modül yüklenirken çalışır ve istemcide `appointments`'ı
 * sessionStorage'dan doldurur — React DOM'u hydrate ederken sunucuda
 * üretilen (boş) HTML ile eşleşmesini beklediği için `getServerSnapshot`
 * `listAppointments`'ı YENİDEN KULLANAMAZ: hydrate sonrası artık dolu döner
 * ve bu, sunucu/istemci uyuşmazlığına (React hydration mismatch) yol açar.
 * Bu sabit, `hydrate()`'ten tamamen bağımsız kalır; her çağrıda AYNI
 * referansı döndürmesi de useSyncExternalStore'un sonsuz döngüye
 * girmemesi için zorunludur.
 */
const EMPTY_SERVER_SNAPSHOT: Appointment[] = []

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
    const state: PersistedState = { version: SCHEMA_VERSION, records, nextId }
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
    // Sürüm alanı yok (eski format) ya da farklı: bkz. SCHEMA_VERSION yorumu —
    // tüm payload'ı at, boş listeyle devam et.
    if (parsed.version !== SCHEMA_VERSION) return

    const nextAppointments: Appointment[] = []
    const nextFlags = new Map<string, boolean>()
    for (const record of parsed.records) {
      if (!isValidPersistedRecord(record)) continue
      const appointment = record.appointment
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
  return useSyncExternalStore(subscribeAppointments, listAppointments, () => EMPTY_SERVER_SNAPSHOT)
}

/** Yalnız testler için: getServerSnapshot'ın döndürdüğü sabit referansı doğrulamaya açar. */
export function __getServerSnapshotForTests(): Appointment[] {
  return EMPTY_SERVER_SNAPSHOT
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
