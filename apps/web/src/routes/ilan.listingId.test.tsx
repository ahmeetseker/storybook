import { describe, expect, it } from 'vitest'
import { parseListingDetailSearch } from './ilan.$listingId'

describe('parseListingDetailSearch', () => {
  it('geçerli senaryoyu korur', () => {
    expect(parseListingDetailSearch({ senaryo: 'stale-planning' })).toEqual({ senaryo: 'stale-planning' })
  })

  it('bilinmeyen senaryoyu sessizce düşürür', () => {
    expect(parseListingDetailSearch({ senaryo: 'uydurma' })).toEqual({})
  })

  it('senaryo verilmediğinde boş arama döner', () => {
    expect(parseListingDetailSearch({})).toEqual({})
  })
})
