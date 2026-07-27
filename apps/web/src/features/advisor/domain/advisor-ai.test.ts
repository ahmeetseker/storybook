import { describe, expect, it } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import { matchAdvisorListings, parseAdvisorPrompt } from './advisor-ai'

describe('advisor ai compatibility boundary', () => {
  it('re-exports the normalized Turkish parser', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir Urla’da konut imarlı arsa yatırımı',
    )

    expect(proposal.criteria.city).toBe('izmir')
    expect(proposal.criteria.propertyTypes).toEqual(['land'])
    expect(proposal.interpretationConfidence).toBeGreaterThan(80)
    expect(proposal.criteria).not.toHaveProperty('propertyType')
    expect(proposal).not.toHaveProperty('confidence')
  })

  it('re-exports explainable deterministic matches with evidence', () => {
    const matches = matchAdvisorListings(
      parseAdvisorPrompt('İzmir imarlı arsa').criteria,
      LISTING_FIXTURES,
    )

    expect(matches).toHaveLength(6)
    expect(matches[0]).toMatchObject({
      listing: LISTING_FIXTURES[0],
      score: 70,
      reasons: ['Konut imarı tercihinizle eşleşiyor.'],
      criteria: [
        {
          key: 'zoning',
          kind: 'required',
          matched: true,
        },
      ],
      missingData: [],
    })
    expect(matches[0]?.evidence).toHaveLength(1)
  })
})
