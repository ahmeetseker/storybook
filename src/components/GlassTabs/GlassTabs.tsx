import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassTabs.module.css'

export interface GlassTabItem {
  id: string
  label: string
  content: ReactNode
}

export interface GlassTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: GlassTabItem[]
  /** Controlled kullanım için aktif sekme id'si */
  activeId?: string
  /** Uncontrolled kullanımda başlangıç sekmesi (varsayılan: ilk sekme) */
  defaultActiveId?: string
  onTabChange?: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassTabs({
  tabs,
  activeId,
  defaultActiveId,
  onTabChange,
  tone = 'auto',
  className,
  ...rest
}: GlassTabsProps) {
  const baseId = useId()
  const [innerActive, setInnerActive] = useState(defaultActiveId ?? tabs[0]?.id)
  const currentId = activeId ?? innerActive
  const current = tabs.find((t) => t.id === currentId) ?? tabs[0]

  const select = (id: string) => {
    if (activeId === undefined) setInnerActive(id)
    onTabChange?.(id)
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <GlassSurface as="div" shape="capsule" tone={tone} thickness={0.25} className={styles.bar}>
        <div role="tablist" className={styles.list}>
          {tabs.map((tab) => {
            const selected = tab.id === current?.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => select(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </GlassSurface>
      {current ? (
        <GlassSurface
          as="div"
          shape={20}
          tone={tone}
          thickness={0.4}
          className={styles.panel}
          role="tabpanel"
          id={`${baseId}-panel-${current.id}`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
        >
          {current.content}
        </GlassSurface>
      ) : null}
    </div>
  )
}
