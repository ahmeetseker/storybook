import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassField } from './GlassField'
import { GlassInput } from '../GlassInput'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderField = (props: Partial<Parameters<typeof GlassField>[0]> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassField label="Fiyat" {...props}>
        <GlassInput />
      </GlassField>
    </GlassTierProvider>,
  )

describe('GlassField', () => {
  it('label, context üzerinden dağıtılan id ile kontrole bağlanır', () => {
    renderField()
    const input = screen.getByLabelText('Fiyat')
    expect(input.tagName).toBe('INPUT')
  })

  it('description kontrole aria-describedby ile bağlanır', () => {
    renderField({ description: 'TL cinsinden, noktasız girin' })
    const input = screen.getByLabelText('Fiyat')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.textContent).toBe('TL cinsinden, noktasız girin')
  })

  it('error varken description gizlenir, hata aria-live="polite" ile gösterilir ve kontrol invalid olur', () => {
    renderField({ description: 'TL cinsinden girin', error: 'Fiyat 0 olamaz' })
    expect(screen.queryByText('TL cinsinden girin')).toBeNull()
    const error = screen.getByText('Fiyat 0 olamaz')
    expect(error.getAttribute('aria-live')).toBe('polite')
    const input = screen.getByLabelText('Fiyat')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(error.id)
  })

  it('required iken label yanında dekoratif * işareti görünür', () => {
    renderField({ required: true })
    const star = screen.getByText('*')
    expect(star.getAttribute('aria-hidden')).toBe('true')
  })

  it('htmlFor verilirse üretilen id yerine o kullanılır', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassField label="Kilometre" htmlFor="km-input">
          <GlassInput />
        </GlassField>
      </GlassTierProvider>,
    )
    expect(screen.getByLabelText('Kilometre').id).toBe('km-input')
  })
})
