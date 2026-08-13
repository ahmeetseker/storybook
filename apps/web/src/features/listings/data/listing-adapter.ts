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
  /**
   * Mahalle — aramanın en ince coğrafi kırılımı. İl/ilçe çoğu kez fazla geniş:
   * aynı ilçede fiyat iki katına çıkabildiği için kullanıcı mahalle düzeyinde
   * daraltmak ister (araştırmada 7 ayrı kaynakta ayrı bir kriter olarak geçti).
   */
  neighbourhood: string
  image: { src: string; alt: string }
  imageCount: number
  verified: boolean
  /** Vitrin (öne çıkan) ilan — ana sayfa vitrin kartının `featured=1` filtresi bunu süzer. */
  featured: boolean
  owner: OwnerType
  sellerName: string
  publishedDays: number
  attributes: Record<string, string>
  highlights: string[]
  /** Şematik harita yüzeyi için 0-1 normalize konum (zemin yüklenemezse kullanılır) */
  map: { x: number; y: number }
  /**
   * Gerçek coğrafi konum. Harita yoğunluk rozetlerini bu koordinatlardan
   * kümeler; şematik `map.x/y` ile karıştırılmamalıdır — o yalnız zeminsiz
   * gerileme görünümü içindir.
   */
  coordinates: { lat: number; lng: number }
  /**
   * Filtre kataloğundaki ÇOKLU SEÇİM ve EVET/HAYIR facet'lerinin değerleri.
   * `attributes` ilan detayında gösterilen beyan satırlarıdır ve tek değerlidir;
   * burada bir ilan aynı facet'in birden çok değerini taşıyabilir (ör. iç
   * özellikler: ankastre + şömine). İkisini ayırmak, detay sayfasındaki beyan
   * künyesini filtreleme ihtiyacına göre bozmamak içindir.
   */
  facets: Record<string, string[]>
  /**
   * Filtre kataloğundaki SAYISAL ARALIK facet'lerinin değerleri (bina yaşı,
   * banyo sayısı, aidat…). Aralık filtresi bu sözlükten okunur.
   */
  metrics: Record<string, number>
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

/**
 * Kategori zeminli yer tutucu görsel (data URI).
 *
 * Fotoğraf yüklenemediğinde gösterilecek gerileme karesi tek yerden gelir:
 * arama kartı, karşılaştırma ve ilan detayı aynı kareyi kullanır.
 */
export function placeholderImage(
  category: Exclude<PropertyCategory, 'all'>,
  label: string,
): string {
  const [from, to] = CATEGORY_PALETTES[category]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="720" height="480" fill="url(#g)"/><path d="M0 390 170 245l88 76 126-147 336 216v90H0Z" fill="rgba(255,255,255,.2)"/><circle cx="590" cy="95" r="42" fill="rgba(255,255,255,.3)"/><text x="42" y="438" fill="white" font-family="system-ui" font-size="28" font-weight="600">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * İlçe merkezlerinin yaklaşık koordinatları. Harita yoğunluk rozetleri gerçek
 * coğrafyadan kümelenir: aynı ilçedeki ilanlar uzaktan tek rozette toplanır,
 * yaklaşıldıkça ayrışır. Değerler ilçe merkezidir — parselin tam konumu
 * değildir (mahremiyet; bkz. ListingLocationSection).
 */
const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'istanbul/kadıköy': [40.99, 29.03],
  'istanbul/ataşehir': [40.984, 29.107],
  'izmir/urla': [38.323, 26.765],
  'izmir/bayraklı': [38.462, 27.171],
  'izmir/konak': [38.418, 27.128],
  'izmir/çeşme': [38.324, 26.305],
  'ankara/çankaya': [39.905, 32.854],
  'ankara/gölbaşı': [39.79, 32.809],
  'bursa/nilüfer': [40.213, 28.937],
  'muğla/bodrum': [37.035, 27.43],
  'antalya/kaş': [36.202, 29.639],
  'afyonkarahisar/merkez': [38.757, 30.539],
}

/** Türkiye'nin kabaca merkezi — sözlükte olmayan ilçe için son çare. */
const FALLBACK_COORDINATES: [number, number] = [39.0, 35.3]

