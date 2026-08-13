import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type UIEvent,
} from 'react'
import { GlassSearchField, GlassSegmentedControl } from '@repo/ui'
import type { ConversationFilter, ConversationSummary } from '../domain/message-types'

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'unread', label: 'Okunmamış' },
  { value: 'archived', label: 'Arşiv' },
]

const ROW_ESTIMATE = 104
const VIEWPORT_ESTIMATE_ROWS = 8
const OVERSCAN_ROWS = 4
const MAX_WINDOW_ROWS = 32

export interface ConversationRailProps {
  conversations: readonly ConversationSummary[]
  totalCount: number
  filter: ConversationFilter
  query: string
  activeConversationId?: string
  hasNextPage: boolean
  loadingMore: boolean
  onFilterChange: (filter: ConversationFilter) => void
  onQueryChange: (query: string) => void
  onConversationChange: (id: string) => void
  onLoadMore: () => void
  /** Workspace'in master-detail dönüşlerinde geri yükleyebileceği scroll konumu. */
  scrollOffset?: number
  /** Rail scroll'u değiştiğinde güncel offset'i bildirir. */
  onScrollOffsetChange?: (offset: number) => void
}

function activityLabel(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

/** İlk iki kelimenin baş harfleri — görselsiz sohbetin monogramı ("Kadıköy Anahtar Ofis" → "KA"). */
function monogram(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr'))
    .join('')
}

function statusLabel(status: ConversationSummary['status']) {
  switch (status) {
    case 'archived': return 'Arşivlendi'
    case 'blocked': return 'Engellendi'
    case 'listing-closed': return 'İlan yayından kaldırıldı'
    default: return undefined
  }
}

function indexAtOffset(offset: number, offsets: readonly number[], heights: readonly number[]) {
  if (offsets.length === 0) return 0
  let low = 0
  let high = offsets.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const top = offsets[middle] ?? 0
    const bottom = top + (heights[middle] ?? ROW_ESTIMATE)
    if (offset < top) high = middle - 1
    else if (offset >= bottom) low = middle + 1
    else return middle
  }
  return Math.max(0, Math.min(offsets.length - 1, low))
}

function ConversationRow({
  conversation,
  position,
  size,
  offset,
  active,
  onConversationChange,
  registerRow,
  registerLink,
}: {
  conversation: ConversationSummary
  position: number
  size: number
  offset: number
  active: boolean
  onConversationChange: (id: string) => void
  registerRow: (id: string, element: HTMLLIElement | null) => void
  registerLink: (id: string, element: HTMLAnchorElement | null) => void
}) {
  const href = `?konusma=${encodeURIComponent(conversation.id)}`
  const preview = conversation.lastMessage?.body ?? 'Henüz mesaj yok.'
  const unread = conversation.unreadCount > 0
  const state = statusLabel(conversation.status)
  const style: CSSProperties = {
    position: 'absolute',
    transform: `translateY(${offset}px)`,
  }

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onConversationChange(conversation.id)
  }

  return (
    <li
      ref={(element) => registerRow(conversation.id, element)}
      data-conversation-id={conversation.id}
      aria-setsize={size}
      aria-posinset={position}
      className={unread ? 'conversationRail__item conversationRail__item--unread' : 'conversationRail__item'}
      style={style}
    >
      <a
        ref={(element) => registerLink(conversation.id, element)}
        href={href}
        aria-current={active ? 'page' : undefined}
        className="conversationRail__link"
        onClick={onClick}
      >
        {conversation.listing.imageSrc ? (
          <img src={conversation.listing.imageSrc} alt={conversation.listing.imageAlt} className="conversationRail__listingImage" />
        ) : (
          // Görselsiz sohbet (ör. ofis görüşmesi): monogram, görsel kolonunu
          // DOLDURMAK ZORUNDA — link iki kolonlu grid'dir; ilk kolon boş
          // kalırsa içerik 48px'lik görsel kolonuna düşüp harf harf kırılır.
          <span className="conversationRail__listingImage conversationRail__monogram" aria-hidden="true">
            {monogram(conversation.counterpart.displayName)}
          </span>
        )}
        <span className="conversationRail__content">
          <span className="conversationRail__topline">
            <strong>{conversation.counterpart.displayName}</strong>
            <time dateTime={conversation.lastUserActivityAt}>{activityLabel(conversation.lastUserActivityAt)}</time>
          </span>
          <span className="conversationRail__listing">{conversation.listing.title}</span>
          <span className="conversationRail__reference">{conversation.listing.referenceLabel}</span>
          <span className="conversationRail__preview">{preview}</span>
          {state ? <span className="conversationRail__state">{state}</span> : null}
          {unread ? (
            <span className="conversationRail__unread">
              <span className="conversationRail__unreadDot" aria-hidden="true" />
              <span>{conversation.unreadCount} okunmamış</span>
            </span>
          ) : null}
        </span>
      </a>
    </li>
  )
}

