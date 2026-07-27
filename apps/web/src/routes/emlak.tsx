/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { EmlakSearchView } from '@/features/listings/EmlakSearchView'
import {
  parseNaturalLanguage,
  type AiFilterProposal,
} from '@/features/listings/data/listing-adapter'
import { listingQueryOptions } from '@/features/listings/data/listing-query'
import { applyAiProposal } from '@/features/listings/domain/ai-proposal'
import {
  parseListingSearch,
  serializeListingSearch,
  type ListingSearchState,
} from '@/features/listings/domain/search-state'

export const Route = createFileRoute('/emlak')({
  validateSearch: (search) =>
    serializeListingSearch(
      parseListingSearch(search as Record<string, unknown>),
    ),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      listingQueryOptions(parseListingSearch(deps.search)),
    ),
  head: () => createPageHead('search'),
  component: EmlakRoutePage,
})

function EmlakRoutePage() {
  const rawSearch = Route.useSearch()
  const navigate = Route.useNavigate()
  const state = useMemo(
    () => parseListingSearch(rawSearch),
    [rawSearch],
  )
  const query = useQuery(listingQueryOptions(state))
  const [aiProposal, setAiProposal] = useState<AiFilterProposal>()
  const [aiLoading, setAiLoading] = useState(false)

  const navigateToState = (
    next: ListingSearchState,
    options: { history: 'push' | 'replace' },
  ) =>
    void navigate({
      search: serializeListingSearch(next) as never,
      replace: options.history === 'replace',
    })

  const handleAiSearch = async (naturalLanguageQuery: string) => {
    if (!naturalLanguageQuery.trim()) return
    setAiLoading(true)
    try {
      setAiProposal(await parseNaturalLanguage(naturalLanguageQuery))
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <EmlakSearchView
      state={state}
      response={query.data}
      status={
        query.isPending
          ? 'loading'
          : query.isError
            ? 'error'
            : query.isFetching
              ? 'refreshing'
              : 'success'
      }
      errorMessage={
        query.error instanceof Error ? query.error.message : undefined
      }
      onStateChange={navigateToState}
      onAiSearch={handleAiSearch}
      onSaveSearch={() => {
        window.sessionStorage.setItem(
          'arsam-post-auth-intent',
          JSON.stringify({
            kind: 'save-search',
            search: serializeListingSearch(state),
          }),
        )
        void navigate({ to: '/hesabim' })
      }}
      aiProposal={aiProposal}
      aiLoading={aiLoading}
      onDismissAiProposal={() => setAiProposal(undefined)}
      onApplyAiProposal={() => {
        if (!aiProposal) return
        navigateToState(applyAiProposal(state, aiProposal), {
          history: 'push',
        })
        setAiProposal(undefined)
      }}
    />
  )
}
