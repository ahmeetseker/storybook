import { useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSwitch.module.css'

export interface GlassSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled durum */
  checked?: boolean
  /** Uncontrolled başlangıç durumu */
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  /**
   * Erişilebilirlik etiketi (aria-label). Switch'in görünen çocuğu yoktur;
   * `label` vermezsen `aria-label`'ı rest üzerinden geçirmek ZORUNDASIN.
   */
  label?: string
  size?: 'sm' | 'md'
  /** Açıkken ray vurgusu; verilmezse `--lg-accent` */
  tint?: string
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassSwitch({
  checked,
  defaultChecked,
  onChange,
  label,
  size = 'md',
  tint,
  tone = 'auto',
  disabled,
  className,
  style,
  onClick,
  onKeyDown,
  ...rest
}: GlassSwitchProps) {
  // Kontrollü/kontrolsüz kalıbı (GlassTabs ile aynı)
  const [inner, setInner] = useState(defaultChecked ?? false)
  const isChecked = checked ?? inner
  const reduced = prefersReducedMotion()

  const toggle = () => {
    if (disabled) return
    if (checked === undefined) setInner(!isChecked)
    onChange?.(!isChecked)
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    toggle()
  }

  // Space/Enter'ı manuel yönetiyoruz: preventDefault native click'i bastırır,
  // böylece tarayıcıda çift tetikleme olmaz ve davranış her ortamda deterministiktir.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}
  const classes = [styles.root, styles[size], isChecked ? styles.on : '', className].filter(Boolean).join(' ')

  return (
    <GlassSurface
      as="button"
      shape="capsule"
      interactive={!disabled}
      tone={tone}
      thickness={0.25}
      className={classes}
      style={{ ...cssVars, ...style }}
      {...({
        type: 'button',
        role: 'switch',
        'aria-checked': isChecked,
        'aria-label': label,
        disabled,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ...rest,
      } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.track}>
        {/* Thumb, layout animasyonuyla kayar: justify-content değişimini spring izler */}
        <motion.span
          className={styles.thumb}
          layout
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      </span>
    </GlassSurface>
  )
}
