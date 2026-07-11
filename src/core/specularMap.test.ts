import { describe, expect, it } from 'vitest'
import { computeSpecularPixels } from './specularMap'

describe('computeSpecularPixels', () => {
  const opts = { width: 60, height: 40, cornerRadius: 12, bezelWidth: 8, lightAngleDeg: -60 }

  it('doğru boyutta RGBA döner', () => {
    expect(computeSpecularPixels(opts).length).toBe(60 * 40 * 4)
  })

  it('merkezde alpha 0 (parlama yalnız kenarda)', () => {
    const data = computeSpecularPixels(opts)
    const i = (20 * 60 + 30) * 4
    expect(data[i + 3]).toBe(0)
  })

  it('ışığa bakan kenarda alpha > 0, ters kenarda daha düşük', () => {
    const data = computeSpecularPixels(opts)
    // Işık -60° (sol-üst): üst kenar (y=2) aydınlık, alt kenar (y=37) sönük olmalı
    const top = data[(2 * 60 + 30) * 4 + 3]
    const bottom = data[(37 * 60 + 30) * 4 + 3]
    expect(top).toBeGreaterThan(0)
    expect(top).toBeGreaterThan(bottom)
  })

  it('parlama pikselleri beyaz', () => {
    const data = computeSpecularPixels(opts)
    const i = (2 * 60 + 30) * 4
    expect(data[i]).toBe(255)
    expect(data[i + 1]).toBe(255)
    expect(data[i + 2]).toBe(255)
  })
})
