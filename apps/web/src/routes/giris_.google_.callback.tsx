import { createFileRoute } from '@tanstack/react-router'
import { GoogleCallbackPage } from '@/features/auth/pages/GoogleCallbackPage'

export const Route = createFileRoute('/giris_/google_/callback')({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Google ile giriş yapılıyor | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GoogleCallbackPage,
})
