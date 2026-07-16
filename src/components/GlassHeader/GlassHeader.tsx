// Site seviyesi header — logo, nav linkleri, CTA ve mobil menü (GlassDrawer).
// Default material="flat"; "glass" yalnız kapsayıcıda cam kullanır.
import { useState, type MouseEvent, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassDrawer } from '../GlassDrawer'
import { GlassIconButton } from '../GlassIconButton'
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
  /** Aktif sayfa linki — aria-current="page" */
  active?: boolean
}

export interface GlassHeaderProps {
  /** Marka alanı (metin veya görsel) */
  logo: ReactNode
  links?: GlassHeaderLink[]
  /** Sağ CTA alanı — GlassButton'ları çağıran verir */
  actions?: ReactNode
  /** Yalnız variant="split": üst ince utility satırı içeriği */
  utility?: ReactNode
  /** Yerleşim deseni */
  variant?: 'bar' | 'centered' | 'split' | 'capsule' | 'minimal'
  /** Default flat — site zeminiyle uyumlu; glass yalnız kapsayıcıda cam kullanır */
  material?: 'glass' | 'flat'
  sticky?: boolean
  tone?: 'light' | 'dark' | 'auto'
  /** Mobil menü başlığı ve hamburger'ın accessible name'i */
  menuLabel?: string
}

export function GlassHeader({
  logo,
  links = [],
  actions,
  utility,
  variant = 'bar',
  material = 'flat',
  sticky = true,
  tone = 'auto',
  menuLabel = 'Menü',
}: GlassHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClick = (link: GlassHeaderLink) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href) e.preventDefault()
    link.onClick?.()
  }

  const navList = (extraClass?: string) =>
    links.length > 0 && variant !== 'minimal' ? (
      <nav aria-label="Site" className={[styles.nav, extraClass].filter(Boolean).join(' ')}>
        <ul className={styles.linkList}>
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href ?? '#'}
                onClick={linkClick(link)}
                aria-current={link.active ? 'page' : undefined}
                className={link.active ? `${styles.link} ${styles.linkActive}` : styles.link}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    ) : null

  const actionArea = (
    <span className={styles.actions}>
      {actions}
      {links.length > 0 ? (
        <span className={variant === 'minimal' ? styles.burgerAlways : styles.burger}>
          <GlassIconButton label={menuLabel} onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </GlassIconButton>
        </span>
      ) : null}
    </span>
  )

  const logoEl = <span className={styles.logo}>{logo}</span>

  let content: ReactNode
  if (variant === 'centered') {
    content = (
      <div className={styles.innerColumn}>
        <div className={styles.centeredTop}>
          <span aria-hidden />
          {logoEl}
          {actionArea}
        </div>
        {navList(styles.centeredNav)}
      </div>
    )
  } else if (variant === 'capsule') {
    const capsuleChildren = (
      <>
        {logoEl}
        {navList(styles.grow) ?? <span className={styles.grow} aria-hidden />}
        {actionArea}
      </>
    )
    content =
      material === 'glass' ? (
        <GlassSurface shape="capsule" tone={tone} thickness={0.35} className={styles.capsule}>
          {capsuleChildren}
        </GlassSurface>
      ) : (
        <div className={`${styles.capsule} ${styles.capsuleFlat}`}>{capsuleChildren}</div>
      )
  } else {
    content = (
      <div className={styles.inner}>
        {logoEl}
        {navList(styles.grow) ?? <span className={styles.grow} aria-hidden />}
        {actionArea}
      </div>
    )
  }

  const rootClasses = [
    styles.root,
    sticky ? styles.sticky : '',
    variant === 'capsule' ? styles.capsuleRoot : material === 'glass' ? styles.glassRoot : styles.flatRoot,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={rootClasses} data-variant={variant} data-material={material}>
      {variant === 'split' && utility ? (
        <div className={styles.utility}>
          <div className={styles.utilityInner}>{utility}</div>
        </div>
      ) : null}
      {material === 'glass' && variant !== 'capsule' ? (
        <GlassSurface as="div" shape={0} tone={tone} thickness={0.3}>
          {content}
        </GlassSurface>
      ) : (
        content
      )}
      {links.length > 0 ? (
        <GlassDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title={menuLabel} side="right" size="sm">
          <ul className={styles.drawerList}>
            {links.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  aria-current={link.active ? 'page' : undefined}
                  className={link.active ? `${styles.drawerLink} ${styles.drawerLinkActive}` : styles.drawerLink}
                  onClick={() => {
                    link.onClick?.()
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </GlassDrawer>
      ) : null}
    </header>
  )
}
