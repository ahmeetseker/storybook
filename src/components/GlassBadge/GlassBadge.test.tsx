import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassBadge } from './GlassBadge'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBadge = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassBadge {...props}>Acil</GlassBadge>
    </GlassTierProvider>,
  )

describe('GlassBadge', () => {
  it('içeriğiyle render olur', () => {
    renderBadge()
    expect(screen.getByText('Acil')).toBeDefined()
  })

  it('tint verilince CSS değişkeni olarak uygulanır', () => {
    renderBadge({ tint: '#ff453a', 'data-testid': 'badge' })
    expect(screen.getByTestId('badge').style.getPropertyValue('--glass-tint')).toBe('#ff453a')
  })

  it('boyut sınıfı uygulanır', () => {
    renderBadge({ size: 'md', 'data-testid': 'badge' })
    expect(screen.getByTestId('badge').className).toMatch(/md/)
  })
})
