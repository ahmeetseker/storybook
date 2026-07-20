import { useId, useRef, type HTMLAttributes, type KeyboardEvent } from 'react'
import { CodexGallery, type CodexGalleryProps } from './CodexGallery'
import {
  type CodexMediaItem,
  type CodexMediaKind,
} from './CodexMediaPrimitives'
import { classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export type CodexMediaFilter = 'all' | CodexMediaKind

export interface CodexMediaGalleryProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: readonly CodexMediaItem[]
  label?: string
  filters?: readonly CodexMediaFilter[]
  selectedFilter?: CodexMediaFilter
  defaultSelectedFilter?: CodexMediaFilter
  onFilterChange?: (filter: CodexMediaFilter) => void
  galleryVariant?: CodexGalleryProps['variant']
  galleryStatus?: CodexGalleryProps['status']
  selectedId?: string
  onSelectedChange?: CodexGalleryProps['onSelectedChange']
  onRetry?: () => void
}

const filterLabels: Record<CodexMediaFilter, string> = {
  all: 'Tümü',
  image: 'Fotoğraflar',
  video: 'Videolar',
  panorama: '360°',
  floorplan: 'Kat planları',
}

/** Karışık medya setini tür, adet ve aktif panel ilişkisini koruyarak düzenler. */
export function CodexMediaGallery({
  items,
  label = 'İlan medyaları',
  filters = ['all', 'image', 'video', 'panorama', 'floorplan'],
  selectedFilter,
  defaultSelectedFilter = 'all',
  onFilterChange,
  galleryVariant = 'contained',
  galleryStatus = 'ready',
  selectedId,
  onSelectedChange,
  onRetry,
  className,
  ...rest
}: CodexMediaGalleryProps) {
  const [activeFilter, setActiveFilter] = useControllableValue(selectedFilter, defaultSelectedFilter, onFilterChange)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()
  const panelId = useId()
  const resolvedFilters: readonly CodexMediaFilter[] = filters.length ? filters : ['all']
  const safeFilter = resolvedFilters.includes(activeFilter) ? activeFilter : resolvedFilters[0]
  const filteredItems = safeFilter === 'all'
    ? items
    : items.filter((item) => (item.type ?? 'image') === safeFilter)

  const selectFilter = (filter: CodexMediaFilter, focus = false) => {
    setActiveFilter(filter)
    if (focus) {
      const index = resolvedFilters.indexOf(filter)
      tabRefs.current[index]?.focus()
    }
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % resolvedFilters.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + resolvedFilters.length) % resolvedFilters.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = resolvedFilters.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectFilter(resolvedFilters[nextIndex], true)
  }

  return (
    <section {...rest} className={classNames(styles.mediaGallery, className)} aria-labelledby={titleId}>
      <div className={styles.mediaGalleryHeader}>
        <h2 id={titleId}>{label}</h2>
        <span>{items.length} medya</span>
      </div>
      <div className={styles.mediaTabs} role="tablist" aria-label="Medya türü">
        {resolvedFilters.map((filter, index) => {
          const selected = filter === safeFilter
          const count = filter === 'all'
            ? items.length
            : items.filter((item) => (item.type ?? 'image') === filter).length
          return (
            <button
              key={filter}
              ref={(node) => { tabRefs.current[index] = node }}
              type="button"
              role="tab"
              id={`${panelId}-${filter}-tab`}
              aria-selected={selected}
              aria-controls={selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectFilter(filter)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span>{filterLabels[filter]}</span><span aria-label={`${count} öğe`}>{count}</span>
            </button>
          )
        })}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${safeFilter}-tab`}>
        <CodexGallery
          items={filteredItems}
          label={`${filterLabels[safeFilter]} galerisi`}
          variant={galleryVariant}
          status={galleryStatus === 'ready' && filteredItems.length === 0 ? 'empty' : galleryStatus}
          selectedId={selectedId}
          onSelectedChange={onSelectedChange}
          onRetry={onRetry}
          emptyTitle={`${filterLabels[safeFilter]} bulunamadı`}
          emptyMessage="Bu medya türünde henüz bir içerik yok. Diğer türleri inceleyebilirsiniz."
        />
      </div>
    </section>
  )
}
