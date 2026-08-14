/**
 * Emlak Endeksi alan tipleri.
 *
 * `features/regions/` ile bilinçli olarak ayrıdır: orası "keşif dizini" (6 sabit
 * bölge, tek skaler `priceTrend`), burası zaman serili endeks ürünü. Ortak nokta
 * yalnız il/ilçe anahtarlarıdır (bkz. docs/emlak-endeksi-arastirma-ve-plan-2026-08-05.md §E).
 */

/** Coğrafi kırılım seviyesi — şablon recursive'dir, seviye blokları kırpar. */
export type RegionLevel = 'country' | 'province' | 'district' | 'neighborhood'

export type TransactionType = 'satilik' | 'kiralik'
export type PropertyType = 'konut' | 'isyeri' | 'arsa'

/** Grafik dönemi. */
export type Period = '1y' | '3y' | '5y'

/** Nominal mi enflasyondan arındırılmış mı — Türkiye'de bu ayrım zorunludur. */
export type PriceBasis = 'nominal' | 'reel'

/**
 * Veri kalite notu. Yayın eşiği bu nota bağlıdır: `INSUFFICIENT` olan bölgede
 * hiçbir fiyat metriği yayımlanmaz (plan §F).
 */
export type QualityGrade = 'A' | 'B' | 'C' | 'INSUFFICIENT'

/**
 * Bir metriğin değeri + nereden geldiği + ne kadar güvenilir olduğu.
 * `null` değer "sıfır" değil "yayımlanmadı" demektir; ikisi karıştırılmaz.
 */
export interface MetricValue {
  value: number | null
  unit: 'TRY' | 'TRY_PER_SQM' | 'PERCENT' | 'COUNT' | 'DAYS' | 'YEARS'
  /** Kendi ölçümümüz mü, model çıktısı mı, resmî seri mi */
  observationType: 'observed' | 'estimated' | 'official'
  source: 'LISTINGS' | 'TCMB' | 'TUIK'
  sampleSize?: number
  /** Tekilleştirme sonrası kalan bağımsız gözlem — ham ilan sayısı DEĞİLDİR */
  effectiveSampleSize?: number
  confidence?: { level: number; lower: number; upper: number }
  qualityGrade: QualityGrade
  suppressed: boolean
  suppressionReason?: string
}

/** Zaman serisinin tek noktası; `value: null` yayımlanmayan dönemdir. */
export interface TimeSeriesPoint {
  period: string
  value: number | null
}

/** Bölge kimliği — ad değişse de `id` sabit kalır (plan §E). */
export interface Region {
  id: string
  level: RegionLevel
  name: string
  slug: string
  /** Kökten kendisine kadar tüm atalar (breadcrumb kaynağı) */
  path: Array<{ id: string; level: RegionLevel; name: string; slug: string }>
}

/** Alt bölge sıralama tablosunun bir satırı. */
export interface SubRegionRow {
  id: string
  name: string
  slug: string
  pricePerSqm: number | null
  changeNominal: number | null
  changeReal: number | null
  yieldPct: number | null
  paybackYears: number | null
  listings: number
  daysOnMarket: number | null
  /** Zirveden bugüne fark (%) ve zirvenin dönemi — TR'de kimsede yok, plan §C.7a */
  fromPeak: { pct: number; period: string } | null
  quality: QualityGrade
  /** Satır içi sparkline serisi; yetersiz örneklemde boş */
  trend: number[]
}

/** Fiyat dağılımı bandı. */
export interface DistributionBin {
  id: string
  label: string
  count: number
  containsMedian?: boolean
}

/** Kategorik demografi payı — GlassBarList satırıyla bire bir eşleşir. */
export interface DemographicShare {
  id: string
  label: string
  pct: number
}

/**
 * Bölgenin demografik profili (sahibindex deseni: 4 özet metrik + iki pay
 * listesi + alt bölge nüfus dağılımı). Kaynak resmî nüfus verisidir (TÜİK),
 * fiyat metriklerinden farklı olarak seyrek güncellenir.
 */
export interface Demographics {
  population: number
  averageAge: number
  femalePct: number
  malePct: number
  marriedPct: number
  singlePct: number
  ageBands: DemographicShare[]
  education: DemographicShare[]
  /**
   * Nüfus dağılımı listesi: alt kırılımı olan bölgede çocuklar (vurgusuz),
   * yaprak bölgede kardeşler + kendisi (`prominent`).
   */
  subRegionPopulation: {
    label: string
    items: Array<{ id: string; label: string; population: number; prominent?: boolean }>
  }
  /** "TÜİK 2025 ADNKS" gibi kaynak künyesi */
  sourceLabel: string
}

/** Konut özelliği kırılım satırı (oda sayısı, bina yaşı). */
export interface BreakdownRow {
  id: string
  label: string
  pricePerSqm: number
  medianPrice: number
  changeNominal: number
  listings: number
  /** Segmentin ilan stoğundaki payı — satırlar 100'e tamamlanır */
  sharePct: number
}

/** Bir bölgenin tek dönemlik endeks anlık görüntüsü. */
export interface IndexSnapshot {
  region: Region
  transactionType: TransactionType
  propertyType: PropertyType
  /** Verinin ait olduğu dönem ("Temmuz 2026") */
  dataAsOf: string
  updateCadence: string
  headline: {
    medianPricePerSqm: MetricValue
    medianPrice: MetricValue
    grossYield: MetricValue
    daysOnMarket: MetricValue
  }
  /** Nominal ve reel değişim birlikte — biri diğeri olmadan yayımlanmaz */
  change: { nominal: number; real: number; cpi: number }
  confidence: {
    score: number
    grade: QualityGrade
    activeListings: number
    effectiveSample: number
    interval: { lower: number; upper: number }
    windowLabel: string
  }
  /** Kendi serimiz + üst bölge referansları (yakından uzağa sıralı) */
  series: Record<Period, Record<PriceBasis, { own: TimeSeriesPoint[]; benchmarks: Array<{ id: string; label: string; points: TimeSeriesPoint[] }> }>>
  distribution: { bins: DistributionBin[]; percentiles: Array<{ id: string; label: string; value: string; prominent?: boolean }>; sampleSize: number }
  supply: { activeListings: number; newListings: number; stockRatio: number; priceCutShare: number }
  investment: { grossYield: number; paybackYears: number; rentMultiplier: number; medianRentPerSqm: number; liquidityScore: number }
  /** Konut özelliği kırılımları — filtre değil bilgi tablosu (sahibindex'in aksine) */
  breakdowns: { rooms: BreakdownRow[]; buildingAge: BreakdownRow[] }
  demographics: Demographics
  /** Bir alt seviyedeki bölgeler; mahalle seviyesinde boş */
  subRegions: SubRegionRow[]
  subRegionLabel: string
}

/** Bir endeks isteğinin çözümü. */
export interface PriceIndexResult {
  snapshot: IndexSnapshot
  /** Kardeş/komşu bölge bağlantıları — iç linkleme rafı */
  discovery: Array<{ id: string; title: string; href?: string; hubLabel?: string; links: Array<{ id: string; label: string; href: string; meta?: string }> }>
}
