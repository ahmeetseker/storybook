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
