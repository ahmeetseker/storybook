// İçerik katmanı component'i (Dalga 1 kontratı §15) — bilinçli olarak FLAT:
// yüzey severity'ye göre color-mix(semantik %9, --lg-surface), backdrop-filter/
// cam yok. Bu banner'ın TÜM içeriği yapay zekâ moderasyon çıktısıdır, bu yüzden
// "✦ AI" rozeti koşulsuz (GlassAiSummaryCard ile aynı karar) — AI-first
// sözleşmesinin (rozet/güven/geri bildirim/yükleme) tamamı burada uygulanır
// (Dalga 1 kontratı "AI-first standardı"). Metin rengi her zaman --lg-label/
// --lg-label-secondary'den gelir; semantik renk yalnız ikon + zemin karışımını
// sürer (kontrast dersi — durum asla yalnız renkle taşınmaz).
import { useId, useRef, useState } from 'react'
import type { HTMLAttributes, ReactNode, SVGProps } from 'react'
import styles from './GlassAiFlagBanner.module.css'

/** Bandın önem derecesi — yalnız `danger` `role="alert"` alır (bkz. rules.md §2). */
export type GlassAiFlagBannerSeverity = 'info' | 'warning' | 'danger'

/** Geri bildirim yönü — 👍 `'up'`, 👎 `'down'`. */
export type GlassAiFlagBannerFeedbackValue = 'up' | 'down'

export interface GlassAiFlagBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bandın önem derecesi — zemin/ikon rengini ve rolü belirler (varsayılan `'warning'`) */
  severity?: GlassAiFlagBannerSeverity
  /** Kalın başlık satırı — her zaman render edilir */
  title?: string
  /** Gövde açıklaması — moderasyonun kısa gerekçesi */
  description?: string
  /** Tespit edilen madde listesi ("İlan fiyatı bölge ortalamasının %70 altında" vb.); boş/undefined ise render edilmez */
  reasons?: string[]
  /**
   * 0-100 arası güven yüzdesi; AI rozetinin yanında "%N güven" metni olarak
   * görünür (yalnız renk değil, metin). Aralık dışı değer [0,100]'e clamp
   * edilir; sonlu olmayan (`NaN`/`Infinity`) veya `undefined` değerde metin
   * tamamen gizlenir — uydurulmuş bir güven değeri gösterilmez.
   */
  confidence?: number
  /** Verilirse "Ayrıntılar" metin aksiyonu görünür — tam buton değil, düz metin linki gibi */
  onDetails?: () => void
  /** Verilirse sağda × kapatma butonu görünür (`aria-label="Kapat"`); verilmezse hiç render edilmez */
  onDismiss?: () => void
  /**
   * Verilirse 👍/👎 geri bildirim butonları render edilir. Tıklanan yön
   * görsel olarak seçili işaretlenir (`aria-pressed`) ve karşılıklı dışlar.
   * Bu tespit hiçbir otomatik eylem tetiklemez — yalnız bilgilendirme +
   * kullanıcı onaylı geri bildirim (kontrat "AI çıktısı asla otomatik eylem
   * tetiklemez").
   */
  onFeedback?: (value: GlassAiFlagBannerFeedbackValue) => void
  /**
   * AI-first yükleme sözleşmesi: `true` iken açıklama/gerekçe listesi/
   * aksiyonlar yerine parıltısız soluk placeholder render edilir. Rozet
   * (`✦ AI`) yükleme sırasında da KAYBOLMAZ — veri gelmeden önce de bunun bir
   * AI moderasyon bandı olduğu bilgisi kaybolmamalı.
   */
  loading?: boolean
}

const SEVERITY_LABEL: Record<GlassAiFlagBannerSeverity, string> = {
  info: 'Bilgi',
  warning: 'Uyarı',
  danger: 'Tehlike',
}

const DEFAULT_TITLE = 'Bu ilan yapay zekâ tarafından incelemeye alındı'

const iconProps = {
  viewBox: '0 0 20 20',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  'aria-hidden': true,
  focusable: false,
} as const satisfies SVGProps<SVGSVGElement>

