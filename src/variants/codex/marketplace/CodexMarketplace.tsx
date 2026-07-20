import {
  useId,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { CodexBadge, CodexButton, CodexIconButton, CodexSwitch } from '../controls'
import { CodexEmptyState, CodexSurface } from '../content'
import { CodexScoreMeter } from '../data'
import styles from './CodexMarketplace.module.css'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.3 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function VerifiedIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m7 12 3 3 7-7" /><circle cx="12" cy="12" r="9" /></svg>
}

export interface CodexPriceHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string
  location: string
  price: string
  unitPrice?: string
  previousPrice?: string
  referenceId?: string
  badges?: ReactNode
  actions?: ReactNode
  favorite?: boolean
  onFavoriteChange?: (next: boolean) => void
  headingAs?: 'h1' | 'h2'
}

export function CodexPriceHeader({
  title,
  location,
  price,
  unitPrice,
  previousPrice,
  referenceId,
  badges,
  actions,
  favorite = false,
  onFavoriteChange,
  headingAs: Heading = 'h1',
  className,
  ...rest
}: CodexPriceHeaderProps) {
  return (
    <header className={classNames(styles.priceHeader, className)} {...rest}>
      <div className={styles.priceHeaderMain}>
        <div className={styles.priceContext}>
          <span>{location}</span>
          {referenceId ? <span>İlan no {referenceId}</span> : null}
        </div>
        <Heading>{title}</Heading>
        {badges ? <div className={styles.badgeRow}>{badges}</div> : null}
      </div>
      <div className={styles.priceBlock}>
        <div>
          <strong>{price}</strong>
          {unitPrice ? <span>{unitPrice}</span> : null}
          {previousPrice ? <del><span className={styles.srOnly}>Önceki fiyat: </span>{previousPrice}</del> : null}
        </div>
        <div className={styles.priceActions}>
          {onFavoriteChange ? (
            <CodexIconButton
              label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              pressed={favorite}
              onClick={() => onFavoriteChange(!favorite)}
              icon={<HeartIcon filled={favorite} />}
            />
          ) : null}
          {actions}
        </div>
      </div>
    </header>
  )
}

export interface CodexOrganizationStat {
  label: string
  value: string
}

export interface CodexAgencyCardProps extends HTMLAttributes<HTMLElement> {
  name: string
  location: string
  description?: string
  initials?: string
  verified?: boolean
  premium?: boolean
  responseTime?: string
  activeSince?: string
  stats?: CodexOrganizationStat[]
  onViewStore?: () => void
  onContact?: () => void
  compact?: boolean
}

