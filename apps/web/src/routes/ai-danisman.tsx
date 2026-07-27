/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { AdvisorWorkspace } from '@/features/advisor'
import {
  parseAdvisorRouteSearch,
  serializeAdvisorRouteSearch,
} from '@/features/advisor/domain/advisor-route-search'

export const Route = createFileRoute('/ai-danisman')({
  validateSearch: (search) =>
    serializeAdvisorRouteSearch(
      parseAdvisorRouteSearch(search as Record<string, unknown>),
    ),
  head: () => createPageHead('ai-advisor'),
  component: AiAdvisorRoutePage,
})

function hasSameAdvisorSearch(
  current: Record<string, string>,
  next: Record<string, string>,
) {
  return current.q === next.q && current.compare === next.compare
}

function AiAdvisorRoutePage() {
  const rawSearch = Route.useSearch()
  const navigate = Route.useNavigate()
  const routeState = parseAdvisorRouteSearch(rawSearch)
  const initialRouteState = useRef(routeState).current
  const currentSearch = serializeAdvisorRouteSearch(routeState)

  return (
    <AdvisorWorkspace
      initialQuery={initialRouteState.query}
      initialCompareIds={initialRouteState.compareIds}
      onRouteStateChange={(state) => {
        const nextSearch = serializeAdvisorRouteSearch(state)
        if (hasSameAdvisorSearch(currentSearch, nextSearch)) return

        void navigate({
          search: nextSearch as never,
          replace: true,
        })
      }}
      onOpenComparison={(ids) =>
        void navigate({
          to: '/karsilastir',
          search: { ids: ids.join(',') } as never,
        })
      }
    />
  )
}
