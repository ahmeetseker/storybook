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
import { sahteAuthAdapters } from '../test-utils'
import type { AuthAdapters } from '../data/auth-adapters'
import type { Oturum } from '../domain/auth-types'
import { KayitPage } from './KayitPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Yeni Kullanıcı',
  telefon: '5559998877',
  ePosta: 'yeni@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

/** Bu sayfa özelinde `kayitYap` varsayılanı başarılı sonuç döndürür. */
function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({
    kayitYap: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    ...overrides,
  })
}

function kayitRouter(adapters: AuthAdapters, yol = '/kayit') {
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
      path: '/kayit',
      validateSearch: arama,
      component: KayitPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/kurumsal',
      component: () => <h1>Kurumsal başvuru</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/hesap-var',
      component: () => <h1>Bu hesap zaten var</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

async function formuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
  await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
  await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
  await kullanici.type(screen.getByLabelText('Telefon'), '5559998877')
  await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')
  await kullanici.click(screen.getByLabelText(/aydınlatma metnini/i))
}

describe('KayitPage', () => {
  it('hesap tipi seçeneklerini sunar, bireysel varsayılandır', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    const bireysel = await screen.findByLabelText(/bireysel/i)
    expect((bireysel as HTMLInputElement).checked).toBe(true)
    expect(screen.getByLabelText(/emlak ofisi/i)).toBeTruthy()
  })

  it('alanları doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    expect((await screen.findByLabelText('Ad soyad')).getAttribute('autocomplete')).toBe('name')
    expect(screen.getByLabelText('E-posta').getAttribute('autocomplete')).toBe('email')
    expect(screen.getByLabelText('Telefon').getAttribute('autocomplete')).toBe('tel')
    expect(screen.getByLabelText('Parola').getAttribute('autocomplete')).toBe('new-password')
  })

  it('eksik alanla gönderimde adapter çağrılmaz ve hata gösterilir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kayitYap).not.toHaveBeenCalled()
  })

  it('KVKK onayı verilmeden gönderilemez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
    await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
    await kullanici.type(screen.getByLabelText('Telefon'), '5559998877')
    await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kayitYap).not.toHaveBeenCalled()
  })

  it('geçerli formu adapter’a iletir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(adapters.kayitYap).toHaveBeenCalledWith(
        expect.objectContaining({
          adSoyad: 'Yeni Kullanıcı',
          ePosta: 'yeni@arsam.net',
          telefon: '5559998877',
          hesapTipi: 'bireysel',
          kvkkOnayi: true,
        }),
      ),
    )
  })

  it('hesap zaten varsa durum sayfasına yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'hesap-zaten-var' as const,
        mesaj: 'Bu e-posta adresiyle bir hesap zaten var.',
      })),
    })
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bu hesap zaten var' })).toBeTruthy(),
    )
  })

  it('emlak ofisi seçiliyse kurumsal başvuruya yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { ...ORNEK_OTURUM, hesapTipi: 'kurumsal' as const },
      })),
    })
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.click(screen.getByLabelText(/emlak ofisi/i))
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Kurumsal başvuru' })).toBeTruthy(),
    )
  })
})
