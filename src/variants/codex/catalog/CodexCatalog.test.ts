import { describe, expect, it } from 'vitest'
import {
  CODEX_CATALOG_CATEGORIES,
  CODEX_COMPONENT_CATALOG,
  CODEX_COMPONENT_COUNT,
  CODEX_PAGE_CATALOG,
  CODEX_PAGE_COUNT,
} from './index'

describe('Codex enterprise catalog contract', () => {
  it('96 mevcut component ailesinin tamamını bir kez kapsar', () => {
    expect(CODEX_COMPONENT_COUNT).toBe(96)
    const names = CODEX_COMPONENT_CATALOG.map((item) => item.original)
    expect(new Set(names).size).toBe(96)
    expect(names.every((name) => name.startsWith('Glass'))).toBe(true)
  })

  it('her component kategori, görev, varyant, strateji ve story yolu taşır', () => {
    const categoryIds = new Set(CODEX_CATALOG_CATEGORIES.map((category) => category.id))
    for (const component of CODEX_COMPONENT_CATALOG) {
      expect(categoryIds.has(component.category)).toBe(true)
      expect(component.codex.length).toBeGreaterThan(4)
      expect(component.purpose.length).toBeGreaterThan(20)
      expect(component.variants.length).toBeGreaterThanOrEqual(2)
      expect(['native', 'composed', 'compatibility']).toContain(component.strategy)
      expect(component.storyGroup).toMatch(/^\d{2} /)
    }
  })

  it('28 mevcut ürün sayfasının tamamını durum sözleşmesiyle kapsar', () => {
    expect(CODEX_PAGE_COUNT).toBe(28)
    const names = CODEX_PAGE_CATALOG.map((page) => page.name)
    expect(new Set(names).size).toBe(28)
    for (const page of CODEX_PAGE_CATALOG) {
      expect(page.purpose.length).toBeGreaterThan(20)
      expect(page.states.length).toBeGreaterThanOrEqual(3)
      expect(page.codexComposition.length).toBeGreaterThan(4)
    }
  })

  it('bütün kategori ailelerinin en az bir componenti vardır', () => {
    for (const category of CODEX_CATALOG_CATEGORIES) {
      expect(CODEX_COMPONENT_CATALOG.some((component) => component.category === category.id)).toBe(true)
    }
  })
})
