import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './GlassProgress.module.css'

export interface GlassProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** null/undefined → indeterminate (süresi bilinmeyen işlem) */
  value?: number | null
  max?: number
  variant?: 'bar' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  /** Dolgu vurgu rengi; verilmezse `--lg-accent` */
  tint?: string
  /** Erişilebilir ad (`aria-label`) — görünür etiket yoksa mutlaka ver */
  label?: string
  /** Determinate'ta % metni gösterir; indeterminate'ta yok sayılır */
  showValue?: boolean
}

// SVG viewBox sabit 48 birim; ekran boyutu width/height ile ölçeklenir
const CIRCLE_PX = { sm: 28, md: 40, lg: 56 } as const
const R = 21
const CIRCUMFERENCE = 2 * Math.PI * R

export function GlassProgress({
  value,
  max = 100,
  variant = 'bar',
  size = 'md',
  tint,
  label,
  showValue = false,
  className,
  style,
  ...rest
}: GlassProgressProps) {
  const indeterminate = value === null || value === undefined
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max)
  const pct = indeterminate || max <= 0 ? 0 : (clamped / max) * 100

  const classes = [styles.root, styles[variant], styles[size], className].filter(Boolean).join(' ')
  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}
  const valueText = `${Math.round(pct)}%`

  return (
    <div
      {...rest}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      // indeterminate'ta aria-valuenow verilmez (WAI-ARIA progressbar sözleşmesi)
      aria-valuenow={indeterminate ? undefined : clamped}
      data-indeterminate={indeterminate || undefined}
      className={classes}
      style={{ ...cssVars, ...style }}
    >
      {variant === 'bar' ? (
        <>
          <span className={styles.track}>
            <span className={styles.fill} style={indeterminate ? undefined : { transform: `scaleX(${pct / 100})` }} />
          </span>
          {showValue && !indeterminate ? (
            <span className={styles.value} aria-hidden>
              {valueText}
            </span>
          ) : null}
        </>
      ) : (
        <span className={styles.circleBox}>
          <svg
            className={styles.svg}
            viewBox="0 0 48 48"
            width={CIRCLE_PX[size]}
            height={CIRCLE_PX[size]}
            aria-hidden
          >
            <circle className={styles.circleTrack} cx="24" cy="24" r={R} />
            <circle
              className={styles.circleFill}
              cx="24"
              cy="24"
              r={R}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={indeterminate ? CIRCUMFERENCE * 0.75 : CIRCUMFERENCE * (1 - pct / 100)}
            />
          </svg>
          {showValue && !indeterminate ? (
            <span className={styles.circleValue} aria-hidden>
              {valueText}
            </span>
          ) : null}
        </span>
      )}
    </div>
  )
}
