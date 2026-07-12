import { describe, expect, it } from 'vitest'
import { detectTier, exceedsRefractionArea, REFRACTION_MAX_AREA } from './tier'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'
const FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:141.0) Gecko/20100101 Firefox/141.0'
const CRIOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1'

describe('detectTier', () => {
  it('userAgentData Chromium markası → refraction', () => {
    expect(detectTier({ userAgent: '', userAgentData: { brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }] } })).toBe('refraction')
  })
  it('Chrome UA → refraction', () => {
    expect(detectTier({ userAgent: CHROME_UA })).toBe('refraction')
  })
  it('Safari UA → fallback', () => {
    expect(detectTier({ userAgent: SAFARI_UA })).toBe('fallback')
  })
  it('Firefox UA → fallback', () => {
    expect(detectTier({ userAgent: FIREFOX_UA })).toBe('fallback')
  })
  it('iOS Chrome (CriOS) UA → fallback (WebKit tabanlı, backdrop-filter: url() render edemez)', () => {
    expect(detectTier({ userAgent: CRIOS_UA })).toBe('fallback')
  })
})

describe('exceedsRefractionArea', () => {
  it('küçük kontroller (buton, kapsül, tab bar) sınırın altında kalır', () => {
    expect(exceedsRefractionArea(320, 56)).toBe(false) // buton
    expect(exceedsRefractionArea(68, 380)).toBe(false) // dikey tab bar
  })
  it('büyük paneller (sidebar, pencere) sınırı aşar → düz malzemeye düşer', () => {
    expect(exceedsRefractionArea(300, 800)).toBe(true) // sidebar
    expect(exceedsRefractionArea(1600, 850)).toBe(true) // pencere
  })
  it('sınır tam alan değerinde aşılmış sayılmaz', () => {
    expect(exceedsRefractionArea(REFRACTION_MAX_AREA, 1)).toBe(false)
  })
})
