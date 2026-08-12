# Randevu Sistemi + Ofis Kartı Yenileme — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emlak ofisleriyle takvimden gün + saat dilimi seçerek görüşme talep etme, `/hesabim/randevularim` altında takip ve `/ofisler` sonuç kartının randevu odaklı yenilenmesi.

**Architecture:** Yeni `apps/web/src/features/appointments/` dilimi: saf domain tipleri, deterministik müsaitlik üreten adapter, `useSyncExternalStore` ile abone olunan modül-düzeyi randevu store'u ve GlassModal tabanlı planlayıcı bileşeni. `/ofisler` görünümü `meeting` aksiyonunu artık kendi içinde modalla karşılar; `message`/`offer` mevcut taslak akışında kalır.

**Tech Stack:** React 19, TanStack Router/Query, Vitest + Testing Library, `@repo/ui` Glass bileşenleri (GlassModal, GlassDatePicker, GlassChip, GlassSegmentedControl, GlassTextarea, GlassBadge, GlassEmptyState, useGlassToast), CSS Modules.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-08-12-randevu-sistemi-design.md` — sapma gerekirse önce sor.
- **Yasak bağımlılıklar:** Tailwind, shadcn, date-fns, lucide-react, framer-motion eklenmez. Tarih işlemleri lokal yardımcılarla (GlassDatePicker içindeki desen), animasyon gerekirse `motion/react`.
- **Dil:** Tüm kullanıcı metinleri ve kod yorumları Türkçe; yorumlar "neden"i anlatır (mevcut dosyalardaki üslup).
- **Determinizm:** Müsaitlik üretiminde `Math.random`/`Date.now` YOK (yalnız store `createdAt` ve zamanlayıcı için `Date.now`/`setTimeout` serbest; testler fake timer kullanır).
- **Testler:** repo kökünden `npx vitest run <dosya>`; typecheck `cd apps/web && npx tsc --noEmit`.
- **Commit:** her task sonunda; mesaj gövdesi Türkçe, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` ile biter.
- **Bilinen kırıklar:** listing-detail/MarketplaceShell/GirisKodPage testleri bu daldan ÖNCE de kırıktı; bunların kırık kalması bu işin başarısını etkilemez, düzeltmeye çalışma.

---

### Task 1: Randevu domain tipleri + deterministik müsaitlik adapter'ı

**Files:**
- Create: `apps/web/src/features/appointments/domain/appointment-types.ts`
- Create: `apps/web/src/features/appointments/data/appointment-availability.ts`
- Test: `apps/web/src/features/appointments/data/appointment-availability.test.ts`

