import { useMemo, useState } from 'react'
import {
  GlassAlert,
  GlassEmptyState,
  GlassListingManagementCard,
  GlassSegmentedControl,
} from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type {
  AccountDashboardData,
  AccountListingPreview,
  AccountListingState,
} from '../domain/account-types'

import styles from './AccountPages.module.css'

/** İlan listesinin durum filtresi kimlikleri. */
type ListingFilterId = 'all' | 'live' | 'action' | 'draft' | 'expired'

/**
 * Filtre kovaları. Kovalar TÜKETİCİDİR: her yaşam döngüsü durumu en az bir
 * kovaya düşer, böylece "Tümü" dışında hiçbir ilan görünmez kalmaz.
 * - `action`  → düzenleme istenen + incelemedeki ilanlar
 * - `expired` → süresi dolan + yayından duraklatılan ilanlar
 */
const FILTER_BUCKETS: Record<
  Exclude<ListingFilterId, 'all'>,
  readonly AccountListingState[]
> = {
  live: ['live'],
  action: ['changes', 'review'],
  draft: ['draft'],
  expired: ['expired', 'paused'],
}

const FILTER_ORDER: readonly ListingFilterId[] = [
  'all',
  'live',
  'action',
  'draft',
  'expired',
]

const FILTER_LABELS: Record<ListingFilterId, string> = {
  all: 'Tümü',
  live: 'Yayında',
  action: 'İşlem gereken',
  draft: 'Taslak',
  expired: 'Süresi dolan',
}

/** Filtrelenmiş liste boşken kovaya özgü açıklama. */
const EMPTY_FILTER_TEXT: Record<ListingFilterId, string> = {
  all: 'Bu hesapta henüz ilan yok.',
  live: 'Şu anda yayında olan ilanınız yok.',
  action: 'İşlem bekleyen ilanınız yok; hepsi güncel.',
  draft: 'Kaydedilmiş taslak ilanınız yok.',
  expired: 'Süresi dolan ya da duraklatılan ilanınız yok.',
}

function matchesFilter(listing: AccountListingPreview, filter: ListingFilterId) {
  if (filter === 'all') return true
  // "İşlem gereken" yaşam döngüsü durumundan bağımsız olarak açık bir
  // düzeltme notu taşıyan ilanları da kapsar.
  if (filter === 'action' && listing.issue) return true
  return FILTER_BUCKETS[filter].includes(listing.state)
}

