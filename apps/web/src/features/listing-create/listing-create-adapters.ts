import type {
  AiListingProposal,
  ListingDraft,
  ListingVerification,
  PublisherRole,
} from './listing-create-domain'

export class ListingAdapterError extends Error {
  constructor(
    public readonly code: 'SAVE_FAILED' | 'AI_UNAVAILABLE',
    message: string,
  ) {
    super(message)
    this.name = 'ListingAdapterError'
  }
}

export interface ListingAdapterScenario {
  delayMs?: number
  save?: 'success' | 'error' | 'error-once'
  ai?: 'success' | 'unavailable'
  eids?: 'verified' | 'unauthorized' | 'unavailable'
}

export interface VerifyEidsInput {
  role: Exclude<PublisherRole, ''>
  propertyNumber: string
}

export interface ListingAdapters {
  saveDraft(draft: ListingDraft): Promise<{ savedAt: string }>
  proposeFromText(sourceText: string): Promise<AiListingProposal>
  verifyEids(input: VerifyEidsInput): Promise<ListingVerification>
}

function wait(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve()
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function numericArea(text: string): string {
  const match = text.match(/(\d{2,6})\s*(?:m2|m²|metrekare)/i)
  return match?.[1] ?? ''
}

export function createListingAdapters(
  scenario: ListingAdapterScenario = {},
): ListingAdapters {
  const delayMs = scenario.delayMs ?? 450
  const saveScenario = scenario.save ?? 'success'
  const aiScenario = scenario.ai ?? 'success'
  const eidsScenario = scenario.eids ?? 'verified'
  let saveAttempts = 0

  return {
    async saveDraft() {
      await wait(delayMs)
      saveAttempts += 1
      if (
        saveScenario === 'error' ||
        (saveScenario === 'error-once' && saveAttempts === 1)
      ) {
        throw new ListingAdapterError('SAVE_FAILED', 'Taslak kaydedilemedi')
      }
      return { savedAt: '21:42' }
    },

    async proposeFromText(sourceText) {
      await wait(delayMs)
      if (aiScenario === 'unavailable') {
        throw new ListingAdapterError('AI_UNAVAILABLE', 'AI önerisi şu anda hazırlanamadı')
      }

      const lower = sourceText.toLocaleLowerCase('tr-TR')
      const isRent = lower.includes('kiralık')
      const family = lower.includes('arsa') || lower.includes('parsel')
        ? 'land'
        : lower.includes('iş yeri') ||
            lower.includes('işyeri') ||
            lower.includes('ofis') ||
            lower.includes('dükkan')
          ? 'commercial'
          : lower.includes('bina') || lower.includes('apartman')
            ? 'building'
            : 'residential'
      const district =
        [
          'urla',
          'çeşme',
          'seferihisar',
          'kadıköy',
          'beşiktaş',
          'sarıyer',
          'gölbaşı',
          'çankaya',
        ].find((value) => lower.includes(value)) ?? ''
      const city =
        lower.includes('izmir') ||
        ['urla', 'çeşme', 'seferihisar'].includes(district)
          ? 'izmir'
          : lower.includes('istanbul') ||
              ['kadıköy', 'beşiktaş', 'sarıyer'].includes(district)
            ? 'istanbul'
            : lower.includes('ankara') ||
                ['gölbaşı', 'çankaya'].includes(district)
              ? 'ankara'
              : ''
      const neighborhood = lower.includes('iskele') ? 'iskele' : ''
      const area = numericArea(sourceText)
      const subtype =
        family === 'land'
          ? 'zoned-land'
          : family === 'commercial'
            ? 'office'
            : family === 'building'
              ? 'apartment-building'
              : 'apartment'
      const displayDistrict = district
        ? district.charAt(0).toLocaleUpperCase('tr-TR') + district.slice(1)
        : ''

      return {
        property: {
          transaction: isRent ? 'rent' : 'sale',
          family,
          subtype,
          ...(family === 'land'
            ? {
                area,
                zoning: lower.includes('imarlı') ? 'residential' : '',
              }
            : { grossArea: area }),
        },
        location: {
          city,
          district,
          neighborhood,
        },
        content: {
          title:
            district && family === 'land'
              ? `${displayDistrict}’da imarlı, yola cepheli köşe parsel`
              : district
                ? `${displayDistrict}’da özellikleriyle öne çıkan mülk`
                : 'Konumu ve özellikleriyle öne çıkan mülk',
          description:
            'Mülkün temel özellikleri sade ve doğrulanabilir bir anlatımla hazırlandı. Tapu, konum ve imar bilgilerini kontrol ederek devam edin.',
        },
        confidence: 91,
        sourceText,
      }
    },

    async verifyEids(input) {
      await wait(delayMs)
      if (eidsScenario === 'unauthorized') {
        return {
          status: 'unauthorized',
          verifiedRole: null,
          verifiedPropertyNumber: null,
          propertyReference: '',
          errorCode: 'NO_AUTHORITY',
        }
      }
      if (eidsScenario === 'unavailable') {
        return {
          status: 'unavailable',
          verifiedRole: null,
          verifiedPropertyNumber: null,
          propertyReference: '',
          errorCode: 'SERVICE_UNAVAILABLE',
        }
      }
      return {
        status: 'verified',
        verifiedRole: input.role,
        verifiedPropertyNumber: input.propertyNumber,
        propertyReference: `EIDS-DEMO-${input.propertyNumber}`,
        errorCode: null,
      }
    },
  }
}
