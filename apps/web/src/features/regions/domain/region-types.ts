export const REGION_VIEWS = ['workspace', 'list'] as const
export type RegionView = (typeof REGION_VIEWS)[number]

export type RegionIntent = 'buy' | 'rent' | 'invest' | 'live'

export interface RegionSearchState {
  query: string
  intent: RegionIntent
  propertyType?: 'land' | 'residential' | 'commercial'
  city?: string
  district?: string
  neighborhood?: string
  minPrice?: number
  maxPrice?: number
  view: RegionView
}

export interface RegionSignal {
  label: string
  value: string
  source: string
  observedAt: string
  confidence: number
  evidenceId: string
  tone?: 'positive' | 'neutral' | 'caution'
}

export interface RegionSummary {
  id: string
  city: string
  district: string
  neighborhood?: string
  title: string
  subtitle: string
  pricePerSqm: number
  priceTrend: number
  activeListings: number
  supplyLabel: string
  signals: RegionSignal[]
  coordinates: { x: number; y: number; lat: number; lng: number }
}

export interface RegionMatch extends RegionSummary {
  score: number
  reasons: string[]
}

export interface RegionAiProposal {
  summary: string
  confidence: number
  filters: Array<{ id: string; label: string; value: string; key: string }>
}
