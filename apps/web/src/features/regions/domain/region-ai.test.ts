import { describe, expect, it } from 'vitest'
import { matchRegions, parseRegionPrompt } from './region-ai'
import { REGIONS } from '../data/region-adapter'
import { DEFAULT_REGION_SEARCH_STATE } from './region-search-state'
describe('region ai', () => { it('parses prompt into reviewable filters', () => { const proposal = parseRegionPrompt('İzmirde denize yakın imarlı arsa yatırımı'); expect(proposal.filters.map((f) => f.key)).toEqual(['intent','city','propertyType']); expect(proposal.confidence).toBeGreaterThan(80) }); it('ranks city matches first', () => { const matches = matchRegions({...DEFAULT_REGION_SEARCH_STATE, city:'izmir'}, REGIONS); expect(matches[0]?.city).toBe('izmir') }) })
