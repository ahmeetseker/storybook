import * as React from 'react'
import { cn } from '@/lib/utils'
import styles from './breadcrumb.module.css'

/**
 * shadcn/origin-ui breadcrumb'ının bu projedeki karşılığı: aynı parça API'si
 * (Breadcrumb / BreadcrumbList / BreadcrumbItem / BreadcrumbLink /
 * BreadcrumbPage / BreadcrumbSeparator / BreadcrumbEllipsis), aynı düz
 * görünüm — ama Tailwind sınıfları yerine `--lg-*` token'larını tüketen bir
 * CSS module ile. Radix `Slot` bağımlılığı yerine `asChild` küçük bir
 * `cloneElement` ile karşılanır.
 */

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode
  }
>(({ separator: _separator, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props} />
))
Breadcrumb.displayName = 'Breadcrumb'

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn(styles.list, className)} {...props} />
  ),
)
BreadcrumbList.displayName = 'BreadcrumbList'

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn(styles.item, className)} {...props} />
  ),
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean
  }
>(({ asChild, className, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      ...props,
      className: cn(styles.link, child.props.className, className),
    })
  }

  return (
    <a ref={ref} className={cn(styles.link, className)} {...props}>
      {children}
    </a>
  )
})
BreadcrumbLink.displayName = 'BreadcrumbLink'

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(styles.page, className)}
      {...props}
    />
  ),
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li role="presentation" aria-hidden="true" className={cn(styles.separator, className)} {...props}>
    {children ?? <ChevronRightIcon />}
  </li>
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn(styles.ellipsis, className)}
    {...props}
  >
    <DotsHorizontalIcon />
  </span>
)
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

/** lucide `chevron-right` — tek kullanım için bağımlılık eklemek yerine inline. */
const ChevronRightIcon = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

/** lucide `more-horizontal` — inline, bkz. ChevronRightIcon notu. */
const DotsHorizontalIcon = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden
  >
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
)

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
