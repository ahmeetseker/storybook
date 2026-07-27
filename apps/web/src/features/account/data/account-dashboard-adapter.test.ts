import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from './account-fixtures'
import { normalizeAccountDashboard } from './account-dashboard-adapter'
import type { RawAccountDashboard, RawAccountListingState } from '../domain/account-types'

function makeRawListing(
  state: RawAccountListingState,
  updatedAt = '2026-07-27T08:00:00.000Z',
) {
  return {
    id: `listing-${state}`,
    title: 'Örnek ilan',
    state,
    imageAlt: 'Örnek ilan görseli',
    referenceLabel: 'REF-100',
    updatedAt,
    updatedLabel: 'Bugün güncellendi',
    stats: [],
  }
}

function makeRaw(overrides: Partial<RawAccountDashboard> = {}): RawAccountDashboard {
  return {
    viewer: {
      id: 'account-1',
      displayName: 'Mehmet Yılmaz',
      role: 'seller',
    },
    verification: {},
    listings: [],
    ...overrides,
  }
}

describe('normalizeAccountDashboard', () => {
  it('excludes unsupported lifecycle states without semantic remapping', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        listings: [
          makeRawListing('live', '2026-07-27T08:00:00.000Z'),
          makeRawListing('sold', '2026-07-27T09:00:00.000Z'),
          makeRawListing('eids-pending', '2026-07-27T10:00:00.000Z'),
        ],
      }),
    )

    expect(result.listings.map(({ state }) => state)).toEqual(['live'])
  })

  it('marks buyer EİDS as not applicable when the source omits it', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        viewer: { ...makeRaw().viewer, role: 'buyer' },
        verification: { email: 'verified', phone: 'verified' },
      }),
    )

    expect(result.verification.eids).toBe('not-applicable')
  })

  it('marks missing seller EİDS as unavailable', () => {
    expect(normalizeAccountDashboard(makeRaw()).verification.eids).toBe('unavailable')
  })

  it('normalizes negative and fractional counters to non-negative integers', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        unreadMessageCount: -2.5,
        activeAlarmCount: 3.9,
        priceDropFavoriteCount: Number.NaN,
      }),
    )

    expect([
      result.unreadMessageCount,
      result.activeAlarmCount,
      result.priceDropFavoriteCount,
    ]).toEqual([0, 3, 0])
  })

  it('normalizes infinite counters to zero', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        unreadMessageCount: Infinity,
        activeAlarmCount: -Infinity,
      }),
    )

    expect([result.unreadMessageCount, result.activeAlarmCount]).toEqual([0, 0])
  })

  it('excludes listings with invalid update dates', () => {
    const result = normalizeAccountDashboard(
      makeRaw({ listings: [makeRawListing('live', 'not-a-date')] }),
    )

    expect(result.listings).toEqual([])
  })

  it('does not invent missing security dataUpdatedAt values', () => {
    const result = normalizeAccountDashboard(
      makeRaw({ security: { lastSuccessfulLogin: undefined } }),
    )

    expect(result.security.dataUpdatedAt).toBeUndefined()
  })

  it('removes invalid attention dates and invalid saved searches with a local error', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        attentionCandidates: [
          {
            id: 'valid-attention',
            kind: 'alarm',
            severity: 'normal',
            occurredAt: '2026-07-27T08:00:00.000Z',
            title: 'Geçerli gündem',
            reason: 'Geçerli tarih korunur.',
            action: { kind: 'route', label: 'İlanları keşfet', to: '/emlak' },
            explanationSource: 'rule',
          },
          {
            id: 'invalid-attention',
            kind: 'alarm',
            severity: 'normal',
            occurredAt: 'geçersiz-zaman',
            title: 'Geçersiz gündem',
            reason: 'Geçersiz tarih elenir.',
            action: { kind: 'route', label: 'İlanları keşfet', to: '/emlak' },
            explanationSource: 'rule',
          },
        ],
        savedSearch: {
          id: 'invalid-search',
          title: 'Geçersiz arama',
          criteriaLabel: 'İzmir',
          newMatchCount: 2,
          updatedAt: 'geçersiz-zaman',
        },
      }),
    )

    expect(result.attentionCandidates.map(({ id }) => id)).toEqual(['valid-attention'])
    expect(result.savedSearch).toBeUndefined()
    expect(result.sectionErrors).toContainEqual({
      section: 'saved-search',
      message: 'Kayıtlı arama güncellik bilgisi kullanılamıyor.',
    })
  })

  it('preserves a section error only under its own section key', () => {
    const result = normalizeAccountDashboard(
      makeRaw({
        sectionErrors: [{ section: 'listings', message: 'İlanlar yüklenemedi.' }],
      }),
    )

    expect(result.sectionErrors).toEqual([
      { section: 'listings', message: 'İlanlar yüklenemedi.' },
    ])
  })

  it('exports fixture attention actions only for supported account routes', () => {
    expect(ACCOUNT_FIXTURES.default.attentionCandidates.map(({ action }) => action.to)).toEqual([
      '/favoriler',
      '/ilan-ver',
      '/emlak',
    ])
  })
})
