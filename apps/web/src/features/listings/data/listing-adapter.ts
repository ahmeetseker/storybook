import type {
  ListingSearchState,
  OwnerType,
  PropertyCategory,
  TransactionType,
} from '../domain/search-state'
// Kategori etiketleri veri sözlüğünde tek kaynaktan gelir; ilan detayı da aynı
// sözlüğü okur (bkz. `listing-attributes.ts`).
import { CATEGORY_LABELS } from './listing-attributes'

export interface ListingSummary {
  id: string
  title: string
  category: Exclude<PropertyCategory, 'all'>
  transaction: TransactionType
  price: number
  area: number
  unitPrice: number
  city: string
  district: string
  image: { src: string; alt: string }
  imageCount: number
  verified: boolean
  owner: OwnerType
  sellerName: string
  publishedDays: number
  attributes: Record<string, string>
  highlights: string[]
  map: { x: number; y: number }
}

export interface FacetBucket {
  value: string
  label: string
  count: number
}

export interface ListingSearchResponse {
  items: ListingSummary[]
  total: number
  page: number
  pageCount: number
  facets: Record<string, FacetBucket[]>
  generatedAt: string
}

export interface ListingSearchRequest {
  state: ListingSearchState
  pageSize: number
  signal?: AbortSignal
}

export interface AiFilterProposal {
  confidence: number
  filters: Array<{
    key: string
    label: string
    value: string | number
    displayValue: string
  }>
}

const CATEGORY_PALETTES: Record<
  Exclude<PropertyCategory, 'all'>,
  [string, string]
> = {
  residential: ['#8b6d52', '#d5b99c'],
  land: ['#456f54', '#a7c59d'],
  commercial: ['#4c6578', '#a7bbc8'],
  building: ['#66586f', '#b9a9c1'],
  timeshare: ['#88753d', '#d2c48f'],
  touristic: ['#34727a', '#9ccbd0'],
}

interface Template {
  title: string
  category: Exclude<PropertyCategory, 'all'>
  transaction: TransactionType
  price: number
  area: number
  city: string
  district: string
  attributes: Record<string, string>
  highlights: string[]
}

const TEMPLATES: Template[] = [
  {
    title: 'Urla’da denize yakın, imarlı köşe parsel',
    category: 'land',
    transaction: 'sale',
    price: 4_250_000,
    area: 512,
    city: 'izmir',
    district: 'urla',
    attributes: {
      zoning: 'residential',
      deed: 'detached',
      road: 'frontage',
    },
    highlights: ['Konut imarlı', 'Müstakil tapu', 'Yola cepheli'],
  },
  {
    title: 'Gölbaşı’nda yatırımlık, ana yola cepheli tarla',
    category: 'land',
    transaction: 'sale',
    price: 1_850_000,
    area: 1240,
    city: 'ankara',
    district: 'gölbaşı',
    attributes: { zoning: 'field', deed: 'shared', road: 'frontage' },
    highlights: ['Tarla', 'Kadastro yolu', 'Yatırımlık'],
  },
  {
    title: 'Nilüfer’de yeni binada geniş balkonlu 3+1',
    category: 'residential',
    transaction: 'sale',
    price: 6_750_000,
    area: 156,
    city: 'bursa',
    district: 'nilüfer',
    attributes: { rooms: '3+1', heating: 'floor', age: '0-5' },
    highlights: ['3+1', 'Yerden ısıtma', 'Kapalı otopark'],
  },
  {
    title: 'Kadıköy merkezde eşyalı kiralık 2+1',
    category: 'residential',
    transaction: 'rent',
    price: 42_500,
    area: 105,
    city: 'istanbul',
    district: 'kadıköy',
    attributes: { rooms: '2+1', heating: 'natural-gas', furnished: 'yes' },
    highlights: ['2+1', 'Eşyalı', 'Metroya yakın'],
  },
  {
    title: 'Bayraklı’da plazada yüksek kat ofis',
    category: 'commercial',
    transaction: 'rent',
    price: 68_000,
    area: 180,
    city: 'izmir',
    district: 'bayraklı',
    attributes: { subtype: 'office', status: 'vacant', parking: 'yes' },
    highlights: ['A sınıfı plaza', 'Yüksek kat', 'Otopark'],
  },
  {
    title: 'Ataşehir’de cadde cepheli kiracılı dükkân',
    category: 'commercial',
    transaction: 'sale',
    price: 12_400_000,
    area: 145,
    city: 'istanbul',
    district: 'ataşehir',
    attributes: { subtype: 'shop', status: 'tenanted', frontage: 'street' },
    highlights: ['Kiracılı', 'Cadde cepheli', 'Yüksek kira getirisi'],
  },
  {
    title: 'Konak’ta komple satılık, yenilenmiş bina',
    category: 'building',
    transaction: 'sale',
    price: 28_500_000,
    area: 860,
    city: 'izmir',
    district: 'konak',
    attributes: { units: '8', floors: '5', occupancy: 'full' },
    highlights: ['8 bağımsız bölüm', '5 kat', 'Tam dolu'],
  },
  {
    title: 'Çankaya’da kurumsal kiracıya uygun bina',
    category: 'building',
    transaction: 'rent',
    price: 285_000,
    area: 1420,
    city: 'ankara',
    district: 'çankaya',
    attributes: { units: '12', floors: '6', occupancy: 'vacant' },
    highlights: ['12 bölüm', '6 kat', 'Kapalı otopark'],
  },
  {
    title: 'Bodrum’da yaz dönemli deniz manzaralı devremülk',
    category: 'timeshare',
    transaction: 'sale',
    price: 1_280_000,
    area: 72,
    city: 'muğla',
    district: 'bodrum',
    attributes: { period: 'summer', capacity: '4', facility: 'resort' },
    highlights: ['4 kişilik', 'Yaz dönemi', 'Özel plaj'],
  },
  {
    title: 'Afyon’da termal tesiste haftalık devremülk',
    category: 'timeshare',
    transaction: 'rent',
    price: 18_000,
    area: 58,
    city: 'afyonkarahisar',
    district: 'merkez',
    attributes: { period: 'winter', capacity: '3', facility: 'thermal' },
    highlights: ['Termal tesis', '3 kişilik', '7 gece'],
  },
  {
    title: 'Kaş’ta ruhsatlı butik otel',
    category: 'touristic',
    transaction: 'sale',
    price: 74_000_000,
    area: 2100,
    city: 'antalya',
    district: 'kaş',
    attributes: { subtype: 'boutique-hotel', rooms: '18', licensed: 'yes' },
    highlights: ['18 oda', 'Turizm ruhsatlı', 'Deniz manzarası'],
  },
  {
    title: 'Alaçatı’da sezonluk kiralık pansiyon',
    category: 'touristic',
    transaction: 'rent',
    price: 480_000,
    area: 680,
    city: 'izmir',
    district: 'çeşme',
    attributes: { subtype: 'pension', rooms: '10', licensed: 'yes' },
    highlights: ['10 oda', 'Sezonluk', 'Merkezi konum'],
  },
]

