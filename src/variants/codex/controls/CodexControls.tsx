import {
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import styles from './CodexControls.module.css'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export type CodexControlSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<CodexControlSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
}

export type CodexButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

export interface CodexButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  variant?: CodexButtonVariant
  size?: CodexControlSize
  loading?: boolean
  fullWidth?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
}

const buttonVariantClasses: Record<CodexButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  quiet: styles.buttonQuiet,
  danger: styles.buttonDanger,
}

export const CodexButton = forwardRef<HTMLButtonElement, CodexButtonProps>(function CodexButton(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    prefix,
    suffix,
    disabled = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const unavailable = disabled || loading

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classNames(
        styles.button,
        buttonVariantClasses[variant],
        sizeClasses[size],
        fullWidth && styles.buttonFullWidth,
        className,
      )}
      disabled={unavailable}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      <span className={styles.buttonLabel}>
        {prefix ? <span className={styles.buttonAdornment} aria-hidden>{prefix}</span> : null}
        {children}
        {suffix ? <span className={styles.buttonAdornment} aria-hidden>{suffix}</span> : null}
      </span>
    </button>
  )
})

export type CodexIconButtonShape = 'square' | 'circle'

export interface CodexIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string
  icon?: ReactNode
  shape?: CodexIconButtonShape
  size?: CodexControlSize
  pressed?: boolean
}

export const CodexIconButton = forwardRef<HTMLButtonElement, CodexIconButtonProps>(
  function CodexIconButton(
    {
      label,
      icon,
      children,
      shape = 'square',
      size = 'md',
      pressed,
      type = 'button',
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={classNames(
          styles.iconButton,
          shape === 'circle' ? styles.iconCircle : styles.iconSquare,
          sizeClasses[size],
          className,
        )}
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        data-pressed={pressed || undefined}
      >
        <span className={styles.iconGlyph} aria-hidden>
          {icon ?? children}
        </span>
      </button>
    )
  },
)

export type CodexBadgeTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

export interface CodexBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: CodexBadgeTone
  dot?: boolean
}

const badgeToneClasses: Record<CodexBadgeTone, string> = {
  neutral: styles.badgeNeutral,
  accent: styles.badgeAccent,
  info: styles.badgeInfo,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
}

export function CodexBadge({ tone = 'neutral', dot = false, className, children, ...rest }: CodexBadgeProps) {
  return (
    <span className={classNames(styles.badge, badgeToneClasses[tone], className)} {...rest}>
      {dot ? <span className={styles.badgeDot} aria-hidden /> : null}
      <span>{children}</span>
    </span>
  )
}

export interface CodexChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onSelect'> {
  children: ReactNode
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
}

