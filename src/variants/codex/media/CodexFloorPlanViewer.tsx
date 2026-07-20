import {
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge, CodexIconButton } from '../controls'
import {
  MinusIcon,
  PlusIcon,
  RotateIcon,
  MediaState,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { clamp, classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export interface CodexFloorPlanRoom {
  id: string
  label: string
  area?: string
  detail?: string
  x: number
  y: number
  width: number
  height: number
}

export interface CodexFloorPlan {
  id: string
  label: string
  area: string
  alt: string
  imageSrc?: string
  rooms: readonly CodexFloorPlanRoom[]
  note?: string
}

export interface CodexFloorPlanViewerProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  floors: readonly CodexFloorPlan[]
  label?: string
  description?: string
  status?: CodexMediaStatus
  selectedFloorId?: string
  defaultSelectedFloorId?: string
  onFloorChange?: (floor: CodexFloorPlan) => void
  selectedRoomId?: string
  defaultSelectedRoomId?: string
  onRoomSelect?: (room: CodexFloorPlanRoom, floor: CodexFloorPlan) => void
  zoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number) => void
  rotation?: 0 | 90 | 180 | 270
  defaultRotation?: 0 | 90 | 180 | 270
  onRotationChange?: (rotation: 0 | 90 | 180 | 270) => void
  onRetry?: () => void
}

