import {
  parseTurkishNumber,
  type ListingLocation,
  type ListingProperty,
} from './listing-create-domain'

export interface ListingPricingInsight {
  lowerEstimate: number | null
  upperEstimate: number | null
  comparableCount: number
  refreshedLabel: string
  confidenceLabel: string
  scopeLabel: string
  disclaimer: string
}

const unitPrices = {
  land: 9_200,
  residential: 48_500,
  commercial: 62_500,
  building: 38_000,
} as const

const districtMultipliers: Record<string, number> = {
  urla: 1.18,
  çeşme: 1.34,
  seferihisar: 0.92,
  kadıköy: 1.42,
  beşiktaş: 1.55,
  sarıyer: 1.48,
  gölbaşı: 0.88,
  çankaya: 1.06,
}

const districtLabels: Record<string, string> = {
  urla: 'Urla',
  çeşme: 'Çeşme',
  seferihisar: 'Seferihisar',
  kadıköy: 'Kadıköy',
  beşiktaş: 'Beşiktaş',
  sarıyer: 'Sarıyer',
  gölbaşı: 'Gölbaşı',
  çankaya: 'Çankaya',
}

export function getListingPricingInsight(
  property: ListingProperty,
  location: ListingLocation,
): ListingPricingInsight {
  const area = parseTurkishNumber(property.area || property.grossArea)
  const baseUnitPrice = property.family ? unitPrices[property.family] : 0
  const districtMultiplier = districtMultipliers[location.district] ?? 1
  const saleEstimate =
    Number.isFinite(area) && area > 0 && baseUnitPrice > 0
      ? area * baseUnitPrice * districtMultiplier
      : null
  const midpoint =
    saleEstimate && property.transaction === 'rent'
      ? saleEstimate / 240
      : saleEstimate

  return {
    lowerEstimate: midpoint ? Math.round(midpoint * 0.91) : null,
    upperEstimate: midpoint ? Math.round(midpoint * 1.09) : null,
    comparableCount: location.district ? 18 : 0,
    refreshedLabel: '25 Temmuz 2026',
    confidenceLabel: location.district && area > 0 ? 'Orta güven' : 'Veri bekleniyor',
    scopeLabel: districtLabels[location.district] ?? 'Seçili bölge',
    disclaimer:
      'Bu demo tahmin bir ekspertiz veya resmi değerleme değildir; yayın fiyatına yalnız siz karar verirsiniz.',
  }
}

export function formatPricingEstimate(value: number | null): string {
  return value === null
    ? '—'
    : `${Math.round(value).toLocaleString('tr-TR')} TL`
}
