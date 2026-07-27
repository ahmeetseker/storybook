import { describe, expect, it } from 'vitest'
import { parseAdvisorPrompt } from '../domain/advisor-parser'
import { createFixtureAdvisorSearchAdapter } from './advisor-search-adapter'

describe('fixture advisor search adapter', () => {
  it('returns a proposal and matched listings', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const proposal = parseAdvisorPrompt('İzmir’de satılık emlak')
    const result = await adapter.search(proposal)
    expect(result.proposal.query).toContain('İzmir')
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('returns a deterministic empty result', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({
      listings: [],
      delayMs: 0,
    })
    const result = await adapter.search(parseAdvisorPrompt('İzmir’de arsa'))
    expect(result.matches).toEqual([])
  })

  it('exposes a deterministic failure without changing the proposal', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({
      delayMs: 0,
      fail: true,
    })
    await expect(
      adapter.search(parseAdvisorPrompt('İzmir’de arsa')),
    ).rejects.toThrow('İlanlar şu anda hazırlanamadı.')
  })

  it('honors AbortSignal', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({ delayMs: 20 })
    const controller = new AbortController()
    const request = adapter.search(parseAdvisorPrompt('İzmir'), {
      signal: controller.signal,
    })
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
