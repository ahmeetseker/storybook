import type { ListingSummary } from '../../listings/data/listing-adapter'
import type { PropertyCategory } from '../../listings/domain/search-state'

export interface AdvisorMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  pending?: boolean
}

export type AdvisorIntent = 'buy' | 'rent' | 'invest'
export type AdvisorPropertyType = Exclude<PropertyCategory, 'all'>
export type AdvisorFeature =
  | 'zoning'
  | 'detached-deed'
  | 'sea'
  | 'road'
  | 'transport'
  | 'quiet-life'
  | 'family-life'
  | 'rental-yield'

export interface AdvisorNumericRange {
  min?: number
  max?: number
}

export interface AdvisorCriteria {
  intent: AdvisorIntent
  city?: string
  district?: string
  propertyTypes: AdvisorPropertyType[]
  budget: AdvisorNumericRange
  area: AdvisorNumericRange
  rooms?: string
  mustHave: AdvisorFeature[]
  preferences: AdvisorFeature[]
}

export interface AdvisorCriterionMatch {
  key: string
  label: string
  kind: 'required' | 'preference'
  matched: boolean
  detail: string
}

export type AdvisorSimpleCriterionKey =
  | 'city'
  | 'district'
  | 'propertyTypes'
  | 'budgetMin'
  | 'budgetMax'
  | 'areaMin'
  | 'areaMax'
  | 'rooms'

export type AdvisorCriterionRemoval =
  | { key: AdvisorSimpleCriterionKey }
  | {
      key: 'mustHave' | 'preferences'
      feature: AdvisorFeature
    }

export interface AdvisorEvidence {
  id: string
  title: string
  source: string
  status: 'verified' | 'review' | 'missing'
  detail: string
}

export interface AdvisorMatch {
  listing: ListingSummary
  score: number
  reasons: string[]
  criteria: AdvisorCriterionMatch[]
  evidence: AdvisorEvidence[]
  missingData: string[]
}

export interface AdvisorProposal {
  query: string
  criteria: AdvisorCriteria
  summary: string
  interpretationConfidence: number
  clarification?: {
    key: 'location' | 'budget' | 'propertyType'
    question: string
  }
}

export interface AdvisorSearchResult {
  proposal: AdvisorProposal
  matches: AdvisorMatch[]
  generatedAt: string
}
