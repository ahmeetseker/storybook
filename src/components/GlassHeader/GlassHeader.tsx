// GlassHeader v2 — dört farklı anatomili premium site header'ı:
// islands (üç ada) · command (arama omurgası) · masthead (kadastral) · overlay (galeri eşiği).
// Cam bir malzeme ekseni DEĞİL: her varyantta tek küçük liquid-glass state göstergesi
// (seçili öğenin kayan pill/çizgi/boncuğu). Yüzeyler flat/saydam; scroll durumu
// data-scrolled attribute'uyla CSS'e devredilir (JS ölçüm yapmaz).
import { useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassDrawer } from '../GlassDrawer'
import { GlassIconButton } from '../GlassIconButton'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassHeader.module.css'

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export interface GlassHeaderLink {
  label: string
  onClick?: () => void
  href?: string
  /** Aktif sayfa linki — aria-current="page" + kayan cam gösterge */
  active?: boolean
}

export interface GlassHeaderProps {
  /** Wordmark — harf-kutusu logo kalıbı yerine marka yazısı/monogram verilir */
  logo: ReactNode
  links?: GlassHeaderLink[]
  /** Tek birincil CTA (örn. "İlan Ver") — ikili buton kalıbı bilinçli yok */
  action?: ReactNode
  /** İkincil sade metin aksiyonu (örn. "Giriş Yap") — link görünümünde stillenir */
  secondaryAction?: ReactNode
  /** masthead: wordmark karşısındaki otorite satırı (örn. "81 il · EİDS doğrulamalı") */
  meta?: ReactNode
  /** command: arama rayı slotu */
  search?: ReactNode
  /** command: scroll'da kapanmış özet içeriği (örn. "Urla · İmarlı · ≤3M") */
  searchSummary?: ReactNode
  variant?: 'islands' | 'command' | 'masthead' | 'overlay'
  /** islands/command: kök sticky · masthead: yalnız indeks rayı sticky · overlay: kompakt ray */
  sticky?: boolean
  tone?: 'light' | 'dark' | 'auto'
  /** Mobil menü başlığı ve hamburger'ın accessible name'i */
  menuLabel?: string
}

/** Scroll eşiği geçildi mi — görsel geçişler CSS'te, JS yalnız attribute değiştirir. */
function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

type Indicator = 'pill' | 'line' | 'bead'

