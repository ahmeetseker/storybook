import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  ConversationSummary,
  MarketplaceMessage,
  MessagePage,
  MessagesDataSource,
  MessagesRealtimeEvent,
  MessagesWorkspaceProps,
} from './domain/message-types'
import { messagesQueryKeys } from './data/messages-query'
import { MessagesWorkspace } from './MessagesWorkspace'

const conversations: ConversationSummary[] = [
  {
    id: 'conversation-a',
    counterpart: { id: 'person-a', displayName: 'Ayşe Kaya' },
    listing: {
      id: 'listing-a',
      title: 'Urla’da Taş Ev',
      imageAlt: 'Urla taş ev',
      referenceLabel: 'İlan 1001',
      priceLabel: '₺18.500.000',
    },
    lastMessage: {
      kind: 'text',
      body: 'Evi yarın görebilir miyiz?',
      senderId: 'person-a',
      sentAt: '2026-07-20T09:00:00.000Z',
    },
    unreadCount: 1,
    lastUserActivityAt: '2026-07-20T09:00:00.000Z',
    status: 'active',
  },
  {
    id: 'conversation-b',
    counterpart: { id: 'person-b', displayName: 'Mert Arslan' },
    listing: {
      id: 'listing-b',
      title: 'Çeşme’de Yazlık',
      imageAlt: 'Çeşme yazlık',
      referenceLabel: 'İlan 2002',
      priceLabel: '₺22.000.000',
    },
    lastMessage: {
      kind: 'text',
      body: 'Planı gönderebilirim.',
      senderId: 'person-b',
      sentAt: '2026-07-19T09:00:00.000Z',
    },
    unreadCount: 0,
    lastUserActivityAt: '2026-07-19T09:00:00.000Z',
    status: 'active',
  },
]

const messages: MarketplaceMessage[] = [
  {
    id: 'message-a-1',
    conversationId: 'conversation-a',
    sequence: 1,
    senderId: 'person-a',
    kind: 'text',
    body: 'Evi yarın görebilir miyiz?',
    attachments: [],
    deliveryState: 'sent',
    sentAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'message-b-1',
    conversationId: 'conversation-b',
    sequence: 1,
    senderId: 'person-b',
    kind: 'text',
    body: 'Planı gönderebilirim.',
    attachments: [],
    deliveryState: 'sent',
    sentAt: '2026-07-19T09:00:00.000Z',
  },
]

function canonicalMessage(
  input: Parameters<MessagesDataSource['sendMessage']>[0],
): MarketplaceMessage {
  return {
    id: `server-${input.clientMessageId}`,
    clientMessageId: input.clientMessageId,
    conversationId: input.conversationId,
    sequence: 2,
    senderId: 'current-user',
    kind: input.attachments.length > 0 ? 'attachment' : 'text',
    body: input.body,
    attachments: input.attachments,
    deliveryState: 'sent',
    sentAt: '2026-07-27T12:00:00.000Z',
  }
}

function createDataSource(
  overrides: Partial<MessagesDataSource> = {},
): MessagesDataSource {
  return {
    listConversations: vi.fn(async ({ filter, query }) => {
      const normalized = query.toLocaleLowerCase('tr-TR')
      return {
        items: conversations.filter((conversation) => {
          const matchesQuery =
            !normalized ||
            `${conversation.counterpart.displayName} ${conversation.listing.title}`
              .toLocaleLowerCase('tr-TR')
              .includes(normalized)
          const matchesFilter =
            filter === 'all' ||
            (filter === 'unread' && conversation.unreadCount > 0) ||
            (filter === 'archived' && conversation.status === 'archived')
          return matchesQuery && matchesFilter
        }),
      }
    }),
    listMessages: vi.fn(async ({ conversationId }) => ({
      items: messages.filter((message) => message.conversationId === conversationId),
    })),
    sendMessage: vi.fn(async (input) => canonicalMessage(input)),
    archiveConversation: vi.fn(async ({ conversationId, archived }) => ({
      ...conversations.find(({ id }) => id === conversationId)!,
      status: (archived ? 'archived' : 'active') as ConversationSummary['status'],
    })),
    markConversationRead: vi.fn(async ({ conversationId }) => ({
      ...conversations.find(({ id }) => id === conversationId)!,
      unreadCount: 0,
    })),
    ...overrides,
  }
}

function freshQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  })
}

function renderWorkspace(
  initialProps: MessagesWorkspaceProps,
  queryClient = freshQueryClient(),
) {
  let setWorkspaceProps:
    | ((nextProps: MessagesWorkspaceProps) => void)
    | undefined
  function WorkspaceRoute() {
    const [props, setProps] = useState(initialProps)
    setWorkspaceProps = setProps
    return (
      <QueryClientProvider client={queryClient}>
        <MessagesWorkspace {...props} />
      </QueryClientProvider>
    )
  }
  const rootRoute = createRootRoute({ component: Outlet })
  const messagesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim/mesajlar',
    component: WorkspaceRoute,
  })
  const emlakRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>İlanlar</p>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([messagesRoute, emlakRoute]),
    history: createMemoryHistory({ initialEntries: ['/hesabim/mesajlar'] }),
  })
  const view = render(<RouterProvider router={router} />)

  return {
    ...view,
    queryClient,
    rerenderWorkspace(nextProps: MessagesWorkspaceProps) {
      act(() => setWorkspaceProps?.(nextProps))
    },
  }
}

