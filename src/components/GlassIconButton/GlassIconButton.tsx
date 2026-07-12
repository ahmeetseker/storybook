import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { motion, useMotionTemplate } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassIconButton.module.css'

export interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Erişilebilirlik etiketi — ikon tek başına anlam taşımaz */
  label: string
  /** Aç/kapa durumu (ör. favori); boolean verilirse aria-pressed olarak yansır */
  active?: boolean
  /** Aktif durumda uygulanan vurgu rengi */
  tint?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassIconButton({
  label,
  active,
  tint,
  size = 'md',
  tone = 'auto',
  className,
  style,
  children,
  disabled,
  ...rest
}: GlassIconButtonProps) {
  const press = useGlassPress({ disabled })
  const glow = useMotionTemplate`radial-gradient(80px circle at ${press.glowX}px ${press.glowY}px, rgba(255,255,255,0.55), transparent 70%)`

  const classes = [styles.button, styles[size], active && tint ? styles.active : '', className]
    .filter(Boolean)
    .join(' ')

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}

  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive
      tone={tone}
      thickness={0.3}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, scale: press.transformScale, ...style } as CSSProperties}
      aria-label={label}
      aria-pressed={typeof active === 'boolean' ? active : undefined}
      title={label}
      {...press.handlers}
      {...({ disabled, ...rest } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.icon} aria-hidden>
        {children}
      </span>
      <motion.span className={styles.glow} style={{ background: glow, opacity: press.glowOpacity }} aria-hidden />
    </GlassSurface>
  )
}
