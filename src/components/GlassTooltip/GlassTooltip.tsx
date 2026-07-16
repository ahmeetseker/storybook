import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassTooltip.module.css'

export interface GlassTooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> {
  /** Panel içeriği — kısa, tamamlayıcı bilgi (accessible name DEĞİL, description'dır) */
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Hover açılış gecikmesi (ms). Kapanış her zaman anındadır; focus da anında açar. */
  delay?: number
  /** Tek tetikleyici öğe. cloneElement yapılmaz; event'ler sarmalayıcı span üstündedir. */
  children: ReactElement
}

// Dokunmatikte hover yok, long-press ise metin seçimi/context menu ile çakışır →
// coarse pointer'da tooltip hiç gösterilmez (CSS ile gizleme değil, JS ile hiç açılmaz).
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches

export function GlassTooltip({
  content,
  placement = 'top',
  delay = 300,
  children,
  className,
  ...rest
}: GlassTooltipProps) {
  const rawId = useId()
  const tooltipId = `lg-tooltip-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`
  const [open, setOpen] = useState(false)
  // Lazy init: cihaz sınıfı oturum boyunca değişmez, her render'da sorgulamaya gerek yok
  const [coarse] = useState(isCoarsePointer)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const reduced = prefersReducedMotion()

  const clearTimer = () => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current)
      timer.current = undefined
    }
  }

  const scheduleShow = () => {
    if (coarse) return
    clearTimer()
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }

  const showNow = () => {
    if (coarse) return
    clearTimer()
    setOpen(true)
  }

  const hide = () => {
    clearTimer()
    setOpen(false)
  }

  useEffect(() => clearTimer, [])

  // aria-describedby tetikleyicinin KENDİSİNE yazılmalı (sarmalayıcı span'e değil) —
  // cloneElement kullanmadığımız için DOM üstünden, yalnız panel açıkken.
  useEffect(() => {
    const trigger = wrapperRef.current?.firstElementChild
    if (!trigger || !open) return
    trigger.setAttribute('aria-describedby', tooltipId)
    return () => trigger.removeAttribute('aria-describedby')
  }, [open, tooltipId])

  // Escape her yerden kapatır (focus tooltip dışındayken de — WAI-ARIA tooltip deseni)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onBlur = (e: FocusEvent<HTMLSpanElement>) => {
    // focus-within kalıbı: odak sarmalayıcının dışına çıktıysa kapat
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide()
  }

  // Fade + 2px translate, tetikleyiciye doğru; reduced-motion'da yalnız opacity
  const axis = placement === 'left' || placement === 'right' ? 'x' : 'y'
  const offset = placement === 'top' || placement === 'left' ? 2 : -2
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, [axis]: offset }
  const visible = reduced ? { opacity: 1 } : { opacity: 1, [axis]: 0 }

  return (
    <span
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      {...rest}
      onMouseEnter={scheduleShow}
      onMouseLeave={hide}
      onFocus={showNow}
      onBlur={onBlur}
    >
      {children}
      <AnimatePresence>
        {open ? (
          <motion.span
            id={tooltipId}
            role="tooltip"
            className={[styles.panel, styles[placement]].join(' ')}
            initial={hidden}
            animate={visible}
            exit={hidden}
            transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }}
          >
            {content}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
