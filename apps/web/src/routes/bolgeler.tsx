import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { useMemo, useState } from 'react'
import { RegionDirectoryView } from '@/features/regions'
import { REGIONS } from '@/features/regions/data/region-adapter'
import { matchRegions, parseRegionPrompt } from '@/features/regions/domain/region-ai'
import { parseRegionSearch, serializeRegionSearch } from '@/features/regions/domain/region-search-state'
import type { RegionAiProposal, RegionSearchState } from '@/features/regions/domain/region-types'

export const Route = createFileRoute('/bolgeler')({
  head: () => createPageHead('regions'),
  validateSearch: (search) => serializeRegionSearch(parseRegionSearch(search as Record<string, unknown>)),
  component: RegionsRoutePage,
})

function RegionsRoutePage() {
  const rawSearch = Route.useSearch()
  const navigate = Route.useNavigate()
  const state = useMemo(() => parseRegionSearch(rawSearch), [rawSearch])
  const [proposal, setProposal] = useState<RegionAiProposal>()
  const [selectedId, setSelectedId] = useState<string>()
  const [compareIds, setCompareIds] = useState<string[]>([])
  const items = useMemo(() => matchRegions(state, REGIONS), [state])
  const navigateToState = (next: RegionSearchState, history: 'push'|'replace' = 'replace') => void navigate({ search: serializeRegionSearch(next), replace: history === 'replace' } as never)
  return <RegionDirectoryView state={state} items={items} status="success" proposal={proposal} selectedId={selectedId} compareIds={compareIds} onStateChange={(next, options) => navigateToState(next, options.history)} onAiSearch={(query) => setProposal(parseRegionPrompt(query))} onSelect={setSelectedId} onToggleCompare={(id) => setCompareIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < 3 ? [...ids, id] : ids)} onApplyProposal={() => { if (!proposal) return; const next: RegionSearchState = { ...state, query:'', city: proposal.filters.find((f)=>f.key==='city')?.value.toLocaleLowerCase('tr-TR'), propertyType: proposal.filters.find((f)=>f.key==='propertyType')?.value === 'Arsa' ? 'land' : proposal.filters.find((f)=>f.key==='propertyType')?.value === 'Konut' ? 'residential' : undefined, intent: (proposal.filters.find((f)=>f.key==='intent')?.value === 'Yatırım' ? 'invest' : proposal.filters.find((f)=>f.key==='intent')?.value === 'Kiralama' ? 'rent' : proposal.filters.find((f)=>f.key==='intent')?.value === 'Yaşam' ? 'live' : 'buy') }; navigateToState(next,'replace'); setProposal(undefined) }} onDismissProposal={() => setProposal(undefined)} onRemoveProposalFilter={(id) => setProposal((current) => current ? {...current, filters: current.filters.filter((filter) => filter.id !== id)} : undefined)} onOpenListing={(listingId) => void navigate({ to: '/ilan/$listingId', params: { listingId } } as never)} />
}
