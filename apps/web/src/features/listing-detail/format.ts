import type { ListingLifecycle } from './domain/listing-detail-types'

/**
 * Görünüm katmanının biçimlendirme yardımcıları.
 *
 * Zaman dilimi sabittir: aynı kanıt kesiti sunucuda ve tarayıcıda aynı
 * tarihi yazsın diye biçimlendirme yerel saate göre kaymaz.
 */
const trNumber = new Intl.NumberFormat('tr-TR')
const trDate = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Istanbul',
})

export function formatNumber(value: number): string {
  return trNumber.format(value)
}

/** Toplam fiyat — para birimi ilan kaydında TRY sabittir. */
export function formatPrice(amount: number): string {
  return `${trNumber.format(amount)} ₺`
}

export function formatArea(value: number): string {
  return `${trNumber.format(value)} m²`
}

export function formatUnitPrice(value: number): string {
  return `${trNumber.format(value)} ₺/m²`
}

export function formatDate(iso: string): string {
  const parsed = Date.parse(iso)
  return Number.isNaN(parsed) ? 'Bilinmiyor' : trDate.format(parsed)
}

/** İlan durumu metinle taşınır; renk tek başına durum bildirmez. */
export function lifecycleStatus(lifecycle: ListingLifecycle): {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
} {
  switch (lifecycle) {
    case 'active':
      return { label: 'Yayında', tone: 'success' }
    case 'expired':
      return { label: 'Süresi dolmuş ilan', tone: 'warning' }
    case 'sold':
      return { label: 'Satıldı olarak işaretlendi', tone: 'neutral' }
    case 'withdrawn':
      return { label: 'Yayından çekildi', tone: 'neutral' }
    case 'moderated':
      return { label: 'Moderasyon incelemesinde', tone: 'warning' }
  }
}

/**
 * İletişim eylemlerinin kapalı olma gerekçesi. `undefined` dönerse iletişim
 * açıktır — çağıran taraf gerekçeyi görünür bir uyarı olarak yazar, eylemleri
 * sessizce gizlemez.
 */
export function contactClosedReason(lifecycle: ListingLifecycle): string | undefined {
  switch (lifecycle) {
    case 'active':
      return undefined
    case 'expired':
      return 'İlan süresi doldu — iletişim kapalı. Bu görünüm arşiv kaydıdır.'
    case 'sold':
      return 'İlan satıldı olarak işaretlendi — iletişim kapalı.'
    case 'withdrawn':
      return 'İlan yayından çekildi — iletişim kapalı.'
    case 'moderated':
      return 'İlan moderasyon incelemesinde — iletişim geçici olarak kapalı.'
  }
}
