import { useState } from 'react'
import { GlassSurface } from '@repo/ui'

import type { ListingMediaItem } from '../domain/listing-detail-types'
import { formatDate } from '../format'
import styles from './ListingMediaStage.module.css'

export interface ListingMediaStageProps {
  media: ListingMediaItem[]
}

/** Kalemin künyesi: çekim tarihi ve varsa yapay zekâ düzenleme etiketi. */
function itemMeta(item: ListingMediaItem): string {
  const capture = item.capturedAt
    ? `Çekim: ${formatDate(item.capturedAt)}`
    : 'Çekim tarihi bildirilmedi'
  return item.aiEdited ? `${capture} · yapay zekâ ile düzenlendi` : capture
}

/**
 * Görsel karesi olmayan kalemler.
 *
 * Kayıtta gerçekten görsel yoksa sahne boş bırakılmaz; döküm metin olarak
 * durur. Blok bilinçli olarak **derli topludur**: eksik medya bir kolonu
 * baştan aşağı işgal etmez, çünkü söylediği şey tek cümleliktir.
 */
function MediaInventory({
  items,
  title,
}: {
  items: ListingMediaItem[]
  title: string
}) {
  return (
    <div className={styles.inventory}>
      <p className={styles.inventoryTitle}>{title}</p>
      <ul className={styles.inventoryList}>
        {items.map((item) => (
          <li key={item.id}>
            <span className={styles.inventoryLabel}>{item.label}</span>
            <span className={styles.inventoryMeta}>{itemMeta(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Yüklenemeyen temsili kare yerine kategori zeminli yer tutucuya düşer. */
function useFallbackSrc(): [(src: string) => boolean, (src: string) => void] {
  const [failed, setFailed] = useState<string[]>([])
  return [
    (src) => failed.includes(src),
    (src) => setFailed((current) => (current.includes(src) ? current : [...current, src])),
  ]
}

/**
 * İlanın medya sahnesi: 16:9 kapak karesi, kare geçiş kontrolleri ve küçük
 * görsel şeridi.
 *
 * Görseller **temsilidir** — taşınmazın kendi fotoğrafı değildir; açıklama
 * cümlesi (`REPRESENTATIVE_IMAGE_NOTE`, karşılaştırma tezgâhıyla tek kaynak)
 * sahne altına yazılmaz. Fotoğraf olmayan kalemler (parsel
 * görünümü, plan notu) kare taşımaz; künyeleriyle birlikte döküm olarak durur.
 *
 * Kontrol grubu sayfanın kontrol katmanına ait tek cam yüzeydir ve yalnız
 * birden çok kare varken render edilir — çalışmayan kontrol gösterilmez.
 */
export function ListingMediaStage({ media }: ListingMediaStageProps) {
  const photos = media.filter((item) => item.representative)
  const others = media.filter((item) => !item.representative)
  const [index, setIndex] = useState(0)
  const [hasFailed, markFailed] = useFallbackSrc()

  if (photos.length === 0) {
    if (media.length === 0) {
      return <p className={styles.inventoryTitle}>Bu kayıtta medya bilgisi bulunmuyor.</p>
    }
    return (
      <MediaInventory
        items={media}
        title="Görsel dosyaları bu kayıtta bulunmuyor. İlanda listelenen medya:"
      />
    )
  }

  const active = photos[Math.min(index, photos.length - 1)]
  const preview = active.representative!
  const source = hasFailed(preview.src) ? preview.fallbackSrc : preview.src
  const step = (delta: number) =>
    setIndex((current) => (current + delta + photos.length) % photos.length)

  return (
    <div className={styles.stage}>
      <figure className={styles.cover}>
        <img
          key={active.id}
          className={styles.coverImage}
          src={source}
          alt={preview.alt}
          onError={() => markFailed(preview.src)}
        />

        {photos.length > 1 ? (
          <GlassSurface
            shape="capsule"
            thickness={0.5}
            tone="light"
            className={styles.controls}
            aria-label="Görsel gezinmesi"
            role="group"
          >
            <button
              type="button"
              className={styles.controlButton}
              onClick={() => step(-1)}
              aria-label="Önceki görsel"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <span className={styles.counter}>
              {`${Math.min(index, photos.length - 1) + 1} / ${photos.length}`}
            </span>
            <button
              type="button"
              className={styles.controlButton}
              onClick={() => step(1)}
              aria-label="Sonraki görsel"
            >
              <span aria-hidden="true">›</span>
            </button>
          </GlassSurface>
        ) : null}

        <figcaption className={styles.caption}>
          <span className={styles.captionLabel}>{active.label}</span>
          <span className={styles.captionMeta}>{itemMeta(active)}</span>
        </figcaption>
      </figure>

      {photos.length > 1 ? (
        <ul className={styles.thumbs}>
          {photos.map((item, i) => {
            const thumb = item.representative!
            const thumbSrc = hasFailed(thumb.src) ? thumb.fallbackSrc : thumb.src
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.thumb}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                >
                  <img
                    className={styles.thumbImage}
                    src={thumbSrc}
                    alt=""
                    onError={() => markFailed(thumb.src)}
                  />
                  <span className={styles.thumbLabel}>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {others.length > 0 ? (
        <MediaInventory
          items={others}
          title="Bu kayıtta ayrıca görsel dosyası olmayan kalemler listelendi:"
        />
      ) : null}
    </div>
  )
}
