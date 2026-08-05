import type {
  IsletmeTuru,
  KayitAlanHatalari,
  KayitBilgileri,
  KurumsalAlanHatalari,
  KurumsalBasvuruBilgileri,
} from './auth-types'
import { ilGecerliMi } from './iller'
import { parolaBuyukHarfTamam, parolaRakamTamam, parolaUzunlukTamam } from './parola-gucu'
import { VARSAYILAN_TELEFON_ULKESI, ulkeTelefonHatasi } from './telefon-ulkeler'

const ePostaGecerli = (ham: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ham.trim())
const dolu = (ham: string) => ham.trim().length > 0

/*
 * Tek alanlık doğrulayıcılar. Kayıt formu bunları birleştirir; giriş ve
 * parola sıfırlama sayfaları tek tek tüketir.
 *
 * Kural metinleri TEK yerde durmalı: parola kuralı hem kayıtta hem parola
 * sıfırlamada geçerlidir ve ikisi ayrışırsa kullanıcı bir formda kabul edilen
 * parolayı diğerinde reddedilmiş bulur.
 */

export function ePostaHatasi(ham: string): string | undefined {
  return ePostaGecerli(ham) ? undefined : 'Geçerli bir e-posta adresi girin.'
}

/**
 * Telefon hatası — kural SEÇİLEN ÜLKEYE bağlıdır (`telefon-ulkeler.ts`).
 *
 * Varsayılan Türkiye'dir: ülke seçimi taşımayan çağıranlar (giriş sayfası,
 * ofis/yetkili telefonları) eskisi gibi Türkiye mobil hattını doğrular.
 */
export function telefonHatasi(ham: string, ulkeKodu: string = VARSAYILAN_TELEFON_ULKESI): string | undefined {
  return ulkeTelefonHatasi(ham, ulkeKodu)
}

/**
 * Formun kabul eşiği. Yüklemler `parola-gucu.ts`'ten gelir — güç göstergesi
 * "zorunlu" diye işaretlediği kuralı burası da reddetmek zorundadır, aksi
 * halde kullanıcı yeşil tikli bir parolayla hata mesajı alır.
 */
export function parolaHatasi(parola: string): string | undefined {
  if (!parolaUzunlukTamam(parola)) return 'Parola en az 8 karakter olmalı.'
  if (!parolaBuyukHarfTamam(parola) || !parolaRakamTamam(parola)) {
    return 'Parola en az bir büyük harf ve bir rakam içermeli.'
  }
  return undefined
}

/** Altı haneli tek kullanımlık kod. */
export function kodHatasi(kod: string): string | undefined {
  return /^\d{6}$/.test(kod.trim()) ? undefined : 'Kodu altı hane olarak girin.'
}

/**
 * Vergi kimlik numarası (10 hane) VEYA T.C. kimlik numarası (11 hane).
 *
 * Yalnız 10 haneyi kabul eden eski kural şahıs işletmelerini başvuru dışında
 * bırakıyordu: emlak ofislerinin büyük bölümü şahıs işletmesidir ve vergi
 * levhalarında vergi kimlik numarası yerine TCKN taşırlar. Hangi uzunluğun
 * beklendiği işletme türüne bağlı olduğundan, tür bilgisi olmadan ikisi de
 * kabul edilir; türe göre daraltma çağıran tarafın işidir.
 */
export function vergiKimlikHatasi(ham: string): string | undefined {
  const temiz = ham.replace(/\s/g, '')
  if (/^\d{10}$/.test(temiz) || /^\d{11}$/.test(temiz)) return undefined
  return 'Vergi kimlik numarasını 10 hane, şahıs işletmesinde T.C. kimlik numarasını 11 hane girin.'
}

/** Tüzel kişi mi — şahıs işletmesi dışındaki her tür. */
export function tuzelKisiMi(tur: IsletmeTuru): boolean {
  return tur !== 'sahis'
}

/** 11 haneli T.C. kimlik numarası uzunluk kontrolü. */
function tcknHatasi(ham: string, alanAdi: string): string | undefined {
  return /^\d{11}$/.test(ham.replace(/\s/g, ''))
    ? undefined
    : `${alanAdi} 11 haneli olmalı.`
}

