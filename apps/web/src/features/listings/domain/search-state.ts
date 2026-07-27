export const PROPERTY_CATEGORIES = [
  'all',
  'residential',
  'land',
  'commercial',
  'building',
  'timeshare',
  'touristic',
] as const

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]
export type TransactionType = 'sale' | 'rent'
export type ListingSort =
  | 'recommended'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'unit-price'
export type ResultLayout = 'row' | 'grid'
export type MapMode = 'off' | 'split' | 'full'
export type OwnerType = 'owner' | 'agency'

export interface NumericRange {
  min?: number
  max?: number
}

export interface ListingSearchState {
  query: string
  transactions: TransactionType[]
  category: PropertyCategory
  city?: string
  district?: string
  salePrice?: NumericRange
  rentPrice?: NumericRange
  area?: NumericRange
  unitPrice?: NumericRange
  owners: OwnerType[]
  verified: boolean
  categoryFilters: Record<string, string[]>
  sort: ListingSort
  page: number
  layout: ResultLayout
  mapMode: MapMode
}

export const DEFAULT_LISTING_SEARCH_STATE: ListingSearchState = {
  query: '',
  transactions: ['sale', 'rent'],
  category: 'all',
  owners: [],
  verified: false,
  categoryFilters: {},
  sort: 'recommended',
  page: 1,
  layout: 'row',
  mapMode: 'off',
}

type RawSearch = Record<string, unknown>

const TRANSACTIONS = ['sale', 'rent'] as const
const OWNERS = ['owner', 'agency'] as const
const SORTS: ListingSort[] = [
  'recommended',
  'newest',
  'price-asc',
  'price-desc',
  'unit-price',
]
const LAYOUTS: ResultLayout[] = ['row', 'grid']
const MAP_MODES: MapMode[] = ['off', 'split', 'full']

function stringValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized ? normalized : undefined
}

function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const normalized = stringValue(value)
  return normalized && allowed.includes(normalized as T)
    ? (normalized as T)
    : fallback
}

function stringList<T extends string>(
  value: unknown,
  allowed?: readonly T[],
): T[] {
  const normalized = stringValue(value)
  if (!normalized) return []
  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(
      (item, index, values): item is T =>
        Boolean(item) &&
        values.indexOf(item) === index &&
        (!allowed || allowed.includes(item as T)),
    )
}

function positiveNumber(value: unknown): number | undefined {
  const normalized = stringValue(value)
  if (!normalized) return undefined
  const number = Number(normalized)
  return Number.isFinite(number) && number >= 0 ? number : undefined
}

function positiveInteger(value: unknown, fallback: number): number {
  const number = positiveNumber(value)
  return number !== undefined && Number.isInteger(number) && number > 0
    ? number
    : fallback
}

function range(min: unknown, max: unknown): NumericRange | undefined {
  const parsed = {
    min: positiveNumber(min),
    max: positiveNumber(max),
  }
  return parsed.min === undefined && parsed.max === undefined
    ? undefined
    : parsed
}

function categoryFilters(raw: RawSearch): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([key]) => key.startsWith('f_'))
      .map(([key, value]) => [key.slice(2), stringList<string>(value)])
      .filter(([, value]) => value.length > 0),
  )
}

export function parseListingSearch(raw: RawSearch): ListingSearchState {
  const transactions = stringList<TransactionType>(
    raw.type,
    TRANSACTIONS,
  ).sort(
    (left, right) =>
      TRANSACTIONS.indexOf(left) - TRANSACTIONS.indexOf(right),
  )
  const owners = stringList<OwnerType>(raw.owner, OWNERS).sort(
    (left, right) => OWNERS.indexOf(left) - OWNERS.indexOf(right),
  )

  return {
    query: stringValue(raw.q) ?? '',
    transactions:
      transactions.length > 0 ? transactions : ['sale', 'rent'],
    category: enumValue(
      raw.category,
      PROPERTY_CATEGORIES,
      DEFAULT_LISTING_SEARCH_STATE.category,
    ),
    city: stringValue(raw.city),
    district: stringValue(raw.district),
    salePrice: range(raw.salePriceMin, raw.salePriceMax),
    rentPrice: range(raw.rentPriceMin, raw.rentPriceMax),
    area: range(raw.areaMin, raw.areaMax),
    unitPrice: range(raw.unitPriceMin, raw.unitPriceMax),
    owners,
    verified: raw.verified === '1' || raw.verified === true,
    categoryFilters: categoryFilters(raw),
    sort: enumValue(raw.sort, SORTS, DEFAULT_LISTING_SEARCH_STATE.sort),
    page: positiveInteger(raw.page, 1),
    layout: enumValue(
      raw.view,
      LAYOUTS,
      DEFAULT_LISTING_SEARCH_STATE.layout,
    ),
    mapMode: enumValue(
      raw.map,
      MAP_MODES,
      DEFAULT_LISTING_SEARCH_STATE.mapMode,
    ),
  }
}

export type SerializedListingSearch = Record<string, string | number>

function appendRange(
  target: SerializedListingSearch,
  prefix: string,
  value: NumericRange | undefined,
) {
  if (value?.min !== undefined) target[`${prefix}Min`] = value.min
  if (value?.max !== undefined) target[`${prefix}Max`] = value.max
}

export function serializeListingSearch(
  state: ListingSearchState,
): SerializedListingSearch {
  const search: SerializedListingSearch = {}
  if (state.query) search.q = state.query
  if (
    state.transactions.length !== 2 ||
    !state.transactions.includes('sale') ||
    !state.transactions.includes('rent')
  ) {
    search.type = state.transactions.join(',')
  }
  if (state.category !== 'all') search.category = state.category
  if (state.city) search.city = state.city
  if (state.district) search.district = state.district
  appendRange(search, 'salePrice', state.salePrice)
  appendRange(search, 'rentPrice', state.rentPrice)
  appendRange(search, 'area', state.area)
  appendRange(search, 'unitPrice', state.unitPrice)
  if (state.owners.length > 0) search.owner = state.owners.join(',')
  if (state.verified) search.verified = '1'
  if (state.sort !== 'recommended') search.sort = state.sort
  if (state.page !== 1) search.page = state.page
  if (state.layout !== 'row') search.view = state.layout
  if (state.mapMode !== 'off') search.map = state.mapMode

  Object.entries(state.categoryFilters)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, values]) => {
      if (values.length > 0) search[`f_${key}`] = values.join(',')
    })

  return search
}

export function changeCategory(
  state: ListingSearchState,
  category: PropertyCategory,
): ListingSearchState {
  return {
    ...state,
    category,
    categoryFilters: {},
    page: 1,
  }
}

