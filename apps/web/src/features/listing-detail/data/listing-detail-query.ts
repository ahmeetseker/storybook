import { queryOptions } from '@tanstack/react-query'
import { loadListingDetail, type ListingDetailScenario } from './listing-detail-adapter'

export function listingDetailQueryKey(listingId: string, scenario: ListingDetailScenario) {
  return ['listing-detail', listingId, scenario] as const
}

/** Route loader ve client query aynı normalize şemayı paylaşır. */
export function listingDetailQueryOptions(
  listingId: string,
  now: string,
  scenario: ListingDetailScenario = 'default',
) {
  return queryOptions({
    queryKey: listingDetailQueryKey(listingId, scenario),
    queryFn: () => loadListingDetail({ listingId, scenario, now }),
    staleTime: 60_000,
  })
}
