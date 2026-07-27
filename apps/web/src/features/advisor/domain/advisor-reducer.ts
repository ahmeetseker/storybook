import type {
  AdvisorCriterionRemoval,
  AdvisorMatch,
  AdvisorProposal,
} from './advisor-types'

export type AdvisorStatus = 'idle' | 'analyzing' | 'results' | 'empty' | 'error'

export type AdvisorOverlay =
  | 'criteria'
  | 'listing'
  | 'trust'
  | 'history'
  | 'advisorConsent'

export interface AdvisorHistoryEntry {
  id: string
  title: string
  detail: string
  status: 'done' | 'rejected' | 'info'
}

export interface AdvisorStableSnapshot {
  status: Exclude<AdvisorStatus, 'analyzing'>
  proposal?: AdvisorProposal
  matches: AdvisorMatch[]
  error?: string
}

export interface AdvisorWorkspaceState {
  status: AdvisorStatus
  rollbackSnapshot?: AdvisorStableSnapshot
  query: string
  proposal?: AdvisorProposal
  matches: AdvisorMatch[]
  selectedListingId?: string
  compareIds: string[]
  favoriteIds: string[]
  overlay?: AdvisorOverlay
  error?: string
  notice?: string
  consentStatus: 'idle' | 'approved' | 'rejected'
  history: AdvisorHistoryEntry[]
}

export type AdvisorWorkspaceAction =
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'QUERY_SUBMITTED'; proposal: AdvisorProposal }
  | { type: 'ANALYSIS_SUCCEEDED'; proposal: AdvisorProposal; matches: AdvisorMatch[] }
  | { type: 'CLARIFICATION_REQUIRED'; proposal: AdvisorProposal }
  | { type: 'ANALYSIS_FAILED'; message: string }
  | { type: 'QUERY_CANCELLED' }
  | { type: 'CRITERIA_REPLACED'; proposal: AdvisorProposal }
  | { type: 'CRITERION_REMOVED'; removal: AdvisorCriterionRemoval }
  | { type: 'LISTING_SELECTED'; listingId: string }
  | { type: 'FAVORITE_TOGGLED'; listingId: string }
  | { type: 'COMPARE_TOGGLED'; listingId: string }
  | { type: 'SEARCH_SAVED' }
  | { type: 'ALERT_CREATED' }
  | { type: 'OVERLAY_OPENED'; overlay: AdvisorOverlay }
  | { type: 'OVERLAY_CLOSED' }
  | { type: 'CONSENT_APPROVED' }
  | { type: 'CONSENT_REJECTED' }
  | { type: 'NOTICE_CLEARED' }

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
}

function appendHistory(
  state: AdvisorWorkspaceState,
  entry: Omit<AdvisorHistoryEntry, 'id'>,
): AdvisorHistoryEntry[] {
  return [...state.history, { id: `advisor-history-${state.history.length + 1}`, ...entry }]
}

export function createInitialAdvisorState(
  initial: Partial<AdvisorWorkspaceState> = {},
): AdvisorWorkspaceState {
  const {
    compareIds,
    favoriteIds,
    matches,
    history,
    rollbackSnapshot,
    ...state
  } = initial
  const {
    status = 'idle',
    query = '',
    proposal,
    selectedListingId,
    overlay,
    error,
    notice,
    consentStatus = 'idle',
  } = state

  return {
    status,
    rollbackSnapshot: rollbackSnapshot
      ? {
          ...rollbackSnapshot,
          matches: [...rollbackSnapshot.matches],
        }
      : undefined,
    query,
    proposal,
    selectedListingId,
    compareIds: uniqueIds(compareIds ?? []).slice(0, 3),
    favoriteIds: uniqueIds(favoriteIds ?? []),
    matches: matches ?? [],
    overlay,
    error,
    notice,
    consentStatus,
    history: history ?? [],
  }
}

export function removeAdvisorCriterion(
  proposal: AdvisorProposal,
  removal: AdvisorCriterionRemoval,
): AdvisorProposal {
  const criteria = {
    ...proposal.criteria,
    budget: { ...proposal.criteria.budget },
    area: { ...proposal.criteria.area },
    propertyTypes: [...proposal.criteria.propertyTypes],
    mustHave: [...proposal.criteria.mustHave],
    preferences: [...proposal.criteria.preferences],
  }

  switch (removal.key) {
    case 'city':
      delete criteria.city
      delete criteria.district
      break
    case 'district':
      delete criteria.district
      break
    case 'propertyTypes':
      criteria.propertyTypes = []
      break
    case 'budgetMin':
      delete criteria.budget.min
      break
    case 'budgetMax':
      delete criteria.budget.max
      break
    case 'areaMin':
      delete criteria.area.min
      break
    case 'areaMax':
      delete criteria.area.max
      break
    case 'rooms':
      delete criteria.rooms
      break
    case 'mustHave':
    case 'preferences':
      criteria[removal.key] = criteria[removal.key].filter(
        (feature) => feature !== removal.feature,
      )
      break
  }

  return { ...proposal, criteria }
}

