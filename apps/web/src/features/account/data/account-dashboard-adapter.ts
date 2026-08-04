import {
  ACCOUNT_LISTING_STATES,
  type AccountDashboardData,
  type AccountListingPreview,
  type AccountListingState,
  type RawAccountDashboard,
} from '../domain/account-types'

const supportedStates = new Set<string>(ACCOUNT_LISTING_STATES)

function isAccountListingState(value: string): value is AccountListingState {
  return supportedStates.has(value)
}

function isValidDate(value: string | undefined): value is string {
  return value !== undefined && !Number.isNaN(Date.parse(value))
}

function normalizeCount(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0
}

export function normalizeAccountDashboard(
  raw: RawAccountDashboard,
): AccountDashboardData {
  const eids =
    raw.verification.eids ??
    (raw.viewer.role === 'buyer' ? 'not-applicable' : 'unavailable')

  const sectionErrors = [...(raw.sectionErrors ?? [])]
  const savedSearch = raw.savedSearch
  const hasInvalidSavedSearch = savedSearch !== undefined && !isValidDate(savedSearch.updatedAt)

  if (
    hasInvalidSavedSearch &&
    !sectionErrors.some((error) => error.section === 'saved-search')
  ) {
    sectionErrors.push({
      section: 'saved-search',
      message: 'Kayıtlı arama güncellik bilgisi kullanılamıyor.',
    })
  }

  return {
    identity: { ...raw.viewer },
    verification: {
      email: raw.verification.email ?? 'unavailable',
      phone: raw.verification.phone ?? 'unavailable',
      eids,
    },
    security: {
      lastSuccessfulLogin: raw.security?.lastSuccessfulLogin,
      dataUpdatedAt: raw.security?.dataUpdatedAt,
    },
    listings: raw.listings.filter(
      (listing): listing is AccountListingPreview =>
        isAccountListingState(listing.state) &&
        isValidDate(listing.updatedAt),
    ),
    unreadMessageCount: normalizeCount(raw.unreadMessageCount),
    activeAlarmCount: normalizeCount(raw.activeAlarmCount),
    priceDropFavoriteCount: normalizeCount(raw.priceDropFavoriteCount),
    attentionCandidates: (raw.attentionCandidates ?? []).filter((item) =>
      isValidDate(item.occurredAt),
    ),
    activities: [...(raw.activities ?? [])],
    savedSearch: hasInvalidSavedSearch ? undefined : savedSearch,
    // Performans ve fatura verileri normalizasyon gerektirmez: kaynaktan
    // geldiği gibi taşınır, yoksa ilgili bölümler kendi boş durumunu çizer.
    insights: raw.insights,
    billing: raw.billing,
    sectionErrors,
  }
}
