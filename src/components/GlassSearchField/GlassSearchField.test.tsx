import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSearchField, type GlassSearchFieldProps } from './GlassSearchField'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderField = (props: Partial<GlassSearchFieldProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSearchField aria-label="İlan ara" {...props} />
    </GlassTierProvider>,
  )

describe('GlassSearchField', () => {
  it('searchbox rolü ve aria-label ile render olur, default placeholder Ara…', () => {
    renderField()
    const input = screen.getByRole('searchbox', { name: 'İlan ara' }) as HTMLInputElement
    expect(input.type).toBe('search')
    expect(input.placeholder).toBe('Ara…')
  })

  it('Enter güncel değerle onSearch çağırır', () => {
    const onSearch = vi.fn()
    renderField({ onSearch, defaultValue: 'clio' })
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('clio')
  })

  it('Escape dolu alanı temizler ve onChange görür', () => {
    const onChange = vi.fn()
    renderField({ defaultValue: 'passat', onChange })
    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('')
    expect(onChange).toHaveBeenCalled()
  })

  it('Escape boş alanda preventDefault yapmaz (overlay kapanışına karışmaz)', () => {
    renderField()
    const input = screen.getByRole('searchbox')
    const event = fireEvent.keyDown(input, { key: 'Escape' })
    // fireEvent true döner = preventDefault çağrılmadı
    expect(event).toBe(true)
  })

  it('değer varken temizle butonu görünür ve alanı boşaltır', () => {
    renderField({ defaultValue: 'focus' })
    const clear = screen.getByRole('button', { name: 'Temizle' })
    fireEvent.click(clear)
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('')
  })

  it('disabled iken input etkileşim almaz', () => {
    renderField({ disabled: true })
    expect((screen.getByRole('searchbox') as HTMLInputElement).disabled).toBe(true)
  })
})
