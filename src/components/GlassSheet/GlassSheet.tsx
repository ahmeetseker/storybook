import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSheet.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Sürükleme bırakıldığında en küçük detent'in bu kadar altındaysa kapanma sayılır */
const DISMISS_THRESHOLD = 80

interface GlassSheetBaseProps {
  /** Kontrollü görünürlük — sheet yalnız controlled çalışır */
  open: boolean
  /** Kapatma isteği (Escape, backdrop, aşağı çekme) — state'i çağıran günceller */
  onClose: () => void
  /** Başlığın altında soluk açıklama satırı; aria-describedby ile bağlanır */
  description?: string
  /**
   * Çekme noktaları: viewport yüksekliği oranları, küçükten büyüğe.
   * Panel yalnız bu duraklarda dinlenir; aralarda sürüklenebilir.
   */
  detents?: number[]
  /** Açılışta dinlenilen detent'in index'i */
  defaultDetent?: number
  /** Durak değişince yeni index ile çağrılır */
  onDetentChange?: (index: number) => void
  /** false: backdrop, Escape ve aşağı çekme kapatmaz */
  dismissible?: boolean
  className?: string
  children: ReactNode
}

/** `title` verilirse aria-labelledby ile bağlanır; verilmezse `ariaLabel` zorunludur. */
export type GlassSheetProps = GlassSheetBaseProps &
  ({ title: string; ariaLabel?: string } | { title?: undefined; ariaLabel: string })

export function GlassSheet({
  open,
  onClose,
  title,
  ariaLabel,
  description,
  detents = [0.45, 0.88],
  defaultDetent = 0,
  onDetentChange,
  dismissible = true,
  className,
  children,
}: GlassSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reduced = prefersReducedMotion()

  const [detentIndex, setDetentIndex] = useState(defaultDetent)
  // Sürükleme sırasında px yükseklik; null = durakta (fraction yüksekliği geçerli)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const dragStart = useRef<{ y: number; height: number } | null>(null)

  const clampIndex = useCallback(
    (i: number) => Math.min(Math.max(i, 0), detents.length - 1),
    [detents.length],
  )

  const goToDetent = useCallback(
    (i: number) => {
      const next = clampIndex(i)
      setDetentIndex((prev) => {
        if (next !== prev) onDetentChange?.(next)
        return next
      })
    },
    [clampIndex, onDetentChange],
  )

  // Açılışta başlangıç durağına dön
  useEffect(() => {
    if (open) setDetentIndex(clampIndex(defaultDetent))
  }, [open, defaultDetent, clampIndex])

  // Scroll kilidi + açılış focus'u + kapanışta tetikleyiciye dönüş (GlassDrawer/GlassModal sözleşmesi)
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const panel = panelRef.current
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel).focus()
    }
    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  // Escape yalnız dismissible iken kapatır
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismissible, onClose])

  // Basit focus trap (GlassDrawer ile aynı)
  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Tutamaç sürüklemesi: aralarda serbest, bırakınca en yakın durağa oturur
  const onGrabberPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    dragStart.current = { y: e.clientY, height: (dragHeight ?? detents[detentIndex] * window.innerHeight) }
    // jsdom'da yok — optional chaining bilinçli
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onGrabberPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStart.current
    if (!start) return
    const maxPx = detents[detents.length - 1] * window.innerHeight
    const next = Math.min(start.height + (start.y - e.clientY), maxPx)
    setDragHeight(next)
  }
  const onGrabberPointerUp = () => {
    const start = dragStart.current
    dragStart.current = null
    if (dragHeight === null || !start) return
    const minPx = detents[0] * window.innerHeight
    if (dismissible && dragHeight < minPx - DISMISS_THRESHOLD) {
      setDragHeight(null)
      onClose()
      return
    }
    // En yakın durak kazanır
    let nearest = 0
    for (let i = 1; i < detents.length; i++) {
      const d = Math.abs(detents[i] * window.innerHeight - dragHeight)
      if (d < Math.abs(detents[nearest] * window.innerHeight - dragHeight)) nearest = i
    }
    setDragHeight(null)
    goToDetent(nearest)
  }

  // Tutamaç klavyesi: yukarı/aşağı durak değiştirir; en alttayken aşağı kapatır
  const onGrabberKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      goToDetent(detentIndex + 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (detentIndex === 0) {
        if (dismissible) onClose()
      } else goToDetent(detentIndex - 1)
    }
  }

  if (typeof document === 'undefined') return null

  const fraction = detents[clampIndex(detentIndex)] ?? detents[0]
  // Kalınlaşma: en küçük durakta 0, en büyükte 1 — cam opaklığı/bulanıklığı bununla ölçeklenir
  const range = detents[detents.length - 1] - detents[0]
  const currentFraction = dragHeight !== null ? dragHeight / window.innerHeight : fraction
  const t = range > 0 ? Math.min(Math.max((currentFraction - detents[0]) / range, 0), 1) : 1

  const heightStyle: CSSProperties & Record<'--sheet-t', number> = {
    height: dragHeight !== null ? `${dragHeight}px` : `${fraction * 100}dvh`,
    '--sheet-t': t,
  }

  const spring = { type: 'spring', ...presets.springs.sidebar } as const
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: spring }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={styles.root}>
          <motion.div
            className={styles.backdrop}
            data-glass-backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={[styles.panel, dragHeight !== null ? styles.dragging : '', className].filter(Boolean).join(' ')}
            style={heightStyle}
            onKeyDown={onPanelKeyDown}
            {...panelMotion}
          >
            <button
              type="button"
              className={styles.grabber}
              aria-label="Panel boyutu"
              onPointerDown={onGrabberPointerDown}
              onPointerMove={onGrabberPointerMove}
              onPointerUp={onGrabberPointerUp}
              onKeyDown={onGrabberKeyDown}
            >
              <span className={styles.grabberBar} aria-hidden />
            </button>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
            <div className={styles.body}>{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
