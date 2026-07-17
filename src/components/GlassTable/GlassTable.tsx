import { useState, type HTMLAttributes, type ReactNode } from 'react'
import { GlassCheckbox } from '../GlassCheckbox'
import styles from './GlassTable.module.css'

/** Sıralama yönü — yalnız gösterge amaçlı; component kendisi satırları sıralamaz. */
export type GlassTableSortDirection = 'asc' | 'desc'

export interface GlassTableColumn {
  /** Satır verisindeki alan adı — hücre değeri `row[key]`'den okunur */
  key: string
  /** Başlık hücresinde görünen metin */
  label: string
  /** true ise başlık gerçek bir `<button>` olur; tıklama yalnız `onSortChange` tetikler */
  sortable?: boolean
  /** Başlık + hücre hizası — sayısal/parasal sütunlarda 'end' önerilir */
  align?: 'start' | 'end'
  /** `th`/`td` genişliği (ör. '120px', '20%') */
  width?: string
}

/** Bir satır: zorunlu `id` + kolon anahtarlarına karşılık gelen içerik. */
export type GlassTableRow = { id: string } & Record<string, ReactNode>

export interface GlassTableProps extends Omit<HTMLAttributes<HTMLTableElement>, 'onChange'> {
  columns: GlassTableColumn[]
  rows: GlassTableRow[]
  /** Kontrollü aktif sıralama sütunu — verilirse component'i kontrol eder */
  sortKey?: string
  /** Kontrolsüz kullanımda başlangıç sıralama sütunu */
  defaultSortKey?: string
  /** Kontrollü sıralama yönü */
  sortDirection?: GlassTableSortDirection
  /** Kontrolsüz kullanımda başlangıç yönü (default 'asc') */
  defaultSortDirection?: GlassTableSortDirection
  /**
   * Sıralanabilir başlığa tıklanınca çağrılır: (key, direction). Component
   * yalnız göstergeyi (ok yönü, aria-sort) yönetir — satırları SIRALAMAZ;
   * `rows`'u yeni sıraya göre vermek çağıranın işidir.
   */
  onSortChange?: (key: string, direction: GlassTableSortDirection) => void
  /** true ise her satır başına + başlıkta "tümünü seç" checkbox sütunu eklenir */
  selectable?: boolean
  /** Kontrollü seçili satır id listesi */
  selectedIds?: string[]
  /** Kontrolsüz kullanımda başlangıç seçili id listesi */
  defaultSelectedIds?: string[]
  /** Seçim değişince çağrılır — güncel tüm id listesiyle */
  onSelectedIdsChange?: (ids: string[]) => void
  /** `rows` boşken gösterilecek içerik (varsayılan: basit metin) */
  emptyState?: ReactNode
  /** Tabloyu adlandırır — birden çok tablo olan sayfada zorunlu */
  'aria-label'?: string
}

const defaultEmptyState = 'Kayıt bulunamadı.'

function SortIcon({ direction, active }: { direction: GlassTableSortDirection; active: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={styles.sortIcon}
      aria-hidden="true"
      data-active={active || undefined}
      data-direction={direction}
    >
      <path d="M6 2.5 9.5 7H2.5z" />
      <path d="M6 9.5 2.5 5h7z" />
    </svg>
  )
}

/** İlk kolon değerinden okunabilir bir satır etiketi türetir (checkbox accessible name için). */
function deriveRowLabel(row: GlassTableRow, columns: GlassTableColumn[]): string {
  const first = columns[0]
  const value = first ? row[first.key] : undefined
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return row.id
}

export function GlassTable({
  columns,
  rows,
  sortKey,
  defaultSortKey,
  sortDirection,
  defaultSortDirection = 'asc',
  onSortChange,
  selectable = false,
  selectedIds,
  defaultSelectedIds,
  onSelectedIdsChange,
  emptyState,
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassTableProps) {
  const [innerSortKey, setInnerSortKey] = useState(defaultSortKey)
  const [innerSortDirection, setInnerSortDirection] = useState<GlassTableSortDirection>(defaultSortDirection)
  const [innerSelectedIds, setInnerSelectedIds] = useState<string[]>(defaultSelectedIds ?? [])

  const effectiveSortKey = sortKey ?? innerSortKey
  const effectiveSortDirection = sortDirection ?? innerSortDirection
  const effectiveSelectedIds = selectedIds ?? innerSelectedIds

  const handleSortClick = (colKey: string) => {
    // Aynı sütuna tekrar tıklama yönü tersine çevirir; farklı sütun her zaman 'asc' ile başlar
    const isSameColumn = effectiveSortKey === colKey
    const nextDirection: GlassTableSortDirection = isSameColumn && effectiveSortDirection === 'asc' ? 'desc' : 'asc'
    if (sortKey === undefined) setInnerSortKey(colKey)
    if (sortDirection === undefined) setInnerSortDirection(nextDirection)
    onSortChange?.(colKey, nextDirection)
  }

  const emitSelection = (ids: string[]) => {
    if (selectedIds === undefined) setInnerSelectedIds(ids)
    onSelectedIdsChange?.(ids)
  }

  const toggleRow = (id: string) => {
    const next = effectiveSelectedIds.includes(id)
      ? effectiveSelectedIds.filter((x) => x !== id)
      : [...effectiveSelectedIds, id]
    emitSelection(next)
  }

  const allSelected = rows.length > 0 && rows.every((r) => effectiveSelectedIds.includes(r.id))
  const someSelected = !allSelected && rows.some((r) => effectiveSelectedIds.includes(r.id))

  const toggleAll = () => {
    emitSelection(allSelected ? [] : rows.map((r) => r.id))
  }

  const classes = [styles.wrapper, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <table className={styles.table} aria-label={ariaLabel} {...rest}>
        <thead className={styles.thead}>
          <tr>
            {selectable ? (
              <th scope="col" className={styles.selectCell}>
                <GlassCheckbox
                  size="sm"
                  label={<span className={styles.srOnly}>Tümünü seç</span>}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  disabled={rows.length === 0}
                />
              </th>
            ) : null}
            {columns.map((col) => {
              const isActive = col.sortable && effectiveSortKey === col.key
              const ariaSort = col.sortable ? (isActive ? (effectiveSortDirection === 'asc' ? 'ascending' : 'descending') : 'none') : undefined
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={[styles.th, col.align === 'end' ? styles.alignEnd : ''].filter(Boolean).join(' ')}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={ariaSort}
                >
                  {col.sortable ? (
                    <button type="button" className={styles.sortButton} onClick={() => handleSortClick(col.key)}>
                      <span>{col.label}</span>
                      <SortIcon direction={isActive ? effectiveSortDirection : 'asc'} active={Boolean(isActive)} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={columns.length + (selectable ? 1 : 0)}>
                {emptyState ?? defaultEmptyState}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={styles.tr} data-selected={effectiveSelectedIds.includes(row.id) || undefined}>
                {selectable ? (
                  <td className={styles.selectCell} data-label="Seç">
                    <GlassCheckbox
                      size="sm"
                      label={<span className={styles.srOnly}>{deriveRowLabel(row, columns)} satırını seç</span>}
                      checked={effectiveSelectedIds.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                ) : null}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[styles.td, col.align === 'end' ? styles.alignEnd : ''].filter(Boolean).join(' ')}
                    data-label={col.label}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
