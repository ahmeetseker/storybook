import {
  freshnessFrom,
  hasConflict,
  isAnswered,
  type EvidenceValue,
} from '../domain/evidence'
import type { LandListingDetail, ListingDetail } from '../domain/listing-detail-types'
import {
  criticalIssues,
  medianPosition,
  medianPositionPhrase,
} from '../domain/listing-detail-view-model'
import { formatArea, formatNumber } from '../format'
import { OREN_LAND_LISTING } from './listing-detail-fixtures'

/** Storybook ve testlerin açıkça seçtiği durum senaryoları. */
export type ListingDetailScenario =
  | 'default'
  | 'stale-planning'
  | 'ai-unavailable'
  | 'map-unavailable'
  | 'inactive'
  | 'not-found'

/** Bölüm bazlı hata izolasyonu: tek sağlayıcı hatası tüm ilanı kapatmaz. */
export type ListingDetailSection = 'core' | 'map' | 'planning' | 'market' | 'ai'

export type SectionState<T> = { state: 'ready'; data: T } | { state: 'unavailable'; reason: string }

export interface AiClaim {
  id: string
  text: string
  /** Bölüm çapası — her iddia sayfadaki bir kanıt bölümüne bağlanır */
  sectionId: 'parsel' | 'imar' | 'altyapi' | 'arazi' | 'piyasa' | 'belgeler'
}

export interface AiDecisionBrief {
  summary: string
  claims: AiClaim[]
  unknowns: string[]
  nextChecks: string[]
  modelVersion: string
  evidenceCutoff: string
}

export interface ListingDetailResult {
  detail: ListingDetail
  sections: Record<ListingDetailSection, SectionState<true>>
  aiBrief: SectionState<AiDecisionBrief>
}

const READY: SectionState<true> = { state: 'ready', data: true }

/**
 * `stale-planning` senaryosunda plan durumunun sorgu/belge tarihi.
 * Kanıt kesitinden (2026-07-24) 312 gün önce — `freshnessFrom`'un 180 günlük
 * `stale` eşiğinin açıkça ötesinde.
 */
const STALE_PLAN_QUERY = '2025-09-15T00:00:00.000Z'

/**
 * Kaynaklı karar özetini kanıt defterinden üretir.
 *
 * Karşılaştırmalı sayılar burada **donmuş sabit değildir**: emsal konumu
 * `medianPosition` ile, kritik konuların varlığı `criticalIssues` ile — yani
 * sayfadaki bölümlerin kullandığı aynı hesapla — türetilir. Aksi hâlde ilk
 * fixture değişikliğinde "kaynaklı" özet, altındaki kanıtla çelişirdi.
 *
 * Test için dışa açıktır: değiştirilmiş bir defterle çağrılıp sayıların
 * birlikte değişip değişmediği doğrulanır.
 */
export function briefFor(detail: LandListingDetail): AiDecisionBrief {
  const issues = criticalIssues(detail)
  const hasIssue = (id: string) => issues.some((issue) => issue.id === id)

  const median = detail.market.comparableMedianUnitPrice.value
  const comparisonPhrase =
    median !== undefined
      ? medianPositionPhrase(medianPosition(detail.price.unitPrice, median))
      : undefined

  const claims: AiClaim[] = []
  if (comparisonPhrase) {
    claims.push({
      id: 'price-vs-median',
      text: `${formatNumber(detail.market.comparableCount)} ilanlık kesitte birim fiyat ${comparisonPhrase}.`,
      sectionId: 'piyasa',
    })
  }
  claims.push({
    id: 'terrain-fit',
    text: 'Eğim ve bakı ölçümleri küçük ölçekli tesis için elverişli; ölçüm değerleri Arazi bölümünde.',
    sectionId: 'arazi',
  })
  if (hasIssue('shared-title-deed')) {
    const share = detail.planning.shared.share
    claims.push({
      id: 'shared-deed',
      text: share
        ? `Tapu hisseli; ilan ${share} pay için veriliyor.`
        : 'Tapu hisseli; ilan taşınmazın tamamı için verilmiyor.',
      sectionId: 'imar',
    })
  }
  if (hasIssue('legal-access-unverified')) {
    claims.push({
      id: 'legal-access',
      text: 'Yasal yol erişimini gösteren kadastral kayıt bulunamadı.',
      sectionId: 'altyapi',
    })
  }
  claims.push({
    id: 'plan-pending',
    text: `Kullanım kararının dayandığı ${detail.planning.planScale ?? 'uygulama'} plan askıda, yürürlükte değil.`,
    sectionId: 'imar',
  })

  const unknowns = ['TAKBİS takyidat kaydı platformda yok', 'Planın kesinleşme takvimi belirsiz']
  const recordedArea = detail.parcel.area.value
  if (hasConflict(detail.parcel.area) && recordedArea !== undefined) {
    const gap = Math.abs(detail.price.declaredArea - recordedArea)
    unknowns.push(`Yüzölçümü çelişkisi çözülmedi (${formatArea(gap)})`)
  }

  return {
    summary: comparisonPhrase
      ? `Birim fiyat ${comparisonPhrase} ve arazi küçük ölçekli bir tesis için elverişli; ancak tapu hisseli, yasal yol erişimi doğrulanamadı ve kullanım kararının dayandığı plan henüz yürürlükte değil.`
      : 'Arazi küçük ölçekli bir tesis için elverişli; ancak tapu hisseli, yasal yol erişimi doğrulanamadı ve kullanım kararının dayandığı plan henüz yürürlükte değil. Emsal kesiti üretilemediği için fiyat karşılaştırması yapılmadı.',
    claims,
    unknowns,
    nextChecks: [
      'Güncel takyidat belgesi isteyin',
      'Parsel bazlı imar durum belgesi isteyin',
      'Yol erişim / irtifak kaydını sorun',
      'Diğer paydaşların satışa katılımını teyit edin',
    ],
    modelVersion: 'v2.4',
    evidenceCutoff: detail.evidenceCutoff,
  }
}

