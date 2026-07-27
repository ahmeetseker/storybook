import { createFileRoute } from '@tanstack/react-router'
import { MapFirstHome } from '@/features/home-concepts/map-first/MapFirstHome'

export const Route = createFileRoute('/konseptler/harita-kesfi')({
  head: () => ({
    meta: [
      { title: 'Harita Keşfi konsepti | arsam.net' },
      {
        name: 'description',
        content:
          'Bölge bağlantıları, stilize harita, yakın ilanlar ve doğrulanmış ofislerle konum odaklı ana sayfa konsepti.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: MapFirstHome,
})
