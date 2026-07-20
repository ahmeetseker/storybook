import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexDatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'size' | 'type' | 'value'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  loading?: boolean
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
    </svg>
  )
}

export const CodexDatePicker = forwardRef<HTMLInputElement, CodexDatePickerProps>(function CodexDatePicker(
  {
    label,
    description,
    error,
    value,
    defaultValue = '',
    onValueChange,
    onChange,
    loading = false,
    id,
    className,
    disabled = false,
    required = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const controlId = useStableId(id, 'cx-date')
  const [resolvedValue, setValue] = useControllableValue(value, defaultValue, onValueChange)
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const isInvalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true'
  const unavailable = disabled || loading

  return (
    <div
      className={classNames(styles.dateField, loading && styles.isBusy, className)}
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
        className={styles.dateControl}
        data-invalid={isInvalid || undefined}
        data-disabled={unavailable || undefined}
      >
        <span className={styles.dateIcon} aria-hidden><CalendarIcon /></span>
        <input
          {...rest}
          ref={ref}
          id={controlId}
          className={styles.dateInput}
          type="date"
          value={resolvedValue}
          disabled={unavailable}
          required={required}
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
      </span>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
})
