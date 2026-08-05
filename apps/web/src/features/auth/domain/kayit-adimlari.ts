import type { KayitAlanHatalari } from './auth-types'
import type { OdakAlani } from './form-erisilebilirlik'
import { adimHatalariniSuz, hataliAdimIndeksiniBul } from './adim-suzgeci'

/**
 * Kayıt akışının adım tanımları.
 *
 * Doğrulama mantığı burada DEĞİL — tek kaynak `kayitBilgileriniDogrula`.
 * Bu modül yalnız "hangi alan hangi adımda görünür" eşlemesini tutar ve
 * doğrulamanın döndürdüğü tam hata kümesini adım bazında SÜZER. Böylece
 * yeni bir alan/doğrulama kuralı eklendiğinde kural tek yerde yazılır,
 * adım süzgeci onu otomatik olarak doğru adımda gösterir.
 */

export type KayitAdimAnahtari = 'hesapTipi' | 'kimlik' | 'iletisim' | 'onay'

export interface KayitAdimi {
  anahtar: KayitAdimAnahtari
  /** Adım kartının `h2`'si ve "Adım N / M: …" duyurusunda geçen ad. */
  baslik: string
  /** İlerleme şeridindeki kısa etiket — dar kapta tek satırda kalmalı. */
  kisaEtiket: string
  aciklama: string
  /**
   * Adımda görünen alanlar, GÖRSEL sırayla. `ilkHataliAlanaOdaklan` bu
   * sırayı tüketir; `ad` alanı `KayitAlanHatalari` anahtarıdır.
   */
  alanlar: readonly OdakAlani[]
}

export const KAYIT_ADIMLARI: readonly KayitAdimi[] = [
  {
    anahtar: 'hesapTipi',
    baslik: 'Hesap tipi',
    kisaEtiket: 'Hesap tipi',
    aciklama: 'Hesabınızın türü, ilan yayınlama koşullarını belirler.',
    // Doğrulama şu an `hesapTipi` için hata üretmiyor (radyo her zaman dolu),
    // ama alan yine de listelenir: ileride bir kural eklenirse süzgeç onu
    // kendiliğinden bu adımda gösterir.
    alanlar: [{ ad: 'hesapTipi', id: 'kayit-tip-bireysel' }],
  },
  {
    anahtar: 'kimlik',
    baslik: 'Kimlik',
    kisaEtiket: 'Kimlik',
    aciklama: 'Bu bilgiler ilanlarınızda ve mesajlarınızda görünür.',
    alanlar: [
      { ad: 'adSoyad', id: 'kayit-ad' },
      { ad: 'ePosta', id: 'kayit-eposta' },
    ],
  },
  {
    anahtar: 'iletisim',
    baslik: 'İletişim ve güvenlik',
    kisaEtiket: 'İletişim',
    aciklama: 'Telefonunuz alıcılarla iletişim için, parolanız hesabınızı korumak için gerekir.',
    alanlar: [
      { ad: 'telefon', id: 'kayit-telefon' },
      { ad: 'parola', id: 'kayit-parola' },
    ],
  },
  {
    anahtar: 'onay',
    baslik: 'Onay',
    kisaEtiket: 'Onay',
    aciklama: 'Bilgilerinizi son bir kez gözden geçirin ve onayı verin.',
    alanlar: [{ ad: 'kvkkOnayi', id: 'kayit-kvkk' }],
  },
]

/** Tüm adımların alanları, sayfadaki görsel sırayla. */
export const TUM_ALAN_SIRASI: readonly OdakAlani[] = KAYIT_ADIMLARI.flatMap(
  (adim) => adim.alanlar,
)

/**
 * `kayitBilgileriniDogrula`'nın döndürdüğü TAM hata kümesinden yalnız
 * verilen adımda görünen alanların hatalarını süzer. Kullanıcı henüz
 * görmediği bir adımın hatasını duymaz.
 */
export function adimHatalari(
  hatalar: KayitAlanHatalari,
  adim: KayitAdimi,
): KayitAlanHatalari {
  return adimHatalariniSuz(hatalar, adim)
}

/**
 * İlk hatalı alanı barındıran adımın indeksi; hata yoksa `-1`.
 * Son adımdaki tam doğrulama başarısız olursa kullanıcı bu adıma taşınır.
 */
export function hataliAdimIndeksi(hatalar: KayitAlanHatalari): number {
  return hataliAdimIndeksiniBul(hatalar, KAYIT_ADIMLARI)
}

/** İlerleme şeridinin tek bir adım öğesi. */
export interface AdimSeridiOgesi {
  anahtar: string
  baslik: string
  kisaEtiket: string
}

/**
 * Kayıt tamamlandıktan sonra devam eden adımlar. Bunlar `/kayit`'ta
 * GÖSTERİLMEZ (hangi dala gidileceği hesap tipi seçilse bile kayıt
 * sonucuyla kesinleşir); yalnız devam sayfaları kendi şeritlerini bu
 * kuyrukla üretir.
 */
const DEVAM_ADIMLARI = {
  profil: [{ anahtar: 'profil', baslik: 'Profil bilgileri', kisaEtiket: 'Profil' }],
  kurumsal: [
    { anahtar: 'kurumsal', baslik: 'Emlak ofisi bilgileri', kisaEtiket: 'Ofis bilgileri' },
    { anahtar: 'eids', baslik: 'EİDS doğrulaması', kisaEtiket: 'EİDS' },
  ],
} as const satisfies Record<string, readonly AdimSeridiOgesi[]>

export type KayitDali = keyof typeof DEVAM_ADIMLARI

/**
 * Bir dalın tam adım şeridi: dört kayıt adımı + o dalın devam adımları.
 * Dal verilmezse yalnız `/kayit` sayfasının dört adımı döner.
 */
export function kayitSeridi(dal?: KayitDali): readonly AdimSeridiOgesi[] {
  const temel = KAYIT_ADIMLARI.map(({ anahtar, baslik, kisaEtiket }) => ({
    anahtar,
    baslik,
    kisaEtiket,
  }))
  return dal ? [...temel, ...DEVAM_ADIMLARI[dal]] : temel
}
