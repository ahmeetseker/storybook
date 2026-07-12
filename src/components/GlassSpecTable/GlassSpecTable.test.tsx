import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassSpecTable } from './GlassSpecTable'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const items = [
  { label: 'Yıl', value: '2019' },
  { label: 'Kilometre', value: '87.500 km' },
]

describe('GlassSpecTable', () => {
  it('etiket/değer çiftlerini render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSpecTable items={items} />
      </GlassTierProvider>,
    )
    expect(screen.getByText('Yıl')).toBeDefined()
    expect(screen.getByText('87.500 km')).toBeDefined()
  })

  it('başlık verilince gösterir', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSpecTable items={items} title="İlan Bilgileri" />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('heading', { name: 'İlan Bilgileri' })).toBeDefined()
  })

  it('iki sütun sınıfı uygulanır', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassSpecTable items={items} columns={2} />
      </GlassTierProvider>,
    )
    expect(container.querySelector('dl')?.className).toMatch(/twoColumns/)
  })
})
