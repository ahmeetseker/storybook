import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  GlassButton,
  GlassDock,
  GlassSiteHeader,
  type GlassDockItem,
  type GlassSiteHeaderLink,
} from '@repo/ui'
import {
  dockRouteKeys,
  getRouteByKey,
  getRouteByPath,
  headerRouteKeys,
  type AppRouteHref,
} from '@/config/routes'
import { stripBase, withBase } from '@/config/base-path'
import { NavigationIcon } from './NavigationIcon'

type ViewportTier = keyof typeof dockRouteKeys
type ThemeChoice = 'system' | 'light' | 'dark'

const viewportTiers = ['desktop', 'tablet', 'mobile'] as const

function getViewportTier(): ViewportTier {
  if (typeof window === 'undefined') return 'desktop'
  if (window.innerWidth < 768) return 'mobile'
  if (window.innerWidth < 1024) return 'tablet'
  return 'desktop'
}

function applyTheme(theme: ThemeChoice) {
  if (typeof document === 'undefined') return
  if (theme === 'system') {
    delete document.documentElement.dataset.theme
  } else {
    document.documentElement.dataset.theme = theme
  }
}

export interface MarketplaceShellProps {
  children: ReactNode
}

export function MarketplaceShell({ children }: MarketplaceShellProps) {
  const router = useRouter()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentRoute = getRouteByPath(pathname)
  const isFocusedListingFlow = currentRoute.key === 'create-listing'
  const [viewport, setViewport] = useState<ViewportTier | null>(null)
  const [theme, setTheme] = useState<ThemeChoice>('system')

  useEffect(() => {
    const update = () => setViewport(getViewportTier())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem('arsam-theme')
    const next =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system'
    setTheme(next)
    applyTheme(next)
  }, [])

  const routeTo = useCallback(
    (href: string) => {
      // Navigasyon verisi `withBase` ile öneklendiği için router'a verilmeden
      // önce önek sökülür; basepath'i router kendisi uygular.
      void router.navigate({ to: stripBase(href) as AppRouteHref })
    },
    [router],
  )

  const cycleTheme = () => {
    const next: ThemeChoice =
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
    applyTheme(next)
    window.localStorage.setItem('arsam-theme', next)
  }

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

  const dockItems = useMemo<Record<ViewportTier, GlassDockItem[]>>(() => {
    const createItems = (tier: ViewportTier) =>
      dockRouteKeys[tier].map((key) => {
        const route = getRouteByKey(key)
        const label =
          route.key === 'compare'
            ? 'Karşılaştır'
            : route.key === 'search'
              ? 'Arama'
              : route.label
        return {
          key: route.key,
          label,
          href: withBase(route.href),
          icon: <NavigationIcon name={route.icon} size={20} />,
          active: route.key === currentRoute.key,
        }
      })

    return {
      desktop: createItems('desktop'),
      tablet: createItems('tablet'),
      mobile: createItems('mobile'),
    }
  }, [currentRoute.key])

  const logo = (
    <a className="shell-brand" href={withBase('/')}>
      <NavigationIcon name="sparkles" size={22} />
      arsam.net
    </a>
  )

  const themeAction = (
    <GlassButton
      size="sm"
      aria-label={`Tema: ${theme}`}
      title={`Tema: ${theme}`}
      onClick={cycleTheme}
    >
      <NavigationIcon name="theme" size={18} />
    </GlassButton>
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

  const renderDock = (tier: ViewportTier) => (
    <div
      key={tier}
      className={`shell-dock-variant shell-dock-variant--${tier}`}
    >
      <GlassDock
        items={dockItems[tier]}
        behavior="fixed"
        label="Ana gezinme"
        onRoute={routeTo}
      />
    </div>
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
          utility={themeAction}
          secondaryAction={accountAction}
          action={createAction}
        />
      ) : null}
      {children}
      {!isFocusedListingFlow
        ? viewport === null
          ? viewportTiers.map((tier) => renderDock(tier))
          : renderDock(viewport)
        : null}
    </div>
  )
}
