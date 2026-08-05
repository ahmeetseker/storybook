import type { ReactElement } from 'react'
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
import { sahteAuthAdapters } from '../test-utils'
import { ParolaSifirlaPage } from './ParolaSifirlaPage'
import { ParolaYeniPage } from './ParolaYeniPage'
import {
  ParolaBaglantiGecersizPage,
  ParolaBaglantiGonderildiPage,
  ParolaSifirlandiPage,
} from './parolaSifirlamaDurumSayfalari'

const arama = (search: Record<string, unknown>) => ({
  donus: typeof search.donus === 'string' ? search.donus : undefined,
  token: typeof search.token === 'string' ? search.token : undefined,
})

/** Akışın tüm duraklarını içeren router — yönlendirmeler gerçekten izlenir. */
function akisRouter(Sayfa: () => ReactElement | null, adapters: AuthAdapters, yol = '/') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const durak = (path: string, Bilesen: () => ReactElement | null) =>
    createRoute({ getParentRoute: () => rootRoute, path, validateSearch: arama, component: Bilesen })

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      durak('/', Sayfa),
      durak('/parola-sifirla/gonderildi', ParolaBaglantiGonderildiPage),
      durak('/parola-sifirla/tamam', ParolaSifirlandiPage),
      durak('/parola-sifirla/gecersiz', ParolaBaglantiGecersizPage),
      durak('/giris', () => <h1>Giriş yapın</h1>),
      durak('/giris/parola', () => <h1>Parola ile giriş</h1>),
      durak('/parola-sifirla', () => <h1>Parolanızı sıfırlayın</h1>),
    ]),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
  return router
}

describe('ParolaSifirlaPage', () => {
  it('geçersiz e-postada adapteri çağırmaz ve alanı işaretler', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters()
    render(<RouterProvider router={akisRouter(ParolaSifirlaPage, adapters)} />)

    await kullanici.type(await screen.findByLabelText('E-posta'), 'bozuk')
    await kullanici.click(screen.getByRole('button', { name: 'Bağlantı gönder' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.parolaSifirlamaIste).not.toHaveBeenCalled()

    const alan = screen.getByLabelText('E-posta')
    expect(alan.getAttribute('aria-invalid')).toBe('true')
    const hataId = alan.getAttribute('aria-describedby')
    expect(hataId).toBeTruthy()
    expect(document.getElementById(hataId as string)?.textContent).toBeTruthy()
    expect(document.activeElement).toBe(alan)
  })

  it('geçerli e-postada gönderildi sayfasına taşır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters({
      parolaSifirlamaIste: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { maskeliEPosta: 'ay***@arsam.net' },
      })),
    })
    const router = akisRouter(ParolaSifirlaPage, adapters)
    render(<RouterProvider router={router} />)

    await kullanici.type(await screen.findByLabelText('E-posta'), 'ayse@arsam.net')
    await kullanici.click(screen.getByRole('button', { name: 'Bağlantı gönder' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/parola-sifirla/gonderildi'))
    expect(adapters.parolaSifirlamaIste).toHaveBeenCalledWith('ayse@arsam.net')
  })
})

describe('ParolaYeniPage', () => {
  it('kayıt formuyla aynı parola kuralını uygular', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters()
    render(<RouterProvider router={akisRouter(ParolaYeniPage, adapters, '/?token=demo-token')} />)

    await kullanici.type(await screen.findByLabelText('Yeni parola'), 'kisa')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı kaydet' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.parolaSifirla).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Yeni parola').getAttribute('aria-invalid')).toBe('true')
  })

  it('parolalar uyuşmuyorsa tekrar alanını işaretler', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters()
    render(<RouterProvider router={akisRouter(ParolaYeniPage, adapters, '/?token=demo-token')} />)

    await kullanici.type(await screen.findByLabelText('Yeni parola'), 'Arsam1234')
    await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam5678')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı kaydet' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.parolaSifirla).not.toHaveBeenCalled()
    const tekrar = screen.getByLabelText('Yeni parola (tekrar)')
    expect(tekrar.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(tekrar)
  })

  it('başarılı sıfırlamada tamam sayfasına taşır ve token ile çağırır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters({
      parolaSifirla: vi.fn(async () => ({ durum: 'basarili' as const, veri: null })),
    })
    const router = akisRouter(ParolaYeniPage, adapters, '/?token=demo-token')
    render(<RouterProvider router={router} />)

    await kullanici.type(await screen.findByLabelText('Yeni parola'), 'Arsam1234')
    await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam1234')
    await kullanici.click(screen.getByRole('button', { name: 'Parolayı kaydet' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/parola-sifirla/tamam'))
    expect(adapters.parolaSifirla).toHaveBeenCalledWith('demo-token', 'Arsam1234')
  })

  // Token sorunu form içinde düzeltilemez; kullanıcı formda takılı kalmamalı.
  it.each(['gecersiz-token', 'token-suresi-doldu'] as const)(
    '%s hatasında geçersiz sayfasına taşır',
    async (kod) => {
      const kullanici = userEvent.setup()
      const adapters = sahteAuthAdapters({
        parolaSifirla: vi.fn(async () => ({
          durum: 'hata' as const,
          kod,
          mesaj: 'Bağlantı geçersiz.',
        })),
      })
      const router = akisRouter(ParolaYeniPage, adapters, '/?token=eski')
      render(<RouterProvider router={router} />)

      await kullanici.type(await screen.findByLabelText('Yeni parola'), 'Arsam1234')
      await kullanici.type(screen.getByLabelText('Yeni parola (tekrar)'), 'Arsam1234')
      await kullanici.click(screen.getByRole('button', { name: 'Parolayı kaydet' }))

      await waitFor(() => expect(router.state.location.pathname).toBe('/parola-sifirla/gecersiz'))
    },
  )
})

describe('parola sıfırlama durum sayfaları', () => {
  it('gönderildi sayfası hesabın varlığını açıklamaz ve alert kullanmaz', async () => {
    render(<RouterProvider router={akisRouter(ParolaBaglantiGonderildiPage, sahteAuthAdapters())} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('main').textContent).toMatch(/kayıtlı bir hesap varsa/i)
  })

  it('geçersiz sayfası yeni bağlantı isteme yolu sunar', async () => {
    render(<RouterProvider router={akisRouter(ParolaBaglantiGecersizPage, sahteAuthAdapters())} />)
    const baglanti = await screen.findByRole('link', { name: /yeni bağlantı iste/i })
    expect(baglanti.getAttribute('href')).toBe('/parola-sifirla')
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('başarı sayfası girişe yönlendirir', async () => {
    render(<RouterProvider router={akisRouter(ParolaSifirlandiPage, sahteAuthAdapters())} />)
    const baglanti = await screen.findByRole('link', { name: /giriş yapın/i })
    expect(baglanti.getAttribute('href')).toBe('/giris/parola')
  })
})
