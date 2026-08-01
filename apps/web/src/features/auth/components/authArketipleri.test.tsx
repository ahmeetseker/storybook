import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthFormPage } from './AuthFormPage'
import { AuthStatusPage } from './AuthStatusPage'
import { AuthCallbackPage } from './AuthCallbackPage'

describe('AuthFormPage', () => {
  it('başlığı tek h1 olarak çizer', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    const basliklar = screen.getAllByRole('heading', { level: 1 })
    expect(basliklar).toHaveLength(1)
    expect(basliklar[0].textContent).toBe('Giriş yapın')
  })

  it('gönderimde onSubmit çağırır', async () => {
    const kullanici = userEvent.setup()
    const gonder = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={gonder} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(gonder).toHaveBeenCalledTimes(1)
  })

  it('hatayı alert olarak duyurur', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" hata="Kod hatalı.">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('alert').textContent).toBe('Kod hatalı.')
  })

  it('gönderilirken butonu devre dışı bırakır', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" gonderiliyor>
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('button', { name: 'Devam et' })).toHaveProperty('disabled', true)
  })

  it('sunucu taraflı işlenen markette gönder butonu devre dışıdır — hidrasyon öncesi tıklama native form gönderimini tetiklemesin', () => {
    // Bu uygulama TanStack Start ile sunucuda render edilir. `renderToString`
    // hiçbir efekt çalıştırmaz — bu yüzden gerçek tarayıcıda kullanıcının JS
    // yüklenmeden/hidrasyon bitmeden ÖNCE göreceği markup budur. Buton bu
    // anda devre dışı değilse, erken bir tıklama React'in onSubmit'ini hiç
    // çalıştırmadan tarayıcının native form gönderimini tetikler (input'ta
    // `name` yok, form'da `action` yok → mevcut yola boş sorgu dizesiyle GET
    // atılır ve `donus` parametresi sessizce kaybolur).
    const html = renderToString(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    const dom = document.createElement('div')
    dom.innerHTML = html
    const buton = dom.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(buton, 'gönder butonu bulunamadı').toBeTruthy()
    expect(buton?.disabled).toBe(true)
  })

  it('hidrasyon tamamlandıktan sonra gönder butonu etkinleşir', async () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Devam et' })).toHaveProperty('disabled', false),
    )
  })
})

describe('AuthStatusPage', () => {
  it('başlık ve açıklamayı çizer', () => {
    render(<AuthStatusPage tone="success" baslik="Parolanız değişti" aciklama="Yeni parolanızla giriş yapabilirsiniz." />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Parolanız değişti')
    expect(screen.getByText('Yeni parolanızla giriş yapabilirsiniz.')).toBeTruthy()
  })

  it('hata tonunda içeriği alert olarak duyurur', () => {
    render(<AuthStatusPage tone="error" baslik="Bağlantı geçersiz" aciklama="Yeni bağlantı isteyin." />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('bilgi tonunda alert kullanmaz', () => {
    render(<AuthStatusPage tone="info" baslik="Bağlantı gönderildi" aciklama="E-postanızı kontrol edin." />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('verilen tonu data özniteliğiyle yayınlar', () => {
    const { container } = render(<AuthStatusPage tone="success" baslik="Tamam" aciklama="Bitti." />)
    expect(container.querySelector('[data-tone="success"]')).toBeTruthy()
  })

  it('birincilEylem ve ikincilBaglanti mevcut search parametrelerini korur', async () => {
    const arama = (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    })
    const rootRoute = createRootRoute({ component: () => <Outlet /> })
    const durumRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/hesap-var',
      validateSearch: arama,
      component: () => (
        <AuthStatusPage
          tone="info"
          baslik="Bu hesap zaten var"
          aciklama="Giriş yaparak devam edebilirsiniz."
          birincilEylem={{ etiket: 'Giriş yapın', hedef: '/giris' }}
          ikincilBaglanti={{ etiket: 'Parolanızı mı unuttunuz?', hedef: '/parola-sifirla' }}
        />
      ),
    })
    const girisRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş</h1>,
    })
    const parolaRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/parola-sifirla',
      validateSearch: arama,
      component: () => <h1>Parola sıfırlama</h1>,
    })
    const router = createRouter({
      routeTree: rootRoute.addChildren([durumRoute, girisRoute, parolaRoute]),
      history: createMemoryHistory({ initialEntries: ['/kayit/hesap-var?donus=%2Fhesabim'] }),
    })
    render(<RouterProvider router={router} />)

    const birincil = await screen.findByRole('link', { name: 'Giriş yapın' })
    expect(birincil.getAttribute('href')).toBe('/giris?donus=%2Fhesabim')

    const ikincil = screen.getByRole('link', { name: 'Parolanızı mı unuttunuz?' })
    expect(ikincil.getAttribute('href')).toBe('/parola-sifirla?donus=%2Fhesabim')
  })
})

describe('AuthCallbackPage', () => {
  it('bekleme durumunu status olarak duyurur', () => {
    render(<AuthCallbackPage durum="pending" baslik="Doğrulanıyor" />)
    expect(screen.getByRole('status').textContent).toContain('Doğrulanıyor')
  })

  it('hata durumunda mesajı alert olarak duyurur', () => {
    render(<AuthCallbackPage durum="error" baslik="Doğrulanamadı" hataMesaji="Bağlantının süresi dolmuş." />)
    expect(screen.getByRole('alert').textContent).toContain('Bağlantının süresi dolmuş.')
  })
})
