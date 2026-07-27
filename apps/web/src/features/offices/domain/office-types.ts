import type { OfficeIntent, OfficeSearchIntent } from './office-search-state'

export type OfficeEvidenceSource =
  | 'listing-data'
  | 'office-profile'
  | 'verified-transaction'
  | 'review'

export interface OfficeMatchEvidence {
  label: string
  value: string
  source: OfficeEvidenceSource
  observedAt?: string
}

export interface OfficeSummary {
  id: string
  name: string
  city: string
  districts: string[]
  tagline: string
  verified: boolean
  verifiedBy?: string
  expertise: string[]
  languages: string[]
  activeListings: number
  consultants: number
  rating: number
  reviewCount: number
  responseMinutes: number
  lastActiveLabel: string
  evidence: OfficeMatchEvidence[]
  intents: OfficeSearchIntent[]
  propertyTypes: string[]
  logoSrc?: string
}

export interface OfficeSearchBrief {
  intent?: OfficeIntent
  propertyType?: string
  location?: string
  budget?: { min?: number; max?: number }
  timeline?: string
  expertise?: string[]
  communicationPreference?: 'message' | 'call' | 'meeting'
}

export interface OfficeMatch {
  officeId: string
  score: number
  reasons: string[]
  evidence: OfficeMatchEvidence[]
}

export interface OfficeAiFilter {
  key: string
  label: string
  value: string
  displayValue: string
}

export interface OfficeAiProposal {
  confidence: number
  summary: string
  brief: OfficeSearchBrief
  filters: OfficeAiFilter[]
}

export type OfficeActionType = 'message' | 'meeting' | 'offer'

export interface OfficeActionDraft {
  officeId: string
  action: OfficeActionType
  summary: string
  fields: Array<{ label: string; value: string }>
}
