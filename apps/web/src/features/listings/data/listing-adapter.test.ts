import { describe, expect, it } from 'vitest'
import { parseListingSearch } from '../domain/search-state'
import {
  parseNaturalLanguage,
  searchListings,
} from './listing-adapter'

describe('listing mock adapter', () => {
  it('filters land listings by transaction, city, price, area and zoning', async () => {
    const response = await searchListings({
      state: parseListingSearch({
        type: 'sale',
        category: 'land',
        city: 'izmir',
        salePriceMax: '5000000',
        areaMin: '400',
        f_zoning: 'residential',
      }),
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThan(0)
    expect(response.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'land',
          transaction: 'sale',
          city: 'izmir',
          verified: true,
        }),
      ]),
    )
    expect(
      response.items.every(
        (item) =>
          item.category === 'land' &&
          item.city === 'izmir' &&
          item.price <= 5_000_000 &&
          item.area >= 400 &&
          item.attributes.zoning === 'residential',
      ),
    ).toBe(true)
  })

  it('returns facet counts and stable 24-item pagination', async () => {
    const first = await searchListings({
      state: parseListingSearch({}),
      pageSize: 24,
    })
    const second = await searchListings({
      state: parseListingSearch({ page: '2' }),
      pageSize: 24,
    })

    expect(first.total).toBeGreaterThan(24)
    expect(first.items).toHaveLength(24)
    expect(second.items).toHaveLength(24)
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id)
    expect(first.facets.category).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'land', count: expect.any(Number) }),
        expect.objectContaining({
          value: 'residential',
          count: expect.any(Number),
        }),
      ]),
    )
  })

  it('parses natural language into proposals without mutating search state', async () => {
    const proposal = await parseNaturalLanguage(
      'İzmir Urla’da 5 milyon altı, 500 metrekare konut imarlı arsa',
    )

    expect(proposal.confidence).toBeGreaterThan(70)
    expect(proposal.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'city', value: 'izmir' }),
        expect.objectContaining({ key: 'category', value: 'land' }),
        expect.objectContaining({ key: 'salePriceMax', value: 5_000_000 }),
        expect.objectContaining({ key: 'areaMin', value: 500 }),
      ]),
    )
  })
})