function deferred<Value>() {
  let resolvePromise!: (value: Value) => void
  let rejectPromise!: (reason: unknown) => void
  const promise = new Promise<Value>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

afterEach(() => {
  window.sessionStorage.clear()
  vi.restoreAllMocks()
})

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

describe('MessagesWorkspace', () => {
  it('renders one named workspace landmark and sequential headings without permanent glass content surfaces', async () => {
    const { container } = renderWorkspace({
      dataSource: createDataSource(),
      defaultConversationId: 'conversation-a',
    })

    await screen.findByRole('heading', { name: 'Mesajlar', level: 1 })
    expect(container.querySelectorAll('main#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      await screen.findByRole('navigation', { name: 'Konuşmalar' }),
    ).toBeTruthy()
    expect(
      await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' }),
    ).toBeTruthy()
    expect(
      container.querySelectorAll(
        '[data-messages-content-surface][data-material="glass"]',
      ),
    ).toHaveLength(0)

    const levels = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      (heading) => Number(heading.tagName.slice(1)),
    )
    expect(levels[0]).toBe(1)
    expect(
      levels.every(
        (level, index) => index === 0 || level <= (levels[index - 1] ?? 1) + 1,
      ),
    ).toBe(true)
  })

  it('keeps controlled selection external and starts uncontrolled selection from defaultConversationId', async () => {
    const controlled = renderWorkspace({
      dataSource: createDataSource(),
      conversationId: 'conversation-a',
    })
    const firstActive = await screen.findByRole('link', { name: /Ayşe Kaya/ })
    fireEvent.click(screen.getByRole('link', { name: /Mert Arslan/ }))
    expect(firstActive.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: /Mert Arslan/ }).getAttribute('aria-current')).toBeNull()
    controlled.unmount()

    renderWorkspace({
      dataSource: createDataSource(),
      defaultConversationId: 'conversation-b',
    })
    expect(
      (await screen.findByRole('link', { name: /Mert Arslan/ })).getAttribute(
        'aria-current',
      ),
    ).toBe('page')
  })

  it('keeps the rail healthy and names an opaque controlled selection as not found', async () => {
    const source = createDataSource()
    renderWorkspace({
      dataSource: source,
      conversationId: 'opaque-conversation-id',
    })

    expect(
      await screen.findByRole('navigation', { name: 'Konuşmalar' }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: /Ayşe Kaya/ })).toBeTruthy()
    expect(
      await screen.findByRole('heading', {
        name: 'Konuşma bulunamadı',
        level: 2,
      }),
    ).toBeTruthy()
    expect(screen.queryByText('Bir konuşma seçin')).toBeNull()
    expect(source.listMessages).not.toHaveBeenCalled()
  })

  it('resolves a valid controlled conversation beyond the rail page and preserves it when filtered out', async () => {
    const hiddenConversation: ConversationSummary = {
      id: 'conversation-hidden',
      counterpart: { id: 'person-hidden', displayName: 'Gizem Aksoy' },
      listing: {
        id: 'listing-hidden',
        title: 'Foça’da Taş Ev',
        imageAlt: 'Foça taş ev',
        referenceLabel: 'İlan 3003',
        priceLabel: '₺12.500.000',
      },
      lastMessage: {
        kind: 'text',
        body: 'İkinci sayfadaki mesaj',
        senderId: 'person-hidden',
        sentAt: '2026-07-18T09:00:00.000Z',
      },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-18T09:00:00.000Z',
      status: 'active',
    }
    const source = createDataSource({
      listConversations: vi.fn(async ({ filter, cursor }) => {
        if (filter === 'unread') return { items: [conversations[0]!] }
        return cursor
          ? { items: [hiddenConversation] }
          : { items: [conversations[0]!], nextCursor: 'second-page' }
      }),
      listMessages: vi.fn(async ({ conversationId }) => ({
        items:
          conversationId === hiddenConversation.id
            ? [
                {
                  id: 'hidden-message',
                  conversationId,
                  sequence: 1,
                  senderId: hiddenConversation.counterpart.id,
                  kind: 'text',
                  body: 'İkinci sayfadaki mesaj',
                  attachments: [],
                  deliveryState: 'sent',
                  sentAt: '2026-07-18T09:00:00.000Z',
                } as MarketplaceMessage,
              ]
            : [],
      })),
    })
    renderWorkspace({
      dataSource: source,
      conversationId: hiddenConversation.id,
    })

    expect(
      await screen.findByRole('log', { name: 'Gizem Aksoy ile mesajlar' }),
    ).toBeTruthy()
    expect(screen.queryByText('Konuşma bulunamadı')).toBeNull()
    expect(
      source.listConversations,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 'second-page', filter: 'all' }),
      expect.any(Object),
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış' }))
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /Gizem Aksoy/ })).toBeNull(),
    )
    expect(
      screen.getByRole('log', { name: 'Gizem Aksoy ile mesajlar' }),
    ).toBeTruthy()
    expect(screen.queryByText('Konuşma bulunamadı')).toBeNull()
  })

  it('changes conversation query keys for search and filter input', async () => {
    const source = createDataSource()
    renderWorkspace({ dataSource: source })
    await screen.findByRole('navigation', { name: 'Konuşmalar' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Konuşmalarda ara' }), {
      target: { value: 'Çeşme' },
    })
    await waitFor(() =>
      expect(source.listConversations).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'cesme' }),
        expect.any(Object),
      ),
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış' }))
    await waitFor(() =>
      expect(source.listConversations).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'unread' }),
        expect.any(Object),
      ),
    )
  })

  it('isolates rail and thread failures and distinguishes empty inbox from no results', async () => {
    const listFailure = createDataSource({
      listConversations: vi.fn(async () => {
        throw new Error('Konuşmalar alınamadı.')
      }),
    })
    const failedRail = renderWorkspace({
      dataSource: listFailure,
      conversationId: 'conversation-a',
    })
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Konuşmalar alınamadı.',
    )
    expect(listFailure.listMessages).not.toHaveBeenCalled()
    expect(screen.queryByText('Ayşe Kaya')).toBeNull()
    failedRail.unmount()

    const threadFailure = createDataSource({
      listMessages: vi.fn(async () => {
        throw new Error('Mesaj geçmişi alınamadı.')
      }),
    })
    const failedThread = renderWorkspace({
      dataSource: threadFailure,
      defaultConversationId: 'conversation-a',
    })
    expect(await screen.findByText('Mert Arslan')).toBeTruthy()
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Mesaj geçmişi alınamadı.',
    )
    failedThread.unmount()

    const emptySource = createDataSource({
      listConversations: vi.fn(async () => ({ items: [] })),
    })
    const empty = renderWorkspace({ dataSource: emptySource })
    expect(await screen.findByText('Henüz konuşmanız yok')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'İlanları keşfet' })).toBeTruthy()
    empty.unmount()

    renderWorkspace({ dataSource: emptySource })
    const search = await screen.findByRole('searchbox', {
      name: 'Konuşmalarda ara',
    })
    fireEvent.change(search, { target: { value: 'bulunmayan' } })
    expect(
      await screen.findByText('Aramanızla eşleşen konuşma bulunamadı'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Aramayı temizle' })).toBeTruthy()
  })

  it.each([
    ['session-expired', 'Oturum süresi doldu'],
    ['restricted', 'Mesajlara erişim kısıtlandı'],
    ['loading', 'Mesajlar hazırlanıyor'],
  ] as const)(
    'gives %s access state priority and never renders private content',
    async (mode, heading) => {
      const source = createDataSource()
      renderWorkspace({
        dataSource: source,
        defaultConversationId: 'conversation-a',
        mode,
      })

      expect(await screen.findByRole('heading', { name: heading })).toBeTruthy()
      expect(screen.queryByText('Ayşe Kaya')).toBeNull()
      expect(screen.queryByText('Urla’da Taş Ev')).toBeNull()
      expect(screen.queryByText('Evi yarın görebilir miyiz?')).toBeNull()
      expect(source.listConversations).not.toHaveBeenCalled()
      expect(source.listMessages).not.toHaveBeenCalled()
    },
  )

  it.each(['session-expired', 'restricted'] as const)(
    'cleans private state once and in cancel → remove → drafts order for %s',
    async (mode) => {
      window.sessionStorage.setItem(
        'message-draft:v1:messages-workspace:conversation-a',
        JSON.stringify({ text: 'Özel taslak' }),
      )
      const queryClient = freshQueryClient()
      const order: string[] = []
      vi.spyOn(queryClient, 'cancelQueries').mockImplementation(async () => {
        order.push('cancel')
      })
      vi.spyOn(queryClient, 'removeQueries').mockImplementation(() => {
        order.push('remove')
      })
      const source = createDataSource()
      const workspace = renderWorkspace(
        { dataSource: source, mode },
        queryClient,
      )
      await waitFor(() =>
        expect(
          window.sessionStorage.getItem(
            'message-draft:v1:messages-workspace:conversation-a',
          ),
        ).toBeNull(),
      )
      order.push('drafts')
      workspace.rerenderWorkspace({ dataSource: source, mode })

      expect(order.slice(0, 3)).toEqual(['cancel', 'remove', 'drafts'])
      expect(queryClient.cancelQueries).toHaveBeenCalledTimes(1)
      expect(queryClient.removeQueries).toHaveBeenCalledTimes(1)
    },
  )

  it('clears only the closing workspace draft namespace when two workspaces coexist', async () => {
    const firstNamespace = 'messages-test-first'
    const secondNamespace = 'messages-test-second'
    const firstDraftKey =
      `message-draft:v1:${firstNamespace}:conversation-a`
    const secondDraftKey =
      `message-draft:v1:${secondNamespace}:conversation-a`
    window.sessionStorage.setItem(
      firstDraftKey,
      JSON.stringify({ text: 'Birinci çalışma alanı taslağı' }),
    )
    window.sessionStorage.setItem(
      secondDraftKey,
      JSON.stringify({ text: 'İkinci çalışma alanı taslağı' }),
    )
    const firstQueryClient = freshQueryClient()
    const secondQueryClient = freshQueryClient()
    const firstSource = createDataSource()
    const secondSource = createDataSource()

    function ConcurrentWorkspaces() {
      const [firstMode, setFirstMode] =
        useState<MessagesWorkspaceProps['mode']>('ready')

      return (
        <>
          <button
            type="button"
            onClick={() => setFirstMode('restricted')}
          >
            Birinci erişimi kapat
          </button>
          <QueryClientProvider client={firstQueryClient}>
            <MessagesWorkspace
              dataSource={firstSource}
              defaultConversationId="conversation-a"
              draftNamespace={firstNamespace}
              mode={firstMode}
            />
          </QueryClientProvider>
          <QueryClientProvider client={secondQueryClient}>
            <MessagesWorkspace
              dataSource={secondSource}
              defaultConversationId="conversation-a"
              draftNamespace={secondNamespace}
            />
          </QueryClientProvider>
        </>
      )
    }

    render(<ConcurrentWorkspaces />)
    expect(document.body.textContent).not.toContain(firstNamespace)
    expect(document.body.textContent).not.toContain(secondNamespace)
    for (const link of await screen.findAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain(firstNamespace)
      expect(link.getAttribute('href')).not.toContain(secondNamespace)
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Birinci erişimi kapat' }),
    )

    await waitFor(() =>
      expect(window.sessionStorage.getItem(firstDraftKey)).toBeNull(),
    )
    expect(window.sessionStorage.getItem(secondDraftKey)).toContain(
      'İkinci çalışma alanı taslağı',
    )
  })

  it('does not let a stale access cleanup clear a reopened generation', async () => {
    const cancellation = deferred<void>()
    const queryClient = freshQueryClient()
    vi.spyOn(queryClient, 'cancelQueries').mockReturnValue(cancellation.promise)
    const source = createDataSource()
    const workspace = renderWorkspace(
      {
        dataSource: source,
        defaultConversationId: 'conversation-a',
      },
      queryClient,
    )

    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'restricted',
    })
    await screen.findByRole('heading', {
      name: 'Mesajlara erişim kısıtlandı',
    })

    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'ready',
    })
    const reopenedDraft = await screen.findByRole('textbox', { name: 'Mesaj' })
    fireEvent.change(reopenedDraft, {
      target: { value: 'Yeni erişim kuşağı taslağı' },
    })
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })

    await act(async () => cancellation.resolve())

    expect(
      queryClient.getQueryData(messagesQueryKeys.thread('conversation-a')),
    ).toBeTruthy()
    expect(
      window.sessionStorage.getItem(
        'message-draft:v1:messages-workspace:conversation-a',
      ),
    ).toContain('Yeni erişim kuşağı taslağı')
    expect(
      (screen.getByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement)
        .value,
    ).toBe('Yeni erişim kuşağı taslağı')
  })

  it('ignores abort-insensitive send acknowledgements from an older access generation', async () => {
    const send = deferred<MarketplaceMessage>()
    const queryClient = freshQueryClient()
    const source = createDataSource({
      sendMessage: vi.fn((input) =>
        send.promise.then(() =>
          canonicalMessage({
            ...input,
            body: 'Eski erişim kuşağı onayı',
          }),
        ),
      ),
    })
    const workspace = renderWorkspace(
      {
        dataSource: source,
        defaultConversationId: 'conversation-a',
      },
      queryClient,
    )

    fireEvent.change(await screen.findByRole('textbox', { name: 'Mesaj' }), {
      target: { value: 'Eski gönderim' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    await screen.findByText('Gönderiliyor')

    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'restricted',
    })
    await screen.findByRole('heading', {
      name: 'Mesajlara erişim kısıtlandı',
    })
    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'ready',
    })
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })

    await act(async () => send.resolve(messages[0]!))

    const reopened =
      queryClient.getQueryData<InfiniteData<MessagePage>>(
        messagesQueryKeys.thread('conversation-a'),
      )
    expect(
      reopened?.pages
        .flatMap((page) => page.items)
        .some((message) => message.body === 'Eski erişim kuşağı onayı'),
    ).toBe(false)
  })

  it('has no online banner and exposes one calm connection notice for reconnecting or offline', async () => {
    const online = renderWorkspace({
      dataSource: createDataSource(),
      connectionState: 'online',
    })
    await screen.findByRole('heading', { name: 'Mesajlar' })
    expect(screen.queryByText(/Bağlantı yeniden kuruluyor|Çevrimdışısınız/)).toBeNull()
    online.unmount()

    const reconnecting = renderWorkspace({
      dataSource: createDataSource(),
      connectionState: 'reconnecting',
    })
    expect(await screen.findByText('Bağlantı yeniden kuruluyor')).toBeTruthy()
    reconnecting.unmount()

    renderWorkspace({
      dataSource: createDataSource(),
      connectionState: 'offline',
    })
    expect(await screen.findByText('Çevrimdışısınız')).toBeTruthy()
  })

  it('keeps pending deterministic, reconciles ack in place and updates/re-sorts the conversation preview', async () => {
    const send = deferred<MarketplaceMessage>()
    const source = createDataSource({
      sendMessage: vi.fn((input) =>
        send.promise.then(() => canonicalMessage(input)),
      ),
    })
    renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-b',
    })
    const textarea = await screen.findByRole('textbox', { name: 'Mesaj' })
    fireEvent.change(textarea, { target: { value: 'Yeni teklifim hazır.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    expect(await screen.findByText('Gönderiliyor')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Mert Arslan/ }).textContent).toContain(
      'Gönderiliyor: Yeni teklifim hazır.',
    )
    expect((textarea as HTMLTextAreaElement).value).toBe('')
    const railItems = screen.getByRole('navigation', { name: 'Konuşmalar' })
      .querySelectorAll('li[data-conversation-id]')
    expect(railItems[0]?.getAttribute('data-conversation-id')).toBe(
      'conversation-b',
    )

    await act(async () => send.resolve(messages[0]!))
    const log = screen.getByRole('log', { name: 'Mert Arslan ile mesajlar' })
    await waitFor(() =>
      expect(within(log).getAllByText('Yeni teklifim hazır.')).toHaveLength(1),
    )
    expect(within(log).getByText('Gönderildi')).toBeTruthy()
  })

  it('keeps a failed item in place and retries with the original clientMessageId', async () => {
    const sendMessage = vi
      .fn<MessagesDataSource['sendMessage']>()
      .mockRejectedValueOnce(new Error('Gönderim başarısız.'))
      .mockImplementationOnce(async (input) => canonicalMessage(input))
    renderWorkspace({
      dataSource: createDataSource({ sendMessage }),
      defaultConversationId: 'conversation-a',
    })
    fireEvent.change(await screen.findByRole('textbox', { name: 'Mesaj' }), {
      target: { value: 'Aynı mesaj' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    expect(await screen.findByText('Gönderilemedi')).toBeTruthy()
    const firstId = sendMessage.mock.calls[0]?.[0].clientMessageId
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(2))
    expect(sendMessage.mock.calls[1]?.[0].clientMessageId).toBe(firstId)
    expect(
      within(screen.getByRole('log', { name: 'Ayşe Kaya ile mesajlar' }))
        .getAllByText('Aynı mesaj'),
    ).toHaveLength(1)
  })

  it('reconciles an acknowledgement across pages without a duplicate', async () => {
    const queryClient = freshQueryClient()
    const source = createDataSource()
    const key = messagesQueryKeys.thread('conversation-a')
    const pending: MarketplaceMessage = {
      conversationId: 'conversation-a',
      clientMessageId: 'client-page-aware',
      sequence: null,
      senderId: 'current-user',
      kind: 'text',
      body: 'Sayfalar arası',
      attachments: [],
      deliveryState: 'pending',
      sentAt: '2026-07-27T11:00:00.000Z',
    }
    queryClient.setQueryData<InfiniteData<MessagePage, string | undefined>>(key, {
      pages: [{ items: [messages[0]!] }, { items: [pending] }],
      pageParams: ['older', undefined],
    })
    let emit!: (event: MessagesRealtimeEvent) => void
    const sourceWithRealtime = {
      ...source,
      realtime: {
        subscribe(listener: (event: MessagesRealtimeEvent) => void) {
          emit = listener
          return () => undefined
        },
      },
    }
    renderWorkspace(
      {
        dataSource: sourceWithRealtime,
        defaultConversationId: 'conversation-a',
      },
      queryClient,
    )
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    act(() =>
      emit({
        type: 'message.created',
        message: {
          ...canonicalMessage({
            conversationId: 'conversation-a',
            clientMessageId: 'client-page-aware',
            body: 'Sayfalar arası',
            attachments: [],
          }),
        },
      }),
    )

    await waitFor(() => {
      const data =
        queryClient.getQueryData<InfiniteData<MessagePage>>(key)
      expect(
        data?.pages
          .flatMap((page) => page.items)
          .filter(
            (message) => message.clientMessageId === 'client-page-aware',
          ),
      ).toHaveLength(1)
    })
  })

  it('gates attachment, report, block and receipt UI by adapter capabilities', async () => {
    const source = createDataSource({
      listMessages: vi.fn<MessagesDataSource['listMessages']>(async () => ({
        items: [
          {
            id: 'outgoing-read',
            conversationId: 'conversation-a',
            sequence: 2,
            senderId: 'current-user',
            kind: 'text',
            body: 'Gönderilmiş mesaj',
            attachments: [],
            deliveryState: 'read',
            sentAt: '2026-07-20T10:00:00.000Z',
          } as MarketplaceMessage,
        ],
      })),
    })
    renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    await screen.findByText('Gönderilmiş mesaj')
    expect(screen.queryByRole('button', { name: 'Dosya ekle' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mesajı bildir' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Kişiyi engelle' })).toBeNull()
    expect(screen.queryByText('Okundu')).toBeNull()
    expect(screen.queryByText('İletildi')).toBeNull()
  })

  it('marks read only after the active unread boundary is visible', async () => {
    let observerCallback:
      | ((entries: Array<{ isIntersecting: boolean; target: Element }>) => void)
      | undefined
    class IntersectionObserverStub {
      constructor(
        callback: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void,
      ) {
        observerCallback = callback
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return []
      }
      root = null
      rootMargin = '0rem'
      thresholds = [0]
    }
    vi.stubGlobal(
      'IntersectionObserver',
      IntersectionObserverStub as unknown as typeof IntersectionObserver,
    )
    const source = createDataSource()
    renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    const boundary = await screen.findByText('Evi yarın görebilir miyiz?')
    expect(source.markConversationRead).not.toHaveBeenCalled()
    await waitFor(() => expect(observerCallback).toBeTypeOf('function'))
    act(() => observerCallback?.([{ isIntersecting: true, target: boundary }]))
    await waitFor(() =>
      expect(source.markConversationRead).toHaveBeenCalledWith(
        { conversationId: 'conversation-a', throughSequence: 1 },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    )
  })

  it('subscribes only when realtime exists, preserves historical scroll and unsubscribes once', async () => {
    let emit!: (event: MessagesRealtimeEvent) => void
    const unsubscribe = vi.fn()
    const subscribe = vi.fn((listener: (event: MessagesRealtimeEvent) => void) => {
      emit = listener
      return unsubscribe
    })
    const source = createDataSource({ realtime: { subscribe } })
    const workspace = renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    const log = await screen.findByRole('log', {
      name: 'Ayşe Kaya ile mesajlar',
    })
    Object.defineProperties(log, {
      scrollHeight: { configurable: true, value: 1_000 },
      clientHeight: { configurable: true, value: 200 },
      scrollTop: { configurable: true, writable: true, value: 120 },
    })
    fireEvent.scroll(log)

    act(() =>
      emit({
        type: 'message.created',
        message: {
          id: 'message-a-2',
          conversationId: 'conversation-a',
          sequence: 2,
          senderId: 'person-a',
          kind: 'text',
          body: 'Yeni gelen mesaj',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T13:00:00.000Z',
        },
      }),
    )
    expect(await screen.findByRole('button', { name: '1 yeni mesajı göster' })).toBeTruthy()
    expect(log.scrollTop).toBe(120)
    expect(subscribe).toHaveBeenCalledTimes(1)
    workspace.unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)

    const sourceWithoutRealtime = createDataSource()
    renderWorkspace({ dataSource: sourceWithoutRealtime })
    await screen.findByRole('heading', { name: 'Mesajlar' })
    expect(sourceWithoutRealtime.realtime).toBeUndefined()
  })

  it('ignores queued callbacks from an old realtime generation', async () => {
    const listeners: Array<(event: MessagesRealtimeEvent) => void> = []
    const source = createDataSource({
      realtime: {
        subscribe(listener) {
          listeners.push(listener)
          return () => undefined
        },
      },
    })
    const queryClient = freshQueryClient()
    const workspace = renderWorkspace(
      {
        dataSource: source,
        defaultConversationId: 'conversation-a',
      },
      queryClient,
    )
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    expect(listeners).toHaveLength(1)

    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'restricted',
    })
    await screen.findByRole('heading', {
      name: 'Mesajlara erişim kısıtlandı',
    })
    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'ready',
    })
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    expect(listeners).toHaveLength(2)

    act(() =>
      listeners[0]?.({
        type: 'message.created',
        message: {
          id: 'stale-realtime-message',
          conversationId: 'conversation-a',
          sequence: 9,
          senderId: 'person-a',
          kind: 'text',
          body: 'Eski bağlantı olayı',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T14:00:00.000Z',
        },
      }),
    )

    const reopened =
      queryClient.getQueryData<InfiniteData<MessagePage>>(
        messagesQueryKeys.thread('conversation-a'),
      )
    expect(
      reopened?.pages
        .flatMap((page) => page.items)
        .some((message) => message.id === 'stale-realtime-message'),
    ).toBe(false)
  })

  it('resubscribes when the data source changes even if the realtime object is shared', async () => {
    const listeners: Array<(event: MessagesRealtimeEvent) => void> = []
    const unsubscriptions: Array<ReturnType<typeof vi.fn>> = []
    const realtime = {
      subscribe(listener: (event: MessagesRealtimeEvent) => void) {
        listeners.push(listener)
        const unsubscribe = vi.fn()
        unsubscriptions.push(unsubscribe)
        return unsubscribe
      },
    }
    const firstSource = createDataSource({ realtime })
    const secondSource = createDataSource({ realtime })
    const workspace = renderWorkspace({
      dataSource: firstSource,
      defaultConversationId: 'conversation-a',
    })
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    expect(listeners).toHaveLength(1)

    workspace.rerenderWorkspace({
      dataSource: secondSource,
      defaultConversationId: 'conversation-a',
    })
    await waitFor(() => expect(listeners).toHaveLength(2))
    expect(unsubscriptions[0]).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(
        workspace.queryClient.isFetching({
          queryKey: messagesQueryKeys.thread('conversation-a'),
        }),
      ).toBe(0),
    )

    act(() => {
      listeners[0]?.({
        type: 'message.created',
        message: {
          id: 'old-source-event',
          conversationId: 'conversation-a',
          sequence: 8,
          senderId: 'person-a',
          kind: 'text',
          body: 'Eski kaynak olayı',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T15:00:00.000Z',
        },
      })
      listeners[1]?.({
        type: 'message.created',
        message: {
          id: 'new-source-event',
          conversationId: 'conversation-a',
          sequence: 9,
          senderId: 'person-a',
          kind: 'text',
          body: 'Yeni kaynak olayı',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T15:01:00.000Z',
        },
      })
    })

    expect(screen.queryByText('Eski kaynak olayı')).toBeNull()
    expect(
      await within(
        screen.getByRole('log', { name: 'Ayşe Kaya ile mesajlar' }),
      ).findByText('Yeni kaynak olayı'),
    ).toBeTruthy()
  })

  it('never seeds or mutates an unfetched or inactive thread from realtime', async () => {
    let emit!: (event: MessagesRealtimeEvent) => void
    const source = createDataSource({
      realtime: {
        subscribe(listener) {
          emit = listener
          return () => undefined
        },
      },
    })
    const queryClient = freshQueryClient()
    renderWorkspace(
      {
        dataSource: source,
        defaultConversationId: 'conversation-a',
      },
      queryClient,
    )
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })

    act(() =>
      emit({
        type: 'message.created',
        message: {
          id: 'unfetched-b',
          conversationId: 'conversation-b',
          sequence: 2,
          senderId: 'person-b',
          kind: 'text',
          body: 'Henüz açılmamış konuşma',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T14:00:00.000Z',
        },
      }),
    )
    expect(
      queryClient.getQueryData(messagesQueryKeys.thread('conversation-b')),
    ).toBeUndefined()

    fireEvent.click(screen.getByRole('link', { name: /Mert Arslan/ }))
    await screen.findByRole('log', { name: 'Mert Arslan ile mesajlar' })
    fireEvent.click(screen.getByRole('link', { name: /Ayşe Kaya/ }))
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    const inactiveBefore =
      queryClient.getQueryData<InfiniteData<MessagePage>>(
        messagesQueryKeys.thread('conversation-b'),
      )

    act(() =>
      emit({
        type: 'message.created',
        message: {
          id: 'inactive-b',
          conversationId: 'conversation-b',
          sequence: 3,
          senderId: 'person-b',
          kind: 'text',
          body: 'Arka plandaki konuşma',
          attachments: [],
          deliveryState: 'sent',
          sentAt: '2026-07-27T15:00:00.000Z',
        },
      }),
    )
    expect(
      queryClient.getQueryData(messagesQueryKeys.thread('conversation-b')),
    ).toBe(inactiveBefore)
  })

  it('aborts pending sends/uploads and revokes staged object URLs when access closes', async () => {
    const send = deferred<MarketplaceMessage>()
    const upload = deferred<MarketplaceMessage['attachments'][number]>()
    let sendSignal: AbortSignal | undefined
    let uploadSignal: AbortSignal | undefined
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:local-preview')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const source = createDataSource({
      sendMessage: vi.fn((input, options) => {
        sendSignal = options?.signal
        return send.promise.then(() => canonicalMessage(input))
      }),
      capabilities: {
        uploadAttachment: vi.fn((_input, options) => {
          uploadSignal = options?.signal
          return upload.promise
        }),
      },
    })
    const workspace = renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    const fileInput = await screen.findByLabelText('Mesaja dosya ekle')
    const file = new File(['image'], 'ev.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesaj' }), {
      target: { value: 'Ekli mesaj' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    await waitFor(() => expect(uploadSignal).toBeTruthy())

    workspace.rerenderWorkspace({ dataSource: source, mode: 'restricted' })
    await waitFor(() => expect(uploadSignal?.aborted).toBe(true))
    expect(sendSignal?.aborted ?? true).toBe(true)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:local-preview')
  })

  it('keeps the composer recoverable and revokes partial uploaded blobs when one upload fails', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (file) => `blob:preview-${(file as File).name}`,
    )
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {})
    const uploadAttachment = vi.fn<
      NonNullable<
        NonNullable<MessagesDataSource['capabilities']>['uploadAttachment']
      >
    >(async ({ file }) => {
      if (file.name === 'birinci.png') {
        return {
          id: 'uploaded-one',
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          state: 'ready',
          url: 'blob:uploaded-one',
        }
      }
      throw new Error('İkinci dosya yüklenemedi.')
    })
    const source = createDataSource({
      capabilities: { uploadAttachment },
    })
    renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    const files = [
      new File(['one'], 'birinci.png', { type: 'image/png' }),
      new File(['two'], 'ikinci.png', { type: 'image/png' }),
    ]
    const input = await screen.findByLabelText('Mesaja dosya ekle')
    fireEvent.change(input, { target: { files } })
    const textarea = screen.getByRole('textbox', {
      name: 'Mesaj',
    }) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Dosyalarım korunsun' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    await waitFor(() => expect(uploadAttachment).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(
        (screen.getByRole('button', {
          name: 'Mesajı gönder',
        }) as HTMLButtonElement).disabled,
      ).toBe(false),
    )
    expect(textarea.value).toBe('Dosyalarım korunsun')
    expect(screen.getByText('birinci.png')).toBeTruthy()
    expect(screen.getByText('ikinci.png')).toBeTruthy()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:uploaded-one')
    expect(revokeObjectURL).not.toHaveBeenCalledWith(
      'blob:preview-birinci.png',
    )
  })

  it('drops and revokes an abort-insensitive late upload from an older generation', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:late-preview')
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {})
    const upload = deferred<MarketplaceMessage['attachments'][number]>()
    const sendMessage = vi.fn<MessagesDataSource['sendMessage']>(
      async (input) => canonicalMessage(input),
    )
    const source = createDataSource({
      sendMessage,
      capabilities: {
        uploadAttachment: vi.fn(() => upload.promise),
      },
    })
    const workspace = renderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
    })
    const file = new File(['late'], 'geciken.png', { type: 'image/png' })
    fireEvent.change(await screen.findByLabelText('Mesaja dosya ekle'), {
      target: { files: [file] },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesaj' }), {
      target: { value: 'Eski upload gönderimi' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'restricted',
    })
    await screen.findByRole('heading', {
      name: 'Mesajlara erişim kısıtlandı',
    })
    workspace.rerenderWorkspace({
      dataSource: source,
      defaultConversationId: 'conversation-a',
      mode: 'ready',
    })
    await screen.findByRole('log', { name: 'Ayşe Kaya ile mesajlar' })

    await act(async () =>
      upload.resolve({
        id: 'late-upload',
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        state: 'ready',
        url: 'blob:late-upload',
      }),
    )

    expect(sendMessage).not.toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:late-upload')
  })

  it('preserves a separate composer draft for every conversation', async () => {
    renderWorkspace({
      dataSource: createDataSource(),
      defaultConversationId: 'conversation-a',
    })
    const textarea = await screen.findByRole('textbox', { name: 'Mesaj' })
    fireEvent.change(textarea, { target: { value: 'Ayşe taslağı' } })
    fireEvent.click(screen.getByRole('link', { name: /Mert Arslan/ }))
    expect((await screen.findByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement).value).toBe('')
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesaj' }), {
      target: { value: 'Mert taslağı' },
    })
    fireEvent.click(screen.getByRole('link', { name: /Ayşe Kaya/ }))
    expect((await screen.findByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement).value).toBe('Ayşe taslağı')
  })

  it('keeps workspace CSS token-only and reserves Dock safe area in normal and compact frames', () => {
    const workspaceCss = readFileSync(
      resolve(
        process.cwd(),
        'apps/web/src/features/messages/MessagesWorkspace.module.css',
      ),
      'utf8',
    )
    const panelsCss = readFileSync(
      resolve(
        process.cwd(),
        'apps/web/src/features/messages/MessagesPanels.module.css',
      ),
      'utf8',
    )
    const css = `${workspaceCss}\n${panelsCss}`
    const coarse = panelsCss.slice(
      panelsCss.indexOf('@media (pointer: coarse)'),
      panelsCss.indexOf('@media (prefers-reduced-motion: reduce)'),
    )
    const hover = panelsCss.slice(
      panelsCss.indexOf('@media (hover: hover)'),
      panelsCss.indexOf('@media (pointer: coarse)'),
    )

    expect(css).not.toMatch(/\b\d+px\b|#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i)
    expect(css).not.toMatch(/\bgradient\s*\(|!important|box-shadow\s*:/i)
    // Dock payı ve sayfa genişliği artık PageContainer'ın sözleşmesidir;
    // çalışma alanı bunları tekrarlamaz.
    expect(workspaceCss).not.toMatch(/--lg-shell-dock-offset/)
    expect(workspaceCss).not.toMatch(/inline-size:\s*min\(100%/)
    expect(workspaceCss).not.toMatch(/container-type/)
    expect(
      readFileSync(
        resolve(
          process.cwd(),
          'apps/web/src/components/PageContainer.module.css',
        ),
        'utf8',
      ),
    ).toMatch(
      /padding-block-end:\s*calc\([^;]*--lg-shell-dock-offset[^;]*env\(safe-area-inset-bottom[^;]*\)/,
    )
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)')
    expect(coarse).toMatch(
      /:global\(\.messageTimeline__latestControl\)[^{]*\{\s*min-block-size:\s*var\(--lg-control-md\)/,
    )
    expect(coarse).toContain(
      ':global(.messageTimeline__olderControl) button',
    )
    expect(panelsCss).toContain(
      ':global(.messageTimeline__olderControl) button:focus-visible',
    )
    expect(panelsCss).toContain(
      ':global(.messageTimeline__latestControl):focus-visible',
    )
    expect(hover).toContain(
      ':global(.messageTimeline__olderControl) button:hover',
    )
    expect(hover).toContain(
      ':global(.messageTimeline__latestControl):hover',
    )
  })
})
