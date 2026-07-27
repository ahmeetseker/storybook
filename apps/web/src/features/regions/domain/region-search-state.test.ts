import { describe, expect, it } from 'vitest'
import { parseRegionSearch, serializeRegionSearch } from './region-search-state'
describe('region search state', () => { it('round trips hierarchy and view', () => { const state = parseRegionSearch({ city:'izmir', district:'urla', view:'list', min:'1000' }); expect(state.city).toBe('izmir'); expect(state.minPrice).toBe(1000); expect(serializeRegionSearch(state)).toMatchObject({ city:'izmir', district:'urla', view:'list', min:1000 }) }) })
