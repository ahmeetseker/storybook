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
import type { Oturum } from './domain/auth-types'

interface AuthSessionDegeri {
  oturum: Oturum | null
  girisYapildi: boolean
  adapters: AuthAdapters
  /** Adapter'daki oturumu yeniden okur — giriş sonrası çağrılır. */
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
  const [oturum, setOturum] = useState<Oturum | null>(() => adapters.oturumuGetir())

  const oturumuTazele = useCallback(() => {
    setOturum(adapters.oturumuGetir())
  }, [adapters])

  const cikisYap = useCallback(() => {
    adapters.cikisYap()
    setOturum(null)
  }, [adapters])

  const deger = useMemo<AuthSessionDegeri>(
    () => ({
      oturum,
      girisYapildi: oturum !== null,
      adapters,
      oturumuTazele,
      cikisYap,
    }),
    [oturum, adapters, oturumuTazele, cikisYap],
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
 * Korumalı sayfalarda çağrılır. Oturum yoksa kullanıcıyı `/giris`'e
 * yönlendirir ve geldiği yolu `donus` parametresinde taşır — giriş sonrası
 * aynı yere döner.
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
  const { girisYapildi } = useAuthSession()
  const navigate = useNavigate()
  const router = useRouter()
  const yonlendirildi = useRef(false)

  useEffect(() => {
    if (girisYapildi || yonlendirildi.current) return
    const { pathname, searchStr } = router.state.location
    if (pathname.startsWith('/giris')) return
    yonlendirildi.current = true
    navigate({
      href: `/giris?donus=${encodeURIComponent(`${pathname}${searchStr}`)}`,
      replace: true,
    })
  }, [girisYapildi, navigate, router])
}
