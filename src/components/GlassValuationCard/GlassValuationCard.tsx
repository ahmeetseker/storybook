import { useState } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassValuationCard.module.css'

export type GlassValuationFeedback = 'up' | 'down'

export interface GlassValuationCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** Yapay zekâ tahmini (TL) — sonlu ve pozitif olmalı, aksi halde kart boş duruma düşer */
  estimate: number
  /** Aralığın alt sınırı (TL) — `rangeHigh`'tan büyükse ikisi otomatik takas edilir */
  rangeLow: number
  /** Aralığın üst sınırı (TL) — `rangeLow`'dan küçükse ikisi otomatik takas edilir */
  rangeHigh: number
  /** İlanın listelendiği fiyat (TL); verilirse tahminle gerçek yüzde farkı gösterilir */
  listPrice?: number
  /** Model güven skoru (0-100); sonlu değilse veya verilmezse rozet yanında gösterilmez */
  confidence?: number
  /** Tahminin tarihi/bağlamı — olduğu gibi gösterilir (ör. "16 Temmuz 2026 itibarıyla") */
  asOf?: string
  /** Kullanıcı geri bildirimi — verilirse 👍/👎 butonları render edilir */
  onFeedback?: (value: GlassValuationFeedback) => void
  /** Yükleme durumu — gerçek içerik yerine soluk placeholder gösterilir */
  loading?: boolean
  /** `panel`: tam kart (varsayılan) · `inline`: tek satır özet (rozet + tahmin + aralık) */
  variant?: 'panel' | 'inline'
}

function isFiniteNonNegative(n: number): boolean {
  return Number.isFinite(n) && n >= 0
}

