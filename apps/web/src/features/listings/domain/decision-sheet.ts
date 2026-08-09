// Karar Yaprağı: mobil filtre çekmecesinin ÜST yüzeyi.
//
// Neden ayrı bir modül: çekmece eskiden kataloğun 12 bölümünü akordeon olarak
// üst üste diziyordu. Hepsi eşit ağırlıktaydı, hiçbiri açık değildi ve
// kullanıcı ilk anlamlı kontrole ulaşmadan dokuz satır kaydırıyordu. Burada
// yaprak YALNIZ kararı gerçekten değiştiren birkaç kriteri taşır; kalan
// katalog "Tüm filtreler" görünümüne devredilir (bkz. EmlakSearchView).
//
// Modül SAF tutulur: hangi kriterin sorulacağı (`decisionFields`), o kriterin
// şu anki değeri (`decisionValue`) ve seçimin duruma yazılması
// (`applyDecision`) React'tan bağımsız test edilir.
import { FACET_BY_KEY } from './filter-catalog'
import { facetApplies } from './filter-catalog-types'
import { CATEGORY_LABELS } from '../data/listing-attributes'
import {
  changeCategory,
  PROPERTY_CATEGORIES,
  type ListingSearchState,
  type PropertyCategory,
  type TransactionType,
} from './search-state'

/** "Farketmez" segmenti — hiçbir sınır yazılmadığı durumun görünür karşılığı. */
export const ANY = 'any'

export interface DecisionOption {
  /** Segment/çip kimliği */
  value: string
  label: string
  /**
   * Bu seçeneğin katalogda karşılık geldiği ham değerler. Oda sayısı gibi
   * uzun listeler yaprakta gruplanır: "4+" tek dokunuşla 4+1'den 6+ ve
   * üzerine kadar hepsini seçer.
   */
  values?: string[]
}

export type DecisionControl = 'category' | 'transaction' | 'range' | 'segment' | 'chips'

export interface DecisionField {
  /** Alan kimliği — testte ve React `key`'inde kullanılır */
  id: string
  label: string
  control: DecisionControl
  /** Başlığın sağındaki ikincil not */
  hint?: string
  /** `segment`/`chips` için katalog facet anahtarı */
  key?: string
  /**
   * Facet'in duruma nasıl yazıldığı.
   * - `select` → `categoryFilters[key]` (çoklu değer)
   * - `min`    → `categoryRanges[key].min` (en az N adet)
   */
  write?: 'select' | 'min'
  options?: DecisionOption[]
  /** `range` için hangi eksen okunur */
  axis?: 'price' | 'area'
  /** `range` fiyat ekseninde hangi işlem türünün tutarını sorduğu */
  transaction?: TransactionType
  /** Değer biçimlendirmede kullanılan birim */
  unit?: 'try' | 'm2'
}

const TRANSACTION_OPTIONS: DecisionOption[] = [
  { value: ANY, label: 'Hepsi' },
  { value: 'sale', label: 'Satılık' },
  { value: 'rent', label: 'Kiralık' },
]

/**
 * Emlak türü seçenekleri — etiketler veri sözlüğünden gelir, ikinci bir liste
 * tutulmaz.
 */
const CATEGORY_OPTIONS: DecisionOption[] = [
  { value: 'all', label: 'Hepsi' },
  ...PROPERTY_CATEGORIES.filter((category) => category !== 'all').map((category) => ({
    value: category,
    label: CATEGORY_LABELS[category as Exclude<PropertyCategory, 'all'>],
  })),
]

/**
 * Oda sayısı katalogda 11 seçenektir (1+0 … 6+ ve üzeri). Yaprakta beş
 * segmente indirilir: kullanıcı "3+1 mi 3+2 mi" ayrımını burada değil, tüm
 * filtrelerde yapar. Gruplar katalogdaki ham değerleri kapsar — daraltma
 * gerçek, yalnız soru kısa.
 */
