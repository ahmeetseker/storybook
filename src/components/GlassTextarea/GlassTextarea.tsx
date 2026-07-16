import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { GlassSurface } from '../GlassSurface'
import { useGlassFieldContext } from '../GlassField'
import styles from './GlassTextarea.module.css'

// 'rows' yerine minRows/maxRows kullanılır (autoResize ile tutarlı tek eksen) → Omit
export interface GlassTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  /** aria-invalid + --lg-danger çerçeve. Verilmezse GlassField context'inden türetilir */
  invalid?: boolean
  /** İçerik büyüdükçe yükseklik büyür (scrollHeight tekniği); el ile resize kapanır */
  autoResize?: boolean
  /** Başlangıç/asgari satır sayısı */
  minRows?: number
  /** autoResize'ın büyüyebileceği azami satır; aşınca içeride scroll */
  maxRows?: number
}

export function GlassTextarea({
  size = 'md',
  tone = 'auto',
  invalid,
  autoResize = false,
  minRows = 3,
  maxRows,
  className,
  style,
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: GlassTextareaProps) {
  const field = useGlassFieldContext()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isInvalid = invalid ?? field?.invalid ?? false
  const resolvedId = id ?? field?.id
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined

  // scrollHeight tekniği: height'i sıfırla → içerik yüksekliğini oku → satır sınırlarına kırp
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el || !autoResize) return
    const cs = window.getComputedStyle(el)
    const line = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) || 0) * 1.5 || 20
    const padding = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
    const min = minRows * line + padding
    const max = maxRows ? maxRows * line + padding : Infinity
    el.style.height = 'auto'
    const next = Math.min(Math.max(el.scrollHeight, min), max)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [autoResize, minRows, maxRows])

  // Kontrollü değer dışarıdan değiştiğinde de (ör. form reset) yükseklik güncellenir
  useLayoutEffect(() => {
    resize()
  }, [resize, value])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    resize()
    onChange?.(e)
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
        <textarea
          ref={textareaRef}
          id={resolvedId}
          className={[styles.textarea, autoResize ? styles.autoResize : ''].filter(Boolean).join(' ')}
          rows={minRows}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </span>
    </GlassSurface>
  )
}
