import {
  forwardRef,
  type ChangeEvent,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react'
import { CodexButton } from '../controls'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export interface CodexSearchFieldProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children' | 'onSubmit'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onSearch?: (value: string, event: FormEvent<HTMLFormElement>) => void
  inputId?: string
  inputName?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  clearLabel?: string
  submitLabel?: string
  showSubmit?: boolean
  inputAriaLabel?: string
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export const CodexSearchField = forwardRef<HTMLFormElement, CodexSearchFieldProps>(function CodexSearchField(
  {
    label = 'İlan ara',
    description,
    error,
    value,
    defaultValue = '',
    onValueChange,
    onInputChange,
    onSearch,
    inputId,
    inputName = 'query',
    placeholder = 'İl, ilçe, mahalle veya ilan numarası',
    autoComplete = 'off',
    required = false,
    disabled = false,
    loading = false,
    clearable = true,
    clearLabel = 'Aramayı temizle',
    submitLabel = 'Ara',
    showSubmit = true,
    inputAriaLabel,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const controlId = useStableId(inputId, 'cx-search')
  const [resolvedValue, setValue] = useControllableValue(value, defaultValue, onValueChange)
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const isInvalid = Boolean(error)
  const unavailable = disabled || loading

  return (
    <form
      {...rest}
      ref={ref}
      role="search"
      className={classNames(styles.searchField, loading && styles.isBusy, className)}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'İlan arama')}
      aria-busy={loading || undefined}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!unavailable) onSearch?.(resolvedValue, event)
      }}
    >
      <FieldHeader
        controlId={controlId}
        label={label}
        description={description}
        required={required}
        descriptionId={description ? descriptionId : undefined}
      />
      <div
        className={styles.searchControl}
        data-invalid={isInvalid || undefined}
        data-disabled={unavailable || undefined}
      >
        <span className={styles.searchIcon} aria-hidden><SearchIcon /></span>
        <input
          id={controlId}
          className={styles.searchInput}
          type="search"
          name={inputName}
          value={resolvedValue}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          readOnly={loading}
          aria-label={inputAriaLabel}
          aria-invalid={isInvalid || undefined}
          aria-describedby={mergeIds(
            description ? descriptionId : undefined,
            error ? errorId : undefined,
          )}
          onChange={(event) => {
            setValue(event.currentTarget.value)
            onInputChange?.(event)
          }}
        />
        <span className={styles.searchActions}>
          {clearable && resolvedValue ? (
            <button
              type="button"
              className={styles.clearButton}
              aria-label={clearLabel}
              disabled={unavailable}
              onClick={() => setValue('')}
            >
              <span aria-hidden>×</span>
            </button>
          ) : null}
          {showSubmit ? (
            <CodexButton type="submit" size="sm" loading={loading} disabled={disabled}>
              {loading ? 'Aranıyor' : submitLabel}
            </CodexButton>
          ) : null}
        </span>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </form>
  )
})
