import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from 'react'

import type { MarketplaceMessage } from '../domain/message-types'
import { getMessageRenderKey as getDomainMessageRenderKey } from '../domain/message-reconciliation'

export { getMessageRenderKey } from '../domain/message-reconciliation'

const WINDOW_ROWS = 60
const OVERSCAN_ROWS = 8
const MAX_WINDOW_ROWS = WINDOW_ROWS + OVERSCAN_ROWS * 2
const MAX_MEASURED_ROWS = MAX_WINDOW_ROWS * 4
const MESSAGE_ROW_ESTIMATE = 88
const DAY_ROW_ESTIMATE = 40
const BOTTOM_TOLERANCE = 48

type TimelineRow =
  | { key: string; domKey: string; type: 'day'; label: string }
  | { key: string; domKey: string; type: 'message'; message: MarketplaceMessage; messageKey: string }

interface TimelineLayout {
  rows: readonly TimelineRow[]
  offsets: readonly number[]
  heights: readonly number[]
}

export interface MessageTimelineProps {
  /** Timeline state, ölçüm ve scroll ömrünü sınırlandıran konuşma kimliği. */
  conversationId: string
  /** En eskiden en yeniye sıralanmış, yalnız aktif konuşmanın mesajları. */
  messages: readonly MarketplaceMessage[]
  /** Oturumdaki kullanıcının kimliği; giden mesajları belirler. */
  currentUserId: string
  /** Timeline'ın erişilebilir adında kullanılan karşı taraf adı. */
  counterpartName: string
  /** Eski cursor sayfası bulunup bulunmadığı. */
  hasOlder?: boolean
  /** Eski cursor sayfası yüklenirken fallback eylemini kilitler. */
  loadingOlder?: boolean
  /** Kullanıcı eski sayfayı istediğinde çağrılır. */
  onLoadOlder?: () => void
  /** Başarısız optimistic mesaj yeniden gönderilmek istendiğinde çağrılır. */
  onRetry?: (message: MarketplaceMessage) => void
  /** Başarısız mesaj metni kopyalanmak istendiğinde çağrılır. */
  onCopy?: (message: MarketplaceMessage) => void
  /** Sanal pencerenin dışında kalsa da DOM'da tutulacak seçili mesaj anahtarı. */
  selectedMessageKey?: string
}

function isCanonicalMessage(message: MarketplaceMessage) {
  return typeof message.id === 'string'
}

function deduplicateMessages(messages: readonly MarketplaceMessage[]) {
  const byKey = new Map<string, MarketplaceMessage>()
  const messagesByFirstSlot: MarketplaceMessage[] = []
  for (const message of messages) {
    const key = getDomainMessageRenderKey(message)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, message)
      messagesByFirstSlot.push(message)
    } else if (isCanonicalMessage(existing) && !isCanonicalMessage(message)) {
      continue
    } else if (!isCanonicalMessage(existing) && isCanonicalMessage(message)) {
      const firstSlot = messagesByFirstSlot.indexOf(existing)
      if (firstSlot !== -1) messagesByFirstSlot[firstSlot] = message
      byKey.set(key, message)
    } else {
      // Aynı güven seviyesinde son adapter payload'ı, kendi sırasıyla kazanır.
      byKey.delete(key)
      byKey.set(key, message)
      const firstSlot = messagesByFirstSlot.indexOf(existing)
      if (firstSlot !== -1) messagesByFirstSlot.splice(firstSlot, 1)
      messagesByFirstSlot.push(message)
    }
  }
  return messagesByFirstSlot
}

function dayKey(sentAt: string) {
  return new Date(sentAt).toISOString().slice(0, 10)
}

function clockLabel(sentAt: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(sentAt))
}

function dayLabel(sentAt: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(sentAt))
}

function isPersonMessage(message: MarketplaceMessage) {
  return message.kind === 'text' || message.kind === 'attachment'
}

function isAtBottom(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= BOTTOM_TOLERANCE
}