/**
 * `<input type="date">` değerini (yyyy-aa-gg) sınar: dolu, biçimli ve
 * GELECEKTE olmalı.
 *
 * Karşılaştırma ISO metin üzerinden yapılır — `Date` nesnesine çevirmek
 * yerel saat dilimiyle bir gün kayması üretebiliyordu. Bugünün tarihi de
 * reddedilir: o gün biten bir belge ertesi güne geçerli değildir.
 */
function gelecekTarihHatasi(ham: string, alanAdi: string): string | undefined {
  const deger = ham.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deger)) return `${alanAdi} tarihini gg.aa.yyyy olarak girin.`
  const bugun = new Date().toISOString().slice(0, 10)
  return deger > bugun ? undefined : `${alanAdi} tarihi bugünden ileri olmalı.`
}

/**
 * Ofis hattı: sabit (2/3/4 ile başlayan) veya mobil (5) — başında sıfır
 * olmadan 10 hane. `telefonHatasi` yalnız mobil kabul ettiği için ayrı
 * kuraldır; ofisin sabit hattı onunla reddediliyordu.
 */
function ofisTelefonuHatasi(ham: string): string | undefined {
  return /^[2-5]\d{9}$/.test(ham.replace(/\s/g, ''))
    ? undefined
    : 'Ofis telefonunu başında sıfır olmadan 10 hane girin (örn. 2321234567).'
}

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

  const ePosta = ePostaHatasi(bilgiler.ePosta)
  if (ePosta) hatalar.ePosta = ePosta

  const telefon = telefonHatasi(bilgiler.telefon, bilgiler.telefonUlke)
  if (telefon) hatalar.telefon = telefon

  const parola = parolaHatasi(bilgiler.parola)
  if (parola) hatalar.parola = parola

  if (!bilgiler.kvkkOnayi) {
    hatalar.kvkkOnayi = 'Devam etmek için aydınlatma metnini onaylayın.'
  }

  return hatalar
}

/**
 * Emlak ofisi başvurusunun alan doğrulaması.
 *
 * TAM kümeyi döndürür — hangi hatanın hangi adımda gösterileceği
 * `kurumsal-adimlari.ts`'in süzgecinin işidir. Zorunluluk bir alanda
 * işletme türüne bağlıdır (`tuzelKisiMi`): şahıs işletmesinin MERSİS/
 * ticaret sicil kaydı ve KEP adresi olmayabilir.
 */
