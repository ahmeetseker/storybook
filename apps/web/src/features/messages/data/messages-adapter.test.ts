import { describe, expect, it } from 'vitest'

import { createMessagesFixtureDataSource } from './messages-adapter'

describe('createMessagesFixtureDataSource', () => {
  it('keeps the same counterpart on two listings as two conversations', async () => {
    const source = createMessagesFixtureDataSource()
    const page = await source.listConversations({
      filter: 'all',
      query: '',
      limit: 20,
    })

    const ayseRows = page.items.filter(
      ({ counterpart }) => counterpart.id === 'person-ayse',
    )
    expect(new Set(ayseRows.map(({ listing }) => listing.id)).size).toBe(2)
  })

  it('returns opaque cursor pages without exposing offsets', async () => {
    const source = createMessagesFixtureDataSource()
    const first = await source.listConversations({
      filter: 'all',
      query: '',
      limit: 2,
    })
    const second = await source.listConversations({
      filter: 'all',
      query: '',
      cursor: first.nextCursor,
      limit: 2,
    })

    expect(first.items).toHaveLength(2)
    expect(second.items.map(({ id }) => id)).not.toEqual(
      first.items.map(({ id }) => id),
    )
    expect(first.nextCursor).toMatch(/^cursor_/)
    expect(first.nextCursor).not.toContain('2')
  })

  it('filters unread and archived conversations without mixing statuses', async () => {
    const source = createMessagesFixtureDataSource()
    const [unread, archived] = await Promise.all([
      source.listConversations({ filter: 'unread', query: '', limit: 20 }),
      source.listConversations({ filter: 'archived', query: '', limit: 20 }),
    ])

    expect(unread.items.length).toBeGreaterThan(0)
    expect(unread.items.every(({ unreadCount }) => unreadCount > 0)).toBe(true)
    expect(archived.items.length).toBeGreaterThan(0)
    expect(archived.items.every(({ status }) => status === 'archived')).toBe(true)
  })

  it('finds people, listings, districts, and reference labels regardless of Turkish case or diacritics', async () => {
    const source = createMessagesFixtureDataSource()
    const find = async (query: string) =>
      source.listConversations({ filter: 'all', query, limit: 20 })

    await expect(find('AYSE')).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ counterpart: expect.objectContaining({ id: 'person-ayse' }) }),
      ]),
    })
    await expect(find('Kordon')).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ listing: expect.objectContaining({ id: 'listing-kordon-1' }) }),
      ]),
    })
    await expect(find('urla')).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ listing: expect.objectContaining({ id: 'listing-urla-1' }) }),
      ]),
    })
    await expect(find('İLAN-URLA-1001')).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ listing: expect.objectContaining({ id: 'listing-urla-1' }) }),
      ]),
    })
  })

  it('orders conversations by recent user activity, then stable ascending id', async () => {
    const source = createMessagesFixtureDataSource()
    const page = await source.listConversations({ filter: 'all', query: '', limit: 20 })

    for (let index = 1; index < page.items.length; index += 1) {
      const previous = page.items[index - 1]
      const current = page.items[index]
      expect(previous.lastUserActivityAt >= current.lastUserActivityAt).toBe(true)
      if (previous.lastUserActivityAt === current.lastUserActivityAt) {
        expect(previous.id < current.id).toBe(true)
      }
    }
  })

  it('returns only the requested conversation messages and exposes older history through before', async () => {
    const source = createMessagesFixtureDataSource()
    const first = await source.listMessages({
      conversationId: 'conversation-urla-ayse',
      limit: 2,
    })
    const older = await source.listMessages({
      conversationId: 'conversation-urla-ayse',
      before: first.nextCursor,
      limit: 2,
    })

    expect(first.items).toHaveLength(2)
    const newest = first.items[0]
    if (!newest) throw new Error('İlk mesaj sayfası boş olmamalı.')
    expect(first.items.every(({ conversationId }) => conversationId === 'conversation-urla-ayse')).toBe(true)
    expect(older.items).toHaveLength(2)
    const newestOlderMessage = older.items.at(-1)
    if (!newestOlderMessage) throw new Error('Eski mesaj sayfası boş olmamalı.')
    expect(older.items.every(({ conversationId }) => conversationId === 'conversation-urla-ayse')).toBe(true)
    expect(newestOlderMessage.sentAt < newest.sentAt).toBe(true)
  })

  it('exposes a deterministic real-route thread beyond the 30-message page boundary', async () => {
    const source = createMessagesFixtureDataSource()
    const newest = await source.listMessages({
      conversationId: 'conversation-seferihisar-cem',
      limit: 30,
    })

    expect(newest.items).toHaveLength(30)
    expect(newest.nextCursor).toMatch(/^cursor_/)
    expect(newest.items[0]).toMatchObject({
      id: 'message-seferihisar-history-37',
      sequence: 37,
    })
    expect(newest.items.at(-1)).toMatchObject({
      id: 'message-seferihisar-1',
      sequence: 66,
    })

    const older = await source.listMessages({
      conversationId: 'conversation-seferihisar-cem',
      before: newest.nextCursor,
      limit: 30,
    })
    expect(older.items).toHaveLength(30)
    expect(older.nextCursor).toMatch(/^cursor_/)
    expect(older.items[0]).toMatchObject({
      id: 'message-seferihisar-history-7',
      sequence: 7,
    })
    expect(older.items.at(-1)).toMatchObject({
      id: 'message-seferihisar-history-36',
      sequence: 36,
    })
  })

  it('provides all supported message kinds and attachment states in deterministic fixture history', async () => {
    const source = createMessagesFixtureDataSource()
    const conversations = await source.listConversations({ filter: 'all', query: '', limit: 20 })
    const pages = await Promise.all(
      conversations.items.map(({ id }) => source.listMessages({ conversationId: id, limit: 40 })),
    )
    const messages = pages.flatMap(({ items }) => items)

    expect(new Set(messages.map(({ kind }) => kind))).toEqual(
      new Set(['text', 'attachment', 'system', 'safety']),
    )
    expect(messages.some(({ attachments }) => attachments.some(({ state }) => state === 'ready'))).toBe(true)
  })

  it('rejects an already-aborted request with an AbortError', async () => {
    const source = createMessagesFixtureDataSource()
    const controller = new AbortController()
    controller.abort()

    await expect(
      source.listConversations(
        { filter: 'all', query: '', limit: 20 },
        { signal: controller.signal },
      ),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('returns a deterministic sent message and keeps mutations after refetch', async () => {
    const source = createMessagesFixtureDataSource()
    const sent = await source.sendMessage({
      conversationId: 'conversation-urla-ayse',
      clientMessageId: 'client-123',
      body: 'Yarın Urla’da görüşebilir miyiz?',
      attachments: [],
    })

    expect(sent).toMatchObject({
      id: 'message_client-123',
      clientMessageId: 'client-123',
      sequence: 5,
      deliveryState: 'sent',
    })
    expect(sent.deliveryState).not.toBe('delivered')
    expect(sent.deliveryState).not.toBe('read')

    const refreshed = await source.listMessages({
      conversationId: 'conversation-urla-ayse',
      limit: 20,
    })
    expect(refreshed.items.map(({ id }) => id)).toContain('message_client-123')

    await source.archiveConversation({
      conversationId: 'conversation-urla-ayse',
      archived: true,
    })
    await source.markConversationRead({
      conversationId: 'conversation-urla-ayse',
      throughSequence: 5,
    })
    const archived = await source.listConversations({ filter: 'archived', query: '', limit: 20 })
    expect(archived.items).toContainEqual(
      expect.objectContaining({ id: 'conversation-urla-ayse', unreadCount: 0 }),
    )
  })

  it('keeps mutation history local to each factory instance', async () => {
    const first = createMessagesFixtureDataSource()
    const second = createMessagesFixtureDataSource()

    await first.archiveConversation({ conversationId: 'conversation-urla-ayse', archived: true })

    await expect(
      first.listConversations({ filter: 'archived', query: '', limit: 20 }),
    ).resolves.toMatchObject({
      items: expect.arrayContaining([expect.objectContaining({ id: 'conversation-urla-ayse' })]),
    })
    await expect(
      second.listConversations({ filter: 'archived', query: '', limit: 20 }),
    ).resolves.not.toMatchObject({
      items: expect.arrayContaining([expect.objectContaining({ id: 'conversation-urla-ayse' })]),
    })
  })

  it('does not advertise unsupported moderation, blocking, or scan capabilities', () => {
    const source = createMessagesFixtureDataSource()

    expect(source.capabilities?.reportMessage).toBeUndefined()
    expect(source.capabilities?.blockParticipant).toBeUndefined()
    expect(source.capabilities?.uploadAttachment).toBeUndefined()
  })
})
