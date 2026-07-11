import { describe, expect, it } from 'vitest'
import { SAMPLE_COUNT, computeRadialDisplacements, displacementAt, profileHeight } from './surfaces'

describe('profileHeight', () => {
  it('convex profiller kenarda 0, içte 1', () => {
    expect(profileHeight('convexCircle', 0)).toBeCloseTo(0)
    expect(profileHeight('convexCircle', 1)).toBeCloseTo(1)
    expect(profileHeight('convexSquircle', 0)).toBeCloseTo(0)
    expect(profileHeight('convexSquircle', 1)).toBeCloseTo(1)
  })
  it('concave kenarda 1, içte 0', () => {
    expect(profileHeight('concave', 0)).toBeCloseTo(1)
    expect(profileHeight('concave', 1)).toBeCloseTo(0)
  })
  it('convexSquircle monoton artar', () => {
    let prev = -1
    for (let i = 0; i <= 20; i++) {
      const y = profileHeight('convexSquircle', i / 20)
      expect(y).toBeGreaterThanOrEqual(prev)
      prev = y
    }
  })
  it('x [0,1] dışına kıstırılır', () => {
    expect(profileHeight('convexSquircle', -0.5)).toBeCloseTo(0)
    expect(profileHeight('convexSquircle', 1.5)).toBeCloseTo(1)
  })
})

describe('displacementAt', () => {
  it('düz iç bölgede (x=1) kayma ~0', () => {
    expect(Math.abs(displacementAt('convexSquircle', 1))).toBeLessThan(0.01)
  })
  it('bezel içinde (x=0.15) pozitif kayma üretir', () => {
    expect(displacementAt('convexSquircle', 0.15)).toBeGreaterThan(0)
  })
  it('kırılma indisi 1 iken kayma ~0 (cam yok)', () => {
    expect(Math.abs(displacementAt('convexSquircle', 0.15, 1))).toBeLessThan(1e-9)
  })
})

describe('computeRadialDisplacements', () => {
  it('SAMPLE_COUNT örnek döner, normalized [0,1] içinde', () => {
    const r = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 20 })
    expect(r.normalized).toHaveLength(SAMPLE_COUNT)
    for (const v of r.normalized) {
      expect(Math.abs(v)).toBeLessThanOrEqual(1)
    }
  })
  it('maxDisplacement kalınlıkla ölçeklenir', () => {
    const a = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 10 })
    const b = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 20 })
    expect(b.maxDisplacement).toBeCloseTo(a.maxDisplacement * 2, 5)
  })
})
