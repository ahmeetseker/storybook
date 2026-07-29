import type { ListingDetail } from '../domain/listing-detail-types'
import { contactClosedReason, formatPrice, formatUnitPrice } from '../format'
import styles from './ListingDock.module.css'

export interface ListingDockProps {
  detail: ListingDetail
  /** Mesaj akışı. Verilmezse eylem `disabled` gelir ve gerekçesi yazılır. */
  onContact?: () => void
}

/**
 * Yapışkan karar dock'u — yalnız dar ve orta yerleşimde.
 *
 * Geniş yerleşimde yerini 340px'lik karar kolonu alır ve dock DOM'dan değil
 * yerleşimden düşer (`display: none`): ikisi hiçbir zaman aynı anda
 * görünmez, çünkü ikisi de aynı işi yapar ve iki birincil eylem bir karar
 * ekranını ikiye böler.
 *
 * Dock iki şey taşır: fiyat çapası ve tek birincil eylem. Çapa `body`
 * ölçeğindedir — sayfanın en büyük sayısı akıştaki fiyat bloğudur, bu satır
 * onun kaydırılıp gitmiş hâlinin referansıdır, ikinci bir vurgu değil.
 */
export function ListingDock({ detail, onContact }: ListingDockProps) {
  const closedReason = contactClosedReason(detail.lifecycle)

  return (
    <div className={styles.dock}>
      <span className={styles.anchor}>
        {formatPrice(detail.price.amount)}
        <span className={styles.unit}> · {formatUnitPrice(detail.price.unitPrice)}</span>
      </span>
      <button
        type="button"
        className={styles.action}
        disabled={!onContact || closedReason !== undefined}
        onClick={onContact}
      >
        Mesaj gönder
      </button>
      {closedReason ? <p className={styles.reason}>{closedReason}</p> : null}
    </div>
  )
}