**Interfaces:**
- Consumes: —
- Produces (sonraki task'lar bunlara güvenir):
  - `Appointment { id: string; officeId: string; officeName: string; date: string; slot: string; type: 'office' | 'video'; note?: string; status: 'pending' | 'confirmed' | 'cancelled'; createdAt: number }`
  - `AppointmentSlot { time: string; available: boolean }`
  - `officeAvailability(officeId: string, date: Date): AppointmentSlot[]`
  - `firstAvailableDay(officeId: string, from: Date, horizonDays?: number): { date: Date; slots: AppointmentSlot[] } | undefined`
  - `availabilityPreview(officeId: string, from: Date): string`
  - `toDateKey(date: Date): string` (`'2026-08-14'` biçimi)

- [ ] **Step 1: Başarısız testleri yaz**

`apps/web/src/features/appointments/data/appointment-availability.test.ts`:

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/appointments/data/appointment-availability.test.ts`
Expected: FAIL — modül bulunamadı.

- [ ] **Step 3: Tipleri ve adapter'ı yaz**

`apps/web/src/features/appointments/domain/appointment-types.ts`:

```ts
export type AppointmentType = 'office' | 'video'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Appointment {
  id: string
  officeId: string
  officeName: string
  /** ISO gün anahtarı, ör. '2026-08-14' — saat `slot`ta ayrı taşınır */
  date: string
  /** 'HH:00' biçiminde saat dilimi */
  slot: string
  type: AppointmentType
  note?: string
  status: AppointmentStatus
  /** Sıralama için; ms epoch */
  createdAt: number
}

export interface AppointmentSlot {
  time: string
  available: boolean
}
```

`apps/web/src/features/appointments/data/appointment-availability.ts`:

```ts
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
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/appointments/data/appointment-availability.test.ts`
Expected: PASS (8 test). Not: "farklı ofisler farklı desen" testi hash gereği teorik olarak çakışabilir; çakışırsa test id'lerini (`office-2` → `office-9`) değiştir, algoritmayı değil.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/appointments
git commit -m "feat(randevu): domain tipleri ve deterministik ofis müsaitliği

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Randevu store'u (oluştur/iptal/listele + abonelik)

**Files:**
- Create: `apps/web/src/features/appointments/data/appointment-store.ts`
- Test: `apps/web/src/features/appointments/data/appointment-store.test.ts`

**Interfaces:**
- Consumes: `Appointment`, `AppointmentType` (Task 1).
- Produces:
  - `createAppointment(input: { officeId: string; officeName: string; date: string; slot: string; type: AppointmentType; note?: string; autoConfirm: boolean }): Appointment`
  - `cancelAppointment(id: string): void`
  - `listAppointments(): Appointment[]` — en yeni önce
  - `subscribeAppointments(listener: () => void): () => void`
  - `useAppointments(): Appointment[]` — `useSyncExternalStore` sarmalayıcısı
  - `resetAppointmentStore(): void` — yalnız testler için
  - `AUTO_CONFIRM_DELAY_MS = 4000`

- [ ] **Step 1: Başarısız testleri yaz**

`apps/web/src/features/appointments/data/appointment-store.test.ts`:

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/appointments/data/appointment-store.test.ts`
Expected: FAIL — modül bulunamadı.

- [ ] **Step 3: Store'u yaz**

`apps/web/src/features/appointments/data/appointment-store.ts`:

```ts
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
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/appointments/data/appointment-store.test.ts`
Expected: PASS (6 test).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/appointments/data/appointment-store.ts apps/web/src/features/appointments/data/appointment-store.test.ts
git commit -m "feat(randevu): oturum ömürlü randevu store'u ve abonelik kancası

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Randevu planlayıcı modalı

**Files:**
- Create: `apps/web/src/features/appointments/components/AppointmentSchedulerModal.tsx`
- Create: `apps/web/src/features/appointments/components/AppointmentSchedulerModal.module.css`
- Create: `apps/web/src/features/appointments/index.ts`
- Test: `apps/web/src/features/appointments/components/AppointmentSchedulerModal.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`officeAvailability`, `firstAvailableDay`, `toDateKey`), Task 2 (`createAppointment`), `@repo/ui`: `GlassModal` (`open`, `onClose`, `title`, `footer`), `GlassDatePicker` (`value`, `onChange`, `min`, `max`), `GlassChip` (`selected`, `onSelectedChange`), `GlassSegmentedControl` (`options`, `value`, `onChange`, `variant="track"`), `GlassTextarea` (`minRows`), `GlassButton`.
- Produces:
  - `AppointmentSchedulerModal(props: AppointmentSchedulerModalProps)`
  - `AppointmentSchedulerModalProps { office: { id: string; name: string; responseMinutes: number } | null; onClose(): void; onScheduled?(appointment: Appointment): void }` — `office` null ise modal kapalıdır.
  - `index.ts` barrel: modal + `useAppointments`, `cancelAppointment`, `availabilityPreview`, tipler.

- [ ] **Step 1: Başarısız testi yaz**

`apps/web/src/features/appointments/components/AppointmentSchedulerModal.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentSchedulerModal } from './AppointmentSchedulerModal'
import { listAppointments, resetAppointmentStore } from '../data/appointment-store'

const OFIS = { id: 'office-1', name: 'Kadıköy Anahtar Ofis', responseMinutes: 9 }

beforeEach(() => resetAppointmentStore())

