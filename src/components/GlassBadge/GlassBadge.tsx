import type { CSSProperties, HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassBadge.module.css'

export interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Vurgu rengi; verilmezse nötr cam görünür */
  tint?: string
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassBadge({ tint, size = 'sm', tone = 'auto', className, style, children, ...rest }: GlassBadgeProps) {
  const classes = [styles.badge, styles[size], tint ? styles.tinted : '', className].filter(Boolean).join(' ')
  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}

  return (
    <GlassSurface
      as="span"
      shape="capsule"
      tone={tone}
      thickness={0.15}
      className={classes}
      style={{ ...cssVars, ...style }}
      {...rest}
    >
      {children}
    </GlassSurface>
  )
}
