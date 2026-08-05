import { createFileRoute } from '@tanstack/react-router'
import { DavetGecersizPage } from '@/features/auth/pages/davetDurumSayfalari'

export const Route = createFileRoute('/davet/gecersiz')({
  head: () => ({
    meta: [
      { title: 'Davet geçersiz | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: DavetGecersizPage,
})
