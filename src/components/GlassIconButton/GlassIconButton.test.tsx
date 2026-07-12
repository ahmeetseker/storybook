import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassIconButton } from './GlassIconButton'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBtn = (props: Partial<Parameters<typeof GlassIconButton>[0]> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassIconButton label="Favorilere ekle" {...props}>
        <svg aria-hidden />
      </GlassIconButton>
    </GlassTierProvider>,
  )

describe('GlassIconButton', () => {
  it('aria-label ile erişilebilir buton olarak render olur', () => {
    const onClick = vi.fn()
    renderBtn({ onClick })
    fireEvent.click(screen.getByRole('button', { name: 'Favorilere ekle' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('active boolean verilince aria-pressed yansır', () => {
    renderBtn({ active: true })
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })

  it('active verilmezse aria-pressed konmaz', () => {
    renderBtn()
    expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false)
  })

  it('disabled iken tıklanamaz', () => {
    const onClick = vi.fn()
    renderBtn({ onClick, disabled: true })
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