const SEVERITY_ICON: Record<GlassAiFlagBannerSeverity, ReactNode> = {
  info: (
    <svg {...iconProps}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9.2v4.6" strokeLinecap="round" />
      <circle cx="10" cy="6.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  warning: (
    <svg {...iconProps}>
      <path d="M10 3.2 17.6 16.4H2.4Z" strokeLinejoin="round" />
      <path d="M10 8.4v3.2" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  danger: (
    <svg {...iconProps}>
      <path d="M6.2 2.5h7.6L17.5 6.2v7.6l-3.7 3.7H6.2l-3.7-3.7V6.2Z" strokeLinejoin="round" />
      <path d="M10 6.8v4" strokeLinecap="round" />
      <circle cx="10" cy="13.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
}

/** [0,100] dışı ve sonlu olmayan (`NaN`/`Infinity`) değerleri gizlemek için `null` döner. */
function normalizeConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/** Tek bir başparmak glifi — CSS'te `data-direction="down"` ile dikey aynalanır. */
function ThumbIcon({ direction }: { direction: GlassAiFlagBannerFeedbackValue }) {
  return (
    <svg
      className={styles.thumbIcon}
      data-direction={direction}
      viewBox="0 0 20 20"
      width={13}
      height={13}
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
 * AI moderasyon uyarı bandı — bir ilanın yapay zekâ tarafından incelemeye
 * alındığını, şüpheli bulunan gerekçeleri ve önem derecesini tam genişlik
 * yatay bir bantta duyurur. İçerik katmanı: cam/backdrop-filter kullanılmaz.
 * `severity="danger"` dışında statiktir (yalnız `danger` `role="alert"`
 * alır — bkz. rules.md §2); AI çıktısı bu bant içinde hiçbir otomatik eylem
 * tetiklemez, yalnız `onDetails`/`onFeedback`/`onDismiss` ile kullanıcı
 * onaylı aksiyonlar sunar.
 */
export function GlassAiFlagBanner({
  severity = 'warning',
  title = DEFAULT_TITLE,
  description,
  reasons,
  confidence,
  onDetails,
  onDismiss,
  onFeedback,
  loading = false,
  className,
  ...rest
}: GlassAiFlagBannerProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const [selected, setSelected] = useState<GlassAiFlagBannerFeedbackValue | null>(null)

  // İçerik imzası (başlık + açıklama + gerekçeler): banner aynı mount
  // üzerinde farklı bir AI tespitine (ör. başka bir ilana) geçerse önceki
  // geri bildirim seçimi anlamsız kalır — eski aria-pressed yeni içeriğe
  // miras kalmamalı. GlassAiSummaryCard ile birebir aynı "prop değişince
  // state'i sıfırla" deseni (ref karşılaştırma, effect gerektirmez).
  const contentSignature = `${title} ${description ?? ''} ${(reasons ?? []).join('')}`
  const prevContentSignature = useRef(contentSignature)
  if (prevContentSignature.current !== contentSignature) {
    prevContentSignature.current = contentSignature
    if (selected !== null) setSelected(null)
  }

  const confidencePct = loading ? null : normalizeConfidence(confidence)
  const hasReasons = !loading && Boolean(reasons && reasons.length > 0)
  const showDescription = !loading && Boolean(description)
  const showDetails = !loading && Boolean(onDetails)
  const showFeedback = !loading && Boolean(onFeedback)
  const showFooter = showDetails || showFeedback

  const handleFeedback = (value: GlassAiFlagBannerFeedbackValue) => {
    setSelected((prev) => (prev === value ? null : value))
    onFeedback?.(value)
  }

  return (
    <div
      {...rest}
      role={severity === 'danger' ? 'alert' : undefined}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={[styles.banner, className].filter(Boolean).join(' ')}
      data-severity={severity}
    >
      <span
        role="img"
        aria-label={SEVERITY_LABEL[severity]}
        className={styles.icon}
        data-severity={severity}
      >
        {SEVERITY_ICON[severity]}
      </span>

      <div className={styles.content}>
        <div className={styles.headRow}>
          <strong id={titleId} className={styles.title}>
            {title}
          </strong>
          <span className={styles.aiMeta}>
            <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
              ✦ AI
            </span>
            {confidencePct !== null ? <span className={styles.confidence}>%{confidencePct} güven</span> : null}
          </span>
        </div>

        {/* Her zaman mount'lu canlı bölge: yalnız içerik değişince duyurulur
            (Codex bulgusu — sonradan mount edilen aria-live SR'lerde kaçabilir). */}
        <span className={styles.srOnly} aria-live="polite">
          {loading ? 'Yapay zekâ incelemesi yükleniyor' : ''}
        </span>

        {loading ? (
          <div className={styles.skeleton} aria-hidden="true">
            <span className={[styles.placeholderBar, styles.placeholderBarWide].join(' ')} />
            <span className={styles.placeholderBar} />
          </div>
        ) : (
          <>
            {showDescription ? <p className={styles.description}>{description}</p> : null}

            {hasReasons ? (
              <ul className={styles.reasons}>
                {(reasons as string[]).map((reason, i) => (
                  <li key={i} className={styles.reasonItem}>
                    {reason}
                  </li>
                ))}
              </ul>
            ) : null}

            {showFooter ? (
              <div className={styles.footer}>
                {showDetails ? (
                  <button type="button" className={styles.detailsAction} onClick={onDetails}>
                    Ayrıntılar
                  </button>
                ) : null}
                {showFeedback ? (
                  <div className={styles.feedback} role="group" aria-label="Bu tespit faydalı mıydı?">
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      aria-pressed={selected === 'up'}
                      aria-label="Faydalı"
                      onClick={() => handleFeedback('up')}
                    >
                      <ThumbIcon direction="up" />
                    </button>
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      aria-pressed={selected === 'down'}
                      aria-label="Faydalı değil"
                      onClick={() => handleFeedback('down')}
                    >
                      <ThumbIcon direction="down" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label="Kapat" onClick={onDismiss}>
          <svg viewBox="0 0 20 20" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden focusable="false">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
