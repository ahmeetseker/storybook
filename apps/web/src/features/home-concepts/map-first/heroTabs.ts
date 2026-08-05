// Ana sayfa hero'sunun sekme başına içeriği. Sekme değişince başlık, arama
// yer tutucusu, AI çıkarım chip'leri, hızlı filtreler, harita pinleri ve
// doğrulama sayacı birlikte değişir (bkz. spec §5).
//
// Pin x/y notu: `GlassMap`, harita zemini (Leaflet tile) yüklenemediğinde
// (ağ hatası, CSP, reklam engelleyici) şematik SVG zeminine düşer ve pinleri
// `x`/`y` normalize koordinatlarından konumlandırır. `x`/`y` verilmezse pin
// hiç render edilmez. Bu yüzden her pin için `lat`/`lng`'nin kaba coğrafi
// karşılığı olacak şekilde `x`/`y` de hesaplanır. Türkiye'nin yaklaşık
// sınırları (batı ~26° / doğu ~45° boylam, kuzey ~42° / güney ~36° enlem)
// üzerinden basit doğrusal eşleme kullanılır:
//   x ≈ (lng - 26) / (45 - 26)
//   y ≈ (42 - lat) / (42 - 36)
import { buildHeroPins, type HeroPin } from './heroPins'

export type HeroTabId = 'arsa' | 'konut' | 'proje'

export interface HeroParsedFilter {
  id: string
  label: string
  value: string
}

export interface HeroDetailFilter {
  /** Erişilebilir ad ("Metrekare aralığı" gibi) */
  label: string
  /** Dar tetikleyiciye sığan kısa yer tutucu; verilmezse label kullanılır */
  placeholder?: string
  options: { value: string; label: string }[]
}

export interface HeroTab {
  id: HeroTabId
  label: string
  title: string
  subtitle: string
  /** Arama hero'sunda "Hayal ettiğin ___ seni bekliyor." kalıbındaki vurgulu kelime */
  heroWord: string
  /** Arama kartındaki sekmeye özel ikinci seçici (arsa: m², konut: oda, proje: teslim) */
  detailFilter: HeroDetailFilter
  placeholder: string
  suggestions: string[]
  quickFilters: string[]
  parsedFilters: HeroParsedFilter[]
  confidence: number
  /**
   * Harita pinleri. Sekme başına `buildHeroPins` ile üretilir: kümeleme
   * rozetlerinin ortaya çıkması için haritada gerçek bir yoğunluk olmalı,
   * elle yazılmış birkaç pin ile iniş zinciri hiç başlamıyordu.
   */
  pins: HeroPin[]
  verifiedCount: string
  verifiedLabel: string
}

export const HERO_TABS: HeroTab[] = [
  {
    id: 'arsa',
    label: 'Arsa',
    title: 'Önce haritada gör, sonra karar ver',
    subtitle:
      'Ada–parsel, imar durumu ve yol cephesi bilgisiyle birlikte doğrulanmış parseller.',
    heroWord: 'arsa',
    detailFilter: {
      label: 'Metrekare aralığı',
      placeholder: 'm² aralığı',
      options: [
        { value: 'tumu', label: 'Tüm m² aralıkları' },
        { value: '0-500', label: "500 m²'ye kadar" },
        { value: '500-1000', label: '500 – 1.000 m²' },
        { value: '1000-5000', label: '1.000 – 5.000 m²' },
        { value: '5000+', label: '5.000 m² üzeri' },
      ],
    },
    placeholder: 'Bölge, bütçe veya imar tercihini yaz',
    suggestions: [
      'Urla konut imarlı arsa',
      'Kaş deniz manzaralı arsa',
      'Gölbaşı yol cepheli tarla',
    ],
    quickFilters: ['Konut imarlı', 'Yola cepheli', 'Tarla', 'Deniz manzarası'],
    parsedFilters: [
      { id: 'bolge', label: 'Bölge', value: 'Urla' },
      { id: 'butce', label: 'Bütçe', value: '≤ 4.000.000 TL' },
      { id: 'imar', label: 'İmar', value: 'Konut' },
    ],
    confidence: 92,
    pins: buildHeroPins('arsa'),
    verifiedCount: '18.412',
    verifiedLabel: 'doğrulanmış arsa ilanı',
  },
  {
    id: 'konut',
    label: 'Konut',
    title: 'Evi mahallesiyle birlikte gör',
    subtitle:
      'Okul, ulaşım ve aidat bilgisi ilan kartının içinde; fiyat geçmişi harita üzerinde.',
    heroWord: 'ev',
    detailFilter: {
      label: 'Oda sayısı',
      options: [
        { value: 'tumu', label: 'Tüm oda sayıları' },
        { value: '1+1', label: '1+1' },
        { value: '2+1', label: '2+1' },
        { value: '3+1', label: '3+1' },
        { value: '4+', label: '4+1 ve üzeri' },
      ],
    },
    placeholder: 'Semt, oda sayısı veya bütçeni yaz',
    suggestions: [
      'Çeşme 3+1 site içinde',
      'Ankara Çayyolu sıfır daire',
      'İzmir Bornova kiralık 2+1',
    ],
    quickFilters: ['3+1', 'Site içinde', 'Sıfır bina', 'Eşyalı'],
    parsedFilters: [
      { id: 'semt', label: 'Semt', value: 'Çeşme' },
      { id: 'oda', label: 'Oda', value: '3+1' },
      { id: 'butce', label: 'Bütçe', value: '≤ 7.000.000 TL' },
    ],
    confidence: 88,
    pins: buildHeroPins('konut'),
    verifiedCount: '42.860',
    verifiedLabel: 'doğrulanmış konut ilanı',
  },
  {
    id: 'proje',
    label: 'Proje',
    title: 'Teslim tarihinden önce yerini seç',
    subtitle:
      'Devam eden projelerin etap planı, teslim takvimi ve müteahhit doğrulaması bir arada.',
    heroWord: 'proje',
    detailFilter: {
      label: 'Teslim yılı',
      options: [
        { value: 'tumu', label: 'Tüm teslim yılları' },
        { value: '2026', label: '2026' },
        { value: '2027', label: '2027' },
        { value: '2028+', label: '2028 ve sonrası' },
      ],
    },
    placeholder: 'Şehir, teslim yılı veya müteahhit yaz',
    suggestions: [
      '2027 teslim İstanbul projesi',
      'İzmir deniz manzaralı proje',
      'Ankara kentsel dönüşüm',
    ],
    quickFilters: ['2027 teslim', 'Deniz manzaralı', 'Kentsel dönüşüm'],
    parsedFilters: [
      { id: 'sehir', label: 'Şehir', value: 'İstanbul' },
      { id: 'teslim', label: 'Teslim', value: '2027' },
    ],
    confidence: 84,
    pins: buildHeroPins('proje'),
    verifiedCount: '1.284',
    verifiedLabel: 'doğrulanmış proje',
  },
]

export function isHeroTabId(value: unknown): value is HeroTabId {
  return value === 'arsa' || value === 'konut' || value === 'proje'
}

export function heroTab(id: HeroTabId): HeroTab {
  return HERO_TABS.find((tab) => tab.id === id) ?? HERO_TABS[0]
}
