import { useState } from 'react'

import type { ListingDetail, ListingMediaItem } from '../domain/listing-detail-types'
import { formatArea } from '../format'
import styles from './ListingStage.module.css'

export interface ListingStageProps {
  detail: ListingDetail
}

/**
 * Sayfayı açan sahne: tam genişlik kapak medyası, üstünde tek bir cam künye
 * kapsülü, altında cam plaka içinde başlık ve konum satırı.
 *
 * Cam bütçesi burada iki yüzeyle sınırlıdır (kapsül + plaka); dar yerleşimde
 * üçüncüsü yapışkan dock olur. Bu yüzden galeri kontrolleri AYRI bir cam
 * yüzeye alınmaz — sayaçla birlikte aynı kapsülün içinde yaşarlar
 * (`rules.md` §1: cam yalnız navigasyon/kontrol katmanında, cam üstüne cam yok).
 *
 * Fiyat burada YOKTUR: sayfanın en büyük sayısı tek bir yerde durur
 * (karar kolonu / fiyat bloğu), künye onu ikinci kez yazmaz.
 */
export function ListingStage({ detail }: ListingStageProps) {
  const photos = detail.media.filter((item) => item.representative)
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<string[]>([])

  const active: ListingMediaItem | undefined = photos[Math.min(index, photos.length - 1)]
  const preview = active?.representative
  const source =
    preview && failed.includes(preview.src) ? preview.fallbackSrc : preview?.src

  const step = (delta: number) =>
    setIndex((current) => (current + delta + photos.length) % photos.length)

  return (
    <div className={styles.stage}>
      {source && preview ? (
        <img
          key={active.id}
          className={styles.shot}
          src={source}
          alt={preview.alt}
          onError={() =>
            setFailed((current) =>
              current.includes(preview.src) ? current : [...current, preview.src],
            )
          }
        />
      ) : (
        // Görsel yoksa sahne boş bir kutu olarak durmaz: nedeni yazılır.
        <p className={styles.shotEmpty}>Bu kayıtta görsel dosyası bulunmuyor.</p>
      )}

      {active ? (
        <div className={styles.badge}>
          {photos.length > 1 ? (
            <button
              type="button"
              className={styles.step}
              aria-label="Önceki görsel"
              onClick={() => step(-1)}
            >
              ‹
            </button>
          ) : null}
          <span className={styles.badgeText}>
            {photos.length > 1 ? (
              <span className={styles.count}>
                {index + 1} / {photos.length}
              </span>
            ) : null}
            {active.label}
            {/* Temsili damgası sahnenin üstünde durur: görselin taşınmazın
                kendi fotoğrafı olmadığı, ona bakarken okunur. */}
            <span className={styles.stampNote}> · temsili</span>
          </span>
          {photos.length > 1 ? (
            <button
              type="button"
              className={styles.step}
              aria-label="Sonraki görsel"
              onClick={() => step(1)}
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.plate}>
        <h1 className={styles.title}>{detail.title}</h1>
        <p className={styles.sub}>{locationLine(detail)}</p>
      </div>
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
