import { describe, expect, it } from 'vitest'
import {
  applyAiProposal,
  canPublish,
  createEmptyDraft,
  formatUnitPrice,
  getCompletion,
  getStepValidation,
  LISTING_STEPS,
  type AiListingProposal,
  type ListingDraft,
  type ListingMediaItem,
} from './listing-create-domain'

function readyPhoto(id: string, isCover = false): ListingMediaItem {
  return {
    id,
    name: `${id}.jpg`,
    src: `blob:${id}`,
    status: 'ready',
    isCover,
    caption: '',
    qualityHints: [],
  }
}

function createCompleteDraft(): ListingDraft {
  return {
    ...createEmptyDraft(),
    entryMode: 'manual',
    property: {
      transaction: 'sale',
      family: 'land',
      subtype: 'zoned-land',
      publisherRole: 'owner',
      area: '512',
      zoning: 'residential',
      deedType: 'detached',
      rooms: '',
      grossArea: '',
      netArea: '',
      buildingAge: '',
      usageStatus: '',
      floorCount: '',
      independentUnitCount: '',
    },
    location: {
      city: 'izmir',
      district: 'urla',
      neighborhood: 'İskele',
      address: 'İskele Mahallesi',
      latitude: 38.322,
      longitude: 26.764,
      precision: 'approximate',
      propertyNumber: '980124771',
      island: '118',
      parcel: '24',
      buildingNumber: '',
    },
    media: [readyPhoto('one', true), readyPhoto('two'), readyPhoto('three')],
    content: {
      price: '4250000',
      title: 'Urla’da imarlı, yola cepheli köşe parsel',
      description:
        'İskele Mahallesi’nde konut imarlı, müstakil tapulu ve kadastro yoluna cepheli parsel.',
      highlights: ['Konut imarlı', 'Müstakil tapu'],
      riskAccepted: true,
      legalConsent: true,
    },
    verification: {
      status: 'verified',
      verifiedRole: 'owner',
      verifiedPropertyNumber: '980124771',
      propertyReference: 'EIDS-2026-11824',
      errorCode: null,
    },
  }
}

