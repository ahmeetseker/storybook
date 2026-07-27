# Ana Sayfa Hero — AI-first Yeniden Tasarım Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ana sayfa hero'sunu sekmeli + AI ajan girişli hâle getirmek ve haritayı `GlassMap`'e gerçek tile adaptörü ekleyerek tasarım diline sokmak.

**Architecture:** Leaflet kütüphaneye taşınır ve yalnız **projeksiyon + tile motoru** olarak kullanılır — pin'ler Leaflet marker'ı değil, `GlassMap`'in mevcut DOM buton pin'leri olarak kalır ve konumları `latLngToContainerPoint` ile piksele çevrilir. `basemap` prop'u verilmediğinde `GlassMap` bugünkü seed'li SVG davranışını birebir korur, böylece `EmlakSearchView` kırılmaz ve Leaflet onun bundle'ına girmez. Hero, kütüphanede zaten var olan `GlassSegmentedControl` / `GlassAiSearchBar` / `GlassChip` / `GlassMetricStrip` bileşenleriyle kurulur; `GlassHero`'ya yalnız iki geriye uyumlu slot eklenir.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest + @testing-library/react (jsdom), Leaflet 1.9 (yeni npm bağımlılığı), TanStack Router (apps/web).

## Global Constraints

Bu kurallar her görevin gereksinimlerine dahildir (kaynak: `CLAUDE.md`, `src/design/*.mdx`):

- Component CSS'inde **raw px/hex yasak** — yalnız `--lg-*` token'ları tüketilir; token fallback'i (`var(--lg-x, 14px)`) ve `rules.md §9`'a yazılmış mikro-geometri borç notları istisnadır.
- Focus halkası yalnız `:focus-visible` üzerinde: `outline: var(--lg-focus-ring-width, 2px) solid var(--lg-accent)`.
- İkon-tek butonlarda `label` / `aria-label` **zorunlu**.
- Birleşik variant yasak. Controlled deseni her zaman `value` + `defaultValue` + `onXChange`.
- Animasyon yalnız `transform`/`opacity`/`filter`; `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenir.
- Breakpoint yerine yetenek sorguları: `pointer: coarse`, `hover: hover`; yerleşim için container query.
- Public prop'lar **Türkçe JSDoc** taşır; kod tanımlayıcıları İngilizce, arayüz metinleri Türkçe.
- Değişen her component'in `rules.md`'si ve story matrisi güncellenir.
- Doğrulama komutları: `npm test` · `npx tsc -b` · `npm run lint`.
- Commit mesajları Türkçe, `feat:` / `fix:` / `refactor:` / `docs:` öneki ile.

---

### Task 1: Leaflet bağımlılığı ve `useBasemap` hook'unun iskeleti

**Files:**
- Modify: `package.json` (dependencies)
- Create: `src/components/GlassMap/useBasemap.ts`
- Create: `src/components/GlassMap/useBasemap.test.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `GlassMapBasemap` — `{ tileUrl: string; attribution: ReactNode; center: [number, number]; zoom: number; minZoom?: number; maxZoom?: number; tone?: 'quiet' | 'raw' | 'satellite' }`
  - `BasemapPoint` — `{ id: string; lat?: number; lng?: number }`
  - `BasemapStatus` — `'idle' | 'loading' | 'ready' | 'error'`
  - `BasemapState` — `{ status: BasemapStatus; positions: Record<string, { left: number; top: number }>; zoomIn: () => void; zoomOut: () => void }`
  - `useBasemap(containerRef: RefObject<HTMLDivElement | null>, basemap: GlassMapBasemap | undefined, points: BasemapPoint[]): BasemapState`

- [ ] **Step 1: Leaflet'i bağımlılık olarak ekle**

Leaflet bugün `unpkg.com`'dan `<script>` etiketiyle yükleniyor — sürüm sabitlemesi zayıf, tip güvenliği elle yazılmış `interface`'lerle taklit ediliyor ve CSP/offline riski var. npm paketine geçiyoruz.

```bash
npm install leaflet@^1.9.4
npm install --save-dev @types/leaflet@^1.9.20
```

- [ ] **Step 2: Başarısız testi yaz**

Create `src/components/GlassMap/useBasemap.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassMap/useBasemap.test.tsx`
Expected: FAIL — `Failed to resolve import "./useBasemap"`

- [ ] **Step 4: Hook'u yaz**

Create `src/components/GlassMap/useBasemap.ts`:

```ts
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

export function useBasemap(
  containerRef: RefObject<HTMLDivElement | null>,
  basemap: GlassMapBasemap | undefined,
  points: BasemapPoint[],
): BasemapState {
  const [status, setStatus] = useState<BasemapStatus>(basemap ? 'loading' : 'idle')
  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>({})
  const mapRef = useRef<LeafletMapLike | undefined>(undefined)

  // Pinler her render'da yeni dizi olabilir; effect'i yeniden kurmamak için ref'te tutulur.
  const pointsRef = useRef(points)
  pointsRef.current = points

  const project = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const next: Record<string, { left: number; top: number }> = {}
    for (const point of pointsRef.current) {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue
      const pixel = map.latLngToContainerPoint([point.lat as number, point.lng as number])
      next[point.id] = { left: pixel.x, top: pixel.y }
    }
    setPositions(next)
  }, [])

  // Zemin kurulumu — yalnız istemcide, yalnız basemap verildiğinde.
  const tileUrl = basemap?.tileUrl
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
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: false,
          minZoom,
          maxZoom,
        }) as unknown as LeafletMapLike
        map.setView([centerLat, centerLng], zoom)
        L.tileLayer(tileUrl, { maxZoom: maxZoom ?? 19 }).addTo(map as never)
        mapRef.current = map
        map.on('move zoom viewreset resize', schedule)
        map.invalidateSize()
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
      mapRef.current = undefined
    }
  }, [containerRef, tileUrl, centerLat, centerLng, zoom, minZoom, maxZoom, project])

  // Pin listesi değiştiğinde zemin yeniden kurulmaz, yalnız yeniden izdüşürülür.
  useEffect(() => {
    if (status === 'ready') project()
  }, [points, project, status])

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), [])
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), [])

  return { status, positions, zoomIn, zoomOut }
}
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassMap/useBasemap.test.tsx`
Expected: PASS — 6 test

- [ ] **Step 6: Tip kontrolü**

