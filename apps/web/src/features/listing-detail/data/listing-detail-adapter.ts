import {
  decaysOverTime,
  freshnessFrom,
  hasConflict,
  isAnswered,
  type EvidenceValue,
} from '../domain/evidence'
import { LISTING_FIXTURES } from '@/features/listings/data/listing-adapter'
import type { LandListingDetail, ListingDetail } from '../domain/listing-detail-types'
import {
  landCriticalIssues,
  medianPosition,
  medianPositionPhrase,
} from '../domain/listing-detail-view-model'
import { formatArea, formatNumber } from '../format'
import { OREN_LAND_LISTING } from './listing-detail-fixtures'
import { projectListingDetail } from './listing-detail-projection'

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
 * `medianPosition` ile, kritik konuların varlığı `landCriticalIssues` ile —
 * yani sayfadaki bölümlerin kullandığı aynı hesapla — türetilir. Aksi hâlde
 * ilk fixture değişikliğinde "kaynaklı" özet, altındaki kanıtla çelişirdi.
 *
 * **Yalnız arsa defteri için geçerlidir.** Parametre tipi `LandListingDetail`
 * olduğu için yansıtılmış bir ilanla çağrılamaz: o ilanlarda emsal kesiti,
 * plan durumu ve hisse bilgisi yoktur; buradaki cümleler onlar için üretilse
 * dayanağı olmayan sayılar yazardı.
 *
 * Test için dışa açıktır: değiştirilmiş bir defterle çağrılıp sayıların
 * birlikte değişip değişmediği doğrulanır.
 */
