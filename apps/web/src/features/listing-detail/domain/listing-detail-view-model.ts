import type { GlassMetricStripItem } from '@repo/ui'
import { hasConflict, isAnswered } from './evidence'
import type { ListingDetail, VerificationRow } from './listing-detail-types'
// Biçimlendirme tek modülde yaşar (`../format`): sayı, para, alan ve birim
// fiyat aynı cümlede iki farklı biçimde yazılamaz. Modül feature kökündedir,
// görünüm katmanına ait değildir — domain de tüketebilir.
import { formatArea, formatNumber, formatPrice, formatUnitPrice } from '../format'

export interface CriticalIssue {
  id: string
  title: string
  detail: string
  /** Kullanıcının atabileceği güvenli sonraki adım */
  action?: string
}

/** İlan birim fiyatının emsal medyanına göre konumu. */
export interface MedianPosition {
  /** Yuvarlanmış yüzde farkı; negatif değer medyanın altını gösterir */
  percent: number
  direction: 'below' | 'above' | 'level'
}

/**
 * Emsal karşılaştırmasının **tek** türetimi.
 *
 * Piyasa bölümü de kaynaklı AI karar özeti de aynı sayıyı yazar; iki ayrı
 * hesap (veya biri donmuş sabit) olduğunda ilk fixture değişikliğinde özet
 * kanıtla çelişir.
 */
export function medianPosition(unitPrice: number, median: number): MedianPosition {
  const percent = Math.round(((unitPrice - median) / median) * 100)
  return {
    percent,
    direction: percent === 0 ? 'level' : percent < 0 ? 'below' : 'above',
  }
}

/** Konumun cümle içinde kullanılan görünür parçası — yön kelimeyle yazılır. */
export function medianPositionPhrase(position: MedianPosition): string {
  if (position.direction === 'level') return 'emsal medyanıyla aynı düzeyde'
  const side = position.direction === 'below' ? 'altında' : 'üstünde'
  return `emsal medyanının %${Math.abs(position.percent)} ${side}`
}

/** Karar öncesi çözülmesi gereken konular — accordion arkasına saklanmaz. */
export function criticalIssues(detail: ListingDetail): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  if (detail.planning.shared.isShared) {
    const share = detail.planning.shared.share
    issues.push({
      id: 'shared-title-deed',
      title: 'Tapu hisseli',
      detail: share
        ? `İlan ${share} pay için veriliyor. Diğer paydaşların satışa katılımı ve önalım hakkı belirsiz.`
        : 'İlan taşınmazın tamamı için değil, bir pay için veriliyor.',
      action: 'Paydaş durumunu sor',
    })
  }

  if (!isAnswered(detail.access.legalRoadAccess)) {
    issues.push({
      id: 'legal-access-unverified',
      title: 'Yasal yol erişimi doğrulanamadı',
      detail:
        'Kadastral yol veya geçit irtifakı kaydı bulunamadı. Yola yakınlık yasal erişim hakkı değildir.',
      action: 'Yol erişim belgesi iste',
    })
  }

  if (hasConflict(detail.parcel.area)) {
    const recorded = detail.parcel.area.value
    const declared = detail.price.declaredArea
    const recordedText =
      recorded !== undefined
        ? `Kayıtta ${formatArea(recorded)}, ilanda`
        : 'Kayıt değeri alınamadı; ilanda'
    issues.push({
      id: 'area-conflict',
      title: 'Yüzölçümü çelişkisi',
      detail: `${recordedText} ${formatArea(declared)} beyan edildi. Birim fiyat beyan edilen alana göre hesaplandı.`,
      action: 'Aplikasyon krokisi iste',
    })
  }

  return issues
}

export function verificationScore(rows: VerificationRow[]): { positive: number; total: number } {
  return {
    positive: rows.filter((row) => row.state === 'positive').length,
    total: rows.length,
  }
}

/** L0 karar görüntüsünün sayısal şeridi; her değer kaynağını hint'te taşır. */
export function metricStripItems(detail: ListingDetail): GlassMetricStripItem[] {
  const items: GlassMetricStripItem[] = [
    {
      id: 'price',
      label: 'Toplam fiyat',
      value: formatPrice(detail.price.amount),
      hint: 'İlan sahibi beyanı',
    },
    {
      id: 'unit-price',
      label: 'Birim fiyat',
      value: formatUnitPrice(detail.price.unitPrice),
      hint: 'Beyan edilen alana göre türetildi',
    },
  ]

  const area = detail.parcel.area
  if (area.value !== undefined) {
    items.push({
      id: 'area',
      label: 'Yüzölçümü',
      value: formatArea(area.value),
      hint: hasConflict(area) ? 'MEGSİS kaydı · beyanla çelişiyor' : 'MEGSİS kaydı',
    })
  }

  const median = detail.market.comparableMedianUnitPrice
  if (median.value !== undefined) {
    items.push({
      id: 'comparable-median',
      label: 'Emsal medyanı',
      value: formatUnitPrice(median.value),
      hint: `${formatNumber(detail.market.comparableCount)} ilan · yalnız ilan fiyatı`,
    })
  }

  items.push(
    detail.market.valuation.kind === 'range'
      ? {
          id: 'valuation',
          label: 'ArsaPazar tahmini',
          value: `${formatPrice(detail.market.valuation.low)} – ${formatPrice(
            detail.market.valuation.high,
          )}`,
          hint: `Model ${detail.market.valuation.methodVersion} · ${formatNumber(detail.market.valuation.sampleSize)} emsal`,
        }
      : {
          id: 'valuation',
          label: 'ArsaPazar tahmini',
          value: 'Üretilmedi',
          hint: detail.market.valuation.reason,
        },
  )

  return items
}
