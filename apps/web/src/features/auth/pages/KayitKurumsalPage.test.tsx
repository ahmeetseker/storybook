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
import { kurumsalBolumleriniDoldur, sahteAuthAdapters } from '../test-utils'
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

const gonderButonu = () => screen.getByRole('button', { name: 'Başvuruyu gönder' })

describe('KayitKurumsalPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('ilk bölümde işletme kimliğini gösterir, sonraki bölümlerin alanlarını göstermez', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    expect(await screen.findByLabelText('Ticaret ünvanı')).toBeTruthy()
    expect(screen.getByText('Bölüm 1 / 4: İşletme kimliği')).toBeTruthy()
    // Yetki bölümü henüz çizilmemiş olmalı.
    expect(screen.queryByLabelText('Yetki belgesi numarası')).toBeNull()
  })

  it('bölüm doğrulamasından geçmeden ileri gitmez', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByText('Bölüm 1 / 4: İşletme kimliği')).toBeTruthy()
    expect(screen.queryByLabelText('Yetki belgesi numarası')).toBeNull()
  })

  it('yalnız BULUNULAN bölümün hatasını gösterir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(screen.getByText('Ticaret ünvanını girin.')).toBeTruthy())
    // Yetki bölümünün hatası bu bölümde duyurulmamalı.
    expect(
      screen.queryByText('Taşınmaz ticareti yetki belgesi numarasını girin.'),
    ).toBeNull()
  })

  it('vergi numarası kuralını işletme türüne göre değiştirir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    await screen.findByLabelText('Vergi kimlik no / TCKN')

    // Varsayılan şahıs işletmesi: 11 hane TCKN geçerlidir.
    await kullanici.type(screen.getByLabelText('Vergi kimlik no / TCKN'), '12345678901')
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(screen.getByText('Ticaret ünvanını girin.')).toBeTruthy())
    // İpucu metni de "10 hane" içerir; bu yüzden HATA metinleri aranır.
    expect(screen.queryByText('Vergi kimlik numarası 10 haneli olmalı.')).toBeNull()
    expect(
      screen.queryByText(
        'Vergi kimlik numarasını 10 hane, şahıs işletmesinde T.C. kimlik numarasını 11 hane girin.',
      ),
    ).toBeNull()

    // Limited şirkette aynı değer reddedilir.
    await kullanici.click(screen.getByLabelText(/limited şirket/i))
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() =>
      expect(screen.getByText('Vergi kimlik numarası 10 haneli olmalı.')).toBeTruthy(),
    )
  })

  it('şahıs işletmesinde MERSİS ve ticaret sicilini zorunlu tutmaz', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kurumsalBolumleriniDoldur(kullanici, { isletmeTuru: 'sahis' })
    await kullanici.click(gonderButonu())
    await waitFor(() => expect(adapters.kurumsalBasvuruGonder).toHaveBeenCalled())
  })

  it('zorunlu onaylar verilmeden başvuruyu göndermez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kurumsalBolumleriniDoldur(kullanici)
    await kullanici.click(screen.getByLabelText(/temsile yetkili/i)) // işareti geri al
    await kullanici.click(gonderButonu())
    await waitFor(() =>
      expect(screen.getByText('İşletmeyi temsile yetkili olduğunuzu beyan edin.')).toBeTruthy(),
    )
    expect(adapters.kurumsalBasvuruGonder).not.toHaveBeenCalled()
  })

  it('özetteki Düzenle ilgili bölüme geri taşır', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kurumsalBolumleriniDoldur(kullanici)

    expect(screen.getByText('Bölüm 4 / 4: Onay')).toBeTruthy()
    await kullanici.click(screen.getByRole('button', { name: 'Düzenle: Yetki ve yeterlilik' }))

    expect(await screen.findByLabelText('Yetki belgesi numarası')).toBeTruthy()
    expect(screen.getByText('Bölüm 2 / 4: Yetki ve yeterlilik')).toBeTruthy()
  })

  it('özette girilen bilgileri gösterir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kurumsalBolumleriniDoldur(kullanici)

    expect(screen.getByText('Arsam Gayrimenkul Ltd. Şti.')).toBeTruthy()
    expect(screen.getByText('YB-2026-0042')).toBeTruthy()
  })

  it('geçerli başvuruyu iletir ve EİDS adımına yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kurumsalBolumleriniDoldur(kullanici)
    await kullanici.click(gonderButonu())
    await waitFor(() => expect(adapters.kurumsalBasvuruGonder).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'EİDS doğrulaması' })).toBeTruthy(),
    )
  })
})
