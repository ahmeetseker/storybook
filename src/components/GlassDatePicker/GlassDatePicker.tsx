import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassDatePicker.module.css'

export interface GlassDatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled değer; `null` = seçim yok */
  value?: Date | null
  /** Uncontrolled başlangıç değeri */
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  /** Bu tarihten önceki günler seçilemez */
  min?: Date
  /** Bu tarihten sonraki günler seçilemez */
  max?: Date
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  invalid?: boolean
  disabled?: boolean
  /** Ay/gün adları ve tarih formatı için BCP 47 locale (hafta her zaman Pazartesi başlar) */
  locale?: string
  /**
   * - `popover` (varsayılan): input görünümlü tetikleyici + açılır takvim.
   * - `inline`: tetikleyicisiz, HER ZAMAN AÇIK ve OPAK zeminli takvim.
   *   Overflow'lu kaplarda (modal/panel) absolute popover kırpılır; gömülü
   *   takvim ihtiyacının kalıcı cevabı budur — bkz. rules.md.
   */
  variant?: 'popover' | 'inline'
}

/* ── Tarih yardımcıları (bilinçli olarak lokal — date-fns yok) ─────────────── */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

/** Ay değişiminde günü korur; hedef ay daha kısaysa son güne kıstırır (31 Oca → 28 Şub) */
function addMonthsKeepDay(d: Date, n: number): Date {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay))
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

const isOutOfRange = (d: Date, min?: Date, max?: Date) =>
  (min !== undefined && startOfDay(d) < startOfDay(min)) ||
  (max !== undefined && startOfDay(d) > startOfDay(max))

const clampToRange = (d: Date, min?: Date, max?: Date) => {
  if (min !== undefined && startOfDay(d) < startOfDay(min)) return startOfDay(min)
  if (max !== undefined && startOfDay(d) > startOfDay(max)) return startOfDay(max)
  return startOfDay(d)
}

const toKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

/** Pazartesi bazlı hafta içi index'i: Pzt=0 … Paz=6 */
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7

