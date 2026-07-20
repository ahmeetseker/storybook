import type {
  CodexCarouselItem,
  CodexFloorPlan,
  CodexMapMarker,
  CodexMediaItem,
  CodexNearbyPlace,
  CodexPhotoFeature,
} from './index'

export const galleryItems: CodexMediaItem[] = [
  { id: 'front', alt: 'Taş cepheli iki katlı evin bahçeden görünümü', caption: 'Gün ışığı alan taş cephe ve peyzajlı giriş', eyebrow: 'Dış cephe', tone: 'earth' },
  { id: 'living', alt: 'Geniş pencereli salon ve şömine', caption: 'Bahçeye açılan 42 m² salon', eyebrow: 'Yaşam alanı', tone: 'interior' },
  { id: 'garden', alt: 'Zeytin ağaçlarıyla çevrili arka bahçe', caption: 'Korunaklı bahçe ve dinlenme alanı', eyebrow: 'Bahçe', tone: 'forest' },
  { id: 'coast', alt: 'Teras üzerinden deniz ve kıyı görünümü', caption: 'Üst terastan kesintisiz kıyı görünümü', eyebrow: 'Manzara', tone: 'coast' },
  { id: 'tour', type: 'video', alt: 'Evin oda oda tanıtım videosu', caption: '2 dakika 14 saniyelik ev turu', eyebrow: 'Video tur', duration: '2:14', tone: 'city' },
  { id: 'panorama', type: 'panorama', alt: 'Salonun etkileşimli 360 derece görünümü', caption: 'Salonun tamamını 360° inceleyin', eyebrow: 'Sanal tur', tone: 'interior' },
  { id: 'plan', type: 'floorplan', alt: 'Zemin ve üst kat yerleşim planı', caption: 'Toplam 186 m² net kullanım alanı', eyebrow: 'Kat planı', tone: 'blueprint' },
]

export const carouselItems: CodexCarouselItem[] = [
  { ...galleryItems[0], title: 'Taş cephe', description: 'Yerel taş, ahşap doğrama ve korunaklı giriş.', meta: 'Dış cephe · Güncel', badge: 'Öne çıkan' },
  { ...galleryItems[1], title: 'Ana salon', description: 'Bahçe kotuna açılan, şömineli yaşam alanı.', meta: '42 m² · Güneybatı' },
  { ...galleryItems[2], title: 'Zeytin bahçesi', description: 'Bakımlı peyzaj ve otomatik sulama hattı.', meta: '640 m² parsel' },
  { ...galleryItems[3], title: 'Üst teras', description: 'Gün batımı yönünde kesintisiz görüş.', meta: '18 m² · Deniz yönü' },
  { ...galleryItems[4], title: 'Video tur', description: 'Oda geçişlerini ve gün ışığını birlikte görün.', meta: '2:14 · Sesli' },
]

export const mapMarkers: CodexMapMarker[] = [
  { id: 'listing-a', label: 'Taş ev ve zeytin bahçesi', x: 52, y: 48, kind: 'listing', price: '18,9 Mn TL', description: 'Urla · İskele, yaklaşık konum', meta: 'Ana ilan' },
  { id: 'listing-b', label: 'Müstakil bahçeli villa', x: 73, y: 30, kind: 'listing', price: '16,4 Mn TL', description: 'Karşılaştırılabilir yakın ilan', meta: '1,1 km' },
  { id: 'metro', label: 'İskele dolmuş durağı', x: 61, y: 67, kind: 'transport', description: 'Merkez yönü düzenli sefer', meta: '720 m' },
  { id: 'school', label: 'Urla Anadolu Lisesi', x: 82, y: 59, kind: 'school', description: 'Kamu ortaöğretim kurumu', meta: '1,6 km' },
  { id: 'health', label: 'Aile Sağlığı Merkezi', x: 36, y: 34, kind: 'health', description: 'Hafta içi hizmet veriyor', meta: '980 m' },
  { id: 'coast-place', label: 'İskele yürüyüş yolu', x: 24, y: 72, kind: 'place', description: 'Kıyı yürüyüşü ve dinlenme alanı', meta: '540 m' },
]

export const nearbyPlaces: CodexNearbyPlace[] = [
  { id: 'coast', name: 'İskele yürüyüş yolu', category: 'coast', distanceMeters: 540, walkMinutes: 7, driveMinutes: 3, description: 'Kıyı ve dinlenme alanı', verified: true, x: 25, y: 74 },
  { id: 'stop', name: 'Merkez dolmuş durağı', category: 'transport', distanceMeters: 720, walkMinutes: 9, driveMinutes: 3, description: 'Urla merkez yönü', verified: true, x: 62, y: 70 },
  { id: 'market', name: 'Mahalle pazarı', category: 'market', distanceMeters: 860, walkMinutes: 11, driveMinutes: 4, description: 'Cumartesi günleri açık', x: 76, y: 39 },
  { id: 'health', name: 'Aile Sağlığı Merkezi', category: 'health', distanceMeters: 980, walkMinutes: 13, driveMinutes: 4, description: 'Hafta içi 08.30–17.00', verified: true, x: 30, y: 28 },
  { id: 'park', name: 'İskele çocuk parkı', category: 'park', distanceMeters: 1100, walkMinutes: 15, driveMinutes: 5, description: 'Gölgelikli oyun alanı', x: 18, y: 43 },
  { id: 'school', name: 'Urla Anadolu Lisesi', category: 'school', distanceMeters: 1600, walkMinutes: 22, driveMinutes: 6, description: 'Kamu ortaöğretim kurumu', verified: true, x: 83, y: 60 },
]