function NavLinks({
  links,
  glassId,
  indicator,
}: {
  links: GlassHeaderLink[]
  glassId: string
  indicator: Indicator
}) {
  const reduced = prefersReducedMotion()
  const indicatorClass =
    indicator === 'pill' ? styles.glassPill : indicator === 'line' ? styles.glassLine : styles.glassBead

  const linkClick = (link: GlassHeaderLink) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href) e.preventDefault()
    link.onClick?.()
  }

  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.label} className={styles.linkItem}>
          <a
            href={link.href ?? '#'}
            onClick={linkClick(link)}
            aria-current={link.active ? 'page' : undefined}
            className={link.active ? `${styles.link} ${styles.linkActive}` : styles.link}
          >
            {link.active ? (
              <motion.span
                layoutId={glassId}
                data-nav-glass
                className={indicatorClass}
                transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
                aria-hidden
              />
            ) : null}
            <span className={styles.linkLabel}>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function GlassHeader({
  logo,
  links = [],
  action,
  secondaryAction,
  meta,
  search,
  searchSummary,
  variant = 'islands',
  sticky = true,
  menuLabel = 'Menü',
}: GlassHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const glassId = useId()
  const hasLinks = links.length > 0

  const burger = hasLinks ? (
    <span className={styles.burger}>
      <GlassIconButton label={menuLabel} onClick={() => setMenuOpen(true)}>
        <MenuIcon />
      </GlassIconButton>
    </span>
  ) : null

  const actionsArea = (
    <span className={styles.actions}>
      {secondaryAction ? <span className={styles.secondary}>{secondaryAction}</span> : null}
      {action}
      {burger}
    </span>
  )

  const nav = (indicator: Indicator, extraClass?: string) =>
    hasLinks ? (
      <nav aria-label="Site" className={[styles.nav, extraClass].filter(Boolean).join(' ')}>
        <NavLinks links={links} glassId={glassId} indicator={indicator} />
      </nav>
    ) : null

  const drawer = hasLinks ? (
    <GlassDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title={menuLabel} side="right" size="sm">
      <ul className={styles.drawerList}>
        {links.map((link) => {
          const className = link.active ? `${styles.drawerLink} ${styles.drawerLinkActive}` : styles.drawerLink
          const close = () => {
            link.onClick?.()
            setMenuOpen(false)
          }
          return (
            <li key={link.label}>
              {link.href ? (
                <a href={link.href} className={className} aria-current={link.active ? 'page' : undefined} onClick={close}>
                  {link.label}
                </a>
              ) : (
                <button
                  type="button"
                  className={className}
                  aria-current={link.active ? 'page' : undefined}
                  onClick={close}
                >
                  {link.label}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </GlassDrawer>
  ) : null

  if (variant === 'command') {
    return (
      <header
        className={[styles.root, styles.command, sticky ? styles.sticky : ''].filter(Boolean).join(' ')}
        data-variant="command"
        data-scrolled={scrolled || undefined}
      >
        <div className={styles.commandInner}>
          <span className={styles.wordmark}>{logo}</span>
          <div className={styles.searchZone}>
            <div className={styles.searchRail}>{search}</div>
            {searchSummary ? (
              <div className={styles.searchSummary} aria-hidden>
                {searchSummary}
              </div>
            ) : null}
          </div>
          {actionsArea}
        </div>
        {drawer}
      </header>
    )
  }

  if (variant === 'masthead') {
    return (
      <header className={styles.masthead} data-variant="masthead" data-scrolled={scrolled || undefined}>
        <div className={styles.mastheadIdentity}>
          <span className={styles.mastheadWordmark}>{logo}</span>
          {meta ? <span className={styles.mastheadMeta}>{meta}</span> : null}
        </div>
        <div className={[styles.mastheadIndex, sticky ? styles.stickyRow : ''].filter(Boolean).join(' ')}>
          <div className={styles.mastheadIndexInner}>
            {nav('line')}
            {actionsArea}
          </div>
        </div>
        {drawer}
      </header>
    )
  }

  if (variant === 'overlay') {
    return (
      <>
        <header className={`${styles.root} ${styles.overlay}`} data-variant="overlay">
          <div className={styles.overlayInner}>
            <span className={`${styles.wordmark} ${styles.onMedia}`}>{logo}</span>
            {nav('bead', styles.overlayNav)}
            {actionsArea}
          </div>
          {drawer}
        </header>
        {sticky ? (
          // Scroll eşiği geçilince yukarıdan süzülen kompakt bağlam rayı.
          // Linkler tekrarlanmaz (layoutId çakışması + tekrar eden landmark) —
          // ray yalnız kimlik + CTA taşır; menü overlay'deki hamburger'dadır.
          <div
            className={styles.overlayRay}
            data-scrolled={scrolled || undefined}
            inert={scrolled ? undefined : true}
          >
            <span className={styles.wordmark}>{logo}</span>
            <span className={styles.grow} aria-hidden />
            {action}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <header
      className={[styles.root, styles.islands, sticky ? styles.sticky : ''].filter(Boolean).join(' ')}
      data-variant="islands"
      data-scrolled={scrolled || undefined}
    >
      <div className={styles.islandsInner}>
        <span className={styles.wordmark}>{logo}</span>
        {nav('pill', styles.navCapsule) ?? <span className={styles.grow} aria-hidden />}
        {actionsArea}
      </div>
      {drawer}
    </header>
  )
}
