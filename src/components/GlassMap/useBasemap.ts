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
  /**
   * Kadraja oturtulacak coğrafi sınır `[[güneyEnlem, batıBoylam], [kuzeyEnlem, doğuBoylam]]`.
   * Verilirse `center`/`zoom` yerine bu kullanılır ve panel boyutu ne olursa olsun
   * bölge kadraja sığdırılır — sabit zoom, dar panelde bölgenin bir kısmını
   * dışarıda bırakıp pinlerin elenmesine yol açıyordu. Panel yeniden
   * boyutlandığında kadraj tazelenir — ama YALNIZ kullanıcı kadrajı henüz
   * kendi hareket ettirmediyse. Rozetle bir bölgeye inen ya da haritayı
   * sürükleyen kullanıcı, bir pencere boyutu değişikliğinde ülke görünümüne
   * geri fırlatılmaz.
   */
  bounds?: [[number, number], [number, number]]
  minZoom?: number
  maxZoom?: number
  /** Zemin tonu — CSS filtresiyle uygulanır, tile sağlayıcısından bağımsızdır */
  tone?: 'quiet' | 'raw' | 'satellite'
  /**
   * Haritanın sürüklenip sürüklenemeyeceği. Varsayılan `true`. Vitrin
   * haritalarında (ör. ana sayfa hero'su) `false` verilir: kadraj sabit kalır,
   * kullanıcı ülkeyi kaybetmez ve pinler görünür alandan çıkmaz. Zoom butonları
   * merkezi koruduğu için bu ayardan etkilenmez.
   */
  pannable?: boolean
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
  /** Kapsayıcının o anki piksel ölçüsü — kenar hizalaması ve eleme buradan okunur */
  size: { width: number; height: number }
  /** Haritanın o anki (kesirli olabilen) yakınlaştırma seviyesi */
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  /**
   * Kadrajı verilen coğrafi sınıra oturtur — küme rozetine tıklanınca
   * "o bölgeye in" hareketi bununla yapılır. `prefers-reduced-motion` açıkken
   * uçuş animasyonu yerine anında geçiş yapılır.
   */
  fitBounds: (bounds: [[number, number], [number, number]]) => void
  /** Kadrajı merkezi koruyarak belirtilen adım kadar yaklaştırır (çökmüş sınır durumu). */
  zoomAround: (center: [number, number], delta: number) => void
  /**
   * Kadrajın o anki coğrafi sınırı `[[güney, batı], [kuzey, doğu]]`.
   * "Bu alanda ara" gibi kadraj tabanlı filtreler bunu okur; harita hazır
   * değilse `undefined` döner (çağıran o zaman filtre uygulamaz).
   */
  getViewportBounds: () => [[number, number], [number, number]] | undefined
  /**
   * Metre cinsinden bir yarıçapı o anki kadrajda piksele çevirir — mahremiyet
   * dairesi zeminle birlikte ölçeklensin diye. Harita hazır değilse `0` döner.
   */
  metersToPixels: (lat: number, lng: number, meters: number) => number
}

interface LeafletMapLike {
  setView(
    center: [number, number],
    zoom: number,
    options?: { animate?: boolean },
  ): LeafletMapLike
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: [number, number]; animate?: boolean; maxZoom?: number },
  ): LeafletMapLike
  flyToBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: [number, number]; duration?: number; maxZoom?: number },
  ): LeafletMapLike
  remove(): void
  invalidateSize(): void
  on(events: string, handler: () => void): void
  off(): void
  zoomIn(): void
  zoomOut(): void
  getZoom(): number
  getMaxZoom(): number
  getBounds(): {
    getSouth(): number
    getWest(): number
    getNorth(): number
    getEast(): number
  }
  latLngToContainerPoint(coords: [number, number]): { x: number; y: number }
}

interface LeafletTileLayerLike {
  addTo(map: LeafletMapLike): unknown
  setUrl(url: string): unknown
}

/** Kadrajın dışında bu kadar piksele kadar olan noktalar kümelemeye dahil kalır. */
const CULL_MARGIN = 160

