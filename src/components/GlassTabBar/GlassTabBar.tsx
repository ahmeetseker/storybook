import { createContext, useContext, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassTabBar.module.css'

interface TabBarContextValue {
  selected: string
  onSelect: (id: string) => void
  highlightId: string
}

const TabBarContext = createContext<TabBarContextValue | null>(null)

export interface GlassTabBarProps {
  selected: string
  onSelect: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
  'aria-label'?: string
  children: ReactNode
}

export interface GlassTabBarItemProps {
  id: string
  icon: ReactNode
  label: string
}

function TabBarRoot({ selected, onSelect, tone = 'auto', 'aria-label': ariaLabel = 'Ana sekmeler', children }: GlassTabBarProps) {
  const [expanded, setExpanded] = useState(false)
  const highlightId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  // visionOS gaze davranışının web karşılığı: bara bakınca (hover/focus) etiketler belirir
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
    const current = tabs.findIndex((t) => t === document.activeElement)
    if (current === -1) return
    const next = e.key === 'ArrowDown' ? (current + 1) % tabs.length : (current - 1 + tabs.length) % tabs.length
    tabs[next].focus()
    tabs[next].click()
  }

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false)
  }

  return (
    <GlassSurface
      shape={34}
      tone={tone}
      thickness={0.4}
      className={styles.bar}
      data-expanded={expanded}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={onBlur}
    >
      <div ref={listRef} role="tablist" aria-label={ariaLabel} aria-orientation="vertical" className={styles.list} onKeyDown={onKeyDown}>
        <TabBarContext.Provider value={{ selected, onSelect, highlightId }}>{children}</TabBarContext.Provider>
      </div>
    </GlassSurface>
  )
}

function Item({ id, icon, label }: GlassTabBarItemProps) {
  const ctx = useContext(TabBarContext)
  if (!ctx) throw new Error('GlassTabBar.Item, GlassTabBar içinde kullanılmalı')
  const { selected, onSelect, highlightId } = ctx
  const isSelected = selected === id
  const reduced = prefersReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={styles.item}
      onClick={() => onSelect(id)}
    >
      {isSelected ? (
        <motion.span
          layoutId={highlightId}
          className={styles.highlight}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      ) : null}
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={styles.labelWrap} aria-hidden={false}>
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  )
}

export const GlassTabBar = Object.assign(TabBarRoot, { Item })
