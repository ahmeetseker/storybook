import styles from './ListingCreateWorkspace.module.css'

interface ListingActionBarProps {
  backDisabled: boolean
  primaryLabel: string
  primaryDisabled?: boolean
  saveError?: boolean
  onBack: () => void
  onPrimary: () => void
  onRetrySave?: () => void
}

export function ListingActionBar({
  backDisabled,
  primaryLabel,
  primaryDisabled = false,
  saveError = false,
  onBack,
  onPrimary,
  onRetrySave,
}: ListingActionBarProps) {
  return (
    <footer className={styles.actionBar}>
      <button
        type="button"
        className={styles.backAction}
        disabled={backDisabled}
        onClick={onBack}
      >
        ← Geri
      </button>
      {saveError ? (
        <button
          type="button"
          className={styles.retrySaveAction}
          onClick={onRetrySave}
        >
          Taslak kaydedilemedi · Tekrar dene
        </button>
      ) : (
        <span className={styles.actionHint}>Değişiklikler otomatik kaydedilir</span>
      )}
      <button
        type="button"
        className={styles.primaryFlatAction}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </footer>
  )
}
