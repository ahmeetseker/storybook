import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MapFirstHome } from './MapFirstHome'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, ...rest }: { children?: ReactNode }) => <a {...rest}>{children}</a>,
}))

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => {
      const instance = {
        setView: vi.fn(),
        remove: vi.fn(),
        invalidateSize: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        latLngToContainerPoint: vi.fn((coords: [number, number]) => ({ x: coords[1], y: coords[0] })),
      }
      instance.setView.mockReturnValue(instance)
      return instance
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  },
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

describe('MapFirstHome hero', () => {
  it('varsayılan olarak arsa sekmesini ve başlığını gösterir', () => {
    render(<MapFirstHome showConceptNavigation={false} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Önce haritada gör, sonra karar ver' }),
    ).toBeDefined()
    expect(screen.getByRole('radio', { name: 'Arsa' }).getAttribute('aria-checked')).toBe('true')
  })

  it('konut sekmesi başlığı, hızlı filtreleri ve sayacı değiştirir', () => {
    render(<MapFirstHome showConceptNavigation={false} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Konut' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Evi mahallesiyle birlikte gör' })).toBeDefined()
    // Not: 'konut' sekmesinde '3+1' hem hızlı filtre chip'inde hem de ayrıştırılmış
    // 'Oda' filtresinin değerinde geçiyor (bkz. heroTabs.ts) — getByText çift eşleşmede
    // patlar, bu yüzden getAllByText kullanılıyor.
    expect(screen.getAllByText('3+1').length).toBeGreaterThan(0)
    expect(screen.getByText(/42\.860/)).toBeDefined()
  })

  it('controlled tab değeri dışarıdan yönetilir', () => {
    const onTabChange = vi.fn()
    render(<MapFirstHome showConceptNavigation={false} tab="proje" onTabChange={onTabChange} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Teslim tarihinden önce yerini seç' })).toBeDefined()
    fireEvent.click(screen.getByRole('radio', { name: 'Arsa' }))
    expect(onTabChange).toHaveBeenCalledWith('arsa')
    // controlled: prop değişmeden başlık değişmez
    expect(screen.getByRole('heading', { level: 1, name: 'Teslim tarihinden önce yerini seç' })).toBeDefined()
  })

  it('AI çıkarım chipi kaldırılınca listeden çıkar', () => {
    render(<MapFirstHome showConceptNavigation={false} />)
    expect(screen.getByText('Urla')).toBeDefined()
    // Not: GlassAiSearchBar kaldırma butonunun erişilebilir adı `Kaldır` değil,
    // `Filtreyi kaldır: ${filter.label}: ${filter.value}` biçiminde (bkz. GlassAiSearchBar.tsx).
    const remove = screen.getByRole('button', { name: 'Filtreyi kaldır: Bölge: Urla' })
    fireEvent.click(remove)
    expect(screen.queryByText('Urla')).toBeNull()
  })
})
