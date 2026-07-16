// İçerik katmanı hero'su — zemin flat; cam yalnız slot'lara konan kontrollerde.
// Dört yerleşim varyantı: search (marketplace), split (SaaS), showcase (medya), centered (CTA).
import type { ElementType, ReactNode } from 'react'
import styles from './GlassHero.module.css'

export interface GlassHeroProps {
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
  variant?: 'search' | 'split' | 'showcase' | 'centered'
  /** Default: search/centered → center, split/showcase → start */
  align?: 'center' | 'start'
  /** Heading seviyesini sayfa belirler */
  titleAs?: 'h1' | 'h2' | 'div'
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassHero({
  title,
  subtitle,
  actions,
  media,
  search,
  quickLinks,
  variant = 'search',
  align,
  titleAs = 'h2',
}: GlassHeroProps) {
  const Title = titleAs as ElementType
  const resolvedAlign = align ?? (variant === 'search' || variant === 'centered' ? 'center' : 'start')
  const centerClass = resolvedAlign === 'center' ? styles.alignCenter : ''

  const textBlock = (
    <>
      <Title className={styles.title}>{title}</Title>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {variant === 'search' && search ? <div className={styles.searchSlot}>{search}</div> : null}
      {actions ? <div className={styles.actionsRow}>{actions}</div> : null}
      {variant === 'search' && quickLinks ? <div className={styles.quickLinks}>{quickLinks}</div> : null}
    </>
  )

  if (variant === 'showcase') {
    return (
      <section className={`${styles.root} ${styles.showcase}`} data-variant={variant}>
        <div className={styles.showcaseMedia} aria-hidden>
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
        <div className={`${styles.inner} ${styles.splitGrid}`}>
          <div className={`${styles.splitText} ${centerClass}`}>{textBlock}</div>
          {media ? <div className={styles.media}>{media}</div> : null}
        </div>
      </section>
    )
  }

  return (
    <section className={styles.root} data-variant={variant}>
      <div className={`${styles.inner} ${centerClass}`}>{textBlock}</div>
    </section>
  )
}
