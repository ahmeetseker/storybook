// Kütüphanesiz harita yüzeyi v1 + gerçek zemin v2 (bkz. rules.md Kapatılan Kararlar) —
// gerçek zemin `basemap` prop'uyla Leaflet üzerinden sağlanır (yalnız projeksiyon/tile
// motoru olarak; bkz. useBasemap.ts).
// İçerik katmanı FLAT: cam yok, backdrop-filter yok. Zemin seed'li deterministik SVG
// sokak dokusuyla üretilir (Math.random YASAK — seeded PRNG kullanılır).
import { useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import styles from './GlassMap.module.css'
import { clusterPoints, isDegenerateBounds, type ClusterPoint, type LatLngBounds } from './clusterPins'
import { useBasemap, type BasemapPoint, type GlassMapBasemap } from './useBasemap'

/**
 * Pin tonu — durum rengini semantic token'dan okur. Birleşik variant değildir:
 * `tone` tek başına yalnız rengi taşır, pinin biçimini (kapsül/rozet) `price`
 * ve `count` alanları belirler (bkz. EksenlerVeDurumlar.mdx).
 */
export type GlassMapPinTone = 'accent' | 'success' | 'warning' | 'danger'

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
  /** Durum tonu — varsayılan `accent` */
  tone?: GlassMapPinTone
}

/** `cluster` prop'unun ayrıntılı biçimi. `true` vermek varsayılanları seçer. */
export interface GlassMapClusterOptions {
  /**
   * Aynı rozete girme eşiği, PİKSEL. Ekranda sabit olduğu için yakınlaştıkça
   * kümeler kendiliğinden çözülür. Varsayılan 64.
   */
  radius?: number
  /**
   * Bu seviyeden sonra kümeleme yapılmaz, her ilan kendi fiyat kapsülüyle
   * görünür — kullanıcı "en sona" indiğinde rozet kalmasın diye. Varsayılan 15.
   */
  disableAtZoom?: number
}

export interface GlassMapPrivacyCircle {
  /** Merkez — 0-1 normalize (yalnız `basemap` yokken kullanılır) */
  x: number
  y: number
  /** Yarıçap — 0-1 normalize (genişliğe oranla; yalnız `basemap` yokken) */
  r: number
  /**
   * Gerçek zemin üzerindeki merkez. `basemap` verildiğinde daire BURADAN
   * konumlanır ve `radiusMeters` ile ölçeklenir — x/y/r şematik yedek içindir.
   * Verilmezse gerçek zeminde daire çizilmez (yanlış yerde bir mahremiyet
   * dairesi göstermek, hiç göstermemekten kötüdür).
   */
  lat?: number
  lng?: number
  /** Yarıçap, METRE. Zoom değiştikçe daire zeminle birlikte ölçeklenir. */
  radiusMeters?: number
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
  /**
   * Zoom'a bağlı kümeleme. Açıkken birbirine yakın pinler tek rozette toplanır;
   * rozete tıklamak kadrajı o rozetin kapsadığı bölgeye indirir ve alt kümeler
   * açılır. Kullanıcı yaklaştıkça rozetler çözülüp tek tek fiyat kapsüllerine,
   * oradan da ilan detayına iner.
   *
   * YALNIZ `basemap` verildiğinde etkindir: sentetik SVG zemininde
   * yakınlaştırma olmadığı için kümeyi açacak bir hareket yoktur.
   */
  cluster?: boolean | GlassMapClusterOptions
  /**
   * Bir küme rozeti açıldığında (kadraj o bölgeye inerken) çağrılır. Kadraj
   * hareketini component kendisi yapar; bu geri çağrı yalnız üst bileşenin
   * listeyi daraltması gibi yan etkiler içindir.
   */
  onClusterOpen?: (memberIds: string[]) => void
  /**
   * Kadraj her değiştiğinde (sürükleme, yakınlaştırma, rozetle iniş) o anki
   * coğrafi sınırı bildirir. "Bu alanda ara" gibi kadraj tabanlı filtreler
   * bunu okur — harita kendisi filtre uygulamaz, yalnız nerede olduğunu söyler.
   */
  onViewportChange?: (bounds: [[number, number], [number, number]]) => void
}

