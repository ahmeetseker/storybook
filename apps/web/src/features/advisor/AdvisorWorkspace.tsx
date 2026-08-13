import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { PageContainer } from '@/components/PageContainer'
import type { ListingSummary } from '../listings/data/listing-adapter'
import { AdvisorComposer } from './components/AdvisorComposer'
import { AdvisorDecisionRail } from './components/AdvisorDecisionRail'
import { AdvisorDrawers } from './components/AdvisorDrawers'
import { AdvisorResults } from './components/AdvisorResults'
import { AdvisorSearchProfile } from './components/AdvisorSearchProfile'
import { AdvisorWelcome } from './components/AdvisorWelcome'
import {
  createFixtureAdvisorSearchAdapter,
  type AdvisorSearchAdapter,
} from './data/advisor-search-adapter'
import {
  advisorReducer,
  createInitialAdvisorState,
  removeAdvisorCriterion,
  type AdvisorWorkspaceState,
} from './domain/advisor-reducer'
import {
  mergeAdvisorClarification,
  parseAdvisorPrompt,
} from './domain/advisor-parser'
import type { AdvisorRouteState } from './domain/advisor-route-search'
import type {
  AdvisorCriterionRemoval,
  AdvisorProposal,
  AdvisorPropertyType,
} from './domain/advisor-types'
import styles from './AdvisorWorkspace.module.css'

export interface AdvisorWorkspaceProps {
  /** İlk açılışta bir kez ayrıştırılıp çalıştırılacak paylaşılabilir sorgu. */
  initialQuery?: string
  /** İlk açılışta karşılaştırmada seçili olan en fazla üç ilan kimliği. */
  initialCompareIds?: string[]
  /** İlan eşleştirmesini yapan, testlerde değiştirilebilir arama adaptörü. */
  searchAdapter?: AdvisorSearchAdapter
  /** Paylaşılabilir sorgu veya karşılaştırma seçimi değiştiğinde çağrılır. */
  onRouteStateChange?: (state: AdvisorRouteState) => void
  /** Karşılaştırma rotası seçili ilanlarla açılmak istendiğinde çağrılır. */
  onOpenComparison?: (ids: string[]) => void
}

const TRANSACTION_LABELS: Record<ListingSummary['transaction'], string> = {
  sale: 'satılık',
  rent: 'kiralık',
}

const PROPERTY_TYPE_LABELS: Record<AdvisorPropertyType, string> = {
  residential: 'konut',
  land: 'arsa',
  commercial: 'iş yeri',
  building: 'bina',
  timeshare: 'devremülk',
  touristic: 'turistik tesis',
}

function formatPlace(value: string): string {
  return value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1)
}

function buildSimilarQuery(listing: ListingSummary): string {
  return [
    formatPlace(listing.city),
    formatPlace(listing.district),
    TRANSACTION_LABELS[listing.transaction],
    PROPERTY_TYPE_LABELS[listing.category],
    listing.attributes.rooms,
  ]
    .filter(Boolean)
    .join(' ')
}

