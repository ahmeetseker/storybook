import { useCallback, useRef, type HTMLAttributes, type KeyboardEvent, type FocusEvent, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassToolbar.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface GlassToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Toolbar erişilebilir adı (aria-label) — fiilen zorunlu */
  label?: string
  /**
   * Birincil aksiyon — pill gruplarından ayrı, sağa yaslı yaşar.
   * Çağıran tintli/prominent bir GlassButton verir.
   */
  primary?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
  children: ReactNode
}

export interface GlassToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Grup erişilebilir adı (aria-label) */
  label?: string
  tone?: 'light' | 'dark' | 'auto'
  children: ReactNode
}

export function GlassToolbar({ label, primary, tone = 'auto', className, children, onKeyDown, ...rest }: GlassToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  const getFocusable = useCallback(
    () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    [],
  )

  // WAI-ARIA toolbar deseni: tek tab durağı. Odak alan öğe durak olur,
  // kalanlar tab sırasından çıkar; ok tuşları duraklar arasında gezer.
  const setStop = useCallback(
    (target: HTMLElement) => {
      for (const el of getFocusable()) el.tabIndex = el === target ? 0 : -1
    },
    [getFocusable],
  )

  const handleFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.matches(FOCUSABLE)) setStop(e.target)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    const els = getFocusable()
    if (els.length === 0) return
    const current = els.indexOf(document.activeElement as HTMLElement)
    let next: number
    if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = els.length - 1
    else if (e.key === 'ArrowRight') next = current === -1 ? 0 : (current + 1) % els.length
    else next = current === -1 ? els.length - 1 : (current - 1 + els.length) % els.length
    e.preventDefault()
    const el = els[next]
    setStop(el)
    el.focus()
  }

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-label={label}
      className={[styles.root, className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      onFocusCapture={handleFocusCapture}
      {...rest}
    >
      <div className={styles.groups} data-tone={tone}>
        {children}
      </div>
      {primary ? <div className={styles.primary}>{primary}</div> : null}
    </div>
  )
}

/** İşlevce akraba kontrolleri tek cam kapsülde toplar (ör. hizalama butonları). */
export function GlassToolbarGroup({ label, tone = 'auto', className, children, ...rest }: GlassToolbarGroupProps) {
  return (
    <GlassSurface
      as="div"
      shape="capsule"
      tone={tone}
      thickness={0.25}
      className={[styles.group, className].filter(Boolean).join(' ')}
      {...({ role: 'group', 'aria-label': label, ...rest } as HTMLAttributes<HTMLElement>)}
    >
      <div className={styles.groupInner}>{children}</div>
    </GlassSurface>
  )
}
