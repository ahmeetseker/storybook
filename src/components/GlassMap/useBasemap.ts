// Gerçek tile zemini (GlassMap v2). Leaflet YALNIZ projeksiyon ve tile motorudur:
// pin'ler Leaflet marker'ı değildir, GlassMap'in kendi DOM butonları olarak kalır ve
// konumları burada piksele çevrilir. Böylece pin tipografisi/rengi tasarım
// sisteminden gelir ve CSS değişkeni hiçbir zaman SVG attribute'una yazılmaz.
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { prefersReducedMotion } from '../../core/tier'

/** Gerçek harita zemini tanımı — verilmezse GlassMap seed'li SVG yüzeyinde kalır. */
export interface GlassMapBasemap {
  /** Tile şablonu, ör. `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` */
  tileUrl: string
  /**
   * Uydu görünümü için ayrı tile şablonu. Verilmezse `basemap` modunda
   * Yol/Uydu katman toggle'ı hiç RENDER EDİLMEZ — gerçekte hiçbir şeyi
   * değiştirmeyen, kullanıcıyı yanıltan işlevsiz bir kontrol gösterilmez
   * (bkz. GlassMap.tsx `showLayerToggle`). Verildiğinde toggle görünür ve
   * `currentLayer==='uydu'` iken tile katmanı harita yeniden kurulmadan
   * (`L.TileLayer#setUrl`) bu URL'e geçer.
   */
  satelliteTileUrl?: string
  /** Lisans gereği görünür kalması zorunlu atıf — GlassMap kendi yüzeyinde render eder */
  attribution: ReactNode
  /** Başlangıç merkezi `[enlem, boylam]` */
  center: [number, number]
  /** Başlangıç yakınlaştırma seviyesi */
  zoom: number
  minZoom?: number
  maxZoom?: number
  /** Zemin tonu — CSS filtresiyle uygulanır, tile sağlayıcısından bağımsızdır */
  tone?: 'quiet' | 'raw' | 'satellite'
}

/** Projeksiyona girecek en küçük pin bilgisi (GlassMapPin'in alt kümesi). */
export interface BasemapPoint {
  id: string
  lat?: number
  lng?: number
}

export type BasemapStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface BasemapState {
  status: BasemapStatus
  /** Pin id'sinden kapsayıcıya göre piksel konumu */
  positions: Record<string, { left: number; top: number }>
  zoomIn: () => void
  zoomOut: () => void
}

interface LeafletMapLike {
  setView(center: [number, number], zoom: number): LeafletMapLike
  remove(): void
  invalidateSize(): void
  on(events: string, handler: () => void): void
  off(): void
  zoomIn(): void
  zoomOut(): void
  latLngToContainerPoint(coords: [number, number]): { x: number; y: number }
}

interface LeafletTileLayerLike {
  addTo(map: LeafletMapLike): unknown
  setUrl(url: string): unknown
}

