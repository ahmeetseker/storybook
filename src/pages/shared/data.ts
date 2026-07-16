// Arsa ilan platformu demo verileri — tüm sayfa demoları bu tek kaynaktan beslenir.
import { placeholderImage } from '../../demo/placeholderImage'

/** İlan durum makinesi (ChatGPT MVP spec'indeki durumlar) */
export type IlanDurumu =
  | 'taslak'
  | 'eids-bekliyor'
  | 'eids-basarisiz'
  | 'eids-dogrulandi'
  | 'moderasyon-bekliyor'
  | 'degisiklik-istendi'
  | 'reddedildi'
  | 'yayinda'
  | 'suresi-doldu'
  | 'kaldirildi'
  | 'satildi'

export const durumEtiketi: Record<IlanDurumu, string> = {
  taslak: 'Taslak',
  'eids-bekliyor': 'EİDS Bekliyor',
  'eids-basarisiz': 'EİDS Başarısız',
  'eids-dogrulandi': 'EİDS Doğrulandı',
  'moderasyon-bekliyor': 'Moderasyonda',
  'degisiklik-istendi': 'Değişiklik İstendi',
  reddedildi: 'Reddedildi',
  yayinda: 'Yayında',
  'suresi-doldu': 'Süresi Doldu',
  kaldirildi: 'Kaldırıldı',
  satildi: 'Satıldı',
}

/** Durum → semantic tone eşlemesi (renk token'ları) */
export const durumTonu: Record<IlanDurumu, 'neutral' | 'success' | 'warning' | 'danger'> = {
  taslak: 'neutral',
  'eids-bekliyor': 'warning',
  'eids-basarisiz': 'danger',
  'eids-dogrulandi': 'success',
  'moderasyon-bekliyor': 'warning',
  'degisiklik-istendi': 'warning',
  reddedildi: 'danger',
  yayinda: 'success',
  'suresi-doldu': 'neutral',
  kaldirildi: 'neutral',
  satildi: 'neutral',
}

export interface ArsaIlan {
  id: string
  baslik: string
  fiyat: string
  m2: string
  m2Fiyat: string
  konum: string
  imar: string
  tapu: string
  durum: IlanDurumu
  eidsDogrulandi: boolean
  goruntulenme: number
  favori: number
  mesaj: number
  tarih: string
  gorsel: { src: string; alt: string }
}

const g = (label: string, from: string, to: string) => ({
  src: placeholderImage(label, from, to, 480, 360),
  alt: `${label} arsa görseli`,
})

export const ilanlar: ArsaIlan[] = [
  { id: '1084526631', baslik: 'İzmir Urla Denize 900 m — İmarlı Köşe Parsel', fiyat: '4.250.000 TL', m2: '512 m²', m2Fiyat: '8.301 TL/m²', konum: 'İzmir, Urla', imar: 'Konut İmarlı', tapu: 'Müstakil Parsel', durum: 'yayinda', eidsDogrulandi: true, goruntulenme: 1243, favori: 38, mesaj: 12, tarih: '12 Temmuz 2026', gorsel: g('Urla', '#3a6f5f', '#1f4a3a') },
  { id: '1084526632', baslik: 'Ankara Gölbaşı Yatırımlık Tarla — Yol Cepheli', fiyat: '1.850.000 TL', m2: '1.240 m²', m2Fiyat: '1.492 TL/m²', konum: 'Ankara, Gölbaşı', imar: 'Tarla', tapu: 'Hisseli', durum: 'moderasyon-bekliyor', eidsDogrulandi: true, goruntulenme: 0, favori: 0, mesaj: 0, tarih: '14 Temmuz 2026', gorsel: g('Gölbaşı', '#8a6f3a', '#5f4a1f') },
  { id: '1084526633', baslik: 'Bursa Nilüfer Villa İmarlı Arsa — Site İçinde', fiyat: '3.100.000 TL', m2: '420 m²', m2Fiyat: '7.381 TL/m²', konum: 'Bursa, Nilüfer', imar: 'Villa İmarlı', tapu: 'Müstakil Parsel', durum: 'eids-bekliyor', eidsDogrulandi: false, goruntulenme: 0, favori: 0, mesaj: 0, tarih: '15 Temmuz 2026', gorsel: g('Nilüfer', '#3a5f8a', '#1f3a5f') },
  { id: '1084526634', baslik: 'Antalya Kaş Deniz Manzaralı Arsa', fiyat: '6.900.000 TL', m2: '780 m²', m2Fiyat: '8.846 TL/m²', konum: 'Antalya, Kaş', imar: 'Turizm İmarlı', tapu: 'Müstakil Parsel', durum: 'yayinda', eidsDogrulandi: true, goruntulenme: 2811, favori: 94, mesaj: 27, tarih: '8 Temmuz 2026', gorsel: g('Kaş', '#3a7a8a', '#1f4a5f') },
  { id: '1084526635', baslik: 'Tekirdağ Şarköy Bağ Evi İzinli Tarla', fiyat: '980.000 TL', m2: '2.150 m²', m2Fiyat: '456 TL/m²', konum: 'Tekirdağ, Şarköy', imar: 'Tarla (Bağ evi izinli)', tapu: 'Müstakil Parsel', durum: 'suresi-doldu', eidsDogrulandi: true, goruntulenme: 640, favori: 9, mesaj: 3, tarih: '2 Haziran 2026', gorsel: g('Şarköy', '#5f3a8a', '#3a1f5f') },
  { id: '1084526636', baslik: 'Eskişehir Tepebaşı Sanayi İmarlı Parsel', fiyat: '2.400.000 TL', m2: '1.000 m²', m2Fiyat: '2.400 TL/m²', konum: 'Eskişehir, Tepebaşı', imar: 'Sanayi İmarlı', tapu: 'Müstakil Parsel', durum: 'taslak', eidsDogrulandi: false, goruntulenme: 0, favori: 0, mesaj: 0, tarih: '15 Temmuz 2026', gorsel: g('Tepebaşı', '#8a3a3a', '#5f1f1f') },
]

