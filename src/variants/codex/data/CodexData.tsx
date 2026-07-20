import {
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type SVGAttributes,
  type TableHTMLAttributes,
} from 'react'
import { CodexBadge, CodexButton } from '../controls'
import { CodexEmptyState } from '../content'
import styles from './CodexData.module.css'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export type CodexSortDirection = 'ascending' | 'descending'
export type CodexTableDensity = 'comfortable' | 'compact'

export interface CodexDataColumn<Row> {
  key: string
  header: string
  render: (row: Row) => ReactNode
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  hideOnCompact?: boolean
}

export interface CodexDataTableProps<Row extends { id: string }>
  extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  caption: string
  columns: Array<CodexDataColumn<Row>>
  rows: Row[]
  density?: CodexTableDensity
  sortKey?: string
  sortDirection?: CodexSortDirection
  onSortChange?: (key: string, direction: CodexSortDirection) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  getRowLabel?: (row: Row) => string
  rowActions?: (row: Row) => ReactNode
  loading?: boolean
  loadingRows?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

function SelectAllCheckbox({
  checked,
  mixed,
  onChange,
}: {
  checked: boolean
  mixed: boolean
  onChange: (checked: boolean) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed
  }, [mixed])

  return (
    <input
      ref={ref}
      className={styles.selectionControl}
      type="checkbox"
      aria-label="Tüm satırları seç"
      checked={checked}
      aria-checked={mixed ? 'mixed' : checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  )
}

