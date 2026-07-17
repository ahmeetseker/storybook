import type { HTMLAttributes } from 'react'
import styles from './GlassCompareTable.module.css'

/** Karşılaştırılan tek özellik satırı — ilan verisindeki bir alana karşılık gelir. */
export interface GlassCompareField {
  /** `listing.values` içindeki anahtar */
  key: string
  /** Satır başlığında (`th scope="row"`) görünen etiket */
  label: string
  /**
   * Verilirse ve bu alanın tüm ilanlardaki değeri sayısalsa en iyi değer
   * `--lg-success` ile işaretlenir: `true` → en yüksek değer iyi (ör. alan m²),
   * `false` → en düşük değer iyi (ör. fiyat, aidat). Verilmezse (undefined)
   * bu satırda "en iyi" işaretlemesi hiç yapılmaz.
   */
  higherIsBetter?: boolean
}

/** Karşılaştırmadaki tek ilan (sütun). */
export interface GlassCompareListing {
  id: string
  title: string
  /** Dekoratif kapak görseli — verilmezse sütun başlığı yalnız başlık metni içerir */
  image?: string
  /** `field.key` → değer; eksik anahtarlar tabloda "—" gösterilir */
  values: Record<string, string | number>
}

export interface GlassCompareTableProps extends Omit<HTMLAttributes<HTMLTableElement>, 'onChange'> {
  fields: GlassCompareField[]
  /**
   * Karşılaştırılan ilanlar — 2-4 arası tasarlanmıştır. 4'ten fazlası
   * sessizce (console uyarısı olmadan) ilk 4'e kırpılır; 2'den azı da
   * render edilir ama karşılaştırma amacını taşımaz (bkz. rules.md §12).
   */
  listings: GlassCompareListing[]
  /**
   * `true` ise bir satırda ilanlar arasında değer farklıysa satır hafif
   * vurgulanır (`higherIsBetter`'dan bağımsız — yalnız değerlerin eşit
   * olup olmadığına bakar).
   */
  highlightDifferences?: boolean
  /** Verilirse her sütun başlığında kaldırma butonu görünür */
  onRemove?: (id: string) => void
  /** Tabloyu adlandırır — sayfada birden çok tablo varsa zorunlu */
  'aria-label'?: string
}

const MAX_LISTINGS = 4

/** Bir alanın tüm ilanlardaki değeri sayısalsa `en iyi` id kümesini döner; değilse `null`. */
function computeBestIds(field: GlassCompareField, listings: GlassCompareListing[]): Set<string> | null {
  if (field.higherIsBetter === undefined) return null
  const values = listings.map((listing) => listing.values[field.key])
  if (values.length === 0 || !values.every((v) => typeof v === 'number')) return null
  const numbers = values as number[]
  const best = field.higherIsBetter ? Math.max(...numbers) : Math.min(...numbers)
  const bestIds = new Set<string>()
  listings.forEach((listing, i) => {
    if (numbers[i] === best) bestIds.add(listing.id)
  })
  return bestIds
}

/** Satırdaki ilanlar arasında değer farkı var mı (metinsel karşılaştırma). */
function rowDiffers(field: GlassCompareField, listings: GlassCompareListing[]): boolean {
  const asText = new Set(listings.map((listing) => String(listing.values[field.key] ?? '—')))
  return asText.size > 1
}

function formatValue(value: string | number | undefined): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'number') return value.toLocaleString('tr-TR')
  return value
}

export function GlassCompareTable({
  fields,
  listings,
  highlightDifferences = true,
  onRemove,
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassCompareTableProps) {
  const clippedListings = listings.slice(0, MAX_LISTINGS)
  const classes = [styles.wrapper, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <table className={styles.table} aria-label={ariaLabel} {...rest}>
        <thead>
          <tr>
            <th scope="col" className={[styles.th, styles.corner, styles.stickyCol].join(' ')}>
              Özellik
            </th>
            {clippedListings.map((listing) => (
              <th key={listing.id} scope="col" className={[styles.th, styles.listingHead].join(' ')}>
                <div className={styles.listingHeader}>
                  {onRemove ? (
                    <div className={styles.headerTopRow}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => onRemove(listing.id)}
                        aria-label={`Karşılaştırmadan çıkar: ${listing.title}`}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                  ) : null}
                  {listing.image ? <img src={listing.image} alt="" className={styles.image} /> : null}
                  <span className={styles.listingTitle}>{listing.title}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const differs = highlightDifferences && rowDiffers(field, clippedListings)
            const bestIds = computeBestIds(field, clippedListings)
            return (
              <tr key={field.key} className={styles.tr} data-differs={differs || undefined}>
                <th scope="row" className={[styles.th, styles.rowHeader, styles.stickyCol].join(' ')}>
                  {field.label}
                </th>
                {clippedListings.map((listing) => {
                  const isBest = bestIds?.has(listing.id) ?? false
                  return (
                    <td key={listing.id} className={[styles.td, isBest ? styles.best : ''].filter(Boolean).join(' ')}>
                      {formatValue(listing.values[field.key])}
                      {isBest ? <span className={styles.srOnly}> (en iyi değer)</span> : null}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