Run: `npx tsc -b`
Expected: hata yok

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/GlassMap/useBasemap.ts src/components/GlassMap/useBasemap.test.tsx
git commit -m "feat(GlassMap): tile zemini için useBasemap hook'u ekle"
```

---

### Task 2: `GlassMap`'e `basemap` prop'unu bağla

**Files:**
- Modify: `src/components/GlassMap/GlassMap.tsx`
- Modify: `src/components/GlassMap/GlassMap.test.tsx`

**Interfaces:**
- Consumes: `useBasemap`, `GlassMapBasemap`, `BasemapPoint` (Task 1)
- Produces:
  - `GlassMapPin`'e eklenen alanlar: `x?: number`, `y?: number` (artık opsiyonel), `lat?: number`, `lng?: number`
  - `GlassMapProps`'a eklenen alan: `basemap?: GlassMapBasemap`
  - `GlassMap` kökünden re-export: `export type { GlassMapBasemap } from './useBasemap'`

- [ ] **Step 1: Başarısız testleri yaz**

`src/components/GlassMap/GlassMap.test.tsx` dosyasının **en üstüne** Leaflet mock'unu ekle (mevcut importların hemen altına):

```tsx
const basemapInstance = {
  setView: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  latLngToContainerPoint: vi.fn((coords: [number, number]) => ({ x: coords[1], y: coords[0] })),
}

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => {
      basemapInstance.setView.mockReturnValue(basemapInstance)
      return basemapInstance
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  },
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

const basemap = {
  tileUrl: 'https://tile.example/{z}/{x}/{y}.png',
  attribution: <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>,
  center: [39, 35.2] as [number, number],
  zoom: 6,
}
```

Ardından dosyanın sonundaki `describe('GlassMap', ...)` bloğunun **içine** şu testleri ekle:

```tsx
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
```

Dosyanın en üstündeki import satırını `waitFor` ekleyecek şekilde güncelle:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
```

- [ ] **Step 2: Testlerin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassMap/GlassMap.test.tsx`
Expected: FAIL — yeni 5 test düşer (`basemap` prop'u yok, atıf/zoom butonları render edilmiyor); mevcut testler geçmeye devam eder

- [ ] **Step 3: `GlassMap.tsx`'i güncelle**

`src/components/GlassMap/GlassMap.tsx` dosyasında importlara ekle:

```tsx
import { useBasemap, type GlassMapBasemap } from './useBasemap'
```

Dosyanın sonuna re-export ekle (public API):

```tsx
export type { GlassMapBasemap } from './useBasemap'
```

`GlassMapPin` arayüzünü değiştir:

```tsx
export interface GlassMapPin {
  id: string
  /** Yatay konum, 0-1 normalize (soldan) — yalnız `basemap` yokken kullanılır */
  x?: number
  /** Dikey konum, 0-1 normalize (üstten) — yalnız `basemap` yokken kullanılır */
  y?: number
  /** Enlem — yalnız `basemap` verildiğinde kullanılır */
  lat?: number
  /** Boylam — yalnız `basemap` verildiğinde kullanılır */
  lng?: number
  /** Fiyat etiketi — verilirse kapsül pin */
  price?: string
  /** Cluster sayısı — verilirse rozet pin (price yok sayılır) */
  count?: number
}
```

`GlassMapProps`'a ekle:

```tsx
  /**
   * Gerçek tile zemini. Verilmezse component seed'li SVG sokak dokusunda kalır
   * (bugünkü davranış). Verildiğinde pin'ler `lat`/`lng` üzerinden konumlanır.
   */
  basemap?: GlassMapBasemap
```

Fonksiyon imzasına `basemap` parametresini ekle ve gövdenin başına, `grid` hesabından hemen sonra şunu koy:

```tsx
  const tilesRef = useRef<HTMLDivElement>(null)
  const { status: basemapStatus, positions, zoomIn, zoomOut } = useBasemap(tilesRef, basemap, pins)
  // Zemin yüklenemezse seed'li SVG dokusuna düşülür — harita hiçbir zaman boş kutu olmaz.
  const usingTiles = Boolean(basemap) && basemapStatus !== 'error'
```

`canvasClip` bloğunu, SVG'yi koşullu hâle getirecek ve tile konteynerini ekleyecek şekilde değiştir:

```tsx
      <div className={styles.canvasClip}>
        {basemap ? (
          <div
            ref={tilesRef}
            className={styles.tiles}
            data-basemap=""
            data-tone={basemap.tone ?? 'quiet'}
            data-status={basemapStatus}
            aria-hidden="true"
          />
        ) : null}
        {usingTiles ? null : (
          <svg
            className={styles.canvas}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {/* ... mevcut svg içeriği aynen korunur ... */}
          </svg>
        )}
      </div>
```

Katman toggle'ının hemen ardına zoom kontrollerini ve atıf yüzeyini ekle:

```tsx
      {basemap ? (
        <>
          <div className={styles.zoomCtl}>
            <button type="button" className={styles.zoomBtn} aria-label="Yakınlaştır" onClick={zoomIn}>
              <span aria-hidden="true">+</span>
            </button>
            <button type="button" className={styles.zoomBtn} aria-label="Uzaklaştır" onClick={zoomOut}>
              <span aria-hidden="true">−</span>
            </button>
          </div>
          <div className={styles.attribution}>{basemap.attribution}</div>
          {basemapStatus === 'error' ? (
            <p className={styles.basemapNotice} role="status">
              Harita zemini yüklenemedi; şematik görünüm kullanılıyor.
            </p>
          ) : null}
        </>
      ) : null}
```

Pin döngüsünün başındaki konum hesabını, iki modu ayıracak şekilde değiştir:

```tsx
      {pins.map((pin, index) => {
        // basemap modunda konum projeksiyondan (px) gelir; klasik modda 0-1 normalize
        // koordinattan (%) gelir. İki modda da geçersiz konumlu pin render EDİLMEZ.
        const projected = usingTiles ? positions[pin.id] : undefined
        const clampedX = usingTiles ? null : clampUnit(pin.x ?? Number.NaN)
        const clampedY = usingTiles ? null : clampUnit(pin.y ?? Number.NaN)
        if (usingTiles ? !projected : clampedX === null || clampedY === null) return null
        const selected = currentSelected === pin.id
        const isCluster = typeof pin.count === 'number'
        const pinId = `${baseId}-pin-${pin.id}`
        const wrapStyle = projected
          ? { left: `${projected.left}px`, top: `${projected.top}px`, zIndex: selected ? 2 : 1 }
          : { left: `${(clampedX as number) * 100}%`, top: `${(clampedY as number) * 100}%`, zIndex: selected ? 2 : 1 }
        return (
          <div key={pin.id} className={styles.pinWrap} style={wrapStyle}>
            {/* ... mevcut buton ve popup içeriği aynen korunur ... */}
          </div>
        )
      })}
