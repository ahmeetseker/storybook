import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassCarousel } from './GlassCarousel'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

describe('GlassCarousel', () => {
  it('region landmark ve içerikle render olur', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassCarousel label="Benzer ilanlar">
          <div>Kart 1</div>
          <div>Kart 2</div>
        </GlassCarousel>
      </GlassTierProvider>,
    )
    expect(screen.getByRole('region', { name: 'Benzer ilanlar' })).toBeDefined()
    expect(screen.getByText('Kart 1')).toBeDefined()
  })

  it('ok butonları kaydırma çağrısı yapar', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassCarousel>
          <div>Kart</div>
        </GlassCarousel>
      </GlassTierProvider>,
    )
    const scrollBy = vi.fn()
    // jsdom scrollBy desteklemez; şeride stub takıyoruz
    const track = screen.getByText('Kart').parentElement as HTMLElement
    track.scrollBy = scrollBy
    fireEvent.click(screen.getByRole('button', { name: 'İleri kaydır' }))
    expect(scrollBy).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Geri kaydır' }))
    expect(scrollBy).toHaveBeenCalledTimes(2)
  })
})