export function CodexChip({
  children,
  selected,
  defaultSelected = false,
  onSelectedChange,
  onRemove,
  removeLabel,
  disabled = false,
  className,
  ...rest
}: CodexChipProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected)
  const resolvedSelected = selected ?? internalSelected
  const accessibleRemoveLabel =
    removeLabel ?? (typeof children === 'string' ? `${children} filtresini kaldır` : 'Filtreyi kaldır')

  const toggle = () => {
    const next = !resolvedSelected
    if (selected === undefined) setInternalSelected(next)
    onSelectedChange?.(next)
  }

  return (
    <span
      {...rest}
      className={classNames(styles.chip, className)}
      data-selected={resolvedSelected || undefined}
      data-disabled={disabled || undefined}
    >
      <button
        type="button"
        className={styles.chipAction}
        aria-pressed={resolvedSelected}
        disabled={disabled}
        onClick={toggle}
      >
        <span className={styles.chipCheck} aria-hidden>
          ✓
        </span>
        <span>{children}</span>
      </button>
      {onRemove ? (
        <button
          type="button"
          className={styles.chipRemove}
          aria-label={accessibleRemoveLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </span>
  )
}

interface CodexFieldContextValue {
  controlId: string
  descriptionId?: string
  errorId?: string
  invalid: boolean
  required: boolean
}

const CodexFieldContext = createContext<CodexFieldContextValue | null>(null)

export interface CodexFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode
  hint?: ReactNode
  description?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
}

export function CodexField({
  label,
  hint,
  description,
  error,
  required = false,
  className,
  children,
  ...rest
}: CodexFieldProps) {
  const id = useId()
  const resolvedDescription = description ?? hint
  const childControlId = isValidElement<{ id?: string }>(children) && typeof children.props.id === 'string'
    ? children.props.id
    : undefined
  const controlId = childControlId ?? `cx-control-${id}`
  const descriptionId = resolvedDescription ? `cx-description-${id}` : undefined
  const errorId = error ? `cx-error-${id}` : undefined
  const context: CodexFieldContextValue = {
    controlId,
    descriptionId,
    errorId,
    invalid: Boolean(error),
    required,
  }

  return (
    <CodexFieldContext.Provider value={context}>
      <div className={classNames(styles.field, className)} {...rest}>
        <label className={styles.fieldLabel} htmlFor={controlId}>
          <span>{label}</span>
          {required ? <span className={styles.requiredMark} aria-hidden>*</span> : null}
        </label>
        {resolvedDescription ? (
          <p id={descriptionId} className={styles.fieldDescription}>
            {resolvedDescription}
          </p>
        ) : null}
        {children}
        {error ? (
          <p id={errorId} className={styles.fieldError} role="alert">
            <span className={styles.errorMark} aria-hidden>
              !
            </span>
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </CodexFieldContext.Provider>
  )
}

function describedBy(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(' ')
  return value || undefined
}

export interface CodexInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  controlSize?: CodexControlSize
  invalid?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
}

export const CodexInput = forwardRef<HTMLInputElement, CodexInputProps>(function CodexInput(
  {
    controlSize = 'md',
    invalid = false,
    prefix,
    suffix,
    className,
    id,
    required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const field = useContext(CodexFieldContext)
  const isInvalid = invalid || field?.invalid || ariaInvalid === true || ariaInvalid === 'true'

  return (
    <span
      className={classNames(styles.inputShell, sizeClasses[controlSize])}
      data-invalid={isInvalid || undefined}
      data-disabled={rest.disabled || undefined}
      data-readonly={rest.readOnly || undefined}
    >
      {prefix ? <span className={styles.inputAdornment} aria-hidden>{prefix}</span> : null}
      <input
        ref={ref}
        id={id ?? field?.controlId}
        className={classNames(styles.input, className)}
        required={required ?? field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy(ariaDescribedBy, field?.descriptionId, field?.errorId)}
        {...rest}
      />
      {suffix ? <span className={styles.inputAdornment} aria-hidden>{suffix}</span> : null}
    </span>
  )
})

export interface CodexSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  controlSize?: CodexControlSize
  invalid?: boolean
  placeholder?: string
}

export const CodexSelect = forwardRef<HTMLSelectElement, CodexSelectProps>(function CodexSelect(
  {
    controlSize = 'md',
    invalid = false,
    placeholder,
    className,
    children,
    id,
    required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const field = useContext(CodexFieldContext)
  const isInvalid = invalid || field?.invalid || ariaInvalid === true || ariaInvalid === 'true'

  return (
    <span className={styles.selectWrap} data-invalid={isInvalid || undefined}>
      <select
        ref={ref}
        id={id ?? field?.controlId}
        className={classNames(styles.select, sizeClasses[controlSize], className)}
        required={required ?? field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy(ariaDescribedBy, field?.descriptionId, field?.errorId)}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <svg className={styles.selectChevron} viewBox="0 0 16 16" aria-hidden>
        <path d="m4 6 4 4 4-4" />
      </svg>
    </span>
  )
})

export interface CodexCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'size' | 'type'> {
  label: ReactNode
  description?: ReactNode
  indeterminate?: boolean
}

export const CodexCheckbox = forwardRef<HTMLInputElement, CodexCheckboxProps>(function CodexCheckbox(
  { label, description, indeterminate = false, className, disabled = false, ...rest },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const labelId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  return (
    <label className={classNames(styles.checkboxLabel, disabled && styles.isDisabled, className)}>
      <input
        {...rest}
        ref={setRef}
        type="checkbox"
        className={styles.checkboxInput}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-checked={indeterminate ? 'mixed' : undefined}
        aria-describedby={description ? descriptionId : undefined}
        data-indeterminate={indeterminate || undefined}
      />
      <span className={styles.choiceCopy}>
        <span id={labelId} className={styles.choiceLabel}>{label}</span>
        {description ? (
          <span id={descriptionId} className={styles.choiceDescription}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
})

export interface CodexSwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'children' | 'defaultChecked' | 'size' | 'type'> {
  label: ReactNode
  description?: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const CodexSwitch = forwardRef<HTMLInputElement, CodexSwitchProps>(function CodexSwitch(
  {
    label,
    description,
    checked,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    className,
    disabled = false,
    ...rest
  },
  ref,
) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const resolvedChecked = checked ?? internalChecked
  const labelId = useId()
  const descriptionId = useId()

  return (
    <label className={classNames(styles.switchLabel, disabled && styles.isDisabled, className)}>
      <span className={styles.choiceCopy}>
        <span id={labelId} className={styles.choiceLabel}>{label}</span>
        {description ? (
          <span id={descriptionId} className={styles.choiceDescription}>
            {description}
          </span>
        ) : null}
      </span>
      <span className={styles.switchControl}>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          className={styles.switchInput}
          checked={resolvedChecked}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={description ? descriptionId : undefined}
          onChange={(event) => {
            if (checked === undefined) setInternalChecked(event.currentTarget.checked)
            onCheckedChange?.(event.currentTarget.checked)
            onChange?.(event)
          }}
        />
        <span className={styles.switchTrack} aria-hidden>
          <span className={styles.switchThumb} />
        </span>
      </span>
    </label>
  )
})

export interface CodexTabItem {
  id: string
  label: ReactNode
  panel?: ReactNode
  disabled?: boolean
}

export interface CodexTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CodexTabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  ariaLabel?: string
  label?: string
}

export function CodexTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  ariaLabel,
  label = 'İçerik bölümleri',
  className,
  ...rest
}: CodexTabsProps) {
  const itemIds = items.map((item) => item.id)
  if (itemIds.some((id) => id.trim().length === 0)) {
    throw new Error('CodexTabs: her tab için boş olmayan bir id zorunludur.')
  }
  if (new Set(itemIds).size !== itemIds.length) {
    throw new Error('CodexTabs: tab id değerleri benzersiz olmalıdır.')
  }

  const getItemValue = (item: CodexTabItem) => item.id
  const firstEnabled = items.find((item) => !item.disabled)
  const firstEnabledId = firstEnabled ? getItemValue(firstEnabled) : undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabledId)
  const requestedValue = value ?? internalValue
  const activeValue = items.some((item) => getItemValue(item) === requestedValue && !item.disabled)
    ? requestedValue
    : firstEnabledId
  const baseId = useId().replaceAll(':', '')
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    if (value === undefined && activeValue !== internalValue) setInternalValue(activeValue)
  }, [activeValue, internalValue, value])

  const selectTab = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  const moveFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, currentId: string) => {
    const enabled = items.filter((item) => !item.disabled)
    const currentIndex = enabled.findIndex((item) => getItemValue(item) === currentId)
    if (currentIndex < 0 || enabled.length === 0) return

    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabled.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = enabled.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    const next = enabled[nextIndex]
    const nextValue = getItemValue(next)
    selectTab(nextValue)
    tabRefs.current.get(nextValue)?.focus()
  }

  return (
    <div className={classNames(styles.tabs, className)} {...rest}>
      <div className={styles.tabList} role="tablist" aria-label={ariaLabel ?? label} aria-orientation="horizontal">
        {items.map((item, index) => {
          const itemValue = getItemValue(item)
          const selected = itemValue === activeValue
          const tabId = `${baseId}-tab-${index}`
          const panelId = `${baseId}-panel-${index}`
          return (
            <button
              key={itemValue}
              ref={(node) => {
                if (node) tabRefs.current.set(itemValue, node)
                else tabRefs.current.delete(itemValue)
              }}
              type="button"
              role="tab"
              id={tabId}
              className={styles.tab}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              data-selected={selected || undefined}
              onClick={() => selectTab(itemValue)}
              onKeyDown={(event) => moveFromKeyboard(event, itemValue)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className={styles.tabPanels}>
        {items.map((item, index) => {
          const itemValue = getItemValue(item)
          const selected = itemValue === activeValue
          return (
            <div
              key={itemValue}
              id={`${baseId}-panel-${index}`}
              role="tabpanel"
              className={styles.tabPanel}
              aria-labelledby={`${baseId}-tab-${index}`}
              tabIndex={0}
              hidden={!selected}
            >
              {item.panel}
            </div>
          )
        })}
      </div>
    </div>
  )
}
