import { useEffect, useRef, type HTMLAttributes } from 'react'
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

/** Yatay kaydırma kabının rol="region" için varsayılan (fallback) adı. */
const DEFAULT_REGION_LABEL = 'İlan karşılaştırma tablosu'

/**
 * Bir hücre değerini karşılaştırılabilir sayıya çevirir: `number` doğrudan,
 * `string` ise TR/uluslararası binlik ayraçları (`.`/`,`/boşluk) temizlenip
 * ondalık virgülü noktaya çevrilerek parse edilir. Parse edilemezse `null`.
 */
function toComparableNumber(value: string | number | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  // Binlik ayraçlarını (nokta, boşluk, ince boşluk) at, ondalık virgülü noktaya çevir.
  const normalized = trimmed.replace(/[.\s ]/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

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

/**
 * Satırdaki ilanlar arasında değer farkı var mı. Tüm değerler sayıya
 * parse edilebiliyorsa (locale ayraçları temizlenerek) sayısal karşılaştırma
 * yapılır — ör. `1000` (number) ile `"1.000"` (string) aynı sayılır; aksi
 * halde ham metin karşılaştırılır.
 */
function rowDiffers(field: GlassCompareField, listings: GlassCompareListing[]): boolean {
  const rawValues = listings.map((listing) => listing.values[field.key])
  const numericValues = rawValues.map((value) => toComparableNumber(value))
  const allNumeric = numericValues.every((n) => n !== null)
  if (allNumeric) {
    const uniqueNumbers = new Set(numericValues as number[])
    return uniqueNumbers.size > 1
  }
  const asText = new Set(rawValues.map((value) => String(value ?? '—')))
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

  const wrapperRef = useRef<HTMLDivElement>(null)
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocusRecoveryRef = useRef(false)

  useEffect(() => {
    // Artık render edilmeyen ilanların buton referanslarını temizle.
    const currentIds = new Set(clippedListings.map((listing) => listing.id))
    const staleIds: string[] = []
    removeButtonRefs.current.forEach((_button, id) => {
      if (!currentIds.has(id)) staleIds.push(id)
    })
    staleIds.forEach((id) => removeButtonRefs.current.delete(id))

    if (!pendingFocusRecoveryRef.current) return
    pendingFocusRecoveryRef.current = false
    // `onRemove` az önce çağrıldı (kaldırma butonu tıklandı, ilgili buton
    // artık DOM'da yok) — odağı kalan ilk kaldırma butonuna, o da yoksa kaba taşı.
    const firstRemaining = clippedListings[0]
    const target = firstRemaining ? removeButtonRefs.current.get(firstRemaining.id) : undefined
    ;(target ?? wrapperRef.current)?.focus()
  }, [clippedListings])

  return (
    <div
      ref={wrapperRef}
      className={classes}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel ?? DEFAULT_REGION_LABEL}
    >
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
                        ref={(el) => {
                          if (el) removeButtonRefs.current.set(listing.id, el)
                          else removeButtonRefs.current.delete(listing.id)
                        }}
                        className={styles.removeButton}
                        onClick={() => {
                          pendingFocusRecoveryRef.current = true
                          onRemove(listing.id)
                        }}
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
