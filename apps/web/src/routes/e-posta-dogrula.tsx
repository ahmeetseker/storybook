import { createFileRoute } from '@tanstack/react-router'
import { KorumaliSayfa } from '@/features/auth/components/KorumaliSayfa'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { EPostaDogrulaPage } from '@/features/auth/pages/EPostaDogrulaPage'

function KorumaliEPostaDogrula() {
  return (
    <KorumaliSayfa>
      <EPostaDogrulaPage />
    </KorumaliSayfa>
  )
}

export const Route = createFileRoute('/e-posta-dogrula')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  head: () => ({
    meta: [
      { title: 'E-posta adresinizi doğrulayın | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KorumaliEPostaDogrula,
})
