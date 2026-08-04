import { createFileRoute } from '@tanstack/react-router'

import { siteOrigin } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountPageFrame,
  AccountInvoicesPage,
} from '@/features/account'

function Sayfa() {
  return (
    <AccountPageFrame>
      <AccountInvoicesPage data={ACCOUNT_FIXTURES.default} />
    </AccountPageFrame>
  )
}

export const Route = createFileRoute('/hesabim/faturalarim')({
  head: () => ({
    meta: [
      { title: 'Faturalarım | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}/hesabim/faturalarim` }],
  }),
  component: Sayfa,
})
