import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassMap, type GlassMapPin } from './GlassMap'

const basemapInstance = {
  setView: vi.fn(),
  fitBounds: vi.fn(),
  flyToBounds: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  getZoom: vi.fn(() => 6),
  getMaxZoom: vi.fn(() => 19),
  latLngToContainerPoint: vi.fn((coords: [number, number]) => ({ x: coords[1], y: coords[0] })),
}

// Ayrı bir değişkende tutulur ki regresyon testi zemin kurulumunu (`L.map`)
// bir kerelik throw ettirip `useBasemap`'in error dalını tetikleyebilsin.
const leafletMapMock = vi.fn(() => {
  basemapInstance.setView.mockReturnValue(basemapInstance)
  return basemapInstance
})

// Son oluşturulan tile layer'ı yakalar — Bulgu 1 regresyon testi (Yol/Uydu
// gerçekten `setUrl` çağırıp çağırmadığını) bununla doğrular.
const tileLayerInstance = { addTo: vi.fn(), setUrl: vi.fn() }
const leafletTileLayerMock = vi.fn(() => tileLayerInstance)

vi.mock('leaflet', () => ({
  default: {
    map: leafletMapMock,
    tileLayer: leafletTileLayerMock,
  },
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

const basemap = {
  tileUrl: 'https://tile.example/{z}/{x}/{y}.png',
  attribution: <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>,
  center: [39, 35.2] as [number, number],
  zoom: 6,
}

const pins: GlassMapPin[] = [
  { id: 'p1', x: 0.2, y: 0.3, price: '4.250.000 TL' },
  { id: 'p2', x: 0.5, y: 0.5, price: '1.850.000 TL' },
  { id: 'p3', x: 0.8, y: 0.6, count: 12 },
]

describe('GlassMap', () => {
  it('fiyat ve cluster pinlerini gerçek buton olarak render eder', () => {
    render(<GlassMap pins={pins} />)
    expect(screen.getByRole('button', { name: '4.250.000 TL' })).toBeDefined()
    expect(screen.getByRole('button', { name: '1.850.000 TL' })).toBeDefined()
    expect(screen.getByRole('button', { name: '12 ilan' })).toBeDefined()
  })

  it('pine tıklamak seçer (uncontrolled) ve popup içeriğini gösterir', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(pin)
    expect(pin.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Detay: p1')).toBeDefined()
  })

  it('seçili pine tekrar tıklamak seçimi kaldırır', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="p1" />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    expect(pin.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(pin)
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByText('Detay: p1')).toBeNull()
  })

  it('controlled: selectedId dışarıdan yönetilir, tıklama onPinSelect döner', () => {
    const onPinSelect = vi.fn()
    const { rerender } = render(<GlassMap pins={pins} selectedId="p2" onPinSelect={onPinSelect} />)
    const p1 = screen.getByRole('button', { name: '4.250.000 TL' })
    const p2 = screen.getByRole('button', { name: '1.850.000 TL' })
    expect(p2.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(p1)
    expect(onPinSelect).toHaveBeenCalledWith('p1')
    // dışarıdan prop güncellenmeden iç görsel durum değişmez (controlled)
    expect(p1.getAttribute('aria-pressed')).toBe('false')
    rerender(<GlassMap pins={pins} selectedId="p1" onPinSelect={onPinSelect} />)
    expect(p1.getAttribute('aria-pressed')).toBe('true')
  })

  it('katman toggle: varsayılan yol, Uydu tıklanınca data-layer değişir ve onLayerChange çağrılır', () => {
    const onLayerChange = vi.fn()
    const { container } = render(<GlassMap pins={pins} onLayerChange={onLayerChange} />)
    expect(container.querySelector('[data-layer="yol"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Uydu' }))
    expect(onLayerChange).toHaveBeenCalledWith('uydu')
    expect(container.querySelector('[data-layer="uydu"]')).not.toBeNull()
  })

  it('privacyCircle verilince svg circle render eder', () => {
    const { container } = render(<GlassMap pins={[]} privacyCircle={{ x: 0.5, y: 0.5, r: 0.2 }} />)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('Escape tuşu seçimi kaldırır', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="p1" />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    fireEvent.keyDown(pin, { key: 'Escape' })
    expect(pin.getAttribute('aria-pressed')).toBe('false')
  })

  it('ok tuşu ile pinler arasında klavye gezinmesi yapılır', () => {
    render(<GlassMap pins={pins} />)
    const p1 = screen.getByRole('button', { name: '4.250.000 TL' })
    const p2 = screen.getByRole('button', { name: '1.850.000 TL' })
    p1.focus()
    fireEvent.keyDown(p1, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(p2)
  })

  it('aynı seed her render için deterministik sokak dokusu üretir (Math.random kullanılmaz)', () => {
    const a = render(<GlassMap pins={[]} seed="sabit-42" />)
    const roadsA = a.container.querySelectorAll('svg line').length
    const blocksA = a.container.querySelectorAll('svg rect').length
    a.unmount()
    const b = render(<GlassMap pins={[]} seed="sabit-42" />)
    const roadsB = b.container.querySelectorAll('svg line').length
    const blocksB = b.container.querySelectorAll('svg rect').length
    expect(roadsA).toBe(roadsB)
    expect(blocksA).toBe(blocksB)
    expect(roadsA).toBeGreaterThan(0)
  })

  it('controlled: selectedId null geçişi eski iç seçimi geri getirmez', () => {
    const onPinSelect = vi.fn()
    const { rerender } = render(
      <GlassMap pins={pins} selectedId="p1" onPinSelect={onPinSelect} popupContent={(id) => `Detay: ${id}`} />,
    )
    const p1 = screen.getByRole('button', { name: '4.250.000 TL' })
    expect(p1.getAttribute('aria-pressed')).toBe('true')
    // parent seçimi temizler: selectedId=null (controlled BOŞ seçim)
    rerender(<GlassMap pins={pins} selectedId={null} onPinSelect={onPinSelect} popupContent={(id) => `Detay: ${id}`} />)
    expect(p1.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByText('Detay: p1')).toBeNull()
    // p1'e tıklamak eski iç seçimi "geri getirmez" — hâlâ controlled, yalnız onPinSelect döner
    fireEvent.click(p1)
    expect(onPinSelect).toHaveBeenCalledWith('p1')
    expect(p1.getAttribute('aria-pressed')).toBe('false')
  })

  it('finite olmayan/aralık dışı pin koordinatları render edilmez (harita dışında etkileşimli pin üretilmez)', () => {
    const badPins: GlassMapPin[] = [
      { id: 'nan', x: Number.NaN, y: 0.5, price: '1.000.000 TL' },
      { id: 'inf', x: 0.5, y: Number.POSITIVE_INFINITY, price: '2.000.000 TL' },
      { id: 'ok', x: 0.5, y: 0.5, price: '3.000.000 TL' },
    ]
    render(<GlassMap pins={badPins} />)
    expect(screen.queryByRole('button', { name: '1.000.000 TL' })).toBeNull()
    expect(screen.queryByRole('button', { name: '2.000.000 TL' })).toBeNull()
    expect(screen.getByRole('button', { name: '3.000.000 TL' })).toBeDefined()
  })

  it('aralık dışı (0-1 dışı ama finite) pin koordinatları 0-1 aralığına kenetlenir', () => {
    const clampPins: GlassMapPin[] = [{ id: 'over', x: 4, y: -2, price: '9.000.000 TL' }]
    const { container } = render(<GlassMap pins={clampPins} />)
    const wrap = container.querySelector('[style*="left"]') as HTMLElement | null
    expect(wrap).not.toBeNull()
    expect(wrap?.style.left).toBe('100%')
    expect(wrap?.style.top).toBe('0%')
  })

  it('finite olmayan privacyCircle koordinatları render edilmez', () => {
    const { container } = render(
      <GlassMap pins={[]} privacyCircle={{ x: Number.NaN, y: 0.5, r: 0.2 }} />,
    )
    expect(container.querySelector('circle')).toBeNull()
  })

  it('panel varyantı data-variant ile işaretlenir', () => {
    const { container } = render(<GlassMap pins={pins} variant="panel" />)
    expect(container.querySelector('[data-variant="panel"]')).not.toBeNull()
  })

  it('katman toggle radiogroup deseni: roving tabindex + ok tuşuyla Yol/Uydu arası odak taşır', () => {
    render(<GlassMap pins={[]} />)
    const yol = screen.getByRole('radio', { name: 'Yol' })
    const uydu = screen.getByRole('radio', { name: 'Uydu' })
    // yalnız seçili segment Tab durağı
    expect(yol.getAttribute('tabindex')).toBe('0')
    expect(uydu.getAttribute('tabindex')).toBe('-1')
    yol.focus()
    fireEvent.keyDown(yol, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(uydu)
    expect(uydu.getAttribute('aria-checked')).toBe('true')
    expect(uydu.getAttribute('tabindex')).toBe('0')
    expect(yol.getAttribute('tabindex')).toBe('-1')
    fireEvent.keyDown(uydu, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(yol)
    expect(yol.getAttribute('aria-checked')).toBe('true')
  })

  it('üst kenara yakın pinde popup aşağı açılır, sol/sağ kenarda kenara hizalanır (kırpılıp kaybolmaz)', () => {
    const top: GlassMapPin = { id: 'top', x: 0.5, y: 0.05, price: '3.000.000 TL' }
    const left: GlassMapPin = { id: 'left', x: 0.05, y: 0.5, price: '2.000.000 TL' }
    const right: GlassMapPin = { id: 'right', x: 0.95, y: 0.5, price: '5.000.000 TL' }

    const topRender = render(
      <GlassMap pins={[top]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="top" />,
    )
    const topPopup = topRender.container.querySelector('[data-vertical]')
    expect(topPopup?.getAttribute('data-vertical')).toBe('below')
    expect(topPopup?.getAttribute('data-align')).toBe('center')
    expect(topRender.getByText('Detay: top')).toBeDefined()
    topRender.unmount()

    const leftRender = render(
      <GlassMap pins={[left]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="left" />,
    )
    expect(leftRender.container.querySelector('[data-align]')?.getAttribute('data-align')).toBe('start')
    leftRender.unmount()

    const rightRender = render(
      <GlassMap pins={[right]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="right" />,
    )
    expect(rightRender.container.querySelector('[data-align]')?.getAttribute('data-align')).toBe('end')
  })

  it('basemap verilmezse mevcut SVG zemini korunur', () => {
    const { container } = render(<GlassMap pins={pins} />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('[data-basemap]')).toBeNull()
  })

  it('basemap verilince tile katmanı render edilir ve atıf görünür', async () => {
    render(
      <GlassMap
        pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]}
        basemap={basemap}
      />,
    )
    await waitFor(() => expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toBeDefined())
  })

  it('basemap modunda pin konumu piksel olarak yazılır', async () => {
    render(
      <GlassMap
        pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]}
        basemap={basemap}
      />,
    )
    const pin = await screen.findByRole('button', { name: '4.250.000 TL' })
    const wrap = pin.parentElement as HTMLElement
    await waitFor(() => expect(wrap.style.left).toBe('26.7px'))
    expect(wrap.style.top).toBe('38.3px')
  })

  it('basemap modunda lat/lng olmayan pin render edilmez', async () => {
    render(
      <GlassMap
        pins={[
          { id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' },
          { id: 'eksik', price: '1.000.000 TL' },
        ]}
        basemap={basemap}
      />,
    )
    await screen.findByRole('button', { name: '4.250.000 TL' })
    expect(screen.queryByRole('button', { name: '1.000.000 TL' })).toBeNull()
  })

  it('zoom kontrolleri erişilebilir ad taşır ve haritayı yakınlaştırır', async () => {
    render(<GlassMap pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]} basemap={basemap} />)
    const zoomIn = await screen.findByRole('button', { name: 'Yakınlaştır' })
    fireEvent.click(zoomIn)
    expect(basemapInstance.zoomIn).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Uzaklaştır' }))
    expect(basemapInstance.zoomOut).toHaveBeenCalled()
  })

  it('Leaflet kurulumunda kendi klavye tutamacı kapalıdır (GlassMap kendi pin gezinmesini kullanır)', async () => {
    render(<GlassMap pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]} basemap={basemap} />)
    await screen.findByRole('button', { name: '4.250.000 TL' })
    expect(leafletMapMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ keyboard: false }),
    )
  })

  it('zemin yüklenemezse ve pinde x/y de varsa, pin yüzde konumla render edilmeye devam eder', async () => {
    leafletMapMock.mockImplementationOnce(() => {
      throw new Error('Leaflet başlatılamadı')
    })
    render(
      <GlassMap
        pins={[{ id: 'urla', lat: 38.3, lng: 26.7, x: 0.2, y: 0.3, price: '4.250.000 TL' }]}
        basemap={basemap}
      />,
    )
    const pin = await screen.findByRole('button', { name: '4.250.000 TL' })
    const wrap = pin.parentElement as HTMLElement
    await waitFor(() => expect(wrap.style.left).toBe('20%'))
    expect(wrap.style.top).toBe('30%')
  })

  it('zemin yüklenemezse ve pinde yalnız lat/lng varsa (x/y yok), pin render edilmez', async () => {
    leafletMapMock.mockImplementationOnce(() => {
      throw new Error('Leaflet başlatılamadı')
    })
    render(
      <GlassMap
        pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]}
        basemap={basemap}
      />,
    )
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined())
    expect(screen.queryByRole('button', { name: '4.250.000 TL' })).toBeNull()
  })

  // Zemin ÇALIŞIRKEN x/y'ye düşmek, harita kaydırılınca pini zeminden koparıp
  // sabit bir noktada gösterirdi (kullanıcı bildirimi). Projeksiyondan elenen
  // pin, x/y'si olsa bile çizilmemeli.
  it('zemin çalışırken projeksiyondan elenen pin, x/y verilmiş olsa bile render edilmez', async () => {
    // Konteyner boyutu jsdom'da 0 olduğu için eleme hook içinde atlanır;
    // burada projeksiyonun o pini hiç üretmediği durumu taklit ediyoruz.
    basemapInstance.latLngToContainerPoint.mockImplementation((coords: [number, number]) => {
      if (coords[0] === 99) return { x: Number.NaN, y: Number.NaN }
      return { x: coords[1], y: coords[0] }
    })
    render(
      <GlassMap
        pins={[
          { id: 'gorunen', lat: 38.3, lng: 26.7, x: 0.2, y: 0.3, price: '4.250.000 TL' },
          { id: 'elenen', lat: 99, lng: 99, x: 0.8, y: 0.8, price: '9.999.999 TL' },
        ]}
        basemap={basemap}
      />,
    )
    await screen.findByRole('button', { name: '4.250.000 TL' })
    expect(screen.queryByRole('button', { name: '9.999.999 TL' })).toBeNull()
  })

  // ── Bulgu 1 (task-9 review): satelliteTileUrl verilmeden gerçek bir şey
  // değiştirmeyen Yol/Uydu toggle'ı kullanıcıyı yanıltmasın diye basemap
  // modunda yalnız `satelliteTileUrl` verildiğinde render edilir. ──

  it('basemap satelliteTileUrl olmadan verilince katman toggle render edilmez (yanıltıcı kontrol gösterilmez)', async () => {
    render(
      <GlassMap pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]} basemap={basemap} />,
    )
    await screen.findByRole('button', { name: '4.250.000 TL' })
    expect(screen.queryByRole('radiogroup', { name: 'Harita katmanı' })).toBeNull()
    expect(screen.queryByRole('radio', { name: 'Uydu' })).toBeNull()
  })

  it('basemap satelliteTileUrl VERİLİNCE katman toggle görünür ve gerçekten tile katmanını değiştirir', async () => {
    const basemapWithSatellite = { ...basemap, satelliteTileUrl: 'https://sat.example/{z}/{x}/{y}.png' }
    render(
      <GlassMap pins={[{ id: 'urla', lat: 38.3, lng: 26.7, price: '4.250.000 TL' }]} basemap={basemapWithSatellite} />,
    )
    await screen.findByRole('button', { name: '4.250.000 TL' })
    const uydu = screen.getByRole('radio', { name: 'Uydu' })
    tileLayerInstance.setUrl.mockClear()
    fireEvent.click(uydu)
    await waitFor(() =>
      expect(tileLayerInstance.setUrl).toHaveBeenCalledWith('https://sat.example/{z}/{x}/{y}.png'),
    )
    const yol = screen.getByRole('radio', { name: 'Yol' })
    fireEvent.click(yol)
    await waitFor(() => expect(tileLayerInstance.setUrl).toHaveBeenCalledWith(basemap.tileUrl))
  })

  it('basemap yokken (sentetik SVG modu) katman toggle bugünkü gibi görünür ve data-layer değiştirir', () => {
    const { container } = render(<GlassMap pins={pins} />)
    expect(screen.getByRole('radio', { name: 'Uydu' })).toBeDefined()
    fireEvent.click(screen.getByRole('radio', { name: 'Uydu' }))
    expect(container.querySelector('[data-layer="uydu"]')).not.toBeNull()
  })

  // ── Kümeleme ve iniş zinciri (ülke → bölge → ilan) ─────────────────────
  describe('kümeleme', () => {
    it('yakın pinler tek rozette toplanır, uzaktaki kendi kapsülünde kalır', async () => {
      render(
        <GlassMap
          pins={[
            { id: 'a', lat: 10, lng: 10, price: '1M' },
            { id: 'b', lat: 12, lng: 12, price: '2M' },
            { id: 'uzak', lat: 300, lng: 300, price: '3M' },
          ]}
          basemap={basemap}
          cluster
        />,
      )
      await screen.findByRole('button', { name: '3M' })
      expect(screen.getByRole('button', { name: /2 ilan/ })).toBeDefined()
      expect(screen.queryByRole('button', { name: '1M' })).toBeNull()
      expect(screen.queryByRole('button', { name: '2M' })).toBeNull()
    })

    it('rozete tıklamak kadrajı o bölgeye indirir (iniş adımı)', async () => {
      render(
        <GlassMap
          pins={[
            { id: 'a', lat: 10, lng: 10, price: '1M' },
            { id: 'b', lat: 12, lng: 12, price: '2M' },
          ]}
          basemap={basemap}
          cluster
        />,
      )
      const rozet = await screen.findByRole('button', { name: /2 ilan/ })
      fireEvent.click(rozet)
      expect(basemapInstance.flyToBounds).toHaveBeenCalledWith(
        [
          [10, 10],
          [12, 12],
        ],
        expect.anything(),
      )
    })

    it('rozet seçim kontrolü değildir: aria-pressed bildirmez, üyelerini haber verir', async () => {
      const onClusterOpen = vi.fn()
      render(
        <GlassMap
          pins={[
            { id: 'a', lat: 10, lng: 10, price: '1M' },
            { id: 'b', lat: 12, lng: 12, price: '2M' },
          ]}
          basemap={basemap}
          cluster
          onClusterOpen={onClusterOpen}
        />,
      )
      const rozet = await screen.findByRole('button', { name: /2 ilan/ })
      expect(rozet.getAttribute('aria-pressed')).toBeNull()
      fireEvent.click(rozet)
      expect(onClusterOpen).toHaveBeenCalledWith(['a', 'b'])
    })

    // Üst üste binen ilanlarda sınır tek noktaya çöker; fitBounds sonsuz
    // yakınlaşmaya giderdi, bunun yerine sabit adım yaklaşılır.
    it('üst üste binen ilanlarda sabit adım yaklaşır', async () => {
      // Bu dosyada mock'lar testler arası paylaşılıyor; önceki iniş
      // çağrıları bu iddiaya sızmasın diye temizlenir.
      basemapInstance.flyToBounds.mockClear()
      basemapInstance.setView.mockClear()
      render(
        <GlassMap
          pins={[
            { id: 'a', lat: 10, lng: 10, price: '1M' },
            { id: 'b', lat: 10, lng: 10, price: '2M' },
          ]}
          basemap={basemap}
          cluster
        />,
      )
      const rozet = await screen.findByRole('button', { name: /2 ilan/ })
      fireEvent.click(rozet)
      expect(basemapInstance.flyToBounds).not.toHaveBeenCalled()
      expect(basemapInstance.setView).toHaveBeenCalledWith([10, 10], 9, expect.anything())
    })

    // Zincirin son halkası: tek kalan pin artık bir fiyat kapsülüdür ve
    // tıklanınca detay popup'ını açar.
    it('tek kalan pin fiyat kapsülüdür ve popup açar', async () => {
      render(
        <GlassMap
          pins={[{ id: 'a', lat: 10, lng: 10, price: '4.250.000 TL' }]}
          basemap={basemap}
          cluster
          popupContent={() => <span>Detay içeriği</span>}
        />,
      )
      const kapsul = await screen.findByRole('button', { name: '4.250.000 TL' })
      fireEvent.click(kapsul)
      expect(screen.getByText('Detay içeriği')).toBeDefined()
    })

    it('önceden toplanmış pinler rozete kendi ağırlıklarıyla girer', async () => {
      render(
        <GlassMap
          pins={[
            { id: 'a', lat: 10, lng: 10, count: 12 },
            { id: 'b', lat: 12, lng: 12, count: 6 },
          ]}
          basemap={basemap}
          cluster
        />,
      )
      // 2 değil 18: rozet temsil ettiği ilan sayısını gösterir.
      expect(await screen.findByRole('button', { name: /18 ilan/ })).toBeDefined()
    })

    it('kümeleme kapalıyken bugünkü davranış korunur — rozet seçilebilir kalır', async () => {
      basemapInstance.flyToBounds.mockClear()
      render(
        <GlassMap
          pins={[{ id: 'ege', lat: 10, lng: 10, count: 18 }]}
          basemap={basemap}
          popupContent={() => <span>Bölge özeti</span>}
        />,
      )
      const rozet = await screen.findByRole('button', { name: '18 ilan' })
      expect(rozet.getAttribute('aria-pressed')).toBe('false')
      fireEvent.click(rozet)
      expect(screen.getByText('Bölge özeti')).toBeDefined()
      expect(basemapInstance.flyToBounds).not.toHaveBeenCalled()
    })

    it('zemin yokken kümeleme devreye girmez (yakınlaşacak kadraj yok)', () => {
      render(
        <GlassMap
          pins={[
            { id: 'a', x: 0.1, y: 0.1, price: '1M' },
            { id: 'b', x: 0.11, y: 0.11, price: '2M' },
          ]}
          cluster
        />,
      )
      expect(screen.getByRole('button', { name: '1M' })).toBeDefined()
      expect(screen.getByRole('button', { name: '2M' })).toBeDefined()
    })
  })
})
