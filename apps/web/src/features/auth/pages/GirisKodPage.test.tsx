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
import { GirisKodPage } from './GirisKodPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

/** Bu sayfa özelinde `koduDogrula` varsayılanı başarılı sonuç döndürür. */
function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({
    koduDogrula: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    ...overrides,
  })
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

  it('eksik haneli kodda adapteri çağırmaz ve alanı işaretler', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kodRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '12')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.koduDogrula).not.toHaveBeenCalled()
    const alan = screen.getByLabelText('Doğrulama kodu')
    expect(alan.getAttribute('aria-invalid')).toBe('true')
    expect(alan.getAttribute('aria-describedby')).toBeTruthy()
  })

  /**
   * Bu blok akışın TEK kurtarma yolunu korur. Önceden "Kod 3 dakika
   * geçerlidir" yazıyordu ama tekrar gönderme yolu yoktu; SMS gelmeyen
   * kullanıcı akışa baştan başlamak zorundaydı.
   */
  describe('kodu tekrar gönderme', () => {
    it('geri sayım sürerken buton kapalıdır ve kalan süre duyurulur', async () => {
      render(<RouterProvider router={kodRouter(sahteAdapters())} />)
      const buton = await screen.findByRole('button', { name: 'Kodu tekrar gönder' })
      expect(buton).toHaveProperty('disabled', true)
      expect(screen.getByText(/saniye bekleyin/i)).toBeTruthy()
    })

    it('geri sayım bitince buton açılır ve kodu yeniden gönderir', async () => {
      vi.useFakeTimers()
      try {
        const adapters = sahteAdapters({
          kodTekrarGonder: vi.fn(async () => ({
            durum: 'basarili' as const,
            veri: { kanal: 'sms' as const, maskeliKimlik: '555 *** 22 33' },
          })),
        })
        render(<RouterProvider router={kodRouter(adapters)} />)
        await vi.advanceTimersByTimeAsync(60_000)

        const buton = screen.getByRole('button', { name: 'Kodu tekrar gönder' })
        expect(buton).toHaveProperty('disabled', false)

        buton.click()
        await vi.advanceTimersByTimeAsync(0)
        expect(adapters.kodTekrarGonder).toHaveBeenCalledTimes(1)
        // Yeni kod gittiği duyurulur ve geri sayım yeniden başlar.
        expect(screen.getByText(/555 \*\*\* 22 33/)).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Kodu tekrar gönder' })).toHaveProperty(
          'disabled',
          true,
        )
      } finally {
        vi.useRealTimers()
      }
    })

    it('hız sınırına takılınca butonu kalıcı olarak kapatır', async () => {
      vi.useFakeTimers()
      try {
        const adapters = sahteAdapters({
          kodTekrarGonder: vi.fn(async () => ({
            durum: 'hata' as const,
            kod: 'cok-fazla-deneme' as const,
            mesaj: 'Çok fazla kod istediniz.',
          })),
        })
        render(<RouterProvider router={kodRouter(adapters)} />)
        await vi.advanceTimersByTimeAsync(60_000)

        screen.getByRole('button', { name: 'Kodu tekrar gönder' }).click()
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.getByRole('alert').textContent).toContain('Çok fazla kod')
        // Geri sayım dolsa bile buton açılmamalı.
        await vi.advanceTimersByTimeAsync(60_000)
        expect(screen.getByRole('button', { name: 'Kodu tekrar gönder' })).toHaveProperty(
          'disabled',
          true,
        )
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
