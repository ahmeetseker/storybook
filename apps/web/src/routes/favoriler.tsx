import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { FavoritesWorkspace } from '@/features/favorites'

export const Route = createFileRoute('/favoriler')({
  head: () => createPageHead('favorites'),
  component: FavoritesWorkspace,
})
