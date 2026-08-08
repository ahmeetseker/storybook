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
    expect(screen.getByText('Son 7 gün').tagName).toBe('DD')
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

  describe('variant="gradient"', () => {
    const gradientItems: GlassMetricStripItem[] = [
      {
        id: 'listing',
        label: 'Aktif ilan',
        value: '48',
        hint: 'Ana sayfa portföyü',
        tone: 'accent',
        motif: 'parcels',
        action: { label: 'Portföyü gör', href: '/ilanlar' },
      },
      { id: 'region', label: 'Bölge', value: '8', tone: 'neutral' },
    ]

    it('dl/dt/dd semantiği gradient varyantında da korunur', () => {
      render(<GlassMetricStrip items={gradientItems} variant="gradient" label="Pazar özeti" />)
      const list = screen.getByLabelText('Pazar özeti')
      expect(list.tagName).toBe('DL')
      expect(screen.getByText('Aktif ilan').tagName).toBe('DT')
      expect(screen.getByText('48').closest('dd')).toBeTruthy()
    })

    it('action verilen metrik için bağlantı çizilir; görünür metin erişilebilir adın içindedir', () => {
      render(<GlassMetricStrip items={gradientItems} variant="gradient" />)
      const link = screen.getByRole('link', { name: 'Aktif ilan: Portföyü gör' })
      expect(link.getAttribute('href')).toBe('/ilanlar')
      // WCAG 2.5.3 — erişilebilir ad görünür etiketi içermeli
      expect(link.getAttribute('aria-label')).toContain('Portföyü gör')
      expect(link.textContent).toContain('Portföyü gör')
    })

    it('action verilmeyen metrikte bağlantı çizilmez', () => {
      render(<GlassMetricStrip items={gradientItems} variant="gradient" />)
      expect(screen.getAllByRole('link')).toHaveLength(1)
    })

    it('tone verilmezse neutral varsayılır', () => {
      const { container } = render(
        <GlassMetricStrip items={[{ id: 'x', label: 'Bölge', value: '8' }]} variant="gradient" />,
      )
      expect(container.querySelector('[data-tone="neutral"]')).toBeTruthy()
    })

    it('plain varyantta tone/motif/action okunmaz — mevcut tüketiciler etkilenmez', () => {
      const { container } = render(<GlassMetricStrip items={gradientItems} />)
      expect(screen.queryByRole('link')).toBeNull()
      expect(container.querySelector('[data-tone]')).toBeNull()
      expect(container.querySelector('svg')).toBeNull()
    })

    it('motif dekoratiftir — erişilebilirlik ağacından gizlenir', () => {
      const { container } = render(<GlassMetricStrip items={gradientItems} variant="gradient" />)
      const motif = container.querySelector('svg')
      expect(motif?.getAttribute('aria-hidden')).toBe('true')
    })
  })
})
