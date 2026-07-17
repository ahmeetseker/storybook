import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassVitrin, type GlassVitrinItem } from './GlassVitrin'

const makeItems = (n: number): GlassVitrinItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `i${i}`,
    image: 'x.png',
    price: `${(i + 1) * 100}.000 TL`,
    title: `İlan ${i + 1}`,
    location: 'İzmir, Urla',
    eids: i % 2 === 0,
    featured: i < 2,
    onClick: vi.fn(),
  }))

describe('GlassVitrin', () => {
  it('micro: tüm ilanları tıklanabilir buton olarak render eder', () => {
    const items = makeItems(6)
    render(<GlassVitrin items={items} />)
    expect(screen.getAllByRole('button')).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: /İlan 3/ }))
    expect(items[2].onClick).toHaveBeenCalledTimes(1)
  })

  it('varyantlar data-variant ile işaretlenir', () => {
    const items = makeItems(3)
    for (const variant of ['micro', 'ruled', 'mosaic', 'list'] as const) {
      const { container, unmount } = render(<GlassVitrin items={items} variant={variant} />)
      expect(container.querySelector(`[data-variant="${variant}"]`)).not.toBeNull()
      unmount()
    }
  })

  it('banded: featured ilanlar banda, kalanlar ızgaraya gider', () => {
    const items = makeItems(8)
    const { container } = render(<GlassVitrin items={items} variant="banded" />)
    const band = container.querySelector('[data-vitrin-band]')
    expect(band).not.toBeNull()
    expect(band?.querySelectorAll('button')).toHaveLength(2)
    expect(container.querySelectorAll('button')).toHaveLength(8)
    expect(band?.textContent).toContain('İlan 1')
  })

  it('banded: featured yoksa ilk bandCount ilan banda alınır', () => {
    const items = makeItems(8).map((i) => ({ ...i, featured: false }))
    const { container } = render(<GlassVitrin items={items} variant="banded" bandCount={3} />)
    expect(container.querySelector('[data-vitrin-band]')?.querySelectorAll('button')).toHaveLength(3)
  })

  it('görseller dekoratiftir (alt=""), EİDS rozeti koşulludur', () => {
    const { container } = render(<GlassVitrin items={makeItems(2)} />)
    for (const img of container.querySelectorAll('img')) expect(img.getAttribute('alt')).toBe('')
    const cards = container.querySelectorAll('button')
    expect(cards[0].querySelector('[class*="eids"]')).not.toBeNull()
    expect(cards[1].querySelector('[class*="eids"]')).toBeNull()
  })

  it('mosaic: başlık görsel gizli metinle butona ad verir, fiyat chip görünür', () => {
    render(<GlassVitrin items={makeItems(2)} variant="mosaic" />)
    const card = screen.getByRole('button', { name: /İlan 1/ })
    expect(card.querySelector('[class*="chip"]')?.textContent).toBe('100.000 TL')
  })

  it('list: konum satırı görünür', () => {
    render(<GlassVitrin items={makeItems(2)} variant="list" />)
    expect(screen.getAllByText('İzmir, Urla')).toHaveLength(2)
  })
})
