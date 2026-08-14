/**
 * Emlak Endeksi fixture adapter'ı.
 *
 * `listing-detail` desenine uyar: tipler `domain/`de, veri burada, `loadPriceIndex`
 * async imzalıdır (içi bugün senkron) ki gerçek veri kaynağına geçerken çağıran
 * taraf değişmesin.
 *
 * Şablon recursive: aynı fonksiyon Türkiye / il / ilçe / mahalle için çalışır,
 * seviye yalnız hangi blokların dolduğunu belirler (plan §B).
 */
import type {
  BreakdownRow,
  Demographics,
  DemographicShare,
  DistributionBin,
  IndexSnapshot,
  Period,
  PriceBasis,
  PriceIndexResult,
  PropertyType,
  QualityGrade,
  Region,
  RegionLevel,
  SubRegionRow,
  TimeSeriesPoint,
  TransactionType,
} from '../domain/price-index-types'

/* ── Coğrafi sözlük ─────────────────────────────────────────────────────── */

interface RegionNode {
  slug: string
  name: string
  level: RegionLevel
  population: number
  pricePerSqm: number
  changeNominal: number
  changeReal: number
  yieldPct: number
  paybackYears: number
  listings: number
  daysOnMarket: number
  fromPeakPct: number
  fromPeakPeriod: string
  quality: QualityGrade
  children?: RegionNode[]
}

