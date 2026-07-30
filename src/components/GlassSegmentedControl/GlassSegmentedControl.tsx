import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSegmentedControl.module.css'

export interface GlassSegmentedOption {
  value: string
  label: string
  /** Etiketin solunda dekoratif ikon (aria-hidden) */
  icon?: ReactNode
  /** Tek segment kapatılabilir; klavye gezinmesi atlar */
  disabled?: boolean
}

export interface GlassSegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: GlassSegmentedOption[]
  /** Controlled seçili değer */
  value?: string
  /** Uncontrolled başlangıç değeri (varsayılan: ilk seçenek) */
  defaultValue?: string
  onChange?: (value: string) => void
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark' | 'auto'
  /** Grup etiketi → radiogroup aria-label; görünür etiket yoksa mutlaka ver */
  label?: string
  /** Tüm kontrolü kapatır */
  disabled?: boolean
}

export function GlassSegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  tone = 'auto',
  label,
  disabled = false,
  className,
  ...rest
}: GlassSegmentedControlProps) {
  const baseId = useId()
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value)
  const currentValue = value ?? inner
  const reduced = prefersReducedMotion()

  const select = (next: string) => {
    if (disabled) return
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  // Radiogroup deseni: roving tabindex; seçim focus'u izler, disabled segmentler atlanır
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || options.length === 0) return
    const enabled = options.filter((o) => !o.disabled)
    if (enabled.length === 0) return
    const currentIndex = enabled.findIndex((o) => o.value === currentValue)
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % enabled.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = enabled.length - 1
    if (nextIndex === -1) return
    e.preventDefault()
    const next = enabled[nextIndex]
    select(next.value)
    document.getElementById(`${baseId}-seg-${next.value}`)?.focus()
  }

  return (
    <GlassSurface
      as="div"
      shape="capsule"
      tone={tone}
      thickness={0.25}
      className={[styles.root, styles[size], disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div role="radiogroup" aria-label={label} className={styles.list} onKeyDown={onKeyDown}>
        {options.map((option) => {
          const selected = option.value === currentValue
          const isDisabled = disabled || option.disabled
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              id={`${baseId}-seg-${option.value}`}
              aria-checked={selected}
              tabIndex={selected && !isDisabled ? 0 : -1}
              disabled={isDisabled}
              className={[styles.segment, selected ? styles.segmentActive : ''].filter(Boolean).join(' ')}
              onClick={() => !isDisabled && select(option.value)}
            >
              {selected ? (
                // Seçim damlası: layout FLIP ile segmentler arasında süzülür.
                // layout="position" — damla yalnız KONUM animasyonu yapar; boyut anında
                // yeni segmente oturur. Boyut morph'u (scale) segment genişlikleri
                // farklıyken pili büyüyüp esniyormuş gibi gösteriyordu.
                <motion.span
                  layoutId={`${baseId}-drop`}
                  layout="position"
                  className={styles.drop}
                  transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
                  aria-hidden
                />
              ) : null}
              {option.icon ? (
                <span className={styles.icon} aria-hidden>
                  {option.icon}
                </span>
              ) : null}
              <span className={styles.segmentLabel}>{option.label}</span>
            </button>
          )
        })}
      </div>
    </GlassSurface>
  )
}
