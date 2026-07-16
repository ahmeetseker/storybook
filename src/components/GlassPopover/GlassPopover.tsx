import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassPopover.module.css'

export interface GlassPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tıklanınca popover'ı açan öğe (odaklanabilir bir kontrol önerilir, ör. GlassButton) */
  trigger: ReactNode
  /** Controlled kullanım */
  open?: boolean
  /** Uncontrolled kullanımda başlangıç durumu */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  /** Panel başlığı; verilirse aria-labelledby ile panele bağlanır */
  title?: string
  tone?: 'light' | 'dark' | 'auto'
  /** Panel içeriği */
  children?: ReactNode
}

const originByPlacement: Record<NonNullable<GlassPopoverProps['placement']>, string> = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center',
}

export function GlassPopover({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  align = 'center',
  title,
  tone = 'auto',
  className,
  children,
  ...rest
}: GlassPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const reduced = prefersReducedMotion()

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  // Non-modal dialog sözleşmesi: Escape ve dış tıklama kapatır; focus trap YOK.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
    // setOpen her render'da yeniden yaratılır ama davranışı stabil — deps'e almak gereksiz re-bind üretir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, open])

  // Eksen: top/bottom → yatay hizalama, left/right → dikey hizalama
  const axis = placement === 'top' || placement === 'bottom' ? 'X' : 'Y'
  const alignClass = styles[`align${align.charAt(0).toUpperCase()}${align.slice(1)}${axis}`]

  // trigger tek bir element ise aria sözleşmesini üstüne yazarız (buton bekleriz)
  const decoratedTrigger =
    isValidElement<HTMLAttributes<HTMLElement>>(trigger)
      ? cloneElement(trigger, { 'aria-haspopup': 'dialog', 'aria-expanded': isOpen })
      : trigger

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.trigger} onClick={() => setOpen(!isOpen)}>
        {decoratedTrigger}
      </div>
      <AnimatePresence>
        {isOpen ? (
          <div key="panel" className={[styles.positioner, styles[placement], alignClass].filter(Boolean).join(' ')}>
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduced ? 0.1 : 0.18, ease: [0.32, 0.72, 0, 1] }}
              style={{ transformOrigin: originByPlacement[placement] }}
            >
              <GlassSurface
                role="dialog"
                aria-labelledby={title ? titleId : undefined}
                shape={14} /* --lg-radius-media */
                tone={tone}
                thickness={0.5}
                className={styles.card}
              >
                {title ? (
                  <h2 id={titleId} className={styles.title}>
                    {title}
                  </h2>
                ) : null}
                <div className={styles.body}>{children}</div>
              </GlassSurface>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
