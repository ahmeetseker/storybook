import { useCallback, useMemo, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { GlassButton, GlassSiteHeader, type GlassSiteHeaderLink } from '@repo/ui'
import {
  getBreadcrumbTrail,
  getRouteByKey,
  getRouteByPath,
  headerRouteKeys,
  type AppRouteHref,
} from '@/config/routes'
import { stripBase, withBase } from '@/config/base-path'
import { NavigationIcon } from './NavigationIcon'
import { PageTrailContext, type PageTrailItem } from './PageTrail'
import { SiteFooter } from './SiteFooter'

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
  // header'ı VE footer'ı gizlenir — iki gezinme katmanı üst üste binmez.
  //
  // Footer aynı koşulu paylaşır çünkü aynı soruyu sorar: bu sayfa siteyi mi
  // geziyor, yoksa bir işi mi bitiriyor? Sihirbazın ve mesaj çalışma
  // masasının altına site haritası koymak, akıştan çıkmayı kolaylaştırır.
  const isFocusedFlow =
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

  // Kırıntı yolu kabuğun işidir (footer gibi): rotanın `statusTrail`'inden
  // üretilir, `PageContainer` çizer — bir sayfa onu unutamaz. Odaklı akışlar
  // (sihirbaz, hesap panosu) kendi üst şeridini kurar; onlara yol verilmez.
  const pageTrail = useMemo<readonly PageTrailItem[]>(() => {
    if (isFocusedFlow) return []
    return getBreadcrumbTrail(currentRoute).map(({ label, href }) => ({
      label,
      href: href !== undefined ? withBase(href) : undefined,
      onClick: href !== undefined ? () => routeTo(withBase(href)) : undefined,
    }))
  }, [currentRoute, isFocusedFlow, routeTo])

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
      {!isFocusedFlow ? (
        <GlassSiteHeader
          logo={logo}
          links={headerLinks}
          secondaryAction={accountAction}
          action={createAction}
        />
      ) : null}
      <PageTrailContext.Provider value={pageTrail}>{children}</PageTrailContext.Provider>
      {/* Footer sayfanın değil kabuğun işidir: tek yerde durur, her sayfada
          aynıdır ve bir sayfanın onu unutması mümkün olmaz. */}
      {!isFocusedFlow ? <SiteFooter /> : null}
    </div>
  )
}
