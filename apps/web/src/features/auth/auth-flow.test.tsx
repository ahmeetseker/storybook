import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider, useAuthSession, useKorumaliRota } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'
import { GirisPage } from './pages/GirisPage'
import { GirisKodPage } from './pages/GirisKodPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function akisAdapters(): AuthAdapters {
  let oturum: Oturum | null = null
  return {
    girisBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { kanal: 'sms' as const, maskeliKimlik: '555 *** 22 33' },
    })),
    koduDogrula: vi.fn(async () => {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili' as const, veri: ORNEK_OTURUM }
    }),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  } as AuthAdapters
}

function KorumaliHesabim() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  if (!girisYapildi) return null
  return <h1>Hesabım</h1>
}

function akisRouter(adapters: AuthAdapters, baslangic: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const arama = (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <h1>Ana sayfa</h1> }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: GirisPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris/kod',
      validateSearch: arama,
      component: GirisKodPage,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: KorumaliHesabim }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [baslangic] }),
  })
}

describe('auth akışı', () => {
  it('oturumsuz kullanıcıyı korumalı rotadan girişe yönlendirir', async () => {
    render(<RouterProvider router={akisRouter(akisAdapters(), '/hesabim')} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('giriş → kod → korumalı sayfaya dönüş yolunu tamamlar', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={akisRouter(akisAdapters(), '/hesabim')} />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
    await kullanici.type(screen.getByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kodu girin' })).toBeTruthy())
    await kullanici.type(screen.getByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hesabım' })).toBeTruthy())
  })

  it('dönüş parametresi olmadan giriş yapan kullanıcı ana sayfaya gider', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={akisRouter(akisAdapters(), '/giris')} />)

    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Ana sayfa' })).toBeTruthy())
  })
})