```

Popup yön hesaplarını, basemap modunda kapsayıcı oranına göre yapacak şekilde uyarla — `popupVertical`/`popupAlign` çağrılarında `clampedY`/`clampedX` yerine normalize edilmiş değeri kullan:

```tsx
        const normX = projected && tilesRef.current
          ? projected.left / Math.max(1, tilesRef.current.clientWidth)
          : (clampedX as number)
        const normY = projected && tilesRef.current
          ? projected.top / Math.max(1, tilesRef.current.clientHeight)
          : (clampedY as number)
```

ve popup'ta `data-vertical={popupVertical(normY)}` / `data-align={popupAlign(normX)}` kullan.

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassMap/GlassMap.test.tsx`
Expected: PASS — mevcut testlerin tamamı (geriye uyum kanıtı) + yeni 5 test

- [ ] **Step 5: Commit**

```bash
git add src/components/GlassMap/GlassMap.tsx src/components/GlassMap/GlassMap.test.tsx
git commit -m "feat(GlassMap): basemap prop'u ile gerçek tile zemini desteği"
```

---

### Task 3: `GlassMap` tile katmanı stilleri

**Files:**
- Modify: `src/components/GlassMap/GlassMap.module.css`

**Interfaces:**
- Consumes: Task 2'de eklenen `styles.tiles`, `styles.zoomCtl`, `styles.zoomBtn`, `styles.attribution`, `styles.basemapNotice` sınıf adları
- Produces: —

- [ ] **Step 1: Mikro-geometri değişkenlerini `.root` bloğuna ekle**

`src/components/GlassMap/GlassMap.module.css` içindeki `.root` bloğundaki mevcut değişken listesinin sonuna:

```css
  --map-zoom-btn-size: 30px;
  --map-zoom-radius: 10px;
  --map-attr-pad: 2px 7px;
```

- [ ] **Step 2: Tile katmanı ve kontrolleri ekle**

Dosyanın sonuna:

```css
/* ── Gerçek tile zemini (basemap) ─────────────────────────────────────────
   Leaflet konteyneri .canvasClip içinde kırpılır; kök overflow:hidden almaz,
   popup taşması korunur (bkz. .root yorumu). */
.tiles {
  position: absolute;
  inset: 0;
  background: var(--lg-bg);
}

/* Ton, tile sağlayıcısından bağımsız olarak burada verilir. Amaç zemini sitenin
   sıcak nötrlerine yaklaştırmak; renk kaynağı tile olduğu için filtre kullanılır. */
.tiles[data-tone='quiet'] {
  filter: saturate(0.34) sepia(0.16) brightness(1.03) contrast(0.96);
}

.tiles[data-tone='raw'] {
  filter: none;
}

.tiles[data-tone='satellite'] {
  filter: saturate(0.86) contrast(1.06) brightness(0.94);
}

@media (prefers-color-scheme: dark) {
  /* Koyu temada ters çevirme YOK — etiketler okunaklı kalsın diye yalnız karartma. */
  .tiles[data-tone='quiet'] {
    filter: saturate(0.24) brightness(0.58) contrast(1.08);
  }

  .tiles[data-tone='satellite'] {
    filter: saturate(0.8) brightness(0.78) contrast(1.1);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .tiles {
    filter: none;
  }
}

.zoomCtl {
  position: absolute;
  z-index: 3;
  top: var(--lg-space-2);
  right: var(--lg-space-2);
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border: var(--lg-border-width, 1px) solid var(--lg-hairline);
  border-radius: var(--map-zoom-radius);
  background: var(--lg-surface);
  box-shadow: var(--lg-shadow-sm);
}

.zoomBtn {
  display: grid;
  width: var(--map-zoom-btn-size);
  height: var(--map-zoom-btn-size);
  border: 0;
  background: transparent;
  color: var(--lg-label-secondary);
  cursor: pointer;
  font: inherit;
  font-size: var(--lg-text-footnote);
  place-items: center;
}

.zoomBtn + .zoomBtn {
  border-top: var(--lg-border-width, 1px) solid var(--lg-hairline);
}

.zoomBtn:focus-visible {
  outline: var(--lg-focus-ring-width, 2px) solid var(--lg-accent);
  outline-offset: calc(var(--lg-focus-ring-offset, 2px) * -1);
}

.attribution {
  position: absolute;
  z-index: 3;
  bottom: var(--lg-space-2);
  left: var(--lg-space-2);
  padding: var(--map-attr-pad);
  border-radius: var(--lg-radius-chip);
  background: var(--lg-surface);
  color: var(--lg-label-secondary);
  font-size: var(--lg-text-badge);
}

.attribution a {
  color: inherit;
}

.basemapNotice {
  position: absolute;
  z-index: 3;
  right: var(--lg-space-2);
  bottom: var(--lg-space-2);
  margin: 0;
  padding: var(--map-attr-pad);
  border-radius: var(--lg-radius-chip);
  background: var(--lg-surface);
  color: var(--lg-label-secondary);
  font-size: var(--lg-text-badge);
}

@media (hover: hover) {
  .zoomBtn:hover {
    background: var(--lg-fill-quaternary);
    color: var(--lg-label);
  }
}

@media (pointer: coarse) {
  .zoomBtn {
    width: var(--lg-control-md);
    height: var(--lg-control-md);
  }
}
```

- [ ] **Step 3: Kullanılan token'ların gerçekten tanımlı olduğunu doğrula**

Run: `grep -n -- "--lg-fill-quaternary\|--lg-control-md\|--lg-text-badge\|--lg-shadow-sm\|--lg-radius-chip" src/index.css`
Expected: her biri en az bir kez tanımlı. Tanımsız çıkan olursa en yakın tanımlı token'la değiştir (ör. `--lg-fill-quaternary` yoksa `color-mix(in srgb, var(--lg-label) 6%, transparent)`).

- [ ] **Step 4: Testleri ve tipleri çalıştır**

Run: `npx vitest run src/components/GlassMap/ && npx tsc -b && npm run lint`
Expected: hepsi temiz

- [ ] **Step 5: Commit**

```bash
git add src/components/GlassMap/GlassMap.module.css
git commit -m "feat(GlassMap): tile zemini, zoom kontrolü ve atıf yüzeyi stilleri"
```

