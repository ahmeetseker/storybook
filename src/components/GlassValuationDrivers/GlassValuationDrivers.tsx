// GlassValuationDrivers — AI değerleme sürücüleri (ValuationCard'ın derin ekranı).
// AI-first component: içerik katmanı FLAT (cam/backdrop-filter yok). Tornado
// benzeri yatay bar listesi — merkez çizgiden sağa pozitif (success), sola
// negatif (danger) etki. Kendi mini SVG'siz, saf DOM/CSS ile çizilir (yeni
// bağımlılık yasağı — bkz. dalga1-kontrat.md).
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import styles from './GlassValuationDrivers.module.css'

/** Değerlemeyi etkileyen tek bir faktör (ör. "Deniz manzarası"). */
export interface GlassValuationDriver {
  /** Kararlı kimlik — React key ve içerik imzası (feedback sıfırlama) için kullanılır, DOM id'sine yazılmaz */
  id: string
  /** Faktör adı (ör. "Deniz manzarası") */
  label: string
  /** İşaretli etki büyüklüğü (± TL veya ±%) — yalnız bar genişliğini normalize etmek için kullanılır, görünen metin DEĞİL */
  impact: number
  /** Görünen etki metni, çağırandan hazır gelir (ör. "+320.000 TL", "-150.000 TL") */
  impactText: string
  /** Faktörün kısa gerekçesi */
  note?: string
}

type GlassValuationDriverTone = 'success' | 'danger' | 'neutral'

export interface GlassValuationDriversProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Değerlemeyi etkileyen faktörler — bar genişliği aralarındaki max |impact|'e normalize edilir */
  drivers: GlassValuationDriver[]
  /** Kıyas referansı (ör. "Bölge medyanı: 5,1M") — başlığın altında görünür not */
  baseText?: string
  /** Kart başlığı — accessible name kaynağı (`aria-labelledby`) */
  title?: string
  /**
   * AI-first standardı: verilirse "✦ AI" rozetinin yanında "%N güven" metni
   * görünür etiket olarak eklenir. 0-100 dışına clamp edilir; sonlu değilse
   * (`NaN`/`Infinity`) hiç render edilmez (rozet yine görünür kalır).
   */
  confidence?: number
  /**
   * Verilirse listenin altında 👍/👎 geri bildirim butonları görünür
   * (accessible name "Faydalı"/"Faydalı değil"). Tıklanan yön görsel olarak
   * seçili işaretlenir (`aria-pressed`) — component kendi geri bildirimini
   * sunucuya göndermez, yalnız çağıranı bilgilendirir.
   */
  onFeedback?: (value: 'up' | 'down') => void
  /**
   * true olduğunda bar listesi yerine soluk, animasyonsuz-kapatılabilir bir
   * placeholder gösterilir (kendi flat skeleton'u — `GlassSkeleton`'a
   * bağımlı değil). `role="status"` durum metni ekranokuyucuya iletilir.
   */
  loading?: boolean
}

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (rozet metni gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/** Sonlu olmayan `impact` değerleri (NaN/Infinity) 0'a düşer — "etkisiz" kabul edilir. */
function safeImpact(impact: number): number {
  return Number.isFinite(impact) ? impact : 0
}

function resolveTone(impact: number): GlassValuationDriverTone {
  const safe = safeImpact(impact)
  if (safe > 0) return 'success'
  if (safe < 0) return 'danger'
  return 'neutral'
}

const DIRECTION_WORD: Record<GlassValuationDriverTone, string> = {
  success: 'artırıyor',
  danger: 'azaltıyor',
  neutral: 'etkilemiyor',
}

/** Listedeki en büyük |impact| — bar genişliği bu değere normalize edilir. 0/negatif guard: minimum 1. */
function resolveMaxAbsImpact(drivers: GlassValuationDriver[]): number {
  const max = drivers.reduce((acc, d) => {
    const abs = Math.abs(safeImpact(d.impact))
    return abs > acc ? abs : acc
  }, 0)
  return max > 0 ? max : 1
}

/** Bar genişliği yüzdesi — |impact| / maxAbsImpact, [0,100]'e clamp. */
function barWidthPercent(impact: number, maxAbsImpact: number): number {
  const safe = Math.abs(safeImpact(impact))
  return Math.min(100, (safe / maxAbsImpact) * 100)
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümüne
 * göre tüm AI component'lerinde AYNI görünmeli (kopya CSS kabul, ortak
 * component'e çıkarılmaz — bkz. GlassMatchScore/GlassChatDock).
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

function DriverRow({ driver, maxAbsImpact }: { driver: GlassValuationDriver; maxAbsImpact: number }) {
  const tone = resolveTone(driver.impact)
  const width = barWidthPercent(driver.impact, maxAbsImpact)
  const negativeWidth = tone === 'danger' ? width : 0
  const positiveWidth = tone === 'success' ? width : 0

  return (
    <li className={styles.row}>
      <span className={styles.label}>{driver.label}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.half} data-side="negative">
          <span className={styles.bar} data-tone="danger" style={{ width: `${negativeWidth}%` }} />
        </span>
        <span className={styles.centerLine} />
        <span className={styles.half} data-side="positive">
          <span className={styles.bar} data-tone="success" style={{ width: `${positiveWidth}%` }} />
        </span>
      </span>
      <span className={styles.impactText} data-tone={tone}>
        {driver.impactText}
        {/* Sayı işaretine (+/-) güvenmeden yön AT'ye açık metinle de iletilir. */}
        <span className={styles.srOnly}> — değeri {DIRECTION_WORD[tone]}</span>
      </span>
      {driver.note ? <span className={styles.note}>{driver.note}</span> : null}
    </li>
  )
}

function LoadingPlaceholder() {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitleRow}>
        <span className={[styles.skeletonLine, styles.skeletonTitle].join(' ')} aria-hidden="true" />
        {/* AI-first standardı: rozet loading sırasında da zorunlu — veri
            henüz yokken bile içeriğin AI kaynaklı olacağı önceden bildirilir. */}
        <AiBadge confidence={null} />
      </div>
      <div className={styles.skeletonRows} aria-hidden="true">
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
      </div>
    </div>
  )
}

