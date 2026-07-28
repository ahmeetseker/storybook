import { describe, expect, it } from 'vitest'
import { loadListingDetail } from './listing-detail-adapter'

const NOW = '2026-07-27T09:00:00.000Z'

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

  it('plan notu bayat senaryosunda güncellik stale olarak işaretlenir', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'stale-planning', now: NOW })
    expect(result?.detail.planning.landUse.freshness).toBe('stale')
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
