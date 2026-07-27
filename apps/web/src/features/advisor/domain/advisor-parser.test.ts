import { describe, expect, it } from 'vitest'
import {
  mergeAdvisorClarification,
  normalizeTurkishMoney,
  parseAdvisorPrompt,
} from './advisor-parser'

describe('advisor parser', () => {
  it('parses a Turkish land investment request', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir Urla’da 5 milyon TL altında konut imarlı arsa yatırımı',
    )

    expect(proposal.criteria).toMatchObject({
      intent: 'invest',
      city: 'izmir',
      district: 'urla',
      propertyTypes: ['land'],
      budget: { max: 5_000_000 },
    })
    expect(proposal.criteria.mustHave).toContain('zoning')
    expect(proposal.interpretationConfidence).toBeGreaterThanOrEqual(80)
  })

  it('does not parse room count as a budget', () => {
    const proposal = parseAdvisorPrompt(
      'Kadıköy’de metroya yakın kiralık 3+1 daire',
    )

    expect(proposal.criteria.intent).toBe('rent')
    expect(proposal.criteria.city).toBe('istanbul')
    expect(proposal.criteria.district).toBe('kadıköy')
    expect(proposal.criteria.rooms).toBe('3+1')
    expect(proposal.criteria.budget).toEqual({})
    expect(proposal.criteria.preferences).toContain('transport')
  })

  it.each([
    ['5 milyon', 5_000_000],
    ['5.000.000 TL', 5_000_000],
    ['750 bin', 750_000],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeTurkishMoney(input)).toBe(expected)
  })

  it('parses independent minimum and maximum budgets', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de 3 milyon TL üstünde 5 milyon TL altında satılık daire',
    )
    expect(proposal.criteria.budget).toEqual({
      min: 3_000_000,
      max: 5_000_000,
    })
  })

  it('recognizes commercial property without splitting all-real-estate search', () => {
    const proposal = parseAdvisorPrompt(
      'İstanbul Ataşehir’de kiralık ofis',
    )
    expect(proposal.criteria.propertyTypes).toEqual(['commercial'])
    expect(proposal.criteria.intent).toBe('rent')
  })

  it('keeps propertyTypes empty when the user wants all real estate', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de bütçeme uygun satılık emlak arıyorum',
    )
    expect(proposal.criteria.propertyTypes).toEqual([])
  })

  it.each([
    ['İzmir’de satılık ev', ['residential']],
    ['Satılık devremülk', ['timeshare']],
    ['İzmir çevresinde satılık emlak', []],
  ])(
    'matches the standalone ev property term without leaking into %s',
    (query, expectedPropertyTypes) => {
      expect(parseAdvisorPrompt(query).criteria.propertyTypes).toEqual(
        expectedPropertyTypes,
      )
    },
  )

  it('asks one question when a low-confidence request has no location', () => {
    const proposal = parseAdvisorPrompt('Bütçeme uygun bir yer arıyorum')

    expect(proposal.interpretationConfidence).toBeLessThan(70)
    expect(proposal.clarification).toEqual({
      key: 'location',
      question: 'Hangi şehir veya bölgede arama yapalım?',
    })

    const refined = mergeAdvisorClarification(proposal, 'İzmir')
    expect(refined.query).toBe('Bütçeme uygun bir yer arıyorum İzmir')
    expect(refined.criteria.city).toBe('izmir')
    expect(refined.clarification).toEqual({
      key: 'propertyType',
      question: 'Hangi tür taşınmazla ilgileniyorsunuz?',
    })
  })

  it('parses area, deed, and life priorities separately from budget', () => {
    const proposal = parseAdvisorPrompt(
      'Urla’da en az 120 m² en fazla 180 m² müstakil tapulu, sakin yaşam için ev',
    )

    expect(proposal.criteria.area).toEqual({ min: 120, max: 180 })
    expect(proposal.criteria.budget).toEqual({})
    expect(proposal.criteria.mustHave).toContain('detached-deed')
    expect(proposal.criteria.preferences).toContain('quiet-life')
  })

  it('parses Turkish thousand-separated areas followed by punctuation', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de en az 1.200 m², en fazla 2.000 m² ev arıyorum',
    )

    expect(proposal.criteria.area).toEqual({ min: 1_200, max: 2_000 })
  })
})
