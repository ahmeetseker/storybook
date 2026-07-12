export type GlassTier = 'refraction' | 'fallback'

interface NavigatorLike {
  userAgent: string
  userAgentData?: { brands?: { brand: string }[] }
}

// backdrop-filter: url(#f) yalnız Chromium'da çalışır (WebKit bug 245510, Firefox desteklemiyor).
// CSS.supports güvenilmez (parse edip render etmeyen motorlar var) → engine tespiti.
export function detectTier(nav: NavigatorLike = navigator as NavigatorLike): GlassTier {
  // iOS'ta tüm tarayıcılar (Chrome dahil) WebKit motorunu kullanmak zorunda (App Store kuralı),
  // bu yüzden CriOS/Chrome UA'sı taşısa da backdrop-filter: url() render edemez.
  if (/iPhone|iPad|iPod/.test(nav.userAgent)) return 'fallback'
  const brands = nav.userAgentData?.brands
  if (brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/i.test(b.brand))) return 'refraction'
  const ua = nav.userAgent
  const isChromiumUA = /(Chrome|Chromium|Edg)\//.test(ua) && !/Firefox\//.test(ua)
  return isChromiumUA ? 'refraction' : 'fallback'
}

const media = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

export const prefersReducedMotion = () => media('(prefers-reduced-motion: reduce)')
export const prefersReducedTransparency = () => media('(prefers-reduced-transparency: reduce)')

// Apple kuralı: lensing (kenar kırılması) kontroller içindir; büyük paneller düz malzeme (blur) kalır.
// Ayrıca pratik zorunluluk: tam boy SVG displacement filtresi büyük yüzeylerde Chrome'da kare düşürür.
export const REFRACTION_MAX_AREA = 160_000 // px² (~400×400)

export const exceedsRefractionArea = (width: number, height: number) => width * height > REFRACTION_MAX_AREA
