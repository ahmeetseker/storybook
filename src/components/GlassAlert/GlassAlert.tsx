import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassAlert.module.css'

export type GlassAlertSeverity = 'info' | 'success' | 'warning' | 'danger'

export interface GlassAlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantik ton: accent/success/warning/danger token'larına eşlenir */
  severity?: GlassAlertSeverity
  /** Kalın başlık satırı */
  title?: string
  /** Gövde metni */
  children: ReactNode
  /** Severity ikonunun yerine geçer */
  icon?: ReactNode
  /** Verilirse sağda × kapatma butonu görünür (aria-label="Kapat") */
  onDismiss?: () => void
  /** Aksiyon alanı — mobilde alt satıra sarar, ≥sm satır içinde sağda */
  action?: ReactNode
}

const iconProps = {
  viewBox: '0 0 20 20',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  'aria-hidden': true,
} as const

const defaultIcons: Record<GlassAlertSeverity, ReactNode> = {
  info: (
    <svg {...iconProps}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9.2v4.6" strokeLinecap="round" />
      <circle cx="10" cy="6.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  success: (
    <svg {...iconProps}>
      <circle cx="10" cy="10" r="8" />
      <path d="m6.4 10.3 2.4 2.4 4.8-5.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg {...iconProps}>
      <path d="M10 3.2 17.6 16.4H2.4Z" strokeLinejoin="round" />
      <path d="M10 8.4v3.2" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  danger: (
    <svg {...iconProps}>
      <circle cx="10" cy="10" r="8" />
      <path d="m7.2 7.2 5.6 5.6M12.8 7.2l-5.6 5.6" strokeLinecap="round" />
    </svg>
  ),
}

export function GlassAlert({
  severity = 'info',
  title,
  children,
  icon,
  onDismiss,
  action,
  className,
  ...rest
}: GlassAlertProps) {
  // danger/warning kullanıcının hemen bilmesi gereken sorunlardır → assertive "alert".
  // info/success akışı kesmemesi gereken bilgilendirmedir → polite "status" (bkz. rules.md).
  const role = severity === 'danger' || severity === 'warning' ? 'alert' : 'status'

  return (
    <div role={role} className={[styles.alert, styles[severity], className].filter(Boolean).join(' ')} {...rest}>
      <span className={styles.icon} aria-hidden>
        {icon ?? defaultIcons[severity]}
      </span>
      <div className={styles.content}>
        {title ? <strong className={styles.title}>{title}</strong> : null}
        <div className={styles.message}>{children}</div>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label="Kapat" onClick={onDismiss}>
          <svg viewBox="0 0 20 20" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
