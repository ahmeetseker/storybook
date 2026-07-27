import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { ListingCreateWorkspace } from '@/features/listing-create'

export const Route = createFileRoute('/ilan-ver')({
  head: () => createPageHead('create-listing'),
  component: ListingCreateWorkspace,
})
