import styles from '../ListingDetailWorkspace.module.css'

/**
 * Belgeler bölümü.
 *
 * Sunulan ve eksik belgeler — eksik olanların kritikliği görünür kalacak
 * biçimde — Task 11'de listelenir.
 */
export function DocumentsSection() {
  return (
    <section id="belgeler" className={styles.section} aria-labelledby="belgeler-baslik">
      <h2 id="belgeler-baslik" className={styles.sectionTitle}>
        Belgeler
      </h2>
    </section>
  )
}
