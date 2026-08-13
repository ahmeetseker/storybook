import { describe, expect, it } from 'vitest'
import { listingsForRegion } from './region-listings'
import { REGIONS } from './region-adapter'
import { LISTING_FIXTURES } from '@/features/listings/data/listing-adapter'

const urla = REGIONS.find((region) => region.id === 'izmir-urla')!
const konyaalti = REGIONS.find((region) => region.id === 'antalya-konyaalti')!

describe('listingsForRegion', () => {
  it('yalnız o bölgenin ilanlarını pine çevirir', () => {
    const pins = listingsForRegion(urla)
    expect(pins.length).toBeGreaterThan(0)
    const urlaIds = new Set(
      LISTING_FIXTURES.filter((l) => l.city === 'izmir' && l.district === 'urla').map((l) => l.id),
    )
    for (const pin of pins) expect(urlaIds.has(pin.id)).toBe(true)
  })

  it('pinler kapsül fiyat etiketi ve iki konum dili taşır', () => {
    const pin = listingsForRegion(urla)[0]
    expect(pin.price).toMatch(/^₺/)
    expect(pin.lat).toBeGreaterThan(37)
    expect(pin.x).toBeGreaterThanOrEqual(0)
    expect(pin.title.length).toBeGreaterThan(0)
  })

  it('ilanı olmayan bölge için boş liste döner', () => {
    expect(listingsForRegion(konyaalti)).toEqual([])
  })
})
