import styles from '../ListingDetailWorkspace.module.css'

/**
 * Yapay zekâ karar özeti bölümü.
 *
 * Özet, iddiaların bölüm çapaları, bilinmeyenler ve sonraki kontroller —
 * asistan yanıt veremediğindeki gerekçeli boş durumla birlikte — Task 12'de
 * doldurulur.
 */
export function ListingEvidenceBrief() {
  return (
    <section id="ai-karar-ozeti" className={styles.section} aria-labelledby="ai-karar-ozeti-baslik">
      <h2 id="ai-karar-ozeti-baslik" className={styles.sectionTitle}>
        Yapay zekâ karar özeti
      </h2>
    </section>
  )
}
