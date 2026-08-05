import { createFileRoute } from '@tanstack/react-router'
import { HesapAskidaPage } from '@/features/auth/pages/hesapDurumSayfalari'

export const Route = createFileRoute('/hesap/askida')({
  head: () => ({
    meta: [
      { title: 'Hesabınız askıya alınmış | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapAskidaPage,
})
