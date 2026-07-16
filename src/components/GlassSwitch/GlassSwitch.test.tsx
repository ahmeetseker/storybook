import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSwitch, type GlassSwitchProps } from './GlassSwitch'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSwitch = (props: Partial<GlassSwitchProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSwitch label="Fiyat düşünce bildir" {...props} />
    </GlassTierProvider>,
  )

describe('GlassSwitch', () => {
  it('switch rolü ve aria-label ile render olur, aria-checked başlangıçta false', () => {
    renderSwitch()
    const sw = screen.getByRole('switch', { name: 'Fiyat düşünce bildir' })
    expect(sw.getAttribute('aria-checked')).toBe('false')
  })

  it('tıklama toggle eder ve onChange yeni boolean değeri döner', () => {
    const onChange = vi.fn()
    renderSwitch({ onChange })
    const sw = screen.getByRole('switch')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenLastCalledWith(true)
    expect(sw.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect(sw.getAttribute('aria-checked')).toBe('false')
  })

  it('klavye: Space ve Enter toggle eder', () => {
    const onChange = vi.fn()
    renderSwitch({ onChange })
    const sw = screen.getByRole('switch')
    fireEvent.keyDown(sw, { key: ' ' })
    expect(sw.getAttribute('aria-checked')).toBe('true')
    fireEvent.keyDown(sw, { key: 'Enter' })
    expect(sw.getAttribute('aria-checked')).toBe('false')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('disabled iken toggle olmaz', () => {
    const onChange = vi.fn()
    renderSwitch({ onChange, disabled: true, defaultChecked: true })
    const sw = screen.getByRole('switch')
    fireEvent.click(sw)
    fireEvent.keyDown(sw, { key: ' ' })
    expect(onChange).not.toHaveBeenCalled()
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('controlled: checked prop dışarıdan güncellenmeden değişmez', () => {
    const onChange = vi.fn()
    renderSwitch({ checked: false, onChange })
    const sw = screen.getByRole('switch')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(sw.getAttribute('aria-checked')).toBe('false')
  })

  it('tint CSS değişkeni olarak uygulanır ve type=button olur', () => {
    renderSwitch({ tint: '#34c759' })
    const sw = screen.getByRole('switch') as HTMLButtonElement
    expect(sw.style.getPropertyValue('--glass-tint')).toBe('#34c759')
    expect(sw.getAttribute('type')).toBe('button')
  })
})
