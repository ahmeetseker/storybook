import { describe, expect, it } from 'vitest'
import { buildPriceIndexHref, loadPriceIndex, parsePriceIndexPath } from './price-index-adapter'

describe('parsePriceIndexPath', () => {
  it('tip ve işlem türünü yoldan okur', () => {
    const p = parsePriceIndexPath('konut/kiralik/istanbul/kadikoy')
    expect(p.propertyType).toBe('konut')
    expect(p.transactionType).toBe('kiralik')
    expect(p.segments).toEqual(['istanbul', 'kadikoy'])
  })

  it('eksik segmentlerde varsayılana düşer — 404 yerine Türkiye kökü', () => {
    expect(parsePriceIndexPath(undefined)).toEqual({ propertyType: 'konut', transactionType: 'satilik', segments: [] })
    expect(parsePriceIndexPath('')).toEqual({ propertyType: 'konut', transactionType: 'satilik', segments: [] })
  })

  it('tanınmayan tip/işlem segmentlerini bölge sanmaz', () => {
    const p = parsePriceIndexPath('isyeri/satilik/ankara')
    expect(p.propertyType).toBe('isyeri')
    expect(p.segments).toEqual(['ankara'])
  })

  it('en fazla üç coğrafi segment alır — daha derini yok sayılır', () => {
    expect(parsePriceIndexPath('konut/satilik/a/b/c/d').segments).toEqual(['a', 'b', 'c'])
  })

  it('href üretimi yolu tersine kurar', () => {
    const p = parsePriceIndexPath('konut/satilik/istanbul')
    expect(buildPriceIndexHref(p, ['istanbul', 'kadikoy'])).toBe('/emlak-endeksi/konut/satilik/istanbul/kadikoy')
  })
})

describe('loadPriceIndex', () => {
  it('Türkiye kökünde referans serisi yoktur — kendisi referanstır', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik') })
    expect(snapshot.region.level).toBe('country')
    expect(snapshot.series['1y'].nominal.benchmarks).toHaveLength(0)
    expect(snapshot.subRegionLabel).toBe('İller')
  })

  it('referansları YAKINDAN UZAĞA sıralar — grafik kesik yoğunluğunu bu sıraya bağlar', async () => {
    const { snapshot } = await loadPriceIndex({
      path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy/feneryolu'),
    })
    const labels = snapshot.series['1y'].nominal.benchmarks.map((b) => b.label)
    expect(labels).toEqual(['Kadıköy ortalaması', 'İstanbul ortalaması', 'Türkiye ortalaması'])
  })

  it('mahalle seviyesinde alt bölge tablosu boştur', async () => {
    const { snapshot } = await loadPriceIndex({
      path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy/feneryolu'),
    })
    expect(snapshot.region.level).toBe('neighborhood')
    expect(snapshot.subRegions).toHaveLength(0)
  })

  it('ilçe seviyesinde mahalleleri listeler', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    expect(snapshot.subRegionLabel).toBe('Mahalleler')
    expect(snapshot.subRegions.length).toBeGreaterThan(5)
  })

  it('yetersiz örneklemli bölgede hiçbir fiyat metriği yayımlanmaz', async () => {
    const { snapshot } = await loadPriceIndex({
      path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy/dumlupinar'),
    })
    expect(snapshot.confidence.grade).toBe('INSUFFICIENT')
    expect(snapshot.headline.medianPricePerSqm.value).toBeNull()
    expect(snapshot.headline.medianPricePerSqm.suppressed).toBe(true)
    expect(snapshot.headline.grossYield.value).toBeNull()
  })

  it('yetersiz örneklemli alt bölge satırında fiyat ve trend serisi bastırılır', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    const dumlupinar = snapshot.subRegions.find((r) => r.slug === 'dumlupinar')
    expect(dumlupinar?.pricePerSqm).toBeNull()
    expect(dumlupinar?.changeNominal).toBeNull()
    expect(dumlupinar?.fromPeak).toBeNull()
    expect(dumlupinar?.trend).toEqual([])
    // İlan sayısı bastırılmaz: "kaç ilan var" bilgisi kendisi bir cevaptır.
    expect(dumlupinar?.listings).toBeGreaterThan(0)
  })

  it('yeterli örneklemli satır 12 noktalık trend serisi taşır', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    const goztepe = snapshot.subRegions.find((r) => r.slug === 'goztepe')
    expect(goztepe?.trend).toHaveLength(12)
    // Son nokta yayımlanan medyana oturur; grafik ile tablo çelişmez.
    expect(goztepe?.trend.at(-1)).toBe(goztepe?.pricePerSqm)
  })

  it('reel seri nominalden farklıdır ve son noktada ikisi eşitlenir', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const nominal = snapshot.series['1y'].nominal.own
    const reel = snapshot.series['1y'].reel.own
    expect(reel[0].value).not.toBe(nominal[0].value)
    // Bugünün fiyatı bugünün parasıyla aynıdır — deflatör 1'e iner.
    expect(reel.at(-1)?.value).toBe(nominal.at(-1)?.value)
  })

  it('breadcrumb yolu kökten kendisine kadar tüm ataları taşır', async () => {
    const { snapshot } = await loadPriceIndex({
      path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy/feneryolu'),
    })
    expect(snapshot.region.path.map((p) => p.name)).toEqual(['Türkiye', 'İstanbul', 'Kadıköy', 'Feneryolu'])
  })

  it('bilinmeyen slug sessizce üst bölgede durur', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/olmayan-ilce') })
    expect(snapshot.region.name).toBe('İstanbul')
  })

  it('iç linkleme rafı ters işlem türüne bağlantı verir', async () => {
    const { discovery } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const digerler = discovery.find((c) => c.id === 'diger-gorunumler')
    const ters = digerler?.links.find((l) => l.id === 'ters-islem')
    expect(ters?.href).toBe('/emlak-endeksi/konut/kiralik/istanbul')
  })
})
