// GlassTimeline — dikey zaman çizelgesi (ilan süreci/bina geçmişi).
// İçerik katmanı FLAT: cam/backdrop-filter yok. Kendi rayını (nokta + dikey
// çizgi) SVG'siz, saf DOM ile çizer.
import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassTimeline.module.css'

/** Bir event'in görsel/erişilebilir ton eşiği. */
export type GlassTimelineTone = 'default' | 'success' | 'warning' | 'danger'

/** Zaman çizelgesindeki tek bir olay (ör. "Sözleşme İmzalandı"). */
export interface GlassTimelineEvent {
  /** Kimlik — React `key` kaynağı, hiçbir DOM `id`'sine yazılmaz */
  id: string
  /** Tarih metni — tabular hizalanır, format serbest (ör. "12 Tem 2026") */
  date: string
  /** Olay başlığı */
  title: string
  /** Opsiyonel açıklama — yalnız `variant="line"`'da görünür */
  description?: string
  /**
   * Görsel/erişilebilir ton — nokta rengini belirler. `default` DIŞINDAKİ
   * tonlarda ekran okuyucuya durum ayrıca metinle duyurulur (bkz. `TONE_LABEL`);
   * bilgi yalnız renkle taşınmaz.
   */
  tone?: GlassTimelineTone
  /** Nokta içinde gösterilecek dekoratif ikon (aria-hidden); yalnız `variant="line"`'da render edilir */
  icon?: ReactNode
}

export interface GlassTimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  events: GlassTimelineEvent[]
  /**
   * `line`: sol rayda ton renkli noktalar + aralarında dikey çizgi, başlığın
   * altında açıklama (varsa).
   * `compact`: yalnız tarih + başlık satırları — açıklama render edilmez,
   * ray çizgisi yok (ton yine küçük bir noktayla belirtilir).
   */
  variant?: 'line' | 'compact'
  /** Bileşeni adlandırır — sayfada birden çok örnek varsa verilmesi önerilir */
  'aria-label'?: string
  /** `events` boşken gösterilecek içerik (varsayılan: basit metin) */
  emptyState?: ReactNode
}

const TONE_LABEL: Record<Exclude<GlassTimelineTone, 'default'>, string> = {
  success: 'Tamamlandı',
  warning: 'Dikkat gerekiyor',
  danger: 'Sorun',
}

const defaultEmptyState = 'Henüz zaman çizelgesi kaydı yok.'

/** Ton, `default` DIŞINDAYSA sr-only durum metnini döndürür (renk tek başına bilgi taşımaz). */
function toneStatusText(tone: GlassTimelineTone | undefined): string | null {
  if (!tone || tone === 'default') return null
  return TONE_LABEL[tone]
}

/**
 * İlan sürecini/bina geçmişini dikey bir zaman çizelgesi olarak gösterir.
 * `variant="line"` sol rayda ton renkli noktalar + dikey bağlantı çizgisiyle,
 * `variant="compact"` yalnız tarih+başlık satırlarıyla render eder. Ray/çizgi
 * tamamen dekoratif (`aria-hidden`); liste Safari'nin `list-style: none`
 * uyguladığında listeyi VoiceOver'dan gizleme hatasına karşı açıkça
 * `role="list"`/`role="listitem"` taşır.
 */
export function GlassTimeline({
  events,
  variant = 'line',
  className,
  emptyState,
  'aria-label': ariaLabel,
  ...rest
}: GlassTimelineProps) {
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  if (events.length === 0) {
    return (
      <div className={classes} {...rest}>
        <p className={styles.emptyState}>{emptyState ?? defaultEmptyState}</p>
      </div>
    )
  }

  return (
    <div className={classes} {...rest}>
      <ul className={styles.list} role="list" aria-label={ariaLabel}>
        {events.map((event, i) => {
          const isLast = i === events.length - 1
          const statusText = toneStatusText(event.tone)
          const tone = event.tone ?? 'default'

          return (
            <li key={event.id} role="listitem" className={styles.row}>
              {variant === 'line' ? (
                <span className={styles.railCol} aria-hidden="true">
                  <span className={styles.marker} data-tone={tone} data-has-icon={Boolean(event.icon) || undefined}>
                    {event.icon}
                  </span>
                  {!isLast ? <span className={styles.connector} /> : null}
                </span>
              ) : (
                <span className={styles.compactDot} data-tone={tone} aria-hidden="true" />
              )}
              <div className={styles.content}>
                <time className={styles.date}>{event.date}</time>
                <p className={styles.title}>
                  {event.title}
                  {statusText ? <span className={styles.srOnly}> — Durum: {statusText}</span> : null}
                </p>
                {variant === 'line' && event.description ? (
                  <p className={styles.description}>{event.description}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
