import type { HTMLAttributes } from 'react'
import { GlassAvatar } from '../GlassAvatar'
import styles from './GlassInsightNote.module.css'

export interface GlassInsightNoteProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Notu yazan uzman/danışmanın adı — başlık satırının ve avatar baş harfinin kaynağı */
  author: string
  /** Yazarın uzmanlık/rol etiketi (ör. "Bölge Danışmanı") */
  role?: string
  /** `GlassAvatar`'a geçilir; yüklenemez/verilmezse `author`'dan baş harf üretilir */
  avatarSrc?: string
  /** Hazır biçimlendirilmiş tarih metni (ör. "14 Temmuz 2026") — component tarih ayrıştırmaz */
  date: string
  /** İçgörü metni — arsayı/ilanı yerinde inceleyen uzmanın notu */
  text: string
  /** "Yerinde inceledi" rozetini gösterir — uzmanın ilanı bizzat gezdiğini belirtir */
  verified?: boolean
  /**
   * `quote`: sol accent çizgili bağımsız kart — avatar + başlık satırı (ad/rol
   * bir satır, tarih/rozet ayrı satır) + tam metin. İlan detay sayfasında
   * bağımsız "Uzman İçgörüsü" bölümü için.
   * `inline`: tek satırlık kompakt başlık (ad/rol/tarih/rozet aynı satırda) +
   * metin 2 satıra kırpılır (`-webkit-line-clamp`). Kendi kart zemini yoktur —
   * yalnız zaten çerçeveli bir liste/akış içine gömülü kullanım içindir.
   */
  variant?: 'quote' | 'inline'
}

function VerifiedIcon() {
  return (
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
  )
}

/**
 * "Yerinde inceledi" rozeti. Zemin `--lg-success`'in soluk karışımı, İKON
 * `--lg-success` renkli — ama METİN `--lg-label` (birincil etiket rengi)
 * taşır. Metni de success rengine boyamak küçük punto + amber/success zemin
 * üstünde WCAG AA kontrastını düşürür (bkz. GlassReviewCard "Doğrulanmış
 * görüşme" dersi, rules.md §9). Durum bilgisi zaten görünür metinle taşınır,
 * yalnız renge/ikona bağlı değildir.
 */
function VerifiedBadge() {
  return (
    <span className={styles.verified}>
      <VerifiedIcon />
      Yerinde inceledi
    </span>
  )
}

/**
 * Uzman/danışman içgörü notu — bir emlak danışmanının ilanı yerinde
 * inceledikten sonra bıraktığı kısa değerlendirme. İçerik katmanı FLAT (cam
 * yok); `quote` bağımsız bir kart, `inline` liste/akış içine gömülü kompakt
 * satırdır. Avatar sarmalayıcısı `aria-hidden` — `GlassAvatar`'ın kendi baş
 * harf fallback'i `author` ile aynı erişilebilir adı taşıdığından, başlıktaki
 * görünür isimle birlikte çift duyuru olmaması için gizlenir.
 */
export function GlassInsightNote({
  author,
  role,
  avatarSrc,
  date,
  text,
  verified = false,
  variant = 'quote',
  className,
  ...rest
}: GlassInsightNoteProps) {
  const isQuote = variant === 'quote'

  const classes = [styles.card, isQuote ? styles.quote : styles.inline, className].filter(Boolean).join(' ')

  return (
    <article className={classes} data-variant={variant} {...rest}>
      {/* Yazar adı aşağıda metinle zaten duyuruluyor; GlassAvatar'a name yine
          geçilir (baş harf fallback'i bu değere bağlı) ama sarmalayıcı
          aria-hidden'dır — çift ad duyurusu olmaz (bkz. GlassReviewCard). */}
      <span className={styles.avatarWrap} aria-hidden="true">
        <GlassAvatar name={author} src={avatarSrc} size={isQuote ? 'md' : 'xs'} />
      </span>
      <div className={styles.content}>
        {isQuote ? (
          <>
            <div className={styles.nameRow}>
              <span className={styles.author}>{author}</span>
              {role ? <span className={styles.role}>{role}</span> : null}
            </div>
            <div className={styles.metaRow}>
              <span className={styles.date}>{date}</span>
              {verified ? <VerifiedBadge /> : null}
            </div>
          </>
        ) : (
          <div className={styles.compactLine}>
            <span className={styles.author}>{author}</span>
            {role ? <span className={styles.role}>{role}</span> : null}
            <span className={styles.date}>{date}</span>
            {verified ? <VerifiedBadge /> : null}
          </div>
        )}
        <p className={styles.text}>{text}</p>
      </div>
    </article>
  )
}