/**
 * Bir düğümün kanıt değeri olup olmadığını yapısından anlar.
 *
 * Alan listesi yerine şekil kontrolü kullanılır: defter büyüdükçe yeni bir
 * `EvidenceValue` alanının normalizasyondan sessizce kaçması mümkün olmasın.
 */
function isEvidenceValue(node: object): node is EvidenceValue<unknown> {
  const candidate = node as Partial<EvidenceValue<unknown>>
  return (
    typeof candidate.retrievedAt === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.source === 'object' &&
    candidate.source !== null
  )
}

/** Defterdeki her kanıt değerini bir kez ziyaret eder (kanıt değerleri iç içe geçmez). */
function forEachEvidenceValue(node: unknown, visit: (value: EvidenceValue<unknown>) => void): void {
  if (Array.isArray(node)) {
    for (const item of node) forEachEvidenceValue(item, visit)
    return
  }
  if (typeof node !== 'object' || node === null) return
  if (isEvidenceValue(node)) {
    visit(node)
    return
  }
  for (const item of Object.values(node)) forEachEvidenceValue(item, visit)
}

/**
 * Güncelliği `now`'a göre yeniden hesaplar.
 *
 * Fixture'daki `freshness` alanları yalnız varsayılandır; tek doğru kaynak
 * tarihlerdir. Elle yazılan bir bayrak, sayfa bir yıl sonra açıldığında da
 * 2026 sorgusuna "güncel" demeye devam ederdi. Cevapsız değerde güncellik
 * yoktur: `unknown` kalır — sorgunun dün yapılmış olması, olmayan veriyi
 * güncel yapmaz.
 */
function normalizeFreshness(detail: LandListingDetail, now: string): void {
  forEachEvidenceValue(detail, (value) => {
    value.freshness = isAnswered(value)
      ? freshnessFrom(value.retrievedAt, now, value.effectiveAt)
      : 'unknown'
  })
}

function withScenario(base: LandListingDetail, scenario: ListingDetailScenario): LandListingDetail {
  // Derin kopya: dönen `detail` hem modül düzeyindeki fixture'dan hem her
  // çağrının kendi sonucundan bağımsız olmalı — aksi halde bir tüketicinin
  // (ör. Storybook kontrolü, normalizer) iç içe bir diziyi/nesneyi mutasyona
  // uğratması fixture'ı süreç ömrü boyunca kalıcı olarak bozar.
  const clone = structuredClone(base)

  if (scenario === 'stale-planning') {
    // Kaynağın bayatladığı hâl: varsayılanda plan durumu kanıt kesitiyle aynı
    // gün sorgulanmış (`current`). Bu senaryoda sorgu ve belge tarihi kesitten
    // ~10 ay geriye alınır — bayrak elle konmaz, `normalizeFreshness` tarihten
    // türetir. `landUse` zaten her senaryoda bayattır.
    clone.planning.planStatus.effectiveAt = STALE_PLAN_QUERY
    clone.planning.planStatus.retrievedAt = STALE_PLAN_QUERY
    return clone
  }
  if (scenario === 'inactive') {
    clone.lifecycle = 'expired'
    return clone
  }
  return clone
}

/**
 * İlan detayını normalize edilmiş kanıt defteri olarak yükler.
 *
 * `now` çağıran tarafından verilir; adapter zamanı kendisi okumaz — böylece
 * test ve prerender çıktıları deterministik kalır. `now` süs değildir:
 * defterdeki her kanıt değerinin güncelliği ona göre yeniden hesaplanır.
 */
export async function loadListingDetail(input: {
  listingId: string
  scenario?: ListingDetailScenario
  now: string
}): Promise<ListingDetailResult | null> {
  const scenario = input.scenario ?? 'default'
  if (scenario === 'not-found' || input.listingId !== OREN_LAND_LISTING.id) return null

  const detail = withScenario(OREN_LAND_LISTING, scenario)
  normalizeFreshness(detail, input.now)

  return {
    detail,
    sections: {
      core: READY,
      map:
        scenario === 'map-unavailable'
          ? { state: 'unavailable', reason: 'Harita servisine ulaşılamadı. Konum ve parsel bilgisi tablo olarak aşağıdadır.' }
          : READY,
      planning: READY,
      market: READY,
      ai:
        scenario === 'ai-unavailable'
          ? { state: 'unavailable', reason: 'Asistan şu anda yanıt veremiyor.' }
          : READY,
    },
    aiBrief:
      scenario === 'ai-unavailable'
        ? {
            state: 'unavailable',
            reason:
              'Karar özeti şu anda üretilemiyor. Aşağıdaki kaynaklı ilan bilgileri eksiksiz kullanılabilir.',
          }
        : { state: 'ready', data: briefFor(detail) },
  }
}
