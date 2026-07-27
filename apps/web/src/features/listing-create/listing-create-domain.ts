export type ListingStepId =
  | 'property'
  | 'location'
  | 'media'
  | 'content'
  | 'verification'

export type ListingEntryMode = 'ai' | 'manual' | null
export type TransactionType = 'sale' | 'rent' | ''
export type PropertyFamily = 'land' | 'residential' | 'commercial' | 'building' | ''
export type PublisherRole = 'owner' | 'relative' | 'agency' | ''
export type SaveStatus = 'saved' | 'saving' | 'error'
export type VerificationStatus =
  | 'idle'
  | 'checking'
  | 'verified'
  | 'unauthorized'
  | 'unavailable'

export interface ListingProperty {
  transaction: TransactionType
  family: PropertyFamily
  subtype: string
  publisherRole: PublisherRole
  area: string
  zoning: string
  deedType: string
  rooms: string
  grossArea: string
  netArea: string
  buildingAge: string
  usageStatus: string
  floorCount: string
  independentUnitCount: string
}

export interface ListingLocation {
  city: string
  district: string
  neighborhood: string
  address: string
  latitude: number | null
  longitude: number | null
  precision: 'approximate' | 'exact'
  propertyNumber: string
  island: string
  parcel: string
  buildingNumber: string
}

export interface ListingMediaItem {
  id: string
  name: string
  src: string
  signature?: string
  status: 'uploading' | 'ready' | 'low-quality' | 'duplicate' | 'error'
  isCover: boolean
  caption: string
  qualityHints: string[]
}

export interface ListingContent {
  price: string
  title: string
  description: string
  highlights: string[]
  riskAccepted: boolean
  legalConsent: boolean
}

export interface ListingVerification {
  status: VerificationStatus
  verifiedRole: Exclude<PublisherRole, ''> | null
  verifiedPropertyNumber: string | null
  propertyReference: string
  errorCode:
    | 'NO_AUTHORITY'
    | 'SERVICE_UNAVAILABLE'
    | 'MISSING_PROPERTY_NUMBER'
    | null
}

export interface ListingDraftMeta {
  id: string
  name: string
  activeStep: ListingStepId
  saveStatus: SaveStatus
  savedAt: string | null
  aiProposalApplied: boolean
  returnToReview: boolean
  published: boolean
}

export interface ListingDraft {
  entryMode: ListingEntryMode
  property: ListingProperty
  location: ListingLocation
  media: ListingMediaItem[]
  content: ListingContent
  verification: ListingVerification
  meta: ListingDraftMeta
}

export interface AiListingProposal {
  property: Partial<ListingProperty>
  location: Partial<ListingLocation>
  content: Partial<ListingContent>
  confidence: number
  sourceText: string
}

export interface StepValidation {
  valid: boolean
  errors: Record<string, string>
}

export interface ListingCompletion {
  completed: number
  total: number
  percentage: number
}

export const LISTING_STEPS: ReadonlyArray<{
  id: ListingStepId
  label: string
  shortLabel: string
  description: string
}> = [
  {
    id: 'property',
    label: 'Mülk bilgileri',
    shortLabel: 'Mülk',
    description: 'İlan türü ve temel özellikler',
  },
  {
    id: 'location',
    label: 'Konum ve taşınmaz',
    shortLabel: 'Konum',
    description: 'Adres ve taşınmaz kimliği',
  },
  {
    id: 'media',
    label: 'Fotoğraf stüdyosu',
    shortLabel: 'Fotoğraflar',
    description: 'Kapak, sıra ve kalite',
  },
  {
    id: 'content',
    label: 'Fiyat ve ilan metni',
    shortLabel: 'Fiyat ve metin',
    description: 'Fiyatlandırma ve sunum',
  },
  {
    id: 'verification',
    label: 'Doğrulama ve yayın',
    shortLabel: 'Doğrulama',
    description: 'EİDS ve son kontrol',
  },
]

export function createEmptyDraft(): ListingDraft {
  return {
    entryMode: null,
    property: {
      transaction: '',
      family: '',
      subtype: '',
      publisherRole: '',
      area: '',
      zoning: '',
      deedType: '',
      rooms: '',
      grossArea: '',
      netArea: '',
      buildingAge: '',
      usageStatus: '',
      floorCount: '',
      independentUnitCount: '',
    },
    location: {
      city: '',
      district: '',
      neighborhood: '',
      address: '',
      latitude: null,
      longitude: null,
      precision: 'approximate',
      propertyNumber: '',
      island: '',
      parcel: '',
      buildingNumber: '',
    },
    media: [],
    content: {
      price: '',
      title: '',
      description: '',
      highlights: [],
      riskAccepted: false,
      legalConsent: false,
    },
    verification: {
      status: 'idle',
      verifiedRole: null,
      verifiedPropertyNumber: null,
      propertyReference: '',
      errorCode: null,
    },
    meta: {
      id: 'draft-2026-0725',
      name: 'Yeni emlak ilanı',
      activeStep: 'property',
      saveStatus: 'saved',
      savedAt: null,
      aiProposalApplied: false,
      returnToReview: false,
      published: false,
    },
  }
}

