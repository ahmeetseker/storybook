import type { HTMLAttributes, ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassSpecTable.module.css'

export interface GlassSpecItem {
  label: string
  value: ReactNode
}

export interface GlassSpecTableProps extends HTMLAttributes<HTMLElement> {
  items: GlassSpecItem[]
  /** Etiket/değer çiftlerinin kaç sütuna dizileceği */
  columns?: 1 | 2
  title?: string
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassSpecTable({ items, columns = 1, title, tone = 'auto', className, ...rest }: GlassSpecTableProps) {
  return (
    <GlassSurface
      as="section"
      shape={20}
      tone={tone}
      thickness={0.4}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <dl className={[styles.grid, columns === 2 ? styles.twoColumns : ''].filter(Boolean).join(' ')}>
        {items.map((item, i) => (
          <div key={`${item.label}-${i}`} className={styles.row}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </GlassSurface>
  )
}
