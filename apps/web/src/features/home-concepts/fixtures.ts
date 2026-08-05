import type {
  GlassAgencyCardProps,
  GlassListingCardProps,
  GlassTrustSignal,
  GlassVitrinItem,
} from '@repo/ui'
import { placeholderImage } from '../../../../../src/demo/placeholderImage'

export const landImages = [
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=640&q=82',
] as const

const leadingListings = [
  {
    id: '1084526631',
    title: 'İzmir Urla Denize 900 m, İmarlı Köşe Parsel',
    price: '4.250.000 TL',
    size: '512 m²',
    location: 'İzmir, Urla',
    eids: true,
    featured: true,
    image: landImages[0],
  },
  {
    id: '1084526634',
    title: 'Antalya Kaş Deniz Manzaralı Arsa',
    price: '6.900.000 TL',
    size: '780 m²',
    location: 'Antalya, Kaş',
    eids: true,
    featured: true,
    image: landImages[1],
  },
  {
    id: '1084526632',
    title: 'Ankara Gölbaşı Yol Cepheli Yatırımlık Tarla',
    price: '1.850.000 TL',
    size: '1.240 m²',
    location: 'Ankara, Gölbaşı',
    eids: true,
    featured: true,
    image: landImages[2],
  },
  {
    id: '1084526633',
    title: 'Bursa Nilüfer Villa İmarlı Arsa',
    price: '3.100.000 TL',
    size: '420 m²',
    location: 'Bursa, Nilüfer',
    eids: false,
    featured: true,
    image: landImages[3],
  },
  {
    id: '1084526635',
    title: 'Tekirdağ Şarköy Bağ Evi İzinli Tarla',
    price: '980.000 TL',
    size: '2.150 m²',
    location: 'Tekirdağ, Şarköy',
    eids: true,
    featured: true,
    image: landImages[4],
  },
  {
    id: '1084526636',
    title: 'Eskişehir Tepebaşı Sanayi İmarlı Parsel',
    price: '2.400.000 TL',
    size: '1.000 m²',
    location: 'Eskişehir, Tepebaşı',
    eids: false,
    featured: false,
    image: landImages[5],
  },
] as const

const listingLocations = [
  ['İzmir', 'Çeşme'],
  ['Muğla', 'Bodrum'],
  ['Balıkesir', 'Ayvalık'],
  ['İstanbul', 'Silivri'],
  ['Çanakkale', 'Ezine'],
  ['Antalya', 'Kemer'],
  ['Mersin', 'Erdemli'],
  ['Kocaeli', 'Kandıra'],
  ['Sakarya', 'Sapanca'],
  ['Bursa', 'İznik'],
  ['Aydın', 'Söke'],
  ['Manisa', 'Akhisar'],
  ['Ankara', 'Polatlı'],
  ['Konya', 'Meram'],
  ['Eskişehir', 'Odunpazarı'],
  ['Tekirdağ', 'Marmaraereğlisi'],
  ['Kırklareli', 'Vize'],
  ['Edirne', 'Keşan'],
  ['Muğla', 'Datça'],
  ['İzmir', 'Seferihisar'],
  ['Antalya', 'Konyaaltı'],
] as const

const listingTypes = [
  'Konut İmarlı Köşe Parsel',
  'Yol Cepheli Yatırımlık Tarla',
  'Deniz Manzaralı Villa Arsası',
  'Müstakil Tapulu Zeytinlik',
  'Bağ Evi Yapımına Uygun Arazi',
  'Ticari İmarlı Ana Yol Parseli',
  'Köy Yerleşik Alanında Bahçe',
  'Doğa İçinde Hobi Bahçesi',
] as const

const listingPrices = [
  '1.290.000 TL',
  '2.750.000 TL',
  '5.400.000 TL',
  '3.980.000 TL',
  '745.000 TL',
  '8.250.000 TL',
  '1.640.000 TL',
  '4.870.000 TL',
  '2.150.000 TL',
  '6.480.000 TL',
  '890.000 TL',
  '3.420.000 TL',
] as const

const listingSizes = [
  '420 m²',
  '685 m²',
  '1.240 m²',
  '2.850 m²',
  '510 m²',
  '930 m²',
  '3.600 m²',
  '1.750 m²',
] as const

