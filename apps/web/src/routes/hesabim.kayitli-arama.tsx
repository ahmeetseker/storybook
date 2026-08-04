import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountSavedSearchPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountSavedSearchPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/kayitli-arama')({
  head: () => ({
    meta: [
      { title: 'Kayıtlı arama | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/kayitli-arama` }],
  }),
  component: Sayfa,
})
