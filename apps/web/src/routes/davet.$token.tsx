import { createFileRoute } from '@tanstack/react-router'
import { KorumaliSayfa } from '@/features/auth/components/KorumaliSayfa'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { DavetPage } from '@/features/auth/pages/DavetPage'

// Daveti kabul etmek hesap gerektirir. Oturumsuz kullanıcı /giris'e gider ve
// `donus` ile buraya döner — `/davet/:token` bilinçli olarak dönüş reddi
// listesinde YOKTUR (bkz. auth-session.ts).
function KorumaliDavet() {
  return (
    <KorumaliSayfa>
      <DavetPage />
    </KorumaliSayfa>
  )
}

export const Route = createFileRoute('/davet/$token')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  head: () => ({
    meta: [
      { title: 'Davetiniz var | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KorumaliDavet,
})
