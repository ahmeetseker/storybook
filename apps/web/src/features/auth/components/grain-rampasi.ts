/**
 * Auth marka panelinin grain-gradient rampası — TEK kaynaktan (`--lg-accent`)
 * türetilir.
 *
 * Neden JS'te renk matematiği: shader renkleri uniform olarak alır, CSS
 * `color-mix()` sonucunu okuyamaz. Bir custom property'ye `color-mix(...)`
 * yazıp `getComputedStyle` ile okumak da işe yaramaz — kaydedilmemiş custom
 * property'ler hesaplanmaz, geriye ham `color-mix(...)` metni döner. Bu yüzden
 * rampa, token'ın DÜZ hex değeri (`--lg-accent` bir `color-mix()` değil, ham
 * hex'tir) okunup OKLCH'te yeniden kurularak üretilir.
 *
 * Rampa accent'in TONUNU (hue) korur, ışıklık/doygunluğu kendi eğrisiyle
 * kurar: `--lg-accent` metin kontrastı için seçilmiş koyu bir amberdir
 * (#7c3806), doğrudan degrade olarak kullanılırsa panel çamur rengi bir bloğa
 * döner. Dekoratif yüzeyin kontrast sözleşmesi yoktur; okunabilirliği üstteki
 * perde katmanı sağlar (bkz. AuthBrandPanel.module.css `.perde`).
 */

/** Rampa durağı: OKLCH'te hedef ışıklık + kroma. Ton accent'ten gelir. */
type RampaDuragi = { readonly l: number; readonly c: number }

/**
 * Referans tasarımın siyah → kor → turuncu → sıcak krem geçişi. Dört durak,
 * shader'ın `u_colorsCount` bandı olarak kullanılır: daha fazlası bantları
 * inceltip grain'i bastırır, daha azı geçişi düz bir degradeye indirir.
 */
const RAMPA: readonly RampaDuragi[] = [
  { l: 0.09, c: 0.02 }, // dip — panelin baskın karanlığı
  { l: 0.3, c: 0.125 }, // kor — dar tutulur, genişlerse panel çamura döner
  { l: 0.69, c: 0.2 }, // canlı accent bandı
  { l: 0.93, c: 0.055 }, // sıcak parlama
]

/** OKLCH ton bulunamazsa (accent gri ise) düşülen amber tonu, derece. */
const VARSAYILAN_TON = 55

export type Rgb = readonly [number, number, number]

function srgbDogrusala(k: number): number {
  return k <= 0.04045 ? k / 12.92 : ((k + 0.055) / 1.055) ** 2.4
}

function dogrusalSrgba(k: number): number {
  return k <= 0.0031308 ? 12.92 * k : 1.055 * k ** (1 / 2.4) - 0.055
}

/** `#rgb` / `#rrggbb` → 0-1 sRGB. Tanınmayan girdi için `null`. */
export function hexiCoz(hex: string): Rgb | null {
  const s = hex.trim().replace('#', '')
  const tam = s.length === 3 ? [...s].map((k) => k + k).join('') : s
  if (!/^[0-9a-fA-F]{6}$/.test(tam)) return null
  return [
    parseInt(tam.slice(0, 2), 16) / 255,
    parseInt(tam.slice(2, 4), 16) / 255,
    parseInt(tam.slice(4, 6), 16) / 255,
  ]
}

/** sRGB (0-1) → OKLab. */
function srgbOklaba([r, g, b]: Rgb): Rgb {
  const dr = srgbDogrusala(r)
  const dg = srgbDogrusala(g)
  const db = srgbDogrusala(b)

  const l = Math.cbrt(0.4122214708 * dr + 0.5363325363 * dg + 0.0514459929 * db)
  const m = Math.cbrt(0.2119034982 * dr + 0.6806995451 * dg + 0.1073969566 * db)
  const s = Math.cbrt(0.0883024619 * dr + 0.2817188376 * dg + 0.6299787005 * db)

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** OKLab → sRGB (0-1). Gamut DIŞINDA olabilir; kırpma çağıranın işi. */
function oklabSrgba([bL, ba, bb]: Rgb): Rgb {
  const l = (bL + 0.3963377774 * ba + 0.2158037573 * bb) ** 3
  const m = (bL - 0.1055613458 * ba - 0.0638541728 * bb) ** 3
  const s = (bL - 0.0894841775 * ba - 1.291485548 * bb) ** 3

  return [
    dogrusalSrgba(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    dogrusalSrgba(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    dogrusalSrgba(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function gamutIcinde([r, g, b]: Rgb): boolean {
  const pay = 1e-4 // sRGB yuvarlama payı: 0.99999 gamut dışı sayılmamalı
  return [r, g, b].every((k) => k >= -pay && k <= 1 + pay)
}

/**
 * OKLCH → sRGB, gamut'a SIĞDIRARAK. Kanal kırpmak tonu kaydırır (turuncuyu
 * sarıya çeker); onun yerine kroma, renk sRGB'ye girene kadar azaltılır —
 * ton ve ışıklık korunur, yalnız doygunluk düşer.
 */
export function oklchSrgba(l: number, c: number, tonDerece: number): Rgb {
  const h = (tonDerece * Math.PI) / 180
  let kroma = c

  for (let i = 0; i < 64; i += 1) {
    const renk = oklabSrgba([l, kroma * Math.cos(h), kroma * Math.sin(h)])
    if (gamutIcinde(renk)) {
      return [
        Math.min(1, Math.max(0, renk[0])),
        Math.min(1, Math.max(0, renk[1])),
        Math.min(1, Math.max(0, renk[2])),
      ]
    }
    kroma *= 0.94
  }

  // Kroma sıfıra indi: gri. Işıklık her zaman sRGB'de temsil edilebilir.
  const gri = oklabSrgba([l, 0, 0])
  return [
    Math.min(1, Math.max(0, gri[0])),
    Math.min(1, Math.max(0, gri[1])),
    Math.min(1, Math.max(0, gri[2])),
  ]
}

/** Accent hex'inin OKLCH tonu (derece). Gri/çözülemez girdide amber varsayılanı. */
export function accentTonu(accentHex: string): number {
  const rgb = hexiCoz(accentHex)
  if (!rgb) return VARSAYILAN_TON

  const [, a, b] = srgbOklaba(rgb)
  // Nötre yakın accent'in tonu gürültüdür: 0.004 altı kromada açı anlamsız.
  if (Math.hypot(a, b) < 0.004) return VARSAYILAN_TON

  const derece = (Math.atan2(b, a) * 180) / Math.PI
  return derece < 0 ? derece + 360 : derece
}

/**
 * Accent token'ından shader rampasını üretir. Dönen dizi shader'a olduğu gibi
 * `vec3` uniform'ları olarak verilir; ilk durak aynı zamanda zemin rengidir.
 */
export function grainRampasi(accentHex: string): Rgb[] {
  const ton = accentTonu(accentHex)
  return RAMPA.map(({ l, c }) => oklchSrgba(l, c, ton))
}
