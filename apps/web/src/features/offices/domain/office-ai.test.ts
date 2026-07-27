import { describe, expect, it } from 'vitest'

import { OFFICE_FIXTURES } from '../data/office-adapter'
import { matchOffices, parseOfficePrompt } from './office-ai'
import * as OfficeAi from './office-ai'

describe('office AI brief and evidence-backed matches', () => {
  it('parses a Turkish land-sale brief into explicit filters', () => {
    const proposal = parseOfficePrompt(
      'İzmir Urla’da arsa satışı için imar uzmanı arıyorum',
    )

    expect(proposal.brief).toMatchObject({
      intent: 'sell',
      propertyType: 'land',
      location: 'İzmir/Urla',
    })
    expect(proposal.brief.expertise).toEqual(
      expect.arrayContaining(['land', 'zoning']),
    )
    expect(proposal.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'intent', value: 'sell' }),
        expect.objectContaining({ key: 'city', value: 'izmir' }),
        expect.objectContaining({ key: 'district', value: 'urla' }),
      ]),
    )
    expect(proposal.confidence).toBeGreaterThan(0)
  })

  it('returns ordered matches with reasons and fixture-grounded evidence', () => {
    const { brief } = parseOfficePrompt(
      'İzmir Urla’da arsa satışı için imar uzmanı arıyorum',
    )
    const matches = matchOffices(brief, [...OFFICE_FIXTURES])

    expect(matches).not.toHaveLength(0)
    expect(matches[0]).toMatchObject({ officeId: 'urla-arsa-danismanlik' })
    expect(matches[0]?.score).toBeGreaterThan(0)
    expect(matches[0]?.reasons).not.toHaveLength(0)
    expect(matches[0]?.evidence).not.toHaveLength(0)
    expect(matches[0]?.evidence.every((item) =>
      OFFICE_FIXTURES.find((office) => office.id === matches[0]?.officeId)?.evidence.some(
        (fixtureEvidence) =>
          fixtureEvidence.label === item.label &&
          fixtureEvidence.value === item.value &&
          fixtureEvidence.source === item.source,
      ),
    )).toBe(true)
    expect(matches.map((match) => match.score)).toEqual(
      [...matches.map((match) => match.score)].sort((left, right) => right - left),
    )
  })

  it('removes one reviewed expertise chip and recomputes the matching brief', () => {
    const parsed = parseOfficePrompt(
      'İzmir Urla’da arsa satışı için imar uzmanı arıyorum',
    )
    const proposal = {
      ...parsed,
      summary: 'Eşleşen ofisleri hazırladım.',
    }
    const removeProposalFilter = (OfficeAi as typeof OfficeAi & {
      removeOfficeProposalFilter?: typeof proposal extends infer Proposal
        ? (input: Proposal, id: string) => Proposal
        : never
    }).removeOfficeProposalFilter

    expect(typeof removeProposalFilter).toBe('function')
    const revised = removeProposalFilter?.(proposal, 'expertise::land')

    expect(revised?.filters.filter((filter) => filter.key === 'expertise')).toEqual([
      expect.objectContaining({ value: 'zoning' }),
    ])
    expect(revised?.brief.expertise).toEqual(['zoning'])
    expect(revised?.brief.propertyType).toBe('land')
    expect(matchOffices(revised!.brief, [...OFFICE_FIXTURES])[0]?.reasons).toContain(
      'İstenen uzmanlık profilde yer alıyor.',
    )
  })
})
