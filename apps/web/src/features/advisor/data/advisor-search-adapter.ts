import { LISTING_FIXTURES, type ListingSummary } from '../../listings/data/listing-adapter'
import { matchAdvisorListings } from '../domain/advisor-matcher'
import type {
  AdvisorProposal,
  AdvisorSearchResult,
} from '../domain/advisor-types'

function abortError() {
  return new DOMException('Advisor search aborted', 'AbortError')
}

function abortableDelay(delayMs: number, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.reject(abortError())

  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof globalThis.setTimeout>
    const onAbort = () => {
      globalThis.clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(abortError())
    }
    timer = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export interface AdvisorSearchAdapter {
  search(
    proposal: AdvisorProposal,
    options?: { signal?: AbortSignal },
  ): Promise<AdvisorSearchResult>
}

export function createFixtureAdvisorSearchAdapter({
  listings = LISTING_FIXTURES,
  delayMs = 320,
  fail = false,
}: {
  listings?: ListingSummary[]
  delayMs?: number
  fail?: boolean
} = {}): AdvisorSearchAdapter {
  return {
    async search(proposal, options) {
      await abortableDelay(delayMs, options?.signal)
      if (fail) throw new Error('İlanlar şu anda hazırlanamadı.')
      return {
        proposal,
        matches: matchAdvisorListings(proposal.criteria, listings),
        generatedAt: '2026-07-26T12:00:00.000Z',
      }
    },
  }
}
