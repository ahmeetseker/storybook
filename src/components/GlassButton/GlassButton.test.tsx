import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassButton } from './GlassButton'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBtn = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassButton {...props}>Kaydet</GlassButton>
    </GlassTierProvider>,
  )

describe('GlassButton', () => {
  it('button rolüyle render olur ve tıklama çalışır', () => {
    const onClick = vi.fn()
    renderBtn({ onClick })
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled iken tıklanamaz', () => {
    const onClick = vi.fn()
    renderBtn({ onClick, disabled: true })
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('tint verilince CSS değişkeni olarak uygulanır', () => {
    renderBtn({ tint: '#0a84ff' })
    expect(screen.getByRole('button').style.getPropertyValue('--glass-tint')).toBe('#0a84ff')
  })

  it('boyut sınıfı uygulanır', () => {
    renderBtn({ size: 'xl' })
    expect(screen.getByRole('button').className).toMatch(/xl/)
  })

  it('prominent renkte kontrastı inline olarak korur', () => {
    renderBtn({ prominent: true })
    expect(screen.getByRole('button').style.color).toBe('var(--lg-accent-contrast)')
  })

  it('type varsayılanı button olur (form içinde kazara submit engellenir)', () => {
    renderBtn()
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('loading iken tekrar aktivasyon engellenir ve aria-busy verilir', () => {
    const onClick = vi.fn()
    renderBtn({ onClick, loading: true })
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-busy')).toBe('true')
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})