export function useBasemap(
  containerRef: RefObject<HTMLDivElement | null>,
  basemap: GlassMapBasemap | undefined,
  points: BasemapPoint[],
  /** Aktif katman — `basemap.satelliteTileUrl` verildiğinde tile katmanını değiştirir. */
  layer: 'yol' | 'uydu',
): BasemapState {
  const [status, setStatus] = useState<BasemapStatus>(basemap ? 'loading' : 'idle')
  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>({})
  const mapRef = useRef<LeafletMapLike | undefined>(undefined)
  const tileLayerRef = useRef<LeafletTileLayerLike | undefined>(undefined)
  // İlk kurulumda hangi katmanın aktif olduğunu okumak için ref'te tutulur —
  // `layer` değişince zemin YENİDEN KURULMAZ (maliyetli/titrek olur), yalnız
  // aşağıdaki ayrı efekt tileLayer'ın `setUrl`'ünü çağırır (bkz. Bulgu 1).
  const layerAtSetupRef = useRef(layer)
  layerAtSetupRef.current = layer
  // Kurulum efektinin bağımlılık listesine girmesin diye ref'te tutulur —
  // yalnız ilk tile URL seçiminde okunur, değişimi zemini yeniden KURMAZ.
  const satelliteTileUrlAtSetupRef = useRef(basemap?.satelliteTileUrl)
  satelliteTileUrlAtSetupRef.current = basemap?.satelliteTileUrl

  // Pinler her render'da yeni dizi olabilir; effect'i yeniden kurmamak için ref'te tutulur.
  const pointsRef = useRef(points)
  pointsRef.current = points

  const project = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    // Görünür alan dışındaki pin hiç çizilmez. Kök `overflow:hidden` ALMAZ
    // (popup panel kenarından taşabilmeli), bu yüzden kırpma yerine kaynağında
    // eleme yapılır — aksi halde harita sürüklenirken fiyat etiketleri panelin
    // dışına, sayfa içeriğinin üstüne akar. Boyut okunamıyorsa (SSR/jsdom,
    // ilk yerleşim öncesi) eleme atlanır, yoksa tüm pinler kaybolurdu.
    const container = containerRef.current
    const width = container?.clientWidth ?? 0
    const height = container?.clientHeight ?? 0
    const cull = width > 0 && height > 0
    const next: Record<string, { left: number; top: number }> = {}
    for (const point of pointsRef.current) {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue
      const pixel = map.latLngToContainerPoint([point.lat as number, point.lng as number])
      if (cull && (pixel.x < 0 || pixel.y < 0 || pixel.x > width || pixel.y > height)) continue
      next[point.id] = { left: pixel.x, top: pixel.y }
    }
    setPositions(next)
  }, [containerRef])

  // Zemin kurulumu — yalnız istemcide, yalnız basemap verildiğinde.
  const tileUrl = basemap?.tileUrl
  const satelliteTileUrl = basemap?.satelliteTileUrl
  const centerLat = basemap?.center[0]
  const centerLng = basemap?.center[1]
  const zoom = basemap?.zoom
  const minZoom = basemap?.minZoom
  const maxZoom = basemap?.maxZoom

  useEffect(() => {
    if (!tileUrl || centerLat === undefined || centerLng === undefined || zoom === undefined) {
      setStatus('idle')
      setPositions({})
      return
    }
    const element = containerRef.current
    if (!element) return

    let disposed = false
    let frame = 0
    setStatus('loading')

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        project()
      })
    }

    void (async () => {
      try {
        const [leaflet] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
        if (disposed) return
        const L = leaflet.default
        const reduced = prefersReducedMotion()
        const map = L.map(element, {
          // Kontroller ve atıf GlassMap'in kendi yüzeyinde render edilir.
          zoomControl: false,
          attributionControl: false,
          // Hero'da sayfa kaydırırken harita yakınlaşmasın.
          scrollWheelZoom: false,
          // Leaflet'in kendi klavye tutamacı kapatılır: varsayılan açıkken
          // konteyner kendi `tabindex=0`'ını alıp Tab sırasına, tasarım
          // sistemi dışı bir odak halkasıyla (mavi outline) giriyor ve ok
          // tuşlarını GlassMap'in pin gezinme sözleşmesiyle (onPinKeyDown)
          // çakışacak şekilde harita kaydırmaya bağlıyordu — Tab, zoom/katman
          // kontrollerinden sonra doğrudan pinlere ulaşamıyordu (bkz.
          // task-9-report.md). GlassMap'in kendi zoom butonları ve pin roving
          // tabindex'i zaten aynı işlevi tasarım diliyle sağlıyor.
          keyboard: false,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: false,
          minZoom,
          maxZoom,
        })
        map.setView([centerLat, centerLng], zoom)
        // İlk kurulumda hangi tile URL'inin gösterileceği kurulum anındaki
        // katmana (layerAtSetupRef) göre seçilir — `satelliteTileUrl` yoksa
        // her zaman `tileUrl` (Yol) kullanılır.
        const initialUrl =
          layerAtSetupRef.current === 'uydu' && satelliteTileUrlAtSetupRef.current
            ? satelliteTileUrlAtSetupRef.current
            : tileUrl
        const tileLayer = L.tileLayer(initialUrl, { maxZoom: maxZoom ?? 19 })
        tileLayer.addTo(map)
        tileLayerRef.current = tileLayer as unknown as LeafletTileLayerLike
        // Gerçek Leaflet.Map tipiyle kurulum bitti; yüzeyimizi yalnız burada,
        // ref'e atamadan hemen önce LeafletMapLike'a indirgiyoruz — `as never` gerekmez.
        const typedMap = map as unknown as LeafletMapLike
        mapRef.current = typedMap
        typedMap.on('move zoom viewreset resize', schedule)
        typedMap.invalidateSize()
        setStatus('ready')
        project()
      } catch {
        if (!disposed) setStatus('error')
      }
    })()

    return () => {
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      mapRef.current?.off()
      mapRef.current?.remove()
      tileLayerRef.current = undefined
      mapRef.current = undefined
    }
  }, [containerRef, tileUrl, centerLat, centerLng, zoom, minZoom, maxZoom, project])

  // Katman (yol/uydu) değişince zemin YENİDEN KURULMAZ — yalnız aktif tile
  // katmanının kaynağı değişir (`L.TileLayer#setUrl`, harita yeniden kurulmadan
  // aynı yerde kalır). `satelliteTileUrl` yoksa her zaman `tileUrl`'e (Yol)
  // düşülür — bu efekt yalnız `satelliteTileUrl` verilmiş haritalarda görünür
  // bir fark yaratır (toggle da yalnız o durumda render edilir, bkz. GlassMap.tsx).
  useEffect(() => {
    if (status !== 'ready' || !tileLayerRef.current || !tileUrl) return
    const nextUrl = layer === 'uydu' && satelliteTileUrl ? satelliteTileUrl : tileUrl
    tileLayerRef.current.setUrl(nextUrl)
  }, [layer, satelliteTileUrl, tileUrl, status])

  // Pin listesi değiştiğinde zemin yeniden kurulmaz, yalnız yeniden izdüşürülür.
  useEffect(() => {
    if (status === 'ready') project()
  }, [points, project, status])

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), [])
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), [])

  return { status, positions, zoomIn, zoomOut }
}
