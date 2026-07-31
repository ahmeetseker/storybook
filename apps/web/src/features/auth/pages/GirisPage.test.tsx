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
import { GirisPage } from './GirisPage'

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { kanal: 'sms' as const, maskeliKimlik: '555 *** 22 33' },
    })),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function girisRouter(adapters: AuthAdapters, baslangicYolu = '/giris') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisPage,
  })
  const kodRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/kod',
    component: () => <h1>Kod ekranı</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([girisRoute, kodRoute]),
    history: createMemoryHistory({ initialEntries: [baslangicYolu] }),
  })
}

describe('GirisPage', () => {
  it('telefon alanını doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={girisRouter(sahteAdapters())} />)
    const alan = await screen.findByLabelText('Telefon numarası')
    expect(alan.getAttribute('autocomplete')).toBe('tel')
    expect(alan.getAttribute('inputmode')).toBe('numeric')
  })

  it('geçerli telefonla giriş başlatır ve kod ekranına gider', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={girisRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await waitFor(() => expect(adapters.girisBaslat).toHaveBeenCalledWith('telefon', '5551112233'))
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      girisBaslat: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kimlik' as const,
        mesaj: 'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
      })),
    })
    render(<RouterProvider router={girisRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '123')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('5XX XXX XX XX'),
    )
  })

  it('diğer yöntemlere bağlantı sunar', async () => {
    render(<RouterProvider router={girisRouter(sahteAdapters())} />)
    expect(await screen.findByRole('link', { name: /parola/i })).toBeTruthy()
  })
})
