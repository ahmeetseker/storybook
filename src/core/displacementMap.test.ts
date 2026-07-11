import { describe, expect, it } from 'vitest'
import { computeDisplacementPixels, roundedRectSDF } from './displacementMap'

describe('roundedRectSDF', () => {
  it('merkezde negatif (içeride)', () => {
    expect(roundedRectSDF(50, 25, 100, 50, 12)).toBeLessThan(0)
  })
  it('dışarıda pozitif', () => {
    expect(roundedRectSDF(-10, 25, 100, 50, 12)).toBeGreaterThan(0)
  })
  it('düz kenar üzerinde ~0', () => {
    expect(roundedRectSDF(50, 0, 100, 50, 12)).toBeCloseTo(0, 5)
  })
})

describe('computeDisplacementPixels', () => {
  const opts = { width: 60, height: 40, cornerRadius: 12, bezelWidth: 10, glassThickness: 15 }

  it('RGBA boyutu doğru ve alpha 255', () => {
    const { data } = computeDisplacementPixels(opts)
    expect(data.length).toBe(60 * 40 * 4)
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255)
  })

  it('merkez pikseli nötr (128,128,128)', () => {
    const { data } = computeDisplacementPixels(opts)
    const i = (20 * 60 + 30) * 4 // (x=30, y=20)
    expect(data[i]).toBe(128)
    expect(data[i + 1]).toBe(128)
    expect(data[i + 2]).toBe(128)
  })

  it('sol kenar bezel pikselinde X kanalı nötr değil, Y nötr (yatay normal)', () => {
    const { data } = computeDisplacementPixels(opts)
    const i = (20 * 60 + 2) * 4 // (x=2, y=20) — sol kenara 2px, dikeyde ortada
    expect(data[i]).not.toBe(128)
    expect(Math.abs(data[i + 1] - 128)).toBeLessThanOrEqual(1)
  })

  it('tüm kanallar 0-255 aralığında', () => {
    const { data } = computeDisplacementPixels(opts)
    for (const v of data) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(255)
    }
  })

  it('maxDisplacement pozitif', () => {
    expect(computeDisplacementPixels(opts).maxDisplacement).toBeGreaterThan(0)
  })
})
