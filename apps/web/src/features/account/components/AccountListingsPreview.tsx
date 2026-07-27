import { GlassAlert, GlassListingManagementCard } from '@repo/ui'

import type {
  AccountListingPreview as ListingPreview,
  AccountRole,
  AccountSectionError,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'

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

  return (
    <section
      data-account-section="listings"
      aria-labelledby="account-listings-title"
      data-part={error ? 'section-error' : undefined}
    >
      <h2 id="account-listings-title">Son ilanlar</h2>
      {error ? (
        <GlassAlert severity="warning" title="İlanlar yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : visibleListings.length > 0 ? (
        <div data-part="listing-list">
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
        <div data-part="empty-state">
          <p>{isBuyer ? 'Aramaya başlamak için ilanları keşfedin' : 'İlk ilanınızı hazırlayın'}</p>
          <AccountActionLink
            action={
              isBuyer
                ? { kind: 'route', label: 'İlanları keşfedin', to: '/emlak' }
                : { kind: 'route', label: 'İlan vermeye başla', to: '/ilan-ver' }
            }
            variant="text"
          />
        </div>
      )}
    </section>
  )
}
