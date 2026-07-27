import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '@/components/RoutePlaceholder'
import { createPageHead } from '@/config/routes'

export const Route = createFileRoute('/blog')({
  head: () => createPageHead('blog'),
  component: () => <RoutePlaceholder routeKey="blog" />,
})
