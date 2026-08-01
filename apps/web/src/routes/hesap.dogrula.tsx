import { createFileRoute } from '@tanstack/react-router'
import { HesapDogrulaPage } from '@/features/auth/pages/HesapDogrulaPage'

export const Route = createFileRoute('/hesap/dogrula')({
  head: () => ({
    meta: [
      { title: 'EİDS doğrulaması | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapDogrulaPage,
})
