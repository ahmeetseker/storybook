import { useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import { useGlassFieldContext } from '../GlassField'
import styles from './GlassInput.module.css'

// 'size' native input attr'ı (karakter genişliği) ile, 'prefix' RDFa attr'ı ile çakışır → Omit
export interface GlassInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Kontrol yüksekliği --lg-control-* token'ından */
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  /** aria-invalid + --lg-danger çerçeve. Verilmezse GlassField context'inden türetilir */
  invalid?: boolean
  /** Sol adornment slotu (ikon, para birimi...) — dekoratiftir, aria-hidden */
  prefix?: ReactNode
  /** Sağ adornment slotu */
  suffix?: ReactNode
  /** Değer varken temizle butonu gösterir (aria-label="Temizle") */
  clearable?: boolean
}

export function GlassInput({
  size = 'md',
  tone = 'auto',
  invalid,
  prefix,
  suffix,
  clearable = false,
  className,
  style,
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: GlassInputProps) {
  const field = useGlassFieldContext()
  const inputRef = useRef<HTMLInputElement>(null)
  // Kontrolsüz modda "değer var mı?" bilgisini (clear butonu için) aynada tutarız
  const [innerValue, setInnerValue] = useState(defaultValue ?? '')
  const controlled = value !== undefined
  const currentValue = controlled ? value : innerValue
  const hasValue = String(currentValue ?? '').length > 0

  const isInvalid = invalid ?? field?.invalid ?? false
  const resolvedId = id ?? field?.id
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInnerValue(e.target.value)
    onChange?.(e)
  }

  const clear = () => {
    const el = inputRef.current
    if (!el) return
    // Native value setter + input event: React kontrollü/kontrolsüz her iki modda da
    // onChange görür (React value tracker'ı doğrudan .value atamasını yutar)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    setter?.call(el, '')
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
  }

  return (
    <GlassSurface
      material="glass"
      shape={12}
      thickness={0.25}
      tone={tone}
      className={[
        styles.root,
        styles[size],
        isInvalid ? styles.invalid : '',
        disabled ? styles.disabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span className={styles.inner}>
        {prefix ? (
          <span className={styles.adornment} aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          id={resolvedId}
          className={styles.input}
          value={controlled ? value : undefined}
          defaultValue={controlled ? undefined : defaultValue}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {clearable && hasValue && !disabled ? (
          <button type="button" className={styles.clear} aria-label="Temizle" onClick={clear}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        {suffix ? (
          <span className={styles.adornment} aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </span>
    </GlassSurface>
  )
}
