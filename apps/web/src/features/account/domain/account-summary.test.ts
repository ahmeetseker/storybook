import { describe, expect, it } from 'vitest'

import {
  getAccountMetricItems,
  getPrimaryAccountAction,
  getPriorityAttentionItems,
  getRecentListings,
  hasAccountAttention,
  resolveAccountWorkspaceMode,
} from './account-summary'
import type {
  AccountAttentionItem,
  AccountDashboardData,
  AccountListingPreview,
  AccountListingState,
} from './account-types'

function makeListing(
  id: string,
  state: AccountListingState,
  updatedAt = '2026-07-20T08:00:00.000Z',
): AccountListingPreview {
  return {
    id,
    title: `${id} ilanı`,
    state,
    imageAlt: `${id} görseli`,
    referenceLabel: `REF-${id}`,
    updatedAt,
    updatedLabel: 'Bugün güncellendi',
    stats: [],
  }
}

function makeAttention(
  id: string,
  severity: AccountAttentionItem['severity'],
  occurredAt: string,
): AccountAttentionItem {
  return {
    id,
    kind: 'listing',
    severity,
    occurredAt,
    title: `${id} işi`,
    reason: 'İşlem gerekiyor.',
    action: { kind: 'route', label: 'İlanı yönet', to: '/ilan-ver' },
    explanationSource: 'rule',
  }
}

function makeData(
  overrides: Partial<AccountDashboardData> & { role?: AccountDashboardData['identity']['role'] } = {},
): AccountDashboardData {
  const { role, identity, ...data } = overrides

  return {
    identity: {
      id: 'account-1',
      displayName: 'Deniz Yılmaz',
      role: role ?? identity?.role ?? 'seller',
      ...identity,
    },
    verification: {
      email: 'verified',
      phone: 'verified',
      eids: 'not-applicable',
    },
    security: {},
    listings: [],
    unreadMessageCount: 0,
    activeAlarmCount: 0,
    priceDropFavoriteCount: 0,
    attentionCandidates: [],
    activities: [],
    sectionErrors: [],
    ...data,
  }
}

describe('account summary', () => {
  it('sorts attention by severity, newest date, then id and caps at three', () => {
    const data = makeData({
      attentionCandidates: [
        makeAttention('normal-old', 'normal', '2026-07-20T08:00:00.000Z'),
        makeAttention('high-old', 'high', '2026-07-21T08:00:00.000Z'),
        makeAttention('critical-b', 'critical', '2026-07-25T08:00:00.000Z'),
        makeAttention('critical-a', 'critical', '2026-07-25T08:00:00.000Z'),
      ],
    })

    expect(getPriorityAttentionItems(data).map(({ id }) => id)).toEqual([
      'critical-a',
      'critical-b',
      'high-old',
    ])
  })

  it('counts only live and changes listings in account metrics', () => {
    const data = makeData({
      listings: [
        makeListing('one', 'live'),
        makeListing('two', 'changes'),
        makeListing('three', 'paused'),
      ],
      unreadMessageCount: 7,
      activeAlarmCount: 2,
    })

    expect(getAccountMetricItems(data).map(({ value }) => value)).toEqual([
      '1',
      '1',
      '7',
      '2',
    ])
  })

  it('selects a real route CTA from account role', () => {
    expect(getPrimaryAccountAction(makeData({ role: 'buyer' }))).toEqual({
      kind: 'route',
      label: 'İlanları keşfet',
      to: '/emlak',
    })
    expect(getPrimaryAccountAction(makeData({ role: 'hybrid' }))).toEqual({
      kind: 'route',
      label: 'Yeni ilan ver',
      to: '/ilan-ver',
    })
  })

  it('sorts recent listings by newest update and id, with a two-item default limit', () => {
    const data = makeData({
      listings: [
        makeListing('zeta', 'live', '2026-07-22T08:00:00.000Z'),
        makeListing('alpha', 'draft', '2026-07-22T08:00:00.000Z'),
        makeListing('older', 'paused', '2026-07-21T08:00:00.000Z'),
      ],
    })

    expect(getRecentListings(data).map(({ id }) => id)).toEqual(['alpha', 'zeta'])
  })

  it('resolves workspace modes in their defined priority order', () => {
    const active = makeData({ activities: [{
      id: 'activity-1',
      occurredAt: '2026-07-25T08:00:00.000Z',
      dateLabel: 'Bugün',
      title: 'Giriş yapıldı',
      tone: 'success',
    }] })

    expect(resolveAccountWorkspaceMode({ data: active, sessionExpired: true, restricted: true, loading: true })).toBe('session-expired')
    expect(resolveAccountWorkspaceMode({ data: active, restricted: true, loading: true })).toBe('restricted')
    expect(resolveAccountWorkspaceMode({ data: active, loading: true })).toBe('loading')
    expect(resolveAccountWorkspaceMode({ data: makeData() })).toBe('new-account')
    expect(resolveAccountWorkspaceMode({ data: active })).toBe('ready')
  })

  it('identifies critical and high attention items', () => {
    expect(hasAccountAttention(makeData({
      attentionCandidates: [makeAttention('urgent', 'critical', '2026-07-25T08:00:00.000Z')],
    }))).toBe(true)
    expect(hasAccountAttention(makeData({
      attentionCandidates: [makeAttention('routine', 'normal', '2026-07-25T08:00:00.000Z')],
    }))).toBe(false)
  })
})
