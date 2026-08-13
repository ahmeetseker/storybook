// Bölge kartındaki 12 aylık m² fiyat serisi. Emlak Endeksi'nin seri
// üreticisini paylaşır: aynı ay etiketleri, aynı dalgalanma dili ve son nokta
// her zaman kartta yazan fiyata oturur — kart ile endeks sayfası aynı bölge
// için farklı bir geçmiş anlatamaz.
import { buildSeries, phaseFor } from '@/features/price-index/data/price-index-adapter'
import type { TimeSeriesPoint } from '@/features/price-index/domain/price-index-types'
import type { RegionSummary } from '../domain/region-types'

export function regionPriceSeries(region: RegionSummary): TimeSeriesPoint[] {
  return buildSeries(region.pricePerSqm, region.priceTrend, '1y', 'nominal', 0, phaseFor(region.id))
}
