import type {
  AdvisorCriteria,
  AdvisorFeature,
  AdvisorIntent,
  AdvisorNumericRange,
  AdvisorPropertyType,
  AdvisorProposal,
} from './advisor-types'

const LOCATION_INDEX = {
  izmir: ['urla', 'çeşme', 'bayraklı', 'konak'],
  istanbul: ['kadıköy', 'ataşehir'],
  ankara: ['gölbaşı', 'çankaya'],
  bursa: ['nilüfer'],
  antalya: ['kaş'],
  muğla: ['bodrum'],
} as const

const PROPERTY_KEYWORDS: Record<AdvisorPropertyType, readonly string[]> = {
  land: ['arsa', 'tarla', 'parsel'],
  residential: ['konut', 'daire', 'villa', 'ev'],
  commercial: ['iş yeri', 'işyeri', 'ofis', 'dükkan', 'dükkân'],
  building: ['bina'],
  timeshare: ['devremülk'],
  touristic: ['otel', 'pansiyon', 'turistik tesis'],
}

const STRUCTURAL_FEATURES: Array<[AdvisorFeature, readonly string[]]> = [
  ['zoning', ['imar']],
  ['detached-deed', ['müstakil tapu', 'müstakil tapulu']],
  ['road', ['yola cephe', 'yol cephe', 'yola cepheli', 'ana yola']],
]

const PREFERENCE_FEATURES: Array<[AdvisorFeature, readonly string[]]> = [
  ['sea', ['deniz']],
  ['transport', ['metro', 'ulaşım', 'toplu taşıma']],
  ['quiet-life', ['sakin yaşam', 'sakin hayat', 'huzurlu']],
  ['family-life', ['aile yaşam', 'aile için', 'çocuklu aile']],
  ['rental-yield', ['kira getirisi', 'kira geliri', 'yüksek kira']],
]

const MONEY_SPAN = /(?:\d{1,3}(?:[.\s]\d{3})+|\d+(?:[,.]\d+)?)\s*(?:(?:milyon|bin)(?:\s*tl)?|tl)\b/gi
const AREA_SPAN = /(?<![\d.])(?:\d{1,3}(?:[.\s]\d{3})+|\d+(?:[,.]\d+)?)\s*(?:m²|m2|metrekare)(?=\s|$|[,.!?;:])/gi
const STANDALONE_EV = /(?<![\p{L}\p{M}\p{N}_])ev(?![\p{L}\p{M}\p{N}_])/u

function includesAny(input: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) =>
    keyword === 'ev' ? STANDALONE_EV.test(input) : input.includes(keyword),
  )
}

function rangeDirection(
  input: string,
  start: number,
  end: number,
): keyof AdvisorNumericRange | undefined {
  const before = input.slice(Math.max(0, start - 16), start)
  const after = input.slice(end, end + 16)
  if (/(en az|minimum)\s*$/.test(before)) return 'min'
  if (/(en fazla|maksimum)\s*$/.test(before)) return 'max'
  if (/^\s*(üstünde|en az|minimum)/.test(after)) return 'min'
  if (/^\s*(altında|en fazla|maksimum)/.test(after)) return 'max'
  return undefined
}

function parseRange(
  input: string,
  expression: RegExp,
  normalize: (value: string) => number | undefined,
): AdvisorNumericRange {
  const result: AdvisorNumericRange = {}
  for (const match of input.matchAll(expression)) {
    const value = normalize(match[0])
    const direction = rangeDirection(input, match.index ?? 0, (match.index ?? 0) + match[0].length)
    if (value !== undefined && direction) result[direction] = value
  }
  return result
}

function resolveLocation(input: string): Pick<AdvisorCriteria, 'city' | 'district'> {
  for (const [city, districts] of Object.entries(LOCATION_INDEX)) {
    const district = districts.find((candidate) => input.includes(candidate))
    if (district) return { city, district }
  }
  const city = Object.keys(LOCATION_INDEX).find((candidate) => input.includes(candidate))
  return city ? { city } : {}
}

function parsePropertyTypes(input: string): AdvisorPropertyType[] {
  const propertyTypes = (Object.entries(PROPERTY_KEYWORDS) as Array<
    [AdvisorPropertyType, readonly string[]]
  >)
    .filter(([, keywords]) => includesAny(input, keywords))
    .map(([propertyType]) => propertyType)
  return propertyTypes.includes('land')
    ? propertyTypes.filter((propertyType) => propertyType !== 'residential')
    : propertyTypes
}

