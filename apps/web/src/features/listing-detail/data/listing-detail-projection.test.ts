import { describe, expect, it } from 'vitest'
import { LISTING_FIXTURES } from '@/features/listings/data/listing-adapter'
import {
  getRepresentativeListingImage,
  stockPhotoCount,
} from '@/features/listings/data/listing-photos'
import { EIDS_SCOPE_NOTE } from './listing-detail-fixtures'
import { loadListingDetail } from './listing-detail-adapter'
import type { GenericListingDetail } from '../domain/listing-detail-types'
import { isAnswered } from '../domain/evidence'

const NOW = '2026-07-27T09:00:00.000Z'

async function projected(listingId: string): Promise<GenericListingDetail> {
  const result = await loadListingDetail({ listingId, now: NOW })
  if (!result) throw new Error(`${listingId} çözülemedi`)
  if (result.detail.kind !== 'generic') throw new Error('yansıtılmış detay bekleniyordu')
  return result.detail
}

function summaryOf(listingId: string) {
  const summary = LISTING_FIXTURES.find((item) => item.id === listingId)
  if (!summary) throw new Error(`${listingId} özeti bulunamadı`)
  return summary
}

describe('arama sonucundan yansıtılan ilan detayı', () => {
  it('arama fixture listesindeki her ilan çözülür', async () => {
    for (const summary of LISTING_FIXTURES) {
      const result = await loadListingDetail({ listingId: summary.id, now: NOW })
      expect(result, `${summary.id} çözülemedi`).not.toBeNull()
    }
  })

  it('ne referans ilana ne başka bir fixture kimliğine uyan kimlik 404 kalır', async () => {
    expect(await loadListingDetail({ listingId: 'yok-boyle-bir-ilan', now: NOW })).toBeNull()
    expect(await loadListingDetail({ listingId: 'listing-99-9', now: NOW })).toBeNull()
  })

  it('özetin kendi başlığını, fiyatını ve konumunu taşır — Ören defterini kopyalamaz', async () => {
    const summary = summaryOf('listing-3-1')
    const detail = await projected('listing-3-1')

    expect(detail.title).toBe(summary.title)
    expect(detail.price.amount).toBe(summary.price)
    expect(detail.price.declaredArea).toBe(summary.area)
    expect(detail.price.unitPrice).toBe(Math.round(summary.price / summary.area))
    expect(detail.location.city).toBe('Bursa')
    expect(detail.location.district).toBe('Nilüfer')
    // Özet mahalle taşımaz: uydurulmaz, alan hiç doldurulmaz.
    expect(detail.location.neighbourhood).toBeUndefined()

    expect(detail.title).not.toContain('Ören')
    expect(detail.seller.name).not.toBe('Ören Emlak')
    expect(detail.price.amount).not.toBe(8_750_000)
  })

  it('arsa kategorisindeki bir arama ilanı bile arsa kanıt paketi taşımaz', async () => {
    const detail = await projected('listing-1-1')
    expect(detail.category).toBe('land')
    expect(detail.kind).toBe('generic')
    expect(detail).not.toHaveProperty('parcel')
    expect(detail).not.toHaveProperty('planning')
    expect(detail).not.toHaveProperty('terrain')
    expect(detail).not.toHaveProperty('market')
  })

  it('beyan edilen özellikler ilan sahibi künyesiyle ve Türkçe etiketle gelir', async () => {
    const summary = summaryOf('listing-3-1')
    const detail = await projected('listing-3-1')

    expect(detail.declaredAttributes.map((item) => item.id)).toEqual(
      Object.keys(summary.attributes),
    )
    const rooms = detail.declaredAttributes.find((item) => item.id === 'rooms')
    expect(rooms?.label).toBe('Oda sayısı')
    expect(rooms?.value.value).toBe('3+1')
    for (const attribute of detail.declaredAttributes) {
      expect(attribute.value.source.sourceClass).toBe('advertiser_declared')
    }
    expect(detail.highlights.source.sourceClass).toBe('advertiser_declared')
    expect(detail.highlights.value).toContain(summary.highlights[0])
  })

  it('doğrulanmış ilanda EİDS satırı tek izinli olumlu cümleyi ve kapsam notunu taşır', async () => {
    const detail = await projected('listing-3-1')
    expect(summaryOf('listing-3-1').verified).toBe(true)

    const row = detail.verification.find((item) => item.id === 'listing_authorisation')
    expect(row?.state).toBe('positive')
    expect(row?.title).toBe('İlan verme yetkisi EİDS ile doğrulandı')
    expect(row?.scopeNote).toBe(EIDS_SCOPE_NOTE)
  })

  it('doğrulanmamış ilanda EİDS satırı bilinmezdir, gerekçelidir ve olumlu cümleyi kullanmaz', async () => {
    const detail = await projected('listing-3-3')
    expect(summaryOf('listing-3-3').verified).toBe(false)

    const row = detail.verification.find((item) => item.id === 'listing_authorisation')
    expect(row?.state).toBe('unknown')
    expect(row?.title).not.toBe('İlan verme yetkisi EİDS ile doğrulandı')
    expect(row?.title).toMatch(/EİDS/)
    expect(row?.scopeNote).toMatch(/sorgu/i)
    // Kayıt yokluğu yetkisizlik değildir; satır bunu yazar.
    expect(`${row?.title} ${row?.scopeNote}`).toMatch(/anlamına gelmez/)

    const positives = detail.verification.filter((item) => item.state === 'positive')
    expect(positives).toHaveLength(0)
  })

  it('doğrulama vektörü tapu/içerik iddiasına genişlemez', async () => {
    const detail = await projected('listing-3-1')
    const ids = detail.verification.map((row) => row.id)
    expect(ids).not.toContain('parcel_match')
    expect(ids).not.toContain('planning_document')
  })

  it('emlak ofisi ilanında yetki belgesi değeri yoktur; satır "kayıt yok" okur', async () => {
    const detail = await projected('listing-3-3')
    expect(summaryOf('listing-3-3').owner).toBe('agency')
    expect(detail.seller.type).toBe('agency')
    expect(detail.seller.licence).toBeUndefined()

    const row = detail.verification.find((item) => item.id === 'agency_licence')
    expect(row?.state).toBe('unknown')
    expect(row?.source).not.toMatch(/TTBS \d/)
  })

  it('sahibinden ilanında ofis yetki satırı hiç üretilmez', async () => {
    const detail = await projected('listing-3-1')
    expect(detail.seller.type).toBe('individual')
    expect(detail.verification.some((row) => row.id === 'agency_licence')).toBe(false)
  })

  it('yayın tarihi `publishedDays` ve `now` üzerinden türetilir; güncelleme kaydı yoktur', async () => {
    const summary = summaryOf('listing-3-1')
    const detail = await projected('listing-3-1')

    const expected = new Date(
      Date.parse(NOW) - summary.publishedDays * 86_400_000,
    ).toISOString()
    expect(detail.publishedAt).toBe(expected)
    expect(detail.updatedAt).toBeUndefined()
    expect(detail.evidenceCutoff).toBe(NOW)
  })

  it('değerleme çekinir — uydurma aralık üretmez', async () => {
    const detail = await projected('listing-3-1')
    expect(detail.valuation.kind).toBe('insufficient')
    if (detail.valuation.kind !== 'insufficient') throw new Error('çekinme bekleniyordu')
    expect(detail.valuation.reason).toMatch(/emsal/i)
  })

  it('kanıt defteri derlenmediği için AI karar özeti üretilmez', async () => {
    const result = await loadListingDetail({ listingId: 'listing-3-1', now: NOW })
    expect(result?.aiBrief.state).toBe('unavailable')
    if (result?.aiBrief.state !== 'unavailable') throw new Error('gerekçe bekleniyordu')
    expect(result.aiBrief.reason).toMatch(/kanıt defteri/i)
  })

  it('belge listesi boştur; belge yokluğu olumsuzluk olarak yazılmaz', async () => {
    const detail = await projected('listing-3-1')
    expect(detail.documents).toEqual([])
  })

  it('medya dökümü birden çok temsili kare taşır ama kare başına künye uydurmaz', async () => {
    const detail = await projected('listing-3-1')

    expect(detail.media.length).toBeGreaterThan(1)
    for (const item of detail.media) {
      expect(item.kind).toBe('photo')
      // Aynı nötr etiket: hangi karenin neyi gösterdiği bu kayıtta bilinmiyor.
      expect(item.label).toBe('Temsili görsel')
      expect(item.capturedAt).toBeUndefined()
      expect(item.aiEdited).toBeUndefined()
      expect(item.representative).toBeDefined()
    }

    // Kareler birbirinin kopyası değildir: havuz tükenirse sayı kısalır.
    const sources = detail.media.map((item) => item.representative?.src)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('kapak karesi arama kartıyla aynı kaynaktan gelir', async () => {
    const summary = summaryOf('listing-3-1')
    const detail = await projected('listing-3-1')
    expect(detail.media[0].representative?.src).toBe(
      getRepresentativeListingImage(summary).src,
    )
  })

  it('kare sayısı bildirilen görsel sayısını taklit etmez; sayı beyan olarak durur', async () => {
    const summary = summaryOf('listing-3-1')
    const detail = await projected('listing-3-1')

    expect(detail.declaredMediaCount).toBe(summary.imageCount)
    // Bildirilen sayı kadar kare üretilmez: gösterilemeyen dosya gösterilmiş
    // gibi yapılmaz.
    expect(detail.media.length).toBeLessThanOrEqual(
      stockPhotoCount(summary.category),
    )
    expect(detail.media.length).toBeLessThan(summary.imageCount)
  })

  it('konum çizimi ŞEMATİKTİR: lat/lng taşımaz, arama kaydının yerleşimini taşır', async () => {
    const summary = summaryOf('listing-1-4')
    const detail = await projected('listing-1-4')

    expect(detail.geo?.kind).toBe('schematic')
    if (detail.geo?.kind !== 'schematic') throw new Error('şematik geo bekleniyordu')
    expect(detail.geo.x).toBe(summary.map.x)
    expect(detail.geo.y).toBe(summary.map.y)
    expect(detail.geo.sourceLabel).toMatch(/şematik/i)
    expect(detail.geo).not.toHaveProperty('lat')
    expect(detail.geo).not.toHaveProperty('lng')
    // Mahremiyet yarıçapı yalnız gerçek koordinat gizlenirken anlamlıdır.
    expect(detail.geo).not.toHaveProperty('radiusMeters')
  })

  it('referans defterin coğrafi konumu yansıtmadan etkilenmez', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(result?.detail.geo?.kind).toBe('geographic')
    if (result?.detail.geo?.kind !== 'geographic') throw new Error('coğrafi geo bekleniyordu')
    expect(result.detail.geo.lat).toBe(37.2984)
    expect(result.detail.geo.radiusMeters).toBe(250)
  })

  it('cevapsız kalan hiçbir kanıt değeri güncel sayılmaz', async () => {
    const detail = await projected('listing-3-1')
    for (const attribute of detail.declaredAttributes) {
      if (!isAnswered(attribute.value)) expect(attribute.value.freshness).toBe('unknown')
    }
  })

  it('aynı `now` ile iki çağrı birebir aynı sonucu üretir', async () => {
    const first = await loadListingDetail({ listingId: 'listing-5-2', now: NOW })
    const second = await loadListingDetail({ listingId: 'listing-5-2', now: NOW })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('iki çağrının sonuçları iç içe referansları paylaşmaz', async () => {
    const first = await loadListingDetail({ listingId: 'listing-5-2', now: NOW })
    const second = await loadListingDetail({ listingId: 'listing-5-2', now: NOW })
    expect(first?.detail.verification).not.toBe(second?.detail.verification)
  })

  it('süresi dolmuş senaryosu yansıtılan ilanda da yaşam döngüsünü taşır', async () => {
    const result = await loadListingDetail({
      listingId: 'listing-3-1',
      scenario: 'inactive',
      now: NOW,
    })
    expect(result?.detail.lifecycle).toBe('expired')
  })

  it('referans ilan defteri yansıtmadan etkilenmez', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    if (result?.detail.kind !== 'land') throw new Error('arsa defteri bekleniyordu')
    expect(result.detail.parcel.blockParcel.value).toBe('214 ada / 7 parsel')
    expect(result.detail.documents).toHaveLength(5)
    expect(result.aiBrief.state).toBe('ready')
  })
})
