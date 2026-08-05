// Emlak arama filtrelerinin TEK kaynağı.
//
// Kaynak: sahibinden.com "Tüm Seçenekler" modalının bölüm listesi (kullanıcı
// ekran görüntüleri) + 50 paralel ajanla taranan TR/uluslararası portallardan
// (hepsiemlak, emlakjet, zingat, hürriyetemlak, zillow, rightmove, idealista,
// immoscout24, funda, realestate.com.au …) çıkarılan facet frekansları.
//
// Bölümleme sahibinden'in düz listesinden bilerek AYRILIR: orada 30+ kriter tek
// bir kolonda alt alta duruyor ve kullanıcı aradığını taramak zorunda kalıyor.
// Burada kriterler kullanıcının sorduğu soruya göre gruplanır ("ne kadar?",
// "ne kadar büyük?", "kaç oda?", "hangi bina?"…).
//
// `importance` bir görünürlük eksenidir, önem sırası değil: `core` olanlar dar
// kenar çubuğuna sığacak kadar az tutulur, gerisi "Tüm Seçenekler" modalında
// yaşar. Bir facet'i core yapmak onu herkesin ekranına koymak demektir.
import type { FilterSectionDef } from './filter-catalog-types'

/** Oda sayısı — TR pazarının kendi gösterimi (salon + oda). */
const ROOM_OPTIONS = [
  '1+0',
  '1+1',
  '2+0',
  '2+1',
  '3+1',
  '3+2',
  '4+1',
  '4+2',
  '5+1',
  '5+2',
  '6+ ve üzeri',
].map((value) => ({ value, label: value === '1+0' ? '1+0 (Stüdyo)' : value }))

const HEATING_OPTIONS = [
  ['natural-gas', 'Doğalgaz (kombi)'],
  ['central', 'Merkezi'],
  ['central-share', 'Merkezi (pay ölçer)'],
  ['floor-heating', 'Yerden ısıtma'],
  ['air-conditioning', 'Klima'],
  ['stove', 'Soba'],
  ['solar', 'Güneş enerjisi'],
  ['heat-pump', 'Isı pompası'],
  ['none', 'Isıtma yok'],
] as const

const DEED_OPTIONS = [
  ['condominium', 'Kat mülkiyetli'],
  ['easement', 'Kat irtifaklı'],
  ['detached', 'Müstakil tapulu'],
  ['shared', 'Hisseli tapulu'],
  ['allocation', 'Tahsis belgeli'],
  ['none', 'Tapu kaydı yok'],
] as const

const ZONING_OPTIONS = [
  ['residential', 'Konut imarlı'],
  ['commercial', 'Ticari imarlı'],
  ['tourism', 'Turizm imarlı'],
  ['industrial', 'Sanayi imarlı'],
  ['agricultural', 'Tarla / tarım'],
  ['vineyard', 'Bağ / bahçe'],
  ['olive-grove', 'Zeytinlik'],
  ['unzoned', 'İmarsız'],
] as const

const USAGE_OPTIONS = [
  ['empty', 'Boş'],
  ['owner', 'Mülk sahibi oturuyor'],
  ['tenant', 'Kiracılı'],
] as const

const VIEW_OPTIONS = [
  ['sea', 'Deniz'],
  ['nature', 'Doğa'],
  ['city', 'Şehir'],
  ['lake', 'Göl'],
  ['bosphorus', 'Boğaz'],
  ['pool', 'Havuz'],
] as const

const FACADE_OPTIONS = [
  ['north', 'Kuzey'],
  ['south', 'Güney'],
  ['east', 'Doğu'],
  ['west', 'Batı'],
] as const

const INTERIOR_OPTIONS = [
  ['built-in', 'Ankastre mutfak'],
  ['fitted-kitchen', 'Mutfak (dolaplı)'],
  ['dressing-room', 'Giyinme odası'],
  ['ensuite', 'Ebeveyn banyosu'],
  ['fireplace', 'Şömine'],
  ['steel-door', 'Çelik kapı'],
  ['laminate', 'Laminat zemin'],
  ['pvc-window', 'PVC doğrama'],
  ['jacuzzi', 'Jakuzi'],
  ['sauna', 'Sauna'],
] as const