/** Görünen ayı, Pazartesi başlangıçlı 6 haftalık sabit grid'e açar (yükseklik zıplamaz) */
function monthGrid(view: Date): Date[][] {
  const start = addDays(startOfMonth(view), -mondayIndex(startOfMonth(view)))
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)))
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function GlassDatePicker({
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = 'Tarih seç',
  size = 'md',
  tone = 'auto',
  invalid = false,
  disabled = false,
  locale = 'tr-TR',
  variant = 'popover',
  className,
  ...rest
}: GlassDatePickerProps) {
  const isInline = variant === 'inline'
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const titleId = `${baseId}-title`
  const rootRef = useRef<HTMLDivElement>(null)
  const focusRequest = useRef(false)
  const reduced = prefersReducedMotion()

  const [open, setOpen] = useState(false)
  const [inner, setInner] = useState<Date | null>(defaultValue ?? null)
  const selected = value !== undefined ? value : inner

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected ?? new Date()))
  const [focusedDate, setFocusedDate] = useState(() => startOfDay(selected ?? new Date()))

  const valueFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale])
  const dayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }), [locale])
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale])
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    // 2024-01-01 bir Pazartesi — hafta başlıkları buradan türetilir
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)))
  }, [locale])

  const weeks = useMemo(() => monthGrid(viewMonth), [viewMonth])
  const today = startOfDay(new Date())

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>('[data-part="trigger"]')?.focus()
  }

  const openPanel = () => {
    const base = clampToRange(selected ?? new Date(), min, max)
    setViewMonth(startOfMonth(base))
    setFocusedDate(base)
    focusRequest.current = true
    setOpen(true)
  }

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) focusTrigger()
  }

  const select = (day: Date) => {
    if (isOutOfRange(day, min, max)) return
    const picked = startOfDay(day)
    if (value === undefined) setInner(picked)
    onChange?.(picked)
    // Inline modda kapatılacak panel ve dönülecek tetikleyici yok.
    if (!isInline) close(true)
  }

  /** Klavye gezinmesi: hedef günü aralığa kıstırır, ay görünümünü izler, focus ister */
  const moveFocus = (target: Date) => {
    const next = clampToRange(target, min, max)
    setFocusedDate(next)
    if (!isSameMonth(next, viewMonth)) setViewMonth(startOfMonth(next))
    focusRequest.current = true
  }

  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let target: Date | null = null
    if (e.key === 'ArrowLeft') target = addDays(focusedDate, -1)
    else if (e.key === 'ArrowRight') target = addDays(focusedDate, 1)
    else if (e.key === 'ArrowUp') target = addDays(focusedDate, -7)
    else if (e.key === 'ArrowDown') target = addDays(focusedDate, 7)
    else if (e.key === 'PageUp') target = addMonthsKeepDay(focusedDate, -1)
    else if (e.key === 'PageDown') target = addMonthsKeepDay(focusedDate, 1)
    else if (e.key === 'Home') target = addDays(focusedDate, -mondayIndex(focusedDate))
    else if (e.key === 'End') target = addDays(focusedDate, 6 - mondayIndex(focusedDate))
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(focusedDate)
      return
    } else return
    e.preventDefault()
    moveFocus(target)
  }

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open && !isInline) {
      e.stopPropagation()
      close(true)
    }
  }

  // Klavye/açılış kaynaklı focus isteği: hedef gün hücresine odaklan
  useEffect(() => {
    if (!(open || isInline) || !focusRequest.current) return
    focusRequest.current = false
    rootRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toKey(focusedDate)}"]`)?.focus()
  }, [open, isInline, focusedDate])

  // Dış tıklama kapatır (focus çalınmaz — kullanıcı zaten başka yere gitti)
  useEffect(() => {
    if (!open || isInline) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, isInline])

  const triggerClasses = [styles.trigger, styles[size], invalid ? styles.invalid : ''].filter(Boolean).join(' ')

  // Başlık + ay grid'i: popover ve inline aynı gövdeyi paylaşır — davranış
  // (klavye gezinme, roving tabindex, aria) iki varyantta da birebir aynıdır.
  const panelBody = (
    <>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.nav}
          aria-label="Önceki ay"
          onClick={() => setViewMonth((m) => startOfMonth(addMonthsKeepDay(m, -1)))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span id={titleId} className={styles.title}>
          {monthFmt.format(viewMonth)}
        </span>
        <button
          type="button"
          className={styles.nav}
          aria-label="Sonraki ay"
          onClick={() => setViewMonth((m) => startOfMonth(addMonthsKeepDay(m, 1)))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div role="grid" aria-labelledby={titleId} className={styles.grid} onKeyDown={onGridKeyDown}>
        <div role="row" className={styles.row}>
          {weekdays.map((name, i) => (
            <span key={i} role="columnheader" className={styles.weekday}>
              {name}
            </span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className={styles.row}>
            {week.map((day) => {
              const outOfRange = isOutOfRange(day, min, max)
              const isSelected = selected !== null && selected !== undefined && isSameDay(day, selected)
              const cellClasses = [
                styles.day,
                isSameMonth(day, viewMonth) ? '' : styles.dayOutside,
                isSameDay(day, today) ? styles.dayToday : '',
                isSelected ? styles.daySelected : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={toKey(day)}
                  type="button"
                  role="gridcell"
                  data-date={toKey(day)}
                  className={cellClasses}
                  aria-label={dayFmt.format(day)}
                  aria-selected={isSelected || undefined}
                  aria-current={isSameDay(day, today) ? 'date' : undefined}
                  tabIndex={isSameDay(day, focusedDate) ? 0 : -1}
                  disabled={outOfRange}
                  onClick={() => select(day)}
                  onFocus={() => setFocusedDate(startOfDay(day))}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  if (isInline) {
    return (
      <div
        ref={rootRef}
        className={[styles.root, styles.inlineRoot, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {/* Cam yok: gömülü takvim, altındaki içerik okunmasın diye düz zemin taşır */}
        <div className={styles.panelInline}>{panelBody}</div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      onKeyDown={onRootKeyDown}
      {...rest}
    >
      <GlassSurface
        as="button"
        shape={12}
        interactive={!disabled}
        tone={tone}
        thickness={0.3}
        className={triggerClasses}
        {...({
          type: 'button',
          role: 'combobox',
          'data-part': 'trigger',
          'aria-expanded': open,
          'aria-haspopup': 'grid',
          'aria-controls': open ? panelId : undefined,
          'aria-invalid': invalid || undefined,
          disabled,
          onClick: () => (open ? close(false) : openPanel()),
        } as unknown as GlassSurfaceProps)}
      >
        <span className={[styles.value, selected ? '' : styles.placeholder].filter(Boolean).join(' ')}>
          {selected ? valueFmt.format(selected) : placeholder}
        </span>
        <span className={styles.icon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </GlassSurface>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className={styles.popover}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <GlassSurface shape={16} tone={tone} thickness={0.5} className={styles.panel}>
              {panelBody}
            </GlassSurface>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
