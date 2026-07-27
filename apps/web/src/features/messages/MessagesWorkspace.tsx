import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'

import { ConversationRail } from './components/ConversationRail'
import type { ComposerSubmission } from './components/MessageComposer'
import {
  MessageDrawers,
  type MessageOverlayState,
} from './components/MessageDrawers'
import { MessageThread } from './components/MessageThread'
import { createMessageDraftStorage } from './data/message-draft-storage'
import {
  conversationInfiniteQueryOptions,
  flattenConversationPages,
  flattenMessagePages,
  messagesQueryKeys,
  threadInfiniteQueryOptions,
} from './data/messages-query'
import {
  acknowledgeMessage,
  createPendingMessage,
  failPendingMessage,
  getMessageRenderKey,
  retryFailedMessage,
  updateConversationPreview,
  type ReconciledMessage,
} from './domain/message-reconciliation'
import type {
  ConversationPage,
  ConversationSummary,
  MarketplaceMessage,
  MessageAttachment,
  MessagePage,
  MessagesRealtimeEvent,
  MessagesWorkspaceProps,
} from './domain/message-types'

import styles from './MessagesWorkspace.module.css'
import panelStyles from './MessagesPanels.module.css'

type ConversationData = InfiniteData<ConversationPage, string | undefined>
type ThreadData = InfiniteData<MessagePage, string | undefined>

const DEFAULT_DRAFT_NAMESPACE = 'messages-workspace'
const CURRENT_USER_ID = 'current-user'
const CONVERSATION_LOOKUP_PAGE_SIZE = 100

async function resolveConversation(
  dataSource: MessagesWorkspaceProps['dataSource'],
  conversationId: string,
  signal: AbortSignal,
): Promise<ConversationSummary | null> {
  let cursor: string | undefined
  const visitedCursors = new Set<string>()

  do {
    const page = await dataSource.listConversations(
      {
        filter: 'all',
        query: '',
        cursor,
        limit: CONVERSATION_LOOKUP_PAGE_SIZE,
      },
      { signal },
    )
    const conversation = page.items.find(
      (candidate) => candidate.id === conversationId,
    )
    if (conversation) return conversation
    if (!page.nextCursor) return null
    if (visitedCursors.has(page.nextCursor)) {
      throw new Error('Konuşma sayfaları çözümlenemedi.')
    }
    visitedCursors.add(page.nextCursor)
    cursor = page.nextCursor
  } while (!signal.aborted)

  throw new DOMException('İstek iptal edildi.', 'AbortError')
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function sortConversations(items: readonly ConversationSummary[]) {
  return [...items].sort(
    (left, right) =>
      right.lastUserActivityAt.localeCompare(left.lastUserActivityAt) ||
      left.id.localeCompare(right.id),
  )
}

function repartitionConversationData(
  data: ConversationData,
  items: readonly ConversationSummary[],
): ConversationData {
  let offset = 0
  return {
    ...data,
    pages: data.pages.map((page, index) => {
      const isLast = index === data.pages.length - 1
      const length = isLast ? items.length - offset : page.items.length
      const pageItems = items.slice(offset, offset + Math.max(0, length))
      offset += pageItems.length
      return { ...page, items: pageItems }
    }),
  }
}

function repartitionThreadData(
  data: ThreadData,
  messages: readonly MarketplaceMessage[],
): ThreadData {
  let offset = 0
  return {
    ...data,
    pages: data.pages.map((page, index) => {
      const isLast = index === data.pages.length - 1
      const length = isLast ? messages.length - offset : page.items.length
      const pageItems = messages.slice(offset, offset + Math.max(0, length))
      offset += pageItems.length
      return { ...page, items: pageItems }
    }),
  }
}

function mutateThreadCache(
  queryClient: QueryClient,
  conversationId: string,
  mutate: (messages: readonly ReconciledMessage[]) => ReconciledMessage[],
) {
  const queryKey = messagesQueryKeys.thread(conversationId)
  if (!queryClient.getQueryData<ThreadData>(queryKey)) return false

  queryClient.setQueryData<ThreadData>(
    queryKey,
    (data) => {
      if (!data) return data
      const current = data.pages.flatMap((page) => page.items)
      return repartitionThreadData(data, mutate(current))
    },
  )
  return true
}

function mutateConversationCaches(
  queryClient: QueryClient,
  mutate: (
    conversations: readonly ConversationSummary[],
  ) => readonly ConversationSummary[],
) {
  queryClient.setQueriesData<ConversationData>(
    {
      queryKey: [...messagesQueryKeys.all, 'conversations'],
    },
    (data) => {
      if (!data) return data
      const current = data.pages.flatMap((page) => page.items)
      return repartitionConversationData(data, sortConversations(mutate(current)))
    },
  )
}

function updatePreviewCaches(
  queryClient: QueryClient,
  message: ReconciledMessage,
) {
  mutateConversationCaches(queryClient, (conversations) =>
    updateConversationPreview(conversations, message),
  )
}

function replaceConversationCaches(
  queryClient: QueryClient,
  conversation: ConversationSummary,
) {
  mutateConversationCaches(queryClient, (conversations) =>
    conversations.map((current) =>
      current.id === conversation.id ? conversation : current,
    ),
  )
}

function receiptSafeMessages(
  messages: readonly MarketplaceMessage[],
  capabilities: MessagesWorkspaceProps['dataSource']['capabilities'],
) {
  return messages.map((message): MarketplaceMessage => {
    if (message.deliveryState === 'read' && capabilities?.readReceipts !== true) {
      return {
        ...message,
        deliveryState:
          capabilities?.deliveryReceipts === true ? 'delivered' : 'sent',
      } as MarketplaceMessage
    }
    if (
      message.deliveryState === 'delivered' &&
      capabilities?.deliveryReceipts !== true
    ) {
      return { ...message, deliveryState: 'sent' } as MarketplaceMessage
    }
    return message
  })
}

function safeSessionStorage() {
  try {
    if (typeof window !== 'undefined') return window.sessionStorage
  } catch {
    // Session storage kapalıysa composer yalnız bellek state'iyle çalışır.
  }

  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    key: (index: number) => [...values.keys()][index] ?? null,
  }
}

