/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useCallback } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'

import { ACCOUNT_FIXTURES, AccountAppShell } from '@/features/account'
import { useAuthSession } from '@/features/auth'
import { KorumaliSayfa } from '@/features/auth/components/KorumaliSayfa'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'

/**
 * Hesap bölümünün layout rotası.
 *
 * Ray ve üst şerit burada yaşar: `/hesabim` altındaki tüm sayfalar (özet,
 * ilanlar, mesajlar, güvenlik…) aynı kabuğun içinde açılır, gezinme sırasında
 * kabuk yeniden kurulmaz.
 *
 * Koruma İKİ katmanlıdır ve ikisi de PAYLAŞILAN koddan gelir — bu dosya
 * eskiden `useKorumaliRota()` + `if (!girisYapildi) return null` kalıbını
 * elle kopyalıyordu (rules.md §14'ün açıkça yasakladığı şey) ve
 * `hidrasyonTamam` bayrağı olmadığı için oturumlu kullanıcı sayfayı
 * yenilediğinde hidrasyon uyuşmazlığı üretiyordu.
 */
function HesapKabugu() {
  const { cikisYap } = useAuthSession()
  const navigate = useNavigate()

  // Oturum, anasayfaya geçiş TAMAMLANDIKTAN sonra kapatılır. Ters sırada
  // (ya da aynı tick'te) kapatılırsa hâlâ /hesabim'deyken `useKorumaliRota`
  // devreye girer ve kullanıcıyı çıkış yerine giriş ekranına atar.
  const cikis = useCallback(() => {
    void navigate({ to: '/', replace: true }).then(() => {
      cikisYap()
    })
  }, [cikisYap, navigate])

  return (
    <KorumaliSayfa>
      <AccountAppShell data={ACCOUNT_FIXTURES.default} onCikis={cikis}>
        <Outlet />
      </AccountAppShell>
    </KorumaliSayfa>
  )
}

export const Route = createFileRoute('/hesabim')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  component: HesapKabugu,
})
