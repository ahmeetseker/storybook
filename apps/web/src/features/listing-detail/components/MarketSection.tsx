import { GlassTable, type GlassTableRow } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { formatNumber, formatPrice, formatUnitPrice } from '../format'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface MarketSectionProps {
  detail: ListingDetail
}

const COLUMNS = [
  { key: 'record', label: 'Kayıt' },
  { key: 'unitPrice', label: 'Birim fiyat', align: 'end' as const },
  { key: 'source', label: 'Kaynak' },
]

/** İlanın birim fiyatının emsal medyanına göre konumu — yön kelimeyle yazılır. */
function medianComparison(unitPrice: number, median: number): string {
  const percent = Math.round(((unitPrice - median) / median) * 100)
  if (percent === 0) return 'Bu ilanın birim fiyatı emsal medyanıyla aynı düzeyde.'
  return percent < 0
    ? `Bu ilanın birim fiyatı emsal medyanının %${Math.abs(percent)} altında.`
    : `Bu ilanın birim fiyatı emsal medyanının %${percent} üstünde.`
}

/**
 * Piyasa bölümü.
 *
 * Emsal kesiti gerçek bir tablo olarak sunulur; satırların hepsi ilan
 * fiyatıdır ve bu görünür biçimde söylenir. Değerleme çekinmesi geçerli bir
 * sonuçtur: örneklem eşiğin altındaysa uydurma bir aralık yerine gerekçe
 * gösterilir.
 */
export function MarketSection({ detail }: MarketSectionProps) {
  const { market, price } = detail
  const median = market.comparableMedianUnitPrice.value

  const rows: GlassTableRow[] = [
    {
      id: 'listing',
      record: 'Bu ilan',
      unitPrice: formatUnitPrice(price.unitPrice),
      source: 'İlan sahibi beyanı',
    },
  ]
  if (median !== undefined) {
    rows.push({
      id: 'median',
      record: `Emsal medyanı · ${formatNumber(market.comparableCount)} ilan`,
      unitPrice: formatUnitPrice(median),
      source: market.comparableMedianUnitPrice.source.name,
    })
  }

  return (
    <section id="piyasa" className={styles.section} aria-labelledby="piyasa-baslik">
      <h2 id="piyasa-baslik" className={styles.sectionTitle}>
        Piyasa
      </h2>

      <EvidenceList>
        <EvidenceRow
          label="Emsal medyan birim fiyatı"
          value={market.comparableMedianUnitPrice}
          formatValue={formatUnitPrice}
          note={`${formatNumber(market.comparableCount)} ilanlık kesit`}
        />
      </EvidenceList>

      <div className={styles.marketBlock}>
        <GlassTable columns={COLUMNS} rows={rows} aria-label="Emsal karşılaştırması" />
        <p className={styles.blockNote}>
          {median !== undefined ? `${medianComparison(price.unitPrice, median)} ` : ''}
          Bu satırlar yalnız ilan fiyatıdır; gerçekleşmiş satış kaydı değildir. Emsal ilanların tek
          tek dökümü bu kayıtta yer almıyor.
        </p>
      </div>

      <div className={styles.marketBlock}>
        {market.valuation.kind === 'insufficient' ? (
          <>
            <h3 className={styles.subTitle}>ArsaPazar fiyat tahmini üretilmedi</h3>
            <p className={styles.blockNote}>{market.valuation.reason}</p>
          </>
        ) : (
          <>
            <h3 className={styles.subTitle}>ArsaPazar fiyat tahmini</h3>
            <p className={styles.valuationRange}>
              {`${formatPrice(market.valuation.low)} – ${formatPrice(market.valuation.high)}`}
            </p>
            <p className={styles.blockNote}>
              {`Model ${market.valuation.methodVersion} · ${formatNumber(market.valuation.sampleSize)} emsal üzerinden hesaplandı.`}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