/** Çok katlı planı gerçek tab ilişkisi, oda seçimi ve yakınlaştırma kontrolleriyle sunar. */
export function CodexFloorPlanViewer({
  floors,
  label = 'Kat planı',
  description = 'Kat ve oda seçerek plan detaylarını inceleyin.',
  status = 'ready',
  selectedFloorId,
  defaultSelectedFloorId,
  onFloorChange,
  selectedRoomId,
  defaultSelectedRoomId,
  onRoomSelect,
  zoom,
  defaultZoom = 100,
  onZoomChange,
  rotation,
  defaultRotation = 0,
  onRotationChange,
  onRetry,
  className,
  ...rest
}: CodexFloorPlanViewerProps) {
  const floorFallback = defaultSelectedFloorId ?? floors[0]?.id ?? ''
  const [internalFloorId, setFloorId] = useControllableValue(selectedFloorId, floorFallback)
  const requestedFloorIndex = floors.findIndex((floor) => floor.id === internalFloorId)
  const floorIndex = requestedFloorIndex >= 0 ? requestedFloorIndex : 0
  const activeFloor = floors[floorIndex]
  const roomFallback = defaultSelectedRoomId ?? activeFloor?.rooms[0]?.id ?? ''
  const [internalRoomId, setRoomId] = useControllableValue(selectedRoomId, roomFallback)
  const requestedRoomIndex = activeFloor?.rooms.findIndex((room) => room.id === internalRoomId) ?? -1
  const roomIndex = requestedRoomIndex >= 0 ? requestedRoomIndex : 0
  const activeRoom = activeFloor?.rooms[roomIndex]
  const [activeZoom, setZoom] = useControllableValue(zoom, clamp(defaultZoom, 75, 150), onZoomChange)
  const [activeRotation, setRotation] = useControllableValue(rotation, defaultRotation, onRotationChange)
  const floorRefs = useRef<Array<HTMLButtonElement | null>>([])
  const roomRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()
  const descriptionId = useId()
  const panelId = useId()

  const selectFloor = (index: number, focus = false) => {
    const floor = floors[index]
    if (!floor) return
    setFloorId(floor.id)
    onFloorChange?.(floor)
    if (focus) floorRefs.current[index]?.focus()
  }

  const handleFloorKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % floors.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + floors.length) % floors.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = floors.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectFloor(nextIndex, true)
  }

  const selectRoom = (index: number, focus = false) => {
    const room = activeFloor?.rooms[index]
    if (!room || !activeFloor) return
    setRoomId(room.id)
    onRoomSelect?.(room, activeFloor)
    if (focus) roomRefs.current[index]?.focus()
  }

  const handleRoomKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!activeFloor) return
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % activeFloor.rooms.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + activeFloor.rooms.length) % activeFloor.rooms.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = activeFloor.rooms.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectRoom(nextIndex, true)
  }

  const rotate = () => setRotation(((activeRotation + 90) % 360) as 0 | 90 | 180 | 270)

  return (
    <section
      {...rest}
      className={classNames(styles.floorPlan, className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={status === 'loading' || undefined}
    >
      <header className={styles.floorPlanHeader}>
        <div>
          <h2 id={titleId}>{label}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        {activeFloor ? <CodexBadge tone="neutral">{activeFloor.area}</CodexBadge> : null}
      </header>

      {status !== 'ready' || !activeFloor ? (
        <MediaState
          status={status === 'ready' ? 'empty' : status}
          onRetry={onRetry}
          emptyTitle="Kat planı eklenmedi"
          emptyMessage="Ölçülü bir kat planı eklendiğinde odalar ve kullanım alanları burada incelenebilir."
          errorTitle="Kat planı açılamadı"
          errorMessage="Plan dosyası görüntülenemiyor. İlan açıklamasındaki alan bilgilerini kullanabilirsiniz."
        />
      ) : (
        <div className={styles.floorPlanLayout}>
          <div className={styles.floorTabs} role="tablist" aria-label="Kat seçimi" aria-orientation="vertical">
            {floors.map((floor, index) => {
              const selected = index === floorIndex
              return (
                <button
                  key={floor.id}
                  ref={(node) => { floorRefs.current[index] = node }}
                  type="button"
                  role="tab"
                  id={`${panelId}-${floor.id}-tab`}
                  aria-selected={selected}
                  aria-controls={selected ? panelId : undefined}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectFloor(index)}
                  onKeyDown={(event) => handleFloorKeyDown(event, index)}
                >
                  <span>{floor.label}</span>
                  <span>{floor.area}</span>
                  <span>{floor.rooms.length} bölüm</span>
                </button>
              )
            })}
          </div>

          <div id={panelId} className={styles.floorPanel} role="tabpanel" aria-labelledby={`${panelId}-${activeFloor.id}-tab`} tabIndex={0}>
            <div className={styles.floorToolbar}>
              <div aria-label="Plan yakınlaştırma">
                <CodexIconButton label="Planı uzaklaştır" icon={<MinusIcon />} size="sm" disabled={activeZoom <= 75} onClick={() => setZoom(clamp(activeZoom - 10, 75, 150))} />
                <span aria-live="polite">%{activeZoom}</span>
                <CodexIconButton label="Planı yakınlaştır" icon={<PlusIcon />} size="sm" disabled={activeZoom >= 150} onClick={() => setZoom(clamp(activeZoom + 10, 75, 150))} />
              </div>
              <CodexIconButton label={`Planı döndür, mevcut açı ${activeRotation} derece`} icon={<RotateIcon />} size="sm" onClick={rotate} />
            </div>

            <div className={styles.floorViewport}>
              <div
                className={styles.floorCanvas}
                role="group"
                aria-label={activeFloor.alt}
                style={{ '--plan-zoom': activeZoom / 100, '--plan-rotation': `${activeRotation}deg` } as CSSProperties}
              >
                {activeFloor.imageSrc ? <img src={activeFloor.imageSrc} alt={activeFloor.alt} /> : <span className={styles.floorGrid} aria-hidden />}
                {activeFloor.rooms.map((room, index) => (
                  <button
                    key={room.id}
                    ref={(node) => { roomRefs.current[index] = node }}
                    type="button"
                    className={styles.floorRoom}
                    style={roomStyle(room)}
                    aria-label={`${room.label}${room.area ? `, ${room.area}` : ''}${room.detail ? `, ${room.detail}` : ''}`}
                    aria-pressed={index === roomIndex}
                    data-selected={index === roomIndex || undefined}
                    onClick={() => selectRoom(index)}
                    onKeyDown={(event) => handleRoomKeyDown(event, index)}
                  >
                    <strong>{room.label}</strong>
                    {room.area ? <span>{room.area}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.floorSummary} aria-live="polite" aria-atomic="true">
              <div>
                <span>Seçili bölüm</span>
                <strong>{activeRoom?.label ?? 'Bölüm seçilmedi'}</strong>
              </div>
              {activeRoom?.area ? <div><span>Net alan</span><strong>{activeRoom.area}</strong></div> : null}
              {activeRoom?.detail ? <p>{activeRoom.detail}</p> : activeFloor.note ? <p>{activeFloor.note}</p> : null}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function roomStyle(room: CodexFloorPlanRoom) {
  return {
    '--room-x': `${clamp(room.x)}%`,
    '--room-y': `${clamp(room.y)}%`,
    '--room-width': `${clamp(room.width, 8, 100)}%`,
    '--room-height': `${clamp(room.height, 8, 100)}%`,
  } as CSSProperties
}
