import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LISTING_SEARCH_STATE,
  changeCategory,
  parseListingSearch,
  serializeListingSearch,
  clearListingFilters,
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

  // Katalog aralıkları URL'de `r_<key>Min/Max` olarak yaşar: tarayıcıdan
  // paylaşılan bir arama bağlantısı aynı sonucu vermelidir.
  it('katalog aralıklarını URL ile gidiş-dönüş taşır', () => {
    const state = parseListingSearch({
      'r_building-ageMin': '5',
      'r_building-ageMax': '20',
      r_bathroomsMin: '2',
    })
    expect(state.categoryRanges['building-age']).toEqual({ min: 5, max: 20 })
    expect(state.categoryRanges.bathrooms).toEqual({ min: 2, max: undefined })

    const search = serializeListingSearch(state)
    expect(search['r_building-ageMin']).toBe(5)
    expect(search['r_building-ageMax']).toBe(20)
    expect(search.r_bathroomsMin).toBe(2)
    expect(search.r_bathroomsMax).toBeUndefined()
  })

  it('geçersiz aralık değerlerini yok sayar', () => {
    const state = parseListingSearch({ r_bathroomsMin: 'abc', 'r_duesMax': '-5' })
    expect(state.categoryRanges.bathrooms).toBeUndefined()
    expect(state.categoryRanges.dues).toBeUndefined()
  })

  // Sıfırlama üç ayrı yerde tekrarlanıyordu ve biri güncellenmeden kalınca
  // kullanıcı "sıfırla" dedikten sonra süzülmüş sonuç görüyordu.
  it('clearListingFilters her daraltıcıyı temizler, görünüm tercihini korur', () => {
    const state = parseListingSearch({
      category: 'land',
      city: 'izmir',
      f_zoning: 'residential',
      'r_road-widthMin': '7',
      verified: '1',
      sort: 'newest',
      view: 'grid',
    })
    const cleared = clearListingFilters(state)
    expect(cleared.categoryFilters).toEqual({})
    expect(cleared.categoryRanges).toEqual({})
    expect(cleared.category).toBe('all')
    expect(cleared.city).toBeUndefined()
    expect(cleared.verified).toBe(false)
    // Görünüm tercihleri daraltıcı değildir, korunur.
    expect(cleared.sort).toBe('newest')
    expect(cleared.layout).toBe('grid')
  })
})
