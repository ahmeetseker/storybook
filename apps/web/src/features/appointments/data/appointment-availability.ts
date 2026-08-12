import type { AppointmentSlot } from '../domain/appointment-types'

/**
 * Müsaitlik MOCK'tur ama rastgele değildir: ofis kimliği + gün anahtarından
 * türeyen deterministik desen, aynı ofis/gün için her render'da aynı sonucu
 * verir (testler ve SSR/CSR tutarlılığı buna dayanır).
 */

/** 09:00-17:00 arası tam saat başları — günün satış saatleri */
const SLOT_TIMES = Array.from({ length: 9 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`)

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

const addDays = (date: Date, n: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + n)
  return next
}

/** djb2 — kripto değil, yalnız yayılım için */
function hash(input: string): number {
  let value = 5381
  for (let i = 0; i < input.length; i += 1) value = (value * 33 + input.charCodeAt(i)) >>> 0
  return value
}

export function officeAvailability(officeId: string, date: Date): AppointmentSlot[] {
  if (isWeekend(date)) return []
  const dayKey = toDateKey(date)
  const slots = SLOT_TIMES.map((time) => ({
    time,
    available: hash(`${officeId}|${dayKey}|${time}`) % 3 !== 0,
  }))
  // Hafta içi gün asla tamamen dolu görünmez: kart önizlemesi ve modal
  // "ilk uygun saat" vaadini her zaman tutabilmeli.
  if (!slots.some((slot) => slot.available)) {
    slots[hash(`${officeId}|${dayKey}`) % slots.length].available = true
  }
  return slots
}

export function firstAvailableDay(
  officeId: string,
  from: Date,
  horizonDays = 14,
): { date: Date; slots: AppointmentSlot[] } | undefined {
  for (let offset = 0; offset <= horizonDays; offset += 1) {
    const date = addDays(from, offset)
    const slots = officeAvailability(officeId, date)
    if (slots.some((slot) => slot.available)) return { date, slots }
  }
  return undefined
}

const dayLabelFmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' })

/** Kart önizlemesi: "Bugün 5 boş saat · İlk uygun 09:00" */
export function availabilityPreview(officeId: string, from: Date): string {
  const found = firstAvailableDay(officeId, from)
  if (!found) return 'Yakın tarihte boş saat yok'
  const open = found.slots.filter((slot) => slot.available)
  const dayDiff = Math.round(
    (new Date(found.date.getFullYear(), found.date.getMonth(), found.date.getDate()).getTime() -
      new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) /
      86_400_000,
  )
  const dayLabel = dayDiff === 0 ? 'Bugün' : dayDiff === 1 ? 'Yarın' : dayLabelFmt.format(found.date)
  return `${dayLabel} ${open.length} boş saat · İlk uygun ${open[0].time}`
}
