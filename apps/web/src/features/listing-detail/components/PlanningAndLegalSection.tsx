import type { ListingDetail } from '../domain/listing-detail-types'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface PlanningAndLegalSectionProps {
  detail: ListingDetail
}

/** Kaydın bulunmaması yükün bulunmadığı anlamına gelmez — künyede yazılı kalır. */
const ENCUMBRANCE_LIMITATIONS = ['İpotek, haciz, şerh veya beyan bulunmadığı anlamına gelmez.']

/**
 * İmar ve hukuk bölümü.
 *
 * Tapu niteliği, hisse durumu, plan durumu, kullanım kararı ve takyidat
 * satırları kaynak künyeleriyle gelir. Takyidat kaydı sunulmadığında satır
 * boş bırakılmaz: nedeni yazılır ve künye bunun "yük yok" demek olmadığını
 * söyler.
 */
export function PlanningAndLegalSection({ detail }: PlanningAndLegalSectionProps) {
  const { planning } = detail

  const shareNote = planning.shared.isShared
    ? planning.shared.share
      ? `Tapu hisseli — ilan ${planning.shared.share} pay için veriliyor.`
      : 'Tapu hisseli — ilan taşınmazın tamamı için değil, bir pay için veriliyor.'
    : undefined

  const planNote = [
    planning.planNumber ? `Plan ${planning.planNumber}` : undefined,
    planning.planScale ? `ölçek ${planning.planScale}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section id="imar" className={styles.section} aria-labelledby="imar-baslik">
      <h2 id="imar-baslik" className={styles.sectionTitle}>
        İmar ve Hukuk
      </h2>

      <EvidenceList>
        <EvidenceRow label="Tapu niteliği" value={planning.titleDeedType} note={shareNote} />
        <EvidenceRow label="Plan durumu" value={planning.planStatus} note={planNote || undefined} />
        <EvidenceRow label="Kullanım kararı" value={planning.landUse} />
        <EvidenceRow
          label="Takyidat"
          value={planning.encumbrance}
          fallbackText="Bilgi alınamadı — TAKBİS kaydı sunulmadı"
          limitationsOverride={ENCUMBRANCE_LIMITATIONS}
          note="Güncel takyidat belgesi görüşmeden önce satıcıdan istenmelidir."
        />
      </EvidenceList>
    </section>
  )
}
