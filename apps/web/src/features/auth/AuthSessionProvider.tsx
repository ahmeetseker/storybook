import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
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
 */
export function useKorumaliRota(): void {
  const { girisYapildi } = useAuthSession()
  const navigate = useNavigate()
  const yol = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.searchStr}`,
  })

  useEffect(() => {
    if (girisYapildi) return
    navigate({
      href: `/giris?donus=${encodeURIComponent(yol)}`,
      replace: true,
    })
  }, [girisYapildi, navigate, yol])
}
