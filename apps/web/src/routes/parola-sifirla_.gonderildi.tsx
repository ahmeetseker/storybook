import { createFileRoute } from '@tanstack/react-router'
import { ParolaBaglantiGonderildiPage } from '@/features/auth/pages/parolaSifirlamaDurumSayfalari'

export const Route = createFileRoute('/parola-sifirla_/gonderildi')({
  head: () => ({
    meta: [
      { title: 'Bağlantıyı gönderdik | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaBaglantiGonderildiPage,
})
