import { createFileRoute } from '@tanstack/react-router'
import { HesapVarPage } from '@/features/auth/pages/kayitDurumSayfalari'

export const Route = createFileRoute('/kayit_/hesap-var')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Bu hesap zaten var | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapVarPage,
})