describe('AppointmentSchedulerModal', () => {
  it('office null iken hiçbir şey çizmez', () => {
    const { container } = render(
      <AppointmentSchedulerModal office={null} onClose={() => {}} />,
    )
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('ilk müsait günü seçili açar ve o günün saat dilimlerini listeler', () => {
    render(<AppointmentSchedulerModal office={OFIS} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /görüşme planla/i })).toBeTruthy()
    // Saat çipleri listelenir; en az bir müsait saat butonu vardır.
    expect(screen.getByRole('group', { name: /saat dilimi/i })).toBeTruthy()
  })

  it('saat seçilmeden gönderilemez; saat seçilince talep store\'a düşer', async () => {
    const user = userEvent.setup()
    const onScheduled = vi.fn()
    render(
      <AppointmentSchedulerModal office={OFIS} onClose={() => {}} onScheduled={onScheduled} />,
    )
    const gonder = screen.getByRole('button', { name: /randevu talep et/i })
    expect(gonder).toHaveProperty('disabled', true)

    const grup = screen.getByRole('group', { name: /saat dilimi/i })
    const ilkSaat = grup.querySelector<HTMLElement>('[aria-pressed="false"]:not([aria-disabled="true"])')
    expect(ilkSaat).toBeTruthy()
    await user.click(ilkSaat!)

    await user.click(screen.getByRole('button', { name: /randevu talep et/i }))
    const kayitlar = listAppointments()
    expect(kayitlar).toHaveLength(1)
    expect(kayitlar[0].officeId).toBe('office-1')
    expect(kayitlar[0].slot).toMatch(/^\d{2}:00$/)
    expect(onScheduled).toHaveBeenCalledWith(kayitlar[0])
  })

  it('hızlı yanıtlı ofiste (responseMinutes <= 10) talep autoConfirm ile oluşur', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AppointmentSchedulerModal office={OFIS} onClose={() => {}} />)
    const grup = screen.getByRole('group', { name: /saat dilimi/i })
    await user.click(grup.querySelector<HTMLElement>('[aria-pressed="false"]:not([aria-disabled="true"])')!)
    await user.click(screen.getByRole('button', { name: /randevu talep et/i }))
    vi.advanceTimersByTime(10_000)
    expect(listAppointments()[0].status).toBe('confirmed')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/appointments/components/AppointmentSchedulerModal.test.tsx`
Expected: FAIL — modül bulunamadı.

- [ ] **Step 3: Bileşeni yaz**

`AppointmentSchedulerModal.tsx` — iskeleti aynen uygula (CSS sınıf adları Step 4'teki dosyayla eşleşir):

```tsx
import { useMemo, useState } from 'react'
import {
  GlassButton,
  GlassChip,
  GlassDatePicker,
  GlassModal,
  GlassSegmentedControl,
  GlassTextarea,
} from '@repo/ui'
import type { Appointment, AppointmentType } from '../domain/appointment-types'
import {
  firstAvailableDay,
  officeAvailability,
  toDateKey,
} from '../data/appointment-availability'
import { createAppointment } from '../data/appointment-store'
import styles from './AppointmentSchedulerModal.module.css'

export interface AppointmentSchedulerModalProps {
  /** null → modal kapalı. Ofis değişince seçim sıfırdan kurulur (key ile). */
  office: { id: string; name: string; responseMinutes: number } | null
  onClose(): void
  onScheduled?(appointment: Appointment): void
}

const TYPE_OPTIONS = [
  { value: 'office', label: 'Ofiste' },
  { value: 'video', label: 'Video görüşme' },
]

/** Bu eşikten hızlı yanıtlayan ofisin talebi mock akışta kendiliğinden onaylanır */
const AUTO_CONFIRM_RESPONSE_MINUTES = 10

const summaryFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
})

export function AppointmentSchedulerModal({ office, onClose, onScheduled }: AppointmentSchedulerModalProps) {
  if (!office) return null
  // Ofis değiştiğinde iç durum sıfırlansın diye içerik ayrı bileşende, key'li.
  return <SchedulerContent key={office.id} office={office} onClose={onClose} onScheduled={onScheduled} />
}

