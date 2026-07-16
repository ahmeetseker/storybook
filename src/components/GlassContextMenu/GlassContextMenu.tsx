import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassContextMenu.module.css'

export interface GlassContextMenuItem {
  label: string
  icon?: ReactNode
  onSelect?: () => void
  disabled?: boolean
  /** Yıkıcı aksiyon: danger renginde gösterilir */
  destructive?: boolean
  /** Bu öğeden önce ayraç çizgisi */
  separatorBefore?: boolean
}

export interface GlassContextMenuProps extends HTMLAttributes<HTMLDivElement> {
  items: GlassContextMenuItem[]
  /** Sağ tıklanabilir alan */
  children: ReactNode
  tone?: 'light' | 'dark' | 'auto'
}

const VIEWPORT_MARGIN = 8

export function GlassContextMenu({ items, children, tone = 'auto', className, ...rest }: GlassContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = prefersReducedMotion()
  const isOpen = pos !== null

  const onContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
  }

  // Viewport taşma düzeltmesi: panel açıldıktan sonra ölçülür, koordinat clamp'lenir
  useLayoutEffect(() => {
    if (!pos) return
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const nx = Math.max(VIEWPORT_MARGIN, Math.min(pos.x, window.innerWidth - rect.width - VIEWPORT_MARGIN))
    const ny = Math.max(VIEWPORT_MARGIN, Math.min(pos.y, window.innerHeight - rect.height - VIEWPORT_MARGIN))
    if (nx !== pos.x || ny !== pos.y) setPos({ x: nx, y: ny })
  }, [pos])

  const enabledItems = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)') ?? [])

  // Açılınca ilk aktif öğeye focus (menu deseni)
  useEffect(() => {
    if (isOpen) enabledItems()[0]?.focus()
  }, [isOpen])

  // Escape / dış tıklama / scroll kapatır
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPos(null)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPos(null)
    }
    const onScroll = () => setPos(null)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])

  const moveFocus = (dir: 1 | -1 | 'first' | 'last') => {
    const buttons = enabledItems()
    if (buttons.length === 0) return
    if (dir === 'first') return buttons[0].focus()
    if (dir === 'last') return buttons[buttons.length - 1].focus()
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = idx === -1 ? (dir === 1 ? 0 : buttons.length - 1) : (idx + dir + buttons.length) % buttons.length
    buttons[next].focus()
  }

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveFocus(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveFocus(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      moveFocus('first')
    } else if (e.key === 'End') {
      e.preventDefault()
      moveFocus('last')
    } else if (e.key === 'Tab') {
      // Menu deseni: Tab menüde gezinmez, menüyü kapatır
      e.preventDefault()
      setPos(null)
    }
  }

  const select = (item: GlassContextMenuItem) => {
    if (item.disabled) return
    item.onSelect?.()
    setPos(null)
  }

  return (
    <div className={[styles.area, className].filter(Boolean).join(' ')} onContextMenu={onContextMenu} {...rest}>
      {children}
      <AnimatePresence>
        {pos ? (
          <div
            key="menu"
            ref={panelRef}
            className={styles.positioner}
            style={{ left: pos.x, top: pos.y }}
            onKeyDown={onPanelKeyDown}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.08 : 0.14, ease: [0.32, 0.72, 0, 1] }}
              style={{ transformOrigin: 'left top' }}
            >
              <GlassSurface
                role="menu"
                aria-orientation="vertical"
                shape={14} /* --lg-radius-media */
                tone={tone}
                thickness={0.5}
                className={styles.menu}
              >
                {items.map((item, i) => (
                  <Fragment key={`${item.label}-${i}`}>
                    {item.separatorBefore && i > 0 ? <span role="separator" className={styles.separator} /> : null}
                    <button
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      disabled={item.disabled}
                      aria-disabled={item.disabled || undefined}
                      className={[styles.item, item.destructive ? styles.destructive : ''].filter(Boolean).join(' ')}
                      onClick={() => select(item)}
                    >
                      {item.icon ? (
                        <span className={styles.icon} aria-hidden>
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={styles.label}>{item.label}</span>
                    </button>
                  </Fragment>
                ))}
              </GlassSurface>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
