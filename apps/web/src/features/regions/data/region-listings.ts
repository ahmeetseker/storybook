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
  /** Kapsül pin etiketi (₺4,2M) */
  price: string
  /** Harita içi önizleme kartının içeriği */
  title: string
  meta: string
  fullPrice: string
  image: { src: string; alt: string }
  verified: boolean
  /** İlanın öne çıkanlarından derlenen tek satırlık AI değerlendirme notu */
  aiNote: string
  /** Deterministik AI uyum skoru (62-95) — aynı ilan her açılışta aynı puan */
  aiScore: number
}

/** `phaseFor` ile aynı aile: id'den deterministik, dar aralıklı bir skor. */
function aiScoreFor(id: string): number {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return 62 + (hash % 34)
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
      title: listing.title,
      meta: `${listing.neighbourhood} · ${listing.area} m² · ${listing.unitPrice.toLocaleString('tr-TR')} ₺/m²`,
      fullPrice: `${listing.price.toLocaleString('tr-TR')} ₺${listing.transaction === 'rent' ? '/ay' : ''}`,
      image: listing.image,
      verified: listing.verified,
      aiNote: listing.highlights.join(' · '),
      aiScore: aiScoreFor(listing.id),
    }))
}
