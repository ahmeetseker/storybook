import { useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassChip.module.css'

export interface GlassChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onSelect'> {
  /** Controlled seçim durumu (toggle modu) */
  selected?: boolean
  /** Uncontrolled başlangıç seçimi (toggle modu) */
  defaultSelected?: boolean
  /** Seçim değişince çağrılır; verilmesi toggle modunu açar */
  onSelectedChange?: (selected: boolean) => void
  /** Verilirse sağda × kaldırma butonu görünür (aria-label="Kaldır") */
  onRemove?: () => void
  icon?: ReactNode
  size?: 'sm' | 'md'
  tint?: string
  tone?: 'light' | 'dark' | 'auto'
  disabled?: boolean
}

export function GlassChip({
  selected,
  defaultSelected,
  onSelectedChange,
  onRemove,
  icon,
  size = 'md',
  tint,
  tone = 'auto',
  disabled = false,
  className,
  style,
  children,
  onClick,
  onKeyDown,
  ...rest
}: GlassChipProps) {
  const [innerSelected, setInnerSelected] = useState(defaultSelected ?? false)
  // Toggle modu: seçim API'sinden herhangi biri verildiyse aç
  const toggleMode = selected !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined
  const isSelected = selected ?? innerSelected
  // Etkileşim niyeti: toggle veya düz tıklama (filtre chip'i)
  const interactive = toggleMode || onClick !== undefined
  const press = useGlassPress({ disabled: disabled || !interactive })

  const activate = (e: MouseEvent<HTMLSpanElement>) => {
    if (disabled) return
    if (toggleMode) {
      const next = !isSelected
      if (selected === undefined) setInnerSelected(next)
      onSelectedChange?.(next)
    }
    onClick?.(e)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(e)
    if (disabled || e.defaultPrevented) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activate(e as unknown as MouseEvent<HTMLSpanElement>)
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && onRemove) {
      e.preventDefault()
      onRemove()
    }
  }

  const classes = [
    styles.chip,
    styles[size],
    tint && !isSelected ? styles.tinted : '',
    isSelected ? styles.selected : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}

  return (
    <GlassSurface
      as={motion.span}
      shape="capsule"
      interactive={interactive && !disabled}
      tone={tone}
      thickness={0.2}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, scale: press.transformScale, ...style } as CSSProperties}
      {...(interactive && !disabled ? press.handlers : {})}
      {...({
        role: interactive ? 'button' : undefined,
        tabIndex: interactive && !disabled ? 0 : undefined,
        'aria-pressed': toggleMode ? isSelected : undefined,
        'aria-disabled': disabled || undefined,
        'data-selected': isSelected || undefined,
        onClick: interactive && !disabled ? activate : undefined,
        onKeyDown: interactive && !disabled ? handleKeyDown : undefined,
        ...rest,
      } as unknown as GlassSurfaceProps)}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label="Kaldır"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          // Kaldırma basıncı chip'in sıvılaşma animasyonunu tetiklemesin
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* İnce çizgili × — font glyph'i yerine stroke SVG: dikeyde güvenilir ortalanır */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      ) : null}
    </GlassSurface>
  )
}
