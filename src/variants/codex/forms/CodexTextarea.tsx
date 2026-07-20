import { forwardRef, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from 'react'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export type CodexTextareaResize = 'none' | 'vertical' | 'both'

export interface CodexTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'defaultValue' | 'onChange' | 'value'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  showCount?: boolean
  resize?: CodexTextareaResize
  loading?: boolean
  loadingLabel?: string
}

const resizeClasses: Record<CodexTextareaResize, string> = {
  none: styles.resizeNone,
  vertical: styles.resizeVertical,
  both: styles.resizeBoth,
}

export const CodexTextarea = forwardRef<HTMLTextAreaElement, CodexTextareaProps>(function CodexTextarea(
  {
    label,
    description,
    error,
    value,
    defaultValue = '',
    onValueChange,
    onChange,
    showCount = false,
    resize = 'vertical',
    loading = false,
    loadingLabel = 'İçerik yükleniyor',
    id,
    className,
    disabled = false,
    required = false,
    maxLength,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const controlId = useStableId(id, 'cx-textarea')
  const [resolvedValue, setValue] = useControllableValue(value, defaultValue, onValueChange)
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const isInvalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true'
  const unavailable = disabled || loading

  return (
    <div
      className={classNames(styles.field, loading && styles.isBusy, className)}
      data-invalid={isInvalid || undefined}
      data-loading={loading || undefined}
    >
      <FieldHeader
        controlId={controlId}
        label={label}
        description={description}
        required={required}
        descriptionId={description ? descriptionId : undefined}
      />
      <span
        className={styles.textareaWrap}
        data-invalid={isInvalid || undefined}
        data-disabled={unavailable || undefined}
      >
        <textarea
          {...rest}
          ref={ref}
          id={controlId}
          className={classNames(styles.textarea, resizeClasses[resize])}
          value={resolvedValue}
          disabled={unavailable}
          required={required}
          maxLength={maxLength}
          aria-busy={loading || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={mergeIds(
            ariaDescribedBy,
            description ? descriptionId : undefined,
            error ? errorId : undefined,
          )}
          onChange={(event) => {
            setValue(event.currentTarget.value)
            onChange?.(event)
          }}
        />
        {showCount ? (
          <span className={styles.textareaCounter} aria-live="polite">
            <span className={styles.visuallyHidden}>Karakter sayısı: </span>
            {resolvedValue.length}{maxLength ? ` / ${maxLength}` : null}
          </span>
        ) : null}
        {loading ? <span className={styles.loadingOverlay} aria-hidden>{loadingLabel}</span> : null}
      </span>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
})
