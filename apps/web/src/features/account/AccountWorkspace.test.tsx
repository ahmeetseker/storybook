import { render, screen } from '@testing-library/react'
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
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { ACCOUNT_FIXTURES } from './data/account-fixtures'
import type {
  AccountAction,
  AccountWorkspaceProps,
} from './domain/account-types'
import { AccountWorkspace } from './AccountWorkspace'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

function renderWorkspace(props: AccountWorkspaceProps) {
  const rootRoute = createRootRoute({ component: Outlet })
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim',
    component: () => <AccountWorkspace {...props} />,
  })
  const listingCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ilan-ver',
    component: () => <p>İlan ver</p>,
  })
  const favoritesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/favoriler',
    component: () => <p>Favoriler</p>,
  })
  const listingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>Emlak</p>,
  })
  const routeTree = rootRoute.addChildren([
    accountRoute,
    listingCreateRoute,
    favoritesRoute,
    listingsRoute,
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/hesabim'] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('AccountWorkspace', () => {
  it('renders one main, one h1, one primary action and no more than one local glass surface', async () => {
    const { container } = renderWorkspace({
      data: ACCOUNT_FIXTURES.default,
    })

    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('main#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      container.querySelectorAll('[data-variant="primary"]'),
    ).toHaveLength(1)
    expect(
      container.querySelectorAll('[data-material="glass"]'),
    ).toHaveLength(1)
  })

  it('does not expose personal content when the session is expired', async () => {
    renderWorkspace({
      data: ACCOUNT_FIXTURES.sessionExpired,
      mode: 'session-expired',
    })

    expect(await screen.findByText('Oturum süresi doldu')).toBeTruthy()
    expect(screen.queryByText('Mehmet Yılmaz')).toBeNull()
    expect(screen.queryByText('Son ilanlar')).toBeNull()
    expect(screen.queryByText('Okunmamış mesaj')).toBeNull()
  })

  it('keeps heading levels sequential in visual and DOM order', async () => {
    const { container } = renderWorkspace({
      data: ACCOUNT_FIXTURES.default,
    })

    await screen.findByRole('heading', { level: 1 })
    const levels = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      (heading) => Number(heading.tagName.slice(1)),
    )

    expect(levels[0]).toBe(1)
    expect(levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1)).toBe(true)
  })

  it('marks loading content busy and renders a non-personal skeleton', async () => {
    const { container } = renderWorkspace({
      data: ACCOUNT_FIXTURES.default,
      mode: 'loading',
    })

    expect(await screen.findByRole('heading', { name: 'Hesabım' })).toBeTruthy()
    expect(container.querySelector('main#main-content')?.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelectorAll('[data-part="account-skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByText('Mehmet Yılmaz')).toBeNull()
  })

  it('uses the buyer route and guidance for a new account empty state', async () => {
    renderWorkspace({
      data: ACCOUNT_FIXTURES.newAccount,
      mode: 'new-account',
    })

    expect(await screen.findByText('Aramaya başlamak için ilanları keşfedin')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'İlanları keşfet' }).getAttribute('href')).toBe('/emlak')
  })

  it('explains a restricted account without rendering ready sections', async () => {
    renderWorkspace({
      data: ACCOUNT_FIXTURES.restricted,
      mode: 'restricted',
    })

    expect(await screen.findByText('Hesap bilgilerinize erişim kısıtlandı.')).toBeTruthy()
    expect(screen.getByText('Kişisel hesap bölümleri bu görünümde kullanılamıyor.')).toBeTruthy()
    expect(screen.getByText('Kısıtlama bildirimini hesabınıza kayıtlı iletişim kanalından inceleyin.')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Son ilanlar' })).toBeNull()
    expect(screen.queryByText('Mehmet Yılmaz')).toBeNull()
  })

  it('keeps healthy sections visible when one section has a partial error', async () => {
    renderWorkspace({
      data: ACCOUNT_FIXTURES.partialError,
    })

    expect((await screen.findByRole('alert')).textContent).toContain(
      'İlanlar şu anda yüklenemedi.',
    )
    expect(screen.getByRole('heading', { name: 'Hesap güvenliği' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Son etkinlik' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Kayıtlı arama' })).toBeTruthy()
  })

  it('replaces personal identity content with a local alert when identity fails', async () => {
    const { container } = renderWorkspace({
      data: {
        ...ACCOUNT_FIXTURES.default,
        sectionErrors: [
          {
            section: 'identity',
            message: 'Kimlik bilgileri şu anda yüklenemedi.',
          },
        ],
      },
      mode: 'ready',
    })

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Kimlik bilgileri şu anda yüklenemedi.',
    )
    expect(container.querySelectorAll('main#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      container.querySelector('[data-account-section="identity"]'),
    ).toBeTruthy()
    expect(screen.queryByText('Mehmet Yılmaz')).toBeNull()
    expect(screen.queryByText('EİDS: beklemede')).toBeNull()
    expect(
      container.querySelector('[data-variant="primary"]'),
    ).toBeNull()
  })

  it('names the ready identity and every local error section', async () => {
    const { container } = renderWorkspace({ data: ACCOUNT_FIXTURES.default })

    await screen.findByRole('heading', { level: 1, name: 'Hesabım' })
    expect(container.querySelector('section[aria-labelledby="account-identity-title"]')).toBeTruthy()

    const { container: errorContainer } = renderWorkspace({
      data: {
        ...ACCOUNT_FIXTURES.default,
        sectionErrors: [
          { section: 'identity', message: 'Kimlik bilgileri yüklenemedi.' },
          { section: 'listings', message: 'İlanlar yüklenemedi.' },
          { section: 'security', message: 'Güvenlik bilgileri yüklenemedi.' },
          { section: 'activity', message: 'Etkinlikler yüklenemedi.' },
          { section: 'saved-search', message: 'Kayıtlı arama yüklenemedi.' },
        ],
      },
      mode: 'ready',
    })

    await screen.findAllByRole('alert')

    for (const [section, title] of [
      ['identity', 'account-identity-title'],
      ['listings', 'account-listings-title'],
      ['security', 'account-security-title'],
      ['activity', 'account-activity-title'],
      ['saved-search', 'account-saved-search-title'],
    ]) {
      expect(
        errorContainer.querySelector(
          `[data-account-section="${section}"][aria-labelledby="${title}"]`,
        ),
      ).toBeTruthy()
    }
  })

  it('caps attention at three and exposes listing and verification statuses as text', async () => {
    const extraAttention = {
      ...ACCOUNT_FIXTURES.default.attentionCandidates[0],
      id: 'fourth-attention',
    }
    const { container } = renderWorkspace({
      data: {
        ...ACCOUNT_FIXTURES.default,
        attentionCandidates: [
          ...ACCOUNT_FIXTURES.default.attentionCandidates,
          extraAttention,
        ],
      },
    })

    await screen.findByRole('heading', { name: 'Gündem' })
    expect(
      container.querySelectorAll('[data-part="attention-item"]'),
    ).toHaveLength(3)
    expect(screen.getByText('Yayında')).toBeTruthy()
    expect(screen.getByText('Değişiklik istendi')).toBeTruthy()
    expect(screen.getByText('EİDS: beklemede')).toBeTruthy()
  })

  it('accepts only route actions from the type and fixture layers', () => {
    expectTypeOf<AccountAction['kind']>().toEqualTypeOf<'route'>()

    const supportedRoutes = ['/ilan-ver', '/favoriler', '/emlak']
    expect(
      Object.values(ACCOUNT_FIXTURES)
        .flatMap(({ attentionCandidates }) => attentionCandidates)
        .every(
          ({ action }) =>
            action.kind === 'route' && supportedRoutes.includes(action.to),
        ),
    ).toBe(true)
  })

  it('owns responsive outer padding on the frame and reserves dock safe area', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'apps/web/src/features/account/AccountWorkspace.module.css',
      ),
      'utf8',
    )
    const compactRule = css.slice(
      css.indexOf('@container (inline-size <= 40rem)'),
      css.indexOf('@media (hover: hover)'),
    )

    expect(css).toMatch(
      /\.frame\s*\{[^}]*padding:\s*var\(--lg-space-7\)[^}]*padding-block-end:\s*calc\([^;]*env\(safe-area-inset-bottom,\s*0rem\)[^;]*\)/,
    )
    expect(compactRule).toMatch(
      /\.frame\s*\{[^}]*padding:\s*var\(--lg-space-4\)[^}]*padding-block-end:\s*calc\([^;]*env\(safe-area-inset-bottom,\s*0rem\)[^;]*\)/,
    )
    expect(compactRule).not.toMatch(/\.page\s*\{[^}]*padding/)
  })

  it('keeps the account glass surface opaque when transparency is reduced', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'apps/web/src/features/account/AccountWorkspace.module.css',
      ),
      'utf8',
    )
    const reducedTransparencyRule = css.slice(
      css.indexOf('@media (prefers-reduced-transparency: reduce)'),
      css.indexOf('@media (pointer: coarse)'),
    )

    expect(css).toContain('@media (prefers-reduced-transparency: reduce)')
    expect(reducedTransparencyRule).toMatch(
      /\.page\s+\[data-material=['"]glass['"]\]\s*\{[^}]*background-color:\s*var\(--lg-surface\)/,
    )
  })
})
