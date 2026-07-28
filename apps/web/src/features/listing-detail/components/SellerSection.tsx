import styles from '../ListingDetailWorkspace.module.css'

/**
 * Satıcı bölümü.
 *
 * Karar rayının altındaki özetin tam karşılığı (yetki belgesi kaynağı, üyelik
 * geçmişi, ilan sayısı) Task 12'de doldurulur. Bölüm indeksinde yer almaz:
 * ray zaten karar anında satıcı özetini taşır.
 */
export function SellerSection() {
  return (
    <section id="satici" className={styles.section} aria-labelledby="satici-baslik">
      <h2 id="satici-baslik" className={styles.sectionTitle}>
        Satıcı
      </h2>
    </section>
  )
}
