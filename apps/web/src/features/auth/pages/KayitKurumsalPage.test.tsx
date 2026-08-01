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
import { KayitKurumsalPage } from './KayitKurumsalPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'kurumsal',
  eidsDurumu: 'yok',
}

function sahteAdapters(oturum: Oturum | null, overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return sahteAuthAdapters({
    kurumsalBasvuruGonder: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { ...ORNEK_OTURUM, eidsDurumu: 'beklemede' as const },
    })),
    oturumuGetir: () => oturum,
    ...overrides,
  })
}

function kurumsalRouter(adapters: AuthAdapters) {
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
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/kurumsal',
      validateSearch: arama,
      component: KayitKurumsalPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/hesap/dogrula',
      component: () => <h1>EİDS doğrulaması</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/kayit/kurumsal'] }),
  })
}

async function basvuruyuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
  await kullanici.type(screen.getByLabelText('Ticaret ünvanı'), 'Arsam Gayrimenkul Ltd. Şti.')
  await kullanici.type(screen.getByLabelText('Vergi numarası'), '1234567890')
  await kullanici.type(screen.getByLabelText('Vergi dairesi'), 'Konak')
  await kullanici.type(screen.getByLabelText('İl'), 'İzmir')
  await kullanici.type(screen.getByLabelText('İlçe'), 'Konak')
  await kullanici.type(screen.getByLabelText('Yetki belgesi numarası'), 'YB-2026-0042')
  await kullanici.type(screen.getByLabelText('Yetkili ad soyad'), 'Ayşe Kaya')
  await kullanici.type(screen.getByLabelText('Yetkili e-posta'), 'ayse@arsam.net')
  await kullanici.type(screen.getByLabelText('Yetkili telefon'), '5551112233')
}

describe('KayitKurumsalPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('işletme ve yetkili gruplarını başlıklarıyla sunar', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    expect(await screen.findByText('İşletme bilgileri')).toBeTruthy()
    expect(screen.getByText('Yetkili kişi')).toBeTruthy()
  })

  it('eksik alanla gönderimde adapter çağrılmaz', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kurumsalBasvuruGonder).not.toHaveBeenCalled()
  })

  it('geçersiz vergi numarasını alan hatası olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Vergi numarası')
    await kullanici.type(screen.getByLabelText('Vergi numarası'), '123')
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(screen.getByText('Vergi numarası 10 haneli olmalı.')).toBeTruthy())
    expect(adapters.kurumsalBasvuruGonder).not.toHaveBeenCalled()
  })

  it('geçerli başvuruyu iletir ve EİDS adımına yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await basvuruyuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(adapters.kurumsalBasvuruGonder).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'EİDS doğrulaması' })).toBeTruthy(),
    )
  })
})