function required(
  errors: Record<string, string>,
  key: string,
  value: string,
  message: string,
) {
  if (!value.trim()) errors[key] = message
}

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value.trim()) && Number(value) > 0
}

export function parseTurkishNumber(value: string): number {
  const compact = value.replace(/\s/g, '').trim()
  if (!compact) return Number.NaN

  const normalized = compact.includes(',')
    ? compact.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(?:\.\d{3})+$/.test(compact)
      ? compact.replace(/\./g, '')
      : compact

  return /^\d+(?:\.\d+)?$/.test(normalized)
    ? Number(normalized)
    : Number.NaN
}

function isPositiveNumber(value: string): boolean {
  const parsed = parseTurkishNumber(value)
  return Number.isFinite(parsed) && parsed > 0
}

function validateProperty(draft: ListingDraft): StepValidation {
  const { property } = draft
  const errors: Record<string, string> = {}
  required(errors, 'transaction', property.transaction, 'İlan amacını seçin')
  required(errors, 'family', property.family, 'Mülk türü seçin')
  required(errors, 'subtype', property.subtype, 'Alt tür seçin')
  required(errors, 'publisherRole', property.publisherRole, 'İlan veren rolünü seçin')

  if (property.family === 'land') {
    required(errors, 'area', property.area, 'Toplam alanı girin')
    if (property.area.trim() && !isPositiveNumber(property.area)) {
      errors.area = 'Geçerli bir toplam alan girin'
    }
    required(errors, 'zoning', property.zoning, 'İmar durumunu seçin')
    required(errors, 'deedType', property.deedType, 'Tapu türünü seçin')
  }

  if (property.family === 'residential') {
    required(errors, 'rooms', property.rooms, 'Oda sayısını seçin')
    required(errors, 'grossArea', property.grossArea, 'Brüt alanı girin')
    required(errors, 'netArea', property.netArea, 'Net alanı girin')
    required(errors, 'buildingAge', property.buildingAge, 'Bina yaşını seçin')
    if (property.grossArea.trim() && !isPositiveNumber(property.grossArea)) {
      errors.grossArea = 'Geçerli bir brüt alan girin'
    }
    if (property.netArea.trim() && !isPositiveNumber(property.netArea)) {
      errors.netArea = 'Geçerli bir net alan girin'
    }
    if (
      isPositiveNumber(property.grossArea) &&
      isPositiveNumber(property.netArea) &&
      parseTurkishNumber(property.netArea) >
        parseTurkishNumber(property.grossArea)
    ) {
      errors.netArea = 'Net alan brüt alandan büyük olamaz'
    }
  }

  if (property.family === 'commercial') {
    required(errors, 'grossArea', property.grossArea, 'Toplam alanı girin')
    required(errors, 'netArea', property.netArea, 'Net alanı girin')
    required(
      errors,
      'usageStatus',
      property.usageStatus,
      'Kullanım durumunu seçin',
    )
    if (property.grossArea.trim() && !isPositiveNumber(property.grossArea)) {
      errors.grossArea = 'Geçerli bir toplam alan girin'
    }
    if (property.netArea.trim() && !isPositiveNumber(property.netArea)) {
      errors.netArea = 'Geçerli bir net alan girin'
    }
    if (
      isPositiveNumber(property.grossArea) &&
      isPositiveNumber(property.netArea) &&
      parseTurkishNumber(property.netArea) >
        parseTurkishNumber(property.grossArea)
    ) {
      errors.netArea = 'Net alan brüt alandan büyük olamaz'
    }
  }

  if (property.family === 'building') {
    required(errors, 'grossArea', property.grossArea, 'Toplam alanı girin')
    required(errors, 'floorCount', property.floorCount, 'Kat sayısını girin')
    required(
      errors,
      'independentUnitCount',
      property.independentUnitCount,
      'Bağımsız bölüm sayısını girin',
    )
    if (property.grossArea.trim() && !isPositiveNumber(property.grossArea)) {
      errors.grossArea = 'Geçerli bir toplam alan girin'
    }
    if (property.floorCount.trim() && !isPositiveInteger(property.floorCount)) {
      errors.floorCount = 'Geçerli bir kat sayısı girin'
    }
    if (
      property.independentUnitCount.trim() &&
      !isPositiveInteger(property.independentUnitCount)
    ) {
      errors.independentUnitCount = 'Geçerli bir bağımsız bölüm sayısı girin'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

function validateLocation(draft: ListingDraft): StepValidation {
  const { location, property } = draft
  const errors: Record<string, string> = {}
  required(errors, 'city', location.city, 'İl seçin')
  required(errors, 'district', location.district, 'İlçe seçin')
  required(errors, 'neighborhood', location.neighborhood, 'Mahalle seçin')
  required(
    errors,
    'propertyNumber',
    location.propertyNumber,
    'Taşınmaz numarasını girin',
  )
  if (
    location.propertyNumber.trim() &&
    !/^\d{6,20}$/.test(location.propertyNumber.trim())
  ) {
    errors.propertyNumber = 'Geçerli taşınmaz numarasını girin'
  }
  if (
    location.precision === 'exact' &&
    (location.latitude === null || location.longitude === null)
  ) {
    errors.coordinates = 'Tam konum için haritada bir nokta seçin'
  }

  if (property.family === 'land') {
    if (!location.island.trim() || !location.parcel.trim()) {
      errors.parcel = 'Ada/parsel bilgisi gerekli'
    } else if (
      !/^\d+$/.test(location.island.trim()) ||
      !/^\d+$/.test(location.parcel.trim())
    ) {
      errors.parcel = 'Ada ve parsel yalnızca rakamlardan oluşmalı'
    }
  } else if (property.family) {
    required(errors, 'buildingNumber', location.buildingNumber, 'Bina numarasını girin')
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

function validateMedia(draft: ListingDraft): StepValidation {
  const errors: Record<string, string> = {}
  const ready = draft.media.filter((item) => item.status === 'ready')
  if (ready.length < 3) errors.media = 'En az 3 geçerli fotoğraf ekleyin'
  if (!ready.some((item) => item.isCover)) errors.cover = 'Bir kapak fotoğrafı seçin'
  return { valid: Object.keys(errors).length === 0, errors }
}

function validateContent(draft: ListingDraft): StepValidation {
  const errors: Record<string, string> = {}
  required(errors, 'price', draft.content.price, 'Fiyatı girin')
  if (draft.content.price.trim() && !isPositiveNumber(draft.content.price)) {
    errors.price = 'Geçerli bir fiyat girin'
  }
  required(errors, 'title', draft.content.title, 'İlan başlığını girin')
  if (
    draft.content.title.trim() &&
    draft.content.title.trim().length < 10
  ) {
    errors.title = 'Başlık en az 10 karakter olmalı'
  } else if (draft.content.title.length > 70) {
    errors.title = 'Başlık en fazla 70 karakter olabilir'
  }
  required(errors, 'description', draft.content.description, 'İlan açıklamasını girin')
  if (
    draft.content.description.trim() &&
    draft.content.description.trim().length < 30
  ) {
    errors.description = 'Açıklama en az 30 karakter olmalı'
  }
  if (!draft.content.riskAccepted) {
    errors.riskAccepted = 'İlan doğruluk beyanını onaylayın'
  }
  if (!draft.content.legalConsent) {
    errors.legalConsent = 'İlan yayın koşullarını onaylayın'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

function validateVerification(draft: ListingDraft): StepValidation {
  const { verification, property, location } = draft
  const currentIdentityMatches =
    verification.verifiedRole === property.publisherRole &&
    verification.verifiedPropertyNumber === location.propertyNumber

  if (verification.status === 'verified' && currentIdentityMatches) {
    return { valid: true, errors: {} }
  }

  return {
    valid: false,
    errors: {
      verification:
        verification.status === 'verified'
          ? 'Mülk veya yetki bilgileri değişti; EİDS kontrolünü yenileyin'
          : 'EİDS doğrulaması gerekli',
    },
  }
}

export function getStepValidation(
  draft: ListingDraft,
  step: ListingStepId,
): StepValidation {
  if (step === 'property') return validateProperty(draft)
  if (step === 'location') return validateLocation(draft)
  if (step === 'media') return validateMedia(draft)
  if (step === 'content') return validateContent(draft)
  return validateVerification(draft)
}

export function getCompletion(draft: ListingDraft): ListingCompletion {
  const completed = LISTING_STEPS.filter((step) => getStepValidation(draft, step.id).valid)
    .length
  const total = LISTING_STEPS.length
  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  }
}

export function canPublish(draft: ListingDraft): boolean {
  return LISTING_STEPS.every((step) => getStepValidation(draft, step.id).valid)
}

export function formatUnitPrice(price: string, area: string): string {
  const priceNumber = parseTurkishNumber(price)
  const areaNumber = parseTurkishNumber(area)
  if (priceNumber <= 0 || areaNumber <= 0) return '—'
  return `${Math.round(priceNumber / areaNumber).toLocaleString('tr-TR')} TL/m²`
}

export function applyAiProposal(
  draft: ListingDraft,
  proposal: AiListingProposal,
): ListingDraft {
  return {
    ...draft,
    entryMode: 'ai',
    property: { ...draft.property, ...proposal.property },
    location: { ...draft.location, ...proposal.location },
    content: { ...draft.content, ...proposal.content },
    meta: { ...draft.meta, aiProposalApplied: true, saveStatus: 'saving' },
  }
}
