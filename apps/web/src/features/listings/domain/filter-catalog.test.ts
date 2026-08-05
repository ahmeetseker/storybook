import { describe, expect, it } from 'vitest'
import { ALL_FACETS, FACET_BY_KEY, FILTER_SECTIONS } from './filter-catalog'
import { facetApplies, sectionFacets } from './filter-catalog-types'
import { LISTING_FIXTURES } from '../data/listing-adapter'

describe('filtre kataloğu', () => {
  it('facet anahtarları benzersizdir', () => {
    const keys = ALL_FACETS.map((facet) => facet.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('her select facet en az iki seçenek taşır', () => {
    for (const facet of ALL_FACETS) {
      if (facet.type !== 'select') continue
      expect(facet.options?.length ?? 0, `${facet.key} seçeneksiz`).toBeGreaterThan(1)
    }
  })

  it('her facet en az bir kategoride anlamlıdır', () => {
    for (const facet of ALL_FACETS) {
      expect(facet.categories.length, `${facet.key} kategorisiz`).toBeGreaterThan(0)
    }
  })

  // Kategoriye uymayan filtre her zaman sıfır sonuç üretir; panelde
  // görünmemesi bir tercih değil, doğruluk şartıdır.
  it('konuta özgü kriterler arsada görünmez', () => {
    const rooms = FACET_BY_KEY.get('rooms')
    const heating = FACET_BY_KEY.get('heating')
    expect(rooms && facetApplies(rooms, 'land')).toBe(false)
    expect(heating && facetApplies(heating, 'land')).toBe(false)
  })

  it('arsaya özgü kriterler konutta görünmez', () => {
    const zoning = FACET_BY_KEY.get('zoning')
    const infrastructure = FACET_BY_KEY.get('infrastructure')
    expect(zoning && facetApplies(zoning, 'residential')).toBe(false)
    expect(infrastructure && facetApplies(infrastructure, 'residential')).toBe(false)
  })

  it('"tüm kategoriler" görünümünde yalnız her kategoride ortak olanlar kalır', () => {
    const deed = FACET_BY_KEY.get('deed')
    const rooms = FACET_BY_KEY.get('rooms')
    expect(deed && facetApplies(deed, 'all')).toBe(true)
    expect(rooms && facetApplies(rooms, 'all')).toBe(false)
  })

  it('her bölüm en az bir kategoride kriter üretir', () => {
    for (const section of FILTER_SECTIONS) {
      const anywhere = (['residential', 'land', 'commercial', 'building', 'timeshare', 'touristic'] as const).some(
        (category) => sectionFacets(section, category).length > 0,
      )
      expect(anywhere, `${section.id} hiçbir kategoride görünmüyor`).toBe(true)
    }
  })

  // En kritik sözleşme: panelde gösterilen her kriterin ARDINDA veri olmalı.
  // Aksi halde kullanıcı kriteri seçer ve sonuç boşalır — filtre yalancı olur.
  it('katalogdaki her facet için kurgu kaydında veri vardır', () => {
    const eligible = (categories: readonly string[]) =>
      LISTING_FIXTURES.filter((item) => categories.includes(item.category))

    for (const facet of ALL_FACETS) {
      const candidates = eligible(facet.categories)
      expect(candidates.length, `${facet.key} için uygun ilan yok`).toBeGreaterThan(0)
      const covered =
        facet.type === 'range'
          ? candidates.some((item) => item.metrics[facet.key] !== undefined)
          : candidates.some((item) => (item.facets[facet.key] ?? []).length > 0)
      expect(covered, `${facet.key} hiçbir ilanda veri taşımıyor`).toBe(true)
    }
  })

  // Seçenek listesi ile veride geçen değerler ayrışırsa, seçilebilen ama
  // hiçbir ilanı eşleştirmeyen ölü seçenekler oluşur.
  it('select seçeneklerinin en azından bir kısmı veride karşılık bulur', () => {
    for (const facet of ALL_FACETS) {
      if (facet.type !== 'select') continue
      const used = new Set<string>()
      for (const item of LISTING_FIXTURES) {
        for (const value of item.facets[facet.key] ?? []) used.add(value)
      }
      const known = new Set((facet.options ?? []).map((option) => option.value))
      for (const value of used) {
        expect(known.has(value), `${facet.key}: "${value}" katalogda yok`).toBe(true)
      }
      expect(used.size, `${facet.key} için hiç değer üretilmemiş`).toBeGreaterThan(0)
    }
  })
})
