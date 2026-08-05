import { useCallback, useMemo, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { GlassButton, GlassSiteHeader, type GlassSiteHeaderLink } from '@repo/ui'
import {
  getRouteByKey,
  getRouteByPath,
  headerRouteKeys,
  type AppRouteHref,
} from '@/config/routes'
import { stripBase, withBase } from '@/config/base-path'
import { NavigationIcon } from './NavigationIcon'

export interface MarketplaceShellProps {
  children: ReactNode
}

export function MarketplaceShell({ children }: MarketplaceShellProps) {
  const router = useRouter()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentRoute = getRouteByPath(pathname)
  // Kendi kabuğunu kuran rotalar: ilan verme sihirbazı (odaklı akış) ve
  // hesap panosu (sol ray + kendi üst şeridi). İkisinde de pazar yeri
  // header'ı gizlenir — iki gezinme katmanı üst üste binmez.
  const isFocusedListingFlow =
    currentRoute.key === 'create-listing'
    || currentRoute.key === 'account'
    || currentRoute.key === 'messages'

  const routeTo = useCallback(
    (href: string) => {
      // Navigasyon verisi `withBase` ile öneklendiği için router'a verilmeden
      // önce önek sökülür; basepath'i router kendisi uygular.
      void router.navigate({ to: stripBase(href) as AppRouteHref })
    },
    [router],
  )

  const headerLinks = useMemo<GlassSiteHeaderLink[]>(
    () =>
      headerRouteKeys.map((key) => {
        const route = getRouteByKey(key)
        return {
          label: route.key === 'offices' ? 'Ofisler' : route.label,
          href: withBase(route.href),
          active: route.key === currentRoute.key,
          onClick: () => routeTo(withBase(route.href)),
        }
      }),
    [currentRoute.key, routeTo],
  )

  const logo = (
    <a className="shell-brand" href={withBase('/')}>
      <NavigationIcon name="sparkles" size={22} />
      arsam.net
    </a>
  )

  const accountAction = (
    <GlassButton
      id="shell-account-action"
      size="sm"
      onClick={() => routeTo('/hesabim')}
    >
      {currentRoute.scope === 'account' ? 'Hesabım' : 'Üye girişi'}
    </GlassButton>
  )

  const createAction = (
    <GlassButton size="sm" prominent onClick={() => routeTo('/ilan-ver')}>
      İlan ver
    </GlassButton>
  )

  return (
    <div className="marketplace-shell">
      <a className="skip-link" href="#main-content">
        İçeriğe geç
      </a>
      {!isFocusedListingFlow ? (
        <GlassSiteHeader
          logo={logo}
          links={headerLinks}
          secondaryAction={accountAction}
          action={createAction}
        />
      ) : null}
      {children}
    </div>
  )
}
