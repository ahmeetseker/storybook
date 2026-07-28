import type { ListingDetail, ListingDocument } from '../domain/listing-detail-types'
import { formatDate } from '../format'
import styles from '../ListingDetailWorkspace.module.css'

export interface DocumentsSectionProps {
  detail: ListingDetail
}

/** Belge durumu yalnız renkle değil kelimeyle taşınır. */
function stateLabel(document: ListingDocument): string {
  if (document.state === 'available') return 'Sunuldu'
  return document.critical ? 'Kritik eksik' : 'Eksik'
}

/** Belgenin kim tarafından verildiği ve tarihi — eksikse kimden isteneceği. */
function metaText(document: ListingDocument): string {
  const parts: string[] = []
  if (document.authority) {
    parts.push(
      document.state === 'available'
        ? `Veren kurum: ${document.authority}`
        : `İstenecek kurum: ${document.authority}`,
    )
  }
  if (document.issuedAt) parts.push(`Tarih: ${formatDate(document.issuedAt)}`)
  if (parts.length === 0) parts.push('Kurum bilgisi bildirilmedi')
  return parts.join(' · ')
}

/**
 * Bölüm girişindeki özet cümle.
 *
 * Belge listesi hiç yoksa "0 belgenin tamamı sunuldu" gibi doğru olmayan bir
 * tamlık iddiası üretilmez: kayıtta belge bulunmadığı ve bunun olumsuzluk
 * anlamına gelmediği yazılır.
 */
function summaryText(documents: ListingDocument[], criticalMissing: number): string {
  if (documents.length === 0) {
    return 'Bu ilan kaydında belge bulunmuyor. Tapu örneği, imar durum belgesi ve yapı ruhsatı gibi belgeler platforma sunulmamıştır; sunulmamış olması belgelerin bulunmadığı ya da içeriğinin olumsuz olduğu anlamına gelmez.'
  }
  if (criticalMissing > 0) {
    return `${documents.length} belgeden ${criticalMissing} tanesi kritik ve sunulmadı. Eksik belge, içeriğinin olumsuz olduğu anlamına gelmez — yalnız doğrulanamadığı anlamına gelir.`
  }
  return `${documents.length} belgenin tamamı sunuldu.`
}

/**
 * Belgeler bölümü.
 *
 * Eksik belge sessizce listeden düşmez: kritik olanlar "Kritik eksik"
 * etiketiyle ve hangi kurumdan isteneceğiyle birlikte görünür. Belgenin
 * sunulmamış olması içeriğinin olumsuz olduğu anlamına gelmez.
 */
export function DocumentsSection({ detail }: DocumentsSectionProps) {
  const criticalMissing = detail.documents.filter(
    (document) => document.state === 'missing' && document.critical,
  )

  return (
    <section id="belgeler" className={styles.section} aria-labelledby="belgeler-baslik">
      <h2 id="belgeler-baslik" className={styles.sectionTitle}>
        Belgeler
      </h2>

      <p className={styles.blockNote}>{summaryText(detail.documents, criticalMissing.length)}</p>

      <ul className={styles.docList}>
        {detail.documents.map((document) => (
          <li
            key={document.id}
            className={styles.docItem}
            data-state={document.state === 'available' ? 'available' : document.critical ? 'critical' : 'missing'}
          >
            <p className={styles.docLabel}>{document.label}</p>
            <p className={styles.docState}>{stateLabel(document)}</p>
            <p className={styles.docMeta}>{metaText(document)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
