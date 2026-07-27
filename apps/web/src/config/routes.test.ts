import { describe, expect, it } from 'vitest'
import {
  appRoutes,
  dockRouteKeys,
  getRouteByPath,
  headerRouteKeys,
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

  it('tamamlanan ana sayfa ve emlak aramasını indexler, taslak rotaları noindex tutar', () => {
    expect(getRouteByPath('/').indexable).toBe(true)
    expect(getRouteByPath('/emlak').key).toBe('search')
    expect(getRouteByPath('/emlak').indexable).toBe(true)
    expect(
      appRoutes
        .filter((route) => !['home', 'search'].includes(route.key))
        .every((route) => route.indexable === false),
    ).toBe(true)
  })

  it('production canonical için güvenli arsam.net varsayılanını kullanır', () => {
    expect(siteOrigin).toBe('https://arsam.net')
  })

  it('header ve responsive dock listelerinde yalnız kayıtlı rotaları kullanır', () => {
    const keys = new Set(appRoutes.map((route) => route.key))
    expect(headerRouteKeys.every((key) => keys.has(key))).toBe(true)
    expect(dockRouteKeys.desktop).toHaveLength(10)
    expect(dockRouteKeys.tablet).toHaveLength(8)
    expect(dockRouteKeys.mobile).toHaveLength(5)
    expect(
      Object.values(dockRouteKeys).flat().every((key) => keys.has(key)),
    ).toBe(true)
  })
})
