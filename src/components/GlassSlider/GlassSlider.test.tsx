import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSlider, type GlassSliderProps } from './GlassSlider'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSlider = (props: Partial<GlassSliderProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSlider label="Azami fiyat" {...props} />
    </GlassTierProvider>,
  )

describe('GlassSlider', () => {
  it('slider rolü, aria-label ve aria değer sözleşmesiyle render olur', () => {
    renderSlider({ min: 0, max: 100, defaultValue: 40 })
    const input = screen.getByRole('slider', { name: 'Azami fiyat' }) as HTMLInputElement
    expect(input.value).toBe('40')
    expect(input.min).toBe('0')
    expect(input.max).toBe('100')
  })

  it('change ile onChange sayı döner (uncontrolled günceller)', () => {
    const onChange = vi.fn()
    renderSlider({ onChange, defaultValue: 40 })
    const input = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(input, { target: { value: '60' } })
    expect(onChange).toHaveBeenCalledWith(60)
    expect(input.value).toBe('60')
  })

  it('klavye: ok tuşları step kadar, Home/End uçlara taşır', () => {
    const onChange = vi.fn()
    renderSlider({ onChange, min: 0, max: 100, step: 5, defaultValue: 50 })
    const input = screen.getByRole('slider') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(55)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(50)
    fireEvent.keyDown(input, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(100)
    fireEvent.keyDown(input, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('değer min/max aralığına kıskaçlanır', () => {
    const onChange = vi.fn()
    renderSlider({ onChange, min: 0, max: 100, defaultValue: 100 })
    const input = screen.getByRole('slider') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    // 100'ün üstüne çıkmaz → değer değişmediği için onChange çağrılmaz
    expect(onChange).not.toHaveBeenCalled()
    expect(input.value).toBe('100')
  })

  it('disabled iken input disabled olur', () => {
    const onChange = vi.fn()
    renderSlider({ onChange, disabled: true, defaultValue: 30 })
    const input = screen.getByRole('slider') as HTMLInputElement
    expect(input.disabled).toBe(true)
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('formatValue: aria-valuetext ve showValue baloncuğu formatlı metni gösterir', () => {
    renderSlider({
      min: 0,
      max: 100,
      defaultValue: 75,
      showValue: true,
      formatValue: (v) => `%${v}`,
    })
    const input = screen.getByRole('slider')
    expect(input.getAttribute('aria-valuetext')).toBe('%75')
    expect(screen.getByText('%75')).toBeTruthy()
  })

  it('sıvı basış: sürükleme boyunca thumb cam (data-liquid), bırakınca temizlenir', () => {
    const { container } = renderSlider({ min: 0, max: 100, defaultValue: 40 })
    const input = screen.getByRole('slider')
    fireEvent.pointerDown(input)
    expect(container.querySelector('[data-liquid]')).not.toBeNull()
    fireEvent.pointerUp(input)
    expect(container.querySelector('[data-liquid]')).toBeNull()
  })

  it('sıvı basış: disabled iken pointer thumb durumunu değiştirmez', () => {
    const { container } = renderSlider({ disabled: true })
    fireEvent.pointerDown(screen.getByRole('slider'))
    expect(container.querySelector('[data-liquid]')).toBeNull()
  })
})
