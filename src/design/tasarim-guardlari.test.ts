/**
 * Tasarım sistemi guard'ları — kod tabanını tarayan sözleşme testleri.
 *
 * Buradaki kurallar bir kez elle temizlenmiş sapmaların GERİ GELMESİNİ
 * engeller: bir component kütüphanede varsa feature kodu onu yeniden
 * çizmemeli, bir renk token'da tanımlıysa ham değeri tekrar yazılmamalı.
 *
 * Bilinçli bir istisna gerekiyorsa `IZINLI_*` listelerine gerekçesiyle
 * eklenir — sessizce geçmez, kod okuyan herkes nedenini görür.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest workspace kökünden çalışır (vitest.config.ts burada durur).
const KOK = process.cwd()
const TARANAN_KOKLER = ['src', 'apps/web/src']
const ATLANAN_KLASORLER = new Set(['node_modules', 'dist', 'storybook-static', '.output', '.vite'])

function dosyalar(uzantilar: string[]): string[] {
  const bulunan: string[] = []
  const gez = (dizin: string) => {
    for (const ad of readdirSync(dizin)) {
      if (ATLANAN_KLASORLER.has(ad)) continue
      const yol = join(dizin, ad)
      if (statSync(yol).isDirectory()) gez(yol)
      else if (uzantilar.some((uzanti) => ad.endsWith(uzanti))) bulunan.push(yol)
    }
  }
  for (const kok of TARANAN_KOKLER) gez(join(KOK, kok))
  return bulunan
}

/** Test/story dosyaları fixture üretir; ürün yüzeyi değildir. */
const urunKodu = (yol: string) => !/\.(test|stories)\.(ts|tsx)$/.test(yol)

describe('tasarım sistemi guard’ları', () => {
  /**
   * Checkbox tek bir yerden çizilir. Native `<input type="checkbox">` her
   * eklendiğinde işletim sisteminin kutusu geliyor ve aynı ürün içinde iki
   * farklı checkbox görünüyordu (filtre paneli cam kutu, kayıt formu OS kutusu).
   */
  it('native checkbox yalnız GlassCheckbox içinde kalır', () => {
    const IZINLI_CHECKBOX = [
      // GlassCheckbox'ın kendisi: sr-only native input onun sözleşmesidir.
      'src/components/GlassCheckbox/GlassCheckbox.tsx',
      // İlan detayı "Görüşme gündemi": kutu aslında maddenin sıra numarası
      // rozetidir, işaretlenince numara yerini tike bırakır (ürün kararı).
      'apps/web/src/features/listing-detail/components/SellerSection.tsx',
    ]

    const ihlaller = dosyalar(['.tsx'])
      .filter(urunKodu)
      .filter((yol) => /type=["']checkbox["']/.test(readFileSync(yol, 'utf8')))
      .map((yol) => relative(KOK, yol))
      .filter((yol) => !IZINLI_CHECKBOX.includes(yol))

    expect(ihlaller, 'GlassCheckbox kullanın (bkz. src/components/GlassCheckbox)').toEqual([])
  })

  /**
   * Dolu eylem rengi `--lg-action-prominent`tir. Ham `--lg-accent` bir butona
   * zemin olarak yazıldığında kabuktaki "İlan ver" ile yan yana iki farklı
   * kahve çıkıyordu (token'ın kendi yorumu: `src/index.css`).
   */
  it('dolu eylem zeminleri --lg-action-prominent token’ından gelir', () => {
    // Yalnız eylemin KENDİSİNİ boyayan kurallar denetlenir. Rozet, nokta,
    // ilerleme şeridi gibi accent yüzeyleri bu kuralın konusu değildir; bu
    // yüzden pseudo-elemanlar (`::after`) ve alt öğeler (`.x .rakam`) elenir.
    const EYLEM_ADI = /(button|cta|submit|send|primaryaction|allfilterstrigger)/i
    const HAM_ACCENT = /background(-color)?:\s*var\(--lg-accent\)/

    const eylemiBoyar = (secici: string) =>
      secici.split(',').some((tekil) => {
        if (tekil.includes('::')) return false
        const sonParca = tekil.trim().split(/\s+|>/).filter(Boolean).at(-1) ?? ''
        return EYLEM_ADI.test(sonParca)
      })

    const ihlaller: string[] = []
    for (const yol of dosyalar(['.module.css'])) {
      const satirlar = readFileSync(yol, 'utf8').split('\n')
      let acikEylemKurali = false
      satirlar.forEach((satir, index) => {
        if (satir.includes('{')) acikEylemKurali = eylemiBoyar(satir.split('{')[0])
        else if (satir.includes('}')) acikEylemKurali = false
        if (acikEylemKurali && HAM_ACCENT.test(satir)) {
          ihlaller.push(`${relative(KOK, yol)}:${index + 1}`)
        }
      })
    }

    expect(ihlaller, 'dolu eylemde var(--lg-action-prominent) kullanın').toEqual([])
  })
})
