import type { ListingSummary } from '../../listings/data/listing-adapter'
import type {
  AdvisorCriteria,
  AdvisorCriterionMatch,
  AdvisorEvidence,
  AdvisorFeature,
  AdvisorMatch,
} from './advisor-types'

interface FeatureDefinition {
  label: string
  reason: string
  missingData: string
  matches: (listing: ListingSummary, normalizedContent: string) => boolean
}

const FEATURE_DEFINITIONS: Record<AdvisorFeature, FeatureDefinition> = {
  zoning: {
    label: 'Konut imarı',
    reason: 'Konut imarı tercihinizle eşleşiyor.',
    missingData: 'İmar durumu ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) => content.includes('imar'),
  },
  'detached-deed': {
    label: 'Müstakil tapu',
    reason: 'Müstakil tapu tercihinizle eşleşiyor.',
    missingData: 'Müstakil tapu bilgisi ilan detaylarında belirtilmemiş.',
    matches: (listing, content) =>
      listing.attributes.deed === 'detached' || content.includes('müstakil tapu'),
  },
  sea: {
    label: 'Denize yakınlık',
    reason: 'Denize yakınlık tercihinizle eşleşiyor.',
    missingData: 'Denize yakınlık bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) => content.includes('deniz') || content.includes('plaj'),
  },
  road: {
    label: 'Yol cephesi',
    reason: 'Yol cephesi tercihinizle eşleşiyor.',
    missingData: 'Yol cephesi bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) => content.includes('yol') || content.includes('cephe'),
  },
  transport: {
    label: 'Ulaşım',
    reason: 'Ulaşım kolaylığı tercihinizle eşleşiyor.',
    missingData: 'Ulaşım bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) =>
      content.includes('metro') || content.includes('ulaşım') || content.includes('merkezi'),
  },
  'quiet-life': {
    label: 'Sakin yaşam',
    reason: 'Sakin yaşam tercihinizle eşleşiyor.',
    missingData: 'Sakin yaşam bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) =>
      content.includes('sakin') || content.includes('sessiz') || content.includes('huzurlu'),
  },
  'family-life': {
    label: 'Aile yaşamı',
    reason: 'Aile yaşamı tercihinizle eşleşiyor.',
    missingData: 'Aile yaşamı bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) =>
      content.includes('aile') ||
      content.includes('site') ||
      content.includes('okul') ||
      content.includes('park'),
  },
  'rental-yield': {
    label: 'Kira getirisi',
    reason: 'Kira getirisi tercihinizle eşleşiyor.',
    missingData: 'Kira getirisi bilgisi ilan detaylarında belirtilmemiş.',
    matches: (_listing, content) =>
      content.includes('kira getirisi') || content.includes('kiracılı'),
  },
}

function normalizedListingContent(listing: ListingSummary): string {
  return [
    listing.title,
    ...listing.highlights,
    ...Object.entries(listing.attributes).flatMap(([key, value]) => [key, value]),
  ]
    .join(' ')
    .toLocaleLowerCase('tr-TR')
}

function titleCase(value: string): string {
  return value.slice(0, 1).toLocaleUpperCase('tr-TR') + value.slice(1)
}

function fallbackReason(criteria: AdvisorCriteria): string {
  const location = criteria.city
    ? `${titleCase(criteria.city)}${criteria.district ? `, ${titleCase(criteria.district)}` : ''} konumu`
    : criteria.district
      ? `${titleCase(criteria.district)} konumu`
      : undefined
  const transaction = criteria.intent === 'rent' ? 'kiralık' : 'satılık'
  const propertyType = criteria.propertyTypes[0]
  const category = propertyType
    ? {
        land: 'arsa',
        residential: 'konut',
        commercial: 'iş yeri',
        building: 'bina',
        timeshare: 'devremülk',
        touristic: 'turistik tesis',
      }[propertyType]
    : undefined
  const filters = [location, category ? `${category} türü` : undefined, `${transaction} talebiniz`]
    .filter(Boolean)
    .join(' ve ')

  return `${filters}le eşleşiyor.`
}

