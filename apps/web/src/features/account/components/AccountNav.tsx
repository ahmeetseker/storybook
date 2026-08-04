import { useCallback } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { GlassSidebar } from '@repo/ui'

import { NavigationIcon } from '@/components/NavigationIcon'
import { stripBase, withBase } from '@/config/base-path'
import type { AppRouteHref } from '@/config/routes'
import {
  accountNavEntries,
  accountNavSelectedId,
  type AccountNavId,
} from '../domain/account-navigation'
import type {
  AccountDashboardData,
  AccountRole,
} from '../domain/account-types'

import styles from './AccountNav.module.css'

const roleLabel: Record<AccountRole, string> = {
  buyer: 'Alıcı',
  seller: 'Satıcı',
  hybrid: 'Alıcı ve satıcı',
}

const hrefById = new Map<AccountNavId, string>(
  accountNavEntries.map((entry) => [entry.id, entry.href]),
)

export interface AccountNavProps {
  data: AccountDashboardData
  /**
   * 'glass' kalıcı ray içindir; overlay (çekmece) içinde 'flat' zorunludur —
   * cam üstüne cam yok. Hesap panosunda ray da flat kalır: sayfanın tek cam
   * yüzeyi kabuğun kendisidir.
   */
  material?: 'glass' | 'flat'
  /** İkon-only dar ray (üst şeritteki daraltma düğmesi yönetir) */
  collapsed?: boolean
  /** Bir öğe seçildikten sonra (çekmeceyi kapatmak için) */
  onNavigate?: () => void
  /**
   * Oturumu kapatır. Verilmezse "Çıkış yap" öğesi çizilmez — oturum bilgisi
   * rota katmanında yaşar, ray onu yalnız tetikler.
   */
  onCikis?: () => void
  className?: string
}

/**
 * Hesap bölümünün kalıcı navigasyonu.
 *
 * Öğeler gerçek rotalara gider: seçim yolun kendisinden türetilir, sayfa
 * değişse de ray yerinde kalır (kabuk layout rotasındadır).
 */
export function AccountNav({
  data,
  material = 'flat',
  collapsed = false,
  onNavigate,
  onCikis,
  className,
}: AccountNavProps) {
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const selected = accountNavSelectedId(stripBase(pathname))

  const actionListings = data.listings.filter(({ state }) => state === 'changes').length
  const liveListings = data.listings.filter(({ state }) => state === 'live').length
  const pendingPayments = data.billing?.summary.pendingCount ?? 0

  const handleSelect = useCallback(
    (id: string) => {
      // Çıkış bir rota değil, eylemdir: haritada yeri yok.
      if (id === 'cikis') {
        onNavigate?.()
        onCikis?.()
        return
      }
      const href = hrefById.get(id as AccountNavId)
      if (!href) return
      onNavigate?.()
      void router.navigate({ to: stripBase(withBase(href)) as AppRouteHref })
    },
    [onCikis, onNavigate, router],
  )

  const identityMeta = data.identity.organizationLabel
    ? `${data.identity.organizationLabel} · ${roleLabel[data.identity.role]}`
    : roleLabel[data.identity.role]

  return (
    <GlassSidebar
      selected={selected}
      onSelect={handleSelect}
      material={material}
      density="compact"
      collapsed={collapsed}
      aria-label="Hesap bölümleri"
      className={[styles.nav, className].filter(Boolean).join(' ')}
    >
      {/* Kimlik bilgisi sayfanın kimlik bölümünde yaşar; ray adı tekrar etmez */}
      <GlassSidebar.Header title="Hesabım" subtitle={identityMeta} />

      <GlassSidebar.Item id="ozet" icon={<NavigationIcon name="user" size={18} />}>
        Hesap özeti
      </GlassSidebar.Item>
      <GlassSidebar.Item
        id="mesajlar"
        icon={<NavigationIcon name="message" size={18} />}
        badge={data.unreadMessageCount || undefined}
        badgeLabel="okunmamış mesaj"
      >
        Mesajlar
      </GlassSidebar.Item>

      <GlassSidebar.Section label="Portföyüm">
        <GlassSidebar.Item
          id="ilanlarim"
          icon={<NavigationIcon name="building" size={18} />}
          badge={actionListings || undefined}
          badgeLabel="işlem gereken ilan"
        >
          İlanlarım
        </GlassSidebar.Item>
        <GlassSidebar.Item
          id="ilan-ver"
          icon={<NavigationIcon name="plus" size={18} />}
          hint="↗"
          badge={liveListings || undefined}
          badgeLabel="yayındaki ilan"
        >
          İlan ver
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Section label="Alıcı tarafım">
        <GlassSidebar.Item id="favoriler" icon={<NavigationIcon name="heart" size={18} />} hint="↗">
          Favoriler
        </GlassSidebar.Item>
        <GlassSidebar.Item
          id="kayitli-arama"
          icon={<NavigationIcon name="pin" size={18} />}
          badge={data.activeAlarmCount || undefined}
          badgeLabel="aktif alarm"
        >
          Kayıtlı arama
        </GlassSidebar.Item>
        <GlassSidebar.Item id="karsilastir" icon={<NavigationIcon name="compare" size={18} />} hint="↗">
          Karşılaştırmalar
        </GlassSidebar.Item>
        <GlassSidebar.Item id="emlak" icon={<NavigationIcon name="search" size={18} />} hint="↗">
          Emlak ara
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Section label="Ödemeler ve faturalar">
        <GlassSidebar.Item
          id="odemeler"
          icon={<NavigationIcon name="card" size={18} />}
          badge={pendingPayments || undefined}
          badgeLabel="bekleyen ödeme"
        >
          Ödemeler
        </GlassSidebar.Item>
        <GlassSidebar.Item id="faturalarim" icon={<NavigationIcon name="receipt" size={18} />}>
          Faturalarım
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Section label="Hesap ve AI">
        <GlassSidebar.Item id="guvenlik" icon={<NavigationIcon name="shield" size={18} />}>
          Güvenlik
        </GlassSidebar.Item>
        <GlassSidebar.Item id="hareketler" icon={<NavigationIcon name="clock" size={18} />}>
          Hesap hareketleri
        </GlassSidebar.Item>
        <GlassSidebar.Item id="ai-danisman" icon={<NavigationIcon name="sparkles" size={18} />} hint="↗">
          AI danışman
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      {/* Pazar yeri kabuğu bu bölümde gizli — siteye dönüş yolu rayda durur */}
      <GlassSidebar.Footer>
        <GlassSidebar.Item id="site" icon={<NavigationIcon name="home" size={18} />}>
          Siteye dön
        </GlassSidebar.Item>
        {onCikis ? (
          <GlassSidebar.Item id="cikis" icon={<NavigationIcon name="logout" size={18} />}>
            Çıkış yap
          </GlassSidebar.Item>
        ) : null}
      </GlassSidebar.Footer>
    </GlassSidebar>
  )
}
