import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountPaymentsPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountPaymentsPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/odemeler')({
  head: () => ({
    meta: [
      { title: 'Ödemeler | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/odemeler` }],
  }),
  component: Sayfa,
})
