import { describe, expect, it } from 'vitest'
import { guvenliDonusYolu } from './auth-session'

describe('guvenliDonusYolu', () => {
  it('uygulama içi mutlak yolu olduğu gibi döndürür', () => {
    expect(guvenliDonusYolu('/hesabim')).toBe('/hesabim')
    expect(guvenliDonusYolu('/hesabim/mesajlar')).toBe('/hesabim/mesajlar')
  })

  it('sorgu ve fragment taşıyan yolu korur', () => {
    expect(guvenliDonusYolu('/emlak?sehir=izmir')).toBe('/emlak?sehir=izmir')
  })

  it('boş, null veya undefined girdide ana sayfaya düşer', () => {
    expect(guvenliDonusYolu(null)).toBe('/')
    expect(guvenliDonusYolu(undefined)).toBe('/')
    expect(guvenliDonusYolu('')).toBe('/')
    expect(guvenliDonusYolu('   ')).toBe('/')
  })

  it('protokol-bağıl dış adresi reddeder (açık yönlendirme koruması)', () => {
    expect(guvenliDonusYolu('//kotu-site.example')).toBe('/')
    expect(guvenliDonusYolu('///kotu-site.example')).toBe('/')
  })

  it('mutlak dış URL reddeder', () => {
    expect(guvenliDonusYolu('https://kotu-site.example')).toBe('/')
    expect(guvenliDonusYolu('http://kotu-site.example/yol')).toBe('/')
  })

  it('şema enjeksiyonunu reddeder', () => {
    expect(guvenliDonusYolu('javascript:alert(1)')).toBe('/')
    expect(guvenliDonusYolu('data:text/html,x')).toBe('/')
  })

  it('göreli yolu reddeder — yalnız mutlak uygulama yolu kabul edilir', () => {
    expect(guvenliDonusYolu('hesabim')).toBe('/')
    expect(guvenliDonusYolu('../hesabim')).toBe('/')
  })

  it('geri dönüş hedefi olarak auth rotasını reddeder — döngü kurulmaz', () => {
    expect(guvenliDonusYolu('/giris')).toBe('/')
    expect(guvenliDonusYolu('/giris/kod')).toBe('/')
  })
})
