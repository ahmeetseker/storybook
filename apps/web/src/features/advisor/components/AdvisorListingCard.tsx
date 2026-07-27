import { useId, useState } from 'react'
import { getRepresentativeListingImage } from '../../listings/data/listing-photos'
import type { AdvisorMatch } from '../domain/advisor-types'
import styles from './AdvisorListingCard.module.css'

export interface AdvisorListingCardProps {
  /** Karar verileriyle birlikte gösterilecek ilan eşleşmesi. */
  match: AdvisorMatch
  /** Kartı öne çıkan sonuç kompozisyonunda gösterir. */
  featured: boolean
  /** İlanın kalıcı favori durumunu belirtir. */
  favorite: boolean
  /** İlanın karşılaştırmaya eklenme durumunu belirtir. */
  compared: boolean
  /** İlan görseli veya ana inceleme eylemi seçildiğinde çağrılır. */
  onOpen: () => void
  /** Favori durumu değiştirilmek istendiğinde çağrılır. */
  onFavorite: () => void
  /** Karşılaştırma durumu değiştirilmek istendiğinde çağrılır. */
  onCompare: () => void
  /** Öneri gerekçesi istendiğinde çağrılır. */
  onExplain: () => void
  /** Benzer ilanlar istendiğinde çağrılır. */
  onSimilar: () => void
}

const formatPrice = (value: number) => `${value.toLocaleString('tr-TR')} TL`
const formatArea = (value: number) => `${value.toLocaleString('tr-TR')} m²`
const formatUnitPrice = (value: number) =>
  `${value.toLocaleString('tr-TR')} TL/m²`

export function AdvisorListingCard({
  match,
  featured,
  favorite,
  compared,
  onOpen,
  onFavorite,
  onCompare,
  onExplain,
  onSimilar,
}: AdvisorListingCardProps) {
  const titleId = useId()
  const { listing } = match
  const image = getRepresentativeListingImage(listing)
  const [failedImage, setFailedImage] = useState<{
    listingId: string
    fallbackSrc: string
  } | null>(null)
  const usesFallback =
    failedImage?.listingId === listing.id &&
    failedImage.fallbackSrc === image.fallbackSrc
  const imageSrc = usesFallback ? image.fallbackSrc : image.src

  const handleImageError = () => {
    if (!usesFallback) {
      setFailedImage({
        listingId: listing.id,
        fallbackSrc: image.fallbackSrc,
      })
    }
  }

  return (
    <article
      className={styles.card}
      data-featured={featured || undefined}
      aria-labelledby={titleId}
    >
      <button
        className={styles.mediaAction}
        type="button"
        aria-label={listing.title}
        onClick={onOpen}
      >
        <img src={imageSrc} alt={image.alt} onError={handleImageError} />
        <span className={styles.demoLabel}>Temsili fotoğraf</span>
        <span className={styles.photoCount}>
          {listing.imageCount} fotoğraf
        </span>
      </button>

      <div className={styles.body}>
        <div className={styles.identity}>
          <span
            className={styles.verification}
            data-state={listing.verified ? 'verified' : 'review'}
          >
            {listing.verified
              ? 'EİDS doğrulandı'
              : 'Belge incelemesi gerekiyor'}
          </span>
          <h3 id={titleId}>{listing.title}</h3>
          <p>
            {listing.city} / {listing.district}
          </p>
        </div>

        <dl className={styles.metrics}>
          <div>
            <dt>Fiyat</dt>
            <dd>{formatPrice(listing.price)}</dd>
          </div>
          <div>
            <dt>Alan</dt>
            <dd>{formatArea(listing.area)}</dd>
          </div>
          <div>
            <dt>m² fiyatı</dt>
            <dd>{formatUnitPrice(listing.unitPrice)}</dd>
          </div>
        </dl>

        <div className={styles.match}>
          <strong>%{match.score} eşleşme</strong>
          <p>{match.reasons[0]}</p>
        </div>

        <ul className={styles.highlights} aria-label="Öne çıkan özellikler">
          {listing.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button type="button" onClick={onOpen}>
            İlanı incele
          </button>
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
            onClick={onFavorite}
          >
            {favorite ? 'Kaydedildi' : 'Favori'}
          </button>
          <button
            type="button"
            aria-pressed={compared}
            aria-label={
              compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'
            }
            onClick={onCompare}
          >
            {compared ? 'Seçildi' : 'Karşılaştır'}
          </button>
          <button type="button" onClick={onExplain}>
            Neden önerildi?
          </button>
          <button type="button" onClick={onSimilar}>
            Benzer ilanları göster
          </button>
        </div>
      </div>
    </article>
  )
}
