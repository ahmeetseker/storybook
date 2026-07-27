import { createFileRoute } from '@tanstack/react-router'
import { AiAdvisorHome } from '@/features/home-concepts/ai-advisor/AiAdvisorHome'

export const Route = createFileRoute('/konseptler/ai-danisman')({
  head: () => ({
    meta: [
      { title: 'AI Danışman konsepti | arsam.net' },
      {
        name: 'description',
        content:
          'İhtiyaç toplama, açıklanabilir öneri ve insan onaylı AI adımlarını birleştiren ana sayfa konsepti.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AiAdvisorHome,
})
