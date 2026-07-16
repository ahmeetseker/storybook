import { useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassStepper.module.css'

export interface GlassStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  min?: number
  max?: number
  step?: number
  /** Controlled değer */
  value?: number
  /** Uncontrolled başlangıç değeri */
  defaultValue?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  /** Erişilebilirlik etiketi (spinbutton aria-label) — zorunlu kabul et */
  label?: string
  formatValue?: (v: number) => string
}

const clampTo = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** GlassIconButton tarzı iç buton: cam kapsül + basınç animasyonu; tabIndex -1 (odak spinbutton'da kalır) */
function StepButton({
  label,
  onActivate,
  disabled,
  tone,
  children,
}: {
  label: string
  onActivate: () => void
  disabled?: boolean
  tone: 'light' | 'dark' | 'auto'
  children: ReactNode
}) {
  const press = useGlassPress({ disabled })
  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive={!disabled}
      tone={tone}
      thickness={0.3}
      displacementScale={press.displacementScale}
      className={styles.stepBtn}
      style={{ scale: press.transformScale } as unknown as CSSProperties}
      aria-label={label}
      {...press.handlers}
      {...({ type: 'button', tabIndex: -1, disabled, onClick: onActivate } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.icon} aria-hidden>
        {children}
      </span>
    </GlassSurface>
  )
}

export function GlassStepper({
  min = 0,
  max = Infinity,
  step = 1,
  value,
  defaultValue,
  onChange,
  disabled,
  size = 'md',
  tone = 'auto',
  label,
  formatValue,
  className,
  ...rest
}: GlassStepperProps) {
  // Kontrollü/kontrolsüz kalıbı (GlassTabs ile aynı)
  const [inner, setInner] = useState(clampTo(defaultValue ?? (Number.isFinite(min) ? min : 0), min, max))
  const current = clampTo(value ?? inner, min, max)

  const commit = (v: number) => {
    if (disabled) return
    const next = clampTo(v, min, max)
    if (next === current) return
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  // Spinbutton klavye sözleşmesi: ↑/↓ adım, Home/End uçlar
  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    let next: number | undefined
    if (e.key === 'ArrowUp') next = current + step
    else if (e.key === 'ArrowDown') next = current - step
    else if (e.key === 'Home' && Number.isFinite(min)) next = min
    else if (e.key === 'End' && Number.isFinite(max)) next = max
    if (next === undefined) return
    e.preventDefault()
    commit(next)
  }

  const fmt = formatValue ?? ((v: number) => String(v))
  const classes = [styles.root, styles[size], disabled ? styles.disabled : '', className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      <StepButton label="Azalt" onActivate={() => commit(current - step)} disabled={disabled || current <= min} tone={tone}>
        <svg viewBox="0 0 16 16" className={styles.glyph}>
          <path d="M3.5 8h9" />
        </svg>
      </StepButton>
      <span
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={current}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={formatValue ? fmt(current) : undefined}
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={styles.value}
        onKeyDown={handleKeyDown}
      >
        {fmt(current)}
      </span>
      <StepButton label="Artır" onActivate={() => commit(current + step)} disabled={disabled || current >= max} tone={tone}>
        <svg viewBox="0 0 16 16" className={styles.glyph}>
          <path d="M3.5 8h9M8 3.5v9" />
        </svg>
      </StepButton>
    </div>
  )
}
