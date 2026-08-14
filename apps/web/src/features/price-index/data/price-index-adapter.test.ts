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

  it('her bölge demografi taşır: cinsiyet ve medeni durum yüzdeleri 100 eder', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    const d = snapshot.demographics
    expect(d.population).toBeGreaterThan(0)
    expect(d.averageAge).toBeGreaterThan(25)
    expect(d.averageAge).toBeLessThan(50)
    expect(d.femalePct + d.malePct).toBe(100)
    expect(d.marriedPct + d.singlePct).toBe(100)
    expect(d.sourceLabel).toContain('TÜİK')
  })

  it('yaş ve eğitim dağılımları yüzde olarak 100 eder', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const toplam = (xs: Array<{ pct: number }>) => xs.reduce((s, x) => s + x.pct, 0)
    expect(toplam(snapshot.demographics.ageBands)).toBe(100)
    expect(toplam(snapshot.demographics.education)).toBe(100)
    expect(snapshot.demographics.ageBands[0].label).toContain('yaş')
  })

  it('alt kırılımı olan bölgede nüfus dağılımı çocukları listeler, vurgu yoktur', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const { items, label } = snapshot.demographics.subRegionPopulation
    expect(label).toContain('ilçe')
    expect(items.map((i) => i.id)).toContain('kadikoy')
    expect(items.every((i) => !i.prominent)).toBe(true)
  })

  it('yaprak bölgede nüfus dağılımı kardeşleri listeler ve kendini vurgular', async () => {
    const { snapshot } = await loadPriceIndex({
      path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy/feneryolu'),
    })
    const { items } = snapshot.demographics.subRegionPopulation
    expect(items.map((i) => i.id)).toContain('goztepe')
    expect(items.find((i) => i.id === 'feneryolu')?.prominent).toBe(true)
  })

  it('demografi deterministiktir — iki yükleme aynı sonucu verir', async () => {
    const once = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    const sonra = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    expect(once.snapshot.demographics).toEqual(sonra.snapshot.demographics)
  })

  it('kiralık görünüm satılığın kopyası değildir: m² değeri medyan kiradır', async () => {
    const satilik = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik') })
    const kiralik = await loadPriceIndex({ path: parsePriceIndexPath('konut/kiralik') })
    const kira = kiralik.snapshot.headline.medianPricePerSqm.value
    expect(kira).not.toBe(satilik.snapshot.headline.medianPricePerSqm.value)
    // Kira m² = satılık m² × getiri / 12 — iki sayfa aynı köprüyü paylaşır.
    expect(kira).toBe(satilik.snapshot.investment.medianRentPerSqm)
  })

  it('kiralıkta değişim oranı ve seriler kira verisinden üretilir', async () => {
    const satilik = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const kiralik = await loadPriceIndex({ path: parsePriceIndexPath('konut/kiralik/istanbul') })
    expect(kiralik.snapshot.change.nominal).not.toBe(satilik.snapshot.change.nominal)
    const seri = kiralik.snapshot.series['1y'].nominal.own
    expect(seri.at(-1)?.value).toBe(kiralik.snapshot.headline.medianPricePerSqm.value)
  })

  it('kiralıkta alt bölge satırları kira m² değerleri taşır', async () => {
    const kiralik = await loadPriceIndex({ path: parsePriceIndexPath('konut/kiralik/istanbul') })
    const kadikoy = kiralik.snapshot.subRegions.find((r) => r.slug === 'kadikoy')
    expect(kadikoy?.pricePerSqm).toBeLessThan(2_000)
  })

  it('dağılım bantları bölgenin kendi medyan ölçeğinden üretilir', async () => {
    const turkiye = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik') })
    const besiktas = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/besiktas') })
    expect(besiktas.snapshot.distribution.bins.map((b) => b.label)).not.toEqual(
      turkiye.snapshot.distribution.bins.map((b) => b.label),
    )
    expect(besiktas.snapshot.distribution.bins.find((b) => b.containsMedian)).toBeTruthy()
  })

  it('Ankara ilçeleri ve Beşiktaş mahalleleri de ağaçta vardır', async () => {
    const ankara = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/ankara') })
    expect(ankara.snapshot.subRegions.length).toBeGreaterThan(3)
    const besiktas = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/besiktas') })
    expect(besiktas.snapshot.subRegionLabel).toBe('Mahalleler')
    expect(besiktas.snapshot.subRegions.length).toBeGreaterThan(3)
  })

  it('oda sayısı ve bina yaşı kırılımları pay olarak 100 eder', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul/kadikoy') })
    const pay = (xs: Array<{ sharePct: number }>) => xs.reduce((s, x) => s + x.sharePct, 0)
    expect(pay(snapshot.breakdowns.rooms)).toBe(100)
    expect(pay(snapshot.breakdowns.buildingAge)).toBe(100)
    // Küçük daire m² başına daha pahalıdır; sıfır bina en pahalıdır.
    expect(snapshot.breakdowns.rooms[0].pricePerSqm).toBeGreaterThan(snapshot.breakdowns.rooms.at(-1)!.pricePerSqm)
  })

  it('kiralık kırılım değerleri kira ölçeğindedir', async () => {
    const { snapshot } = await loadPriceIndex({ path: parsePriceIndexPath('konut/kiralik/istanbul/kadikoy') })
    expect(snapshot.breakdowns.rooms[0].pricePerSqm).toBeLessThan(2_000)
  })

  it('iç linkleme rafı ters işlem türüne bağlantı verir', async () => {
    const { discovery } = await loadPriceIndex({ path: parsePriceIndexPath('konut/satilik/istanbul') })
    const digerler = discovery.find((c) => c.id === 'diger-gorunumler')
    const ters = digerler?.links.find((l) => l.id === 'ters-islem')
    expect(ters?.href).toBe('/emlak-endeksi/konut/kiralik/istanbul')
  })
})
