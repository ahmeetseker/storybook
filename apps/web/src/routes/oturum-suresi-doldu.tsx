import { createFileRoute } from '@tanstack/react-router'
import { OturumSuresiDolduPage } from '@/features/auth/pages/hesapDurumSayfalari'

export const Route = createFileRoute('/oturum-suresi-doldu')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Oturumunuzun süresi doldu | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: OturumSuresiDolduPage,
})
