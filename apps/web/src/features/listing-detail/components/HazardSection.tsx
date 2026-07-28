import type { ListingDetail } from '../domain/listing-detail-types'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface HazardSectionProps {
  detail: ListingDetail
}

/**
 * Arazi ve tehlike bölümü.
 *
 * Tehlike göstergesi risk hükmü değildir: her satır kendi kapsam notunu
 * görünür metin olarak taşır. Yayımlanmamış bir katman "tehlike yok" gibi
 * sunulmaz — satır boş kalmaz, katmanın bulunmadığı ve bunun ne anlama
 * gelmediği yazılır.
 */
export function HazardSection({ detail }: HazardSectionProps) {
  const { terrain } = detail

  return (
    <section id="arazi" className={styles.section} aria-labelledby="arazi-baslik">
      <h2 id="arazi-baslik" className={styles.sectionTitle}>
        Arazi ve Tehlike
      </h2>

      <EvidenceList>
        <EvidenceRow label="Eğim" value={terrain.slope} />
        {terrain.aspect ? <EvidenceRow label="Bakı ve kot" value={terrain.aspect} /> : null}
        {terrain.hazards.map((hazard) => (
          <EvidenceRow
            key={hazard.id}
            label={hazard.label}
            value={hazard.value}
            note={hazard.scopeNote}
          />
        ))}
      </EvidenceList>
    </section>
  )
}
