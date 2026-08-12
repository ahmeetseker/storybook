import { describe, expect, it } from 'vitest'
import {
  availabilityPreview,
  firstAvailableDay,
  officeAvailability,
  toDateKey,
} from './appointment-availability'

// 2026-08-12 Çarşamba; 15-16'sı hafta sonu.
const CARSAMBA = new Date(2026, 7, 12)
const CUMARTESI = new Date(2026, 7, 15)

describe('ofis müsaitliği', () => {
  it('aynı girdi için her çağrıda aynı slotları üretir', () => {
    const once = officeAvailability('office-1', CARSAMBA)
    const sonra = officeAvailability('office-1', CARSAMBA)
    expect(once).toEqual(sonra)
  })

  it('farklı ofisler aynı günde farklı doluluk desenine sahiptir', () => {
    const bir = officeAvailability('office-1', CARSAMBA)
    const iki = officeAvailability('office-2', CARSAMBA)
    expect(bir.map((s) => s.available)).not.toEqual(iki.map((s) => s.available))
  })

  it('hafta sonu kapalıdır', () => {
    expect(officeAvailability('office-1', CUMARTESI)).toEqual([])
  })

  it('hafta içi 09:00-17:00 arasında 9 slot döner ve en az biri müsaittir', () => {
    const slots = officeAvailability('office-3', CARSAMBA)
    expect(slots).toHaveLength(9)
    expect(slots[0].time).toBe('09:00')
    expect(slots[8].time).toBe('17:00')
    expect(slots.some((s) => s.available)).toBe(true)
  })

  it('firstAvailableDay hafta sonunu atlayıp ilk müsait güne gider', () => {
    const sonuc = firstAvailableDay('office-1', CUMARTESI)
    expect(sonuc).toBeDefined()
    expect([0, 6]).not.toContain(sonuc!.date.getDay())
    expect(sonuc!.slots.some((s) => s.available)).toBe(true)
  })

  it('availabilityPreview boş saat sayısını ve ilk uygun saati söyler', () => {
    const metin = availabilityPreview('office-1', CARSAMBA)
    expect(metin).toMatch(/\d+ boş saat/)
    expect(metin).toMatch(/İlk uygun \d{2}:00/)
  })

  it('toDateKey yıl-ay-gün üretir', () => {
    expect(toDateKey(CARSAMBA)).toBe('2026-08-12')
  })
})