describe('listing-create domain', () => {
  it('empty property section stays incomplete', () => {
    const result = getStepValidation(createEmptyDraft(), 'property')

    expect(result.valid).toBe(false)
    expect(result.errors.family).toBe('Mülk türü seçin')
  })

  it('uses an exact five-step process without a separate preview step', () => {
    expect(LISTING_STEPS).toHaveLength(5)
    expect(LISTING_STEPS.map((step) => step.id)).toEqual([
      'property',
      'location',
      'media',
      'content',
      'verification',
    ])
  })

  it('land location requires island and parcel identity', () => {
    const draft = createCompleteDraft()
    draft.location.parcel = ''

    const result = getStepValidation(draft, 'location')

    expect(result.valid).toBe(false)
    expect(result.errors.parcel).toBe('Ada/parsel bilgisi gerekli')
  })

  it('requires the official property number for EİDS identity matching', () => {
    const draft = createCompleteDraft()
    draft.location.propertyNumber = ''

    const result = getStepValidation(draft, 'location')

    expect(result.valid).toBe(false)
    expect(result.errors.propertyNumber).toBe('Taşınmaz numarasını girin')
  })

  it('requires a map point only when exact public location is selected', () => {
    const exact = createCompleteDraft()
    exact.location.precision = 'exact'
    exact.location.latitude = null
    exact.location.longitude = null
    const approximate = createCompleteDraft()
    approximate.location.precision = 'approximate'
    approximate.location.latitude = null
    approximate.location.longitude = null

    expect(getStepValidation(exact, 'location').errors.coordinates).toBe(
      'Tam konum için haritada bir nokta seçin',
    )
    expect(getStepValidation(approximate, 'location').errors.coordinates).toBeUndefined()
  })

  it('three ready photos with a cover complete the media step', () => {
    const draft = createEmptyDraft()
    draft.media = [readyPhoto('one', true), readyPhoto('two'), readyPhoto('three')]

    expect(getStepValidation(draft, 'media').valid).toBe(true)
  })

  it('verification is a hard publication gate', () => {
    const draft = createCompleteDraft()
    draft.verification.status = 'idle'

    expect(canPublish(draft)).toBe(false)
  })

  it('rejects stale verification after role or property identity changes', () => {
    const roleChanged = createCompleteDraft()
    roleChanged.property.publisherRole = 'agency'
    const identityChanged = createCompleteDraft()
    identityChanged.location.propertyNumber = '980124772'

    expect(canPublish(roleChanged)).toBe(false)
    expect(canPublish(identityChanged)).toBe(false)
  })

  it('calculates Turkish formatted unit price from numeric strings', () => {
    expect(formatUnitPrice('4250000', '512')).toBe('8.301 TL/m²')
    expect(formatUnitPrice('4.250.000', '512,5')).toBe('8.293 TL/m²')
  })

  it('derives completion from section validity instead of visited steps', () => {
    const draft = createCompleteDraft()
    draft.content.title = ''

    expect(getCompletion(draft)).toEqual({
      completed: 4,
      total: 5,
      percentage: 80,
    })
  })

  it('requires residential fields even when stale land fields remain populated', () => {
    const draft = createCompleteDraft()
    draft.property.family = 'residential'
    draft.property.subtype = 'apartment'
    draft.property.rooms = ''
    draft.property.grossArea = ''
    draft.property.netArea = ''
    draft.property.buildingAge = ''

    const result = getStepValidation(draft, 'property')

    expect(result.valid).toBe(false)
    expect(result.errors.rooms).toBe('Oda sayısını seçin')
    expect(result.errors.grossArea).toBe('Brüt alanı girin')
  })

  it('requires usage status and gross/net areas for commercial properties', () => {
    const draft = createCompleteDraft()
    draft.property.family = 'commercial'
    draft.property.subtype = 'office'
    draft.property.usageStatus = ''
    draft.property.grossArea = '180'
    draft.property.netArea = ''

    const result = getStepValidation(draft, 'property')

    expect(result.valid).toBe(false)
    expect(result.errors.usageStatus).toBe('Kullanım durumunu seçin')
    expect(result.errors.netArea).toBe('Net alanı girin')
  })

  it('requires total area, floor count and independent units for buildings', () => {
    const draft = createCompleteDraft()
    draft.property.family = 'building'
    draft.property.subtype = 'apartment-building'
    draft.property.grossArea = '950'
    draft.property.floorCount = ''
    draft.property.independentUnitCount = ''

    const result = getStepValidation(draft, 'property')

    expect(result.valid).toBe(false)
    expect(result.errors.floorCount).toBe('Kat sayısını girin')
    expect(result.errors.independentUnitCount).toBe(
      'Bağımsız bölüm sayısını girin',
    )
  })

  it('rejects inconsistent commercial areas and invalid building counts', () => {
    const commercial = createCompleteDraft()
    commercial.property.family = 'commercial'
    commercial.property.subtype = 'office'
    commercial.property.usageStatus = 'tenant'
    commercial.property.grossArea = '180'
    commercial.property.netArea = '220'

    expect(getStepValidation(commercial, 'property').errors.netArea).toBe(
      'Net alan brüt alandan büyük olamaz',
    )

    const building = createCompleteDraft()
    building.property.family = 'building'
    building.property.subtype = 'apartment-building'
    building.property.grossArea = '950'
    building.property.floorCount = '0'
    building.property.independentUnitCount = '2.5'

    const buildingErrors = getStepValidation(building, 'property').errors
    expect(buildingErrors.floorCount).toBe('Geçerli bir kat sayısı girin')
    expect(buildingErrors.independentUnitCount).toBe(
      'Geçerli bir bağımsız bölüm sayısı girin',
    )
  })

  it('compares Turkish-formatted gross and net areas consistently', () => {
    const draft = createCompleteDraft()
    draft.property.family = 'residential'
    draft.property.subtype = 'apartment'
    draft.property.rooms = '3+1'
    draft.property.grossArea = '1.000'
    draft.property.netArea = '900'
    draft.property.buildingAge = '1-5'

    expect(getStepValidation(draft, 'property').valid).toBe(true)
  })

  it('rejects invalid numeric property, identity and pricing values', () => {
    const draft = createCompleteDraft()
    draft.property.area = '0'
    draft.location.propertyNumber = 'TAŞINMAZ'
    draft.content.price = '0'

    expect(getStepValidation(draft, 'property').errors.area).toBe(
      'Geçerli bir toplam alan girin',
    )
    expect(getStepValidation(draft, 'location').errors.propertyNumber).toBe(
      'Geçerli taşınmaz numarasını girin',
    )
    expect(getStepValidation(draft, 'content').errors.price).toBe(
      'Geçerli bir fiyat girin',
    )
  })

  it('requires decision-useful title and description lengths', () => {
    const draft = createCompleteDraft()
    draft.content.title = 'Kısa'
    draft.content.description = 'Yetersiz açıklama'

    const result = getStepValidation(draft, 'content')

    expect(result.errors.title).toBe('Başlık en az 10 karakter olmalı')
    expect(result.errors.description).toBe('Açıklama en az 30 karakter olmalı')
  })

  it('requires legal publication consent and caps title at 70 characters', () => {
    const draft = createCompleteDraft()
    draft.content.legalConsent = false
    draft.content.title = 'A'.repeat(71)

    const result = getStepValidation(draft, 'content')

    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Başlık en fazla 70 karakter olabilir')
    expect(result.errors.legalConsent).toBe('İlan yayın koşullarını onaylayın')
  })

  it('applies an AI proposal only through the explicit domain action', () => {
    const draft = createEmptyDraft()
    const proposal: AiListingProposal = {
      property: {
        transaction: 'sale',
        family: 'land',
        subtype: 'zoned-land',
        area: '512',
        zoning: 'residential',
      },
      location: {
        city: 'izmir',
        district: 'urla',
      },
      content: {
        title: 'Urla’da imarlı köşe parsel',
        description: 'Denize yakın, konut imarlı ve yola cepheli parsel.',
      },
      confidence: 91,
      sourceText: 'Urla’da 512 metrekare imarlı satılık arsa',
    }

    expect(draft.content.title).toBe('')
    const applied = applyAiProposal(draft, proposal)

    expect(applied.content.title).toBe('Urla’da imarlı köşe parsel')
    expect(applied.property.family).toBe('land')
    expect(applied.meta.aiProposalApplied).toBe(true)
  })
})
