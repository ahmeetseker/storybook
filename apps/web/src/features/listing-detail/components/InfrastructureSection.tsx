import { GlassAlert } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface InfrastructureSectionProps {
  detail: ListingDetail
}

/**
 * Altyapı ve erişim bölümü.
 *
 * Yasal yol erişimi ile fiziksel ulaşım ayrı satırlardır ve ayrı kaynaklardan
 * gelir: uydu görüntüsünde görünen stabilize yol, kadastral bir geçit hakkı
 * kanıtı değildir. Bu ayrım bölümün üstünde görünür bir uyarı olarak durur.
 */
export function InfrastructureSection({ detail }: InfrastructureSectionProps) {
  const { access } = detail

  return (
    <section id="altyapi" className={styles.section} aria-labelledby="altyapi-baslik">
      <h2 id="altyapi-baslik" className={styles.sectionTitle}>
        Altyapı ve Erişim
      </h2>

      <GlassAlert severity="warning" title="Erişim iki ayrı sorudur">
        Yasal erişim ile fiziksel erişim aynı şey değildir. Yola yakınlık yasal erişim hakkı
        değildir.
      </GlassAlert>

      <EvidenceList>
        <EvidenceRow
          label="Yasal yol erişimi"
          value={access.legalRoadAccess}
          fallbackText="Bilgi alınamadı — kadastral yol veya geçit irtifakı kaydı bulunamadı"
          note="Yol erişim / irtifak kaydı görüşmeden önce istenmelidir."
        />
        <EvidenceRow label="Fiziksel ulaşım" value={access.physicalAccess} />
        {access.utilities.map((utility) => (
          <EvidenceRow key={utility.id} label={utility.label} value={utility.value} />
        ))}
      </EvidenceList>
    </section>
  )
}
