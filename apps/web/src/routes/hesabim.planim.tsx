import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import { ACCOUNT_FIXTURES, AccountPageFrame, AccountPlanPage } from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountPlanPage data={ACCOUNT_FIXTURES.default} currentPlanId="profesyonel" currentSeats={8} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/planim')({
  head: () => ({
    meta: [
      { title: 'Paketim | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/planim` }],
  }),
  component: Sayfa,
})
