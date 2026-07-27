import type { HTMLAttributes } from 'react'
import styles from './GlassMetricStrip.module.css'

/** Bir metriğin yön anlamı — renk dışında ikon + sr-only metinle de iletilir. */
export type GlassMetricTrend = 'up' | 'down' | 'steady'

export interface GlassMetricStripItem {
  /** React key + benzersiz kimlik */
  id: string
  /** Metriğin adı (dt) */
  label: string
  /** Öne çıkan değer (dd içindeki güçlü metin) */
  value: string
  /** Değişim ifadesi, ör. "%12" veya "+3.400" */
  change?: string
  /** Değişimin yönü; yalnız `change` verildiğinde gösterilir */
  trend?: GlassMetricTrend
  /** Değerin altında küçük yardımcı açıklama */
  hint?: string
}

export interface GlassMetricStripProps extends Omit<HTMLAttributes<HTMLDListElement>, 'aria-label'> {
  /** Şeritte gösterilecek metrikler */
  items: GlassMetricStripItem[]
  /** Şeridin erişilebilir adı (liste `aria-label`'i) */
  label?: string
  /** Yoğunluk: `md` varsayılan, `sm` toolbar/dar bağlam */
  size?: 'md' | 'sm'
}

const TREND_META: Record<GlassMetricTrend, { glyph: string; sr: string }> = {
  up: { glyph: '↗', sr: 'Yükseliş' },
  down: { glyph: '↘', sr: 'Düşüş' },
  steady: { glyph: '→', sr: 'Yatay' },
}

/**
 * KPI/metrik şeridi — `dl/dt/dd` semantiğiyle bir dizi göstergeyi yan yana sunar.
 * Trend yönü asla yalnız renkle iletilmez: görünür ok glifi (`aria-hidden`) yanında
 * ekran okuyucular için sr-only bir yön metni ("Yükseliş:" vb.) taşınır.
 */
export function GlassMetricStrip({
  items,
  label = 'Temel göstergeler',
  size = 'md',
  className,
  ...rest
}: GlassMetricStripProps) {
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen aria-label ve className caller tarafından ezilemez
    <dl {...rest} aria-label={label} className={classes}>
      {items.map((item) => {
        const trend = item.change ? item.trend ?? 'steady' : undefined
        const meta = trend ? TREND_META[trend] : undefined
        return (
          <div key={item.id} className={styles.item}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              <strong className={styles.number}>{item.value}</strong>
              {item.change && meta ? (
                <span className={styles.change} data-trend={trend}>
                  <span className={styles.srOnly}>{meta.sr}: </span>
                  <span className={styles.glyph} aria-hidden>
                    {meta.glyph}
                  </span>{' '}
                  {item.change}
                </span>
              ) : null}
            </dd>
            {item.hint ? <dd className={styles.hint}>{item.hint}</dd> : null}
          </div>
        )
      })}
    </dl>
  )
}
