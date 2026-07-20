import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassListingManagementCard.module.css'

/** Satıcı ilanının yaşam döngüsü durumu. */
export type GlassListingState = 'draft' | 'review' | 'live' | 'changes' | 'paused' | 'expired'

export interface GlassListingStat {
  id: string
  label: string
  value: string
}

export interface GlassListingManagementCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** İlan başlığı */
  title: string
  /** İlanın durumu */
  state: GlassListingState
  /** "İşlem gerekli" açıklaması — verilirse uyarı bölümü çizilir */
  issue?: string
  /** Performans metrikleri (görüntülenme, mesaj vb.) */
  stats?: GlassListingStat[]
  /** İlan görseli */
  imageSrc?: string
  /** Görsel alternatif metni */
  imageAlt?: string
  /** Fiyat etiketi */
  priceLabel?: string
  /** Referans/konum satırı */
  referenceLabel?: string
  /** Güncelleme etiketi */
  updatedLabel?: string
  /** Yönetim aksiyonları (ayrı erişilebilir kontroller) */
  actions?: ReactNode
  /** Başlığı erişilebilir bir tetikleyiciye çevirir; verilmezse statik başlık */
  onOpen?: () => void
  /** Başlığın heading seviyesi */
  headingAs?: 'h2' | 'h3' | 'h4'
}

const STATE_LABELS: Record<GlassListingState, string> = {
  draft: 'Taslak',
  review: 'İncelemede',
  live: 'Yayında',
  changes: 'Değişiklik istendi',
  paused: 'Duraklatıldı',
  expired: 'Süresi doldu',
}

/**
 * Satıcı tarafı ilan yönetim kartı — alıcı-yüzü `GlassListingCard`'dan farklı
 * olarak yaşam döngüsü durumu ve "işlem gerekli" uyarısı taşır. Kart bir
 * `<article>`'dır; kartın tamamı button YAPILMAZ (GlassListingCard'ın bilinen
 * hatası tekrarlanmaz). Durum renk dışında metinle iletilir. Görsel yoksa
 * temsili medya `role="img"` + etiketle çizilir. Başlık yalnız `onOpen` verildiğinde
 * erişilebilir bir tetikleyici olur.
 */
export function GlassListingManagementCard({
  title,
  state,
  issue,
  stats,
  imageSrc,
  imageAlt,
  priceLabel,
  referenceLabel,
  updatedLabel,
  actions,
  onOpen,
  headingAs: Heading = 'h3',
  className,
  ...rest
}: GlassListingManagementCardProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen className/data-state caller tarafından ezilemez
    <article {...rest} data-state={state} className={classes}>
      {imageSrc ? (
        <img className={styles.media} src={imageSrc} alt={imageAlt ?? ''} />
      ) : (
        <span className={styles.mediaPlaceholder} role="img" aria-label={imageAlt ?? `${title} — görsel yok`}>
          <span aria-hidden>◫</span>
        </span>
      )}

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.headingBox}>
            {referenceLabel ? <p className={styles.reference}>{referenceLabel}</p> : null}
            <Heading className={styles.title}>
              {onOpen ? (
                <button type="button" className={styles.titleButton} onClick={onOpen}>
                  {title}
                </button>
              ) : (
                title
              )}
            </Heading>
          </div>
          <span className={styles.state} data-state={state}>
            {STATE_LABELS[state]}
          </span>
        </div>

        {priceLabel ? <strong className={styles.price}>{priceLabel}</strong> : null}

        {issue ? (
          <div className={styles.issue} role="status">
            <strong>İşlem gerekli:</strong> {issue}
          </div>
        ) : null}

        {stats && stats.length ? (
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.id} className={styles.stat}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {updatedLabel ? <p className={styles.updated}>{updatedLabel}</p> : null}

        {actions ? <footer className={styles.actions}>{actions}</footer> : null}
      </div>
    </article>
  )
}
