import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OFFICE_SEARCH_STATE,
  changeOfficeIntent,
  parseOfficeSearch,
  resetOfficeSearch,
  serializeOfficeSearch,
} from './office-search-state'

describe('office search URL state', () => {
  it('normalizes a URLSearchParams query and serializes its canonical values', () => {
    const state = parseOfficeSearch(
      new URLSearchParams(
        'intent=sell&city=izmir&expertise=land,%20zoning&verified=1&response=30&sort=rating&view=split&page=2',
      ),
    )

    expect(state).toEqual({
      query: '',
      intent: 'sell',
      city: 'izmir',
      expertise: ['land', 'zoning'],
      verifiedOnly: true,
      maxResponseMinutes: 30,
      sort: 'rating',
      layout: 'split',
      page: 2,
    })
    expect(serializeOfficeSearch(state)).toEqual({
      intent: 'sell',
      city: 'izmir',
      expertise: 'land,zoning',
      verified: '1',
      response: 30,
      sort: 'rating',
      view: 'split',
      page: 2,
    })
  })

  it('uses defaults and omits empty or default URL values', () => {
    const state = parseOfficeSearch({
      intent: 'not-an-intent',
      expertise: 'land,land,, zoning ',
      response: '-5',
      sort: 'unexpected',
      view: 'grid',
      page: '0',
      q: '  ',
      city: ' ',
    })

    expect(state).toEqual({
      ...DEFAULT_OFFICE_SEARCH_STATE,
      expertise: ['land', 'zoning'],
    })
    expect(serializeOfficeSearch(state)).toEqual({ expertise: 'land,zoning' })
  })

  it('resets intent-dependent filters and pagination when the intent changes', () => {
    const state = parseOfficeSearch({
      intent: 'sell',
      propertyType: 'land',
      city: 'izmir',
      expertise: 'land,zoning',
      verified: '1',
      response: '30',
      page: '3',
    })

    expect(changeOfficeIntent(state, 'buy')).toEqual({
      ...state,
      intent: 'buy',
      expertise: [],
      page: 1,
    })
  })

  it('resets all filters while retaining the requested intent', () => {
    const state = parseOfficeSearch({
      intent: 'sell',
      city: 'izmir',
      verified: '1',
      page: '4',
    })

    expect(resetOfficeSearch(state)).toEqual({
      ...DEFAULT_OFFICE_SEARCH_STATE,
      intent: 'sell',
    })
  })

  it('round-trips enterprise capacity and transaction-experience filters', () => {
    const state = parseOfficeSearch({
      officeSize: '10',
      portfolio: '40',
      experience: 'sell',
    })

    expect(state).toMatchObject({
      minConsultants: 10,
      minActiveListings: 40,
      transactionExperience: 'sell',
    })
    expect(serializeOfficeSearch(state)).toMatchObject({
      officeSize: 10,
      portfolio: 40,
      experience: 'sell',
    })
  })
})
