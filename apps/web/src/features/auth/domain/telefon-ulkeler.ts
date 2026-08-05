/**
 * Telefon alanının ülke kayıt defteri.
 *
 * Kayıt formu 2026-08-04'e kadar YALNIZ Türkiye mobil hattı kabul ediyordu
 * (`^5\d{9}$`): yurt dışında yaşayan bir kullanıcı kendi numarasını
 * giremiyordu ve hata metni ona neden reddedildiğini de söylemiyordu. Ülke
 * artık ayrı bir seçim; numara o ülkenin kuralına göre doğrulanır.
 *
 * Bu modül SUNUM İÇERMEZ — yalnız veri ve saf fonksiyonlar. Alan
 * bileşeni `components/TelefonAlani.tsx`, doğrulama girişi
 * `kayit-dogrulama.ts`'teki `telefonHatasi`.
 *
 * Kapsam: numara uzunluğu ve (Türkiye'de olduğu gibi) hat türü deseni.
 * Operatör ön ek tabloları BİLİNÇLİ olarak yok — o veri sürekli değişir ve
 * eskidiğinde geçerli numaraları reddeder; asıl doğrulama zaten SMS kodudur.
 */

export interface TelefonUlkesi {
  /** ISO 3166-1 alpha-2. Aynı arama kodunu paylaşan ülkeler için tek kimlik (ör. +1 → US/CA). */
  kod: string
  /** Türkçe ülke adı — seçim listesinde bu görünür. */
  ad: string
  /** Uluslararası arama kodu, `+` ile. */
  aramaKodu: string
  /** Bayrak emojisi. Emoji bayrağı olmayan platformlarda ISO harfleri olarak çizilir — ikisi de okunur. */
  bayrak: string
  /** Ulusal numaranın hane sayısı: `[en az, en çok]`. */
  haneler: readonly [number, number]
  /** Örnek ulusal numara — hem placeholder hem hata metninde geçer. */
  ornek: string
  /**
   * Ulusal numaranın uyması gereken EK desen. Yalnız kuralı uzunluktan
   * ibaret olmayan ülkelerde tanımlıdır (Türkiye: hesap bir mobil hatta
   * bağlanır, sabit hat kabul edilmez).
   */
  desen?: RegExp
  /** `desen` tutmadığında gösterilecek metin — uzunluk mesajının yerine geçer. */
  desenHatasi?: string
  /** Görüntülemede hane grupları (ör. Türkiye 555 111 22 33). Yoksa üçerli gruplanır. */
  gruplar?: readonly number[]
}

const TURKIYE = {
  kod: 'TR',
  ad: 'Türkiye',
  aramaKodu: '+90',
  bayrak: '🇹🇷',
  haneler: [10, 10],
  ornek: '5321234567',
  // Kayıt doğrulaması SMS ile yapıldığı için hat mobil olmak zorunda.
  desen: /^5\d{9}$/,
  desenHatasi: 'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
  gruplar: [3, 3, 2, 2],
} as const satisfies TelefonUlkesi

/**
 * Türkiye dışındaki ülkeler. Liste Türkiye pazarına yakın olan ve
 * diasporanın yoğun bulunduğu ülkelerle sınırlıdır; dünyanın tamamı değil.
 * Yeni ülke eklemek tek satırlık bir iştir — burada durur, başka hiçbir yerde
 * karşılığı yoktur.
 */
