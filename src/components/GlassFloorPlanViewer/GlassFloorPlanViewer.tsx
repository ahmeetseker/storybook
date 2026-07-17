import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassButton } from '../GlassButton'
import { GlassIconButton } from '../GlassIconButton'
import styles from './GlassFloorPlanViewer.module.css'

export interface GlassFloorPlanHotspot {
  /** Yatay konum, kat planı görselinin soluna göre 0–1 arası oran */
  x: number
  /** Dikey konum, kat planı görselinin üstüne göre 0–1 arası oran */
  y: number
  /** Tıklanınca açılan etiket balonunun metni (ör. "Salon") */
  label: string
}

export interface GlassFloorPlanPlan {
  /** Kat sekmesinde görünen isim (ör. "Zemin Kat") */
  label: string
  /** Kat planı görseli */
  src: string
  hotspots?: GlassFloorPlanHotspot[]
}

export interface GlassFloorPlanViewerProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  plans: GlassFloorPlanPlan[]
  /** Controlled kullanım için aktif kat index'i */
  activeIndex?: number
  /** Uncontrolled kullanımda başlangıç katı (varsayılan: 0) */
  defaultActiveIndex?: number
  onActiveIndexChange?: (index: number) => void
  tone?: 'light' | 'dark' | 'auto'
}

/** 1x altına inmez, 4x üstüne çıkmaz — spec gereği sabit aralık */
const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 0.5

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M5 12h14" />
  </svg>
)

export function GlassFloorPlanViewer({
  plans,
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  tone = 'auto',
  className,
  ...rest
}: GlassFloorPlanViewerProps) {
  const baseId = useId()
  const lastIndex = plans.length - 1

  const [innerIndex, setInnerIndex] = useState(() => clamp(defaultActiveIndex ?? 0, 0, Math.max(lastIndex, 0)))
  const currentIndex = clamp(activeIndex ?? innerIndex, 0, Math.max(lastIndex, 0))

  const [scale, setScale] = useState(MIN_SCALE)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [openHotspot, setOpenHotspot] = useState<number | null>(null)
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)

  // Kat değişince pan/zoom ve açık balon sıfırlanır — her kat kendi başlangıç görünümüyle açılır
  useEffect(() => {
    setScale(MIN_SCALE)
    setPan({ x: 0, y: 0 })
    setOpenHotspot(null)
  }, [currentIndex])

  if (plans.length === 0) return null
  const current = plans[currentIndex]

  const selectIndex = (index: number) => {
    const next = clamp(index, 0, lastIndex)
    if (activeIndex === undefined) setInnerIndex(next)
    onActiveIndexChange?.(next)
  }

  const zoomTo = (next: number) => setScale(clamp(next, MIN_SCALE, MAX_SCALE))
  const zoomIn = () => zoomTo(scale + ZOOM_STEP)
  const zoomOut = () => zoomTo(scale - ZOOM_STEP)
  const reset = () => {
    setScale(MIN_SCALE)
    setPan({ x: 0, y: 0 })
  }

  const onTabsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (plans.length === 0) return
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % plans.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + plans.length) % plans.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = lastIndex
    if (nextIndex === -1) return
    e.preventDefault()
    selectIndex(nextIndex)
    document.getElementById(`${baseId}-tab-${nextIndex}`)?.focus()
  }

  const onViewportPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Hotspot pin'i üzerinde sürükleme başlatma — tıklamayı ona bırak
    if ((e.target as HTMLElement).closest('button')) return
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    setDragging(true)
    // jsdom'da yok — optional chaining bilinçli (bkz. GlassSheet)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onViewportPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragState.current
    if (!start) return
    setPan({ x: start.panX + (e.clientX - start.startX), y: start.panY + (e.clientY - start.startY) })
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = null
    setDragging(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  // Yalnız Ctrl+wheel yakınlaştırır (trackpad pinch tarayıcıda ctrlKey olarak gelir);
  // düz wheel sayfa kaydırmasına karışmasın diye preventDefault edilmez.
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    zoomTo(scale + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))
  }

  const toggleHotspot = (index: number) => {
    setOpenHotspot((cur) => (cur === index ? null : index))
  }

  const hotspots = current.hotspots ?? []
  const activeHotspot = openHotspot !== null ? hotspots[openHotspot] : undefined
  const tooltipId = `${baseId}-tooltip`

  return (
    <GlassSurface
      as="section"
      shape={20}
      material="flat"
      tone={tone}
      thickness={0.4}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div role="tablist" aria-label="Kat seçimi" className={styles.tabs} onKeyDown={onTabsKeyDown}>
        {plans.map((plan, i) => {
          const selected = i === currentIndex
          return (
            <button
              key={`${plan.label}-${i}`}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => selectIndex(i)}
            >
              {plan.label}
            </button>
          )
        })}
      </div>

      <div className={styles.stage}>
        <div
          className={styles.viewport}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${currentIndex}`}
          data-dragging={dragging || undefined}
          onPointerDown={onViewportPointerDown}
          onPointerMove={onViewportPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
        >
          <div
            className={[styles.imageWrap, dragging ? styles.dragging : ''].filter(Boolean).join(' ')}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
          >
            <img
              className={styles.image}
              src={current.src}
              alt={`${current.label} kat planı`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
            {hotspots.map((hotspot, i) => (
              <button
                key={`${hotspot.label}-${i}`}
                type="button"
                className={styles.hotspot}
                style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
                aria-label={hotspot.label}
                aria-expanded={openHotspot === i}
                aria-describedby={openHotspot === i ? tooltipId : undefined}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleHotspot(i)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ))}
            {activeHotspot ? (
              <div
                id={tooltipId}
                role="tooltip"
                className={styles.tooltip}
                style={{ left: `${activeHotspot.x * 100}%`, top: `${activeHotspot.y * 100}%` }}
              >
                {activeHotspot.label}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.controls}>
          <GlassButton size="sm" tone={tone} onClick={reset}>
            Sıfırla
          </GlassButton>
          <div className={styles.zoomGroup}>
            <GlassIconButton label="Uzaklaştır" size="sm" tone={tone} onClick={zoomOut} disabled={scale <= MIN_SCALE}>
              <MinusIcon />
            </GlassIconButton>
            <span className={styles.zoomLevel} aria-live="polite">
              {Math.round(scale * 100)}%
            </span>
            <GlassIconButton label="Yakınlaştır" size="sm" tone={tone} onClick={zoomIn} disabled={scale >= MAX_SCALE}>
              <PlusIcon />
            </GlassIconButton>
          </div>
        </div>
      </div>
    </GlassSurface>
  )
}
