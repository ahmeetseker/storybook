// GlassSiteHeader — tepede görünmez ray, scroll'da yüzen cam kapsüle morflanan
// site header'ı. Kaynak: Tailark hero-section-1'in HeroHeader'ı; Liquid Glass
// uyarlaması (bkz. rules.md §1). Cam tek yüzeyde ve yalnız condensed/açık
// durumda; genişlik/radius değişimi motion layout (FLIP) ile transform'a çevrilir.
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, GlassTierProvider, type GlassSurfaceProps } from '../GlassSurface'
import { GlassIconButton } from '../GlassIconButton'
import { prefersReducedMotion, prefersReducedTransparency } from '../../core/tier'
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
 * Scroll eşiği geçildi mi — görsel geçişler CSS'te, JS yalnız attribute
 * değiştirir. Listener passive; her karede ölçüm yapılmaz.
 */
function useScrolled(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
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

/**
 * Malzemenin tam kalınlıktaki backdrop blur'u, px.
 * `GlassSurface`'in fallback dalındaki `2 + thickness * 10` formülünün
 * `thickness={0.9}` karşılığı — blur'u burada animasyona soktuğumuz için
 * değeri açıkça yazıyoruz (bkz. rules.md §7).
 */
const MATERIAL_BLUR = 11

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export function GlassSiteHeader({
  logo,
  links = [],
  utility,
  secondaryAction,
  action,
  condensedAction,
  menuLabel = 'Menü',
  scrollThreshold = 24,
}: GlassSiteHeaderProps) {
  const glassId = useId()
  const reduced = prefersReducedMotion()
  const scrolled = useScrolled(scrollThreshold)
  const hasLinks = links.length > 0
  const morphTransition = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, ...presets.springs.sidebar }
  // Saydamlığı azalt tercihinde cam örtücüye döner: blur kalkar, ton opaklaşır
  // (ton tarafı CSS'te, aynı adlı media query'de).
  const materialBlur = prefersReducedTransparency() ? 0 : MATERIAL_BLUR

  const [menuOpen, setMenuOpen] = useState(false)
  const capsuleRef = useRef<HTMLDivElement>(null)
  const burgerId = `${glassId}-burger`
  const panelId = `${glassId}-panel`

  // Escape kapatır ve focus hamburger'a döner; kapsül dışına pointerdown kapatır.
  // Focus trap YOK — panel modal değil, sayfa akışının parçası (rules.md §2).
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      document.getElementById(burgerId)?.focus()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (capsuleRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [menuOpen, burgerId])

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

  const burger = hasLinks ? (
    <span className={styles.burger}>
      <GlassIconButton
        id={burgerId}
        label={menuLabel}
        aria-expanded={menuOpen}
        aria-controls={panelId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MenuIcon />
      </GlassIconButton>
    </span>
  ) : null

  const panel =
    hasLinks && menuOpen ? (
      <motion.div
        id={panelId}
        layout
        transition={morphTransition}
        className={styles.panel}
      >
        <nav aria-label={menuLabel}>
          <ul className={styles.panelList}>
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href ?? '#'}
                  aria-current={link.active ? 'page' : undefined}
                  className={link.active ? `${styles.panelLink} ${styles.panelLinkActive}` : styles.panelLink}
                  onClick={(e) => {
                    linkClick(link)(e)
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.panelActions}>
          {utility}
          {secondaryAction}
          {action}
        </div>
      </motion.div>
    ) : null

  return (
    <header
      className={styles.root}
      data-scrolled={scrolled || undefined}
      data-menu-open={menuOpen || undefined}
    >
      <motion.div ref={capsuleRef} layout transition={morphTransition} className={styles.capsule}>
        {/* Malzeme bilinçli olarak fallback tier'da: refraction dalı bir mercek
            etkisidir (SVG blur'u yalnız `0.4 + thickness * 1.2` px) ve altından
            geçen metni net bırakır. Kapsül geniş bir gezinme rayı — alan eşiği
            (160.000px²) onu kısa olduğu için "küçük yüzey" sayıyor ama görevi
            büyük yüzey görevi. Fallback dalı gerçek gaussian blur verir
            (`2 + thickness * 10` px). bkz. rules.md §7. */}
        <GlassTierProvider tier="fallback">
          <GlassSurface
            as={motion.div}
            aria-hidden
            material="glass"
            thickness={0.9}
            shape={20}
            className={styles.material}
            // backdrop-filter'ı GlassSurface'in sabit değeri yerine kendimiz
            // veriyoruz: `style` surfaceStyle'a EN SON yayıldığı için kazanır.
            // Değişmeyen bir string yazıp blur'u CSS değişkeninden okuyoruz —
            // böylece React her yeniden render'da aynı değeri yazar ve
            // motion'ın her karede güncellediği değişkenle çakışmaz.
            style={{
              backdropFilter: 'blur(calc(var(--hdr-blur, 0) * 1px)) saturate(180%)',
              WebkitBackdropFilter: 'blur(calc(var(--hdr-blur, 0) * 1px)) saturate(180%)',
            }}
            // Apple "materialize, don't just fade": cam yüzey solarak değil,
            // blur + ölçek + opacity BİRLİKTE gelerek belirir — malzeme
            // kalınlaşarak yerine oturur. Üçü de kapsülle aynı spring'te.
            // visibility artık sabit gecikmeli CSS transition'ıyla değil
            // `transitionEnd` ile kapanıyor: hızlı geri kaydırmada spring
            // yeniden hedeflenirken yüzey yarı görünürken kaybolmaz
            // (Apple §3 — kesilebilirlik).
            // GlassSurfaceProps motion prop'larını tanımaz; cast projede
            // yerleşik desen (bkz. GlassIconButton).
            {...({
              initial: false,
              animate:
                scrolled || menuOpen
                  ? { opacity: 1, scale: 1, '--hdr-blur': materialBlur, visibility: 'visible' }
                  : {
                      opacity: 0,
                      scale: 0.98,
                      '--hdr-blur': 0,
                      transitionEnd: { visibility: 'hidden' },
                    },
              transition: morphTransition,
            } as unknown as GlassSurfaceProps)}
          />
        </GlassTierProvider>
        {/* Kapsülün içi düz katman — cam üstüne cam yok. */}
        <GlassTierProvider tier="fallback">
          <motion.div layout="position" transition={morphTransition} className={styles.row}>
            <span className={styles.wordmark}>{logo}</span>
            {nav}
            <span className={styles.actions}>
              {condensedAction && scrolled ? (
                condensedAction
              ) : (
                <>
                  {utility}
                  {secondaryAction}
                  {action}
                </>
              )}
            </span>
            {burger}
          </motion.div>
          {/* AnimatePresence yok: panelin exit varyantı yok, kapanışta kapsülün
              `layout`'u yükseklik farkını zaten FLIP ile sürüyor. */}
          {panel}
        </GlassTierProvider>
      </motion.div>
    </header>
  )
}
