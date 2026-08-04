import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountSecurityPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountSecurityPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/guvenlik')({
  head: () => ({
    meta: [
      { title: 'Güvenlik ve doğrulama | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/guvenlik` }],
  }),
  component: Sayfa,
})
