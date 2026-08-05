import { createFileRoute } from '@tanstack/react-router'
import { ParolaBaglantiGecersizPage } from '@/features/auth/pages/parolaSifirlamaDurumSayfalari'

export const Route = createFileRoute('/parola-sifirla_/gecersiz')({
  head: () => ({
    meta: [
      { title: 'Bağlantı geçersiz | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaBaglantiGecersizPage,
})