export const floorPlans: CodexFloorPlan[] = [
  {
    id: 'ground',
    label: 'Zemin kat',
    area: '104 m² net',
    alt: 'Zemin kat yerleşim planı; salon, mutfak, çalışma odası, banyo ve teras',
    note: 'Ölçüler ilan sahibi tarafından sağlanmıştır; uygulama öncesinde yerinde doğrulayın.',
    rooms: [
      { id: 'living', label: 'Salon', area: '42 m²', detail: 'Bahçe ve terasa iki ayrı açıklık.', x: 4, y: 5, width: 43, height: 43 },
      { id: 'kitchen', label: 'Mutfak', area: '19 m²', detail: 'Ada tezgâh ve kiler bağlantısı.', x: 49, y: 5, width: 27, height: 43 },
      { id: 'study', label: 'Çalışma', area: '12 m²', detail: 'Girişe yakın, misafir odası kullanımına uygun.', x: 78, y: 5, width: 18, height: 24 },
      { id: 'bath', label: 'Banyo', area: '6 m²', detail: 'Duş ve çamaşır nişi.', x: 78, y: 31, width: 18, height: 17 },
      { id: 'terrace', label: 'Teras', area: '24 m²', detail: 'Salon ve bahçe arasında yarı açık alan.', x: 4, y: 52, width: 45, height: 25 },
      { id: 'entry', label: 'Giriş / hol', area: '9 m²', detail: 'Merdiven ve depoya doğrudan erişim.', x: 51, y: 52, width: 45, height: 25 },
    ],
  },
  {
    id: 'upper',
    label: 'Üst kat',
    area: '82 m² net',
    alt: 'Üst kat yerleşim planı; üç yatak odası, iki banyo ve teras',
    rooms: [
      { id: 'master', label: 'Ana yatak', area: '24 m²', detail: 'Giyinme ve ebeveyn banyosu bağlantısı.', x: 4, y: 5, width: 42, height: 43 },
      { id: 'bed-2', label: 'Oda 2', area: '15 m²', detail: 'Bahçe yönü.', x: 48, y: 5, width: 24, height: 43 },
      { id: 'bed-3', label: 'Oda 3', area: '13 m²', detail: 'Çalışma odası kullanımına uygun.', x: 74, y: 5, width: 22, height: 43 },
      { id: 'bath-up', label: 'Banyo', area: '7 m²', detail: 'Ortak kat banyosu.', x: 4, y: 52, width: 22, height: 24 },
      { id: 'hall-up', label: 'Kat holü', area: '8 m²', detail: 'Çatı ışıklığı bulunur.', x: 28, y: 52, width: 28, height: 24 },
      { id: 'terrace-up', label: 'Üst teras', area: '18 m²', detail: 'Deniz ve gün batımı yönü.', x: 58, y: 52, width: 38, height: 24 },
    ],
  },
  {
    id: 'garden',
    label: 'Bahçe planı',
    area: '640 m² parsel',
    alt: 'Bahçe kullanım planı; yapı, otopark, zeytinlik ve dinlenme bölümü',
    rooms: [
      { id: 'building', label: 'Yapı oturumu', area: '126 m²', detail: 'Parselin kuzeydoğu bölümünde.', x: 55, y: 8, width: 37, height: 42 },
      { id: 'parking', label: 'Otopark', area: '44 m²', detail: 'İki araçlık açık alan.', x: 55, y: 54, width: 37, height: 22 },
      { id: 'olive', label: 'Zeytinlik', area: '280 m²', detail: 'On iki yetişkin zeytin ağacı.', x: 7, y: 8, width: 43, height: 45 },
      { id: 'garden-lounge', label: 'Dinlenme', area: '72 m²', detail: 'Gölgelik ve açık mutfak altyapısı.', x: 7, y: 57, width: 43, height: 19 },
    ],
  },
]

export const photoFeatures: CodexPhotoFeature[] = [
  { id: 'stone', label: 'Doğal taş cephe', description: 'Derzler düzenli görünüyor; kuzey köşede yerinde kontrol önerilir.', x: 36, y: 48, tone: 'success', confidence: 93, source: 'expert' },
  { id: 'window', label: 'Ahşap doğrama', description: 'Geniş açıklıklar gün ışığını artırıyor; cam türü ilanda belirtilmemiş.', x: 63, y: 40, tone: 'info', confidence: 88, source: 'ai' },
  { id: 'roof', label: 'Çatı birleşimi', description: 'Oluk hattında renk farkı seçiliyor; nem ölçümüyle doğrulanmalı.', x: 57, y: 21, tone: 'warning', confidence: 72, source: 'ai' },
  { id: 'access', label: 'Basamaksız giriş', description: 'Bahçe yolundan ana girişe düşük eğimli erişim görünüyor.', x: 77, y: 72, tone: 'info', confidence: 81, source: 'listing' },
]
