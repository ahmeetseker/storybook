import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountWorkspace,
} from '@/features/account'

export const Route = createFileRoute('/hesabim')({
  head: () => createPageHead('account'),
  component: () => <AccountWorkspace data={ACCOUNT_FIXTURES.default} />,
})
