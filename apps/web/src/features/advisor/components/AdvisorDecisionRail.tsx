import { GlassButton } from '@repo/ui'
import styles from './AdvisorPanels.module.css'

export interface AdvisorDecisionRailProps {
  /** Karşılaştırma için seçilmiş ilan kimlikleri. */
  compareIds: readonly string[]
  /** Seçili ilanların karşılaştırması açılmak istendiğinde çağrılır. */
  onOpenCompare: () => void
  /** Arama kaydı önizlemesi istendiğinde çağrılır. */
  onSaveSearch: () => void
  /** Bildirim önizlemesi istendiğinde çağrılır. */
  onCreateAlert: () => void
  /** Güven ayrıntıları açılmak istendiğinde çağrılır. */
  onOpenTrust: () => void
  /** Karar geçmişi açılmak istendiğinde çağrılır. */
  onOpenHistory: () => void
  /** İnsan danışman paylaşım onayı açılmak istendiğinde çağrılır. */
  onOpenAdvisorConsent: () => void
}

export function AdvisorDecisionRail({
  compareIds,
  onOpenCompare,
  onSaveSearch,
  onCreateAlert,
  onOpenTrust,
  onOpenHistory,
  onOpenAdvisorConsent,
}: AdvisorDecisionRailProps) {
  const compareCount = Math.min(compareIds.length, 3)

  return (
    <aside
      className={styles.decisionRail}
      aria-labelledby="advisor-decision-title"
      data-flow-section="actions"
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="advisor-decision-title">Karar alanı</h2>
          <p>Seçimlerinizi tek yerde gözden geçirin.</p>
        </div>
      </div>

      <section
        className={styles.compareSection}
        aria-labelledby="advisor-compare-title"
      >
        <div>
          <h3 id="advisor-compare-title">Karşılaştırma</h3>
          <p>{compareCount}/3 ilan seçildi</p>
        </div>
        <GlassButton
          prominent
          disabled={compareCount < 2}
          onClick={onOpenCompare}
        >
          Karşılaştır
        </GlassButton>
      </section>

      <div className={styles.decisionActions} aria-label="Karar eylemleri">
        <button type="button" onClick={onSaveSearch}>
          Aramayı kaydet
        </button>
        <button type="button" onClick={onCreateAlert}>
          Bildirim oluştur
        </button>
        <button type="button" onClick={onOpenTrust}>
          Güven ayrıntıları
        </button>
        <button type="button" onClick={onOpenHistory}>
          Karar geçmişi
        </button>
        <button type="button" onClick={onOpenAdvisorConsent}>
          İnsan danışmanla paylaş
        </button>
      </div>
    </aside>
  )
}
