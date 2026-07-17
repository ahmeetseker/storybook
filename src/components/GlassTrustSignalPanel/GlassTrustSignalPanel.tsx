// İçerik katmanı component'i (Dalga 1 kontratı §15) — bilinçli olarak FLAT:
// yüzey --lg-surface + --lg-hairline, backdrop-filter/cam yok. Güven sinyalleri
// (EİDS/tapu/AI moderasyon/satıcı geçmişi) dışarıdan hesaplanır, component yalnız
// çizer. AI-first rozet/güven yüzdesi/geri bildirim/yükleme sözleşmesi Dalga 1
// kontratının "AI-first standardı" bölümünden birebir uygulanır (bu bölüm TÜM
// AI kaynaklı içerik taşıyan component'lerde zorunlu — bkz. rules.md §1/§12).
import { useId, useState } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassTrustSignalPanel.module.css'

/** Bir güven sinyalinin durumu — rengi otomatik türetir, ama HER ZAMAN ikon+metinle de taşınır (yalnız renk değil). */
export type GlassTrustSignalStatus = 'verified' | 'warning' | 'failed' | 'info'

export interface GlassTrustSignal {
  /**
   * Liste anahtarı — sabit ve benzersiz olmalı. Yalnız React key + JS obje
   * anahtarı (geri bildirim state map'i) olarak kullanılır; ham veri id'si
   * hiçbir DOM `id` niteliğine YAZILMAZ (DOM id'ler `useId()` tabanlıdır).
   */
  id: string
  /** Görünen sinyal adı ("EİDS tapu eşleşmesi") */
  label: string
  /** Durum — ikon (✓/!/✕/i) + `STATUS_LABEL` metniyle taşınır */
  status: GlassTrustSignalStatus
  /** `panel` varyantında satırın altında gösterilen kısa gerekçe/kayıt bilgisi ("12 Temmuz 2026, kayıt 2841937465"); `compact`'te render edilmez */
  detail?: string
  /** Bu sinyal yapay zekâ tarafından üretildiyse (ör. AI moderasyon sonucu) işaretlenir — mini "✦ AI" rozeti (yalnız `panel` varyantında görünür) */
  aiGenerated?: boolean
  /** `aiGenerated=true` iken rozetin yanında "%N güven" etiketi görünür; [0,100] dışı veya sonlu olmayan (`NaN`/`Infinity`) değerler sessizce gizlenir */
  confidence?: number
}

export interface GlassTrustSignalPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Sıralı gösterilecek güven sinyali listesi; boş dizi boş liste render eder */
  signals: GlassTrustSignal[]
  /** Panel başlığı — her zaman render edilir, `section`'ı `aria-labelledby` ile adlandırır */
  title?: string
  /** `panel`: ikon + etiket + detay satır listesi; `compact`: yalnız özet satırı + ikon dizisi */
  variant?: 'panel' | 'compact'
  /**
   * AI-first yükleme sözleşmesi: `true` iken gerçek içerik yerine parıltısız
   * soluk placeholder render edilir (kendi flat çizimi — `GlassSkeleton`
   * shimmer'ı KULLANILMAZ, yalnız opacity nabzı, `prefers-reduced-motion`'da kapalı).
   */
  loading?: boolean
  /**
   * AI-first geri bildirim sözleşmesi: verilirse her AI kaynaklı (`aiGenerated`)
   * satırda 👍/👎 düğmeleri görünür; tıklanınca `(signalId, value)` ile çağrılır
   * ve düğme görsel olarak seçili işaretlenir (`aria-pressed`). AI çıktısı bu
   * geri bildirim dışında hiçbir otomatik eylem tetiklemez.
   */
  onFeedback?: (signalId: string, value: 'up' | 'down') => void
}

const STATUS_GLYPH: Record<GlassTrustSignalStatus, string> = {
  verified: '✓',
  warning: '!',
  failed: '✕',
  info: 'i',
}

const STATUS_LABEL: Record<GlassTrustSignalStatus, string> = {
  verified: 'Doğrulandı',
  warning: 'Uyarı',
  failed: 'Başarısız',
  info: 'Bilgi',
}

const PLACEHOLDER_COUNT = 3

