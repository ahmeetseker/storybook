import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { KorumaliSayfa } from '@/features/auth/components/KorumaliSayfa'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { ListingCreateWorkspace } from '@/features/listing-create'

// İlan vermek hesap gerektirir — ilan bir kullanıcıya ait olmak zorunda.
// Bu rota İP-1'e kadar hiç korunmuyordu.
function KorumaliIlanVer() {
  return (
    <KorumaliSayfa>
      <ListingCreateWorkspace />
    </KorumaliSayfa>
  )
}

export const Route = createFileRoute('/ilan-ver')({
  head: () => createPageHead('create-listing'),
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  component: KorumaliIlanVer,
})
