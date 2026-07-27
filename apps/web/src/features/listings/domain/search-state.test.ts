import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LISTING_SEARCH_STATE,
  changeCategory,
  parseListingSearch,
  serializeListingSearch,
} from './search-state'

describe('listing search URL state', () => {
  it('uses the all-property, sale-and-rent defaults for an empty query', () => {
    expect(parseListingSearch({})).toEqual(DEFAULT_LISTING_SEARCH_STATE)
  })

  it('normalizes supported search parameters and discards invalid values', () => {
    expect(
      parseListingSearch({
        q: 'denize yakın',
        type: 'rent,sale,unknown',
        category: 'land',
        city: 'izmir',
        district: 'urla',
        salePriceMin: '-1',
        salePriceMax: '3000000',
        areaMin: '500',
        verified: '1',
        owner: 'agency,owner',
        sort: 'price-asc',
        page: '3',
        view: 'grid',
        map: 'split',
        f_zoning: 'residential,tourism',
      }),
    ).toMatchObject({
      query: 'denize yakın',
      transactions: ['sale', 'rent'],
      category: 'land',
      city: 'izmir',
      district: 'urla',
      salePrice: { max: 3_000_000 },
      area: { min: 500 },
      verified: true,
      owners: ['owner', 'agency'],
      sort: 'price-asc',
      page: 3,
      layout: 'grid',
      mapMode: 'split',
      categoryFilters: { zoning: ['residential', 'tourism'] },
    })
  })

  it('serializes a canonical query without default presentation values', () => {
    const state = parseListingSearch({
      category: 'residential',
      type: 'rent',
      city: 'istanbul',
      rentPriceMax: '45000',
      f_rooms: '2+1,3+1',
    })

    expect(serializeListingSearch(state)).toEqual({
      type: 'rent',
      category: 'residential',
      city: 'istanbul',
      rentPriceMax: 45_000,
      f_rooms: '2+1,3+1',
    })
  })

  it('keeps common filters and removes category-specific filters when category changes', () => {
    const landState = parseListingSearch({
      category: 'land',
      verified: '1',
      areaMin: '500',
      f_zoning: 'residential',
    })

    expect(changeCategory(landState, 'residential')).toMatchObject({
      category: 'residential',
      verified: true,
      area: { min: 500 },
      categoryFilters: {},
      page: 1,
    })
  })
})
