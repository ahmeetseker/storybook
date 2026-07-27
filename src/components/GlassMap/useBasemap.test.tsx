import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { useBasemap, type GlassMapBasemap } from './useBasemap'

const mapInstance = {
  setView: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  // Testte projeksiyon deterministik: lng → x, lat → y
  latLngToContainerPoint: vi.fn((coords: [number, number]) => ({ x: coords[1], y: coords[0] })),
}

const tileLayerInstance = { addTo: vi.fn(), setUrl: vi.fn() }

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => {
      mapInstance.setView.mockReturnValue(mapInstance)
      return mapInstance
    }),
    tileLayer: vi.fn(() => tileLayerInstance),
  },
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

const basemap: GlassMapBasemap = {
  tileUrl: 'https://tile.example/{z}/{x}/{y}.png',
  attribution: 'OpenStreetMap',
  center: [39, 35.2],
  zoom: 6,
}

// Sabit referans: `rerender()` ile birden çok kez render edilen testlerde
// her seferinde YENİ bir dizi literali (`[]`) geçmek, `useBasemap`'in "pin
// listesi değişince yeniden izdüşür" efektini (deps: `points`) her render'da
// yeniden tetikleyip gerçek bir üretim tüketicisinde asla oluşmayan (GlassMap.tsx
// `pins`'i `pointsSignature`'a göre memoize eder) bir render fırtınasına yol
// açar. Bulgu 1 testleri gerçek tüketici davranışını (memoize edilmiş points)
// yansıtsın diye burada da sabit bir referans kullanılır.
const noPoints: { id: string; lat?: number; lng?: number }[] = []

function useHarness(
  map: GlassMapBasemap | undefined,
  points: { id: string; lat?: number; lng?: number }[],
  layer: 'yol' | 'uydu' = 'yol',
) {
  const ref = useRef<HTMLDivElement | null>(document.createElement('div'))
  return useBasemap(ref, map, points, layer)
}

/** jsdom'da 0 dönen clientWidth/Height'i sabitler — görünür alan elemesini test etmek için. */
function sizedElement(width: number, height: number): HTMLDivElement {
  const element = document.createElement('div')
  Object.defineProperty(element, 'clientWidth', { value: width, configurable: true })
  Object.defineProperty(element, 'clientHeight', { value: height, configurable: true })
  return element
}

function useSizedHarness(
  map: GlassMapBasemap | undefined,
  points: { id: string; lat?: number; lng?: number }[],
  size: { width: number; height: number },
) {
  const ref = useRef<HTMLDivElement | null>(sizedElement(size.width, size.height))
  return useBasemap(ref, map, points, 'yol')
}