function parseIntent(input: string): { intent: AdvisorIntent; explicit: boolean } {
  if (includesAny(input, ['kiralık', 'kiralama', 'kiraya'])) {
    return { intent: 'rent', explicit: true }
  }
  if (includesAny(input, ['yatırım', 'yatırımlık'])) {
    return { intent: 'invest', explicit: true }
  }
  if (includesAny(input, ['satılık', 'satın al', 'almak'])) {
    return { intent: 'buy', explicit: true }
  }
  return { intent: 'buy', explicit: false }
}

function parseFeatures(input: string): Pick<AdvisorCriteria, 'mustHave' | 'preferences'> {
  const mustHave: AdvisorFeature[] = []
  const preferences: AdvisorFeature[] = []
  const hasPriorityMarker = includesAny(input, ['şart', 'mutlaka', 'olmazsa olmaz'])
  const addUnique = (target: AdvisorFeature[], feature: AdvisorFeature) => {
    if (!target.includes(feature)) target.push(feature)
  }

  for (const [feature, keywords] of STRUCTURAL_FEATURES) {
    if (includesAny(input, keywords)) addUnique(mustHave, feature)
  }
  for (const [feature, keywords] of PREFERENCE_FEATURES) {
    if (includesAny(input, keywords)) {
      addUnique(hasPriorityMarker ? mustHave : preferences, feature)
    }
  }
  return { mustHave, preferences }
}

function titleCase(value: string): string {
  return value.slice(0, 1).toLocaleUpperCase('tr-TR') + value.slice(1)
}

export function normalizeTurkishMoney(input: string): number | undefined {
  const normalized = input
    .toLocaleLowerCase('tr-TR')
    .replace(/\btl\b/g, '')
    .trim()
  const multiplier = normalized.includes('milyon')
    ? 1_000_000
    : normalized.includes('bin')
      ? 1_000
      : 1
  const raw = normalized.replace(/milyon|bin/g, '').trim()
  const digits =
    multiplier === 1
      ? raw.replace(/[.\s]/g, '').replace(',', '.')
      : raw.replace(',', '.')
  const value = Number(digits)
  return Number.isFinite(value) ? Math.round(value * multiplier) : undefined
}

function normalizeTurkishArea(input: string): number | undefined {
  const raw = input.replace(/\s*(?:m²|m2|metrekare)/, '').trim()
  const compact = raw.replace(/\s/g, '')
  const normalized = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(compact)
    ? compact.replace(/\./g, '').replace(',', '.')
    : compact.replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : undefined
}

export function parseAdvisorPrompt(query: string): AdvisorProposal {
  const input = query.toLocaleLowerCase('tr-TR')
  const location = resolveLocation(input)
  const propertyTypes = parsePropertyTypes(input)
  const genericPropertySearch = input.includes('emlak')
  const intent = parseIntent(input)
  const rooms = input.match(/\b(\d+\s*\+\s*\d+)\b/)?.[1]?.replace(/\s/g, '')
  const area = parseRange(input, AREA_SPAN, normalizeTurkishArea)
  const budget = parseRange(input, MONEY_SPAN, normalizeTurkishMoney)
  const features = parseFeatures(input)
  const criteria: AdvisorCriteria = {
    intent: intent.intent,
    ...location,
    propertyTypes,
    budget,
    area,
    rooms,
    ...features,
  }
  const resolvedLocation = Boolean(location.city)
  const resolvedPropertyType = propertyTypes.length > 0 || genericPropertySearch
  const hasNumericRange = Object.keys(budget).length > 0 || Object.keys(area).length > 0
  const hasFeature = features.mustHave.length > 0 || features.preferences.length > 0
  const interpretationConfidence = Math.min(
    96,
    35 +
      (resolvedLocation ? 20 : 0) +
      (resolvedPropertyType ? 15 : 0) +
      (intent.explicit ? 10 : 0) +
      (hasNumericRange ? 10 : 0) +
      (hasFeature ? 10 : 0),
  )
  const clarification =
    interpretationConfidence < 70
      ? !resolvedLocation
        ? {
            key: 'location' as const,
            question: 'Hangi şehir veya bölgede arama yapalım?',
          }
        : !resolvedPropertyType
          ? {
              key: 'propertyType' as const,
              question: 'Hangi tür taşınmazla ilgileniyorsunuz?',
            }
          : undefined
      : undefined
  const summary = location.city
    ? `${titleCase(location.city)} içinde kriterlerinize göre ilanları hazırladım.`
    : 'Kriterlerinize göre ilanları hazırladım.'

  return {
    query,
    criteria,
    summary,
    interpretationConfidence,
    clarification,
  }
}

export function mergeAdvisorClarification(
  proposal: AdvisorProposal,
  answer: string,
): AdvisorProposal {
  const normalizedAnswer = answer.trim()
  return normalizedAnswer
    ? parseAdvisorPrompt(`${proposal.query} ${normalizedAnswer}`)
    : proposal
}
