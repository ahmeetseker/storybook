import { placeholderImage, type ListingSummary } from './listing-adapter'
import { CATEGORY_LABELS } from './listing-attributes'

export type ListingPhotoCategory = ListingSummary['category']

/** Bir görsel ve yüklenemediğinde gösterilecek gerileme karesi. */
export interface ListingPhoto {
  src: string
  fallbackSrc: string
  alt: string
}

/**
 * Temsili (stok) fotoğraf havuzu.
 *
 * Bu kareler taşınmazın **kendi** fotoğrafları değildir; ürün verisinde
 * gerçek ilan görseli bulunmadığı için kategoriyi temsil eden stok kareler
 * gösterilir. Bu, kullanıcıdan gizlenmez: görseli gösteren her yüzey
 * `REPRESENTATIVE_IMAGE_NOTE` cümlesini görünür metin olarak yazar.
 *
 * Havuz kategori başına sıralıdır; ilk kare kartlarda ve karşılaştırmada
 * kullanılan kapak karesidir.
 */
const STOCK_PHOTOS_BY_CATEGORY = {
  land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=84',
  ],
  residential: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84',
  ],
  building: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84',
  ],
  timeshare: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=84',
  ],
  touristic: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=84',
  ],
} satisfies Record<ListingPhotoCategory, string[]>

/**
 * Temsili görsel kullanımının **tek** görünür açıklaması.
 *
 * Metin tek kaynaktan gelir: karşılaştırma tezgâhı ve ilan detayı aynı
 * cümleyi yazar. İki ayrı cümle iki ayrı iddia demek olurdu.
 */
export const REPRESENTATIVE_IMAGE_NOTE =
  'Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.'

export function getRepresentativeListingImage(listing: ListingSummary): ListingPhoto {
  return {
    src: STOCK_PHOTOS_BY_CATEGORY[listing.category][0],
    fallbackSrc: listing.image.src,
    alt: `${listing.title} için temsili ilan fotoğrafı`,
  }
}

/**
 * Bir kayda bağlı olmadan, yalnız kategoriden temsili kare üretir.
 *
 * İlan detayının medya şeridi birden çok kare ister; havuz tükendiğinde
 * başa dönülür (aynı stok kare tekrar gösterilir), uydurma yeni bir görsel
 * üretilmez. Gerileme karesi arama kartlarıyla aynı yer tutucudur.
 */
export function getCategoryStockPhoto(
  category: ListingPhotoCategory,
  index: number,
  altText: string,
): ListingPhoto {
  const pool = STOCK_PHOTOS_BY_CATEGORY[category]
  return {
    src: pool[index % pool.length],
    fallbackSrc: placeholderImage(category, CATEGORY_LABELS[category]),
    alt: altText,
  }
}
