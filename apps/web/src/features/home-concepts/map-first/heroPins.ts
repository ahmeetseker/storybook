// Hero haritasının pin kaynağı.
//
// Harita bir vitrin resmi değil bir iniş aracı: kullanıcı ülke kadrajındaki
// yoğunluk rozetine tıklar, kadraj bölgeye iner, rozet alt rozetlere ayrılır,
// sonunda tek tek ilanların fiyat kapsülleri kalır. Bu zincirin çalışması için
// haritada rozet üretecek kadar VERİ olması gerekir — beş elle yazılmış pin ile
// kümeleme hiç devreye girmiyordu.
//
// Veri deterministik üretilir (Math.random YASAK): aynı ilan her yüklemede
// aynı noktada durur, aksi halde kullanıcı geri döndüğünde harita değişirdi.
import type { GlassMapPin } from '@repo/ui'
import type { HeroTabId } from './heroTabs'

/** İlanın kapsülünün ötesinde popup'ın gösterdiği bilgi. */
export interface HeroPin extends GlassMapPin {
  title: string
  meta: string
  href: string
}

interface CitySeed {
  name: string
  /** İlçe/semt adı — popup'ta konumu ayırt eder */
  district: string
  lat: number
  lng: number
  /** Bu şehre düşen ilan sayısı — yoğunluk farkı rozetlerde görünür */
  weight: number
}

/**
 * Şehir merkezleri. Ağırlıklar gerçek pazar yoğunluğunu kabaca izler: ülke
 * kadrajında Marmara ve Ege'nin baskın, İç Anadolu'nun orta, Doğu'nun seyrek
 * görünmesi haritanın ilk bakışta doğru bir hikâye anlatmasını sağlar.
 */
const CITY_SEEDS: CitySeed[] = [
  { name: 'İstanbul', district: 'Beykoz', lat: 41.01, lng: 28.98, weight: 14 },
  { name: 'İzmir', district: 'Urla', lat: 38.42, lng: 27.14, weight: 11 },
  { name: 'Balıkesir', district: 'Ayvalık', lat: 39.65, lng: 27.89, weight: 9 },
  { name: 'Muğla', district: 'Bodrum', lat: 37.03, lng: 27.43, weight: 9 },
  { name: 'Antalya', district: 'Kaş', lat: 36.9, lng: 30.7, weight: 8 },
  { name: 'Ankara', district: 'Gölbaşı', lat: 39.93, lng: 32.86, weight: 8 },
  { name: 'Bursa', district: 'Nilüfer', lat: 40.19, lng: 29.06, weight: 7 },
  { name: 'Tekirdağ', district: 'Şarköy', lat: 40.98, lng: 27.51, weight: 6 },
  { name: 'Kocaeli', district: 'Kandıra', lat: 40.77, lng: 29.94, weight: 6 },
  { name: 'Çanakkale', district: 'Ayvacık', lat: 40.15, lng: 26.41, weight: 5 },
  { name: 'Aydın', district: 'Kuşadası', lat: 37.85, lng: 27.84, weight: 5 },
  { name: 'Sakarya', district: 'Karasu', lat: 40.76, lng: 30.38, weight: 4 },
  { name: 'Eskişehir', district: 'Tepebaşı', lat: 39.78, lng: 30.52, weight: 4 },
  { name: 'Denizli', district: 'Pamukkale', lat: 37.78, lng: 29.09, weight: 4 },
  { name: 'Mersin', district: 'Erdemli', lat: 36.81, lng: 34.64, weight: 4 },
  { name: 'Konya', district: 'Selçuklu', lat: 37.87, lng: 32.48, weight: 3 },
  { name: 'Adana', district: 'Seyhan', lat: 37.0, lng: 35.32, weight: 3 },
  { name: 'Kayseri', district: 'Melikgazi', lat: 38.73, lng: 35.49, weight: 3 },
  { name: 'Samsun', district: 'Atakum', lat: 41.29, lng: 36.33, weight: 3 },
  { name: 'Trabzon', district: 'Ortahisar', lat: 41.0, lng: 39.72, weight: 3 },
  { name: 'Gaziantep', district: 'Şahinbey', lat: 37.07, lng: 37.38, weight: 2 },
  { name: 'Edirne', district: 'Keşan', lat: 41.68, lng: 26.56, weight: 2 },
]

