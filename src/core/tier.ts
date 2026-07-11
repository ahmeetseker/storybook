export type GlassTier = 'refraction' | 'fallback'

interface NavigatorLike {
  userAgent: string
  userAgentData?: { brands?: { brand: string }[] }
}

// backdrop-filter: url(#f) yalnız Chromium'da çalışır (WebKit bug 245510, Firefox desteklemiyor).
// CSS.supports güvenilmez (parse edip render etmeyen motorlar var) → engine tespiti.
export function detectTier(nav: NavigatorLike = navigator as NavigatorLike): GlassTier {
  const brands = nav.userAgentData?.brands
  if (brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/i.test(b.brand))) return 'refraction'
  const ua = nav.userAgent
  const isChromiumUA = /(Chrome|Chromium|Edg|CriOS)\//.test(ua) && !/Firefox\//.test(ua)
  return isChromiumUA ? 'refraction' : 'fallback'
}

const media = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

export const prefersReducedMotion = () => media('(prefers-reduced-motion: reduce)')
export const prefersReducedTransparency = () => media('(prefers-reduced-transparency: reduce)')
