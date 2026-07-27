import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/arsa-ara')({
  beforeLoad: () => {
    throw redirect({
      to: '/emlak',
      search: { category: 'land' } as never,
      replace: true,
    })
  },
})
