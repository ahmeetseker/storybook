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
import { kayitAdimlariniDoldur, sahteAuthAdapters } from '../test-utils'
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
      validateSearch: arama,
      component: () => <h1>Bu hesap zaten var</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

const devamEt = async (kullanici: ReturnType<typeof userEvent.setup>) =>
  kullanici.click(screen.getByRole('button', { name: 'Devam et' }))

/**
 * Üçüncü adıma (iletişim ve güvenlik) kadar ilerletir ve ORADA bırakır.
 * `kayitAdimlariniDoldur` bu adımı geçerli değerlerle geçip son adıma
 * gider; telefon/parola alanlarının kendi davranışını sınayan testler
 * alanları boş bulmak zorunda.
 */
const iletisimAdimina = async (kullanici: ReturnType<typeof userEvent.setup>) => {
  await screen.findByLabelText(/bireysel/i)
  await devamEt(kullanici)
  await screen.findByLabelText('Ad soyad')
  await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
  await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
  await devamEt(kullanici)
  await screen.findByLabelText('Telefon')
}

describe('KayitPage — adım adım kayıt', () => {
  it('ilk adımda hesap tipi seçeneklerini sunar, bireysel varsayılandır', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    const bireysel = await screen.findByLabelText(/bireysel/i)
    expect((bireysel as HTMLInputElement).checked).toBe(true)
    expect(screen.getByLabelText(/emlak ofisi/i)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Hesap tipi' })).toBeTruthy()
  })

  it('yalnız bulunulan adımın alanlarını gösterir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    expect(screen.queryByLabelText('Ad soyad')).toBeNull()

    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')
    expect(screen.queryByLabelText('Telefon')).toBeNull()
    expect(screen.queryByLabelText(/bireysel/i)).toBeNull()
  })

  it('adım sayacı ve ilerleme çubuğu bulunulan adımı bildirir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    expect(screen.getByText('Adım 1 / 4: Hesap tipi')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1')

    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')
    expect(screen.getByText('Adım 2 / 4: Kimlik')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2')
  })

  it('adım sayacı aria-live ile duyurulur', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    const sayac = await screen.findByText('Adım 1 / 4: Hesap tipi')
    expect(sayac.getAttribute('aria-live')).toBe('polite')
  })

  it('adım değişiminde odak adım başlığına taşınır', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    await devamEt(kullanici)

    const baslik = await screen.findByRole('heading', { level: 2, name: 'Kimlik' })
    await waitFor(() => expect(document.activeElement).toBe(baslik))
  })

  it('alanları doğru autocomplete ile sunar', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)

    await devamEt(kullanici)
    expect((await screen.findByLabelText('Ad soyad')).getAttribute('autocomplete')).toBe('name')
    expect(screen.getByLabelText('E-posta').getAttribute('autocomplete')).toBe('email')

    await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
    await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
    await devamEt(kullanici)

    // Numara alanı ülke kodunu TAŞIMAZ (o ayrı kontrolde) — bu yüzden
    // `tel` değil `tel-national`.
    expect((await screen.findByLabelText('Telefon')).getAttribute('autocomplete')).toBe(
      'tel-national',
    )
    expect(screen.getByLabelText('Ülke kodu').getAttribute('autocomplete')).toBe(
      'tel-country-code',
    )
    expect(screen.getByLabelText('Parola').getAttribute('autocomplete')).toBe('new-password')
  })

  it('eksik alanla sonraki adıma geçilemez, hata yalnız o adımın alanlarında görünür', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText(/bireysel/i)
    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')

    await devamEt(kullanici)
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

    // Adım değişmedi ve yalnız bu adımın alanları hatalı işaretlendi.
    expect(screen.getByRole('heading', { level: 2, name: 'Kimlik' })).toBeTruthy()
    expect(screen.getByLabelText('Ad soyad').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('E-posta').getAttribute('aria-invalid')).toBe('true')
    expect(adapters.kayitYap).not.toHaveBeenCalled()
    // Sonraki adımların (telefon/parola) hatası burada duyurulmaz.
    expect(screen.queryByText(/Telefon numarasını/)).toBeNull()
  })

  it('başarısız adım doğrulamasında odak ilk hatalı alana taşınır', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')
    await devamEt(kullanici)

    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Ad soyad')))
  })

  it('ilk adımda Geri pasiftir, sonraki adımlarda etkinleşir ve girilen değerleri korur', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    expect((screen.getByRole('button', { name: 'Geri' }) as HTMLButtonElement).disabled).toBe(true)

    await kullanici.click(screen.getByLabelText(/emlak ofisi/i))
    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')
    await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')

    const geri = screen.getByRole('button', { name: 'Geri' }) as HTMLButtonElement
    expect(geri.disabled).toBe(false)
    await kullanici.click(geri)

    const kurumsal = (await screen.findByLabelText(/emlak ofisi/i)) as HTMLInputElement
    expect(kurumsal.checked).toBe(true)

    await devamEt(kullanici)
    expect(((await screen.findByLabelText('Ad soyad')) as HTMLInputElement).value).toBe(
      'Yeni Kullanıcı',
    )
  })

  it('şeritte yalnız tamamlanan adımlar tıklanabilir; tıklanınca o adıma dönülür', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    // Aktif ve ileri adımlar buton değildir.
    expect(screen.queryByRole('button', { name: /1\. adım/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /2\. adım/ })).toBeNull()

    await devamEt(kullanici)
    await screen.findByLabelText('Ad soyad')

    const ilkAdim = screen.getByRole('button', { name: /1\. adım, Tamamlandı/ })
    expect(screen.queryByRole('button', { name: /3\. adım/ })).toBeNull()

    await kullanici.click(ilkAdim)
    expect(await screen.findByLabelText(/bireysel/i)).toBeTruthy()
    expect(screen.getByText('Adım 1 / 4: Hesap tipi')).toBeTruthy()
  })

  it('son adımda özet ve "Kaydı tamamla" görünür; özetten ilgili adıma dönülür', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await kayitAdimlariniDoldur(kullanici)

    expect(screen.getByRole('button', { name: 'Kaydı tamamla' })).toBeTruthy()
    expect(screen.getByText('yeni@arsam.net')).toBeTruthy()
    // Özet numarayı ülke koduyla ve gruplanmış gösterir — onaylanan şey
    // numaranın tamamıdır.
    expect(screen.getByText('+90 555 999 88 77')).toBeTruthy()

    await kullanici.click(screen.getByRole('button', { name: 'Düzenle: İletişim ve güvenlik' }))
    expect(((await screen.findByLabelText('Telefon')) as HTMLInputElement).value).toBe('5559998877')
  })

  it('telefon alanı ülke seçimi sunar; ülke değişince beklenen biçim ve doğrulama da değişir', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await iletisimAdimina(kullanici)
    await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')

    const ulke = screen.getByLabelText('Ülke kodu') as HTMLSelectElement
    expect(ulke.value).toBe('TR')
    expect(screen.getByLabelText('Telefon').getAttribute('placeholder')).toBe('532 123 45 67')

    // Türkiye'de Alman numarası reddedilir…
    await kullanici.type(screen.getByLabelText('Telefon'), '15123456789')
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByText('Telefon numarasını 5XX XXX XX XX biçiminde girin.')).toBeTruthy()

    // …ülke Almanya'ya çevrilince kabul edilir.
    await kullanici.selectOptions(screen.getByLabelText('Ülke kodu'), 'DE')
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    await screen.findByRole('heading', { level: 2, name: 'Onay' })
    expect(screen.getByText('+49 151 234 567 89')).toBeTruthy()
  })

  it('numarayı sıfır veya ülke kodu ile yazmak da kabul edilir, kanonik hâle getirilir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kayitAdimlariniDoldur(kullanici, { telefon: '0532 123 45 67' })
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() =>
      expect(adapters.kayitYap).toHaveBeenCalledWith(
        expect.objectContaining({ telefon: '5321234567', telefonUlke: 'TR' }),
      ),
    )
  })

  it('parola alanı göster/gizle düğmesi taşır; basınca yazılan parola okunur olur', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    await iletisimAdimina(kullanici)
    await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')

    const parola = screen.getByLabelText('Parola') as HTMLInputElement
    expect(parola.type, 'parola gizli başlamalı').toBe('password')

    const goster = screen.getByRole('button', { name: 'Parolayı göster' })
    expect(goster.getAttribute('aria-pressed')).toBe('false')
    expect(goster.getAttribute('aria-controls')).toBe(parola.id)

    await kullanici.click(goster)
    expect((screen.getByLabelText('Parola') as HTMLInputElement).type).toBe('text')
    const gizle = screen.getByRole('button', { name: 'Parolayı gizle' })
    expect(gizle.getAttribute('aria-pressed')).toBe('true')

    await kullanici.click(gizle)
    expect((screen.getByLabelText('Parola') as HTMLInputElement).type).toBe('password')
    expect(screen.getByRole('button', { name: 'Parolayı göster' })).toBeTruthy()
  })

  it('KVKK onayı verilmeden gönderilemez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kayitAdimlariniDoldur(kullanici, { kvkkOnayi: false })
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByLabelText(/aydınlatma metnini/i).getAttribute('aria-invalid')).toBe('true')
    expect(adapters.kayitYap).not.toHaveBeenCalled()
  })

  it('geçerli formu adapter’a iletir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kayitAdimlariniDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

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
    await kayitAdimlariniDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bu hesap zaten var' })).toBeTruthy(),
    )
  })

  it('hesap zaten varsa durum sayfasına giderken donus parametresini taşır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'hesap-zaten-var' as const,
        mesaj: 'Bu e-posta adresiyle bir hesap zaten var.',
      })),
    })
    const router = kayitRouter(adapters, '/kayit?donus=%2Fhesabim')
    render(<RouterProvider router={router} />)
    await kayitAdimlariniDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bu hesap zaten var' })).toBeTruthy(),
    )
    expect(router.state.location.pathname).toBe('/kayit/hesap-var')
    expect(router.state.location.search).toEqual({ donus: '/hesabim' })
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
    await kayitAdimlariniDoldur(kullanici, { hesapTipi: 'kurumsal' })
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Kurumsal başvuru' })).toBeTruthy(),
    )
  })

  it('adapter hatası son adımda gösterilir, akış adımda kalır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'ag-hatasi' as const,
        mesaj: 'Bağlantı kurulamadı.',
      })),
    })
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kayitAdimlariniDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Bağlantı kurulamadı.'))
    expect(screen.getByRole('heading', { level: 2, name: 'Onay' })).toBeTruthy()
  })
})
