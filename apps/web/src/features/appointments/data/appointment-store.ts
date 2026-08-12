import { useSyncExternalStore } from 'react'
import type { Appointment, AppointmentType } from '../domain/appointment-types'

/**
 * Oturum ömürlü mock store — favorites ile aynı kalıcılık sözleşmesi:
 * sayfalar arası korunur, tam yenilemede sıfırlanır. Gerçek backend geldiğinde
 * bu modülün dışa açtığı imzalar API istemcisiyle bire bir değiştirilebilir.
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

let appointments: Appointment[] = []
let nextId = 1
const listeners = new Set<() => void>()

function notify() {
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

/** Yalnız testler için: modül durumunu sıfırlar */
export function resetAppointmentStore(): void {
  appointments = []
  nextId = 1
  listeners.clear()
}
