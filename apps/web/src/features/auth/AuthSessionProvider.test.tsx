import { describe, expect, it } from 'vitest'
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
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'
import { sahteAuthAdapters } from './test-utils'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

// `sahteAuthAdapters` üzerinden kurulur — elle kurulan mock'lar arayüze her
// yeni metot eklendiğinde çalışma zamanında patlıyordu (bkz. rules.md §7).
// Burada yalnız bu testin ihtiyaç duyduğu davranış geçilir; `oturumuCoz`
// otomatik olarak `oturumuGetir`den türetilir.
function sahteAdapters(baslangic: Oturum | null): AuthAdapters {
  let oturum = baslangic
  return sahteAuthAdapters({
    async koduDogrula() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    async parolaIleGiris() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    async kayitYap() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  })
}

function Sonda() {
  const { oturum, girisYapildi, cikisYap } = useAuthSession()
  return (
    <div>
      <p>{girisYapildi ? `Oturum: ${oturum?.adSoyad}` : 'Oturum yok'}</p>
      <button type="button" onClick={cikisYap}>
        Çıkış yap
      </button>
    </div>
  )
}

describe('AuthSessionProvider', () => {
  // Oturum ARTIK asenkron çözülür (`oturumuCoz`): ilk render koşulsuz
  // `bilinmiyor` durumundadır — sunucu ve istemcinin hidrasyon eşleştirmesi
  // yapılan render'ı aynı ağacı üretsin diye. Gerçek değer mount sonrası
  // efektte gelir, bu yüzden bu iki test artık `findBy*` ile bekler.
  it('ilk render oturumu bilmez — hidrasyon güvenliği', () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(screen.getByText('Oturum yok')).toBeTruthy()
  })

  it('adapter oturum döndürdüğünde oturumu yayınlar', async () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(await screen.findByText('Oturum: Ayşe Kaya')).toBeTruthy()
  })

  it('oturum yokken girisYapildi false döner', async () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(null)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    await waitFor(() => expect(screen.getByText('Oturum yok')).toBeTruthy())
  })

  it('çıkış yapınca oturumu düşürür', async () => {
    const kullanici = userEvent.setup()
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Çıkış yap' }))
    await waitFor(() => expect(screen.getByText('Oturum yok')).toBeTruthy())
  })

  it('provider dışında kullanılırsa açık hata verir', () => {
    expect(() => render(<Sonda />)).toThrow(/AuthSessionProvider/)
  })
})

function KorumaliBilesen() {
  useKorumaliRota()
  return <h1>Korumalı içerik</h1>
}

const arama = (search: Record<string, unknown>) => ({
  donus: typeof search.donus === 'string' ? search.donus : undefined,
})

function korumaRouter(baslangicYolu: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={sahteAdapters(null)}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: KorumaliBilesen }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [baslangicYolu] }),
  })
}

describe('useKorumaliRota', () => {
  it('oturumsuz erişimde donus parametresiyle /girise yönlendirir', async () => {
    const router = korumaRouter('/hesabim')
    render(<RouterProvider router={router} />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
    expect(router.state.location.pathname).toBe('/giris')
    expect(router.state.location.search).toEqual({ donus: '/hesabim' })
  })

  // Task 9 sırasında gerçek tarayıcıda (dev VE production build) bulundu:
  // SSR hidrasyonu tamamlanırken `useKorumaliRota`'ya bağlı bileşen bazen
  // AYRI bir mount olarak ikinci kez de çalışıyor. O ikinci çalışmada konum
  // ARTIK ilk yönlendirmenin hedefi (`/giris?donus=...`) olduğundan, koruma
  // olmasaydı `donus` bir kat daha encode edilip iç içe geçmiş bir
  // yönlendirme zincirine dönüşürdü (`?donus=%2Fgiris%3Fdonus%3D...`).
  //
  // Bu senaryo, `useKorumaliRota`'ya bağlı bir bileşenin konum ZATEN
  // `/giris` iken çalıştırılmasıyla doğrudan simüle edilir — hook'un asıl
  // koruma kuralını (pathname `/giris` ile başlıyorsa tekrar yönlendirme)
  // beyaz kutu olarak sınar. Koruma çalışıyorsa `navigate` hiç çağrılmaz ve
  // bileşen kendi içeriğini göstermeye devam eder.
  it('konum zaten /giris ise tekrar yönlendirmez — iç içe donus oluşmaz', async () => {
    const rootRoute = createRootRoute({
      component: () => (
        <AuthSessionProvider adapters={sahteAdapters(null)}>
          <Outlet />
        </AuthSessionProvider>
      ),
    })
    const girisRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: KorumaliBilesen,
    })
    const router = createRouter({
      routeTree: rootRoute.addChildren([girisRoute]),
      history: createMemoryHistory({ initialEntries: ['/giris?donus=%2Fhesabim'] }),
    })

    render(<RouterProvider router={router} />)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Korumalı içerik' })).toBeTruthy())
    // Konum değişmedi — tekrar yönlendirme yapılmadı.
    expect(router.state.location.pathname).toBe('/giris')
    expect(router.state.location.search).toEqual({ donus: '/hesabim' })
  })
})
