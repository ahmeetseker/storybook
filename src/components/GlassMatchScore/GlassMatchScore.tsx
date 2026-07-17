// GlassMatchScore — kişisel uyum skoru ("senin kriterlerine göre").
// AI-first component: içerik katmanı FLAT (cam yok). Kendi mini SVG halkasını
// çizer (GlassScoreMeter'dan bilinçli olarak İTHAL EDİLMEZ — bkz. rules.md §1).
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import styles from './GlassMatchScore.module.css'

/** Tek bir kriterin eşleşme durumu (ör. "3+1", "Otoparklı"). */
export interface GlassMatchScoreCriterion {
  /** Kriter adı — kısa tutulmalı, chip tek satırda kalır */
  label: string
  /** true → ✓ (success ton), false → ✕ (soluk/nötr) */
  matched: boolean
}

/** Halka ve değer metninin rengini belirleyen eşik tonu. */
export type GlassMatchScoreTone = 'success' | 'accent' | 'danger'

export interface GlassMatchScoreProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 0-100 arası uyum skoru; aralık dışı/`NaN`/`Infinity` değerler sessizce normalize edilir */
  value: number
  /** Kart başlığı — accessible name kaynağı (`aria-labelledby`) */
  title?: string
  /** Eşleşen (✓) / eşleşmeyen (✕) kriter chip'leri — yalnız `variant="card"`'da render edilir */
  criteria?: GlassMatchScoreCriterion[]
  /** Skorun kısa gerekçesi — yalnız `variant="card"`'da görünür, `aria-describedby` ile bağlanır */
  explanation?: string
  /**
   * AI-first standardı: verilirse "✦ AI" rozetinin yanında "%N güven" metni
   * görünür etiket olarak eklenir. 0-100 dışına clamp edilir; sonlu değilse
   * (`NaN`/`Infinity`) hiç render edilmez (rozet yine görünür kalır).
   */
  confidence?: number
  /**
   * Verilirse skor kartının altında 👍/👎 geri bildirim butonları görünür
   * (accessible name "Faydalı"/"Faydalı değil"). Tıklanan yön görsel olarak
   * seçili işaretlenir (`aria-pressed`) — component kendi geri bildirimini
   * sunucuya göndermez, yalnız çağıranı bilgilendirir.
   */
  onFeedback?: (value: 'up' | 'down') => void
  /**
   * true olduğunda halka + metin yerine soluk, animasyonsuz-kapatılabilir bir
   * placeholder gösterilir (kendi flat skeleton'u — `GlassSkeleton`'a
   * bağımlı değil). `aria-live="polite"` durum metni ekranokuyucuya iletilir.
   */
  loading?: boolean
  /**
   * `card`: halka + başlık + rozet + açıklama + kriter chip'leri + geri
   * bildirim — tam kart.
   * `compact`: yalnız halka + başlık + rozet, tek satır — ilan kartlarına
   * gömülür (açıklama/kriter/geri bildirim render edilmez, alan yok).
   */
  variant?: 'card' | 'compact'
}

function clampScore(value: number): number {
  const safe = Number.isFinite(value) ? value : 0
  return Math.round(Math.min(Math.max(safe, 0), 100))
}

function resolveTone(value: number): GlassMatchScoreTone {
  if (value >= 70) return 'success'
  if (value >= 40) return 'accent'
  return 'danger'
}

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (rozet metni gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

const TONE_VAR: Record<GlassMatchScoreTone, string> = {
  success: 'var(--lg-success)',
  accent: 'var(--lg-accent)',
  danger: 'var(--lg-danger)',
}

const RING_DIMS = {
  card: { box: 72, r: 30, sw: 6 },
  compact: { box: 40, r: 16, sw: 4 },
} as const

/** Kendi çizilen dolum halkası — merkezde tabular sayı, dekoratif (aria-hidden). */
function MatchRing({ value, tone, size }: { value: number; tone: GlassMatchScoreTone; size: 'card' | 'compact' }) {
  const { box, r, sw } = RING_DIMS[size]
  const circumference = 2 * Math.PI * r
  const c = box / 2

  return (
    <span className={styles.ringBox} data-size={size} aria-hidden="true">
      <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} className={styles.ringSvg}>
        <circle className={styles.ringTrack} cx={c} cy={c} r={r} strokeWidth={sw} />
        <circle
          className={styles.ringFill}
          cx={c}
          cy={c}
          r={r}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          style={{ stroke: TONE_VAR[tone] }}
        />
      </svg>
      <span className={styles.ringValue} data-size={size}>
        {value}
      </span>
    </span>
  )
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümüne
 * göre tüm AI component'lerinde AYNI görünmeli (kopya CSS kabul, ortak
 * component'e çıkarılmaz — component'ler birbirinden bağımsız kalır).
 */
function AiBadge({ confidence }: { confidence: number | null }) {
  return (
    <span className={styles.aiRow}>
      <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
        ✦ AI
      </span>
      {confidence !== null ? <span className={styles.confidence}>%{confidence} güven</span> : null}
    </span>
  )
}

function LoadingPlaceholder({ variant, title }: { variant: 'card' | 'compact'; title: string }) {
  const size = variant === 'card' ? 'card' : 'compact'
  return (
    <div className={styles.header}>
      <span className={[styles.ringBox, styles.skeletonRing].join(' ')} data-size={size} aria-hidden="true" />
      <div className={styles.meta}>
        <div className={styles.titleRow}>
          <span className={[styles.skeletonLine, styles.skeletonTitle].join(' ')} aria-hidden="true" />
          {/* AI-first standardı: rozet loading sırasında da zorunlu — veri
              henüz yokken bile içeriğin AI kaynaklı olacağı önceden bildirilir. */}
          <AiBadge confidence={null} />
        </div>
        {variant === 'card' ? <span className={[styles.skeletonLine, styles.skeletonBody].join(' ')} aria-hidden="true" /> : null}
      </div>
      {/* Görsel içerik tamamen aria-hidden — tek duyuru noktası bu canlı bölge */}
      <span className={styles.srOnly} role="status">
        {title} hesaplanıyor
      </span>
    </div>
  )
}

