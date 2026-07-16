import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSelect, type GlassSelectOption } from './GlassSelect'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const options: GlassSelectOption[] = [
  { value: 'manuel', label: 'Manuel' },
  { value: 'otomatik', label: 'Otomatik' },
  { value: 'yarim', label: 'Yarı Otomatik', disabled: true },
]

const renderSelect = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSelect aria-label="Vites" options={options} placeholder="Vites seçin" {...props} />
    </GlassTierProvider>,
  )

const trigger = () => screen.getByRole('combobox')

describe('GlassSelect', () => {
  it('combobox rolüyle render olur; placeholder görünür; tıklayınca listbox açılır', () => {
    renderSelect()
    const button = trigger()
    expect(button.textContent).toContain('Vites seçin')
    expect(button.getAttribute('aria-haspopup')).toBe('listbox')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('seçenek tıklanınca onChange değerle çağrılır, etiket trigger\'a yazılır ve panel kapanır', () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    fireEvent.click(trigger())
    fireEvent.click(screen.getByRole('option', { name: 'Otomatik' }))
    expect(onChange).toHaveBeenCalledWith('otomatik')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().textContent).toContain('Otomatik')
  })

  it('klavye: ArrowDown açar, ArrowDown gezer, Enter seçer; aria-activedescendant izler', () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    const button = trigger()
    fireEvent.keyDown(button, { key: 'ArrowDown' })
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.getAttribute('aria-activedescendant')).toBeTruthy()
    fireEvent.keyDown(button, { key: 'ArrowDown' })
    const activeId = button.getAttribute('aria-activedescendant')!
    expect(document.getElementById(activeId)?.textContent).toContain('Otomatik')
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('otomatik')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('Escape paneli kapatır', () => {
    renderSelect()
    const button = trigger()
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('disabled iken panel açılmaz', () => {
    renderSelect({ disabled: true })
    fireEvent.click(trigger())
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('disabled seçenek klavyede atlanır ve tıklansa da seçilmez', () => {
    const onChange = vi.fn()
    renderSelect({ onChange, defaultValue: 'otomatik' })
    const button = trigger()
    fireEvent.keyDown(button, { key: 'ArrowDown' }) // açılır, aktif = Otomatik (seçili)
    fireEvent.keyDown(button, { key: 'ArrowDown' }) // Yarı Otomatik disabled → Manuel'e sarar
    const activeId = button.getAttribute('aria-activedescendant')!
    expect(document.getElementById(activeId)?.textContent).toContain('Manuel')
    fireEvent.click(screen.getByRole('option', { name: 'Yarı Otomatik' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('typeahead: kapalıyken yazınca ilk eşleşen doğrudan seçilir', () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    fireEvent.keyDown(trigger(), { key: 'o' })
    expect(onChange).toHaveBeenCalledWith('otomatik')
    expect(trigger().textContent).toContain('Otomatik')
  })

  it('invalid iken trigger aria-invalid alır', () => {
    renderSelect({ invalid: true })
    expect(trigger().getAttribute('aria-invalid')).toBe('true')
  })

  it('controlled: value prop\'u dışarıdan yönetilir, iç state devreye girmez', () => {
    const onChange = vi.fn()
    renderSelect({ value: 'manuel', onChange })
    expect(trigger().textContent).toContain('Manuel')
    fireEvent.click(trigger())
    fireEvent.click(screen.getByRole('option', { name: 'Otomatik' }))
    expect(onChange).toHaveBeenCalledWith('otomatik')
    // value değişmediği için etiket Manuel kalır (kontrol dışarıda)
    expect(trigger().textContent).toContain('Manuel')
  })
})
