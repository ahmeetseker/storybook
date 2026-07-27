import { GlassAlert } from '@repo/ui'

import type {
  AccountSavedSearchSummary as SavedSearchSummary,
  AccountSectionError,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'

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
      >
        <h2 id="account-saved-search-title">Kayıtlı arama</h2>
        <GlassAlert severity="warning" title="Kayıtlı arama yüklenemedi">
          {error.message}
        </GlassAlert>
      </section>
    )
  }

  if (!savedSearch) return null

  return (
    <section data-account-section="saved-search" aria-labelledby="account-saved-search-title">
      <h2 id="account-saved-search-title">Kayıtlı arama</h2>
      <div data-part="saved-search-summary">
        <h3 data-part="saved-search-title">{savedSearch.title}</h3>
        <p data-part="saved-search-criteria">{savedSearch.criteriaLabel}</p>
        <p data-part="saved-search-matches">{savedSearch.newMatchCount} yeni eşleşme</p>
        {formattedUpdatedAt ? (
          <time data-part="saved-search-updated-at" dateTime={savedSearch.updatedAt}>
            Son güncelleme: {formattedUpdatedAt}
          </time>
        ) : (
          <p data-part="saved-search-updated-at">Tarih bilgisi kullanılamıyor</p>
        )}
        <AccountActionLink
          action={{ kind: 'route', label: 'Aramayı görüntüle', to: '/emlak' }}
          variant="text"
        />
      </div>
    </section>
  )
}
