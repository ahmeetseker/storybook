import { describe, expect, it } from 'vitest'
import { criticalIssues, metricStripItems, verificationScore } from './listing-detail-view-model'
import type { LandListingDetail, VerificationRow } from './listing-detail-types'
import type { EvidenceValue } from './evidence'

function evidence<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'verified',
    freshness: 'current',
    source: { id: 'megsis', name: 'TKGM MEGSİS', sourceClass: 'official' },
    retrievedAt: '2026-07-24T09:12:00.000Z',
    scope: 'parcel',
    ...over,
  }
}

function landDetail(over: Partial<LandListingDetail> = {}): LandListingDetail {
  return {
    kind: 'land',
    id: 'arsa-214-7',
    title: "Ören'de 4.850 m² tarla",
    lifecycle: 'active',
    listingNumber: '2026-114-8207',
    publishedAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-07-21T00:00:00.000Z',
    evidenceCutoff: '2026-07-24T09:12:00.000Z',
    location: { city: 'Muğla', district: 'Milas', neighbourhood: 'Ören' },
    price: { amount: 8_750_000, currency: 'TRY', declaredArea: 4850, unitPrice: 1804 },
    verification: [],
    parcel: {
      blockParcel: evidence('214 ada / 7 parsel'),
      area: evidence(4712),
      locationPrecision: evidence('Pin parsel geometrisinin içinde · ±5 m'),
    },
    planning: {
      titleDeedType: evidence('Tarla', { status: 'declared', source: { id: 'advertiser', name: 'İlan sahibi', sourceClass: 'advertiser_declared' } }),
      shared: { isShared: true, share: '2/4' },
      planStatus: evidence('1/1000 Uygulama İmar Planı — askıda'),
      landUse: evidence('Turizm Tesis Alanı (öneri)', { freshness: 'stale' }),
      encumbrance: { status: 'unavailable', unavailableReason: 'not_published', freshness: 'unknown', source: { id: 'takbis', name: 'TAKBİS', sourceClass: 'unknown' }, retrievedAt: '2026-07-24T09:12:00.000Z', scope: 'property' },
    },
    access: {
      legalRoadAccess: { status: 'unavailable', unavailableReason: 'not_published', freshness: 'unknown', source: { id: 'kadastro', name: 'Kadastro', sourceClass: 'unknown' }, retrievedAt: '2026-07-24T09:12:00.000Z', scope: 'parcel' },
      physicalAccess: evidence('Stabilize yol', { status: 'derived', source: { id: 'imagery', name: 'Uydu görüntüsü', sourceClass: 'platform_derived' } }),
      utilities: [],
    },
    terrain: { slope: evidence('%12'), hazards: [] },
    market: { comparableMedianUnitPrice: evidence(1980, { status: 'derived', source: { id: 'market', name: 'ArsaPazar emsal kesiti', sourceClass: 'platform_derived' } }), comparableCount: 14, valuation: { kind: 'insufficient', reason: 'Bölgede gerçekleşmiş işlem verisi yok; emsal örneklemi eşiğin altında.' } },
    documents: [],
    seller: { name: 'Ören Emlak', type: 'agency', licence: evidence('TTBS 4820/1173') },
    media: [],
    ...over,
  }
}

describe('criticalIssues', () => {
  it('hisseli tapuyu, doğrulanamayan yasal erişimi ve çelişkiyi kritik sayar', () => {
    const detail = landDetail({
      parcel: {
        blockParcel: evidence('214 ada / 7 parsel'),
        area: evidence(4712, { status: 'conflicting', conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }] }),
        locationPrecision: evidence('±5 m'),
      },
    })

    const ids = criticalIssues(detail).map((issue) => issue.id)
    expect(ids).toContain('shared-title-deed')
    expect(ids).toContain('legal-access-unverified')
    expect(ids).toContain('area-conflict')
  })

  it('çelişki metninde iki değeri ve iki kaynağı birlikte gösterir', () => {
    const detail = landDetail({
      parcel: {
        blockParcel: evidence('214 ada / 7 parsel'),
        area: evidence(4712, { status: 'conflicting', conflicts: [{ sourceId: 'advertiser', value: 4850 }] }),
        locationPrecision: evidence('±5 m'),
      },
    })
    const issue = criticalIssues(detail).find((item) => item.id === 'area-conflict')
    expect(issue?.detail).toContain('4.712')
    expect(issue?.detail).toContain('4.850')
  })

  it('müstakil tapu ve doğrulanmış erişimde kritik eksik üretmez', () => {
    const detail = landDetail({
      planning: {
        ...landDetail().planning,
        shared: { isShared: false },
      },
      access: {
        ...landDetail().access,
        legalRoadAccess: evidence('Kadastral yol cephesi var'),
      },
    })
    expect(criticalIssues(detail)).toHaveLength(0)
  })
})

describe('verificationScore', () => {
  it('yalnız olumlu satırları sayar, bilinmeyeni olumlu saymaz', () => {
    const rows: VerificationRow[] = [
      { id: 'listing_authorisation', title: 'İlan verme yetkisi EİDS ile doğrulandı', state: 'positive', source: 'EİDS' },
      { id: 'agency_licence', title: 'TTBS yetki belgesi geçerli', state: 'positive', source: 'TTBS' },
      { id: 'parcel_match', title: 'Yüzölçümü kayıtla eşleşmedi', state: 'negative', source: 'MEGSİS' },
      { id: 'planning_document', title: 'İmar durum belgesi sunulmadı', state: 'unknown', source: '—' },
    ]
    expect(verificationScore(rows)).toEqual({ positive: 2, total: 4 })
  })
})

describe('metricStripItems', () => {
  it('fiyat, birim fiyat ve kayıt alanını tabular değerlerle üretir', () => {
    const items = metricStripItems(landDetail())
    const byId = Object.fromEntries(items.map((item) => [item.id, item]))
    expect(byId.price.value).toBe('8.750.000 ₺')
    expect(byId['unit-price'].value).toBe('1.804 ₺/m²')
    expect(byId.area.value).toBe('4.712 m²')
    expect(byId.area.hint).toContain('MEGSİS')
  })

  it('değerleme çekindiğinde metrik yerine açıklama taşır', () => {
    const items = metricStripItems(landDetail())
    const valuation = items.find((item) => item.id === 'valuation')
    expect(valuation?.value).toBe('Üretilmedi')
    expect(valuation?.hint).toContain('veri')
  })
})
