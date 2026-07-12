import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassLocationCard } from './GlassLocationCard'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

describe('GlassLocationCard', () => {
  it('adres ve notu render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassLocationCard address="İstanbul, Kadıköy" note="Konum yaklaşıktır" />
      </GlassTierProvider>,
    )
    expect(screen.getByText('İstanbul, Kadıköy')).toBeDefined()
    expect(screen.getByText('Konum yaklaşıktır')).toBeDefined()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('onOpenMap verilince "Haritada Aç" çalışır', () => {
    const onOpenMap = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassLocationCard address="İstanbul" onOpenMap={onOpenMap} />
      </GlassTierProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Haritada Aç' }))
    expect(onOpenMap).toHaveBeenCalledTimes(1)
  })
})
