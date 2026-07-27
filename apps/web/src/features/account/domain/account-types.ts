export const ACCOUNT_LISTING_STATES = [
  'draft',
  'review',
  'live',
  'changes',
  'paused',
  'expired',
] as const

export type AccountListingState = (typeof ACCOUNT_LISTING_STATES)[number]
export type AccountRole = 'buyer' | 'seller' | 'hybrid'
export type VerificationState =
  | 'verified'
  | 'pending'
  | 'missing'
  | 'not-applicable'
  | 'unavailable'
export type AccountWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'new-account'
  | 'restricted'
  | 'session-expired'

export interface AccountAction {
  kind: 'route'
  label: string
  to: '/ilan-ver' | '/favoriler' | '/emlak'
}

export interface AccountMetricItem {
  id: 'live-listings' | 'action-listings' | 'unread-messages' | 'active-alarms'
  label: string
  value: string
  hint: string
}

export interface AccountIdentity {
  id: string
  displayName: string
  role: AccountRole
  organizationLabel?: string
  avatarUrl?: string
}

export interface AccountVerification {
  email: VerificationState
  phone: VerificationState
  eids: VerificationState
}

export interface AccountSecuritySummary {
  lastSuccessfulLogin?: {
    occurredAt: string
    deviceLabel: string
    approximateLocation?: string
  }
  dataUpdatedAt?: string
}

export type AccountSectionKey =
  | 'identity'
  | 'metrics'
  | 'listings'
  | 'security'
  | 'activity'
  | 'saved-search'

export interface AccountSectionError {
  section: AccountSectionKey
  message: string
}

export interface AccountListingPreview {
  id: string
  title: string
  state: AccountListingState
  imageSrc?: string
  imageAlt: string
  priceLabel?: string
  referenceLabel: string
  updatedAt: string
  updatedLabel: string
  issue?: string
  stats: Array<{ id: string; label: string; value: string }>
}

export interface AccountActivity {
  id: string
  occurredAt: string
  dateLabel: string
  title: string
  description?: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}

export interface AccountSavedSearchSummary {
  id: string
  title: string
  criteriaLabel: string
  newMatchCount: number
  updatedAt: string
}

export interface AccountAttentionItem {
  id: string
  kind: 'verification' | 'listing' | 'message' | 'favorite' | 'alarm'
  severity: 'critical' | 'high' | 'normal'
  occurredAt: string
  title: string
  reason: string
  action: AccountAction
  explanationSource: 'rule' | 'ai'
}

export interface AccountDashboardData {
  identity: AccountIdentity
  verification: AccountVerification
  security: AccountSecuritySummary
  listings: AccountListingPreview[]
  unreadMessageCount: number
  activeAlarmCount: number
  priceDropFavoriteCount: number
  attentionCandidates: AccountAttentionItem[]
  activities: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  sectionErrors: AccountSectionError[]
}

export interface AccountWorkspaceProps {
  data: AccountDashboardData
  mode?: AccountWorkspaceMode
}

export type RawAccountListingState = AccountListingState | 'rejected' | 'sold' | 'eids-pending'

export interface RawAccountDashboard {
  viewer: AccountIdentity
  verification: {
    email?: VerificationState
    phone?: VerificationState
    eids?: VerificationState
  }
  security?: AccountSecuritySummary
  listings: Array<Omit<AccountListingPreview, 'state'> & { state: RawAccountListingState }>
  unreadMessageCount?: number
  activeAlarmCount?: number
  priceDropFavoriteCount?: number
  attentionCandidates?: AccountAttentionItem[]
  activities?: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  sectionErrors?: AccountSectionError[]
}
