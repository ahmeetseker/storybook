import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { GlassCommandPalette, GlassDrawer } from '@repo/ui'

import { NavigationIcon } from '@/components/NavigationIcon'
import { stripBase, withBase } from '@/config/base-path'
import type { AppRouteHref } from '@/config/routes'
import { AccountNav } from './components/AccountNav'
import {
  accountSectionFillsViewport,
  accountSectionTitle,
} from './domain/account-navigation'
import type { AccountDashboardData } from './domain/account-types'

import styles from './AccountAppShell.module.css'

export interface AccountAppShellProps {
  /** Ray rozetlerini ve kimlik satırını besleyen hesap verisi */
  data: AccountDashboardData
  /** Alt rota içeriği (her sayfa kendi `main`'ini üretir) */
  children: ReactNode
  /**
   * Oturumu kapatır. Oturum bilgisi rota katmanındadır; kabuk yalnız
   * "Çıkış yap" öğesini ve komut paleti komutunu bağlar.
   */
  onCikis?: () => void
}

/** Üst şerit: ray daraltma, konum izi ve çalışma alanı araçları. */
function AccountTopbar({
  collapsed,
  currentTitle,
  onToggleRail,
  onOpenMenu,
  onOpenPalette,
}: {
  collapsed: boolean
  currentTitle: string
  onToggleRail: () => void
  onOpenMenu: () => void
  onOpenPalette: () => void
}) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
        title={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
        aria-pressed={collapsed}
        onClick={onToggleRail}
        data-part="rail-toggle"
      >
        <NavigationIcon name="panel" size={18} />
      </button>

      <button
        type="button"
        className={`${styles.iconButton} ${styles.menuButton}`}
        aria-label="Hesap menüsünü aç"
        title="Hesap menüsü"
        onClick={onOpenMenu}
      >
        <NavigationIcon name="menu" size={18} />
      </button>

      <nav className={styles.crumbs} aria-label="Konum">
        <span className={styles.crumbMuted}>Hesabım</span>
        <span className={styles.crumbSep} aria-hidden>
          /
        </span>
        <span className={styles.crumbCurrent}>{currentTitle}</span>
      </nav>

      <button
        type="button"
        className={styles.searchButton}
        onClick={onOpenPalette}
        aria-label="Ara — komut paleti"
      >
        <NavigationIcon name="search" size={16} />
        <span className={styles.searchLabel} aria-hidden>
          İlan, mesaj veya işlem ara
        </span>
        <kbd className={styles.kbd} aria-hidden>
          ⌘K
        </kbd>
      </button>
    </header>
  )
}

/**
 * Hesap bölümünün kalıcı kabuğu.
 *
 * `/hesabim` altındaki TÜM sayfalar bu kabuğun içinde yaşar: rota değişse de
 * ray ve üst şerit yerinde kalır, yalnız içerik alanı değişir. Pazar yeri
 * kabuğu (site header + dock) bu bölümde gizlidir — iki gezinme katmanı üst
 * üste binmez.
 */
export function AccountAppShell({ data, children, onCikis }: AccountAppShellProps) {
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const routeTo = useCallback(
    (to: AppRouteHref | string) => {
      void router.navigate({ to: stripBase(withBase(to)) as AppRouteHref })
    },
    [router],
  )

  // ⌘K / Ctrl+K — üst şeritteki arama düğmesinin klavye karşılığı
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Rota değişince çekmece kapanır; ray ve üst şerit yerinde kalır
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Çalışma masası ekranları (mesajlaşma) kalan yüksekliği kaplar: sayfa
  // kaydırmaz, kaydırma panellerin kendi içindedir.
  const fillsViewport = accountSectionFillsViewport(stripBase(pathname))

  return (
    <div
      className={styles.app}
      data-collapsed={collapsed || undefined}
      data-account-shell={fillsViewport ? 'fill' : undefined}
    >
      <div className={styles.rail}>
        <AccountNav
          data={data}
          collapsed={collapsed}
          className={styles.railNav}
          onCikis={onCikis}
        />
      </div>

      <div className={styles.column}>
        <AccountTopbar
          collapsed={collapsed}
          currentTitle={accountSectionTitle(stripBase(pathname))}
          onToggleRail={() => setCollapsed((value) => !value)}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <div className={styles.content}>{children}</div>
      </div>

      <GlassDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        size="sm"
        title="Hesabım"
      >
        <AccountNav
          data={data}
          className={styles.drawerNav}
          onNavigate={() => setMenuOpen(false)}
          onCikis={onCikis}
        />
      </GlassDrawer>

      <GlassCommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        placeholder="İlan, mesaj veya işlem ara…"
        commands={[
          { id: 'yeni-ilan', label: 'Yeni ilan ver', group: 'Hızlı işlem', onSelect: () => routeTo('/ilan-ver') },
          { id: 'ai', label: 'AI danışmana sor', group: 'Hızlı işlem', onSelect: () => routeTo('/ai-danisman') },
          { id: 'ara', label: 'Emlak ara', group: 'Hızlı işlem', onSelect: () => routeTo('/emlak') },
          { id: 'g-ozet', label: 'Hesap özetine git', group: 'Git', onSelect: () => routeTo('/hesabim') },
          { id: 'g-ilanlar', label: 'İlanlarıma git', group: 'Git', onSelect: () => routeTo('/hesabim/ilanlarim') },
          { id: 'g-mesaj', label: 'Mesajlara git', group: 'Git', onSelect: () => routeTo('/hesabim/mesajlar') },
          { id: 'g-randevu', label: 'Randevularıma git', group: 'Git', onSelect: () => routeTo('/hesabim/randevularim') },
          { id: 'g-guvenlik', label: 'Güvenlik ayarlarına git', group: 'Git', onSelect: () => routeTo('/hesabim/guvenlik') },
          { id: 'g-hareket', label: 'Hesap hareketlerine git', group: 'Git', onSelect: () => routeTo('/hesabim/hareketler') },
          { id: 'g-alarm', label: 'Kayıtlı aramaya git', group: 'Git', onSelect: () => routeTo('/hesabim/kayitli-arama') },
          { id: 'g-favori', label: 'Favorilere git', group: 'Git', onSelect: () => routeTo('/favoriler') },
          ...(onCikis
            ? [{ id: 'cikis', label: 'Çıkış yap', group: 'Hesap', onSelect: onCikis }]
            : []),
        ]}
      />
    </div>
  )
}
