import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountListingsPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountListingsPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/ilanlarim')({
  head: () => ({
    meta: [
      { title: 'İlanlarım | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/ilanlarim` }],
  }),
  component: Sayfa,
})
