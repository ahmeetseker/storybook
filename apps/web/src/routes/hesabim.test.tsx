import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AnyRoute } from '@tanstack/react-router'
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
import { Route as IndexRoute } from './hesabim.index'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

const cikisYapMock = vi.fn()

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
    cikisYap: cikisYapMock,
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
  // `/hesabim` artık layout rotası: kabuk burada, sayfa index çocuğunda
  const accountRoute = Route.update({
    id: '/hesabim',
    path: '/hesabim',
    getParentRoute: () => rootRoute,
  } as never)
  const accountIndexRoute = IndexRoute.update({
    id: '/',
    path: '/',
    getParentRoute: () => accountRoute,
  } as never)
  const accountTree = accountRoute.addChildren([accountIndexRoute] as never)
  const arama = (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    validateSearch: arama,
    component: () => <h1>Giriş yapın</h1>,
  })
  // Çıkışın hedefi: kabuk oturumu kapatmadan önce buraya geçer
  const anaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>Anasayfa</h1>,
  })
  // Layout + index çocuğu birlikte bağlanır; jenerik ağaç tipi testte
  // taşınmaz olduğu için AnyRoute'a indirgenir.
  return rootRoute.addChildren([
    accountTree,
    girisRoute,
    anaRoute,
  ] as never) as unknown as AnyRoute
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
  it('kalıcı kabuk ile hesap çalışma alanını bağlar', async () => {
    renderRoute('/hesabim')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hesabım' }),
    ).toBeTruthy()
    expect(screen.queryByText(/bu alana yerleşecek/i)).toBeNull()
    // Kabuk sayfayla birlikte gelir: ray her alt sayfada yerinde kalır
    expect(
      screen.getByRole('navigation', { name: 'Hesap bölümleri' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Yeni ilan ver' }).getAttribute('href'),
    ).toBe('/ilan-ver')
  })

  it('raydan çıkış yapılınca oturum kapanır ve anasayfaya dönülür', async () => {
    const kullanici = userEvent.setup()
    cikisYapMock.mockClear()
    renderRoute('/hesabim')

    await screen.findByRole('heading', { level: 1, name: 'Hesabım' })
    const ray = screen.getByRole('navigation', { name: 'Hesap bölümleri' })
    await kullanici.click(
      within(ray).getByRole('button', { name: 'Çıkış yap' }),
    )

    expect(cikisYapMock).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Anasayfa' })).toBeTruthy(),
    )
  })

  it('oturumsuz erişimde girişe yönlendirir', async () => {
    renderRoute('/hesabim', null)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('hesap sayfası için noindex canonical head sözleşmesini korur', async () => {
    const head = await IndexRoute.options.head?.({} as never)

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
