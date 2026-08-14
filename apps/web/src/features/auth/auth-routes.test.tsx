import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, type AnyRoute } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'
import { isAuthPath } from '../../config/routes'
import { sahteAuthAdapters } from './test-utils'

/**
 * Gerçek `routeTree.gen.ts`'e karşı çalışan kayıt testi.
 *
 * Task 6'da bir rota dosyası yanlış adlandırılmıştı (`giris.kod.tsx` yerine
 * `giris_.kod.tsx` olmalıydı) ve `/giris/kod` tarayıcıda YANLIŞ bileşeni
 * render ediyordu. Diğer auth testleri bunu yakalayamaz çünkü her biri
 * kendi düz (flat) route tree'sini kurar — gerçek dosya tabanlı rota
 * kaydını hiç sınamazlar. Bu dosya, gerçek `routeTree`'yi statik olarak
 * inceleyerek bu bug sınıfını kalıcı hâle getirir: tam render gerekmez
 * (render `AuthSessionProvider` + router bağlamı ister, kırılgan olur),
 * yalnız `createRouter` çağrısının route init aşaması yeterlidir —
 * `router.routesById` bu aşamadan sonra senkron olarak doludur.
 */

// `createRouter`'ın gerçek `routeTree`'si `RouterContext` bekliyor; bu smoke
// testinde hiçbir loader/query/beforeLoad tetiklenmediği (yalnız route init
// aşaması koşuyor) için boş bir QueryClient, sahte adapter ve `bilinmiyor`
// oturum yeterli.
const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ['/'] }),
  context: {
    queryClient: new QueryClient(),
    adapters: sahteAuthAdapters(),
    oturum: { durum: 'bilinmiyor' },
  },
})

// `router.routesById`'nin statik tipi yalnız derleme zamanında bilinen dosya
// tabanlı rotaları kabul eder; burada dinamik id ile erişim kasıtlı — bu
// yüzden gevşek bir tipe cast edilir.
const routesById = router.routesById as unknown as Record<string, AnyRoute>

const BEKLENEN_AUTH_ROTALARI: ReadonlyArray<{ id: string; fullPath: string }> = [
  { id: '/giris', fullPath: '/giris' },
  { id: '/giris_/kod', fullPath: '/giris/kod' },
  { id: '/giris_/parola', fullPath: '/giris/parola' },
  { id: '/giris_/hata', fullPath: '/giris/hata' },
  { id: '/kayit', fullPath: '/kayit' },
  { id: '/kayit_/profil', fullPath: '/kayit/profil' },
  { id: '/kayit_/kurumsal', fullPath: '/kayit/kurumsal' },
  { id: '/kayit_/hesap-var', fullPath: '/kayit/hesap-var' },
  { id: '/hesap/dogrula', fullPath: '/hesap/dogrula' },
  { id: '/hesap/askida', fullPath: '/hesap/askida' },
  { id: '/parola-sifirla', fullPath: '/parola-sifirla' },
  { id: '/parola-sifirla_/yeni', fullPath: '/parola-sifirla/yeni' },
  { id: '/parola-sifirla_/gonderildi', fullPath: '/parola-sifirla/gonderildi' },
  { id: '/parola-sifirla_/tamam', fullPath: '/parola-sifirla/tamam' },
  { id: '/parola-sifirla_/gecersiz', fullPath: '/parola-sifirla/gecersiz' },
  { id: '/parola-degistir', fullPath: '/parola-degistir' },
  { id: '/oturum-suresi-doldu', fullPath: '/oturum-suresi-doldu' },
  { id: '/yetkisiz', fullPath: '/yetkisiz' },
  { id: '/giris_/google_/callback', fullPath: '/giris/google/callback' },
  { id: '/davet/$token', fullPath: '/davet/$token' },
  { id: '/davet/gecersiz', fullPath: '/davet/gecersiz' },
  { id: '/organizasyon-sec', fullPath: '/organizasyon-sec' },
  { id: '/e-posta-dogrula', fullPath: '/e-posta-dogrula' },
]

/**
 * Kabuk seçimi rotayla birlikte doğrulanır: bu yolların hepsi `AuthShell`
 * altında açılmalı. `authRoutePaths`'e eklemeyi unutmak sessiz bir hatadır —
 * sayfa çalışır ama pazar yeri gezinmesiyle birlikte çizilir.
 */
const AUTH_KABUGU_BEKLENEN = [
  '/giris',
  '/giris/google/callback',
  '/kayit',
  '/parola-sifirla',
  '/parola-sifirla/yeni',
  '/parola-degistir',
  '/oturum-suresi-doldu',
  '/yetkisiz',
  '/hesap/askida',
  '/davet/abc',
  '/davet/gecersiz',
  '/organizasyon-sec',
  '/e-posta-dogrula',
]

describe('auth rotaları — routeTree.gen.ts smoke testi', () => {
  it.each(BEKLENEN_AUTH_ROTALARI)('$id rotası $fullPath fullPath ile kayıtlı', ({ id, fullPath }) => {
    const route = routesById[id]
    expect(route, `${id} routesById'de bulunamadı`).toBeTruthy()
    expect(route.fullPath).toBe(fullPath)
  })

  it.each(
    BEKLENEN_AUTH_ROTALARI.filter(
      ({ id }) => id !== '/giris' && id !== '/kayit' && id !== '/parola-sifirla',
    ),
  )(
    '$id rotası GirisRoute değil, root rotasının doğrudan çocuğudur',
    ({ id }) => {
      const route = routesById[id]
      // Asıl tuzak buydu: `giris.kod.tsx` gibi noktalı bir ad, rotayı
      // `/giris`'in çocuğu yapardı ve `/giris` bileşeninde <Outlet/> yoksa
      // yanlış sayfa render edilirdi. Doğru dosya adı (`giris_.kod.tsx`)
      // rotayı root'un çocuğu yapar — parentRoute id'si '__root__' olmalı.
      expect(route.parentRoute?.id).toBe('__root__')
      expect(route.parentRoute?.id).not.toBe('/giris')
    },
  )

  it.each(AUTH_KABUGU_BEKLENEN)('%s AuthShell kabuğunu alır', (yol) => {
    expect(isAuthPath(yol), `${yol} authRoutePaths kapsamında değil`).toBe(true)
  })

  it('pazar yeri rotaları auth kabuğuna düşmez', () => {
    for (const yol of ['/', '/emlak', '/hesabim', '/ilan-ver', '/favoriler', '/bolgeler']) {
      expect(isAuthPath(yol), `${yol} yanlışlıkla auth kabuğuna düşüyor`).toBe(false)
    }
  })
})
