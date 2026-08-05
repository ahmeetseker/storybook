import { useEffect, useRef, useState } from 'react'
import { BASEMAP_TILE_URL } from '@/config/basemap'
import styles from './ListingCreateWorkspace.module.css'

/**
 * Token'ı gerçek renge çözer.
 *
 * Leaflet'in `circleMarker`'ı bir SVG şeklidir ve `color`/`fillColor` doğrudan
 * SVG attribute'una yazılır — CSS değişkeni orada ÇÖZÜLMEZ. Eskiden
 * `'var(--lg-accent)'` geçiliyordu ve işaret token rengiyle değil tarayıcı
 * varsayılanıyla (siyah) çiziliyordu. Değer burada bir kez okunup somut renge
 * çevrilir; hesaplanamazsa (SSR/jsdom) token'ın bugünkü karşılığına düşülür.
 */
function accentColor(): string {
  if (typeof window === 'undefined') return ACCENT_FALLBACK
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue('--lg-accent')
    .trim()
  return resolved || ACCENT_FALLBACK
}

const ACCENT_FALLBACK = '#7c3806'

/** İşaretin ortak biçimi — iki çağrı yeri de aynı sözleşmeyi kullanır. */
function markerStyle() {
  const color = accentColor()
  return {
    radius: 9,
    color: '#ffffff',
    weight: 3,
    fillColor: color,
    fillOpacity: 1,
  }
}

interface LeafletPoint {
  lat: number
  lng: number
}

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap
  remove(): void
  invalidateSize(): void
  on(event: 'click', handler: (event: { latlng: LeafletPoint }) => void): LeafletMap
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker
  setLatLng(point: [number, number]): LeafletMarker
  remove(): void
}

interface LeafletApi {
  map(element: HTMLElement, options?: Record<string, unknown>): LeafletMap
  tileLayer(
    url: string,
    options: Record<string, unknown>,
  ): { addTo(map: LeafletMap): void }
  circleMarker(
    point: [number, number],
    options: Record<string, unknown>,
  ): LeafletMarker
}

type LeafletWindow = Window & { L?: LeafletApi }

function leafletWindow(): LeafletWindow {
  return window as unknown as LeafletWindow
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_SCRIPT = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
let leafletLoader: Promise<LeafletApi> | undefined

function loadLeaflet(): Promise<LeafletApi> {
  const browser = leafletWindow()
  if (browser.L) return Promise.resolve(browser.L)
  if (leafletLoader) return leafletLoader

  const pending = new Promise<LeafletApi>((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LEAFLET_SCRIPT}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => {
        if (browser.L) {
          resolve(browser.L)
          return
        }
        existing.remove()
        reject(new Error('Leaflet yüklenemedi'))
      }, { once: true })
      existing.addEventListener('error', () => {
        existing.remove()
        reject(new Error('Leaflet script yüklenemedi'))
      }, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = LEAFLET_SCRIPT
    script.async = true
    script.onload = () => {
      if (browser.L) {
        resolve(browser.L)
        return
      }
      script.remove()
      reject(new Error('Leaflet yüklenemedi'))
    }
    script.onerror = () => {
      script.remove()
      reject(new Error('Leaflet script yüklenemedi'))
    }
    document.head.appendChild(script)
  })

  leafletLoader = pending.catch((error: unknown) => {
    leafletLoader = undefined
    throw error
  })
  return leafletLoader
}

interface LeafletPropertyPickerProps {
  center: [number, number]
  latitude: number | null
  longitude: number | null
  onPointChange: (latitude: number, longitude: number) => void
}

export function LeafletPropertyPicker({
  center,
  latitude,
  longitude,
  onPointChange,
}: LeafletPropertyPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | undefined>(undefined)
  const leafletRef = useRef<LeafletApi | undefined>(undefined)
  const markerRef = useRef<LeafletMarker | undefined>(undefined)
  const onPointChangeRef = useRef(onPointChange)
  const positionRef = useRef({ center, latitude, longitude })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    onPointChangeRef.current = onPointChange
  }, [onPointChange])

  useEffect(() => {
    positionRef.current = { center, latitude, longitude }
    const map = mapRef.current
    if (!map) return

    const hasPoint = latitude !== null && longitude !== null
    map.setView(hasPoint ? [latitude, longitude] : center, 14)

    if (hasPoint) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
      } else if (leafletRef.current) {
        markerRef.current = leafletRef.current
          .circleMarker([latitude, longitude], markerStyle())
          .addTo(map)
      }
      return
    }

    markerRef.current?.remove()
    markerRef.current = undefined
  }, [center, latitude, longitude])

  useEffect(() => {
    let disposed = false

    void loadLeaflet()
      .then((leaflet) => {
        if (disposed || !rootRef.current) return
        const latest = positionRef.current
        const initialPoint: [number, number] =
          latest.latitude !== null && latest.longitude !== null
            ? [latest.latitude, latest.longitude]
            : latest.center
        const map = leaflet
          .map(rootRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
            attributionControl: true,
          })
          .setView(initialPoint, 14)
        leafletRef.current = leaflet

        leaflet
          // Zemin diğer haritalarla aynı açık gri tile setinden gelir:
          // konum seçerken gördüğü harita ile ilanın yayında görüneceği harita
          // aynı olmalı.
          .tileLayer(BASEMAP_TILE_URL, {
            maxZoom: 18,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>',
          })
          .addTo(map)

        if (latest.latitude !== null && latest.longitude !== null) {
          markerRef.current = leaflet
            .circleMarker([latest.latitude, latest.longitude], markerStyle())
            .addTo(map)
        }

        map.on('click', ({ latlng }) => {
          if (markerRef.current) {
            markerRef.current.setLatLng([latlng.lat, latlng.lng])
          } else {
            markerRef.current = leaflet
              .circleMarker([latlng.lat, latlng.lng], markerStyle())
              .addTo(map)
          }
          onPointChangeRef.current(latlng.lat, latlng.lng)
        })

        mapRef.current = map
        setStatus('ready')
        window.setTimeout(() => map.invalidateSize(), 0)
      })
      .catch(() => {
        if (!disposed) setStatus('error')
      })

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = undefined
      leafletRef.current = undefined
      markerRef.current = undefined
    }
  }, [loadAttempt])

  return (
    <div className={styles.leafletRoot} aria-label="OpenStreetMap konum seçici">
      <div ref={rootRef} className={styles.leafletCanvas} />
      {status === 'loading' ? (
        <div className={styles.leafletStatus} role="status">
          Açık kaynak harita yükleniyor…
        </div>
      ) : null}
      {status === 'error' ? (
        <div className={styles.leafletStatus} role="alert">
          <span>Harita yüklenemedi. Adres bilgileriyle devam edebilirsiniz.</span>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => {
              setStatus('loading')
              setLoadAttempt((current) => current + 1)
            }}
          >
            Haritayı yeniden yükle
          </button>
        </div>
      ) : null}
      <span className={styles.leafletCredit}>OpenStreetMap · Leaflet</span>
      {status === 'ready' ? (
        <span className={styles.leafletHint}>Konumu işaretlemek için haritaya tıklayın</span>
      ) : null}
    </div>
  )
}
