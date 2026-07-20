import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react'
import { CodexBadge, CodexButton, CodexIconButton } from '../controls'
import styles from './CodexContent.module.css'

type SemanticTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

export interface CodexSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside'
  treatment?: 'outlined' | 'tonal' | 'elevated' | 'glass'
  radius?: 'compact' | 'card' | 'panel'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/** İçerik yüzeyi: outline ve shadow aynı anda dekorasyon olarak kullanılmaz. */
export function CodexSurface({
  as: Component = 'div',
  treatment = 'outlined',
  radius = 'card',
  padding = 'md',
  className,
  ...rest
}: CodexSurfaceProps) {
  return (
    <Component
      className={[
        styles.surface,
        styles[`surface_${treatment}`],
        styles[`radius_${radius}`],
        styles[`padding_${padding}`],
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}

export interface CodexListingCardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  title: string
  price: string
  location: string
  meta?: string
  image?: { src: string; alt: string }
  mediaLabel?: string
  mediaTone?: 'forest' | 'coast' | 'earth' | 'city'
  badge?: string
  badgeTone?: SemanticTone
  favorite?: boolean
  variant?: 'grid' | 'featured' | 'row'
  headingAs?: 'h2' | 'h3' | 'h4'
  onOpen?: () => void
  onFavoriteChange?: (next: boolean) => void
}

/** İlan içeriğini camdan ayıran, başlık ve fiyatı taranabilir tutan flat kart. */
export function CodexListingCard({
  title,
  price,
  location,
  meta,
  image,
  mediaLabel,
  mediaTone = 'forest',
  badge,
  badgeTone = 'neutral',
  favorite = false,
  variant = 'grid',
  headingAs: ListingHeading = 'h3',
  onOpen,
  onFavoriteChange,
  className,
  ...rest
}: CodexListingCardProps) {
  return (
    <article
      {...rest}
      className={[styles.listing, styles[`listing_${variant}`], className].filter(Boolean).join(' ')}
      data-interactive={onOpen ? 'true' : undefined}
    >
      <div className={styles.listingMedia} data-tone={mediaTone}>
        {image ? <img src={image.src} alt={image.alt} /> : (
          <div className={styles.parcelGraphic} role="img" aria-label={mediaLabel ?? `${location} için temsili parsel görünümü`}>
            <span className={styles.parcelRoad} />
            <span className={styles.parcelPlot} />
            <span className={styles.parcelLabel}>{mediaLabel ?? location.split(',')[0]}</span>
          </div>
        )}
        {badge ? <CodexBadge tone={badgeTone} className={styles.listingBadge}>{badge}</CodexBadge> : null}
        {onFavoriteChange ? (
          <CodexIconButton
            label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            pressed={favorite}
            shape="square"
            size="sm"
            className={styles.favorite}
            onClick={() => onFavoriteChange(!favorite)}
          >
            <HeartIcon filled={favorite} />
          </CodexIconButton>
        ) : null}
      </div>

      <div className={styles.listingBody}>
        <div className={styles.listingCopy}>
          <p className={styles.listingLocation}>{location}</p>
          <ListingHeading className={styles.listingTitle}>
            {onOpen ? <button type="button" onClick={onOpen}>{title}</button> : title}
          </ListingHeading>
          {meta ? <p className={styles.listingMeta}>{meta}</p> : null}
        </div>
        <div className={styles.listingPriceRow}>
          <strong className={styles.listingPrice}>{price}</strong>
          {onOpen ? <span className={styles.openHint} aria-hidden><ArrowIcon /></span> : null}
        </div>
      </div>
    </article>
  )
}

export interface CodexNoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Exclude<SemanticTone, 'neutral' | 'accent'>
  title: string
  action?: ReactNode
}

export function CodexNotice({ tone = 'info', title, action, children, className, ...rest }: CodexNoticeProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={[styles.notice, styles[`notice_${tone}`], className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className={styles.noticeIcon}><InfoIcon /></span>
      <div className={styles.noticeCopy}>
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
      {action ? <div className={styles.noticeAction}>{action}</div> : null}
    </div>
  )
}

export interface CodexStatProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  change?: string
  direction?: 'up' | 'down' | 'steady'
}

export function CodexStat({ label, value, change, direction = 'steady', className, ...rest }: CodexStatProps) {
  const directionLabel = direction === 'up' ? 'Yükseliş' : direction === 'down' ? 'Düşüş' : 'Değişim'
  const directionIcon = direction === 'up' ? '↗' : direction === 'down' ? '↘' : null

  return (
    <div className={[styles.stat, className].filter(Boolean).join(' ')} {...rest}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
      {change ? (
        <span className={styles.statChange} data-direction={direction}>
          <span className={styles.visuallyHidden}>{directionLabel}: </span>
          {directionIcon ? <span className={styles.statDirectionIcon} aria-hidden>{directionIcon}</span> : null}
          {change}
        </span>
      ) : null}
    </div>
  )
}

interface CodexHeaderLinkBase {
  label: string
  active?: boolean
}

export type CodexHeaderLink = CodexHeaderLinkBase & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
)

