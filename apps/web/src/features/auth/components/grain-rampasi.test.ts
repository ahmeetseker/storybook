import { describe, expect, it } from 'vitest'
import { accentTonu, grainRampasi, hexiCoz, oklchSrgba } from './grain-rampasi'

/** 0-1 sRGB → `#rrggbb`, karşılaştırmaları okunur kılmak için. */
function hexle([r, g, b]: readonly [number, number, number]): string {
  const kanal = (k: number) =>
    Math.round(Math.min(1, Math.max(0, k)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${kanal(r)}${kanal(g)}${kanal(b)}`
}

describe('hexiCoz', () => {
  it('kısa ve uzun hex biçimlerini aynı renge çözer', () => {
    expect(hexiCoz('#fff')).toEqual([1, 1, 1])
    expect(hexiCoz('#ffffff')).toEqual([1, 1, 1])
    expect(hexiCoz('  #000  ')).toEqual([0, 0, 0])
  })

  it('hex olmayan girdiye null döner', () => {
    // `--lg-accent` bir gün `oklch(...)` ya da `var(...)` olursa sessizce
    // yanlış renk üretmek yerine varsayılana düşmeliyiz.
    expect(hexiCoz('oklch(0.5 0.1 50)')).toBeNull()
    expect(hexiCoz('')).toBeNull()
    expect(hexiCoz('#12345')).toBeNull()
  })
})

describe('accentTonu', () => {
  it('markanın amber accent tonunu turuncu-sarı aralığında verir', () => {
    // #7c3806 markanın `--lg-accent` değeri: rampanın turuncu-amber ailesine
    // oturması bu tonun (≈46°) doğru okunmasına dayanır.
    const marka = accentTonu('#7c3806')

    expect(marka).toBeGreaterThan(30)
    expect(marka).toBeLessThan(80)
  })

  it('nötr ya da çözülemeyen accent için amber varsayılanına düşer', () => {
    expect(accentTonu('#808080')).toBeCloseTo(55, 5)
    expect(accentTonu('bozuk')).toBeCloseTo(55, 5)
  })
})

describe('oklchSrgba', () => {
  it('gamut dışı kromayı KIRPMAZ, tonu koruyarak azaltır', () => {
    // 0.4 kroma sRGB'de yok. Kanal kırpılsaydı sonuç doymuş bir uç renge
    // (ör. saf kırmızı) yapışır ve ton kayardı.
    const asiri = oklchSrgba(0.66, 0.4, 55)
    const makul = oklchSrgba(0.66, 0.185, 55)

    expect(asiri.every((k) => k >= 0 && k <= 1)).toBe(true)
    // Ton korunduysa kanal SIRALAMASI aynı kalır (turuncu: r > g > b).
    expect(asiri[0]).toBeGreaterThan(asiri[1])
    expect(asiri[1]).toBeGreaterThan(asiri[2])
    expect(makul[0]).toBeGreaterThan(makul[1])
  })

  it('uçlarda ışıklığı sRGB sınırlarına oturtur', () => {
    expect(hexle(oklchSrgba(0, 0, 55))).toBe('#000000')
    expect(hexle(oklchSrgba(1, 0, 55))).toBe('#ffffff')
  })
})

describe('grainRampasi', () => {
  it('accent tonunda dörtlü, giderek açılan bir rampa üretir', () => {
    const rampa = grainRampasi('#7c3806')

    expect(rampa).toHaveLength(4)

    const parlaklik = rampa.map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b)
    for (let i = 1; i < parlaklik.length; i += 1) {
      expect(parlaklik[i], `${i}. durak bir öncekinden açık olmalı`).toBeGreaterThan(
        parlaklik[i - 1],
      )
    }
  })

  it('ilk durağı panelin baskın karanlığı, sonuncusu sıcak parlamadır', () => {
    const [dip, , , parlama] = grainRampasi('#7c3806')

    // Dip: metnin üzerine oturduğu zemin. Beyaz `--lg-on-scrim` için yeterince
    // koyu kalmalı — rampa açılırsa panel metni okunmaz olur.
    expect(Math.max(...dip)).toBeLessThan(0.12)
    // Parlama: referans tasarımın sıcak kremi, saf beyaz DEĞİL.
    expect(Math.min(...parlama)).toBeGreaterThan(0.7)
    expect(parlama[0]).toBeGreaterThan(parlama[2])
  })

  it('accent ışıklığı değişse de rampa aynı aileden kalır', () => {
    // Rampa ışıklık/kromayı kendi eğrisinden kurar, yalnız TONU accent'ten
    // alır: accent çok daha açık bir ambere çekilse de panel aynı görünür.
    const koyuAccent = grainRampasi('#7c3806')
    const acikAccent = grainRampasi('#e9b179')

    // Kalan sapma yalnız tondan gelir (iki accent arasında ~16°), ışıklıktan
    // değil: en büyük kanal farkı ölçüldüğünde ~0.09.
    koyuAccent.forEach((renk, i) => {
      renk.forEach((kanal, k) => {
        expect(Math.abs(kanal - acikAccent[i][k])).toBeLessThan(0.12)
      })
    })
  })

  it('çözülemeyen accent değerinde çökmez', () => {
    const rampa = grainRampasi('var(--baska)')
    expect(rampa).toHaveLength(4)
    expect(rampa.flat().every((k) => k >= 0 && k <= 1)).toBe(true)
  })
})
