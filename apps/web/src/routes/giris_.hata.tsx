import { createFileRoute } from '@tanstack/react-router'
import { GirisHataPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris_/hata')({
  head: () => ({
    meta: [
      { title: 'Giriş tamamlanamadı | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisHataPage,
})
