import { GlassAlert, GlassEmptyState, GlassListingManagementCard } from '@repo/ui'

import type {
  AccountListingPreview as ListingPreview,
  AccountRole,
  AccountSectionError,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'
import styles from './AccountSections.module.css'

export interface AccountListingsPreviewProps {
  /** Hesap sahibinin ilan oluşturma ya da keşfetme bağlamı. */
  role: AccountRole
  /** Adaptör tarafından desteklenen durumlara indirgenen ilanlar. */
  listings: ListingPreview[]
  /** Bu bölüme ait yerel yükleme hatası. */
  error?: AccountSectionError
}

/** Son iki ilanı veya role uygun boş durumu sunar. */
export function AccountListingsPreview({
  role,
  listings,
  error,
}: AccountListingsPreviewProps) {
  const visibleListings = listings.slice(0, 2)
  const isBuyer = role === 'buyer'
  const hasListings = !error && visibleListings.length > 0

  return (
    <section
      data-account-section="listings"
      aria-labelledby="account-listings-title"
      data-part={error ? 'section-error' : undefined}
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h2 id="account-listings-title" className={styles.cardTitle}>
            Son ilanlar
          </h2>
          {hasListings ? (
            <p className={styles.cardSubtitle}>Son güncellenen ilanlarınız</p>
          ) : null}
        </div>
      </div>
      {error ? (
        <GlassAlert severity="warning" title="İlanlar yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : hasListings ? (
        <div data-part="listing-list" className={styles.listingList}>
          {visibleListings.map((listing) => (
            <GlassListingManagementCard
              key={listing.id}
              title={listing.title}
              state={listing.state}
              issue={listing.issue}
              stats={listing.stats}
              imageSrc={listing.imageSrc}
              imageAlt={listing.imageAlt}
              priceLabel={listing.priceLabel}
              referenceLabel={listing.referenceLabel}
              updatedLabel={listing.updatedLabel}
              headingAs="h3"
            />
          ))}
        </div>
      ) : (
        <div data-part="empty-state" className={styles.emptyState}>
          <GlassEmptyState
            size="sm"
            title={
              isBuyer
                ? 'Aramaya başlamak için ilanları keşfedin'
                : 'İlk ilanınızı hazırlayın'
            }
            description={
              isBuyer
                ? 'Beğendiğiniz ilanları favorilerinize ekleyin; eşleşmeler burada listelenir.'
                : 'İlanınızı yayına aldığınızda durumu ve performansı bu bölümde görünür.'
            }
            action={
              <AccountActionLink
                action={
                  isBuyer
                    ? { kind: 'route', label: 'İlanları keşfedin', to: '/emlak' }
                    : { kind: 'route', label: 'İlan vermeye başla', to: '/ilan-ver' }
                }
                variant="text"
              />
            }
          />
        </div>
      )}
    </section>
  )
}
