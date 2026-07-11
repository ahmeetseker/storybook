import { GlassButton } from '../GlassButton'
import styles from './GlassNavbar.module.css'

export interface GlassBackButtonProps {
  onClick: () => void
  label?: string
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassBackButton({ onClick, label, tone = 'auto' }: GlassBackButtonProps) {
  return (
    <GlassButton size="sm" tone={tone} onClick={onClick} aria-label={label ?? 'Geri'}>
      <span className={styles.chevron} aria-hidden />
      {label}
    </GlassButton>
  )
}