/**
 * Kişisel uyum skoru — "senin kriterlerine göre" hesaplanan bir yapay zekâ
 * çıktısı. Skoru halka + tabular sayı olarak çizer, başlık ve zorunlu "✦ AI"
 * rozetiyle birlikte sunar; opsiyonel olarak kısa gerekçe, eşleşen/eşleşmeyen
 * kriter chip'leri ve 👍/👎 geri bildirim alır. İçerik katmanı FLAT — cam
 * yüzey/backdrop-filter kullanılmaz.
 */
export function GlassMatchScore({
  value,
  title = 'Sana Uygunluk',
  criteria,
  explanation,
  confidence,
  onFeedback,
  loading = false,
  variant = 'card',
  className,
  ...rest
}: GlassMatchScoreProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const descId = `${uid}-desc`

  const [feedback, setFeedback] = useState<'up' | 'down' | undefined>(undefined)

  const clamped = clampScore(value)
  const tone = resolveTone(clamped)
  const resolvedConfidence = resolveConfidence(confidence)

  // İçerik imzası: `value`/`criteria` GERÇEKTEN değiştiğinde (ör. kullanıcı
  // farklı bir ilana geçti) önceki geri bildirim seçimi anlamsız kalır —
  // render sırasında karşılaştırıp sıfırlıyoruz (GlassAiSummaryCard'daki
  // tekil `selected` state'inin aksine burada içerik ilan bazında değiştiği
  // için ekstra bir effect turu yerine "render sırasında state ayarlama"
  // deseni kullanılır — bkz. React docs "Adjusting state when a prop
  // changes"). Bir sonraki render'a taşınmaz, ekstra boyama olmaz.
  const contentSignature = JSON.stringify({
    value: clamped,
    criteria: criteria?.map((c) => [c.label, c.matched]) ?? null,
  })
  const prevContentSignatureRef = useRef(contentSignature)
  if (prevContentSignatureRef.current !== contentSignature) {
    prevContentSignatureRef.current = contentSignature
    if (feedback !== undefined) {
      setFeedback(undefined)
    }
  }

  const isCard = variant === 'card'
  const showExplanation = isCard && !loading && Boolean(explanation)
  const showCriteria = isCard && !loading && Boolean(criteria && criteria.length > 0)
  const showFeedback = isCard && !loading && Boolean(onFeedback)

  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  const handleFeedback = (direction: 'up' | 'down') => {
    // Aynı yöne tekrar tıklama seçimi geri alır (toggle); farklı yöne tıklama
    // karşılıklı dışlayarak seçimi değiştirir. `onFeedback` her tıklamada —
    // toggle-off dahil — tıklanan yönle çağrılır; component kendi "gönderildi"
    // durumunu sunucuya iletmez, yalnız görsel seçili durumu tutar.
    setFeedback((prev) => (prev === direction ? undefined : direction))
    onFeedback?.(direction)
  }

  if (loading) {
    return (
      <div className={classes} data-variant={variant} data-loading="true" {...rest}>
        <LoadingPlaceholder variant={variant} title={title} />
      </div>
    )
  }

  return (
    <div className={classes} data-variant={variant} {...rest}>
      <div className={styles.header}>
        <div
          role="meter"
          aria-labelledby={titleId}
          aria-describedby={showExplanation ? descId : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clamped}
          data-tone={tone}
          className={styles.meter}
        >
          <MatchRing value={clamped} tone={tone} size={isCard ? 'card' : 'compact'} />
        </div>
        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <span id={titleId} className={styles.title}>
              {title}
            </span>
            <AiBadge confidence={resolvedConfidence} />
          </div>
          {showExplanation ? (
            <p id={descId} className={styles.explanation}>
              {explanation}
            </p>
          ) : null}
        </div>
      </div>

      {showCriteria ? (
        <ul className={styles.criteria}>
          {criteria!.map((criterion, i) => (
            <li key={`${i}-${criterion.label}`} className={styles.criterion} data-matched={criterion.matched}>
              <span className={styles.criterionIcon} aria-hidden="true">
                {criterion.matched ? '✓' : '✕'}
              </span>
              <span className={styles.criterionLabel}>
                {criterion.label}
                {/* İkon dekoratif (aria-hidden); eşleşme durumu AT'ye bu
                    görsel-gizli metinle iletilir. */}
                <span className={styles.srOnly}> {criterion.matched ? '(eşleşti)' : '(eşleşmedi)'}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {showFeedback ? (
        <div className={styles.feedback}>
          <span className={styles.feedbackPrompt}>Bu değerlendirme faydalı mıydı?</span>
          <div className={styles.feedbackButtons}>
            <button
              type="button"
              className={styles.feedbackButton}
              aria-label="Faydalı"
              aria-pressed={feedback === 'up'}
              data-selected={feedback === 'up' || undefined}
              onClick={() => handleFeedback('up')}
            >
              👍
            </button>
            <button
              type="button"
              className={styles.feedbackButton}
              aria-label="Faydalı değil"
              aria-pressed={feedback === 'down'}
              data-selected={feedback === 'down' || undefined}
              onClick={() => handleFeedback('down')}
            >
              👎
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
