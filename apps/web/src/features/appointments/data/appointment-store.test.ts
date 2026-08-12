import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AUTO_CONFIRM_DELAY_MS,
  cancelAppointment,
  createAppointment,
  listAppointments,
  resetAppointmentStore,
  subscribeAppointments,
} from './appointment-store'

const ORNEK = {
  officeId: 'office-1',
  officeName: 'Kadıköy Anahtar Ofis',
  date: '2026-08-14',
  slot: '10:00',
  type: 'office' as const,
}

beforeEach(() => {
  vi.useFakeTimers()
  resetAppointmentStore()
})
afterEach(() => vi.useRealTimers())

describe('randevu store', () => {
  it('oluşturulan randevu pending durumuyla listede görünür', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    const items = listAppointments()
    expect(items).toHaveLength(1)
    expect(items[0].status).toBe('pending')
    expect(items[0].officeName).toBe('Kadıköy Anahtar Ofis')
  })

  it('autoConfirm randevu gecikme sonrasında confirmed olur ve aboneler bilgilendirilir', () => {
    const dinleyici = vi.fn()
    subscribeAppointments(dinleyici)
    createAppointment({ ...ORNEK, autoConfirm: true })
    expect(listAppointments()[0].status).toBe('pending')
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS)
    expect(listAppointments()[0].status).toBe('confirmed')
    expect(dinleyici).toHaveBeenCalled()
  })

  it('autoConfirm=false randevu gecikme geçse de pending kalır', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS * 3)
    expect(listAppointments()[0].status).toBe('pending')
  })

  it('iptal edilen randevu cancelled olur; onay zamanlayıcısı onu geri çeviremez', () => {
    const randevu = createAppointment({ ...ORNEK, autoConfirm: true })
    cancelAppointment(randevu.id)
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS)
    expect(listAppointments()[0].status).toBe('cancelled')
  })

  it('liste en yeni randevuyu başa koyar', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    vi.advanceTimersByTime(10)
    const ikinci = createAppointment({ ...ORNEK, slot: '11:00', autoConfirm: false })
    expect(listAppointments()[0].id).toBe(ikinci.id)
  })

  it('listAppointments referansı değişiklik olmadıkça sabittir (useSyncExternalStore sözleşmesi)', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    expect(listAppointments()).toBe(listAppointments())
  })
})
