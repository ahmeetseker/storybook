import {
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge } from '../controls'
import {
  LocationIcon,
  MediaState,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { clamp, classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export type CodexNearbyCategory = 'transport' | 'market' | 'school' | 'health' | 'park' | 'coast' | 'other'
export type CodexNearbySort = 'distance' | 'walk' | 'drive'

export interface CodexNearbyPlace {
  id: string
  name: string
  category: CodexNearbyCategory
  distanceMeters: number
  walkMinutes?: number
  driveMinutes?: number
  description?: string
  verified?: boolean
  x?: number
  y?: number
}

export interface CodexNearbyPlacesProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  places: readonly CodexNearbyPlace[]
  label?: string
  description?: string
  status?: CodexMediaStatus
  categories?: readonly CodexNearbyCategory[]
  selectedCategory?: 'all' | CodexNearbyCategory
  defaultSelectedCategory?: 'all' | CodexNearbyCategory
  onCategoryChange?: (category: 'all' | CodexNearbyCategory) => void
  sort?: CodexNearbySort
  defaultSort?: CodexNearbySort
  onSortChange?: (sort: CodexNearbySort) => void
  selectedId?: string
  defaultSelectedId?: string
  onPlaceSelect?: (place: CodexNearbyPlace) => void
  radiusLabel?: string
  onRetry?: () => void
}

const categoryLabels: Record<CodexNearbyCategory, string> = {
  transport: 'Ulaşım',
  market: 'Market',
  school: 'Eğitim',
  health: 'Sağlık',
  park: 'Park',
  coast: 'Kıyı',
  other: 'Diğer',
}

/** Çevre verisini kategori, erişim süresi ve doğrulama bilgisiyle karşılaştırılabilir tutar. */
export function CodexNearbyPlaces({
  places,
  label = 'Konum ve çevre',
  description = 'Mesafeler yaklaşık rota ve açık konum verilerine göre hesaplanır.',
  status = 'ready',
  categories,
  selectedCategory,
  defaultSelectedCategory = 'all',
  onCategoryChange,
  sort,
  defaultSort = 'distance',
  onSortChange,
  selectedId,
  defaultSelectedId,
  onPlaceSelect,
  radiusLabel = '2 km çevre',
  onRetry,
  className,
  ...rest
}: CodexNearbyPlacesProps) {
  const inferredCategories = Array.from(new Set(places.map((place) => place.category)))
  const resolvedCategories = categories ?? inferredCategories
  const allowedCategories: Array<'all' | CodexNearbyCategory> = ['all', ...resolvedCategories]
  const [activeCategory, setCategory] = useControllableValue(selectedCategory, defaultSelectedCategory, onCategoryChange)
  const safeCategory = allowedCategories.includes(activeCategory) ? activeCategory : 'all'
  const [activeSort, setSort] = useControllableValue(sort, defaultSort, onSortChange)
  const fallbackId = defaultSelectedId ?? places[0]?.id ?? ''
  const [internalSelectedId, setSelectedId] = useControllableValue(selectedId, fallbackId)
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()
  const descriptionId = useId()

  const visiblePlaces = useMemo(() => {
    const filtered = safeCategory === 'all' ? [...places] : places.filter((place) => place.category === safeCategory)
    return filtered.sort((left, right) => sortValue(left, activeSort) - sortValue(right, activeSort))
  }, [activeSort, places, safeCategory])

  const selectedPlace = visiblePlaces.find((place) => place.id === internalSelectedId) ?? visiblePlaces[0]
  const selectedIndex = selectedPlace ? visiblePlaces.indexOf(selectedPlace) : -1

  const selectPlace = (index: number, focus = false) => {
    const place = visiblePlaces[index]
    if (!place) return
    setSelectedId(place.id)
    onPlaceSelect?.(place)
    if (focus) rowRefs.current[index]?.focus()
  }

  const handlePlaceKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % visiblePlaces.length
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + visiblePlaces.length) % visiblePlaces.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = visiblePlaces.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectPlace(nextIndex, true)
  }

  return (
    <section
      {...rest}
      className={classNames(styles.nearby, className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={status === 'loading' || undefined}
    >
      <header className={styles.nearbyHeader}>
        <div>
          <h2 id={titleId}>{label}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <label className={styles.nearbySort}>
          <span>Sırala</span>
          <select value={activeSort} onChange={(event) => setSort(event.currentTarget.value as CodexNearbySort)}>
            <option value="distance">Mesafe</option>
            <option value="walk">Yürüme süresi</option>
            <option value="drive">Sürüş süresi</option>
          </select>
        </label>
      </header>

      <div className={styles.nearbyFilters} aria-label="Yakın yer kategorisi">
        {allowedCategories.map((category) => {
          const count = category === 'all' ? places.length : places.filter((place) => place.category === category).length
          return (
            <button
              key={category}
              type="button"
              aria-pressed={category === safeCategory}
              onClick={() => setCategory(category)}
            >
              <span>{category === 'all' ? 'Tümü' : categoryLabels[category]}</span>
              <span>{count}</span>
            </button>
          )
        })}
      </div>

      {status !== 'ready' || !visiblePlaces.length ? (
        <MediaState
          status={status === 'ready' ? 'empty' : status}
          compact
          onRetry={onRetry}
          emptyTitle={places.length ? 'Bu kategoride yakın yer yok' : 'Çevre verisi bulunamadı'}
          emptyMessage={places.length ? 'Başka bir kategori seçerek çevredeki diğer noktaları inceleyin.' : 'Konum doğrulandığında ulaşım, eğitim, sağlık ve günlük yaşam noktaları burada gösterilir.'}
          errorTitle="Çevre verisi alınamadı"
          errorMessage="Mesafe hesabı geçici olarak kullanılamıyor. Konum adını kullanarak aramaya devam edebilirsiniz."
        />
      ) : (
        <div className={styles.nearbyLayout}>
          <div className={styles.nearbyList} role="list" aria-label={`${safeCategory === 'all' ? 'Tüm' : categoryLabels[safeCategory]} yakın yerler`}>
            {visiblePlaces.map((place, index) => (
              <div key={place.id} role="listitem" className={styles.nearbyRow} data-selected={index === selectedIndex || undefined}>
                <button
                  ref={(node) => { rowRefs.current[index] = node }}
                  type="button"
                  aria-pressed={index === selectedIndex}
                  onClick={() => selectPlace(index)}
                  onKeyDown={(event) => handlePlaceKeyDown(event, index)}
                >
                  <span className={styles.nearbySymbol} data-category={place.category} aria-hidden>{categorySymbol(place.category)}</span>
                  <span className={styles.nearbyCopy}>
                    <span><strong>{place.name}</strong>{place.verified ? <CodexBadge tone="success">Doğrulandı</CodexBadge> : null}</span>
                    <span>{categoryLabels[place.category]}{place.description ? ` · ${place.description}` : ''}</span>
                  </span>
                  <span className={styles.nearbyTimes}>
                    <strong>{formatDistance(place.distanceMeters)}</strong>
                    <span>{formatTravel(place)}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div className={styles.nearbyOrbit} role="img" aria-label={`${radiusLabel} içinde ${visiblePlaces.length} yakın yer`}>
            <span className={styles.orbitRingA} aria-hidden />
            <span className={styles.orbitRingB} aria-hidden />
            <span className={styles.orbitCenter} aria-hidden><LocationIcon /></span>
            {visiblePlaces.slice(0, 8).map((place, index) => (
              <span
                key={place.id}
                className={styles.orbitPlace}
                data-selected={place.id === selectedPlace?.id || undefined}
                data-category={place.category}
                style={orbitPosition(place, index, visiblePlaces.length)}
                aria-hidden
              >{index + 1}</span>
            ))}
            <span className={styles.orbitLabel}>{radiusLabel}</span>
          </div>
        </div>
      )}
    </section>
  )
}

function sortValue(place: CodexNearbyPlace, sort: CodexNearbySort) {
  if (sort === 'walk') return place.walkMinutes ?? Number.MAX_SAFE_INTEGER
  if (sort === 'drive') return place.driveMinutes ?? Number.MAX_SAFE_INTEGER
  return place.distanceMeters
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(meters / 1000)} km`
}

function formatTravel(place: CodexNearbyPlace) {
  const values = []
  if (place.walkMinutes !== undefined) values.push(`${place.walkMinutes} dk yürüme`)
  if (place.driveMinutes !== undefined) values.push(`${place.driveMinutes} dk araç`)
  return values.join(' · ') || 'Rota süresi yok'
}

function categorySymbol(category: CodexNearbyCategory) {
  if (category === 'transport') return 'U'
  if (category === 'market') return 'M'
  if (category === 'school') return 'E'
  if (category === 'health') return '+'
  if (category === 'park') return 'P'
  if (category === 'coast') return 'K'
  return '•'
}

function orbitPosition(place: CodexNearbyPlace, index: number, length: number) {
  if (place.x !== undefined && place.y !== undefined) {
    return { '--orbit-x': `${clamp(place.x, 10, 90)}%`, '--orbit-y': `${clamp(place.y, 10, 90)}%` } as CSSProperties
  }
  const angle = (index / Math.max(length, 1)) * Math.PI * 2 - Math.PI / 2
  const radius = index % 2 === 0 ? 31 : 40
  return {
    '--orbit-x': `${50 + Math.cos(angle) * radius}%`,
    '--orbit-y': `${50 + Math.sin(angle) * radius}%`,
  } as CSSProperties
}
