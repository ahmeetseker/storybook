import { createFileRoute } from '@tanstack/react-router'
import { ParolaSifirlandiPage } from '@/features/auth/pages/parolaSifirlamaDurumSayfalari'

export const Route = createFileRoute('/parola-sifirla_/tamam')({
  head: () => ({
    meta: [
      { title: 'Parolanız değişti | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaSifirlandiPage,
})
