import { GlassAiSummaryCard, GlassAlert } from '@repo/ui'

import type { AiDecisionBrief, SectionState } from '../data/listing-detail-adapter'
import type { ListingDetail } from '../domain/listing-detail-types'
import { formatDateShort } from '../format'
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
  /**
   * Geri bildirim akışı sayfa kabuğunda bağlanır. Verilmezse kontrol
   * `disabled` render edilir ve gerekçesi altında görünür metin olarak durur
   * (bkz. `rules.md` §4).
   */
  onReportIssue?: () => void
}

/** Bağlanmamış geri bildirim yeteneğinin görünür gerekçesi. */
const FEEDBACK_NOT_CONNECTED =
  'Geri bildirim akışı bu sürümde bağlı değil; sonraki fazda açılacak.'

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
export function ListingEvidenceBrief({ brief, onReportIssue }: ListingEvidenceBriefProps) {
  if (brief.state === 'unavailable') {
    return (
      <GlassAlert severity="info" title="Karar özeti kullanılamıyor">
        {brief.reason}
      </GlassAlert>
    )
  }

  const { data } = brief
  const sourceNote = `ArsaPazar asistanı · model ${data.modelVersion} · kanıt kesiti ${formatDateShort(data.evidenceCutoff)}`

  return (
    <section id="ai-karar-ozeti" className={workspaceStyles.section} aria-labelledby="ai-karar-ozeti-baslik">
      <h2 id="ai-karar-ozeti-baslik" className={workspaceStyles.sectionTitle}>
        Yapay zekâ karar özeti
      </h2>

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

      <div className={styles.feedback}>
        <button
          type="button"
          className={styles.feedbackButton}
          onClick={() => onReportIssue?.()}
          disabled={!onReportIssue}
        >
          Yanlış bilgi bildir
        </button>
        {onReportIssue ? null : (
          <p className={styles.feedbackNote}>{FEEDBACK_NOT_CONNECTED}</p>
        )}
      </div>
    </section>
  )
}