---

### Task 4: `GlassMap` story'leri ve `rules.md`

**Files:**
- Modify: `src/components/GlassMap/GlassMap.stories.tsx`
- Modify: `src/components/GlassMap/rules.md`

**Interfaces:**
- Consumes: `GlassMapBasemap` (Task 1), `basemap` prop'u (Task 2)
- Produces: —

- [ ] **Step 1: Story'leri ekle**

`src/components/GlassMap/GlassMap.stories.tsx` dosyasına, mevcut story'lerin altına:

```tsx
const osmBasemap = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: (
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      © OpenStreetMap katkıcıları
    </a>
  ),
  center: [39, 35.2] as [number, number],
  zoom: 6,
  maxZoom: 19,
}

const geoPins: GlassMapPin[] = [
  { id: 'urla', lat: 38.322, lng: 26.764, price: '4.250.000 TL' },
  { id: 'golbasi', lat: 39.783, lng: 32.809, price: '1.850.000 TL' },
  { id: 'kas', lat: 36.2, lng: 29.64, price: '6.900.000 TL' },
  { id: 'ege', lat: 37.04, lng: 27.43, count: 18 },
]

/** Gerçek tile zemini — sessiz ton, sitenin sıcak nötrlerine yaklaştırılmış. */
export const GercekZeminSessiz: Story = {
  args: { pins: geoPins, basemap: osmBasemap, label: 'Arsa ilanları haritası' },
}

/** Filtresiz tile — sağlayıcının kendi paleti. */
export const GercekZeminHam: Story = {
  args: { pins: geoPins, basemap: { ...osmBasemap, tone: 'raw' }, label: 'Ham zemin' },
}

/** Popup ile birlikte gerçek zemin. */
export const GercekZeminPopup: Story = {
  args: {
    pins: geoPins,
    basemap: osmBasemap,
    defaultSelectedId: 'golbasi',
    popupContent: (id: string) => <strong>{id === 'golbasi' ? 'Gölbaşı · 1.240 m²' : id}</strong>,
    label: 'Popuplı harita',
  },
}
```

Dosyanın üstündeki import satırına `GlassMapPin` tipini ekle (yoksa):

```tsx
import { GlassMap, type GlassMapPin } from './GlassMap'
```

- [ ] **Step 2: Storybook'ta gözle doğrula**

Run: `npm run dev:storybook`
Kontrol listesi:
- `Bileşenler/Medya ve Harita/GlassMap` altında üç yeni story görünüyor
- Zemin fildişiye yakın, doygunluğu düşük (sessiz ton)
- Fiyat kapsülleri ve cluster rozeti tasarım dilinde, Leaflet'in mavi daireleri **yok**
- Zoom kontrolleri sağ üstte, cam yüzeyli; Leaflet'in kendi kutusu görünmüyor
- Atıf sol altta, tek kez, linkli
- Sistem temasını koyuya alınca zemin kararıyor ama etiketler okunur kalıyor

- [ ] **Step 3: `rules.md`'yi güncelle**

`src/components/GlassMap/rules.md` içinde:
- §1'deki "MapLibre adaptörü, bkz. Açık Kararlar" ifadesini kaldır; gerçek zeminin `basemap` prop'uyla desteklendiğini yaz.
- §2 semantik sözleşmeye ekle: `basemap` verildiğinde zemin `aria-hidden` bir Leaflet konteyneridir; zoom kontrolleri `aria-label`'lı butonlardır (`Yakınlaştır` / `Uzaklaştır`); atıf lisans gereği görünür ve linklidir; yükleme hatasında `role="status"` ile bildirim yapılır ve seed'li SVG zemine düşülür.
- §4/§6'ya ekle: pin konumu `basemap` yokken `x`/`y` (0-1 normalize), varken `lat`/`lng` üzerindendir; moda uymayan pin sessizce atlanır.
- §9 borç notlarına ekle: `--map-zoom-btn-size`, `--map-zoom-radius`, `--map-attr-pad` mikro-geometri değerleri; `tone` filtre değerleri (token karşılığı yok, tile paletini nötrlemek için ampirik).
- "Açık Kararlar" bölümündeki gerçek harita adaptörü maddesini **kapat**: karar `basemap` + Leaflet projeksiyonu lehine verildi; Leaflet marker/kontrol katmanı bilerek kullanılmıyor.

- [ ] **Step 4: Commit**

```bash
git add src/components/GlassMap/GlassMap.stories.tsx src/components/GlassMap/rules.md
git commit -m "docs(GlassMap): gerçek zemin story'leri ve v2 sözleşme notları"
```

---

### Task 5: `GlassHero` — `eyebrow` slotu ve split'te `search`

**Files:**
- Modify: `src/components/GlassHero/GlassHero.tsx`
- Modify: `src/components/GlassHero/GlassHero.module.css`
- Modify: `src/components/GlassHero/GlassHero.test.tsx`
- Modify: `src/components/GlassHero/GlassHero.stories.tsx`
- Modify: `src/components/GlassHero/rules.md`

**Interfaces:**
- Consumes: —
- Produces: `GlassHeroProps`'a eklenen `eyebrow?: ReactNode`; `search` slotu artık `variant === 'search' || variant === 'split'` koşuluyla render edilir

- [ ] **Step 1: Başarısız testleri yaz**

`src/components/GlassHero/GlassHero.test.tsx` içindeki `describe` bloğuna ekle:

```tsx
  it('eyebrow slotu başlığın önünde render olur', () => {
    render(<GlassHero title="Başlık" eyebrow={<span data-testid="eyebrow">Arsa</span>} />)
    const eyebrow = screen.getByTestId('eyebrow')
    const heading = screen.getByRole('heading', { level: 2 })
    // DOM sırası: eyebrow başlıktan önce gelir
    expect(eyebrow.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('search slotu split varyantında da render olur', () => {
    render(<GlassHero title="B" variant="split" search={<input aria-label="Arsa ara" />} />)
    expect(screen.getByLabelText('Arsa ara')).toBeDefined()
  })
```

Mevcut "search slotu yalnız search varyantında render olur" testi `variant="centered"` ile karşılaştırma yaptığı için değişmeden geçmeye devam eder; testin adını `search slotu centered varyantında render olmaz` olarak güncelle.

- [ ] **Step 2: Testlerin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassHero/GlassHero.test.tsx`
Expected: FAIL — iki yeni test düşer

- [ ] **Step 3: `GlassHero.tsx`'i güncelle**

`GlassHeroProps` içine, `title`'ın hemen üstüne:

```tsx
  /** Başlığın üstünde duran küçük slot — sekme şeridi, etiket veya kırıntı yolu */
  eyebrow?: ReactNode