export function CodexDataTable<Row extends { id: string }>({
  caption,
  columns,
  rows,
  density = 'comfortable',
  sortKey,
  sortDirection = 'ascending',
  onSortChange,
  selectedIds,
  onSelectionChange,
  getRowLabel,
  rowActions,
  loading = false,
  loadingRows = 5,
  emptyTitle = 'Gösterilecek kayıt yok',
  emptyDescription = 'Filtreleri değiştirin veya yeni bir kayıt oluşturun.',
  emptyAction,
  className,
  ...rest
}: CodexDataTableProps<Row>) {
  const selectable = Boolean(selectedIds && onSelectionChange)
  const selectedSet = new Set(selectedIds)
  const allSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.id))
  const someSelected = rows.some((row) => selectedSet.has(row.id)) && !allSelected
  const requestSort = (key: string) => {
    if (!onSortChange) return
    const nextDirection: CodexSortDirection = sortKey === key && sortDirection === 'ascending'
      ? 'descending'
      : 'ascending'
    onSortChange(key, nextDirection)
  }

  const toggleRow = (id: string, checked: boolean) => {
    if (!selectedIds || !onSelectionChange) return
    const next = checked
      ? Array.from(new Set([...selectedIds, id]))
      : selectedIds.filter((selectedId) => selectedId !== id)
    onSelectionChange(next)
  }

  return (
    <div className={classNames(styles.tableFrame, styles[`density_${density}`])} data-loading={loading || undefined}>
      <div className={styles.tableScroll}>
        <table className={classNames(styles.table, className)} {...rest}>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {selectable ? (
                <th className={styles.selectionCell} scope="col">
                  <SelectAllCheckbox
                    checked={allSelected}
                    mixed={someSelected}
                    onChange={(checked) => onSelectionChange?.(checked ? rows.map((row) => row.id) : [])}
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  data-align={column.align ?? 'start'}
                  data-compact-hidden={column.hideOnCompact || undefined}
                  aria-sort={sortKey === column.key ? sortDirection : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => requestSort(column.key)}
                      disabled={!onSortChange}
                    >
                      <span>{column.header}</span>
                      <span className={styles.sortGlyph} aria-hidden>
                        {sortKey === column.key ? (sortDirection === 'ascending' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : column.header}
                </th>
              ))}
              {rowActions ? <th className={styles.actionsCell} scope="col"><span className={styles.srOnly}>İşlemler</span></th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: loadingRows }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} aria-hidden>
                {selectable ? <td className={styles.selectionCell}><CodexSkeleton width="18px" height="18px" /></td> : null}
                {columns.map((column, columnIndex) => (
                  <td key={column.key} data-label={column.header} data-align={column.align ?? 'start'}>
                    <CodexSkeleton width={columnIndex === 0 ? '72%' : columnIndex % 2 === 0 ? '46%' : '58%'} />
                  </td>
                ))}
                {rowActions ? <td className={styles.actionsCell}><CodexSkeleton width="32px" height="32px" /></td> : null}
              </tr>
            )) : rows.map((row) => (
              <tr key={row.id} data-selected={selectedSet.has(row.id) || undefined}>
                {selectable ? (
                  <td className={styles.selectionCell}>
                    <input
                      className={styles.selectionControl}
                      type="checkbox"
                      aria-label={getRowLabel ? `${getRowLabel(row)} satırını seç` : 'Satırı seç'}
                      checked={selectedSet.has(row.id)}
                      onChange={(event) => toggleRow(row.id, event.currentTarget.checked)}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.header}
                    data-align={column.align ?? 'start'}
                    data-compact-hidden={column.hideOnCompact || undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {rowActions ? <td className={styles.actionsCell}>{rowActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 ? (
        <CodexEmptyState
          compact
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          className={styles.tableEmpty}
        />
      ) : null}
      {loading ? <p className={styles.srOnly} role="status">Tablo yükleniyor</p> : null}
    </div>
  )
}

export interface CodexSpecItem {
  label: string
  value: ReactNode
  description?: string
}

export interface CodexSpecGroup {
  id: string
  title: string
  items: CodexSpecItem[]
}

export interface CodexSpecTableProps extends HTMLAttributes<HTMLElement> {
  title: string
  groups: CodexSpecGroup[]
  density?: CodexTableDensity
}

export function CodexSpecTable({ title, groups, density = 'comfortable', className, ...rest }: CodexSpecTableProps) {
  return (
    <section className={classNames(styles.specTable, styles[`density_${density}`], className)} {...rest}>
      <h2>{title}</h2>
      {groups.map((group) => (
        <section key={group.id} className={styles.specGroup} aria-labelledby={`spec-${group.id}`}>
          <h3 id={`spec-${group.id}`}>{group.title}</h3>
          <dl>
            {group.items.map((item) => (
              <div key={item.label} className={styles.specRow}>
                <dt>{item.label}</dt>
                <dd>
                  <span>{item.value}</span>
                  {item.description ? <small>{item.description}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </section>
  )
}

export interface CodexCompareListing {
  id: string
  title: string
  price: string
  status?: ReactNode
}

export interface CodexCompareField {
  key: string
  label: string
  values: Record<string, ReactNode>
  highlightBestId?: string
}

export interface CodexCompareTableProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  listings: CodexCompareListing[]
  fields: CodexCompareField[]
  differencesOnly?: boolean
  onRemove?: (id: string) => void
}

function comparableValue(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null
}

export function CodexCompareTable({
  title,
  listings,
  fields,
  differencesOnly = false,
  onRemove,
  className,
  ...rest
}: CodexCompareTableProps) {
  const visibleFields = differencesOnly
    ? fields.filter((field) => {
      const values = listings.map((listing) => comparableValue(field.values[listing.id]))
      return new Set(values).size > 1 || values.some((value) => value === null)
    })
    : fields

  return (
    <div className={classNames(styles.compareFrame, className)} {...rest}>
      <div className={styles.compareHeader}>
        <div>
          <h2>{title}</h2>
          <p>{listings.length} ilan, {visibleFields.length} ölçüt</p>
        </div>
        {differencesOnly ? <CodexBadge tone="accent" dot>Yalnız farklar</CodexBadge> : null}
      </div>
      <div className={styles.compareScroll}>
        <table className={styles.compareTable}>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Ölçüt</th>
              {listings.map((listing) => (
                <th key={listing.id} scope="col">
                  <div className={styles.compareListingHeader}>
                    <span>{listing.title}</span>
                    <strong>{listing.price}</strong>
                    {listing.status}
                    {onRemove ? (
                      <button type="button" onClick={() => onRemove(listing.id)} aria-label={`${listing.title} ilanını karşılaştırmadan çıkar`}>
                        Çıkar
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleFields.map((field) => (
              <tr key={field.key}>
                <th scope="row">{field.label}</th>
                {listings.map((listing) => (
                  <td key={listing.id} data-best={field.highlightBestId === listing.id || undefined}>
                    {field.values[listing.id] ?? <span className={styles.missingValue}>Bilgi yok</span>}
                    {field.highlightBestId === listing.id ? <span className={styles.srOnly}> — en iyi değer</span> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleFields.length === 0 ? (
        <CodexEmptyState compact title="Gösterilecek fark yok" description="Seçilen ilanların karşılaştırılabilir değerleri aynı." />
      ) : null}
    </div>
  )
}

export type CodexTimelineTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface CodexTimelineEvent {
  id: string
  title: string
  description?: ReactNode
  time: string
  datetime?: string
  tone?: CodexTimelineTone
  meta?: ReactNode
}

export interface CodexTimelineProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string
  events: CodexTimelineEvent[]
  compact?: boolean
}

export function CodexTimeline({ title, events, compact = false, className, ...rest }: CodexTimelineProps) {
  return (
    <section className={classNames(styles.timeline, compact && styles.timelineCompact, className)} {...rest}>
      <h2>{title}</h2>
      {events.length ? (
        <ol>
          {events.map((event) => (
            <li key={event.id} data-tone={event.tone ?? 'neutral'}>
              <span className={styles.timelineMarker} aria-hidden />
              <div className={styles.timelineCopy}>
                <div className={styles.timelineTitleRow}>
                  <h3>{event.title}</h3>
                  <time dateTime={event.datetime}>{event.time}</time>
                </div>
                {event.description ? <p>{event.description}</p> : null}
                {event.meta ? <div className={styles.timelineMeta}>{event.meta}</div> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <CodexEmptyState compact title="Henüz hareket yok" description="İlanla ilgili doğrulama ve fiyat hareketleri burada görünecek." />}
    </section>
  )
}

export interface CodexListItem {
  id: string
  leading?: ReactNode
  title: string
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  selected?: boolean
  disabled?: boolean
}

export interface CodexListProps extends HTMLAttributes<HTMLUListElement> {
  items: CodexListItem[]
  divided?: boolean
  density?: CodexTableDensity
  emptyTitle?: string
  emptyDescription?: string
}

export function CodexList({
  items,
  divided = true,
  density = 'comfortable',
  emptyTitle = 'Liste boş',
  emptyDescription = 'Yeni kayıtlar burada gösterilecek.',
  className,
  ...rest
}: CodexListProps) {
  if (items.length === 0) {
    return <CodexEmptyState compact title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ul
      className={classNames(styles.list, divided && styles.listDivided, styles[`density_${density}`], className)}
      {...rest}
    >
      {items.map((item) => (
        <li key={item.id} data-selected={item.selected || undefined} data-disabled={item.disabled || undefined}>
          {item.leading ? <div className={styles.listLeading}>{item.leading}</div> : null}
          <div className={styles.listCopy}>
            <strong>{item.title}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </div>
          {item.meta ? <div className={styles.listMeta}>{item.meta}</div> : null}
          {item.action ? <div className={styles.listAction}>{item.action}</div> : null}
        </li>
      ))}
    </ul>
  )
}

export interface CodexSkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string
  height?: string
  radius?: 'text' | 'control' | 'media' | 'card'
}

export function CodexSkeleton({ width, height, radius = 'text', className, style, ...rest }: CodexSkeletonProps) {
  const customStyle = {
    ...style,
    '--cx-skeleton-width': width,
    '--cx-skeleton-height': height,
  } as CSSProperties
  return (
    <span
      className={classNames(styles.skeleton, styles[`skeleton_${radius}`], className)}
      style={customStyle}
      aria-hidden
      {...rest}
    />
  )
}

export interface CodexSkeletonBlockProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'listing' | 'table' | 'detail' | 'message'
  label?: string
}

export function CodexSkeletonBlock({ variant = 'listing', label = 'İçerik yükleniyor', className, ...rest }: CodexSkeletonBlockProps) {
  return (
    <div className={classNames(styles.skeletonBlock, styles[`skeletonBlock_${variant}`], className)} role="status" {...rest}>
      <span className={styles.srOnly}>{label}</span>
      <CodexSkeleton className={styles.skeletonVisual} radius="media" />
      <div className={styles.skeletonLines} aria-hidden>
        <CodexSkeleton width="38%" />
        <CodexSkeleton width="82%" height="18px" />
        <CodexSkeleton width="64%" />
        <CodexSkeleton width="42%" height="22px" />
      </div>
    </div>
  )
}

export type CodexScoreTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface CodexScoreMeterProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: number
  max?: number
  tone?: CodexScoreTone
  description?: ReactNode
  showValue?: boolean
}

export function CodexScoreMeter({
  label,
  value,
  max = 100,
  tone = 'accent',
  description,
  showValue = true,
  className,
  ...rest
}: CodexScoreMeterProps) {
  const safeValue = Math.min(Math.max(value, 0), max)
  const percentage = max > 0 ? (safeValue / max) * 100 : 0
  const descriptionId = useId()
  return (
    <div className={classNames(styles.score, className)} data-tone={tone} {...rest}>
      <div className={styles.scoreHeader}>
        <span>{label}</span>
        {showValue ? <strong>{safeValue}<small>/{max}</small></strong> : null}
      </div>
      <div
        className={styles.scoreTrack}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        aria-describedby={description ? descriptionId : undefined}
      >
        <span style={{ '--cx-score-value': `${percentage}%` } as CSSProperties} />
      </div>
      {description ? <p id={descriptionId}>{description}</p> : null}
    </div>
  )
}

export interface CodexChartPoint {
  label: string
  value: number
  annotation?: string
}

export interface CodexMiniChartProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string
  description: string
  points: CodexChartPoint[]
  valueFormatter?: (value: number) => string
  trend?: 'up' | 'down' | 'steady'
  svgProps?: SVGAttributes<SVGSVGElement>
}

export function CodexMiniChart({
  title,
  description,
  points,
  valueFormatter = (value) => value.toLocaleString('tr-TR'),
  trend = 'steady',
  svgProps,
  className,
  ...rest
}: CodexMiniChartProps) {
  const width = 640
  const height = 220
  const padX = 32
  const padY = 24
  const values = points.map((point) => point.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const range = max - min || 1
  const coordinates = points.map((point, index) => ({
    x: padX + (points.length <= 1 ? 0 : (index / (points.length - 1)) * (width - padX * 2)),
    y: height - padY - ((point.value - min) / range) * (height - padY * 2),
    point,
  }))
  const path = coordinates.map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x} ${coordinate.y}`).join(' ')

  return (
    <figure className={classNames(styles.chart, className)} data-trend={trend} {...rest}>
      <figcaption>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {points.length ? <strong>{valueFormatter(points.at(-1)?.value ?? 0)}</strong> : null}
      </figcaption>
      {points.length ? (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${description}`} {...svgProps}>
            <path className={styles.chartGrid} d={`M ${padX} ${height / 2} H ${width - padX}`} />
            <path className={styles.chartLine} d={path} />
            {coordinates.map(({ x, y, point }) => (
              <g key={point.label}>
                <circle className={styles.chartPoint} cx={x} cy={y} r="4" />
                <title>{point.label}: {valueFormatter(point.value)}{point.annotation ? `, ${point.annotation}` : ''}</title>
              </g>
            ))}
          </svg>
          <div className={styles.chartAxis} aria-hidden>
            <span>{points[0]?.label}</span>
            <span>{points.at(-1)?.label}</span>
          </div>
          <table className={styles.srOnly}>
            <caption>{title} veri noktaları</caption>
            <thead><tr><th>Dönem</th><th>Değer</th><th>Not</th></tr></thead>
            <tbody>
              {points.map((point) => <tr key={point.label}><th scope="row">{point.label}</th><td>{valueFormatter(point.value)}</td><td>{point.annotation}</td></tr>)}
            </tbody>
          </table>
        </>
      ) : <CodexEmptyState compact title="Grafik verisi yok" description="Seçilen dönem için karşılaştırılabilir veri bulunamadı." />}
    </figure>
  )
}

export interface CodexMetricItem {
  id: string
  label: string
  value: string
  change?: string
  direction?: 'up' | 'down' | 'steady'
  help?: string
}

export interface CodexMetricStripProps extends HTMLAttributes<HTMLDListElement> {
  items: CodexMetricItem[]
  ariaLabel?: string
}

export function CodexMetricStrip({ items, ariaLabel = 'Temel göstergeler', className, ...rest }: CodexMetricStripProps) {
  return (
    <dl className={classNames(styles.metrics, className)} aria-label={ariaLabel} {...rest}>
      {items.map((item) => (
        <div key={item.id}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
            {item.change ? (
              <span data-direction={item.direction ?? 'steady'}>
                <span className={styles.srOnly}>{item.direction === 'up' ? 'Yükseliş' : item.direction === 'down' ? 'Düşüş' : 'Değişim'}: </span>
                <span aria-hidden>{item.direction === 'up' ? '↗' : item.direction === 'down' ? '↘' : '→'}</span> {item.change}
              </span>
            ) : null}
          </dd>
          {item.help ? <p>{item.help}</p> : null}
        </div>
      ))}
    </dl>
  )
}

export function CodexTableAction({ children, ...rest }: ComponentProps<typeof CodexButton>) {
  return <CodexButton variant="quiet" size="sm" {...rest}>{children}</CodexButton>
}
