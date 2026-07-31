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
import { isAuthPath } from '@/config/routes'
import { AuthSessionProvider } from '@/features/auth'
import { AuthShell } from '@/features/auth/components/AuthShell'
import type { RouterContext } from '@/router-context'

export const Route = createRootRouteWithContext<RouterContext>()({
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
  const { queryClient } = Route.useRouteContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const authSayfasi = isAuthPath(pathname)

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
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

function NotFound() {
  return (
    <main id="main-content" className="route-stage">
      <section className="route-intro">
        <span className="route-rule" aria-hidden="true" />
        <p className="route-context">Sayfa bulunamadı</p>
        <h1>Bu adres henüz arsam.net’te yok.</h1>
        <p className="route-description">
          Ana sayfaya dönmek için üstteki markayı veya alttaki Dock’u
          kullanabilirsiniz.
        </p>
      </section>
    </main>
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
