import type { ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassBackButton } from './GlassBackButton'
import styles from './GlassNavbar.module.css'

export interface GlassNavbarProps {
  title?: ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassNavbar({ title, onBack, backLabel, actions, tone = 'auto' }: GlassNavbarProps) {
  return (
    <nav className={styles.bar}>
      <span className={styles.scrollEdge} aria-hidden />
      {onBack ? <GlassBackButton onClick={onBack} label={backLabel} tone={tone} /> : <span className={styles.spacer} />}
      <span className={styles.title}>{title}</span>
      {actions ? (
        <GlassSurface shape="capsule" tone={tone} thickness={0.35} className={styles.actionGroup} data-glass-action-group>
          {actions}
        </GlassSurface>
      ) : (
        <span className={styles.spacer} />
      )}
    </nav>
  )
}
