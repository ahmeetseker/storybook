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
import { AuthSessionProvider, useAuthSession, useKorumaliRota } from './AuthSessionProvider'
import { sahteAuthAdapters } from './test-utils'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'
import { KayitPage } from './pages/KayitPage'
import { KayitKurumsalPage } from './pages/KayitKurumsalPage'
import { HesapDogrulaPage } from './pages/HesapDogrulaPage'

/**
 * Kayıt akışı entegrasyon testi (Faz 2).
 *
 * `auth-flow.test.tsx`'teki (Faz 1) durum taşıyan sahte adapter desenini
 * izler: gerçek `varsayilanAuthAdapters` yerine akış boyunca `oturum`
 * değişkenini bellekte tutan bir sahte adapter kullanılır. İki yol sınanır:
 * bireysel kayıt (tek adım) ve kurumsal kayıt (kayıt → kurumsal başvuru →
 * EİDS doğrulaması) — ikincisi Faz 2'nin tamamını uçtan uca kanıtlar.
 */

function akisAdapters(): AuthAdapters {
  let oturum: Oturum | null = null
  return sahteAuthAdapters({
    kayitYap: vi.fn(async (bilgiler) => {
      oturum = {
        kullaniciId: `uye-${bilgiler.ePosta.trim().toLowerCase()}`,
        adSoyad: bilgiler.adSoyad,
        telefon: bilgiler.telefon,
        ePosta: bilgiler.ePosta,
        hesapTipi: bilgiler.hesapTipi,
        eidsDurumu: 'yok',
      }
      return { durum: 'basarili' as const, veri: oturum }
    }),
    kurumsalBasvuruGonder: vi.fn(async () => {
      if (!oturum) throw new Error('test kurulumu: oturum yok')
      oturum = { ...oturum, hesapTipi: 'kurumsal', eidsDurumu: 'beklemede' }
      return { durum: 'basarili' as const, veri: oturum }
    }),
    eidsDogrulamaBaslat: vi.fn(async () => {
      if (!oturum) throw new Error('test kurulumu: oturum yok')
      oturum = { ...oturum, eidsDurumu: 'dogrulandi' }
      return { durum: 'basarili' as const, veri: oturum }
    }),
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  })
}

function KorumaliHesabim() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  if (!girisYapildi) return null
  return <h1>Hesabım</h1>
}

function akisRouter(adapters: AuthAdapters, baslangic: string) {
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
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit',
      validateSearch: arama,
      component: KayitPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/kurumsal',
      component: KayitKurumsalPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/hesap/dogrula',
      component: HesapDogrulaPage,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: KorumaliHesabim }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [baslangic] }),
  })
}

async function bireyselFormuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
  await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
  await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
  await kullanici.type(screen.getByLabelText('Telefon'), '5559998877')
  await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')
  await kullanici.click(screen.getByLabelText(/aydınlatma metnini/i))
}

async function kurumsalBasvuruyuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
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

describe('kayıt akışı', () => {
  it('bireysel kayıt: /kayit → gönder → dönüş hedefine iner, oturum açılmıştır', async () => {
    const kullanici = userEvent.setup()
    const adapters = akisAdapters()
    render(<RouterProvider router={akisRouter(adapters, '/kayit?donus=%2Fhesabim')} />)

    await screen.findByLabelText('Ad soyad')
    await bireyselFormuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))

    await waitFor(() => expect(adapters.kayitYap).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hesabım' })).toBeTruthy())
  })

  it('kurumsal kayıt: kayıt → kurumsal başvuru → EİDS doğrulaması uçtan uca tamamlanır', async () => {
    const kullanici = userEvent.setup()
    const adapters = akisAdapters()
    render(<RouterProvider router={akisRouter(adapters, '/kayit')} />)

    // 1. Kayıt — emlak ofisi seç.
    await screen.findByLabelText('Ad soyad')
    await kullanici.click(screen.getByLabelText(/emlak ofisi/i))
    await bireyselFormuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() => expect(adapters.kayitYap).toHaveBeenCalled())

    // 2. Kurumsal başvuru.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Emlak ofisi başvurusu' })).toBeTruthy(),
    )
    await kurumsalBasvuruyuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(adapters.kurumsalBasvuruGonder).toHaveBeenCalled())

    // 3. EİDS doğrulaması — beklemede durumu, ardından başlatma.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'EİDS doğrulaması' })).toBeTruthy(),
    )
    expect(screen.getByText(/başvurunuz alındı/i)).toBeTruthy()
    await kullanici.click(screen.getByRole('button', { name: 'Doğrulamayı başlat' }))
    await waitFor(() => expect(adapters.eidsDogrulamaBaslat).toHaveBeenCalled())

    // 4. Başarı durumu görünür.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'EİDS doğrulaması tamam' })).toBeTruthy(),
    )
  })
})
