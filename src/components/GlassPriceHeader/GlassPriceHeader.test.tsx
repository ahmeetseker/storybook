import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassPriceHeader } from './GlassPriceHeader'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

describe('GlassPriceHeader', () => {
  it('başlık, fiyat ve meta bilgisini render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassPriceHeader title="Golf 1.6 TDI" price="1.185.000 TL" meta="İstanbul, Kadıköy" />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Golf 1.6 TDI' })).toBeDefined()
    expect(screen.getByText('1.185.000 TL')).toBeDefined()
    expect(screen.getByText('İstanbul, Kadıköy')).toBeDefined()
  })

  it('priceTint fiyat rengine uygulanır', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassPriceHeader title="Golf" price="1.185.000 TL" priceTint="rgb(255, 214, 10)" />
      </GlassTierProvider>,
    )
    expect(screen.getByText('1.185.000 TL').style.color).toBe('rgb(255, 214, 10)')
  })

  it('badges ve actions alanlarını render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassPriceHeader title="Golf" price="1 TL" badges={<span>Acil</span>} actions={<button>Favori</button>} />
      </GlassTierProvider>,
    )
    expect(screen.getByText('Acil')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Favori' })).toBeDefined()
  })
})
