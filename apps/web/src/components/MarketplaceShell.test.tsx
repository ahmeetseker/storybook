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
  GlassButton: ({
    children,
    onClick,
    ...rest
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  GlassDock: () => <nav data-testid="global-dock" />,
  GlassSiteHeader: ({
    utility,
    secondaryAction,
    action,
  }: {
    utility?: ReactNode
    secondaryAction?: ReactNode
    action?: ReactNode
  }) => (
    <header data-testid="global-header">
      {utility}
      {secondaryAction}
      {action}
    </header>
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
      <MarketplaceShell>
        <main>İlan oluşturma çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByText('İlan oluşturma çalışma alanı')).toBeTruthy()
    expect(screen.queryByTestId('global-header')).toBeNull()
    expect(screen.queryByTestId('global-dock')).toBeNull()

    routerState.pathname = '/emlak'
    rerender(
      <MarketplaceShell>
        <main>Arama çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByTestId('global-header')).toBeTruthy()
    expect(screen.queryByTestId('global-search')).toBeNull()
    await waitFor(() => expect(screen.getByTestId('global-dock')).toBeTruthy())
  })
})

describe('MarketplaceShell hesap eylemi', () => {
  it.each([['/emlak', 'Üye girişi']])('rota %s iken %s etiketini gösterir', (pathname, label) => {
    routerState.pathname = pathname

    render(
      <MarketplaceShell>
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    expect(screen.getByRole('button', { name: label })).toBeTruthy()
  })

  // Hesap panosu kendi kabuğunu kurar: iki gezinme katmanı üst üste binmesin
  // diye pazar yeri header'ı ve dock'u bu rotada hiç render edilmez.
  it.each(['/hesabim', '/hesabim/mesajlar', '/hesabim/ilanlarim'])(
    'rota %s iken pazar yeri kabuğunu çizmez',
    async (pathname) => {
      routerState.pathname = pathname

      render(
        <MarketplaceShell>
          <main>Hesap panosu</main>
        </MarketplaceShell>,
      )

      expect(screen.queryByTestId('global-header')).toBeNull()
      await waitFor(() =>
        expect(screen.queryByTestId('global-dock')).toBeNull(),
      )
      expect(screen.getByRole('link', { name: 'İçeriğe geç' })).toBeTruthy()
    },
  )
})

describe('MarketplaceShell tema eylemi', () => {
  // Not: jsdom her zaman scrollY = 0'da kalır, bu yüzden bu test yalnız rest
  // durumunu kanıtlar — condensed durumda tema butonunun görünür kaldığına
  // dair bir iddia içermez. Gerçek düğüm: `utility` header'ın `utility` slotuna
  // render ediliyor (condensedAction artık verilmiyor, bkz. rules.md/PR notu).
  it('tema butonu header’ın utility slotuna render edilir', () => {
    routerState.pathname = '/emlak'

    render(
      <MarketplaceShell>
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    expect(screen.getByRole('button', { name: 'Tema: system' })).toBeTruthy()
  })
})
