import { createFileRoute } from '@tanstack/react-router'
import { KorumaliSayfa } from '@/features/auth/components/KorumaliSayfa'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { OrganizasyonSecPage } from '@/features/auth/pages/OrganizasyonSecPage'

function KorumaliOrganizasyonSec() {
  return (
    <KorumaliSayfa>
      <OrganizasyonSecPage />
    </KorumaliSayfa>
  )
}

export const Route = createFileRoute('/organizasyon-sec')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  head: () => ({
    meta: [
      { title: 'Organizasyon seçin | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KorumaliOrganizasyonSec,
})