```

Fonksiyon parametrelerine `eyebrow,` ekle. `blocks` dizisinin **başına**:

```tsx
    eyebrow ? (
      <div key="eyebrow" className={styles.eyebrow}>
        {eyebrow}
      </div>
    ) : null,
```

`search` slotunun koşulunu genişlet:

```tsx
    (variant === 'search' || variant === 'split') && search ? (
      <div key="search" className={styles.searchSlot}>
        {search}
      </div>
    ) : null,
```

- [ ] **Step 4: CSS ekle**

`src/components/GlassHero/GlassHero.module.css` dosyasına, `.searchSlot` kuralının yanına:

```css
.eyebrow { display: flex; flex-wrap: wrap; gap: var(--lg-space-2); align-items: center; }
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassHero/GlassHero.test.tsx`
Expected: PASS

- [ ] **Step 6: Story ekle**

`src/components/GlassHero/GlassHero.stories.tsx` dosyasına:

```tsx
/** Sekme şeridi eyebrow slotunda, arama split varyantının search slotunda. */
export const SplitEyebrowVeArama: Story = {
  args: {
    variant: 'split',
    titleAs: 'h2',
    eyebrow: <GlassSegmentedControl label="İlan türü" options={[{ value: 'arsa', label: 'Arsa' }, { value: 'konut', label: 'Konut' }]} />,
    title: 'Önce haritada gör, sonra karar ver',
    subtitle: 'Bölgeyi seç, doğrulanmış ilanlara konum üzerinden ulaş.',
    search: <GlassInput aria-label="Arsa ara" placeholder="Bölge, bütçe veya imar tercihini yaz" />,
    media: <div style={{ aspectRatio: '4 / 3', background: 'var(--lg-fill-quaternary)', borderRadius: 'var(--lg-radius-media)' }} />,
  },
}
```

Gerekli importları dosyanın üstüne ekle:

```tsx
import { GlassSegmentedControl } from '../GlassSegmentedControl'
import { GlassInput } from '../GlassInput'
```

- [ ] **Step 7: `rules.md`'yi güncelle**

`src/components/GlassHero/rules.md` içindeki slot tablosuna `eyebrow` satırını ekle (başlığın üstünde, kademeli girişte ilk blok) ve `search` slotunun artık `search` **ve** `split` varyantlarında render edildiğini yaz.

- [ ] **Step 8: Commit**

```bash
git add src/components/GlassHero/
git commit -m "feat(GlassHero): eyebrow slotu ve split varyantında arama slotu"
```

---

### Task 6: Ana sayfa fixture'ları — sekme başına içerik

**Files:**
- Create: `apps/web/src/features/home-concepts/map-first/heroTabs.ts`
- Create: `apps/web/src/features/home-concepts/map-first/heroTabs.test.ts`

**Interfaces:**
- Consumes: `GlassMapPin` (`@repo/ui`)
- Produces:
  - `HeroTabId` — `'arsa' | 'konut' | 'proje'`
  - `HeroTab` — `{ id: HeroTabId; label: string; title: string; subtitle: string; placeholder: string; suggestions: string[]; quickFilters: string[]; parsedFilters: { id: string; label: string; value: string }[]; confidence: number; pins: GlassMapPin[]; verifiedCount: string; verifiedLabel: string }`
  - `HERO_TABS: HeroTab[]`
  - `isHeroTabId(value: unknown): value is HeroTabId`
  - `heroTab(id: HeroTabId): HeroTab`

- [ ] **Step 1: Başarısız testi yaz**

Create `apps/web/src/features/home-concepts/map-first/heroTabs.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { HERO_TABS, heroTab, isHeroTabId } from './heroTabs'

