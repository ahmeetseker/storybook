import { createFileRoute } from '@tanstack/react-router'

import { createPageHead } from '@/config/routes'
import { ACCOUNT_FIXTURES, AccountWorkspace } from '@/features/account'

/** Hesap özeti — hesap kabuğunun varsayılan sayfası. */
function HesapOzetiSayfasi() {
  return <AccountWorkspace data={ACCOUNT_FIXTURES.default} />
}

export const Route = createFileRoute('/hesabim/')({
  head: () => createPageHead('account'),
  component: HesapOzetiSayfasi,
})
