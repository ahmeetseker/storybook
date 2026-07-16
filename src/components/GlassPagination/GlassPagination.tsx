import type { HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassPagination.module.css'

export interface GlassPaginationProps extends HTMLAttributes<HTMLElement> {
  /** Aktif sayfa (1 tabanlı) — kontrollü zorunlu */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Aktif sayfanın iki yanında gösterilecek komşu sayısı (ellipsis mantığı) */
  siblingCount?: number
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark' | 'auto'
  disabled?: boolean
}

type PageItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: 'l' | 'r' }

const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i)

/**
 * Ellipsis mantığı: 1 … 4 5 6 … 20
 * Toplam slot = 2·siblingCount + 5 (ilk + son + aktif + 2 ellipsis).
 * Sayfa sayısı sığıyorsa hepsi listelenir; uçlara yakınken tek ellipsis,
 * ortadayken iki ellipsis — görünen öğe sayısı sabit kalır (layout zıplamaz).
 */
function buildPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  const total = 2 * siblingCount + 5
  if (pageCount <= total) return range(1, pageCount).map((p) => ({ type: 'page', page: p }))

  const left = Math.max(page - siblingCount, 1)
  const right = Math.min(page + siblingCount, pageCount)
  const showLeft = left > 2
  const showRight = right < pageCount - 1

  if (!showLeft) {
    return [
      ...range(1, 2 * siblingCount + 3).map((p): PageItem => ({ type: 'page', page: p })),
      { type: 'ellipsis', key: 'r' },
      { type: 'page', page: pageCount },
    ]
  }
  if (!showRight) {
    return [
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'l' },
      ...range(pageCount - (2 * siblingCount + 2), pageCount).map((p): PageItem => ({ type: 'page', page: p })),
    ]
  }
  return [
    { type: 'page', page: 1 },
    { type: 'ellipsis', key: 'l' },
    ...range(left, right).map((p): PageItem => ({ type: 'page', page: p })),
    { type: 'ellipsis', key: 'r' },
    { type: 'page', page: pageCount },
  ]
}

export function GlassPagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  tone = 'auto',
  disabled = false,
  className,
  ...rest
}: GlassPaginationProps) {
  const safeCount = Math.max(pageCount, 1)
  const current = Math.min(Math.max(page, 1), safeCount)
  const items = buildPageItems(current, safeCount, Math.max(siblingCount, 0))

  const go = (next: number) => {
    if (disabled) return
    const clamped = Math.min(Math.max(next, 1), safeCount)
    if (clamped !== current) onPageChange(clamped)
  }

  return (
    <GlassSurface
      as="nav"
      aria-label="Sayfalama"
      shape="capsule"
      tone={tone}
      thickness={0.25}
      className={[styles.pagination, styles[size], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {/* GlassSurface çocukları inline .content span'ine sarar; flex bağlamı
          köke değil bu satıra kurulur — yoksa .pages (block) satır kırar. */}
      <div className={styles.row}>
      <button
        type="button"
        className={styles.item}
        aria-label="Önceki sayfa"
        disabled={disabled || current <= 1}
        onClick={() => go(current - 1)}
      >
        <span aria-hidden>‹</span>
      </button>

      {/* ≥ bp-sm: tam sayfa listesi (mobilde CSS ile gizlenir) */}
      <div className={styles.pages}>
        {items.map((item) =>
          item.type === 'page' ? (
            <button
              key={item.page}
              type="button"
              className={[styles.item, item.page === current ? styles.active : ''].filter(Boolean).join(' ')}
              aria-label={`Sayfa ${item.page}`}
              aria-current={item.page === current ? 'page' : undefined}
              disabled={disabled}
              onClick={() => go(item.page)}
            >
              {item.page}
            </button>
          ) : (
            <span key={item.key} className={styles.ellipsis} aria-hidden>
              …
            </span>
          ),
        )}
      </div>

      {/* < bp-sm: kompakt mod — yalnız "X / Y" göstergesi (oklar ortak) */}
      <span className={styles.compact}>
        {current} / {safeCount}
      </span>

      <button
        type="button"
        className={styles.item}
        aria-label="Sonraki sayfa"
        disabled={disabled || current >= safeCount}
        onClick={() => go(current + 1)}
      >
        <span aria-hidden>›</span>
      </button>
      </div>
    </GlassSurface>
  )
}
