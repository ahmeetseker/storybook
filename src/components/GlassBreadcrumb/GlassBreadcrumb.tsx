import type { HTMLAttributes, ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassBreadcrumb.module.css'

export interface GlassBreadcrumbItem {
  label: string
  onClick?: () => void
}

export interface GlassBreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: GlassBreadcrumbItem[]
  separator?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassBreadcrumb({ items, separator = '›', tone = 'auto', className, ...rest }: GlassBreadcrumbProps) {
  return (
    <GlassSurface
      as="nav"
      aria-label="Kategori yolu"
      shape="capsule"
      tone={tone}
      thickness={0.2}
      className={[styles.breadcrumb, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className={styles.item}>
              {!last && item.onClick ? (
                <button type="button" className={styles.link} onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span className={styles.label} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!last && (
                <span className={styles.separator} aria-hidden>
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </GlassSurface>
  )
}
