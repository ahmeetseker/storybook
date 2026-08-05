// Filtre kataloğunun SÖZLEŞMESİ.
//
// Filtreler tek tek JSX olarak yazılmaz: bir veri kataloğundan render edilir.
// Nedeni yalnız kısalık değil — üç yerin (kenar çubuğu, "Tüm Seçenekler"
// modalı, URL çözümleme/uygulama) aynı listeden beslenmesi. Filtre elle
// yazıldığında bu üç yer kaçınılmaz olarak birbirinden ayrılıyor ve panelde
// görünen bir kriter sonucu daraltmıyordu (yalancı kontrol).
import type { PropertyCategory } from './search-state'

/** Katalogda kategori "all" yoktur: bir facet hangi gerçek kategorilerde anlamlıysa onları listeler. */
export type FilterCategory = Exclude<PropertyCategory, 'all'>

/**
 * Facet'in kullanıcıya sorduğu soru tipi.
 * - `range`  → sayısal aralık (min/max). `state.categoryRanges` içinde yaşar.
 * - `select` → çoklu seçim; tek seçim gerekiyorsa `single: true`.
 * - `boolean`→ tek kutu; seçiliyse `state.categoryFilters[key] = ['1']`.
 */
export type FilterFacetType = 'range' | 'select' | 'boolean'

export interface FilterOption {
  /** Veri tarafındaki değer — ilan `attributes` sözlüğüyle eşleşir */
  value: string
  label: string
}

export interface FilterFacet {
  /** Teknik anahtar; URL'de `f_<key>` / `r_<key>Min` olarak görünür */
  key: string
  label: string
  type: FilterFacetType
  /** Sayısal aralıkta girişin yanında gösterilen birim (m², yıl, TL…) */
  unit?: string
  /** `select` için seçenekler */
  options?: FilterOption[]
  /** Yalnız bir seçenek seçilebilir (ör. "Kimden") */
  single?: boolean
  /**
   * Bu facet hangi kategorilerde anlamlı? Boş bırakılmaz: "Oda Sayısı" arsada,
   * "İmar Durumu" konutta görünmemeli — yanlış kategoride gösterilen bir filtre
   * her zaman sıfır sonuç üretir ve kullanıcıyı çıkmaza sokar.
   */
  categories: FilterCategory[]
  /**
   * `core` → dar kenar çubuğunda da görünür (herkesin kullandığı kriter).
   * `common`/`niche` → yalnız "Tüm Seçenekler" modalında.
   */
  importance: 'core' | 'common' | 'niche'
  /** Kaç ayrı kaynakta gözlendi — sıralama ve budama kararının kaydı */
  frequency?: number
}

export interface FilterSectionDef {
  id: string
  title: string
  facets: FilterFacet[]
}

/** Bir facet verilen kategoride gösterilmeli mi? */
export function facetApplies(facet: FilterFacet, category: PropertyCategory): boolean {
  // "Tüm kategoriler" görünümünde yalnız her kategoride ortak olan facet'ler
  // anlamlıdır; kategoriye özgü olanlar kullanıcı kategori seçince açılır.
  if (category === 'all') return facet.categories.length >= ALL_CATEGORY_COUNT
  return facet.categories.includes(category as FilterCategory)
}

export const ALL_FILTER_CATEGORIES: FilterCategory[] = [
  'residential',
  'land',
  'commercial',
  'building',
  'timeshare',
  'touristic',
]

const ALL_CATEGORY_COUNT = ALL_FILTER_CATEGORIES.length

/** Bir bölümün verilen kategoride görünen facet'leri; hiçbiri yoksa bölüm çizilmez. */
export function sectionFacets(
  section: FilterSectionDef,
  category: PropertyCategory,
): FilterFacet[] {
  return section.facets.filter((facet) => facetApplies(facet, category))
}
