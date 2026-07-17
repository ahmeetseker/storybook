import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import styles from './GlassRating.module.css'

/** Tek bir 5 kollu yıldız SVG yolu (24×24 viewBox, Material yıldız geometrisi). */
const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

const STAR_INDEXES = [0, 1, 2, 3, 4] as const

function clamp(n: number, min: number, max: number): number {
  const safe = Number.isFinite(n) ? n : 0
  return Math.min(Math.max(safe, min), max)
}

/** "4.6" → "4,6"; tam sayıda ondalık atılır ("5" → "5"). */
function formatDecimal(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',')
}

/** Binlik ayraçlı adet metni ("1284" → "1.284"). */
function formatCount(n: number): string {
  return Math.round(clamp(n, 0, Number.MAX_SAFE_INTEGER)).toLocaleString('tr-TR')
}

/**
 * `input` varyantı için değeri normalize eder: sonlu olmayan (`NaN`/`Infinity`)
 * değerler önce 0'a düşer, sonra en yakın tamsayıya yuvarlanıp [0,5]'e clamp
 * edilir. `display`/`summary`'nin aksine burada yarım yıldık korunmaz — giriş
 * yalnız 1-5 tamsayı radio'larla eşleşebilir (rules.md §12 "yarım yıldız
 * seçtirme" yasağı).
 */
function normalizeInputValue(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0
  return clamp(Math.round(value), 0, 5)
}

/** value'yu (0-5) en yakın yarım yıldıza yuvarlayıp her yıldız için dolum oranını (0 | 0.5 | 1) üretir. */
function starFractions(value: number): number[] {
  const clamped = clamp(value, 0, 5)
  const rounded = Math.round(clamped * 2) / 2
  return STAR_INDEXES.map((i) => {
    const diff = rounded - i
    if (diff >= 1) return 1
    if (diff >= 0.5) return 0.5
    return 0
  })
}

/** Dolu/yarım/boş tek yıldız glifi — dekoratif, her zaman aria-hidden. */
function StarGlyph({ fraction, className }: { fraction: number; className?: string }) {
  return (
    <span className={[styles.starCell, className].filter(Boolean).join(' ')} aria-hidden>
      <svg viewBox="0 0 24 24" className={styles.starTrack} focusable="false">
        <path d={STAR_PATH} />
      </svg>
      {fraction > 0 ? (
        <svg
          viewBox="0 0 24 24"
          className={styles.starFill}
          focusable="false"
          style={fraction < 1 ? { clipPath: `inset(0 ${(1 - fraction) * 100}% 0 0)` } : undefined}
        >
          <path d={STAR_PATH} />
        </svg>
      ) : null}
    </span>
  )
}

// `children` rules.md §2'ye göre kabul edilmez (tamamen prop güdümlü) — HTMLAttributes'tan çıkarılır,
// yoksa TS bir çağıranın `children` geçmesine izin verir ve runtime'da mevcut içeriğin yanına render edilir.
interface GlassRatingBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

export interface GlassRatingDisplayProps extends Omit<GlassRatingBaseProps, 'aria-label'> {
  /** Salt-okunur özet gösterim (varsayılan). */
  variant?: 'display'
  /** 0-5 arası puan; aralık dışı değerler sessizce clamp edilir. */
  value: number
  /** Değerlendirme adedi — verilirse "4,6 · 128 değerlendirme" metni görünür. */
  count?: number
}

export interface GlassRatingInputProps extends Omit<GlassRatingBaseProps, 'aria-label' | 'onChange'> {
  /** Etkileşimli 5 yıldızlı radiogroup girişi. */
  variant: 'input'
  /** Controlled seçili puan (1-5); 0/undefined → hiç seçim yok. */
  value?: number
  /** Uncontrolled başlangıç puanı. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /**
   * radiogroup aria-label kaynağı — görünür bağlam yoksa mutlaka ver.
   * Verilmezse radiogroup isimsiz kalmasın diye varsayılan `'Puan'` kullanılır.
   */
  label?: string
  disabled?: boolean
}

