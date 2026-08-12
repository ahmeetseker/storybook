import { useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent } from 'react'
import styles from './GlassSlider.module.css'

export interface GlassSliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'children'
  > {
  min?: number
  max?: number
  step?: number
  /** Controlled değer */
  value?: number
  /** Uncontrolled başlangıç değeri */
  defaultValue?: number
  onChange?: (value: number) => void
  /** Erişilebilirlik etiketi (aria-label) — görünen ayrı bir label yoksa zorunlu */
  label?: string
  /** Thumb üstünde değer baloncuğu göster */
  showValue?: boolean
  formatValue?: (v: number) => string
}

const clampTo = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function GlassSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  label,
  showValue = false,
  formatValue,
  disabled,
  className,
  style,
  onKeyDown,
  ...rest
}: GlassSliderProps) {
  // Kontrollü/kontrolsüz kalıbı (GlassTabs ile aynı)
  const [inner, setInner] = useState(defaultValue ?? min)
  const current = clampTo(value ?? inner, min, max)
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0

  const commit = (v: number) => {
    const next = clampTo(v, min, max)
    if (value === undefined) setInner(next)
    if (next !== current) onChange?.(next)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    commit(Number(e.target.value))
  }

  // Klavyeyi manuel yönetiyoruz (preventDefault): native range davranışının birebir
  // kopyası, ama her ortamda (jsdom dahil) deterministik ve step'e sadık.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (disabled) return
    let next: number | undefined
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = current + step
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = current - step
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else if (e.key === 'PageUp') next = current + step * 10
    else if (e.key === 'PageDown') next = current - step * 10
    if (next === undefined) return
    e.preventDefault()
    commit(next)
  }

  const fmt = formatValue ?? ((v: number) => String(v))
  const classes = [styles.root, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')

  return (
    <span className={classes} style={{ ...({ '--pct': pct } as CSSProperties), ...style }}>
      {/* Native range tam alanı kaplar (opacity 0): sürükleme, odak ve rol bedava */}
      <input
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={formatValue ? fmt(current) : undefined}
        {...rest}
      />
      <span className={styles.track} aria-hidden>
        <span className={styles.fill} />
      </span>
      <span className={styles.thumb} aria-hidden>
        {showValue ? <span className={styles.bubble}>{fmt(current)}</span> : null}
      </span>
    </span>
  )
}
