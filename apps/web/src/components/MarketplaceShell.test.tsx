import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarketplaceShell } from './MarketplaceShell'

const routerState = vi.hoisted(() => ({
  pathname: '/ilan-ver',
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: routerState.navigate }),
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string
  }) => select({ location: { pathname: routerState.pathname } }),
}))

vi.mock('@repo/ui', () => ({
  GlassAiSearchBar: () => <div data-testid="global-search" />,
  GlassButton: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => <button onClick={onClick}>{children}</button>,
  GlassDock: () => <nav data-testid="global-dock" />,
  GlassIslandHeader: ({ extras }: { extras?: ReactNode }) => (
    <header data-testid="global-header">{extras}</header>
  ),
}))

describe('MarketplaceShell odaklı ilan akışı', () => {
  it('hides the global header and dock only on /ilan-ver', async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      },
    })
    routerState.pathname = '/ilan-ver'
    const { rerender } = render(
      <MarketplaceShell initialTime="2026-07-25T12:00:00.000Z">
        <main>İlan oluşturma çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByText('İlan oluşturma çalışma alanı')).toBeTruthy()
    expect(screen.queryByTestId('global-header')).toBeNull()
    expect(screen.queryByTestId('global-dock')).toBeNull()

    routerState.pathname = '/emlak'
    rerender(
      <MarketplaceShell initialTime="2026-07-25T12:00:00.000Z">
        <main>Arama çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByTestId('global-header')).toBeTruthy()
    await waitFor(() => expect(screen.getByTestId('global-dock')).toBeTruthy())
  })
})

describe('MarketplaceShell hesap eylemi', () => {
  it.each([
    ['/hesabim', 'Hesabım'],
    ['/hesabim/mesajlar', 'Hesabım'],
    ['/emlak', 'Üye girişi'],
  ])('rota %s iken %s etiketini gösterir', (pathname, label) => {
    routerState.pathname = pathname

    render(
      <MarketplaceShell initialTime="2026-07-25T12:00:00.000Z">
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    expect(screen.getByRole('button', { name: label })).toBeTruthy()
  })
})
