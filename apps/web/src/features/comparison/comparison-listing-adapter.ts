import type { GlassCompareListing } from '@repo/ui'
import {
  LISTING_FIXTURES,
  type ListingSummary,
} from '../listings/data/listing-adapter'
import { getRepresentativeListingImage } from '../listings/data/listing-photos'

const MISSING_VALUE = 'Bilgi sağlanmadı'

export interface CompareProperty extends GlassCompareListing {
  city: string
  score: number | typeof MISSING_VALUE
  risk: string
  verification: string
  values: Record<string, string | number>
}

function valueOrMissing(value: string | undefined): string {
  return value ?? MISSING_VALUE
}

function toComparisonListing(listing: ListingSummary): CompareProperty {
  const representativeImage = getRepresentativeListingImage(listing)

  return {
    id: listing.id,
    title: listing.title,
    image: representativeImage.src,
    imageFallback: representativeImage.fallbackSrc,
    city: `${listing.city} · ${listing.district}`,
    score: MISSING_VALUE,
    risk: MISSING_VALUE,
    verification: MISSING_VALUE,
    values: {
      konum: `${listing.city} / ${listing.district}`,
      fiyat: listing.price,
      m2: listing.area,
      m2fiyat: listing.unitPrice,
      oda: valueOrMissing(listing.attributes.rooms),
      kat: valueOrMissing(listing.attributes.floor),
      yas: valueOrMissing(listing.attributes.age),
      aidat: valueOrMissing(listing.attributes.dues),
      isitma: valueOrMissing(listing.attributes.heating),
      imar: valueOrMissing(listing.attributes.zoning),
      eids: MISSING_VALUE,
    },
  }
}

/**
 * URL'deki seçim sırasını korur; yalnız fixture kaynağında bulunan ilanları
 * mevcut karşılaştırma görünümünün veri sözleşmesine dönüştürür.
 */
export function createComparisonListings(
  ids: readonly string[],
): CompareProperty[] {
  const listingsById = new Map(
    LISTING_FIXTURES.map((listing) => [listing.id, listing]),
  )

  return ids.flatMap((id) => {
    const listing = listingsById.get(id)
    return listing ? [toComparisonListing(listing)] : []
  })
}
