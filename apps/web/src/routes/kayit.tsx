import { createFileRoute } from '@tanstack/react-router'
import { KayitPage } from '@/features/auth/pages/KayitPage'

export const Route = createFileRoute('/kayit')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Hesap oluşturun | arsam.net' },
      {
        name: 'description',
        content: 'arsam.net’te bireysel veya emlak ofisi hesabı açın.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitPage,
})
