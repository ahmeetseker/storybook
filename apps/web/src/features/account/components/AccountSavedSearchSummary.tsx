import { GlassAlert } from '@repo/ui'

import type {
  AccountSavedSearchSummary as SavedSearchSummary,
  AccountSectionError,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'
import styles from './AccountSections.module.css'

export interface AccountSavedSearchSummaryProps {
  /** Kullanıcının en güncel kayıtlı arama özeti. */
  savedSearch?: SavedSearchSummary
  /** Bu bölüme ait yerel yükleme hatası. */
  error?: AccountSectionError
}

/** Varsa kayıtlı arama özetini pasif bilgi ve tek yönlendirme ile gösterir. */
export function AccountSavedSearchSummary({
  savedSearch,
  error,
}: AccountSavedSearchSummaryProps) {
  const updatedAt = savedSearch ? new Date(savedSearch.updatedAt) : null
  const formattedUpdatedAt =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? new Intl.DateTimeFormat('tr-TR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Istanbul',
        }).format(updatedAt)
      : null

  if (error) {
    return (
      <section
        data-account-section="saved-search"
        data-part="section-error"
        aria-labelledby="account-saved-search-title"
        className={styles.card}
      >
        <div className={styles.cardHead}>
          <div className={styles.cardHeadText}>
            <h2 id="account-saved-search-title" className={styles.cardTitle}>
              Kayıtlı arama
            </h2>
          </div>
        </div>
        <GlassAlert severity="warning" title="Kayıtlı arama yüklenemedi">
          {error.message}
        </GlassAlert>
      </section>
    )
  }

  if (!savedSearch) return null

  return (
    <section
      data-account-section="saved-search"
      aria-labelledby="account-saved-search-title"
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h2 id="account-saved-search-title" className={styles.cardTitle}>
            Kayıtlı arama
          </h2>
        </div>
      </div>
      <div data-part="saved-search-summary" className={styles.savedSearch}>
        <h3 data-part="saved-search-title" className={styles.savedSearchTitle}>
          {savedSearch.title}
        </h3>
        <p data-part="saved-search-criteria" className={styles.mutedText}>
          {savedSearch.criteriaLabel}
        </p>
        <p data-part="saved-search-matches" className={styles.savedSearchMatches}>
          {savedSearch.newMatchCount} yeni eşleşme
        </p>
        {formattedUpdatedAt ? (
          <time
            data-part="saved-search-updated-at"
            className={styles.mutedMeta}
            dateTime={savedSearch.updatedAt}
          >
            Son güncelleme: {formattedUpdatedAt}
          </time>
        ) : (
          <p data-part="saved-search-updated-at" className={styles.mutedMeta}>
            Tarih bilgisi kullanılamıyor
          </p>
        )}
      </div>
      <div className={styles.cardFooter}>
        <AccountActionLink
          action={{ kind: 'route', label: 'Aramayı görüntüle', to: '/emlak' }}
          variant="text"
        />
      </div>
    </section>
  )
}
