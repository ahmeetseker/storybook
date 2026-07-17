import { useId, type HTMLAttributes } from 'react'
import { GlassAvatar } from '../GlassAvatar'
import styles from './GlassReviewCard.module.css'

export interface GlassReviewCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Yorumu yazan kullanıcının adı — başlık satırının ve avatar baş harfinin kaynağı */
  author: string
  /** `GlassAvatar`'a geçilir; yüklenemez/verilmezse `author`'dan baş harf üretilir */
  avatarSrc?: string
  /** 0-5 arası puan; ondalık desteklenir (ör. 4.5 → dört buçuk yıldız). Aralık dışı değerler sessizce clamp edilir */
  rating: number
  /** Hazır biçimlendirilmiş tarih metni (ör. "12 Mayıs 2026") — component tarih ayrıştırmaz */
  date: string
  /** Yorum gövdesi */
  text: string
  /** "Doğrulanmış görüşme" rozetini gösterir (`--lg-success`) */
  verified?: boolean
  /** Verilirse "Faydalı" aksiyonunun yanında sayaç gösterilir (ör. `helpfulCount={12}` → "Faydalı (12)") */
  helpfulCount?: number
  /**
   * Verilirse "Faydalı" gerçek bir `<button>` olur ve her tıklamada çağrılır.
   * Component kendi "zaten faydalı bulundu" durumunu TUTMAZ (tekrar tıklamayı
   * engellemez, ikonu doldurmaz) — sayacı artırmak/tekrar tıklamayı kısıtlamak
   * tamamen çağıranın sorumluluğudur (bkz. rules.md §7).
   */
  onHelpful?: () => void
  /**
   * `full`: avatar + başlık satırı (isim/rozet, puan/tarih) + tam metin + aksiyon.
   * `compact`: tek satırlık özet (isim + puan + tarih) + 2 satıra kırpılmış metin.
   */
  variant?: 'full' | 'compact'
}

// 10 noktalı yıldız poligonu (5 dış + 5 iç köşe), viewBox 0 0 24 24, merkez (12,12).
const STAR_PATH =
  'M12 2 L14.35 8.76 L21.51 8.91 L15.8 13.24 L17.88 20.09 L12 16 L6.12 20.09 L8.2 13.24 L2.49 8.91 L9.65 8.76 Z'

function clampRating(value: number): number {
  const safe = Number.isFinite(value) ? value : 0
  return Math.min(Math.max(safe, 0), 5)
}

function formatRatingLabel(value: number): string {
  return value.toLocaleString('tr-TR', { maximumFractionDigits: 1 })
}

/** Her yıldız kendi dolum yüzdesini bir SVG `linearGradient` ile taşır — GlassRating'e bağımlı değil. */
function ReviewStars({ value, size, uid }: { value: number; size: number; uid: string }) {
  const clamped = clampRating(value)
  // 0.1 hassasiyete yuvarlanır — hem görsel hem duyurulan değer aynı sayıyı taşısın.
  const rounded = Math.round(clamped * 10) / 10
  const fills = Array.from({ length: 5 }, (_, i) => Math.round(Math.min(Math.max(rounded - i, 0), 1) * 100))

  return (
    <span className={styles.stars} role="img" aria-label={`5 üzerinden ${formatRatingLabel(rounded)} yıldız`}>
      {fills.map((fillPct, i) => {
        const gradId = `${uid}-star-${i}`
        return (
          <svg key={i} className={styles.star} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                <stop offset={`${fillPct}%`} className={styles.starFillStop} />
                <stop offset={`${fillPct}%`} className={styles.starTrackStop} />
              </linearGradient>
            </defs>
            <path d={STAR_PATH} fill={`url(#${gradId})`} />
          </svg>
        )
      })}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className={styles.verified}>
      <svg
        className={styles.verifiedIcon}
        viewBox="0 0 20 20"
        width={13}
        height={13}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path d="m5 10.4 3.1 3.1L15 6.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Doğrulanmış görüşme
    </span>
  )
}

function ThumbIcon() {
  return (
    <svg
      className={styles.thumbIcon}
      viewBox="0 0 20 20"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path
        d="M7 8.4v8.4H4.6a.8.8 0 0 1-.8-.8V9.2a.8.8 0 0 1 .8-.8H7Zm0 0 3.4-5.6a1.6 1.6 0 0 1 2.9 1V7h3a1.6 1.6 0 0 1 1.55 1.98l-1.4 6.4A1.6 1.6 0 0 1 14.9 16.8H7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GlassReviewCard({
  author,
  avatarSrc,
  rating,
  date,
  text,
  verified = false,
  helpfulCount,
  onHelpful,
  variant = 'full',
  className,
  ...rest
}: GlassReviewCardProps) {
  const uid = useId()
  const starSize = variant === 'compact' ? 13 : 16
  const helpfulLabel = helpfulCount !== undefined ? `Faydalı (${helpfulCount})` : 'Faydalı'

  const classes = [styles.card, variant === 'compact' ? styles.compact : styles.full, className]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} data-variant={variant} {...rest}>
      <div className={styles.header}>
        <GlassAvatar name={author} src={avatarSrc} size={variant === 'compact' ? 'sm' : 'md'} />
        <div className={styles.identity}>
          {variant === 'compact' ? (
            <div className={styles.compactLine}>
              <span className={styles.author}>{author}</span>
              <ReviewStars value={rating} size={starSize} uid={uid} />
              <span className={styles.date}>{date}</span>
              {verified ? <VerifiedBadge /> : null}
            </div>
          ) : (
            <>
              <div className={styles.nameRow}>
                <span className={styles.author}>{author}</span>
                {verified ? <VerifiedBadge /> : null}
              </div>
              <div className={styles.metaRow}>
                <ReviewStars value={rating} size={starSize} uid={uid} />
                <span className={styles.date}>{date}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <p className={styles.text}>{text}</p>

      {onHelpful ? (
        <div className={styles.actions}>
          <button type="button" className={styles.helpfulButton} onClick={onHelpful}>
            <ThumbIcon />
            {helpfulLabel}
          </button>
        </div>
      ) : helpfulCount !== undefined ? (
        // onHelpful verilmemişse tıklamanın hiçbir etkisi olmaz — "sahte buton"
        // yerine düz metin göster (bkz. rules.md §4).
        <div className={styles.actions}>
          <span className={styles.helpfulStatic}>{helpfulLabel}</span>
        </div>
      ) : null}
    </article>
  )
}