function deliveryLabel(state: MarketplaceMessage['deliveryState']) {
  switch (state) {
    case 'pending':
      return 'Gönderiliyor'
    case 'sent':
      return 'Gönderildi'
    case 'delivered':
      return 'İletildi'
    case 'read':
      return 'Okundu'
    default:
      return null
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Cursor ile büyüyen konuşma geçmişini sınırlı bir DOM penceresinde gösterir.
 * Satır yükseklikleri gerçek DOM'dan ölçülür; dependency gerektirmez.
 */
export function MessageTimeline({
  conversationId,
  messages,
  currentUserId,
  counterpartName,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  onRetry,
  onCopy,
  selectedMessageKey,
}: MessageTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rowElementsRef = useRef(new Map<string, HTMLElement>())
  const rowHeightsRef = useRef(new Map<string, number>())
  const protectedMeasurementKeysRef = useRef(new Set<string>())
  const previousLayoutRef = useRef<TimelineLayout | null>(null)
  const wasAtBottomRef = useRef(true)
  const initialisedRef = useRef(false)
  const announcementSequenceRef = useRef(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [heightVersion, setHeightVersion] = useState(0)
  const [focusedRowKey, setFocusedRowKey] = useState<string>()
  const [unseenInboundCount, setUnseenInboundCount] = useState(0)
  const [awayFromLatest, setAwayFromLatest] = useState(false)
  const [announcement, setAnnouncement] = useState<{ id: number; text: string }>()
  const renderMessages = useMemo(() => deduplicateMessages(messages), [messages])

  const rows = useMemo<readonly TimelineRow[]>(() => {
    const next: TimelineRow[] = []
    let previousDay: string | undefined

    for (const message of renderMessages) {
      const currentDay = dayKey(message.sentAt)
      if (currentDay !== previousDay) {
        next.push({
          key: `day:${conversationId}:${currentDay}`,
          domKey: `day:${currentDay}`,
          type: 'day',
          label: dayLabel(message.sentAt),
        })
        previousDay = currentDay
      }
      const messageKey = getDomainMessageRenderKey(message)
      next.push({
        key: `message:${conversationId}:${messageKey}`,
        domKey: `message:${messageKey}`,
        type: 'message',
        message,
        messageKey,
      })
    }

    return next
  }, [conversationId, renderMessages])

  const rowIndexByKey = useMemo(() => new Map(rows.map((row, index) => [row.key, index])), [rows])
  const rowHeights = useMemo(
    () => rows.map((row) => rowHeightsRef.current.get(row.key) ?? (row.type === 'day' ? DAY_ROW_ESTIMATE : MESSAGE_ROW_ESTIMATE)),
    [rows, heightVersion],
  )
  const offsets = useMemo(() => {
    const next = new Array<number>(rows.length)
    let offset = 0
    for (let index = 0; index < rows.length; index += 1) {
      next[index] = offset
      offset += rowHeights[index] ?? MESSAGE_ROW_ESTIMATE
    }
    return next
  }, [rowHeights, rows.length])
  const totalSize = (offsets.at(-1) ?? 0) + (rowHeights.at(-1) ?? 0)

  const lastOutgoingMessageKey = useMemo(() => {
    let lastKey: string | undefined
    for (const message of renderMessages) {
      if (message.senderId === currentUserId && isPersonMessage(message)) {
        lastKey = getDomainMessageRenderKey(message)
      }
    }
    return lastKey
  }, [currentUserId, renderMessages])

  const indexAtOffset = useCallback((offset: number, sourceRows: readonly TimelineRow[], sourceOffsets: readonly number[], sourceHeights: readonly number[]) => {
    let low = 0
    let high = sourceRows.length - 1
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      const top = sourceOffsets[middle] ?? 0
      const bottom = top + (sourceHeights[middle] ?? MESSAGE_ROW_ESTIMATE)
      if (offset < top) high = middle - 1
      else if (offset >= bottom) low = middle + 1
      else return middle
    }
    return Math.max(0, Math.min(sourceRows.length - 1, low))
  }, [])

  const visibleStart = rows.length === 0 ? 0 : indexAtOffset(scrollOffset, rows, offsets, rowHeights)
  const baseStart = Math.max(0, Math.min(visibleStart - OVERSCAN_ROWS, Math.max(0, rows.length - MAX_WINDOW_ROWS)))
  const baseEnd = Math.min(rows.length, baseStart + MAX_WINDOW_ROWS)
  const renderedIndexes = useMemo(() => {
    const indexes = new Set<number>()
    for (let index = baseStart; index < baseEnd; index += 1) indexes.add(index)

    for (const pinKey of [focusedRowKey, selectedMessageKey ? `message:${conversationId}:${selectedMessageKey}` : undefined]) {
      if (!pinKey) continue
      const index = rowIndexByKey.get(pinKey)
      if (index !== undefined) indexes.add(index)
    }

    return [...indexes].sort((left, right) => left - right)
  }, [baseEnd, baseStart, focusedRowKey, rowIndexByKey, selectedMessageKey])

  const pruneMeasuredRows = useCallback(() => {
    while (rowHeightsRef.current.size > MAX_MEASURED_ROWS) {
      const oldestEvictableKey = [...rowHeightsRef.current.keys()]
        .find((key) => !protectedMeasurementKeysRef.current.has(key))
      if (!oldestEvictableKey) return
      rowHeightsRef.current.delete(oldestEvictableKey)
    }
  }, [])

  const measureElement = useCallback((key: string, element: HTMLElement) => {
    const height = element.getBoundingClientRect().height
    if (height <= 0) return

    const currentHeight = rowHeightsRef.current.get(key)
    if (currentHeight === height) {
      rowHeightsRef.current.delete(key)
      rowHeightsRef.current.set(key, height)
      return
    }

    const previousHeight = currentHeight
      ?? (key.startsWith('day:') ? DAY_ROW_ESTIMATE : MESSAGE_ROW_ESTIMATE)
    rowHeightsRef.current.delete(key)
    rowHeightsRef.current.set(key, height)
    pruneMeasuredRows()
    const index = rowIndexByKey.get(key)
    const scrollElement = scrollRef.current
    if (scrollElement && index !== undefined && (offsets[index] ?? 0) < scrollElement.scrollTop) {
      scrollElement.scrollTop += height - previousHeight
    }
    setHeightVersion((version) => version + 1)
  }, [offsets, pruneMeasuredRows, rowIndexByKey])

  const registerRow = useCallback((key: string, element: HTMLElement | null) => {
    if (element) rowElementsRef.current.set(key, element)
    else rowElementsRef.current.delete(key)
  }, [])

  const scrollToLatest = useCallback((mode: 'auto' | 'smooth') => {
    const element = scrollRef.current
    if (!element) return
    const top = element.scrollHeight
    const shouldSmooth = mode === 'smooth'
      && !prefersReducedMotion()
      && typeof element.scrollTo === 'function'
    if (shouldSmooth) {
      element.scrollTo({ top, behavior: 'smooth' })
      wasAtBottomRef.current = true
      return
    }
    if (typeof element.scrollTo === 'function') element.scrollTo({ top, behavior: 'auto' })
    element.scrollTop = top
    wasAtBottomRef.current = true
    setAwayFromLatest(false)
    setScrollOffset(top)
  }, [])

  const previousConversationIdRef = useRef(conversationId)

  useLayoutEffect(() => {
    const validKeys = new Set(rows.map((row) => row.key))
    const protectedKeys = new Set(renderedIndexes.map((index) => rows[index]?.key).filter((key): key is string => Boolean(key)))
    if (focusedRowKey) protectedKeys.add(focusedRowKey)
    if (selectedMessageKey) protectedKeys.add(`message:${conversationId}:${selectedMessageKey}`)
    protectedMeasurementKeysRef.current = protectedKeys

    let pruned = false
    rowHeightsRef.current.forEach((_height, key) => {
      if (!validKeys.has(key)) {
        rowHeightsRef.current.delete(key)
        pruned = true
      }
    })
    const sizeBeforeBound = rowHeightsRef.current.size
    pruneMeasuredRows()
    if (rowHeightsRef.current.size !== sizeBeforeBound) pruned = true
    if (pruned) setHeightVersion((version) => version + 1)
  }, [conversationId, focusedRowKey, pruneMeasuredRows, renderedIndexes, rows, selectedMessageKey])

  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const key = entry.target.getAttribute('data-virtual-key')
        if (key) measureElement(key, entry.target as HTMLElement)
      }
    })
    rowElementsRef.current.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [measureElement, renderedIndexes])

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const previousLayout = previousLayoutRef.current

    if (previousConversationIdRef.current !== conversationId) {
      previousConversationIdRef.current = conversationId
      rowElementsRef.current.clear()
      rowHeightsRef.current.clear()
      protectedMeasurementKeysRef.current.clear()
      previousLayoutRef.current = null
      wasAtBottomRef.current = true
      initialisedRef.current = true
      announcementSequenceRef.current = 0
      setFocusedRowKey(undefined)
      setUnseenInboundCount(0)
      setAwayFromLatest(false)
      setAnnouncement(undefined)
      setHeightVersion((version) => version + 1)
      scrollToLatest('auto')
      previousLayoutRef.current = { rows, offsets, heights: rowHeights }
      return
    }

    if (!initialisedRef.current) {
      initialisedRef.current = true
      scrollToLatest('auto')
      previousLayoutRef.current = { rows, offsets, heights: rowHeights }
      return
    }

    if (!previousLayout) {
      previousLayoutRef.current = { rows, offsets, heights: rowHeights }
      return
    }

    const previousMessageKeys = previousLayout.rows.flatMap((row) => row.type === 'message' ? [row.messageKey] : [])
    const nextMessageKeys = rows.flatMap((row) => row.type === 'message' ? [row.messageKey] : [])

    const rowsChanged = previousLayout.rows !== rows
    if (rowsChanged) {
      const previousVisibleIndex = indexAtOffset(
        element.scrollTop,
        previousLayout.rows,
        previousLayout.offsets,
        previousLayout.heights,
      )
      const rowsAtOrAfterViewport = previousLayout.rows
        .slice(previousVisibleIndex)
      const anchor = rowsAtOrAfterViewport
        .find((row) => row.type === 'message' && rowIndexByKey.has(row.key))
        ?? previousLayout.rows
          .slice(0, previousVisibleIndex)
          .reverse()
          .find((row) => row.type === 'message' && rowIndexByKey.has(row.key))
      if (anchor) {
        const previousAnchorIndex = previousLayout.rows.indexOf(anchor)
        const nextAnchorIndex = rowIndexByKey.get(anchor.key)
        if (nextAnchorIndex !== undefined) {
          const previousRelativeTop = (previousLayout.offsets[previousAnchorIndex] ?? 0) - element.scrollTop
          const nextScrollTop = (offsets[nextAnchorIndex] ?? 0) - previousRelativeTop
          if (nextScrollTop !== element.scrollTop) {
            element.scrollTop = nextScrollTop
            setScrollOffset(nextScrollTop)
          }
        }
      }
    }

    const didAppend = rowsChanged && nextMessageKeys.length > previousMessageKeys.length
      && previousMessageKeys.every((key, index) => nextMessageKeys[index] === key)
    const appendedMessages = didAppend ? renderMessages.slice(previousMessageKeys.length) : []
    const newInboundCount = appendedMessages.filter((message) =>
      message.senderId !== currentUserId && message.senderId !== 'system' && isPersonMessage(message),
    ).length
    let followedLatest = false
    if (didAppend && wasAtBottomRef.current) {
      scrollToLatest('smooth')
      followedLatest = true
    }
    if (newInboundCount > 0) {
      announcementSequenceRef.current += 1
      setAnnouncement({ id: announcementSequenceRef.current, text: `${newInboundCount} yeni mesaj` })
      if (!wasAtBottomRef.current) {
        setUnseenInboundCount((count) => count + newInboundCount)
      }
    }

    previousLayoutRef.current = { rows, offsets, heights: rowHeights }
    wasAtBottomRef.current = followedLatest ? true : isAtBottom(element)
  }, [conversationId, currentUserId, indexAtOffset, offsets, renderMessages, rowHeights, rowIndexByKey, rows, scrollToLatest])

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    const atBottom = isAtBottom(element)
    wasAtBottomRef.current = atBottom
    setAwayFromLatest(!atBottom)
    setScrollOffset(element.scrollTop)
    if (atBottom && unseenInboundCount > 0) setUnseenInboundCount(0)
  }

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[data-virtual-key]')
    setFocusedRowKey(row?.dataset.virtualKey)
  }

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const nextRow = (event.relatedTarget as HTMLElement | null)?.closest?.('[data-virtual-key]')
    if (!nextRow) setFocusedRowKey(undefined)
  }

  const spacerStyle: CSSProperties = { height: totalSize, position: 'relative' }

  return (
    <div className="messageTimeline__viewport">
      {hasOlder ? (
        <div className="messageTimeline__olderControl">
          <button type="button" onClick={onLoadOlder} disabled={loadingOlder || !onLoadOlder}>
            {loadingOlder ? 'Daha eski mesajlar yükleniyor' : 'Daha eski mesajları yükle'}
          </button>
        </div>
      ) : null}
      <div
        ref={scrollRef}
        role="log"
        aria-label={`${counterpartName} ile mesajlar`}
        aria-live="off"
        aria-relevant="additions text"
        className="messageTimeline"
        onScroll={handleScroll}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        <div style={spacerStyle}>
          {renderedIndexes.map((index) => {
            const row = rows[index]
            if (!row) return null
            const style: CSSProperties = {
              position: 'absolute',
              transform: `translateY(${offsets[index] ?? 0}px)`,
              width: '100%',
            }
            return (
              <div
                key={row.key}
                ref={(element) => registerRow(row.key, element)}
                data-virtual-row
                data-row-key={row.domKey}
                data-virtual-key={row.key}
                style={style}
              >
                {row.type === 'day' ? (
                  <p>{row.label}</p>
                ) : (
                  <MessageRow
                    message={row.message}
                    messageKey={row.messageKey}
                    currentUserId={currentUserId}
                    counterpartName={counterpartName}
                    showDelivery={row.messageKey === lastOutgoingMessageKey}
                    onRetry={onRetry}
                    onCopy={onCopy}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
      {awayFromLatest || unseenInboundCount > 0 ? (
        <button
          className="messageTimeline__latestControl"
          type="button"
          onClick={() => {
            scrollToLatest('smooth')
            setUnseenInboundCount(0)
          }}
        >
          {unseenInboundCount > 0
            ? `${unseenInboundCount} yeni mesajı göster`
            : 'En yeni mesaja dön'}
        </button>
      ) : null}
      <p className="messageTimeline__announcement" role="status" aria-live="polite" aria-atomic="true">
        {announcement ? <span key={announcement.id}>{announcement.text}</span> : null}
      </p>
    </div>
  )
}

function MessageRow({
  message,
  messageKey,
  currentUserId,
  counterpartName,
  showDelivery,
  onRetry,
  onCopy,
}: {
  message: MarketplaceMessage
  messageKey: string
  currentUserId: string
  counterpartName: string
  showDelivery: boolean
  onRetry?: (message: MarketplaceMessage) => void
  onCopy?: (message: MarketplaceMessage) => void
}) {
  if (message.kind === 'system' || message.kind === 'safety') {
    return (
      <article data-message-key={messageKey} data-note-kind={message.kind} className="messageTimeline__note">
        <p>{message.body}</p>
      </article>
    )
  }

  const outgoing = message.senderId === currentUserId
  const speaker = outgoing ? 'Siz' : counterpartName
  const direction = outgoing ? 'Giden mesaj' : 'Gelen mesaj'
  const failed = message.deliveryState === 'failed'
  const receipt = showDelivery ? deliveryLabel(message.deliveryState) : null

  return (
    <article
      data-message-key={messageKey}
      data-failed={failed || undefined}
      className={outgoing ? 'messageTimeline__outgoing' : 'messageTimeline__incoming'}
    >
      {/* Konuşan + yön: balonun hizası ve rengi görsel olarak zaten söylüyor,
          bu satır ekran okuyucu için görünmez biçimde korunur. */}
      <p className="messageTimeline__meta">{speaker} · {direction}</p>
      <p className="messageTimeline__body">{message.body}</p>
      {message.attachments.length > 0 ? (
        <ul className="messageTimeline__attachments" aria-label="Mesaj ekleri">
          {message.attachments.map((attachment) => <li key={attachment.id}>{attachment.name}</li>)}
        </ul>
      ) : null}
      <p className="messageTimeline__footer">
        <time dateTime={message.sentAt}>{clockLabel(message.sentAt)}</time>
        {failed ? (
          <>
            <span className="messageTimeline__failure">Gönderilemedi</span>
            <button type="button" onClick={() => onRetry?.(message)}>Tekrar dene</button>
            <button type="button" onClick={() => onCopy?.(message)}>Kopyala</button>
          </>
        ) : receipt ? <span>{receipt}</span> : null}
      </p>
    </article>
  )
}
