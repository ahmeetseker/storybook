import { describe, expect, it } from 'vitest'
import { regionPriceSeries } from './region-price-series'
import { REGIONS } from './region-adapter'

const urla = REGIONS.find((region) => region.id === 'izmir-urla')!

describe('regionPriceSeries', () => {
  it('12 aylık seri üretir ve son nokta karttaki m² fiyatına oturur', () => {
    const points = regionPriceSeries(urla)
    expect(points).toHaveLength(12)
    expect(points[points.length - 1].value).toBe(urla.pricePerSqm)
    for (const point of points) expect(point.value).toBeGreaterThan(0)
  })

  it('deterministiktir: aynı bölge her seferinde aynı seriyi verir', () => {
    expect(regionPriceSeries(urla)).toEqual(regionPriceSeries(urla))
  })

  it('pozitif eğilimde seri yükselerek biter', () => {
    const points = regionPriceSeries(urla)
    expect(points[points.length - 1].value ?? 0).toBeGreaterThan(points[0].value ?? Infinity)
  })
})