export interface GlassRatingSummaryProps extends Omit<GlassRatingBaseProps, 'aria-label'> {
  /** Ortalama puan + 5 satırlık dağılım özeti. */
  variant: 'summary'
  /** Ortalama puan (0-5). */
  value: number
  /**
   * 5 elemanlı adet dizisi, 5 yıldızdan 1 yıldıza sırayla:
   * `[5 yıldız adedi, 4 yıldız adedi, 3 yıldız adedi, 2 yıldız adedi, 1 yıldız adedi]`.
   * Toplam değerlendirme adedi bu diziden hesaplanır.
   */
  distribution: number[]
}

export type GlassRatingProps = GlassRatingDisplayProps | GlassRatingInputProps | GlassRatingSummaryProps

function DisplayRating({ value, count, className, ...rest }: Omit<GlassRatingDisplayProps, 'variant'>) {
  const clamped = clamp(value, 0, 5)
  const fractions = starFractions(clamped)
  const hasCount = count !== undefined && count !== null
  const ariaLabel = hasCount
    ? `5 üzerinden ${formatDecimal(clamped)} yıldız, ${formatCount(count as number)} değerlendirme`
    : `5 üzerinden ${formatDecimal(clamped)} yıldız`

  return (
    <div
      {...rest}
      role="img"
      aria-label={ariaLabel}
      className={[styles.root, styles.display, className].filter(Boolean).join(' ')}
    >
      <span className={styles.stars} aria-hidden>
        {fractions.map((fraction, i) => (
          <StarGlyph key={i} fraction={fraction} />
        ))}
      </span>
      {hasCount ? (
        <span className={styles.text} aria-hidden>
          {formatDecimal(clamped)} · {formatCount(count as number)} değerlendirme
        </span>
      ) : null}
    </div>
  )
}

