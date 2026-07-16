// Bento vitrin ızgarası — ilan kartlarıyla veri hücrelerini (istatistik, harita,
// CTA) simetrik bir mozaikte karıştırır. Zemin flat; hücre içerikleri serbest.
// Hero'nun `bento` slotuna veya sayfa gövdesine konur (Zillow "platform" deseni).
import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import styles from './GlassBento.module.css'

export interface GlassBentoProps extends HTMLAttributes<HTMLDivElement> {
  /** Hücreler: GlassBento.Item / .Feature / .Stat / .Cell — sırayla grid'e akar */
  children: ReactNode
  /** Geniş ekrandaki sütun sayısı */
  columns?: 3 | 4
}

export interface GlassBentoItemProps {
  /** Hücrenin kapladığı sütun/satır — büyük kartlar 2×2 */
  colSpan?: 1 | 2
  rowSpan?: 1 | 2
  children: ReactNode
}

export interface GlassBentoFeatureProps {
  /** Arka plan görseli (dekoratif — içerik metinle verilir) */
  image: string
  price: string
  title: string
  meta?: string
  /** Sol üst rozet (örn. EİDS) */
  badge?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Kapladığı alan — default 2×2 öne çıkan; 1×1 kompakt kart */
  colSpan?: 1 | 2
  rowSpan?: 1 | 2
}

export interface GlassBentoStatProps {
  value: string
  label: string
  /** accent: vurgu zemininde CTA hücresi */
  tone?: 'default' | 'accent'
}

export interface GlassBentoCellProps {
  accent?: boolean
  children: ReactNode
}

function Item({ colSpan = 1, rowSpan = 1, children }: GlassBentoItemProps) {
  return (
    <div
      className={styles.item}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
      data-bento-item
    >
      {children}
    </div>
  )
}

/** 2×2 öne çıkan ilan kartı — görsel üstü gradyan gövde, tamamı tıklanabilir. */
function Feature({ image, price, title, meta, badge, onClick, colSpan = 2, rowSpan = 2 }: GlassBentoFeatureProps) {
  const compact = colSpan === 1 && rowSpan === 1
  return (
    <Item colSpan={colSpan} rowSpan={rowSpan}>
      <button
        type="button"
        className={compact ? `${styles.feature} ${styles.featureCompact}` : styles.feature}
        onClick={onClick}
      >
        <img src={image} alt="" className={styles.featureImage} />
        {badge ? <span className={styles.featureBadge}>{badge}</span> : null}
        <span className={styles.featureBody}>
          <span className={styles.featurePrice}>{price}</span>
          <span className={styles.featureTitle}>{title}</span>
          {meta ? <span className={styles.featureMeta}>{meta}</span> : null}
        </span>
      </button>
    </Item>
  )
}

function Stat({ value, label, tone = 'default' }: GlassBentoStatProps) {
  return (
    <Item>
      <div className={tone === 'accent' ? `${styles.cell} ${styles.cellAccent}` : styles.cell} data-bento-stat>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </Item>
  )
}

function Cell({ accent = false, children }: GlassBentoCellProps) {
  return (
    <Item>
      <div className={accent ? `${styles.cell} ${styles.cellAccent}` : styles.cell}>{children}</div>
    </Item>
  )
}

export function GlassBento({ children, columns = 4, className, ...rest }: GlassBentoProps) {
  return (
    <div
      className={[styles.bento, columns === 3 ? styles.cols3 : styles.cols4, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

GlassBento.Item = Item
GlassBento.Feature = Feature
GlassBento.Stat = Stat
GlassBento.Cell = Cell
