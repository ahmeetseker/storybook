import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountWorkspace,
} from '@/features/account'
import { useAuthSession, useKorumaliRota } from '@/features/auth'

function KorumaliHesabim() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  if (!girisYapildi) return null
  return <AccountWorkspace data={ACCOUNT_FIXTURES.default} />
}

export const Route = createFileRoute('/hesabim')({
  head: () => createPageHead('account'),
  component: KorumaliHesabim,
})