describe('useBasemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('basemap verilmezse idle kalır ve Leaflet yüklenmez', async () => {
    const { result } = renderHook(() => useHarness(undefined, [{ id: 'p1', lat: 39, lng: 35 }]))
    expect(result.current.status).toBe('idle')
    expect(result.current.positions).toEqual({})
  })

  it('basemap verilince tile katmanı kurulur ve status ready olur', async () => {
    const L = (await import('leaflet')).default
    const { result } = renderHook(() => useHarness(basemap, []))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(L.map).toHaveBeenCalledTimes(1)
    expect(L.tileLayer).toHaveBeenCalledWith(basemap.tileUrl, expect.anything())
  })

  it('pinleri coğrafi konumdan piksel konumuna çevirir', async () => {
    const { result } = renderHook(() =>
      useHarness(basemap, [
        { id: 'urla', lat: 38.3, lng: 26.7 },
        { id: 'ankara', lat: 39.9, lng: 32.8 },
      ]),
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await waitFor(() => expect(result.current.positions.urla).toEqual({ left: 26.7, top: 38.3 }))
    expect(result.current.positions.ankara).toEqual({ left: 32.8, top: 39.9 })
  })

  it('lat/lng eksik veya sonlu olmayan pin projeksiyona girmez', async () => {
    const { result } = renderHook(() =>
      useHarness(basemap, [
        { id: 'saglam', lat: 39, lng: 35 },
        { id: 'eksik' },
        { id: 'bozuk', lat: Number.NaN, lng: 35 },
      ]),
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await waitFor(() => expect(result.current.positions.saglam).toBeDefined())
    expect(result.current.positions.eksik).toBeUndefined()
    expect(result.current.positions.bozuk).toBeUndefined()
  })

  it('Leaflet yüklenemezse status error olur', async () => {
    const L = (await import('leaflet')).default
    vi.mocked(L.map).mockImplementationOnce(() => {
      throw new Error('yüklenemedi')
    })
    const { result } = renderHook(() => useHarness(basemap, []))
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('zoomIn/zoomOut harita örneğine iletilir', async () => {
    const { result } = renderHook(() => useHarness(basemap, []))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    result.current.zoomIn()
    expect(mapInstance.zoomIn).toHaveBeenCalled()
    result.current.zoomOut()
    expect(mapInstance.zoomOut).toHaveBeenCalled()
  })

  // ── Bulgu 1 (task-9 review): satelliteTileUrl verilince katman gerçekten
  // tile kaynağını değiştirir; harita yeniden kurulmaz (bkz. GlassMap.test.tsx
  // için component seviyesinde eşdeğer testler). ──

  it('satelliteTileUrl verilmişse başlangıç katmanına göre doğru tile URL ile kurulur', async () => {
    const L = (await import('leaflet')).default
    const withSat: GlassMapBasemap = {
      ...basemap,
      satelliteTileUrl: 'https://sat.example/{z}/{x}/{y}.png',
    }
    const { result } = renderHook(() => useHarness(withSat, noPoints, 'uydu'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(L.tileLayer).toHaveBeenCalledWith('https://sat.example/{z}/{x}/{y}.png', expect.anything())
  })

  it('layer değişince tile katmanının kaynağı setUrl ile değişir, harita yeniden KURULMAZ', async () => {
    const L = (await import('leaflet')).default
    const withSat: GlassMapBasemap = {
      ...basemap,
      satelliteTileUrl: 'https://sat.example/{z}/{x}/{y}.png',
    }
    const { result, rerender } = renderHook(
      ({ layer }: { layer: 'yol' | 'uydu' }) => useHarness(withSat, noPoints, layer),
      { initialProps: { layer: 'yol' as 'yol' | 'uydu' } },
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(L.map).toHaveBeenCalledTimes(1)

    rerender({ layer: 'uydu' })
    await waitFor(() =>
      expect(tileLayerInstance.setUrl).toHaveBeenCalledWith('https://sat.example/{z}/{x}/{y}.png'),
    )
    expect(L.map).toHaveBeenCalledTimes(1)

    rerender({ layer: 'yol' })
    await waitFor(() => expect(tileLayerInstance.setUrl).toHaveBeenCalledWith(basemap.tileUrl))
    expect(L.map).toHaveBeenCalledTimes(1)
  })

  it('satelliteTileUrl verilmemişse layer değişse bile tile kaynağı hep tileUrl kalır', async () => {
    const { result, rerender } = renderHook(
      ({ layer }: { layer: 'yol' | 'uydu' }) => useHarness(basemap, noPoints, layer),
      { initialProps: { layer: 'yol' as 'yol' | 'uydu' } },
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    tileLayerInstance.setUrl.mockClear()
    rerender({ layer: 'uydu' })
    await waitFor(() => expect(tileLayerInstance.setUrl).toHaveBeenCalledWith(basemap.tileUrl))
  })

  // Harita sürüklenirken panel dışına çıkan pinler çizilmemeli: kök overflow:hidden
  // almadığı için (popup taşabilmeli) elenmezlerse etiketler sayfa içeriğinin üstüne akar.
  it('görünür alan dışına çıkan pin projeksiyona girmez', async () => {
    const points = [
      { id: 'icerde', lat: 20, lng: 30 },
      { id: 'sagda', lat: 20, lng: 260 },
      { id: 'altta', lat: 190, lng: 30 },
      { id: 'solda', lat: 20, lng: -5 },
      { id: 'ustte', lat: -5, lng: 30 },
    ]
    const { result } = renderHook(() =>
      useSizedHarness(basemap, points, { width: 200, height: 150 }),
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await waitFor(() => expect(result.current.positions.icerde).toEqual({ left: 30, top: 20 }))
    expect(result.current.positions.sagda).toBeUndefined()
    expect(result.current.positions.altta).toBeUndefined()
    expect(result.current.positions.solda).toBeUndefined()
    expect(result.current.positions.ustte).toBeUndefined()
  })

  it('bounds verilince kadraj setView yerine fitBounds ile kurulur', async () => {
    const bounds: [[number, number], [number, number]] = [
      [35.9, 25.7],
      [42.2, 44.6],
    ]
    const { result } = renderHook(() => useHarness({ ...basemap, bounds }, noPoints))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(mapInstance.fitBounds).toHaveBeenCalledWith(bounds, expect.anything())
    expect(mapInstance.setView).not.toHaveBeenCalled()
  })

  it('bounds verilmezse center/zoom ile setView kullanılır', async () => {
    const { result } = renderHook(() => useHarness(basemap, noPoints))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(mapInstance.setView).toHaveBeenCalledWith(basemap.center, basemap.zoom)
    expect(mapInstance.fitBounds).not.toHaveBeenCalled()
  })

  it('pannable false verilince Leaflet sürükleme/zoom tutamaçları kapatılır', async () => {
    const L = (await import('leaflet')).default
    const { result } = renderHook(() =>
      useHarness({ ...basemap, pannable: false }, noPoints),
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(L.map).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
      }),
    )
  })

  it('pannable varsayılanı true — sürükleme açık kalır', async () => {
    const L = (await import('leaflet')).default
    const { result } = renderHook(() => useHarness(basemap, noPoints))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(L.map).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ dragging: true }),
    )
  })

  // Boyut okunamadığında (SSR/jsdom, ilk yerleşim öncesi) eleme atlanmalı,
  // yoksa tüm pinler kaybolurdu.
  it('kapsayıcı boyutu okunamıyorsa eleme yapılmaz', async () => {
    const { result } = renderHook(() =>
      useHarness(basemap, [{ id: 'uzak', lat: 20, lng: 9999 }]),
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await waitFor(() => expect(result.current.positions.uzak).toBeDefined())
  })
})
