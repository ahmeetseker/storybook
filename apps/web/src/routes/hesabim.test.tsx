import { render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthSessionProvider } from '@/features/auth'
import type { AuthAdapters } from '@/features/auth'
import type { Oturum } from '@/features/auth'
import { Route } from './hesabim'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function adapters(oturum: Oturum | null): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: vi.fn(),
  } as AuthAdapters
}

function routeTreeIle(oturum: Oturum | null) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters(oturum)}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const accountRoute = Route.update({
    id: '/hesabim',
    path: '/hesabim',
    getParentRoute: () => rootRoute,
  } as never)
  const arama = (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    validateSearch: arama,
    component: () => <h1>Giriş yapın</h1>,
  })
  return rootRoute.addChildren([accountRoute, girisRoute])
}

function renderRoute(initialEntry: string, oturum: Oturum | null = ORNEK_OTURUM) {
  const router = createRouter({
    routeTree: routeTreeIle(oturum),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  })

  render(<RouterProvider router={router} />)
}

describe('/hesabim rotası', () => {
  it('placeholder yerine enterprise hesap çalışma alanını bağlar', async () => {
    renderRoute('/hesabim')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hesabım' }),
    ).toBeTruthy()
    expect(screen.queryByText(/bu alana yerleşecek/i)).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Yeni ilan ver' }).getAttribute('href'),
    ).toBe('/ilan-ver')
  })

  it('oturumsuz erişimde girişe yönlendirir', async () => {
    renderRoute('/hesabim', null)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('hesap sayfası için noindex canonical head sözleşmesini korur', async () => {
    const head = await Route.options.head?.({} as never)

    expect(head?.meta).toEqual(
      expect.arrayContaining([
        { title: 'Hesabım | arsam.net' },
        { name: 'robots', content: 'noindex, nofollow' },
      ]),
    )
    expect(head?.links).toContainEqual({
      rel: 'canonical',
      href: 'https://arsam.net/hesabim',
    })
  })
})
