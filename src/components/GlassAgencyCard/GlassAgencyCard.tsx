// Kurumsal emlak ofisi kartı — GlassSellerCard'ın kurumsal karşılığı (bkz. rules.md §1).
// İçerik katmanı: cam DEĞİL, düz yüzey (--lg-surface + --lg-hairline). GlassAvatar/GlassBadge/
// GlassButton gibi iç kontroller kendi malzeme sözleşmelerini korur.
import type { HTMLAttributes } from 'react'
import { GlassAvatar } from '../GlassAvatar'
import { GlassBadge } from '../GlassBadge'
import { GlassButton } from '../GlassButton'
import { GlassLink } from '../GlassLink'
import styles from './GlassAgencyCard.module.css'

export interface GlassAgencyCardStat {
  /** Kısa metrik adı, ör. "Aktif İlan", "Danışman" */
  label: string
  /** Hazır biçimli değer, ör. "48" — sayı formatı çağıranındır */
  value: string
}

export interface GlassAgencyCardProps extends HTMLAttributes<HTMLElement> {
  /** Kurum adı — GlassAvatar baş harf fallback'i de buradan türer */
  name: string
  /** Kurum logosu; verilmezse GlassAvatar `name` baş harf fallback'ine düşer */
  logoSrc?: string
  /** Ör. "İstanbul Anadolu Yakası Yetkili Bayi" */
  tagline?: string
  /** Tabular istatistik satırı, ör. Aktif İlan 48 · Danışman 12 */
  stats?: GlassAgencyCardStat[]
  /** "Doğrulanmış Kurumsal" rozetini gösterir */
  verified?: boolean
  /** Biçimli telefon; verilirse `tel:` linki olarak gösterilir (sade metin-link, buton değil) */
  phone?: string
  /** Birincil aksiyon ("Mesaj Gönder", prominent); verilmezse buton hiç render edilmez */
  onMessage?: () => void
  /** "N ilanı görüntüle" metin-link aksiyonu; verilmezse render edilmez */
  onViewListings?: () => void
  /** 'panel': dikey, ilan detay yan kolonu · 'inline': yatay şerit, liste içi */
  variant?: 'panel' | 'inline'
}

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false" className={styles.checkIcon}>
    <path d="M4 10.4l3.6 3.6L16 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" aria-hidden focusable="false" className={styles.chevronIcon}>
    <path d="M4.2 2.4 8.4 6l-4.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** tel: href'i rakam-dışı karakterlerden arındırır (bkz. GlassSellerCard aynı yardımcı). */
function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

/**
 * `stats` içinde etiketi "ilan" geçen ilk kaydın değerini kullanarak dinamik
 * link metni üretir (ör. "48 ilanı görüntüle"); bulunamazsa jenerik metne düşer.
 * Türkçe büyük/küçük harf kuralları için `toLocaleLowerCase('tr')` kullanılır
 * (İ/I çevrimi `toLowerCase()` ile hatalı sonuç verir).
 */
function deriveViewListingsLabel(stats?: GlassAgencyCardStat[]): string {
  const listingStat = stats?.find((s) => s.label.toLocaleLowerCase('tr').includes('ilan'))
  return listingStat ? `${listingStat.value} ilanı görüntüle` : 'İlanları görüntüle'
}

export function GlassAgencyCard({
  name,
  logoSrc,
  tagline,
  stats,
  verified = false,
  phone,
  onMessage,
  onViewListings,
  variant = 'panel',
  className,
  ...rest
}: GlassAgencyCardProps) {
  const hasStats = Boolean(stats && stats.length > 0)
  const hasTextActions = Boolean(phone || onViewListings)

  return (
    <section
      data-variant={variant}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.identity}>
        <GlassAvatar
          src={logoSrc}
          name={name}
          alt=""
          shape="rounded"
          size={variant === 'inline' ? 'md' : 'lg'}
          className={styles.logo}
        />
        <div className={styles.who}>
          <span className={styles.name}>{name}</span>
          {tagline ? <span className={styles.tagline}>{tagline}</span> : null}
        </div>
        {verified ? (
          <GlassBadge material="flat" tint="var(--lg-success)" className={styles.verifiedBadge}>
            <CheckIcon />
            Doğrulanmış Kurumsal
          </GlassBadge>
        ) : null}
      </div>

      {hasStats ? (
        <dl className={styles.stats}>
          {stats!.map((stat, i) => (
            <div className={styles.stat} key={`${stat.label}-${i}`}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className={styles.footer}>
        {hasTextActions ? (
          <div className={styles.textActions}>
            {phone ? (
              <GlassLink href={toTelHref(phone)} variant="inline" className={styles.phoneLink}>
                {phone}
              </GlassLink>
            ) : null}
            {onViewListings ? (
              <button type="button" className={styles.viewListings} onClick={onViewListings}>
                {deriveViewListingsLabel(stats)}
                <ChevronIcon />
              </button>
            ) : null}
          </div>
        ) : null}

        {onMessage ? (
          <GlassButton prominent onClick={onMessage} className={styles.messageButton}>
            Mesaj Gönder
          </GlassButton>
        ) : null}
      </div>
    </section>
  )
}
