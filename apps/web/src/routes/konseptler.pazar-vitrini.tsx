import { createFileRoute } from '@tanstack/react-router'
import { MarketplaceShowcaseHome } from '@/features/home-concepts/marketplace/MarketplaceShowcaseHome'

export const Route = createFileRoute('/konseptler/pazar-vitrini')({
  head: () => ({
    meta: [
      { title: 'Pazar Vitrini konsepti | arsam.net' },
      {
        name: 'description',
        content:
          'Kategori rayı, yoğun ilan vitrinleri ve kayıtlı aramayla hızlı taramaya odaklanan ana sayfa konsepti.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: MarketplaceShowcaseHome,
})
