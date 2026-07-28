import styles from '../ListingDetailWorkspace.module.css'

/**
 * Piyasa bölümü.
 *
 * Emsal kesiti ve değerleme sonucu (üretilemediğinde gerekçesiyle) Task 11'de
 * doldurulur.
 */
export function MarketSection() {
  return (
    <section id="piyasa" className={styles.section} aria-labelledby="piyasa-baslik">
      <h2 id="piyasa-baslik" className={styles.sectionTitle}>
        Piyasa
      </h2>
    </section>
  )
}
