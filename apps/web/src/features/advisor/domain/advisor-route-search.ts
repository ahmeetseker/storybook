export interface AdvisorRouteState {
  query: string
  compareIds: string[]
}

function normalizedCompareIds(ids: readonly string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(0, 3)
}

export function parseAdvisorRouteSearch(
  raw: Record<string, unknown>,
): AdvisorRouteState {
  const query = typeof raw.q === 'string' ? raw.q.trim() : ''
  const compareIds =
    typeof raw.compare === 'string'
      ? normalizedCompareIds(raw.compare.split(','))
      : []

  return { query, compareIds }
}

export function serializeAdvisorRouteSearch(
  state: AdvisorRouteState,
): Record<string, string> {
  const query = state.query.trim()
  const compareIds = normalizedCompareIds(state.compareIds)
  const result: Record<string, string> = {}

  if (query) result.q = query
  if (compareIds.length > 0) result.compare = compareIds.join(',')

  return result
}
