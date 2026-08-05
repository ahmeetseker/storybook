import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassMarquee, type GlassMarqueeItem } from './GlassMarquee'

const items: GlassMarqueeItem[] = [
  {
    id: 'i1',
    label: 'İzmir Urla Denize 900 m, İmarlı Köşe Parsel',
    meta: '4.250.000 TL',
    href: '/ilan/1084526631',
  },
  {
    id: 'i2',
    label: 'Antalya Kaş Deniz Manzaralı Arsa',
    meta: '6.900.000 TL',
    href: '/ilan/1084526634',
  },
]

describe('GlassMarquee', () => {
  it('öğeleri gerçek bağlantı olarak sunar ve şeridi adlandırır', () => {
    render(<GlassMarquee items={items} label="Öne çıkan ilanlar" />)
    const list = screen.getByRole('list', { name: 'Öne çıkan ilanlar' })
    const links = within(list).getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/ilan/1084526631')
  })

  it('döngü kopyası erişilebilirlik ağacından ve sekme sırasından çıkar', () => {
    const { container } = render(<GlassMarquee items={items} label="Öne çıkan ilanlar" />)
    // Görsel döngü iki grup ister; erişilebilir olan yalnız ilki.
    expect(container.querySelectorAll('ul')).toHaveLength(2)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    const duplicate = container.querySelectorAll('ul')[1]
    expect(duplicate.getAttribute('aria-hidden')).toBe('true')
    for (const link of duplicate.querySelectorAll('a')) {
      expect(link.getAttribute('tabindex')).toBe('-1')
    }
  })

  it('duraklat düğmesi hareketi durdurur ve adı eyleme göre değişir', () => {
    const { container } = render(<GlassMarquee items={items} label="Öne çıkan ilanlar" />)
    const root = container.firstElementChild
    expect(root?.getAttribute('data-paused')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Şeridi duraklat' }))
    expect(root?.getAttribute('data-paused')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Şeridi sürdür' }))
    expect(root?.getAttribute('data-paused')).toBeNull()
  })

  it('href verilmeyen öğe düz metin kalır', () => {
    render(
      <GlassMarquee
        items={[{ id: 'duyuru', label: 'Yeni: EİDS yetki kontrolü' }]}
        label="Duyurular"
      />,
    )
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getAllByText('Yeni: EİDS yetki kontrolü').length).toBeGreaterThan(0)
  })

  it('yön ve varyant kökte işaretlenir', () => {
    const { container } = render(
      <GlassMarquee items={items} label="Öne çıkan ilanlar" direction="end" variant="ink" />,
    )
    const root = container.firstElementChild
    expect(root?.getAttribute('data-direction')).toBe('end')
    expect(root?.className).toContain('ink')
  })

  it('tıklama geri çağrısı bağlantının üstüne biner', () => {
    const onClick = vi.fn()
    render(<GlassMarquee items={[{ ...items[0], onClick }]} label="Öne çıkan ilanlar" />)
    fireEvent.click(screen.getByRole('link', { name: /İzmir Urla/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
