import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassTextarea } from './GlassTextarea'
import { GlassField } from '../GlassField'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderArea = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassTextarea aria-label="Açıklama" {...props} />
    </GlassTierProvider>,
  )

describe('GlassTextarea', () => {
  it('textbox rolüyle render olur ve yazma onChange tetikler', () => {
    const onChange = vi.fn()
    renderArea({ onChange })
    const area = screen.getByRole('textbox', { name: 'Açıklama' })
    fireEvent.change(area, { target: { value: 'Hatasız, boyasız araç' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect((area as HTMLTextAreaElement).value).toBe('Hatasız, boyasız araç')
  })

  it('minRows rows attribute olarak uygulanır', () => {
    renderArea({ minRows: 5 })
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('5')
  })

  it('autoResize: içerik değişince yükseklik scrollHeight üzerinden ayarlanır', () => {
    renderArea({ autoResize: true })
    const area = screen.getByRole('textbox') as HTMLTextAreaElement
    // jsdom layout yapmaz; scrollHeight'i elle veriyoruz
    Object.defineProperty(area, 'scrollHeight', { value: 120, configurable: true })
    fireEvent.change(area, { target: { value: 'satır 1\nsatır 2\nsatır 3\nsatır 4\nsatır 5' } })
    expect(area.style.height).toBe('120px')
  })

  it('autoResize + maxRows: yükseklik satır sınırına kırpılır ve scroll açılır', () => {
    renderArea({ autoResize: true, minRows: 2, maxRows: 4 })
    const area = screen.getByRole('textbox') as HTMLTextAreaElement
    // jsdom'da lineHeight hesaplanmaz → component 20px fallback kullanır; max = 4 * 20 = 80
    Object.defineProperty(area, 'scrollHeight', { value: 500, configurable: true })
    fireEvent.change(area, { target: { value: 'çok\nuzun\nbir\nilan\naçıklaması\nmetni' } })
    expect(area.style.height).toBe('80px')
    expect(area.style.overflowY).toBe('auto')
  })

  it('invalid iken aria-invalid verilir, disabled iken devre dışıdır', () => {
    renderArea({ invalid: true, disabled: true })
    const area = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(area.getAttribute('aria-invalid')).toBe('true')
    expect(area.disabled).toBe(true)
  })

  it('GlassField içinde id ve aria bağlarını context üzerinden alır', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassField label="İlan Açıklaması" description="En az 50 karakter">
          <GlassTextarea />
        </GlassField>
      </GlassTierProvider>,
    )
    const area = screen.getByLabelText('İlan Açıklaması')
    const describedBy = area.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.textContent).toBe('En az 50 karakter')
  })
})
