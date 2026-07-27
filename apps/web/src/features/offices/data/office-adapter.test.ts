import { describe, expect, it } from 'vitest'

import { searchOffices } from './office-adapter'
import { DEFAULT_OFFICE_SEARCH_STATE } from '../domain/office-search-state'

describe('searchOffices', () => {
  it('returns a broad deterministic directory for the default search', async () => {
    const response = await searchOffices({
      state: DEFAULT_OFFICE_SEARCH_STATE,
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThanOrEqual(12)
    expect(response.items).toHaveLength(response.total)
    expect(response.facets.cities).not.toHaveLength(0)
    expect(response.facets.expertise).not.toHaveLength(0)
  })

  it('filters the directory by city', async () => {
    const response = await searchOffices({
      state: { ...DEFAULT_OFFICE_SEARCH_STATE, city: 'izmir' },
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThan(0)
    expect(response.items.every((office) => office.city === 'izmir')).toBe(true)
  })

  it('excludes unverified offices when verification is required', async () => {
    const response = await searchOffices({
      state: { ...DEFAULT_OFFICE_SEARCH_STATE, verifiedOnly: true },
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThan(0)
    expect(response.items.every((office) => office.verified)).toBe(true)
  })

  it('sorts results by ascending response time', async () => {
    const response = await searchOffices({
      state: { ...DEFAULT_OFFICE_SEARCH_STATE, sort: 'response' },
      pageSize: 24,
    })

    expect(response.items.map((office) => office.responseMinutes)).toEqual(
      [...response.items.map((office) => office.responseMinutes)].sort(
        (left, right) => left - right,
      ),
    )
  })

  it('applies office capacity, portfolio, and sales experience filters', async () => {
    const response = await searchOffices({
      state: {
        ...DEFAULT_OFFICE_SEARCH_STATE,
        minConsultants: 10,
        minActiveListings: 40,
        transactionExperience: 'sell',
      },
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThan(0)
    expect(response.items.every((office) => office.consultants >= 10 && office.activeListings >= 40 && office.intents.includes('sell'))).toBe(true)
  })
})
