import type { GlassMetricStripItem } from '@repo/ui'
import { hasConflict, isAnswered } from './evidence'
import type { ListingDetail, VerificationRow } from './listing-detail-types'

export interface CriticalIssue {
  id: string
  title: string
  detail: string
  /** Kullanıcının atabileceği güvenli sonraki adım */
  action?: string
}

const trNumber = new Intl.NumberFormat('tr-TR')

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
        ? `Kayıtta ${trNumber.format(recorded)} m², ilanda`
        : 'Kayıt değeri alınamadı; ilanda'
    issues.push({
      id: 'area-conflict',
      title: 'Yüzölçümü çelişkisi',
      detail: `${recordedText} ${trNumber.format(declared)} m² beyan edildi. Birim fiyat beyan edilen alana göre hesaplandı.`,
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
      value: `${trNumber.format(detail.price.amount)} ₺`,
      hint: 'İlan sahibi beyanı',
    },
    {
      id: 'unit-price',
      label: 'Birim fiyat',
      value: `${trNumber.format(detail.price.unitPrice)} ₺/m²`,
      hint: 'Beyan edilen alana göre türetildi',
    },
  ]

  const area = detail.parcel.area
  if (area.value !== undefined) {
    items.push({
      id: 'area',
      label: 'Yüzölçümü',
      value: `${trNumber.format(area.value)} m²`,
      hint: hasConflict(area) ? 'MEGSİS kaydı · beyanla çelişiyor' : 'MEGSİS kaydı',
    })
  }

  const median = detail.market.comparableMedianUnitPrice
  if (median.value !== undefined) {
    items.push({
      id: 'comparable-median',
      label: 'Emsal medyanı',
      value: `${trNumber.format(median.value)} ₺/m²`,
      hint: `${detail.market.comparableCount} ilan · yalnız ilan fiyatı`,
    })
  }

  items.push(
    detail.market.valuation.kind === 'range'
      ? {
          id: 'valuation',
          label: 'ArsaPazar tahmini',
          value: `${trNumber.format(detail.market.valuation.low)} – ${trNumber.format(
            detail.market.valuation.high,
          )} ₺`,
          hint: `Model ${detail.market.valuation.methodVersion} · ${detail.market.valuation.sampleSize} emsal`,
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
