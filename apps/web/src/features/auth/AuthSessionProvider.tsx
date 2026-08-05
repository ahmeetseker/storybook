import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { varsayilanAuthAdapters, type AuthAdapters } from './data/auth-adapters'
import type { Oturum, OturumCozumu } from './domain/auth-types'

interface AuthSessionDegeri {
  /** Üçlü durum — `bilinmiyor` ile `anonim` ayrımı gereken her yerde bunu kullanın. */
  cozum: OturumCozumu
  oturum: Oturum | null
  /** Yalnız `kimlikli` durumunda true. `bilinmiyor` da false döner — dikkat. */
  girisYapildi: boolean
  adapters: AuthAdapters
  /** Adapter'daki oturumu yeniden çözer — giriş/kayıt sonrası çağrılır. */
  oturumuTazele(): void
  cikisYap(): void
}

const AuthSessionContext = createContext<AuthSessionDegeri | null>(null)

export function AuthSessionProvider({
  children,
  adapters = varsayilanAuthAdapters,
}: {
  children: ReactNode
  adapters?: AuthAdapters
}) {
  /**
   * İlk render HER ZAMAN `bilinmiyor` — router context'ten seed EDİLMEZ.
   *
   * Bu kasıtlı: sunucu ve istemcinin hidrasyon eşleştirmesi yapılan ilk
   * render'ı koşulsuz aynı ağacı üretmeli. Context'ten seed etmek, istemci
   * tarafında `beforeLoad`'un yeniden koşup `kimlikli` dönmesi hâlinde
   * sunucunun `bilinmiyor` ağacıyla uyuşmazlık yaratırdı.
   *
   * Gerçek değer mount SONRASI efektte çözülür; o noktada React artık sunucu
   * çıktısıyla karşılaştırma yapmaz. Bu, eski `hidrasyonTamam` bayrağının
   * yerini alır — aynı güvenlik, ayrı bir bayrak yerine modelin kendisiyle.
   */
  const [cozum, setCozum] = useState<OturumCozumu>({ durum: 'bilinmiyor' })

  const coz = useCallback(() => {
    let iptal = false
    void adapters.oturumuCoz().then((yeni) => {
      if (!iptal) setCozum(yeni)
    })
    return () => {
      iptal = true
    }
  }, [adapters])

  useEffect(() => coz(), [coz])

  const oturumuTazele = useCallback(() => {
    coz()
  }, [coz])

  const cikisYap = useCallback(() => {
    adapters.cikisYap()
    setCozum({ durum: 'anonim' })
  }, [adapters])

  const deger = useMemo<AuthSessionDegeri>(
    () => ({
      cozum,
      oturum: cozum.durum === 'kimlikli' ? cozum.oturum : null,
      girisYapildi: cozum.durum === 'kimlikli',
      adapters,
      oturumuTazele,
      cikisYap,
    }),
    [cozum, adapters, oturumuTazele, cikisYap],
  )

  return <AuthSessionContext.Provider value={deger}>{children}</AuthSessionContext.Provider>
}

export function useAuthSession(): AuthSessionDegeri {
  const deger = useContext(AuthSessionContext)
  if (!deger) {
    throw new Error('useAuthSession yalnız AuthSessionProvider içinde kullanılabilir.')
  }
  return deger
}

/**
 * Korumalı sayfalarda çağrılır. Oturum KESİN olarak yoksa kullanıcıyı
 * `/giris`'e yönlendirir ve geldiği yolu `donus` parametresinde taşır.
 *
 * `bilinmiyor` durumunda hiçbir şey yapmaz — bu, `beforeLoad` guard'ıyla
 * (`korumaliRotaGuard`) aynı kuraldır. Oturum henüz çözülmemişken
 * yönlendirmek, oturumu OLAN kullanıcıyı da dışarı atardı.
 *
 * Bu hook `korumaliRotaGuard`'ın yerini ALMAZ, onu tamamlar: guard sunucuda
 * ve istemci navigasyonlarında render'dan önce çalışır; bu hook ise ilk
 * yüklemede sunucunun `bilinmiyor` dediği durumu hidrasyondan sonra kapatır.
 *
 * Konum `useRouter().state.location`'dan efekt İÇİNDE, imperatif olarak
 * okunur — `useRouterState` ile reaktif abone olunmaz. Sebep: router,
 * `history.replace` sonrası `state.location`'ı, eşleşen bileşen ağacını
 * değiştirmeden ÖNCE günceller; bu component (redirect'i tetikleyen sayfa)
 * henüz unmount olmadan bu ara durumu görürse ve konum efektin bağımlılığı
 * olsaydı, efekt kendi ürettiği yeni URL'i görüp tekrar tetiklenir.
 *
 * İki savunma katmanı var:
 *
 * 1. `yonlendirildi` ref'i tek seferlik bir kilit tutar — aynı mount
 *    üzerinde efekt birden fazla kez çalışsa bile en fazla BİR `navigate`
 *    çağrısı yapılmasını garanti eder.
 * 2. Gerçek tarayıcıda (SSR hidrasyonu tamamlanırken, muhtemelen TanStack
 *    Start'ın dahili "yeniden doğrulama" geçişi yüzünden) bu hook'un
 *    bağlı olduğu bileşen AYRI bir mount olarak İKİNCİ kez de çalışabiliyor
 *    — bu durumda ref sıfırdan başlar ve tek başına yetmez. Bu yüzden
 *    hedef de her zaman "zaten `/giris` yolundaysak bir daha yönlendirme"
 *    kuralıyla korunur: korumalı bir sayfa TANIM GEREĞİ hiçbir zaman
 *    `/giris` ile başlamaz, dolayısıyla `pathname`'in `/giris` olması yalnız
 *    önceki bir yönlendirmenin ARA/geçiş durumunu yakaladığımız anlamına
 *    gelir. Bu koruma olmadan her ek mount, `donus` parametresini bir kat
 *    daha encode ederek iç içe geçmiş bir yönlendirme zincirine yol açar.
 */
export function useKorumaliRota(): void {
  const { cozum } = useAuthSession()
  const navigate = useNavigate()
  const router = useRouter()
  const yonlendirildi = useRef(false)

  useEffect(() => {
    if (cozum.durum !== 'anonim' || yonlendirildi.current) return
    const { pathname, searchStr } = router.state.location
    if (pathname.startsWith('/giris')) return
    yonlendirildi.current = true
    navigate({
      href: `/giris?donus=${encodeURIComponent(`${pathname}${searchStr}`)}`,
      replace: true,
    })
  }, [cozum, navigate, router])
}
