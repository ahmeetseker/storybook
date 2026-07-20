import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassMetricStrip } from './GlassMetricStrip'
import type { GlassMetricStripItem } from './GlassMetricStrip'

const items: GlassMetricStripItem[] = [
  { id: 'views', label: 'Görüntülenme', value: '12.480', change: '%12', trend: 'up', hint: 'Son 7 gün' },
  { id: 'leads', label: 'Talep', value: '318', change: '%4', trend: 'down' },
  { id: 'avg', label: 'Ortalama süre', value: '3g 4s', change: 'değişmedi', trend: 'steady' },
  { id: 'listings', label: 'Aktif ilan', value: '54' },
]

describe('GlassMetricStrip', () => {
  it('dl/dt/dd semantiğiyle ve erişilebilir adla render olur', () => {
    render(<GlassMetricStrip items={items} label="Portföy göstergeleri" />)
    const list = screen.getByLabelText('Portföy göstergeleri')
    expect(list.tagName).toBe('DL')
    expect(screen.getByText('Görüntülenme').tagName).toBe('DT')
    expect(screen.getByText('12.480').closest('dd')).toBeTruthy()
  })

  it('varsayılan erişilebilir ad "Temel göstergeler"dir', () => {
    render(<GlassMetricStrip items={items} />)
    expect(screen.getByLabelText('Temel göstergeler')).toBeTruthy()
  })

  it('trend yönünü renk dışında sr-only metinle iletir', () => {
    render(<GlassMetricStrip items={items} />)
    expect(screen.getByText('Yükseliş:')).toBeTruthy()
    expect(screen.getByText('Düşüş:')).toBeTruthy()
    expect(screen.getByText('Yatay:')).toBeTruthy()
  })

  it('change verilmeyen metrikte trend göstergesi çizilmez', () => {
    render(<GlassMetricStrip items={[{ id: 'x', label: 'Aktif ilan', value: '54' }]} />)
    expect(screen.queryByText('Yükseliş:')).toBeNull()
    expect(screen.queryByText('Düşüş:')).toBeNull()
    expect(screen.queryByText('Yatay:')).toBeNull()
  })

  it('trend verilmeden change verilirse yön "Yatay" olarak varsayılır', () => {
    render(<GlassMetricStrip items={[{ id: 'x', label: 'Talep', value: '10', change: '%1' }]} />)
    expect(screen.getByText('Yatay:')).toBeTruthy()
  })

  it('caller rest ile yönetilen aria-label ezilemez (rest önce yayılır)', () => {
    render(<GlassMetricStrip items={items} label="Doğru ad" aria-label="Yanlış ad" />)
    expect(screen.getByLabelText('Doğru ad')).toBeTruthy()
    expect(screen.queryByLabelText('Yanlış ad')).toBeNull()
  })
})