const DIGER_ULKELER = [
  { kod: 'DE', ad: 'Almanya', aramaKodu: '+49', bayrak: '🇩🇪', haneler: [10, 11], ornek: '15123456789' },
  { kod: 'US', ad: 'Amerika Birleşik Devletleri', aramaKodu: '+1', bayrak: '🇺🇸', haneler: [10, 10], ornek: '2015550123' },
  { kod: 'AL', ad: 'Arnavutluk', aramaKodu: '+355', bayrak: '🇦🇱', haneler: [8, 9], ornek: '662123456' },
  { kod: 'AU', ad: 'Avustralya', aramaKodu: '+61', bayrak: '🇦🇺', haneler: [9, 9], ornek: '412345678' },
  { kod: 'AT', ad: 'Avusturya', aramaKodu: '+43', bayrak: '🇦🇹', haneler: [9, 12], ornek: '6641234567' },
  { kod: 'AZ', ad: 'Azerbaycan', aramaKodu: '+994', bayrak: '🇦🇿', haneler: [9, 9], ornek: '401234567' },
  { kod: 'AE', ad: 'Birleşik Arap Emirlikleri', aramaKodu: '+971', bayrak: '🇦🇪', haneler: [9, 9], ornek: '501234567' },
  { kod: 'GB', ad: 'Birleşik Krallık', aramaKodu: '+44', bayrak: '🇬🇧', haneler: [10, 10], ornek: '7400123456' },
  { kod: 'BE', ad: 'Belçika', aramaKodu: '+32', bayrak: '🇧🇪', haneler: [8, 9], ornek: '470123456' },
  { kod: 'BA', ad: 'Bosna-Hersek', aramaKodu: '+387', bayrak: '🇧🇦', haneler: [8, 8], ornek: '61123456' },
  { kod: 'BG', ad: 'Bulgaristan', aramaKodu: '+359', bayrak: '🇧🇬', haneler: [8, 9], ornek: '871234567' },
  { kod: 'DZ', ad: 'Cezayir', aramaKodu: '+213', bayrak: '🇩🇿', haneler: [9, 9], ornek: '551234567' },
  { kod: 'CN', ad: 'Çin', aramaKodu: '+86', bayrak: '🇨🇳', haneler: [11, 11], ornek: '13123456789' },
  { kod: 'CZ', ad: 'Çekya', aramaKodu: '+420', bayrak: '🇨🇿', haneler: [9, 9], ornek: '601123456' },
  { kod: 'DK', ad: 'Danimarka', aramaKodu: '+45', bayrak: '🇩🇰', haneler: [8, 8], ornek: '32123456' },
  { kod: 'MA', ad: 'Fas', aramaKodu: '+212', bayrak: '🇲🇦', haneler: [9, 9], ornek: '650123456' },
  { kod: 'FI', ad: 'Finlandiya', aramaKodu: '+358', bayrak: '🇫🇮', haneler: [9, 10], ornek: '412345678' },
  { kod: 'FR', ad: 'Fransa', aramaKodu: '+33', bayrak: '🇫🇷', haneler: [9, 9], ornek: '612345678' },
  { kod: 'GE', ad: 'Gürcistan', aramaKodu: '+995', bayrak: '🇬🇪', haneler: [9, 9], ornek: '555123456' },
  { kod: 'IN', ad: 'Hindistan', aramaKodu: '+91', bayrak: '🇮🇳', haneler: [10, 10], ornek: '9812345678' },
  { kod: 'NL', ad: 'Hollanda', aramaKodu: '+31', bayrak: '🇳🇱', haneler: [9, 9], ornek: '612345678' },
  { kod: 'IQ', ad: 'Irak', aramaKodu: '+964', bayrak: '🇮🇶', haneler: [10, 10], ornek: '7912345678' },
  { kod: 'IR', ad: 'İran', aramaKodu: '+98', bayrak: '🇮🇷', haneler: [10, 10], ornek: '9123456789' },
  { kod: 'IE', ad: 'İrlanda', aramaKodu: '+353', bayrak: '🇮🇪', haneler: [9, 9], ornek: '851234567' },
  { kod: 'ES', ad: 'İspanya', aramaKodu: '+34', bayrak: '🇪🇸', haneler: [9, 9], ornek: '612345678' },
  { kod: 'IL', ad: 'İsrail', aramaKodu: '+972', bayrak: '🇮🇱', haneler: [9, 9], ornek: '501234567' },
  { kod: 'SE', ad: 'İsveç', aramaKodu: '+46', bayrak: '🇸🇪', haneler: [7, 9], ornek: '701234567' },
  { kod: 'CH', ad: 'İsviçre', aramaKodu: '+41', bayrak: '🇨🇭', haneler: [9, 9], ornek: '781234567' },
  { kod: 'IT', ad: 'İtalya', aramaKodu: '+39', bayrak: '🇮🇹', haneler: [9, 10], ornek: '3123456789' },
  { kod: 'JP', ad: 'Japonya', aramaKodu: '+81', bayrak: '🇯🇵', haneler: [10, 10], ornek: '9012345678' },
  { kod: 'CA', ad: 'Kanada', aramaKodu: '+1', bayrak: '🇨🇦', haneler: [10, 10], ornek: '4165550123' },
  { kod: 'ME', ad: 'Karadağ', aramaKodu: '+382', bayrak: '🇲🇪', haneler: [8, 8], ornek: '67123456' },
  { kod: 'QA', ad: 'Katar', aramaKodu: '+974', bayrak: '🇶🇦', haneler: [8, 8], ornek: '33123456' },
  { kod: 'KZ', ad: 'Kazakistan', aramaKodu: '+7', bayrak: '🇰🇿', haneler: [10, 10], ornek: '7011234567' },
  { kod: 'KG', ad: 'Kırgızistan', aramaKodu: '+996', bayrak: '🇰🇬', haneler: [9, 9], ornek: '700123456' },
  { kod: 'XK', ad: 'Kosova', aramaKodu: '+383', bayrak: '🇽🇰', haneler: [8, 9], ornek: '44123456' },
  { kod: 'KW', ad: 'Kuveyt', aramaKodu: '+965', bayrak: '🇰🇼', haneler: [8, 8], ornek: '50012345' },
  { kod: 'MK', ad: 'Kuzey Makedonya', aramaKodu: '+389', bayrak: '🇲🇰', haneler: [8, 8], ornek: '70123456' },
  { kod: 'LB', ad: 'Lübnan', aramaKodu: '+961', bayrak: '🇱🇧', haneler: [7, 8], ornek: '71123456' },
  { kod: 'HU', ad: 'Macaristan', aramaKodu: '+36', bayrak: '🇭🇺', haneler: [9, 9], ornek: '201234567' },
  { kod: 'EG', ad: 'Mısır', aramaKodu: '+20', bayrak: '🇪🇬', haneler: [10, 10], ornek: '1001234567' },
  { kod: 'NO', ad: 'Norveç', aramaKodu: '+47', bayrak: '🇳🇴', haneler: [8, 8], ornek: '40612345' },
  { kod: 'UZ', ad: 'Özbekistan', aramaKodu: '+998', bayrak: '🇺🇿', haneler: [9, 9], ornek: '901234567' },
  { kod: 'PL', ad: 'Polonya', aramaKodu: '+48', bayrak: '🇵🇱', haneler: [9, 9], ornek: '512345678' },
  { kod: 'PT', ad: 'Portekiz', aramaKodu: '+351', bayrak: '🇵🇹', haneler: [9, 9], ornek: '912345678' },
  { kod: 'RO', ad: 'Romanya', aramaKodu: '+40', bayrak: '🇷🇴', haneler: [9, 9], ornek: '712345678' },
  { kod: 'RU', ad: 'Rusya', aramaKodu: '+7', bayrak: '🇷🇺', haneler: [10, 10], ornek: '9123456789' },
  { kod: 'RS', ad: 'Sırbistan', aramaKodu: '+381', bayrak: '🇷🇸', haneler: [8, 9], ornek: '601234567' },
  { kod: 'SG', ad: 'Singapur', aramaKodu: '+65', bayrak: '🇸🇬', haneler: [8, 8], ornek: '81234567' },
  { kod: 'SA', ad: 'Suudi Arabistan', aramaKodu: '+966', bayrak: '🇸🇦', haneler: [9, 9], ornek: '501234567' },
  { kod: 'UA', ad: 'Ukrayna', aramaKodu: '+380', bayrak: '🇺🇦', haneler: [9, 9], ornek: '501234567' },
  { kod: 'JO', ad: 'Ürdün', aramaKodu: '+962', bayrak: '🇯🇴', haneler: [9, 9], ornek: '790123456' },
  { kod: 'GR', ad: 'Yunanistan', aramaKodu: '+30', bayrak: '🇬🇷', haneler: [10, 10], ornek: '6912345678' },
] as const satisfies readonly TelefonUlkesi[]

