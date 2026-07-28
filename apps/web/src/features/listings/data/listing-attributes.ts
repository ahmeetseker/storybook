import type { PropertyCategory, TransactionType } from '../domain/search-state'

/**
 * Arama kaydındaki teknik anahtarların görünür Türkçe karşılıkları.
 *
 * `ListingSummary.attributes` anahtar/değer çiftlerini İngilizce sabitlerle
 * taşır (`{ rooms: '3+1', heating: 'floor' }`). Bu sözlük onları kullanıcıya
 * gösterilecek metne çevirir ve **tanımladığı verinin yanında**, listings
 * feature'ında durur: aynı anahtarları hem arama hem ilan detayı okur, iki
 * yerde iki farklı Türkçe etiket üretilmemelidir.
 *
 * Eşleşme bulunmadığında ham anahtar/değer olduğu gibi döner — uydurma bir
 * çeviri üretilmez.
 */

export const CATEGORY_LABELS: Record<Exclude<PropertyCategory, 'all'>, string> = {
  residential: 'Konut',
  land: 'Arsa',
  commercial: 'İş Yeri',
  building: 'Bina',
  timeshare: 'Devremülk',
  touristic: 'Turistik Tesis',
}

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  sale: 'Satılık',
  rent: 'Kiralık',
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  zoning: 'İmar durumu',
  deed: 'Tapu türü',
  road: 'Yol cephesi',
  rooms: 'Oda sayısı',
  heating: 'Isıtma',
  age: 'Bina yaşı',
  furnished: 'Eşya durumu',
  subtype: 'Alt tür',
  status: 'Kullanım durumu',
  parking: 'Otopark',
  frontage: 'Cephe',
  units: 'Bağımsız bölüm sayısı',
  floors: 'Kat sayısı',
  occupancy: 'Doluluk',
  period: 'Kullanım dönemi',
  capacity: 'Kapasite (kişi)',
  facility: 'Tesis türü',
  licensed: 'Ruhsat / belge beyanı',
}

const ATTRIBUTE_VALUE_LABELS: Record<string, Record<string, string>> = {
  zoning: { residential: 'Konut imarlı', tourism: 'Turizm imarlı', field: 'Tarla' },
  deed: { detached: 'Müstakil tapu', shared: 'Hisseli tapu' },
  road: { frontage: 'Yola cepheli' },
  heating: { floor: 'Yerden ısıtma', 'natural-gas': 'Doğal gaz' },
  age: { '0-5': '0–5 yıl' },
  furnished: { yes: 'Eşyalı', no: 'Eşyasız' },
  subtype: {
    office: 'Ofis',
    shop: 'Dükkân',
    'boutique-hotel': 'Butik otel',
    pension: 'Pansiyon',
  },
  status: { vacant: 'Boş', tenanted: 'Kiracılı' },
  parking: { yes: 'Var', no: 'Yok' },
  frontage: { street: 'Cadde cepheli' },
  occupancy: { full: 'Tam dolu', vacant: 'Boş' },
  period: { summer: 'Yaz dönemi', winter: 'Kış dönemi' },
  facility: { resort: 'Tatil köyü', thermal: 'Termal tesis' },
  licensed: { yes: 'Ruhsatlı olduğu beyan edildi', no: 'Ruhsatsız olduğu beyan edildi' },
}

/** Özellik anahtarının görünür etiketi; bilinmeyen anahtar olduğu gibi döner. */
export function attributeLabel(key: string): string {
  return ATTRIBUTE_LABELS[key] ?? key
}

/** Özellik değerinin görünür karşılığı; bilinmeyen değer olduğu gibi döner. */
export function attributeValueLabel(key: string, value: string): string {
  return ATTRIBUTE_VALUE_LABELS[key]?.[value] ?? value
}

/**
 * Şehir/ilçe anahtarının görünür adı.
 *
 * Arama kaydı yer adlarını küçük harfli anahtar olarak tutar (`izmir`,
 * `gölbaşı`). Yalnız ilk harf Türkçe yerel kurallarıyla büyütülür — `i` → `İ`.
 * Yeni bir ad uydurulmaz; anahtar neyse görünen ad odur.
 */
export function placeLabel(slug: string): string {
  if (!slug) return slug
  return slug.charAt(0).toLocaleUpperCase('tr-TR') + slug.slice(1)
}
