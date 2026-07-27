import type { OfficeSummary } from './office-types'
import type {
  OfficeAiProposal,
  OfficeAiFilter,
  OfficeMatch,
  OfficeMatchEvidence,
  OfficeSearchBrief,
} from './office-types'
import type { OfficeIntent } from './office-search-state'

const CITY_LABELS: Record<string, string> = {
  izmir: 'İzmir',
  istanbul: 'İstanbul',
  ankara: 'Ankara',
  bursa: 'Bursa',
  muğla: 'Muğla',
  antalya: 'Antalya',
  eskişehir: 'Eskişehir',
}

const DISTRICTS: Record<string, { city: string; label: string }> = {
  urla: { city: 'izmir', label: 'Urla' },
  çeşme: { city: 'izmir', label: 'Çeşme' },
  alaçatı: { city: 'izmir', label: 'Alaçatı' },
  karşıyaka: { city: 'izmir', label: 'Karşıyaka' },
  kadıköy: { city: 'istanbul', label: 'Kadıköy' },
  beşiktaş: { city: 'istanbul', label: 'Beşiktaş' },
  çankaya: { city: 'ankara', label: 'Çankaya' },
  gölbaşı: { city: 'ankara', label: 'Gölbaşı' },
  nilüfer: { city: 'bursa', label: 'Nilüfer' },
  bodrum: { city: 'muğla', label: 'Bodrum' },
  fethiye: { city: 'muğla', label: 'Fethiye' },
  konyaaltı: { city: 'antalya', label: 'Konyaaltı' },
  tepebaşı: { city: 'eskişehir', label: 'Tepebaşı' },
}

const PROPERTY_TYPES = [
  { token: 'land', label: 'Arsa', keywords: ['arsa', 'tarla', 'parsel'] },
  { token: 'residential', label: 'Konut', keywords: ['konut', 'ev', 'daire', 'villa'] },
  { token: 'commercial', label: 'İş yeri', keywords: ['iş yeri', 'dükkan', 'mağaza', 'ofis'] },
  { token: 'building', label: 'Bina', keywords: ['bina', 'apartman'] },
  { token: 'timeshare', label: 'Devremülk', keywords: ['devremülk'] },
  { token: 'touristic', label: 'Turistik tesis', keywords: ['turistik', 'otel', 'tesis'] },
] as const

const EXPERTISE = [
  { token: 'land', label: 'Arsa', keywords: ['arsa', 'tarla', 'parsel'] },
  { token: 'zoning', label: 'İmar', keywords: ['imar', 'imarlı'] },
  { token: 'valuation', label: 'Değerleme', keywords: ['değerleme', 'ekspertiz'] },
  { token: 'investment', label: 'Yatırım', keywords: ['yatırım', 'yatirim'] },
  { token: 'commercial', label: 'Ticari', keywords: ['ticari', 'iş yeri'] },
  { token: 'touristic', label: 'Turizm', keywords: ['turizm', 'turistik'] },
] as const

function normalize(value: string): string {
  return value.toLocaleLowerCase('tr-TR').replaceAll('’', "'")
}

function hasKeyword(query: string, keyword: string): boolean {
  return normalize(query).includes(normalize(keyword))
}

function findIntent(query: string): OfficeIntent {
  if (['değerleme', 'ekspertiz', 'değer biç'].some((item) => hasKeyword(query, item))) {
    return 'valuate'
  }
  if (['kiralamak', 'kiralık', 'kira'].some((item) => hasKeyword(query, item))) {
    return 'rent'
  }
  if (['satmak', 'satışı', 'satış', 'satıyorum'].some((item) => hasKeyword(query, item))) {
    return 'sell'
  }
  return 'buy'
}

function parseBudget(query: string): OfficeSearchBrief['budget'] | undefined {
  const match = normalize(query).match(/(\d+(?:[.,]\d+)?)\s*(milyon|bin)?\s*(?:tl|₺)/)
  if (!match) return undefined

  const amount = Number(match[1]?.replace(',', '.'))
  if (!Number.isFinite(amount)) return undefined
  const multiplier = match[2] === 'milyon' ? 1_000_000 : match[2] === 'bin' ? 1_000 : 1
  const value = Math.round(amount * multiplier)
  return /en fazla|maksimum|azami/.test(normalize(query)) ? { max: value } : { max: value }
}

function locationFromQuery(query: string): { city?: string; district?: string; location?: string } {
  const normalizedQuery = normalize(query)
  const district = Object.entries(DISTRICTS).find(([value]) => normalizedQuery.includes(value))
  const directCity = Object.keys(CITY_LABELS).find((value) => normalizedQuery.includes(value))
  const city = district?.[1].city ?? directCity
  const cityLabel = city ? CITY_LABELS[city] : undefined
  const districtLabel = district?.[1].label

  return {
    city,
    district: district?.[0],
    location: cityLabel && districtLabel ? `${cityLabel}/${districtLabel}` : cityLabel,
  }
}

function evidenceFor(office: OfficeSummary, expertise: string[]): OfficeMatchEvidence[] {
  const expertTerms = expertise.flatMap((item) =>
    EXPERTISE.find((definition) => definition.token === item)?.keywords ?? [item],
  )
  const relevant = office.evidence.filter((item) => {
    const text = normalize(`${item.label} ${item.value}`)
    return expertTerms.some((term) => text.includes(normalize(term)))
  })

  return relevant.length > 0 ? relevant : office.evidence.slice(0, 1)
}

