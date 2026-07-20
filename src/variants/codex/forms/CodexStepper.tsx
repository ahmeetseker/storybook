import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexStepperProps
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
  decrementLabel?: string
  incrementLabel?: string
  loading?: boolean
}

function decimalPlaces(value: number) {
  const [, fraction = ''] = String(value).split('.')
  return fraction.length
}

export const CodexStepper = forwardRef<HTMLInputElement, CodexStepperProps>(function CodexStepper(
  {
    label,
    description,
    error,
    value,
    defaultValue = 0,
    onValueChange,
    onChange,
    min,
    max,
    step = 1,
    formatValue = (currentValue) => String(currentValue),
    decrementLabel = 'Değeri azalt',
    incrementLabel = 'Değeri artır',
    loading = false,
    id,
    className,
    disabled = false,
    required = false,
    readOnly = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  if (min !== undefined && max !== undefined && max < min) {
    throw new Error('CodexStepper: max değeri min değerinden küçük olamaz.')
  }
  if (step <= 0) throw new Error('CodexStepper: step değeri sıfırdan büyük olmalıdır.')

  const controlId = useStableId(id, 'cx-stepper')
  const lowerBound = min ?? Number.MIN_SAFE_INTEGER
  const upperBound = max ?? Number.MAX_SAFE_INTEGER
  const initialValue = Math.min(upperBound, Math.max(lowerBound, defaultValue))
  const [requestedValue, setValue] = useControllableValue(value, initialValue, onValueChange)
  const resolvedValue = Math.min(upperBound, Math.max(lowerBound, requestedValue))
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const isInvalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true'
  const unavailable = disabled || loading
  const precision = decimalPlaces(step)

  const move = (direction: -1 | 1) => {
    const factor = 10 ** precision
    const nextValue = Math.round((resolvedValue + direction * step) * factor) / factor
    setValue(Math.min(upperBound, Math.max(lowerBound, nextValue)))
  }

  return (
    <div
      className={classNames(styles.stepperField, loading && styles.isBusy, className)}
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
        className={styles.stepperControl}
        data-invalid={isInvalid || undefined}
        data-disabled={unavailable || undefined}
      >
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={decrementLabel}
          disabled={unavailable || readOnly || (min !== undefined && resolvedValue <= min)}
          onClick={() => move(-1)}
        >
          <span aria-hidden>−</span>
        </button>
        <input
          {...rest}
          ref={ref}
          id={controlId}
          className={styles.stepperInput}
          type="number"
          inputMode={step % 1 === 0 ? 'numeric' : 'decimal'}
          value={resolvedValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly || loading}
          required={required}
          aria-busy={loading || undefined}
          aria-invalid={isInvalid || undefined}
          aria-valuetext={formatValue(resolvedValue)}
          aria-describedby={mergeIds(
            ariaDescribedBy,
            description ? descriptionId : undefined,
            error ? errorId : undefined,
          )}
          onChange={(event) => {
            if (Number.isFinite(event.currentTarget.valueAsNumber)) {
              setValue(Math.min(upperBound, Math.max(lowerBound, event.currentTarget.valueAsNumber)))
            }
            onChange?.(event)
          }}
        />
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={incrementLabel}
          disabled={unavailable || readOnly || (max !== undefined && resolvedValue >= max)}
          onClick={() => move(1)}
        >
          <span aria-hidden>+</span>
        </button>
      </span>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
})
