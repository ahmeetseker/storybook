import { describe, expect, it } from 'vitest'
import { skipToken, type QueryFunction } from '@tanstack/react-query'

import type { MessagesDataSource } from '../domain/message-types'
import {
  conversationInfiniteQueryOptions,
  flattenConversationPages,
  flattenMessagePages,
  messagesQueryKeys,
  threadInfiniteQueryOptions,
} from './messages-query'

function requireQueryFunction<Data, Key extends readonly unknown[], PageParam>(
  queryFn: QueryFunction<Data, Key, PageParam> | typeof skipToken | undefined,
) {
  if (typeof queryFn !== 'function') {
    throw new Error('Infinite query bir queryFn sağlamalı.')
  }
  return queryFn
}

function createDataSource(): MessagesDataSource {
  return {
    async listConversations() {
      return { items: [], nextCursor: 'cursor_next' }
    },
    async listMessages() {
      return { items: [], nextCursor: 'cursor_previous' }
    },
    async sendMessage(input) {
      return {
        id: `message_${input.clientMessageId}`,
        conversationId: input.conversationId,
        sequence: 1,
        senderId: 'current-user',
        kind: 'text',
        body: input.body,
        attachments: input.attachments,
        deliveryState: 'sent',
        sentAt: '2026-07-20T12:00:00.000Z',
      }
    },
    async archiveConversation() {
      throw new Error('Bu testte kullanılmamalı.')
    },
    async markConversationRead() {
      throw new Error('Bu testte kullanılmamalı.')
    },
  }
}

describe('messagesQueryKeys', () => {
  it('uses the same key for equivalent normalized filter and Turkish query', () => {
    expect(messagesQueryKeys.conversations({ filter: 'all', query: ' İZMİR ' })).toEqual(
      messagesQueryKeys.conversations({ filter: 'all', query: 'izmir' }),
    )
  })

  it('treats punctuation and spaces as equivalent for listing-reference query keys', () => {
    expect(messagesQueryKeys.conversations({ filter: 'all', query: 'İLAN-URLA-1001' })).toEqual(
      messagesQueryKeys.conversations({ filter: 'all', query: 'ilan urla 1001' }),
    )
  })

  it('separates filter and query dimensions', () => {
    expect(messagesQueryKeys.conversations({ filter: 'all', query: 'urla' })).not.toEqual(
      messagesQueryKeys.conversations({ filter: 'unread', query: 'urla' }),
    )
    expect(messagesQueryKeys.conversations({ filter: 'all', query: 'urla' })).not.toEqual(
      messagesQueryKeys.conversations({ filter: 'all', query: 'çeşme' }),
    )
  })
})

describe('message infinite query options', () => {
  it('uses the conversation nextCursor and forwards AbortSignal to the adapter', async () => {
    let receivedSignal: AbortSignal | undefined
    const source = createDataSource()
    source.listConversations = async (_input, options) => {
      receivedSignal = options?.signal
      return { items: [], nextCursor: 'cursor_next' }
    }
    const options = conversationInfiniteQueryOptions(source, {
      filter: 'all',
      query: 'urla',
    })
    const controller = new AbortController()
    const queryFn = requireQueryFunction(options.queryFn)

    const page = await queryFn({
      client: {} as never,
      queryKey: options.queryKey,
      signal: controller.signal,
      pageParam: undefined,
      direction: 'forward',
      meta: undefined,
    })
    const getNextPageParam = options.getNextPageParam
    if (!getNextPageParam) throw new Error('İleri cursor çözümleyicisi eksik.')

    expect(receivedSignal).toBe(controller.signal)
    expect(getNextPageParam(page, [page], undefined, [undefined])).toBe('cursor_next')
  })

  it('uses the thread before cursor as a previous page parameter', async () => {
    const options = threadInfiniteQueryOptions(createDataSource(), 'conversation-urla-ayse')
    const queryFn = requireQueryFunction(options.queryFn)
    const page = await queryFn({
      client: {} as never,
      queryKey: options.queryKey,
      signal: new AbortController().signal,
      pageParam: undefined,
      direction: 'forward',
      meta: undefined,
    })
    const getPreviousPageParam = options.getPreviousPageParam
    if (!getPreviousPageParam) throw new Error('Geri cursor çözümleyicisi eksik.')
    const getNextPageParam = options.getNextPageParam
    if (!getNextPageParam) throw new Error('İleri cursor çözümleyicisi eksik.')

    expect(getPreviousPageParam(page, [page], undefined, [undefined])).toBe('cursor_previous')
    expect(getNextPageParam(page, [page], undefined, [undefined])).toBeUndefined()
  })

  it('keeps all infinite query caches bounded', () => {
    expect(conversationInfiniteQueryOptions(createDataSource(), { filter: 'all', query: '' }).maxPages).toBeGreaterThan(0)
    expect(conversationInfiniteQueryOptions(createDataSource(), { filter: 'all', query: '' }).maxPages).toBeLessThanOrEqual(10)
    expect(threadInfiniteQueryOptions(createDataSource(), 'conversation-urla-ayse').maxPages).toBeGreaterThan(0)
    expect(threadInfiniteQueryOptions(createDataSource(), 'conversation-urla-ayse').maxPages).toBeLessThanOrEqual(10)
  })
})

describe('page flattening', () => {
  it('joins conversation pages in page order', () => {
    expect(flattenConversationPages({
      pages: [
        { items: [{ id: 'conversation-new' }], nextCursor: 'cursor_older' },
        { items: [{ id: 'conversation-old' }] },
      ],
      pageParams: [undefined, 'cursor_older'],
    } as never).map(({ id }) => id)).toEqual(['conversation-new', 'conversation-old'])
  })

  it('returns message pages in chronological sequence even when older history is prepended', () => {
    expect(flattenMessagePages({
      pages: [
        { items: [{ id: 'message-recent', conversationId: 'conversation-1', sequence: 3, senderId: 'current-user', kind: 'text', body: 'Yeni', attachments: [], deliveryState: 'sent', sentAt: '2026-07-20T12:00:00.000Z' }] },
        { items: [{ id: 'message-old', conversationId: 'conversation-1', sequence: 1, senderId: 'person-1', kind: 'text', body: 'Eski', attachments: [], deliveryState: 'read', sentAt: '2026-07-20T10:00:00.000Z' }] },
      ],
      pageParams: [undefined, 'cursor_old'],
    } as never).map(({ id }) => id)).toEqual(['message-old', 'message-recent'])
  })
})
