import { describe, expect, it } from 'vitest'
import {
  appRoutes,
  getBreadcrumbTrail,
  getRouteByKey,
  getRouteByPath,
  headerRouteKeys,
  isAuthPath,
  nonNavRoutes,
  siteOrigin,
} from './routes'

describe('uygulama rota kaydı', () => {
  it('benzersiz ve mutlak href değerleri taşır', () => {
    const hrefs = appRoutes.map((route) => route.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(hrefs.every((href) => href.startsWith('/'))).toBe(true)
  })

  it('hesap alt rotasında en özel eşleşmeyi döndürür', () => {
    expect(getRouteByPath('/hesabim/mesajlar').key).toBe('messages')
    expect(getRouteByPath('/hesabim/mesajlar/arsam-123').key).toBe('messages')
  })

  it('tamamlanan sayfaları indexler, taslak rotaları noindex tutar', () => {
    // Yayına hazır ve arama motoruna açık rotalar. Listeye ekleme yapmak
    // bilinçli bir karardır: bir sayfa ancak içeriği tamamlandığında indexlenir.
    const indexlenen = ['home', 'search', 'pricing']

    expect(getRouteByPath('/').indexable).toBe(true)
    expect(getRouteByPath('/emlak').key).toBe('search')
    expect(getRouteByPath('/emlak').indexable).toBe(true)
    // Paket sayfası fiyat taşır: bir ofis "arsam ofis paketi" diye arar.
    expect(getRouteByPath('/paketler').key).toBe('pricing')
    expect(getRouteByPath('/paketler').indexable).toBe(true)

    expect(
      appRoutes
        .filter((route) => !indexlenen.includes(route.key))
        .every((route) => route.indexable === false),
    ).toBe(true)
  })

  // Kayıtlı olmayan dinamik rota `home`'a düşer ve kabuk yanlış sekmeyi aktif
  // işaretlerdi. Kayıt gezinme listelerinin dışında durur.
  it('ilan detayı yolunu gezinme listesine sokmadan çözer', () => {
    const route = getRouteByPath('/ilan/arsa-214-7')
    expect(route.key).toBe('listing-detail')

    const navKeys = appRoutes.map((item) => item.key) as string[]
    expect(navKeys).not.toContain('listing-detail')
    expect(headerRouteKeys as readonly string[]).not.toContain('listing-detail')

    // Kabuk diğer sayfalarla aynı kırıntı yolunu basar.
    expect(route.statusTrail).toEqual(['Anasayfa', 'Emlak ara', 'İlan detayı'])
  })

  it('ilan detayı öneki `/ilan-ver` rotasını yutmaz', () => {
    expect(getRouteByPath('/ilan-ver').key).toBe('create-listing')
    expect(getRouteByPath('/ilan-ver/adim-2').key).toBe('create-listing')
  })

  it('gezinme dışı rotalar da benzersiz ve mutlak href taşır', () => {
    const hrefs = [...appRoutes, ...nonNavRoutes].map((route) => route.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(hrefs.every((href) => href.startsWith('/'))).toBe(true)
  })

  it('production canonical için güvenli arsam.net varsayılanını kullanır', () => {
    expect(siteOrigin).toBe('https://arsam.net')
  })

  it('header listesinde yalnız kayıtlı rotaları kullanır', () => {
    const keys = new Set(appRoutes.map((route) => route.key))
    expect(headerRouteKeys.every((key) => keys.has(key))).toBe(true)
  })
})

describe('isAuthPath', () => {
  it('auth rotalarını tanır', () => {
    expect(isAuthPath('/giris')).toBe(true)
    expect(isAuthPath('/giris/kod')).toBe(true)
    expect(isAuthPath('/kayit')).toBe(true)
    expect(isAuthPath('/parola-sifirla')).toBe(true)
    expect(isAuthPath('/oturum-suresi-doldu')).toBe(true)
    expect(isAuthPath('/yetkisiz')).toBe(true)
    expect(isAuthPath('/hesap/dogrula')).toBe(true)
  })

  it('pazaryeri rotalarını auth saymaz', () => {
    expect(isAuthPath('/')).toBe(false)
    expect(isAuthPath('/emlak')).toBe(false)
    expect(isAuthPath('/hesabim')).toBe(false)
    expect(isAuthPath('/hesabim/parola')).toBe(false)
  })

  it('sondaki eğik çizgiyi yok sayar', () => {
    expect(isAuthPath('/giris/')).toBe(true)
  })
})

describe('getBreadcrumbTrail', () => {
  it('ara etiketleri rota href`lerine çözer, son etiket href`siz kalır', () => {
    expect(getBreadcrumbTrail(getRouteByKey('messages'))).toEqual([
      { label: 'Anasayfa', href: '/' },
      { label: 'Hesabım', href: '/hesabim' },
      { label: 'Mesajlar' },
    ])
  })

  it('iki seviyeli rotada yalnız kök tıklanabilir', () => {
    expect(getBreadcrumbTrail(getRouteByKey('search'))).toEqual([
      { label: 'Anasayfa', href: '/' },
      { label: 'Emlak ara' },
    ])
  })

  it('ilan detayı izi ara düğümleri tıklanabilir çözer', () => {
    const listingDetail = nonNavRoutes.find((route) => route.key === 'listing-detail')
    expect(listingDetail).toBeDefined()
    expect(getBreadcrumbTrail(listingDetail!)).toEqual([
      { label: 'Anasayfa', href: '/' },
      { label: 'Emlak ara', href: '/emlak' },
      { label: 'İlan detayı' },
    ])
  })

  it('her gezinme rotasının ara etiketleri bir rotaya çözülür — kırık kırıntı yok', () => {
    for (const route of appRoutes) {
      const trail = getBreadcrumbTrail(route)
      for (const item of trail.slice(0, -1)) {
        expect(item.href, `'${route.key}' rotasının '${item.label}' etiketi`).toBeDefined()
      }
    }
  })
})
