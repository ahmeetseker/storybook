import type { ListingDetail } from '../domain/listing-detail-types'
import { contactClosedReason, formatPrice, formatUnitPrice } from '../format'
import { SELLER_SECTION_ID } from './seller-reveal'
import styles from './ListingDock.module.css'

export interface ListingDockProps {
  detail: ListingDetail
}

/**
 * Yapışkan karar dock'u — yalnız dar ve orta yerleşimde.
 *
 * Geniş yerleşimde yerini karar kartı alır ve dock DOM'dan değil yerleşimden
 * düşer (`display: none`): ikisi hiçbir zaman aynı anda görünmez.
 *
 * **İş bölümü (bkz. `rules.md` §1b):** kart ile dock aynı kontrolü iki kez
 * çizmez. Dar yerleşimde kartın tamamı (fiyat bloğu, sekmeler, eylem bölgesi)
 * yerleşimden düşer; dock iki şey taşır: **fiyat çapası** ve **satıcı
 * bölümüne götüren tek bağlantı**. Dock kendi başına bir karar yüzeyi
 * değildir — kanıt akıştaki bölümlerde, iletişim satıcı bölümündedir; dock
 * oraya götürür.
 *
 * Dock'ta mesaj butonu **yoktur**: mesajlaşma bu sürümde bağlı değildir ve
 * rotası olmayan kontrol çizilmez (`rules.md` §4). İletişim kapalıyken de
 * bağlantı çalışır (gerekçe satıcı bölümünde yazılıdır); dock durumu tek
 * satırda bildirir, kartın uyarı cümlesini ikinci kez yazmaz.
 *
 * Çapa `body` ölçeğindedir: sayfanın en büyük sayısı akıştaki fiyat bloğudur,
 * bu satır onun kaydırılıp gitmiş hâlinin referansıdır, ikinci bir vurgu
 * değil.
 */
export function ListingDock({ detail }: ListingDockProps) {
  const closedReason = contactClosedReason(detail.lifecycle)

  return (
    // data-page-dock: kabuğun yüzen AI butonu bu işareti görünce dock'un
    // üstüne çıkar (app.css) — dock alt boşluk taşımaz, buton da ezilmez.
    <div className={styles.dock} data-page-dock>
      <span className={styles.anchor}>
        {formatPrice(detail.price.amount)}
        <span className={styles.unit}> · {formatUnitPrice(detail.price.unitPrice)}</span>
      </span>
      <a className={styles.action} href={`#${SELLER_SECTION_ID}`}>
        Satıcıya git
      </a>
      {closedReason ? (
        <p className={styles.reason}>İletişim kapalı — gerekçe satıcı bölümünde.</p>
      ) : null}
    </div>
  )
}
