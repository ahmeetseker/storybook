import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  GlassAiComposer,
  GlassButton,
  GlassDock,
  GlassIslandHeader,
  type GlassAiComposerAttachment,
  type GlassAiComposerTool,
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

// Header kompozitörünün bağlam ekleme araçları — seçiciler parent'ın işi.
const COMPOSER_TOOLS: GlassAiComposerTool[] = [
  { id: 'map', label: 'Haritadan alan', icon: <NavigationIcon name="pin" size={16} /> },
  { id: 'image', label: 'Görselle', icon: <NavigationIcon name="image" size={16} /> },
  { id: 'voice', label: 'Sesli', icon: <NavigationIcon name="mic" size={16} /> },
]

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
  const [brief, setBrief] = useState('')
  const [briefContext, setBriefContext] = useState<GlassAiComposerAttachment[]>([])

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

  // Bağlamı zaten eklenmiş araç tekrar tıklanamaz — chip'i kaldırınca geri açılır.
  const composerTools = COMPOSER_TOOLS.map((tool) => ({
    ...tool,
    disabled: briefContext.some((c) => c.id === tool.id),
  }))

  const search = (
    <GlassAiComposer
      size="md"
      value={brief}
      onValueChange={setBrief}
      placeholder="Aradığını anlat — “Urla’da bahçeli, 6 milyona kadar…”"
      tools={composerTools}
      attachments={briefContext}
      onToolSelect={(id) => {
        const tool = COMPOSER_TOOLS.find((t) => t.id === id)
        // Harita/dosya/ses seçicileri henüz bağlı değil; şimdilik seçim niyeti
        // kaldırılabilir bir bağlam chip'i olarak kaydedilir.
        if (!tool || briefContext.some((c) => c.id === id)) return
        setBriefContext((prev) => [
          ...prev,
          { id, label: tool.label, kind: 'Bağlam', icon: tool.icon },
        ])
      }}
      onRemoveAttachment={(id) =>
        setBriefContext((prev) => prev.filter((c) => c.id !== id))
      }
      onSubmit={(query) => {
        setBrief('')
        setBriefContext([])
        void router.navigate({
          to: '/emlak',
          search: query ? ({ q: query } as never) : ({} as never),
        })
      }}
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
