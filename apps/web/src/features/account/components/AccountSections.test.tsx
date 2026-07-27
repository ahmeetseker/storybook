import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'

import type {
  AccountListingPreview,
  AccountSavedSearchSummary,
  AccountSectionError,
  AccountVerification,
} from '../domain/account-types'

import { AccountActivityList } from './AccountActivityList'
import { AccountAttentionQueue } from './AccountAttentionQueue'
import { AccountListingsPreview } from './AccountListingsPreview'
import { AccountSavedSearchSummary as AccountSavedSearchSummarySection } from './AccountSavedSearchSummary'
import { AccountSecuritySummary } from './AccountSecuritySummary'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

function renderWithRouter(content: React.ReactNode) {
  const rootRoute = createRootRoute({ component: Outlet })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => content,
  })
  const listingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>Emlak</p>,
  })
  const createListingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ilan-ver',
    component: () => <p>İlan ver</p>,
  })
  const routeTree = rootRoute.addChildren([homeRoute, listingsRoute, createListingRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  return render(<RouterProvider router={router} />)
}

function makeListing(
  id: string,
  state: AccountListingPreview['state'],
): AccountListingPreview {
  return {
    id,
    title: `${id} başlıklı ilan`,
    state,
    imageAlt: `${id} görseli`,
    referenceLabel: `İlan no: ${id}`,
    updatedAt: '2026-07-27T08:00:00.000Z',
    updatedLabel: 'Bugün güncellendi',
    stats: [],
  }
}

function makeVerification(
  overrides: Partial<AccountVerification> = {},
): AccountVerification {
  return {
    email: 'verified',
    phone: 'verified',
    eids: 'verified',
    ...overrides,
  }
}

function makeError(section: AccountSectionError['section']): AccountSectionError {
  return { section, message: 'Bu bölüm şu anda kullanılamıyor.' }
}

describe('account overview presentation sections', () => {
  it('renders only the two supplied supported listing states', async () => {
    renderWithRouter(
      <AccountListingsPreview
        role="seller"
        listings={[
          makeListing('live-one', 'live'),
          makeListing('changes-one', 'changes'),
        ]}
      />,
    )

    expect(await screen.findAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('Yayında')).toBeTruthy()
    expect(screen.getByText('Değişiklik istendi')).toBeTruthy()
  })

  it('describes unavailable security data without a fake action', async () => {
    renderWithRouter(
      <AccountSecuritySummary
        verification={makeVerification({ eids: 'unavailable' })}
        security={{}}
      />,
    )

    expect(await screen.findByText('Son giriş bilgisi kullanılamıyor')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows the last login time separately from its device and location', async () => {
    renderWithRouter(
      <AccountSecuritySummary
        verification={makeVerification()}
        security={{
          lastSuccessfulLogin: {
            occurredAt: '2026-07-27T08:15:00.000Z',
            deviceLabel: 'Safari · macOS',
            approximateLocation: 'İzmir, Türkiye',
          },
        }}
      />,
    )

    const loginTime = await screen.findByText(/27 Tem 2026/)
    expect(loginTime.tagName).toBe('TIME')
    expect(loginTime.getAttribute('dateTime')).toBe('2026-07-27T08:15:00.000Z')
    expect(loginTime.textContent).toContain('11:15')
    expect(loginTime.textContent).not.toContain('Safari')
    expect(screen.getByTestId('last-login-device-location').textContent).toBe(
      'Safari · macOS · İzmir, Türkiye',
    )
  })

  it('treats an invalid last login timestamp as unavailable', async () => {
    renderWithRouter(
      <AccountSecuritySummary
        verification={makeVerification()}
        security={{
          lastSuccessfulLogin: {
            occurredAt: 'geçersiz-zaman',
            deviceLabel: 'Safari · macOS',
          },
        }}
      />,
    )

    expect(await screen.findByText('Son giriş bilgisi kullanılamıyor')).toBeTruthy()
    expect(screen.queryByTestId('last-login-device-location')).toBeNull()
  })

  it('renders security freshness in Istanbul time or explains when it is unavailable', async () => {
    const { rerender } = renderWithRouter(
      <AccountSecuritySummary
        verification={makeVerification()}
        security={{ dataUpdatedAt: '2026-07-27T08:15:00.000Z' }}
      />,
    )

    const freshness = await screen.findByText(/27 Tem 2026/)
    expect(freshness.tagName).toBe('TIME')
    expect(freshness.getAttribute('dateTime')).toBe('2026-07-27T08:15:00.000Z')
    expect(screen.getByText('Veri güncelliği')).toBeTruthy()

    rerender(
      <AccountSecuritySummary
        verification={makeVerification()}
        security={{ dataUpdatedAt: 'geçersiz-zaman' }}
      />,
    )

    expect(await screen.findByText('Güncellik bilgisi kullanılamıyor')).toBeTruthy()
  })

  it('links an empty buyer listing preview to listings', async () => {
    renderWithRouter(<AccountListingsPreview role="buyer" listings={[]} />)

    const link = await screen.findByRole('link', { name: 'İlanları keşfedin' })
    expect(link.getAttribute('href')).toBe('/emlak')
    expect(screen.getByText('Aramaya başlamak için ilanları keşfedin')).toBeTruthy()
  })

  it('links an empty seller listing preview to listing creation', async () => {
    renderWithRouter(<AccountListingsPreview role="seller" listings={[]} />)

    const link = await screen.findByRole('link', { name: 'İlan vermeye başla' })
    expect(link.getAttribute('href')).toBe('/ilan-ver')
    expect(screen.getByText('İlk ilanınızı hazırlayın')).toBeTruthy()
  })

  it('keeps the activity section name when a local error exists', async () => {
    renderWithRouter(
      <AccountActivityList activities={[]} error={makeError('activity')} />,
    )

    expect((await screen.findByRole('alert')).textContent).toContain('Bu bölüm şu anda kullanılamıyor.')
    expect(screen.getByRole('heading', { name: 'Son etkinlik' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Son etkinlik' })).toBeTruthy()
    expect(screen.queryByText('Henüz etkinlik kaydı yok.')).toBeNull()
  })

  it.each([
    ['listings', () => <AccountListingsPreview role="seller" listings={[]} error={makeError('listings')} />, 'Son ilanlar'],
    ['security', () => <AccountSecuritySummary verification={makeVerification()} security={{}} error={makeError('security')} />, 'Hesap güvenliği'],
    ['saved-search', () => <AccountSavedSearchSummarySection error={makeError('saved-search')} />, 'Kayıtlı arama'],
  ])('keeps the %s error branch inside its named section', async (_section, createContent, heading) => {
    renderWithRouter(createContent())

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy()
    expect(screen.getByRole('region', { name: heading })).toBeTruthy()
  })

  it('describes an empty activity timeline without navigation', async () => {
    renderWithRouter(<AccountActivityList activities={[]} />)

    expect(await screen.findByText('Henüz etkinlik kaydı yok.')).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('returns nothing when there is no saved search', () => {
    const { container } = renderWithRouter(
      <AccountSavedSearchSummarySection savedSearch={undefined} />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders the saved search as a text listing link without controls', async () => {
    const savedSearch: AccountSavedSearchSummary = {
      id: 'urla-land',
      title: 'Urla yatırım arsaları',
      criteriaLabel: 'İzmir · Urla · Arsa',
      newMatchCount: 4,
      updatedAt: '2026-07-27T07:00:00.000Z',
    }
    renderWithRouter(<AccountSavedSearchSummarySection savedSearch={savedSearch} />)

    const link = await screen.findByRole('link', { name: 'Aramayı görüntüle' })
    expect(link.getAttribute('href')).toBe('/emlak')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('switch')).toBeNull()
  })

  it('renders unavailable time text for direct invalid attention and saved-search dates', async () => {
    const invalidAttention = {
      id: 'invalid-attention',
      kind: 'alarm' as const,
      severity: 'normal' as const,
      occurredAt: 'geçersiz-zaman',
      title: 'Geçersiz gündem zamanı',
      reason: 'Tarih dış kaynaktan geçersiz geldi.',
      action: { kind: 'route' as const, label: 'İlanları keşfet', to: '/emlak' as const },
      explanationSource: 'rule' as const,
    }

    renderWithRouter(
      <>
        <AccountAttentionQueue items={[invalidAttention]} />
        <AccountSavedSearchSummarySection
          savedSearch={{
            id: 'invalid-search',
            title: 'Geçersiz tarihli arama',
            criteriaLabel: 'İzmir',
            newMatchCount: 1,
            updatedAt: 'geçersiz-zaman',
          }}
        />
      </>,
    )

    expect(await screen.findAllByText('Tarih bilgisi kullanılamıyor')).toHaveLength(2)
  })
})
