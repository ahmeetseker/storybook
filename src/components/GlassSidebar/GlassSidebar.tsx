import { useContext, useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GroupDepthContext, SidebarContext, useSidebarContext } from './SidebarContext'
import styles from './GlassSidebar.module.css'

export interface GlassSidebarProps {
  selected?: string
  onSelect?: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
  className?: string
  'aria-label'?: string
  children: ReactNode
}

export interface GlassSidebarHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}

export interface GlassSidebarItemProps {
  id: string
  icon?: ReactNode
  children: ReactNode
}

export interface GlassSidebarGroupProps {
  label: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

function SidebarRoot({ selected, onSelect, tone = 'auto', className, 'aria-label': ariaLabel = 'Kenar çubuğu', children }: GlassSidebarProps) {
  const highlightId = useId()
  return (
    <GlassSurface
      as="nav"
      shape={24}
      tone={tone}
      thickness={0.5}
      className={[styles.sidebar, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <SidebarContext.Provider value={{ selected, onSelect, highlightId }}>{children}</SidebarContext.Provider>
    </GlassSurface>
  )
}

function Header({ title, subtitle, action }: GlassSidebarHeaderProps) {
  useSidebarContext('GlassSidebar.Header')
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.title}>{title}</span>
        {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      </div>
      {action}
    </header>
  )
}

function Item({ id, icon, children }: GlassSidebarItemProps) {
  const { selected, onSelect, highlightId } = useSidebarContext('GlassSidebar.Item')
  const isSelected = selected === id
  const reduced = prefersReducedMotion()

  return (
    <button
      type="button"
      className={styles.item}
      aria-current={isSelected ? 'page' : undefined}
      onClick={() => onSelect?.(id)}
    >
      {isSelected ? (
        <motion.span
          layoutId={highlightId}
          className={styles.itemHighlight}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      ) : null}
      {icon ? (
        <span className={styles.itemIcon} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={styles.itemLabel}>{children}</span>
    </button>
  )
}

function Group({ label, defaultOpen = true, children }: GlassSidebarGroupProps) {
  useSidebarContext('GlassSidebar.Group')
  const depth = useContext(GroupDepthContext)
  if (depth > 0 && import.meta.env.DEV) {
    console.warn('GlassSidebar: iç içe Group desteklenmez — HIG en fazla iki seviye önerir')
  }
  const [open, setOpen] = useState(defaultOpen)
  const reduced = prefersReducedMotion()
  const regionId = useId()

  return (
    <div className={styles.group}>
      <button type="button" className={styles.groupHeader} aria-expanded={open} aria-controls={regionId} onClick={() => setOpen((o) => !o)}>
        <span className={styles.groupLabel}>{label}</span>
        <motion.span
          className={styles.chevronBox}
          animate={{ rotate: open ? 0 : -90 }}
          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          aria-hidden
        >
          <span className={styles.chevron} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={regionId}
            className={styles.groupItems}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <GroupDepthContext.Provider value={depth + 1}>{children}</GroupDepthContext.Provider>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export const GlassSidebar = Object.assign(SidebarRoot, { Header, Item, Group })
