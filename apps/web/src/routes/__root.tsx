/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import '@fontsource-variable/manrope/index.css'
import '@repo/ui/styles'
import '@/styles/app.css'
import { MarketplaceShell } from '@/components/MarketplaceShell'
import { NotFound } from '@/components/NotFound/NotFound'
import { isAuthPath } from '@/config/routes'
import { AuthSessionProvider } from '@/features/auth'
import { AuthShell } from '@/features/auth/components/AuthShell'
import type { RouterContext } from '@/router-context'

export const Route = createRootRouteWithContext<RouterContext>()({
  /**
   * Oturumun TEK çözüm noktası. Render'dan önce koştuğu için korumalı
   * rotaların `beforeLoad`'ları `throw redirect` atabilir — bugünkü
   * "render et, sonra istemcide sek" davranışının yerini alacak seam budur.
   *
   * Fixture aşamasında sunucuda `bilinmiyor` döner (oturum sessionStorage'da);
   * istemci tarafı navigasyonlarda gerçek değeri verir.
   */
  beforeLoad: async ({ context }) => ({
    oturum: await context.adapters.oturumuCoz(),
  }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: 'arsam.net | AI destekli arsa pazaryeri' },
      {
        name: 'description',
        content:
          'Arsa arama, karşılaştırma, güven doğrulaması ve ilan yönetimi için AI-first pazaryeri.',
      },
      { name: 'theme-color', content: '#faf8f4' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  const { queryClient, adapters } = Route.useRouteContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const authSayfasi = isAuthPath(pathname)

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        {/* Adapter tek kaynaktan gelir: router context. Provider'ın kendi
            varsayılanına düşmesi, testlerin enjekte ettiği sahte adapter ile
            `beforeLoad`'un kullandığı adapter'ın ayrışmasına yol açardı. */}
        <AuthSessionProvider adapters={adapters}>
          {authSayfasi ? (
            <AuthShell>
              <Outlet />
            </AuthShell>
          ) : (
            <MarketplaceShell>
              <Outlet />
            </MarketplaceShell>
          )}
        </AuthSessionProvider>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
