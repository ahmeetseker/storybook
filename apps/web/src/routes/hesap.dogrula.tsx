import { createFileRoute } from '@tanstack/react-router'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { HesapDogrulaPage } from '@/features/auth/pages/HesapDogrulaPage'

export const Route = createFileRoute('/hesap/dogrula')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'EİDS doğrulaması | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapDogrulaPage,
})
