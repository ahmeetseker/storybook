import styles from '../ListingDetailWorkspace.module.css'

/**
 * Altyapı ve erişim bölümü.
 *
 * Yasal yol erişimi, fiziksel erişim ve altyapı satırları Task 10'da
 * `EvidenceRow` ile doldurulur; burada yalnız çapa hedefi ve başlık vardır.
 */
export function InfrastructureSection() {
  return (
    <section id="altyapi" className={styles.section} aria-labelledby="altyapi-baslik">
      <h2 id="altyapi-baslik" className={styles.sectionTitle}>
        Altyapı ve Erişim
      </h2>
    </section>
  )
}
