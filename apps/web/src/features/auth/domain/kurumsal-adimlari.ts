import type { KurumsalAlanHatalari } from './auth-types'
import type { OdakAlani } from './form-erisilebilirlik'
import { adimHatalariniSuz, hataliAdimIndeksiniBul } from './adim-suzgeci'

/**
 * Emlak ofisi başvurusunun adım tanımları.
 *
 * `kayit-adimlari.ts` ile aynı sözleşme: doğrulama mantığı burada DEĞİL —
 * tek kaynak `kurumsalBasvuruyuDogrula`. Bu modül yalnız "hangi alan hangi
 * aşamada görünür" eşlemesini tutar ve ortak süzgeci (`adim-suzgeci.ts`)
 * kurumsal hata kümesine bağlar.
 *
 * Dört aşamaya bölünmesinin sebebi tek uzun formun yorucu olması değil,
 * alanların FARKLI kaynaklardan geliyor olması: 1. aşama vergi levhası ve
 * ticaret sicilinden, 2. aşama yetki belgesi ve MYK belgesinden, 3. aşama
 * ofisin kendisinden okunur. Kullanıcı her aşamada tek bir belgeye bakar.
 */

export type KurumsalAdimAnahtari = 'isletme' | 'yetki' | 'ofis' | 'paket' | 'onay'

export interface KurumsalAdimi {
  anahtar: KurumsalAdimAnahtari
  /** Adım kartının `h2`'si ve "Adım N / M: …" duyurusunda geçen ad. */
  baslik: string
  /** İlerleme şeridindeki kısa etiket — dar kapta tek satırda kalmalı. */
  kisaEtiket: string
  aciklama: string
  /**
   * Aşamada görünen alanlar, GÖRSEL sırayla. `ilkHataliAlanaOdaklan` bu
   * sırayı tüketir; `ad` alanı `KurumsalAlanHatalari` anahtarıdır.
   */
  alanlar: readonly OdakAlani[]
}

/** Alanın DOM id'si — hem girdi hem hata `<p>`'si bunu paylaşır. */
export function kurumsalAlanId(ad: string): string {
  return `kurumsal-${ad}`
}

const alan = (ad: string): OdakAlani => ({ ad, id: kurumsalAlanId(ad) })

export const KURUMSAL_ADIMLARI: readonly KurumsalAdimi[] = [
  {
    anahtar: 'isletme',
    baslik: 'İşletme kimliği',
    kisaEtiket: 'İşletme',
    aciklama:
      'Vergi levhanız ve ticaret sicil kaydınızdaki bilgiler. İşletme türü, sonraki alanların hangilerinin zorunlu olduğunu belirler.',
    alanlar: [
      // İşletme türü doğrulama hatası üretmez (radyo her zaman dolu), ama
      // listelenir: ileride bir kural eklenirse süzgeç onu kendiliğinden
      // bu aşamada gösterir.
      { ad: 'isletmeTuru', id: 'kurumsal-tur-sahis' },
      alan('ticaretUnvani'),
      alan('vergiNumarasi'),
      alan('vergiDairesi'),
      alan('mersisNo'),
      alan('ticaretSicilNo'),
    ],
  },
  {
    anahtar: 'yetki',
    baslik: 'Yetki ve yeterlilik',
    kisaEtiket: 'Yetki',
    aciklama:
      'Taşınmaz ticareti yetki belgeniz ve sorumlu emlak danışmanınızın MYK Seviye 5 belgesi. Yetki belgesi ancak Seviye 5 belgeli bir sorumlu danışman varsa düzenlenir.',
    alanlar: [
      alan('yetkiBelgesiNo'),
      alan('yetkiBelgesiBitis'),
      alan('sorumluDanismanAdSoyad'),
      alan('sorumluDanismanTckn'),
      alan('mykBelgeNo'),
      alan('mykBelgeBitis'),
    ],
  },
  {
    anahtar: 'ofis',
    baslik: 'Ofis ve iletişim',
    kisaEtiket: 'Ofis',
    aciklama:
      'Yetki belgesi işyeri adresine bağlıdır; adres belgedeki adresle aynı olmalıdır. İletişim bilgileri ilanlarınızda ve alıcı mesajlarında kullanılır.',
    alanlar: [
      alan('il'),
      alan('ilce'),
      alan('acikAdres'),
      alan('postaKodu'),
      alan('ofisTelefonu'),
      alan('kepAdresi'),
      alan('webSitesi'),
      alan('yetkiliAdSoyad'),
      alan('yetkiliEPosta'),
      alan('yetkiliTelefon'),
    ],
  },
  {
    anahtar: 'paket',
    baslik: 'Paket',
    kisaEtiket: 'Paket',
    aciklama:
      'Ofisinizin kadrosuna göre bir paket seçin. Ödeme başvurunuz onaylandıktan sonra alınır; paketi onaya kadar değiştirebilirsiniz.',
    // Paket her zaman doludur (varsayılan seçim vardır) ve doğrulama normalde
    // hata üretmez; alan yine de listelenir ki bilinmeyen bir paket kimliği
    // gelirse (ör. eski bir bağlantı) hatası bu bölümde görünsün.
    alanlar: [alan('paketId'), alan('paketKoltuk')],
  },
  {
    anahtar: 'onay',
    baslik: 'Onay',
    kisaEtiket: 'Onay',
    aciklama: 'Bilgilerinizi son bir kez gözden geçirin ve onayları verin.',
    alanlar: [alan('kvkkOnayi'), alan('temsilBeyani')],
  },
]

/** Tüm aşamaların alanları, sayfadaki görsel sırayla. */
export const KURUMSAL_ALAN_SIRASI: readonly OdakAlani[] = KURUMSAL_ADIMLARI.flatMap(
  (adim) => adim.alanlar,
)

/** Verilen aşamada görünen alanların hatalarını süzer. */
export function kurumsalAdimHatalari(
  hatalar: KurumsalAlanHatalari,
  adim: KurumsalAdimi,
): KurumsalAlanHatalari {
  return adimHatalariniSuz(hatalar, adim)
}

/** İlk hatalı alanı barındıran aşamanın indeksi; hata yoksa `-1`. */
export function kurumsalHataliAdimIndeksi(hatalar: KurumsalAlanHatalari): number {
  return hataliAdimIndeksiniBul(hatalar, KURUMSAL_ADIMLARI)
}
