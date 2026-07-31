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
import { GirisKodPage } from './GirisKodPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function kodRouter(adapters: AuthAdapters, yol = '/giris/kod?donus=%2Fhesabim') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const kodRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/kod',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisKodPage,
  })
  const hesabimRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim',
    component: () => <h1>Hesabım</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([kodRoute, hesabimRoute]),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

describe('GirisKodPage', () => {
  it('kod alanını tek input olarak ve one-time-code autocomplete ile sunar', async () => {
    render(<RouterProvider router={kodRouter(sahteAdapters())} />)
    const alan = await screen.findByLabelText('Doğrulama kodu')
    expect(alan.getAttribute('autocomplete')).toBe('one-time-code')
    expect(alan.getAttribute('inputmode')).toBe('numeric')
    expect(alan.getAttribute('maxlength')).toBe('6')
  })

  it('doğru kodla oturum açar ve donus hedefine gider', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kodRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(adapters.koduDogrula).toHaveBeenCalledWith('000000'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hesabım' })).toBeTruthy())
  })

  it('yanlış kodda hatayı alert olarak gösterir ve yönlendirmez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      koduDogrula: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kod' as const,
        mesaj: 'Kod hatalı. Tekrar deneyin.',
      })),
    })
    render(<RouterProvider router={kodRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '999999')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Kod hatalı'))
    expect(screen.queryByRole('heading', { name: 'Hesabım' })).toBeNull()
  })

  it('dış dönüş adresini reddedip ana sayfaya yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(
      <RouterProvider
        router={kodRouter(adapters, '/giris/kod?donus=https%3A%2F%2Fkotu-site.example')}
      />,
    )
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(adapters.koduDogrula).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: 'Hesabım' })).toBeNull()
  })
})
