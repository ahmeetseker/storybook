import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassButton.module.css'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tint?: string
  prominent?: boolean
  tone?: 'light' | 'dark' | 'auto'
  /** Async işlem sürerken: tekrar aktivasyon engellenir, genişlik korunur, aria-busy verilir */
  loading?: boolean
}

export function GlassButton({
  size = 'md',
  tint,
  prominent = false,
  tone = 'auto',
  loading = false,
  className,
  style,
  children,
  disabled,
  type = 'button',
  onClick,
  ...rest
}: GlassButtonProps) {
  const press = useGlassPress({ disabled: disabled || loading })

  const classes = [
    styles.button,
    styles[size],
    tint && !prominent ? styles.tinted : '',
    prominent ? styles.prominent : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}

  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive
      tone={tone}
      thickness={0.35}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, color: prominent ? 'var(--lg-accent-contrast)' : undefined, scale: press.transformScale, ...style } as CSSProperties}
      {...press.handlers}
      {...({
        disabled,
        type,
        onClick: loading || disabled ? undefined : onClick,
        'aria-busy': loading || undefined,
        'data-loading': loading || undefined,
        ...rest,
      } as unknown as GlassSurfaceProps)}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      <span className={styles.label}>{children}</span>
    </GlassSurface>
  )
}
