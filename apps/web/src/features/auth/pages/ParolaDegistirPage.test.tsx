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
import { ParolaDegistirPage } from './ParolaDegistirPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

function oturumlu(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({ oturumuGetir: () => ORNEK_OTURUM, ...overrides })
}

function degistirRouter(adapters: AuthAdapters) {
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
  return createRouter({
    routeTree: rootRoute.addChildren([
      createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: arama, component: ParolaDegistirPage }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/hesabim/guvenlik',
        validateSearch: arama,
        component: () => <h1>Güvenlik</h1>,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/giris',
        validateSearch: arama,
        component: () => <h1>Giriş yapın</h1>,
      }),
    ]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('ParolaDegistirPage', () => {
  it('mevcut parolayı da ister — oturum ele geçirilse bile sessiz değişiklik olmasın', async () => {
    render(<RouterProvider router={degistirRouter(oturumlu())} />)
    expect(await screen.findByLabelText('Mevcut parola')).toBeTruthy()
    expect(screen.getByLabelText('Mevcut parola').getAttribute('autocomplete')).toBe(
      'current-password',
    )
    expect(screen.getByLabelText('Yeni parola').getAttribute('autocomplete')).toBe('new-password')
  })

  it('boş formda adapteri çağırmaz ve ilk hatalı alana odaklanır', async () => {
    const kullanici = userEvent.setup()
    const adapters = oturumlu()
    render(<RouterProvider router={degistirRouter(adapters)} />)

    await kullanici.click(await screen.findByRole('button', { name: 'Parolayı değiştir' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

    expect(adapters.parolaDegistir).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText('Mevcut parola'))
    expect(screen.getByLabelText('Mevcut parola').getAttribute('aria-invalid')).toBe('true')
  })

  it('yeni parolalar uyuşmuyorsa gönderilmez', async () => {
    const kullanici = userEvent.setup()
    const adapters = oturumlu()
    render(<RouterProvider router={degistirRouter(adapters)} />)

    await kullanici.type(await screen.findByLabelText('Mevcut parola'), 'arsam1234')
    await kullanici.type(screen.getByLabelText('Yeni parola'), 'Arsam5678')
    await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam9999')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı değiştir' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.parolaDegistir).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Yeni parola (tekrar)').getAttribute('aria-invalid')).toBe('true')
  })

  // Yanlış mevcut parola sunucudan gelir; kullanıcı hangi alanı düzelteceğini
  // sayfa özetinden çıkarmak zorunda kalmamalı.
  it('yanlış mevcut parolada o alanı işaretler ve odaklanır', async () => {
    const kullanici = userEvent.setup()
    const adapters = oturumlu({
      parolaDegistir: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'parola-yanlis' as const,
        mesaj: 'Mevcut parolanız hatalı.',
      })),
    })
    render(<RouterProvider router={degistirRouter(adapters)} />)

    await kullanici.type(await screen.findByLabelText('Mevcut parola'), 'yanlis')
    await kullanici.type(screen.getByLabelText('Yeni parola'), 'Arsam5678')
    await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam5678')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı değiştir' }))

    await waitFor(() =>
      expect(screen.getByLabelText('Mevcut parola').getAttribute('aria-invalid')).toBe('true'),
    )
    expect(document.activeElement).toBe(screen.getByLabelText('Mevcut parola'))
  })

  it('başarılı değişimde güvenlik sayfasına döner', async () => {
    const kullanici = userEvent.setup()
    const adapters = oturumlu({
      parolaDegistir: vi.fn(async () => ({ durum: 'basarili' as const, veri: null })),
    })
    const router = degistirRouter(adapters)
    render(<RouterProvider router={router} />)

    await kullanici.type(await screen.findByLabelText('Mevcut parola'), 'arsam1234')
    await kullanici.type(screen.getByLabelText('Yeni parola'), 'Arsam5678')
    await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam5678')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı değiştir' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/hesabim/guvenlik'))
    expect(adapters.parolaDegistir).toHaveBeenCalledWith('arsam1234', 'Arsam5678')
  })

  it('oturumsuz kullanıcıya formu çizmez', async () => {
    render(<RouterProvider router={degistirRouter(sahteAuthAdapters())} />)
    await waitFor(() => expect(screen.queryByLabelText('Mevcut parola')).toBeNull())
  })
})