const EXTERIOR_OPTIONS = [
  ['pool', 'Yüzme havuzu'],
  ['gym', 'Spor salonu'],
  ['security', '7/24 güvenlik'],
  ['generator', 'Jeneratör'],
  ['playground', 'Çocuk oyun alanı'],
  ['garden', 'Bahçe'],
  ['car-park', 'Kapalı otopark'],
  ['thermal-insulation', 'Isı yalıtımı'],
] as const

const NEIGHBOURHOOD_OPTIONS = [
  ['school', 'Okula yakın'],
  ['hospital', 'Hastaneye yakın'],
  ['market', 'Markete yakın'],
  ['mall', 'AVM’ye yakın'],
  ['seaside', 'Denize yakın'],
  ['park', 'Parka yakın'],
] as const

const TRANSPORT_OPTIONS = [
  ['metro', 'Metro'],
  ['metrobus', 'Metrobüs'],
  ['bus', 'Otobüs durağı'],
  ['minibus', 'Minibüs'],
  ['train', 'Tren / Marmaray'],
  ['highway', 'Ana yola yakın'],
] as const

const INFRASTRUCTURE_OPTIONS = [
  ['electricity', 'Elektrik'],
  ['water', 'Su'],
  ['natural-gas', 'Doğalgaz'],
  ['sewage', 'Kanalizasyon'],
  ['road', 'Yol açılmış'],
  ['telephone', 'Telefon'],
] as const

function opts(pairs: readonly (readonly [string, string])[]) {
  return pairs.map(([value, label]) => ({ value, label }))
}

const RESIDENTIAL_ONLY = ['residential'] as const
const HOUSING_LIKE = ['residential', 'timeshare'] as const
const BUILT = ['residential', 'commercial', 'building', 'timeshare', 'touristic'] as const
const ALL = [
  'residential',
  'land',
  'commercial',
  'building',
  'timeshare',
  'touristic',
] as const

/**
 * Filtre bölümleri, kullanıcı önceliğine göre sıralı.
 *
 * Not: fiyat ve alanın ANA aralıkları (`salePrice`/`rentPrice`/`area`) tarihsel
 * olarak `ListingSearchState`'te ayrı alanlardır ve panelde ayrıca çizilir;
 * burada tekrar edilmez. Bu bölümler onların ÜSTÜNE gelen derinliği taşır.
 */
