import { describe, expect, it } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import type { AdvisorCriteria } from './advisor-types'
import { parseAdvisorPrompt } from './advisor-parser'
import { matchAdvisorListings } from './advisor-matcher'

describe('advisor matcher', () => {
  it('hard-filters intent, location, type, and maximum budget', () => {
    const { criteria } = parseAdvisorPrompt(
      'İzmir Urla’da 5 milyon TL altında satılık arsa',
    )
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every(({ listing }) => listing.transaction === 'sale')).toBe(true)
    expect(matches.every(({ listing }) => listing.city === 'izmir')).toBe(true)
    expect(matches.every(({ listing }) => listing.district === 'urla')).toBe(true)
    expect(matches.every(({ listing }) => listing.category === 'land')).toBe(true)
    expect(matches.every(({ listing }) => listing.price <= 5_000_000)).toBe(true)
  })

  it('returns concrete reasons and missing-data evidence', () => {
    const { criteria } = parseAdvisorPrompt(
      'Urla’da imarlı ve yola cepheli arsa',
    )
    const [match] = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(match.reasons).toContain('Konut imarı tercihinizle eşleşiyor.')
    expect(match.criteria.some((item) => item.key === 'road')).toBe(true)
    expect(match.evidence.some((item) => item.title === 'EİDS taşınmaz yetkisi')).toBe(true)
  })

  it('uses preferences for ranking without filtering misses out', () => {
    const { criteria } = parseAdvisorPrompt('Urla’da denize yakın arsa')
    const base = LISTING_FIXTURES[0]
    const withoutSea = {
      ...base,
      id: 'without-sea',
      title: 'Urla’da merkezde imarlı parsel',
      highlights: ['Konut imarlı', 'Müstakil tapu'],
    }
    const matches = matchAdvisorListings(criteria, [base, withoutSea])

    expect(matches).toHaveLength(2)
    expect(matches[0]?.listing.id).toBe(base.id)
    expect(
      matches[1]?.criteria.find((item) => item.key === 'sea'),
    ).toMatchObject({ kind: 'preference', matched: false })
  })

  it('treats an explicit room count as a hard criterion', () => {
    const { criteria } = parseAdvisorPrompt('Bursa Nilüfer’de satılık 3+1 daire')
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(matches.length).toBeGreaterThan(0)
    expect(
      matches.every(({ listing }) => listing.attributes.rooms === '3+1'),
    ).toBe(true)
  })

  it('always provides a concrete reason for generic real-estate requests', () => {
    const { criteria } = parseAdvisorPrompt('İzmir’de satılık emlak')
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every((match) => match.reasons.length > 0)).toBe(true)
    expect(matches[0]?.reasons[0]).toContain('İzmir')
  })

  it('maps every requested structural and life-priority feature to matched criteria', () => {
    const listing = {
      ...LISTING_FIXTURES[0],
      title: 'Denize yakın yola cepheli sakin aile sitesi',
      highlights: ['Konut imarlı', 'Müstakil tapu', 'Metro ulaşımı', 'Yüksek kira getirisi'],
    }
    const criteria: AdvisorCriteria = {
      intent: 'buy',
      propertyTypes: ['land'],
      budget: {},
      area: {},
      mustHave: ['zoning', 'detached-deed', 'sea', 'road', 'transport', 'quiet-life', 'family-life', 'rental-yield'],
      preferences: [],
    }

    const [match] = matchAdvisorListings(criteria, [listing])

    expect(match.criteria.map((item) => item.key)).toEqual(criteria.mustHave)
    expect(match.criteria.every((item) => item.kind === 'required' && item.matched)).toBe(true)
  })

  it('surfaces unavailable preference data without scoring it as a match', () => {
    const criteria: AdvisorCriteria = {
      intent: 'buy',
      propertyTypes: ['land'],
      budget: {},
      area: {},
      mustHave: [],
      preferences: ['sea'],
    }
    const listing = {
      ...LISTING_FIXTURES[0],
      title: 'Urla’da merkezde imarlı parsel',
      highlights: ['Konut imarlı', 'Müstakil tapu'],
    }

    const [match] = matchAdvisorListings(criteria, [listing])

    expect(match.criteria.find((item) => item.key === 'sea')).toMatchObject({
      kind: 'preference',
      matched: false,
    })
    expect(match.missingData).toContain('Denize yakınlık bilgisi ilan detaylarında belirtilmemiş.')
    expect(match.score).toBe(70)
  })
})