/**
 * AI değerleme sürücüleri — ValuationCard'ın derin ekranı. İlanın tahmini
 * değerini etkileyen faktörleri tornado-benzeri yatay bar listesiyle sunar:
 * merkez çizgiden sağa pozitif (değeri artıran), sola negatif (değeri
 * azaltan) etki. Bar genişliği listedeki en büyük |impact|'e normalize edilir.
 * Zorunlu "✦ AI" rozeti + opsiyonel güven metni, opsiyonel 👍/👎 geri bildirim
 * ve flat yükleme placeholder'ı taşır. İçerik katmanı FLAT — cam yüzey/
 * backdrop-filter kullanılmaz.
 */
export function GlassValuationDrivers({
  drivers,
  baseText,
  title = 'Değerlemeyi Etkileyenler',
  confidence,
  onFeedback,
  loading = false,
  className,
  ...rest
}: GlassValuationDriversProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const baseTextId = `${uid}-base`
  const feedbackPromptId = `${uid}-feedback-prompt`

  const [feedback, setFeedback] = useState<'up' | 'down' | undefined>(undefined)

  const resolvedConfidence = resolveConfidence(confidence)
  const maxAbsImpact = resolveMaxAbsImpact(drivers)

  // İçerik imzası: `drivers`/`baseText` GERÇEKTEN değiştiğinde (ör. kullanıcı
  // farklı bir ilana geçti) önceki geri bildirim seçimi anlamsız kalır —
  // render sırasında karşılaştırıp sıfırlıyoruz (bkz. GlassMatchScore aynı
  // desen — React docs "Adjusting state when a prop changes").
  const contentSignature = JSON.stringify({
    drivers: drivers.map((d) => [d.id, d.label, d.impact, d.impactText]),
    baseText: baseText ?? null,
  })
  const prevContentSignatureRef = useRef(contentSignature)
  if (prevContentSignatureRef.current !== contentSignature) {
    prevContentSignatureRef.current = contentSignature
    if (feedback !== undefined) {
      setFeedback(undefined)
    }
  }

  // Canlı bölge (role="status") DAİMA mount edilir — aşağıdaki dönüşüm bunu
  // metnini değiştirir, kendisini asla unmount/remount etmez. Bazı ekran
  // okuyucular (özellikle VoiceOver), rol+içeriği aynı DOM işleminde birlikte
  // oluşturan sonradan-mount edilen canlı bölgeleri güvenilir duyurmaz; ayrıca
  // yükleme bittiğinde de bir sonuç duyurusu gerekir — o yüzden geçişi burada
  // "adjusting state during render" deseniyle (bkz. contentSignature yukarıda)
  // yakalayıp durum metnini güncelliyoruz.
  const [statusText, setStatusText] = useState(loading ? `${title} hesaplanıyor` : '')
  const prevStatusDepsRef = useRef({ loading, title })
  // `title` da bağımlılığa dahil: aynı `loading` değeri korunurken `title`
  // değişirse (ör. yükleniyorken ya da "hazır" duyurusundan sonra farklı bir
  // ilana geçildiğinde) duyuru metni eski başlıkla asılı kalmamalı. İlk
  // mount loading=false iken (statusText hâlâ '') sahte bir "hazır" duyurusu
  // tetiklenmemesi için o durumda yalnız title değişimi güncelleme YAPMAZ.
  const statusDepsChanged =
    prevStatusDepsRef.current.loading !== loading ||
    (prevStatusDepsRef.current.title !== title && (loading || statusText !== ''))
  if (statusDepsChanged) {
    prevStatusDepsRef.current = { loading, title }
    setStatusText(loading ? `${title} hesaplanıyor` : `${title} hazır`)
  }

  const showFeedback = !loading && Boolean(onFeedback)
  const classes = [styles.root, className].filter(Boolean).join(' ')

  const handleFeedback = (direction: 'up' | 'down') => {
    // Aynı yöne tekrar tıklama seçimi geri alır (toggle); farklı yöne tıklama
    // karşılıklı dışlayarak seçimi değiştirir. `onFeedback` her tıklamada —
    // toggle-off dahil — tıklanan yönle çağrılır.
    setFeedback((prev) => (prev === direction ? undefined : direction))
    onFeedback?.(direction)
  }

  return (
    <div className={classes} data-loading={loading || undefined} {...rest}>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.headerTitleRow}>
              <span id={titleId} className={styles.title}>
                {title}
              </span>
              <AiBadge confidence={resolvedConfidence} />
            </div>
            {baseText ? (
              <p id={baseTextId} className={styles.baseText}>
                {baseText}
              </p>
            ) : null}
          </div>

          {drivers.length > 0 ? (
            <ul
              role="list"
              className={styles.list}
              aria-labelledby={titleId}
              aria-describedby={baseText ? baseTextId : undefined}
            >
              {drivers.map((driver, i) => (
                <DriverRow key={`${i}-${driver.id}`} driver={driver} maxAbsImpact={maxAbsImpact} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Değerlemeyi etkileyen bir faktör bulunamadı.</p>
          )}

          {showFeedback ? (
            <div className={styles.feedback}>
              <span id={feedbackPromptId} className={styles.feedbackPrompt}>
                Bu değerlendirme faydalı mıydı?
              </span>
              <div className={styles.feedbackButtons} role="group" aria-labelledby={feedbackPromptId}>
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
        </>
      )}

      {/* Tek canlı bölge — loading dahil her durumda aynı düğüm, yalnız
          metni değişir (bkz. yukarıdaki statusText yorumu). */}
      <span className={styles.srOnly} role="status">
        {statusText}
      </span>
    </div>
  )
}
