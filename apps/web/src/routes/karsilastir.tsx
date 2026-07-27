/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { ComparisonWorkbench } from '@/features/comparison'

export const Route = createFileRoute('/karsilastir')({
  validateSearch: parseComparisonSearch,
  head: () => createPageHead('compare'),
  component: ComparisonRoutePage,
})

function parseComparisonSearch(raw: Record<string, unknown>) {
  if (typeof raw.ids !== 'string') return {}

  const ids = raw.ids
    .split(',')
    .map((id) => id.trim())
    .filter(
      (id, index, values) =>
        Boolean(id) && values.indexOf(id) === index,
    )
    .slice(0, 3)

  return ids.length > 0 ? { ids: ids.join(',') } : {}
}

function ComparisonRoutePage() {
  const search = Route.useSearch()
  const initialIds =
    typeof search.ids === 'string' ? search.ids.split(',') : undefined

  return <ComparisonWorkbench initialIds={initialIds} />
}
