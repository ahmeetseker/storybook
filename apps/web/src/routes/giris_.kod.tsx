import { createFileRoute } from '@tanstack/react-router'
import { GirisKodPage } from '@/features/auth/pages/GirisKodPage'

export const Route = createFileRoute('/giris_/kod')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Kodu girin | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisKodPage,
})