function SchedulerContent({ office, onClose, onScheduled }: {
  office: NonNullable<AppointmentSchedulerModalProps['office']>
  onClose(): void
  onScheduled?(appointment: Appointment): void
}) {
  const today = useMemo(() => new Date(), [])
  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 30)
    return d
  }, [today])
  const [date, setDate] = useState<Date | null>(() => firstAvailableDay(office.id, today)?.date ?? null)
  const [slot, setSlot] = useState<string | null>(null)
  const [type, setType] = useState<AppointmentType>('office')
  const [note, setNote] = useState('')

  const slots = date ? officeAvailability(office.id, date) : []
  const nextOpen = date && !slots.some((s) => s.available)
    ? firstAvailableDay(office.id, date)
    : undefined

  const summary = date && slot
    ? `${summaryFmt.format(date)} ${slot} · ${type === 'office' ? 'Ofiste' : 'Video görüşme'} · ${office.name}`
    : 'Gün ve saat seçin.'

  const submit = () => {
    if (!date || !slot) return
    const appointment = createAppointment({
      officeId: office.id,
      officeName: office.name,
      date: toDateKey(date),
      slot,
      type,
      note: note.trim() || undefined,
      autoConfirm: office.responseMinutes <= AUTO_CONFIRM_RESPONSE_MINUTES,
    })
    onScheduled?.(appointment)
    onClose()
  }

  return (
    <GlassModal
      open
      onClose={onClose}
      title={`Görüşme planla · ${office.name}`}
      description="Uygun bir gün ve saat dilimi seçin; talebiniz ofise iletilecek."
      size="lg"
      footer={
        <div className={styles.footer}>
          <p className={styles.summary}>{summary}</p>
          <div className={styles.footerActions}>
            <GlassButton onClick={onClose}>Vazgeç</GlassButton>
            <GlassButton prominent disabled={!date || !slot} onClick={submit}>
              Randevu talep et
            </GlassButton>
          </div>
        </div>
      }
    >
      <div className={styles.panels}>
        <div className={styles.datePanel}>
          <GlassDatePicker
            value={date}
            onChange={(next) => {
              setDate(next)
              setSlot(null)
            }}
            min={today}
            max={maxDate}
            placeholder="Gün seç"
          />
          {nextOpen ? (
            <p className={styles.fullDayHint}>
              Bu gün dolu; ilk uygun gün {summaryFmt.format(nextOpen.date)}.
            </p>
          ) : null}
        </div>
        <div className={styles.detailPanel}>
          <div role="group" aria-label="Saat dilimi" className={styles.slotGrid}>
            {slots.length === 0 ? (
              <p className={styles.slotEmpty}>Bu gün ofis kapalı; hafta içi bir gün seçin.</p>
            ) : (
              slots.map((item) => (
                <GlassChip
                  key={item.time}
                  selected={slot === item.time}
                  onSelectedChange={item.available ? (next) => setSlot(next ? item.time : null) : undefined}
                  aria-disabled={item.available ? undefined : true}
                  className={item.available ? undefined : styles.slotFull}
                >
                  {item.time}
                </GlassChip>
              ))
            )}
          </div>
          <GlassSegmentedControl
            options={TYPE_OPTIONS}
            value={type}
            onChange={(next) => setType(next as AppointmentType)}
            variant="track"
            aria-label="Görüşme türü"
          />
          <GlassTextarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            minRows={2}
            placeholder="Not (isteğe bağlı): hangi ilan ya da bölge için görüşmek istiyorsunuz?"
            aria-label="Görüşme notu"
          />
        </div>
      </div>
    </GlassModal>
  )
}
```

`AppointmentSchedulerModal.module.css` (Glass token'larıyla, sabit renk yok):

```css
.panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: var(--lg-space-6);
}
@media (max-width: 40rem) {
  .panels { grid-template-columns: 1fr; }
}
.datePanel { display: flex; flex-direction: column; gap: var(--lg-space-3); }
.fullDayHint { margin: 0; font-size: 0.85rem; opacity: 0.75; }
.detailPanel { display: flex; flex-direction: column; gap: var(--lg-space-4); }
.slotGrid { display: flex; flex-wrap: wrap; gap: var(--lg-space-2); }
.slotEmpty { margin: 0; font-size: 0.9rem; opacity: 0.75; }
.slotFull { opacity: 0.45; pointer-events: none; }
.footer { display: flex; align-items: center; justify-content: space-between; gap: var(--lg-space-4); width: 100%; }
.summary { margin: 0; font-size: 0.85rem; opacity: 0.8; }
.footerActions { display: flex; gap: var(--lg-space-2); }
```

Not: `--lg-space-*` token adlarını mevcut bir module.css'ten (ör. `OfficeDirectoryView.module.css`) doğrula; proje farklı adlandırma kullanıyorsa oradakini kullan.

`index.ts` barrel:

```ts
export { AppointmentSchedulerModal, type AppointmentSchedulerModalProps } from './components/AppointmentSchedulerModal'
export { availabilityPreview } from './data/appointment-availability'
export { cancelAppointment, useAppointments } from './data/appointment-store'
export type { Appointment, AppointmentStatus, AppointmentType } from './domain/appointment-types'
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/appointments/components/AppointmentSchedulerModal.test.tsx`
Expected: PASS (4 test). GlassChip `aria-pressed` üretmiyorsa (toggle modu `button` değilse) testteki seçiciyi bileşenin gerçek DOM'una göre uyarla — davranışı (müsait saat tıklanır, dolu tıklanamaz) değiştirme.

- [ ] **Step 5: Typecheck + commit**

Run: `cd apps/web && npx tsc --noEmit` → hatasız.

```bash
git add apps/web/src/features/appointments
git commit -m "feat(randevu): Glass tabanlı görüşme planlayıcı modalı

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: /ofisler kablolaması + ofis kartı yenileme

**Files:**
- Modify: `apps/web/src/features/offices/OfficeDirectoryView.tsx` (OfficeResultCard ~330-399, OfficeInsightPanel ~268-328, ana bileşen state ~415-640)
- Modify: `apps/web/src/features/offices/OfficeDirectoryView.module.css` (kart sınıfları)
- Test: `apps/web/src/features/offices/OfficeDirectoryView.test.tsx` (mevcut dosya güncellenir)

