import type { EvidenceValue } from './evidence'

/** İlan yaşam döngüsü — aktif olmayan ilan sessizce aramaya yönlendirilmez. */
export type ListingLifecycle = 'active' | 'expired' | 'sold' | 'withdrawn' | 'moderated'

/** Doğrulama vektörü satırları; biri olumlu olsa diğerleri olumlu olmaz. */
export type VerificationRowId =
  | 'advertiser_identity'
  | 'listing_authorisation'
  | 'agency_licence'
  | 'parcel_match'
  | 'planning_document'
  | 'platform_moderation'
  | 'media_provenance'

export interface VerificationRow {
  id: VerificationRowId
  /** Tam cümle — "Doğrulandı" tek başına kullanılmaz */
  title: string
  /** Kontrolün neyi KAPSAMADIĞINI söyleyen zorunlu açıklama (EİDS satırında zorunlu) */
  scopeNote?: string
  state: 'positive' | 'negative' | 'unknown'
  /** Görünür kaynak adı */
  source: string
  retrievedAt?: string
  validUntil?: string
}

export interface ListingLocation {
  city: string
  district: string
  neighbourhood: string
}

export interface ListingPrice {
  amount: number
  currency: 'TRY'
  /** İlanda beyan edilen alan — birim fiyat bunun üzerinden hesaplanır */
  declaredArea: number
  unitPrice: number
}

export interface ListingMediaItem {
  id: string
  kind: 'photo' | 'video' | 'plan' | 'parcel' | 'drone'
  label: string
  capturedAt?: string
  /** AI ile üretilmiş veya maddi biçimde düzenlenmiş medya görünür etiketlenir */
  aiEdited?: boolean
}

export interface ListingDocument {
  id: string
  label: string
  state: 'available' | 'missing'
  critical: boolean
  issuedAt?: string
  authority?: string
}

export interface ListingSeller {
  name: string
  type: 'agency' | 'individual'
  licence?: EvidenceValue<string>
  respondsInHours?: number
  activeListings?: number
  memberSince?: string
}

export interface UtilityEvidence {
  id: string
  label: string
  /** Boolean yerine kapsamlı durum: parselde / sınırda / yolda / yok */
  value: EvidenceValue<string>
}

export interface HazardIndicator {
  id: string
  /** "Bölgesel deprem tehlike göstergesi" gibi — risk hükmü değil */
  label: string
  value: EvidenceValue<string>
  /** Zorunlu kapsam/sınırlama açıklaması */
  scopeNote: string
}

export type ValuationOutcome =
  | { kind: 'range'; low: number; high: number; methodVersion: string; sampleSize: number }
  | { kind: 'insufficient'; reason: string }

export interface ListingDetailBase {
  id: string
  title: string
  lifecycle: ListingLifecycle
  listingNumber: string
  publishedAt: string
  updatedAt: string
  /** Tüm kanıtların ortak sorgu kesiti */
  evidenceCutoff: string
  location: ListingLocation
  price: ListingPrice
  verification: VerificationRow[]
  documents: ListingDocument[]
  seller: ListingSeller
  media: ListingMediaItem[]
}

export interface LandListingDetail extends ListingDetailBase {
  kind: 'land'
  parcel: {
    blockParcel: EvidenceValue<string>
    /** Kayıttaki yüzölçümü; beyanla çelişebilir */
    area: EvidenceValue<number>
    locationPrecision: EvidenceValue<string>
    distanceToSea?: EvidenceValue<string>
  }
  planning: {
    titleDeedType: EvidenceValue<string>
    shared: { isShared: boolean; share?: string }
    planStatus: EvidenceValue<string>
    landUse: EvidenceValue<string>
    encumbrance: EvidenceValue<string>
    planNumber?: string
    planScale?: string
  }
  access: {
    /** Yasal yol hakkı — "yola yakın" bu değildir */
    legalRoadAccess: EvidenceValue<string>
    physicalAccess: EvidenceValue<string>
    utilities: UtilityEvidence[]
  }
  terrain: {
    slope: EvidenceValue<string>
    aspect?: EvidenceValue<string>
    hazards: HazardIndicator[]
  }
  market: {
    comparableMedianUnitPrice: EvidenceValue<number>
    comparableCount: number
    valuation: ValuationOutcome
  }
}

/** Kategori paketleri bu union üzerinden büyür (Faz 4). */
export type ListingDetail = LandListingDetail
