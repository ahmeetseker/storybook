import type { CSSProperties, MouseEvent } from 'react'
import { withBase } from '@/config/base-path'
import styles from './ListingCreateWorkspace.module.css'
import type { ListingCompletion, ListingDraftMeta } from './listing-create-domain'

interface ListingCreateHeaderProps {
  meta: ListingDraftMeta
  /** Adım tamamlanma özeti; verilmezse ilerleme ölçeri gizlenir (giriş ekranı). */
  completion?: ListingCompletion
}

/**
 * Odaklı akışın üst rayı: kimlik, taslak adı, kayıt durumu ve genel ilerleme.
 * Kabuğun header'ı bu rotada gizli olduğu için çıkış yolu burada durur.
 */
export function ListingCreateHeader({ meta, completion }: ListingCreateHeaderProps) {
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
        href={withBase('/')}
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

      {completion ? (
        <p className={styles.headerProgress}>
          <span className={styles.headerProgressLabel}>
            {completion.completed}/{completion.total} adım hazır
          </span>
          <span
            className={styles.headerMeter}
            aria-hidden="true"
            style={{ '--listing-meter': `${completion.percentage}%` } as CSSProperties}
          />
        </p>
      ) : null}

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
          href={withBase('/')}
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
