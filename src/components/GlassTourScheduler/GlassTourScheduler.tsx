// Yerinde görme randevusu akışı: gün şeridi → saat ızgarası → tur tipi →
// "Randevu iste" → iç state onay ekranı. GlassSegmentedControl'ün gerçek API'siyle
// (options/value/onChange/label) doğrudan kompoze edilir; gün/saat seçimi kendi
// radiogroup deseniyle (roving tabindex) çözülür — ortak yardımcı ikisi arasında paylaşılır.
import { useId, useMemo, useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassButton } from '../GlassButton'
import { GlassSegmentedControl } from '../GlassSegmentedControl'
import styles from './GlassTourScheduler.module.css'

export interface GlassTourSlot {
  /** Ör. "14:00" */
  time: string
  available: boolean
}

export interface GlassTourDay {
  /** ISO tarih, ör. "2026-07-18" */
  date: string
  /** Ör. "Cum 18 Tem" — chip üstünde gösterilen kısa etiket */
  label: string
  slots: GlassTourSlot[]
}

export interface GlassTourRequest {
  date: string
  time: string
  type: string
}

export interface GlassTourSchedulerProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  days: GlassTourDay[]
  /** Tur tipi seçenekleri — GlassSegmentedControl'e `{value,label}` olarak eşlenir */
  tourTypes?: string[]
  /** "Randevu iste" tıklanınca çağrılır; sonrasında iç onay ekranına geçilir */
  onRequest?: (request: GlassTourRequest) => void
  /** grid: çok kolonlu saat ızgarası (geniş panel) · compact: tek kolon, dar panel */
  variant?: 'grid' | 'compact'
  tone?: 'light' | 'dark' | 'auto'
  material?: 'glass' | 'flat'
}

const DEFAULT_TOUR_TYPES = ['Yerinde', 'Canlı video', '3D self-tur']

/** Roving tabindex ortak yardımcısı: gün şeridi ve saat ızgarası aynı gezinme kuralını paylaşır. */
function nextRovingKey<T>(
  items: T[],
  isDisabled: (item: T) => boolean,
  keyOf: (item: T) => string,
  activeKey: string | undefined,
  key: string,
): string | null {
  const enabled = items.filter((item) => !isDisabled(item))
  if (enabled.length === 0) return null
  const currentIndex = enabled.findIndex((item) => keyOf(item) === activeKey)
  let nextIndex = -1
  if (key === 'ArrowRight' || key === 'ArrowDown') nextIndex = (currentIndex + 1 + enabled.length) % enabled.length
  else if (key === 'ArrowLeft' || key === 'ArrowUp') nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
  else if (key === 'Home') nextIndex = 0
  else if (key === 'End') nextIndex = enabled.length - 1
  else return null
  return keyOf(enabled[nextIndex])
}

const noop = () => {}

