import type { OdakAlani } from './form-erisilebilirlik'

/**
 * Çok adımlı formların ORTAK adım süzgeci.
 *
 * `kayit-adimlari.ts` (bireysel kayıt) ve `kurumsal-adimlari.ts` (emlak ofisi
 * başvurusu) aynı sözleşmeyi paylaşır: doğrulama TAM hata kümesini döndürür,
 * adım tanımı yalnız "hangi alan hangi adımda" eşlemesini tutar, süzgeç de
 * kullanıcının GÖRDÜĞÜ adımın hatalarını ayıklar. İki akış farklı hata
 * anahtarı kümesi taşıdığı için süzgeç jeneriktir.
 */

/** Adım tanımından süzgecin ihtiyaç duyduğu tek şey: alan listesi. */
export interface AlanTasiyanAdim {
  alanlar: readonly OdakAlani[]
}

/**
 * TAM hata kümesinden yalnız verilen adımda görünen alanların hatalarını
 * süzer. Kullanıcı henüz görmediği bir adımın hatasını duymaz.
 */
export function adimHatalariniSuz<Hatalar extends Record<string, string | undefined>>(
  hatalar: Hatalar,
  adim: AlanTasiyanAdim,
): Hatalar {
  const suzulmus = {} as Hatalar
  for (const alan of adim.alanlar) {
    const mesaj = hatalar[alan.ad]
    if (mesaj) suzulmus[alan.ad as keyof Hatalar] = mesaj as Hatalar[keyof Hatalar]
  }
  return suzulmus
}

/**
 * İlk hatalı alanı barındıran adımın indeksi; hata yoksa `-1`.
 * Son adımdaki tam doğrulama başarısız olursa akış bu adıma taşınır.
 */
export function hataliAdimIndeksiniBul(
  hatalar: Record<string, string | undefined>,
  adimlar: readonly AlanTasiyanAdim[],
): number {
  return adimlar.findIndex((adim) =>
    adim.alanlar.some((alan) => Boolean(hatalar[alan.ad])),
  )
}