/** Seçilebilir ülke kodları — `KayitBilgileri.telefonUlke` bu birlikle daralır. */
export type TelefonUlkeKodu = (typeof TURKIYE)['kod'] | (typeof DIGER_ULKELER)[number]['kod']

/** Kayıt formunun açılış seçimi. Ürün Türkiye pazarında; varsayılan ona göre. */
export const VARSAYILAN_TELEFON_ULKESI: TelefonUlkeKodu = 'TR'

/**
 * Seçim listesinin sırası: Türkiye başta (kullanıcıların ezici çoğunluğu),
 * gerisi Türkçe alfabetik. Sıralama ÇALIŞMA ZAMANINDA yapılır ki yeni ülke
 * eklerken doğru yeri aramak gerekmesin — `localeCompare(…, 'tr')` "İ"yi
 * "I"dan, "Ç"yi "C"den doğru ayırır.
 */
export const TELEFON_ULKELERI: readonly TelefonUlkesi[] = [
  TURKIYE,
  ...[...DIGER_ULKELER].sort((a, b) => a.ad.localeCompare(b.ad, 'tr')),
]

const ULKE_HARITASI = new Map<string, TelefonUlkesi>(
  TELEFON_ULKELERI.map((ulke) => [ulke.kod, ulke]),
)

/** Kod tanınmıyorsa Türkiye döner — çağıranların `undefined` dalı yazması gerekmez. */
export function telefonUlkesi(kod: string): TelefonUlkesi {
  return ULKE_HARITASI.get(kod) ?? TURKIYE
}

