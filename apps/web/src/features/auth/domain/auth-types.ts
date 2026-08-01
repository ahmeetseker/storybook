/** Kullanıcının kimliğini kanıtlamak için seçtiği yol. */
export type GirisYontemi = 'telefon' | 'parola' | 'baglanti' | 'google'

/** Hesabın bireysel mi emlak ofisi mi olduğu — kayıt akışında belirlenir. */
export type HesapTipi = 'bireysel' | 'kurumsal'

/** EİDS (Emlak İlan Doğrulama Sistemi) durumu. */
export type EidsDurumu = 'yok' | 'beklemede' | 'dogrulandi'

export interface Oturum {
  kullaniciId: string
  adSoyad: string
  telefon: string
  ePosta: string
  hesapTipi: HesapTipi
  eidsDurumu: EidsDurumu
}

export type AuthHataKodu =
  | 'gecersiz-kimlik'
  | 'gecersiz-kod'
  | 'kod-suresi-doldu'
  | 'hesap-askida'
  | 'ag-hatasi'
  | 'hesap-zaten-var'
  | 'eksik-alan'
  | 'eids-reddedildi'

export type AuthSonuc<T> =
  | { durum: 'basarili'; veri: T }
  | { durum: 'hata'; kod: AuthHataKodu; mesaj: string }

/** Kayıt formunun topladığı bilgiler. */
export interface KayitBilgileri {
  adSoyad: string
  ePosta: string
  telefon: string
  parola: string
  hesapTipi: HesapTipi
  /** KVKK aydınlatma metni ve kullanım koşulları onayı — zorunlu. */
  kvkkOnayi: boolean
}

/** Emlak ofisi başvurusunun topladığı bilgiler. */
export interface KurumsalBasvuruBilgileri {
  ticaretUnvani: string
  vergiNumarasi: string
  vergiDairesi: string
  il: string
  ilce: string
  /** Taşınmaz ticareti yetki belgesi numarası. */
  yetkiBelgesiNo: string
  yetkiliAdSoyad: string
  yetkiliEPosta: string
  yetkiliTelefon: string
}

export type KayitAlanHatalari = Partial<Record<keyof KayitBilgileri, string>>
export type KurumsalAlanHatalari = Partial<Record<keyof KurumsalBasvuruBilgileri, string>>
