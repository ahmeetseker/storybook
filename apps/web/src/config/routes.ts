export type RouteScope = 'public' | 'account' | 'seller'

export interface AppRouteDefinition {
  key:
    | 'home'
    | 'search'
    | 'offices'
    | 'regions'
    | 'blog'
    | 'ai-advisor'
    | 'compare'
    | 'favorites'
    | 'create-listing'
    | 'account'
    | 'messages'
    | 'listing-detail'
  label: string
  href: string
  description: string
  statusTrail: readonly string[]
  scope: RouteScope
  indexable: boolean
  icon:
    | 'home'
    | 'search'
    | 'building'
    | 'pin'
    | 'book'
    | 'sparkles'
    | 'compare'
    | 'heart'
    | 'plus'
    | 'user'
    | 'message'
  group?: 'Şirket' | 'Hesap'
}

export const appRoutes = [
  {
    key: 'home',
    label: 'Anasayfa',
    href: '/',
    description: 'Arsa keşfi, güven verileri ve satıcı araçlarının ortak başlangıç noktası.',
    statusTrail: ['Anasayfa'],
    scope: 'public',
    indexable: true,
    icon: 'home',
  },
  {
    key: 'search',
    label: 'Emlak ara',
    href: '/emlak',
    description:
      'Konut, arsa, iş yeri ve yatırım ilanlarını gelişmiş filtreler, doğal dil ve harita desteğiyle keşfedin.',
    statusTrail: ['Anasayfa', 'Emlak ara'],
    scope: 'public',
    indexable: true,
    icon: 'search',
  },
  {
    key: 'offices',
    label: 'Emlak ofisleri',
    href: '/ofisler',
    description: 'AI destekli eşleşme, kanıtlar ve kullanıcı onaylı iletişim akışıyla emlak ofislerini karşılaştırın.',
    statusTrail: ['Anasayfa', 'Emlak ofisleri'],
    scope: 'public',
    indexable: false,
    icon: 'building',
    group: 'Şirket',
  },
  {
    key: 'regions',
    label: 'Bölgeler',
    href: '/bolgeler',
    description: 'İl, ilçe ve mahalle bazlı arsa rehberleri için SEO odaklı bölge merkezi.',
    statusTrail: ['Anasayfa', 'Bölgeler'],
    scope: 'public',
    indexable: false,
    icon: 'pin',
    group: 'Şirket',
  },
  {
    key: 'blog',
    label: 'Blog',
    href: '/blog',
    description: 'Arsa alım, satış ve mevzuat içeriklerinin yayın merkezi.',
    statusTrail: ['Anasayfa', 'Blog'],
    scope: 'public',
    indexable: false,
    icon: 'book',
  },
  {
    key: 'ai-advisor',
    label: 'AI danışman',
    href: '/ai-danisman',
    description: 'İhtiyacı netleştiren konuşma, öneri listesi ve kanıt paneli burada birleşecek.',
    statusTrail: ['Anasayfa', 'AI danışman'],
    scope: 'public',
    indexable: false,
    icon: 'sparkles',
  },
  {
    key: 'compare',
    label: 'Karşılaştırmalar',
    href: '/karsilastir',
    description: 'Fiyat, imar, tapu, konum ve güven verileri yan yana karşılaştırılacak.',
    statusTrail: ['Anasayfa', 'Karşılaştırmalar'],
    scope: 'public',
    indexable: false,
    icon: 'compare',
  },
  {
    key: 'favorites',
    label: 'Favoriler',
    href: '/favoriler',
    description: 'Kaydedilen ilanlar ve aramalar tek çalışma alanında yönetilecek.',
    statusTrail: ['Anasayfa', 'Favoriler'],
    scope: 'account',
    indexable: false,
    icon: 'heart',
  },
  {
    key: 'create-listing',
    label: 'İlan ver',
    href: '/ilan-ver',
    description: 'Satıcı için AI destekli ilan oluşturma ve doğrulama akışı burada başlayacak.',
    statusTrail: ['Anasayfa', 'İlan ver'],
    scope: 'seller',
    indexable: false,
    icon: 'plus',
  },
  {
    key: 'account',
    label: 'Hesabım',
    href: '/hesabim',
    description: 'Alıcı ve satıcı hesap ayarları ile işlem özetleri bu alanda yönetilecek.',
    statusTrail: ['Anasayfa', 'Hesabım'],
    scope: 'account',
    indexable: false,
    icon: 'user',
    group: 'Hesap',
  },
  {
    key: 'messages',
    label: 'Mesajlar',
    href: '/hesabim/mesajlar',
    description: 'İlan iletişimleri ve randevu konuşmaları güvenli mesaj merkezinde toplanacak.',
    statusTrail: ['Anasayfa', 'Hesabım', 'Mesajlar'],
    scope: 'account',
    indexable: false,
    icon: 'message',
    group: 'Hesap',
  },
] as const satisfies readonly AppRouteDefinition[]

