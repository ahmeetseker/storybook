/**
 * Parola gücü ölçümü.
 *
 * GÜÇ ile GEÇERLİLİK farklı şeylerdir ve burada bilinçli olarak ayrılırlar:
 * `parolaHatasi` (bkz. `kayit-dogrulama.ts`) formun kabul eşiğidir — asgari
 * kuralları sağlayan parola gönderilebilir. Bu modül ise "sağlanabilecek en
 * iyi" ölçeğidir ve asgariyi geçen parolayı da zayıf gösterebilir.
 *
 * İkisinin AYRIŞMAMASI için yüklemler burada tanımlanır ve `parolaHatasi`
 * onları içeri alır: kural metni bir yerde, yüklem başka yerde değiştirilip
 * kullanıcıya "kurala uydun ama kabul etmiyorum" dedirtemez.
 */

/** Türkçe büyük harfler dahil — `İ`, `Ğ`, `Ş`, `Ç`, `Ö`, `Ü` de büyük harftir. */
const BUYUK_HARF = /[A-ZÇĞİÖŞÜ]/
const RAKAM = /\d/
/** Harf ve rakam DIŞINDA kalan her şey sembol sayılır (boşluk dahil). */
const SEMBOL = /[^\p{L}\p{N}]/u

/*
 * Asgari kuralların yüklemleri. `kayit-dogrulama.ts` bunları tüketir —
 * oradaki hata metinleri korunur, yalnız karar buraya bağlanır.
 */
export const parolaUzunlukTamam = (parola: string) => parola.length >= 8
export const parolaBuyukHarfTamam = (parola: string) => BUYUK_HARF.test(parola)
export const parolaRakamTamam = (parola: string) => RAKAM.test(parola)

export interface ParolaKurali {
  id: string
  etiket: string
  /**
   * Formun kabul eşiğinde mi, yoksa yalnız güç mü artırıyor.
   *
   * Ayrım kullanıcıya gösterilir: "önerilir" işaretli bir kuralı sağlamayan
   * parola reddedilmez. Bu işaret olmadan liste, karşılanması ZORUNLU beş
   * kural gibi okunur ve kullanıcı gereksiz yere takılır.
   */
  zorunlu: boolean
  saglar: (parola: string) => boolean
}

/**
 * Ölçeğin kademeleri. Sıra ekranda göründüğü sıradır: önce zorunlular,
 * sonra öneriler.
 *
 * Beş kademe `parolaHatasi`'nın üç kuralını KAPSAR — asgariyi sağlayan bir
 * parola 5 üzerinden 3 alır ve "Orta" görünür. Bu kasıtlıdır: kabul edilen
 * her parola "Güçlü" diyen bir ölçek hiçbir şey ölçmüyor demektir.
 */
export const PAROLA_KURALLARI: readonly ParolaKurali[] = [
  { id: 'uzunluk', etiket: 'En az 8 karakter', zorunlu: true, saglar: parolaUzunlukTamam },
  { id: 'buyukHarf', etiket: 'En az bir büyük harf', zorunlu: true, saglar: parolaBuyukHarfTamam },
  { id: 'rakam', etiket: 'En az bir rakam', zorunlu: true, saglar: parolaRakamTamam },
  {
    id: 'uzun',
    etiket: '12 karakter veya daha uzun',
    zorunlu: false,
    saglar: (parola) => parola.length >= 12,
  },
  {
    id: 'sembol',
    etiket: 'Bir sembol (! ? # gibi)',
    zorunlu: false,
    saglar: (parola) => SEMBOL.test(parola),
  },
]

/**
 * Sık denenen parolalar. Liste Türkçe kullanıcıya göre seçildi: küresel
 * sızıntı listelerinin başındaki İngilizce kalıpların yanına Türkçe
 * karşılıkları ve kulüp adları girdi — bunlar Türkiye'de sızan parola
 * listelerinin üst sıralarındadır.
 *
 * Baştan eşleşme aranır (`^`): "parola" ile BAŞLAYAN her şey — `parola123`,
 * `Parola!` — aynı tahmin edilebilir çekirdeği taşır.
 *
 * Bu liste bir güvenlik denetimi DEĞİL, bir uyarıdır. Gerçek sızıntı
 * kontrolü (ör. k-anonimlik ile sızmış parola sorgusu) sunucu işidir ve
 * İP-4 API sözleşmesine bırakılmıştır.
 */
