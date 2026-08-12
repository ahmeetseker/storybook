import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import { AccountAppointmentsPage, AccountPageFrame } from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountAppointmentsPage />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/randevularim')({
  head: () => ({
    meta: [
      { title: 'Randevularım | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/randevularim` }],
  }),
  component: Sayfa,
})
