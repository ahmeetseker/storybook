import { describe, expect, it } from 'vitest'
import {
  parseAdvisorRouteSearch,
  serializeAdvisorRouteSearch,
} from './advisor-route-search'

describe('advisor route search', () => {
  it('normalizes query and unique comparison ids', () => {
    expect(
      parseAdvisorRouteSearch({
        q: '  Urla arsa  ',
        compare: 'listing-1-1,listing-1-2,listing-1-1,unknown',
      }),
    ).toEqual({
      query: 'Urla arsa',
      compareIds: ['listing-1-1', 'listing-1-2', 'unknown'],
    })
  })

  it('serializes only meaningful values and caps comparison ids', () => {
    expect(
      serializeAdvisorRouteSearch({
        query: '',
        compareIds: ['a', 'b', 'c', 'd'],
      }),
    ).toEqual({ compare: 'a,b,c' })
  })

  it('trims, deduplicates, and omits empty comparison values on serialization', () => {
    expect(
      serializeAdvisorRouteSearch({
        query: '  İzmir arsa  ',
        compareIds: [' a ', '', 'a', 'b', 'c', 'd'],
      }),
    ).toEqual({ q: 'İzmir arsa', compare: 'a,b,c' })
  })
})
