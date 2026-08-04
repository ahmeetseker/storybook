import type { ReactElement } from 'react'
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
import { AuthSessionProvider } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'
import { sahteAuthAdapters } from './test-utils'
import { GirisPage } from './pages/GirisPage'
import { GirisKodPage } from './pages/GirisKodPage'
import { GirisParolaPage } from './pages/GirisParolaPage'
import { KayitPage } from './pages/KayitPage'
import { KayitProfilPage } from './pages/KayitProfilPage'
import { KayitKurumsalPage } from './pages/KayitKurumsalPage'
import { HesapDogrulaPage } from './pages/HesapDogrulaPage'
import {
  BaglantiGecersizPage,
  BaglantiGonderildiPage,
  GirisHataPage,
} from './pages/girisDurumSayfalari'
import { HesapVarPage } from './pages/kayitDurumSayfalari'

function bosAdapters(): AuthAdapters {
  return sahteAuthAdapters()
}

const OTURUMLU_KULLANICI: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'kurumsal',
  eidsDurumu: 'yok',
}

/** Oturum gerektiren sayfalar (`useKorumaliRota`) oturumsuz `null` döner — bu adapter onları render eder. */
function oturumluAdapters(): AuthAdapters {
  return sahteAuthAdapters({ oturumuGetir: () => OTURUMLU_KULLANICI })
}

function sayfaRouter(Component: () => ReactElement | null, adapters: AuthAdapters = bosAdapters()) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const sayfa = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: Component,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([sayfa]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

/** Alan (input) taşıyan form sayfaları — label/autocomplete kontrolleri bunlar üzerinde çalışır. */
const ALANLI_FORM_SAYFALARI: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ['GirisPage', GirisPage, bosAdapters()],
  ['GirisKodPage', GirisKodPage, bosAdapters()],
  ['GirisParolaPage', GirisParolaPage, bosAdapters()],
  ['KayitPage', KayitPage, bosAdapters()],
  ['KayitProfilPage', KayitProfilPage, oturumluAdapters()],
  ['KayitKurumsalPage', KayitKurumsalPage, oturumluAdapters()],
]

/** Durum sayfaları form taşımaz — yalnız landmark/heading/alert sözleşmesi test edilir. */
const DURUM_SAYFALARI: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ['BaglantiGonderildiPage', BaglantiGonderildiPage, bosAdapters()],
  ['BaglantiGecersizPage', BaglantiGecersizPage, bosAdapters()],
  ['GirisHataPage', GirisHataPage, bosAdapters()],
  ['HesapVarPage', HesapVarPage, bosAdapters()],
]

/**
 * `HesapDogrulaPage`, `AuthFormPage` arketipini kullanır ama alan (input)
 * içermez — yalnız gönder butonu. Bu yüzden `ALANLI_FORM_SAYFALARI`
 * grubuna girmez (o grup `input.length > 0` varsayar); h1/main
 * kontrollerine ayrı olarak katılır. Oturum gerektirir.
 */
const OTURUMLU_ALANSIZ_SAYFALAR: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ['HesapDogrulaPage', HesapDogrulaPage, oturumluAdapters()],
]

const TUM_SAYFALAR: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ...ALANLI_FORM_SAYFALARI,
  ...DURUM_SAYFALARI,
  ...OTURUMLU_ALANSIZ_SAYFALAR,
]

const HATA_TONLU_SAYFALAR: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ['BaglantiGecersizPage', BaglantiGecersizPage, bosAdapters()],
  ['GirisHataPage', GirisHataPage, bosAdapters()],
]

/** h1/main kontrolleri tüm sayfalar için geçerli — alanlı form + alansız oturumlu sayfalar. */
const H1_SAYFALARI: ReadonlyArray<[string, () => ReactElement | null, AuthAdapters]> = [
  ...ALANLI_FORM_SAYFALARI,
  ...OTURUMLU_ALANSIZ_SAYFALAR,
]

/** Adım sözleşmesi testinde adımı geçmek için kullanılan geçerli değerler. */
const GECERLI_DEGERLER: Record<string, string> = {
  'Ad soyad': 'Ayşe Kaya',
  'E-posta': 'ayse@arsam.net',
  Telefon: '5551112233',
  Parola: 'Arsam1234',
}