describe('hero sekme verisi', () => {
  it('üç sekme tanımlar ve ilki arsa olur', () => {
    expect(HERO_TABS.map((tab) => tab.id)).toEqual(['arsa', 'konut', 'proje'])
  })

  it('her sekmenin haritada en az bir coğrafi pini vardır', () => {
    for (const tab of HERO_TABS) {
      expect(tab.pins.length).toBeGreaterThan(0)
      for (const pin of tab.pins) {
        expect(Number.isFinite(pin.lat)).toBe(true)
        expect(Number.isFinite(pin.lng)).toBe(true)
      }
    }
  })

  it('her sekmede AI çıkarımı için en az bir filtre ve geçerli güven skoru vardır', () => {
    for (const tab of HERO_TABS) {
      expect(tab.parsedFilters.length).toBeGreaterThan(0)
      expect(tab.confidence).toBeGreaterThanOrEqual(0)
      expect(tab.confidence).toBeLessThanOrEqual(100)
    }
  })

  it('isHeroTabId yalnız bilinen kimlikleri kabul eder', () => {
    expect(isHeroTabId('arsa')).toBe(true)
    expect(isHeroTabId('konut')).toBe(true)
    expect(isHeroTabId('villa')).toBe(false)
    expect(isHeroTabId(undefined)).toBe(false)
  })

  it('heroTab bilinmeyen kimlikte arsa sekmesine düşer', () => {
    expect(heroTab('arsa').id).toBe('arsa')
    expect(heroTab('konut').id).toBe('konut')
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/home-concepts/map-first/heroTabs.test.ts`
Expected: FAIL — `Failed to resolve import "./heroTabs"`

- [ ] **Step 3: Fixture dosyasını yaz**

Create `apps/web/src/features/home-concepts/map-first/heroTabs.ts`:

```ts
// Ana sayfa hero'sunun sekme başına içeriği. Sekme değişince başlık, arama
// yer tutucusu, AI çıkarım chip'leri, hızlı filtreler, harita pinleri ve
// doğrulama sayacı birlikte değişir (bkz. spec §5).
import type { GlassMapPin } from '@repo/ui'

export type HeroTabId = 'arsa' | 'konut' | 'proje'

export interface HeroParsedFilter {
  id: string
  label: string
  value: string
}

export interface HeroTab {
  id: HeroTabId
  label: string
  title: string
  subtitle: string
  placeholder: string
  suggestions: string[]
  quickFilters: string[]
  parsedFilters: HeroParsedFilter[]
  confidence: number
  pins: GlassMapPin[]
  verifiedCount: string
  verifiedLabel: string
}

export const HERO_TABS: HeroTab[] = [
  {
    id: 'arsa',
    label: 'Arsa',
    title: 'Önce haritada gör, sonra karar ver',
    subtitle:
      'Ada–parsel, imar durumu ve yol cephesi bilgisiyle birlikte doğrulanmış parseller.',
    placeholder: 'Bölge, bütçe veya imar tercihini yaz',
    suggestions: [
      'Urla konut imarlı arsa',
      'Kaş deniz manzaralı arsa',
      'Gölbaşı yol cepheli tarla',
    ],
    quickFilters: ['Konut imarlı', 'Yola cepheli', 'Tarla', 'Deniz manzarası'],
    parsedFilters: [
      { id: 'bolge', label: 'Bölge', value: 'Urla' },
      { id: 'butce', label: 'Bütçe', value: '≤ 4.000.000 TL' },
      { id: 'imar', label: 'İmar', value: 'Konut' },
    ],
    confidence: 92,
    pins: [
      { id: '1084526631', lat: 38.322, lng: 26.764, price: '4.250.000 TL' },
      { id: '1084526632', lat: 39.783, lng: 32.809, price: '1.850.000 TL' },
      { id: '1084526634', lat: 36.2, lng: 29.64, price: '6.900.000 TL' },
      { id: 'ege-cluster', lat: 37.04, lng: 27.43, count: 18 },
      { id: 'marmara-cluster', lat: 40.35, lng: 29.06, count: 9 },
    ],
    verifiedCount: '18.412',
    verifiedLabel: 'doğrulanmış arsa ilanı',
  },
  {
    id: 'konut',
    label: 'Konut',
    title: 'Evi mahallesiyle birlikte gör',
    subtitle:
      'Okul, ulaşım ve aidat bilgisi ilan kartının içinde; fiyat geçmişi harita üzerinde.',
    placeholder: 'Semt, oda sayısı veya bütçeni yaz',
    suggestions: [
      'Çeşme 3+1 site içinde',
      'Ankara Çayyolu sıfır daire',
      'İzmir Bornova kiralık 2+1',
    ],
    quickFilters: ['3+1', 'Site içinde', 'Sıfır bina', 'Eşyalı'],
    parsedFilters: [
      { id: 'semt', label: 'Semt', value: 'Çeşme' },
      { id: 'oda', label: 'Oda', value: '3+1' },
      { id: 'butce', label: 'Bütçe', value: '≤ 7.000.000 TL' },
    ],
    confidence: 88,
    pins: [
      { id: 'ist-cluster', lat: 41.01, lng: 28.98, count: 48 },
      { id: 'konut-bursa', lat: 40.19, lng: 29.06, price: '6.400.000 TL' },
      { id: 'ank-cluster', lat: 39.93, lng: 32.86, count: 31 },
      { id: 'konut-izmir', lat: 38.42, lng: 27.14, price: '5.150.000 TL' },
    ],
    verifiedCount: '42.860',
    verifiedLabel: 'doğrulanmış konut ilanı',
  },
  {
    id: 'proje',
    label: 'Proje',
    title: 'Teslim tarihinden önce yerini seç',
    subtitle:
      'Devam eden projelerin etap planı, teslim takvimi ve müteahhit doğrulaması bir arada.',
    placeholder: 'Şehir, teslim yılı veya müteahhit yaz',
    suggestions: [
      '2027 teslim İstanbul projesi',
      'İzmir deniz manzaralı proje',
      'Ankara kentsel dönüşüm',
    ],
    quickFilters: ['2027 teslim', 'Deniz manzaralı', 'Kentsel dönüşüm'],
    parsedFilters: [
      { id: 'sehir', label: 'Şehir', value: 'İstanbul' },
      { id: 'teslim', label: 'Teslim', value: '2027' },
    ],
    confidence: 84,
    pins: [
      { id: 'proje-ist', lat: 41.01, lng: 28.98, price: '12 etap' },
      { id: 'proje-antalya', lat: 36.9, lng: 30.7, price: '6 etap' },
      { id: 'proje-ankara', lat: 39.93, lng: 32.86, count: 7 },
    ],
    verifiedCount: '1.284',
    verifiedLabel: 'doğrulanmış proje',
  },
]

export function isHeroTabId(value: unknown): value is HeroTabId {
  return value === 'arsa' || value === 'konut' || value === 'proje'
}

export function heroTab(id: HeroTabId): HeroTab {
  return HERO_TABS.find((tab) => tab.id === id) ?? HERO_TABS[0]
}
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/home-concepts/map-first/heroTabs.test.ts`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/home-concepts/map-first/heroTabs.ts apps/web/src/features/home-concepts/map-first/heroTabs.test.ts
git commit -m "feat(web): ana sayfa hero sekme fixture'ları"
```

---

### Task 7: `MapFirstHome` hero'sunu yeniden kur

**Files:**
- Modify: `apps/web/src/features/home-concepts/map-first/MapFirstHome.tsx:101-139`
- Modify: `apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css:26-52`
- Create: `apps/web/src/features/home-concepts/map-first/MapFirstHome.test.tsx`
- Delete: `apps/web/src/features/home-concepts/map-first/LeafletListingMap.tsx`
- Delete: `apps/web/src/features/home-concepts/map-first/LeafletListingMap.module.css`

**Interfaces:**
- Consumes: `HERO_TABS`, `heroTab`, `HeroTabId` (Task 6); `basemap` prop'u (Task 2); `eyebrow` + split `search` slotları (Task 5)
- Produces: `MapFirstHomeProps`'a eklenen `tab?: HeroTabId`, `defaultTab?: HeroTabId`, `onTabChange?: (tab: HeroTabId) => void`

- [ ] **Step 1: Başarısız testi yaz**

Create `apps/web/src/features/home-concepts/map-first/MapFirstHome.test.tsx`:

```tsx
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
    expect(screen.getByText('3+1')).toBeDefined()
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
    const removes = screen.getAllByRole('button', { name: 'Kaldır' })
    fireEvent.click(removes[0])
    expect(screen.queryByText('Urla')).toBeNull()
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/home-concepts/map-first/MapFirstHome.test.tsx`
Expected: FAIL — sekme radio'ları ve yeni başlık yok

- [ ] **Step 3: `MapFirstHome.tsx`'i güncelle**

Import bloğunu değiştir — `LeafletListingMap` çıkar, kütüphane bileşenleri girer:

```tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  GlassAgencyCard,
  GlassAiSearchBar,
  GlassButton,
  GlassChip,
  GlassHero,
  GlassMap,
  GlassMetricStrip,
  GlassSegmentedControl,
  GlassVitrin,
} from '@repo/ui'
import { agencyFixtures, homeVitrinItems } from '../fixtures'
import { HERO_TABS, heroTab, type HeroTabId, type HeroParsedFilter } from './heroTabs'
import { HomeConceptFrame } from '../shared/HomeConceptFrame'
import { HomeFooter } from '../shared/HomeFooter'
import styles from './MapFirstHome.module.css'
```

Dosyanın başındaki `mapPins` sabitini **sil** (artık `heroTabs.ts`'te).

Zemin tanımını dosya seviyesinde sabit olarak ekle — her render'da yeni nesne üretmemek için:

```tsx
// Zemin sabit referans: her render'da yeni nesne üretilirse harita yeniden kurulur.
const HERO_BASEMAP = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: (
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      © OpenStreetMap katkıcıları
    </a>
  ),
  center: [39, 35.2] as [number, number],
  zoom: 5.5,
  maxZoom: 19,
  tone: 'quiet' as const,
}
```

Props arayüzünü genişlet:

```tsx
export interface MapFirstHomeProps {
  showConceptNavigation?: boolean
  /** Controlled sekme */
  tab?: HeroTabId
  /** Uncontrolled başlangıç sekmesi */
  defaultTab?: HeroTabId
  onTabChange?: (tab: HeroTabId) => void
}
```

Fonksiyon gövdesinin başına sekme durumunu ve türetilmiş içeriği ekle:

```tsx
export function MapFirstHome({
  showConceptNavigation = true,
  tab,
  defaultTab = 'arsa',
  onTabChange,
}: MapFirstHomeProps) {
  const navigate = useNavigate()
  const [innerTab, setInnerTab] = useState<HeroTabId>(defaultTab)
  const activeTabId = tab ?? innerTab
  const active = heroTab(activeTabId)
  const [removedFilters, setRemovedFilters] = useState<string[]>([])
  const parsedFilters: HeroParsedFilter[] = active.parsedFilters.filter(
    (filter) => !removedFilters.includes(`${active.id}:${filter.id}`),
  )

  const selectTab = (next: string) => {
    if (next !== 'arsa' && next !== 'konut' && next !== 'proje') return
    if (tab === undefined) setInnerTab(next)
    onTabChange?.(next)
  }
```

Hero bloğunu tamamen değiştir:

```tsx
      <div className={styles.hero}>
        <GlassHero
          variant="split"
          titleAs="h1"
          eyebrow={
            <GlassSegmentedControl
              label="İlan türü"
              options={HERO_TABS.map((item) => ({ value: item.id, label: item.label }))}
              value={activeTabId}
              onChange={selectTab}
            />
          }
          title={active.title}
          subtitle={active.subtitle}
          search={
            <div className={styles.heroSearch}>
              <GlassAiSearchBar
                placeholder={active.placeholder}
                suggestions={active.suggestions}
                parsedFilters={parsedFilters}
                confidence={active.confidence}
                onRemoveFilter={(id) => setRemovedFilters((prev) => [...prev, `${active.id}:${id}`])}
                onSubmit={goToSearch}
                aria-label="İlanları yapay zekâ ile ara"
              />
            </div>
          }
          actions={
            <div className={styles.quickFilters}>
              {active.quickFilters.map((filter) => (
                <GlassChip key={filter} size="sm">
                  {filter}
                </GlassChip>
              ))}
            </div>
          }
          media={
            <div className={styles.mapRegion}>
              <GlassMap
                className={styles.heroMap}
                variant="panel"
                label={`${active.label} haritası`}
                pins={active.pins}
                basemap={HERO_BASEMAP}
                popupContent={(id) => {
                  const pin = active.pins.find((item) => item.id === id)
                  return pin ? <strong>{pin.price ?? `${pin.count} ilan`}</strong> : null
                }}
              />
            </div>
          }
        />
        <div className={styles.trustBand}>
          <GlassMetricStrip
            size="sm"
            label="Doğrulama göstergeleri"
            items={[
              { id: 'verified', label: 'Doğrulanmış', value: active.verifiedCount, hint: active.verifiedLabel },
              { id: 'today', label: 'Bugün doğrulanan', value: '12', hint: 'EİDS tapu eşleşmesi' },
              { id: 'cities', label: 'İl', value: '81', hint: 'Türkiye geneli' },
            ]}
          />
        </div>
      </div>
```

`animate={false}` kaldırıldı — `GlassHero` kademeli girişi açar ve `prefers-reduced-motion`'da kendini kapatır.

- [ ] **Step 4: CSS'i güncelle**

`apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css` içinde:

Ölü kuralları **sil** — `.mapRegion .heroMap` ve `.mapPopup` blokları (satır 31-52) hiçbir düğüme uygulanmıyordu.

`.mapRegion`'ı çerçeveli panele çevir:

```css
.mapRegion {
  min-width: 0;
  height: 100%;
  min-height: 21.875rem;
}

.heroMap {
  height: 100%;
  min-height: inherit;
  border-radius: var(--lg-radius-card);
  box-shadow: var(--lg-shadow-sm);
}

.quickFilters {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: var(--lg-space-2);
}

.trustBand {
  padding-block: var(--lg-space-4);
  padding-inline: var(--lg-space-5);
  border-top: var(--lg-border-width, 1px) solid var(--lg-hairline);
}
```

Alt kısımdaki `@container (max-width: 32rem)` bloğunda `.mapRegion .heroMap` seçicisini `.mapRegion` olarak düzelt:

```css
  .mapRegion {
    min-height: 17.5rem;
  }
```

- [ ] **Step 5: Eski harita dosyalarını sil**

```bash
git rm apps/web/src/features/home-concepts/map-first/LeafletListingMap.tsx apps/web/src/features/home-concepts/map-first/LeafletListingMap.module.css
```

- [ ] **Step 6: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/home-concepts/`
Expected: PASS

- [ ] **Step 7: Tam doğrulama**

Run: `npm test && npx tsc -b && npm run typecheck:web && npm run lint`
Expected: hepsi temiz. `LeafletListingMap`'e kalan referans varsa tsc yakalar.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/features/home-concepts/map-first/
git commit -m "feat(web): ana sayfa hero'sunu sekmeli AI ajan girişiyle yeniden kur"
```

---

### Task 8: Sekmeyi URL'e bağla

**Files:**
- Modify: `apps/web/src/routes/index.tsx`
- Create: `apps/web/src/routes/index.test.tsx`

**Interfaces:**
- Consumes: `MapFirstHomeProps.tab` / `onTabChange`, `isHeroTabId` (Task 6, 7)
- Produces: `/` rotasında `validateSearch` — `{ tur?: HeroTabId }`

- [ ] **Step 1: Başarısız testi yaz**

Create `apps/web/src/routes/index.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import * as HomeRoute from './index'

type RouteOptions = {
  validateSearch?: (search: Record<string, unknown>) => Record<string, string>
}

function options(): RouteOptions {
  return HomeRoute.Route.options as RouteOptions
}

describe('/ rotası', () => {
  it('geçerli tur parametresini korur', () => {
    expect(options().validateSearch?.({ tur: 'konut' })).toEqual({ tur: 'konut' })
  })

  it('geçersiz tur parametresini düşürür', () => {
    expect(options().validateSearch?.({ tur: 'villa' })).toEqual({})
  })

  it('bilinmeyen parametreleri temizler', () => {
    expect(options().validateSearch?.({ tur: 'arsa', utm: 'x' })).toEqual({ tur: 'arsa' })
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/routes/index.test.tsx`
Expected: FAIL — `validateSearch` tanımlı değil

- [ ] **Step 3: Rotayı güncelle**

`apps/web/src/routes/index.tsx` dosyasını değiştir:

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { MapFirstHome } from '@/features/home-concepts/map-first/MapFirstHome'
import { isHeroTabId, type HeroTabId } from '@/features/home-concepts/map-first/heroTabs'

export const Route = createFileRoute('/')({
  head: () => createPageHead('home'),
  // Sekme durumu paylaşılabilir olsun diye URL'de taşınır; geçersiz değer düşer.
  validateSearch: (search: Record<string, unknown>): { tur?: HeroTabId } =>
    isHeroTabId(search.tur) ? { tur: search.tur } : {},
  component: HomePage,
})

function HomePage() {
  const { tur } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <MapFirstHome
      showConceptNavigation={false}
      tab={tur ?? 'arsa'}
      onTabChange={(next) => {
        void navigate({ search: next === 'arsa' ? {} : { tur: next }, replace: true })
      }}
    />
  )
}
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run apps/web/src/routes/index.test.tsx`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/index.tsx apps/web/src/routes/index.test.tsx
git commit -m "feat(web): ana sayfa sekmesini URL'e bağla"
```

---

### Task 9: Uçtan uca doğrulama

**Files:**
- Modify: (gerekirse) önceki görevlerde dokunulan dosyalar

**Interfaces:**
- Consumes: Task 1-8'in tamamı
- Produces: —

- [ ] **Step 1: Tüm doğrulama komutlarını çalıştır**

Run:

```bash
npm test
npx tsc -b
npm run typecheck:web
npm run lint
```

Expected: dördü de temiz. Kırmızı varsa ilgili göreve dönüp düzelt, bu görevde devam etme.

- [ ] **Step 2: Uygulamayı aç ve hero'yu gözle doğrula**

Run: `npm run dev:web`

Kontrol listesi (`http://localhost:3000`):
- Harita zemini fildişiye yakın, doygunluğu düşük — mavi denizler ve pembe otoyollar yok
- Harita paneli yuvarlatılmış köşeli, hairline çerçeveli, gölgeli
- Fiyat kapsülleri ve cluster rozetleri tasarım dilinde; Leaflet'in mavi daireleri yok
- Zoom kontrolleri sağ üstte, sitenin yüzeyinde; Leaflet'in kendi kutusu görünmüyor
- Atıf sol altta **tek kez**, linkli
- Sekmeye tıklayınca başlık, alt başlık, arama yer tutucusu, hızlı filtreler, pinler ve doğrulama sayacı birlikte değişiyor
- Sekme değişince URL `?tur=konut` oluyor; sayfayı yenileyince aynı sekme açılıyor; `?tur=villa` yazınca arsa sekmesine düşüyor
- AI çıkarım chip'lerinde güven yüzdesi görünüyor; chip'in × butonuna basınca chip kayboluyor
- Hero'nun altında doğrulama şeridi var
- Klavye: Tab ile sekmelere gelinebiliyor, ok tuşlarıyla sekme değişiyor; harita pinlerine Tab ile gelinip ok tuşlarıyla gezilebiliyor; her odakta amber focus halkası görünüyor

- [ ] **Step 3: Koyu tema ve azaltılmış hareket kontrolü**

Sistem temasını koyuya al, sayfayı yenile:
- Zemin kararıyor ama şehir etiketleri okunur kalıyor
- Fiyat kapsülleri ve zoom kontrolleri koyu yüzeyde kontrastlı

İşletim sisteminde "hareketi azalt" ayarını aç, sayfayı yenile:
- Hero'nun kademeli girişi yok
- Harita zoom animasyonu yok

- [ ] **Step 4: Storybook kontrolü**

Run: `npm run dev:storybook`
- `Bileşenler/Medya ve Harita/GlassMap` → üç yeni gerçek zemin story'si çalışıyor
- `Bileşenler/Vitrin ve Yerleşim/GlassHero` → `SplitEyebrowVeArama` story'si çalışıyor
- Mevcut `GlassMap` story'leri (seed'li SVG) bozulmamış

- [ ] **Step 5: Spec'i kapat**

`docs/superpowers/specs/2026-07-27-ana-sayfa-hero-ai-first-design.md` dosyasının başındaki **Durum** satırını güncelle:

```markdown
**Durum:** Uygulandı — `docs/superpowers/plans/2026-07-27-ana-sayfa-hero-ai-first.md`
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-07-27-ana-sayfa-hero-ai-first-design.md
git commit -m "docs: ana sayfa hero spec'ini uygulandı olarak işaretle"
```

---

## Kapsam dışı (bu plan uygulamaz)

Spec §9 ile aynı:

- `LeafletRegionMap` ve `LeafletPropertyPicker`'ın `GlassMap`'e taşınması — aynı `basemap` adaptörü ikisini de emebilir, ayrı dalga.
- Gerçek varlık çıkarımı (NLP) — `parsedFilters` fixture'dan gelir, arayüz sözleşmesi hazır bırakılır.
- B, D, H, I varyantlarının konsept sayfası olarak uygulanması.
- Sessiz tile sağlayıcısına (CARTO/Stadia) geçiş — yalnız `HERO_BASEMAP.tileUrl` değişikliğidir, hesap/lisans işi gerektirir.
