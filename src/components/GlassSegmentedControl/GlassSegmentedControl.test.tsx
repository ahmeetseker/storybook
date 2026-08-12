import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { GlassSegmentedControl, type GlassSegmentedControlProps } from './GlassSegmentedControl'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const options = [
  { value: 'list', label: 'Liste' },
  { value: 'grid', label: 'Izgara' },
  { value: 'map', label: 'Harita' },
]

const renderControl = (props: Partial<GlassSegmentedControlProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSegmentedControl label="Görünüm" options={options} {...props} />
    </GlassTierProvider>,
  )

describe('GlassSegmentedControl', () => {
  it('radiogroup rolü ve aria-label ile render olur; ilk seçenek seçilidir', () => {
    renderControl()
    expect(screen.getByRole('radiogroup', { name: 'Görünüm' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Liste' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: 'Izgara' }).getAttribute('aria-checked')).toBe('false')
  })

  it('tıklama seçer ve onChange değeri döner', () => {
    const onChange = vi.fn()
    renderControl({ onChange })
    fireEvent.click(screen.getByRole('radio', { name: 'Harita' }))
    expect(onChange).toHaveBeenCalledWith('map')
    expect(screen.getByRole('radio', { name: 'Harita' }).getAttribute('aria-checked')).toBe('true')
  })

  it('roving tabindex: yalnız seçili segment tab sırasındadır', () => {
    renderControl({ defaultValue: 'grid' })
    expect(screen.getByRole('radio', { name: 'Izgara' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('radio', { name: 'Liste' }).getAttribute('tabindex')).toBe('-1')
  })

  it('ok tuşları seçimi taşır ve disabled segmenti atlar', () => {
    const onChange = vi.fn()
    renderControl({
      onChange,
      options: [options[0], { ...options[1], disabled: true }, options[2]],
    })
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    // Izgara disabled → Harita'ya atlar
    expect(onChange).toHaveBeenLastCalledWith('map')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    // Sondan başa sarar
    expect(onChange).toHaveBeenLastCalledWith('list')
  })

  it('Home/End ilk ve son etkin segmente gider', () => {
    const onChange = vi.fn()
    renderControl({ onChange, defaultValue: 'grid' })
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith('map')
    fireEvent.keyDown(group, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith('list')
  })

  it('controlled: value dışarıdan güncellenmeden değişmez', () => {
    const onChange = vi.fn()
    renderControl({ value: 'list', onChange })
    fireEvent.click(screen.getByRole('radio', { name: 'Izgara' }))
    expect(onChange).toHaveBeenCalledWith('grid')
    expect(screen.getByRole('radio', { name: 'Liste' }).getAttribute('aria-checked')).toBe('true')
  })

  it('disabled kontrol hiçbir etkileşim almaz', () => {
    const onChange = vi.fn()
    renderControl({ disabled: true, onChange })
    fireEvent.click(screen.getByRole('radio', { name: 'Izgara' }))
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('fill="content" bar segmentlerini eşit paylaşımdan çıkarır', () => {
    const { container, rerender } = render(
      <GlassSegmentedControl label="G" variant="bar" options={options} />,
    )
    const cls = () => container.firstElementChild!.className
    expect(cls()).not.toMatch(/barContent/)
    rerender(<GlassSegmentedControl label="G" variant="bar" fill="content" options={options} />)
    expect(cls()).toMatch(/barContent/)
    expect(screen.getAllByRole('radio')).toHaveLength(options.length)
  })

  it('variant="bar" cam yüzey kurmaz, semantik ve seçim korunur', () => {
    const onChange = vi.fn()
    const { container } = renderControl({ variant: 'bar', onChange })
    // Cam katmanın imzası: GlassSurface refraction filtresini SVG olarak basar.
    expect(container.querySelector('svg filter')).toBeNull()
    expect(screen.getByRole('radiogroup', { name: 'Görünüm' })).not.toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Harita' }))
    expect(onChange).toHaveBeenCalledWith('map')
  })

  it('varsayılan variant kapsül cam yüzeyde kalır', () => {
    const { container } = renderControl({})
    expect(container.querySelector('[class*="root"]')).not.toBeNull()
    expect(screen.getByRole('radiogroup')).not.toBeNull()
  })

  it('sıvı geçiş: seçim değişince damla süzülüş boyunca cam olur, sonra oturur', () => {
    vi.useFakeTimers()
    try {
      const { container } = renderControl()
      fireEvent.click(screen.getByRole('radio', { name: 'Harita' }))
      expect(container.querySelector('[data-liquid]')).not.toBeNull()
      act(() => {
        vi.advanceTimersByTime(750)
      })
      expect(container.querySelector('[data-liquid]')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('sıvı geçiş: zaten seçili segmente tıklamak damlayı camlaştırmaz', () => {
    const { container } = renderControl()
    fireEvent.click(screen.getByRole('radio', { name: 'Liste' }))
    expect(container.querySelector('[data-liquid]')).toBeNull()
  })
})
