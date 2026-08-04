/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useCallback } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'

import { ACCOUNT_FIXTURES, AccountAppShell } from '@/features/account'
import { useAuthSession, useKorumaliRota } from '@/features/auth'

/**
 * Hesap bölümünün layout rotası.
 *
 * Ray ve üst şerit burada yaşar: `/hesabim` altındaki tüm sayfalar (özet,
 * ilanlar, mesajlar, güvenlik…) aynı kabuğun içinde açılır, gezinme sırasında
 * kabuk yeniden kurulmaz.
 */
function KorumaliHesapKabugu() {
  useKorumaliRota()
  const { girisYapildi, cikisYap } = useAuthSession()
  const navigate = useNavigate()

  // Oturum, anasayfaya geçiş TAMAMLANDIKTAN sonra kapatılır. Ters sırada
  // (ya da aynı tick'te) kapatılırsa hâlâ /hesabim'deyken `useKorumaliRota`
  // devreye girer ve kullanıcıyı çıkış yerine giriş ekranına atar.
  const cikis = useCallback(() => {
    void navigate({ to: '/', replace: true }).then(() => {
      cikisYap()
    })
  }, [cikisYap, navigate])

  if (!girisYapildi) return null

  return (
    <AccountAppShell data={ACCOUNT_FIXTURES.default} onCikis={cikis}>
      <Outlet />
    </AccountAppShell>
  )
}

export const Route = createFileRoute('/hesabim')({
  component: KorumaliHesapKabugu,
})
