// Bildirim modeli + örnek kayıtlar — TEK KAYNAK.
//
// İki tüketici var: kabuktaki popover gelen kutusu (masaüstü hızlı bakış) ve
// /hesabim/bildirimler tam sayfası (mobilin ana yüzeyi + "tümünü gör" hedefi).
// Gerçek bildirim akışı bağlanana dek fixture buradan beslenir; bağlanınca
// yalnız bu modül değişir.
import type { ReactNode } from 'react'

export type BildirimIkonu = 'mesaj' | 'randevu' | 'fiyat' | 'ilan' | 'sistem'

/** Gün kovası — tam sayfadaki gruplama başlıkları bundan türer. */
export type BildirimGunu = 'bugun' | 'dun' | 'eski'

export interface Bildirim {
  id: string
  baslik: string
  detay: string
  zaman: string
  gun: BildirimGunu
  okunmadi: boolean
  ikon: BildirimIkonu
}

export const GUN_ETIKETLERI: Record<BildirimGunu, string> = {
  bugun: 'Bugün',
  dun: 'Dün',
  eski: 'Daha eski',
}

export const ORNEK_BILDIRIMLER: Bildirim[] = [
  {
    id: 'mesaj-1',
    baslik: 'Kadıköy Anahtar Ofis mesajınıza yanıt verdi',
    detay: 'Urla arsa süreci hakkında',
    zaman: '10 dk önce',
    gun: 'bugun',
    okunmadi: true,
    ikon: 'mesaj',
  },
  {
    id: 'randevu-1',
    baslik: 'Görüşme randevunuz onaylandı',
    detay: 'Perşembe 14:00 · Egekent Konut Ofisi',
    zaman: '1 saat önce',
    gun: 'bugun',
    okunmadi: true,
    ikon: 'randevu',
  },
  {
    id: 'fiyat-1',
    baslik: 'Takip ettiğiniz arsada fiyat düştü',
    detay: 'Urla denize yakın köşe parsel · −%6',
    zaman: '3 saat önce',
    gun: 'bugun',
    okunmadi: false,
    ikon: 'fiyat',
  },
  {
    id: 'ilan-1',
    baslik: 'İlanınız yayına alındı',
    detay: 'İzmir Urla imarlı köşe parsel',
    zaman: 'Dün',
    gun: 'dun',
    okunmadi: false,
    ikon: 'ilan',
  },
  {
    id: 'sistem-1',
    baslik: 'Planlı bakım bildirimi',
    detay: 'Pazar 03.00–05.00 arasında kısa kesintiler olabilir',
    zaman: '3 gün önce',
    gun: 'eski',
    okunmadi: false,
    ikon: 'sistem',
  },
]

export const BILDIRIM_IKONLARI: Record<BildirimIkonu, ReactNode> = {
  mesaj: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12a8 8 0 1 0-3.1 6.3L20 19l-.9-2.9A8 8 0 0 0 20 12Z" />
    </svg>
  ),
  randevu: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M9.2 14.2l2 2 3.6-4" />
    </svg>
  ),
  fiyat: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4 12 8-8 8 8-8 8-8-8Z" />
      <path d="M12 8.5v7M9.5 13.5 12 16l2.5-2.5" />
    </svg>
  ),
  ilan: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  ),
  sistem: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </svg>
  ),
}

export const BellIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 9.5a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17s-2.5-1-2.5-7" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </svg>
)
