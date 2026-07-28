import { GlassAiSummaryCard, GlassAlert } from '@repo/ui'

import type { AiDecisionBrief, SectionState } from '../data/listing-detail-adapter'
import type { ListingDetail } from '../domain/listing-detail-types'
import workspaceStyles from '../ListingDetailWorkspace.module.css'
import styles from './ListingEvidenceBrief.module.css'

export interface ListingEvidenceBriefProps {
  /** AI karar özeti bölüm durumu — asistan yanıt veremediğinde yalnız gerekçe taşır */
  brief: SectionState<AiDecisionBrief>
  /**
   * İlan detayı — komşu bölüm component'leriyle arayüz tutarlılığı için
   * alınır; bu bölümün içeriği tamamen `brief`'ten gelir.
   */
  detail: ListingDetail
}

/**
 * Kanıt kesiti tarihini gün/kısaltılmış ay/yıl olarak yazar (ör. "24 Tem
 * 2026"). Sayfanın diğer tarihleri `formatDate`/`formatEvidenceDate` ile uzun
 * ay adını kullanır; künye satırı burada kısaltılmış biçimi bilinçli olarak
 * ayrı tutar — kısa, tek satırlık bir asistan imzasında uzun ay adı satırı
 * gereksiz yer kaplar. Saat dilimi sayfanın geri kalanıyla aynı sabittir.
 */
function formatBriefCutoff(iso: string): string {
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return 'Bilinmiyor'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(parsed)
}

/**
 * Yapay zekâ karar özeti bölümü.
 *
 * "30 saniyelik karar özeti": her iddia sayfadaki kanıt bölümüne bağlanan bir
 * dayanak bağlantısı taşır, bilinmeyenler ve sonraki kontroller ayrı ayrı
 * listelenir; asistan ne fiyat tahmini ne de hukuki/değerleme görüşü üretir —
 * yalnız kanıt defterini özetler ve neyin eksik olduğunu söyler. Çıplak bir
 * güven yüzdesi hiçbir yerde gösterilmez (kalibre edilmiş bir değer yok);
 * bunun yerine kanıt kapsamı ve eksik alanlar görünür kalır.
 *
 * Asistan yanıt veremediğinde yalnız gerekçe gösterilir — sayfadaki
 * yapılandırılmış kanıt bölümleri (Parsel, İmar ve Hukuk, …) bundan etkilenmez,
 * çünkü zaten kendi verilerini bağımsız olarak taşırlar.
 */
export function ListingEvidenceBrief({ brief }: ListingEvidenceBriefProps) {
  if (brief.state === 'unavailable') {
    return (
      <GlassAlert severity="info" title="Karar özeti kullanılamıyor">
        {brief.reason}
      </GlassAlert>
    )
  }

  const { data } = brief
  const sourceNote = `ArsaPazar asistanı · model ${data.modelVersion} · kanıt kesiti ${formatBriefCutoff(data.evidenceCutoff)}`

  return (
    <section
      id="ai-karar-ozeti"
      className={workspaceStyles.section}
      aria-label="30 saniyelik karar özeti"
    >
      <h2 className={workspaceStyles.sectionTitle}>Yapay zekâ karar özeti</h2>

      <GlassAiSummaryCard summary={data.summary} sourceNote={sourceNote} />

      <ul className={styles.claimList}>
        {data.claims.map((claim) => (
          <li key={claim.id} className={styles.claimItem}>
            <span>{claim.text}</span>
            <a href={`#${claim.sectionId}`} className={styles.claimLink}>
              Dayanak
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.checklists}>
        <div>
          <h3 className={styles.checklistTitle}>Bilinmeyenler</h3>
          <ul className={styles.checklist}>
            {data.unknowns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={styles.checklistTitle}>Önerilen sonraki kontroller</h3>
          <ul className={styles.checklist}>
            {data.nextChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <button type="button" className={styles.feedbackButton}>
        Yanlış bilgi bildir
      </button>
    </section>
  )
}
