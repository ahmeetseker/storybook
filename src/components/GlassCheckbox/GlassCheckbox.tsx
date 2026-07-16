import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassCheckbox.module.css'

export interface GlassCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'> {
  /** Kutunun yanındaki etiket — accessible name buradan gelir */
  label: ReactNode
  /** Karışık durum (ör. "tümünü seç" alt öğeleri kısmen seçiliyken); ref ile input.indeterminate'e yazılır */
  indeterminate?: boolean
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassCheckbox({
  label,
  indeterminate = false,
  size = 'md',
  tone = 'auto',
  checked,
  defaultChecked,
  onChange,
  disabled,
  className,
  style,
  ...rest
}: GlassCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Kontrollü/kontrolsüz kalıbı: dışarıdan checked geldiyse o kazanır (GlassTabs kalıbı)
  const [inner, setInner] = useState(defaultChecked ?? false)
  const isChecked = checked ?? inner
  const reduced = prefersReducedMotion()

  // indeterminate yalnız DOM property'sidir; attribute yok → ref ile senkronlanır
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return // savunma: gerçek tarayıcı disabled input'a event iletmez, jsdom iletebilir
    if (checked === undefined) setInner(e.target.checked)
    onChange?.(e)
  }

  const classes = [styles.root, styles[size], disabled ? styles.disabled : '', className].filter(Boolean).join(' ')

  return (
    <label className={classes} style={style}>
      {/* Native input sr-only: klavye (Space) ve ekran okuyucu buna dokunur */}
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : undefined}
        {...rest}
      />
      <GlassSurface as="span" shape={size === 'sm' ? 6 : 7} tone={tone} thickness={0.2} className={styles.box} aria-hidden>
        {indeterminate ? (
          // Karışık durum: tire işareti scale-in ile belirir
          <motion.svg
            viewBox="0 0 16 16"
            className={styles.mark}
            initial={reduced ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
          >
            <path d="M4 8h8" />
          </motion.svg>
        ) : (
          // Tik: motion path çizimi (pathLength 0→1); reduced-motion'da anında
          <svg viewBox="0 0 16 16" className={styles.mark}>
            <motion.path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              initial={false}
              animate={{ pathLength: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
            />
          </svg>
        )}
      </GlassSurface>
      <span className={styles.text}>{label}</span>
    </label>
  )
}
