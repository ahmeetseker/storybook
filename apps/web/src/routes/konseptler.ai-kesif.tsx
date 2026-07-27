import { createFileRoute } from '@tanstack/react-router'
import { AiDiscoveryHome } from '@/features/home-concepts/ai-discovery/AiDiscoveryHome'

export const Route = createFileRoute('/konseptler/ai-kesif')({
  head: () => ({
    meta: [
      { title: 'AI Keşif konsepti | arsam.net' },
      {
        name: 'description',
        content:
          'Doğal dil araması, açıklanabilir eşleşme ve doğrulanmış arsa ilanlarını birleştiren ana sayfa konsepti.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AiDiscoveryHome,
})
