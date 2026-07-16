import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassDivider } from './GlassDivider'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderDivider = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassDivider {...props} />
    </GlassTierProvider>,
  )

describe('GlassDivider', () => {
  it('etiketsiz yatay ayraç native <hr> olarak separator rolüyle render olur', () => {
    renderDivider()
    const sep = screen.getByRole('separator')
    expect(sep.tagName).toBe('HR')
  })

  it('label verilince div separator olur ve metin görünür', () => {
    renderDivider({ label: 'Benzer İlanlar' })
    const sep = screen.getByRole('separator')
    expect(sep.tagName).toBe('DIV')
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal')
    expect(screen.getByText('Benzer İlanlar')).toBeTruthy()
  })

  it('vertical yönelimde aria-orientation="vertical" verilir', () => {
    renderDivider({ orientation: 'vertical' })
    const sep = screen.getByRole('separator')
    expect(sep.tagName).toBe('DIV')
    expect(sep.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('spacing ve inset sınıfları uygulanır', () => {
    renderDivider({ spacing: 'lg', inset: true })
    const sep = screen.getByRole('separator')
    expect(sep.className).toMatch(/spacingLg/)
    expect(sep.className).toMatch(/inset/)
  })

  it('inset yalnız horizontal içindir — vertical\'da uygulanmaz', () => {
    renderDivider({ orientation: 'vertical', inset: true })
    expect(screen.getByRole('separator').className).not.toMatch(/inset/)
  })
})