function getStatusMessage(state: AdvisorWorkspaceState): string {
  if (state.notice) return state.notice
  if (state.status === 'analyzing') return 'İlanlar analiz ediliyor.'
  if (state.status === 'results') return `${state.matches.length} ilan eşleşti.`
  if (state.status === 'empty') return 'Bu ölçütlerle sonuç bulunamadı.'
  if (state.status === 'error') return 'Analiz tamamlanamadı.'
  return ''
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function AdvisorWorkspace({
  initialQuery = '',
  initialCompareIds = [],
  searchAdapter,
  onRouteStateChange,
  onOpenComparison,
}: AdvisorWorkspaceProps) {
  const defaultAdapter = useMemo(
    () => createFixtureAdvisorSearchAdapter(),
    [],
  )
  const adapter = searchAdapter ?? defaultAdapter
  const [state, dispatch] = useReducer(
    advisorReducer,
    {
      query: initialQuery,
      compareIds: initialCompareIds,
    },
    createInitialAdvisorState,
  )
  const stateRef = useRef(state)
  const requestRef = useRef<AbortController | null>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const profileRailRef = useRef<HTMLDivElement>(null)
  const focusStatusAfterCriteriaRef = useRef(false)
  const mountedRef = useRef(false)
  const didAutoRunRef = useRef(false)
  stateRef.current = state

  const analyzeProposal = useCallback(
    async (proposal: AdvisorProposal) => {
      requestRef.current?.abort()
      dispatch({ type: 'QUERY_SUBMITTED', proposal })
      onRouteStateChange?.({
        query: proposal.query,
        compareIds: stateRef.current.compareIds,
      })

      if (proposal.clarification) {
        dispatch({ type: 'CLARIFICATION_REQUIRED', proposal })
        return
      }

      const controller = new AbortController()
      requestRef.current = controller

      try {
        const result = await adapter.search(proposal, {
          signal: controller.signal,
        })
        if (!mountedRef.current || controller.signal.aborted) return
        dispatch({
          type: 'ANALYSIS_SUCCEEDED',
          proposal: result.proposal,
          matches: result.matches,
        })
      } catch (error) {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          isAbortError(error)
        ) {
          return
        }
        dispatch({
          type: 'ANALYSIS_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'İlanlar şu anda hazırlanamadı.',
        })
      } finally {
        if (requestRef.current === controller) requestRef.current = null
      }
    },
    [adapter, onRouteStateChange],
  )

  const submit = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim()
      if (!query) return

      const pendingProposal = stateRef.current.proposal?.clarification
        ? stateRef.current.proposal
        : undefined
      const proposal = pendingProposal
        ? mergeAdvisorClarification(pendingProposal, query)
        : parseAdvisorPrompt(query)

      await analyzeProposal(proposal)
    },
    [analyzeProposal],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestRef.current?.abort()
      requestRef.current = null
    }
  }, [])

  useEffect(() => {
    const query = initialQuery.trim()
    if (!query || didAutoRunRef.current) return

    didAutoRunRef.current = true
    globalThis.queueMicrotask(() => {
      if (mountedRef.current) void submit(query)
    })
  }, [initialQuery, submit])

  useEffect(() => {
    if (
      state.overlay !== undefined ||
      !focusStatusAfterCriteriaRef.current
    ) {
      return
    }

    focusStatusAfterCriteriaRef.current = false
    globalThis.queueMicrotask(() => statusRef.current?.focus())
  }, [state.overlay, state.status])

  const cancel = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    dispatch({ type: 'QUERY_CANCELLED' })
  }, [])

  const retry = useCallback(() => {
    const proposal = stateRef.current.proposal
    if (proposal) {
      void analyzeProposal(proposal)
      return
    }

    void submit(stateRef.current.query)
  }, [analyzeProposal, submit])

  const removeCriterion = useCallback(
    (removal: AdvisorCriterionRemoval) => {
      const proposal = stateRef.current.proposal
      if (!proposal) return

      const revisedProposal = removeAdvisorCriterion(proposal, removal)
      void analyzeProposal(revisedProposal)
    },
    [analyzeProposal],
  )

  const toggleCompare = useCallback(
    (listingId: string) => {
      const current = stateRef.current
      let nextCompareIds: string[]

      if (current.compareIds.includes(listingId)) {
        nextCompareIds = current.compareIds.filter((id) => id !== listingId)
      } else if (current.compareIds.length < 3) {
        nextCompareIds = [...current.compareIds, listingId]
      } else {
        dispatch({ type: 'COMPARE_TOGGLED', listingId })
        return
      }

      dispatch({ type: 'COMPARE_TOGGLED', listingId })
      onRouteStateChange?.({
        query: current.proposal?.query ?? current.query,
        compareIds: nextCompareIds,
      })
    },
    [onRouteStateChange],
  )

  const showSimilar = useCallback(
    (listingId: string) => {
      const listing = stateRef.current.matches.find(
        (match) => match.listing.id === listingId,
      )?.listing
      if (listing) void submit(buildSimilarQuery(listing))
    },
    [submit],
  )

  const statusMessage = getStatusMessage(state)
  const clarification = state.proposal?.clarification
  const showWelcome = state.status === 'idle' && !clarification
  const showDecisionRail =
    Boolean(state.proposal) &&
    !clarification &&
    state.status !== 'analyzing' &&
    state.status !== 'idle'
  const selectedMatch = state.matches.find(
    (match) => match.listing.id === state.selectedListingId,
  )

  useLayoutEffect(() => {
    const workspace = workspaceRef.current
    const profileRail = profileRailRef.current
    if (!showDecisionRail || !workspace || !profileRail) return

    const setProfileBlockSize = (blockSize: number) => {
      workspace.style.setProperty(
        '--lg-advisor-profile-block-size',
        `${blockSize}px`,
      )
    }
    setProfileBlockSize(profileRail.getBoundingClientRect().height)

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setProfileBlockSize(
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height,
      )
    })
    observer.observe(profileRail)

    return () => {
      observer.disconnect()
      workspace.style.removeProperty('--lg-advisor-profile-block-size')
    }
  }, [showDecisionRail])

  const applyCriteria = useCallback(
    (proposal: AdvisorProposal) => {
      focusStatusAfterCriteriaRef.current = true
      dispatch({ type: 'OVERLAY_CLOSED' })
      void analyzeProposal(proposal)
    },
    [analyzeProposal],
  )

  return (
    <PageContainer className={styles.page}>
      <div
        className={styles.pageFrame}
        data-advisor-page-frame=""
      >
        <p
          ref={statusRef}
          className={styles.statusOutlet}
          role="status"
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          data-empty={!statusMessage || undefined}
        >
          {statusMessage}
        </p>

        {showWelcome ? (
          <div className={styles.idleStage}>
            <AdvisorWelcome
              query={state.query}
              status={state.status}
              onQueryChange={(query) =>
                dispatch({ type: 'QUERY_CHANGED', query })
              }
              onSubmit={(query) => void submit(query)}
            />
          </div>
        ) : (
          <div className={styles.resultsContainer}>
            <header
              className={styles.queryStage}
              data-flow-section="query"
            >
              <p className={styles.eyebrow}>AI EMLAK DANIŞMANI</p>
              <h1>Arama profilinizi birlikte netleştirelim.</h1>
              <AdvisorComposer
                query={state.query}
                status={state.status}
                onQueryChange={(query) =>
                  dispatch({ type: 'QUERY_CHANGED', query })
                }
                onSubmit={(query) => void submit(query)}
                onCancel={state.status === 'analyzing' ? cancel : undefined}
              />
            </header>

            {!clarification ? (
              <div
                ref={workspaceRef}
                className={styles.workspace}
                data-advisor-workspace=""
              >
                {showDecisionRail && state.proposal ? (
                  <div
                    ref={profileRailRef}
                    className={styles.profileRail}
                    data-advisor-profile-rail=""
                  >
                    <AdvisorSearchProfile
                      proposal={state.proposal}
                      onEditCriteria={() =>
                        dispatch({
                          type: 'OVERLAY_OPENED',
                          overlay: 'criteria',
                        })
                      }
                      onRemoveCriterion={removeCriterion}
                    />
                  </div>
                ) : null}

                <div
                  className={styles.results}
                  data-solo={!showDecisionRail || undefined}
                >
                  <AdvisorResults
                    status={state.status}
                    proposal={state.proposal}
                    matches={state.matches}
                    favoriteIds={state.favoriteIds}
                    compareIds={state.compareIds}
                    error={state.error}
                    onRetry={retry}
                    onEditCriteria={() =>
                      dispatch({
                        type: 'OVERLAY_OPENED',
                        overlay: 'criteria',
                      })
                    }
                    onRemoveCriterion={removeCriterion}
                    onOpenListing={(listingId) =>
                      dispatch({ type: 'LISTING_SELECTED', listingId })
                    }
                    onToggleFavorite={(listingId) =>
                      dispatch({ type: 'FAVORITE_TOGGLED', listingId })
                    }
                    onToggleCompare={toggleCompare}
                    onExplainListing={(listingId) =>
                      dispatch({ type: 'LISTING_SELECTED', listingId })
                    }
                    onShowSimilar={showSimilar}
                  />
                </div>

                {showDecisionRail && state.proposal ? (
                  <div className={styles.actionsRail}>
                    <AdvisorDecisionRail
                      compareIds={state.compareIds}
                      onOpenCompare={() =>
                        onOpenComparison?.([...stateRef.current.compareIds])
                      }
                      onSaveSearch={() => dispatch({ type: 'SEARCH_SAVED' })}
                      onCreateAlert={() => dispatch({ type: 'ALERT_CREATED' })}
                      onOpenTrust={() =>
                        dispatch({
                          type: 'OVERLAY_OPENED',
                          overlay: 'trust',
                        })
                      }
                      onOpenHistory={() =>
                        dispatch({
                          type: 'OVERLAY_OPENED',
                          overlay: 'history',
                        })
                      }
                      onOpenAdvisorConsent={() =>
                        dispatch({
                          type: 'OVERLAY_OPENED',
                          overlay: 'advisorConsent',
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <AdvisorDrawers
        overlay={state.overlay}
        proposal={state.proposal}
        matches={state.matches}
        selectedMatch={selectedMatch}
        compareIds={state.compareIds}
        history={state.history}
        consentStatus={state.consentStatus}
        onClose={() => dispatch({ type: 'OVERLAY_CLOSED' })}
        onApplyCriteria={applyCriteria}
        onApproveConsent={() => {
          dispatch({ type: 'CONSENT_APPROVED' })
          dispatch({ type: 'OVERLAY_CLOSED' })
        }}
        onRejectConsent={() => {
          dispatch({ type: 'CONSENT_REJECTED' })
          dispatch({ type: 'OVERLAY_CLOSED' })
        }}
      />
    </PageContainer>
  )
}