export function briefFor(detail: LandListingDetail): AiDecisionBrief {
  const issues = landCriticalIssues(detail)
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

/**
 * Defterdeki her kanıt değerini bir kez ziyaret eder (kanıt değerleri iç içe
 * geçmez). Testler de bunu kullanır: defterin tamamını taramak, bir işaretin
 * (ör. `freshnessPolicy: 'durable'`) sessizce yayılmasını yakalamanın tek
 * güvenilir yoludur.
 */
export function forEachEvidenceValue(
  node: unknown,
  visit: (value: EvidenceValue<unknown>) => void,
): void {
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
 * Zamana duyarlı değerlerde fixture'daki `freshness` yalnız varsayılandır;
 * tek doğru kaynak tarihlerdir. Elle yazılan bir bayrak, sayfa bir yıl sonra
 * açıldığında da 2026 sorgusuna "güncel" demeye devam ederdi.
 *
 * İki istisna vardır ve ikisi de veri katmanında beyan edilir, burada alan
 * adına göre özel-durum yazılmaz:
 *
 * - `freshnessPolicy: 'durable'` değerler takvimle bayatlamaz (kadastral
 *   kimlik, yürürlükteki resmî harita sürümü). Onlara 90/180 günlük eşiği
 *   uygulamak ters yönde bir aşırı iddiadır: sağlam resmî veriyi "Güncel
 *   değil" diye şüpheye düşürür. Bu değerler defterde ne yazıyorsa onu korur.
 * - Cevapsız değerde güncellik yoktur: `unknown` kalır — sorgunun dün
 *   yapılmış olması, olmayan veriyi güncel yapmaz.
 */
function normalizeFreshness(detail: ListingDetail, now: string): void {
  forEachEvidenceValue(detail, (value) => {
    if (!decaysOverTime(value)) return
    value.freshness = isAnswered(value)
      ? freshnessFrom(value.retrievedAt, now, value.effectiveAt)
      : 'unknown'
  })
}

/**
 * Herkese açık olmayan yanıtları YÜKTEN çıkarır.
 *
 * Görünürlük filtresi yalnız görünüm katmanında yaşayamaz: loader'ın döndürdüğü
 * her şey sunucudan gelen HTML'e hidrasyon yükü olarak gömülür ve kaynağı açan
 * herkes okur. Gizlenmiş bir yanıt ekranda çizilmese de metni orada dursaydı,
 * "gizleme" yalnız bir CSS numarası olurdu.
 *
 * Bu, telefon numarası için zaten yazılı olan kuralın (§7 — "numara loader'da
 * getirilmez") soru-cevap karşılığıdır. Şu anda **hiçbir** görünürlük
 * kısıtlı yanıt istemciye gönderilmez; ilan sahibinin kendi gizlediğini
 * okuyabilmesi, oturumu doğrulayan ayrı bir uç nokta işidir (bkz. rules.md
 * §7b "kalan iş"). Bileşendeki `canSee` bu filtreyi tekrarlar — iki katman da
 * bilerek korur, biri diğerinin yedeğidir.
 */
function redactQna(detail: ListingDetail): void {
  if (!detail.qna) return
  for (const entry of detail.qna.entries) {
    entry.replies = entry.replies.filter(
      (reply) => reply.visibility === undefined || reply.visibility === 'public',
    )
  }
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
 * Yansıtılmış ilanlarda bölüm durumlarının gerekçeleri.
 *
 * Bunlar bir sağlayıcı arızası değil, **kapsam bildirimidir**: bu ilanlar için
 * ilgili sorgu hiç yapılmamıştır. Gerekçe her durumda kullanıcıya görünür bir
 * cümledir; sessizce boş bölüm bırakılmaz.
 */
const PROJECTED_MAP_REASON =
  'Bu ilan kaydında parsel geometrisi veya coğrafi koordinat yok; konum bölümünde yalnız şematik bir yerleşim çizilir, harita gösterilmiyor.'
const PROJECTED_PLANNING_REASON =
  'Bu ilan için imar ve tapu sorgusu yapılmadı; alanlar Beyan Edilen Özellikler bölümünde gerekçeleriyle listelenir.'
const PROJECTED_MARKET_REASON =
  'Bu ilan için emsal kesiti derlenmedi; fiyat karşılaştırması yapılmaz.'

/**
 * Karar özeti neden üretilmiyor?
 *
 * Yansıtılmış ilanda özetlenecek bir kanıt defteri yoktur: sayfadaki bütün
 * içerik ilan sahibinin beyanıdır. Bu beyanları "ArsaPazar asistanı" imzasıyla
 * özetlemek, doğrulanmamış bilgiye platformun sesini ödünç vermek olurdu —
 * yani tam da bu sayfanın kaçındığı şey. Bu yüzden brief hiç üretilmez ve
 * yerine gerekçe durur.
 */
const PROJECTED_BRIEF_REASON =
  'Bu ilan için kanıt defteri henüz derlenmedi. Karar özeti yalnız kaynaklı kanıtlardan üretilir; aşağıdaki bilgiler ilan sahibinin beyanıdır ve özetlenerek doğrulanmış görünüm kazanmamalıdır.'

/**
 * Arama kaydından yansıtılmış ilan sonucu.
 *
 * `briefFor` burada **çağrılmaz**: tipi arsa defterine bağlıdır ve bu ilanlar
 * için üreteceği sayıların dayanağı yoktur.
 */
function projectedResult(
  summary: (typeof LISTING_FIXTURES)[number],
  scenario: ListingDetailScenario,
  now: string,
): ListingDetailResult {
  const detail = projectListingDetail(summary, now)
  if (scenario === 'inactive') detail.lifecycle = 'expired'
  normalizeFreshness(detail, now)

  return {
    detail,
    sections: {
      core: READY,
      map: { state: 'unavailable', reason: PROJECTED_MAP_REASON },
      planning: { state: 'unavailable', reason: PROJECTED_PLANNING_REASON },
      market: { state: 'unavailable', reason: PROJECTED_MARKET_REASON },
      ai: { state: 'unavailable', reason: PROJECTED_BRIEF_REASON },
    },
    aiBrief: { state: 'unavailable', reason: PROJECTED_BRIEF_REASON },
  }
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
  if (scenario === 'not-found') return null

  if (input.listingId !== OREN_LAND_LISTING.id) {
    const summary = LISTING_FIXTURES.find((item) => item.id === input.listingId)
    // Ne referans defter ne arama kaydı: ilan gerçekten yok.
    if (!summary) return null
    const projected = projectedResult(summary, scenario, input.now)
    redactQna(projected.detail)
    return projected
  }

  const detail = withScenario(OREN_LAND_LISTING, scenario)
  normalizeFreshness(detail, input.now)
  // Görünürlük filtresi loader'ın TEK çıkışında uygulanır: iki dönüş yolundan
  // birini atlamak, gizlenmiş metni hidrasyon yüküne geri sokardı.
  redactQna(detail)

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
