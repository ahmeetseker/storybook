import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AuthBrandPanel } from './AuthBrandPanel'

/**
 * Bu testlerin çalıştığı jsdom ortamında WebGL YOKTUR: `getContext('webgl2')`
 * `null` döner. Yani her senaryo aynı zamanda yedek yolun (canvas hiç
 * çizilmez, panel CSS degradesiyle görünür) testidir — grain-gradient'in
 * kurulamadığı gerçek tarayıcılarda da olması gereken davranış.
 */
describe('AuthBrandPanel', () => {
  it('WebGL kurulamadığında çökmez, panel içeriği yerinde kalır', () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<AuthBrandPanel />)

    expect(container.textContent).toContain('Doğrulanmış ofisler')
    expect(container.querySelector('canvas')).toBeNull()

    hata.mockRestore()
  })

  it('paneli ve içindeki zemini erişilebilirlik ağacından gizler', () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<AuthBrandPanel />)

    const panel = container.firstElementChild
    expect(panel?.getAttribute('aria-hidden')).toBe('true')

    // Zemin kabı panelin dışına taşınırsa (ör. kabuğa) kendi başına da
    // ağaçtan çıkmış olmalı — dekoratif bir canvas asla okunmaz.
    const zeminler = container.querySelectorAll('[aria-hidden="true"]')
    expect(zeminler.length).toBeGreaterThanOrEqual(2)

    hata.mockRestore()
  })

  it('destek metnini ve rozetleri TEK grupta tutar', () => {
    // Ayrı flex çocukları olsalardı `space-between` destek metnini panelin
    // ortasına, yani `.perde`nin koruduğu bandın dışına bırakırdı.
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<AuthBrandPanel />)

    const rozetListesi = container.querySelector('ul')
    const destek = [...container.querySelectorAll('p')].find((p) =>
      p.textContent?.includes('taşınmaz ticareti yetki belgesi'),
    )

    expect(rozetListesi).toBeTruthy()
    expect(destek).toBeTruthy()
    expect(rozetListesi?.parentElement).toBe(destek?.parentElement)

    hata.mockRestore()
  })

  it('marka metinlerinde başlık öğesi KULLANMAZ', () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<AuthBrandPanel />)

    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)

    hata.mockRestore()
  })
})
