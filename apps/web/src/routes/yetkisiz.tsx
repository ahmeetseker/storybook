import { createFileRoute } from '@tanstack/react-router'
import { YetkisizPage } from '@/features/auth/pages/hesapDurumSayfalari'

export const Route = createFileRoute('/yetkisiz')({
  head: () => ({
    meta: [
      { title: 'Erişim yetkiniz yok | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: YetkisizPage,
})