function AccessState({
  mode,
}: {
  mode: Exclude<NonNullable<MessagesWorkspaceProps['mode']>, 'ready'>
}) {
  const content =
    mode === 'session-expired'
      ? {
          title: 'Oturum süresi doldu',
          body: 'Mesajlarınızı korumak için özel içerikler bu görünümde gösterilmiyor.',
        }
      : mode === 'restricted'
        ? {
            title: 'Mesajlara erişim kısıtlandı',
            body: 'Bu hesap için konuşma ve mesaj içeriği kullanılamıyor.',
          }
        : {
            title: 'Mesajlar hazırlanıyor',
            body: 'Konuşma çalışma alanınız yükleniyor.',
          }

  return (
    <div className={styles.frame}>
      <section
        className={styles.accessState}
        aria-labelledby={`messages-${mode}-title`}
      >
        <h1 id={`messages-${mode}-title`}>{content.title}</h1>
        <p>{content.body}</p>
      </section>
    </div>
  )
}

/** Mesaj sorgularını, optimistic mutasyonları ve private yaşam döngüsünü orkestre eder. */
export function MessagesWorkspace(props: MessagesWorkspaceProps) {
  const {
    dataSource,
    mode = 'ready',
    defaultConversationId,
    onConversationChange,
    connectionState = 'online',
    onOpenListing,
    draftNamespace = DEFAULT_DRAFT_NAMESPACE,
  } = props
  const queryClient = useQueryClient()
  const controlled = Object.prototype.hasOwnProperty.call(props, 'conversationId')
  const [internalConversationId, setInternalConversationId] = useState(
    defaultConversationId,
  )
  const activeConversationId = controlled
    ? props.conversationId
    : internalConversationId
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [query, setQuery] = useState('')
  const [overlay, setOverlay] = useState<MessageOverlayState>()
  const [railScrollOffset, setRailScrollOffset] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const threadFrameRef = useRef<HTMLDivElement>(null)
  const requestControllersRef = useRef(new Set<AbortController>())
  const objectUrlsRef = useRef(new Map<string, number>())
  const realtimeStopRef = useRef<(() => void) | undefined>(undefined)
  const accessCleanupStartedRef = useRef(false)
  const readThroughRef = useRef(new Map<string, number>())
  const lifecycleRef = useRef({
    generation: 0,
    ready: false,
    dataSource,
  })
  const activeConversationIdRef = useRef(activeConversationId)
  const draftStorage = useMemo(
    () => createMessageDraftStorage(safeSessionStorage(), draftNamespace),
    [draftNamespace],
  )
  const ready = mode === 'ready'
  const accessClosed = mode === 'session-expired' || mode === 'restricted'

  useLayoutEffect(() => {
    const lifecycle = lifecycleRef.current
    if (lifecycle.ready !== ready || lifecycle.dataSource !== dataSource) {
      lifecycleRef.current = {
        generation: lifecycle.generation + 1,
        ready,
        dataSource,
      }
    }
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId, dataSource, ready])

  const isCurrentGeneration = useCallback(
    (generation: number) => {
      const lifecycle = lifecycleRef.current
      return lifecycle.ready && lifecycle.generation === generation
    },
    [],
  )

  const conversationsQuery = useInfiniteQuery({
    ...conversationInfiniteQueryOptions(dataSource, { filter, query }),
    enabled: ready,
    placeholderData: (previousData) => previousData,
  })
  const conversations = conversationsQuery.data
    ? flattenConversationPages(conversationsQuery.data)
    : []
  const railConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )
  const selectedConversationQuery = useQuery({
    queryKey: [
      ...messagesQueryKeys.all,
      'selected-conversation',
      activeConversationId ?? '',
    ],
    queryFn: ({ signal }) =>
      resolveConversation(dataSource, activeConversationId!, signal),
    enabled:
      ready &&
      Boolean(activeConversationId) &&
      conversationsQuery.isSuccess &&
      !railConversation,
  })
  const activeConversation =
    railConversation ?? selectedConversationQuery.data ?? undefined

  const threadQuery = useInfiniteQuery({
    ...threadInfiniteQueryOptions(dataSource, activeConversationId ?? ''),
    enabled: ready && Boolean(activeConversation),
  })
  const rawMessages = useMemo(
    () =>
      threadQuery.data ? flattenMessagePages(threadQuery.data) : [],
    [threadQuery.data],
  )
  const visibleMessages = useMemo(
    () => receiptSafeMessages(rawMessages, dataSource.capabilities),
    [dataSource.capabilities, rawMessages],
  )

  const stopRealtime = useCallback(() => {
    const stop = realtimeStopRef.current
    realtimeStopRef.current = undefined
    stop?.()
  }, [])

  const abortPendingRequests = useCallback(() => {
    requestControllersRef.current.forEach((controller) => controller.abort())
    requestControllersRef.current.clear()
  }, [])

  const revokeObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((_generation, url) =>
      URL.revokeObjectURL(url),
    )
    objectUrlsRef.current.clear()
  }, [])

  const releaseAttachmentUrls = useCallback(
    (
      attachments: readonly MessageAttachment[],
      generation: number,
    ) => {
      for (const attachment of attachments) {
        const url = attachment.url
        if (
          !url ||
          objectUrlsRef.current.get(url) !== generation
        ) {
          continue
        }
        objectUrlsRef.current.delete(url)
        URL.revokeObjectURL(url)
      }
    },
    [],
  )

  const applyRealtimeEvent = useCallback(
    (event: MessagesRealtimeEvent, generation: number) => {
      if (!isCurrentGeneration(generation)) return
      if (event.type === 'conversation.updated') {
        replaceConversationCaches(queryClient, event.conversation)
        return
      }

      const incoming = event.message
      if (typeof incoming.id !== 'string') return
      if (incoming.conversationId === activeConversationIdRef.current) {
        mutateThreadCache(queryClient, incoming.conversationId, (current) =>
          acknowledgeMessage(current, incoming),
        )
      }
      updatePreviewCaches(queryClient, incoming)
    },
    [isCurrentGeneration, queryClient],
  )

  useEffect(() => {
    if (!ready || !dataSource.realtime) return
    let stopped = false
    const generation = lifecycleRef.current.generation
    const unsubscribe = dataSource.realtime.subscribe((event) => {
      if (!stopped) applyRealtimeEvent(event, generation)
    })
    const stopOnce = () => {
      if (stopped) return
      stopped = true
      unsubscribe()
    }
    realtimeStopRef.current = stopOnce
    return () => {
      if (realtimeStopRef.current === stopOnce) {
        realtimeStopRef.current = undefined
      }
      stopOnce()
    }
  }, [applyRealtimeEvent, dataSource, dataSource.realtime, ready])

  useEffect(() => {
    if (!accessClosed) {
      accessCleanupStartedRef.current = false
      return
    }
    if (accessCleanupStartedRef.current) return
    accessCleanupStartedRef.current = true
    const cleanupGeneration = lifecycleRef.current.generation

    const cancellation = queryClient.cancelQueries({
      queryKey: messagesQueryKeys.all,
    })
    stopRealtime()
    abortPendingRequests()
    revokeObjectUrls()
    setOverlay(undefined)
    setDrafts({})

    void (async () => {
      await cancellation
      if (
        lifecycleRef.current.generation !== cleanupGeneration ||
        lifecycleRef.current.ready
      ) {
        return
      }
      queryClient.removeQueries({ queryKey: messagesQueryKeys.all })
      draftStorage.clearAllDrafts()
    })()
  }, [
    abortPendingRequests,
    accessClosed,
    draftStorage,
    queryClient,
    revokeObjectUrls,
    stopRealtime,
  ])

  useEffect(
    () => () => {
      stopRealtime()
      abortPendingRequests()
      revokeObjectUrls()
    },
    [abortPendingRequests, revokeObjectUrls, stopRealtime],
  )

  const selectConversation = (conversationId: string) => {
    if (!controlled) setInternalConversationId(conversationId)
    onConversationChange?.(conversationId)
    setOverlay(undefined)
  }

  const draftForActiveConversation = activeConversationId
    ? drafts[activeConversationId] ??
      draftStorage.loadDraft(activeConversationId)
    : ''

  const changeDraft = (value: string) => {
    if (!activeConversationId) return
    setDrafts((current) => ({ ...current, [activeConversationId]: value }))
    draftStorage.saveDraft(activeConversationId, value)
  }

  const registerController = () => {
    const controller = new AbortController()
    requestControllersRef.current.add(controller)
    return controller
  }

  const releaseController = (controller: AbortController) => {
    requestControllersRef.current.delete(controller)
  }

  const uploadAttachments = async (
    conversationId: string,
    files: readonly File[],
    generation: number,
  ) => {
    const upload = dataSource.capabilities?.uploadAttachment
    if (!upload || files.length === 0) return []

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const controller = registerController()
        try {
          const attachment = await upload(
            { conversationId, file },
            { signal: controller.signal },
          )
          if (attachment.url?.startsWith('blob:')) {
            if (!isCurrentGeneration(generation)) {
              URL.revokeObjectURL(attachment.url)
              throw new Error('Eski erişim kuşağı upload sonucu.')
            }
            objectUrlsRef.current.set(attachment.url, generation)
          }
          if (!isCurrentGeneration(generation)) {
            throw new Error('Eski erişim kuşağı upload sonucu.')
          }
          return attachment
        } finally {
          releaseController(controller)
        }
      }),
    )
    const attachments = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    )
    if (
      !isCurrentGeneration(generation) ||
      results.some((result) => result.status === 'rejected')
    ) {
      releaseAttachmentUrls(attachments, generation)
      throw new Error('Ekler yüklenemedi.')
    }
    return attachments
  }

  const sendCanonical = async (
    input: {
      conversationId: string
      clientMessageId: string
      body: string
      attachments: MessageAttachment[]
    },
    generation: number,
  ) => {
    const controller = registerController()
    try {
      const acknowledged = await dataSource.sendMessage(input, {
        signal: controller.signal,
      })
      if (!isCurrentGeneration(generation)) return
      if (typeof acknowledged.id !== 'string') {
        throw new Error('Sunucu mesajı onaylamadı.')
      }
      mutateThreadCache(queryClient, input.conversationId, (current) =>
        acknowledgeMessage(current, acknowledged),
      )
      updatePreviewCaches(queryClient, acknowledged)
    } catch (error) {
      if (controller.signal.aborted || !isCurrentGeneration(generation)) return
      const reason = errorText(error, 'Mesaj gönderilemedi.')
      let failedMessage: ReconciledMessage | undefined
      mutateThreadCache(queryClient, input.conversationId, (current) => {
        const failed = failPendingMessage(
          current,
          input.clientMessageId,
          reason,
        )
        failedMessage = failed.find(
          (message) => message.clientMessageId === input.clientMessageId,
        )
        return failed
      })
      if (failedMessage) updatePreviewCaches(queryClient, failedMessage)
    } finally {
      releaseController(controller)
      releaseAttachmentUrls(input.attachments, generation)
    }
  }

  const sendMessage = async (
    submission: ComposerSubmission,
  ): Promise<boolean> => {
    if (!activeConversationId) return false
    const generation = lifecycleRef.current.generation
    const body = submission.body.trim()
    if (!body) return false
    const conversationId = activeConversationId

    let attachments: MessageAttachment[]
    try {
      attachments = await uploadAttachments(
        conversationId,
        submission.attachments,
        generation,
      )
    } catch {
      return false
    }

    if (accessClosed || !isCurrentGeneration(generation)) {
      releaseAttachmentUrls(attachments, generation)
      return false
    }
    const clientMessageId = globalThis.crypto.randomUUID()
    const sentAt = new Date().toISOString()
    const pending = createPendingMessage({
      conversationId,
      clientMessageId,
      senderId: CURRENT_USER_ID,
      body,
      attachments,
      sentAt,
      kind: attachments.length > 0 ? 'attachment' : 'text',
    })

    const enqueued = mutateThreadCache(queryClient, conversationId, (current) => [
      ...current,
      pending,
    ])
    if (!enqueued) {
      releaseAttachmentUrls(attachments, generation)
      return false
    }
    updatePreviewCaches(queryClient, pending)
    void sendCanonical(
      { conversationId, clientMessageId, body, attachments },
      generation,
    )
    return true
  }

  const retryMessage = (message: MarketplaceMessage) => {
    if (
      message.deliveryState !== 'failed' ||
      !message.clientMessageId ||
      !activeConversationId ||
      message.conversationId !== activeConversationId
    ) {
      return
    }

    let retrying: ReconciledMessage | undefined
    mutateThreadCache(queryClient, activeConversationId, (current) => {
      const next = retryFailedMessage(current, message.clientMessageId!)
      retrying = next.find(
        (candidate) => candidate.clientMessageId === message.clientMessageId,
      )
      return next
    })
    if (retrying) updatePreviewCaches(queryClient, retrying)
    const generation = lifecycleRef.current.generation
    void sendCanonical({
      conversationId: message.conversationId,
      clientMessageId: message.clientMessageId,
      body: message.body,
      attachments: message.attachments,
    }, generation)
  }

  useEffect(() => {
    if (
      !ready ||
      !activeConversation ||
      activeConversation.unreadCount <= 0 ||
      visibleMessages.length === 0 ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const boundary = [...visibleMessages]
      .reverse()
      .find(
        (message) =>
          message.sequence !== null &&
          message.senderId !== CURRENT_USER_ID &&
          message.senderId !== 'system',
      )
    if (!boundary || boundary.sequence === null) return
    const previousRead = readThroughRef.current.get(activeConversation.id) ?? 0
    if (previousRead >= boundary.sequence) return

    const boundaryKey = getMessageRenderKey(boundary)
    const boundaryElement = Array.from(
      threadFrameRef.current?.querySelectorAll<HTMLElement>(
        '[data-message-key]',
      ) ?? [],
    ).find(
      (element) => element.getAttribute('data-message-key') === boundaryKey,
    )
    if (!boundaryElement) return

    const markRead = () => {
      if (
        document.visibilityState !== 'visible' ||
        readThroughRef.current.get(activeConversation.id) === boundary.sequence
      ) {
        return
      }
      readThroughRef.current.set(activeConversation.id, boundary.sequence!)
      const generation = lifecycleRef.current.generation
      const controller = registerController()
      void dataSource
        .markConversationRead(
          {
            conversationId: activeConversation.id,
            throughSequence: boundary.sequence!,
          },
          { signal: controller.signal },
        )
        .then((conversation) => {
          if (isCurrentGeneration(generation)) {
            replaceConversationCaches(queryClient, conversation)
          }
        })
        .catch(() => {
          if (
            !controller.signal.aborted &&
            isCurrentGeneration(generation)
          ) {
            readThroughRef.current.delete(activeConversation.id)
          }
        })
        .finally(() => releaseController(controller))
    }

    let intersecting = false
    const observer = new IntersectionObserver((entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting)
      if (intersecting) markRead()
    })
    const onVisibilityChange = () => {
      if (intersecting) markRead()
    }
    observer.observe(boundaryElement)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [
    activeConversation,
    dataSource,
    isCurrentGeneration,
    queryClient,
    ready,
    visibleMessages,
  ])

  if (!ready) {
    return (
      <main
        id="main-content"
        className={styles.page}
        aria-busy={mode === 'loading' || undefined}
      >
        <AccessState mode={mode} />
      </main>
    )
  }

  const listError = conversationsQuery.isError
    ? errorText(conversationsQuery.error, 'Konuşmalar alınamadı.')
    : undefined
  const threadError = threadQuery.isError
    ? errorText(threadQuery.error, 'Mesajlar alınamadı.')
    : undefined
  const conversationResolutionError = selectedConversationQuery.isError
    ? errorText(
        selectedConversationQuery.error,
        'Konuşma bilgisi alınamadı.',
      )
    : undefined
  const conversationResolutionPending =
    Boolean(activeConversationId) &&
    !activeConversation &&
    (conversationsQuery.isPending || selectedConversationQuery.isPending)
  const controlledConversationMissing =
    controlled &&
    Boolean(activeConversationId) &&
    selectedConversationQuery.isSuccess &&
    selectedConversationQuery.data === null
  const latestReportableMessage = [...visibleMessages]
    .reverse()
    .find((message) => typeof message.id === 'string')
  const reportMessage =
    overlay?.kind === 'report'
      ? visibleMessages.find(
          (message) =>
            message.id === overlay.messageId &&
            message.conversationId === overlay.conversationId,
        )
      : undefined

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Mesajlar</h1>
            <p>İlan konuşmalarınız, tek güvenli çalışma alanında.</p>
          </div>
          {connectionState === 'reconnecting' ? (
            <p
              className={styles.connectionStatus}
              role="status"
              data-connection-state="reconnecting"
            >
              Bağlantı yeniden kuruluyor
            </p>
          ) : connectionState === 'offline' ? (
            <p
              className={styles.connectionStatus}
              role="status"
              data-connection-state="offline"
            >
              Çevrimdışısınız
            </p>
          ) : null}
        </header>

        <div
          className={`${styles.workspace} ${panelStyles.panels}`}
          data-active-conversation={activeConversation ? 'true' : 'false'}
        >
          <section
            className={styles.railPane}
            data-messages-content-surface
            data-material="flat"
            aria-label="Konuşma listesi"
          >
            {listError ? (
              <div
                className={styles.localState}
                aria-labelledby="messages-rail-error-title"
              >
                <h2 id="messages-rail-error-title">Konuşmalar</h2>
                <p role="alert">{listError}</p>
                <button
                  type="button"
                  onClick={() => void conversationsQuery.refetch()}
                >
                  Konuşmaları yeniden yükle
                </button>
              </div>
            ) : conversationsQuery.isPending ? (
              <div
                className={styles.localState}
                aria-labelledby="messages-rail-loading-title"
                aria-busy="true"
              >
                <h2 id="messages-rail-loading-title">Konuşmalar</h2>
                <p>Konuşmalar yükleniyor</p>
              </div>
            ) : (
              <>
                <ConversationRail
                  conversations={conversations}
                  totalCount={conversations.length}
                  filter={filter}
                  query={query}
                  activeConversationId={activeConversationId}
                  hasNextPage={Boolean(conversationsQuery.hasNextPage)}
                  loadingMore={conversationsQuery.isFetchingNextPage}
                  onFilterChange={setFilter}
                  onQueryChange={setQuery}
                  onConversationChange={selectConversation}
                  onLoadMore={() => void conversationsQuery.fetchNextPage()}
                  scrollOffset={railScrollOffset}
                  onScrollOffsetChange={setRailScrollOffset}
                />
                {conversations.length === 0 && query ? (
                  <div className={styles.emptyState}>
                    <p>Aramanızla eşleşen konuşma bulunamadı</p>
                    <button type="button" onClick={() => setQuery('')}>
                      Aramayı temizle
                    </button>
                  </div>
                ) : conversations.length === 0 && filter === 'all' ? (
                  <div className={styles.emptyState}>
                    <p>Henüz konuşmanız yok</p>
                    <a href="/emlak">İlanları keşfet</a>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Bu filtrede konuşma yok</p>
                    <button type="button" onClick={() => setFilter('all')}>
                      Tüm konuşmaları göster
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section
            ref={threadFrameRef}
            className={styles.threadPane}
            data-messages-content-surface
            data-material="flat"
            aria-label="Aktif konuşma"
          >
            {activeConversation && dataSource.capabilities ? (
              <div
                className={styles.capabilityActions}
                aria-label="Konuşma eylemleri"
              >
                {dataSource.capabilities.markConversationUnread ? (
                  <button
                    type="button"
                    onClick={() => {
                      const operation =
                        dataSource.capabilities?.markConversationUnread
                      const latestSequence = Math.max(
                        0,
                        ...visibleMessages.map(
                          (message) => message.sequence ?? 0,
                        ),
                      )
                      if (!operation) return
                      const controller = registerController()
                      void operation(
                        {
                          conversationId: activeConversation.id,
                          throughSequence: latestSequence,
                        },
                        { signal: controller.signal },
                      )
                        .then((conversation) =>
                          replaceConversationCaches(queryClient, conversation),
                        )
                        .finally(() => releaseController(controller))
                    }}
                  >
                    Okunmadı olarak işaretle
                  </button>
                ) : null}
                {dataSource.capabilities.reportMessage &&
                latestReportableMessage?.id ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOverlay({
                        kind: 'report',
                        conversationId: activeConversation.id,
                        messageId: latestReportableMessage.id!,
                      })
                    }
                  >
                    Mesajı bildir
                  </button>
                ) : null}
                {dataSource.capabilities.blockParticipant ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOverlay({
                        kind: 'block',
                        conversationId: activeConversation.id,
                        participantId: activeConversation.counterpart.id,
                      })
                    }
                  >
                    Kişiyi engelle
                  </button>
                ) : null}
              </div>
            ) : null}

            {controlledConversationMissing ? (
              <section
                className={styles.localState}
                aria-labelledby="messages-thread-not-found-title"
              >
                <h2 id="messages-thread-not-found-title">
                  Konuşma bulunamadı
                </h2>
                <p>
                  Bu konuşma kaldırılmış, erişime kapanmış veya bağlantı
                  geçersiz olabilir.
                </p>
              </section>
            ) : (
              <MessageThread
                conversation={activeConversation}
                state={
                  conversationResolutionPending
                    ? 'loading'
                    : conversationResolutionError
                      ? 'error'
                      : activeConversation && threadQuery.isPending
                        ? 'loading'
                        : activeConversation && threadError
                          ? 'error'
                          : 'ready'
                }
                error={conversationResolutionError ?? threadError}
                messages={visibleMessages}
                currentUserId={CURRENT_USER_ID}
                hasOlder={Boolean(threadQuery.hasPreviousPage)}
                loadingOlder={threadQuery.isFetchingPreviousPage}
                onLoadOlder={() => void threadQuery.fetchPreviousPage()}
                onRetry={retryMessage}
                onCopy={(message) => {
                  void navigator.clipboard?.writeText(message.body)
                }}
                draft={draftForActiveConversation}
                onDraftChange={changeDraft}
                onSend={activeConversation ? sendMessage : undefined}
                attachmentCapability={
                  dataSource.capabilities?.uploadAttachment
                }
                onOpenListing={onOpenListing}
                onOverlayStateChange={setOverlay}
              />
            )}
          </section>
        </div>
      </div>

      <MessageDrawers
        state={overlay}
        onStateChange={setOverlay}
        conversation={activeConversation}
        reportMessage={reportMessage}
        onReportMessage={dataSource.capabilities?.reportMessage}
        onBlockParticipant={dataSource.capabilities?.blockParticipant}
      />
    </main>
  )
}