export function kurumsalBasvuruyuDogrula(
  bilgiler: KurumsalBasvuruBilgileri,
): KurumsalAlanHatalari {
  const hatalar: KurumsalAlanHatalari = {}
  const tuzel = tuzelKisiMi(bilgiler.isletmeTuru)

  // — Aşama 1: işletme kimliği —
  if (!dolu(bilgiler.ticaretUnvani)) hatalar.ticaretUnvani = 'Ticaret ünvanını girin.'

  const vergiTemiz = bilgiler.vergiNumarasi.replace(/\s/g, '')
  if (tuzel) {
    // Tüzel kişinin vergi kimlik numarası her zaman 10 hanedir; 11 hane
    // kabul etmek şahıs işletmesi TCKN'sinin şirket kaydına sızmasına
    // izin verirdi.
    if (!/^\d{10}$/.test(vergiTemiz)) {
      hatalar.vergiNumarasi = 'Vergi kimlik numarası 10 haneli olmalı.'
    }
  } else {
    const vergiKimlik = vergiKimlikHatasi(bilgiler.vergiNumarasi)
    if (vergiKimlik) hatalar.vergiNumarasi = vergiKimlik
  }

  if (!dolu(bilgiler.vergiDairesi)) hatalar.vergiDairesi = 'Vergi dairesini girin.'

  const mersisTemiz = bilgiler.mersisNo.replace(/\s/g, '')
  if (tuzel || mersisTemiz.length > 0) {
    if (!/^\d{16}$/.test(mersisTemiz)) hatalar.mersisNo = 'MERSİS numarası 16 haneli olmalı.'
  }

  if (tuzel && !dolu(bilgiler.ticaretSicilNo)) {
    hatalar.ticaretSicilNo = 'Ticaret sicil numarasını girin.'
  }

  // — Aşama 2: yetki ve yeterlilik —
  if (!dolu(bilgiler.yetkiBelgesiNo)) {
    hatalar.yetkiBelgesiNo = 'Taşınmaz ticareti yetki belgesi numarasını girin.'
  }

  const yetkiBitis = gelecekTarihHatasi(bilgiler.yetkiBelgesiBitis, 'Yetki belgesi geçerlilik')
  if (yetkiBitis) hatalar.yetkiBelgesiBitis = yetkiBitis

  if (!dolu(bilgiler.sorumluDanismanAdSoyad)) {
    hatalar.sorumluDanismanAdSoyad = 'Sorumlu emlak danışmanının adını soyadını girin.'
  }

  const danismanTckn = tcknHatasi(bilgiler.sorumluDanismanTckn, 'Sorumlu danışman T.C. kimlik no')
  if (danismanTckn) hatalar.sorumluDanismanTckn = danismanTckn

  if (!dolu(bilgiler.mykBelgeNo)) {
    hatalar.mykBelgeNo = 'MYK Seviye 5 mesleki yeterlilik belge numarasını girin.'
  }

  const mykBitis = gelecekTarihHatasi(bilgiler.mykBelgeBitis, 'MYK belgesi geçerlilik')
  if (mykBitis) hatalar.mykBelgeBitis = mykBitis

  // — Aşama 3: ofis ve iletişim —
  if (!ilGecerliMi(bilgiler.il)) hatalar.il = 'Listeden bir il seçin.'
  if (!dolu(bilgiler.ilce)) hatalar.ilce = 'İlçe girin.'
  if (!dolu(bilgiler.acikAdres)) hatalar.acikAdres = 'Ofisin açık adresini girin.'
  if (!/^\d{5}$/.test(bilgiler.postaKodu.trim())) {
    hatalar.postaKodu = 'Posta kodu 5 haneli olmalı.'
  }

  const ofisTelefonu = ofisTelefonuHatasi(bilgiler.ofisTelefonu)
  if (ofisTelefonu) hatalar.ofisTelefonu = ofisTelefonu

  if (tuzel || dolu(bilgiler.kepAdresi)) {
    const kep = ePostaHatasi(bilgiler.kepAdresi)
    if (kep) hatalar.kepAdresi = 'Geçerli bir KEP adresi girin.'
  }

  if (dolu(bilgiler.webSitesi) && !/^https?:\/\/\S+\.\S+/.test(bilgiler.webSitesi.trim())) {
    hatalar.webSitesi = 'Web sitesini https:// ile başlayacak şekilde girin.'
  }

  if (!dolu(bilgiler.yetkiliAdSoyad)) hatalar.yetkiliAdSoyad = 'Yetkilinin adını soyadını girin.'

  const yetkiliEPosta = ePostaHatasi(bilgiler.yetkiliEPosta)
  if (yetkiliEPosta) hatalar.yetkiliEPosta = yetkiliEPosta

  const yetkiliTelefon = telefonHatasi(bilgiler.yetkiliTelefon)
  if (yetkiliTelefon) hatalar.yetkiliTelefon = yetkiliTelefon

  // — Aşama 4: onaylar. `iysOnayi` bilinçli olarak DOĞRULANMAZ: ticari
  // elektronik ileti izni açık rıza gerektirir, hizmetin koşulu yapılamaz.
  if (!bilgiler.kvkkOnayi) {
    hatalar.kvkkOnayi = 'Başvuruyu göndermek için aydınlatma metnini onaylayın.'
  }
  if (!bilgiler.temsilBeyani) {
    hatalar.temsilBeyani = 'İşletmeyi temsile yetkili olduğunuzu beyan edin.'
  }

  return hatalar
}
