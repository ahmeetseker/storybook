import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassStepper, type GlassStepperProps } from './GlassStepper'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderStepper = (props: Partial<GlassStepperProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassStepper label="Adet" min={0} max={10} defaultValue={3} {...props} />
    </GlassTierProvider>,
  )

describe('GlassStepper', () => {
  it('spinbutton rolü, aria-label ve aria değer sözleşmesiyle render olur', () => {
    renderStepper()
    const spin = screen.getByRole('spinbutton', { name: 'Adet' })
    expect(spin.getAttribute('aria-valuenow')).toBe('3')
    expect(spin.getAttribute('aria-valuemin')).toBe('0')
    expect(spin.getAttribute('aria-valuemax')).toBe('10')
  })

  it('+/− butonları değeri değiştirir ve onChange sayı döner', () => {
    const onChange = vi.fn()
    renderStepper({ onChange })
    fireEvent.click(screen.getByRole('button', { name: 'Artır' }))
    expect(onChange).toHaveBeenLastCalledWith(4)
    fireEvent.click(screen.getByRole('button', { name: 'Azalt' }))
    expect(onChange).toHaveBeenLastCalledWith(3)
    expect(screen.getByRole('spinbutton').getAttribute('aria-valuenow')).toBe('3')
  })

  it('klavye: ArrowUp/Down step kadar, Home/End uçlara taşır', () => {
    const onChange = vi.fn()
    renderStepper({ onChange, step: 2 })
    const spin = screen.getByRole('spinbutton')
    fireEvent.keyDown(spin, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(5)
    fireEvent.keyDown(spin, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(3)
    fireEvent.keyDown(spin, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(10)
    fireEvent.keyDown(spin, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('min/max uçlarında ilgili buton disabled olur ve değer kıskaçlanır', () => {
    const onChange = vi.fn()
    renderStepper({ onChange, defaultValue: 10 })
    const inc = screen.getByRole('button', { name: 'Artır' }) as HTMLButtonElement
    expect(inc.disabled).toBe(true)
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disabled iken hiçbir etkileşim çalışmaz ve spinbutton odaklanamaz', () => {
    const onChange = vi.fn()
    renderStepper({ onChange, disabled: true })
    const spin = screen.getByRole('spinbutton')
    expect(spin.getAttribute('aria-disabled')).toBe('true')
    expect(spin.getAttribute('tabindex')).toBe('-1')
    fireEvent.keyDown(spin, { key: 'ArrowUp' })
    fireEvent.click(screen.getByRole('button', { name: 'Artır' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("formatValue görünen metni ve aria-valuetext'i biçimler; aria-valuenow ham sayı kalır", () => {
    renderStepper({ defaultValue: 2, formatValue: (v) => `${v} hafta` })
    const spin = screen.getByRole('spinbutton')
    expect(spin.textContent).toBe('2 hafta')
    expect(spin.getAttribute('aria-valuetext')).toBe('2 hafta')
    expect(spin.getAttribute('aria-valuenow')).toBe('2')
  })

  it('controlled: value dışarıdan güncellenmeden değişmez', () => {
    const onChange = vi.fn()
    renderStepper({ value: 5, onChange })
    fireEvent.click(screen.getByRole('button', { name: 'Artır' }))
    expect(onChange).toHaveBeenCalledWith(6)
    expect(screen.getByRole('spinbutton').getAttribute('aria-valuenow')).toBe('5')
  })
})
