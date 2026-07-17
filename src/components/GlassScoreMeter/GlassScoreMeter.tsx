import { useId } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './GlassScoreMeter.module.css'

/** Otomatik eşiğin döndürebileceği semantik ton adları. */
export type GlassScoreMeterTone = 'success' | 'accent' | 'danger'

export interface GlassScoreMeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** 0-100 arası skor; aralık dışı değerler sessizce clamp edilir */
  value: number
  /** Görünür etiket — accessible name kaynağı (aria-labelledby) */
  label: string
  /** Etiketin altında gösterilen kısa açıklama; `badge` varyantında yok sayılır */
  description?: string
  /** Görsel biçim: dolum halkası, yatay ölçek veya kart içi mini gösterge */
  variant?: 'ring' | 'bar' | 'badge'
  /**
   * Otomatik renk eşiğini geçersiz kılar: ≥70 `success`, 40-69 `accent`,
   * <40 `danger`. Verilmezse `value`'dan otomatik hesaplanır.
   */
  tone?: GlassScoreMeterTone
}

// SVG viewBox sabit 96 birim — merkezde büyük tabular sayı için yeterli alan.
const R = 40
const CIRCUMFERENCE = 2 * Math.PI * R

function resolveTone(value: number, tone?: GlassScoreMeterTone): GlassScoreMeterTone {
  if (tone) return tone
  if (value >= 70) return 'success'
  if (value >= 40) return 'accent'
  return 'danger'
}

const TONE_VAR: Record<GlassScoreMeterTone, string> = {
  success: 'var(--lg-success)',
  accent: 'var(--lg-accent)',
  danger: 'var(--lg-danger)',
}

export function GlassScoreMeter({
  value,
  label,
  description,
  variant = 'ring',
  tone,
  className,
  style,
  ...rest
}: GlassScoreMeterProps) {
  const uid = useId()
  const labelId = `${uid}-label`
  const descId = `${uid}-desc`

  // Görünen ve aria-valuenow olarak raporlanan değer aynı tamsayı olmalı —
  // görsel sayı ile duyurulan değer arasında tutarsızlık olmasın.
  // value NaN/Infinity gelirse (örn. dışarıda 0'a bölme) 0'a düşürülür —
  // aksi halde aria-valuenow ve görsel sayı "NaN" olarak sızardı.
  const safeValue = Number.isFinite(value) ? value : 0
  const clamped = Math.round(Math.min(Math.max(safeValue, 0), 100))
  const resolvedTone = resolveTone(clamped, tone)
  const showDescription = Boolean(description) && variant !== 'badge'

  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ')
  const cssVars: CSSProperties = { '--glass-score-tone': TONE_VAR[resolvedTone] } as CSSProperties

  return (
    <div
      {...rest}
      role="meter"
      aria-labelledby={labelId}
      aria-describedby={showDescription ? descId : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      data-tone={resolvedTone}
      className={classes}
      style={{ ...cssVars, ...style }}
    >
      {variant === 'ring' ? (
        <>
          <span className={styles.ringBox}>
            <svg className={styles.svg} viewBox="0 0 96 96" width={96} height={96} aria-hidden>
              <circle className={styles.ringTrack} cx="48" cy="48" r={R} />
              <circle
                className={styles.ringFill}
                cx="48"
                cy="48"
                r={R}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
              />
            </svg>
            <span className={styles.ringValue} aria-hidden>
              {clamped}
            </span>
          </span>
          <span className={styles.meta}>
            <span id={labelId} className={styles.label}>
              {label}
            </span>
            {showDescription ? (
              <span id={descId} className={styles.description}>
                {description}
              </span>
            ) : null}
          </span>
        </>
      ) : null}

      {variant === 'bar' ? (
        <>
          <span className={styles.barHead}>
            <span id={labelId} className={styles.label}>
              {label}
            </span>
            <span className={styles.barValue} aria-hidden>
              {clamped}
            </span>
          </span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${clamped}%` }} />
          </span>
          {showDescription ? (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          ) : null}
        </>
      ) : null}

      {variant === 'badge' ? (
        <>
          <span className={styles.badgeValue} aria-hidden>
            {clamped}
          </span>
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        </>
      ) : null}
    </div>
  )
}
