import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { CodexMarketplacePage } from './index'

describe('CodexMarketplacePage', () => {
  it('workspace yönü arama, filtre landmark’ı ve pressed görünüm seçimini birleştirir', () => {
    const { container } = render(<CodexMarketplacePage variant="workspace" />)

    expect(container.querySelector('[data-page-variant="workspace"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Aradığınız parseli veriye bakarak seçin.', level: 1 })).toBeTruthy()
    expect(screen.getByRole('search')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'İlan ara' })).toBeTruthy()
    expect(screen.getByRole('complementary', { name: 'Aramayı daralt' })).toBeTruthy()

    const activeFilters = screen.getByLabelText('Aktif filtreler')
    fireEvent.click(within(activeFilters).getByRole('button', { name: 'İzmir' }))
    expect(within(activeFilters).queryByRole('button', { name: 'İzmir' })).toBeNull()
    fireEvent.click(within(activeFilters).getByRole('button', { name: '+ Müstakil tapu ekle' }))
    expect(within(activeFilters).getByRole('button', { name: 'Müstakil tapu' }).getAttribute('aria-pressed')).toBe('true')

    const viewGroup = screen.getByRole('group', { name: 'Sonuç görünümü' })
    const cardView = within(viewGroup).getByRole('button', { name: 'Kart' })
    const mapView = within(viewGroup).getByRole('button', { name: 'Harita' })
    expect(cardView.getAttribute('aria-pressed')).toBe('true')
    expect(mapView.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(mapView)
    expect(mapView.getAttribute('aria-pressed')).toBe('true')
    expect(
      screen.getByRole('region', { name: 'İzmir ve çevresindeki temsili ilan haritası' }),
    ).toBeTruthy()
  })

  it('editorial yön featured ilan aksiyonunu ve bölge özetini semantik tutar', () => {
    const { container } = render(<CodexMarketplacePage variant="editorial" />)

    expect(container.querySelector('[data-page-variant="editorial"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Toprağı yalnız metrekaresiyle ölçmeyin.', level: 1 })).toBeTruthy()
    expect(screen.getByLabelText('Bölge özeti')).toBeTruthy()

    const featuredTitle = screen.getByRole('heading', {
      name: 'Urla’nın gelişim aksında, okunaklı bir köşe parsel',
      level: 3,
    })
    const featuredCard = featuredTitle.closest('article')
    expect(featuredCard).not.toBeNull()
    const favorite = within(featuredCard as HTMLElement).getByRole('button', { name: 'Favorilere ekle' })
    fireEvent.click(favorite)
    expect(within(featuredCard as HTMLElement).getByRole('button', { name: 'Favorilerden çıkar' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Fiyat artışı yavaşladı/, level: 2 })).toBeTruthy()
  })

  it('intelligence yön gerçek Tabs ilişkisiyle görünüm ve panel değiştirir', () => {
    const { container } = render(<CodexMarketplacePage variant="intelligence" />)

    expect(container.querySelector('[data-page-variant="intelligence"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Sinyaller', level: 1 })).toBeTruthy()
    const tablist = screen.getByRole('tablist', { name: 'Piyasa görünümü' })
    const signals = within(tablist).getByRole('tab', { name: 'Sinyaller' })
    const comparables = within(tablist).getByRole('tab', { name: 'Emsaller' })
    expect(signals.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'Sinyaller' }).hidden).toBe(false)
    expect(screen.getByRole('complementary', { name: 'Piyasa özeti' })).toBeTruthy()

    const map = screen.getByRole('region', { name: 'İzmir ve çevresindeki temsili ilan haritası' })
    const urlaPin = within(map).getByRole('button', { name: 'Urla, 4,25 milyon TL fiyatındaki ilanları göster' })
    const guzelbahcePin = within(map).getByRole('button', { name: 'Güzelbahçe, 3,10 milyon TL fiyatındaki ilanları göster' })
    expect(urlaPin.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(guzelbahcePin)
    expect(guzelbahcePin.getAttribute('aria-pressed')).toBe('true')
    expect(within(map).getByText('Güzelbahçe seçili')).toBeTruthy()

    fireEvent.click(comparables)
    expect(comparables.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'Emsaller' }).hidden).toBe(false)
    expect(screen.getByRole('heading', { name: 'Urla emsal özeti', level: 2 })).toBeTruthy()
  })
})
