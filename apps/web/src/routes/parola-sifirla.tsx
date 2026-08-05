import { createFileRoute } from '@tanstack/react-router'
import { ParolaSifirlaPage } from '@/features/auth/pages/ParolaSifirlaPage'

export const Route = createFileRoute('/parola-sifirla')({
  head: () => ({
    meta: [
      { title: 'Parolanızı sıfırlayın | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaSifirlaPage,
})
