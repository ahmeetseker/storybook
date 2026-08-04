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
 * Havuz kategori başına sıralıdır; **ilk kare** kartlarda, karşılaştırmada ve
 * ilan detayının kapağında kullanılan karedir — sırası değiştirilmez, yeni
 * kareler yalnız sona eklenir. Kalan kareler ilan detayının bento ızgarasını
 * kurar; bu yüzden her kategoride en az dört kare bulunur (bkz.
 * `features/listing-detail/rules.md` §1c).
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
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=84',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=1200&q=84',
  ],
  building: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=84',
  ],
  timeshare: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=84',
  ],
  touristic: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=84',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=84',
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
/**
 * Kategorinin havuzundaki **farklı** kare sayısı.
 *
 * Çağıran taraf kaç kare isteyeceğini buna göre sınırlar: havuz tükendiğinde
 * `getCategoryStockPhoto` başa döner ve aynı kare ikinci kez görünür. Aynı
 * fotoğrafı ızgarada iki kez göstermek "iki ayrı görsel var" izlenimi verirdi.
 */
export function stockPhotoCount(category: ListingPhotoCategory): number {
  return STOCK_PHOTOS_BY_CATEGORY[category].length
}

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
