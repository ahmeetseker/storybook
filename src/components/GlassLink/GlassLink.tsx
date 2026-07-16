import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import styles from './GlassLink.module.css'

export interface GlassLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * 'inline': gövde metni içinde akan link (alt çizgi + accent).
   * 'standalone': chevron'lu bağımsız satır linki (alt çizgi yok).
   */
  variant?: 'inline' | 'standalone'
  /** Yeni sekmede açılır: target/rel otomatik + ↗ ikonu + sr-only "(yeni sekme)" */
  external?: boolean
  /** href kaldırılır, aria-disabled verilir, etkileşim kapanır */
  disabled?: boolean
}

/**
 * Cam DEĞİL — saf tipografik component. Link metin akışının parçasıdır;
 * cam yüzey (blur/refraction) satır içinde hem okunabilirliği bozar hem de
 * her linki kontrol katmanına taşırdı. Gerekçe: rules.md §1.
 */
export function GlassLink({
  variant = 'inline',
  external = false,
  disabled = false,
  href,
  target,
  rel,
  className,
  children,
  onClick,
  ...rest
}: GlassLinkProps) {
  const classes = [
    styles.link,
    variant === 'standalone' ? styles.standalone : styles.inline,
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const finalTarget = external ? '_blank' : target
  const finalRel = external ? [rel, 'noopener noreferrer'].filter(Boolean).join(' ') : rel

  // pointer-events: none CSS'te var; klavye/programatik aktivasyona karşı JS guard
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <a
      href={disabled ? undefined : href}
      target={disabled ? undefined : finalTarget}
      rel={disabled ? undefined : finalRel}
      aria-disabled={disabled || undefined}
      className={classes}
      onClick={handleClick}
      {...rest}
    >
      {children}
      {external ? (
        <>
          <span className={styles.externalIcon} aria-hidden>
            ↗
          </span>
          <span className={styles.srOnly}> (yeni sekme)</span>
        </>
      ) : null}
      {variant === 'standalone' ? (
        <span className={styles.chevron} aria-hidden>
          ›
        </span>
      ) : null}
    </a>
  )
}
