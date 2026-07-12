import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassBreadcrumb } from './GlassBreadcrumb'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

describe('GlassBreadcrumb', () => {
  it('ara öğeler tıklanabilir, son öğe sayfa olarak işaretlenir', () => {
    const onClick = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb
          items={[{ label: 'Vasıta', onClick }, { label: 'Otomobil', onClick: vi.fn() }, { label: 'Golf' }]}
        />
      </GlassTierProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Vasıta' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    const current = screen.getByText('Golf')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.tagName).toBe('SPAN')
  })

  it('navigation landmark olarak render olur', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb items={[{ label: 'Emlak' }]} />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('navigation', { name: 'Kategori yolu' })).toBeDefined()
  })
})
