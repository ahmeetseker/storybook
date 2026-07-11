import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { motion, useMotionTemplate } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassButton.module.css'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tint?: string
  prominent?: boolean
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassButton({
  size = 'md',
  tint,
  prominent = false,
  tone = 'auto',
  className,
  style,
  children,
  disabled,
  ...rest
}: GlassButtonProps) {
  const press = useGlassPress({ disabled })
  const glow = useMotionTemplate`radial-gradient(120px circle at ${press.glowX}px ${press.glowY}px, rgba(255,255,255,0.55), transparent 70%)`

  const classes = [
    styles.button,
    styles[size],
    tint && !prominent ? styles.tinted : '',
    prominent ? styles.prominent : '',
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
      style={{ ...cssVars, scale: press.transformScale, ...style } as CSSProperties}
      disabled={disabled}
      {...press.handlers}
      {...(rest as unknown as GlassSurfaceProps)}
    >
      {children}
      <motion.span className={styles.glow} style={{ background: glow, opacity: press.glowOpacity }} aria-hidden />
    </GlassSurface>
  )
}