export interface AccountListingsPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "İlanlarım" alt sayfası: ilan portföyünün sayaçlı özeti ve durum filtresiyle
 * çalışılabilir tam liste. Filtre bir `radiogroup`tur (ok tuşlarıyla gezinir);
 * seçili kova sayfanın yerel durumudur, rotaya yazılmaz.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountListingsPage({ data }: AccountListingsPageProps) {
  const [filter, setFilter] = useState<ListingFilterId>('all')

  const error = data.sectionErrors.find((item) => item.section === 'listings')
  const listings = data.listings

  const counts = useMemo(() => {
    const result = {} as Record<ListingFilterId, number>
    for (const id of FILTER_ORDER) {
      result[id] = listings.filter((listing) => matchesFilter(listing, id)).length
    }
    return result
  }, [listings])

  const visibleListings = useMemo(
    () => listings.filter((listing) => matchesFilter(listing, filter)),
    [listings, filter],
  )

  const options = FILTER_ORDER.map((id) => ({
    value: id,
    // Sayaç etikete yazılır: bilgi yalnız görsel bir rozette kalmaz, radio
    // düğmesinin erişilebilir adının parçası olur.
    label: `${FILTER_LABELS[id]} (${counts[id]})`,
  }))

  const hasListings = listings.length > 0
  const actionCount = counts.action

  return (
    <>
      <h1 className={styles.pageTitle}>İlanlarım</h1>

      <section
        data-account-section="listings-summary"
        aria-labelledby="account-listings-summary-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-listings-summary-title" className={sectionStyles.cardTitle}>
              İlan özeti
            </h2>
            <p className={styles.subtitle}>
              Portföyünüzün durum dağılımı; ayrıntı için aşağıdaki listeyi filtreleyin.
            </p>
          </div>
        </div>

        <dl data-part="listing-stats" className={styles.statGrid}>
          {(['all', 'live', 'action', 'draft'] as const).map((id) => (
            <div key={id} data-part={`listing-stat-${id}`} className={styles.statTile}>
              <dt className={styles.statLabel}>
                {id === 'all' ? 'Toplam ilan' : FILTER_LABELS[id]}
              </dt>
              <dd className={styles.statValue}>{counts[id]}</dd>
            </div>
          ))}
        </dl>

        {actionCount > 0 ? (
          <GlassAlert
            data-part="listing-action-alert"
            severity="warning"
            title="İşlem bekleyen ilan var"
          >
            {actionCount} ilanınız yayına devam etmek için düzenleme bekliyor.
          </GlassAlert>
        ) : null}
      </section>

      <section
        data-account-section="listings"
        aria-labelledby="account-listings-title"
        data-part={error ? 'section-error' : undefined}
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-listings-title" className={sectionStyles.cardTitle}>
              Tüm ilanlar
            </h2>
            <p className={styles.subtitle}>
              Durum, fiyat ve son güncellenme bilgisiyle ilanlarınızı yönetin.
            </p>
          </div>
          <p className={styles.meta}>{visibleListings.length} ilan listeleniyor</p>
        </div>

        {error ? (
          <GlassAlert severity="warning" title="İlanlar yüklenemedi">
            {error.message}
          </GlassAlert>
        ) : (
          <>
            {hasListings ? (
              <div className={styles.filterBar}>
                <GlassSegmentedControl
                  data-part="listing-filter"
                  variant="bar"
                  fill="content"
                  size="sm"
                  label="İlan durumu filtresi"
                  options={options}
                  value={filter}
                  onChange={(next) => setFilter(next as ListingFilterId)}
                />
              </div>
            ) : null}

            {visibleListings.length > 0 ? (
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
                    actions={
                      <span className={styles.listingActions}>
                        <AccountActionLink
                          action={{
                            kind: 'route',
                            label: 'İlanı düzenle',
                            to: '/ilan-ver',
                          }}
                          variant="secondary"
                        />
                        <AccountActionLink
                          action={{
                            kind: 'route',
                            label: 'İlanı yayında gör',
                            to: '/emlak',
                          }}
                          variant="text"
                        />
                      </span>
                    }
                  />
                ))}
              </div>
            ) : (
              <div data-part="empty-state" className={styles.emptyState}>
                <GlassEmptyState
                  size="sm"
                  title={
                    hasListings
                      ? 'Bu filtrede ilan yok'
                      : 'İlk ilanınızı hazırlayın'
                  }
                  description={
                    hasListings
                      ? EMPTY_FILTER_TEXT[filter]
                      : 'İlanınızı yayına aldığınızda durumu ve performansı bu sayfada görünür.'
                  }
                  action={
                    hasListings ? (
                      <button
                        type="button"
                        className={styles.plainButton}
                        onClick={() => setFilter('all')}
                      >
                        Tüm ilanları göster
                      </button>
                    ) : (
                      <AccountActionLink
                        action={{
                          kind: 'route',
                          label: 'İlan vermeye başla',
                          to: '/ilan-ver',
                        }}
                        variant="secondary"
                      />
                    )
                  }
                />
              </div>
            )}
          </>
        )}

        <div className={sectionStyles.cardFooter}>
          <AccountActionLink
            action={{ kind: 'route', label: 'Yeni ilan ver', to: '/ilan-ver' }}
            variant="secondary"
          />
          <AccountActionLink
            action={{ kind: 'route', label: 'Favorilerinizi açın', to: '/favoriler' }}
            variant="text"
          />
        </div>
      </section>
    </>
  )
}
