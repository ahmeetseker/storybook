import type { LandListingDetail, ListingDetail } from '../domain/listing-detail-types'
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

function briefFor(detail: LandListingDetail): AiDecisionBrief {
  return {
    summary:
      'Birim fiyat emsal medyanının altında ve arazi küçük ölçekli bir tesis için elverişli; ancak tapu hisseli, yasal yol erişimi doğrulanamadı ve kullanım kararının dayandığı plan henüz yürürlükte değil.',
    claims: [
      { id: 'price-vs-median', text: 'Birim fiyat 14 ilan emsalinin medyanının %9 altında.', sectionId: 'piyasa' },
      { id: 'terrain-fit', text: 'Güney bakı ve %12 ortalama eğim küçük ölçekli tesis için elverişli.', sectionId: 'arazi' },
      { id: 'shared-deed', text: 'Tapu hisseli; ilan 2/4 pay için veriliyor.', sectionId: 'imar' },
      { id: 'legal-access', text: 'Yasal yol erişimini gösteren kadastral kayıt bulunamadı.', sectionId: 'altyapi' },
      { id: 'plan-pending', text: 'Kullanım kararının dayandığı 1/1000 plan askıda, yürürlükte değil.', sectionId: 'imar' },
    ],
    unknowns: [
      'TAKBİS takyidat kaydı platformda yok',
      'Planın kesinleşme takvimi belirsiz',
      'Yüzölçümü çelişkisi çözülmedi (138 m²)',
    ],
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

function withScenario(base: LandListingDetail, scenario: ListingDetailScenario): LandListingDetail {
  if (scenario === 'stale-planning') {
    return {
      ...base,
      planning: {
        ...base.planning,
        landUse: { ...base.planning.landUse, freshness: 'stale' },
      },
    }
  }
  if (scenario === 'inactive') {
    return { ...base, lifecycle: 'expired' }
  }
  return base
}

/**
 * İlan detayını normalize edilmiş kanıt defteri olarak yükler.
 *
 * `now` çağıran tarafından verilir; adapter zamanı kendisi okumaz — böylece
 * test ve prerender çıktıları deterministik kalır.
 */
export async function loadListingDetail(input: {
  listingId: string
  scenario?: ListingDetailScenario
  now: string
}): Promise<ListingDetailResult | null> {
  const scenario = input.scenario ?? 'default'
  if (scenario === 'not-found' || input.listingId !== OREN_LAND_LISTING.id) return null

  const detail = withScenario(OREN_LAND_LISTING, scenario)

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
