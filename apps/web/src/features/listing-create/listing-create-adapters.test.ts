import { describe, expect, it } from 'vitest'
import { createListingAdapters, ListingAdapterError } from './listing-create-adapters'
import { createEmptyDraft } from './listing-create-domain'

describe('listing-create adapters', () => {
  it('returns a deterministic AI proposal without mutating the draft', async () => {
    const draft = createEmptyDraft()
    const adapters = createListingAdapters({ delayMs: 0, ai: 'success' })

    const proposal = await adapters.proposeFromText(
      'Urla İskele’de 512 metrekare konut imarlı satılık arsa',
    )

    expect(proposal.confidence).toBe(91)
    expect(proposal.property.family).toBe('land')
    expect(proposal.property.area).toBe('512')
    expect(proposal.location.district).toBe('urla')
    expect(draft.content.title).toBe('')
  })

  it('exposes a typed autosave error selected by scenario', async () => {
    const adapters = createListingAdapters({ delayMs: 0, save: 'error' })

    await expect(adapters.saveDraft(createEmptyDraft())).rejects.toEqual(
      new ListingAdapterError('SAVE_FAILED', 'Taslak kaydedilemedi'),
    )
  })

  it('recovers when a one-time autosave failure is retried', async () => {
    const adapters = createListingAdapters({ delayMs: 0, save: 'error-once' })
    const draft = createEmptyDraft()

    await expect(adapters.saveDraft(draft)).rejects.toEqual(
      new ListingAdapterError('SAVE_FAILED', 'Taslak kaydedilemedi'),
    )
    await expect(adapters.saveDraft(draft)).resolves.toEqual({ savedAt: '21:42' })
  })

  it('returns role-aware EİDS verification in success scenario', async () => {
    const adapters = createListingAdapters({ delayMs: 0, eids: 'verified' })

    const result = await adapters.verifyEids({
      role: 'agency',
      propertyNumber: '980124771',
    })

    expect(result).toEqual({
      status: 'verified',
      verifiedRole: 'agency',
      verifiedPropertyNumber: '980124771',
      propertyReference: 'EIDS-DEMO-980124771',
      errorCode: null,
    })
  })

  it('returns unauthorized and unavailable states without randomness', async () => {
    const unauthorized = createListingAdapters({ delayMs: 0, eids: 'unauthorized' })
    const unavailable = createListingAdapters({ delayMs: 0, eids: 'unavailable' })

    await expect(
      unauthorized.verifyEids({ role: 'owner', propertyNumber: '980124771' }),
    ).resolves.toMatchObject({ status: 'unauthorized', errorCode: 'NO_AUTHORITY' })
    await expect(
      unavailable.verifyEids({ role: 'owner', propertyNumber: '980124771' }),
    ).resolves.toMatchObject({ status: 'unavailable', errorCode: 'SERVICE_UNAVAILABLE' })
  })
})