export function advisorReducer(
  state: AdvisorWorkspaceState,
  action: AdvisorWorkspaceAction,
): AdvisorWorkspaceState {
  switch (action.type) {
    case 'QUERY_CHANGED':
      return { ...state, query: action.query, error: undefined }
    case 'QUERY_SUBMITTED':
      return {
        ...state,
        status: 'analyzing',
        rollbackSnapshot:
          state.status === 'analyzing'
            ? state.rollbackSnapshot
            : {
                status: state.status,
                proposal:
                  state.status === 'idle' &&
                  state.proposal?.clarification &&
                  !action.proposal.clarification
                    ? action.proposal
                    : state.proposal,
                matches: [...state.matches],
                error: state.error,
              },
        query: action.proposal.query,
        proposal: action.proposal,
        error: undefined,
        notice: undefined,
      }
    case 'ANALYSIS_SUCCEEDED':
      return {
        ...state,
        status: action.matches.length > 0 ? 'results' : 'empty',
        proposal: action.proposal,
        query: action.proposal.query,
        matches: [...action.matches],
        error: undefined,
        notice: undefined,
        rollbackSnapshot: undefined,
      }
    case 'CLARIFICATION_REQUIRED':
      return {
        ...state,
        status: 'idle',
        query: '',
        proposal: action.proposal,
        error: undefined,
        rollbackSnapshot: undefined,
        notice:
          action.proposal.clarification?.question ??
          'Hangi şehir veya bölgede arama yapalım?',
      }
    case 'ANALYSIS_FAILED':
      return {
        ...state,
        status: 'error',
        error: action.message,
        notice: undefined,
        rollbackSnapshot: undefined,
      }
    case 'QUERY_CANCELLED': {
      const rollback = state.rollbackSnapshot
      return {
        ...state,
        status: rollback?.status ?? 'idle',
        proposal: rollback?.proposal,
        matches: rollback ? [...rollback.matches] : [],
        error: rollback?.error,
        notice: 'Analiz durduruldu.',
        rollbackSnapshot: undefined,
      }
    }
    case 'CRITERIA_REPLACED':
      return { ...state, proposal: action.proposal }
    case 'CRITERION_REMOVED':
      return state.proposal
        ? {
            ...state,
            proposal: removeAdvisorCriterion(state.proposal, action.removal),
          }
        : state
    case 'LISTING_SELECTED':
      return { ...state, selectedListingId: action.listingId, overlay: 'listing' }
    case 'FAVORITE_TOGGLED': {
      const exists = state.favoriteIds.includes(action.listingId)
      return {
        ...state,
        favoriteIds: exists
          ? state.favoriteIds.filter((id) => id !== action.listingId)
          : [...state.favoriteIds, action.listingId],
      }
    }
    case 'COMPARE_TOGGLED': {
      if (state.compareIds.includes(action.listingId)) {
        return {
          ...state,
          compareIds: state.compareIds.filter((id) => id !== action.listingId),
          notice: undefined,
        }
      }
      if (state.compareIds.length >= 3) {
        return { ...state, notice: 'En fazla 3 ilan karşılaştırabilirsiniz.' }
      }
      return {
        ...state,
        compareIds: [...state.compareIds, action.listingId],
        notice: undefined,
      }
    }
    case 'SEARCH_SAVED':
      return {
        ...state,
        history: appendHistory(state, {
          title: 'Arama önizlemesi kaydedildi',
          detail: 'Arama yalnız bu demo oturumu için kaydedildi.',
          status: 'info',
        }),
        notice: 'Arama yalnız bu demo oturumu için kaydedildi.',
      }
    case 'ALERT_CREATED':
      return {
        ...state,
        history: appendHistory(state, {
          title: 'Bildirim önizlemesi oluşturuldu',
          detail: 'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
          status: 'info',
        }),
        notice: 'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
      }
    case 'OVERLAY_OPENED':
      return { ...state, overlay: action.overlay }
    case 'OVERLAY_CLOSED':
      return { ...state, overlay: undefined }
    case 'CONSENT_APPROVED':
      return {
        ...state,
        consentStatus: 'approved',
        history: appendHistory(state, {
          title: 'Paylaşım onayı kaydedildi',
          detail: 'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
          status: 'done',
        }),
        notice: 'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
      }
    case 'CONSENT_REJECTED':
      return {
        ...state,
        consentStatus: 'rejected',
        history: appendHistory(state, {
          title: 'Paylaşım reddedildi',
          detail: 'Paylaşım yapılmadı.',
          status: 'rejected',
        }),
        notice: 'Paylaşım yapılmadı.',
      }
    case 'NOTICE_CLEARED':
      return { ...state, notice: undefined }
  }
}
