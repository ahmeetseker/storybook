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
  { slug: 'caddebostan', name: 'Caddebostan', level: 'neighborhood', pricePerSqm: 128_700, changeNominal: 28.9, changeReal: -5.9, yieldPct: 3.6, paybackYears: 28, listings: 94, daysOnMarket: 78, fromPeakPct: -3.1, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'goztepe', name: 'Göztepe', level: 'neighborhood', pricePerSqm: 91_200, changeNominal: 31.4, changeReal: -4.1, yieldPct: 4.4, paybackYears: 23, listings: 168, daysOnMarket: 61, fromPeakPct: -1.4, fromPeakPeriod: 'May 2026', quality: 'A' },
  { slug: 'erenkoy', name: 'Erenköy', level: 'neighborhood', pricePerSqm: 88_400, changeNominal: 35.6, changeReal: -1.0, yieldPct: 4.7, paybackYears: 21, listings: 143, daysOnMarket: 58, fromPeakPct: -0.6, fromPeakPeriod: 'Haz 2026', quality: 'A' },
  { slug: 'feneryolu', name: 'Feneryolu', level: 'neighborhood', pricePerSqm: 82_500, changeNominal: 34.0, changeReal: -2.2, yieldPct: 4.9, paybackYears: 20, listings: 121, daysOnMarket: 54, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'sahrayicedit', name: 'Sahrayıcedit', level: 'neighborhood', pricePerSqm: 74_900, changeNominal: 38.2, changeReal: 0.9, yieldPct: 5.3, paybackYears: 19, listings: 87, daysOnMarket: 49, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
  { slug: 'merdivenkoy', name: 'Merdivenköy', level: 'neighborhood', pricePerSqm: 69_800, changeNominal: 33.1, changeReal: -2.9, yieldPct: 5.5, paybackYears: 18, listings: 76, daysOnMarket: 52, fromPeakPct: -2.2, fromPeakPeriod: 'Nis 2026', quality: 'B' },
  { slug: 'fikirtepe', name: 'Fikirtepe', level: 'neighborhood', pricePerSqm: 61_300, changeNominal: 44.1, changeReal: 5.3, yieldPct: 6.1, paybackYears: 16, listings: 52, daysOnMarket: 41, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
  // Etkin örneklem 10'un altında → hiçbir fiyat metriği yayımlanmaz (plan §F).
  { slug: 'dumlupinar', name: 'Dumlupınar', level: 'neighborhood', pricePerSqm: 0, changeNominal: 0, changeReal: 0, yieldPct: 0, paybackYears: 0, listings: 14, daysOnMarket: 0, fromPeakPct: 0, fromPeakPeriod: '', quality: 'INSUFFICIENT' },
]

const ISTANBUL_ILCELER: RegionNode[] = [
  { slug: 'besiktas', name: 'Beşiktaş', level: 'district', pricePerSqm: 182_468, changeNominal: 30.1, changeReal: -5.0, yieldPct: 4.6, paybackYears: 22, listings: 1_284, daysOnMarket: 71, fromPeakPct: -2.4, fromPeakPeriod: 'Nis 2026', quality: 'A' },
  { slug: 'kadikoy', name: 'Kadıköy', level: 'district', pricePerSqm: 169_123, changeNominal: 25.1, changeReal: -8.1, yieldPct: 5.2, paybackYears: 19, listings: 2_106, daysOnMarket: 63, fromPeakPct: -4.8, fromPeakPeriod: 'Şub 2026', quality: 'A', children: KADIKOY_MAHALLELER },
  { slug: 'uskudar', name: 'Üsküdar', level: 'district', pricePerSqm: 86_400, changeNominal: 29.4, changeReal: -5.5, yieldPct: 5.4, paybackYears: 18, listings: 1_742, daysOnMarket: 66, fromPeakPct: -1.1, fromPeakPeriod: 'Haz 2026', quality: 'A' },
  { slug: 'atasehir', name: 'Ataşehir', level: 'district', pricePerSqm: 78_900, changeNominal: 32.7, changeReal: -3.2, yieldPct: 5.8, paybackYears: 17, listings: 1_318, daysOnMarket: 59, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'maltepe', name: 'Maltepe', level: 'district', pricePerSqm: 64_700, changeNominal: 35.9, changeReal: -0.7, yieldPct: 6.3, paybackYears: 16, listings: 1_465, daysOnMarket: 55, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'esenyurt', name: 'Esenyurt', level: 'district', pricePerSqm: 33_202, changeNominal: 28.2, changeReal: -6.4, yieldPct: 9.9, paybackYears: 10, listings: 3_871, daysOnMarket: 84, fromPeakPct: -7.3, fromPeakPeriod: 'Oca 2026', quality: 'A' },
  { slug: 'adalar', name: 'Adalar', level: 'district', pricePerSqm: 0, changeNominal: 0, changeReal: 0, yieldPct: 0, paybackYears: 0, listings: 9, daysOnMarket: 0, fromPeakPct: 0, fromPeakPeriod: '', quality: 'INSUFFICIENT' },
]

const ILLER: RegionNode[] = [
  { slug: 'istanbul', name: 'İstanbul', level: 'province', pricePerSqm: 65_078, changeNominal: 26.5, changeReal: -7.2, yieldPct: 5.7, paybackYears: 17, listings: 175_596, daysOnMarket: 64, fromPeakPct: -3.9, fromPeakPeriod: 'Şub 2026', quality: 'A', children: ISTANBUL_ILCELER },
  { slug: 'ankara', name: 'Ankara', level: 'province', pricePerSqm: 41_200, changeNominal: 24.1, changeReal: -9.0, yieldPct: 6.8, paybackYears: 15, listings: 98_412, daysOnMarket: 71, fromPeakPct: -5.2, fromPeakPeriod: 'Oca 2026', quality: 'A' },
  { slug: 'izmir', name: 'İzmir', level: 'province', pricePerSqm: 52_900, changeNominal: 29.8, changeReal: -4.9, yieldPct: 5.9, paybackYears: 17, listings: 76_303, daysOnMarket: 68, fromPeakPct: -2.7, fromPeakPeriod: 'Mar 2026', quality: 'A' },
  { slug: 'antalya', name: 'Antalya', level: 'province', pricePerSqm: 48_600, changeNominal: 33.4, changeReal: -2.4, yieldPct: 6.2, paybackYears: 16, listings: 61_889, daysOnMarket: 62, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'A' },
  { slug: 'bursa', name: 'Bursa', level: 'province', pricePerSqm: 34_100, changeNominal: 27.9, changeReal: -6.6, yieldPct: 7.1, paybackYears: 14, listings: 44_210, daysOnMarket: 74, fromPeakPct: -1.8, fromPeakPeriod: 'May 2026', quality: 'A' },
  { slug: 'tekirdag', name: 'Tekirdağ', level: 'province', pricePerSqm: 27_400, changeNominal: 31.2, changeReal: -3.9, yieldPct: 7.6, paybackYears: 13, listings: 19_744, daysOnMarket: 79, fromPeakPct: 0, fromPeakPeriod: 'Tem 2026', quality: 'B' },
]

const TURKIYE: RegionNode = {
  slug: '', name: 'Türkiye', level: 'country',
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
 */
function buildSeries(last: number, annualPct: number, period: Period, basis: PriceBasis, cpi: number, phase: number): TimeSeriesPoint[] {
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

function phaseFor(slug: string): number {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 997
  return (h / 997) * Math.PI * 2
}

function toSubRegionRow(node: RegionNode): SubRegionRow {
  const yeterli = node.quality !== 'INSUFFICIENT'
  return {
    id: node.slug,
    name: node.name,
    slug: node.slug,
    pricePerSqm: yeterli ? node.pricePerSqm : null,
    changeNominal: yeterli ? node.changeNominal : null,
    changeReal: yeterli ? node.changeReal : null,
    yieldPct: yeterli ? node.yieldPct : null,
    paybackYears: yeterli ? node.paybackYears : null,
    listings: node.listings,
    daysOnMarket: yeterli ? node.daysOnMarket : null,
    fromPeak: yeterli && node.fromPeakPeriod ? { pct: node.fromPeakPct, period: node.fromPeakPeriod } : null,
    quality: node.quality,
    trend: yeterli
      ? buildSeries(node.pricePerSqm, node.changeNominal, '1y', 'nominal', 0, phaseFor(node.slug)).map((p) => p.value ?? 0)
      : [],
  }
}

const SUB_REGION_LABEL: Record<RegionLevel, string> = {
  country: 'İller',
  province: 'İlçeler',
  district: 'Mahalleler',
  neighborhood: '',
}

const DAGILIM: DistributionBin[] = [
  { id: 'b1', label: '< 60 bin', count: 8 },
  { id: 'b2', label: '60–70 bin', count: 21 },
  { id: 'b3', label: '70–80 bin', count: 34 },
  { id: 'b4', label: '80–90 bin', count: 29, containsMedian: true },
  { id: 'b5', label: '90–100 bin', count: 17 },
  { id: 'b6', label: '100 bin +', count: 11 },
]

const CPI = 37.0

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

  const series = {} as IndexSnapshot['series']
  for (const period of ['1y', '3y', '5y'] as Period[]) {
    series[period] = {} as Record<PriceBasis, { own: TimeSeriesPoint[]; benchmarks: Array<{ id: string; label: string; points: TimeSeriesPoint[] }> }>
    for (const basis of ['nominal', 'reel'] as PriceBasis[]) {
      series[period][basis] = {
        own: buildSeries(node.pricePerSqm, node.changeNominal, period, basis, CPI, phaseFor(node.slug || 'tr')),
        benchmarks: ancestors.map((a) => ({
          id: a.slug || 'turkiye',
          label: `${a.name} ortalaması`,
          points: buildSeries(a.pricePerSqm, a.changeNominal, period, basis, CPI, phaseFor(a.slug || 'tr')),
        })),
      }
    }
  }

  const yeterli = node.quality !== 'INSUFFICIENT'
  const effectiveSample = Math.round(node.listings * 0.78)

  const snapshot: IndexSnapshot = {
    region,
    transactionType: path.transactionType,
    propertyType: path.propertyType,
    dataAsOf: 'Temmuz 2026',
    updateCadence: 'aylık güncellenir',
    headline: {
      medianPricePerSqm: metric(yeterli ? node.pricePerSqm : null, 'TRY_PER_SQM', {
        sampleSize: node.listings,
        effectiveSampleSize: effectiveSample,
        qualityGrade: node.quality,
      }),
      medianPrice: metric(yeterli ? Math.round(node.pricePerSqm * 106) : null, 'TRY'),
      grossYield: metric(yeterli ? node.yieldPct : null, 'PERCENT'),
      daysOnMarket: metric(yeterli ? node.daysOnMarket : null, 'DAYS'),
    },
    change: { nominal: node.changeNominal, real: node.changeReal, cpi: CPI },
    confidence: {
      score: node.quality === 'A' ? 78 : node.quality === 'B' ? 54 : 18,
      grade: node.quality,
      activeListings: node.listings,
      effectiveSample,
      interval: { lower: Math.round(node.pricePerSqm * 0.967), upper: Math.round(node.pricePerSqm * 1.031) },
      windowLabel: 'Son 30 günlük ilanlar kullanıldı; pencere genişletilmedi.',
    },
    series,
    distribution: {
      bins: DAGILIM,
      percentiles: [
        { id: 'p10', label: 'P10', value: `${Math.round(node.pricePerSqm * 0.78).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p25', label: 'P25', value: `${Math.round(node.pricePerSqm * 0.88).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p50', label: 'Medyan', value: `${node.pricePerSqm.toLocaleString('tr-TR')} TL/m²`, prominent: true },
        { id: 'p75', label: 'P75', value: `${Math.round(node.pricePerSqm * 1.11).toLocaleString('tr-TR')} TL/m²` },
        { id: 'p90', label: 'P90', value: `${Math.round(node.pricePerSqm * 1.26).toLocaleString('tr-TR')} TL/m²` },
      ],
      sampleSize: Math.min(node.listings, 120),
    },
    supply: {
      activeListings: node.listings,
      newListings: Math.round(node.listings * 0.28),
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
    subRegions: (node.children ?? []).map(toSubRegionRow),
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
        label: `${c.name} konut fiyatları`,
        href: buildPriceIndexHref(path, [...path.segments, c.slug]),
        meta: c.quality === 'INSUFFICIENT' ? 'yetersiz veri' : `${c.pricePerSqm.toLocaleString('tr-TR')} TL/m² · ${c.listings.toLocaleString('tr-TR')} ilan`,
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
          label: `${c.name} konut fiyatları`,
          href: buildPriceIndexHref(path, siblingSegments(c)),
          meta: c.quality === 'INSUFFICIENT' ? 'yetersiz veri' : `${c.pricePerSqm.toLocaleString('tr-TR')} TL/m²`,
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
