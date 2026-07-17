// İçerik katmanı component'i (Dalga 1 kontratı §15) — bilinçli olarak FLAT:
// yüzey --lg-surface + --lg-hairline, backdrop-filter/cam yok (kontrat "AI-first
// standardı" bölümü küçük state göstergesi dışında cam istemiyor, burada hiç
// gerekmiyor). aiGenerated rozeti daima görünür, confidence yalnız renkle değil
// metinle duyurulur, geri bildirim kullanıcı onayı gerektiren ayrı bir aksiyon
// (otomatik eylem yok), loading kendi flat/parıltısız placeholder'ını çizer.
import { useId, useState } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassAiSummaryCard.module.css'

/** Geri bildirim yönü — 👍 `'up'`, 👎 `'down'`. */
export type GlassAiSummaryFeedbackValue = 'up' | 'down'

export interface GlassAiSummaryCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** AI tarafından üretilen 2-3 cümlelik ilan özeti */
  summary: string
  /** Artılar listesi — `undefined`/boş dizi verilirse "Artılar" kolonu hiç render edilmez */
  pros?: string[]
  /** Eksiler listesi — `undefined`/boş dizi verilirse "Eksiler" kolonu hiç render edilmez */
  cons?: string[]
  /**
   * 0-100 arası güven yüzdesi; rozetin yanında "%N güven" metni olarak
   * görünür (yalnız renk değil, metin). Aralık dışı değer [0,100]'e clamp
   * edilir; sonlu olmayan (`NaN`/`Infinity`) veya `undefined` değerde metin
   * tamamen gizlenir — uydurulmuş bir güven değeri gösterilmez.
   */
  confidence?: number
  /** Özetin kaynağı — altta küçük gri metin */
  sourceNote?: string
  /**
   * Verilirse 👍/👎 geri bildirim butonları render edilir. Tıklanan yön
   * görsel olarak seçili işaretlenir (`aria-pressed`) ve karşılıklı dışlar
   * (aynı anda yalnız biri seçili). Component "gönderildi" durumunu dışarı
   * taşımaz — yalnız hangi yönün seçili olduğunu gösterir, tekrarlı tıklama
   * kısıtlaması/sayaç sorumluluğu çağırana aittir.
   */
  onFeedback?: (value: GlassAiSummaryFeedbackValue) => void
  /** Yükleniyor durumu — özet/artı-eksi/geri bildirim yerine flat placeholder gösterir */
  loading?: boolean
}

const DEFAULT_SOURCE_NOTE = 'İlan verisi ve bölge istatistiklerinden üretildi'

/** confidence'ı [0,100]'e clamp eder, sonlu değilse `null` döner (gizle). */
function formatConfidence(value: number | undefined): string | null {
  if (value === undefined || !Number.isFinite(value)) return null
  const clamped = Math.round(Math.min(Math.max(value, 0), 100))
  return `%${clamped} güven`
}

/** Tek bir başparmak glifi — CSS'te `data-direction="down"` ile dikey aynalanır (bkz. module.css). */
function ThumbIcon({ direction }: { direction: GlassAiSummaryFeedbackValue }) {
  return (
    <svg
      className={styles.thumbIcon}
      data-direction={direction}
      viewBox="0 0 20 20"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 8.4v8.4H4.6a.8.8 0 0 1-.8-.8V9.2a.8.8 0 0 1 .8-.8H7Zm0 0 3.4-5.6a1.6 1.6 0 0 1 2.9 1V7h3a1.6 1.6 0 0 1 1.55 1.98l-1.4 6.4A1.6 1.6 0 0 1 14.9 16.8H7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * AI tarafından üretilen ilan özeti kartı: kısa özet paragrafı + isteğe bağlı
 * artı/eksi kolonları + kaynak notu + geri bildirim. AI-first standardı
 * gereği `aiGenerated` rozeti koşulsuz görünür ve içerik asla otomatik bir
 * eylem tetiklemez (yalnız bilgilendirme + kullanıcı onaylı geri bildirim).
 */
export function GlassAiSummaryCard({
  summary,
  pros,
  cons,
  confidence,
  sourceNote = DEFAULT_SOURCE_NOTE,
  onFeedback,
  loading = false,
  className,
  ...rest
}: GlassAiSummaryCardProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const prosId = `${uid}-pros`
  const consId = `${uid}-cons`

  // Hangi yönün seçili olduğu tamamen bu component içinde tutulur — dışarıya
  // controlled bir `value` sözleşmesi açılmaz (kontrat: yalnız onFeedback
  // callback'i + görsel seçili durum isteniyor).
  const [selected, setSelected] = useState<GlassAiSummaryFeedbackValue | null>(null)

  const confidenceText = loading ? null : formatConfidence(confidence)
  const hasPros = !loading && Boolean(pros && pros.length > 0)
  const hasCons = !loading && Boolean(cons && cons.length > 0)
  const hasColumns = hasPros || hasCons

  const handleFeedback = (value: GlassAiSummaryFeedbackValue) => {
    if (value === selected) return
    setSelected(value)
    onFeedback?.(value)
  }

  const classes = [styles.card, className].filter(Boolean).join(' ')

  return (
    <article
      {...rest}
      className={classes}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          AI Özeti
        </h3>
        <span className={styles.badge} aria-label="Yapay zekâ üretimi">
          ✦ AI
        </span>
        {confidenceText ? <span className={styles.confidence}>{confidenceText}</span> : null}
      </div>

      {loading ? (
        <div className={styles.skeleton} aria-hidden="true">
          <span className={styles.skeletonLine} style={{ width: '100%' }} />
          <span className={styles.skeletonLine} style={{ width: '92%' }} />
          <span className={styles.skeletonLine} style={{ width: '64%' }} />
        </div>
      ) : (
        <>
          <p className={styles.summary}>{summary}</p>

          {hasColumns ? (
            <div className={styles.columns}>
              {hasPros ? (
                <div className={styles.column}>
                  <span id={prosId} className={styles.columnLabel}>
                    Artılar
                  </span>
                  <ul className={styles.list} aria-labelledby={prosId}>
                    {(pros as string[]).map((item, i) => (
                      <li key={i} className={styles.listItem}>
                        <span className={styles.markerSuccess} aria-hidden="true">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {hasCons ? (
                <div className={styles.column}>
                  <span id={consId} className={styles.columnLabel}>
                    Eksiler
                  </span>
                  <ul className={styles.list} aria-labelledby={consId}>
                    {(cons as string[]).map((item, i) => (
                      <li key={i} className={styles.listItem}>
                        <span className={styles.markerDanger} aria-hidden="true">
                          −
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.footer}>
            <span className={styles.sourceNote}>{sourceNote}</span>
            {onFeedback ? (
              <div className={styles.feedback} role="group" aria-label="Bu özet faydalı mıydı?">
                <button
                  type="button"
                  className={`${styles.feedbackButton} ${styles.feedbackUp}`}
                  aria-pressed={selected === 'up'}
                  aria-label="Faydalı"
                  onClick={() => handleFeedback('up')}
                >
                  <ThumbIcon direction="up" />
                </button>
                <button
                  type="button"
                  className={`${styles.feedbackButton} ${styles.feedbackDown}`}
                  aria-pressed={selected === 'down'}
                  aria-label="Faydalı değil"
                  onClick={() => handleFeedback('down')}
                >
                  <ThumbIcon direction="down" />
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </article>
  )
}