const ROOM_GROUPS: DecisionOption[] = [
  { value: ANY, label: 'Hepsi', values: [] },
  { value: '1+1', label: '1+1', values: ['1+0', '1+1'] },
  { value: '2+1', label: '2+1', values: ['2+0', '2+1'] },
  { value: '3+1', label: '3+1', values: ['3+1', '3+2'] },
  { value: '4+', label: '4+', values: ['4+1', '4+2', '5+1', '5+2', '6+ ve üzeri'] },
]

/** Sayısal facet'ler (banyo…) "en az N" olarak sorulur. */
const COUNT_OPTIONS: DecisionOption[] = [
  { value: ANY, label: 'Hepsi' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
]

/**
 * Katalogda karşılığı olan ama yaprakta ÖZEL kontrolle çizilen kriterler.
 *
 * Oda sayısı katalogda 11 seçenektir; ham liste olarak çizildiğinde satır
 * kaplar ve tarama zorlaşır. Bunlar kendi bölümlerinin içinde, ham çip
 * listesi yerine segmentli kontrolle çizilir — kriter yerinden oynamaz,
 * yalnız gösterimi düzelir.
 */
export const CURATED_FACET_KEYS = ['rooms', 'bathrooms'] as const

/**
 * Alan ekseni `state.area` üzerinden histogramla sorulur; katalogdaki net m²
 * facet'i aynı soruyu ikinci kez sormasın diye akıştan düşülür.
 */
export const AREA_FACET_KEY = 'net-area'

/** Segment olarak çizilebilecek en fazla seçenek ("Hepsi" dahil beş hedef). */
const SEGMENT_LIMIT = 4

const TRY = new Intl.NumberFormat('tr-TR')

export function formatDecisionValue(field: DecisionField, value: number): string {
  return field.unit === 'm2' ? `${TRY.format(value)} m²` : `${TRY.format(value)} ₺`
}

/**
 * Katalog facet'inin yapraktaki özel kontrol karşılığı; kriter kategoriye
 * uymuyorsa `undefined`.
 */
export function curatedField(
  key: string,
  category: PropertyCategory,
): DecisionField | undefined {
  return facetField(key, category)
}

function facetField(key: string, category: PropertyCategory): DecisionField | undefined {
  const facet = FACET_BY_KEY.get(key)
  if (!facet || !facetApplies(facet, category)) return undefined

  if (facet.type === 'range') {
    return {
      id: key,
      key,
      label: facet.label,
      control: 'segment',
      write: 'min',
      options: COUNT_OPTIONS,
    }
  }

  const options: DecisionOption[] =
    key === 'rooms'
      ? ROOM_GROUPS
      : [
          { value: ANY, label: 'Hepsi', values: [] },
          ...(facet.options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
            values: [option.value],
          })),
        ]

  // Beş segmente sığmayan listeler çip olarak açılır: seçenek gizlemek yerine
  // sarmalayan bir satır çizilir (tapu 6, imar 8 seçenek).
  const overflow = options.length - 1 > SEGMENT_LIMIT
  return {
    id: key,
    key,
    label: facet.label,
    control: overflow ? 'chips' : 'segment',
    write: 'select',
    options: overflow ? options.slice(1) : options,
  }
}

/**
 * Yaprakta sorulacak kararlar.
 *
 * Sıra sabittir: işlem türü → tutar → kategoriye özgü kriterler.
 *
 * Tutar HER ZAMAN sorulur. Bir ara sürümde satılık/kiralık ikisi birden
 * seçiliyken alanın yerini metrekare alıyordu; sonuç, kullanıcının "Hepsi"ye
 * dokunduğu anda fiyat filtresinin ortadan kaybolması ve altındaki her şeyin
 * yer değiştirmesiydi. Yapraktaki bir alan, seçime göre BAŞKA bir alana
 * dönüşmez: yerinde kalır, yalnız etiketi ve ölçeği bağlama uyar.
 */