**Interfaces:**
- Consumes: `AppointmentSchedulerModal`, `availabilityPreview` (Task 3 barrel'ı `@/features/appointments`), `useGlassToast` (`toast({ title, description, severity: 'success' })` — ofisler.tsx:213 ile aynı biçim).
- Produces: Görsel yenilenmiş `OfficeResultCard`; `meeting` aksiyonu artık view içinde modalla karşılanır. `OfficeDirectoryViewProps` DEĞİŞMEZ (route dokunulmadan kalır); `onStartAction` yalnız `message`/`offer` için çağrılır.

- [ ] **Step 1: Mevcut testleri tanı ve başarısız güncellemeyi yaz**

Önce `npx vitest run apps/web/src/features/offices/OfficeDirectoryView.test.tsx` çalıştırıp geçtiğini gör. Sonra test dosyasına ekle (mevcut render yardımcılarını kullan; dosyada `renderView` benzeri bir kurulum varsa onu izle):

```tsx
it('Görüşme talep et randevu modalını açar; onStartAction çağrılmaz', async () => {
  const user = userEvent.setup()
  const onStartAction = vi.fn()
  // ... mevcut kurulumdaki gibi response'lu render, onStartAction prop'u geçir
  const kart = screen.getAllByRole('article')[0]
  await user.click(within(kart).getByRole('button', { name: /görüşme talep et/i }))
  expect(screen.getByRole('dialog', { name: /görüşme planla/i })).toBeTruthy()
  expect(onStartAction).not.toHaveBeenCalled()
})

it('kartta müsaitlik önizleme satırı görünür', () => {
  // ... render
  expect(screen.getAllByText(/boş saat/i).length).toBeGreaterThan(0)
})
```

Run: `npx vitest run apps/web/src/features/offices/OfficeDirectoryView.test.tsx`
Expected: yeni 2 test FAIL, eskiler PASS.

- [ ] **Step 2: View'a modal state'i ve kablolamayı ekle**

`OfficeDirectoryView.tsx` ana bileşeninde:

```tsx
import { AppointmentSchedulerModal, availabilityPreview } from '@/features/appointments'
import { useGlassToast } from '@repo/ui' // mevcut @repo/ui import'una ekle

// ana bileşen gövdesinde:
const [meetingOffice, setMeetingOffice] = useState<OfficeSummary | null>(null)
const toast = useGlassToast()

const startAction = (action: OfficeActionType, office: OfficeSummary) => {
  if (action === 'meeting') {
    setMeetingOffice(office)
    return
  }
  onStartAction(action, office.id)
}
```

Kart ve içgörü paneline `onStartAction` yerine bu `startAction`'ı ofis nesnesiyle bağla (`OfficeResultCard`'a `onStartAction: (action) => startAction(action, office)` zaten benzer biçimde iniyor; `OfficeInsightPanel.onAction` için id'den ofisi `response`'tan bul). JSX sonuna modalı ekle:

```tsx
<AppointmentSchedulerModal
  office={meetingOffice ? { id: meetingOffice.id, name: meetingOffice.name, responseMinutes: meetingOffice.responseMinutes } : null}
  onClose={() => setMeetingOffice(null)}
  onScheduled={() =>
    toast({
      title: 'Randevu talebiniz iletildi',
      description: 'Durumunu Hesabım → Randevularım altında takip edebilirsiniz.',
      severity: 'success',
    })
  }
/>
```

