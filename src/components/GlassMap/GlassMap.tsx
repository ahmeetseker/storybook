// Kütüphanesiz harita yüzeyi v1 + gerçek zemin v2 (bkz. rules.md Kapatılan Kararlar) —
// gerçek zemin `basemap` prop'uyla Leaflet üzerinden sağlanır (yalnız projeksiyon/tile
// motoru olarak; bkz. useBasemap.ts).
// İçerik katmanı FLAT: cam yok, backdrop-filter yok. Zemin seed'li deterministik SVG
// sokak dokusuyla üretilir (Math.random YASAK — seeded PRNG kullanılır).
import { useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import styles from './GlassMap.module.css'
import { useBasemap, type BasemapPoint, type GlassMapBasemap } from './useBasemap'

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

export interface GlassMapPrivacyCircle {
  /** Merkez — 0-1 normalize */
  x: number
  y: number
  /** Yarıçap — 0-1 normalize (genişliğe oranla) */
  r: number
}

export interface GlassMapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  pins: GlassMapPin[]
  /**
   * Controlled seçili pin. `undefined` → uncontrolled (iç state kullanılır);
   * `null` → controlled BOŞ seçim; `string` → controlled seçili pin id'si.
   * Prop verilip verilmediği (`undefined` mi değil mi) controlled tespiti
   * için kullanılır — bir kez controlled başlayan harita boş seçimi `null`
   * ile ifade etmelidir, `undefined`'a dönmek uncontrolled'a geri düşer.
   */
  selectedId?: string | null
  /** Uncontrolled başlangıç seçimi */
  defaultSelectedId?: string
  /** Seçim değişince çağrılır (aynı pine tekrar tıklama seçimi kaldırır → undefined) */
  onPinSelect?: (pinId: string | undefined) => void
  /** Seçili pinin üstünde gösterilecek popup içeriği */
  popupContent?: (pinId: string) => ReactNode
  /** Controlled zemin katmanı */
  layer?: 'yol' | 'uydu'
  /** Uncontrolled başlangıç katmanı */
  defaultLayer?: 'yol' | 'uydu'
  onLayerChange?: (layer: 'yol' | 'uydu') => void
  /** Yaklaşık konum dairesi (tam adres gizliliği) */
  privacyCircle?: GlassMapPrivacyCircle
  /** inline: 16:9 gömülü kart · panel: dikey dolu (üst bileşen yüksekliği verir) */
  variant?: 'inline' | 'panel'
  /** Sokak dokusu üretim tohumu — aynı seed her zaman aynı düzeni verir */
  seed?: number | string
  /** Kök bölgenin erişilebilir adı */
  label?: string
  /**
   * Gerçek tile zemini. Verilmezse component seed'li SVG sokak dokusunda kalır
   * (bugünkü davranış). Verildiğinde pin'ler `lat`/`lng` üzerinden konumlanır.
   */
  basemap?: GlassMapBasemap
}

