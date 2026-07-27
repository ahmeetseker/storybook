import { createFileRoute } from '@tanstack/react-router'
import { ConceptIndexPage } from '@/features/home-concepts/ConceptIndexPage'

export const Route = createFileRoute('/konseptler/')({
  head: () => ({
    meta: [
      { title: 'Ana Sayfa Konseptleri | arsam.net' },
      {
        name: 'description',
        content:
          'arsam.net ana sayfası için hazırlanan beş ürün yönünü karşılaştırın.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ConceptIndexPage,
})
