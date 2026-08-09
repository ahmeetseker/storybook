import { GlassListingRowCard } from '@repo/ui'

import type { AccountListingPreview, AccountListingState } from '../domain/account-types'

import styles from './AccountListingRow.module.css'

/** Yaşam döngüsü durumunun kullanıcıya görünen adı. Durum RENKLE DEĞİL metinle
 *  iletilir; renk yalnız aynı bilgiyi pekiştirir (ErisilebilirlikMotionResponsive.mdx). */
const STATE_LABELS: Record<AccountListingState, string> = {
  draft: 'Taslak',
  review: 'İncelemede',
  live: 'Yayında',
  changes: 'Değişiklik istendi',
  paused: 'Duraklatıldı',
  expired: 'Süresi doldu',
}

/** Görseli olmayan ilan için nötr dolgu — kart `img` beklediğinden boş `src` bırakılmaz. */
const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480">' +
    '<rect width="720" height="480" fill="#e8e4dd"/>' +
    '<path d="M0 372 176 232l92 78 128-150 324 212v108H0Z" fill="rgba(0,0,0,.08)"/>' +
    '<circle cx="566" cy="112" r="44" fill="rgba(0,0,0,.06)"/>' +
    '</svg>',
)}`

function WarningIcon() {
  return (
    <svg
      className={styles.issueIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      focusable="false"
    >
      <path d="M12 4.2 21 19.4H3Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export interface AccountListingRowProps {
  /** Adaptörden gelen, hesap alanına indirgenmiş ilan. */
  listing: AccountListingPreview
  /** Kartın başlık seviyesi — bölümün kendi başlık hiyerarşisine uyar. */
  headingAs?: 'h2' | 'h3' | 'h4'
  /** Yoğunluk: bölüm kartının içinde `sm`, tam sayfa listede `md`. */
  size?: 'sm' | 'md'
}

/**
 * Hesap alanındaki ilanları pazar yeriyle aynı yatay kartla (`GlassListingRowCard`)
 * çizer. Yönetim bilgisi karta şu yuvalardan girer:
 * durum → medya rozeti, "işlem gerekli" → not satırı, metrikler → özellik rozetleri,
 * güncellenme → ayak tarihi, ilan numarası → ayak metası.
 */
export function AccountListingRow({
  listing,
  headingAs = 'h3',
  size = 'sm',
}: AccountListingRowProps) {
  return (
    <GlassListingRowCard
      data-state={listing.state}
      size={size}
      headingAs={headingAs}
      image={{ src: listing.imageSrc ?? FALLBACK_IMAGE, alt: listing.imageAlt }}
      badge={
        <span className={styles.state} data-state={listing.state}>
          {STATE_LABELS[listing.state]}
        </span>
      }
      title={listing.title}
      price={listing.priceLabel ?? 'Fiyat girilmedi'}
      features={listing.stats.map((stat) => ({
        // Rozet tek satırdır: etiket ve değer "248 görüntülenme" gibi tek
        // ifadeye iner, sayı bağlamsız kalmaz.
        label: `${stat.value} ${stat.label.toLocaleLowerCase('tr-TR')}`,
      }))}
      note={
        listing.issue
          ? { text: `İşlem gerekli: ${listing.issue}`, icon: <WarningIcon /> }
          : undefined
      }
      listedAt={listing.updatedLabel}
      footerMeta={listing.referenceLabel}
    />
  )
}