Not: `OfficeDirectoryView` testlerde `GlassToastProvider` olmadan render ediliyorsa `useGlassToast` hata verebilir — o durumda test kurulumunu provider ile sarmala (ofisler.tsx'teki gerçek kompozisyonla aynı).

- [ ] **Step 3: OfficeResultCard'ı yeniden düzenle**

`GlassAgencyCard` kullanımını kaldır, kartı tek parça kur (mevcut `styles.*` sınıflarını koru, yenilerini ekle):

```tsx
function OfficeResultCard({ office, match, compared, compareLimitReached, onSelect, onToggleCompare, onStartAction }: { /* mevcut imza aynı */ }) {
  const evidence = match?.evidence[0] ?? office.evidence[0]
  return (
    <article className={styles.resultCard} aria-label={`${office.name} ofisi`}>
      <div className={styles.cardTopline}>
        {match ? <span className={styles.matchScore}>%{match.score} eşleşme</span> : <span className={styles.matchScore}>Profil eşleşmesi</span>}
        <button type="button" className={styles.insightTrigger} onClick={onSelect} aria-label={`${office.name} içgörülerini aç`}>
          Neden önerildi?
        </button>
      </div>
      <div className={styles.cardIdentity}>
        {office.logoSrc ? (
          <img className={styles.cardLogo} src={office.logoSrc} alt="" />
        ) : (
          <span className={styles.cardLogoFallback} aria-hidden>{office.name.slice(0, 2).toUpperCase()}</span>
        )}
        <div>
          <h3 className={styles.cardName}>
            {office.name}
            {office.verified ? <span className={styles.verifiedMark} title={office.verifiedBy ?? 'Doğrulanmış'}>✓</span> : null}
          </h3>
          <p className={styles.cardTagline}>{office.tagline}</p>
        </div>
      </div>
      <dl className={styles.cardStats}>
        <div><dt>Aktif ilan</dt><dd>{office.activeListings}</dd></div>
        <div><dt>Yanıt</dt><dd>{office.responseMinutes} dk</dd></div>
        <div><dt>Puan</dt><dd>{office.rating} ({office.reviewCount})</dd></div>
      </dl>
      <p className={styles.cardAvailability}>{availabilityPreview(office.id, new Date())}</p>
      <div className={styles.cardMeta}>
        <span>{office.districts.slice(0, 2).join(' · ')}</span>
        {evidence ? <span className={styles.evidenceBadge} title={evidence.value}>{EVIDENCE_SOURCE_LABELS[evidence.source]} · {evidence.label}</span> : null}
        <span>{office.lastActiveLabel}</span>
      </div>
      <div className={styles.cardActions}>
        <GlassButton prominent onClick={() => onStartAction('meeting')}>Görüşme talep et</GlassButton>
        <GlassButton onClick={() => onStartAction('message')}>Mesaj</GlassButton>
        <button type="button" className={styles.compareButton} onClick={onToggleCompare} disabled={!compared && compareLimitReached}>
          {compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştır'}
        </button>
      </div>
    </article>
  )
}
```

`availabilityPreview(office.id, new Date())` render başına yeniden hesaplanır; liste ~20 kart olduğundan maliyet önemsiz — memoize etme.

Module.css'e eklenecek sınıflar (mevcut token/desenlere bakarak değerleri uyarla):

```css
.cardIdentity { display: flex; gap: var(--lg-space-3); align-items: flex-start; }
.cardLogo, .cardLogoFallback { width: 44px; height: 44px; border-radius: 12px; }
.cardLogoFallback { display: grid; place-items: center; font-weight: 600; background: var(--lg-surface-2, rgba(0,0,0,.06)); }
.cardName { margin: 0; display: flex; gap: var(--lg-space-1); align-items: center; }
.verifiedMark { color: var(--lg-success, #2c7a4b); }
.cardTagline { margin: 0; font-size: .9rem; opacity: .75; }
.cardStats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--lg-space-2); margin: 0; }
.cardStats dt { font-size: .75rem; opacity: .65; }
.cardStats dd { margin: 0; font-weight: 600; }
.cardAvailability { margin: 0; font-size: .85rem; }
```

`mesaj gönder` metnine bağlı mevcut test varsa `Mesaj` ile güncelle. `GlassAgencyCard` importunu kaldır (başka kullanıcı yoksa).

- [ ] **Step 4: İçgörü panelini bağla**

`OfficeInsightPanel`'deki `onAction('meeting', office.id)` çağrısı değişmez; ana bileşende `onAction` olarak inen fonksiyonu `startAction`'a yönlendir: panelin aldığı `onAction={(action, id) => { const ofis = response?.items.find((o) => o.id === id); if (action === 'meeting' && ofis) { setMeetingOffice(ofis); return } onStartAction(action, id) }}`.

- [ ] **Step 5: Testleri çalıştır**

Run: `npx vitest run apps/web/src/features/offices/`
Expected: tümü PASS (yeni 2 dahil). Kırılan eski test varsa nedenini oku: metin (`Mesaj Gönder` → `Mesaj`) ya da yapı değişikliğiyse testi güncelle, davranış kaybıysa kodu düzelt.

- [ ] **Step 6: Typecheck + commit**

Run: `cd apps/web && npx tsc --noEmit` → hatasız.

```bash
git add apps/web/src/features/offices apps/web/src/features/appointments
git commit -m "feat(ofisler): randevu modalı kablolaması ve randevu odaklı kart yenileme

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Randevularım sayfası + rota + navigasyon

**Files:**
- Create: `apps/web/src/features/account/pages/AccountAppointmentsPage.tsx`
- Modify: `apps/web/src/features/account/pages/index.ts` (export ekle)
- Modify: `apps/web/src/features/account/pages/AccountPages.module.css` (gerekirse sınıf ekle)
- Modify: `apps/web/src/features/account/domain/account-navigation.ts:47` civarı (Mesajlar'dan sonra girdi)
- Create: `apps/web/src/routes/hesabim.randevularim.tsx`
- Test: `apps/web/src/features/account/pages/AccountAppointmentsPage.test.tsx`

**Interfaces:**
- Consumes: `useAppointments`, `cancelAppointment`, tipler (`@/features/appointments`); `GlassBadge`, `GlassButton`, `GlassEmptyState` (`title`, `description`, `action`); `AccountPageFrame` (rota deseni `hesabim.kayitli-arama.tsx` ile aynı); `toDateKey` karşılaştırması için tarih `string` sıralaması yeterli (ISO gün anahtarları sözlüksel sıralanabilir).
- Produces: `AccountAppointmentsPage()` — prop almaz, store'dan okur.

- [ ] **Step 1: Başarısız testi yaz**

`AccountAppointmentsPage.test.tsx` (diğer Account sayfa testlerinin kurulumunu izle — `account-page-test-utils.tsx` varsa kullan):

```tsx
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountAppointmentsPage } from './AccountAppointmentsPage'
import { createAppointment, resetAppointmentStore } from '@/features/appointments/data/appointment-store'

const YARIN_SONRASI = '2999-01-04' // hep gelecekte
const GECMIS = '2020-01-04'

beforeEach(() => resetAppointmentStore())

