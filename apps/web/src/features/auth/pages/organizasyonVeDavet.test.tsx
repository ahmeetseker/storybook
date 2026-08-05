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
import type { Oturum } from '../domain/auth-types'
import { sahteAuthAdapters } from '../test-utils'
import { DavetPage } from './DavetPage'
import { OrganizasyonSecPage } from './OrganizasyonSecPage'
import { EPostaDogrulaPage } from './EPostaDogrulaPage'
import { GoogleCallbackPage } from './GoogleCallbackPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'kurumsal',
  eidsDurumu: 'yok',
}

const arama = (search: Record<string, unknown>) => ({
  donus: typeof search.donus === 'string' ? search.donus : undefined,
  token: typeof search.token === 'string' ? search.token : undefined,
  code: typeof search.code === 'string' ? search.code : undefined,
  error: typeof search.error === 'string' ? search.error : undefined,
})

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

  return createRouter({
    routeTree: rootRoute.addChildren([
      durak('/', Sayfa),
      durak('/davet/$token', Sayfa),
      durak('/davet/gecersiz', () => <h1>Davet geçersiz</h1>),
      durak('/hesabim', () => <h1>Hesabım</h1>),
      durak('/hesabim/guvenlik', () => <h1>Güvenlik</h1>),
      durak('/yetkisiz', () => <h1>Yetkiniz yok</h1>),
      durak('/giris', () => <h1>Giriş yapın</h1>),
      durak('/hesap/askida', () => <h1>Hesap askıda</h1>),
      durak('/kayit/kurumsal', () => <h1>Ofis başvurusu</h1>),
    ]),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

describe('DavetPage', () => {
  it('kabul etmeden ÖNCE organizasyon, rol ve davet edeni gösterir', async () => {
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      davetiGetir: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { organizasyonAdi: 'Yılmaz Gayrimenkul', davetEden: 'Mehmet Yılmaz', rol: 'danisman' as const },
      })),
    })
    render(<RouterProvider router={akisRouter(DavetPage, adapters, '/davet/demo-davet')} />)

    await screen.findByRole('heading', { level: 1, name: 'Davetiniz var' })
    const main = screen.getByRole('main')
    expect(main.textContent).toContain('Yılmaz Gayrimenkul')
    expect(main.textContent).toContain('Mehmet Yılmaz')
    expect(main.textContent).toContain('Danışman')
    // Özet gösterilmeden kabul çağrılmamalı.
    expect(adapters.davetiKabulEt).not.toHaveBeenCalled()
  })

  it('geçersiz davette gecersiz sayfasına taşır', async () => {
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      davetiGetir: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-token' as const,
        mesaj: 'Davet geçersiz.',
      })),
    })
    const router = akisRouter(DavetPage, adapters, '/davet/bozuk')
    render(<RouterProvider router={router} />)
    await waitFor(() => expect(router.state.location.pathname).toBe('/davet/gecersiz'))
  })

  it('kabul edilince hesaba taşır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      davetiGetir: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { organizasyonAdi: 'Yılmaz Gayrimenkul', davetEden: 'Mehmet Yılmaz', rol: 'danisman' as const },
      })),
      davetiKabulEt: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    })
    const router = akisRouter(DavetPage, adapters, '/davet/demo-davet')
    render(<RouterProvider router={router} />)

    await kullanici.click(await screen.findByRole('button', { name: 'Daveti kabul et' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/hesabim'))
    expect(adapters.davetiKabulEt).toHaveBeenCalledWith('demo-davet')
  })
})