const generatedListings = Array.from({ length: 42 }, (_, index) => {
  const [city, district] =
    listingLocations[index % listingLocations.length]
  const type = listingTypes[(index * 5) % listingTypes.length]

  return {
    id: String(1084526701 + index),
    title: `${city} ${district} ${type}`,
    price: listingPrices[(index * 7) % listingPrices.length],
    size: listingSizes[(index * 3) % listingSizes.length],
    location: `${city}, ${district}`,
    eids: index % 4 !== 1,
    featured: false,
    image: landImages[(index + 6) % landImages.length],
  }
})

const listingData = [...leadingListings, ...generatedListings]

export const homeListings: GlassListingCardProps[] = listingData.map(
  ({ id, title, price, size, location, image, featured }) => ({
    id,
    image: {
      src: image,
      alt: `${location} konumundaki ${title.toLocaleLowerCase('tr')} görseli`,
    },
    title,
    price,
    pricePrefix: 'Liste:',
    location,
    metrics: [
      { value: size, label: 'Alan' },
      { value: 'Müstakil', label: 'Tapu' },
    ],
    seller: 'Arsam ilanı',
    listedAt: 'Bugün',
    variant: 'propertyOverlay',
    material: 'flat',
    type: 'button',
    'aria-label': `${featured ? 'Öne çıkan ilan. ' : ''}${title}, ${location}, ${size}, ${price}`,
  }),
)

export const homeVitrinItems: GlassVitrinItem[] = listingData.map(
  ({ id, title, price, size, location, image, eids, featured }) => ({
    id,
    image,
    price,
    title,
    location: `${location} · ${size}`,
    eids,
    featured,
  }),
)

export const trustSignals: GlassTrustSignal[] = [
  {
    id: 'eids',
    label: 'EİDS ilan verme yetkisi',
    status: 'verified',
    detail: 'İlan sahibinin kimliği ve ilan verme yetkisi doğrulandı.',
  },
  {
    id: 'tapu',
    label: 'Tapu ve parsel kaydı',
    status: 'verified',
    detail: 'Ada, parsel ve yüzölçümü beyanı kayıtla eşleşti.',
  },
  {
    id: 'imar',
    label: 'İmar kaynağı',
    status: 'info',
    detail: 'İmar bilgisi için belediye kaynağı ve sorgu tarihi gösteriliyor.',
  },
  {
    id: 'ai-moderasyon',
    label: 'AI içerik incelemesi',
    status: 'verified',
    detail: 'İlan metninde riskli yönlendirme veya iletişim bilgisi bulunmadı.',
    aiGenerated: true,
    confidence: 94,
  },
]

export const agencyFixtures: GlassAgencyCardProps[] = [
  {
    name: 'Ege Arsa Ofisi',
    logoSrc: placeholderImage('EA', '#b45309', '#7c3d0a', 240, 240),
    tagline: 'İzmir ve çevresinde imarlı arsa uzmanı',
    stats: [
      { label: 'Aktif İlan', value: '48' },
      { label: 'Uzmanlık', value: '12 bölge' },
    ],
    verified: true,
    verifiedBy: 'arsam.net',
    phone: '0 (232) 456 78 90',
    variant: 'inline',
  },
  {
    name: 'Güney Sahil Gayrimenkul',
    logoSrc: placeholderImage('GS', '#3a7a8a', '#1f4a5f', 240, 240),
    tagline: 'Antalya ve Muğla sahil hattı',
    stats: [
      { label: 'Aktif İlan', value: '31' },
      { label: 'Danışman', value: '7' },
    ],
    verified: true,
    verifiedBy: 'arsam.net',
    phone: '0 (242) 312 44 08',
    variant: 'inline',
  },
  {
    name: 'Başkent Arazi',
    logoSrc: placeholderImage('BA', '#8a6f3a', '#5f4a1f', 240, 240),
    tagline: 'Ankara tarla ve yatırım arazileri',
    stats: [
      { label: 'Aktif İlan', value: '26' },
      { label: 'Deneyim', value: '11 yıl' },
    ],
    verified: true,
    verifiedBy: 'arsam.net',
    phone: '0 (312) 418 27 16',
    variant: 'inline',
  },
]