export function GlassTourScheduler({
  days,
  tourTypes = DEFAULT_TOUR_TYPES,
  onRequest,
  variant = 'grid',
  tone = 'auto',
  material,
  className,
  ...rest
}: GlassTourSchedulerProps) {
  const baseId = useId()
  const [selectedDate, setSelectedDate] = useState<string | undefined>(days[0]?.date)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [selectedType, setSelectedType] = useState<string>(tourTypes[0] ?? '')
  const [submitted, setSubmitted] = useState<GlassTourRequest | null>(null)

  const currentDay = days.find((d) => d.date === selectedDate)
  const availableSlots = currentDay?.slots.filter((s) => s.available) ?? []
  const canSubmit = Boolean(selectedDate && selectedTime)

  const typeOptions = useMemo(() => tourTypes.map((t) => ({ value: t, label: t })), [tourTypes])

  const selectDay = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
  }

  const onDaysKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const nextKey = nextRovingKey(days, () => false, (d) => d.date, selectedDate, e.key)
    if (nextKey === null) return
    e.preventDefault()
    selectDay(nextKey)
    document.getElementById(`${baseId}-day-${nextKey}`)?.focus()
  }

  // Klavye referansı: bir saat seçiliyse o, değilse ilk uygun saat (fallback roving tabindex)
  const activeTimeRef = selectedTime ?? availableSlots[0]?.time

  const onSlotsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!currentDay) return
    const nextKey = nextRovingKey(currentDay.slots, (s) => !s.available, (s) => s.time, activeTimeRef, e.key)
    if (nextKey === null) return
    e.preventDefault()
    setSelectedTime(nextKey)
    document.getElementById(`${baseId}-slot-${nextKey}`)?.focus()
  }

  const handleRequest = () => {
    if (!selectedDate || !selectedTime) return
    const request: GlassTourRequest = { date: selectedDate, time: selectedTime, type: selectedType }
    onRequest?.(request)
    setSubmitted(request)
  }

  const rootClasses = [styles.root, variant === 'compact' ? styles.compact : '', className].filter(Boolean).join(' ')

  if (submitted) {
    const day = days.find((d) => d.date === submitted.date)
    return (
      <GlassSurface
        as="section"
        shape={20}
        tone={tone}
        material={material}
        thickness={0.4}
        className={rootClasses}
        data-variant={variant}
        {...rest}
      >
        <div className={styles.confirm} role="status" aria-live="polite">
          <span className={styles.checkIcon} aria-hidden>
            ✓
          </span>
          <p className={styles.confirmTitle}>Randevunuz alındı</p>
          <p className={styles.confirmSummary}>
            {day?.label ?? submitted.date} · {submitted.time} · {submitted.type}
          </p>
          <div className={styles.confirmActions}>
            <GlassButton tone={tone} onClick={noop}>
              Takvime ekle
            </GlassButton>
            <button type="button" className={styles.resetLink} onClick={() => setSubmitted(null)}>
              Yeni randevu planla
            </button>
          </div>
        </div>
      </GlassSurface>
    )
  }

  return (
    <GlassSurface
      as="section"
      shape={20}
      tone={tone}
      material={material}
      thickness={0.4}
      className={rootClasses}
      data-variant={variant}
      {...rest}
    >
      <div className={styles.section}>
        <span id={`${baseId}-days-title`} className={styles.sectionTitle}>
          Gün seç
        </span>
        <div
          role="radiogroup"
          aria-labelledby={`${baseId}-days-title`}
          className={styles.daysStrip}
          onKeyDown={onDaysKeyDown}
        >
          {days.map((day) => {
            const selected = day.date === selectedDate
            const availableCount = day.slots.filter((s) => s.available).length
            return (
              <button
                key={day.date}
                type="button"
                role="radio"
                id={`${baseId}-day-${day.date}`}
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                className={[styles.dayChip, selected ? styles.dayChipActive : ''].filter(Boolean).join(' ')}
                onClick={() => selectDay(day.date)}
              >
                <span className={styles.dayChipLabel}>{day.label}</span>
                <span className={styles.dayChipMeta}>{availableCount > 0 ? `${availableCount} saat uygun` : 'Dolu'}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.section}>
        <span id={`${baseId}-slots-title`} className={styles.sectionTitle}>
          Saat seç
        </span>
        {currentDay && currentDay.slots.length > 0 ? (
          <div
            role="radiogroup"
            aria-labelledby={`${baseId}-slots-title`}
            className={[styles.slotGrid, variant === 'compact' ? styles.slotGridCompact : ''].filter(Boolean).join(' ')}
            onKeyDown={onSlotsKeyDown}
          >
            {currentDay.slots.map((slot) => {
              const selected = slot.time === selectedTime
              return (
                <button
                  key={slot.time}
                  type="button"
                  role="radio"
                  id={`${baseId}-slot-${slot.time}`}
                  aria-checked={selected}
                  disabled={!slot.available}
                  tabIndex={slot.time === activeTimeRef ? 0 : -1}
                  className={[styles.slot, selected ? styles.slotActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
        ) : (
          <p className={styles.empty}>Bu gün için uygun saat bulunmuyor.</p>
        )}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Tur tipi</span>
        <GlassSegmentedControl
          label="Tur tipi"
          options={typeOptions}
          value={selectedType}
          onChange={setSelectedType}
          tone={tone}
        />
      </div>

      <div className={styles.footer}>
        <GlassButton prominent tone={tone} disabled={!canSubmit} onClick={handleRequest}>
          Randevu iste
        </GlassButton>
      </div>
    </GlassSurface>
  )
}
