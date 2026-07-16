import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassInput } from './GlassInput'
import { GlassField } from '../GlassField'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderInput = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassInput aria-label="Arama" {...props} />
    </GlassTierProvider>,
  )

describe('GlassInput', () => {
  it('textbox rolüyle render olur ve yazma onChange tetikler', () => {
    const onChange = vi.fn()
    renderInput({ onChange })
    const input = screen.getByRole('textbox', { name: 'Arama' })
    fireEvent.change(input, { target: { value: 'Golf 1.6' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect((input as HTMLInputElement).value).toBe('Golf 1.6')
  })

  it('clearable: değer varken Temizle butonu görünür, tıklayınca değer boşalır ve onChange görür', () => {
    const onChange = vi.fn()
    renderInput({ clearable: true, defaultValue: 'Passat', onChange })
    const clearButton = screen.getByRole('button', { name: 'Temizle' })
    fireEvent.click(clearButton)
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
    expect(onChange).toHaveBeenCalled()
    // Değer boşalınca buton kaybolur
    expect(screen.queryByRole('button', { name: 'Temizle' })).toBeNull()
  })

  it('clearable: değer yokken Temizle butonu render edilmez', () => {
    renderInput({ clearable: true })
    expect(screen.queryByRole('button', { name: 'Temizle' })).toBeNull()
  })

  it('invalid iken aria-invalid verilir', () => {
    renderInput({ invalid: true })
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('disabled iken input devre dışıdır ve clear butonu görünmez', () => {
    renderInput({ disabled: true, clearable: true, defaultValue: 'Corolla' })
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Temizle' })).toBeNull()
  })

  it('GlassField içinde id ve aria bağlarını context üzerinden alır', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassField label="Fiyat" description="TL cinsinden girin" error="Fiyat zorunlu">
          <GlassInput />
        </GlassField>
      </GlassTierProvider>,
    )
    const input = screen.getByLabelText('Fiyat')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.textContent).toBe('Fiyat zorunlu')
  })

  it('type="search" native attr olarak geçer', () => {
    renderInput({ type: 'search' })
    expect(screen.getByRole('searchbox', { name: 'Arama' })).toBeTruthy()
  })
})
