import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassModal.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface GlassModalBaseProps {
  /** Kontrollü görünürlük — modal yalnız controlled çalışır */
  open: boolean
  /** Kapatma isteği (Escape, backdrop) — state'i çağıran günceller */
  onClose: () => void
  /** Başlığın altında soluk açıklama satırı; aria-describedby ile bağlanır */
  description?: string
  /** Aksiyon satırı — GlassButton'ları çağıran verir */
  footer?: ReactNode
  /** Panel max-width (≥sm): 400 / 560 / 760 — mobilde bottom-sheet tam genişlik */
  size?: 'sm' | 'md' | 'lg'
  /** false: backdrop tıklaması ve Escape kapatmaz; yalnız programatik kapanış */
  dismissible?: boolean
  className?: string
  children: ReactNode
}

/** `title` verilirse aria-labelledby ile bağlanır; verilmezse `ariaLabel` zorunludur. */
export type GlassModalProps = GlassModalBaseProps &
  ({ title: string; ariaLabel?: string } | { title?: undefined; ariaLabel: string })

export function GlassModal({
  open,
  onClose,
  title,
  ariaLabel,
  description,
  footer,
  size = 'md',
  dismissible = true,
  className,
  children,
}: GlassModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reduced = prefersReducedMotion()

  // Scroll kilidi + açılış focus'u + kapanışta tetikleyiciye geri dönüş.
  // Cleanup, open=false olduğunda VE unmount'ta çalışır — iki yol da güvenli.
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

  // Basit focus trap: Tab son elemandan ilkine (ve tersine) sarar
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

  if (typeof document === 'undefined') return null

  // bp-sm (640) altı: bottom-sheet — panel alttan kayar; ≥sm ortalanmış panel scale+translate
  const isSheet = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  const spring = { type: 'spring', ...presets.springs.sidebar } as const
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isSheet
      ? {
          initial: { opacity: 0, y: '100%' },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: '100%' },
          transition: spring,
        }
      : {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.96, y: 8 },
          transition: spring,
        }

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
            className={[styles.panel, styles[size], className].filter(Boolean).join(' ')}
            onKeyDown={onPanelKeyDown}
            {...panelMotion}
          >
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
            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