function buildEvidence(listing: ListingSummary): AdvisorEvidence[] {
  return [
    {
      id: `eids-${listing.id}`,
      title: 'EİDS taşınmaz yetkisi',
      source: 'İlan doğrulama kaydı',
      status: listing.verified ? 'verified' : 'review',
      detail: listing.verified
        ? 'Yetki doğrulaması tamamlandı.'
        : 'Belge incelemesi gerekiyor.',
    },
  ]
}

function buildAdvisorMatch(criteria: AdvisorCriteria, listing: ListingSummary): AdvisorMatch {
  const content = normalizedListingContent(listing)
  const requiredFeatures = new Set(criteria.mustHave)
  const requestedFeatures = [
    ...criteria.mustHave,
    ...criteria.preferences.filter((feature) => !requiredFeatures.has(feature)),
  ]
  const criterionByFeature = new Map<AdvisorFeature, AdvisorCriterionMatch>()
  const reasons: string[] = []
  const missingData: string[] = []

  for (const feature of requestedFeatures) {
    const definition = FEATURE_DEFINITIONS[feature]
    const matched = definition.matches(listing, content)
    const kind = requiredFeatures.has(feature) ? 'required' : 'preference'
    criterionByFeature.set(feature, {
      key: feature,
      label: definition.label,
      kind,
      matched,
      detail: matched
        ? `${definition.label} ilan içeriğinde belirtiliyor.`
        : `${definition.label} ilan içeriğinde belirtilmiyor.`,
    })
    if (matched) reasons.push(definition.reason)
    if (!matched) missingData.push(definition.missingData)
  }

  const criteriaMatches = requestedFeatures.map((feature) => criterionByFeature.get(feature)!)
  const preferenceMatches = criteriaMatches.filter(
    (criterion) => criterion.kind === 'preference' && criterion.matched,
  ).length
  const preferenceCount = criteriaMatches.filter(
    (criterion) => criterion.kind === 'preference',
  ).length
  const preferenceScore = preferenceCount === 0 ? 0 : (preferenceMatches / preferenceCount) * 30
  const verificationScore = listing.verified ? 10 : 0

  return {
    listing,
    score: Math.min(100, Math.round(60 + preferenceScore + verificationScore)),
    reasons: reasons.length > 0 ? reasons : [fallbackReason(criteria)],
    criteria: criteriaMatches,
    evidence: buildEvidence(listing),
    missingData,
  }
}

export function matchAdvisorListings(
  criteria: AdvisorCriteria,
  listings: ListingSummary[],
): AdvisorMatch[] {
  const transaction = criteria.intent === 'rent' ? 'rent' : 'sale'

  return listings
    .filter((listing) => listing.transaction === transaction)
    .filter((listing) => !criteria.city || listing.city === criteria.city)
    .filter((listing) => !criteria.district || listing.district === criteria.district)
    .filter(
      (listing) =>
        criteria.propertyTypes.length === 0 ||
        criteria.propertyTypes.includes(listing.category),
    )
    .filter(
      (listing) =>
        criteria.budget.min === undefined || listing.price >= criteria.budget.min,
    )
    .filter(
      (listing) =>
        criteria.budget.max === undefined || listing.price <= criteria.budget.max,
    )
    .filter(
      (listing) => criteria.area.min === undefined || listing.area >= criteria.area.min,
    )
    .filter(
      (listing) => criteria.area.max === undefined || listing.area <= criteria.area.max,
    )
    .filter((listing) => !criteria.rooms || listing.attributes.rooms === criteria.rooms)
    .map((listing) => buildAdvisorMatch(criteria, listing))
    .filter((match) =>
      match.criteria
        .filter((criterion) => criterion.kind === 'required')
        .every((criterion) => criterion.matched),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        Number(right.listing.verified) - Number(left.listing.verified) ||
        left.listing.unitPrice - right.listing.unitPrice,
    )
    .slice(0, 6)
}