/**
 * Mahremiyet dairesinin merkezi projeksiyona pin gibi girer; id'si hiçbir
 * gerçek pinle çakışmasın diye ayrılmıştır (pin id'leri tüketiciden gelir).
 */
const PRIVACY_POINT_ID = '__lg-privacy-center__'

const DEFAULT_CLUSTER_RADIUS = 64
const DEFAULT_CLUSTER_DISABLE_ZOOM = 15
/** Çökmüş sınırda (üst üste binen ilanlar) uygulanan sabit yaklaşma adımı. */
const DEGENERATE_ZOOM_STEP = 3

/** Rozet ölçüsü sayıya göre üç kademede büyür (bkz. rules.md §3). */
function clusterScale(count: number): 'sm' | 'md' | 'lg' {
  if (count < 10) return 'sm'
  if (count < 50) return 'md'
  return 'lg'
}

/**
 * Ekrana çizilecek tek bir işaret. Kümeleme açıkken `clusterPoints` çıktısından,
 * kapalıyken doğrudan `pins`'ten türetilir — render tarafı iki modu ayırt etmez.
 */
interface RenderNode {
  key: string
  /** Seçim/popup için pin kimliği — yalnız tekil düğümlerde anlamlıdır */
  pinId?: string
  /** Piksel konumu (zemin çalışıyorsa) */
  pixel?: { left: number; top: number }
  /** 0-1 normalize konum (sentetik zemin) */
  unit?: { x: number; y: number }
  kind: 'cluster' | 'price'
  count?: number
  price?: string
  tone: GlassMapPinTone
  /** Rozet açılınca kadrajın oturacağı sınır */
  bounds?: LatLngBounds
  memberIds: string[]
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

/** Tek bir pinden (kümelenmemiş) render düğümü — biçimi `count`/`price` belirler. */
function singleNode(
  pin: GlassMapPin,
  placement: Pick<RenderNode, 'pixel' | 'unit'>,
  bounds?: LatLngBounds,
): RenderNode {
  const isCluster = typeof pin.count === 'number'
  return {
    key: pin.id,
    pinId: pin.id,
    ...placement,
    kind: isCluster ? 'cluster' : 'price',
    count: isCluster ? pin.count : undefined,
    price: isCluster ? undefined : pin.price,
    tone: pin.tone ?? 'accent',
    bounds,
    memberIds: [pin.id],
  }
}

/**
 * Çizilecek düğümleri üretir. İki mod tek çıktıya indirgenir:
 *  • Kümeleme açık ve zemin hazır → `clusterPoints` çıktısı (rozet + tekil pin).
 *  • Aksi halde → bugünkü davranış: her pin doğrudan kendi düğümü.
 */
function buildRenderNodes(input: {
  pins: GlassMapPin[]
  positions: Record<string, { left: number; top: number }>
  usingTiles: boolean
  clusteringActive: boolean
  radius: number
  withinPanel: (left: number, top: number) => boolean
}): RenderNode[] {
  const { pins, positions, usingTiles, clusteringActive, radius, withinPanel } = input
  const nodes: RenderNode[] = []

  if (clusteringActive) {
    const byId = new Map<string, GlassMapPin>()
    const points: ClusterPoint[] = []
    for (const pin of pins) {
      byId.set(pin.id, pin)
      const projected = positions[pin.id]
      if (!projected) continue
      if (!Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) continue
      points.push({
        id: pin.id,
        lat: pin.lat as number,
        lng: pin.lng as number,
        left: projected.left,
        top: projected.top,
      })
    }
    for (const node of clusterPoints(points, radius)) {
      if (!withinPanel(node.left, node.top)) continue
      const placement = { pixel: { left: node.left, top: node.top } }
      if (node.memberIds.length === 1) {
        const pin = byId.get(node.memberIds[0])
        if (pin) nodes.push(singleNode(pin, placement, node.bounds))
        continue
      }
      // Önceden toplanmış pinler (kendi `count`'u olanlar) rozete kendi
      // ağırlıklarıyla girer; aksi halde 12 ilanı temsil eden bir pin, iki
      // pinlik bir rozette "2" olarak görünürdü.
      let total = 0
      for (const id of node.memberIds) total += byId.get(id)?.count ?? 1
      nodes.push({
        key: node.id,
        ...placement,
        kind: 'cluster',
        count: total,
        tone: 'accent',
        bounds: node.bounds,
        memberIds: node.memberIds,
      })
    }
    return nodes
  }

  for (const pin of pins) {
    // Konum kaynağı moda göre kesin olarak ayrılır:
    //  • Zemin çalışıyorsa konum YALNIZ projeksiyondan gelir. Görünür alan
    //    dışına çıkan pin çizilmez — x/y'ye düşseydi harita kaydırılınca pin
    //    zeminden kopup sabit bir noktada belirirdi.
    //  • Klasik (sentetik) modda ya da zemin yüklenemediğinde 0-1 normalize
    //    x/y kullanılır; böylece yalnız lat/lng verilen pin'ler zemin hatasında
    //    sessizce kaybolmaz (bkz. rules.md §7).
    const projected = usingTiles ? positions[pin.id] : undefined
    if (usingTiles) {
      if (!projected) continue
      if (!withinPanel(projected.left, projected.top)) continue
      nodes.push(singleNode(pin, { pixel: { left: projected.left, top: projected.top } }))
      continue
    }
    const x = clampUnit(pin.x ?? Number.NaN)
    const y = clampUnit(pin.y ?? Number.NaN)
    if (x === null || y === null) continue
    nodes.push(singleNode(pin, { unit: { x, y } }))
  }
  return nodes
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
  cluster = false,
  onClusterOpen,
  onViewportChange,
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
  // Mahremiyet dairesinin merkezi de projeksiyona girer: gerçek zeminde daire
  // pinlerle aynı kadraj hesabını kullanmalı, yoksa harita kaydırılınca daire
  // zeminden kopardı.
  const privacyLat = privacyCircle?.lat
  const privacyLng = privacyCircle?.lng
  const pointsSignature = `${pins
    .map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`)
    .join('|')}#${privacyLat}:${privacyLng}`
  const basemapPoints = useMemo<BasemapPoint[]>(() => {
    const points: BasemapPoint[] = pins.map((pin) => ({ id: pin.id, lat: pin.lat, lng: pin.lng }))
    if (privacyLat !== undefined && privacyLng !== undefined) {
      points.push({ id: PRIVACY_POINT_ID, lat: privacyLat, lng: privacyLng })
    }
    return points
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsSignature])
  // `selectedId !== undefined` controlled tespiti: prop `null` (controlled boş
  // seçim) verildiğinde de bu true'dur, böylece parent seçimi temizlediğinde
  // eski iç seçim geri sızmaz (bkz. rules.md §4/§6).
  const isSelectionControlled = selectedId !== undefined
  const currentSelected = isSelectionControlled ? selectedId : innerSelected
  const currentLayer = layer ?? innerLayer

  const {
    status: basemapStatus,
    positions,
    size,
    zoom: currentZoom,
    zoomIn,
    zoomOut,
    fitBounds,
    zoomAround,
    metersToPixels,
    getViewportBounds,
  } = useBasemap(tilesRef, basemap, basemapPoints, currentLayer)

  // Kadraj değişimi `zoom`/`positions` üzerinden anlaşılır: ikisi de yalnız
  // harita gerçekten hareket ettiğinde tazelenir. Sınır okuması efekt içinde
  // yapılır, render sırasında değil — render'da okumak Leaflet'in henüz
  // yerleşmemiş kadrajını yakalayabilirdi.
  const viewportRef = useRef('')
  useEffect(() => {
    if (!onViewportChange || basemapStatus !== 'ready') return
    const bounds = getViewportBounds()
    if (!bounds) return
    const signature = bounds.flat().join(',')
    if (signature === viewportRef.current) return
    viewportRef.current = signature
    onViewportChange(bounds)
  }, [basemapStatus, currentZoom, positions, getViewportBounds, onViewportChange])
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

  // ── Kümeleme ayarları ────────────────────────────────────────────────────
  const clusterOptions: GlassMapClusterOptions | undefined =
    cluster === false ? undefined : cluster === true ? {} : cluster
  const clusterRadius = clusterOptions?.radius ?? DEFAULT_CLUSTER_RADIUS
  const clusterDisableZoom = clusterOptions?.disableAtZoom ?? DEFAULT_CLUSTER_DISABLE_ZOOM
  // Kümeleme YALNIZ gerçek zemin çalışırken anlamlıdır: sentetik SVG yüzeyinde
  // yakınlaştırma olmadığı için açılan bir rozetin gidecek yeri yoktur.
  const clusteringActive = Boolean(clusterOptions) && usingTiles && basemapStatus === 'ready'

  // Projeksiyon, kadrajın CULL_MARGIN kadar dışındaki noktaları da döndürür
  // (kenardaki rozetin sayısı doğru çıksın diye). Panelin gerçekten dışına
  // düşen düğüm burada elenir — kök `overflow:hidden` almadığı için aksi halde
  // etiketler sayfa içeriğinin üstüne akardı.
  const withinPanel = (left: number, top: number) =>
    size.width <= 0 || size.height <= 0 || (left >= 0 && top >= 0 && left <= size.width && top <= size.height)

  const nodes = buildRenderNodes({
    pins,
    positions,
    usingTiles,
    clusteringActive,
    radius: currentZoom >= clusterDisableZoom ? 0 : clusterRadius,
    withinPanel,
  })

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

  /**
   * Küme rozetini açar: kadraj rozetin kapsadığı bölgeye iner, bir sonraki
   * kademedeki rozetler/pinler kendiliğinden ortaya çıkar. Bu, haritanın
   * "ülke → bölge → şehir → ilan" iniş zincirinin tek adımıdır.
   */
  const openCluster = (node: RenderNode) => {
    onClusterOpen?.(node.memberIds)
    if (!node.bounds) return
    if (isDegenerateBounds(node.bounds)) {
      // Üst üste binen ilanlar: sınır tek noktaya çökmüş, sabit adım yaklaş.
      zoomAround([node.bounds[0][0], node.bounds[0][1]], DEGENERATE_ZOOM_STEP)
      return
    }
    fitBounds(node.bounds)
  }

  const activateNode = (node: RenderNode) => {
    // Kümeleme açıkken rozet bir "iniş" kontrolüdür (seçim değil); kapalıyken
    // bugünkü sözleşme korunur ve rozet de seçilebilir bir pindir.
    if (node.kind === 'cluster' && clusteringActive) {
      openCluster(node)
      return
    }
    if (node.pinId) selectPin(node.pinId)
  }

  const focusPinAt = (index: number) => {
    if (nodes.length === 0) return
    const clamped = (index + nodes.length) % nodes.length
    const target = nodes[clamped]
    if (!target) return
    rootRef.current?.querySelector<HTMLButtonElement>(`[id="${baseId}-pin-${target.key}"]`)?.focus()
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

      {/* Mahremiyet dairesi gerçek zeminde: SVG yüzeyi çizilmediği için daire
          ayrı bir katman olarak, zeminle birlikte ölçeklenerek çizilir.
          `lat/lng` verilmemişse çizilmez — dairenin yanlış yerde durması,
          hiç durmamasından kötüdür (yanlış bir mahremiyet iddiası). */}
      {usingTiles && privacyCircle?.lat !== undefined && privacyCircle.lng !== undefined
        ? (() => {
            const center = positions[PRIVACY_POINT_ID]
            const radius = metersToPixels(
              privacyCircle.lat,
              privacyCircle.lng,
              privacyCircle.radiusMeters ?? 0,
            )
            if (!center || !(radius > 0)) return null
            return (
              <div
                className={styles.privacyDisc}
                aria-hidden="true"
                style={{
                  left: `${center.left}px`,
                  top: `${center.top}px`,
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                }}
              />
            )
          })()
        : null}

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

      {nodes.map((node, index) => {
        const selected = node.pinId !== undefined && currentSelected === node.pinId
        const isCluster = node.kind === 'cluster'
        const elementId = `${baseId}-pin-${node.key}`
        const wrapStyle = node.pixel
          ? { left: `${node.pixel.left}px`, top: `${node.pixel.top}px`, zIndex: selected ? 2 : 1 }
          : {
              left: `${(node.unit?.x ?? 0) * 100}%`,
              top: `${(node.unit?.y ?? 0) * 100}%`,
              zIndex: selected ? 2 : 1,
            }
        const panelWidth = size.width
        const panelHeight = size.height
        const normX = node.pixel
          ? node.pixel.left / Math.max(1, panelWidth)
          : (node.unit?.x ?? 0)
        const normY = node.pixel
          ? node.pixel.top / Math.max(1, panelHeight)
          : (node.unit?.y ?? 0)
        // Kenara yakın pin, etiketi panel dışına sarkmasın diye içeri hizalanır.
        // Eşik piksel tabanlı: etiket genişliği sabit olduğundan dar panelde
        // oransal bir eşik yetersiz kalır (mobilde fiyat etiketi taşardı).
        const edgeMarginX = panelWidth > 0 ? Math.min(0.45, 62 / panelWidth) : 0.07
        const edgeMarginY = panelHeight > 0 ? Math.min(0.45, 26 / panelHeight) : 0.09
        const edgeX = normX < edgeMarginX ? 'start' : normX > 1 - edgeMarginX ? 'end' : undefined
        const edgeY = normY < edgeMarginY ? 'start' : normY > 1 - edgeMarginY ? 'end' : undefined
        // Rozet çapasının üstünde ortalanır; fiyat kapsülü ise sapının ucundaki
        // nokta koordinatın ÜSTÜNE oturur (referans davranışı) — kapsül konumun
        // yukarısında durur, nokta konumu işaretler.
        const drillable = isCluster && clusteringActive
        return (
          <div
            key={node.key}
            className={styles.pinWrap}
            style={wrapStyle}
            data-kind={node.kind}
            // Ton sarmalayıcıda taşınır: sap ve nokta butonun kardeşidir,
            // rengi ancak ortak bir üstten okuyabilir.
            data-tone={node.tone}
            data-edge-x={edgeX}
            data-edge-y={edgeY}
          >
            <button
              id={elementId}
              type="button"
              className={[
                styles.pin,
                isCluster ? styles.pinCluster : styles.pinPrice,
                selected ? styles.pinSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-tone={node.tone}
              data-scale={isCluster ? clusterScale(node.count ?? 0) : undefined}
              // Rozet kümeleme modunda bir iniş kontrolüdür, iki durumlu bir
              // seçim değil: `aria-pressed` yalnız gerçekten seçilebilen
              // pinlerde bildirilir (bkz. rules.md §2).
              aria-pressed={drillable ? undefined : selected}
              aria-label={
                isCluster
                  ? drillable
                    ? `${node.count} ilan — bu bölgeye yaklaş`
                    : `${node.count} ilan`
                  : undefined
              }
              onClick={() => activateNode(node)}
              onKeyDown={(e) => onPinKeyDown(e, index)}
            >
              {isCluster ? node.count : node.price}
            </button>
            {isCluster ? null : <span className={styles.pinStem} aria-hidden="true" />}
            {selected && node.pinId && popupContent ? (
              <div
                className={styles.popup}
                data-vertical={popupVertical(normY)}
                data-align={popupAlign(normX)}
                role="group"
                aria-label={`${node.price ?? node.pinId} detayı`}
              >
                <div className={styles.popupInner}>
                  <button
                    type="button"
                    className={styles.popupClose}
                    aria-label="Popup'ı kapat"
                    onClick={() => selectPin(node.pinId as string)}
                  >
                    ×
                  </button>
                  {popupContent(node.pinId)}
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
