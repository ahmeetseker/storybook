import { type FieldsetHTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { FieldError } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexRadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export type CodexRadioOrientation = 'horizontal' | 'vertical'

export interface CodexRadioGroupProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'defaultValue' | 'onChange' | 'value'> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  options: CodexRadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: CodexRadioOrientation
  name?: string
  loading?: boolean
  required?: boolean
}

export function CodexRadioGroup({
  label,
  description,
  error,
  options,
  value,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  name,
  loading = false,
  disabled = false,
  required = false,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CodexRadioGroupProps) {
  const optionValues = options.map((option) => option.value)
  if (optionValues.some((optionValue) => optionValue.trim().length === 0)) {
    throw new Error('CodexRadioGroup: her seçenek için boş olmayan bir value zorunludur.')
  }
  if (new Set(optionValues).size !== optionValues.length) {
    throw new Error('CodexRadioGroup: seçenek value değerleri benzersiz olmalıdır.')
  }

  const groupId = useStableId(id, 'cx-radio')
  const resolvedName = name ?? `${groupId}-name`
  const [resolvedValue, setValue] = useControllableValue(value, defaultValue, onValueChange)
  const descriptionId = `${groupId}-description`
  const errorId = `${groupId}-error`
  const isInvalid = Boolean(error)
  const unavailable = disabled || loading

  return (
    <div
      className={classNames(styles.radioGroup, isInvalid && styles.groupInvalid, loading && styles.isBusy, className)}
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
        <div
          className={classNames(
            styles.radioOptions,
            orientation === 'horizontal' ? styles.radioHorizontal : styles.radioVertical,
          )}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-option-${index}`
            const optionLabelId = `${optionId}-label`
            const optionDescriptionId = `${optionId}-description`
            const optionDisabled = unavailable || option.disabled
            const selected = option.value === resolvedValue
            return (
              <label
                key={option.value}
                className={styles.radioOption}
                data-selected={selected || undefined}
                data-disabled={optionDisabled || undefined}
              >
                <input
                  id={optionId}
                  className={styles.radioInput}
                  type="radio"
                  name={resolvedName}
                  value={option.value}
                  checked={selected}
                  disabled={optionDisabled}
                  required={required}
                  aria-invalid={isInvalid || undefined}
                  aria-labelledby={optionLabelId}
                  aria-describedby={option.description ? optionDescriptionId : undefined}
                  onChange={() => setValue(option.value)}
                />
                <span className={styles.radioIndicator} aria-hidden />
                <span className={styles.radioCopy}>
                  <span className={styles.radioLabel} id={optionLabelId}>{option.label}</span>
                  {option.description ? (
                    <span className={styles.radioDescription} id={optionDescriptionId}>{option.description}</span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