/**
 * Gezinme listelerinde **yer almayan** rotalar.
 *
 * `appRoutes` bir navigasyon kaydıdır: header, dock ve `AppRouteKey` oradan
 * türetilir. Dinamik bir detay rotası oraya konulsaydı gezinme öğesi gibi
 * görünürdü; buraya konmazsa da `getRouteByPath` eşleşme bulamayıp `home`'a
 * düşer ve kabuk yanlış sekmeyi aktif işaretlerdi. Bu liste ikisinin arasıdır:
 * yalnız yol → rota çözümlemesi için tanımlıdır.
 */
export const nonNavRoutes = [
  {
    key: 'listing-detail',
    label: 'İlan detayı',
    // Önek eşleşmesi için: gerçek yol `/ilan/$listingId`.
    href: '/ilan',
    description:
      'Bir ilanın kaynaklı kanıt defteri: her değer kaynağı, tarihi ve kapsamıyla birlikte.',
    // Boş: sayfa kendi kategori yolunu (`GlassBreadcrumb`) taşır, kabuk
    // bunun üstüne ikinci bir durum izi basmaz.
    statusTrail: [],
    scope: 'public',
    indexable: true,
    icon: 'pin',
  },
] as const satisfies readonly AppRouteDefinition[]

export type AppRoute = (typeof appRoutes)[number]
export type AppRouteKey = AppRoute['key']
export type AppRouteHref = AppRoute['href']

export const headerRouteKeys = ['search', 'offices', 'regions', 'blog'] as const

export const dockRouteKeys = {
  desktop: [
    'home',
    'search',
    'offices',
    'regions',
    'compare',
    'favorites',
    'ai-advisor',
    'create-listing',
    'account',
    'messages',
  ],
  tablet: [
    'home',
    'search',
    'compare',
    'favorites',
    'ai-advisor',
    'create-listing',
    'account',
    'messages',
  ],
  mobile: ['home', 'search', 'ai-advisor', 'compare', 'account'],
} as const satisfies Record<'desktop' | 'tablet' | 'mobile', readonly AppRouteKey[]>

export function getRouteByKey(key: AppRouteKey): AppRouteDefinition {
  const route = appRoutes.find((item) => item.key === key)
  if (!route) throw new Error(`Bilinmeyen rota anahtarı: ${key}`)
  return route
}

/**
 * Yolu rota tanımına çözer.
 *
 * Gezinme rotaları ile gezinme dışı rotalar birlikte taranır: aksi hâlde
 * `/ilan/…` eşleşme bulamayıp `home`'a düşer, kabuk "Anasayfa"yı aktif
 * işaretler ve sayfanın kendi kategori yolunun üstüne yanlış bir durum izi
 * basardı. Önek eşleşmesinde en uzun href kazanır; `/ilan-ver` ile `/ilan`
 * karışmaz çünkü önek `/ilan/` ayıracıyla aranır.
 */
export function getRouteByPath(pathname: string): AppRouteDefinition {
  const path = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname
  const candidates: readonly AppRouteDefinition[] = [...appRoutes, ...nonNavRoutes]

  const exact = candidates.find((route) => route.href === path)
  if (exact) return exact

  return (
    candidates
      .filter((route) => route.href !== '/' && path.startsWith(`${route.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? getRouteByKey('home')
  )
}

const configuredOrigin = import.meta.env.VITE_APP_ORIGIN || 'https://arsam.net'
export const siteOrigin = configuredOrigin.replace(/\/+$/, '')

export function createPageHead(key: AppRouteKey) {
  const route = getRouteByKey(key)
  return {
    meta: [
      { title: `${route.label} | arsam.net` },
      { name: 'description', content: route.description },
      {
        name: 'robots',
        content: route.indexable ? 'index, follow' : 'noindex, nofollow',
      },
    ],
    links: [{ rel: 'canonical', href: `${siteOrigin}${route.href}` }],
  }
}

/**
 * Kimlik doğrulama rotaları — `MarketplaceShell` yerine `AuthShell` kullanır.
 *
 * `/hesabim/*` bu listede DEĞİLDİR: oturum gerektiren sayfalar pazaryeri
 * kabuğunda kalır. Buradaki rotalar oturumu olmayan kullanıcı içindir.
 */
export const authRoutePaths = [
  '/giris',
  '/kayit',
  '/parola-sifirla',
  '/oturum-suresi-doldu',
  '/yetkisiz',
  '/hesap',
] as const

export function isAuthPath(pathname: string): boolean {
  const yol = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return authRoutePaths.some((onek) => yol === onek || yol.startsWith(`${onek}/`))
}