/**
 * Aynı ilçedeki varyantlar tam olarak üst üste binmesin diye koordinat
 * deterministik bir desenle azıcık dağıtılır (Math.random YASAK: aynı ilan
 * her yüklemede aynı yerde durmalı). Kayma ~1 km ölçeğindedir; ilçe kimliği
 * korunur, rozet sayıları doğru kalır.
 */
function spreadCoordinates(
  city: string,
  district: string,
  index: number,
): { lat: number; lng: number } {
  const base = DISTRICT_COORDINATES[`${city}/${district}`] ?? FALLBACK_COORDINATES
  // Altın oranlı açı adımı: ardışık indeksler birbirine en uzak açılara düşer.
  const angle = index * 2.39996
  const radius = 0.006 * Math.sqrt(index)
  return {
    lat: base[0] + radius * Math.cos(angle),
    lng: base[1] + radius * Math.sin(angle),
  }
}

/**
 * Facet ve metrik üretimi.
 *
 * Filtre paneli ancak filtrelediği veri varsa dürüsttür: kriter gösterip
 * sonucu daraltmamak yalancı bir kontroldür. Sabit kurgu kaydı bu yüzden
 * katalogdaki her facet için değer taşır. Üretim DETERMİNİSTİKTİR
 * (Math.random YASAK): aynı ilan her yüklemede aynı özelliklere sahiptir,
 * aksi halde kullanıcı filtreyi uygulayıp geri döndüğünde sonuç değişirdi.
 *
 * Değerler indeksten türetilen sabit bir desenden seçilir; gerçek servis
 * bağlandığında bu fonksiyonun yerini API cevabı alır, `ListingSummary`
 * sözleşmesi değişmez.
 */
function pick<T>(values: readonly T[], seed: number): T {
  return values[seed % values.length]
}

/** `seed`'e göre listeden 0-2 arası öğe seçer — çoklu seçim facet'leri için. */
function pickSome(values: readonly string[], seed: number, count: number): string[] {
  const chosen: string[] = []
  for (let i = 0; i < count; i++) {
    const value = values[(seed + i * 3) % values.length]
    if (!chosen.includes(value)) chosen.push(value)
  }
  return chosen
}

