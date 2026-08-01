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
import { AuthSessionProvider } from '../AuthSessionProvider'
import type { AuthAdapters } from '../data/auth-adapters'
import type { EidsDurumu, Oturum } from '../domain/auth-types'
import { sahteAuthAdapters } from '../test-utils'
import { HesapDogrulaPage } from './HesapDogrulaPage'

function oturumOlustur(eidsDurumu: EidsDurumu): Oturum {
  return {
    kullaniciId: 'uye-1',
    adSoyad: 'Ayşe Kaya',
    telefon: '5551112233',
    ePosta: 'ayse@arsam.net',
    hesapTipi: 'kurumsal',
    eidsDurumu,
  }
}

function sahteAdapters(oturum: Oturum | null, overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({
    eidsDogrulamaBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: oturumOlustur('dogrulandi'),
    })),
    oturumuGetir: () => oturum,
    ...overrides,
  })
}

function dogrulaRouter(adapters: AuthAdapters) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const rotalar = [
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/hesap/dogrula',
      component: HesapDogrulaPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: (search: Record<string, unknown>) => ({
        donus: typeof search.donus === 'string' ? search.donus : undefined,
      }),
      component: () => <h1>Giriş yapın</h1>,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: () => <h1>Hesabım</h1> }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/hesap/dogrula'] }),
  })
}

describe('HesapDogrulaPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('doğrulanmamış hesapta başlatma eylemini sunar', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('yok')))} />)
    expect(await screen.findByRole('button', { name: 'Doğrulamayı başlat' })).toBeTruthy()
  })

  it('beklemedeki hesapta durumu açıklar', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('beklemede')))} />)
    expect(await screen.findByText(/başvurunuz alındı/i)).toBeTruthy()
  })

  it('zaten doğrulanmış hesapta başarı durumu gösterir ve form sunmaz', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('dogrulandi')))} />)
    expect(await screen.findByRole('heading', { name: 'EİDS doğrulaması tamam' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Doğrulamayı başlat' })).toBeNull()
  })

  it('doğrulamayı başlatır ve adapter’ı çağırır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(oturumOlustur('yok'))
    render(<RouterProvider router={dogrulaRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Doğrulamayı başlat' }))
    await waitFor(() => expect(adapters.eidsDogrulamaBaslat).toHaveBeenCalled())
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(oturumOlustur('yok'), {
      eidsDogrulamaBaslat: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'eids-reddedildi' as const,
        mesaj: 'EİDS kaydınız bulunamadı.',
      })),
    })
    render(<RouterProvider router={dogrulaRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Doğrulamayı başlat' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('EİDS kaydınız bulunamadı.'),
    )
  })
})
