import { useCallback, useMemo, type ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { GlassButton, GlassIconButton, GlassSiteHeader, type GlassSiteHeaderLink } from '@repo/ui'
import { useAuthSession } from '@/features/auth'
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

const BellIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 9.5a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17s-2.5-1-2.5-7" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </svg>
)

export function MarketplaceShell({ children }: MarketplaceShellProps) {
  const router = useRouter()
  // Giriş yapılmadan satıcı eylemleri gösterilmez: "İlan ver" ve bildirim
  // zili yalnız kimlikli oturumda çizilir. Sunucu `bilinmiyor` durumunda
  // anonim varyantı basar; hidrasyon sonrası oturum çözülünce butonlar gelir
  // (durum efektte değiştiği için sunucu/istemci ilk çıktısı hep eşleşir).
  const { girisYapildi } = useAuthSession()
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
      onClick={() => routeTo(girisYapildi ? '/hesabim' : '/giris')}
    >
      {girisYapildi ? 'Hesabım' : 'Üye girişi'}
    </GlassButton>
  )

  const createAction = (
    <GlassButton size="sm" prominent onClick={() => routeTo('/ilan-ver')}>
      İlan ver
    </GlassButton>
  )

  // Bildirim zili: adanmış bir bildirim sayfası yok — en yakın karşılık olan
  // hesap hareketleri akışına götürür.
  const notificationsAction = (
    <GlassIconButton size="sm" label="Bildirimler" onClick={() => routeTo('/hesabim/hareketler')}>
      {BellIcon}
    </GlassIconButton>
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
          utility={girisYapildi ? notificationsAction : undefined}
          secondaryAction={accountAction}
          action={girisYapildi ? createAction : undefined}
        />
      ) : null}
      <PageTrailContext.Provider value={pageTrail}>{children}</PageTrailContext.Provider>
      {/* Footer sayfanın değil kabuğun işidir: tek yerde durur, her sayfada
          aynıdır ve bir sayfanın onu unutması mümkün olmaz. */}
      {!isFocusedFlow ? <SiteFooter /> : null}
    </div>
  )
}
