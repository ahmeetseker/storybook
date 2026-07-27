import { describe, expect, it } from 'vitest'
import {
  evidenceStatusLabel,
  freshnessFrom,
  hasConflict,
  isAnswered,
  sourceClassLabel,
  type EvidenceValue,
} from './evidence'

const NOW = '2026-07-27T09:00:00.000Z'

function official(): EvidenceValue<string> {
  return {
    value: '214 ada / 7 parsel',
    status: 'verified',
    freshness: 'current',
    source: {
      id: 'megsis',
      name: 'TKGM MEGSİS',
      sourceClass: 'official',
      authority: 'Tapu ve Kadastro Genel Müdürlüğü',
    },
    retrievedAt: '2026-07-24T09:12:00.000Z',
    scope: 'parcel',
  }
}

describe('sourceClassLabel', () => {
  it('her kaynak sınıfı için görünür Türkçe etiket üretir', () => {
    expect(sourceClassLabel('official')).toBe('Resmî kayıttan')
    expect(sourceClassLabel('verified_document')).toBe('Doğrulanmış belgeden')
    expect(sourceClassLabel('advertiser_declared')).toBe('İlan sahibi beyanı')
    expect(sourceClassLabel('platform_derived')).toBe('ArsaPazar hesabı')
    expect(sourceClassLabel('model_estimate')).toBe('Model tahmini')
    expect(sourceClassLabel('unknown')).toBe('Doğrulanamadı')
  })

  it('tek başına "Doğrulandı" etiketi üretmez', () => {
    const labels = (
      ['official', 'verified_document', 'advertiser_declared', 'platform_derived', 'model_estimate', 'unknown'] as const
    ).map(sourceClassLabel)
    expect(labels).not.toContain('Doğrulandı')
  })
})

describe('evidenceStatusLabel', () => {
  it('çelişkili değerde kaynak sınıfı yerine çelişki etiketi döner', () => {
    const value: EvidenceValue<number> = {
      ...official(),
      value: 4712,
      status: 'conflicting',
      conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }],
    }
    expect(evidenceStatusLabel(value)).toBe('Kaynaklar çelişiyor')
  })

  it('bayat değerde güncellik etiketi kaynak sınıfının önüne geçer', () => {
    const value = { ...official(), freshness: 'stale' as const }
    expect(evidenceStatusLabel(value)).toBe('Güncel değil')
  })

  it('değer yoksa doğrulanamadı etiketi döner', () => {
    const value: EvidenceValue<string> = {
      status: 'unavailable',
      unavailableReason: 'not_published',
      freshness: 'unknown',
      source: { id: 'takbis', name: 'TAKBİS', sourceClass: 'unknown' },
      retrievedAt: NOW,
      scope: 'property',
    }
    expect(evidenceStatusLabel(value)).toBe('Doğrulanamadı')
  })

  it('normal durumda kaynak sınıfı etiketini kullanır', () => {
    expect(evidenceStatusLabel(official())).toBe('Resmî kayıttan')
  })
})

describe('freshnessFrom', () => {
  it('90 günden yeni sorguyu güncel sayar', () => {
    expect(freshnessFrom('2026-07-24T09:12:00.000Z', NOW)).toBe('current')
  })

  it('90-180 gün arasını yaşlanıyor sayar', () => {
    expect(freshnessFrom('2026-03-01T00:00:00.000Z', NOW)).toBe('aging')
  })

  it('180 günden eski kaynağı bayat sayar', () => {
    expect(freshnessFrom('2025-11-19T00:00:00.000Z', NOW)).toBe('stale')
  })

  it('geçerlilik tarihi verilmişse onu sorgu tarihine tercih eder', () => {
    expect(freshnessFrom(NOW, NOW, '2025-11-19T00:00:00.000Z')).toBe('stale')
  })

  it('geçersiz tarihte bilinmiyor döner', () => {
    expect(freshnessFrom('bilinmiyor', NOW)).toBe('unknown')
  })
})

describe('hasConflict / isAnswered', () => {
  it('çelişki listesi doluysa hasConflict true olur', () => {
    expect(hasConflict({ ...official(), conflicts: [{ sourceId: 'x', value: 1 }] })).toBe(true)
    expect(hasConflict(official())).toBe(false)
  })

  it('değeri olmayan veya unavailable olan kanıt cevaplanmamış sayılır', () => {
    expect(isAnswered(official())).toBe(true)
    expect(isAnswered({ ...official(), value: undefined, status: 'unavailable' })).toBe(false)
  })
})