export function CodexAgencyCard({
  name,
  location,
  description,
  initials,
  verified = false,
  premium = false,
  responseTime,
  activeSince,
  stats = [],
  onViewStore,
  onContact,
  compact = false,
  className,
  ...rest
}: CodexAgencyCardProps) {
  return (
    <article className={classNames(styles.agency, compact && styles.agencyCompact, className)} {...rest}>
      <div className={styles.agencyIdentity}>
        <span className={styles.agencyMark} aria-hidden>{initials ?? name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>
        <div>
          <div className={styles.agencyNameRow}>
            <h3>{name}</h3>
            {verified ? <span className={styles.verified} title="Kurumsal hesap doğrulandı"><VerifiedIcon /><span className={styles.srOnly}>Doğrulandı</span></span> : null}
          </div>
          <p>{location}</p>
        </div>
        {premium ? <CodexBadge tone="accent">Kurumsal Plus</CodexBadge> : null}
      </div>
      {description && !compact ? <p className={styles.agencyDescription}>{description}</p> : null}
      {stats.length && !compact ? (
        <dl className={styles.agencyStats}>
          {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
        </dl>
      ) : null}
      <div className={styles.agencyTrust}>
        {responseTime ? <span><strong>Yanıt:</strong> {responseTime}</span> : null}
        {activeSince ? <span><strong>Üyelik:</strong> {activeSince}</span> : null}
      </div>
      {(onViewStore || onContact) ? (
        <div className={styles.agencyActions}>
          {onViewStore ? <CodexButton variant="secondary" size={compact ? 'sm' : 'md'} onClick={onViewStore}>Mağazayı aç</CodexButton> : null}
          {onContact ? <CodexButton size={compact ? 'sm' : 'md'} onClick={onContact}>Mesaj gönder</CodexButton> : null}
        </div>
      ) : null}
    </article>
  )
}

export interface CodexSellerCardProps extends HTMLAttributes<HTMLElement> {
  name: string
  accountType?: 'individual' | 'professional'
  initials?: string
  verified?: boolean
  joinedAt: string
  responseRate?: string
  responseTime?: string
  phoneVerified?: boolean
  identityVerified?: boolean
  onMessage?: () => void
  onRevealPhone?: () => void
}

export function CodexSellerCard({
  name,
  accountType = 'individual',
  initials,
  verified = false,
  joinedAt,
  responseRate,
  responseTime,
  phoneVerified = false,
  identityVerified = false,
  onMessage,
  onRevealPhone,
  className,
  ...rest
}: CodexSellerCardProps) {
  return (
    <aside className={classNames(styles.seller, className)} aria-label="İlan sahibi" {...rest}>
      <div className={styles.sellerTop}>
        <span className={styles.sellerAvatar} aria-hidden>{initials ?? name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <div>
          <div className={styles.sellerName}><h2>{name}</h2>{verified ? <VerifiedIcon /> : null}</div>
          <p>{accountType === 'professional' ? 'Profesyonel satıcı' : 'Bireysel ilan sahibi'} · {joinedAt}</p>
        </div>
      </div>
      <dl className={styles.sellerMetrics}>
        {responseRate ? <div><dt>Yanıt oranı</dt><dd>{responseRate}</dd></div> : null}
        {responseTime ? <div><dt>Ortalama yanıt</dt><dd>{responseTime}</dd></div> : null}
      </dl>
      <ul className={styles.verificationList} aria-label="Doğrulamalar">
        <li data-verified={identityVerified || undefined}><span aria-hidden>{identityVerified ? '✓' : '–'}</span> Kimlik doğrulaması</li>
        <li data-verified={phoneVerified || undefined}><span aria-hidden>{phoneVerified ? '✓' : '–'}</span> Telefon doğrulaması</li>
      </ul>
      <div className={styles.sellerActions}>
        {onMessage ? <CodexButton fullWidth onClick={onMessage}>Mesaj gönder</CodexButton> : null}
        {onRevealPhone ? <CodexButton fullWidth variant="secondary" onClick={onRevealPhone}>Telefonu göster</CodexButton> : null}
      </div>
      <p className={styles.safetyCopy}>Kapora göndermeden önce ilan bilgilerini ve satıcının yetkisini doğrulayın.</p>
    </aside>
  )
}

export interface CodexLocationFact {
  label: string
  value: string
}

export interface CodexLocationCardProps extends HTMLAttributes<HTMLElement> {
  title: string
  address: string
  privacyLabel?: string
  coordinates?: string
  facts?: CodexLocationFact[]
  nearby?: string[]
  onOpenMap?: () => void
}

export function CodexLocationCard({
  title,
  address,
  privacyLabel = 'Konum yaklaşık olarak gösteriliyor',
  coordinates,
  facts = [],
  nearby = [],
  onOpenMap,
  className,
  ...rest
}: CodexLocationCardProps) {
  return (
    <section className={classNames(styles.location, className)} aria-labelledby="codex-location-title" {...rest}>
      <div className={styles.locationMap} role="img" aria-label={`${title} için yaklaşık harita görünümü`}>
        <span className={styles.mapRoadA} />
        <span className={styles.mapRoadB} />
        <span className={styles.mapWater} />
        <span className={styles.mapPin}><span className={styles.srOnly}>{title}</span></span>
        <span className={styles.mapPrivacy}>{privacyLabel}</span>
      </div>
      <div className={styles.locationBody}>
        <div>
          <h2 id="codex-location-title">{title}</h2>
          <p>{address}</p>
          {coordinates ? <code>{coordinates}</code> : null}
        </div>
        {facts.length ? <dl>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
        {nearby.length ? <ul aria-label="Yakındaki yerler">{nearby.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        {onOpenMap ? <CodexButton variant="secondary" onClick={onOpenMap}>Haritada aç</CodexButton> : null}
      </div>
    </section>
  )
}

export type CodexValuationFeedback = 'accurate' | 'high' | 'low'

export interface CodexValuationDriver {
  label: string
  effect: string
  direction: 'positive' | 'negative' | 'neutral'
}

export interface CodexValuationCardProps extends HTMLAttributes<HTMLElement> {
  title?: string
  estimate: string
  low: string
  high: string
  confidence: number
  updatedAt: string
  comparables: number
  drivers?: CodexValuationDriver[]
  feedback?: CodexValuationFeedback
  onFeedbackChange?: (value: CodexValuationFeedback) => void
  onOpenReport?: () => void
  compact?: boolean
}

export function CodexValuationCard({
  title = 'AI destekli değer tahmini',
  estimate,
  low,
  high,
  confidence,
  updatedAt,
  comparables,
  drivers = [],
  feedback,
  onFeedbackChange,
  onOpenReport,
  compact = false,
  className,
  ...rest
}: CodexValuationCardProps) {
  const helpId = useId()
  return (
    <section className={classNames(styles.valuation, compact && styles.valuationCompact, className)} aria-labelledby="valuation-title" {...rest}>
      <header>
        <div><h2 id="valuation-title">{title}</h2><p>{updatedAt} · {comparables} doğrulanmış emsal</p></div>
        <CodexBadge tone="info" dot>Model tahmini</CodexBadge>
      </header>
      <div className={styles.valuationPrice}>
        <span>Tahmini değer</span>
        <strong>{estimate}</strong>
        <p id={helpId}>{low} – {high} güven aralığı</p>
      </div>
      <CodexScoreMeter label="Model güveni" value={confidence} tone={confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'danger'} description={`${comparables} emsal ve ilan özellikleri kullanıldı.`} />
      {drivers.length && !compact ? (
        <ul className={styles.driverList} aria-label="Değer etkenleri">
          {drivers.map((driver) => (
            <li key={driver.label} data-direction={driver.direction}>
              <span>{driver.label}</span><strong>{driver.effect}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      {onFeedbackChange && !compact ? (
        <fieldset className={styles.feedbackGroup}>
          <legend>Bu tahmin size göre nasıl?</legend>
          <div>
            {([
              ['low', 'Düşük'],
              ['accurate', 'Uygun'],
              ['high', 'Yüksek'],
            ] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={feedback === value} onClick={() => onFeedbackChange(value)}>{label}</button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <footer>
        <p>Bu değer ekspertiz raporu veya resmi değerleme yerine geçmez.</p>
        {onOpenReport ? <CodexButton variant="quiet" size="sm" onClick={onOpenReport}>Hesaplama ayrıntısı</CodexButton> : null}
      </footer>
    </section>
  )
}

export interface CodexReviewCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  author: string
  initials?: string
  role?: string
  rating: number
  date: string
  datetime?: string
  title?: string
  body: string
  verifiedTransaction?: boolean
  response?: { author: string; body: string; date: string }
}

export function CodexReviewCard({
  author,
  initials,
  role,
  rating,
  date,
  datetime,
  title,
  body,
  verifiedTransaction = false,
  response,
  className,
  ...rest
}: CodexReviewCardProps) {
  const safeRating = Math.min(Math.max(Math.round(rating), 0), 5)
  return (
    <article className={classNames(styles.review, className)} {...rest}>
      <header>
        <span className={styles.sellerAvatar} aria-hidden>{initials ?? author.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <div><h3>{author}</h3>{role ? <p>{role}</p> : null}</div>
        <time dateTime={datetime}>{date}</time>
      </header>
      <div className={styles.rating} aria-label={`${safeRating}/5 puan`}>
        <span aria-hidden>{'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}</span>
        {verifiedTransaction ? <CodexBadge tone="success" dot>Doğrulanmış işlem</CodexBadge> : null}
      </div>
      {title ? <h4>{title}</h4> : null}
      <p className={styles.reviewBody}>{body}</p>
      {response ? (
        <aside className={styles.reviewResponse} aria-label={`${response.author} yanıtı`}>
          <div><strong>{response.author}</strong><span>{response.date}</span></div>
          <p>{response.body}</p>
        </aside>
      ) : null}
    </article>
  )
}

export type CodexTrustStatus = 'verified' | 'pending' | 'warning' | 'unavailable'

export interface CodexTrustSignal {
  id: string
  label: string
  description: string
  status: CodexTrustStatus
  source?: string
  updatedAt?: string
  action?: ReactNode
}

export interface CodexTrustPanelProps extends HTMLAttributes<HTMLElement> {
  title?: string
  score?: number
  signals: CodexTrustSignal[]
  compact?: boolean
}

const trustStatusCopy: Record<CodexTrustStatus, string> = {
  verified: 'Doğrulandı',
  pending: 'İnceleniyor',
  warning: 'Kontrol gerekli',
  unavailable: 'Bilgi yok',
}

const trustStatusTone: Record<CodexTrustStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  warning: 'danger',
  unavailable: 'neutral',
}

export function CodexTrustPanel({ title = 'Güven ve doğrulama', score, signals, compact = false, className, ...rest }: CodexTrustPanelProps) {
  return (
    <section className={classNames(styles.trust, compact && styles.trustCompact, className)} {...rest}>
      <header>
        <div><h2>{title}</h2><p>Resmi ve ilan sahibi kaynaklarının son durumu</p></div>
        {score !== undefined ? <strong aria-label={`Güven puanı ${score}/100`}>{score}<small>/100</small></strong> : null}
      </header>
      <ul>
        {signals.map((signal) => (
          <li key={signal.id} data-status={signal.status}>
            <span className={styles.trustIcon} aria-hidden>{signal.status === 'verified' ? '✓' : signal.status === 'pending' ? '…' : signal.status === 'warning' ? '!' : '–'}</span>
            <div>
              <div className={styles.trustLabel}><strong>{signal.label}</strong><CodexBadge tone={trustStatusTone[signal.status]}>{trustStatusCopy[signal.status]}</CodexBadge></div>
              {!compact ? <p>{signal.description}</p> : null}
              {(signal.source || signal.updatedAt) && !compact ? <small>{signal.source}{signal.source && signal.updatedAt ? ' · ' : ''}{signal.updatedAt}</small> : null}
            </div>
            {signal.action ? <div className={styles.trustAction}>{signal.action}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

export type CodexRiskLevel = 'low' | 'moderate' | 'high' | 'unknown'

export interface CodexRiskHazard {
  id: string
  label: string
  level: CodexRiskLevel
  summary: string
  source: string
}

export interface CodexClimateRiskPanelProps extends HTMLAttributes<HTMLElement> {
  title?: string
  location: string
  hazards: CodexRiskHazard[]
  updatedAt: string
  onOpenMethod?: () => void
}

const riskCopy: Record<CodexRiskLevel, string> = { low: 'Düşük', moderate: 'Orta', high: 'Yüksek', unknown: 'Bilinmiyor' }

export function CodexClimateRiskPanel({ title = 'İklim ve afet riskleri', location, hazards, updatedAt, onOpenMethod, className, ...rest }: CodexClimateRiskPanelProps) {
  return (
    <section className={classNames(styles.risk, className)} {...rest}>
      <header><div><h2>{title}</h2><p>{location} · {updatedAt}</p></div><CodexBadge tone="info">Bölgesel veri</CodexBadge></header>
      <div className={styles.riskGrid}>
        {hazards.map((hazard) => (
          <article key={hazard.id} data-level={hazard.level}>
            <div><h3>{hazard.label}</h3><CodexBadge tone={hazard.level === 'low' ? 'success' : hazard.level === 'moderate' ? 'warning' : hazard.level === 'high' ? 'danger' : 'neutral'} dot>{riskCopy[hazard.level]}</CodexBadge></div>
            <p>{hazard.summary}</p>
            <small>Kaynak: {hazard.source}</small>
          </article>
        ))}
      </div>
      <footer><p>Bu göstergeler bölgesel taramalardır; parsel bazlı mühendislik incelemesi yerine geçmez.</p>{onOpenMethod ? <CodexButton variant="quiet" size="sm" onClick={onOpenMethod}>Yöntemi incele</CodexButton> : null}</footer>
    </section>
  )
}

export interface CodexFeatureItem {
  id: string
  label: string
  value?: string
  available?: boolean
  description?: string
}

export interface CodexFeatureSection {
  id: string
  title: string
  items: CodexFeatureItem[]
}

export interface CodexFeatureGroupProps extends HTMLAttributes<HTMLElement> {
  title: string
  sections: CodexFeatureSection[]
  variant?: 'checklist' | 'facts'
}

export function CodexFeatureGroup({ title, sections, variant = 'checklist', className, ...rest }: CodexFeatureGroupProps) {
  return (
    <section className={classNames(styles.features, styles[`features_${variant}`], className)} {...rest}>
      <h2>{title}</h2>
      <div className={styles.featureSections}>
        {sections.map((section) => (
          <section key={section.id}><h3>{section.title}</h3><ul>{section.items.map((item) => (
            <li key={item.id} data-available={item.available}>
              {variant === 'checklist' ? <span aria-hidden>{item.available === false ? '–' : '✓'}</span> : null}
              <div><strong>{item.label}</strong>{item.description ? <p>{item.description}</p> : null}</div>
              {item.value ? <span>{item.value}</span> : null}
            </li>
          ))}</ul></section>
        ))}
      </div>
    </section>
  )
}

export interface CodexSavedSearchCardProps extends HTMLAttributes<HTMLElement> {
  title: string
  query: string
  filters: string[]
  resultCount: number
  newCount?: number
  frequency?: string
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onOpen?: () => void
  onDelete?: () => void
}

export function CodexSavedSearchCard({
  title,
  query,
  filters,
  resultCount,
  newCount = 0,
  frequency = 'Günlük',
  enabled = true,
  onEnabledChange,
  onOpen,
  onDelete,
  className,
  ...rest
}: CodexSavedSearchCardProps) {
  return (
    <article className={classNames(styles.savedSearch, className)} {...rest}>
      <header><div><h3>{title}</h3><p>{query}</p></div>{onEnabledChange ? <CodexSwitch label="Arama alarmı" checked={enabled} onCheckedChange={onEnabledChange} /> : <CodexBadge tone={enabled ? 'success' : 'neutral'}>{enabled ? 'Aktif' : 'Durduruldu'}</CodexBadge>}</header>
      <div className={styles.savedSearchFilters}>{filters.map((filter) => <CodexBadge key={filter}>{filter}</CodexBadge>)}</div>
      <dl><div><dt>Toplam sonuç</dt><dd>{resultCount}</dd></div><div><dt>Yeni ilan</dt><dd>{newCount > 0 ? <CodexBadge tone="accent">{newCount} yeni</CodexBadge> : 'Yok'}</dd></div><div><dt>Bildirim</dt><dd>{frequency}</dd></div></dl>
      <footer>{onOpen ? <CodexButton onClick={onOpen}>Sonuçları aç</CodexButton> : null}{onDelete ? <CodexButton variant="quiet" onClick={onDelete}>Kaydı sil</CodexButton> : null}</footer>
    </article>
  )
}

export type CodexListingState = 'draft' | 'review' | 'live' | 'changes' | 'paused' | 'expired'

export interface CodexListingManagementCardProps extends HTMLAttributes<HTMLElement> {
  title: string
  referenceId: string
  location: string
  price: string
  state: CodexListingState
  imageLabel?: string
  views?: string
  messages?: string
  expiresAt?: string
  issue?: string
  actions?: ReactNode
}

const listingStateCopy: Record<CodexListingState, string> = { draft: 'Taslak', review: 'İncelemede', live: 'Yayında', changes: 'Değişiklik gerekli', paused: 'Durduruldu', expired: 'Süresi doldu' }
const listingStateTone: Record<CodexListingState, 'neutral' | 'warning' | 'success' | 'danger'> = { draft: 'neutral', review: 'warning', live: 'success', changes: 'danger', paused: 'neutral', expired: 'danger' }

export function CodexListingManagementCard({
  title,
  referenceId,
  location,
  price,
  state,
  imageLabel,
  views,
  messages,
  expiresAt,
  issue,
  actions,
  className,
  ...rest
}: CodexListingManagementCardProps) {
  return (
    <article className={classNames(styles.management, className)} data-state={state} {...rest}>
      <div className={styles.managementMedia} role="img" aria-label={imageLabel ?? `${title} ilan görseli`}><span>{location.split('·').at(-1)?.trim()}</span></div>
      <div className={styles.managementBody}>
        <div className={styles.managementTop}><div><p>{referenceId} · {location}</p><h3>{title}</h3></div><CodexBadge tone={listingStateTone[state]} dot>{listingStateCopy[state]}</CodexBadge></div>
        <strong className={styles.managementPrice}>{price}</strong>
        {issue ? <p className={styles.managementIssue}><strong>İşlem gerekli:</strong> {issue}</p> : null}
        <dl>
          {views ? <div><dt>Görüntülenme</dt><dd>{views}</dd></div> : null}
          {messages ? <div><dt>Mesaj</dt><dd>{messages}</dd></div> : null}
          {expiresAt ? <div><dt>Yayın bitişi</dt><dd>{expiresAt}</dd></div> : null}
        </dl>
        {actions ? <footer>{actions}</footer> : null}
      </div>
    </article>
  )
}

export interface CodexMarketplaceEmptyProps {
  kind: 'saved' | 'alerts' | 'listings' | 'messages'
  action?: ReactNode
}

const emptyCopy = {
  saved: { title: 'Henüz favori ilan yok', description: 'Beğendiğiniz ilanları kaydederek fiyat ve durum değişikliklerini tek yerde izleyin.' },
  alerts: { title: 'Kayıtlı arama alarmı yok', description: 'Arama ölçütlerinizi kaydedin; yeni eşleşmeler geldiğinde bildirim alın.' },
  listings: { title: 'Yayında ilanınız yok', description: 'İlan sihirbazı tapu, fiyat ve fotoğraf adımlarında size yol gösterir.' },
  messages: { title: 'Henüz mesaj yok', description: 'İlan sayfasından satıcıya güvenli mesaj gönderebilirsiniz.' },
} as const

export function CodexMarketplaceEmpty({ kind, action }: CodexMarketplaceEmptyProps) {
  return <CodexSurface treatment="outlined" padding="none"><CodexEmptyState title={emptyCopy[kind].title} description={emptyCopy[kind].description} action={action} /></CodexSurface>
}