const SIK_KULLANILAN =
  /^(?:parola|sifre|şifre|password|passw0rd|qwerty|asdfgh|asdf|zxcv|admin|deneme|merhaba|iloveyou|welcome|letmein|monkey|dragon|galatasaray|fenerbahce|fenerbahçe|besiktas|beşiktaş|trabzonspor|istanbul|İstanbul|ankara|izmir|arsam|abc123|123456|111111|123123|1234567)/i

/** Aynı karakterin dört ve üzeri tekrarı: `aaaa`, `1111`. */
const TEKRAR = /(.)\1{3,}/
/** Klavye ve sayı dizileri — hem Q hem F düzeninde komşu olan diziler. */
const DIZI =
  /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf|sdfg|dfgh|zxcv|xcvb)/i

export interface OlculenKural extends ParolaKurali {
  saglandi: boolean
}

export interface ParolaGucuDurumu {
  /** 0 (boş) ile `enYuksek` arasında. */
  puan: number
  enYuksek: number
  /** Puanın adı — boş parolada `''`. */
  etiket: string
  kurallar: OlculenKural[]
  /** Sık denenen bir kalıp mı — puanı 1'e çeker. */
  tahminEdilebilir: boolean
  /** Ekran okuyucuya verilecek tam cümle; boş parolada `''`. */
  duyuru: string
}

/**
 * Puan adları. Dizin puanla birebir eşleşir (0 → boş), bu yüzden uzunluk
 * `PAROLA_KURALLARI.length + 1` olmak ZORUNDA — kural eklenirse buraya da
 * bir ad eklenmeli.
 */
export const PUAN_ETIKETLERI: readonly string[] = [
  '',
  'Çok zayıf',
  'Zayıf',
  'Orta',
  'Güçlü',
  'Çok güçlü',
]

export function parolaGucunuOlc(parola: string): ParolaGucuDurumu {
  const kurallar: OlculenKural[] = PAROLA_KURALLARI.map((kural) => ({
    ...kural,
    saglandi: kural.saglar(parola),
  }))
  const saglanan = kurallar.reduce((toplam, kural) => toplam + (kural.saglandi ? 1 : 0), 0)
  const enYuksek = PAROLA_KURALLARI.length

  // Kalıp aramaları BÜYÜK/küçük harf ayrımı yapmaz: `Aaaa` ile `aaaa` aynı
  // ölçüde tahmin edilebilir, tek fark ilk harfin kabuk değiştirmesidir.
  const kucuk = parola.toLowerCase()
  const tahminEdilebilir =
    parola.length > 0 && (SIK_KULLANILAN.test(kucuk) || TEKRAR.test(kucuk) || DIZI.test(kucuk))

  // Tahmin edilebilir kalıp diğer her şeyi EZER: `Parola123!` beş kuralın
  // dördünü sağlar ama sızıntı listesinin ilk sayfasındadır.
  const puan =
    parola.length === 0 ? 0 : tahminEdilebilir ? 1 : Math.min(enYuksek, Math.max(1, saglanan))

  const etiket = PUAN_ETIKETLERI[puan] ?? ''
  const eksikZorunlu = kurallar.filter((kural) => kural.zorunlu && !kural.saglandi)
  const eksikOneri = kurallar.filter((kural) => !kural.zorunlu && !kural.saglandi)

  const duyuru =
    parola.length === 0
      ? ''
      : [
          `Parola gücü: ${etiket.toLocaleLowerCase('tr')}.`,
          tahminEdilebilir ? 'Bu parola sık denenen bir kalıp.' : '',
          eksikZorunlu.length > 0
            ? `Zorunlu, eksik: ${eksikZorunlu.map((kural) => kural.etiket).join(', ')}.`
            : 'Zorunlu kuralların tamamı sağlandı.',
          eksikOneri.length > 0
            ? `Önerilen, eksik: ${eksikOneri.map((kural) => kural.etiket).join(', ')}.`
            : '',
        ]
          .filter(Boolean)
          .join(' ')

  return { puan, enYuksek, etiket, kurallar, tahminEdilebilir, duyuru }
}
