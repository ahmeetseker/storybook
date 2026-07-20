import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { CodexButton } from '../controls'
import styles from './CodexMobile.module.css'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const resolvedValue = value ?? internalValue

  const setValue = useCallback((nextValue: T) => {
    if (value === undefined) setInternalValue(nextValue)
    if (!Object.is(nextValue, resolvedValue)) onChange?.(nextValue)
  }, [onChange, resolvedValue, value])

  return [resolvedValue, setValue] as const
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    const computed = typeof window === 'undefined' ? null : window.getComputedStyle(element)
    return !element.hasAttribute('hidden')
      && element.getAttribute('aria-hidden') !== 'true'
      && computed?.display !== 'none'
      && computed?.visibility !== 'hidden'
  })
}

let bodyLockDepth = 0

function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return
    if (bodyLockDepth === 0) document.body.classList.add(styles.bodyScrollLocked)
    bodyLockDepth += 1

    return () => {
      bodyLockDepth = Math.max(0, bodyLockDepth - 1)
      if (bodyLockDepth === 0) document.body.classList.remove(styles.bodyScrollLocked)
    }
  }, [active])
}

function useSheetFocus(
  open: boolean,
  sheetRef: RefObject<HTMLElement | null>,
  returnFocusRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const frame = window.requestAnimationFrame(() => {
      const sheet = sheetRef.current
      const target = initialFocusRef?.current ?? getFocusable(sheet)[0] ?? sheet
      target?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const nestedLayer = target instanceof Element
        ? target.closest('[role="dialog"], [role="menu"]')
        : null
      if (nestedLayer && nestedLayer !== sheetRef.current) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = getFocusable(sheetRef.current)
      if (focusable.length === 0) {
        event.preventDefault()
        sheetRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [initialFocusRef, onDismiss, open, sheetRef])

  useEffect(() => {
    if (wasOpen.current && !open) returnFocusRef.current?.focus()
    wasOpen.current = open
  }, [open, returnFocusRef])
}

export interface CodexBottomNavigationItem {
  id: string
  label: string
  icon: ReactNode
  href?: string
  badge?: string | number
  badgeLabel?: string
  onSelect?: () => void
}

export interface CodexBottomNavigationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange'> {
  items: CodexBottomNavigationItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
}

/** Three to five persistent, equally important top-level destinations. */
export function CodexBottomNavigation({
  items,
  value,
  defaultValue,
  onValueChange,
  label = 'Ana navigasyon',
  className,
  ...rest
}: CodexBottomNavigationProps) {
  if (items.length < 3 || items.length > 5) {
    throw new Error('CodexBottomNavigation: 3 ile 5 arasında üst seviye hedef verilmelidir.')
  }

  const ids = items.map((item) => item.id)
  if (ids.some((id) => id.trim().length === 0) || new Set(ids).size !== ids.length) {
    throw new Error('CodexBottomNavigation: her hedef için benzersiz ve boş olmayan id zorunludur.')
  }
  if (value !== undefined && !ids.includes(value)) {
    throw new Error('CodexBottomNavigation: value mevcut hedeflerden biri olmalıdır.')
  }

  const initialValue = defaultValue && ids.includes(defaultValue) ? defaultValue : ids[0]
  const [resolvedValue, setValue] = useControllableState(value, initialValue, onValueChange)

  const select = (item: CodexBottomNavigationItem) => {
    setValue(item.id)
    item.onSelect?.()
  }

  return (
    <nav
      {...rest}
      aria-label={label}
      className={classNames(styles.bottomNavigation, className)}
      data-destination-count={items.length}
    >
      <ul className={styles.bottomNavigationList}>
        {items.map((item) => {
          const selected = item.id === resolvedValue
          const content = (
            <>
              <span className={styles.destinationIcon} aria-hidden>{item.icon}</span>
              <span className={styles.destinationLabel}>{item.label}</span>
              {item.badge !== undefined ? (
                <span
                  className={styles.destinationBadge}
                  aria-label={item.badgeLabel ?? `${item.badge} yeni öğe`}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          )

          return (
            <li key={item.id}>
              {item.href ? (
                <a
                  className={styles.destination}
                  href={item.href}
                  aria-current={selected ? 'page' : undefined}
                  data-current={selected || undefined}
                  onClick={() => select(item)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  className={styles.destination}
                  aria-current={selected ? 'page' : undefined}
                  data-current={selected || undefined}
                  onClick={() => select(item)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export interface CodexAppBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  actions?: ReactNode
  headingLevel?: 1 | 2
}

/** Compact page context: one leading navigation control, title and essential actions. */
export function CodexAppBar({
  title,
  subtitle,
  leading,
  actions,
  headingLevel = 1,
  className,
  ...rest
}: CodexAppBarProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <header {...rest} className={classNames(styles.appBar, className)}>
      {leading ? <div className={styles.appBarLeading}>{leading}</div> : null}
      <div className={styles.appBarHeading}>
        <Heading>{title}</Heading>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.appBarActions}>{actions}</div> : null}
    </header>
  )
}

export interface CodexActionBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  summary?: ReactNode
  primaryAction: ReactNode
  secondaryAction?: ReactNode
  label?: string
}

/** Contextual task actions; it is not a navigation destination. */
export function CodexActionBar({
  summary,
  primaryAction,
  secondaryAction,
  label = 'Sayfa işlemleri',
  className,
  ...rest
}: CodexActionBarProps) {
  return (
    <aside {...rest} aria-label={label} className={classNames(styles.actionBar, className)}>
      {summary ? <div className={styles.actionSummary}>{summary}</div> : null}
      <div className={styles.actionControls}>
        {secondaryAction}
        {primaryAction}
      </div>
    </aside>
  )
}

export interface CodexCompactFilterBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'results'> {
  children?: ReactNode
  results?: ReactNode
  actions?: ReactNode
  activeCount?: number
  filterLabel?: string
  label?: string
  filterButtonRef?: RefObject<HTMLButtonElement | null>
  onFilterClick: () => void
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

/** A short horizontal filter summary; the complete form belongs in a bottom sheet. */
export function CodexCompactFilterBar({
  children,
  results,
  actions,
  activeCount = 0,
  filterLabel = 'Filtreler',
  label = 'Arama araçları',
  filterButtonRef,
  onFilterClick,
  className,
  ...rest
}: CodexCompactFilterBarProps) {
  const countLabel = activeCount > 0 ? `${activeCount} etkin filtre` : 'Etkin filtre yok'

  return (
    <section {...rest} aria-label={label} className={classNames(styles.filterBar, className)}>
      <div className={styles.filterBarTop}>
        {results ? <p className={styles.filterResults}>{results}</p> : <span />}
        <div className={styles.filterActions}>
          {actions}
          <CodexButton
            ref={filterButtonRef}
            variant="secondary"
            size="md"
            prefix={<FilterIcon />}
            aria-label={`${filterLabel}, ${countLabel}`}
            onClick={onFilterClick}
          >
            {filterLabel}
            {activeCount > 0 ? <span className={styles.filterCount} aria-hidden>{activeCount}</span> : null}
          </CodexButton>
        </div>
      </div>
      {children ? <div className={styles.filterRail}>{children}</div> : null}
    </section>
  )
}

export type CodexSheetDetent = 'content' | 'medium' | 'large'

export interface CodexBottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerLabel?: ReactNode
  closeLabel?: string
  detents?: CodexSheetDetent[]
  detent?: CodexSheetDetent
  defaultDetent?: CodexSheetDetent
  onDetentChange?: (detent: CodexSheetDetent) => void
  dismissOnBackdrop?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
}

const detentLabels: Record<CodexSheetDetent, string> = {
  content: 'İçerik kadar',
  medium: 'Orta',
  large: 'Tam ekran',
}

/** Modal secondary task surface with a tap/keyboard alternative for every size change. */
export function CodexBottomSheet({
  title,
  description,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  triggerLabel,
  closeLabel = 'Paneli kapat',
  detents = ['content'],
  detent,
  defaultDetent,
  onDetentChange,
  dismissOnBackdrop = true,
  initialFocusRef,
  returnFocusRef,
  className,
  children,
  ...rest
}: CodexBottomSheetProps) {
  const resolvedDetents: CodexSheetDetent[] = detents.length > 0 ? detents : ['content']
  if (new Set(resolvedDetents).size !== resolvedDetents.length) {
    throw new Error('CodexBottomSheet: detent değerleri benzersiz olmalıdır.')
  }
  if (detent !== undefined && !resolvedDetents.includes(detent)) {
    throw new Error('CodexBottomSheet: detent, detents listesinde bulunmalıdır.')
  }

  const initialDetent = defaultDetent && resolvedDetents.includes(defaultDetent)
    ? defaultDetent
    : resolvedDetents[0]
  const [resolvedOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const [resolvedDetent, setDetent] = useControllableState(detent, initialDetent, onDetentChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const sheetId = useId()
  const focusReturnRef = returnFocusRef ?? triggerRef
  const dismiss = useCallback(() => setOpen(false), [setOpen])

  useSheetFocus(resolvedOpen, sheetRef, focusReturnRef, dismiss, initialFocusRef)
  useBodyScrollLock(resolvedOpen)

  const cycleDetent = () => {
    const currentIndex = resolvedDetents.indexOf(resolvedDetent)
    const next = resolvedDetents[(currentIndex + 1) % resolvedDetents.length]
    setDetent(next)
  }

  const handleBackdropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dismissOnBackdrop && event.target === event.currentTarget) dismiss()
  }

  const nextDetent = resolvedDetents[(resolvedDetents.indexOf(resolvedDetent) + 1) % resolvedDetents.length]

  return (
    <div {...rest} className={classNames(styles.sheetRoot, className)}>
      {triggerLabel ? (
        <button
          ref={triggerRef}
          type="button"
          className={styles.sheetTrigger}
          aria-haspopup="dialog"
          aria-expanded={resolvedOpen}
          aria-controls={resolvedOpen ? sheetId : undefined}
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      ) : null}
      {resolvedOpen ? (
        <div className={styles.sheetBackdrop} onPointerDown={handleBackdropPointerDown}>
          <div
            ref={sheetRef}
            id={sheetId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={styles.sheet}
            data-detent={resolvedDetent}
            tabIndex={-1}
          >
            {resolvedDetents.length > 1 ? (
              <button
                type="button"
                className={styles.sheetHandleButton}
                aria-label={`Panel boyutu ${detentLabels[resolvedDetent]}. ${detentLabels[nextDetent]} boyuta geçir`}
                onClick={cycleDetent}
              >
                <span aria-hidden />
              </button>
            ) : <span className={styles.sheetHandle} aria-hidden />}
            <header className={styles.sheetHeader}>
              <div className={styles.sheetHeading}>
                <h2 id={titleId}>{title}</h2>
                {description ? <p id={descriptionId}>{description}</p> : null}
              </div>
              <button type="button" className={styles.sheetClose} aria-label={closeLabel} onClick={dismiss}>
                <span aria-hidden>×</span>
              </button>
            </header>
            <div className={styles.sheetBody}>{children}</div>
            {footer ? <footer className={styles.sheetFooter}>{footer}</footer> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface CodexCompactShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  appBar?: ReactNode
  actionBar?: ReactNode
  bottomNavigation?: ReactNode
  children: ReactNode
  mainId?: string
  mainLabel?: string
  contentPadding?: 'default' | 'none'
}

/** App-like viewport frame that keeps persistent chrome outside the scrolling content. */
export function CodexCompactShell({
  appBar,
  actionBar,
  bottomNavigation,
  children,
  mainId = 'main-content',
  mainLabel,
  contentPadding = 'default',
  className,
  ...rest
}: CodexCompactShellProps) {
  return (
    <div
      {...rest}
      className={classNames(styles.compactShell, className)}
      data-content-padding={contentPadding}
      data-has-action-bar={Boolean(actionBar) || undefined}
      data-has-bottom-navigation={Boolean(bottomNavigation) || undefined}
    >
      {appBar}
      <main id={mainId} aria-label={mainLabel} className={styles.compactMain}>
        {children}
      </main>
      {actionBar || bottomNavigation ? (
        <div className={styles.bottomStack}>
          {actionBar}
          {bottomNavigation}
        </div>
      ) : null}
    </div>
  )
}
