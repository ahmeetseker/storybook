import { createFileRoute } from '@tanstack/react-router'
import { korumaliRotaGuard } from '@/features/auth/domain/auth-guard'
import { KayitKurumsalPage } from '@/features/auth/pages/KayitKurumsalPage'

export const Route = createFileRoute('/kayit_/kurumsal')({
  beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href),
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
    // `/paketler` sayfasından gelen ön seçim. Geçerliliği sayfa çözer:
    // tanınmayan kimlik varsayılan pakete düşer, rota hata vermez.
    paket: typeof search.paket === 'string' ? search.paket : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Emlak ofisi başvurusu | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitKurumsalPage,
})
