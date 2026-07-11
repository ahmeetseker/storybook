import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassNavbar } from './GlassNavbar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBar = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassNavbar title="Ayarlar" {...props} />
    </GlassTierProvider>,
  )

describe('GlassNavbar', () => {
  it('başlığı gösterir', () => {
    renderBar()
    expect(screen.getByText('Ayarlar')).toBeDefined()
  })

  it('onBack verilince geri butonu render olur ve çağrılır', () => {
    const onBack = vi.fn()
    renderBar({ onBack, backLabel: 'Geri' })
    fireEvent.click(screen.getByRole('button', { name: /Geri/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('onBack yokken geri butonu yok', () => {
    renderBar()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('actions paylaşımlı cam grupta render olur', () => {
    renderBar({ actions: <button>Paylaş</button> })
    expect(screen.getByRole('button', { name: 'Paylaş' })).toBeDefined()
    expect(document.querySelector('[data-glass-action-group]')).not.toBeNull()
  })

  it('navigation landmark kullanır', () => {
    renderBar()
    expect(screen.getByRole('navigation')).toBeDefined()
  })
})
