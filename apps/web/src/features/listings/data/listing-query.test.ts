import { describe, expect, it } from 'vitest'
import { parseListingSearch } from '../domain/search-state'
import { listingQueryKey } from './listing-query'

describe('listing query key', () => {
  it('is stable for equivalent canonical search states', () => {
    const left = parseListingSearch({
      category: 'land',
      type: 'sale',
      page: '1',
    })
    const right = parseListingSearch({
      type: 'sale',
      category: 'land',
    })

    expect(listingQueryKey(left)).toEqual(listingQueryKey(right))
  })
})
