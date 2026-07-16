import { createContext, useContext, useId, type HTMLAttributes, type ReactNode } from 'react'
import styles from './GlassField.module.css'

export interface GlassFieldContextValue {
  /** İçerideki kontrolün alması gereken id — label'ın htmlFor'u bununla eşleşir */
  id: string
  /** description/error span id'si — kontrol aria-describedby olarak kullanır */
  describedBy?: string
  /** error verilmişse true — kontrol aria-invalid olarak kullanır */
  invalid: boolean
  /** Alan zorunlu mu (kontrol isterse required/aria-required türetir) */
  required: boolean
}

const GlassFieldContext = createContext<GlassFieldContextValue | null>(null)

/**
 * GlassInput/GlassTextarea/GlassSelect'in, GlassField içinde kullanıldığında
 * id + aria-describedby + aria-invalid bağlarını otomatik alması için hafif hook.
 * Field dışında null döner — kontroller bağımsız da çalışır.
 */
export function useGlassFieldContext() {
  return useContext(GlassFieldContext)
}

export interface GlassFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  /** Yardım metni; error verildiğinde gizlenir */
  description?: string
  /** Hata metni; --lg-danger renginde, aria-live="polite" ile duyurulur */
  error?: string
  /** Label yanında * işareti gösterir */
  required?: boolean
  /** Verilmezse useId ile üretilir ve context üzerinden içerideki kontrole dağıtılır */
  htmlFor?: string
  children?: ReactNode
}

export function GlassField({
  label,
  description,
  error,
  required = false,
  htmlFor,
  className,
  children,
  ...rest
}: GlassFieldProps) {
  const autoId = useId()
  const id = htmlFor ?? `${autoId}-control`
  const descriptionId = `${autoId}-description`
  const errorId = `${autoId}-error`
  const invalid = Boolean(error)
  const describedBy = error ? errorId : description ? descriptionId : undefined

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')} {...rest}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <GlassFieldContext.Provider value={{ id, describedBy, invalid, required }}>{children}</GlassFieldContext.Provider>
      {/* error varken description gizlenir (iki metin üst üste binmez, describedBy hataya döner) */}
      {!error && description ? (
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      ) : null}
      {/* Kalıcı live region: role="alert" kadar agresif değil; hata metni geldiğinde duyurulur.
          Span her zaman DOM'da kalır ki ekran okuyucular içerik değişimini yakalasın. */}
      <span id={errorId} className={styles.error} aria-live="polite">
        {error ?? ''}
      </span>
    </div>
  )
}
