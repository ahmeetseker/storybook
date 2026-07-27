// İçerik katmanı hero'su — zemin flat; cam yalnız slot'lara konan kontrollerde.
// Dört yerleşim varyantı: search (marketplace), split (SaaS), showcase (medya), centered (CTA).
// Animasyon: kademeli giriş (stagger, motion) + showcase Ken Burns + opsiyonel ambient
// aurora — hepsi yalnız transform/opacity, prefers-reduced-motion'da kapalı.
import type { ElementType, ReactNode } from 'react'
import { motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassHero.module.css'

export interface GlassHeroProps {
  /** Başlığın üstünde duran küçük slot — sekme şeridi, etiket veya kırıntı yolu */
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  /** CTA butonları — GlassButton'ları çağıran verir */
  actions?: ReactNode
  /** split: yan panel · showcase: arka plan görseli (dekoratif — alt="" ver) */
  media?: ReactNode
  /** Yalnız variant="search": arama kompozisyonu slotu */
  search?: ReactNode
  /** Yalnız variant="search": arama altı hızlı linkler */
  quickLinks?: ReactNode
  /** Metin bloğunun altında tam genişlik vitrin (örn. GlassBento) — girişte son blok olarak belirir */
  bento?: ReactNode
  variant?: 'search' | 'split' | 'showcase' | 'centered'
  /** Default: search/centered → center, split/showcase → start */
  align?: 'center' | 'start'
  /** Heading seviyesini sayfa belirler */
  titleAs?: 'h1' | 'h2' | 'div'
  /** Kademeli giriş (başlık→alt başlık→slotlar) + showcase Ken Burns; reduced-motion'da otomatik kapalı */
  animate?: boolean
  /** Zeminde yavaş süzülen aurora katmanı (showcase hariç; abartısız, düşük opaklık) */
  ambient?: boolean
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 30 } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

export function GlassHero({
  eyebrow,
  title,
  subtitle,
  actions,
  media,
  search,
  quickLinks,
  bento,
  variant = 'search',
  align,
  titleAs = 'h2',
  animate = true,
  ambient = false,
}: GlassHeroProps) {
  const Title = titleAs as ElementType
  const resolvedAlign = align ?? (variant === 'search' || variant === 'centered' ? 'center' : 'start')
  const centerClass = resolvedAlign === 'center' ? styles.alignCenter : ''
  const reduced = prefersReducedMotion()
  const entering = animate && !reduced

  const blocks: ReactNode[] = [
    eyebrow ? (
      <div key="eyebrow" className={styles.eyebrow}>
        {eyebrow}
      </div>
    ) : null,
    <Title key="title" className={styles.title}>
      {title}
    </Title>,
    subtitle ? (
      <p key="subtitle" className={styles.subtitle}>
        {subtitle}
      </p>
    ) : null,
    (variant === 'search' || variant === 'split') && search ? (
      <div key="search" className={styles.searchSlot}>
        {search}
      </div>
    ) : null,
    actions ? (
      <div key="actions" className={styles.actionsRow}>
        {actions}
      </div>
    ) : null,
    variant === 'search' && quickLinks ? (
      <div key="quick" className={styles.quickLinks}>
        {quickLinks}
      </div>
    ) : null,
    bento && variant !== 'showcase' ? (
      <div key="bento" className={styles.bentoSlot} data-hero-bento>
        {bento}
      </div>
    ) : null,
  ].filter(Boolean)

  // Kademeli giriş: her blok kendi motion sarmalayıcısında yükselerek belirir.
  // entering=false iken initial verilmez — animasyonsuz, doğrudan görünür render.
  const textBlock = (
    <motion.div
      className={styles.blockStack}
      variants={stagger}
      initial={entering ? 'hidden' : false}
      animate="show"
    >
      {blocks.map((node, i) => (
        <motion.div key={i} className={styles.block} variants={rise}>
          {node}
        </motion.div>
      ))}
    </motion.div>
  )

  const ambientLayer =
    ambient && variant !== 'showcase' ? (
      <div className={styles.ambient} data-hero-ambient aria-hidden>
        <span className={styles.blobA} />
        <span className={styles.blobB} />
      </div>
    ) : null

  if (variant === 'showcase') {
    return (
      <section className={`${styles.root} ${styles.showcase}`} data-variant={variant}>
        <div
          className={animate ? `${styles.showcaseMedia} ${styles.kenburns}` : styles.showcaseMedia}
          aria-hidden
        >
          {media}
        </div>
        <div className={styles.scrim} data-hero-scrim aria-hidden />
        <div className={`${styles.showcaseContent} ${centerClass}`}>{textBlock}</div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className={styles.root} data-variant={variant}>
        {ambientLayer}
        <div className={`${styles.inner} ${styles.splitGrid}`}>
          <div className={`${styles.splitText} ${centerClass}`}>{textBlock}</div>
          {media ? <div className={styles.media}>{media}</div> : null}
        </div>
      </section>
    )
  }

  return (
    <section className={styles.root} data-variant={variant}>
      {ambientLayer}
      <div className={`${styles.inner} ${centerClass}`}>{textBlock}</div>
    </section>
  )
}