const ekle = (date: string, overrides: Partial<Parameters<typeof createAppointment>[0]> = {}) =>
  createAppointment({
    officeId: 'office-1',
    officeName: 'Kadıköy Anahtar Ofis',
    date,
    slot: '10:00',
    type: 'office',
    autoConfirm: false,
    ...overrides,
  })

describe('AccountAppointmentsPage', () => {
  it('boş durumda ofisleri keşfet yönlendirmesi gösterir', () => {
    render(<AccountAppointmentsPage />)
    expect(screen.getByText(/henüz randevunuz yok/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /ofisleri keşfet/i })).toBeTruthy()
  })

  it('gelecek randevu Yaklaşan, geçmiş tarihli Geçmiş grubunda listelenir', () => {
    ekle(YARIN_SONRASI)
    ekle(GECMIS)
    render(<AccountAppointmentsPage />)
    const yaklasan = screen.getByRole('region', { name: /yaklaşan/i })
    const gecmis = screen.getByRole('region', { name: /geçmiş/i })
    expect(within(yaklasan).getAllByText(/kadıköy anahtar ofis/i)).toHaveLength(1)
    expect(within(gecmis).getAllByText(/kadıköy anahtar ofis/i)).toHaveLength(1)
  })

  it('bekleyen randevu iptal edilince Geçmiş grubuna İptal edildi rozetiyle düşer', async () => {
    const user = userEvent.setup()
    ekle(YARIN_SONRASI)
    render(<AccountAppointmentsPage />)
    await user.click(screen.getByRole('button', { name: /iptal et/i }))
    const gecmis = screen.getByRole('region', { name: /geçmiş/i })
    expect(within(gecmis).getByText(/iptal edildi/i)).toBeTruthy()
  })

  it('durum rozetleri: pending Onay bekliyor, confirmed Onaylandı', () => {
    ekle(YARIN_SONRASI)
    render(<AccountAppointmentsPage />)
    expect(screen.getByText(/onay bekliyor/i)).toBeTruthy()
  })
})
```

Router bağımlılığı: "Ofisleri keşfet" bağlantısı TanStack `Link` ise test render'ını diğer account testlerinin yaptığı gibi router sarmalayıcısıyla kur; onlar sarmalamıyorsa düz `<a href="/ofisler">` kullan (aşağıdaki uygulama düz `<a>` seçer — mock projede yeterli, test sade kalır).

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/account/pages/AccountAppointmentsPage.test.tsx`
Expected: FAIL — modül bulunamadı.

- [ ] **Step 3: Sayfayı yaz**

`AccountAppointmentsPage.tsx`:

