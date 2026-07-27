import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  serializeOfficeSearch,
  type OfficeSearchState,
} from '../domain/office-search-state'
import { searchOffices } from './office-adapter'

export function officeQueryKey(state: OfficeSearchState) {
  return ['offices', serializeOfficeSearch(state)] as const
}

export function officeQueryOptions(state: OfficeSearchState) {
  return queryOptions({
    queryKey: officeQueryKey(state),
    queryFn: () => searchOffices({ state, pageSize: 18 }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
