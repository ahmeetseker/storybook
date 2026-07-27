import type {
  ConversationPage,
  ConversationSummary,
  MarketplaceMessage,
  MessagePage,
  MessagesDataSource,
} from '../domain/message-types'
import {
  MESSAGE_FIXTURES,
  normalizeMessageSearch,
  type CanonicalFixtureMessage,
  type MessagesFixtureData,
} from './message-fixtures'

const clone = <Value,>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value

function abortIfNeeded(signal?: AbortSignal) {
  if (!signal?.aborted) return
  throw new DOMException('İstek iptal edildi.', 'AbortError')
}

function cursorFor(scope: string, id: string) {
  let hash = 2166136261
  for (const character of `${scope}:${id}`) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `cursor_${(hash >>> 0).toString(36)}`
}

function pageFromEnd<Item extends { id: string }>(
  items: Item[],
  cursor: string | undefined,
  limit: number,
  scope: string,
) {
  const end = cursor
    ? Math.max(0, items.findIndex(({ id }) => cursorFor(scope, id) === cursor))
    : items.length
  const start = Math.max(0, end - limit)
  const pageItems = items.slice(start, end)
  return {
    items: pageItems,
    nextCursor: start > 0 ? cursorFor(scope, pageItems[0].id) : undefined,
  }
}

function pageFromStart<Item extends { id: string }>(
  items: Item[],
  cursor: string | undefined,
  limit: number,
  scope: string,
) {
  const start = cursor
    ? Math.max(0, items.findIndex(({ id }) => cursorFor(scope, id) === cursor) + 1)
    : 0
  const pageItems = items.slice(start, start + limit)
  const hasMore = start + pageItems.length < items.length
  return {
    items: pageItems,
    nextCursor: hasMore ? cursorFor(scope, pageItems.at(-1)?.id ?? '') : undefined,
  }
}

function toPreview(message: MarketplaceMessage) {
  return {
    kind: message.kind,
    body: message.body,
    sentAt: message.sentAt,
    senderId: message.senderId,
  }
}

export function createMessagesFixtureDataSource(
  fixtures: MessagesFixtureData = MESSAGE_FIXTURES,
): MessagesDataSource {
  let snapshot = clone(fixtures)

  const sortedConversations = () =>
    [...snapshot.conversations].sort((left, right) =>
      right.lastUserActivityAt.localeCompare(left.lastUserActivityAt) || left.id.localeCompare(right.id),
    )

  const updateConversation = (
    conversationId: string,
    update: (conversation: ConversationSummary) => ConversationSummary,
  ) => {
    snapshot = {
      ...snapshot,
      conversations: snapshot.conversations.map((conversation) =>
        conversation.id === conversationId ? update(conversation) : conversation,
      ),
    }
    return snapshot.conversations.find(({ id }) => id === conversationId)
  }

  return {
    async listConversations(input, options): Promise<ConversationPage> {
      abortIfNeeded(options?.signal)
      const query = normalizeMessageSearch(input.query)
      const matched = sortedConversations().filter((conversation) => {
        const haystack = normalizeMessageSearch([
          conversation.counterpart.displayName,
          conversation.listing.title,
          conversation.listing.referenceLabel,
          conversation.listing.status ?? '',
        ].join(' '))
        return (!query || haystack.includes(query))
          && (input.filter !== 'unread' || conversation.unreadCount > 0)
          && (input.filter !== 'archived' || conversation.status === 'archived')
      })
      return clone(pageFromStart(matched, input.cursor, input.limit, `conversations:${input.filter}:${query}`))
    },

    async listMessages(input, options): Promise<MessagePage> {
      abortIfNeeded(options?.signal)
      const messages = snapshot.messages
        .filter(({ conversationId }) => conversationId === input.conversationId)
        .sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0))
      return clone(pageFromEnd(messages, input.before, input.limit, `messages:${input.conversationId}`))
    },

    async sendMessage(input, options) {
      abortIfNeeded(options?.signal)
      const existing = snapshot.messages.find(
        ({ clientMessageId }) => clientMessageId === input.clientMessageId,
      )
      if (existing) return clone(existing)
      const sequence = Math.max(
        0,
        ...snapshot.messages
          .filter(({ conversationId }) => conversationId === input.conversationId)
          .map(({ sequence: value }) => value ?? 0),
      ) + 1
      const message: CanonicalFixtureMessage = {
        id: `message_${input.clientMessageId}`,
        clientMessageId: input.clientMessageId,
        conversationId: input.conversationId,
        sequence,
        senderId: 'current-user',
        kind: input.attachments.length ? 'attachment' : 'text',
        body: input.body,
        attachments: clone(input.attachments),
        deliveryState: 'sent',
        sentAt: '2026-07-20T12:00:00.000Z',
      }
      snapshot = { ...snapshot, messages: [...snapshot.messages, message] }
      updateConversation(input.conversationId, (conversation) => ({
        ...conversation,
        lastMessage: toPreview(message),
        lastUserActivityAt: message.sentAt,
      }))
      return clone(message)
    },

    async archiveConversation(input, options) {
      abortIfNeeded(options?.signal)
      const conversation = updateConversation(input.conversationId, (current) => ({
        ...current,
        status: input.archived ? 'archived' : 'active',
      }))
      if (!conversation) throw new Error('Conversation bulunamadı.')
      return clone(conversation)
    },

    async markConversationRead(input, options) {
      abortIfNeeded(options?.signal)
      const latestSequence = Math.max(
        0,
        ...snapshot.messages
          .filter(({ conversationId }) => conversationId === input.conversationId)
          .map(({ sequence }) => sequence ?? 0),
      )
      const conversation = updateConversation(input.conversationId, (current) => ({
        ...current,
        unreadCount: input.throughSequence >= latestSequence ? 0 : current.unreadCount,
      }))
      if (!conversation) throw new Error('Conversation bulunamadı.')
      return clone(conversation)
    },
  }
}
