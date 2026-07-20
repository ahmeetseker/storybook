import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexCarousel,
  CodexFloorPlanViewer,
  CodexGallery,
  CodexMap,
  CodexMediaGallery,
  CodexNearbyPlaces,
  CodexPhotoFeatureOverlay,
} from './index'
import {
  carouselItems,
  floorPlans,
  galleryItems,
  mapMarkers,
  nearbyPlaces,
  photoFeatures,
} from './CodexMedia.stories.fixtures'

describe('Codex enterprise medya ve harita bileşenleri', () => {
  it('Gallery seçimi düğme ve klavye ile değiştirir, canlı açıklamayı günceller', () => {
    const onSelectedChange = vi.fn()
    render(<CodexGallery items={galleryItems.slice(0, 3)} onSelectedChange={onSelectedChange} />)

    const gallery = screen.getByRole('region', { name: 'İlan galerisi' })
    expect(within(gallery).getByRole('img', { name: galleryItems[0].alt })).toBeTruthy()
    fireEvent.click(within(gallery).getByRole('button', { name: /2\. medyayı aç/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(galleryItems[1])
    expect(within(gallery).getByRole('img', { name: galleryItems[1].alt })).toBeTruthy()

    fireEvent.keyDown(gallery, { key: 'End' })
    expect(onSelectedChange).toHaveBeenLastCalledWith(galleryItems[2])
    expect(within(gallery).getByText(`3 / 3: ${galleryItems[2].alt}`)).toBeTruthy()
  })

  it('MediaGallery sekmeleri ok tuşuyla değiştirir ve tür panelini filtreler', () => {
    const onFilterChange = vi.fn()
    render(<CodexMediaGallery items={galleryItems} onFilterChange={onFilterChange} />)

    const allTab = screen.getByRole('tab', { name: /Tümü/ })
    fireEvent.keyDown(allTab, { key: 'ArrowRight' })
    const imageTab = screen.getByRole('tab', { name: /Fotoğraflar/ })
    expect(imageTab.getAttribute('aria-selected')).toBe('true')
    expect(onFilterChange).toHaveBeenCalledWith('image')
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toContain('image-tab')
  })

  it('Carousel aktif slaytı kontroller, kart seçimi ve ok tuşlarıyla yönetir', () => {
    const onActiveChange = vi.fn()
    const onItemSelect = vi.fn()
    render(<CodexCarousel items={carouselItems.slice(0, 4)} onActiveChange={onActiveChange} onItemSelect={onItemSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sonraki kart' }))
    expect(onActiveChange).toHaveBeenLastCalledWith(carouselItems[1])
    const secondCard = screen.getByRole('button', { name: /Ana salon/ })
    expect(secondCard.getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(secondCard, { key: 'End' })
    expect(onActiveChange).toHaveBeenLastCalledWith(carouselItems[3])
    fireEvent.click(screen.getByRole('button', { name: /Üst teras/ }))
    expect(onItemSelect).toHaveBeenCalledWith(carouselItems[3])
  })

  it('Map seçili pini, görünümü, zoomu ve pin klavye sırasını açıklar', () => {
    const onMarkerSelect = vi.fn()
    const onViewChange = vi.fn()
    const onZoomChange = vi.fn()
    render(
      <CodexMap
        markers={mapMarkers}
        onMarkerSelect={onMarkerSelect}
        onViewChange={onViewChange}
        onZoomChange={onZoomChange}
        privacyCircle={{ label: 'Yaklaşık alan.' }}
      />,
    )

    const healthPin = screen.getByRole('button', { name: /Sağlık: Aile Sağlığı Merkezi/ })
    fireEvent.click(healthPin)
    expect(healthPin.getAttribute('aria-pressed')).toBe('true')
    expect(onMarkerSelect).toHaveBeenLastCalledWith(mapMarkers[4])
    fireEvent.keyDown(healthPin, { key: 'ArrowRight' })
    expect(onMarkerSelect).toHaveBeenLastCalledWith(mapMarkers[5])
    fireEvent.click(screen.getByRole('button', { name: 'Uydu' }))
    expect(onViewChange).toHaveBeenCalledWith('satellite')
    fireEvent.click(screen.getByRole('button', { name: 'Yakınlaştır' }))
    expect(onZoomChange).toHaveBeenCalledWith(14)
    expect(screen.getByText(/Yaklaşık alan/)).toBeTruthy()
  })

  it('NearbyPlaces kategori, sıralama, seçim ve dikey klavye gezinmesini iletir', () => {
    const onCategoryChange = vi.fn()
    const onSortChange = vi.fn()
    const onPlaceSelect = vi.fn()
    render(
      <CodexNearbyPlaces
        places={nearbyPlaces}
        onCategoryChange={onCategoryChange}
        onSortChange={onSortChange}
        onPlaceSelect={onPlaceSelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Ulaşım1/ }))
    expect(onCategoryChange).toHaveBeenCalledWith('transport')
    fireEvent.change(screen.getByRole('combobox', { name: 'Sırala' }), { target: { value: 'drive' } })
    expect(onSortChange).toHaveBeenCalledWith('drive')
    const stop = screen.getByRole('button', { name: /Merkez dolmuş durağı/ })
    fireEvent.click(stop)
    expect(onPlaceSelect).toHaveBeenCalledWith(nearbyPlaces[1])
    fireEvent.keyDown(stop, { key: 'Home' })
    expect(onPlaceSelect).toHaveBeenLastCalledWith(nearbyPlaces[1])
  })

  it('FloorPlanViewer kat ve oda sekmelerini, zoom ve dönüş durumunu çalıştırır', () => {
    const onFloorChange = vi.fn()
    const onRoomSelect = vi.fn()
    const onZoomChange = vi.fn()
    const onRotationChange = vi.fn()
    render(
      <CodexFloorPlanViewer
        floors={floorPlans}
        onFloorChange={onFloorChange}
        onRoomSelect={onRoomSelect}
        onZoomChange={onZoomChange}
        onRotationChange={onRotationChange}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: /Üst kat/ }))
    expect(onFloorChange).toHaveBeenCalledWith(floorPlans[1])
    const master = screen.getByRole('button', { name: /Ana yatak, 24 m²/ })
    fireEvent.click(master)
    expect(onRoomSelect).toHaveBeenCalledWith(floorPlans[1].rooms[0], floorPlans[1])
    fireEvent.keyDown(master, { key: 'ArrowRight' })
    expect(onRoomSelect).toHaveBeenLastCalledWith(floorPlans[1].rooms[1], floorPlans[1])
    fireEvent.click(screen.getByRole('button', { name: 'Planı yakınlaştır' }))
    expect(onZoomChange).toHaveBeenCalledWith(110)
    fireEvent.click(screen.getByRole('button', { name: /Planı döndür/ }))
    expect(onRotationChange).toHaveBeenCalledWith(90)
  })

  it('PhotoFeatureOverlay işaret ile listeyi eşler ve güveni erişilebilir meter olarak sunar', () => {
    const onFeatureSelect = vi.fn()
    render(
      <CodexPhotoFeatureOverlay
        media={galleryItems[0]}
        features={photoFeatures}
        onFeatureSelect={onFeatureSelect}
      />,
    )

    const roofMarker = screen.getByRole('button', { name: '3. işaret: Çatı birleşimi' })
    fireEvent.click(roofMarker)
    expect(roofMarker.getAttribute('aria-pressed')).toBe('true')
    expect(onFeatureSelect).toHaveBeenLastCalledWith(photoFeatures[2])
    expect(screen.getByRole('meter', { name: 'Çatı birleşimi güveni' }).getAttribute('aria-valuenow')).toBe('72')
    fireEvent.keyDown(roofMarker, { key: 'End' })
    expect(onFeatureSelect).toHaveBeenLastCalledWith(photoFeatures[3])
  })

  it('yükleme, boş ve hata durumlarını doğru canlı bölge rolleriyle ayırır', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<CodexGallery items={[]} status="loading" />)
    expect(screen.getByRole('status', { name: 'Medya yükleniyor' }).getAttribute('aria-busy')).toBe('true')

    rerender(<CodexGallery items={[]} status="empty" />)
    expect(screen.getByRole('status').textContent).toContain('Henüz medya eklenmedi')

    rerender(<CodexGallery items={[]} status="error" onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain('Medya görüntülenemedi')
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('RTL bağlamında doğal DOM sırasını ve etkin seçim sözleşmesini korur', () => {
    render(<div dir="rtl"><CodexGallery items={galleryItems.slice(0, 2)} /></div>)
    const next = screen.getByRole('button', { name: 'Sonraki medya' })
    fireEvent.click(next)
    expect(screen.getByRole('button', { name: /2\. medyayı aç/ }).getAttribute('aria-pressed')).toBe('true')
  })
})