export interface CodexHeaderProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode
  links?: CodexHeaderLink[]
  actions?: ReactNode
  compact?: boolean
  homeHref?: string
}

/** İçerik zemininden ayrılan sakin header; cam yalnız kompakt chrome yüzeyinde. */
export function CodexHeader({
  logo = 'parsel',
  links = [],
  actions,
  compact = false,
  homeHref = '/',
  className,
  ...rest
}: CodexHeaderProps) {
  return (
    <header className={[styles.header, compact ? styles.headerCompact : '', className].filter(Boolean).join(' ')} {...rest}>
      <a href="#main-content" className={styles.skipLink}>İçeriğe geç</a>
      <div className={styles.headerInner}>
        <a href={homeHref} className={styles.wordmark} aria-label="Parsel ana sayfa">
          <span aria-hidden>p/</span>{logo}
        </a>
        {links.length ? (
          <nav aria-label="Ana navigasyon" className={styles.headerNav}>
            {links.map((link) => link.href !== undefined ? (
              <a key={link.label} href={link.href} aria-current={link.active ? 'page' : undefined}>
                {link.label}
              </a>
            ) : (
              <button key={link.label} type="button" aria-current={link.active ? 'page' : undefined} onClick={link.onClick}>
                {link.label}
              </button>
            ))}
          </nav>
        ) : null}
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </div>
    </header>
  )
}

export interface CodexEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
  compact?: boolean
  headingAs?: 'h2' | 'h3' | 'h4'
}

export function CodexEmptyState({ title, description, action, icon, compact = false, headingAs: EmptyHeading = 'h3', className, ...rest }: CodexEmptyStateProps) {
  return (
    <div className={[styles.empty, compact ? styles.emptyCompact : '', className].filter(Boolean).join(' ')} {...rest}>
      {icon ? <span className={styles.emptyIcon}>{icon}</span> : null}
      <div>
        <EmptyHeading>{title}</EmptyHeading>
        <p>{description}</p>
      </div>
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  )
}

export interface CodexFilterPanelProps extends HTMLAttributes<HTMLElement> {
  title?: string
  resultCount?: string
  footer?: ReactNode
  onReset?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

export function CodexFilterPanel({
  title = 'Filtreler',
  resultCount,
  footer,
  onReset,
  children,
  className,
  ...rest
}: CodexFilterPanelProps) {
  return (
    <aside className={[styles.filters, className].filter(Boolean).join(' ')} aria-label={title} {...rest}>
      <div className={styles.filtersHeader}>
        <div>
          <h2>{title}</h2>
          {resultCount ? <p>{resultCount}</p> : null}
        </div>
        {onReset ? <CodexButton variant="quiet" size="sm" onClick={onReset}>Temizle</CodexButton> : null}
      </div>
      <div className={styles.filtersBody}>{children}</div>
      {footer ? <div className={styles.filtersFooter}>{footer}</div> : null}
    </aside>
  )
}

export type CodexContentStyleVars = CSSProperties & Record<`--${string}`, string | number>
