import type {
  KayitAlanHatalari,
  KayitBilgileri,
  KurumsalAlanHatalari,
  KurumsalBasvuruBilgileri,
} from './auth-types'

const ePostaGecerli = (ham: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ham.trim())
const telefonGecerli = (ham: string) => /^5\d{9}$/.test(ham.replace(/\s/g, ''))
const dolu = (ham: string) => ham.trim().length > 0

/**
 * Kayıt formunun alan doğrulaması.
 *
 * Sunucu doğrulamasının yerine geçmez; kullanıcıya anında geri bildirim
 * vermek içindir. Gerçek doğrulama backend geldiğinde adapter'ın
 * döndürdüğü hata kodlarıyla yapılır.
 */
export function kayitBilgileriniDogrula(bilgiler: KayitBilgileri): KayitAlanHatalari {
  const hatalar: KayitAlanHatalari = {}

  if (!dolu(bilgiler.adSoyad)) hatalar.adSoyad = 'Ad ve soyadınızı girin.'
  if (!ePostaGecerli(bilgiler.ePosta)) hatalar.ePosta = 'Geçerli bir e-posta adresi girin.'
  if (!telefonGecerli(bilgiler.telefon)) {
    hatalar.telefon = 'Telefon numarasını 5XX XXX XX XX biçiminde girin.'
  }

  const parola = bilgiler.parola
  if (parola.length < 8) {
    hatalar.parola = 'Parola en az 8 karakter olmalı.'
  } else if (!/[A-ZÇĞİÖŞÜ]/.test(parola) || !/\d/.test(parola)) {
    hatalar.parola = 'Parola en az bir büyük harf ve bir rakam içermeli.'
  }

  if (!bilgiler.kvkkOnayi) {
    hatalar.kvkkOnayi = 'Devam etmek için aydınlatma metnini onaylayın.'
  }

  return hatalar
}

/** Emlak ofisi başvurusunun alan doğrulaması. */
export function kurumsalBasvuruyuDogrula(
  bilgiler: KurumsalBasvuruBilgileri,
): KurumsalAlanHatalari {
  const hatalar: KurumsalAlanHatalari = {}

  if (!dolu(bilgiler.ticaretUnvani)) hatalar.ticaretUnvani = 'Ticaret ünvanını girin.'
  if (!/^\d{10}$/.test(bilgiler.vergiNumarasi.trim())) {
    hatalar.vergiNumarasi = 'Vergi numarası 10 haneli olmalı.'
  }
  if (!dolu(bilgiler.vergiDairesi)) hatalar.vergiDairesi = 'Vergi dairesini girin.'
  if (!dolu(bilgiler.il)) hatalar.il = 'İl seçin.'
  if (!dolu(bilgiler.ilce)) hatalar.ilce = 'İlçe girin.'
  if (!dolu(bilgiler.yetkiBelgesiNo)) {
    hatalar.yetkiBelgesiNo = 'Taşınmaz ticareti yetki belgesi numarasını girin.'
  }
  if (!dolu(bilgiler.yetkiliAdSoyad)) hatalar.yetkiliAdSoyad = 'Yetkilinin adını soyadını girin.'
  if (!ePostaGecerli(bilgiler.yetkiliEPosta)) {
    hatalar.yetkiliEPosta = 'Geçerli bir e-posta adresi girin.'
  }
  if (!telefonGecerli(bilgiler.yetkiliTelefon)) {
    hatalar.yetkiliTelefon = 'Telefon numarasını 5XX XXX XX XX biçiminde girin.'
  }

  return hatalar
}
