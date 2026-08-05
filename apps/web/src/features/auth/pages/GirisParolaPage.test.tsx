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
import type { Oturum } from '../domain/auth-types'
import { sahteAuthAdapters } from '../test-utils'
import { GirisParolaPage } from './GirisParolaPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

/** Bu sayfa özelinde `parolaIleGiris` varsayılanı başarılı sonuç döndürür. */
function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({
    parolaIleGiris: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    ...overrides,
  })
}

function parolaRouter(adapters: AuthAdapters) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const parolaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/parola',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisParolaPage,
  })
  const anaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>Ana sayfa</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([parolaRoute, anaRoute]),
    history: createMemoryHistory({ initialEntries: ['/giris/parola'] }),
  })
}

describe('GirisParolaPage', () => {
  it('e-posta ve parola alanlarını doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={parolaRouter(sahteAdapters())} />)
    expect((await screen.findByLabelText('E-posta')).getAttribute('autocomplete')).toBe('email')
    expect(screen.getByLabelText('Parola').getAttribute('autocomplete')).toBe('current-password')
  })

  it('doğru bilgilerle oturum açar', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={parolaRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('E-posta'), 'demo@arsam.net')
    await kullanici.type(screen.getByLabelText('Parola'), 'arsam1234')
    await kullanici.click(screen.getByRole('button', { name: 'Giriş yap' }))
    await waitFor(() =>
      expect(adapters.parolaIleGiris).toHaveBeenCalledWith('demo@arsam.net', 'arsam1234'),
    )
  })

  it('hatalı bilgide alert gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      parolaIleGiris: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kimlik' as const,
        mesaj: 'E-posta veya parola hatalı.',
      })),
    })
    render(<RouterProvider router={parolaRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('E-posta'), 'demo@arsam.net')
    await kullanici.type(screen.getByLabelText('Parola'), 'yanlis')
    await kullanici.click(screen.getByRole('button', { name: 'Giriş yap' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('E-posta veya parola hatalı.'),
    )
  })

  // Bu test eskiden bağlantının OLMADIĞINI doğruluyordu: `/parola-sifirla`
  // yazılmamıştı ve ölü bağlantı bırakmamak için satır kaldırılmıştı. İP-2
  // akışı yazdı; artık kurtarma yolunun SUNULDUĞU doğrulanıyor.
  it('parola sıfırlama bağlantısı sunar', async () => {
    render(<RouterProvider router={parolaRouter(sahteAdapters())} />)
    await screen.findByRole('heading', { level: 1 })
    const baglanti = await screen.findByRole('link', { name: /parolanızı mı unuttunuz/i })
    expect(baglanti.getAttribute('href')).toBe('/parola-sifirla')
  })

  it('telefonla giriş bağlantısı sunar', async () => {
    render(<RouterProvider router={parolaRouter(sahteAdapters())} />)
    expect(await screen.findByRole('link', { name: /telefonla giriş yapın/i })).toBeTruthy()
  })
})