export function decisionFields(state: ListingSearchState): DecisionField[] {
  const single = state.transactions.length === 1 ? state.transactions[0] : undefined
  const fields: DecisionField[] = [
    {
      // Emlak türü kataloğun KAPISIDIR: "Tüm Emlak" görünümünde yalnız her
      // kategoride ortak olan kriterler anlamlıdır (4 grup / 14 kriter), tür
      // seçilince katalog açılır (konutta 11 grup / 44 kriter). Bu karar
      // yaprakta yoksa kullanıcı jenerik görünümde sıkışır ve filtrelerin
      // eksik olduğunu sanır.
      id: 'category',
      label: 'Emlak türü',
      control: 'category',
      options: CATEGORY_OPTIONS,
      hint:
        state.category === 'all'
          ? 'Tür seçince kategoriye özgü kriterler açılır'
          : undefined,
    },
    {
      id: 'transaction',
      label: 'İşlem türü',
      control: 'transaction',
      options: TRANSACTION_OPTIONS,
    },
    {
      id: 'price',
      label: single === 'rent' ? 'Aylık kira' : single === 'sale' ? 'Satılık fiyatı' : 'Fiyat',
      control: 'range',
      axis: 'price',
      // İşlem türü seçiliyse sınır yalnız o türe yazılır. İkisi de açıkken
      // eksen ilanların tamamının fiyatıdır ve sınır her iki türe birden
      // uygulanır — "şu tutar aralığındaki ilanlar" tek bir sorudur.
      transaction: single,
      unit: 'try',
      // İkisi birden açıkken dağılım çizilmez (satılık ile kiralık aynı ekseni
      // paylaşamaz); not, kullanıcıya grafiği nasıl açacağını söyler.
      hint: single ? undefined : 'Dağılım için satılık ya da kiralık seçin',
    },
  ]

  fields.push({
    id: 'area',
    label: 'Alan',
    control: 'range',
    axis: 'area',
    unit: 'm2',
    // "Tüm Emlak"ta daire ile arsa aynı m² ekseninde toplanır; dağılım
    // çizilmez (bkz. listingDistribution).
    hint: state.category === 'all' ? 'Dağılım için kategori seçin' : undefined,
  })

  return fields
}

/** Alanın şu anki değeri — segment/işlem için tek kimlik, çipler için liste. */
export function decisionValue(field: DecisionField, state: ListingSearchState): string {
  if (field.control === 'category') return state.category
  if (field.control === 'transaction') {
    return state.transactions.length === 1 ? state.transactions[0] : ANY
  }
  if (field.write === 'min') {
    const min = state.categoryRanges[field.key ?? '']?.min
    if (min === undefined) return ANY
    const capped = Math.min(min, 4)
    return String(capped)
  }
  const selected = state.categoryFilters[field.key ?? ''] ?? []
  if (selected.length === 0) return ANY
  const match = (field.options ?? []).find(
    (option) =>
      (option.values?.length ?? 0) === selected.length &&
      (option.values ?? []).every((value) => selected.includes(value)),
  )
  return match?.value ?? ANY
}

/** Çip düzeninde seçili ham değerler. */
export function decisionSelection(
  field: DecisionField,
  state: ListingSearchState,
): string[] {
  return state.categoryFilters[field.key ?? ''] ?? []
}

function withoutKey<T>(source: Record<string, T>, key: string): Record<string, T> {
  const next = { ...source }
  delete next[key]
  return next
}

