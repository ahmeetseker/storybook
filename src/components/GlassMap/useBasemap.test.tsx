import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { useBasemap, type GlassMapBasemap } from './useBasemap'

const mapInstance = {
  setView: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  // Testte projeksiyon deterministik: lng → x, lat → y
  latLngToContainerPoint: vi.fn((coords: [number, number]) => ({ x: coords[1], y: coords[0] })),
}

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => {
      mapInstance.setView.mockReturnValue(mapInstance)
      return mapInstance
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  },
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

const basemap: GlassMapBasemap = {
  tileUrl: 'https://tile.example/{z}/{x}/{y}.png',
  attribution: 'OpenStreetMap',
  center: [39, 35.2],
  zoom: 6,
}

function useHarness(map: GlassMapBasemap | undefined, points: { id: string; lat?: number; lng?: number }[]) {
  const ref = useRef<HTMLDivElement | null>(document.createElement('div'))
  return useBasemap(ref, map, points)
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
})
