import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import styles from './CodexNavigation.module.css'

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
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => {
      const computed = typeof window === 'undefined' ? null : window.getComputedStyle(element)
      return !element.hasAttribute('hidden')
        && element.getAttribute('aria-hidden') !== 'true'
        && computed?.display !== 'none'
        && computed?.visibility !== 'hidden'
    },
  )
}

function isInsideNestedLayer(event: KeyboardEvent, layer: HTMLElement | null) {
  const target = event.target
  if (!(target instanceof Element)) return false
  const closestLayer = target.closest('[role="dialog"], [role="menu"]')
  return Boolean(closestLayer && closestLayer !== layer)
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

function useModalFocus(
  open: boolean,
  layerRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const frame = window.requestAnimationFrame(() => {
      const layer = layerRef.current
      const target = initialFocusRef?.current ?? getFocusable(layer)[0] ?? layer
      target?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInsideNestedLayer(event, layerRef.current)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
        window.requestAnimationFrame(() => triggerRef.current?.focus())
        return
      }

      if (event.key !== 'Tab') return
      const focusable = getFocusable(layerRef.current)
      if (focusable.length === 0) {
        event.preventDefault()
        layerRef.current?.focus()
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
  }, [initialFocusRef, layerRef, onDismiss, open, triggerRef])

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open, triggerRef])
}

function useOutsideDismiss(
  open: boolean,
  refs: Array<{ current: HTMLElement | null }>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (refs.every((ref) => !ref.current?.contains(target))) onDismiss()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onDismiss, open, refs])
}

export interface CodexBreadcrumbItem {
  id?: string
  label: ReactNode
  href?: string
  current?: boolean
  onClick?: () => void
}

export interface CodexBreadcrumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: CodexBreadcrumbItem[]
  label?: string
  maxItems?: number
  separator?: ReactNode
}

