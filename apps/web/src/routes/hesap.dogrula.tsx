import { createFileRoute } from '@tanstack/react-router'
import { HesapDogrulaPage } from '@/features/auth/pages/HesapDogrulaPage'

export const Route = createFileRoute('/hesap/dogrula')({
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
