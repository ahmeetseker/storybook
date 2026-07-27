import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  serializeListingSearch,
  type ListingSearchState,
} from '../domain/search-state'
import { searchListings } from './listing-adapter'

export function listingQueryKey(state: ListingSearchState) {
  return ['listings', serializeListingSearch(state)] as const
}

export function listingQueryOptions(state: ListingSearchState) {
  return queryOptions({
    queryKey: listingQueryKey(state),
    queryFn: ({ signal }) =>
      searchListings({ state, pageSize: 24, signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

