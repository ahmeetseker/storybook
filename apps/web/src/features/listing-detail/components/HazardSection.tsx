import styles from '../ListingDetailWorkspace.module.css'

/**
 * Arazi ve tehlike bölümü.
 *
 * Eğim, bakı ve tehlike göstergeleri — kapsam notlarıyla birlikte — Task 10'da
 * eklenir. Tehlike göstergesi risk hükmü değildir; bu ayrım metinle taşınır.
 */
export function HazardSection() {
  return (
    <section id="arazi" className={styles.section} aria-labelledby="arazi-baslik">
      <h2 id="arazi-baslik" className={styles.sectionTitle}>
        Arazi ve Tehlike
      </h2>
    </section>
  )
}
