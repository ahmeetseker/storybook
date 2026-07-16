import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassCheckbox, type GlassCheckboxProps } from './GlassCheckbox'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBox = (props: Partial<GlassCheckboxProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassCheckbox label="Garantili ilanlar" {...props} />
    </GlassTierProvider>,
  )

describe('GlassCheckbox', () => {
  it('checkbox rolü ve label ile erişilebilir isimle render olur', () => {
    renderBox()
    expect(screen.getByRole('checkbox', { name: 'Garantili ilanlar' })).toBeTruthy()
  })

  it('tıklama tik durumunu değiştirir ve onChange çağrılır (uncontrolled)', () => {
    const onChange = vi.fn()
    renderBox({ onChange })
    const input = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(input)
    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(1)
    fireEvent.click(input)
    expect(input.checked).toBe(false)
  })

  it('klavye ile erişilebilir: sr-only input odak alır, aktivasyon (native Space=click) toggle eder', () => {
    renderBox()
    const input = screen.getByRole('checkbox') as HTMLInputElement
    input.focus()
    expect(document.activeElement).toBe(input)
    // Native checkbox'ta Space keyup → click üretir; jsdom bunu simüle etmediği için click ile doğruluyoruz
    fireEvent.click(input)
    expect(input.checked).toBe(true)
  })

  it('disabled iken onChange çağrılmaz', () => {
    const onChange = vi.fn()
    renderBox({ onChange, disabled: true })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('indeterminate: input.indeterminate set edilir ve aria-checked="mixed" olur', () => {
    renderBox({ indeterminate: true })
    const input = screen.getByRole('checkbox') as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    expect(input.getAttribute('aria-checked')).toBe('mixed')
  })

  it('controlled: checked prop dışarıdan güncellenmeden değişmez', () => {
    const onChange = vi.fn()
    renderBox({ checked: false, onChange })
    const input = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(input)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(input.checked).toBe(false)
  })
})
