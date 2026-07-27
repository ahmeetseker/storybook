import { describe, expect, it } from 'vitest'
import { getRepresentativeListingImage } from '../listings/data/listing-photos'
import { LISTING_FIXTURES } from '../listings/data/listing-adapter'
import { createComparisonListings } from './comparison-listing-adapter'

describe('comparison listing adapter', () => {
  it('keeps URL order, ignores unknown ids, and uses the advisor image', () => {
    const items = createComparisonListings([
      'listing-1-2',
      'unknown',
      'listing-1-1',
    ])

    expect(items.map((item) => item.id)).toEqual([
      'listing-1-2',
      'listing-1-1',
    ])
    expect(items[0].values).toMatchObject({
      konum: 'izmir / urla',
      oda: 'Bilgi sağlanmadı',
      kat: 'Bilgi sağlanmadı',
      yas: 'Bilgi sağlanmadı',
      aidat: 'Bilgi sağlanmadı',
      eids: 'Bilgi sağlanmadı',
    })
    expect(items[0]).toMatchObject({
      score: 'Bilgi sağlanmadı',
      risk: 'Bilgi sağlanmadı',
      verification: 'Bilgi sağlanmadı',
    })

    const listing = LISTING_FIXTURES.find(
      (candidate) => candidate.id === 'listing-1-2',
    )
    expect(listing).toBeDefined()
    expect(items[0].image).toBe(
      getRepresentativeListingImage(listing!).src,
    )
    expect(items[0].imageFallback).toBe(listing!.image.src)
  })

  it('returns no rows when every provided id is unknown', () => {
    expect(createComparisonListings(['unknown', 'retired-id'])).toEqual([])
  })
})