/** Oda sayısı gösterimi — TR pazarının kendi biçimi (salon + oda). */
const ROOM_VALUES = ['1+0', '1+1', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1'] as const

/**
 * Mahalle adları. Türkiye genelinde yaygın mahalle adlarından deterministik
 * olarak seçilir — kurgu kayıt için gerçekçi, uydurma bir yer adı üretmez.
 */
const NEIGHBOURHOODS = [
  'merkez',
  'cumhuriyet',
  'atatürk',
  'yeni',
  'bahçelievler',
  'fatih',
  'yeşilyurt',
  'çamlık',
] as const

function neighbourhoodFor(district: string, seed: number): string {
  return NEIGHBOURHOODS[(seed + district.length) % NEIGHBOURHOODS.length]
}

/** Bina yaşı tek yerden türetilir: hem metrik hem deprem yönetmeliği bunu okur. */
function buildingAgeFor(seed: number): number {
  return (seed * 3) % 41
}

function roomsFor(seed: number): string {
  return ROOM_VALUES[seed % ROOM_VALUES.length]
}

const BUILT_CATEGORIES = new Set(['residential', 'commercial', 'building', 'timeshare', 'touristic'])

function buildFacets(
  template: (typeof TEMPLATES)[number],
  seed: number,
  rooms: string,
  buildingAge: number,
): Record<string, string[]> {
  const facets: Record<string, string[]> = {}
  const built = BUILT_CATEGORIES.has(template.category)
  const isLand = template.category === 'land'

  // Her kategoride anlamlı olanlar
  facets.deed = [pick(['condominium', 'easement', 'detached', 'shared'], seed)]
  facets.view = pickSome(['sea', 'nature', 'city', 'lake', 'pool'], seed, 1 + (seed % 2))
  facets['listing-age'] = [pick(['today', '3d', '7d', '30d'], seed)]
  if (seed % 3 !== 0) facets['has-photo'] = ['1']
  if (seed % 5 === 0) facets['has-video'] = ['1']
  if (seed % 4 === 1) facets['has-virtual-tour'] = ['1']
  // Yabancı alıcı için belirleyici: TR'de vatandaşlık eşiği fiyata bağlıdır,
  // bu yüzden yüksek bedelli ilanlarda işaretlenir.
  if (seed % 5 !== 4) facets['citizenship-eligible'] = ['1']
  if (seed % 4 !== 3) facets['credit-eligible'] = ['1']
  if (seed % 6 === 0) facets.exchange = ['1']
  if (seed % 7 === 0) facets['price-reduced'] = ['1']
  facets.neighbourhood = pickSome(['school', 'hospital', 'market', 'mall', 'seaside', 'park'], seed, 2)
  facets.transport = pickSome(['metro', 'metrobus', 'bus', 'minibus', 'train', 'highway'], seed, 2)

  if (built) {
    facets.heating = [
      pick(['natural-gas', 'central', 'central-share', 'floor-heating', 'air-conditioning', 'stove'], seed),
    ]
    facets.parking = [pick(['closed', 'open', 'garage', 'none'], seed)]
    facets.furnished = [pick(['yes', 'no', 'partly'], seed)]
    facets['usage-status'] = [pick(['empty', 'owner', 'tenant'], seed)]
    facets['structure-type'] = [pick(['reinforced-concrete', 'steel', 'masonry', 'prefabricated'], seed)]
    // Deprem yönetmeliği bina yaşıyla TUTARLI üretilir: 2018 sonrası bir bina
    // 30 yaşında olamaz. Tutarsız kurgu veri, filtreyi test ederken yanlış
    // güven verirdi.
    facets['earthquake-code'] = [
      buildingAge <= 8 ? 'post-2018' : buildingAge <= 26 ? '2000-2018' : 'pre-2000',
    ]
    facets['rent-period'] =
      template.transaction === 'rent'
        ? [pick(['monthly', 'weekly', 'daily', 'seasonal'], seed)]
        : ['monthly']
    facets['available-from'] = [pick(['now', '1m', '3m'], seed)]
    facets.facade = pickSome(['north', 'south', 'east', 'west'], seed, 1 + (seed % 2))
    facets['interior-features'] = pickSome(
      ['built-in', 'fitted-kitchen', 'dressing-room', 'ensuite', 'fireplace', 'steel-door', 'laminate', 'pvc-window'],
      seed,
      2,
    )
    facets['exterior-features'] = pickSome(
      ['pool', 'gym', 'security', 'generator', 'playground', 'garden', 'car-park', 'thermal-insulation'],
      seed,
      2,
    )
    if (seed % 2 === 0) facets.elevator = ['1']
    if (seed % 3 === 0) facets['in-complex'] = ['1']
    if (seed % 4 === 0) facets.accessible = ['1']
    if (seed % 5 === 1) facets['habitation-certificate'] = ['1']
  }

  if (template.category === 'residential' || template.category === 'timeshare') {
    facets.rooms = [rooms]
    facets['housing-type'] = [
      pick(['apartment', 'residence', 'detached-house', 'villa', 'summer-house', 'duplex', 'loft'], seed),
    ]
    facets.kitchen = [pick(['american', 'closed', 'open'], seed)]
    if (seed % 3 !== 2) facets.balcony = ['1']
  }
  if (template.category === 'residential') {
    if (seed % 4 === 1) facets['pets-allowed'] = ['1']
    if (seed % 4 === 2) facets['students-allowed'] = ['1']
  }
  if (template.category === 'residential' || template.category === 'commercial' || template.category === 'timeshare') {
    facets['floor-located'] = [
      pick(['basement', 'garden-floor', 'ground', 'low-rise', 'mid-rise', 'high-rise', 'penthouse'], seed),
    ]
  }

  if (template.category === 'commercial') {
    facets['commercial-type'] = [
      pick(['office', 'shop', 'depot', 'factory', 'workshop', 'plaza-floor'], seed),
    ]
  }
  if (template.category === 'timeshare') {
    facets['timeshare-period'] = [pick(['summer', 'winter', 'spring', 'autumn', 'fixed-week'], seed)]
  }

  if (isLand || template.category === 'building') {
    facets.zoning = [
      pick(['residential', 'commercial', 'tourism', 'industrial', 'agricultural', 'vineyard'], seed),
    ]
  }
  if (isLand) {
    facets.infrastructure = pickSome(
      ['electricity', 'water', 'natural-gas', 'sewage', 'road', 'telephone'],
      seed,
      2 + (seed % 3),
    )
  }

  return facets
}

function buildMetrics(
  template: (typeof TEMPLATES)[number],
  seed: number,
  area: number,
  unitPrice: number,
  price: number,
): Record<string, number> {
  const metrics: Record<string, number> = { 'price-per-sqm': unitPrice }
  // Denize uzaklık her kategoride anlamlı; kıyı ilanlarında küçük değer üretir.
  metrics['distance-to-sea'] = 120 + ((seed * 613) % 24000)
  const built = BUILT_CATEGORIES.has(template.category)

  if (built) {
    // Net alan brütün altındadır — beyanlar arasındaki bu fark gerçek pazarda
    // da kritiktir, filtre onu ayırt edebilmelidir.
    metrics['net-area'] = Math.round(area * 0.85)
    metrics['building-age'] = buildingAgeFor(seed)
    metrics['living-rooms'] = 1 + (seed % 2)
    metrics['ceiling-height'] = Number((2.6 + ((seed % 8) * 0.35)).toFixed(2))
    metrics['unit-count'] = 2 + ((seed * 3) % 40)
    metrics.bathrooms = 1 + (seed % 3)
    metrics['floor-count'] = 2 + (seed % 12)
    metrics.dues = 250 + ((seed * 137) % 4000)
    if (template.transaction === 'rent') metrics.deposit = price * (1 + (seed % 2))
    if (seed % 3 === 0) metrics['open-area'] = 15 + ((seed * 7) % 120)
  }
  if (template.category === 'land' || template.category === 'building' || template.category === 'touristic') {
    metrics['land-area'] = template.category === 'land' ? area : area * (2 + (seed % 3))
  }
  if (template.category === 'land') {
    // KAKS iki ondalıklı taşınır; aralık filtresi ondalık eşiklerle çalışır.
    metrics['floor-area-ratio'] = Number((0.3 + ((seed % 12) * 0.15)).toFixed(2))
    metrics['road-width'] = 5 + ((seed * 2) % 20)
    metrics['building-height-limit'] = 6.5 + ((seed % 6) * 3)
  }
  return metrics
}

/**
 * Şablon başına kaç ilan türetildiği.
 *
 * Altı varyant, bir kategoriyi iki dar fiyat kümesine sıkıştırıyordu: filtre
 * yaprağındaki dağılım histogramı gerçek bir dağılım değil iki kule çiziyordu,
 * bu yüzden de hiç çizilmiyordu (bkz. `DISTRIBUTION_MIN_SAMPLE`). Portföy
 * derinliği bir pazar yerinin kendi kayıtlarından gelir; mock veri de o
 * yoğunluğu taşımazsa dağılıma dayanan hiçbir yüzey denenemez.
 */
const VARIANTS_PER_TEMPLATE = 24

/** Deterministik sözde-rastgele [0,1) — tohum aynıysa kayıt her yüklemede aynı. */
function noise(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Şablon değerinin etrafındaki yayılım. İki bağımsız üniform değerin
 * ortalaması üçgen dağılım verir: uçlar seyrek, orta yoğun — gerçek bir
 * portföyün fiyat/alan dağılımı da böyle okunur. Düz üniform yayılım
 * histogramda dümdüz bir plato çizerdi.
 */
function spread(seed: number, low: number, high: number): number {
  const shape = (noise(seed) + noise(seed * 7 + 13)) / 2
  return low + shape * (high - low)
}

/** Tutarı büyüklük mertebesine göre okunur bir basamağa yuvarlar. */
function tidyPrice(value: number): number {
  const step = value >= 1_000_000 ? 50_000 : value >= 100_000 ? 5_000 : 500
  return Math.max(step, Math.round(value / step) * step)
}

/**
 * Harita pini için kısaltılmış fiyat. Kapsül zemini kapatmasın diye tam tutar
 * değil büyüklük mertebesi yazılır; tam tutarı popup ve ilan kartı taşır.
 * Milyonun altındaki satışlar da "B" (bin) ile okunur — aksi halde 850.000 TL
 * "0,9M" olarak yuvarlanıp yanıltıcı hale geliyordu. Arama haritası ve bölge
 * kartlarının harita yüzü aynı kapsül dilini buradan okur.
 */
export function compactPrice(value: number, transaction: TransactionType): string {
  const suffix = transaction === 'rent' ? '/ay' : ''
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    // 10M üstünde ondalık gürültüdür; altında tek hane ayırt edici.
    const text = millions >= 10 ? String(Math.round(millions)) : millions.toFixed(1).replace('.', ',')
    return `₺${text}M${suffix}`
  }
  return `₺${Math.round(value / 1000)}B${suffix}`
}

export const LISTING_FIXTURES: ListingSummary[] = TEMPLATES.flatMap(
  (template, templateIndex) =>
    Array.from({ length: VARIANTS_PER_TEMPLATE }, (_, variantIndex) => {
      // Tek tohum: aynı ilanın tüm türetilmiş özellikleri bundan çıkar, böylece
      // kayıt her yüklemede aynı kalır.
      const seed = templateIndex * VARIANTS_PER_TEMPLATE + variantIndex
      const area = Math.round(template.area * spread(seed * 3 + 5, 0.6, 1.7))
      const price = tidyPrice(template.price * spread(seed, 0.55, 1.9))
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
        neighbourhood: neighbourhoodFor(template.district, seed),
        image: {
          src: placeholderImage(template.category, label),
          alt: `${label} ilan görseli`,
        },
        imageCount: 8 + ((templateIndex + variantIndex) % 24),
        verified: variantIndex % 3 !== 2,
        // Vitrin küçük bir seçkidir: ~%8'lik deterministik alt küme.
        featured: seed % 12 === 0,
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
        coordinates: spreadCoordinates(
          template.city,
          template.district,
          templateIndex * 6 + variantIndex,
        ),
        facets: buildFacets(template, seed, roomsFor(seed), buildingAgeFor(seed)),
        metrics: buildMetrics(template, seed, area, Math.round(price / area), price),
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
  if (state.neighbourhood && item.neighbourhood !== state.neighbourhood) return false
  if (state.mapArea) {
    const [[south, west], [north, east]] = state.mapArea
    const { lat, lng } = item.coordinates
    if (lat < south || lat > north || lng < west || lng > east) return false
  }
  if (item.transaction === 'sale' && !inRange(item.price, state.salePrice))
    return false
  if (item.transaction === 'rent' && !inRange(item.price, state.rentPrice))
    return false
  if (!inRange(item.area, state.area)) return false
  if (!inRange(item.unitPrice, state.unitPrice)) return false
  if (state.verified && !item.verified) return false
  if (state.featured && !item.featured) return false
  if (state.owners.length > 0 && !state.owners.includes(item.owner)) return false
  // Katalog filtreleri: seçilen değerlerden EN AZ BİRİ ilanda bulunmalı (OR).
  // Eskiden özelliği hiç taşımayan ilan da geçiyordu (`!actual || …`); bu,
  // seçilen kriterin sonucu daraltmaması demekti — panelde işaretli duran
  // filtre hiçbir şey yapmıyordu. Veri yoksa ilan artık ELENİR.
  const facetsPass = Object.entries(state.categoryFilters).every(([key, values]) => {
    if (values.length === 0) return true
    const actual = item.facets[key]
    if (!actual || actual.length === 0) return false
    return values.some((value) => actual.includes(value))
  })
  if (!facetsPass) return false

  // Sayısal aralık filtreleri aynı kuralı izler: ölçüsü olmayan ilan elenir.
  return Object.entries(state.categoryRanges).every(([key, bounds]) => {
    if (bounds.min === undefined && bounds.max === undefined) return true
    const actual = item.metrics[key]
    if (actual === undefined) return false
    return inRange(actual, bounds)
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

/**
 * Verilen duruma kaç ilan düştüğü — SAYFALAMASIZ, eşzamanlı.
 *
 * Karar yaprağının alt eylemi ("128 ilanı göster") her dokunuşta güncellenir;
 * bunun için taslak durumun sonucu ağ turu beklemeden bilinmelidir. Kullanıcı
 * paneli kapatmadan seçiminin sonucu daralttığını görür, boş sonuca gitmez.
 */
export function countListings(state: ListingSearchState): number {
  return LISTING_FIXTURES.filter((item) => matchesState(item, state)).length
}

export interface ListingDistribution {
  /** Skalanın sol ucu — yuvarlanmış */
  min: number
  /** Skalanın sağ ucu — yuvarlanmış */
  max: number
  /** Soldan sağa eşit genişlikteki bantların ilan sayısı */
  bins: number[]
}

/** Ölçek ucunu okunur bir basamağa yuvarlar (3.180 → 3.000 / 118.400 → 120.000). */
function roundEdge(value: number, direction: 'down' | 'up', step: number) {
  const rounded =
    direction === 'down'
      ? Math.floor(value / step) * step
      : Math.ceil(value / step) * step
  return rounded
}

/**
 * Histogramın anlamlı olması için gereken en az gözlem sayısı.
 *
 * Bu sayının altında sütunlar dağılımı DEĞİL, tek tek ilanları çizer: on iki
 * ilandan çıkan altı kuleli grafik, olmayan bir yoğunluğu varmış gibi okutur.
 */
const DISTRIBUTION_MIN_SAMPLE = 16

/**
 * Bir eksenin (fiyat veya alan) dağılımı — histogramın kaynağı.
 *
 * Dağılım PAZARIN kesitidir, kullanıcının o anki seçiminin değil: yalnız
 * işlem türü, kategori ve konum uygulanır. Kriter filtreleri de uygulansaydı
 * kullanıcı daralttıkça histogram çöker, ölçek her dokunuşta yerinden oynar ve
 * "bütçem piyasada nereye düşüyor" sorusu cevapsız kalırdı.
 *
 * Gözlem azsa (`DISTRIBUTION_MIN_SAMPLE`) sütun ÇİZİLMEZ: altı ilandan
 * uydurulmuş bir dağılım, olmayan bir yoğunluk varmış gibi okunur. Ölçek yine
 * döner, kullanıcı aralığı sütunsuz rayda seçer.
 */
export function listingDistribution(
  state: ListingSearchState,
  axis: 'price' | 'area',
): ListingDistribution {
  const market: ListingSearchState = {
    ...state,
    query: '',
    salePrice: undefined,
    rentPrice: undefined,
    area: undefined,
    unitPrice: undefined,
    mapArea: undefined,
    verified: false,
    featured: false,
    owners: [],
    categoryFilters: {},
    categoryRanges: {},
  }
  const values = LISTING_FIXTURES.filter((item) => matchesState(item, market)).map(
    (item) => (axis === 'price' ? item.price : item.area),
  )

  if (values.length === 0) return { min: 0, max: 0, bins: [] }
  // Sütun sayısı gözleme uyar ama 16'nın altına inmez: az sayıda kalın sütun
  // dağılım değil, sütun grafiği gibi okunur.
  const binCount = Math.min(28, Math.max(16, Math.round(values.length / 3)))

  const lowest = Math.min(...values)
  const highest = Math.max(...values)
  const span = Math.max(highest - lowest, 1)
  // Adım, aralığın büyüklük mertebesinden türer: kirada binler, satışta
  // yüz binler okunur uçlar üretir.
  const step = 10 ** Math.max(0, Math.floor(Math.log10(span)) - 1)
  // Alt uç sıfıra çökmemeli: 50 m²'lik en küçük ilanı "0 m²" diye etiketlemek
  // ölçeğin başında var olmayan bir aralık gösterir. Sıfıra düşerse adım,
  // pozitif bir uç verene kadar incelir.
  let min = roundEdge(lowest, 'down', step)
  let fineStep = step
  while (min === 0 && lowest > 0 && fineStep > 1) {
    fineStep = Math.max(1, fineStep / 10)
    min = roundEdge(lowest, 'down', fineStep)
  }
  const max = Math.max(roundEdge(highest, 'up', step), min + step)

  if (values.length < DISTRIBUTION_MIN_SAMPLE) return { min, max, bins: [] }

  // Karışık popülasyon histogram çizdirmez. Satılık ile kiralık tek bir fiyat
  // ekseninde toplanamaz (biri on milyonlar, diğeri binler); daire ile arsa da
  // tek bir m² ekseninde toplanamaz (50 m² ile 3.300 m²). İkisinde de sütunlar
  // bütün bir grubu en sola yığıp geri kalanı düzleştirir — dağılım gibi
  // görünen ama hiçbir şey anlatmayan bir grafik. Ölçek yine döner (ray
  // çalışır), sütun çizilmez; kullanıcı kesiti daraltınca grafik açılır.
  const mixed =
    axis === 'price' ? state.transactions.length !== 1 : state.category === 'all'
  if (mixed) return { min, max, bins: [] }

  const bins = Array.from({ length: binCount }, () => 0)
  const width = (max - min) / binCount
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.floor((value - min) / width))
    bins[index] += 1
  }

  return { min, max, bins }
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

