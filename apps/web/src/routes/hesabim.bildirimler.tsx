import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import { AccountPageFrame, AccountNotificationsPage } from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountNotificationsPage />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/bildirimler')({
  head: () => ({
    meta: [
      { title: 'Bildirimler | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/bildirimler` }],
  }),
  component: Sayfa,
})
