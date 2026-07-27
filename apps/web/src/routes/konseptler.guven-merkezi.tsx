import { createFileRoute } from '@tanstack/react-router'
import { TrustFirstHome } from '@/features/home-concepts/trust-first/TrustFirstHome'

export const Route = createFileRoute('/konseptler/guven-merkezi')({
  head: () => ({
    meta: [
      { title: 'Güven Merkezi konsepti | arsam.net' },
      {
        name: 'description',
        content:
          'EİDS, tapu, imar ve açıklanabilir AI dayanaklarını öne çıkaran güven odaklı ana sayfa konsepti.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: TrustFirstHome,
})
