import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  GlassAiSearchBar,
  GlassButton,
  GlassDock,
  GlassIslandHeader,
  type GlassDockItem,
  type GlassIslandHeaderPage,
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
  initialTime: string
}

export function MarketplaceShell({
  children,
  initialTime,
}: MarketplaceShellProps) {
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

  const headerPages = useMemo<GlassIslandHeaderPage[]>(
    () =>
      headerRouteKeys.map((key) => {
        const route = getRouteByKey(key)
        return {
          key: route.key,
          label: route.key === 'offices' ? 'Ofisler' : route.label,
          href: withBase(route.href),
          icon: <NavigationIcon name={route.icon} size={22} />,
        }
      }),
    [],
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

  const extras = (
    <div className="shell-extras">
      <div className="shell-language" role="group" aria-label="Dil">
        <GlassButton
          size="sm"
          tint="var(--lg-accent)"
          aria-pressed="true"
          onClick={() => undefined}
        >
          🇹🇷 TR
        </GlassButton>
        <GlassButton size="sm" aria-pressed="false" onClick={() => undefined}>
          🇬🇧 EN
        </GlassButton>
      </div>
      <GlassButton
        size="sm"
        aria-label={`Tema: ${theme}`}
        title={`Tema: ${theme}`}
        onClick={cycleTheme}
      >
        <NavigationIcon name="theme" size={18} />
      </GlassButton>
      <GlassButton
        size="sm"
        aria-label="Geçmiş"
        title="Geçmiş"
        onClick={() => routeTo('/favoriler')}
      >
        <NavigationIcon name="clock" size={18} />
      </GlassButton>
      <GlassButton
        id="shell-account-action"
        size="sm"
        onClick={() => routeTo('/hesabim')}
      >
        {currentRoute.scope === 'account' ? 'Hesabım' : 'Üye girişi'}
      </GlassButton>
      <GlassButton
        size="sm"
        prominent
        onClick={() => routeTo('/ilan-ver')}
      >
        İlan ver
      </GlassButton>
    </div>
  )

  const search = (
    <GlassAiSearchBar
      onSubmit={(query) => {
        void router.navigate({
          to: '/emlak',
          search: query ? ({ q: query } as never) : ({} as never),
        })
      }}
      suggestions={[
        'İzmir’de denize yakın satılık konut',
        'Urla’da 5 milyon altı imarlı arsa',
        'İstanbul’da kiralık cadde mağazası',
      ]}
      placeholder="Konut, arsa veya iş yeri ara"
    />
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
        <GlassIslandHeader
          brandIcon={<NavigationIcon name="sparkles" size={25} />}
          brandLabel="arsam.net"
          brandHref={withBase('/')}
          pages={headerPages}
          activeKey={currentRoute.key}
          statusTrail={currentRoute.statusTrail}
          statusVisibility="auto"
          showClock
          initialTime={initialTime}
          timeZone="Europe/Istanbul"
          notificationCount={0}
          onNotificationsClick={() => routeTo('/hesabim/mesajlar')}
          onRoute={routeTo}
          extras={extras}
          search={search}
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
