import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassEmptyState.module.css'

export interface GlassEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Dekoratif ikon; ikon zemini variant'a göre renklenir */
  icon?: ReactNode
  title: string
  description?: string
  /** Aksiyon slot'u — çağıran GlassButton verir */
  action?: ReactNode
  /**
   * 'error': ikon zemini danger tonu. Bilinçli olarak role="alert" YOK —
   * bu panel statik içeriktir, canlı bölge değildir.
   */
  variant?: 'empty' | 'error'
  size?: 'sm' | 'md'
}

export function GlassEmptyState({
  icon,
  title,
  description,
  action,
  variant = 'empty',
  size = 'md',
  className,
  ...rest
}: GlassEmptyStateProps) {
  const classes = [styles.root, styles[size], variant === 'error' ? styles.error : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} data-variant={variant} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
