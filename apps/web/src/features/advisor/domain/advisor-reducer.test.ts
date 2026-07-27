import { describe, expect, it } from 'vitest'
import {
  advisorReducer,
  createInitialAdvisorState,
} from './advisor-reducer'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import { matchAdvisorListings } from './advisor-matcher'
import {
  mergeAdvisorClarification,
  parseAdvisorPrompt,
} from './advisor-parser'

describe('advisor reducer', () => {
  it('moves from idle to analyzing without losing the query', () => {
    const state = createInitialAdvisorState()
    const proposal = parseAdvisorPrompt('Urla’da arsa')
    const next = advisorReducer(state, { type: 'QUERY_SUBMITTED', proposal })

    expect(next.status).toBe('analyzing')
    expect(next.query).toBe('Urla’da arsa')
    expect(next.proposal).toBe(proposal)
    expect(next.error).toBeUndefined()
  })

  it('enforces the three-listing comparison limit', () => {
    const initial = {
      ...createInitialAdvisorState(),
      compareIds: ['a', 'b', 'c'],
    }
    const next = advisorReducer(initial, {
      type: 'COMPARE_TOGGLED',
      listingId: 'd',
    })

    expect(next.compareIds).toEqual(['a', 'b', 'c'])
    expect(next.notice).toBe('En fazla 3 ilan karşılaştırabilirsiniz.')
  })

  it('returns to the previous stable status after cancellation', () => {
    const initial = { ...createInitialAdvisorState(), status: 'results' as const }
    const analyzing = advisorReducer(initial, {
      type: 'QUERY_SUBMITTED',
      proposal: parseAdvisorPrompt('Kadıköy kiralık'),
    })
    const cancelled = advisorReducer(analyzing, { type: 'QUERY_CANCELLED' })

    expect(cancelled.status).toBe('results')
    expect(cancelled.notice).toBe('Analiz durduruldu.')
  })

  it('restores the original stable snapshot after replacement analysis cancellation', () => {
    const stableProposal = parseAdvisorPrompt('Urla’da arsa')
    const stableMatches = matchAdvisorListings(
      stableProposal.criteria,
      LISTING_FIXTURES,
    )
    const results = {
      ...createInitialAdvisorState(),
      status: 'results' as const,
      proposal: stableProposal,
      matches: stableMatches,
    }
    const firstRequest = advisorReducer(results, {
      type: 'QUERY_SUBMITTED',
      proposal: parseAdvisorPrompt('Çeşme’de arsa'),
    })
    const replacement = advisorReducer(firstRequest, {
      type: 'QUERY_SUBMITTED',
      proposal: parseAdvisorPrompt('Kadıköy’de kiralık daire'),
    })
    const cancelled = advisorReducer(replacement, { type: 'QUERY_CANCELLED' })

    expect(cancelled.status).toBe('results')
    expect(cancelled.proposal).toBe(stableProposal)
    expect(cancelled.matches).toEqual(stableMatches)
    expect(cancelled.query).toBe('Kadıköy’de kiralık daire')
    expect(cancelled.error).toBeUndefined()
    expect(cancelled.notice).toBe('Analiz durduruldu.')
  })

  it('restores the original error details when retry analysis is cancelled', () => {
    const failedProposal = parseAdvisorPrompt('Urla’da arsa')
    const error = {
      ...createInitialAdvisorState(),
      status: 'error' as const,
      proposal: failedProposal,
      error: 'Özgün adapter hatası.',
    }
    const retrying = advisorReducer(error, {
      type: 'QUERY_SUBMITTED',
      proposal: failedProposal,
    })
    const cancelled = advisorReducer(retrying, { type: 'QUERY_CANCELLED' })

    expect(cancelled.status).toBe('error')
    expect(cancelled.proposal).toBe(failedProposal)
    expect(cancelled.error).toBe('Özgün adapter hatası.')
    expect(cancelled.query).toBe(failedProposal.query)
    expect(cancelled.notice).toBe('Analiz durduruldu.')
  })

  it('keeps the resolved proposal when a clarification analysis is cancelled', () => {
    const vague = parseAdvisorPrompt('Bütçeme uygun bir yer arıyorum')
    let state = advisorReducer(createInitialAdvisorState(), {
      type: 'QUERY_SUBMITTED',
      proposal: vague,
    })
    state = advisorReducer(state, {
      type: 'CLARIFICATION_REQUIRED',
      proposal: vague,
    })

    const located = mergeAdvisorClarification(vague, 'İzmir')
    state = advisorReducer(state, {
      type: 'QUERY_SUBMITTED',
      proposal: located,
    })
    state = advisorReducer(state, {
      type: 'CLARIFICATION_REQUIRED',
      proposal: located,
    })

    const resolved = mergeAdvisorClarification(located, 'Arsa')
    expect(resolved.clarification).toBeUndefined()
    const analyzing = advisorReducer(state, {
      type: 'QUERY_SUBMITTED',
      proposal: resolved,
    })
    const cancelled = advisorReducer(analyzing, {
      type: 'QUERY_CANCELLED',
    })

    expect(cancelled.status).toBe('idle')
    expect(cancelled.query).toBe(
      'Bütçeme uygun bir yer arıyorum İzmir Arsa',
    )
    expect(cancelled.proposal).toBe(resolved)
    expect(cancelled.proposal?.clarification).toBeUndefined()
    expect(cancelled.notice).toBe('Analiz durduruldu.')
  })

  it('preserves parsed criteria when analysis fails', () => {
    const proposal = parseAdvisorPrompt('İzmir’de 5 milyon TL altında satılık arsa')
    const failed = advisorReducer(
      advisorReducer(createInitialAdvisorState(), { type: 'QUERY_SUBMITTED', proposal }),
      { type: 'ANALYSIS_FAILED', message: 'İlanlar şu anda hazırlanamadı.' },
    )

    expect(failed.status).toBe('error')
    expect(failed.proposal?.criteria).toEqual(proposal.criteria)
    expect(failed.query).toBe(proposal.query)
  })

  it('keeps one clarification question in the idle state', () => {
    const proposal = parseAdvisorPrompt('Bütçeme uygun bir yer arıyorum')
    const next = advisorReducer(createInitialAdvisorState(), {
      type: 'CLARIFICATION_REQUIRED',
      proposal,
    })

    expect(next.status).toBe('idle')
    expect(next.proposal).toBe(proposal)
    expect(next.query).toBe('')
    expect(next.notice).toBe('Hangi şehir veya bölgede arama yapalım?')
  })

  it('removes scalar and feature criteria without mutating the source', () => {
    const proposal = parseAdvisorPrompt('Urla’da 5 milyon TL altında imarlı arsa')
    const initial = { ...createInitialAdvisorState(), proposal }
    const withoutBudget = advisorReducer(initial, {
      type: 'CRITERION_REMOVED',
      removal: { key: 'budgetMax' },
    })
    const withoutZoning = advisorReducer(withoutBudget, {
      type: 'CRITERION_REMOVED',
      removal: { key: 'mustHave', feature: 'zoning' },
    })

    expect(withoutBudget.proposal?.criteria.budget.max).toBeUndefined()
    expect(withoutZoning.proposal?.criteria.mustHave).not.toContain('zoning')
    expect(proposal.criteria.budget.max).toBe(5_000_000)
  })

  it('clears a district when its city criterion is removed', () => {
    const proposal = parseAdvisorPrompt('Urla’da arsa')
    const next = advisorReducer(
      { ...createInitialAdvisorState(), proposal },
      { type: 'CRITERION_REMOVED', removal: { key: 'city' } },
    )

    expect(next.proposal?.criteria.city).toBeUndefined()
    expect(next.proposal?.criteria.district).toBeUndefined()
    expect(proposal.criteria.city).toBe('izmir')
  })

  it('removes an already selected listing before applying the comparison cap', () => {
    const next = advisorReducer(
      { ...createInitialAdvisorState(), compareIds: ['a', 'b', 'c'] },
      { type: 'COMPARE_TOGGLED', listingId: 'b' },
    )

    expect(next.compareIds).toEqual(['a', 'c'])
    expect(next.notice).toBeUndefined()
  })

  it('deduplicates and caps initial comparison IDs', () => {
    expect(
      createInitialAdvisorState({ compareIds: ['a', 'b', 'a', 'c', 'd'] }).compareIds,
    ).toEqual(['a', 'b', 'c'])
  })

  it('records truthful session-only save and alert notices', () => {
    const saved = advisorReducer(createInitialAdvisorState(), {
      type: 'SEARCH_SAVED',
    })
    expect(saved.notice).toBe(
      'Arama yalnız bu demo oturumu için kaydedildi.',
    )
    expect(saved.history.at(-1)?.detail).toBe(
      'Arama yalnız bu demo oturumu için kaydedildi.',
    )

    const alerted = advisorReducer(saved, { type: 'ALERT_CREATED' })
    expect(alerted.notice).toBe(
      'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
    )
    expect(alerted.history.at(-1)?.detail).toBe(
      'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
    )
  })

  it('records exact approval and rejection outcomes', () => {
    const rejected = advisorReducer(createInitialAdvisorState(), {
      type: 'CONSENT_REJECTED',
    })
    expect(rejected.notice).toBe('Paylaşım yapılmadı.')
    expect(rejected.history.at(-1)?.detail).toBe('Paylaşım yapılmadı.')

    const approved = advisorReducer(rejected, { type: 'CONSENT_APPROVED' })
    expect(approved.notice).toBe(
      'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
    )
    expect(approved.history.at(-1)?.detail).toBe(
      'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
    )
  })
})