const KADIKOY_MAHALLELER: RegionNode[] = [
  { slug: 'caddebostan', name: 'Caddebostan', level: 'neighborhood', population: 22_924, pricePerSqm: 128_700, changeNominal: 28.9, changeReal: -5.9, yieldPct: 3.6, paybackYears: 28, listings: 94, daysOnMarket: 78, fromPeakPct: -3.1, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'goztepe', name: 'Göztepe', level: 'neighborhood', population: 37_542, pricePerSqm: 91_200, changeNominal: 31.4, changeReal: -4.1, yieldPct: 4.4, paybackYears: 23, listings: 168, daysOnMarket: 61, fromPeakPct: -1.4, fromPeakPeriod: 'May 2026', quality: 'A' },
  { slug: 'erenkoy', name: 'Erenköy', level: 'neighborhood', population: 46_720, pricePerSqm: 88_400, changeNominal: 35.6, changeReal: -1.0, yieldPct: 4.7, paybackYears: 21, listings: 143, daysOnMarket: 58, fromPeakPct: -0.6, fromPeakPeriod: 'Haz 2026', quality: 'A' },
  { slug: 'feneryolu', name: 'Feneryolu', level: 'neighborhood', population: 26_133, pricePerSqm: 82_500, changeNominal: 34.0, changeReal: -2.2, yieldPct: 4.9, paybackYears: 20, listings: 121, daysOnMarket: 54, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'sahrayicedit', name: 'Sahrayıcedit', level: 'neighborhood', population: 51_206, pricePerSqm: 74_900, changeNominal: 38.2, changeReal: 0.9, yieldPct: 5.3, paybackYears: 19, listings: 87, daysOnMarket: 49, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
  { slug: 'merdivenkoy', name: 'Merdivenköy', level: 'neighborhood', population: 44_907, pricePerSqm: 69_800, changeNominal: 33.1, changeReal: -2.9, yieldPct: 5.5, paybackYears: 18, listings: 76, daysOnMarket: 52, fromPeakPct: -2.2, fromPeakPeriod: 'Nis 2026', quality: 'B' },
  { slug: 'fikirtepe', name: 'Fikirtepe', level: 'neighborhood', population: 33_484, pricePerSqm: 61_300, changeNominal: 44.1, changeReal: 5.3, yieldPct: 6.1, paybackYears: 16, listings: 52, daysOnMarket: 41, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
  // Etkin örneklem 10'un altında → hiçbir fiyat metriği yayımlanmaz (plan §F).
  { slug: 'dumlupinar', name: 'Dumlupınar', level: 'neighborhood', population: 11_961, pricePerSqm: 0, changeNominal: 0, changeReal: 0, yieldPct: 0, paybackYears: 0, listings: 14, daysOnMarket: 0, fromPeakPct: 0, fromPeakPeriod: '', quality: 'INSUFFICIENT' },
]

const BESIKTAS_MAHALLELER: RegionNode[] = [
  { slug: 'bebek', name: 'Bebek', level: 'neighborhood', population: 7_218, pricePerSqm: 289_500, changeNominal: 24.6, changeReal: -9.1, yieldPct: 3.1, paybackYears: 32, listings: 61, daysOnMarket: 96, fromPeakPct: -5.4, fromPeakPeriod: 'Oca 2026', quality: 'B' },
  { slug: 'levent', name: 'Levent', level: 'neighborhood', population: 11_406, pricePerSqm: 245_100, changeNominal: 27.2, changeReal: -7.2, yieldPct: 3.8, paybackYears: 26, listings: 84, daysOnMarket: 82, fromPeakPct: -2.9, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'etiler', name: 'Etiler', level: 'neighborhood', population: 16_559, pricePerSqm: 232_400, changeNominal: 29.5, changeReal: -5.5, yieldPct: 4.0, paybackYears: 25, listings: 127, daysOnMarket: 77, fromPeakPct: -1.8, fromPeakPeriod: 'May 2026', quality: 'A' },
  { slug: 'ortakoy', name: 'Ortaköy', level: 'neighborhood', population: 9_814, pricePerSqm: 198_300, changeNominal: 31.8, changeReal: -3.7, yieldPct: 4.4, paybackYears: 23, listings: 96, daysOnMarket: 69, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'gayrettepe', name: 'Gayrettepe', level: 'neighborhood', population: 14_463, pricePerSqm: 158_700, changeNominal: 33.4, changeReal: -2.4, yieldPct: 4.9, paybackYears: 20, listings: 138, daysOnMarket: 61, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'abbasaga', name: 'Abbasağa', level: 'neighborhood', population: 8_650, pricePerSqm: 149_800, changeNominal: 35.1, changeReal: -1.2, yieldPct: 5.1, paybackYears: 19, listings: 73, daysOnMarket: 57, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
]

const ANKARA_ILCELER: RegionNode[] = [
  { slug: 'cankaya', name: 'Çankaya', level: 'district', population: 942_553, pricePerSqm: 55_400, changeNominal: 26.3, changeReal: -7.4, yieldPct: 5.9, paybackYears: 17, listings: 24_816, daysOnMarket: 66, fromPeakPct: -3.1, fromPeakPeriod: 'Şub 2026', quality: 'A' },
  { slug: 'yenimahalle', name: 'Yenimahalle', level: 'district', population: 713_866, pricePerSqm: 38_900, changeNominal: 27.9, changeReal: -6.2, yieldPct: 6.6, paybackYears: 15, listings: 15_243, daysOnMarket: 69, fromPeakPct: -1.6, fromPeakPeriod: 'Nis 2026', quality: 'A' },
  { slug: 'golbasi', name: 'Gölbaşı', level: 'district', population: 149_142, pricePerSqm: 36_700, changeNominal: 34.6, changeReal: -1.5, yieldPct: 6.1, paybackYears: 16, listings: 4_921, daysOnMarket: 74, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'etimesgut', name: 'Etimesgut', level: 'district', population: 622_499, pricePerSqm: 34_500, changeNominal: 25.4, changeReal: -8.1, yieldPct: 6.9, paybackYears: 14, listings: 11_378, daysOnMarket: 71, fromPeakPct: -2.2, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'kecioren', name: 'Keçiören', level: 'district', population: 940_054, pricePerSqm: 33_800, changeNominal: 22.7, changeReal: -10.1, yieldPct: 7.2, paybackYears: 14, listings: 16_684, daysOnMarket: 78, fromPeakPct: -4.6, fromPeakPeriod: 'Oca 2026', quality: 'A' },
  { slug: 'sincan', name: 'Sincan', level: 'district', population: 572_609, pricePerSqm: 24_100, changeNominal: 29.1, changeReal: -5.8, yieldPct: 8.1, paybackYears: 12, listings: 9_517, daysOnMarket: 82, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
]

const ISTANBUL_ILCELER: RegionNode[] = [
  { slug: 'besiktas', name: 'Beşiktaş', level: 'district', population: 175_190, pricePerSqm: 182_468, changeNominal: 30.1, changeReal: -5.0, yieldPct: 4.6, paybackYears: 22, listings: 1_284, daysOnMarket: 71, fromPeakPct: -2.4, fromPeakPeriod: 'Nis 2026', quality: 'A', children: BESIKTAS_MAHALLELER },
  { slug: 'kadikoy', name: 'Kadıköy', level: 'district', population: 467_919, pricePerSqm: 169_123, changeNominal: 25.1, changeReal: -8.1, yieldPct: 5.2, paybackYears: 19, listings: 2_106, daysOnMarket: 63, fromPeakPct: -4.8, fromPeakPeriod: 'Şub 2026', quality: 'A', children: KADIKOY_MAHALLELER },
  { slug: 'uskudar', name: 'Üsküdar', level: 'district', population: 524_452, pricePerSqm: 86_400, changeNominal: 29.4, changeReal: -5.5, yieldPct: 5.4, paybackYears: 18, listings: 1_742, daysOnMarket: 66, fromPeakPct: -1.1, fromPeakPeriod: 'Haz 2026', quality: 'A' },
  { slug: 'atasehir', name: 'Ataşehir', level: 'district', population: 427_217, pricePerSqm: 78_900, changeNominal: 32.7, changeReal: -3.2, yieldPct: 5.8, paybackYears: 17, listings: 1_318, daysOnMarket: 59, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'maltepe', name: 'Maltepe', level: 'district', population: 515_021, pricePerSqm: 64_700, changeNominal: 35.9, changeReal: -0.7, yieldPct: 6.3, paybackYears: 16, listings: 1_465, daysOnMarket: 55, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'esenyurt', name: 'Esenyurt', level: 'district', population: 954_579, pricePerSqm: 33_202, changeNominal: 28.2, changeReal: -6.4, yieldPct: 9.9, paybackYears: 10, listings: 3_871, daysOnMarket: 84, fromPeakPct: -7.3, fromPeakPeriod: 'Oca 2026', quality: 'A' },
  { slug: 'adalar', name: 'Adalar', level: 'district', population: 16_690, pricePerSqm: 0, changeNominal: 0, changeReal: 0, yieldPct: 0, paybackYears: 0, listings: 9, daysOnMarket: 0, fromPeakPct: 0, fromPeakPeriod: '', quality: 'INSUFFICIENT' },
]

const ILLER: RegionNode[] = [
  { slug: 'istanbul', name: 'İstanbul', level: 'province', population: 15_655_924, pricePerSqm: 65_078, changeNominal: 26.5, changeReal: -7.2, yieldPct: 5.7, paybackYears: 17, listings: 175_596, daysOnMarket: 64, fromPeakPct: -3.9, fromPeakPeriod: 'Şub 2026', quality: 'A', children: ISTANBUL_ILCELER },
  { slug: 'ankara', name: 'Ankara', level: 'province', population: 5_803_482, pricePerSqm: 41_200, changeNominal: 24.1, changeReal: -9.0, yieldPct: 6.8, paybackYears: 15, listings: 98_412, daysOnMarket: 71, fromPeakPct: -5.2, fromPeakPeriod: 'Oca 2026', quality: 'A', children: ANKARA_ILCELER },
  { slug: 'izmir', name: 'İzmir', level: 'province', population: 4_479_525, pricePerSqm: 52_900, changeNominal: 29.8, changeReal: -4.9, yieldPct: 5.9, paybackYears: 17, listings: 76_303, daysOnMarket: 68, fromPeakPct: -2.7, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'antalya', name: 'Antalya', level: 'province', population: 2_722_103, pricePerSqm: 48_600, changeNominal: 33.4, changeReal: -2.4, yieldPct: 6.2, paybackYears: 16, listings: 61_889, daysOnMarket: 62, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'bursa', name: 'Bursa', level: 'province', population: 3_214_571, pricePerSqm: 34_100, changeNominal: 27.9, changeReal: -6.6, yieldPct: 7.1, paybackYears: 14, listings: 44_210, daysOnMarket: 74, fromPeakPct: -1.8, fromPeakPeriod: 'May 2026', quality: 'A' },
  { slug: 'tekirdag', name: 'Tekirdağ', level: 'province', population: 1_167_059, pricePerSqm: 27_400, changeNominal: 31.2, changeReal: -3.9, yieldPct: 7.6, paybackYears: 13, listings: 19_744, daysOnMarket: 79, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
]

const TURKIYE: RegionNode = {
  slug: '', name: 'Türkiye', level: 'country', population: 85_664_944,
  pricePerSqm: 43_900, changeNominal: 27.8, changeReal: -6.7, yieldPct: 6.4, paybackYears: 16,
  listings: 1_284_006, daysOnMarket: 69, fromPeakPct: -3.2, fromPeakPeriod: 'Şub 2026', quality: 'A',
  children: ILLER,
}

/* ── Yol çözümü ─────────────────────────────────────────────────────────── */

export interface PriceIndexPath {
  propertyType: PropertyType
  transactionType: TransactionType
  segments: string[]
}

const PROPERTY_TYPES: PropertyType[] = ['konut', 'isyeri', 'arsa']
const TRANSACTION_TYPES: TransactionType[] = ['satilik', 'kiralik']

/**
 * `/emlak-endeksi/{tip}/{islem}/{il}/{ilce}/{mahalle}` yolunu ayrıştırır.
 * Eksik/bozuk segmentler varsayılana düşer — 404 yerine Türkiye kökü gösterilir.
 */
export function parsePriceIndexPath(splat: string | undefined): PriceIndexPath {
  const parts = (splat ?? '').split('/').map((s) => s.trim()).filter(Boolean)
  const propertyType = PROPERTY_TYPES.includes(parts[0] as PropertyType) ? (parts[0] as PropertyType) : 'konut'
  const consumedType = PROPERTY_TYPES.includes(parts[0] as PropertyType) ? 1 : 0
  const rawTx = parts[consumedType]
  const transactionType = TRANSACTION_TYPES.includes(rawTx as TransactionType) ? (rawTx as TransactionType) : 'satilik'
  const consumedTx = TRANSACTION_TYPES.includes(rawTx as TransactionType) ? 1 : 0
  return { propertyType, transactionType, segments: parts.slice(consumedType + consumedTx, consumedType + consumedTx + 3) }
}

export function buildPriceIndexHref(path: PriceIndexPath, segments: string[] = path.segments): string {
  return ['/emlak-endeksi', path.propertyType, path.transactionType, ...segments].join('/')
}

/** Slug zincirini ağaçta yürüterek bölgeyi ve atalarını çözer. */
function resolveRegion(segments: string[]): { node: RegionNode; chain: RegionNode[] } {
  const chain: RegionNode[] = [TURKIYE]
  let node = TURKIYE
  for (const slug of segments) {
    const next = node.children?.find((c) => c.slug === slug)
    if (!next) break
    node = next
    chain.push(next)
  }
  return { node, chain }
}

/* ── Türetilmiş veri ────────────────────────────────────────────────────── */

const AYLAR = ['Ağu 25', 'Eyl 25', 'Eki 25', 'Kas 25', 'Ara 25', 'Oca 26', 'Şub 26', 'Mar 26', 'Nis 26', 'May 26', 'Haz 26', 'Tem 26']
const CEYREKLER = ['2023 Ç3', '2024 Ç1', '2024 Ç3', '2025 Ç1', '2025 Ç3', '2026 Ç1', '2026 Ç3']
const YILLAR = ['2021', '2022', '2023', '2024', '2025', '2026']

const LABELS: Record<Period, string[]> = { '1y': AYLAR, '3y': CEYREKLER, '5y': YILLAR }
/** Dönem başına yıllık bileşik büyüme çarpanı — geriye doğru seriyi üretir. */
const SPAN_YEARS: Record<Period, number> = { '1y': 1, '3y': 3, '5y': 5 }

/**
 * Son değerden ve yıllık değişimden geriye doğru seri üretir. `phase` her bölgeye
 * farklı dalgalanma verir; son nokta her zaman yayımlanan değere oturur.
 * Bölge rehberinin kart grafiği de aynı seriyi buradan üretir — iki ekran
 * aynı bölge için farklı geçmiş çizmesin.
 */
export function buildSeries(last: number, annualPct: number, period: Period, basis: PriceBasis, cpi: number, phase: number): TimeSeriesPoint[] {
  const labels = LABELS[period]
  const n = labels.length
  const years = SPAN_YEARS[period]
  const totalGrowth = Math.pow(1 + annualPct / 100, years)
  // Reel seride bugünkü fiyat sabit kalır, geçmiş TÜFE ile bugüne taşınır.
  const deflator = basis === 'reel' ? Math.pow(1 + cpi / 100, years) : 1
  const first = (last / totalGrowth) * deflator
  return labels.map((period_, i) => {
    const t = i / (n - 1)
    const base = first + (last - first) * t
    const wave = Math.sin(t * Math.PI * 2 + phase) * 0.012 + Math.sin(i * 1.7 + phase) * 0.004
    return { period: period_, value: Math.round(i === n - 1 ? last : base * (1 + wave)) }
  })
}

export function phaseFor(slug: string): number {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 997
  return (h / 997) * Math.PI * 2
}

/* ── İşlem türü köprüsü ─────────────────────────────────────────────────────
   Kiralık ayrı bir veri seti değil, satılık fixture'ından getiri köprüsüyle
   türetilir: kira m² = satılık m² × brüt getiri / 12. Böylece iki sayfanın
   kira çarpanı/amortisman sayıları birbiriyle asla çelişmez. */

const bir1 = (n: number) => Math.round(n * 10) / 10

/** Kira m² fiyatı — `investment.medianRentPerSqm` ile aynı formül. */
function rentPerSqm(node: RegionNode): number {
  return Math.round((node.pricePerSqm * (node.yieldPct / 100)) / 12)
}

function nodeValue(node: RegionNode, tx: TransactionType): number {
  return tx === 'kiralik' ? rentPerSqm(node) : node.pricePerSqm
}

/** Kira artışı fixture'da ayrı ölçülmez: satılık değişim + sabit makas. */
function nodeChange(node: RegionNode, tx: TransactionType): number {
  return tx === 'kiralik' ? bir1(node.changeNominal + 6.5) : node.changeNominal
}

function realChange(nominalPct: number): number {
  return bir1(((1 + nominalPct / 100) / (1 + CPI / 100) - 1) * 100)
}

function nodeChangeReal(node: RegionNode, tx: TransactionType): number {
  return tx === 'kiralik' ? realChange(nodeChange(node, tx)) : node.changeReal
}

/** Kiralık pazar daha küçük ve hızlıdır — ilan ve süre sabit oranla küçülür. */
function nodeListings(node: RegionNode, tx: TransactionType): number {
  return tx === 'kiralik' ? Math.round(node.listings * 0.35) : node.listings
}

function nodeDom(node: RegionNode, tx: TransactionType): number {
  return tx === 'kiralik' ? Math.max(7, Math.round(node.daysOnMarket * 0.45)) : node.daysOnMarket
}

function toSubRegionRow(node: RegionNode, tx: TransactionType): SubRegionRow {
  const yeterli = node.quality !== 'INSUFFICIENT'
  const deger = nodeValue(node, tx)
  const degisim = nodeChange(node, tx)
  return {
    id: node.slug,
    name: node.name,
    slug: node.slug,
    pricePerSqm: yeterli ? deger : null,
    changeNominal: yeterli ? degisim : null,
    changeReal: yeterli ? nodeChangeReal(node, tx) : null,
    yieldPct: yeterli ? node.yieldPct : null,
    paybackYears: yeterli ? node.paybackYears : null,
    listings: nodeListings(node, tx),
    daysOnMarket: yeterli ? nodeDom(node, tx) : null,
    fromPeak: yeterli && node.fromPeakPeriod ? { pct: node.fromPeakPct, period: node.fromPeakPeriod } : null,
    quality: node.quality,
    trend: yeterli
      ? buildSeries(deger, degisim, '1y', 'nominal', 0, phaseFor(node.slug)).map((p) => p.value ?? 0)
      : [],
  }
}

const SUB_REGION_LABEL: Record<RegionLevel, string> = {
  country: 'İller',
  province: 'İlçeler',
  district: 'Mahalleler',
  neighborhood: '',
}

/** Bant kenarını okunur sayıya yuvarlar; 10 binin üstünde "43 bin" biçimi. */
function binEdgeLabel(v: number): string {
  if (v >= 10_000) return `${Math.round(v / 1_000)} bin`
  if (v >= 1_000) return Math.round(v / 100) * 100 + ''
  return `${Math.round(v / 10) * 10}`
}

/**
 * Dağılım bantları bölgenin kendi medyan ölçeğinden kurulur — Türkiye'nin
 * "60–70 bin" bandı Beşiktaş'ın 182 binlik medyanına uymaz. Sayımlar sabit
 * sağ-kuyruklu profildir; medyan 0.95–1.05 bandına düşer.
 */
function buildBins(median: number): DistributionBin[] {
  const edges = [0.75, 0.85, 0.95, 1.05, 1.15].map((f) => median * f)
  const e = edges.map(binEdgeLabel)
  const counts = [8, 21, 34, 29, 17, 11]
  return [
    { id: 'b1', label: `< ${e[0]}`, count: counts[0] },
    { id: 'b2', label: `${e[0]}–${e[1]}`, count: counts[1] },
    { id: 'b3', label: `${e[1]}–${e[2]}`, count: counts[2] },
    { id: 'b4', label: `${e[2]}–${e[3]}`, count: counts[3], containsMedian: true },
    { id: 'b5', label: `${e[3]}–${e[4]}`, count: counts[4] },
    { id: 'b6', label: `${e[4]} +`, count: counts[5] },
  ]
}

const CPI = 37.0

/* ── Konut özelliği kırılımları ─────────────────────────────────────────── */

interface BreakdownProfile {
  id: string
  label: string
  /** Bölge medyanına göre m² çarpanı — küçük daire ve yeni bina daha pahalı */
  factor: number
  /** Segmentin tipik brüt alanı (medyan toplam fiyat için) */
  sqm: number
  /** İlan stoğundaki pay — profiller 100'e tamamlanır */
  sharePct: number
  /** Yıllık değişime segment sapması (puan) */
  changeDelta: number
}

const ODA_PROFILI: BreakdownProfile[] = [
  { id: '1+1', label: '1+1', factor: 1.17, sqm: 55, sharePct: 20, changeDelta: 3.1 },
  { id: '2+1', label: '2+1', factor: 1.03, sqm: 90, sharePct: 40, changeDelta: 0.9 },
  { id: '3+1', label: '3+1', factor: 0.96, sqm: 135, sharePct: 31, changeDelta: -0.6 },
  { id: '4+1', label: '4+1 ve üzeri', factor: 0.93, sqm: 190, sharePct: 9, changeDelta: -2.2 },
]

const BINA_YASI_PROFILI: BreakdownProfile[] = [
  { id: '0-4', label: '0–4 yaş', factor: 1.19, sqm: 106, sharePct: 16, changeDelta: 1.4 },
  { id: '5-10', label: '5–10 yaş', factor: 1.07, sqm: 106, sharePct: 27, changeDelta: 0.4 },
  { id: '11-20', label: '11–20 yaş', factor: 0.96, sqm: 106, sharePct: 34, changeDelta: -0.9 },
  { id: '21+', label: '21 yaş +', factor: 0.83, sqm: 106, sharePct: 23, changeDelta: -1.8 },
]

/** Segment m² fiyatları bölge medyanından çarpanla türetilir — kırılım tablosu
    ile sayfa başlığı aynı kaynaktan beslenir, çelişmez. */
function buildBreakdown(profile: BreakdownProfile[], value: number, change: number, listings: number): BreakdownRow[] {
  return profile.map((p) => ({
    id: p.id,
    label: p.label,
    pricePerSqm: Math.round(value * p.factor),
    medianPrice: Math.round(value * p.factor * p.sqm),
    changeNominal: bir1(change + p.changeDelta),
    listings: Math.round(listings * (p.sharePct / 100)),
    sharePct: p.sharePct,
  }))
}

/* ── Demografi ──────────────────────────────────────────────────────────── */

/** Slug + tuzdan deterministik 0–1 değeri — her bölgeye farklı ama sabit profil. */
function hash01(slug: string, salt: string): number {
  let h = 0
  for (const ch of slug + '#' + salt) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h / 9973
}

/**
 * Taban yüzdelere bölgeye özgü sapma ekler ve toplamı tam 100'e oturtur
 * (yuvarlama farkı en büyük paya yazılır — negatif pay üretmez).
 */
function jitteredShares(
  slug: string,
  base: Array<{ id: string; label: string; pct: number }>,
  spread: number,
): DemographicShare[] {
  const raw = base.map((b, i) => ({ ...b, pct: Math.max(1, b.pct + (hash01(slug, b.id + i) - 0.5) * 2 * spread) }))
  const sum = raw.reduce((s, r) => s + r.pct, 0)
  const scaled = raw.map((r) => ({ ...r, pct: Math.round((r.pct / sum) * 100) }))
  const diff = 100 - scaled.reduce((s, r) => s + r.pct, 0)
  const biggest = scaled.reduce((a, b) => (b.pct > a.pct ? b : a))
  biggest.pct += diff
  return scaled
}

const YAS_BANTLARI = [
  { id: '0-14', label: '0–14 yaş', pct: 20 },
  { id: '15-24', label: '15–24 yaş', pct: 14 },
  { id: '25-44', label: '25–44 yaş', pct: 32 },
  { id: '45-64', label: '45–64 yaş', pct: 23 },
  { id: '65+', label: '65 yaş +', pct: 11 },
]

const EGITIM = [
  { id: 'universite', label: 'Üniversite', pct: 35 },
  { id: 'lise', label: 'Lise', pct: 28 },
  { id: 'ortaokul', label: 'Ortaokul', pct: 14 },
  { id: 'ilkokul', label: 'İlkokul', pct: 17 },
  { id: 'yok', label: 'Öğrenim görmemiş', pct: 6 },
]

const NUFUS_KIRILIM_LABEL: Record<RegionLevel, string> = {
  country: 'il nüfus dağılımı',
  province: 'ilçe nüfus dağılımı',
  district: 'mahalle nüfus dağılımı',
  neighborhood: '',
}

/**
 * Bölgenin demografik profili. Fiyatın aksine ölçülmez, slug'dan deterministik
 * türetilir — gerçek kaynağa (TÜİK ADNKS) geçerken yalnız bu fonksiyon değişir.
 * Nüfus dağılımı: alt kırılımı olan bölgede çocuklar; yaprakta kardeşler +
 * kendisi vurgulu (sahibindex deseni).
 */
function buildDemographics(node: RegionNode, parent: RegionNode | null): Demographics {
  const key = node.slug || 'turkiye'
  const femalePct = Math.round((49.2 + hash01(key, 'cinsiyet') * 2.6) * 10) / 10
  const marriedPct = Math.round(48 + hash01(key, 'medeni') * 16)

  const kirilimKaynagi = node.children?.length
    ? { owner: node, items: node.children, self: null as string | null }
    : parent?.children?.length
      ? { owner: parent, items: parent.children, self: node.slug }
      : null

  return {
    population: node.population,
    averageAge: Math.round((31 + hash01(key, 'yas') * 12) * 10) / 10,
    femalePct,
    malePct: Math.round((100 - femalePct) * 10) / 10,
    marriedPct,
    singlePct: 100 - marriedPct,
    ageBands: jitteredShares(key, YAS_BANTLARI, 4),
    education: jitteredShares(key, EGITIM, 5),
    subRegionPopulation: kirilimKaynagi
      ? {
          label: `${kirilimKaynagi.owner.name} ${NUFUS_KIRILIM_LABEL[kirilimKaynagi.owner.level]}`,
          items: kirilimKaynagi.items.map((c) => ({
            id: c.slug,
            label: c.name,
            population: c.population,
            prominent: c.slug === kirilimKaynagi.self || undefined,
          })),
        }
      : { label: '', items: [] },
    sourceLabel: 'TÜİK 2025 ADNKS',
  }
}

function metric(
  value: number | null,
  unit: MetricUnit,
  extra: Partial<{ sampleSize: number; effectiveSampleSize: number; qualityGrade: QualityGrade }> = {},
) {
  return {
    value,
    unit,
    observationType: 'observed' as const,
    source: 'LISTINGS' as const,
    qualityGrade: extra.qualityGrade ?? ('A' as QualityGrade),
    suppressed: value === null,
    ...extra,
  }
}
type MetricUnit = 'TRY' | 'TRY_PER_SQM' | 'PERCENT' | 'COUNT' | 'DAYS' | 'YEARS'

/* ── Yükleyici ──────────────────────────────────────────────────────────── */

export interface LoadPriceIndexInput {
  path: PriceIndexPath
}

/**
 * Bölgeyi çözer ve tüm blokların verisini üretir. Async imzalıdır ki gerçek
 * kaynağa geçerken çağıran değişmesin (`listing-detail` deseni).
 */
export async function loadPriceIndex({ path }: LoadPriceIndexInput): Promise<PriceIndexResult> {
  const { node, chain } = resolveRegion(path.segments)

  const region: Region = {
    id: node.slug || 'turkiye',
    level: node.level,
    name: node.name,
    slug: node.slug,
    path: chain.map((n) => ({ id: n.slug || 'turkiye', level: n.level, name: n.name, slug: n.slug })),
  }

  // Referanslar YAKINDAN UZAĞA sıralanır: GlassTrendChart kesik yoğunluğunu
  // bu sıraya göre seyreltir (yakın bölge yoğun çizgi).
  const ancestors = [...chain.slice(0, -1)].reverse()

  const tx = path.transactionType
  const deger = nodeValue(node, tx)
  const degisim = nodeChange(node, tx)
  const ilanSayisi = nodeListings(node, tx)

  const series = {} as IndexSnapshot['series']
  for (const period of ['1y', '3y', '5y'] as Period[]) {
    series[period] = {} as Record<PriceBasis, { own: TimeSeriesPoint[]; benchmarks: Array<{ id: string; label: string; points: TimeSeriesPoint[] }> }>
    for (const basis of ['nominal', 'reel'] as PriceBasis[]) {
      series[period][basis] = {
        own: buildSeries(deger, degisim, period, basis, CPI, phaseFor(node.slug || 'tr')),
        benchmarks: ancestors.map((a) => ({
          id: a.slug || 'turkiye',
          label: `${a.name} ortalaması`,
          points: buildSeries(nodeValue(a, tx), nodeChange(a, tx), period, basis, CPI, phaseFor(a.slug || 'tr')),
        })),
      }
    }
  }

  const yeterli = node.quality !== 'INSUFFICIENT'
  const effectiveSample = Math.round(ilanSayisi * 0.78)

  const snapshot: IndexSnapshot = {
    region,
    transactionType: path.transactionType,
    propertyType: path.propertyType,
    dataAsOf: 'Temmuz 2026',
    updateCadence: 'aylık güncellenir',
    headline: {
      medianPricePerSqm: metric(yeterli ? deger : null, 'TRY_PER_SQM', {
        sampleSize: ilanSayisi,
        effectiveSampleSize: effectiveSample,
        qualityGrade: node.quality,
      }),
      medianPrice: metric(yeterli ? Math.round(deger * 106) : null, 'TRY'),
      grossYield: metric(yeterli ? node.yieldPct : null, 'PERCENT'),
      daysOnMarket: metric(yeterli ? nodeDom(node, tx) : null, 'DAYS'),
    },
    change: { nominal: degisim, real: nodeChangeReal(node, tx), cpi: CPI },
    confidence: {
      score: node.quality === 'A' ? 78 : node.quality === 'B' ? 54 : 18,
      grade: node.quality,
      activeListings: ilanSayisi,
      effectiveSample,
      interval: { lower: Math.round(deger * 0.967), upper: Math.round(deger * 1.031) },
      windowLabel: 'Son 30 günlük ilanlar kullanıldı; pencere genişletilmedi.',
    },
    series,
    distribution: {
      bins: buildBins(deger),
      percentiles: [
        { id: 'p10', label: 'P10', value: `${Math.round(deger * 0.78).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p25', label: 'P25', value: `${Math.round(deger * 0.88).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p50', label: 'Medyan', value: `${deger.toLocaleString('tr-TR')} TL/m²`, prominent: true },
        { id: 'p75', label: 'P75', value: `${Math.round(deger * 1.11).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p90', label: 'P90', value: `${Math.round(deger * 1.26).toLocaleString('tr-TR')} TL/m²` },
      ],
      sampleSize: Math.min(ilanSayisi, 120),
    },
    supply: {
      activeListings: ilanSayisi,
      newListings: Math.round(ilanSayisi * 0.28),
      stockRatio: 1.8,
      priceCutShare: 22,
    },
    investment: {
      grossYield: node.yieldPct,
      paybackYears: node.paybackYears,
      rentMultiplier: Math.round(node.paybackYears * 12),
      medianRentPerSqm: Math.round((node.pricePerSqm * (node.yieldPct / 100)) / 12),
      liquidityScore: node.quality === 'A' ? 62 : 44,
    },
    breakdowns: {
      rooms: buildBreakdown(ODA_PROFILI, deger, degisim, ilanSayisi),
      buildingAge: buildBreakdown(BINA_YASI_PROFILI, deger, degisim, ilanSayisi),
    },
    demographics: buildDemographics(node, chain.length > 1 ? chain[chain.length - 2] : null),
    subRegions: (node.children ?? []).map((c) => toSubRegionRow(c, tx)),
    subRegionLabel: SUB_REGION_LABEL[node.level],
  }

  const parent = chain.length > 1 ? chain[chain.length - 2] : null
  const siblingSegments = (n: RegionNode) => [...path.segments.slice(0, -1), n.slug]

  const discovery: PriceIndexResult['discovery'] = []
  if (node.children?.length) {
    discovery.push({
      id: 'alt-bolgeler',
      title: `${node.name} ${SUB_REGION_LABEL[node.level].toLocaleLowerCase('tr-TR')}`,
      href: buildPriceIndexHref(path),
      hubLabel: `${node.name} endeksinin tamamı`,
      links: node.children.slice(0, 6).map((c) => ({
        id: c.slug,
        label: `${c.name} ${tx === 'kiralik' ? 'konut kiraları' : 'konut fiyatları'}`,
        href: buildPriceIndexHref(path, [...path.segments, c.slug]),
        meta:
          c.quality === 'INSUFFICIENT'
            ? 'yetersiz veri'
            : `${nodeValue(c, tx).toLocaleString('tr-TR')} TL/m² · ${nodeListings(c, tx).toLocaleString('tr-TR')} ilan`,
      })),
    })
  }
  if (parent?.children?.length) {
    discovery.push({
      id: 'kardesler',
      title: `${parent.name} içindeki diğer bölgeler`,
      links: parent.children
        .filter((c) => c.slug !== node.slug)
        .slice(0, 6)
        .map((c) => ({
          id: c.slug,
          label: `${c.name} ${tx === 'kiralik' ? 'konut kiraları' : 'konut fiyatları'}`,
          href: buildPriceIndexHref(path, siblingSegments(c)),
          meta: c.quality === 'INSUFFICIENT' ? 'yetersiz veri' : `${nodeValue(c, tx).toLocaleString('tr-TR')} TL/m²`,
        })),
    })
  }
  discovery.push({
    id: 'diger-gorunumler',
    title: `${node.name} — diğer görünümler`,
    links: [
      {
        id: 'ters-islem',
        label: `${node.name} ${path.transactionType === 'satilik' ? 'kiralık' : 'satılık'} konut endeksi`,
        href: buildPriceIndexHref({ ...path, transactionType: path.transactionType === 'satilik' ? 'kiralik' : 'satilik' }),
        meta: 'aynı bölge, diğer işlem türü',
      },
      {
        id: 'isyeri',
        label: `${node.name} iş yeri endeksi`,
        href: buildPriceIndexHref({ ...path, propertyType: 'isyeri' }),
        meta: 'ticari gayrimenkul',
      },
    ],
  })

  return { snapshot, discovery }
}

export const PRICE_INDEX_TREE = TURKIYE