export function parseOfficePrompt(query: string): {
  brief: OfficeSearchBrief
  filters: OfficeAiFilter[]
  confidence: number
} {
  const location = locationFromQuery(query)
  const property = PROPERTY_TYPES.find((item) =>
    item.keywords.some((keyword) => hasKeyword(query, keyword)),
  )
  const expertise = EXPERTISE.filter((item) =>
    item.keywords.some((keyword) => hasKeyword(query, keyword)),
  )
  const communicationPreference = hasKeyword(query, 'mesaj')
    ? 'message'
    : hasKeyword(query, 'telefon') || hasKeyword(query, 'ara')
      ? 'call'
      : hasKeyword(query, 'randevu') || hasKeyword(query, 'görüş')
        ? 'meeting'
        : undefined
  const timeline = ['bugün', 'bu hafta', 'bu ay', 'acil'].find((item) =>
    hasKeyword(query, item),
  )
  const intent = findIntent(query)
  const brief: OfficeSearchBrief = {
    intent,
    ...(property ? { propertyType: property.token } : {}),
    ...(location.location ? { location: location.location } : {}),
    ...(parseBudget(query) ? { budget: parseBudget(query) } : {}),
    ...(timeline ? { timeline } : {}),
    ...(expertise.length > 0 ? { expertise: expertise.map((item) => item.token) } : {}),
    ...(communicationPreference ? { communicationPreference } : {}),
  }
  const filters: OfficeAiFilter[] = [
    { key: 'intent', label: 'Amaç', value: intent, displayValue: intent === 'sell' ? 'Satış' : intent === 'rent' ? 'Kiralama' : intent === 'valuate' ? 'Değerleme' : 'Alım' },
    ...(property ? [{ key: 'propertyType', label: 'Mülk tipi', value: property.token, displayValue: property.label }] : []),
    ...(location.city ? [{ key: 'city', label: 'Şehir', value: location.city, displayValue: CITY_LABELS[location.city] ?? location.city }] : []),
    ...(location.district ? [{ key: 'district', label: 'İlçe', value: location.district, displayValue: DISTRICTS[location.district]?.label ?? location.district }] : []),
    ...expertise.map((item) => ({ key: 'expertise', label: 'Uzmanlık', value: item.token, displayValue: item.label })),
  ]
  const signals = Number(Boolean(property)) + Number(Boolean(location.city)) + Number(Boolean(location.district)) + expertise.length + Number(Boolean(communicationPreference)) + Number(Boolean(timeline))

  return { brief, filters, confidence: Math.min(96, 45 + signals * 8) }
}

/** Aynı alanı taşıyan birden çok AI çıkarımının tekil kimliği. */
export function officeProposalFilterId(filter: OfficeAiFilter): string {
  return `${filter.key}::${filter.value}`
}

function briefFromFilters(
  brief: OfficeAiProposal['brief'],
  filters: OfficeAiFilter[],
): OfficeAiProposal['brief'] {
  const valueFor = (key: string) =>
    filters.find((filter) => filter.key === key)?.value
  const expertise = filters
    .filter((filter) => filter.key === 'expertise')
    .map((filter) => filter.value)
  const city = valueFor('city')
  const district = valueFor('district')

  return {
    ...brief,
    intent: valueFor('intent') as OfficeIntent | undefined,
    propertyType: valueFor('propertyType'),
    location: city ? [city, district].filter(Boolean).join('/') : undefined,
    expertise: expertise.length > 0 ? expertise : undefined,
  }
}

/** Kullanıcının kaldırdığı tek çıkarımı proposal ve eşleşme brief'inden çıkarır. */
export function removeOfficeProposalFilter(
  proposal: OfficeAiProposal,
  id: string,
): OfficeAiProposal {
  const filters = proposal.filters.filter(
    (filter) => officeProposalFilterId(filter) !== id,
  )

  return {
    ...proposal,
    filters,
    brief: briefFromFilters(proposal.brief, filters),
  }
}

export function matchOffices(
  brief: OfficeSearchBrief,
  offices: OfficeSummary[],
): OfficeMatch[] {
  const location = brief.location ? locationFromQuery(brief.location) : {}
  const requestedExpertise = brief.expertise ?? []

  return offices
    .map((office, index) => {
      let score = 0
      const reasons: string[] = []
      if (brief.intent && office.intents.includes(brief.intent)) {
        score += 32
        reasons.push('Talebinizin amacında hizmet veriyor.')
      }
      if (location.city === office.city) {
        score += 18
        reasons.push(`${CITY_LABELS[office.city] ?? office.city} bölgesinde hizmet veriyor.`)
      }
      if (location.district && office.districts.includes(location.district)) {
        score += 12
        reasons.push(`${DISTRICTS[location.district]?.label ?? location.district} hizmet bölgesinde.`)
      }
      const matchingExpertise = requestedExpertise.filter((item) =>
        office.expertise.includes(item),
      )
      if (matchingExpertise.length > 0) {
        score += Math.min(20, matchingExpertise.length * 10)
        reasons.push(`${matchingExpertise.length === 1 ? 'İstenen uzmanlık' : 'İstenen uzmanlıklar'} profilde yer alıyor.`)
      }
      if (brief.propertyType && office.propertyTypes.includes(brief.propertyType)) score += 8
      if (office.verified) {
        score += 10
        reasons.push('Ofis doğrulama kaydına sahip.')
      }
      const responseScore = office.responseMinutes <= 15 ? 10 : office.responseMinutes <= 30 ? 6 : office.responseMinutes <= 45 ? 3 : 0
      if (responseScore > 0) {
        score += responseScore
        reasons.push(`Ortalama yanıt süresi ${office.responseMinutes} dakika.`)
      }

      return {
        officeId: office.id,
        score: Math.min(100, score),
        reasons: reasons.length > 0 ? reasons : ['Ofis profil verisi eşleşme için incelendi.'],
        evidence: evidenceFor(office, matchingExpertise),
        index,
      }
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ index: _index, ...match }) => match)
}
