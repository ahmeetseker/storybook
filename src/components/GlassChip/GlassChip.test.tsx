import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassChip } from './GlassChip'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderChip = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassChip {...props}>Sahibinden</GlassChip>
    </GlassTierProvider>,
  )

describe('GlassChip', () => {
  it('toggle modunda button rolü + aria-pressed ile render olur ve tıklama seçimi değiştirir', () => {
    const onSelectedChange = vi.fn()
    renderChip({ defaultSelected: false, onSelectedChange })
    const chip = screen.getByRole('button', { name: 'Sahibinden' })
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(chip)
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })

  it('klavyeyle çalışır: Space/Enter seçimi değiştirir', () => {
    const onSelectedChange = vi.fn()
    renderChip({ onSelectedChange })
    const chip = screen.getByRole('button', { name: 'Sahibinden' })
    expect(chip.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(chip, { key: ' ' })
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
    fireEvent.keyDown(chip, { key: 'Enter' })
    expect(onSelectedChange).toHaveBeenLastCalledWith(false)
  })

  it('controlled kullanımda iç state değil dışarıdaki selected geçerlidir', () => {
    const onSelectedChange = vi.fn()
    renderChip({ selected: true, onSelectedChange })
    const chip = screen.getByRole('button', { name: 'Sahibinden' })
    fireEvent.click(chip)
    expect(onSelectedChange).toHaveBeenCalledWith(false)
    // Dışarıdan selected güncellenmedikçe aria-pressed değişmez
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })

  it('onRemove verilince Kaldır butonu görünür; tıklaması chip onClick tetiklemez', () => {
    const onRemove = vi.fn()
    const onClick = vi.fn()
    renderChip({ onRemove, onClick })
    fireEvent.click(screen.getByRole('button', { name: 'Kaldır' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('chip odaktayken Delete/Backspace kaldırır', () => {
    const onRemove = vi.fn()
    renderChip({ onRemove, onClick: vi.fn() })
    const chip = screen.getByRole('button', { name: /Sahibinden/ })
    fireEvent.keyDown(chip, { key: 'Delete' })
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('disabled iken aria-disabled verilir, tıklama ve klavye çalışmaz', () => {
    const onSelectedChange = vi.fn()
    const onClick = vi.fn()
    renderChip({ onSelectedChange, onClick, disabled: true })
    const chip = screen.getByRole('button', { name: 'Sahibinden' })
    expect(chip.getAttribute('aria-disabled')).toBe('true')
    expect(chip.hasAttribute('tabindex')).toBe(false)
    fireEvent.click(chip)
    fireEvent.keyDown(chip, { key: 'Enter' })
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('etkileşim yoksa (salt görsel) rol ve tabindex verilmez', () => {
    renderChip()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('tint CSS değişkeni olarak uygulanır', () => {
    renderChip({ tint: '#34c759', onClick: vi.fn() })
    const chip = screen.getByRole('button', { name: 'Sahibinden' })
    expect(chip.style.getPropertyValue('--glass-tint')).toBe('#34c759')
  })
})
