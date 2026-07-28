/**
 * Satıcı bloklarının paylaşılan görünür metinleri.
 *
 * Aynı satıcı hakkında sayfanın iki yerinde (karar rayındaki özet ve satıcı
 * bölümü) konuşulur. Metin tek kaynaktan gelmezse iki yüzey aynı satıcı için
 * çelişebilir — nitekim öyle olmuştu: ray, TTBS kapsamı dışındaki bireysel
 * satıcılar için "doğrulanamadı" diyerek hiç yapılmamış bir kontrolün
 * sonucunu uyduruyordu.
 */

/** TTBS'in kapsamı: faaliyet yetkisi, ilan içeriğinin doğruluğu değil. */
export const TTBS_SCOPE_NOTE =
  'TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.'

/**
 * Bireysel satıcı için kapsam bildirimi.
 *
 * Bir **kontrol sonucu değildir**: TTBS yetki belgesi bireysel ilan
 * sahiplerine hiç uygulanmaz, dolayısıyla "doğrulandı" da "doğrulanamadı" da
 * yanlış olur. Sayfanın her iki yüzeyi de bu cümleyi kullanır.
 */
export const INDIVIDUAL_TTBS_SCOPE_NOTE =
  'Bireysel ilan sahipleri TTBS yetki belgesi kapsamında değildir.'

/**
 * Emlak ofisi ilanında yetki belgesi değeri bulunamadığında.
 *
 * Yalnız `seller.type === 'agency'` için geçerlidir: orada gerçekten
 * uygulanabilir bir kontrol vardır ve sonucu çözülememiştir.
 */
export const AGENCY_LICENCE_UNVERIFIED = 'Yetki belgesi doğrulanamadı.'
