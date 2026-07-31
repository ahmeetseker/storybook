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

export type AuthSonuc<T> =
  | { durum: 'basarili'; veri: T }
  | { durum: 'hata'; kod: AuthHataKodu; mesaj: string }
