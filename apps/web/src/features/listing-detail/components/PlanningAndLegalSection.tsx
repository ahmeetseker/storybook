import styles from '../ListingDetailWorkspace.module.css'

/**
 * İmar ve hukuk bölümü.
 *
 * Task 9 yalnız yerleşimi ve çapa hedefini kurar; tapu niteliği, hisse,
 * plan durumu ve takyidat satırları Task 10'da `EvidenceRow` ile gelir.
 */
export function PlanningAndLegalSection() {
  return (
    <section id="imar" className={styles.section} aria-labelledby="imar-baslik">
      <h2 id="imar-baslik" className={styles.sectionTitle}>
        İmar ve Hukuk
      </h2>
    </section>
  )
}
