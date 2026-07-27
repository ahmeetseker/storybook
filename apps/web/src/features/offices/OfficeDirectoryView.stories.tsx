import type { Meta, StoryObj } from '@storybook/react-vite'
import { OfficeDirectoryView } from './OfficeDirectoryView'
import { searchOffices, type OfficeSearchResponse } from './data/office-adapter'
import { matchOffices, parseOfficePrompt } from './domain/office-ai'
import { parseOfficeSearch, type OfficeSearchState } from './domain/office-search-state'
import type { OfficeActionDraft, OfficeAiProposal } from './domain/office-types'

const DEFAULT_STATE = parseOfficeSearch({})
const DEFAULT_RESPONSE = await searchOffices({ state: DEFAULT_STATE, pageSize: 18 })
const SELL_LAND_STATE = parseOfficeSearch({ intent: 'sell', city: 'izmir', expertise: 'land,zoning' })
const SELL_LAND_RESPONSE = await searchOffices({ state: SELL_LAND_STATE, pageSize: 18 })
const RENT_STATE = parseOfficeSearch({ intent: 'rent', propertyType: 'residential' })
const RENT_RESPONSE = await searchOffices({ state: RENT_STATE, pageSize: 18 })
const parsedProposal = parseOfficePrompt('İzmir Urla’da arsa satışı için imar uzmanı arıyorum')
const AI_PROPOSAL: OfficeAiProposal = {
  ...parsedProposal,
  summary: 'Urla’da arsa satışı ve imar danışmanlığı için doğrulanmış ofisleri eşleştirdim.',
}

function Scene({
  state = DEFAULT_STATE,
  response = DEFAULT_RESPONSE,
  status = 'success',
  aiProposal,
  compareIds = [],
  selectedOfficeId,
  actionDraft,
}: {
  state?: OfficeSearchState
  response?: OfficeSearchResponse
  status?: 'loading' | 'refreshing' | 'success' | 'error'
  aiProposal?: OfficeAiProposal
  compareIds?: string[]
  selectedOfficeId?: string
  actionDraft?: OfficeActionDraft
}) {
  return (
    <OfficeDirectoryView
      state={state}
      response={response}
      matches={matchOffices(aiProposal?.brief ?? parsedProposal.brief, response?.items ?? [])}
      status={status}
      aiProposal={aiProposal}
      selectedOfficeId={selectedOfficeId}
      compareIds={compareIds}
      actionDraft={actionDraft}
      onStateChange={() => undefined}
      onAiSearch={() => undefined}
      onSelectOffice={() => undefined}
      onToggleCompare={() => undefined}
      onStartAction={() => undefined}
      onApplyProposal={() => undefined}
      onDismissProposal={() => undefined}
      onConfirmAction={() => undefined}
      onCloseAction={() => undefined}
    />
  )
}

const meta = {
  title: 'Sayfalar/Pazar Yeri/AI-First Emlak Ofisleri',
  component: OfficeDirectoryView,
  parameters: { layout: 'fullscreen' },
  args: {
    state: DEFAULT_STATE,
    response: DEFAULT_RESPONSE,
    matches: matchOffices(parsedProposal.brief, DEFAULT_RESPONSE.items),
    status: 'success',
    compareIds: [],
    onStateChange: () => undefined,
    onAiSearch: () => undefined,
    onSelectOffice: () => undefined,
    onToggleCompare: () => undefined,
    onStartAction: () => undefined,
    onApplyProposal: () => undefined,
    onDismissProposal: () => undefined,
    onConfirmAction: () => undefined,
    onCloseAction: () => undefined,
  },
} satisfies Meta<typeof OfficeDirectoryView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <Scene /> }
export const AiProposal: Story = { render: () => <Scene aiProposal={AI_PROPOSAL} /> }
export const SaticiArsa: Story = {
  render: () => <Scene state={SELL_LAND_STATE} response={SELL_LAND_RESPONSE} aiProposal={AI_PROPOSAL} selectedOfficeId="urla-arsa-danismanlik" />,
}
export const KiralikKonut: Story = { render: () => <Scene state={RENT_STATE} response={RENT_RESPONSE} /> }
export const CompareThree: Story = {
  render: () => <Scene compareIds={DEFAULT_RESPONSE.items.slice(0, 3).map((office) => office.id)} />,
}
export const Loading: Story = { render: () => <Scene status="loading" response={undefined} /> }
export const Empty: Story = {
  render: () => <Scene response={{ ...DEFAULT_RESPONSE, items: [], total: 0, pageCount: 1 }} />,
}
export const Error: Story = { render: () => <Scene status="error" response={undefined} /> }
export const ActionConsent: Story = {
  render: () => <Scene actionDraft={{ officeId: 'urla-arsa-danismanlik', action: 'meeting', summary: 'Urla Arsa Danışmanlık ile görüşme talebi', fields: [{ label: 'Amaç', value: 'Arsa satışı' }, { label: 'Konum', value: 'İzmir / Urla' }] }} />,
}
export const MobileDrawer: Story = {
  render: () => <Scene selectedOfficeId="urla-arsa-danismanlik" />,
  parameters: { viewport: { defaultViewport: 'mobile390' } },
}
