import type { AiFilterProposal } from '../data/listing-adapter'
import {
  changeCategory,
  PROPERTY_CATEGORIES,
  type ListingSearchState,
  type PropertyCategory,
} from './search-state'

export function applyAiProposal(
  state: ListingSearchState,
  proposal: AiFilterProposal,
): ListingSearchState {
  let next = { ...state, page: 1 }

  for (const filter of proposal.filters) {
    if (
      filter.key === 'category' &&
      typeof filter.value === 'string' &&
      PROPERTY_CATEGORIES.includes(filter.value as PropertyCategory)
    ) {
      next = changeCategory(next, filter.value as PropertyCategory)
    } else if (filter.key === 'city' && typeof filter.value === 'string') {
      next = { ...next, city: filter.value, district: undefined, page: 1 }
    } else if (
      filter.key === 'district' &&
      typeof filter.value === 'string'
    ) {
      next = { ...next, district: filter.value, page: 1 }
    } else if (
      filter.key === 'salePriceMax' &&
      typeof filter.value === 'number'
    ) {
      next = {
        ...next,
        salePrice: { ...next.salePrice, max: filter.value },
        page: 1,
      }
    } else if (
      filter.key === 'areaMin' &&
      typeof filter.value === 'number'
    ) {
      next = {
        ...next,
        area: { ...next.area, min: filter.value },
        page: 1,
      }
    } else if (
      filter.key.startsWith('f_') &&
      typeof filter.value === 'string'
    ) {
      next = {
        ...next,
        categoryFilters: {
          ...next.categoryFilters,
          [filter.key.slice(2)]: [filter.value],
        },
        page: 1,
      }
    }
  }

  return next
}

