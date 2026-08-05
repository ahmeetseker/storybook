import { createFileRoute } from '@tanstack/react-router'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { KayitProfilPage } from '@/features/auth/pages/KayitProfilPage'

export const Route = createFileRoute('/kayit_/profil')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Profilinizi tamamlayın | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitProfilPage,
})
