import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { MapFirstHome } from '@/features/home-concepts/map-first/MapFirstHome'

export const Route = createFileRoute('/')({
  head: () => createPageHead('home'),
  component: HomePage,
})

function HomePage() {
  return <MapFirstHome showConceptNavigation={false} />
}
