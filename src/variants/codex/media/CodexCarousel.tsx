import {
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge, CodexIconButton } from '../controls'
import {
  ArrowIcon,
  LiveMessage,
  MediaArtwork,
  MediaState,
  type CodexMediaItem,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export interface CodexCarouselItem extends CodexMediaItem {
  title: string
  description?: string
  badge?: string
  meta?: string
}

export interface CodexCarouselProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: readonly CodexCarouselItem[]
  label?: string
  description?: string
  status?: CodexMediaStatus
  activeId?: string
  defaultActiveId?: string
  onActiveChange?: (item: CodexCarouselItem) => void
  onItemSelect?: (item: CodexCarouselItem) => void
  onRetry?: () => void
  columns?: 1 | 2 | 3 | 4
}

/** Dokunma, fare ve ok tuşlarıyla çalışan yatay medya seçkisi. */
export function CodexCarousel({
  items,
  label = 'Öne çıkan medyalar',
  description,
  status = 'ready',
  activeId,
  defaultActiveId,
  onActiveChange,
  onItemSelect,
  onRetry,
  columns = 3,
  className,
  style,
  ...rest
}: CodexCarouselProps) {
  const fallbackId = defaultActiveId ?? items[0]?.id ?? ''
  const [internalActiveId, setActiveId] = useControllableValue(activeId, fallbackId)
  const requestedIndex = items.findIndex((item) => item.id === internalActiveId)
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0
  const activeItem = items[activeIndex]
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()

  const activate = (index: number, focus = false) => {
    const item = items[index]
    if (!item) return
    setActiveId(item.id)
    onActiveChange?.(item)
    const node = itemRefs.current[index]
    if (focus) node?.focus()
    node?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = Math.min(items.length - 1, index + 1)
    else if (event.key === 'ArrowLeft') nextIndex = Math.max(0, index - 1)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    if (nextIndex === undefined || nextIndex === index) return
    event.preventDefault()
    activate(nextIndex, true)
  }

  const resolvedStyle = {
    ...style,
    '--carousel-columns': columns,
  } as CSSProperties

  return (
    <section
      {...rest}
      className={classNames(styles.carousel, className)}
      style={resolvedStyle}
      aria-labelledby={titleId}
      aria-roledescription="karusel"
      aria-busy={status === 'loading' || undefined}
    >
      <div className={styles.carouselHeader}>
        <div>
          <h2 id={titleId}>{label}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {status === 'ready' && items.length > 1 ? (
          <div className={styles.carouselControls}>
            <span aria-hidden>{activeIndex + 1} / {items.length}</span>
            <CodexIconButton
              label="Önceki kart"
              icon={<ArrowIcon direction="previous" />}
              size="sm"
              disabled={activeIndex === 0}
              onClick={() => activate(activeIndex - 1, true)}
            />
            <CodexIconButton
              label="Sonraki kart"
              icon={<ArrowIcon direction="next" />}
              size="sm"
              disabled={activeIndex === items.length - 1}
              onClick={() => activate(activeIndex + 1, true)}
            />
          </div>
        ) : null}
      </div>

      {status !== 'ready' || !activeItem ? (
        <MediaState status={status === 'ready' ? 'empty' : status} compact onRetry={onRetry} />
      ) : (
        <div className={styles.carouselTrack} role="list" aria-label={label}>
          {items.map((item, index) => (
            <article
              key={item.id}
              role="listitem"
              aria-roledescription="slayt"
              aria-label={`${index + 1} / ${items.length}: ${item.title}`}
              className={styles.carouselSlide}
              data-active={index === activeIndex || undefined}
            >
              <button
                ref={(node) => { itemRefs.current[index] = node }}
                type="button"
                className={styles.carouselCard}
                aria-pressed={index === activeIndex}
                onFocus={() => activate(index)}
                onClick={() => {
                  activate(index)
                  onItemSelect?.(item)
                }}
                onKeyDown={(event) => handleItemKeyDown(event, index)}
              >
                <span className={styles.carouselMedia}><MediaArtwork item={item} thumbnail /></span>
                <span className={styles.carouselBody}>
                  <span className={styles.carouselTitleRow}>
                    <strong>{item.title}</strong>
                    {item.badge ? <CodexBadge tone="accent">{item.badge}</CodexBadge> : null}
                  </span>
                  {item.description ? <span className={styles.carouselDescription}>{item.description}</span> : null}
                  {item.meta ? <span className={styles.carouselMeta}>{item.meta}</span> : null}
                </span>
              </button>
            </article>
          ))}
        </div>
      )}
      {activeItem ? <LiveMessage>{`Aktif kart: ${activeItem.title}`}</LiveMessage> : null}
    </section>
  )
}
