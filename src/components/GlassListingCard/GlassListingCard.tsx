import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassListingCard.module.css'

export interface GlassListingCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  image: { src: string; alt?: string }
  title: string
  price: string
  location?: string
  /** Sol üst köşede gösterilen rozet (GlassBadge) */
  badge?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassListingCard({
  image,
  title,
  price,
  location,
  badge,
  tone = 'auto',
  className,
  style,
  disabled,
  ...rest
}: GlassListingCardProps) {
  const press = useGlassPress({ disabled })

  return (
    <GlassSurface
      as={motion.button}
      shape={18}
      interactive
      tone={tone}
      thickness={0.35}
      displacementScale={press.displacementScale}
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{ scale: press.transformScale, ...style } as CSSProperties}
      {...press.handlers}
      {...({ disabled, ...rest } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.media}>
        <img className={styles.image} src={image.src} alt={image.alt ?? ''} />
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {location ? <span className={styles.location}>{location}</span> : null}
        <span className={styles.price}>{price}</span>
      </span>
    </GlassSurface>
  )
}
