/**
 * Satıcı numarasının istek anındaki kaynağı.
 *
 * Numara ne fixture'da ne ilan normalize şemasında (`ListingSeller`) durur:
 * `loadListingDetail` çıktısı numarayı hiç taşımaz, dolayısıyla sunucudan
 * gelen HTML'de ve prerender çıktısında da bulunmaz. Kullanıcı numarayı
 * istediğinde bu çağrı yapılır ve yalnız o an DOM'a girer.
 *
 * Faz 1'de uç nokta henüz yayında değildir; çağrı görünür bir gerekçeyle
 * başarısız olur ve satıcı bölümü kontrolü tekrar denenebilir bırakır
 * (bkz. `rules.md` — "Telefon numarası").
 */
export const LISTING_PHONE_ENDPOINT = (listingId: string) =>
  `/api/ilan/${encodeURIComponent(listingId)}/telefon`

export async function revealListingPhone(listingId: string): Promise<string> {
  const response = await fetch(LISTING_PHONE_ENDPOINT(listingId), {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`phone-reveal-failed:${response.status}`)
  const payload = (await response.json()) as { phone?: unknown }
  if (typeof payload.phone !== 'string' || payload.phone.length === 0) {
    throw new Error('phone-reveal-empty')
  }
  return payload.phone
}
