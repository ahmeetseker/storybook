import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'max' | 'min' | 'onChange' | 'size' | 'step' | 'type' | 'value'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
  step?: number
  formatValue?: (value: number) => string
  showBounds?: boolean
  loading?: boolean
}

export const CodexSlider = forwardRef<HTMLInputElement, CodexSliderProps>(function CodexSlider(
  {
    label,
    description,
    error,
    value,
    defaultValue,
    onValueChange,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    formatValue = (currentValue) => String(currentValue),
    showBounds = true,
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
  if (max <= min) throw new Error('CodexSlider: max değeri min değerinden büyük olmalıdır.')
  if (step <= 0) throw new Error('CodexSlider: step değeri sıfırdan büyük olmalıdır.')

  const controlId = useStableId(id, 'cx-slider')
  const initialValue = Math.min(max, Math.max(min, defaultValue ?? min))
  const [requestedValue, setValue] = useControllableValue(value, initialValue, onValueChange)
  const resolvedValue = Math.min(max, Math.max(min, requestedValue))
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const isInvalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true'
  const unavailable = disabled || loading
  const formattedValue = formatValue(resolvedValue)

  return (
    <div
      className={classNames(styles.sliderField, loading && styles.isBusy, className)}
      data-invalid={isInvalid || undefined}
      data-loading={loading || undefined}
    >
      <span className={styles.sliderHeader}>
        <FieldHeader
          controlId={controlId}
          label={label}
          description={description}
          required={required}
          descriptionId={description ? descriptionId : undefined}
        />
        <output className={styles.sliderValue} htmlFor={controlId} aria-live="polite">
          {formattedValue}
        </output>
      </span>
      <input
        {...rest}
        ref={ref}
        id={controlId}
        className={styles.sliderInput}
        type="range"
        value={resolvedValue}
        min={min}
        max={max}
        step={step}
        disabled={unavailable}
        required={required}
        aria-busy={loading || undefined}
        aria-invalid={isInvalid || undefined}
        aria-valuetext={formattedValue}
        aria-describedby={mergeIds(
          ariaDescribedBy,
          description ? descriptionId : undefined,
          error ? errorId : undefined,
        )}
        onChange={(event) => {
          setValue(event.currentTarget.valueAsNumber)
          onChange?.(event)
        }}
      />
      {showBounds ? (
        <span className={styles.sliderBounds} aria-hidden>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </span>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
})