export function CodexBreadcrumb({
  items,
  label = 'Sayfa yolu',
  maxItems = 5,
  separator = '›',
  className,
  ...rest
}: CodexBreadcrumbProps) {
  const [expanded, setExpanded] = useState(false)
  const safeMax = Math.max(3, maxItems)
  const shouldCollapse = !expanded && items.length > safeMax
  const trailingCount = safeMax - 2
  const renderedItems: Array<CodexBreadcrumbItem | 'ellipsis'> = shouldCollapse
    ? [items[0], 'ellipsis', ...items.slice(-trailingCount)]
    : items
  const hiddenCount = Math.max(0, items.length - safeMax + 1)

  return (
    <nav {...rest} aria-label={label} className={classNames(styles.breadcrumb, className)}>
      <ol className={styles.breadcrumbList}>
        {renderedItems.map((item, index) => {
          const isLast = index === renderedItems.length - 1
          if (item === 'ellipsis') {
            return (
              <li className={styles.breadcrumbItem} key="ellipsis">
                <span className={styles.breadcrumbSeparator} aria-hidden>{separator}</span>
                <button
                  type="button"
                  className={styles.breadcrumbExpand}
                  aria-label={`${hiddenCount} gizli seviyeyi göster`}
                  aria-expanded={expanded}
                  onClick={() => setExpanded(true)}
                >
                  <span aria-hidden>…</span>
                </button>
              </li>
            )
          }

          const current = item.current ?? isLast
          return (
            <li className={styles.breadcrumbItem} key={item.id ?? index}>
              {index > 0 ? <span className={styles.breadcrumbSeparator} aria-hidden>{separator}</span> : null}
              {current ? (
                <span className={styles.breadcrumbCurrent} aria-current="page">{item.label}</span>
              ) : item.href ? (
                <a className={styles.breadcrumbLink} href={item.href} onClick={item.onClick}>{item.label}</a>
              ) : item.onClick ? (
                <button type="button" className={styles.breadcrumbButton} onClick={item.onClick}>{item.label}</button>
              ) : (
                <span className={styles.breadcrumbText}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export interface CodexPaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  pageCount: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  hrefBuilder?: (page: number) => string
  siblingCount?: number
  disabled?: boolean
  label?: string
  previousLabel?: string
  nextLabel?: string
}

function paginationRange(page: number, pageCount: number, siblingCount: number) {
  const pages = new Set([1, pageCount])
  for (let value = page - siblingCount; value <= page + siblingCount; value += 1) {
    if (value > 1 && value < pageCount) pages.add(value)
  }
  if (page <= siblingCount + 3) {
    for (let value = 2; value <= Math.min(pageCount - 1, siblingCount * 2 + 3); value += 1) pages.add(value)
  }
  if (page >= pageCount - siblingCount - 2) {
    for (let value = Math.max(2, pageCount - siblingCount * 2 - 2); value < pageCount; value += 1) pages.add(value)
  }

  const sorted = Array.from(pages).filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)
  const output: Array<number | string> = []
  sorted.forEach((value, index) => {
    const previous = sorted[index - 1]
    if (previous && value - previous > 1) output.push(`ellipsis-${previous}`)
    output.push(value)
  })
  return output
}

export function CodexPagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  hrefBuilder,
  siblingCount = 1,
  disabled = false,
  label = 'Sayfalama',
  previousLabel = 'Önceki sayfa',
  nextLabel = 'Sonraki sayfa',
  className,
  ...rest
}: CodexPaginationProps) {
  const safeCount = Math.max(1, Math.floor(pageCount))
  const [statePage, setStatePage] = useControllableState(page, defaultPage, onPageChange)
  const currentPage = Math.min(safeCount, Math.max(1, Math.floor(statePage)))
  const range = useMemo(
    () => paginationRange(currentPage, safeCount, Math.max(0, siblingCount)),
    [currentPage, safeCount, siblingCount],
  )

  const selectPage = (nextPage: number) => {
    if (!disabled && nextPage !== currentPage && nextPage >= 1 && nextPage <= safeCount) setStatePage(nextPage)
  }

  const renderDirection = (direction: 'previous' | 'next') => {
    const previous = direction === 'previous'
    const target = currentPage + (previous ? -1 : 1)
    const unavailable = disabled || target < 1 || target > safeCount
    const accessibleLabel = previous ? previousLabel : nextLabel
    const glyph = previous ? '←' : '→'
    if (hrefBuilder && !unavailable) {
      return (
        <a className={styles.paginationDirection} href={hrefBuilder(target)} aria-label={accessibleLabel} onClick={() => selectPage(target)}>
          <span aria-hidden>{glyph}</span><span className={styles.paginationDirectionText}>{previous ? 'Önceki' : 'Sonraki'}</span>
        </a>
      )
    }
    return (
      <button type="button" className={styles.paginationDirection} aria-label={accessibleLabel} disabled={unavailable} onClick={() => selectPage(target)}>
        <span aria-hidden>{glyph}</span><span className={styles.paginationDirectionText}>{previous ? 'Önceki' : 'Sonraki'}</span>
      </button>
    )
  }

  return (
    <nav {...rest} aria-label={label} className={classNames(styles.pagination, className)}>
      {renderDirection('previous')}
      <ol className={styles.paginationList}>
        {range.map((item) => (
          <li key={item}>
            {typeof item === 'string' ? (
              <span className={styles.paginationEllipsis} aria-hidden>…</span>
            ) : hrefBuilder ? (
              <a
                className={styles.paginationPage}
                href={hrefBuilder(item)}
                aria-label={`${item}. sayfaya git`}
                aria-current={item === currentPage ? 'page' : undefined}
                data-current={item === currentPage || undefined}
                onClick={() => selectPage(item)}
              >
                {item}
              </a>
            ) : (
              <button
                type="button"
                className={styles.paginationPage}
                aria-label={`${item}. sayfaya git`}
                aria-current={item === currentPage ? 'page' : undefined}
                data-current={item === currentPage || undefined}
                disabled={disabled}
                onClick={() => selectPage(item)}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ol>
      {renderDirection('next')}
    </nav>
  )
}

export interface CodexToolbarProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  orientation?: 'horizontal' | 'vertical'
}

export function CodexToolbar({
  label,
  orientation = 'horizontal',
  className,
  children,
  onKeyDown,
  onFocusCapture,
  ...rest
}: CodexToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)

  const toolbarItems = () => {
    const toolbar = toolbarRef.current
    if (!toolbar) return []
    return getFocusable(toolbar).filter((item) => item.closest('[role="toolbar"]') === toolbar)
      .filter((item) => !item.closest('[role="menu"], [role="dialog"], [role="listbox"], [role="grid"], [role="tree"]'))
  }

  useEffect(() => {
    const items = toolbarItems()
    items.forEach((item, index) => item.setAttribute('tabindex', index === 0 ? '0' : '-1'))
  }, [children])

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof HTMLElement) {
      toolbarItems().forEach((item) => item.setAttribute('tabindex', item === target ? '0' : '-1'))
    }
    onFocusCapture?.(event)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const items = toolbarItems()
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const index = items.indexOf(target)
    if (index < 0) return

    const rtl = toolbarRef.current ? getComputedStyle(toolbarRef.current).direction === 'rtl' : false
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    let nextIndex: number | undefined
    if (event.key === previousKey) nextIndex = (index - 1 + items.length) % items.length
    if (event.key === nextKey) nextIndex = (index + 1) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    items[nextIndex]?.focus()
  }

  return (
    <div
      {...rest}
      ref={toolbarRef}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      className={classNames(styles.toolbar, orientation === 'vertical' && styles.toolbarVertical, className)}
      onFocusCapture={handleFocus}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

export interface CodexToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  separated?: boolean
}

export function CodexToolbarGroup({
  label,
  separated = false,
  className,
  children,
  ...rest
}: CodexToolbarGroupProps) {
  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      className={classNames(styles.toolbarGroup, separated && styles.toolbarGroupSeparated, className)}
    >
      {children}
    </div>
  )
}

export interface CodexSidebarItem {
  id: string
  label: ReactNode
  href?: string
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
  current?: boolean
  onSelect?: (id: string) => void
  children?: CodexSidebarItem[]
}

export interface CodexSidebarSection {
  id: string
  label?: ReactNode
  items: CodexSidebarItem[]
}

export interface CodexSidebarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  sections: CodexSidebarSection[]
  activeId?: string
  defaultActiveId?: string
  onActiveChange?: (id: string) => void
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  brand?: ReactNode
  footer?: ReactNode
  label?: string
  collapseLabel?: string
  expandLabel?: string
  mobileOpenLabel?: string
  mobileCloseLabel?: string
}

export function CodexSidebar({
  sections,
  activeId,
  defaultActiveId = '',
  onActiveChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  brand,
  footer,
  label = 'Hesap navigasyonu',
  collapseLabel = 'Kenar çubuğunu daralt',
  expandLabel = 'Kenar çubuğunu genişlet',
  mobileOpenLabel = 'Gezinmeyi aç',
  mobileCloseLabel = 'Gezinmeyi kapat',
  className,
  ...rest
}: CodexSidebarProps) {
  const [resolvedActiveId, setActiveId] = useControllableState(activeId, defaultActiveId, onActiveChange)
  const [resolvedCollapsed, setCollapsed] = useControllableState(collapsed, defaultCollapsed, onCollapsedChange)
  const [resolvedMobileOpen, setMobileOpen] = useControllableState(mobileOpen, defaultMobileOpen, onMobileOpenChange)
  const asideRef = useRef<HTMLElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const sidebarId = useId()
  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen])

  useModalFocus(resolvedMobileOpen, asideRef, mobileTriggerRef, closeMobile)
  useBodyScrollLock(resolvedMobileOpen)

  const activateItem = (item: CodexSidebarItem) => {
    if (item.disabled) return
    setActiveId(item.id)
    item.onSelect?.(item.id)
    setMobileOpen(false)
  }

  const renderItem = (item: CodexSidebarItem, nested = false): ReactNode => {
    const current = item.current ?? item.id === resolvedActiveId
    const content = (
      <>
        {item.icon ? <span className={styles.sidebarIcon} aria-hidden>{item.icon}</span> : <span className={styles.sidebarIconPlaceholder} aria-hidden />}
        <span className={styles.sidebarText}>{item.label}</span>
        {item.badge ? <span className={styles.sidebarBadge}>{item.badge}</span> : null}
      </>
    )
    const accessibleName = typeof item.label === 'string' ? item.label : undefined

    return (
      <li className={styles.sidebarListItem} key={item.id}>
        {item.disabled ? (
          <span className={styles.sidebarAction} aria-disabled="true" aria-label={accessibleName} data-nested={nested || undefined}>{content}</span>
        ) : item.href ? (
          <a
            className={styles.sidebarAction}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            aria-label={accessibleName}
            data-current={current || undefined}
            data-nested={nested || undefined}
            onClick={() => activateItem(item)}
          >
            {content}
          </a>
        ) : (
          <button
            type="button"
            className={styles.sidebarAction}
            aria-current={current ? 'page' : undefined}
            aria-label={accessibleName}
            data-current={current || undefined}
            data-nested={nested || undefined}
            onClick={() => activateItem(item)}
          >
            {content}
          </button>
        )}
        {item.children?.length ? <ul className={styles.sidebarSublist}>{item.children.map((child) => renderItem(child, true))}</ul> : null}
      </li>
    )
  }

  return (
    <div
      {...rest}
      className={classNames(styles.sidebarRoot, className)}
      data-collapsed={resolvedCollapsed || undefined}
      data-mobile-open={resolvedMobileOpen || undefined}
    >
      <button
        ref={mobileTriggerRef}
        type="button"
        className={styles.sidebarMobileTrigger}
        aria-label={mobileOpenLabel}
        aria-expanded={resolvedMobileOpen}
        aria-controls={sidebarId}
        onClick={() => setMobileOpen(true)}
      >
        <span aria-hidden>☰</span>
      </button>
      {resolvedMobileOpen ? (
        <button type="button" className={styles.sidebarBackdrop} tabIndex={-1} aria-label={mobileCloseLabel} onClick={closeMobile} />
      ) : null}
      <aside ref={asideRef} id={sidebarId} className={styles.sidebar} aria-label={label} tabIndex={-1}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>{brand ?? <strong>Parsel Pro</strong>}</div>
          <button type="button" className={styles.sidebarMobileClose} aria-label={mobileCloseLabel} onClick={closeMobile}>
            <span aria-hidden>×</span>
          </button>
        </div>
        <nav className={styles.sidebarNav} aria-label={label}>
          {sections.map((section) => {
            const sectionLabelId = `${sidebarId}-${section.id}`
            return (
              <section className={styles.sidebarSection} aria-labelledby={section.label ? sectionLabelId : undefined} key={section.id}>
                {section.label ? <h2 className={styles.sidebarSectionLabel} id={sectionLabelId}>{section.label}</h2> : null}
                <ul className={styles.sidebarList}>{section.items.map((item) => renderItem(item))}</ul>
              </section>
            )
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          {footer ? <div className={styles.sidebarFooterContent}>{footer}</div> : null}
          <button
            type="button"
            className={styles.sidebarCollapse}
            aria-label={resolvedCollapsed ? expandLabel : collapseLabel}
            aria-pressed={resolvedCollapsed}
            onClick={() => setCollapsed(!resolvedCollapsed)}
          >
            <span aria-hidden>{resolvedCollapsed ? '→' : '←'}</span>
            <span className={styles.sidebarText}>{resolvedCollapsed ? 'Genişlet' : 'Daralt'}</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export interface CodexMenuActionItem {
  type?: 'item'
  id: string
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
  shortcut?: string
  href?: string
  disabled?: boolean
  danger?: boolean
  onSelect?: () => void
}

export interface CodexMenuSeparatorItem {
  id: string
  type: 'separator'
}

export type CodexMenuItem = CodexMenuActionItem | CodexMenuSeparatorItem

export interface CodexMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: CodexMenuItem[]
  trigger: ReactNode
  triggerLabel?: string
  label?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'start' | 'end'
  disabled?: boolean
}

export function CodexMenu({
  items,
  trigger,
  triggerLabel,
  label = 'İşlem menüsü',
  open,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  disabled = false,
  className,
  ...rest
}: CodexMenuProps) {
  const [resolvedOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const focusEdge = useRef<'first' | 'last'>('first')
  const outsideRefs = useMemo(() => [triggerRef, menuRef], [])

  const closeFromOutside = useCallback(() => setOpen(false), [setOpen])
  useOutsideDismiss(resolvedOpen, outsideRefs, closeFromOutside)

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])

  useEffect(() => {
    if (!resolvedOpen) return
    const frame = window.requestAnimationFrame(() => {
      const availableItems = menuItems()
      const target = focusEdge.current === 'last' ? availableItems[availableItems.length - 1] : availableItems[0]
      target?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [resolvedOpen])

  const openAt = (edge: 'first' | 'last') => {
    if (disabled) return
    focusEdge.current = edge
    setOpen(true)
  }

  const closeAndRestore = () => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openAt(event.key === 'ArrowUp' ? 'last' : 'first')
    }
  }

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const availableItems = menuItems()
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const index = availableItems.indexOf(target)
    let nextIndex: number | undefined
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % availableItems.length
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + availableItems.length) % availableItems.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = availableItems.length - 1
    if (event.key === 'Escape') {
      event.preventDefault()
      closeAndRestore()
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (nextIndex === undefined || availableItems.length === 0) return
    event.preventDefault()
    availableItems[nextIndex]?.focus()
  }

  const selectItem = (item: CodexMenuActionItem) => {
    if (item.disabled) return
    item.onSelect?.()
    closeAndRestore()
  }

  return (
    <div {...rest} className={classNames(styles.floatingRoot, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.floatingTrigger}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={resolvedOpen}
        aria-controls={resolvedOpen ? menuId : undefined}
        disabled={disabled}
        onClick={() => resolvedOpen ? closeAndRestore() : openAt('first')}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>
      {resolvedOpen ? (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} className={styles.menu} data-align={align} onKeyDown={handleMenuKeyDown}>
          {items.map((item) => item.type === 'separator' ? (
            <div className={styles.menuSeparator} role="separator" key={item.id} />
          ) : item.href && !item.disabled ? (
            <a
              className={styles.menuItem}
              role="menuitem"
              href={item.href}
              data-danger={item.danger || undefined}
              tabIndex={-1}
              key={item.id}
              onClick={() => selectItem(item)}
            >
              {item.icon ? <span className={styles.menuIcon} aria-hidden>{item.icon}</span> : null}
              <span className={styles.menuCopy}><span className={styles.menuLabel}>{item.label}</span>{item.description ? <span className={styles.menuDescription}>{item.description}</span> : null}</span>
              {item.shortcut ? <kbd className={styles.menuShortcut}>{item.shortcut}</kbd> : null}
            </a>
          ) : (
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              aria-disabled={item.disabled || undefined}
              data-danger={item.danger || undefined}
              tabIndex={-1}
              key={item.id}
              onClick={() => selectItem(item)}
            >
              {item.icon ? <span className={styles.menuIcon} aria-hidden>{item.icon}</span> : null}
              <span className={styles.menuCopy}><span className={styles.menuLabel}>{item.label}</span>{item.description ? <span className={styles.menuDescription}>{item.description}</span> : null}</span>
              {item.shortcut ? <kbd className={styles.menuShortcut}>{item.shortcut}</kbd> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export interface CodexPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  trigger: ReactNode
  triggerLabel?: string
  title?: ReactNode
  description?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  closeLabel?: string
}

export function CodexPopover({
  trigger,
  triggerLabel,
  title,
  description,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  closeLabel = 'Bilgi penceresini kapat',
  className,
  children,
  ...rest
}: CodexPopoverProps) {
  const [resolvedOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()
  const descriptionId = useId()
  const outsideRefs = useMemo(() => [triggerRef, panelRef], [])
  const closeFromOutside = useCallback(() => setOpen(false), [setOpen])

  useOutsideDismiss(resolvedOpen, outsideRefs, closeFromOutside)

  useEffect(() => {
    if (!resolvedOpen) return
    const frame = window.requestAnimationFrame(() => (getFocusable(panelRef.current)[0] ?? panelRef.current)?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInsideNestedLayer(event, panelRef.current)) return
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [resolvedOpen, setOpen])

  const closeAndRestore = () => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div {...rest} className={classNames(styles.floatingRoot, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.floatingTrigger}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={resolvedOpen}
        aria-controls={resolvedOpen ? panelId : undefined}
        onClick={() => resolvedOpen ? closeAndRestore() : setOpen(true)}
      >
        {trigger}
      </button>
      {resolvedOpen ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : triggerLabel ?? 'Bilgi penceresi'}
          aria-describedby={description ? descriptionId : undefined}
          className={styles.popover}
          data-placement={placement}
          tabIndex={-1}
        >
          <div className={styles.popoverHeader}>
            <div className={styles.popoverHeading}>
              {title ? <h2 className={styles.popoverTitle} id={titleId}>{title}</h2> : null}
              {description ? <p className={styles.popoverDescription} id={descriptionId}>{description}</p> : null}
            </div>
            <button type="button" className={styles.overlayClose} aria-label={closeLabel} onClick={closeAndRestore}><span aria-hidden>×</span></button>
          </div>
          <div className={styles.popoverBody}>{children}</div>
        </div>
      ) : null}
    </div>
  )
}

export type CodexModalSize = 'sm' | 'md' | 'lg'

export interface CodexModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerLabel?: ReactNode
  closeLabel?: string
  size?: CodexModalSize
  dismissOnBackdrop?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
}

const modalSizeClasses: Record<CodexModalSize, string> = {
  sm: styles.modalSm,
  md: styles.modalMd,
  lg: styles.modalLg,
}

export function CodexModal({
  title,
  description,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  triggerLabel,
  closeLabel = 'Pencereyi kapat',
  size = 'md',
  dismissOnBackdrop = true,
  initialFocusRef,
  returnFocusRef,
  className,
  children,
  ...rest
}: CodexModalProps) {
  const [resolvedOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const dialogId = useId()
  const dismiss = useCallback(() => setOpen(false), [setOpen])

  useModalFocus(resolvedOpen, dialogRef, returnFocusRef ?? triggerRef, dismiss, initialFocusRef)
  useBodyScrollLock(resolvedOpen)

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (dismissOnBackdrop && event.target === event.currentTarget) dismiss()
  }

  return (
    <div {...rest} className={classNames(styles.overlayRoot, className)}>
      {triggerLabel ? (
        <button
          ref={triggerRef}
          type="button"
          className={styles.overlayTrigger}
          aria-haspopup="dialog"
          aria-expanded={resolvedOpen}
          aria-controls={resolvedOpen ? dialogId : undefined}
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      ) : null}
      {resolvedOpen ? (
        <div className={styles.modalBackdrop} onMouseDown={handleBackdropMouseDown}>
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={classNames(styles.modal, modalSizeClasses[size])}
            tabIndex={-1}
          >
            <header className={styles.dialogHeader}>
              <div className={styles.dialogHeading}>
                <h2 className={styles.dialogTitle} id={titleId}>{title}</h2>
                {description ? <p className={styles.dialogDescription} id={descriptionId}>{description}</p> : null}
              </div>
              <button type="button" className={styles.overlayClose} aria-label={closeLabel} onClick={dismiss}><span aria-hidden>×</span></button>
            </header>
            <div className={styles.dialogBody}>{children}</div>
            {footer ? <footer className={styles.dialogFooter}>{footer}</footer> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface CodexDrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerLabel?: ReactNode
  closeLabel?: string
  side?: 'start' | 'end'
  dismissOnBackdrop?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function CodexDrawer({
  title,
  description,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  triggerLabel,
  closeLabel = 'Paneli kapat',
  side = 'end',
  dismissOnBackdrop = true,
  initialFocusRef,
  returnFocusRef,
  className,
  children,
  ...rest
}: CodexDrawerProps) {
  const [resolvedOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const drawerId = useId()
  const dismiss = useCallback(() => setOpen(false), [setOpen])

  useModalFocus(resolvedOpen, drawerRef, returnFocusRef ?? triggerRef, dismiss, initialFocusRef)
  useBodyScrollLock(resolvedOpen)

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (dismissOnBackdrop && event.target === event.currentTarget) dismiss()
  }

  return (
    <div {...rest} className={classNames(styles.overlayRoot, className)}>
      {triggerLabel ? (
        <button
          ref={triggerRef}
          type="button"
          className={styles.overlayTrigger}
          aria-haspopup="dialog"
          aria-expanded={resolvedOpen}
          aria-controls={resolvedOpen ? drawerId : undefined}
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      ) : null}
      {resolvedOpen ? (
        <div className={styles.drawerBackdrop} onMouseDown={handleBackdropMouseDown}>
          <div
            ref={drawerRef}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={styles.drawer}
            data-side={side}
            tabIndex={-1}
          >
            <header className={styles.dialogHeader}>
              <div className={styles.dialogHeading}>
                <h2 className={styles.dialogTitle} id={titleId}>{title}</h2>
                {description ? <p className={styles.dialogDescription} id={descriptionId}>{description}</p> : null}
              </div>
              <button type="button" className={styles.overlayClose} aria-label={closeLabel} onClick={dismiss}><span aria-hidden>×</span></button>
            </header>
            <div className={styles.dialogBody}>{children}</div>
            {footer ? <footer className={styles.dialogFooter}>{footer}</footer> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export type CodexToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface CodexToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  tone?: CodexToastTone
  actionLabel?: ReactNode
  onAction?: () => void
  dismissOnAction?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  duration?: number
}

const toastToneClasses: Record<CodexToastTone, string> = {
  neutral: styles.toastNeutral,
  info: styles.toastInfo,
  success: styles.toastSuccess,
  warning: styles.toastWarning,
  danger: styles.toastDanger,
}

const toastIcons: Record<CodexToastTone, string> = {
  neutral: '•',
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '×',
}

export function CodexToast({
  title,
  tone = 'neutral',
  actionLabel,
  onAction,
  dismissOnAction = false,
  onDismiss,
  dismissLabel = 'Bildirimi kapat',
  visible,
  defaultVisible = true,
  onVisibleChange,
  duration = 0,
  className,
  children,
  ...rest
}: CodexToastProps) {
  const [resolvedVisible, setVisible] = useControllableState(visible, defaultVisible, onVisibleChange)
  const [paused, setPaused] = useState(false)

  const dismiss = useCallback(() => {
    setVisible(false)
    onDismiss?.()
  }, [onDismiss, setVisible])

  useEffect(() => {
    if (!resolvedVisible || paused || duration <= 0) return
    const timer = window.setTimeout(dismiss, duration)
    return () => window.clearTimeout(timer)
  }, [dismiss, duration, paused, resolvedVisible])

  if (!resolvedVisible) return null

  const role = tone === 'danger' || tone === 'warning' ? 'alert' : 'status'

  return (
    <div
      {...rest}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={classNames(styles.toast, toastToneClasses[tone], className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <span className={styles.toastIcon} aria-hidden>{toastIcons[tone]}</span>
      <div className={styles.toastCopy}>
        <strong className={styles.toastTitle}>{title}</strong>
        {children ? <div className={styles.toastDescription}>{children}</div> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={styles.toastAction}
          onClick={() => {
            onAction()
            if (dismissOnAction) dismiss()
          }}
        >
          {actionLabel}
        </button>
      ) : null}
      {onDismiss || visible === undefined ? (
        <button type="button" className={styles.toastDismiss} aria-label={dismissLabel} onClick={dismiss}><span aria-hidden>×</span></button>
      ) : null}
    </div>
  )
}
