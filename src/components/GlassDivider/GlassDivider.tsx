import type { HTMLAttributes } from 'react'
import styles from './GlassDivider.module.css'

export interface GlassDividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Ortada footnote metin; çizgi iki yana bölünür (yalnız horizontal) */
  label?: string
  /** Dikey (horizontal'da) / yatay (vertical'da) boşluk token'ları — her breakpoint'te aynı */
  spacing?: 'sm' | 'md' | 'lg'
  /** Soldan içeriden başlar — liste satırı ayracı kullanımı (yalnız horizontal) */
  inset?: boolean
}

const SPACING_CLASS = { sm: 'spacingSm', md: 'spacingMd', lg: 'spacingLg' } as const

export function GlassDivider({
  orientation = 'horizontal',
  label,
  spacing = 'md',
  inset = false,
  className,
  ...rest
}: GlassDividerProps) {
  const classes = [
    styles.divider,
    styles[orientation],
    styles[SPACING_CLASS[spacing]],
    inset && orientation === 'horizontal' ? styles.inset : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (orientation === 'vertical') {
    // <hr> dikeyde doğal değildir; div + separator rolü + aria-orientation kullanılır
    return <div role="separator" aria-orientation="vertical" className={classes} {...rest} />
  }

  if (label) {
    return (
      <div role="separator" aria-orientation="horizontal" className={[classes, styles.withLabel].join(' ')} {...rest}>
        <span className={styles.line} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} aria-hidden="true" />
      </div>
    )
  }

  // Etiketsiz yatay ayraç: native <hr> (implicit separator rolü)
  return <hr className={classes} {...rest} />
}
