import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
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
  /** İçerik panelinin malzemesi; sekme çubuğu (kontrol) her zaman cam kalır */
  material?: 'glass' | 'flat'
}

export function GlassTabs({
  tabs,
  activeId,
  defaultActiveId,
  onTabChange,
  tone = 'auto',
  material,
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

  // WAI-ARIA tabs deseni: roving tabindex + ok tuşlarıyla gezinme (seçim focus'u izler)
  const onTablistKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (tabs.length === 0) return
    const currentIndex = tabs.findIndex((t) => t.id === current?.id)
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === -1) return
    e.preventDefault()
    const next = tabs[nextIndex]
    select(next.id)
    const el = document.getElementById(`${baseId}-tab-${next.id}`)
    el?.focus()
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <GlassSurface as="div" shape="capsule" tone={tone} thickness={0.25} className={styles.bar}>
        <div role="tablist" className={styles.list} onKeyDown={onTablistKeyDown}>
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
          material={material}
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
