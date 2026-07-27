import type { MouseEvent } from 'react'
import styles from './ListingCreateWorkspace.module.css'
import type { ListingDraftMeta } from './listing-create-domain'

interface ListingCreateHeaderProps {
  meta: ListingDraftMeta
}

export function ListingCreateHeader({ meta }: ListingCreateHeaderProps) {
  const exitLocked = meta.saveStatus !== 'saved'
  const saveLabel =
    meta.saveStatus === 'saving'
      ? 'Kaydediliyor'
      : meta.saveStatus === 'error'
        ? 'Kayıt başarısız'
        : meta.savedAt
          ? `Kaydedildi ${meta.savedAt}`
          : 'Taslak hazır'
  const guardUnsavedExit = (event: MouseEvent<HTMLAnchorElement>) => {
    if (exitLocked) event.preventDefault()
  }

  return (
    <header className={styles.topbar}>
      <a
        className={styles.brandButton}
        href="/"
        aria-disabled={exitLocked || undefined}
        onClick={guardUnsavedExit}
      >
        <span aria-hidden="true">✦</span>
        <span>arsam.net</span>
      </a>
      <div className={styles.draftIdentity}>
        <span className={styles.draftLabel}>İlan taslağı</span>
        <strong>{meta.name}</strong>
      </div>
      <div className={styles.headerActions}>
        <span
          className={styles.saveStatus}
          data-status={meta.saveStatus}
          role="status"
          aria-live="polite"
        >
          <span className={styles.statusDot} aria-hidden="true" />
          {saveLabel}
        </span>
        <a
          className={styles.exitButton}
          href="/"
          aria-disabled={exitLocked || undefined}
          onClick={guardUnsavedExit}
          title={exitLocked ? 'Taslak kaydı tamamlandığında çıkabilirsiniz' : undefined}
        >
          Çık
        </a>
      </div>
    </header>
  )
}
