import { createFileRoute } from '@tanstack/react-router'
import { BaglantiGonderildiPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris_/baglanti-gonderildi')({
  head: () => ({
    meta: [
      { title: 'Bağlantı gönderildi | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: BaglantiGonderildiPage,
})
