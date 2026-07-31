import { createFileRoute } from '@tanstack/react-router'
import { BaglantiGecersizPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris_/baglanti_/gecersiz')({
  head: () => ({
    meta: [
      { title: 'Bağlantı geçersiz | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: BaglantiGecersizPage,
})