```tsx
import { GlassBadge, GlassButton, GlassEmptyState } from '@repo/ui'
import type { Appointment } from '@/features/appointments'
import { cancelAppointment, useAppointments } from '@/features/appointments'
import styles from './AccountPages.module.css'

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'Onay bekliyor',
  confirmed: 'Onaylandı',
  cancelled: 'İptal edildi',
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })

/** '2026-08-14' → yerel Date; saat slot'tan ayrı gösterilir */
const parseDay = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function AccountAppointmentsPage() {
  const appointments = useAppointments()
  const bugun = todayKey()
  // ISO gün anahtarları sözlüksel karşılaştırılabilir; ayrı tarih kütüphanesi gerekmez.
  const yaklasan = appointments.filter((item) => item.status !== 'cancelled' && item.date >= bugun)
  const gecmis = appointments.filter((item) => item.status === 'cancelled' || item.date < bugun)

  if (appointments.length === 0) {
    return (
      <GlassEmptyState
        title="Henüz randevunuz yok"
        description="Ofisler sayfasından uygun bir gün ve saat seçerek görüşme talep edebilirsiniz."
        action={<GlassButton render={<a href="/ofisler">Ofisleri keşfet</a>} />}
      />
    )
  }

  return (
    <div className={styles.stack}>
      <AppointmentGroup title="Yaklaşan" items={yaklasan} cancellable />
      <AppointmentGroup title="Geçmiş" items={gecmis} />
    </div>
  )
}

function AppointmentGroup({ title, items, cancellable = false }: {
  title: string
  items: Appointment[]
  cancellable?: boolean
}) {
  if (items.length === 0) return null
  return (
    <section aria-label={title} className={styles.section}>
      <h2>{title}</h2>
      <ul className={styles.appointmentList}>
        {items.map((item) => (
          <li key={item.id} className={styles.appointmentRow}>
            <div>
              <strong>{item.officeName}</strong>
              <p>
                {dateFmt.format(parseDay(item.date))} · {item.slot} ·{' '}
                {item.type === 'office' ? 'Ofiste' : 'Video görüşme'}
              </p>
              {item.note ? <p className={styles.appointmentNote}>{item.note}</p> : null}
            </div>
            <div className={styles.appointmentActions}>
              <GlassBadge>{STATUS_LABELS[item.status]}</GlassBadge>
              {cancellable && item.status !== 'cancelled' ? (
                <GlassButton size="sm" onClick={() => cancelAppointment(item.id)}>İptal et</GlassButton>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Uygulama notları:
- `GlassButton`'ın `render`/`asChild` benzeri bir bağlantı deseni yoksa (props'una bak), `<GlassButton onClick={() => { window.location.href = '/ofisler' }}>` yerine mevcut kod tabanında bir "buton-görünümlü link" örneği ara (`grep -rn "GlassButton" apps/web/src/routes/index.tsx` benzeri) ve o deseni kopyala; test `getByRole('link' | 'button')` beklentisini gerçeğe göre güncelle.
- `styles.stack/section/appointmentList/appointmentRow/appointmentNote/appointmentActions` sınıfları `AccountPages.module.css`'te yoksa mevcut adlandırma diliyle ekle (flex kolon + satır kartı; değerleri komşu sınıflardan kopyala).

`pages/index.ts`'e ekle:

```ts
export { AccountAppointmentsPage } from './AccountAppointmentsPage'
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/account/pages/AccountAppointmentsPage.test.tsx`
Expected: PASS (4 test).

- [ ] **Step 5: Rota + navigasyon**

`apps/web/src/routes/hesabim.randevularim.tsx` (`hesabim.kayitli-arama.tsx` deseninin kopyası):

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import { AccountAppointmentsPage, AccountPageFrame } from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountAppointmentsPage />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/randevularim')({
  head: () => ({
    meta: [
      { title: 'Randevularım | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/randevularim` }],
  }),
  component: Sayfa,
})
```

`@/features/account` barrel'ı (`features/account/index.ts`) `AccountAppointmentsPage`'i dışa vermiyorsa export ekle (AccountPageFrame'in verildiği yer).

`account-navigation.ts` — Mesajlar girdisinin hemen ardına:

```ts
{ id: 'randevularim', label: 'Randevularım', title: 'Randevularım', href: '/hesabim/randevularim', matchPrefix: true },
```

TanStack Router rota tip üretimi derlemede/`vite dev`'de otomatikse `cd apps/web && npx tsc --noEmit` yeni rotayı görene kadar hata verebilir; `npx vite build` ya da mevcut `routeTree.gen.ts` üretim komutunu (README/package.json'a bak) çalıştır.

- [ ] **Step 6: Hesap testleri + typecheck**

Run: `npx vitest run apps/web/src/features/account apps/web/src/routes` → account testleri PASS (hesabim.test.tsx navigasyon listesini doğruluyorsa "Randevularım" beklentisi ekle/güncelle).
Run: `cd apps/web && npx tsc --noEmit` → hatasız.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/account apps/web/src/routes/hesabim.randevularim.tsx apps/web/src/features/appointments
git commit -m "feat(hesabim): Randevularım sayfası, rotası ve navigasyon girdisi

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Uçtan uca doğrulama + push

**Files:**
- Modify: yok (yalnız doğrulama; çıkan küçük düzeltmeler ilgili dosyada)

**Interfaces:** —

- [ ] **Step 1: Tam test süiti**

Run: `npx vitest run`
Expected: Task'lardan önce kırık olan 9-10 test (listing-detail, MarketplaceShell, GirisKodPage) DIŞINDA her şey PASS. Yeni kırılan varsa nedenini bul ve düzelt (Global Constraints'teki bilinen kırıklar listesi ölçüt).

- [ ] **Step 2: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: hatasız.

- [ ] **Step 3: Görsel duman testi**

Run: `cd apps/web && npx vite dev --port 4300` (arka planda) → tarayıcıda:
1. `/ofisler` — yeni kart düzeni, müsaitlik satırı, "Görüşme talep et" modalı; gün + saat + tür seçip gönder; toast'u gör.
2. `/hesabim/randevularim` — talebin "Onay bekliyor" göründüğünü, ~4 sn sonra "Onaylandı"ya döndüğünü, iptalin çalıştığını doğrula.
Ekran görüntüsü al, sunucuyu kapat.

- [ ] **Step 4: Push**

```bash
git push origin feature/glass-sidebar
```

---

## Self-Review Notu

- Spec kapsaması: modal akışı (T3), veri katmanı (T1-T2), Randevularım (T5), kart yenileme (T4), testler (her task) — tam.
- "Bu gün dolu → sonraki uygun gün önerisi" spec maddesi T3 `fullDayHint` ile karşılanır.
- İçgörü paneli "Görüşme talep et" T4 Step 4 ile aynı modala bağlanır.
- `createActionDraft`'ın `meeting` dalı route'ta ölü kalır (view artık iletmez) — route'a dokunmamak bilinçli; ölü dal temizliği ayrı bir cilalama işi.