/** Segment/işlem seçimini duruma yazar. Sayfa her değişimde başa döner. */
export function applyDecision(
  field: DecisionField,
  state: ListingSearchState,
  value: string,
): ListingSearchState {
  if (field.control === 'category') {
    // `changeCategory` kategoriye özgü seçimleri temizler: arsada seçili
    // "Isıtma" konut kategorisine taşınmamalı.
    return changeCategory(state, value as PropertyCategory)
  }
  if (field.control === 'transaction') {
    const transactions: TransactionType[] =
      value === ANY ? ['sale', 'rent'] : [value as TransactionType]
    // İşlem türü değişince ÖTEKİ tutar sınırı anlamını yitirir. Bırakılsaydı
    // kiralığa geçen kullanıcıyı görünmeyen bir satış fiyatı filtresi elerdi.
    return {
      ...state,
      transactions,
      salePrice: transactions.includes('sale') ? state.salePrice : undefined,
      rentPrice: transactions.includes('rent') ? state.rentPrice : undefined,
      page: 1,
    }
  }

  const key = field.key ?? ''
  if (field.write === 'min') {
    if (value === ANY) {
      return { ...state, categoryRanges: withoutKey(state.categoryRanges, key), page: 1 }
    }
    return {
      ...state,
      categoryRanges: { ...state.categoryRanges, [key]: { min: Number(value) } },
      page: 1,
    }
  }

  const option = (field.options ?? []).find((item) => item.value === value)
  const values = option?.values ?? []
  if (values.length === 0) {
    return { ...state, categoryFilters: withoutKey(state.categoryFilters, key), page: 1 }
  }
  return {
    ...state,
    categoryFilters: { ...state.categoryFilters, [key]: values },
    page: 1,
  }
}

/** Çip düzeninde tek bir değeri açıp kapatır. */
export function toggleDecision(
  field: DecisionField,
  state: ListingSearchState,
  value: string,
): ListingSearchState {
  const key = field.key ?? ''
  const current = state.categoryFilters[key] ?? []
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
  if (next.length === 0) {
    return { ...state, categoryFilters: withoutKey(state.categoryFilters, key), page: 1 }
  }
  return { ...state, categoryFilters: { ...state.categoryFilters, [key]: next }, page: 1 }
}

/**
 * Aralık seçimini duruma yazar. Kullanıcı iki kolu da uçlara bıraktığında
 * sınır SİLİNİR: "tüm aralık" bir filtre değildir ve çip olarak görünmemeli.
 */
export function applyDecisionRange(
  field: DecisionField,
  state: ListingSearchState,
  [min, max]: [number, number],
  bounds: { min: number; max: number },
): ListingSearchState {
  const range =
    min <= bounds.min && max >= bounds.max ? undefined : { min, max }
  if (field.axis === 'area') return { ...state, area: range, page: 1 }
  if (field.transaction === 'rent') return { ...state, rentPrice: range, page: 1 }
  if (field.transaction === 'sale') return { ...state, salePrice: range, page: 1 }
  // İşlem türü seçilmemişken tek bir tutar sorusu her iki türe de uygulanır;
  // aksi halde kullanıcı sınırı çeker ama kiralıklar hiç elenmezdi.
  return { ...state, salePrice: range, rentPrice: range, page: 1 }
}

/** Bir aralık alanının duruma karşılık gelen sınırı. */
function rangeOf(field: DecisionField, state: ListingSearchState) {
  if (field.axis === 'area') return state.area
  if (field.transaction === 'rent') return state.rentPrice
  if (field.transaction === 'sale') return state.salePrice
  return state.salePrice ?? state.rentPrice
}

/** Aralık alanının şu anki değeri; sınır yoksa eksenin uçlarına oturur. */
export function decisionRange(
  field: DecisionField,
  state: ListingSearchState,
  bounds: { min: number; max: number },
): [number, number] {
  const range = rangeOf(field, state)
  return [range?.min ?? bounds.min, range?.max ?? bounds.max]
}

/** Yaprakta kaç kararın gerçekten verildiği — başlıktaki rozet bunu sayar. */
export function decisionActiveCount(state: ListingSearchState): number {
  return decisionFields(state).reduce((total, field) => {
    if (field.control === 'range') {
      return total + (rangeOf(field, state) ? 1 : 0)
    }
    if (field.control === 'category') return total + (state.category !== 'all' ? 1 : 0)
    if (field.control === 'transaction') {
      return total + (state.transactions.length === 1 ? 1 : 0)
    }
    if (field.write === 'min') {
      return total + (state.categoryRanges[field.key ?? ''] ? 1 : 0)
    }
    return total + ((state.categoryFilters[field.key ?? ''] ?? []).length > 0 ? 1 : 0)
  }, 0)
}
