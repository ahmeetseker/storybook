import styles from './ListingCreateWorkspace.module.css'

interface ListingActionBarProps {
  backDisabled: boolean
  primaryLabel: string
  primaryDisabled?: boolean
  saveError?: boolean
  /** "Adım 2/5 · Konum ve taşınmaz" — ray, sayfanın neresinde olduğunuzu tekrar eder. */
  stepSummary: string
  saving?: boolean
  onBack: () => void
  onPrimary: () => void
  onRetrySave?: () => void
}

/**
 * Yapışkan kontrol rayı. Üç işi vardır: nerede olduğunu söylemek, taslağı
 * elle kaydettirmek ve ileri/geri taşımak. Ray flat'tır; sayfanın tek cam
 * bütçesini tüketmez.
 */
export function ListingActionBar({
  backDisabled,
  primaryLabel,
  primaryDisabled = false,
  saveError = false,
  stepSummary,
  saving = false,
  onBack,
  onPrimary,
  onRetrySave,
}: ListingActionBarProps) {
  return (
    <footer className={styles.actionBar}>
      <p className={styles.actionInfo}>
        <span className={styles.actionStep}>{stepSummary}</span>
        <span className={styles.actionHint}>
          Değişiklikler otomatik kaydedilir; istediğiniz an çıkıp devam
          edebilirsiniz.
        </span>
      </p>

      <div className={styles.actionButtons}>
        <button
          type="button"
          className={styles.backAction}
          disabled={backDisabled}
          onClick={onBack}
        >
          ← Geri
        </button>
        <button
          type="button"
          className={saveError ? styles.retrySaveAction : styles.secondaryAction}
          data-state={saveError ? 'error' : undefined}
          onClick={onRetrySave}
        >
          {saveError
            ? 'Taslak kaydedilemedi · Tekrar dene'
            : saving
              ? 'Taslak kaydediliyor'
              : 'Taslağı kaydet'}
        </button>
        <button
          type="button"
          className={styles.primaryFlatAction}
          disabled={primaryDisabled}
          onClick={onPrimary}
        >
          {primaryLabel}
        </button>
      </div>
    </footer>
  )
}
