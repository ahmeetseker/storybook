import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './GlassSkeleton.module.css'

export interface GlassSkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'text' | 'circle' | 'rect'
  width?: number | string
  height?: number | string
  /** Yalnız variant="text": çok satır; son satır %60 genişlikte biter */
  lines?: number
  /** Shimmer animasyonu (default true); prefers-reduced-motion'da otomatik statik */
  animate?: boolean
}

export function GlassSkeleton({
  variant = 'text',
  width,
  height,
  lines,
  animate = true,
  className,
  style,
  ...rest
}: GlassSkeletonProps) {
  const barClasses = (extra?: string) =>
    [styles.skeleton, styles[variant], animate ? styles.animate : '', extra].filter(Boolean).join(' ')

  // Çok satırlı metin iskeleti: son satır %60 — gerçek paragraf ritmini taklit eder
  if (variant === 'text' && lines !== undefined && lines > 1) {
    return (
      <span className={[styles.group, className].filter(Boolean).join(' ')} style={{ width, ...style }} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={barClasses()}
            style={{ height, width: i === lines - 1 ? '60%' : '100%' } as CSSProperties}
          />
        ))}
      </span>
    )
  }

  return <span className={barClasses(className)} style={{ width, height, ...style }} aria-hidden="true" {...rest} />
}
