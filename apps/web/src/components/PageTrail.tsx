import { createContext, useContext } from 'react'

/** Kırıntı yolunun tek düğümü — kabuk üretir, `PageContainer` çizer. */
export interface PageTrailItem {
  label: string
  /** Gerçek URL (base önekli) — orta tık/yeni sekme çalışsın diye. */
  href?: string
  /** SPA gezinmesi — sade sol tıkta router'a devreder. */
  onClick?: () => void
}

/**
 * Sayfa kırıntı yolu (breadcrumb) kanalı.
 *
 * `MarketplaceShell` mevcut rotanın `statusTrail`'inden yolu üretip buraya
 * koyar; `PageContainer` `<main>` başında çizer. Kabuğun dışında (test,
 * Storybook, AuthShell) değer boş kalır ve hiçbir şey çizilmez — sayfalar
 * breadcrumb'ı tek tek hatırlamak zorunda değildir, kabuk hatırlar.
 */
export const PageTrailContext = createContext<readonly PageTrailItem[]>([])

export function usePageTrail(): readonly PageTrailItem[] {
  return useContext(PageTrailContext)
}
