import { describe, expect, it } from 'vitest'
import { freshnessFrom } from '../domain/evidence'
import type { LandListingDetail } from '../domain/listing-detail-types'
import { medianPosition, medianPositionPhrase } from '../domain/listing-detail-view-model'
import { briefFor, forEachEvidenceValue, loadListingDetail } from './listing-detail-adapter'

const NOW = '2026-07-27T09:00:00.000Z'

async function landDetail(): Promise<LandListingDetail> {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

describe('loadListingDetail', () => {
  it('aynı girdiyle iki kez çağrıldığında birebir aynı sonucu üretir', async () => {
    const first = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const second = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('bilinmeyen ilan için null döner — arama sayfasına yönlendirmez', async () => {
    expect(await loadListingDetail({ listingId: 'yok-boyle-bir-ilan', now: NOW })).toBeNull()
  })

  it('EİDS satırı yalnız ilan verme yetkisini doğrular ve kapsam notu taşır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const row = result?.detail.verification.find((item) => item.id === 'listing_authorisation')
    expect(row?.title).toBe('İlan verme yetkisi EİDS ile doğrulandı')
    expect(row?.scopeNote).toBe(
      'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.',
    )
  })

  it('parsel eşleşmesi satırı çelişki nedeniyle olumsuzdur', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const row = result?.detail.verification.find((item) => item.id === 'parcel_match')
    expect(row?.state).toBe('negative')
  })

  it('bayat plan senaryosu plan durumu kaynağını bayatlatır — varsayılanda güncel', async () => {
    const base = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    // Varsayılanda plan durumu kanıt kesitiyle aynı gün sorgulanmıştır…
    expect(base?.detail.planning.planStatus.freshness).toBe('current')
    // …plan notu ise belge tarihi gereği her senaryoda bayattır.
    expect(base?.detail.planning.landUse.freshness).toBe('stale')

    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'stale-planning', now: NOW })
    expect(result?.detail.planning.planStatus.freshness).toBe('stale')
  })

  it('bayat plan senaryosunda güncellik bayrağı tarihle tutarlıdır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'stale-planning', now: NOW })
    const planStatus = result?.detail.planning.planStatus
    if (!planStatus) throw new Error('plan durumu bulunamadı')
    // Bayrak elle konmuş değil: kendi sorgu/belge tarihi 180 günlük eşiği aşıyor.
    expect(freshnessFrom(planStatus.retrievedAt, NOW, planStatus.effectiveAt)).toBe('stale')
  })

  // `now` süs değildir: fixture'daki `freshness` yalnız varsayılandır, gerçek
  // değer tarihlerden türetilir. Aynı fixture, iki farklı `now` → iki farklı
  // güncellik. Donmuş bayrakla bu test düşer.
  it('güncellik `now` ile birlikte değişir', async () => {
    const early = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const late = await loadListingDetail({
      listingId: 'arsa-214-7',
      now: '2027-07-27T09:00:00.000Z',
    })

    expect(early?.detail.planning.planStatus.freshness).toBe('current')
    expect(late?.detail.planning.planStatus.freshness).toBe('stale')

    // 90 günü aşan ama 180 günü aşmayan beyan: "aging".
    expect(early?.detail.planning.titleDeedType.freshness).toBe('aging')
    expect(late?.detail.planning.titleDeedType.freshness).toBe('stale')

    // Dayanıklı değerler takvimi izlemez: kadastral kimlik ve yürürlükteki
    // ulusal tehlike haritası sürümü yıllar sonra da "güncel" kalır.
    // (`blockParcel` 2019, AFAD haritası 2018 tarihli.)
    expect(early?.detail.parcel.blockParcel.freshness).toBe('current')
    expect(late?.detail.parcel.blockParcel.freshness).toBe('current')

    const earthquakeAt = (result: typeof early) =>
      result?.detail.terrain.hazards.find((item) => item.id === 'earthquake')?.value.freshness
    expect(earthquakeAt(early)).toBe('current')
    expect(earthquakeAt(late)).toBe('current')
  })

  // Dayanıklılık istisnadır: işaretlenmemiş her değer takvimi izler. Bu test
  // işaretin fixture'da sessizce yayılmasını engeller.
  it('dayanıklı işareti yalnız kadastral kimlik ve ulusal tehlike haritasındadır', async () => {
    const detail = await landDetail()
    const durable: string[] = []
    forEachEvidenceValue(detail, (value) => {
      if (value.freshnessPolicy === 'durable') durable.push(String(value.value))
    })
    expect(durable).toEqual([
      '214 ada / 7 parsel',
      'PGA 0,32 g — 50 yılda %10 aşılma olasılığı',
    ])

    // Beyanlar, plan notu, emsal kesiti ve türetilmiş erişim bilgisi gerçekten
    // bayatlar — hiçbiri dayanıklı işaretlenmemelidir.
    expect(detail.planning.titleDeedType.freshnessPolicy).toBeUndefined()
    expect(detail.planning.landUse.freshnessPolicy).toBeUndefined()
    expect(detail.market.comparableMedianUnitPrice.freshnessPolicy).toBeUndefined()
    expect(detail.access.physicalAccess.freshnessPolicy).toBeUndefined()
  })

  it('güncellik normalizasyonu dizilerin içindeki kanıt değerlerine de iner', async () => {
    const early = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const late = await loadListingDetail({
      listingId: 'arsa-214-7',
      now: '2027-07-27T09:00:00.000Z',
    })

    expect(early?.detail.access.utilities.map((item) => item.value.freshness)).toEqual([
      'current',
      'aging',
      'aging',
    ])
    expect(late?.detail.access.utilities.map((item) => item.value.freshness)).toEqual([
      'stale',
      'stale',
      'stale',
    ])
    // Deprem göstergesi dayanıklıdır (yürürlükteki harita sürümü), yangın
    // duyarlılık sınıfı değildir; taşkın katmanı hiç yayımlanmamıştır.
    expect(late?.detail.terrain.hazards.map((item) => item.value.freshness)).toEqual([
      'current',
      'stale',
      'unknown',
    ])
  })

  // Cevapsız değerde güncellik yoktur: sorgunun dün yapılmış olması olmayan
  // veriyi güncel yapmaz.
  it('cevapsız değer hiçbir `now` için güncel sayılmaz', async () => {
    for (const now of [NOW, '2027-07-27T09:00:00.000Z']) {
      const result = await loadListingDetail({ listingId: 'arsa-214-7', now })
      expect(result?.detail.planning.encumbrance.freshness).toBe('unknown')
      expect(result?.detail.access.legalRoadAccess.freshness).toBe('unknown')
    }
  })

  it('AI kullanılamadığında yapılandırılmış içerik korunur, yalnız brief düşer', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'ai-unavailable', now: NOW })
    expect(result?.aiBrief.state).toBe('unavailable')
    expect(result?.detail.parcel.blockParcel.value).toBe('214 ada / 7 parsel')
    expect(result?.sections.core.state).toBe('ready')
  })

  it('harita sağlayıcısı düştüğünde yalnız harita bölümü etkilenir', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'map-unavailable', now: NOW })
    expect(result?.sections.map.state).toBe('unavailable')
    expect(result?.sections.planning.state).toBe('ready')
  })

  it('AI özetindeki her iddia bir bölüme bağlıdır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const brief = result?.aiBrief
    if (brief?.state !== 'ready') throw new Error('brief hazır olmalı')
    expect(brief.data.claims.length).toBeGreaterThan(0)
    for (const claim of brief.data.claims) {
      expect(claim.sectionId).toMatch(/^(parsel|imar|altyapi|arazi|piyasa|belgeler)$/)
    }
  })

  // Özet "kaynaklı" diyorsa sayıları defterden gelmelidir. Bu test defteri
  // değiştirip özetin birlikte değişmesini bekler: donmuş sabitlerle düşer.
  it('karar özetinin karşılaştırmalı sayıları kanıt defterinden türetilir', async () => {
    const detail = structuredClone(await landDetail())
    detail.market.comparableMedianUnitPrice.value = 2400
    detail.market.comparableCount = 31
    detail.planning.shared.share = '1/3'
    detail.parcel.area.value = 4600

    const brief = briefFor(detail)
    const claimText = (id: string) => brief.claims.find((claim) => claim.id === id)?.text

    // 1804 → 2400 medyanı: %25 altında.
    expect(medianPositionPhrase(medianPosition(1804, 2400))).toBe('emsal medyanının %25 altında')
    expect(claimText('price-vs-median')).toContain('emsal medyanının %25 altında')
    expect(claimText('price-vs-median')).toContain('31 ilanlık kesitte')
    expect(claimText('shared-deed')).toContain('1/3 pay')
    // 4.850 beyan − 4.600 kayıt = 250 m² fark.
    expect(brief.unknowns.join(' ')).toContain('250 m²')
    expect(brief.summary).toContain('emsal medyanının %25 altında')
  })

  it('varsayılan defterde özet ile piyasa bölümü aynı sayıyı yazar', async () => {
    const detail = await landDetail()
    const median = detail.market.comparableMedianUnitPrice.value
    if (median === undefined) throw new Error('emsal medyanı bulunamadı')

    const phrase = medianPositionPhrase(medianPosition(detail.price.unitPrice, median))
    const brief = briefFor(detail)
    expect(brief.claims.find((claim) => claim.id === 'price-vs-median')?.text).toContain(phrase)
    expect(brief.summary).toContain(phrase)
  })

  it('AI özeti fiyat tahmini uydurmaz — değerleme çekinmesini aktarır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(result?.detail.market.valuation.kind).toBe('insufficient')
  })

  it('süresi dolmuş ilanda yaşam döngüsü aktarılır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'inactive', now: NOW })
    expect(result?.detail.lifecycle).toBe('expired')
  })

  it('iki çağrının sonuçları iç içe referansları paylaşmaz', async () => {
    const first = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const second = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(first?.detail.documents).not.toBe(second?.detail.documents)
    expect(first?.detail.parcel.area).not.toBe(second?.detail.parcel.area)
  })

  it('bir sonucun mutasyona uğratılması sonraki çağrıları veya fixture\'ı bozmaz', async () => {
    const first = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    first?.detail.documents.push({
      id: 'mutation-probe',
      label: 'Sızıntı testi',
      state: 'missing',
      critical: false,
    })
    if (first) first.detail.parcel.area.value = 9999

    const fresh = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(fresh?.detail.documents).toHaveLength(5)
    expect(fresh?.detail.parcel.area.value).toBe(4712)
  })
})
