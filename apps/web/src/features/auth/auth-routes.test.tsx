import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, type AnyRoute } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'

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

// `createRouter`'ın gerçek `routeTree`'si `RouterContext` (queryClient)
// bekliyor; bu smoke testinde hiçbir loader/query tetiklenmediği için boş
// bir QueryClient yeterli.
const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ['/'] }),
  context: { queryClient: new QueryClient() },
})

// `router.routesById`'nin statik tipi yalnız derleme zamanında bilinen dosya
// tabanlı rotaları kabul eder; burada dinamik id ile erişim kasıtlı — bu
// yüzden gevşek bir tipe cast edilir.
const routesById = router.routesById as unknown as Record<string, AnyRoute>

const BEKLENEN_AUTH_ROTALARI: ReadonlyArray<{ id: string; fullPath: string }> = [
  { id: '/giris', fullPath: '/giris' },
  { id: '/giris_/kod', fullPath: '/giris/kod' },
  { id: '/giris_/parola', fullPath: '/giris/parola' },
  { id: '/giris_/baglanti-gonderildi', fullPath: '/giris/baglanti-gonderildi' },
  { id: '/giris_/baglanti_/gecersiz', fullPath: '/giris/baglanti/gecersiz' },
  { id: '/giris_/hata', fullPath: '/giris/hata' },
  { id: '/kayit', fullPath: '/kayit' },
  { id: '/kayit_/profil', fullPath: '/kayit/profil' },
  { id: '/kayit_/kurumsal', fullPath: '/kayit/kurumsal' },
  { id: '/kayit_/hesap-var', fullPath: '/kayit/hesap-var' },
  { id: '/hesap/dogrula', fullPath: '/hesap/dogrula' },
]

describe('auth rotaları — routeTree.gen.ts smoke testi', () => {
  it.each(BEKLENEN_AUTH_ROTALARI)('$id rotası $fullPath fullPath ile kayıtlı', ({ id, fullPath }) => {
    const route = routesById[id]
    expect(route, `${id} routesById'de bulunamadı`).toBeTruthy()
    expect(route.fullPath).toBe(fullPath)
  })

  it.each(BEKLENEN_AUTH_ROTALARI.filter(({ id }) => id !== '/giris' && id !== '/kayit'))(
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
})