/** Sekmeye göre başlık kalıbı ve fiyat ölçeği. */
const TAB_PROFILE: Record<HeroTabId, { noun: string; base: number; span: number; detail: string[] }> = {
  arsa: {
    noun: 'arsa',
    base: 1_400_000,
    span: 9_000_000,
    detail: ['konut imarlı', 'yola cepheli', 'tarla vasıflı', 'deniz manzaralı'],
  },
  konut: {
    noun: 'konut',
    base: 2_600_000,
    span: 14_000_000,
    detail: ['2+1', '3+1', '4+1', 'dubleks'],
  },
  proje: {
    noun: 'proje',
    base: 4_800_000,
    span: 22_000_000,
    detail: ['1. etap', '2. etap', 'teslim 2027', 'teslim 2028'],
  },
}

/**
 * Kabaca Türkiye sınırlarına oturan doğrusal eşleme. Zemin (tile) yüklenemezse
 * `GlassMap` şematik SVG yüzeyine düşer ve pinleri buradan konumlandırır;
 * `x`/`y` verilmeyen pin hiç çizilmez (bkz. heroTabs.ts başlığı).
 */
function schematic(lat: number, lng: number): { x: number; y: number } {
  return {
    x: Math.min(1, Math.max(0, (lng - 26) / (45 - 26))),
    y: Math.min(1, Math.max(0, (42 - lat) / (42 - 36))),
  }
}

/**
 * Şehir merkezi çevresine deterministik dağılım. Altın oranlı açı adımı
 * ardışık ilanları birbirinden en uzak yönlere yerleştirir; yarıçap kök
 * fonksiyonuyla büyüdüğü için yoğunluk merkeze doğru artar — gerçek bir
 * şehirde olduğu gibi.
 */
function offset(index: number): { dLat: number; dLng: number } {
  const angle = index * 2.39996
  const radius = 0.055 * Math.sqrt(index + 1)
  return { dLat: radius * Math.cos(angle), dLng: radius * Math.sin(angle) * 1.25 }
}

/** Harita kapsülü için kısaltılmış fiyat (₺6,8M / ₺940B). */
function compactPrice(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    const text = millions >= 10 ? String(Math.round(millions)) : millions.toFixed(1).replace('.', ',')
    return `₺${text}M`
  }
  return `₺${Math.round(value / 1000)}B`
}

const priceFormatter = new Intl.NumberFormat('tr-TR')

/**
 * Bir sekmenin harita pinleri. Fiyat ve ayrıntı, indeksten türetilen sabit bir
 * desenden gelir — üretim verisi bağlandığında bu fonksiyonun yerini API
 * cevabı alır, `HeroPin` sözleşmesi değişmez.
 */
export function buildHeroPins(tab: HeroTabId): HeroPin[] {
  const profile = TAB_PROFILE[tab]
  const pins: HeroPin[] = []
  let running = 0
  for (const city of CITY_SEEDS) {
    for (let index = 0; index < city.weight; index++) {
      const { dLat, dLng } = offset(index)
      const lat = city.lat + dLat
      const lng = city.lng + dLng
      // Fiyat şehir ağırlığıyla ölçeklenir: yoğun şehirler pahalıdır.
      const spread = ((running * 37) % 100) / 100
      const cityFactor = 0.55 + city.weight / 20
      const price = Math.round((profile.base + spread * profile.span) * cityFactor)
      const detail = profile.detail[running % profile.detail.length]
      pins.push({
        id: `${tab}-${city.name}-${index}`,
        lat,
        lng,
        ...schematic(lat, lng),
        price: compactPrice(price),
        title: `${city.district}'ta ${detail} ${profile.noun}`,
        meta: `${city.district}, ${city.name} · ${priceFormatter.format(price)} TL`,
        href: `/arsa-ara?il=${encodeURIComponent(city.name.toLocaleLowerCase('tr-TR'))}`,
      })
      running++
    }
  }
  return pins
}