function InputRating({
  value,
  defaultValue,
  onValueChange,
  label,
  disabled = false,
  className,
  ...rest
}: Omit<GlassRatingInputProps, 'variant'>) {
  const baseId = useId()
  // defaultValue/value NaN, ondalık veya [0,5] dışı olabilir (ör. 2.5, 6, Infinity) —
  // normalize edilmezse hiçbir radio (1-5 tamsayı) eşleşmez ve tüm seçenekler
  // tabIndex=-1 kalır. Yalnız `input`'ta normalize edilir; display/summary'de
  // yarım yıldız görsel doluluğu korunur.
  const [inner, setInner] = useState(() => normalizeInputValue(defaultValue))
  const currentValue = value !== undefined ? normalizeInputValue(value) : inner

  // Ok tuşuyla istenen odak hedefi yalnız GERÇEKTEN committed olduğunda (currentValue
  // o değere ulaştığında) uygulanır — bkz. aşağıdaki effect. Controlled modda parent
  // güncellemeyi reddederse currentValue hiç değişmez, pending eşleşmez, odak DOM'da
  // hiç taşınmadığı için önceki (tabIndex=0 kalan) öğede sabit kalır.
  const pendingFocusRef = useRef<number | null>(null)

  const select = (next: number) => {
    if (disabled) return
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  // Seçim yokken roving hedefi (odaklanabilir/DOM'da tabIndex=0 olan) her zaman
  // 1. yıldız — ok tuşu hesaplamasının referans noktası da bu olmalı, yoksa
  // "seçim yok" durumu -1 sentinel'e düşer ve ArrowLeft/ArrowUp yanlış sarar.
  // currentValue her zaman normalize edildiğinden (yukarıda) rovingTarget de
  // her zaman 1-5 arası bir radio'ya karşılık gelir.
  const rovingTarget = currentValue > 0 ? currentValue : 1

  useEffect(() => {
    const pending = pendingFocusRef.current
    if (pending === null) return
    pendingFocusRef.current = null
    if (pending === currentValue) {
      document.getElementById(`${baseId}-star-${pending}`)?.focus()
    }
  }, [currentValue, baseId])

  // Radiogroup deseni (GlassSegmentedControl ile birebir): roving tabindex,
  // seçim yoksa (0) ilk yıldız odak hedefi olur; ok tuşları sarar.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const stars = [1, 2, 3, 4, 5]
    const currentIndex = stars.indexOf(rovingTarget)
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1 + stars.length) % stars.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + stars.length) % stars.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = stars.length - 1
    if (nextIndex === -1) return
    e.preventDefault()
    const next = stars[nextIndex]
    // Odak taşımayı burada (kullanıcı etkileşimi anında) TALEP ediyoruz; gerçek
    // .focus() çağrısı yalnız currentValue bu hedefe ulaştığında (yukarıdaki
    // effect) yapılır — böylece controlled reddinde odak asla tabIndex=-1
    // öğeye taşınmaz.
    pendingFocusRef.current = next
    select(next)
  }

  return (
    <div
      {...rest}
      className={[styles.root, styles.input, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}
    >
      <div role="radiogroup" aria-label={label ?? 'Puan'} className={styles.stars} onKeyDown={onKeyDown}>
        {[1, 2, 3, 4, 5].map((star) => {
          const selected = star === currentValue
          return (
            <button
              key={star}
              type="button"
              role="radio"
              id={`${baseId}-star-${star}`}
              aria-checked={selected}
              aria-label={`${star} yıldız`}
              tabIndex={star === rovingTarget && !disabled ? 0 : -1}
              disabled={disabled}
              className={styles.starButton}
              onClick={() => select(star)}
            >
              <StarGlyph fraction={star <= currentValue ? 1 : 0} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SummaryRating({ value, distribution, className, ...rest }: Omit<GlassRatingSummaryProps, 'variant'>) {
  const clamped = clamp(value, 0, 5)
  const fractions = starFractions(clamped)
  const safeDistribution = STAR_INDEXES.map((i) => Math.max(0, Math.round(distribution[i] ?? 0)))
  const total = safeDistribution.reduce((sum, n) => sum + n, 0)

  return (
    <div {...rest} className={[styles.root, styles.summary, className].filter(Boolean).join(' ')}>
      <div className={styles.summaryHead}>
        <span className={styles.avgValue}>{formatDecimal(clamped)}</span>
        <span className={styles.summaryMeta}>
          <span className={styles.stars} aria-hidden>
            {fractions.map((fraction, i) => (
              <StarGlyph key={i} fraction={fraction} />
            ))}
          </span>
          <span className={styles.totalText}>{formatCount(total)} değerlendirme</span>
        </span>
      </div>
      <dl className={styles.distribution}>
        {[5, 4, 3, 2, 1].map((star, i) => {
          const n = safeDistribution[i]
          const pct = total > 0 ? (n / total) * 100 : 0
          return (
            <div key={star} className={styles.distRow}>
              <dt className={styles.distLabel}>{star} yıldız</dt>
              <dd className={styles.distValue}>
                <span className={styles.distBarTrack} aria-hidden>
                  <span className={styles.distBarFill} style={{ width: `${pct}%` }} />
                </span>
                <span className={styles.distCount}>{formatCount(n)}</span>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

/**
 * Yıldız puan gösterimi — üç bağımsız kullanım biçimi tek component altında:
 * salt-okunur özet (`display`), etkileşimli radiogroup girişi (`input`) ve
 * ortalama + dağılım özeti (`summary`). İçerik katmanı: cam/backdrop-filter
 * kullanılmaz, düz yüzey + token'lar.
 */
export function GlassRating(props: GlassRatingProps) {
  if (props.variant === 'input') {
    const { variant: _variant, ...rest } = props
    return <InputRating {...rest} />
  }
  if (props.variant === 'summary') {
    const { variant: _variant, ...rest } = props
    return <SummaryRating {...rest} />
  }
  const { variant: _variant, ...rest } = props
  return <DisplayRating {...rest} />
}
