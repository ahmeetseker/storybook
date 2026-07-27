export const OFFICE_INTENTS = ['all', 'buy', 'rent', 'sell', 'valuate'] as const
export const OFFICE_SORTS = [
  'match',
  'response',
  'portfolio',
  'rating',
] as const
export const OFFICE_LAYOUTS = ['list', 'split'] as const

export type OfficeIntent = Exclude<(typeof OFFICE_INTENTS)[number], 'all'>
export type OfficeSearchIntent = (typeof OFFICE_INTENTS)[number]
export type OfficeSort = (typeof OFFICE_SORTS)[number]
export type OfficeLayout = (typeof OFFICE_LAYOUTS)[number]

export interface OfficeSearchState {
  query: string
  intent: OfficeSearchIntent
  propertyType?: string
  city?: string
  district?: string
  expertise: string[]
  verifiedOnly: boolean
  maxResponseMinutes?: number
  language?: string
  minConsultants?: number
  minActiveListings?: number
  transactionExperience?: OfficeIntent
  sort: OfficeSort
  layout: OfficeLayout
  page: number
}

export const DEFAULT_OFFICE_SEARCH_STATE: OfficeSearchState = {
  query: '',
  intent: 'all',
  expertise: [],
  verifiedOnly: false,
  sort: 'match',
  layout: 'list',
  page: 1,
}

type RawOfficeSearch = Record<string, unknown> | URLSearchParams
export type SerializedOfficeSearch = Record<string, string | number>

function toSearchParams(raw: RawOfficeSearch): URLSearchParams {
  if (raw instanceof URLSearchParams) return raw

  const params = new URLSearchParams()
  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      params.set(key, String(value))
    }
  })
  return params
}

function stringValue(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim()
  return value || undefined
}

function enumValue<T extends string>(
  params: URLSearchParams,
  key: string,
  options: readonly T[],
  fallback: T,
): T {
  const value = stringValue(params, key)
  return value && options.includes(value as T) ? (value as T) : fallback
}

function stringList(params: URLSearchParams, key: string): string[] {
  const value = stringValue(params, key)
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item, index, items) => Boolean(item) && items.indexOf(item) === index)
}

function positiveInteger(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const value = stringValue(params, key)
  if (!value) return undefined

  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : undefined
}

function optionalIntent(
  params: URLSearchParams,
  key: string,
): OfficeIntent | undefined {
  const value = stringValue(params, key)
  return value && OFFICE_INTENTS.slice(1).includes(value as OfficeIntent)
    ? (value as OfficeIntent)
    : undefined
}

export function parseOfficeSearch(raw: RawOfficeSearch): OfficeSearchState {
  const params = toSearchParams(raw)

  return {
    query: stringValue(params, 'q') ?? '',
    intent: enumValue(
      params,
      'intent',
      OFFICE_INTENTS,
      DEFAULT_OFFICE_SEARCH_STATE.intent,
    ),
    propertyType: stringValue(params, 'propertyType'),
    city: stringValue(params, 'city'),
    district: stringValue(params, 'district'),
    expertise: stringList(params, 'expertise'),
    verifiedOnly: params.get('verified') === '1',
    maxResponseMinutes: positiveInteger(params, 'response'),
    language: stringValue(params, 'language'),
    minConsultants: positiveInteger(params, 'officeSize'),
    minActiveListings: positiveInteger(params, 'portfolio'),
    transactionExperience: optionalIntent(params, 'experience'),
    sort: enumValue(
      params,
      'sort',
      OFFICE_SORTS,
      DEFAULT_OFFICE_SEARCH_STATE.sort,
    ),
    layout: enumValue(
      params,
      'view',
      OFFICE_LAYOUTS,
      DEFAULT_OFFICE_SEARCH_STATE.layout,
    ),
    page:
      positiveInteger(params, 'page') ?? DEFAULT_OFFICE_SEARCH_STATE.page,
  }
}

export function serializeOfficeSearch(
  state: OfficeSearchState,
): SerializedOfficeSearch {
  const params = new URLSearchParams()
  if (state.query) params.set('q', state.query)
  if (state.intent !== 'all') params.set('intent', state.intent)
  if (state.propertyType) params.set('propertyType', state.propertyType)
  if (state.city) params.set('city', state.city)
  if (state.district) params.set('district', state.district)
  if (state.expertise.length > 0) params.set('expertise', state.expertise.join(','))
  if (state.verifiedOnly) params.set('verified', '1')
  if (state.maxResponseMinutes !== undefined) {
    params.set('response', String(state.maxResponseMinutes))
  }
  if (state.language) params.set('language', state.language)
  if (state.minConsultants !== undefined) params.set('officeSize', String(state.minConsultants))
  if (state.minActiveListings !== undefined) params.set('portfolio', String(state.minActiveListings))
  if (state.transactionExperience) params.set('experience', state.transactionExperience)
  if (state.sort !== 'match') params.set('sort', state.sort)
  if (state.layout !== 'list') params.set('view', state.layout)
  if (state.page !== 1) params.set('page', String(state.page))

  return Array.from(params.entries()).reduce<SerializedOfficeSearch>(
    (search, [key, value]) => {
      search[key] = ['response', 'page', 'officeSize', 'portfolio'].includes(key) ? Number(value) : value
      return search
    },
    {},
  )
}

export function changeOfficeIntent(
  state: OfficeSearchState,
  intent: OfficeSearchIntent,
): OfficeSearchState {
  return {
    ...state,
    intent,
    expertise: [],
    page: 1,
  }
}

export function resetOfficeSearch(
  state: OfficeSearchState,
): OfficeSearchState {
  return {
    ...DEFAULT_OFFICE_SEARCH_STATE,
    intent: state.intent,
  }
}