export function useBasemap(
  containerRef: RefObject<HTMLDivElement | null>,
  basemap: GlassMapBasemap | undefined,
  points: BasemapPoint[],
  /** Aktif katman — `basemap.satelliteTileUrl` verildiğinde tile katmanını değiştirir. */
  layer: 'yol' | 'uydu',
): BasemapState {
  const [status, setStatus] = useState<BasemapStatus>(basemap ? 'loading' : 'idle')
  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>({})
  const [size, setSize] = useState({ width: 0, height: 0 })
  // Kadrajın o anki seviyesi — kümeleme eşiği ve "artık kümeleme" kararı
  // buradan okunur. Başlangıç değeri basemap'in istenen seviyesidir; harita
  // kurulunca ilk `project()` gerçek değerle günceller.
  const [currentZoom, setCurrentZoom] = useState(basemap?.zoom ?? 0)
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
    //
    // Eleme kenardan CULL_MARGIN kadar dışarıda yapılır: kümeleme piksel
    // uzayında çalıştığı için, kadrajın hemen dışındaki bir komşu elenirse
    // kenardaki rozet eksik sayı gösterir ve harita kaydırıldıkça sayı
    // "zıplar". Marj, kümeleme yarıçapından geniştir; GlassMap gerçekten
    // görünür alanın dışına düşen düğümü çizmeden atar.
    const container = containerRef.current
    const width = container?.clientWidth ?? 0
    const height = container?.clientHeight ?? 0
    const cull = width > 0 && height > 0
    const next: Record<string, { left: number; top: number }> = {}
    for (const point of pointsRef.current) {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue
      const pixel = map.latLngToContainerPoint([point.lat as number, point.lng as number])
      // Projeksiyon sonlu bir nokta üretmediyse pin konumlandırılamaz.
      if (!Number.isFinite(pixel.x) || !Number.isFinite(pixel.y)) continue
      if (
        cull &&
        (pixel.x < -CULL_MARGIN ||
          pixel.y < -CULL_MARGIN ||
          pixel.x > width + CULL_MARGIN ||
          pixel.y > height + CULL_MARGIN)
      ) {
        continue
      }
      next[point.id] = { left: pixel.x, top: pixel.y }
    }
    setPositions(next)
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    const nextZoom = map.getZoom()
    if (Number.isFinite(nextZoom)) setCurrentZoom((prev) => (prev === nextZoom ? prev : nextZoom))
  }, [containerRef])

  // Zemin kurulumu — yalnız istemcide, yalnız basemap verildiğinde.
  const tileUrl = basemap?.tileUrl
  const satelliteTileUrl = basemap?.satelliteTileUrl
  const centerLat = basemap?.center[0]
  const centerLng = basemap?.center[1]
  const zoom = basemap?.zoom
  const minZoom = basemap?.minZoom
  const maxZoom = basemap?.maxZoom
  const pannable = basemap?.pannable ?? true
  // Sınır dizisi her render'da yeni referans olabilir; effect'i gereksiz yere
  // yeniden kurmamak için değerlerinden türetilmiş bir anahtara indirgenir.
  const boundsKey = basemap?.bounds ? basemap.bounds.flat().join(',') : ''
  const boundsRef = useRef(basemap?.bounds)
  boundsRef.current = basemap?.bounds
  // Kullanıcı kadrajı kendi hareket ettirdi mi? Başlangıç kadrajının yeniden
  // boyutlanmada tazelenip tazelenmeyeceğini bu belirler (bkz. ResizeObserver).
  const userMovedRef = useRef(false)

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
    let resizeObserver: ResizeObserver | undefined
    // Zemin baştan kuruluyor: başlangıç kadrajı yeniden geçerli.
    userMovedRef.current = false
    setStatus('loading')

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        project()
      })
    }

    void (async () => {
      const fitBounds = boundsRef.current
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
          // Vitrin haritalarında (hero) kadraj sabit kalmalı: sürükleme açıkken
          // kullanıcı ülkeyi kaybediyor ve pinler görünür alandan çıkıyor.
          // Zoom butonları merkezi koruduğu için etkilenmez.
          dragging: pannable,
          touchZoom: pannable,
          doubleClickZoom: pannable,
          boxZoom: pannable,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: false,
          // Kesirli zoom'a izin verilir: varsayılan `zoomSnap: 1` istenen
          // seviyeyi tam sayıya yuvarlayıp kadrajı beklenenden yakın kılıyordu
          // (5.6 → 6), bu da bölgenin bir kısmını dışarıda bırakıyordu.
          zoomSnap: 0,
          minZoom,
          maxZoom,
        })
        // Sınır verilmişse kadraj panele göre hesaplanır; sabit zoom dar
        // panelde bölgeyi kırpıyordu.
        if (fitBounds) {
          map.fitBounds(fitBounds, { padding: [6, 6], animate: false })
        } else {
          map.setView([centerLat, centerLng], zoom)
        }
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
        // Panel CSS ile yeniden boyutlanınca (responsive yerleşim, pencere
        // değişimi) Leaflet bunu kendiliğinden algılamaz: boyut bildirilmezse
        // kadraj kayar ve pinler yanlış konumlanır.
        // Kullanıcı kadrajı kendi hareket ettirdiyse (rozetle indi, sürükledi,
        // yakınlaştırdı) yeniden boyutlanma onu BAŞA DÖNDÜRMEMELİ. Başlangıç
        // kadrajı yalnız kullanıcı henüz karışmamışken tazelenir; aksi halde
        // bir pencere boyutu değişikliği ilanı bulmuş kullanıcıyı ülke
        // görünümüne fırlatıyordu.
        typedMap.on('zoomstart dragstart', () => {
          userMovedRef.current = true
        })
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            typedMap.invalidateSize()
            const current = boundsRef.current
            if (current && !userMovedRef.current) {
              typedMap.fitBounds(current, { padding: [6, 6], animate: false })
            }
            schedule()
          })
          resizeObserver.observe(element)
        }
        setStatus('ready')
        project()
      } catch (error) {
        // Sessiz yutma YASAK: bu dal bir kez tetiklendiğinde harita şematik
        // yedeğe düşer ve kümeleme/iniş hiç devreye girmez — kullanıcı yalnız
        // "zemin yüklenemedi" satırını görür, NEDENİNİ göremezdi. Gerçek hata
        // konsola yazılır (ör. `leaflet` modülü ön paketlenmediği için
        // `import()` reddi, bkz. apps/web vite.config optimizeDeps notu).
        console.error('[GlassMap] Harita zemini kurulamadı:', error)
        if (!disposed) setStatus('error')
      }
    })()

    return () => {
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      mapRef.current?.off()
      mapRef.current?.remove()
      tileLayerRef.current = undefined
      mapRef.current = undefined
    }
  }, [containerRef, tileUrl, centerLat, centerLng, zoom, minZoom, maxZoom, pannable, boundsKey, project])

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

  const zoomIn = useCallback(() => {
    userMovedRef.current = true
    mapRef.current?.zoomIn()
  }, [])
  const zoomOut = useCallback(() => {
    userMovedRef.current = true
    mapRef.current?.zoomOut()
  }, [])

  // Küme rozetine tıklandığında kadraj üyelerin sınırına oturur. Padding
  // rozetin kendi yarıçapından geniş tutulur: sıfır padding'de kenardaki üye
  // pini tam sınıra oturup etiketiyle panel dışına taşıyordu.
  const fitBounds = useCallback((bounds: [[number, number], [number, number]]) => {
    const map = mapRef.current
    if (!map) return
    // Rozetle inmek de bir kullanıcı hareketidir: yeniden boyutlanma bu
    // kadrajı ülke görünümüne geri çekmemeli.
    userMovedRef.current = true
    const options = { padding: [48, 48] as [number, number], maxZoom: map.getMaxZoom() }
    if (prefersReducedMotion()) {
      map.fitBounds(bounds, { ...options, animate: false })
      return
    }
    map.flyToBounds(bounds, { ...options, duration: 0.6 })
  }, [])

  // Üst üste binen ilanlarda sınır tek noktaya çöker; `fitBounds` sonsuz
  // yakınlaşmaya gideceği için kadraj sabit bir adım yaklaştırılır.
  const zoomAround = useCallback((center: [number, number], delta: number) => {
    const map = mapRef.current
    if (!map) return
    userMovedRef.current = true
    const next = Math.min(map.getMaxZoom(), map.getZoom() + delta)
    map.setView(center, next, { animate: !prefersReducedMotion() })
  }, [])

  // Yarıçap, merkez ile aynı enlemde `meters` kadar doğuya kaydırılmış bir
  // noktanın piksel uzaklığı olarak ölçülür. Enlem çemberi kutuplara doğru
  // daraldığı için boylam farkı `cos(lat)` ile düzeltilir; sabit bir derece
  // katsayısı kullanmak daireyi kuzeyde belirgin biçimde şişiriyordu.
  const metersToPixels = useCallback(
    (lat: number, lng: number, meters: number) => {
      const map = mapRef.current
      if (!map || !(meters > 0)) return 0
      const metersPerLngDegree = 111_320 * Math.cos((lat * Math.PI) / 180)
      if (!(metersPerLngDegree > 0)) return 0
      const center = map.latLngToContainerPoint([lat, lng])
      const edge = map.latLngToContainerPoint([lat, lng + meters / metersPerLngDegree])
      const radius = Math.abs(edge.x - center.x)
      return Number.isFinite(radius) ? radius : 0
    },
    [],
  )

  const getViewportBounds = useCallback(():
    | [[number, number], [number, number]]
    | undefined => {
    const map = mapRef.current
    if (!map) return undefined
    const bounds = map.getBounds()
    const south = bounds.getSouth()
    const west = bounds.getWest()
    const north = bounds.getNorth()
    const east = bounds.getEast()
    if (![south, west, north, east].every((value) => Number.isFinite(value))) return undefined
    return [
      [south, west],
      [north, east],
    ]
  }, [])

  return {
    status,
    positions,
    size,
    zoom: currentZoom,
    zoomIn,
    zoomOut,
    fitBounds,
    zoomAround,
    metersToPixels,
    getViewportBounds,
  }
}