function clampNum(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Ham TL tutarını tr-TR binlik ayraçlı tamsayıya yuvarlar: 4850000 → "4.850.000 TL". */
function formatTL(n: number): string {
  return `${Math.round(n).toLocaleString('tr-TR')} TL`
}

type Comparison = { pct: number; direction: 'ustunde' | 'altinda' | 'esit' }

/** Liste fiyatının tahmine göre gerçek yüzde farkını hesaplar; estimate <= 0 ise çağrılmaz. */
function resolveComparison(estimate: number, listPrice: number): Comparison {
  const diff = listPrice - estimate
  const pct = Math.round(Math.abs((diff / estimate) * 100))
  if (pct === 0) return { pct: 0, direction: 'esit' }
  return { pct, direction: diff > 0 ? 'ustunde' : 'altinda' }
}

/** [0,100] dışı ve sonlu olmayan (`NaN`/`Infinity`) değerleri gizlemek için `null` döner. */
function normalizeConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/**
 * AI-first rozet — dalga1 kontratındaki tanıma birebir: metin "✦ AI",
 * `aria-label="Yapay zekâ üretimi"`, zemin/metin color-mix türevi, radius
 * capsule, 10.5px/700. Bu görünüm her AI component'inde AYNI olmalı (kopya
 * CSS kabul — bkz. GlassTrustSignalPanel.AiBadge).
 */
function AiBadge({ confidence }: { confidence?: number }) {
  const pct = normalizeConfidence(confidence)
  return (
    <span className={styles.aiMeta}>
      <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
        ✦ AI
      </span>
      {pct !== null ? <span className={styles.confidence}>%{pct} güven</span> : null}
    </span>
  )
}

function FeedbackButtons({ onFeedback }: { onFeedback: (value: GlassValuationFeedback) => void }) {
  const [selected, setSelected] = useState<GlassValuationFeedback | null>(null)

  const handle = (value: GlassValuationFeedback) => {
    setSelected(value)
    onFeedback(value)
  }

  return (
    <div className={styles.feedback} role="group" aria-label="Bu değerleme faydalı mıydı?">
      <button
        type="button"
        className={styles.feedbackButton}
        aria-label="Faydalı"
        aria-pressed={selected === 'up'}
        onClick={() => handle('up')}
      >
        <span aria-hidden>👍</span>
      </button>
      <button
        type="button"
        className={styles.feedbackButton}
        aria-label="Faydalı değil"
        aria-pressed={selected === 'down'}
        onClick={() => handle('down')}
      >
        <span aria-hidden>👎</span>
      </button>
    </div>
  )
}

function InlinePlaceholder() {
  return <span className={[styles.placeholder, styles.inlinePlaceholder].join(' ')} aria-hidden />
}

function PanelPlaceholder() {
  return (
    <div className={styles.panelPlaceholder} aria-hidden>
      <span className={[styles.placeholder, styles.placeholderValue].join(' ')} />
      <span className={[styles.placeholder, styles.placeholderTrack].join(' ')} />
      <span className={[styles.placeholder, styles.placeholderLine].join(' ')} />
    </div>
  )
}

/**
 * Yapay zekâ destekli emlak değerleme (AVM) kartı — tahmin + min–max aralık
 * barı, opsiyonel liste fiyatı karşılaştırması, güven etiketi ve kullanıcı
 * geri bildirimi. İçerik katmanı: cam/backdrop-filter kullanılmaz, düz yüzey
 * + token'lar. Kart daima yapay zekâ üretimi olduğundan `✦ AI` rozeti her
 * state'te (yükleme/boş dahil) sabit görünür.
 */
export function GlassValuationCard({
  estimate,
  rangeLow,
  rangeHigh,
  listPrice,
  confidence,
  asOf,
  onFeedback,
  loading = false,
  variant = 'panel',
  className,
  ...rest
}: GlassValuationCardProps) {
  const validEstimate = Number.isFinite(estimate) && estimate > 0
  const validLow = isFiniteNonNegative(rangeLow)
  const validHigh = isFiniteNonNegative(rangeHigh)
  const isEmpty = !validEstimate || !validLow || !validHigh

  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  if (loading) {
    return (
      <div {...rest} role="group" aria-label="AI değerleme" aria-busy="true" className={classes}>
        <div className={styles.header}>
          <AiBadge />
        </div>
        <span className={styles.srOnly}>Değerleme yükleniyor</span>
        {variant === 'inline' ? <InlinePlaceholder /> : <PanelPlaceholder />}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div {...rest} role="group" aria-label="AI değerleme" className={classes}>
        <div className={styles.header}>
          <AiBadge />
        </div>
        <p className={styles.emptyText}>Değerleme yok</p>
      </div>
    )
  }

  // rangeLow > rangeHigh verilirse sessizce takas edilir — hatalı sıralı
  // veri de yine tutarlı bir min–max ray üretsin diye.
  const low = Math.min(rangeLow, rangeHigh)
  const high = Math.max(rangeLow, rangeHigh)
  const span = high - low

  // Konum yüzdesi: değer aralığın dışında kalsa da (klavuz doğruluğu için)
  // ray üzerinde 0-100 aralığına clamp edilerek gösterilir; gerçek sayı metni
  // hiçbir zaman kırpılmaz.
  const posPercent = span > 0 ? ((clampNum(estimate, low, high) - low) / span) * 100 : 50

  const validList = listPrice !== undefined && Number.isFinite(listPrice) && listPrice > 0
  const listPosPercent = validList ? (span > 0 ? ((clampNum(listPrice as number, low, high) - low) / span) * 100 : 50) : null
  const comparison = validList ? resolveComparison(estimate, listPrice as number) : null

  if (variant === 'inline') {
    return (
      <div {...rest} role="group" aria-label="AI değerleme" className={classes}>
        <AiBadge />
        <span className={styles.inlineText}>
          {formatTL(estimate)}{' '}
          <span className={styles.inlineRange}>
            ({formatTL(low)}–{formatTL(high)})
          </span>
        </span>
      </div>
    )
  }

  return (
    <div {...rest} role="group" aria-label="AI değerleme" className={classes}>
      <div className={styles.header}>
        <AiBadge confidence={confidence} />
        {onFeedback ? <FeedbackButtons onFeedback={onFeedback} /> : null}
      </div>

      <p className={styles.estimateValue}>{formatTL(estimate)}</p>

      <div className={styles.rangeWrap}>
        <div className={styles.rangeTrack} aria-hidden>
          {validList && listPosPercent !== null ? (
            <span className={styles.listPoint} style={{ left: `${listPosPercent}%` }} />
          ) : null}
          <span className={styles.estimatePoint} style={{ left: `${posPercent}%` }} />
        </div>
        <div className={styles.rangeLabels}>
          <span>{formatTL(low)}</span>
          <span>{formatTL(high)}</span>
        </div>
      </div>

      {validList ? (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={[styles.legendDot, styles.legendDotEstimate].join(' ')} aria-hidden />
            Tahmin
          </span>
          <span className={styles.legendItem}>
            <span className={[styles.legendDot, styles.legendDotList].join(' ')} aria-hidden />
            Liste fiyatı
          </span>
        </div>
      ) : null}

      {comparison ? (
        <p className={styles.comparison}>
          {comparison.direction === 'esit' ? (
            <>Liste fiyatı tahmine <strong>eşit</strong>.</>
          ) : (
            <>
              Liste fiyatı tahminin <strong>%{comparison.pct}</strong>{' '}
              {comparison.direction === 'ustunde' ? 'üstünde' : 'altında'}.
            </>
          )}
        </p>
      ) : null}

      {asOf ? <p className={styles.asOf}>{asOf}</p> : null}
    </div>
  )
}
