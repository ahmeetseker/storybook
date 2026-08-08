import { useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassBreadcrumb.module.css'

export interface GlassBreadcrumbItem {
  label: string
  /** Gerçek URL — öğe `<a>` render edilir; orta tık, yeni sekme ve SEO çalışır. */
  href?: string
  /**
   * SPA gezinmesi. `href` ile birlikte verildiğinde sade sol tık devralınır;
   * modifier'lı (⌘/Ctrl/Shift/Alt) ve orta tık tarayıcıya bırakılır.
   */
  onClick?: () => void
}

export interface GlassBreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: GlassBreadcrumbItem[]
  separator?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
  /**
   * Görünür öğe tavanı (ellipsis dahil; 3'ün altı 3'e yuvarlanır). Aşan ara
   * seviyeler "…" butonunda toplanır; buton yerinde açar — cam kapsülün içine
   * ikinci bir cam panel (menü) açılmaz (cam üstüne cam yok, bkz. rules.md §7).
   */
  maxItems?: number
}

/**
 * Sade sol tıkta SPA gezinmesine devret; modifier'lı ve orta tıkta tarayıcıya
 * bırak (yeni sekme davranışı korunur) — GlassSiteHeader ile aynı sözleşme.
 */
function linkClick(item: GlassBreadcrumbItem) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!item.onClick) return
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    item.onClick()
  }
}

export function GlassBreadcrumb({
  items,
  separator = '›',
  tone = 'auto',
  maxItems,
  className,
  ...rest
}: GlassBreadcrumbProps) {
  const [expanded, setExpanded] = useState(false)
  // Açılışta odak ilk ortaya çıkan öğeye taşınır: "…" butonu DOM'dan kalkar,
  // odağın belgede kaybolmasına izin verilmez.
  const pendingFocusIndex = useRef<number | null>(null)

  const limit = maxItems === undefined ? undefined : Math.max(3, maxItems)
  const collapsed = limit !== undefined && !expanded && items.length > limit
  const tailStart = items.length - ((limit ?? 0) - 2)

  const expand = () => {
    pendingFocusIndex.current = 1
    setExpanded(true)
  }

  const focusOnReveal = (node: HTMLElement | null, index: number) => {
    if (node && pendingFocusIndex.current === index) {
      pendingFocusIndex.current = null
      node.focus()
    }
  }

  const renderItem = (item: GlassBreadcrumbItem, index: number) => {
    const last = index === items.length - 1
    if (!last && item.href) {
      return (
        <a
          ref={(node) => focusOnReveal(node, index)}
          href={item.href}
          className={styles.link}
          onClick={linkClick(item)}
        >
          {item.label}
        </a>
      )
    }
    if (!last && item.onClick) {
      return (
        <button
          ref={(node) => focusOnReveal(node, index)}
          type="button"
          className={styles.link}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      )
    }
    return (
      <span className={styles.label} aria-current={last ? 'page' : undefined}>
        {item.label}
      </span>
    )
  }

  const entries: Array<{ item: GlassBreadcrumbItem; index: number } | 'ellipsis'> = collapsed
    ? [
        { item: items[0], index: 0 },
        'ellipsis',
        ...items.slice(tailStart).map((item, i) => ({ item, index: tailStart + i })),
      ]
    : items.map((item, index) => ({ item, index }))

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
        {entries.map((entry) => {
          if (entry === 'ellipsis') {
            return (
              <li key="ellipsis" className={styles.item}>
                <button
                  type="button"
                  className={styles.link}
                  aria-label={`Gizlenen ${tailStart - 1} seviyeyi göster`}
                  onClick={expand}
                >
                  …
                </button>
                <span className={styles.separator} aria-hidden>
                  {separator}
                </span>
              </li>
            )
          }
          const last = entry.index === items.length - 1
          return (
            <li key={`${entry.item.label}-${entry.index}`} className={styles.item}>
              {renderItem(entry.item, entry.index)}
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
