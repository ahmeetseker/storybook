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
  /** Mahalle — il/ilçenin altındaki en ince kırılım */
  neighbourhood?: string
  /**
   * Haritadan seçilen alan `[[güney, batı], [kuzey, doğu]]`.
   *
   * "Bu alanda ara" bunu yazar. Kadrajın KENDİSİ filtre değildir: kullanıcı
   * haritayı her oynattığında sonuç listesi değişseydi liste okunamaz hale
   * gelirdi. Alan yalnız kullanıcı açıkça istediğinde uygulanır ve çip olarak
   * görünür kalır.
   */
  mapArea?: [[number, number], [number, number]]
  salePrice?: NumericRange
  rentPrice?: NumericRange
  area?: NumericRange
  unitPrice?: NumericRange
  owners: OwnerType[]
  verified: boolean
  /** Yalnız vitrin (öne çıkan) ilanlar — ana sayfadaki vitrin kartı buraya bağlanır. */
  featured: boolean
  /**
   * Katalog tabanlı çoklu seçim filtreleri: `key` bir facet anahtarı,
   * değer seçilen seçeneklerdir. URL'de `f_<key>=a,b` olarak taşınır.
   */
  categoryFilters: Record<string, string[]>
  /**
   * Katalog tabanlı SAYISAL ARALIK filtreleri (bina yaşı, banyo sayısı, kat…).
   * `salePrice`/`area` gibi dört aralık tarihsel olarak ayrı alanlardır;
   * yeni facet'ler tek tek alan açmadan buraya girer. URL'de
   * `r_<key>Min` / `r_<key>Max` olarak taşınır.
   */
  categoryRanges: Record<string, NumericRange>
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
  featured: false,
  categoryFilters: {},
  categoryRanges: {},
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

/**
 * `r_<key>Min` / `r_<key>Max` çiftlerini tek bir aralık sözlüğüne toplar.
 * Yalnız bir ucu verilmiş aralık geçerlidir (ör. yalnız "en az 2 banyo").
 */
function categoryRanges(raw: RawSearch): Record<string, NumericRange> {
  const buckets: Record<string, { min?: unknown; max?: unknown }> = {}
  for (const [rawKey, value] of Object.entries(raw)) {
    if (!rawKey.startsWith('r_')) continue
    const body = rawKey.slice(2)
    if (body.endsWith('Min')) {
      const key = body.slice(0, -3)
      if (key) buckets[key] = { ...buckets[key], min: value }
    } else if (body.endsWith('Max')) {
      const key = body.slice(0, -3)
      if (key) buckets[key] = { ...buckets[key], max: value }
    }
  }
  const parsed: Record<string, NumericRange> = {}
  for (const [key, bounds] of Object.entries(buckets)) {
    const value = range(bounds.min, bounds.max)
    if (value) parsed[key] = value
  }
  return parsed
}

/** `bbox=güney,batı,kuzey,doğu` — dört sonlu sayı değilse alan yok sayılır. */
function mapArea(raw: RawSearch): [[number, number], [number, number]] | undefined {
  const value = stringValue(raw.bbox)
  if (!value) return undefined
  const parts = value.split(',').map(Number)
  if (parts.length !== 4 || !parts.every((part) => Number.isFinite(part))) return undefined
  const [south, west, north, east] = parts
  // Ters verilmiş sınır sessizce düzeltilir: kullanıcıya hata göstermek yerine
  // anlaşılabilir olanı uygularız.
  return [
    [Math.min(south, north), Math.min(west, east)],
    [Math.max(south, north), Math.max(west, east)],
  ]
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
    neighbourhood: stringValue(raw.neighbourhood),
    mapArea: mapArea(raw),
    salePrice: range(raw.salePriceMin, raw.salePriceMax),
    rentPrice: range(raw.rentPriceMin, raw.rentPriceMax),
    area: range(raw.areaMin, raw.areaMax),
    unitPrice: range(raw.unitPriceMin, raw.unitPriceMax),
    owners,
    verified: raw.verified === '1' || raw.verified === true,
    featured: raw.featured === '1' || raw.featured === true,
    categoryFilters: categoryFilters(raw),
    categoryRanges: categoryRanges(raw),
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
  if (state.neighbourhood) search.neighbourhood = state.neighbourhood
  if (state.mapArea) search.bbox = state.mapArea.flat().join(',')
  appendRange(search, 'salePrice', state.salePrice)
  appendRange(search, 'rentPrice', state.rentPrice)
  appendRange(search, 'area', state.area)
  appendRange(search, 'unitPrice', state.unitPrice)
  if (state.owners.length > 0) search.owner = state.owners.join(',')
  if (state.verified) search.verified = '1'
  if (state.featured) search.featured = '1'
  if (state.sort !== 'recommended') search.sort = state.sort
  if (state.page !== 1) search.page = state.page
  if (state.layout !== 'row') search.view = state.layout
  if (state.mapMode !== 'off') search.map = state.mapMode

  Object.entries(state.categoryFilters)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, values]) => {
      if (values.length > 0) search[`f_${key}`] = values.join(',')
    })

  Object.entries(state.categoryRanges)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => appendRange(search, `r_${key}`, value))

  return search
}

/**
 * Tüm daraltıcıları temizler; yalnız görünüm tercihleri (sıralama, yerleşim,
 * harita modu) ve serbest metin sorgusu korunur.
 *
 * Tek yerde yaşamasının nedeni somut: sıfırlama üç ayrı yerde (kenar çubuğu,
 * mobil çekmece, "Tüm Seçenekler" modalı) elle tekrarlanıyordu ve yeni bir
 * filtre alanı eklendiğinde biri güncellenmeden kalıyordu — kullanıcı
 * "sıfırla" dedikten sonra hâlâ süzülmüş bir sonuç görüyordu.
 */
export function clearListingFilters(state: ListingSearchState): ListingSearchState {
  return {
    ...state,
    category: 'all',
    city: undefined,
    district: undefined,
    neighbourhood: undefined,
    mapArea: undefined,
    salePrice: undefined,
    rentPrice: undefined,
    area: undefined,
    unitPrice: undefined,
    owners: [],
    verified: false,
    featured: false,
    categoryFilters: {},
    categoryRanges: {},
    page: 1,
  }
}

export function changeCategory(
  state: ListingSearchState,
  category: PropertyCategory,
): ListingSearchState {
  return {
    ...state,
    category,
    // Kategori değişince ona özgü filtreler anlamını yitirir: arsada seçili
    // "Isıtma" konut kategorisine taşınmamalı.
    categoryFilters: {},
    categoryRanges: {},
    page: 1,
  }
}

