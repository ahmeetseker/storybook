import { createFileRoute } from '@tanstack/react-router'
import { GirisPage } from '@/features/auth/pages/GirisPage'

export const Route = createFileRoute('/giris')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Giriş yapın | arsam.net' },
      // Google girişi İP-6'da bağlandı; metin artık üç yöntemin üçünü de
      // doğru sayıyor.
      {
        name: 'description',
        content: 'arsam.net hesabınıza telefon, parola veya Google ile giriş yapın.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisPage,
})
