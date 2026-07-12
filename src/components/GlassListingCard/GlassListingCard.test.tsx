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
})
