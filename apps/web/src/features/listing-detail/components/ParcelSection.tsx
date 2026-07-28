import { GlassAlert } from '@repo/ui'

import type { SectionState } from '../data/listing-detail-adapter'
import type { EvidenceValue } from '../domain/evidence'
import type { ListingDetail } from '../domain/listing-detail-types'
import { formatArea } from '../format'
import styles from '../ListingDetailWorkspace.module.css'

export interface ParcelSectionProps {
  detail: ListingDetail
  mapSection: SectionState<true>
}

/** Cevapsız kanıt boş string veya sıfırla taklit edilmez. */
function textOf<T>(value: EvidenceValue<T>, format: (raw: T) => string): string {
  return value.value === undefined ? 'Kayıt alınamadı' : format(value.value)
}

/**
 * Parsel kimliği ve konum bölümü.
 *
 * Harita bir zenginleştirmedir: sağlayıcı düşse de ada/parsel, kayıtlı
 * yüzölçümü ve konum kesinliği metin olarak burada kalır. Satır bazlı kaynak
 * rozetleri Task 10'da `EvidenceRow` ile eklenir.
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

      <dl className={styles.factList}>
        <div className={styles.factRow}>
          <dt>Ada / parsel</dt>
          <dd>{textOf(parcel.blockParcel, (raw) => raw)}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Kayıtlı yüzölçümü</dt>
          <dd>{textOf(parcel.area, formatArea)}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Konum kesinliği</dt>
          <dd>{textOf(parcel.locationPrecision, (raw) => raw)}</dd>
        </div>
        {parcel.distanceToSea ? (
          <div className={styles.factRow}>
            <dt>Denize mesafe</dt>
            <dd>{textOf(parcel.distanceToSea, (raw) => raw)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
