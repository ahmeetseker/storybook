import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('arama hero varyantı vurgulu başlığı, arama kartını ve istatistikleri gösterir', () => {
    render(<MapFirstHome showConceptNavigation={false} heroVariant="search" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Hayal ettiğin arsa seni bekliyor.' }),
    ).toBeDefined()
    expect(screen.getByRole('radiogroup', { name: 'İlan türü' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Konum' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Metrekare aralığı' })).toBeDefined()
    expect(screen.getByRole('button', { name: /İlanları Gör/ })).toBeDefined()
    expect(screen.getByText(/18\.412/)).toBeDefined()
    expect(screen.getByText('EİDS yetki kontrolü')).toBeDefined()
  })

  it('arama hero varyantında sekme değişince vurgulu kelime ve ikinci seçici değişir', () => {
    render(<MapFirstHome showConceptNavigation={false} heroVariant="search" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Konut' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Hayal ettiğin ev seni bekliyor.' }),
    ).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Oda sayısı' })).toBeDefined()
    expect(screen.queryByRole('combobox', { name: 'Metrekare aralığı' })).toBeNull()
  })

  it('footer üstü SEO rafı uzun kuyruk sayfalarını gerçek bağlantı olarak sunar', () => {
    render(<MapFirstHome showConceptNavigation={false} heroVariant="search" />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'En çok aranan arsa sayfaları' }),
    ).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'Tarım ve zeytinlik' })).toBeDefined()

    const ayvalik = screen.getByRole('link', {
      name: /Balıkesir Ayvalık'ta zeytinlik sahibi olun/,
    })
    // Yönlendirme atan /arsa-ara değil, doğrudan 200 dönen arama URL'i.
    expect(ayvalik.getAttribute('href')).toContain('/emlak?category=land')
    expect(ayvalik.getAttribute('href')).not.toContain('/arsa-ara')

    expect(
      screen.getByRole('link', { name: /Ankara yatırımlık arsa fırsatları/ }),
    ).toBeDefined()
    expect(
      screen.getByRole('link', { name: /Malatya'da satılık kayısı bahçesi/ }),
    ).toBeDefined()
    // Hub bağlantıları küme adıyla ayrışır — dördü de "Tümünü gör" olmaz.
    expect(
      screen.getByRole('link', { name: 'Tüm tarım arazisi sayfaları' }),
    ).toBeDefined()
  })

  it('footer üstündeki dönen şerit ilanları bağlantı olarak taşır ve duraklatılabilir', () => {
    render(<MapFirstHome showConceptNavigation={false} heroVariant="search" />)
    const strip = screen.getByRole('list', { name: 'Öne çıkan ilanlar' })
    const links = within(strip).getAllByRole('link')
    expect(links.length).toBeGreaterThan(4)
    expect(links[0].getAttribute('href')).toMatch(/\/ilan\/\d+$/)
    // Otomatik başlayan hareket durdurulabilir olmalı (WCAG 2.2.2).
    expect(screen.getByRole('button', { name: 'Şeridi duraklat' })).toBeDefined()
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
