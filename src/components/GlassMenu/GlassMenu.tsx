import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassMenu.module.css'

type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface GlassMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Menüyü açan öğe (genelde GlassButton/GlassIconButton) — relative wrapper'a sarılır */
  trigger: ReactNode
  /** Panelin tetikleyiciye göre konumu */
  placement?: Placement
  tone?: 'light' | 'dark' | 'auto'
  /** GlassMenuItem / GlassMenuSeparator öğeleri */
  children: ReactNode
}

export interface GlassMenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  icon?: ReactNode
  onSelect?: () => void
  /** Yıkıcı aksiyon (Sil gibi) — danger renk */
  destructive?: boolean
}

interface MenuContextValue {
  close: (returnFocus: boolean) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

const placementClass: Record<Placement, string> = {
  'bottom-start': 'bottomStart',
  'bottom-end': 'bottomEnd',
  'top-start': 'topStart',
  'top-end': 'topEnd',
}

export function GlassMenu({
  trigger,
  placement = 'bottom-start',
  tone = 'auto',
  className,
  children,
  ...rest
}: GlassMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const initialFocus = useRef<'first' | 'last'>('first')
  const reduced = prefersReducedMotion()

  const getItems = (): HTMLElement[] =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).filter(
      (el) => !el.hasAttribute('disabled'),
    )

  // Roving tabIndex: odaklanan item 0, diğerleri -1
  const focusItem = (index: number) => {
    const items = getItems()
    if (items.length === 0) return
    const target = ((index % items.length) + items.length) % items.length
    items.forEach((el, i) => {
      el.tabIndex = i === target ? 0 : -1
    })
    items[target].focus()
  }

  const focusTrigger = () => {
    triggerRef.current?.querySelector<HTMLElement>('button, a[href], [tabindex]')?.focus()
  }

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) focusTrigger()
  }

  // Açılınca ilk (ArrowUp ile açıldıysa son) item'a focus
  useEffect(() => {
    if (open) focusItem(initialFocus.current === 'first' ? 0 : -1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Dış tıklama kapatır
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    // Enter/Space native click üretir (toggle); yalnız oklar elle açar
    if (open) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      initialFocus.current = e.key === 'ArrowDown' ? 'first' : 'last'
      setOpen(true)
    }
  }

  const onListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = getItems()
    const current = items.indexOf(document.activeElement as HTMLElement)
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusItem(current + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusItem(current - 1)
        break
      case 'Home':
        e.preventDefault()
        focusItem(0)
        break
      case 'End':
        e.preventDefault()
        focusItem(items.length - 1)
        break
      case 'Tab':
        // Menü focus tuzağı değildir — Tab menüyü kapatır, focus doğal akışına döner
        setOpen(false)
        break
    }
  }

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      close(true)
    }
  }

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })
    : trigger

  const closedMotion = reduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, y: placement.startsWith('top') ? 4 : -4 }
  const openMotion = reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      onKeyDown={onRootKeyDown}
      {...rest}
    >
      <span
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => {
          initialFocus.current = 'first'
          setOpen((o) => !o)
        }}
        onKeyDown={onTriggerKeyDown}
      >
        {triggerNode}
      </span>
      <AnimatePresence>
        {open ? (
          <motion.div
            className={[styles.panelWrap, styles[placementClass[placement]]].join(' ')}
            initial={closedMotion}
            animate={openMotion}
            exit={closedMotion}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <GlassSurface
              shape={14}
              tone={tone}
              thickness={0.5}
              className={styles.panel}
              style={{ borderRadius: 'var(--lg-radius-media)' }}
            >
              <div ref={listRef} role="menu" className={styles.list} onKeyDown={onListKeyDown}>
                <MenuContext.Provider value={{ close }}>{children}</MenuContext.Provider>
              </div>
            </GlassSurface>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function GlassMenuItem({
  icon,
  onSelect,
  destructive = false,
  disabled,
  className,
  children,
  ...rest
}: GlassMenuItemProps) {
  const ctx = useContext(MenuContext)

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={[styles.item, destructive ? styles.destructive : '', className].filter(Boolean).join(' ')}
      onClick={() => {
        if (disabled) return
        onSelect?.()
        ctx?.close(true)
      }}
      {...rest}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={styles.itemLabel}>{children}</span>
    </button>
  )
}

export function GlassMenuSeparator() {
  return <div role="separator" className={styles.separator} />
}
