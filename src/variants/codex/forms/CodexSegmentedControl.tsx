import { type FieldsetHTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { FieldError } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexSegmentedOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface CodexSegmentedControlProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'defaultValue' | 'onChange' | 'value'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  options: CodexSegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  fullWidth?: boolean
  loading?: boolean
  required?: boolean
}

export function CodexSegmentedControl({
  label = 'Görünüm',
  description,
  error,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  fullWidth = false,
  loading = false,
  disabled = false,
  required = false,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CodexSegmentedControlProps) {
  const optionValues = options.map((option) => option.value)
  if (optionValues.some((optionValue) => optionValue.trim().length === 0)) {
    throw new Error('CodexSegmentedControl: her seçenek için boş olmayan bir value zorunludur.')
  }
  if (new Set(optionValues).size !== optionValues.length) {
    throw new Error('CodexSegmentedControl: seçenek value değerleri benzersiz olmalıdır.')
  }

  const groupId = useStableId(id, 'cx-segmented')
  const resolvedName = name ?? `${groupId}-name`
  const firstEnabled = options.find((option) => !option.disabled)?.value ?? ''
  const [resolvedValue, setValue] = useControllableValue(
    value,
    defaultValue ?? firstEnabled,
    onValueChange,
  )
  const descriptionId = `${groupId}-description`
  const errorId = `${groupId}-error`
  const isInvalid = Boolean(error)
  const unavailable = disabled || loading

  return (
    <div
      className={classNames(styles.segmentedField, isInvalid && styles.groupInvalid, loading && styles.isBusy, className)}
      data-invalid={isInvalid || undefined}
      data-loading={loading || undefined}
    >
      <fieldset
        {...rest}
        id={groupId}
        className={styles.groupFieldset}
        disabled={unavailable}
        aria-busy={loading || undefined}
        aria-invalid={isInvalid || undefined}
        aria-describedby={mergeIds(
          ariaDescribedBy,
          description ? descriptionId : undefined,
          error ? errorId : undefined,
        )}
      >
        <legend className={styles.groupLegend}>
          <span>{label}</span>
          {required ? <span className={styles.requiredMark} aria-hidden>*</span> : null}
        </legend>
        {description ? <span className={styles.groupDescription} id={descriptionId}>{description}</span> : null}
        <span className={classNames(styles.segmentedControl, fullWidth && styles.segmentedFull)}>
          {options.map((option, index) => {
            const optionId = `${groupId}-option-${index}`
            return (
              <label key={option.value} className={styles.segmentOption}>
                <input
                  id={optionId}
                  className={styles.segmentInput}
                  type="radio"
                  name={resolvedName}
                  value={option.value}
                  checked={option.value === resolvedValue}
                  disabled={unavailable || option.disabled}
                  required={required}
                  aria-invalid={isInvalid || undefined}
                  onChange={() => setValue(option.value)}
                />
                <span className={styles.segmentLabel}>
                  {option.icon ? <span className={styles.segmentIcon} aria-hidden>{option.icon}</span> : null}
                  <span>{option.label}</span>
                </span>
              </label>
            )
          })}
        </span>
      </fieldset>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
