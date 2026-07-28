import { GlassAlert } from '@repo/ui'

import type { SectionState } from '../data/listing-detail-adapter'
import type { LandListingDetail } from '../domain/listing-detail-types'
import { formatArea } from '../format'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface ParcelSectionProps {
  detail: LandListingDetail
  mapSection: SectionState<true>
}

/**
 * Parsel kimliği ve konum bölümü.
 *
 * Harita bir zenginleştirmedir: sağlayıcı düşse de ada/parsel, kayıtlı
 * yüzölçümü ve konum kesinliği metin olarak burada kalır. Her satır kendi
 * kaynak künyesini taşır; yüzölçümü çelişkisi künyede iki değeri birlikte
 * gösterir ve sessizce çözülmez.
 */
export function ParcelSection({ detail, mapSection }: ParcelSectionProps) {
  const { parcel } = detail

  return (
    <section id="parsel" className={styles.section} aria-labelledby="parsel-baslik">
      <h2 id="parsel-baslik" className={styles.sectionTitle}>
        Parsel
      </h2>

      {mapSection.state === 'unavailable' ? (
        <GlassAlert severity="warning" title="Harita gösterilemiyor">
          {mapSection.reason}
        </GlassAlert>
      ) : null}

      <EvidenceList>
        <EvidenceRow label="Ada / parsel" value={parcel.blockParcel} />
        <EvidenceRow
          label="Kayıtlı yüzölçümü"
          value={parcel.area}
          formatValue={formatArea}
          note={`İlanda ${formatArea(detail.price.declaredArea)} beyan edildi; birim fiyat beyan edilen alana göre hesaplandı.`}
        />
        <EvidenceRow label="Konum kesinliği" value={parcel.locationPrecision} />
        {parcel.distanceToSea ? (
          <EvidenceRow label="Denize mesafe" value={parcel.distanceToSea} />
        ) : null}
      </EvidenceList>
    </section>
  )
}
