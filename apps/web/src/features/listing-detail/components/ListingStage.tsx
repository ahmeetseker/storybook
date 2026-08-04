import type { ListingDetail } from '../domain/listing-detail-types'
import { formatArea } from '../format'
import { ListingGallery } from './ListingGallery'
import styles from './ListingStage.module.css'

export interface ListingStageProps {
  detail: ListingDetail
}

/**
 * Sayfayı açan sahne: bento galerisi ve altında ilan künyesi.
 *
 * Sahne iki parçadır ve sırası bilinçlidir:
 *
 * 1. **Galeri** (`ListingGallery`) — geniş kapta bento ızgarası, dar kapta
 *    kaydırmalı şerit. Fotoğrafın üstünde açılan işaretler (ilan no rozeti,
 *    favori/paylaş kapsülü, "Tümünü gör" örtüsü) kontrol katmanındadır.
 * 2. **Künye** — tek `h1` ve konum satırı. Künye cam DEĞİLDİR: cam yalnız
 *    navigasyon/kontrol katmanının malzemesidir, bir başlık kontrol değildir
 *    (bkz. `GenelBakis.mdx` katman modeli). Başlığı bento'nun üstüne örtmek
 *    hem okunurluğu hem kapak karesini bozardı.
 *
 * Fiyat burada YOKTUR: sayfanın en büyük sayısı tek bir yerde durur
 * (karar kolonu / fiyat bloğu), künye onu ikinci kez yazmaz.
 */
export function ListingStage({ detail }: ListingStageProps) {
  return (
    <div className={styles.stage}>
      <ListingGallery detail={detail} />

      <header className={styles.plate}>
        <h1 className={styles.title}>{detail.title}</h1>
        <p className={styles.sub}>{locationLine(detail)}</p>
      </header>
    </div>
  )
}

/**
 * Konum satırı: yalnız kayıtta gerçekten bulunan basamaklar yazılır.
 * Mahalle bilinmiyorsa basamak atlanır — boş bir ayraç veya ilçe tekrarı
 * üretilmez.
 */
function locationLine(detail: ListingDetail): string {
  const parts = [detail.location.city, detail.location.district]
  if (detail.location.neighbourhood) parts.push(detail.location.neighbourhood)
  parts.push(formatArea(detail.price.declaredArea))
  if (detail.kind === 'land' && detail.parcel.blockParcel.value) {
    parts.push(detail.parcel.blockParcel.value)
  }
  return parts.join(' · ')
}
