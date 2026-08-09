import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { PricingPage } from '@/features/pricing'

export const Route = createFileRoute('/paketler')({
  head: () => createPageHead('pricing'),
  component: PricingPage,
})
