import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountActivityPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountActivityPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/hareketler')({
  head: () => ({
    meta: [
      { title: 'Hesap hareketleri | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/hareketler` }],
  }),
  component: Sayfa,
})