/**
 * Ham girdiden ULUSAL numarayı çıkarır: rakam dışı her şey atılır, kullanıcı
 * ülke kodunu (`+90`, `0090`) veya şehirlerarası sıfırı da yazdıysa onlar da
 * düşer.
 *
 * Kullanıcı numarasını nasıl yazarsa yazsın kabul edilmesi için var:
 * "0532 123 45 67", "+90 532 123 45 67" ve "5321234567" AYNI numaradır ve
 * üçü de aynı kayıtla sonuçlanmalıdır — biçim uyarısı vermek yerine
 * numaranın kendisine bakılır.
 */
export function telefonuNormallestir(ham: string, ulkeKodu: string): string {
  const ulke = telefonUlkesi(ulkeKodu)
  const aramaKodu = ulke.aramaKodu.slice(1)
  let rakamlar = ham.replace(/\D/g, '')

  // Uluslararası önek: "00" + arama kodu ya da doğrudan arama kodu.
  if (rakamlar.startsWith(`00${aramaKodu}`)) rakamlar = rakamlar.slice(2 + aramaKodu.length)
  else if (
    rakamlar.startsWith(aramaKodu) &&
    // Arama kodunu ATMADAN önce numaranın kalanı makul uzunlukta olmalı:
    // Rusya'nın (+7) "7011234567" numarası kendi arama koduyla başlar ama
    // ülke kodu taşımaz; kesersek geçerli bir numarayı bozardık.
    rakamlar.length - aramaKodu.length >= ulke.haneler[0]
  ) {
    rakamlar = rakamlar.slice(aramaKodu.length)
  }

  // Şehirlerarası sıfır. Tek başına yazılan "0" korunur — kullanıcı numarayı
  // yazmaya yeni başlamıştır, alan onun altından silinmemeli.
  if (rakamlar.length > 1) rakamlar = rakamlar.replace(/^0+/, '')

  return rakamlar
}

/** Numarayı ülkenin hane gruplarına ayırır: `5321234567` → `532 123 45 67`. */
export function telefonuBicimlendir(ham: string, ulkeKodu: string): string {
  const ulke = telefonUlkesi(ulkeKodu)
  const rakamlar = telefonuNormallestir(ham, ulkeKodu)
  if (rakamlar === '') return ''

  const gruplar: string[] = []
  let kalan = rakamlar
  for (const uzunluk of ulke.gruplar ?? []) {
    if (kalan === '') break
    gruplar.push(kalan.slice(0, uzunluk))
    kalan = kalan.slice(uzunluk)
  }
  // Tanımlı grup yoksa (ya da numara onlardan uzunsa) kalan üçerli bölünür.
  while (kalan !== '') {
    gruplar.push(kalan.slice(0, 3))
    kalan = kalan.slice(3)
  }
  return gruplar.join(' ')
}

/**
 * Uluslararası (E.164) gösterim: `+90 532 123 45 67`.
 *
 * Kullanıcıya GÖSTERİLEN biçimdir (özet adımı, hesap sayfası). Boşluksuz
 * makine biçimi gerektiğinde `telefonuNormallestir` + arama kodu yeterli.
 */
export function telefonuUluslararasiGoster(ham: string, ulkeKodu: string): string {
  const bicimli = telefonuBicimlendir(ham, ulkeKodu)
  if (bicimli === '') return ''
  return `${telefonUlkesi(ulkeKodu).aramaKodu} ${bicimli}`
}

/**
 * Ülkenin kuralına göre numara hatası; geçerliyse `undefined`.
 *
 * Özel deseni olan ülke (Türkiye) kendi metnini verir; diğerlerinde mesaj
 * hane sayısını ve örnek numarayı söyler — "geçersiz numara" demek
 * kullanıcıya ne düzelteceğini anlatmaz.
 */
export function ulkeTelefonHatasi(ham: string, ulkeKodu: string): string | undefined {
  const ulke = telefonUlkesi(ulkeKodu)
  const rakamlar = telefonuNormallestir(ham, ulkeKodu)
  const [enAz, enCok] = ulke.haneler

  const uzunluk = enAz === enCok ? `${enAz} haneli` : `${enAz}–${enCok} haneli`
  const genelHata = `${ulke.ad} numarası ${uzunluk} olmalı (örn. ${ulke.aramaKodu} ${telefonuBicimlendir(ulke.ornek, ulke.kod)}).`

  if (ulke.desen) {
    return ulke.desen.test(rakamlar) ? undefined : (ulke.desenHatasi ?? genelHata)
  }
  return rakamlar.length >= enAz && rakamlar.length <= enCok ? undefined : genelHata
}
