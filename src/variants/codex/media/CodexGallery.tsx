import {
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge, CodexIconButton } from '../controls'
import {
  ArrowIcon,
  LiveMessage,
  MediaArtwork,
  MediaKindIcon,
  MediaState,
  type CodexMediaItem,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export interface CodexGalleryProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: readonly CodexMediaItem[]
  label?: string
  variant?: 'contained' | 'immersive'
  status?: CodexMediaStatus
  selectedId?: string
  defaultSelectedId?: string
  onSelectedChange?: (item: CodexMediaItem) => void
  onRetry?: () => void
  showFilmstrip?: boolean
  showCaption?: boolean
  previousLabel?: string
  nextLabel?: string
  emptyTitle?: string
  emptyMessage?: string
  errorTitle?: string
  errorMessage?: string
}

/** Fotoğraf, video, 360° görünüm ve planları tek erişilebilir seçim sözleşmesinde sunar. */
export function CodexGallery({
  items,
  label = 'İlan galerisi',
  variant = 'contained',
  status = 'ready',
  selectedId,
  defaultSelectedId,
  onSelectedChange,
  onRetry,
  showFilmstrip = true,
  showCaption = true,
  previousLabel = 'Önceki medya',
  nextLabel = 'Sonraki medya',
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
  className,
  ...rest
}: CodexGalleryProps) {
  const fallbackId = defaultSelectedId ?? items[0]?.id ?? ''
  const [internalSelectedId, setSelectedId] = useControllableValue(selectedId, fallbackId)
  const requestedIndex = items.findIndex((item) => item.id === internalSelectedId)
  const selectedIndex = requestedIndex >= 0 ? requestedIndex : 0
  const selectedItem = items[selectedIndex]
  const labelId = useId()

  const selectAt = (index: number) => {
    const item = items[index]
    if (!item) return
    setSelectedId(item.id)
    onSelectedChange?.(item)
  }

  const move = (delta: number) => selectAt(Math.min(items.length - 1, Math.max(0, selectedIndex + delta)))

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.currentTarget !== event.target) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectAt(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectAt(items.length - 1)
    }
  }

  return (
    <section
      {...rest}
      className={classNames(styles.gallery, styles[`gallery_${variant}`], className)}
      aria-labelledby={labelId}
      aria-busy={status === 'loading' || undefined}
      tabIndex={status === 'ready' && items.length > 1 ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <h2 id={labelId} className={styles.visuallyHidden}>{label}</h2>
      {status !== 'ready' || !selectedItem ? (
        <MediaState
          status={status === 'ready' ? 'empty' : status}
          onRetry={onRetry}
          emptyTitle={emptyTitle}
          emptyMessage={emptyMessage}
          errorTitle={errorTitle}
          errorMessage={errorMessage}
        />
      ) : (
        <>
          <figure className={styles.galleryStage}>
            <div className={styles.galleryArtwork}>
              <MediaArtwork item={selectedItem} eager />
            </div>

            <div className={styles.galleryTopline}>
              <CodexBadge tone="neutral">
                <span className={styles.kindLabel}><MediaKindIcon kind={selectedItem.type ?? 'image'} />{mediaKindLabel(selectedItem.type ?? 'image')}</span>
              </CodexBadge>
              <span className={styles.galleryCount} aria-hidden>{selectedIndex + 1} / {items.length}</span>
            </div>

            {items.length > 1 ? (
              <div className={styles.galleryNavigation}>
                <CodexIconButton
                  label={previousLabel}
                  icon={<ArrowIcon direction="previous" />}
                  size="md"
                  className={styles.mediaChrome}
                  disabled={selectedIndex === 0}
                  onClick={() => move(-1)}
                />
                <CodexIconButton
                  label={nextLabel}
                  icon={<ArrowIcon direction="next" />}
                  size="md"
                  className={styles.mediaChrome}
                  disabled={selectedIndex === items.length - 1}
                  onClick={() => move(1)}
                />
              </div>
            ) : null}

            {showCaption && (selectedItem.caption || selectedItem.eyebrow) ? (
              <figcaption className={styles.galleryCaption}>
                {selectedItem.eyebrow ? <span>{selectedItem.eyebrow}</span> : null}
                {selectedItem.caption ? <strong>{selectedItem.caption}</strong> : null}
              </figcaption>
            ) : null}
          </figure>

          {showFilmstrip && items.length > 1 ? (
            <div className={styles.filmstrip} aria-label="Galeri küçük görselleri">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.thumbnail}
                  aria-label={`${index + 1}. medyayı aç: ${item.alt}`}
                  aria-pressed={index === selectedIndex}
                  data-selected={index === selectedIndex || undefined}
                  onClick={() => selectAt(index)}
                >
                  <MediaArtwork item={item} thumbnail />
                  <span className={styles.thumbnailKind} aria-hidden><MediaKindIcon kind={item.type ?? 'image'} /></span>
                  {item.duration ? <span className={styles.thumbnailDuration}>{item.duration}</span> : null}
                </button>
              ))}
            </div>
          ) : null}

          <LiveMessage>{`${selectedIndex + 1} / ${items.length}: ${selectedItem.alt}`}</LiveMessage>
        </>
      )}
    </section>
  )
}

function mediaKindLabel(kind: NonNullable<CodexMediaItem['type']>) {
  if (kind === 'video') return 'Video'
  if (kind === 'panorama') return '360° görünüm'
  if (kind === 'floorplan') return 'Kat planı'
  return 'Fotoğraf'
}
