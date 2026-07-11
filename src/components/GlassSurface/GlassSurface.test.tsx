import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassSurface } from './GlassSurface'
import { GlassTierProvider } from './GlassTierContext'

describe('GlassSurface', () => {
  it('children render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSurface>merhaba</GlassSurface>
      </GlassTierProvider>,
    )
    expect(screen.getByText('merhaba')).toBeDefined()
  })

  it('fallback tier\'da SVG filter render etmez, blur fallback stili uygular', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassSurface data-testid="s">x</GlassSurface>
      </GlassTierProvider>,
    )
    expect(container.querySelector('filter')).toBeNull()
    const el = screen.getByTestId('s')
    expect(el.style.backdropFilter).toContain('blur')
  })

  it('clear varyantı karartma katmanı ekler', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassSurface variant="clear">x</GlassSurface>
      </GlassTierProvider>,
    )
    expect(container.querySelector('[data-glass-dimming]')).not.toBeNull()
  })

  it('as prop ile buton olarak render olur', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSurface as="button">tıkla</GlassSurface>
      </GlassTierProvider>,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })
})
