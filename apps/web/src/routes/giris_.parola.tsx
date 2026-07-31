import { createFileRoute } from '@tanstack/react-router'
import { GirisParolaPage } from '@/features/auth/pages/GirisParolaPage'

export const Route = createFileRoute('/giris_/parola')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Parola ile giriş | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisParolaPage,
})