function placeholderImage(
  category: Exclude<PropertyCategory, 'all'>,
  label: string,
): string {
  const [from, to] = CATEGORY_PALETTES[category]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="720" height="480" fill="url(#g)"/><path d="M0 390 170 245l88 76 126-147 336 216v90H0Z" fill="rgba(255,255,255,.2)"/><circle cx="590" cy="95" r="42" fill="rgba(255,255,255,.3)"/><text x="42" y="438" fill="white" font-family="system-ui" font-size="28" font-weight="600">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const LISTING_FIXTURES: ListingSummary[] = TEMPLATES.flatMap(
  (template, templateIndex) =>
    Array.from({ length: 6 }, (_, variantIndex) => {
      const multiplier = 1 + variantIndex * 0.045
      const area = Math.round(template.area * (1 + variantIndex * 0.018))
      const price = Math.round(template.price * multiplier)
      const label = `${CATEGORY_LABELS[template.category]} · ${template.district}`
      return {
        id: `listing-${templateIndex + 1}-${variantIndex + 1}`,
        title:
          variantIndex === 0
            ? template.title
            : `${template.title} · ${variantIndex + 1}. portföy`,
        category: template.category,
        transaction: template.transaction,
        price,
        area,
        unitPrice: Math.round(price / area),
        city: template.city,
        district: template.district,
        image: {
          src: placeholderImage(template.category, label),
          alt: `${label} ilan görseli`,
        },
        imageCount: 8 + ((templateIndex + variantIndex) % 24),
        verified: variantIndex % 3 !== 2,
        owner: variantIndex % 4 === 0 ? 'owner' : 'agency',
        sellerName:
          variantIndex % 4 === 0
            ? 'Mülk sahibinden'
            : `${template.district} Emlak`,
        publishedDays: templateIndex + variantIndex + 1,
        attributes: template.attributes,
        highlights: template.highlights,
        map: {
          x: 0.08 + ((templateIndex * 17 + variantIndex * 9) % 84) / 100,
          y: 0.1 + ((templateIndex * 11 + variantIndex * 13) % 80) / 100,
        },
      }
    }),
)

function inRange(value: number, valueRange?: { min?: number; max?: number }) {
  return (
    (valueRange?.min === undefined || value >= valueRange.min) &&
    (valueRange?.max === undefined || value <= valueRange.max)
  )
}

function matchesState(item: ListingSummary, state: ListingSearchState) {
  const query = state.query.toLocaleLowerCase('tr-TR')
  const queryTarget =
    `${item.title} ${item.city} ${item.district}`.toLocaleLowerCase('tr-TR')
  if (query && !queryTarget.includes(query)) return false
  if (!state.transactions.includes(item.transaction)) return false
  if (state.category !== 'all' && item.category !== state.category) return false
  if (state.city && item.city !== state.city) return false
  if (state.district && item.district !== state.district) return false
  if (item.transaction === 'sale' && !inRange(item.price, state.salePrice))
    return false
  if (item.transaction === 'rent' && !inRange(item.price, state.rentPrice))
    return false
  if (!inRange(item.area, state.area)) return false
  if (!inRange(item.unitPrice, state.unitPrice)) return false
  if (state.verified && !item.verified) return false
  if (state.owners.length > 0 && !state.owners.includes(item.owner)) return false
  return Object.entries(state.categoryFilters).every(([key, values]) => {
    const actual = item.attributes[key]
    return !actual || values.length === 0 || values.includes(actual)
  })
}

function sortItems(items: ListingSummary[], state: ListingSearchState) {
  return [...items].sort((left, right) => {
    if (state.sort === 'newest')
      return left.publishedDays - right.publishedDays
    if (state.sort === 'price-asc') return left.price - right.price
    if (state.sort === 'price-desc') return right.price - left.price
    if (state.sort === 'unit-price') return left.unitPrice - right.unitPrice
    return (
      Number(right.verified) - Number(left.verified) ||
      left.publishedDays - right.publishedDays
    )
  })
}

function makeFacet(
  items: ListingSummary[],
  values: Array<{ value: string; label: string }>,
  select: (item: ListingSummary) => string | boolean,
): FacetBucket[] {
  return values.map(({ value, label }) => ({
    value,
    label,
    count: items.filter((item) => String(select(item)) === value).length,
  }))
}

function makeFacets(items: ListingSummary[]) {
  return {
    category: makeFacet(
      items,
      Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      (item) => item.category,
    ),
    transaction: makeFacet(
      items,
      [
        { value: 'sale', label: 'Satılık' },
        { value: 'rent', label: 'Kiralık' },
      ],
      (item) => item.transaction,
    ),
    owner: makeFacet(
      items,
      [
        { value: 'owner', label: 'Sahibinden' },
        { value: 'agency', label: 'Emlak ofisinden' },
      ],
      (item) => item.owner,
    ),
    verified: makeFacet(
      items,
      [{ value: 'true', label: 'Doğrulanmış' }],
      (item) => item.verified,
    ),
  }
}

export async function searchListings({
  state,
  pageSize,
  signal,
}: ListingSearchRequest): Promise<ListingSearchResponse> {
  signal?.throwIfAborted()
  const matched = sortItems(
    LISTING_FIXTURES.filter((item) => matchesState(item, state)),
    state,
  )
  const pageCount = Math.max(1, Math.ceil(matched.length / pageSize))
  const page = Math.min(state.page, pageCount)
  const start = (page - 1) * pageSize

  return {
    items: matched.slice(start, start + pageSize),
    total: matched.length,
    page,
    pageCount,
    facets: makeFacets(LISTING_FIXTURES),
    generatedAt: '2026-07-25T10:00:00.000Z',
  }
}

function TurkishMillions(match: RegExpMatchArray | null) {
  if (!match) return undefined
  return Math.round(Number(match[1].replace(',', '.')) * 1_000_000)
}

export async function parseNaturalLanguage(
  query: string,
): Promise<AiFilterProposal> {
  const normalized = query.toLocaleLowerCase('tr-TR')
  const filters: AiFilterProposal['filters'] = []
  if (normalized.includes('arsa')) {
    filters.push({
      key: 'category',
      label: 'Kategori',
      value: 'land',
      displayValue: 'Arsa',
    })
  }
  if (normalized.includes('izmir')) {
    filters.push({
      key: 'city',
      label: 'Şehir',
      value: 'izmir',
      displayValue: 'İzmir',
    })
  }
  if (normalized.includes('urla')) {
    filters.push({
      key: 'district',
      label: 'İlçe',
      value: 'urla',
      displayValue: 'Urla',
    })
  }
  const maxPrice = TurkishMillions(
    normalized.match(/(\d+(?:[.,]\d+)?)\s*milyon\s*altı/),
  )
  if (maxPrice !== undefined) {
    filters.push({
      key: 'salePriceMax',
      label: 'Azami fiyat',
      value: maxPrice,
      displayValue: `${new Intl.NumberFormat('tr-TR').format(maxPrice)} TL`,
    })
  }
  const area = normalized.match(/(\d+)\s*(?:metrekare|m²)/)
  if (area) {
    filters.push({
      key: 'areaMin',
      label: 'Asgari alan',
      value: Number(area[1]),
      displayValue: `${area[1]} m²`,
    })
  }
  if (normalized.includes('konut imarlı')) {
    filters.push({
      key: 'f_zoning',
      label: 'İmar',
      value: 'residential',
      displayValue: 'Konut imarlı',
    })
  }

  return {
    confidence: Math.min(96, 62 + filters.length * 6),
    filters,
  }
}

