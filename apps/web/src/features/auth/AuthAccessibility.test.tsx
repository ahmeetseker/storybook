import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import { GirisPage } from './pages/GirisPage'
import { GirisKodPage } from './pages/GirisKodPage'
import { GirisParolaPage } from './pages/GirisParolaPage'
import {
  BaglantiGecersizPage,
  BaglantiGonderildiPage,
  GirisHataPage,
} from './pages/girisDurumSayfalari'

function bosAdapters(): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
  } as AuthAdapters
}

function sayfaRouter(Component: () => ReactElement) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={bosAdapters()}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const sayfa = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: Component,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([sayfa]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

const SAYFALAR: ReadonlyArray<[string, () => ReactElement]> = [
  ['GirisPage', GirisPage],
  ['GirisKodPage', GirisKodPage],
  ['GirisParolaPage', GirisParolaPage],
]

/** Durum sayfaları form taşımaz — yalnız landmark/heading/alert sözleşmesi test edilir. */
const DURUM_SAYFALARI: ReadonlyArray<[string, () => ReactElement]> = [
  ['BaglantiGonderildiPage', BaglantiGonderildiPage],
  ['BaglantiGecersizPage', BaglantiGecersizPage],
  ['GirisHataPage', GirisHataPage],
]

const TUM_SAYFALAR: ReadonlyArray<[string, () => ReactElement]> = [
  ...SAYFALAR,
  ...DURUM_SAYFALARI,
]

const HATA_TONLU_SAYFALAR: ReadonlyArray<[string, () => ReactElement]> = [
  ['BaglantiGecersizPage', BaglantiGecersizPage],
  ['GirisHataPage', GirisHataPage],
]

describe('auth erişilebilirlik geçidi', () => {
  it.each(SAYFALAR)('%s tek h1 taşır', async (_ad, Component) => {
    render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it.each(TUM_SAYFALAR)('%s tam olarak bir main landmark taşır', async (_ad, Component) => {
    render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it.each(HATA_TONLU_SAYFALAR)(
    '%s hata tonunda alert main landmark\'ı değil yalnız açıklamayı kapsar',
    async (_ad, Component) => {
      render(<RouterProvider router={sayfaRouter(Component)} />)
      await screen.findByRole('heading', { level: 1 })
      const main = screen.getByRole('main')
      const alert = screen.getByRole('alert')
      expect(alert).not.toBe(main)
      expect(main.getAttribute('role')).not.toBe('alert')
      expect(main.contains(alert)).toBe(true)
    },
  )

  it.each(SAYFALAR)('%s içindeki her form alanı erişilebilir isim taşır', async (_ad, Component) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    const alanlar = Array.from(container.querySelectorAll('input'))
    expect(alanlar.length).toBeGreaterThan(0)
    for (const alan of alanlar) {
      const id = alan.getAttribute('id')
      expect(id, 'her input id taşımalı').toBeTruthy()
      expect(container.querySelector(`label[for="${id}"]`), `${id} için label bulunamadı`).toBeTruthy()
    }
  })

  it.each(SAYFALAR)('%s içindeki her form alanı autocomplete taşır', async (_ad, Component) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    for (const alan of Array.from(container.querySelectorAll('input'))) {
      expect(
        alan.getAttribute('autocomplete'),
        `${alan.getAttribute('id')} autocomplete taşımıyor`,
      ).toBeTruthy()
    }
  })

  it('kod alanı tek input olarak sunulur — altı kutulu desen kullanılmaz', async () => {
    const { container } = render(<RouterProvider router={sayfaRouter(GirisKodPage)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('input')).toHaveLength(1)
  })
})