describe('OrganizasyonSecPage', () => {
  const uclu = () =>
    sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      organizasyonlariGetir: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: [
          { id: 'org-1', ad: 'Yılmaz Gayrimenkul', rol: 'sahip' as const },
          { id: 'org-2', ad: 'Ege Arsa Ofisi', rol: 'yonetici' as const },
        ],
      })),
    })

  it('organizasyonları gerçek buton olarak listeler', async () => {
    render(<RouterProvider router={akisRouter(OrganizasyonSecPage, uclu())} />)
    await screen.findByRole('heading', { level: 1, name: 'Organizasyon seçin' })
    expect(screen.getByRole('button', { name: /Yılmaz Gayrimenkul/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ege Arsa Ofisi/ })).toBeTruthy()
  })

  it('seçim yapınca donus hedefine taşır', async () => {
    const kullanici = userEvent.setup()
    const adapters = uclu()
    adapters.organizasyonSec = vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: ORNEK_OTURUM,
    }))
    const router = akisRouter(OrganizasyonSecPage, adapters, '/?donus=%2Fhesabim')
    render(<RouterProvider router={router} />)

    await kullanici.click(await screen.findByRole('button', { name: /Ege Arsa Ofisi/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/hesabim'))
    expect(adapters.organizasyonSec).toHaveBeenCalledWith('org-2')
  })

  it('yetkisiz seçimde yetkisiz sayfasına taşır', async () => {
    const kullanici = userEvent.setup()
    const adapters = uclu()
    adapters.organizasyonSec = vi.fn(async () => ({
      durum: 'hata' as const,
      kod: 'yetkisiz' as const,
      mesaj: 'Erişiminiz yok.',
    }))
    const router = akisRouter(OrganizasyonSecPage, adapters)
    render(<RouterProvider router={router} />)

    await kullanici.click(await screen.findByRole('button', { name: /Ege Arsa Ofisi/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/yetkisiz'))
  })

  it('organizasyon yoksa ofis başvurusuna yönlendirir', async () => {
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      organizasyonlariGetir: vi.fn(async () => ({ durum: 'basarili' as const, veri: [] })),
    })
    render(<RouterProvider router={akisRouter(OrganizasyonSecPage, adapters)} />)
    expect(await screen.findByRole('link', { name: /ofis başvurusu/i })).toBeTruthy()
  })
})

describe('EPostaDogrulaPage', () => {
  it('geçerli token ile yeni adresi onaylar', async () => {
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      ePostaDegisikliginiDogrula: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { ...ORNEK_OTURUM, ePosta: 'yeni@arsam.net' },
      })),
    })
    render(<RouterProvider router={akisRouter(EPostaDogrulaPage, adapters, '/?token=demo-eposta')} />)

    await screen.findByRole('heading', { level: 1, name: 'E-posta adresiniz doğrulandı' })
    expect(screen.getByRole('main').textContent).toContain('yeni@arsam.net')
  })

  it('geçersiz tokende hata durumunu alert olarak gösterir', async () => {
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      ePostaDegisikliginiDogrula: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-token' as const,
        mesaj: 'Bağlantı geçersiz.',
      })),
    })
    render(<RouterProvider router={akisRouter(EPostaDogrulaPage, adapters, '/?token=bozuk')} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
  })
})

describe('GoogleCallbackPage', () => {
  it('başarılı dönüşte donus hedefine taşır', async () => {
    const adapters = sahteAuthAdapters({
      googleGirisiTamamla: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    })
    const router = akisRouter(GoogleCallbackPage, adapters, '/?code=abc&donus=%2Fhesabim')
    render(<RouterProvider router={router} />)

    await waitFor(() => expect(router.state.location.pathname).toBe('/hesabim'))
    expect(adapters.googleGirisiTamamla).toHaveBeenCalledWith('abc')
  })

  // Kullanıcı Google ekranında iptal ettiyse bu bir arıza değil; hata
  // göstermeden girişe dönmek doğru davranış.
  it('sağlayıcı hatasında sessizce girişe döner', async () => {
    const adapters = sahteAuthAdapters()
    const router = akisRouter(GoogleCallbackPage, adapters, '/?error=access_denied')
    render(<RouterProvider router={router} />)

    await waitFor(() => expect(router.state.location.pathname).toBe('/giris'))
    expect(adapters.googleGirisiTamamla).not.toHaveBeenCalled()
  })

  it('bizim tarafımızdaki hatayı gösterir ve main landmarkını korur', async () => {
    const adapters = sahteAuthAdapters({
      googleGirisiTamamla: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'ag-hatasi' as const,
        mesaj: 'Bağlantı kurulamadı.',
      })),
    })
    render(<RouterProvider router={akisRouter(GoogleCallbackPage, adapters, '/?code=abc')} />)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Bağlantı kurulamadı.')
    expect(screen.getByRole('main')).not.toBe(alert)
  })
})