/** Konuşma koleksiyonunu ölçümlü ve sınırlı bir DOM penceresinde gösterir. */
export function ConversationRail({
  conversations,
  totalCount,
  filter,
  query,
  activeConversationId,
  hasNextPage,
  loadingMore,
  onFilterChange,
  onQueryChange,
  onConversationChange,
  onLoadMore,
  scrollOffset,
  onScrollOffsetChange,
}: ConversationRailProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef(new Map<string, HTMLAnchorElement>())
  const rowsRef = useRef(new Map<string, HTMLLIElement>())
  const measuredHeightsRef = useRef(new Map<string, number>())
  const previousConversationsRef = useRef(conversations)
  const [heightVersion, setHeightVersion] = useState(0)
  const [currentScrollOffset, setCurrentScrollOffset] = useState(scrollOffset ?? 0)
  const [viewportHeight, setViewportHeight] = useState(ROW_ESTIMATE * VIEWPORT_ESTIMATE_ROWS)
  const [focusedConversationId, setFocusedConversationId] = useState<string>()

  const heights = useMemo(
    () => conversations.map((conversation) => measuredHeightsRef.current.get(conversation.id) ?? ROW_ESTIMATE),
    [conversations, heightVersion],
  )
  const offsets = useMemo(() => {
    const result = new Array<number>(conversations.length)
    let offset = 0
    for (let index = 0; index < conversations.length; index += 1) {
      result[index] = offset
      offset += heights[index] ?? ROW_ESTIMATE
    }
    return result
  }, [conversations.length, heights])
  const totalSize = (offsets.at(-1) ?? 0) + (heights.at(-1) ?? 0)

  const removedFocusedIndex = focusedConversationId
    ? previousConversationsRef.current.findIndex((conversation) => conversation.id === focusedConversationId)
    : -1
  const focusedStillExists = focusedConversationId
    ? conversations.some((conversation) => conversation.id === focusedConversationId)
    : false
  const focusFallback = removedFocusedIndex >= 0 && !focusedStillExists
    ? conversations[removedFocusedIndex] ?? conversations[removedFocusedIndex - 1]
    : undefined

  const renderedIndexes = useMemo(() => {
    if (conversations.length === 0) return []
    const visibleStart = indexAtOffset(currentScrollOffset, offsets, heights)
    const visibleEnd = indexAtOffset(currentScrollOffset + viewportHeight, offsets, heights)
    const start = Math.max(0, visibleStart - OVERSCAN_ROWS)
    const end = Math.min(
      conversations.length,
      Math.max(visibleEnd + OVERSCAN_ROWS + 1, start + 1),
      start + MAX_WINDOW_ROWS,
    )
    const indexes = new Set<number>()
    for (let index = start; index < end; index += 1) indexes.add(index)
    for (const id of [activeConversationId, focusedStillExists ? focusedConversationId : undefined, focusFallback?.id]) {
      if (!id) continue
      const index = conversations.findIndex((conversation) => conversation.id === id)
      if (index >= 0) indexes.add(index)
    }
    return [...indexes].sort((left, right) => left - right)
  }, [
    activeConversationId,
    conversations,
    currentScrollOffset,
    focusFallback?.id,
    focusedConversationId,
    focusedStillExists,
    heights,
    offsets,
    viewportHeight,
  ])

  useLayoutEffect(() => {
    const validIds = new Set(conversations.map((conversation) => conversation.id))
    measuredHeightsRef.current.forEach((_height, id) => {
      if (!validIds.has(id)) measuredHeightsRef.current.delete(id)
    })
  }, [conversations])

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element || scrollOffset === undefined) return
    element.scrollTop = scrollOffset
    setCurrentScrollOffset(scrollOffset)
  }, [scrollOffset])

  useLayoutEffect(() => {
    if (removedFocusedIndex < 0 || focusedStillExists) {
      previousConversationsRef.current = conversations
      return
    }
    const target = focusFallback ? linksRef.current.get(focusFallback.id) : headingRef.current
    target?.focus()
    setFocusedConversationId(focusFallback?.id)
    previousConversationsRef.current = conversations
  }, [conversations, focusFallback, focusedStillExists, removedFocusedIndex])

  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      let changed = false
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.conversationId
        // Satır aralığı padding ile verilir; contentRect padding'i saymadığı için
        // offset hesabı border-box ölçüsüne dayanmalı, yoksa kartlar üst üste biner.
        const height =
          entry.borderBoxSize?.[0]?.blockSize ||
          entry.contentRect.height ||
          entry.target.getBoundingClientRect().height
        if (!id || height <= 0 || measuredHeightsRef.current.get(id) === height) continue
        measuredHeightsRef.current.set(id, height)
        changed = true
      }
      if (changed) setHeightVersion((version) => version + 1)
    })
    rowsRef.current.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [renderedIndexes])

  const registerRow = (id: string, element: HTMLLIElement | null) => {
    if (element) rowsRef.current.set(id, element)
    else rowsRef.current.delete(id)
  }
  const registerLink = (id: string, element: HTMLAnchorElement | null) => {
    if (element) linksRef.current.set(id, element)
    else linksRef.current.delete(id)
  }
  const listStyle: CSSProperties = { height: totalSize, position: 'relative' }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    setCurrentScrollOffset(element.scrollTop)
    if (element.clientHeight > 0) setViewportHeight(element.clientHeight)
    onScrollOffsetChange?.(element.scrollTop)
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    const row = (event.target as HTMLElement).closest<HTMLLIElement>('li[data-conversation-id]')
    setFocusedConversationId(row?.dataset.conversationId)
  }

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setFocusedConversationId(undefined)
    }
  }

  return (
    <nav
      aria-label="Konuşmalar"
      className="conversationRail"
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <h2 ref={headingRef} tabIndex={-1}>Konuşmalar</h2>
      <GlassSearchField
        className="conversationRail__search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label="Konuşmalarda ara"
        placeholder="Kişi veya ilan ara"
      />
      <GlassSegmentedControl
        className="conversationRail__filter"
        label="Konuşma filtresi"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(value) => onFilterChange(value as ConversationFilter)}
      />
      <p role="status" aria-live="polite">{query ? `${totalCount} sonuç bulundu` : `${totalCount} konuşma`}</p>
      <div ref={scrollRef} className="conversationRail__scrollArea" onScroll={handleScroll}>
        <ul className="conversationRail__list" style={listStyle}>
          {renderedIndexes.map((index) => {
            const conversation = conversations[index]
            if (!conversation) return null
            return (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                position={index + 1}
                size={totalCount}
                offset={offsets[index] ?? 0}
                active={conversation.id === activeConversationId}
                onConversationChange={onConversationChange}
                registerRow={registerRow}
                registerLink={registerLink}
              />
            )
          })}
        </ul>
      </div>
      {hasNextPage ? (
        <button type="button" onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? 'Konuşmalar yükleniyor' : 'Daha fazla konuşma yükle'}
        </button>
      ) : null}
    </nav>
  )
}