// ── Seed'den deterministik üretim (Math.random YASAK) ──────────────────────
function hashSeed(seed: number | string): number {
  const str = String(seed)
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sortedPositions(count: number, rng: () => number): number[] {
  const step = 100 / (count + 1)
  const values: number[] = []
  for (let i = 1; i <= count; i++) {
    const jitter = (rng() - 0.5) * step * 0.6
    values.push(Math.min(94, Math.max(6, step * i + jitter)))
  }
  return values.sort((a, b) => a - b)
}

interface StreetBlock {
  x: number
  y: number
  w: number
  h: number
  variant: 0 | 1 | 2
}

interface StreetGrid {
  vLines: number[]
  hLines: number[]
  blocks: StreetBlock[]
}

function generateStreetGrid(seed: number | string): StreetGrid {
  const rng = mulberry32(hashSeed(seed))
  const vCount = 4 + Math.floor(rng() * 3)
  const hCount = 3 + Math.floor(rng() * 3)
  const vLines = sortedPositions(vCount, rng)
  const hLines = sortedPositions(hCount, rng)
  const vBounds = [0, ...vLines, 100]
  const hBounds = [0, ...hLines, 100]
  const blocks: StreetBlock[] = []
  for (let i = 0; i < vBounds.length - 1; i++) {
    for (let j = 0; j < hBounds.length - 1; j++) {
      if (rng() < 0.85) {
        const pad = 2.5 + rng() * 2
        const w = vBounds[i + 1] - vBounds[i] - pad * 2
        const h = hBounds[j + 1] - hBounds[j] - pad * 2
        if (w > 1 && h > 1) {
          blocks.push({
            x: vBounds[i] + pad,
            y: hBounds[j] + pad,
            w,
            h,
            variant: Math.floor(rng() * 3) as 0 | 1 | 2,
          })
        }
      }
    }
  }
  return { vLines, hLines, blocks }
}

// ── Normalize koordinat güvenliği ───────────────────────────────────────────
// pin/privacyCircle koordinatları dışarıdan (API/consumer) gelir; finite
// olmayan (NaN/Infinity) ya da 0-1 aralığı dışındaki değerler harita
// kutusunun dışında — ama yine de tıklanabilir/etkileşimli — bir öğe
// üretmesin diye 0-1'e kenetlenir. Finite olmayan değer render EDİLMEZ
// (aşağıdaki render bu `null` dönüşünü "atla" olarak yorumlar).
function clampUnit(value: number): number | null {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null
}

const blockClass = [styles.block, styles.blockAlt, styles.blockGreen]

const LAYERS: { value: 'yol' | 'uydu'; label: string }[] = [
  { value: 'yol', label: 'Yol' },
  { value: 'uydu', label: 'Uydu' },
]

// ── Popup kenar sınırı: kök artık `overflow:hidden` taşımıyor (bkz. .root), bu yüzden
// popup hiçbir zaman tamamen görünmez olmaz; yine de üst/sol/sağ kenara çok yakın
// pinlerde okunabilirliği artırmak için yön ve hizalama pin konumuna göre çevrilir.
function popupVertical(pinY: number): 'above' | 'below' {
  return pinY < 0.24 ? 'below' : 'above'
}

function popupAlign(pinX: number): 'start' | 'center' | 'end' {
  if (pinX < 0.18) return 'start'
  if (pinX > 0.82) return 'end'
  return 'center'
}

export function GlassMap({
  pins,
  selectedId,
  defaultSelectedId,
  onPinSelect,
  popupContent,
  layer,
  defaultLayer = 'yol',
  onLayerChange,
  privacyCircle,
  variant = 'inline',
  seed = 1,
  label,
  basemap,
  className,
  ...rest
}: GlassMapProps) {
  const baseId = useId()
  const [innerSelected, setInnerSelected] = useState<string | undefined>(defaultSelectedId)
  const [innerLayer, setInnerLayer] = useState<'yol' | 'uydu'>(defaultLayer)
  const rootRef = useRef<HTMLDivElement>(null)
  const tilesRef = useRef<HTMLDivElement>(null)

  // pins referansı her render'da yeni olabilir (yaygın: parent'ta inline dizi literali);
  // useBasemap'in projeksiyon effect'i `points` referansını bağımlılık olarak kullanıyor,
  // bu yüzden burada yalnız projeksiyonu etkileyen alanların (id/lat/lng) içerik imzasına
  // göre referans sabitlenir — gereksiz project() çağrısı önlenir (bkz. görev risk notu).
  const pointsSignature = pins.map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`).join('|')
  const basemapPoints = useMemo<BasemapPoint[]>(
    () => pins.map((pin) => ({ id: pin.id, lat: pin.lat, lng: pin.lng })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pointsSignature],
  )
  // `selectedId !== undefined` controlled tespiti: prop `null` (controlled boş
  // seçim) verildiğinde de bu true'dur, böylece parent seçimi temizlediğinde
  // eski iç seçim geri sızmaz (bkz. rules.md §4/§6).
  const isSelectionControlled = selectedId !== undefined
  const currentSelected = isSelectionControlled ? selectedId : innerSelected
  const currentLayer = layer ?? innerLayer

  const { status: basemapStatus, positions, zoomIn, zoomOut } = useBasemap(
    tilesRef,
    basemap,
    basemapPoints,
    currentLayer,
  )
  // Zemin yüklenemezse seed'li SVG dokusuna düşülür — harita hiçbir zaman boş kutu olmaz.
  const usingTiles = Boolean(basemap) && basemapStatus !== 'error'
  // Katman toggle'ı YALNIZ gerçekten bir şeyi değiştirdiğinde gösterilir:
  // `basemap` yokken (sentetik SVG modu) toggle CSS'teki `[data-layer='uydu']`
  // seçicileriyle zemini gerçekten değiştirir — bugünkü davranış korunur.
  // `basemap` verildiğinde ise yalnız `satelliteTileUrl` de verilmişse toggle
  // gerçek bir tile geçişi yapar; verilmemişse toggle hiçbir şeyi değiştirmeyen
  // yanıltıcı bir kontrol olurdu, bu yüzden hiç render EDİLMEZ (bkz. Bulgu 1,
  // task-9-report.md).
  const showLayerToggle = !basemap || Boolean(basemap.satelliteTileUrl)

  const grid = useMemo(() => generateStreetGrid(seed), [seed])

  const selectPin = (pinId: string) => {
    const next = currentSelected === pinId ? undefined : pinId
    if (!isSelectionControlled) setInnerSelected(next)
    onPinSelect?.(next)
  }

  const clearSelection = () => {
    if (currentSelected == null) return
    if (!isSelectionControlled) setInnerSelected(undefined)
    onPinSelect?.(undefined)
  }

  const setLayer = (next: 'yol' | 'uydu') => {
    if (layer === undefined) setInnerLayer(next)
    onLayerChange?.(next)
  }

  const focusPinAt = (index: number) => {
    const clamped = (index + pins.length) % pins.length
    const target = pins[clamped]
    if (!target) return
    rootRef.current?.querySelector<HTMLButtonElement>(`[id="${baseId}-pin-${target.id}"]`)?.focus()
  }

  const onPinKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusPinAt(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusPinAt(index - 1)
    } else if (e.key === 'Escape') {
      clearSelection()
    }
  }

  // Radiogroup deseni: roving tabindex + ok tuşu navigasyonu (GlassSegmentedControl ile
  // aynı sözleşme — bkz. rules.md §2). Yalnız seçili segment Tab durağıdır.
  const onLayerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = LAYERS.findIndex((opt) => opt.value === currentLayer)
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % LAYERS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + LAYERS.length) % LAYERS.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = LAYERS.length - 1
    if (nextIndex === -1) return
    e.preventDefault()
    const next = LAYERS[nextIndex]
    setLayer(next.value)
    document.getElementById(`${baseId}-layer-${next.value}`)?.focus()
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label ?? 'Harita'}
      data-layer={currentLayer}
      data-variant={variant}
      className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
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
            <rect className={styles.ground} x={0} y={0} width={100} height={100} />
            {grid.blocks.map((block, i) => (
              <rect
                key={`b${i}`}
                className={blockClass[block.variant]}
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx={0.8}
              />
            ))}
            {grid.hLines.map((y, i) => (
              <line key={`h${i}`} className={styles.road} x1={0} y1={y} x2={100} y2={y} />
            ))}
            {grid.vLines.map((x, i) => (
              <line key={`v${i}`} className={styles.road} x1={x} y1={0} x2={x} y2={100} />
            ))}
            {privacyCircle
              ? (() => {
                  const cx = clampUnit(privacyCircle.x)
                  const cy = clampUnit(privacyCircle.y)
                  const r = clampUnit(privacyCircle.r)
                  if (cx === null || cy === null || r === null) return null
                  return <circle className={styles.privacyCircle} cx={cx * 100} cy={cy * 100} r={r * 100} />
                })()
              : null}
          </svg>
        )}
      </div>

      {showLayerToggle ? (
        <div className={styles.toggle} role="radiogroup" aria-label="Harita katmanı" onKeyDown={onLayerKeyDown}>
          {LAYERS.map((opt) => {
            const active = currentLayer === opt.value
            return (
              <button
                key={opt.value}
                id={`${baseId}-layer-${opt.value}`}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                className={[styles.toggleBtn, active ? styles.toggleBtnActive : ''].join(' ')}
                onClick={() => setLayer(opt.value)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      ) : null}

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

      {pins.map((pin, index) => {
        // basemap modunda konum projeksiyondan (px) gelir; klasik modda (ya da basemap
        // zemini yüklenemeyip projeksiyon yoksa) 0-1 normalize koordinattan (%) gelir.
        // Projeksiyon yoksa x/y'ye düşülür — böylece yalnız lat/lng verilen pin'ler zemin
        // hatasında sessizce kaybolmaz, ama x/y de verilmişse harita hiçbir zaman boş
        // kutu olmaz (bkz. rules.md). Ne projeksiyon ne finite x/y varsa pin render EDİLMEZ.
        const projected = usingTiles ? positions[pin.id] : undefined
        const clampedX = projected ? null : clampUnit(pin.x ?? Number.NaN)
        const clampedY = projected ? null : clampUnit(pin.y ?? Number.NaN)
        if (!projected && (clampedX === null || clampedY === null)) return null
        const selected = currentSelected === pin.id
        const isCluster = typeof pin.count === 'number'
        const pinId = `${baseId}-pin-${pin.id}`
        const wrapStyle = projected
          ? { left: `${projected.left}px`, top: `${projected.top}px`, zIndex: selected ? 2 : 1 }
          : { left: `${(clampedX as number) * 100}%`, top: `${(clampedY as number) * 100}%`, zIndex: selected ? 2 : 1 }
        const normX = projected && tilesRef.current
          ? projected.left / Math.max(1, tilesRef.current.clientWidth)
          : (clampedX as number)
        const normY = projected && tilesRef.current
          ? projected.top / Math.max(1, tilesRef.current.clientHeight)
          : (clampedY as number)
        return (
          <div key={pin.id} className={styles.pinWrap} style={wrapStyle}>
            <button
              id={pinId}
              type="button"
              className={[styles.pin, isCluster ? styles.pinCluster : styles.pinPrice, selected ? styles.pinSelected : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={selected}
              aria-label={isCluster ? `${pin.count} ilan` : undefined}
              onClick={() => selectPin(pin.id)}
              onKeyDown={(e) => onPinKeyDown(e, index)}
            >
              {isCluster ? pin.count : pin.price}
            </button>
            {selected && popupContent ? (
              <div
                className={styles.popup}
                data-vertical={popupVertical(normY)}
                data-align={popupAlign(normX)}
                role="group"
                aria-label={`${pin.price ?? pin.id} detayı`}
              >
                <div className={styles.popupInner}>
                  <button
                    type="button"
                    className={styles.popupClose}
                    aria-label="Popup'ı kapat"
                    onClick={() => selectPin(pin.id)}
                  >
                    ×
                  </button>
                  {popupContent(pin.id)}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export type { GlassMapBasemap } from './useBasemap'