describe('auth erişilebilirlik geçidi', () => {
  it.each(H1_SAYFALARI)('%s tek h1 taşır', async (_ad, Component, adapters) => {
    render(<RouterProvider router={sayfaRouter(Component, adapters)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it.each(TUM_SAYFALAR)('%s tam olarak bir main landmark taşır', async (_ad, Component, adapters) => {
    render(<RouterProvider router={sayfaRouter(Component, adapters)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it.each(HATA_TONLU_SAYFALAR)(
    '%s hata tonunda alert main landmark\'ı değil yalnız açıklamayı kapsar',
    async (_ad, Component, adapters) => {
      render(<RouterProvider router={sayfaRouter(Component, adapters)} />)
      await screen.findByRole('heading', { level: 1 })
      const main = screen.getByRole('main')
      const alert = screen.getByRole('alert')
      expect(alert).not.toBe(main)
      expect(main.getAttribute('role')).not.toBe('alert')
      expect(main.contains(alert)).toBe(true)
    },
  )

  it.each(ALANLI_FORM_SAYFALARI)('%s içindeki her form alanı erişilebilir isim taşır', async (_ad, Component, adapters) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component, adapters)} />)
    await screen.findByRole('heading', { level: 1 })
    const alanlar = Array.from(container.querySelectorAll('input'))
    expect(alanlar.length).toBeGreaterThan(0)
    for (const alan of alanlar) {
      const id = alan.getAttribute('id')
      // Metin alanları açık `id` + `label[for]` taşır. Seçenek girdileri
      // (radio/checkbox — ör. KayitPage hesap tipi ve KVKK onayı) `<label>`
      // içine sarılarak örtük isim taşıyabilir; bu da geçerli bir erişilebilir
      // isimlendirme deseni (testing-library `getByLabelText` de bunu kabul eder).
      if (id) {
        expect(container.querySelector(`label[for="${id}"]`), `${id} için label bulunamadı`).toBeTruthy()
      } else {
        expect(alan.closest('label'), 'id taşımayan input bir <label> içine sarılmalı').toBeTruthy()
      }
    }
  })

  it.each(ALANLI_FORM_SAYFALARI)('%s içindeki her form alanı autocomplete taşır', async (_ad, Component, adapters) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component, adapters)} />)
    await screen.findByRole('heading', { level: 1 })
    for (const alan of Array.from(container.querySelectorAll('input'))) {
      // radio/checkbox seçenek girdileridir, tarayıcı otomatik doldurma
      // semantiği taşımaz — autocomplete zorunluluğu yalnız metin/parola/
      // e-posta gibi doldurulabilir alanlar için geçerli.
      if (alan.type === 'radio' || alan.type === 'checkbox') continue
      expect(
        alan.getAttribute('autocomplete'),
        `${alan.getAttribute('id')} autocomplete taşımıyor`,
      ).toBeTruthy()
    }
  })

  it('kod alanı tek input olarak sunulur — altı kutulu desen kullanılmaz', async () => {
    const { container } = render(<RouterProvider router={sayfaRouter(GirisKodPage, bosAdapters())} />)
    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('input')).toHaveLength(1)
  })

  it('KayitPage hesap tipi seçimi fieldset + legend ile gruplanır', async () => {
    const { container } = render(<RouterProvider router={sayfaRouter(KayitPage, bosAdapters())} />)
    await screen.findByRole('heading', { level: 1 })
    const fieldset = container.querySelector('fieldset')
    expect(fieldset, 'hesap tipi grubu fieldset olmalı').toBeTruthy()
    expect(fieldset?.querySelector('legend')?.textContent, 'fieldset legend taşımalı').toBeTruthy()
  })

  // Finding 3 (2026-08-01 final inceleme): alan hataları `aria-invalid`/
  // `aria-describedby` taşımıyordu ve odak ilk hatalı alana taşınmıyordu —
  // ekran okuyucu kullanıcısı yalnız özeti duyup alanları elle aramak
  // zorunda kalıyordu. Bu blok regresyonu kalıcı olarak engeller.
  //
  // Kayıt formu çok adımlı olduğundan (2026-08-02) tek gönderimde TÜM
  // alanlar hatalı işaretlenemez: her adım yalnız kendi alanlarını
  // doğrular. Sözleşme adım adım sınanır — her adımda "Devam et"e boş
  // basılır, o adımın alanları işaretlenmeli ve ilk alana odaklanılmalı.
  const KAYIT_ADIM_SOZLESMESI: ReadonlyArray<{ adimAdi: string; etiketler: readonly string[] }> = [
    { adimAdi: 'Kimlik', etiketler: ['Ad soyad', 'E-posta'] },
    { adimAdi: 'İletişim ve güvenlik', etiketler: ['Telefon', 'Parola'] },
  ]

  it('KayitPage her adımda yalnız o adımın hatalı alanlarını aria-invalid + aria-describedby ile işaretler ve ilk alana odaklanır', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={sayfaRouter(KayitPage, bosAdapters())} />)
    await screen.findByLabelText(/bireysel/i)
    // 1. adım (hesap tipi) doğrulanacak alan taşımaz — doğrudan geçilir.
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))

    for (const { adimAdi, etiketler } of KAYIT_ADIM_SOZLESMESI) {
      await screen.findByRole('heading', { level: 2, name: adimAdi })
      await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
      await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

      expect(
        document.activeElement,
        `${adimAdi}: odak ilk hatalı alana (${etiketler[0]}) taşınmalı`,
      ).toBe(screen.getByLabelText(etiketler[0]))

      for (const etiket of etiketler) {
        const alan = screen.getByLabelText(etiket)
        expect(alan.getAttribute('aria-invalid'), `${etiket} aria-invalid="true" taşımıyor`).toBe('true')
        const describedBy = alan.getAttribute('aria-describedby')
        expect(describedBy, `${etiket} aria-describedby taşımıyor`).toBeTruthy()
        const hataElemani = document.getElementById(describedBy as string)
        expect(hataElemani, `${etiket} aria-describedby "${describedBy}" hiçbir elemente çözülmüyor`).toBeTruthy()
        expect(hataElemani?.textContent, `${etiket} hata metni boş`).toBeTruthy()
      }

      // Adımı geçerli değerlerle doldurup sonrakine ilerle.
      for (const etiket of etiketler) {
        const deger = GECERLI_DEGERLER[etiket]
        await kullanici.clear(screen.getByLabelText(etiket))
        await kullanici.type(screen.getByLabelText(etiket), deger)
      }
      await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    }

    // Son adım: KVKK onayı checkbox — label içine sarılı, id/describedby'ı ayrıca taşır.
    await screen.findByRole('heading', { level: 2, name: 'Onay' })
    await kullanici.click(screen.getByRole('button', { name: 'Kaydı tamamla' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

    const kvkk = screen.getByLabelText(/aydınlatma metnini/i)
    expect(kvkk.getAttribute('aria-invalid')).toBe('true')
    const kvkkHataId = kvkk.getAttribute('aria-describedby')
    expect(kvkkHataId).toBeTruthy()
    expect(document.getElementById(kvkkHataId as string)?.textContent).toBeTruthy()
  })

  it('KayitKurumsalPage başarısız gönderimde her hatalı alanı aria-invalid + aria-describedby ile işaretler ve ilk alana odaklanır', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={sayfaRouter(KayitKurumsalPage, oturumluAdapters())} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

    const ilkAlan = screen.getByLabelText('Ticaret ünvanı')
    expect(document.activeElement, 'odak ilk hatalı alana (Ticaret ünvanı) taşınmalı').toBe(ilkAlan)

    const TUM_ETIKETLER = [
      'Ticaret ünvanı',
      'Vergi numarası',
      'Vergi dairesi',
      'İl',
      'İlçe',
      'Yetki belgesi numarası',
      'Yetkili ad soyad',
      'Yetkili e-posta',
      'Yetkili telefon',
    ]
    for (const etiket of TUM_ETIKETLER) {
      const alan = screen.getByLabelText(etiket)
      expect(alan.getAttribute('aria-invalid'), `${etiket} aria-invalid="true" taşımıyor`).toBe('true')
      const describedBy = alan.getAttribute('aria-describedby')
      expect(describedBy, `${etiket} aria-describedby taşımıyor`).toBeTruthy()
      const hataElemani = document.getElementById(describedBy as string)
      expect(hataElemani, `${etiket} aria-describedby "${describedBy}" hiçbir elemente çözülmüyor`).toBeTruthy()
      expect(hataElemani?.textContent, `${etiket} hata metni boş`).toBeTruthy()
    }
  })
})
