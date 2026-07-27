/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local helpers. */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { GlassToastProvider, useGlassToast } from '@repo/ui'
import { createPageHead } from '@/config/routes'
import { OfficeDirectoryView } from '@/features/offices'
import {
  matchOffices,
  parseOfficePrompt,
  removeOfficeProposalFilter,
} from '@/features/offices/domain/office-ai'
import {
  DEFAULT_OFFICE_SEARCH_STATE,
  parseOfficeSearch,
  serializeOfficeSearch,
  type OfficeSearchState,
} from '@/features/offices/domain/office-search-state'
import type {
  OfficeActionDraft,
  OfficeActionType,
  OfficeAiProposal,
} from '@/features/offices/domain/office-types'
import { officeQueryOptions } from '@/features/offices/data/office-query'

type HistoryMode = 'push' | 'replace'

export function createOfficeNavigationInstruction(
  state: OfficeSearchState,
  history: HistoryMode,
) {
  return {
    search: serializeOfficeSearch(state),
    replace: history === 'replace',
  }
}

export function applyOfficeProposal(
  state: OfficeSearchState,
  proposal: Pick<OfficeAiProposal, 'filters'>,
): OfficeSearchState {
  const next: OfficeSearchState = {
    ...state,
    query: '',
    intent: DEFAULT_OFFICE_SEARCH_STATE.intent,
    propertyType: undefined,
    city: undefined,
    district: undefined,
    expertise: [],
    page: 1,
  }

  proposal.filters.forEach((filter) => {
    if (filter.key === 'intent') {
      next.intent = filter.value as OfficeSearchState['intent']
    }
    if (filter.key === 'propertyType') next.propertyType = filter.value
    if (filter.key === 'city') next.city = filter.value
    if (filter.key === 'district') next.district = filter.value
    if (filter.key === 'expertise') {
      next.expertise = [...next.expertise, filter.value]
    }
  })

  return next
}

export function createOfficeProposal(query: string): OfficeAiProposal {
  const { brief, filters, confidence } = parseOfficePrompt(query)
  const location = brief.location ? `${brief.location} için ` : ''
  const expertise = brief.expertise?.length
    ? ` ${brief.expertise.length === 1 ? 'uzmanlığıyla' : 'uzmanlıklarıyla'}`
    : ''

  return {
    brief,
    filters,
    confidence,
    summary: `${location}${expertise} eşleşen ofisleri hazırladım.`.trim(),
  }
}

function createActionDraft(
  action: OfficeActionType,
  officeId: string,
  state: OfficeSearchState,
  officeName?: string,
): OfficeActionDraft {
  const actionLabel: Record<OfficeActionType, string> = {
    message: 'mesaj taslağı',
    meeting: 'görüşme talebi',
    offer: 'teklif talebi',
  }

  return {
    officeId,
    action,
    summary: `${officeName ?? 'Seçili ofis'} için ${actionLabel[action]} hazırlandı.`,
    fields: [
      { label: 'Amaç', value: state.intent === 'all' ? 'Ofis eşleştirme' : state.intent },
      ...(state.propertyType ? [{ label: 'Mülk tipi', value: state.propertyType }] : []),
      ...(state.city ? [{ label: 'Konum', value: [state.city, state.district].filter(Boolean).join(' / ') }] : []),
      ...(state.expertise.length > 0 ? [{ label: 'Uzmanlık', value: state.expertise.join(', ') }] : []),
    ],
  }
}

export const Route = createFileRoute('/ofisler')({
  validateSearch: (search) =>
    serializeOfficeSearch(
      parseOfficeSearch(search as Record<string, unknown>),
    ),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      officeQueryOptions(parseOfficeSearch(deps.search)),
    ),
  head: () => createPageHead('offices'),
  component: OfficeRoutePage,
})

function OfficeRoutePage() {
  return (
    <GlassToastProvider>
      <OfficeRouteContent />
    </GlassToastProvider>
  )
}

function OfficeRouteContent() {
  const rawSearch = Route.useSearch()
  const navigate = Route.useNavigate()
  const toast = useGlassToast()
  const state = useMemo(() => parseOfficeSearch(rawSearch), [rawSearch])
  const query = useQuery(officeQueryOptions(state))
  const [aiProposal, setAiProposal] = useState<OfficeAiProposal>()
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>()
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [actionDraft, setActionDraft] = useState<OfficeActionDraft>()

  const navigateToState = (next: OfficeSearchState, options: { history: HistoryMode }) =>
    void navigate(createOfficeNavigationInstruction(next, options.history) as never)

  const handleAiSearch = (naturalLanguageQuery: string) => {
    if (!naturalLanguageQuery.trim()) return
    setAiProposal(createOfficeProposal(naturalLanguageQuery))
  }

  const matches = useMemo(
    () => aiProposal && query.data ? matchOffices(aiProposal.brief, query.data.items) : undefined,
    [aiProposal, query.data],
  )

  return (
    <OfficeDirectoryView
      state={state}
      response={query.data}
      matches={matches}
      status={
        query.isPending
          ? 'loading'
          : query.isError
            ? 'error'
            : query.isFetching
              ? 'refreshing'
              : 'success'
      }
      errorMessage={query.error instanceof Error ? query.error.message : undefined}
      aiProposal={aiProposal}
      selectedOfficeId={selectedOfficeId}
      compareIds={compareIds}
      actionDraft={actionDraft}
      onRetry={() => void query.refetch()}
      onStateChange={navigateToState}
      onAiSearch={handleAiSearch}
      onSelectOffice={setSelectedOfficeId}
      onToggleCompare={(id) => {
        setCompareIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id)
            : current.length < 3
              ? [...current, id]
              : current,
        )
      }}
      onStartAction={(action, officeId) => {
        const office = query.data?.items.find((item) => item.id === officeId)
        setSelectedOfficeId(officeId)
        setActionDraft(createActionDraft(action, officeId, state, office?.name))
      }}
      onApplyProposal={() => {
        if (!aiProposal) return
        navigateToState(applyOfficeProposal(state, aiProposal), {
          history: 'replace',
        })
        setAiProposal(undefined)
      }}
      onDismissProposal={() => setAiProposal(undefined)}
      onRemoveProposalFilter={(id) => {
        setAiProposal((current) => current ? removeOfficeProposalFilter(current, id) : undefined)
      }}
      onConfirmAction={() => {
        if (!actionDraft) return
        window.sessionStorage.setItem(
          'arsam-post-auth-intent',
          JSON.stringify({
            kind: 'office-action',
            draft: actionDraft,
            search: serializeOfficeSearch(state),
          }),
        )
        setActionDraft(undefined)
        toast({
          title: 'Talebiniz kaydedildi',
          description: 'Ofisle paylaşım için açık onayınız kayda alındı.',
          severity: 'success',
        })
      }}
      onCloseAction={() => setActionDraft(undefined)}
    />
  )
}
