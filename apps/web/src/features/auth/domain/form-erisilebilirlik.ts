/**
 * Çok alanlı kayıt formlarının (`KayitPage`, `KayitKurumsalPage`) paylaştığı
 * erişilebilirlik yardımcıları: alan hatası `<p>` id'si üretimi ve
 * başarısız gönderimde ilk hatalı alana odak taşıma. İki sayfa da aynı
 * deseni dokuz kez tekrar etmek yerine burayı tüketir.
 */

/** Alan hatası `<p>` id'si — girdi bunu `aria-describedby` ile referanslar. */
export function alanHataId(alanId: string): string {
  return `${alanId}-hata`
}

export interface OdakAlani {
  /** `KayitAlanHatalari`/`KurumsalAlanHatalari` anahtarı. */
  ad: string
  /** Alanın DOM `id`'si. */
  id: string
}

/**
 * Başarısız gönderimde ilk hatalı alana odaklanır.
 *
 * `alanlar` sayfadaki GÖRSEL sırayı yansıtır — doğrulama fonksiyonunun iç
 * kontrol sırasını değil. Ekran okuyucu kullanıcısı forma yukarıdan aşağı
 * ilerlediği için duyulması gereken ilk hata, görsel olarak ilk hatalı
 * alandır.
 */
export function ilkHataliAlanaOdaklan(
  alanlar: readonly OdakAlani[],
  hatalar: Readonly<Record<string, string | undefined>>,
): void {
  const ilkHatali = alanlar.find((alan) => hatalar[alan.ad])
  if (!ilkHatali) return
  if (typeof document === 'undefined') return
  const eleman = document.getElementById(ilkHatali.id)
  if (eleman instanceof HTMLElement) eleman.focus()
}