/** [0,100] dışı ve sonlu olmayan (`NaN`/`Infinity`) değerleri gizlemek için `null` döner. */
function normalizeConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/**
 * AI-first rozet — kontrattaki tanıma birebir: metin "✦ AI",
 * `aria-label="Yapay zekâ üretimi"`. Bu görünüm her AI component'inde AYNI
 * olmalı (kopya CSS/işaretleme kabul — bkz. Dalga 1 kontratı).
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

function FeedbackButtons({
  selected,
  onSelect,
}: {
  selected: 'up' | 'down' | null
  onSelect: (value: 'up' | 'down') => void
}) {
  return (
    <div className={styles.feedback} role="group" aria-label="Bu sinyal faydalı mıydı?">
      <button
        type="button"
        className={styles.feedbackButton}
        aria-label="Faydalı"
        aria-pressed={selected === 'up'}
        onClick={() => onSelect('up')}
      >
        <span aria-hidden>👍</span>
      </button>
      <button
        type="button"
        className={styles.feedbackButton}
        aria-label="Faydalı değil"
        aria-pressed={selected === 'down'}
        onClick={() => onSelect('down')}
      >
        <span aria-hidden>👎</span>
      </button>
    </div>
  )
}

function PlaceholderRows({ variant }: { variant: 'panel' | 'compact' }) {
  const items = Array.from({ length: PLACEHOLDER_COUNT })
  if (variant === 'compact') {
    return (
      <span className={styles.placeholderIconRow} aria-hidden>
        {items.map((_, i) => (
          <span key={i} className={styles.placeholderIcon} />
        ))}
      </span>
    )
  }
  return (
    <ul className={styles.list} aria-hidden>
      {items.map((_, i) => (
        <li key={i} className={styles.row}>
          <span className={styles.placeholderIcon} />
          <div className={styles.rowBody}>
            <span className={[styles.placeholderBar, styles.placeholderBarWide].join(' ')} />
            <span className={styles.placeholderBar} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Güven sinyalleri paneli — bir ilanın EİDS/tapu eşleşmesi, AI moderasyon
 * sonucu, satıcı geçmişi gibi doğrulama sinyallerini durum ikonu + metniyle
 * listeler. İçerik katmanı: cam/backdrop-filter kullanılmaz.
 */
export function GlassTrustSignalPanel({
  signals,
  title = 'Güven Kontrolleri',
  variant = 'panel',
  loading = false,
  onFeedback,
  className,
  ...rest
}: GlassTrustSignalPanelProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})

  const total = signals.length
  const verifiedCount = signals.filter((s) => s.status === 'verified').length
  const failedCount = signals.filter((s) => s.status === 'failed').length
  const hasFailed = failedCount > 0
  const hasAiGenerated = signals.some((s) => s.aiGenerated)

  const handleFeedback = (signalId: string, value: 'up' | 'down') => {
    setFeedback((prev) => ({ ...prev, [signalId]: value }))
    onFeedback?.(signalId, value)
  }

  return (
    <section
      {...rest}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {/* Her zaman mount'lu canlı bölge: yalnız içerik değişince (boş → metin) duyurulur,
            bu yüzden `loading` geçişte koşullu mount/unmount edilmez (Codex bulgusu). */}
        <span className={styles.srOnly} aria-live="polite">
          {loading ? 'Güven kontrolleri yükleniyor' : ''}
        </span>
        {loading ? (
          <span className={[styles.placeholderBar, styles.placeholderBarSummary].join(' ')} aria-hidden />
        ) : (
          <p className={styles.summary}>
            {verifiedCount}/{total} doğrulama geçti
            {hasFailed ? <span className={styles.alert}> · {failedCount} kontrol başarısız</span> : null}
            {variant === 'compact' && hasAiGenerated ? (
              <span className={styles.aiSummaryBadge}> · ✦ AI destekli</span>
            ) : null}
          </p>
        )}
      </div>

      {loading ? (
        <PlaceholderRows variant={variant} />
      ) : variant === 'compact' ? (
        <ul role="list" className={styles.iconRow}>
          {signals.map((signal) => (
            <li key={signal.id} role="listitem" data-status={signal.status} className={styles.iconItem}>
              <span className={styles.iconWrap}>
                <span
                  role="img"
                  aria-label={STATUS_LABEL[signal.status]}
                  className={styles.icon}
                  data-status={signal.status}
                >
                  {STATUS_GLYPH[signal.status]}
                </span>
                {/* compact'te aiGenerated bilgisini tamamen atmamak için: köşede mini ✦ işareti
                    (Codex bulgusu — AI sonucu insan doğrulaması gibi sunulmasın). */}
                {signal.aiGenerated ? (
                  <span className={styles.aiCorner} aria-label="Yapay zekâ üretimi">
                    ✦
                  </span>
                ) : null}
              </span>
              <span className={styles.srOnly}>{signal.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul role="list" className={styles.list}>
          {signals.map((signal) => (
            <li key={signal.id} data-status={signal.status} className={styles.row}>
              <span
                role="img"
                aria-label={STATUS_LABEL[signal.status]}
                className={styles.icon}
                data-status={signal.status}
              >
                {STATUS_GLYPH[signal.status]}
              </span>
              <div className={styles.rowBody}>
                <div className={styles.rowHead}>
                  <span className={styles.label}>{signal.label}</span>
                  {signal.aiGenerated ? <AiBadge confidence={signal.confidence} /> : null}
                </div>
                {signal.detail ? <p className={styles.detail}>{signal.detail}</p> : null}
                {signal.aiGenerated && onFeedback ? (
                  <FeedbackButtons
                    selected={feedback[signal.id] ?? null}
                    onSelect={(value) => handleFeedback(signal.id, value)}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
