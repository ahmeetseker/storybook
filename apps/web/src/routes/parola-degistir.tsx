import { createFileRoute } from '@tanstack/react-router'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { ParolaDegistirPage } from '@/features/auth/pages/ParolaDegistirPage'

export const Route = createFileRoute('/parola-degistir')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  head: () => ({
    meta: [
      { title: 'Parolanızı değiştirin | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaDegistirPage,
})
