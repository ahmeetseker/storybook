import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassMetricStrip.module.css'

/** Bir metriğin yön anlamı — renk dışında ikon + sr-only metinle de iletilir. */
export type GlassMetricTrend = 'up' | 'down' | 'steady'

/** Metriğin semantik rengi; yalnız `variant="gradient"` içinde görünür. */
export type GlassMetricTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

/** Kartın sağ-altına yerleşen dekoratif şekil; yalnız `variant="gradient"` içinde çizilir. */
export type GlassMetricMotif = 'parcels' | 'seal' | 'pins' | 'star'

export interface GlassMetricStripAction {
  /** Bağlantının görünür metni, ör. "Portföyü gör" */
  label: string
  /** Hedef adres */
  href: string
}

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
  /** Degrade tonu; `variant="gradient"` dışında etkisizdir. Varsayılan `neutral` */
  tone?: GlassMetricTone
  /** Dekoratif şekil; `variant="gradient"` dışında etkisizdir. Verilmezse çizilmez */
  motif?: GlassMetricMotif
  /** Kartın alt bağlantısı; `variant="gradient"` dışında etkisizdir */
  action?: GlassMetricStripAction
}

export interface GlassMetricStripProps extends Omit<HTMLAttributes<HTMLDListElement>, 'aria-label'> {
  /** Şeritte gösterilecek metrikler */
  items: GlassMetricStripItem[]
  /** Şeridin erişilebilir adı (liste `aria-label`'i) */
  label?: string
  /** Yoğunluk: `md` varsayılan, `sm` toolbar/dar bağlam */
  size?: 'md' | 'sm'
  /**
   * Sunum ekseni. `plain` (varsayılan) düz metin şeridi — mevcut davranış.
   * `gradient` her metriği kendi tonunda degrade bir karta alır; `tone`,
   * `motif` ve `action` alanları yalnız bu değerde okunur.
   */
  variant?: 'plain' | 'gradient'
}

const TREND_META: Record<GlassMetricTrend, { glyph: string; sr: string }> = {
  up: { glyph: '↗', sr: 'Yükseliş' },
  down: { glyph: '↘', sr: 'Düşüş' },
  steady: { glyph: '→', sr: 'Yatay' },
}

/** Dekoratif motifler — tamamı `aria-hidden`; anlam taşımaz, `label` zaten metindedir. */
const MOTIF_SHAPES: Record<GlassMetricMotif, ReactNode> = {
  parcels: (
    <>
      <rect x="1.5" y="8.5" width="9.5" height="8" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3.5" width="9.5" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="12.5" width="9.5" height="8.5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  seal: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.2 2.2" />
      <path
        d="M8.8 12.2l2.4 2.4 4.2-4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  pins: (
    <>
      <path
        d="M9 21.5s5.6-5 5.6-8.8A5.6 5.6 0 1 0 3.4 12.7C3.4 16.5 9 21.5 9 21.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12.4" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M18 12.5s3.6-3.2 3.6-5.7a3.6 3.6 0 1 0-7.2 0c0 2.5 3.6 5.7 3.6 5.7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </>
  ),
  star: (
    <path
      d="M12 2.6l2.9 6.2 6.6.9-4.8 4.8 1.2 6.7L12 18.1l-5.9 3.1 1.2-6.7-4.8-4.8 6.6-.9z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.arrow} aria-hidden focusable="false">
    <path
      d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * KPI/metrik şeridi — `dl/dt/dd` semantiğiyle bir dizi göstergeyi yan yana sunar.
 * Trend yönü asla yalnız renkle iletilmez: görünür ok glifi (`aria-hidden`) yanında
 * ekran okuyucular için sr-only bir yön metni ("Yükseliş:" vb.) taşınır.
 *
 * `variant="gradient"` her metriği kendi semantik tonunda degrade bir karta alır ve
 * isteğe bağlı bir bağlantı ekler; bu değerde şerit etkileşimli hâle gelir.
 * Kart içerik katmanında kalır — cam yüzey değildir.
 */
export function GlassMetricStrip({
  items,
  label = 'Temel göstergeler',
  size = 'md',
  variant = 'plain',
  className,
  ...rest
}: GlassMetricStripProps) {
  const isGradient = variant === 'gradient'
  const classes = [styles.root, styles[size], isGradient && styles.gradient, className]
    .filter(Boolean)
    .join(' ')

  return (
    // rest önce yayılır; yönetilen aria-label ve className caller tarafından ezilemez
    <dl {...rest} aria-label={label} className={classes}>
      <div className={styles.grid}>
        {items.map((item) => {
          const trend = item.change ? item.trend ?? 'steady' : undefined
          const meta = trend ? TREND_META[trend] : undefined
          const action = isGradient ? item.action : undefined
          return (
            <div key={item.id} className={styles.item} data-tone={isGradient ? item.tone ?? 'neutral' : undefined}>
              {isGradient && item.motif ? (
                <svg viewBox="0 0 24 24" className={styles.motif} aria-hidden focusable="false">
                  {MOTIF_SHAPES[item.motif]}
                </svg>
              ) : null}
              <dt className={styles.label}>
                {isGradient ? <span className={styles.dot} aria-hidden /> : null}
                {item.label}
              </dt>
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
              {action ? (
                <dd className={styles.actionCell}>
                  {/* Görünür metin erişilebilir adın içinde kalır (WCAG 2.5.3) */}
                  <a className={styles.action} href={action.href} aria-label={`${item.label}: ${action.label}`}>
                    {action.label}
                    <ArrowIcon />
                  </a>
                </dd>
              ) : null}
            </div>
          )
        })}
      </div>
    </dl>
  )
}
