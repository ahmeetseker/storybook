import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassDatePicker } from './GlassDatePicker'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

// Sabit tarih: 15 Temmuz 2026 (Çarşamba) — testler gerçek saate bağımlı değil
const JUL_15 = new Date(2026, 6, 15)

const renderPicker = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassDatePicker defaultValue={JUL_15} {...props} />
    </GlassTierProvider>,
  )

const trigger = () => screen.getByRole('combobox')

describe('GlassDatePicker', () => {
  it('combobox rolüyle kapalı render olur, boşken placeholder gösterir', () => {
    renderPicker({ defaultValue: null })
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().textContent).toContain('Tarih seç')
  })

  it('tıklayınca takvim açılır: grid, ay başlığı ve seçili gün işaretli', () => {
    renderPicker()
    fireEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('grid')).toBeTruthy()
    expect(screen.getByText('Temmuz 2026')).toBeTruthy()
    const selected = screen.getByRole('gridcell', { name: '15 Temmuz 2026' })
    expect(selected.getAttribute('aria-selected')).toBe('true')
  })

  it('gün seçimi onChange çağırır, paneli kapatır ve trigger biçimli tarihi gösterir', () => {
    const onChange = vi.fn()
    renderPicker({ onChange })
    fireEvent.click(trigger())
    fireEvent.click(screen.getByRole('gridcell', { name: '20 Temmuz 2026' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const picked = onChange.mock.calls[0][0] as Date
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 6, 20])
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().textContent).toContain('20 Tem 2026')
  })

  it('klavye: açılışta seçili güne odaklanır, ArrowRight gezinir, Enter seçer', () => {
    const onChange = vi.fn()
    renderPicker({ onChange })
    fireEvent.click(trigger())
    const day15 = screen.getByRole('gridcell', { name: '15 Temmuz 2026' })
    expect(document.activeElement).toBe(day15)
    fireEvent.keyDown(day15, { key: 'ArrowRight' })
    const day16 = screen.getByRole('gridcell', { name: '16 Temmuz 2026' })
    expect(document.activeElement).toBe(day16)
    fireEvent.keyDown(day16, { key: 'Enter' })
    const picked = onChange.mock.calls[0][0] as Date
    expect(picked.getDate()).toBe(16)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('PageDown ayı ilerletir, Escape kapatır ve focus trigger’a döner', () => {
    renderPicker()
    fireEvent.click(trigger())
    fireEvent.keyDown(screen.getByRole('gridcell', { name: '15 Temmuz 2026' }), { key: 'PageDown' })
    expect(screen.getByText('Ağustos 2026')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('gridcell', { name: '15 Ağustos 2026' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger())
  })

  it('min/max dışındaki günler disabled olur ve seçilemez', () => {
    const onChange = vi.fn()
    renderPicker({ onChange, min: new Date(2026, 6, 10), max: new Date(2026, 6, 20) })
    fireEvent.click(trigger())
    const outside = screen.getByRole('gridcell', { name: '5 Temmuz 2026' }) as HTMLButtonElement
    expect(outside.disabled).toBe(true)
    fireEvent.click(outside)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disabled iken panel açılmaz', () => {
    renderPicker({ disabled: true })
    fireEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('ay gezinme butonları başlığı değiştirir; invalid aria-invalid verir', () => {
    renderPicker({ invalid: true })
    expect(trigger().getAttribute('aria-invalid')).toBe('true')
    fireEvent.click(trigger())
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki ay' }))
    expect(screen.getByText('Ağustos 2026')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Önceki ay' }))
    expect(screen.getByText('Temmuz 2026')).toBeTruthy()
  })

  // Inline varyant: modal/panel içine gömülü, her zaman açık takvim.
  // Popover kırpılma sorunlarının (overflow'lu kap içinde absolute panel)
  // kalıcı çözümü bu varyanttır — bkz. rules.md §"inline".
  describe('variant="inline"', () => {
    it('tetikleyici olmadan grid her zaman görünür ve ay başlığı vardır', () => {
      renderPicker({ variant: 'inline' })
      expect(screen.queryByRole('combobox')).toBeNull()
      expect(screen.getByRole('grid')).toBeTruthy()
      expect(screen.getByText('Temmuz 2026')).toBeTruthy()
    })

    it('gün seçimi onChange çağırır ve takvim AÇIK kalır', () => {
      const onChange = vi.fn()
      renderPicker({ variant: 'inline', onChange })
      fireEvent.click(screen.getByRole('gridcell', { name: '16 Temmuz 2026' }))
      expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 16))
      expect(screen.getByRole('grid')).toBeTruthy()
    })

    it('min/max dışı günler inline modda da seçilemez', () => {
      const onChange = vi.fn()
      renderPicker({ variant: 'inline', onChange, min: new Date(2026, 6, 10), max: new Date(2026, 6, 20) })
      const disabledDay = screen.getByRole('gridcell', { name: '25 Temmuz 2026' })
      expect((disabledDay as HTMLButtonElement).disabled).toBe(true)
      fireEvent.click(disabledDay)
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
