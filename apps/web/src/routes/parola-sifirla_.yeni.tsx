import { createFileRoute, redirect } from '@tanstack/react-router'
import { ParolaYeniPage } from '@/features/auth/pages/ParolaYeniPage'

export const Route = createFileRoute('/parola-sifirla_/yeni')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  // Token'sız gelen kullanıcı formu hiç görmemeli: doldurup gönderdikten
  // sonra "bağlantı geçersiz" demek boşa emek. Token'ın GEÇERLİLİĞİ burada
  // denetlenmez (o sunucunun işi) — yalnız varlığı.
  beforeLoad: ({ search }) => {
    if (!search.token) throw redirect({ to: '/parola-sifirla/gecersiz', replace: true })
  },
  head: () => ({
    meta: [
      { title: 'Yeni parolanızı belirleyin | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ParolaYeniPage,
})
