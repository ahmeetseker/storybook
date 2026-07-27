import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountAction } from '../domain/account-types'
import { AccountAttentionQueue } from './AccountAttentionQueue'
import { AccountActionLink } from './AccountActionLink'
import { AccountOverviewHeader } from './AccountOverviewHeader'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

function renderActionLink({
  action,
  variant,
}: {
  action: AccountAction
  variant: 'primary' | 'secondary' | 'text'
}) {
  const rootRoute = createRootRoute({ component: Outlet })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <AccountActionLink action={action} variant={variant} />,
  })
  const listingCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ilan-ver',
    component: () => <p>İlan ver</p>,
  })
  const routeTree = rootRoute.addChildren([homeRoute, listingCreateRoute])
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({ routeTree, history })
  const rendered = render(<RouterProvider router={router} />)

  return { ...rendered, history }
}

function renderAccountContent(content: React.ReactNode) {
  const rootRoute = createRootRoute({ component: Outlet })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => content,
  })
  const routeTree = rootRoute.addChildren([homeRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('AccountActionLink', () => {
  it('uses the hairline stroke token for the secondary action border', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'apps/web/src/features/account/components/AccountActionLink.module.css',
      ),
      'utf8',
    )

    expect(css).not.toMatch(/\.secondary\s*\{[^}]*border:\s*1px\s+solid/)
    expect(css).toMatch(
      /\.secondary\s*\{[^}]*border:\s*var\(--lg-stroke-hairline\)\s+solid\s+var\(--lg-hairline\)/,
    )
  })

  it('renders primary account navigation as one real link and one glass shell', async () => {
    const { container, history } = renderActionLink({
      variant: 'primary',
      action: { kind: 'route', label: 'Yeni ilan ver', to: '/ilan-ver' },
    })

    const link = await screen.findByRole('link', { name: 'Yeni ilan ver' })
    expect(link.getAttribute('href')).toBe('/ilan-ver')
    expect(link.getAttribute('data-variant')).toBe('primary')
    expect(container.querySelectorAll('[data-material="glass"]')).toHaveLength(1)

    fireEvent.click(link)
    await waitFor(() => expect(history.location.pathname).toBe('/ilan-ver'))
  })

  it.each(['secondary', 'text'] as const)('does not create glass for the %s action variant', async (variant) => {
    const { container } = renderActionLink({
      variant,
      action: { kind: 'route', label: 'Favorileri aç', to: '/favoriler' },
    })

    expect(await screen.findByRole('link', { name: 'Favorileri aç' })).toBeTruthy()
    expect(container.querySelectorAll('[data-material="glass"]')).toHaveLength(0)
  })
})

describe('AccountOverviewHeader and AccountAttentionQueue', () => {
  it('renders one account heading, one primary action, and textual pending EİDS status', async () => {
    const { container } = renderAccountContent(
      <AccountOverviewHeader
        data={ACCOUNT_FIXTURES.default}
        primaryAction={{ kind: 'route', label: 'Yeni ilan ver', to: '/ilan-ver' }}
      />,
    )

    expect(await screen.findAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelectorAll('[data-variant="primary"]')).toHaveLength(1)
    expect(screen.getByText('EİDS: beklemede')).toBeTruthy()
    expect(
      screen.getByText('Doğrulama ilan verme adımında tamamlanır.'),
    ).toBeTruthy()
  })

  it('renders an AI explanation and caps the attention queue at three list items', async () => {
    const items = [
      ...ACCOUNT_FIXTURES.default.attentionCandidates,
      {
        id: 'unread-message',
        kind: 'message' as const,
        severity: 'normal' as const,
        occurredAt: '2026-07-24T10:00:00.000Z',
        title: 'Yanıt bekleyen yeni mesajınız var',
        reason: 'İlanınızla ilgili yeni bir mesaj aldınız.',
        action: { kind: 'route' as const, label: 'Mesajları aç', to: '/emlak' as const },
        explanationSource: 'rule' as const,
      },
    ]
    const { container } = renderAccountContent(<AccountAttentionQueue items={items} />)

    expect(await screen.findByText('AI açıklaması')).toBeTruthy()
    expect(container.querySelectorAll('[data-part="attention-item"]')).toHaveLength(3)
    expect(container.querySelectorAll('article')).toHaveLength(0)
  })
})
