import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassListingCard } from './GlassListingCard'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const baseProps = {
  image: { src: 'data:image/svg+xml,x', alt: 'Renault Clio' },
  title: 'Renault Clio 1.0 TCe',
  price: '785.000 TL',
  location: 'İstanbul, Maltepe',
}

describe('GlassListingCard', () => {
  it('başlık, fiyat, konum ve görseli render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassListingCard {...baseProps} />
      </GlassTierProvider>,
    )
    expect(screen.getByText('Renault Clio 1.0 TCe')).toBeDefined()
    expect(screen.getByText('785.000 TL')).toBeDefined()
    expect(screen.getByText('İstanbul, Maltepe')).toBeDefined()
    expect(screen.getByAltText('Renault Clio')).toBeDefined()
  })

  it('tıklanabilir buton olarak davranır', () => {
    const onClick = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassListingCard {...baseProps} onClick={onClick} />
      </GlassTierProvider>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('badge verilince gösterir', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassListingCard {...baseProps} badge={<span>Acil</span>} />
      </GlassTierProvider>,
    )
    expect(screen.getByText('Acil')).toBeDefined()
  })

  it.each(['details', 'overlay'] as const)('%s varyantında zengin içeriği gösterir', (variant) => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassListingCard
          {...baseProps}
          variant={variant}
          priceSuffix="/Ay"
          reviewCount="2 bin değerlendirme"
          amenities={[{ label: 'Wifi' }, { label: 'Mutfak' }]}
          actionLabel="Detayları Gör"
        />
      </GlassTierProvider>,
    )
    expect(screen.getByText('2 bin değerlendirme')).toBeDefined()
    expect(screen.getByLabelText('Olanaklar')).toBeDefined()
    expect(screen.getByText('Detayları Gör')).toBeDefined()
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe(variant)
  })

  it('varsayılan olarak form göndermeyen button tipini kullanır', () => {
    render(<GlassListingCard {...baseProps} />)
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('propertyOverlay varyantında fiyat, metrik, satıcı ve tarihi gösterir', () => {
    render(
      <GlassListingCard
        {...baseProps}
        variant="propertyOverlay"
        pricePrefix="Liste:"
        metrics={[{ value: '29 m²', label: 'Yaşam' }, { value: '2', label: 'Oda' }]}
        seller="Waleed Sabir"
        listedAt="2 gün önce"
      />,
    )
    expect(screen.getByText(/Liste:/)).toBeDefined()
    expect(screen.getByLabelText('İlan özellikleri')).toBeDefined()
    expect(screen.getByText('Waleed Sabir')).toBeDefined()
    expect(screen.getByText('2 gün önce')).toBeDefined()
  })
})
