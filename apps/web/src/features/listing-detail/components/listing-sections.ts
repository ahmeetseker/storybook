import type { ListingDetail } from '../domain/listing-detail-types'

/**
 * Sayfadaki kanıt bölümlerinin tek sırası.
 *
 * Hem sticky bölüm indeksinin bağlantıları hem bölüm başlıkları bu listeden
 * okunur; etiket ile `<h2>` metni birebir aynıdır.
 */
export const LISTING_SECTIONS = [
  { id: 'ozet', label: 'Özet' },
  { id: 'parsel', label: 'Parsel' },
  { id: 'imar', label: 'İmar ve Hukuk' },
  { id: 'altyapi', label: 'Altyapı ve Erişim' },
  { id: 'arazi', label: 'Arazi ve Tehlike' },
  { id: 'piyasa', label: 'Piyasa' },
  { id: 'belgeler', label: 'Belgeler' },
] as const

/**
 * Yansıtılmış ilanın bölüm sırası.
 *
 * Arsa kanıt paketi (parsel/imar/altyapı/arazi/piyasa) bu ilanlarda **yoktur**,
 * dolayısıyla indekste de yoktur: indeks render edilmeyen bir bölüme
 * bağlanmaz. Boş bir "Parsel" bölümü açıp içine gerekçe yazmak, sorulmamış bir
 * sorunun cevapsız kaldığını iddia etmek olurdu.
 */
export const PROJECTED_LISTING_SECTIONS = [
  { id: 'ozet', label: 'Özet' },
  { id: 'beyan', label: 'Beyan Edilen Özellikler' },
  { id: 'belgeler', label: 'Belgeler' },
] as const

export interface ListingSectionLink {
  id: string
  label: string
}

/** İlanın paketine göre gerçekten render edilen bölümler. */
export function sectionsFor(detail: ListingDetail): readonly ListingSectionLink[] {
  return detail.kind === 'land' ? LISTING_SECTIONS : PROJECTED_LISTING_SECTIONS
}
