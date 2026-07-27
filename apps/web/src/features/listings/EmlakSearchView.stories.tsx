import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmlakSearchView } from './EmlakSearchView'
import {
  searchListings,
  type ListingSearchResponse,
} from './data/listing-adapter'
import {
  parseListingSearch,
  type ListingSearchState,
} from './domain/search-state'

const DEFAULT_STATE = parseListingSearch({})
const DEFAULT_RESPONSE = await searchListings({
  state: DEFAULT_STATE,
  pageSize: 24,
})
const LAND_STATE = parseListingSearch({
  type: 'sale',
  category: 'land',
  city: 'izmir',
  verified: '1',
})
const LAND_RESPONSE = await searchListings({ state: LAND_STATE, pageSize: 24 })
const RENTAL_STATE = parseListingSearch({
  type: 'rent',
  category: 'residential',
  f_rooms: '2+1,3+1',
})
const RENTAL_RESPONSE = await searchListings({
  state: RENTAL_STATE,
  pageSize: 24,
})
const SPLIT_MAP_STATE = parseListingSearch({
  map: 'split',
  category: 'land',
})
const SPLIT_MAP_RESPONSE = await searchListings({
  state: SPLIT_MAP_STATE,
  pageSize: 24,
})

function StatefulScene({
  initialState = DEFAULT_STATE,
  initialResponse = DEFAULT_RESPONSE,
  status = 'success',
  empty = false,
}: {
  initialState?: ListingSearchState
  initialResponse?: ListingSearchResponse
  status?: 'loading' | 'refreshing' | 'success' | 'error'
  empty?: boolean
}) {
  const [state, setState] = useState(initialState)
  const [response, setResponse] = useState(
    empty
      ? { ...initialResponse, items: [], total: 0, pageCount: 1 }
      : initialResponse,
  )

  const update = async (next: ListingSearchState) => {
    setState(next)
    setResponse(await searchListings({ state: next, pageSize: 24 }))
  }

  return (
    <EmlakSearchView
      state={state}
      response={response}
      status={status}
      onStateChange={(next) => void update(next)}
      onAiSearch={() => undefined}
      onSaveSearch={() => undefined}
    />
  )
}

const meta = {
  title: 'Sayfalar/Public/Enterprise Emlak Arama',
  component: EmlakSearchView,
  parameters: { layout: 'fullscreen' },
  args: {
    state: DEFAULT_STATE,
    response: DEFAULT_RESPONSE,
    status: 'success',
    onStateChange: () => undefined,
    onAiSearch: () => undefined,
    onSaveSearch: () => undefined,
  },
} satisfies Meta<typeof EmlakSearchView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <StatefulScene />,
}

export const ArsaUzmanFiltreleri: Story = {
  render: () => (
    <StatefulScene
      initialState={LAND_STATE}
      initialResponse={LAND_RESPONSE}
    />
  ),
}

export const KiralikKonut: Story = {
  render: () => (
    <StatefulScene
      initialState={RENTAL_STATE}
      initialResponse={RENTAL_RESPONSE}
    />
  ),
}

export const BolunmusHarita: Story = {
  render: () => (
    <StatefulScene
      initialState={SPLIT_MAP_STATE}
      initialResponse={SPLIT_MAP_RESPONSE}
    />
  ),
}

export const AiFiltreOnerisi: Story = {
  args: {
    aiProposal: {
      confidence: 92,
      filters: [
        {
          key: 'category',
          label: 'Kategori',
          value: 'land',
          displayValue: 'Arsa',
        },
        {
          key: 'city',
          label: 'Şehir',
          value: 'izmir',
          displayValue: 'İzmir',
        },
        {
          key: 'salePriceMax',
          label: 'Azami fiyat',
          value: 5_000_000,
          displayValue: '5.000.000 TL',
        },
      ],
    },
  },
}

export const Yukleniyor: Story = {
  render: () => <StatefulScene status="loading" />,
}

export const Guncelleniyor: Story = {
  render: () => <StatefulScene status="refreshing" />,
}

export const BosSonuc: Story = {
  render: () => <StatefulScene empty />,
}

export const ServisHatasi: Story = {
  render: () => <StatefulScene status="error" />,
}

export const MobilFiltreler: Story = {
  render: () => <StatefulScene />,
  parameters: {
    viewport: { defaultViewport: 'mobile390' },
  },
}
