// Bölge kartının harita yüzü için ilan pinleri. Kart "bu bölgede NE satılık?"
// sorusuna cevap verdiği için pinler bölge özetinden değil gerçek ilan
// veri setinden süzülür — arama haritasıyla aynı ilanlar, aynı kapsül dili.
import { compactPrice, LISTING_FIXTURES } from '@/features/listings/data/listing-adapter'
import type { RegionSummary } from '../domain/region-types'

export interface RegionListingPin {
  id: string
  /** Gerçek coğrafya — basemap yüklendiğinde kullanılır */
  lat: number
  lng: number
  /** Şematik yedek yüzey konumu (0-1) — zemin yüklenemezse */
  x: number
  y: number
  /** Kapsül pin etiketi (₺4,2M) — kart haritasında pinin tek sözü budur;
      detay popup'a değil doğrudan ilan sayfasına bırakılır. */
  price: string
}

/**
 * Kart yüzü küçük bir sahnedir: pin sayısı sınırlanır ki kapsüller birbirini
 * ezmesin. Sıralama veri setindeki deterministik sırayı korur — aynı bölge
 * her açılışta aynı pinleri gösterir.
 */
const MAX_PINS = 24

export function listingsForRegion(region: RegionSummary): RegionListingPin[] {
  return LISTING_FIXTURES.filter(
    (listing) => listing.city === region.city && listing.district === region.district,
  )
    .slice(0, MAX_PINS)
    .map((listing) => ({
      id: listing.id,
      lat: listing.coordinates.lat,
      lng: listing.coordinates.lng,
      x: listing.map.x,
      y: listing.map.y,
      price: compactPrice(listing.price, listing.transaction),
    }))
}
