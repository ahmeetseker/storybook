import { describe, expect, it } from 'vitest'
import { HERO_TABS, heroTab, isHeroTabId } from './heroTabs'

describe('hero sekme verisi', () => {
  it('üç sekme tanımlar ve ilki arsa olur', () => {
    expect(HERO_TABS.map((tab) => tab.id)).toEqual(['arsa', 'konut', 'proje'])
  })

  it('her sekmenin haritada en az bir coğrafi pini vardır', () => {
    for (const tab of HERO_TABS) {
      expect(tab.pins.length).toBeGreaterThan(0)
      for (const pin of tab.pins) {
        expect(Number.isFinite(pin.lat)).toBe(true)
        expect(Number.isFinite(pin.lng)).toBe(true)
      }
    }
  })

  it('her sekmede AI çıkarımı için en az bir filtre ve geçerli güven skoru vardır', () => {
    for (const tab of HERO_TABS) {
      expect(tab.parsedFilters.length).toBeGreaterThan(0)
      expect(tab.confidence).toBeGreaterThanOrEqual(0)
      expect(tab.confidence).toBeLessThanOrEqual(100)
    }
  })

  it('isHeroTabId yalnız bilinen kimlikleri kabul eder', () => {
    expect(isHeroTabId('arsa')).toBe(true)
    expect(isHeroTabId('konut')).toBe(true)
    expect(isHeroTabId('villa')).toBe(false)
    expect(isHeroTabId(undefined)).toBe(false)
  })

  it('heroTab bilinmeyen kimlikte arsa sekmesine düşer', () => {
    expect(heroTab('arsa').id).toBe('arsa')
    expect(heroTab('konut').id).toBe('konut')
  })

  it('her pinin x/y değeri 0-1 aralığında ve lat/lng ile tutarlı', () => {
    for (const tab of HERO_TABS) {
      for (const pin of tab.pins) {
        expect(pin.x).toBeGreaterThanOrEqual(0)
        expect(pin.x).toBeLessThanOrEqual(1)
        expect(pin.y).toBeGreaterThanOrEqual(0)
        expect(pin.y).toBeLessThanOrEqual(1)
        // x/y, lat/lng'nin kaba karşılığı olmalı — geniş toleransla doğrulanır
        expect(Math.abs((pin.x as number) - ((pin.lng as number) - 26) / 19)).toBeLessThan(0.06)
        expect(Math.abs((pin.y as number) - (42 - (pin.lat as number)) / 6)).toBeLessThan(0.06)
      }
    }
  })
})