export const FILTER_SECTIONS: FilterSectionDef[] = [
  {
    id: 'kind',
    title: 'Gayrimenkul tipi',
    facets: [
      {
        key: 'housing-type',
        label: 'Konut tipi',
        type: 'select',
        options: opts([
          ['apartment', 'Daire'],
          ['residence', 'Rezidans'],
          ['detached-house', 'Müstakil ev'],
          ['villa', 'Villa'],
          ['summer-house', 'Yazlık'],
          ['duplex', 'Dubleks'],
          ['loft', 'Loft'],
        ]),
        categories: [...HOUSING_LIKE],
        importance: 'core',
        frequency: 11,
      },
      {
        key: 'commercial-type',
        label: 'İş yeri tipi',
        type: 'select',
        options: opts([
          ['office', 'Ofis'],
          ['shop', 'Dükkân'],
          ['depot', 'Depo'],
          ['factory', 'Fabrika'],
          ['workshop', 'Atölye'],
          ['plaza-floor', 'Plaza katı'],
        ]),
        categories: ['commercial'],
        importance: 'core',
        frequency: 8,
      },
      {
        key: 'timeshare-period',
        label: 'Devremülk dönemi',
        type: 'select',
        options: opts([
          ['summer', 'Yaz dönemi'],
          ['winter', 'Kış dönemi'],
          ['spring', 'İlkbahar'],
          ['autumn', 'Sonbahar'],
          ['fixed-week', 'Sabit hafta'],
        ]),
        categories: ['timeshare'],
        importance: 'core',
        frequency: 8,
      },
    ],
  },
  {
    id: 'price',
    title: 'Fiyat ve ödeme',
    facets: [
      {
        key: 'price-per-sqm',
        label: 'm² birim fiyatı',
        type: 'range',
        unit: 'TL/m²',
        categories: [...ALL],
        importance: 'common',
        frequency: 9,
      },
      {
        key: 'credit-eligible',
        label: 'Krediye uygun',
        type: 'boolean',
        categories: [...ALL],
        importance: 'core',
        frequency: 10,
      },
      {
        key: 'exchange',
        label: 'Takasa uygun',
        type: 'boolean',
        categories: [...ALL],
        importance: 'common',
        frequency: 6,
      },
      {
        key: 'dues',
        label: 'Aidat',
        type: 'range',
        unit: 'TL/ay',
        categories: [...BUILT],
        importance: 'niche',
        frequency: 9,
      },
      {
        key: 'deposit',
        label: 'Depozito',
        type: 'range',
        unit: 'TL',
        categories: [...BUILT],
        importance: 'niche',
        frequency: 14,
      },
      {
        key: 'price-reduced',
        label: 'Fiyatı düşen ilanlar',
        type: 'boolean',
        categories: [...ALL],
        importance: 'common',
        frequency: 11,
      },
    ],
  },
  {
    id: 'area',
    title: 'Alan',
    facets: [
      {
        key: 'net-area',
        label: 'm² (Net)',
        type: 'range',
        unit: 'm²',
        categories: [...BUILT],
        importance: 'common',
        frequency: 8,
      },
      {
        key: 'open-area',
        label: 'Açık alan',
        type: 'range',
        unit: 'm²',
        categories: ['residential', 'commercial', 'touristic'],
        importance: 'niche',
        frequency: 5,
      },
      {
        key: 'land-area',
        label: 'Arsa alanı',
        type: 'range',
        unit: 'm²',
        categories: ['land', 'building', 'touristic'],
        importance: 'core',
        frequency: 10,
      },
    ],
  },
  {
    id: 'layout',
    title: 'Oda ve yerleşim',
    facets: [
      {
        key: 'rooms',
        label: 'Oda sayısı',
        type: 'select',
        options: ROOM_OPTIONS,
        categories: [...HOUSING_LIKE],
        importance: 'core',
        frequency: 13,
      },
      {
        key: 'bathrooms',
        label: 'Banyo sayısı',
        type: 'range',
        unit: 'adet',
        categories: [...BUILT],
        importance: 'common',
        frequency: 12,
      },
      {
        key: 'floor-located',
        label: 'Bulunduğu kat',
        type: 'select',
        options: opts([
          ['basement', 'Bodrum'],
          ['garden-floor', 'Bahçe katı'],
          ['ground', 'Zemin kat'],
          ['low-rise', '1–3. kat'],
          ['mid-rise', '4–9. kat'],
          ['high-rise', '10. kat ve üzeri'],
          ['penthouse', 'Çatı katı / teras'],
        ]),
        categories: ['residential', 'commercial', 'timeshare'],
        importance: 'common',
        frequency: 12,
      },
      {
        key: 'floor-count',
        label: 'Bina kat sayısı',
        type: 'range',
        unit: 'kat',
        categories: [...BUILT],
        importance: 'niche',
        frequency: 6,
      },
      {
        key: 'living-rooms',
        label: 'Salon sayısı',
        type: 'range',
        unit: 'adet',
        categories: [...HOUSING_LIKE],
        importance: 'niche',
        frequency: 6,
      },
      {
        key: 'ceiling-height',
        label: 'Tavan yüksekliği',
        type: 'range',
        unit: 'm',
        categories: ['commercial', 'building', 'touristic'],
        importance: 'niche',
        frequency: 7,
      },
      {
        key: 'unit-count',
        label: 'Bağımsız bölüm sayısı',
        type: 'range',
        unit: 'adet',
        categories: ['building', 'touristic'],
        importance: 'common',
        frequency: 7,
      },
      {
        key: 'building-age',
        label: 'Bina yaşı',
        type: 'range',
        unit: 'yıl',
        categories: [...BUILT],
        importance: 'core',
        frequency: 23,
      },
    ],
  },
  {
    id: 'building',
    title: 'Bina ve tesisat',
    facets: [
      {
        key: 'heating',
        label: 'Isıtma tipi',
        type: 'select',
        options: opts(HEATING_OPTIONS),
        categories: [...BUILT],
        importance: 'core',
        frequency: 24,
      },
      {
        key: 'elevator',
        label: 'Asansör',
        type: 'boolean',
        categories: [...BUILT],
        importance: 'common',
        frequency: 17,
      },
      {
        key: 'parking',
        label: 'Otopark',
        type: 'select',
        options: opts([
          ['closed', 'Kapalı otopark'],
          ['open', 'Açık otopark'],
          ['garage', 'Garaj'],
          ['none', 'Otopark yok'],
        ]),
        categories: [...BUILT],
        importance: 'common',
        frequency: 14,
      },
      {
        key: 'in-complex',
        label: 'Site içerisinde',
        type: 'boolean',
        categories: [...BUILT],
        importance: 'common',
        frequency: 9,
      },
      {
        key: 'earthquake-code',
        label: 'Deprem yönetmeliği',
        type: 'select',
        single: true,
        options: opts([
          ['post-2018', '2018 yönetmeliği sonrası'],
          ['2000-2018', '2000–2018 arası'],
          ['pre-2000', '2000 öncesi'],
        ]),
        categories: [...BUILT],
        importance: 'core',
        frequency: 9,
      },
      {
        key: 'structure-type',
        label: 'Yapı tipi',
        type: 'select',
        options: opts([
          ['reinforced-concrete', 'Betonarme'],
          ['steel', 'Çelik'],
          ['masonry', 'Yığma'],
          ['prefabricated', 'Prefabrik'],
          ['wooden', 'Ahşap'],
        ]),
        categories: [...BUILT],
        importance: 'niche',
        frequency: 6,
      },
    ],
  },
  {
    id: 'interior',
    title: 'İç özellikler',
    facets: [
      {
        key: 'furnished',
        label: 'Eşya durumu',
        type: 'select',
        single: true,
        options: opts([
          ['yes', 'Eşyalı'],
          ['no', 'Eşyasız'],
          ['partly', 'Kısmen eşyalı'],
        ]),
        categories: [...BUILT],
        importance: 'core',
        frequency: 14,
      },
      {
        key: 'kitchen',
        label: 'Mutfak',
        type: 'select',
        options: opts([
          ['american', 'Amerikan mutfak'],
          ['closed', 'Kapalı mutfak'],
          ['open', 'Açık mutfak'],
        ]),
        categories: [...HOUSING_LIKE],
        importance: 'common',
        frequency: 5,
      },
      {
        key: 'balcony',
        label: 'Balkon',
        type: 'boolean',
        categories: [...HOUSING_LIKE],
        importance: 'common',
        frequency: 10,
      },
      {
        key: 'interior-features',
        label: 'İç özellikler',
        type: 'select',
        options: opts(INTERIOR_OPTIONS),
        categories: [...BUILT],
        importance: 'niche',
        frequency: 8,
      },
    ],
  },
  {
    id: 'exterior',
    title: 'Dış özellikler ve çevre',
    facets: [
      {
        key: 'exterior-features',
        label: 'Dış özellikler',
        type: 'select',
        options: opts(EXTERIOR_OPTIONS),
        categories: [...BUILT],
        importance: 'niche',
        frequency: 7,
      },
      {
        key: 'view',
        label: 'Manzara',
        type: 'select',
        options: opts(VIEW_OPTIONS),
        categories: [...ALL],
        importance: 'common',
        frequency: 22,
      },
      {
        key: 'facade',
        label: 'Cephe',
        type: 'select',
        options: opts(FACADE_OPTIONS),
        categories: [...BUILT],
        importance: 'niche',
        frequency: 6,
      },
      {
        key: 'distance-to-sea',
        label: 'Denize uzaklık',
        type: 'range',
        unit: 'm',
        categories: [...ALL],
        importance: 'common',
        frequency: 8,
      },
      {
        key: 'neighbourhood',
        label: 'Muhit',
        type: 'select',
        options: opts(NEIGHBOURHOOD_OPTIONS),
        categories: [...ALL],
        importance: 'niche',
        frequency: 5,
      },
      {
        key: 'transport',
        label: 'Ulaşım',
        type: 'select',
        options: opts(TRANSPORT_OPTIONS),
        categories: [...ALL],
        importance: 'niche',
        frequency: 5,
      },
    ],
  },
  {
    id: 'rental',
    title: 'Kiralama koşulları',
    facets: [
      {
        key: 'rent-period',
        label: 'Kira dönemi',
        type: 'select',
        single: true,
        options: opts([
          ['monthly', 'Aylık'],
          ['weekly', 'Haftalık'],
          ['daily', 'Günlük'],
          ['seasonal', 'Sezonluk'],
        ]),
        categories: [...BUILT],
        importance: 'common',
        frequency: 9,
      },
      {
        key: 'available-from',
        label: 'Müsaitlik',
        type: 'select',
        single: true,
        options: opts([
          ['now', 'Hemen'],
          ['1m', '1 ay içinde'],
          ['3m', '3 ay içinde'],
        ]),
        categories: [...BUILT],
        importance: 'niche',
        frequency: 11,
      },
    ],
  },
  {
    id: 'legal',
    title: 'Tapu ve kullanım',
    facets: [
      {
        key: 'deed',
        label: 'Tapu durumu',
        type: 'select',
        options: opts(DEED_OPTIONS),
        categories: [...ALL],
        importance: 'core',
        frequency: 23,
      },
      {
        key: 'usage-status',
        label: 'Kullanım durumu',
        type: 'select',
        single: true,
        options: opts(USAGE_OPTIONS),
        categories: [...BUILT],
        importance: 'common',
        frequency: 14,
      },
      {
        key: 'zoning',
        label: 'İmar durumu',
        type: 'select',
        options: opts(ZONING_OPTIONS),
        categories: ['land', 'building'],
        importance: 'core',
        frequency: 16,
      },
      {
        key: 'citizenship-eligible',
        label: 'Vatandaşlığa uygun',
        type: 'boolean',
        categories: [...ALL],
        importance: 'common',
        frequency: 6,
      },
      {
        key: 'habitation-certificate',
        label: 'İskânlı',
        type: 'boolean',
        categories: ['residential', 'commercial', 'building'],
        importance: 'niche',
        frequency: 4,
      },
    ],
  },
  {
    id: 'land',
    title: 'Arsa ayrıntıları',
    facets: [
      {
        key: 'infrastructure',
        label: 'Altyapı',
        type: 'select',
        options: opts(INFRASTRUCTURE_OPTIONS),
        categories: ['land'],
        importance: 'core',
        frequency: 6,
      },
      {
        key: 'floor-area-ratio',
        label: 'KAKS / Emsal',
        type: 'range',
        categories: ['land'],
        importance: 'common',
        frequency: 6,
      },
      {
        key: 'building-height-limit',
        label: 'Gabari (yapı yüksekliği)',
        type: 'range',
        unit: 'm',
        categories: ['land'],
        importance: 'common',
        frequency: 9,
      },
      {
        key: 'road-width',
        label: 'Yol genişliği',
        type: 'range',
        unit: 'm',
        categories: ['land'],
        importance: 'niche',
        frequency: 4,
      },
    ],
  },
  {
    id: 'suitability',
    title: 'Uygunluk',
    facets: [
      {
        key: 'accessible',
        label: 'Engelliye ve yaşlıya uygun',
        type: 'boolean',
        categories: [...BUILT],
        importance: 'niche',
        frequency: 5,
      },
      {
        key: 'pets-allowed',
        label: 'Evcil hayvana uygun',
        type: 'boolean',
        categories: [...RESIDENTIAL_ONLY],
        importance: 'niche',
        frequency: 5,
      },
      {
        key: 'students-allowed',
        label: 'Öğrenciye uygun',
        type: 'boolean',
        categories: [...RESIDENTIAL_ONLY],
        importance: 'niche',
        frequency: 4,
      },
    ],
  },
  {
    id: 'listing',
    title: 'İlan bilgisi',
    facets: [
      {
        key: 'listing-age',
        label: 'İlan tarihi',
        type: 'select',
        single: true,
        options: opts([
          ['today', 'Bugün'],
          ['3d', 'Son 3 gün'],
          ['7d', 'Son 1 hafta'],
          ['30d', 'Son 1 ay'],
        ]),
        categories: [...ALL],
        importance: 'common',
        frequency: 20,
      },
      {
        key: 'has-photo',
        label: 'Fotoğraflı ilanlar',
        type: 'boolean',
        categories: [...ALL],
        importance: 'common',
        frequency: 14,
      },
      {
        key: 'has-virtual-tour',
        label: 'Sanal turlu ilanlar',
        type: 'boolean',
        categories: [...ALL],
        importance: 'common',
        frequency: 17,
      },
      {
        key: 'has-video',
        label: 'Videolu ilanlar',
        type: 'boolean',
        categories: [...ALL],
        importance: 'niche',
        frequency: 14,
      },
    ],
  },
]

/** Katalogdaki tüm facet'ler — doğrulama ve URL çözümlemesi için düz liste. */
export const ALL_FACETS = FILTER_SECTIONS.flatMap((section) => section.facets)

/** Anahtardan facet'e hızlı erişim; bilinmeyen URL anahtarları elenirken kullanılır. */
export const FACET_BY_KEY = new Map(ALL_FACETS.map((facet) => [facet.key, facet]))
