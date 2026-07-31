// GlassSiteHeader — tepede görünmez ray, scroll'da yüzen cam kapsüle morflanan
// site header'ı. Kaynak: Tailark hero-section-1'in HeroHeader'ı; Liquid Glass
// uyarlaması (bkz. rules.md §1). Cam tek yüzeyde ve yalnız condensed/açık
// durumda; genişlik/radius değişimi motion layout (FLIP) ile transform'a çevrilir.
import { useId, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, GlassTierProvider } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSiteHeader.module.css'

/** Header'ın yatay link satırındaki tek gezinme öğesi. */
export interface GlassSiteHeaderLink {
  label: string
  /** Gerçek gezinme hedefi — SSR ve orta-tık için her zaman verilmesi önerilir */
  href?: string
  /** Verilirse sade sol tık engellenip bu çağrılır (SPA gezinmesi) */
  onClick?: () => void
  /** Aktif sayfa — aria-current="page" + kayan cam gösterge */
  active?: boolean
}

export interface GlassSiteHeaderProps {
  /** Wordmark/monogram slotu — harf-kutusu logo kalıbı kullanılmaz */
  logo: ReactNode
  links?: GlassSiteHeaderLink[]
  /** Aksiyonların solundaki küçük yardımcı slot (örn. tema butonu) */
  utility?: ReactNode
  /** İkincil aksiyon (örn. "Üye girişi") */
  secondaryAction?: ReactNode
  /** Birincil CTA (örn. "İlan ver") */
  action?: ReactNode
  /** Verilirse condensed durumda utility/secondaryAction/action üçlüsünün yerine geçer */
  condensedAction?: ReactNode
  /** Hamburger'ın accessible name'i ve panel etiketi */
  menuLabel?: string
  /** Kapsülün morflandığı scroll eşiği, px */
  scrollThreshold?: number
}

/**
 * Sade sol tıkta SPA gezinmesine devret; modifier'lı ve orta tıkta tarayıcıya
 * bırak (yeni sekme davranışı korunur).
 */
function linkClick(link: GlassSiteHeaderLink) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.onClick) return
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    link.onClick()
  }
}

// `menuLabel`, `condensedAction` ve `scrollThreshold` prop'ları arayüzde tanımlı
// ama bu task'ta henüz destructure EDİLMEZ — Task 2 ve 3'te bağlanacaklar.
// Kullanılmayan değişken lint uyarısı böylece hiç doğmaz.
export function GlassSiteHeader({
  logo,
  links = [],
  utility,
  secondaryAction,
  action,
}: GlassSiteHeaderProps) {
  const glassId = useId()
  const reduced = prefersReducedMotion()
  const hasLinks = links.length > 0

  const nav = hasLinks ? (
    <nav aria-label="Site" className={styles.nav}>
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
                  className={styles.glassPill}
                  transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
                  aria-hidden
                />
              ) : null}
              <span className={styles.linkLabel}>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <span className={styles.grow} aria-hidden />
  )

  return (
    <header className={styles.root}>
      <div className={styles.capsule}>
        <GlassSurface
          aria-hidden
          material="glass"
          thickness={0.4}
          shape={20}
          className={styles.material}
        />
        {/* Kapsülün içi düz katman — cam üstüne cam yok. */}
        <GlassTierProvider tier="fallback">
          <div className={styles.row}>
            <span className={styles.wordmark}>{logo}</span>
            {nav}
            <span className={styles.actions}>
              {utility}
              {secondaryAction}
              {action}
            </span>
          </div>
        </GlassTierProvider>
      </div>
    </header>
  )
}
