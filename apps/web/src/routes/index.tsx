import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { MapFirstHome } from '@/features/home-concepts/map-first/MapFirstHome'
import { isHeroTabId, type HeroTabId } from '@/features/home-concepts/map-first/heroTabs'

export const Route = createFileRoute('/')({
  head: () => createPageHead('home'),
  // Sekme durumu paylaşılabilir olsun diye URL'de taşınır; geçersiz/bilinmeyen değerler düşer.
  validateSearch: (search: Record<string, unknown>): { tur?: HeroTabId } =>
    isHeroTabId(search.tur) ? { tur: search.tur } : {},
  component: HomePage,
})

function HomePage() {
  const { tur } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <MapFirstHome
      showConceptNavigation={false}
      tab={tur ?? 'arsa'}
      onTabChange={(next) => {
        // Varsayılan sekmede (arsa) URL kirlenmesin diye arama parametresi tamamen kaldırılır.
        void navigate({ search: next === 'arsa' ? {} : { tur: next }, replace: true })
      }}
    />
  )
}