export const konusmalar = [
  { id: 'k1', kisi: 'Ayşe Demir', ilan: ilanlar[0], sonMesaj: 'Tapu fotokopisini paylaşabilir misiniz?', zaman: '14:32', okunmadi: 2 },
  { id: 'k2', kisi: 'Murat Kaya', ilan: ilanlar[3], sonMesaj: 'Pazarlık payı var mı acaba?', zaman: 'Dün', okunmadi: 0 },
  { id: 'k3', kisi: 'Zeynep Arslan', ilan: ilanlar[0], sonMesaj: 'Hafta sonu yerinde görebilir miyiz?', zaman: 'Pzt', okunmadi: 0 },
]

export const bildirimler = [
  { id: 'b1', tur: 'moderasyon', metin: '"Ankara Gölbaşı Yatırımlık Tarla" ilanınız moderasyona alındı.', zaman: '2 saat önce', okunmadi: true },
  { id: 'b2', tur: 'mesaj', metin: 'Ayşe Demir ilanınız hakkında yeni bir mesaj gönderdi.', zaman: '4 saat önce', okunmadi: true },
  { id: 'b3', tur: 'eids', metin: 'EİDS doğrulaması tamamlandı: İzmir Urla parseli doğrulandı.', zaman: 'Dün', okunmadi: false },
  { id: 'b4', tur: 'alarm', metin: '"İzmir imarlı arsa" alarmınıza 3 yeni ilan düştü.', zaman: 'Dün', okunmadi: false },
]

export const kayitliAramalar = [
  { id: 'a1', ad: 'İzmir imarlı arsa', filtre: 'İzmir · ≤ 5.000.000 TL · ≥ 400 m² · Konut imarlı', siklik: 'Günlük', aktif: true, yeni: 3 },
  { id: 'a2', ad: 'Gölbaşı tarla', filtre: 'Ankara, Gölbaşı · Tarla · Yol cepheli', siklik: 'Haftalık', aktif: true, yeni: 0 },
  { id: 'a3', ad: 'Kaş turizm', filtre: 'Antalya, Kaş · Turizm imarlı', siklik: 'Anlık', aktif: false, yeni: 0 },
]

export const sihirbazAdimlari = [
  'İlan ve taşınmaz tipi',
  'İlan verme sıfatı',
  'Taşınmaz numarası ve EİDS',
  'Konum',
  'Ada / parsel',
  'İmar ve tapu',
  'Teknik özellikler ve altyapı',
  'Fiyat',
  'Fotoğraf / video',
  'Açıklama',
  'İletişim tercihleri',
  'Önizleme',
  'Beyan ve gönderim',
]
