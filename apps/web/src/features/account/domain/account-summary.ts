import type {
  AccountAction,
  AccountAttentionItem,
  AccountDashboardData,
  AccountListingPreview,
  AccountMetricItem,
  AccountWorkspaceMode,
} from './account-types'

const severityRank = { critical: 0, high: 1, normal: 2 } as const

export interface AccountWorkspaceModeInput {
  data: AccountDashboardData
  loading?: boolean
  restricted?: boolean
  sessionExpired?: boolean
}

export function getAccountMetricItems(
  data: AccountDashboardData,
): AccountMetricItem[] {
  const liveListings = data.listings.filter(({ state }) => state === 'live').length
  const actionListings = data.listings.filter(({ state }) => state === 'changes').length

  return [
    { id: 'live-listings', label: 'Yayındaki ilan', value: String(liveListings), hint: 'Yayında olan ilanlarınız' },
    { id: 'action-listings', label: 'İşlem gereken ilan', value: String(actionListings), hint: 'Düzeltme bekleyen ilanlarınız' },
    { id: 'unread-messages', label: 'Okunmamış mesaj', value: String(data.unreadMessageCount), hint: 'Henüz okumadığınız mesajlar' },
    { id: 'active-alarms', label: 'Aktif alarm', value: String(data.activeAlarmCount), hint: 'Açık arama alarmlarınız' },
  ]
}

export function getPriorityAttentionItems(
  data: AccountDashboardData,
): AccountAttentionItem[] {
  return [...data.attentionCandidates]
    .filter((item) => item.action.kind === 'route')
    .sort((a, b) => {
      const severity = severityRank[a.severity] - severityRank[b.severity]
      if (severity !== 0) return severity
      const recency = Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      return recency !== 0 ? recency : a.id.localeCompare(b.id, 'tr')
    })
    .slice(0, 3)
}

export function getRecentListings(
  data: AccountDashboardData,
  limit = 2,
): AccountListingPreview[] {
  return [...data.listings]
    .sort((a, b) => {
      const recency = Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      return recency !== 0 ? recency : a.id.localeCompare(b.id, 'tr')
    })
    .slice(0, limit)
}

export function getPrimaryAccountAction(
  data: AccountDashboardData,
): AccountAction {
  if (data.identity.role === 'buyer') {
    return { kind: 'route', label: 'İlanları keşfet', to: '/emlak' }
  }

  return { kind: 'route', label: 'Yeni ilan ver', to: '/ilan-ver' }
}

export function hasAccountAttention(data: AccountDashboardData): boolean {
  return data.attentionCandidates.some(
    ({ severity }) => severity === 'critical' || severity === 'high',
  )
}

export function resolveAccountWorkspaceMode({
  data,
  loading = false,
  restricted = false,
  sessionExpired = false,
}: AccountWorkspaceModeInput): AccountWorkspaceMode {
  if (sessionExpired) return 'session-expired'
  if (restricted) return 'restricted'
  if (loading) return 'loading'

  const hasActivity =
    data.listings.length > 0 ||
    data.activities.length > 0 ||
    data.savedSearch !== undefined ||
    data.unreadMessageCount > 0 ||
    data.activeAlarmCount > 0 ||
    data.priceDropFavoriteCount > 0

  return hasActivity ? 'ready' : 'new-account'
}
