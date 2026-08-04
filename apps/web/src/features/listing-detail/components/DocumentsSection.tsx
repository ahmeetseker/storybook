import { Fragment } from 'react'

import type { ListingDetail, ListingDocument } from '../domain/listing-detail-types'
import { formatDate } from '../format'
import styles from '../ListingDetailWorkspace.module.css'
import { EvidenceState, type EvidenceTone } from './EvidenceState'

export interface DocumentsSectionProps {
  detail: ListingDetail
}

/**
 * Belgelerin üç grubu — sıra karar sırasıdır.
 *
 * Kritik eksikler önce gelir çünkü alıcının yapacağı iş onlardır; elimizde
 * olanlar en sonda durur. Grup başlığı severity'yi (kritik olup olmadığını)
 * taşır, satır yalnız durumu yazar — aksi hâlde her satır grubun söylediğini
 * en kalın yazıyla tekrar ederdi.
 */
const GROUPS = [
  { id: 'critical', label: 'Eksik — kritik', tone: 'negative' },
  { id: 'missing', label: 'Eksik', tone: 'unknown' },
  { id: 'available', label: 'Elimizde', tone: 'positive' },
] as const satisfies ReadonlyArray<{ id: string; label: string; tone: EvidenceTone }>

type GroupId = (typeof GROUPS)[number]['id']

function groupOf(document: ListingDocument): GroupId {
  if (document.state === 'available') return 'available'
  return document.critical ? 'critical' : 'missing'
}

/**
 * Satırın durum kelimesi.
 *
 * "Kritik" burada tekrar edilmez: onu grup başlığı taşır. Kelime yine de
 * zorunludur — renk tek başına bilgi taşımaz (WCAG 1.4.1).
 */
function stateLabel(document: ListingDocument): string {
  return document.state === 'available' ? 'Sunuldu' : 'Sunulmadı'
}

/**
 * Kaynak sütununun satırları: belgeyi kim verdi, ne zaman — eksikse kimden
 * isteneceği. Sütun dardır (`--evidence-source-col`), bu yüzden künye
 * satırlara bölünür; tek bir uzun cümleye sıkıştırılmaz.
 */
function sourceLines(document: ListingDocument): string[] {
  const lines: string[] = []
  if (document.authority) {
    lines.push(
      document.state === 'available'
        ? `Veren: ${document.authority}`
        : `İstenecek: ${document.authority}`,
    )
  }
  if (document.issuedAt) lines.push(formatDate(document.issuedAt))
  if (lines.length === 0) lines.push('Kurum bilgisi bildirilmedi')
  return lines
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
 * Eksik belge sessizce listeden düşmez: kritik olanlar kendi grubunda, hangi
 * kurumdan isteneceğiyle birlikte en üstte durur. Belgenin sunulmamış olması
 * içeriğinin olumsuz olduğu anlamına gelmez.
 *
 * Satırlar bandın ortak kanıt ızgarasındadır (`.evidenceRow`): belge adı
 * kimlik sütununda, durum ortada, künye kendi sütununda. Gruplama ikinci bir
 * kolon açmaz — eşit olmayan dağılımda bir kolon erken biter ve ortak eksen
 * kırılırdı.
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

      {/* Grup başlığı `h3`'tür, süslü bir satır değil: severity'yi ("kritik")
          taşıyan tek yer orasıdır ve ekran okuyucuda başlık gezinmesine
          girmesi gerekir. Her grup kendi listesidir; sütunlar gruplar arasında
          aynı kalır çünkü hepsi aynı genişlikte durur. */}
      {GROUPS.map((group) => {
        const rows = detail.documents.filter((document) => groupOf(document) === group.id)
        if (rows.length === 0) return null
        const titleId = `belgeler-${group.id}`

        return (
          <div key={group.id} className={styles.evidenceGroupBlock}>
            <h3 id={titleId} className={styles.evidenceGroupTitle}>
              {group.label}
              <span className={styles.evidenceGroupCount}>{rows.length}</span>
            </h3>
            <ul className={styles.evidenceGrid} aria-labelledby={titleId}>
              {rows.map((document) => (
                <li key={document.id} className={styles.evidenceRow} data-state={document.state}>
                  {/* Kimlik sütunu: satırlar arasında değişen tek şey budur,
                      tarama hedefi burasıdır. */}
                  <p className={styles.evidenceLabel}>{document.label}</p>
                  <div className={styles.evidenceValue}>
                    <EvidenceState tone={group.tone} className={styles.evidenceState}>
                      {stateLabel(document)}
                    </EvidenceState>
                  </div>
                  <p className={styles.evidenceSource}>
                    {sourceLines(document).map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </Fragment>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
