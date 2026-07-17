import { useId, type HTMLAttributes } from 'react'
import styles from './GlassTaxHistoryTable.module.css'

/** Tek yıla ait vergi/aidat satırı. */
export interface GlassTaxHistoryTableRow {
  /** Dönem yılı — ör. '2026' */
  year: string
  /** Yıla ait toplam tutar, TR biçimli hazır string — ör. '4.820 TL' (biçimlendirme çağıranın işi) */
  amount: string
  /**
   * Önceki yıla göre değişim yüzdesi: pozitif artış, negatif azalış.
   * Verilmezse veya sonlu bir sayı değilse (`NaN`/`Infinity`) değişim
   * kolonu bilgisi olmayan durum ('—') gösterir.
   */
  changePercent?: number
}

export interface GlassTaxHistoryTableProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Satırlar — sıra = görünüm sırası; ilk satır en yeni yıl kabul edilip hafifçe vurgulanır (sıralama çağıranın işi) */
  rows: GlassTaxHistoryTableRow[]
  /** Kart başlığı */
  title?: string
  /** Kaynak/dipnot metni — verilirse tablo altında görünür */
  caption?: string
}

const defaultTitle = 'Vergi ve Aidat Geçmişi'
const defaultEmptyState = 'Kayıt bulunamadı.'

/** Türkçe ondalık biçimli, işaretsiz yüzde metni üretir — ör. 12.5 → '%12,5'. Yön bilgisini ok ikonu taşır, metin yalnız büyüklüğü gösterir. */
function formatChangePercent(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `%${formatted}`
}

function ChangeCell({ changePercent }: { changePercent?: number }) {
  if (changePercent === undefined || !Number.isFinite(changePercent)) {
    return (
      <span className={styles.changeNeutral}>
        <span className={styles.srOnly}>Değişim bilgisi yok</span>
        <span aria-hidden="true">—</span>
      </span>
    )
  }

  const text = formatChangePercent(changePercent)

  if (changePercent === 0) {
    return (
      <span className={styles.changeNeutral}>
        <span className={styles.srOnly}>Değişim yok:</span>
        <span className={styles.changeText}>{text}</span>
      </span>
    )
  }

  const isIncrease = changePercent > 0

  return (
    <span className={styles.change} data-direction={isIncrease ? 'up' : 'down'}>
      <span className={styles.srOnly}>{isIncrease ? 'Artış:' : 'Azalış:'}</span>
      <span className={styles.arrow} aria-hidden="true">
        {isIncrease ? '▲' : '▼'}
      </span>
      <span className={styles.changeText}>{text}</span>
    </span>
  )
}

/**
 * İlan detayında yıllara göre vergi/aidat tutarlarını ve önceki yıla göre
 * değişimini gösteren, salt-okunur, düz (cam olmayan) içerik tablosu.
 * En yeni yıl (ilk satır) hafifçe vurgulanır; değişim yüzdesinin yönü ok
 * ikonuyla (▲/▼) renklendirilir, metin her zaman nötr etiket rengiyle kalır
 * (kontrast dersleri: renkli küçük metin yerine renkli ikon + nötr metin).
 */
export function GlassTaxHistoryTable({ rows, title = defaultTitle, caption, className, ...rest }: GlassTaxHistoryTableProps) {
  const headingId = useId()
  const classes = [styles.wrapper, className].filter(Boolean).join(' ')

  return (
    <section className={classes} aria-labelledby={headingId} {...rest}>
      <h3 id={headingId} className={styles.title}>
        {title}
      </h3>
      <div className={styles.tableScroll}>
        <table className={styles.table} aria-labelledby={headingId}>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>
                Yıl
              </th>
              <th scope="col" className={[styles.th, styles.alignEnd].join(' ')}>
                Tutar
              </th>
              <th scope="col" className={[styles.th, styles.alignEnd].join(' ')}>
                Değişim
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={3}>
                  {defaultEmptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const isLatest = index === 0
                return (
                  <tr key={`${row.year}-${index}`} className={styles.tr} data-latest={isLatest || undefined}>
                    <td className={styles.td} data-label="Yıl">
                      <span className={styles.yearCell}>
                        {row.year}
                        {isLatest ? <span className={styles.latestTag}>Güncel</span> : null}
                      </span>
                    </td>
                    <td className={[styles.td, styles.alignEnd].join(' ')} data-label="Tutar">
                      {row.amount}
                    </td>
                    <td className={[styles.td, styles.alignEnd].join(' ')} data-label="Değişim">
                      <ChangeCell changePercent={row.changePercent} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </section>
  )
}
