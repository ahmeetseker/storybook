import { createFileRoute } from '@tanstack/react-router'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { KayitKurumsalPage } from '@/features/auth/pages/KayitKurumsalPage'

export const Route = createFileRoute('/kayit_/kurumsal')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Emlak ofisi başvurusu | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitKurumsalPage,
})
