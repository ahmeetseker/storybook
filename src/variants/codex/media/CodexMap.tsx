import {
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge, CodexIconButton } from '../controls'
import {
  LocationIcon,
  MinusIcon,
  PlusIcon,
  MediaState,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { clamp, classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export type CodexMapMarkerKind = 'listing' | 'place' | 'transport' | 'school' | 'health'

export interface CodexMapMarker {
  id: string
  label: string
  x: number
  y: number
  kind?: CodexMapMarkerKind
  price?: string
  description?: string
  meta?: string
}

export interface CodexMapPrivacyCircle {
  x?: number
  y?: number
  radius?: number
  label?: string
  distanceLabel?: string
}

export interface CodexMapProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  markers: readonly CodexMapMarker[]
  label?: string
  description?: string
  status?: CodexMediaStatus
  selectedId?: string
  defaultSelectedId?: string
  onMarkerSelect?: (marker: CodexMapMarker) => void
  view?: 'map' | 'satellite'
  defaultView?: 'map' | 'satellite'
  onViewChange?: (view: 'map' | 'satellite') => void
  zoom?: number
  defaultZoom?: number
  minZoom?: number
  maxZoom?: number
  onZoomChange?: (zoom: number) => void
  privacyCircle?: CodexMapPrivacyCircle
  onRetry?: () => void
  showLegend?: boolean
}

const markerKindLabels: Record<CodexMapMarkerKind, string> = {
  listing: 'İlan',
  place: 'Yakın yer',
  transport: 'Ulaşım',
  school: 'Okul',
  health: 'Sağlık',
}

/** Dış harita sağlayıcısına bağımlı olmayan, erişilebilir pin ve gizlilik alanı sözleşmesi. */
export function CodexMap({
  markers,
  label = 'İlan konumu',
  description,
  status = 'ready',
  selectedId,
  defaultSelectedId,
  onMarkerSelect,
  view,
  defaultView = 'map',
  onViewChange,
  zoom,
  defaultZoom = 13,
  minZoom = 10,
  maxZoom = 18,
  onZoomChange,
  privacyCircle,
  onRetry,
  showLegend = true,
  className,
  ...rest
}: CodexMapProps) {
  const fallbackId = defaultSelectedId ?? markers[0]?.id ?? ''
  const [internalSelectedId, setSelectedId] = useControllableValue(selectedId, fallbackId)
  const [activeView, setActiveView] = useControllableValue(view, defaultView, onViewChange)
  const [activeZoom, setZoom] = useControllableValue(zoom, clamp(defaultZoom, minZoom, maxZoom), onZoomChange)
  const requestedIndex = markers.findIndex((marker) => marker.id === internalSelectedId)
  const selectedIndex = requestedIndex >= 0 ? requestedIndex : 0
  const selectedMarker = markers[selectedIndex]
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()
  const descriptionId = useId()
  const privacyId = useId()

  if (minZoom > maxZoom) throw new Error('CodexMap: minZoom, maxZoom değerinden büyük olamaz.')

  const selectMarker = (index: number, focus = false) => {
    const marker = markers[index]
    if (!marker) return
    setSelectedId(marker.id)
    onMarkerSelect?.(marker)
    if (focus) markerRefs.current[index]?.focus()
  }

  const handleMarkerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % markers.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + markers.length) % markers.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = markers.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectMarker(nextIndex, true)
  }

  const changeZoom = (next: number) => setZoom(clamp(next, minZoom, maxZoom))

  return (
    <section
      {...rest}
      className={classNames(styles.map, className)}
      aria-labelledby={titleId}
      aria-describedby={[description ? descriptionId : null, privacyCircle ? privacyId : null].filter(Boolean).join(' ') || undefined}
      aria-busy={status === 'loading' || undefined}
    >
      <header className={styles.mapHeader}>
        <div>
          <h2 id={titleId}>{label}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        <div className={styles.mapViewSwitch} aria-label="Harita görünümü">
          <button type="button" aria-pressed={activeView === 'map'} onClick={() => setActiveView('map')}>Harita</button>
          <button type="button" aria-pressed={activeView === 'satellite'} onClick={() => setActiveView('satellite')}>Uydu</button>
        </div>
      </header>

      {status !== 'ready' || !selectedMarker ? (
        <MediaState
          status={status === 'ready' ? 'empty' : status}
          onRetry={onRetry}
          emptyTitle="Haritada gösterilecek konum yok"
          emptyMessage="Konum bilgisi eklendiğinde ilan ve yakın çevre bu alanda gösterilir."
          errorTitle="Harita yüklenemedi"
          errorMessage="Konum verisine şu anda ulaşılamıyor. İlan adresini metin olarak kullanabilirsiniz."
        />
      ) : (
        <div className={styles.mapShell} data-view={activeView}>
          <div className={styles.mapCanvas} role="group" aria-label={`${label}. ${markers.length} işaretçi.`}>
            <div className={styles.mapLandscape} aria-hidden style={{ '--map-scale': 1 + (activeZoom - minZoom) * 0.012 } as CSSProperties}>
              <span className={styles.mapWater} />
              <span className={styles.mapRoadPrimary} />
              <span className={styles.mapRoadSecondary} />
              <span className={styles.mapBlockA} />
              <span className={styles.mapBlockB} />
              <span className={styles.mapBlockC} />
            </div>

            {privacyCircle ? (
              <span
                className={styles.privacyCircle}
                style={privacyCircleStyle(privacyCircle)}
                aria-hidden
              />
            ) : null}

            <div className={styles.markerLayer} aria-label="Harita işaretçileri">
              {markers.map((marker, index) => {
                const kind = marker.kind ?? 'listing'
                const selected = index === selectedIndex
                return (
                  <button
                    key={marker.id}
                    ref={(node) => { markerRefs.current[index] = node }}
                    type="button"
                    className={styles.mapMarker}
                    data-kind={kind}
                    data-selected={selected || undefined}
                    style={{ '--marker-x': `${clamp(marker.x)}%`, '--marker-y': `${clamp(marker.y)}%` } as CSSProperties}
                    aria-label={`${markerKindLabels[kind]}: ${marker.label}${marker.price ? `, ${marker.price}` : ''}`}
                    aria-pressed={selected}
                    onClick={() => selectMarker(index)}
                    onKeyDown={(event) => handleMarkerKeyDown(event, index)}
                  >
                    <span aria-hidden>{marker.price ?? markerKindSymbol(kind)}</span>
                  </button>
                )
              })}
            </div>

            <div className={styles.mapZoom} aria-label="Yakınlaştırma kontrolleri">
              <CodexIconButton label="Yakınlaştır" icon={<PlusIcon />} size="sm" disabled={activeZoom >= maxZoom} onClick={() => changeZoom(activeZoom + 1)} />
              <span aria-live="polite" aria-atomic="true">{activeZoom}</span>
              <CodexIconButton label="Uzaklaştır" icon={<MinusIcon />} size="sm" disabled={activeZoom <= minZoom} onClick={() => changeZoom(activeZoom - 1)} />
            </div>

            <aside className={styles.selectedMarkerCard} aria-live="polite" aria-atomic="true">
              <div>
                <CodexBadge tone={selectedMarker.kind === 'listing' || !selectedMarker.kind ? 'accent' : 'info'}>
                  {markerKindLabels[selectedMarker.kind ?? 'listing']}
                </CodexBadge>
                {selectedMarker.meta ? <span>{selectedMarker.meta}</span> : null}
              </div>
              <strong>{selectedMarker.label}</strong>
              {selectedMarker.description ? <p>{selectedMarker.description}</p> : null}
              {selectedMarker.price ? <b>{selectedMarker.price}</b> : null}
            </aside>
          </div>
        </div>
      )}

      {privacyCircle ? (
        <p id={privacyId} className={styles.privacyNote}>
          <span><LocationIcon /></span>
          <span><strong>{privacyCircle.label ?? 'Yaklaşık konum gösteriliyor.'}</strong> {privacyCircle.distanceLabel ?? 'İlan sahibinin mahremiyeti için kesin adres paylaşılmaz.'}</span>
        </p>
      ) : null}

      {showLegend && status === 'ready' && markers.length ? (
        <ul className={styles.mapLegend} aria-label="Harita açıklaması">
          {Array.from(new Set(markers.map((marker) => marker.kind ?? 'listing'))).map((kind) => (
            <li key={kind}><span data-kind={kind} aria-hidden />{markerKindLabels[kind]}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function markerKindSymbol(kind: CodexMapMarkerKind) {
  if (kind === 'transport') return 'U'
  if (kind === 'school') return 'O'
  if (kind === 'health') return '+'
  if (kind === 'place') return '•'
  return 'İ'
}

function privacyCircleStyle(circle: CodexMapPrivacyCircle) {
  const radius = clamp(circle.radius ?? 14, 4, 40)
  return {
    '--privacy-x': `${clamp(circle.x ?? 50)}%`,
    '--privacy-y': `${clamp(circle.y ?? 50)}%`,
    '--privacy-size': `${radius * 2}%`,
  } as CSSProperties
}
