import { describe, expect, it } from 'vitest'

import {
  acknowledgeMessage,
  applyDeliveryState,
  createPendingMessage,
  failPendingMessage,
  getMessageRenderKey,
  mergeIncomingMessage,
  retryFailedMessage,
  sortCanonicalMessages,
  updateConversationPreview,
} from './message-reconciliation'
import type {
  ConversationSummary,
  MarketplaceMessage,
} from './message-types'

const conversation = {
  id: 'conv_1',
  counterpart: { id: 'person_1', displayName: 'Ayşe' },
  listing: {
    id: 'listing_1',
    title: 'Urla evi',
    imageAlt: 'Urla evi',
    referenceLabel: 'İlan 1',
  },
  lastMessage: {
    kind: 'text',
    body: 'Önceki mesaj',
    sentAt: '2026-07-27T09:00:00.000Z',
    senderId: 'person_1',
  },
  unreadCount: 0,
  lastUserActivityAt: '2026-07-27T09:00:00.000Z',
  status: 'active',
} satisfies ConversationSummary

function canonicalMessage(
  overrides: Partial<Extract<MarketplaceMessage, { id: string }>> = {},
) {
  return {
    id: 'message_1',
    conversationId: 'conv_1',
    sequence: 1,
    senderId: 'me',
    kind: 'text',
    body: 'Merhaba',
    attachments: [],
    deliveryState: 'sent',
    sentAt: '2026-07-27T10:00:00.000Z',
    ...overrides,
  } as Extract<MarketplaceMessage, { id: string }>
}

function pendingMessage(
  clientMessageId = 'client_1',
  body = 'Merhaba',
  conversationId = 'conv_1',
) {
  return createPendingMessage({
    conversationId,
    clientMessageId,
    senderId: 'me',
    body,
    sentAt: '2026-07-27T10:00:00.000Z',
  })
}

describe('message reconciliation', () => {
  it('creates a local pending message with no server sequence', () => {
    expect(pendingMessage()).toMatchObject({
      clientMessageId: 'client_1',
      sequence: null,
      deliveryState: 'pending',
      attachments: [],
    })
  })

  it('reconciles an ack in place without creating a duplicate', () => {
    const pending = pendingMessage()

    const result = acknowledgeMessage([pending], {
      ...canonicalMessage(),
      clientMessageId: 'client_1',
      id: 'message_91',
      sequence: 91,
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'message_91',
      clientMessageId: 'client_1',
      sequence: 91,
      deliveryState: 'sent',
    })
  })

  it('treats a duplicate ack as a no-op', () => {
    const ack = canonicalMessage({ clientMessageId: 'client_1' })
    const messages = [ack]

    expect(acknowledgeMessage(messages, ack)).toBe(messages)
  })

  it('prefers a server id ack match over an earlier colliding client id', () => {
    const collidingPending = pendingMessage('client_shared', 'Diğer konuşma', 'conv_2')
    const serverMessage = canonicalMessage({
      id: 'message_server',
      clientMessageId: 'client_server',
      sequence: 3,
    })

    const result = acknowledgeMessage(
      [collidingPending, serverMessage],
      canonicalMessage({
        id: 'message_server',
        clientMessageId: 'client_shared',
        sequence: 4,
      }),
    )

    expect(result[0]).toBe(collidingPending)
    expect(result[1]).toMatchObject({
      id: 'message_server',
      clientMessageId: 'client_server',
      sequence: 4,
    })
  })

  it('keeps ack and realtime creation as one canonical item', () => {
    const acknowledged = acknowledgeMessage(
      [pendingMessage()],
      canonicalMessage({ clientMessageId: 'client_1' }),
    )
    const merged = mergeIncomingMessage(
      acknowledged,
      canonicalMessage({ clientMessageId: 'client_1' }),
    )

    expect(merged).toBe(acknowledged)
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ id: 'message_1' })
  })

  it('reconciles an ack only within the incoming client id conversation', () => {
    const otherConversationPending = pendingMessage(
      'client_shared',
      'Diğer konuşma',
      'conv_2',
    )
    const incomingPending = pendingMessage('client_shared', 'Bu konuşma')

    const result = acknowledgeMessage(
      [otherConversationPending, incomingPending],
      canonicalMessage({ id: 'message_conv_1', clientMessageId: 'client_shared' }),
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toBe(otherConversationPending)
    expect(result[1]).toMatchObject({
      id: 'message_conv_1',
      conversationId: 'conv_1',
      body: 'Merhaba',
    })
  })

  it('reconciles a realtime message only within its client id conversation', () => {
    const otherConversationPending = pendingMessage(
      'client_shared',
      'Diğer konuşma',
      'conv_2',
    )
    const incomingPending = pendingMessage('client_shared', 'Bu konuşma')

    const result = mergeIncomingMessage(
      [otherConversationPending, incomingPending],
      canonicalMessage({ id: 'message_conv_1', clientMessageId: 'client_shared' }),
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toBe(otherConversationPending)
    expect(result[1]).toMatchObject({ id: 'message_conv_1', conversationId: 'conv_1' })
  })

  it('keeps the render key stable from pending through acknowledgement', () => {
    const pending = pendingMessage()
    const acknowledged = acknowledgeMessage(
      [pending],
      canonicalMessage({ clientMessageId: 'client_1' }),
    )[0]

    expect(getMessageRenderKey(pending)).toBe('client_1')
    expect(getMessageRenderKey(acknowledged)).toBe('client_1')
  })

  it('keeps text and client id after failure and retry', () => {
    const failed = failPendingMessage(
      [pendingMessage('client_1', 'Kaybolmaması gereken mesaj')],
      'client_1',
      'network',
    )
    const retried = retryFailedMessage(failed, 'client_1')

    expect(retried[0]).toMatchObject({
      clientMessageId: 'client_1',
      body: 'Kaybolmaması gereken mesaj',
      deliveryState: 'pending',
    })
  })

  it('orders canonical messages by server sequence before client timestamps', () => {
    const result = sortCanonicalMessages([
      canonicalMessage({
        id: 'message_second',
        sequence: 2,
        sentAt: '2026-07-27T08:00:00.000Z',
      }),
      canonicalMessage({
        id: 'message_first',
        sequence: 1,
        sentAt: '2026-07-27T12:00:00.000Z',
      }),
    ])

    expect(result.map(({ id }) => id)).toEqual(['message_first', 'message_second'])
  })

  it('never downgrades a delivery receipt from delivered or read to sent', () => {
    const delivered = applyDeliveryState(
      [canonicalMessage({ deliveryState: 'delivered' })],
      { conversationId: 'conv_1', messageId: 'message_1', deliveryState: 'sent' },
    )
    const read = applyDeliveryState(
      [canonicalMessage({ deliveryState: 'read' })],
      { conversationId: 'conv_1', messageId: 'message_1', deliveryState: 'delivered' },
      { deliveryReceipts: true, readReceipts: true },
    )

    expect(delivered[0]?.deliveryState).toBe('delivered')
    expect(read[0]?.deliveryState).toBe('read')
  })

  it('does not apply delivered or read receipts without the matching capability', () => {
    const messages = [canonicalMessage()]
    const noDeliveryCapability = applyDeliveryState(
      messages,
      { conversationId: 'conv_1', messageId: 'message_1', deliveryState: 'delivered' },
      { deliveryReceipts: false },
    )
    const noReadCapability = applyDeliveryState(
      messages,
      { conversationId: 'conv_1', messageId: 'message_1', deliveryState: 'read' },
    )

    expect(noDeliveryCapability).toBe(messages)
    expect(noReadCapability).toBe(messages)
  })

  it('scopes a receipt client id collision to the event conversation', () => {
    const firstConversation = canonicalMessage({
      id: 'message_conv_1',
      clientMessageId: 'client_shared',
    })
    const secondConversation = canonicalMessage({
      id: 'message_conv_2',
      conversationId: 'conv_2',
      clientMessageId: 'client_shared',
    })

    const result = applyDeliveryState(
      [firstConversation, secondConversation],
      {
        conversationId: 'conv_2',
        clientMessageId: 'client_shared',
        deliveryState: 'delivered',
      },
      { deliveryReceipts: true },
    )

    expect(result[0]).toBe(firstConversation)
    expect(result[1]?.deliveryState).toBe('delivered')
  })

  it('does not move a conversation user activity forward for a system event', () => {
    const result = updateConversationPreview(
      [conversation],
      canonicalMessage({
        senderId: 'system',
        kind: 'system',
        body: 'İlan fiyatı güncellendi.',
        deliveryState: null,
        sentAt: '2026-07-27T12:00:00.000Z',
      }),
    )

    expect(result[0]).toMatchObject({
      lastMessage: {
        kind: 'system',
        body: 'İlan fiyatı güncellendi.',
      },
      lastUserActivityAt: '2026-07-27T09:00:00.000Z',
    })
  })

  it('keeps a newer system preview while advancing late user activity', () => {
    const afterSystemEvent = updateConversationPreview(
      [conversation],
      canonicalMessage({
        senderId: 'system',
        kind: 'system',
        body: 'İlan fiyatı güncellendi.',
        deliveryState: null,
        sentAt: '2026-07-27T12:00:00.000Z',
      }),
    )
    const afterLateUserMessage = updateConversationPreview(
      afterSystemEvent,
      canonicalMessage({
        body: 'Geç gelen kullanıcı mesajı',
        sentAt: '2026-07-27T10:00:00.000Z',
      }),
    )

    expect(afterLateUserMessage[0]).toMatchObject({
      lastMessage: {
        kind: 'system',
        body: 'İlan fiyatı güncellendi.',
        sentAt: '2026-07-27T12:00:00.000Z',
      },
      lastUserActivityAt: '2026-07-27T10:00:00.000Z',
    })
  })

  it('preserves the conversation array reference for missing and semantic no-op previews', () => {
    const missingConversations = [conversation]
    const missingConversationResult = updateConversationPreview(
      missingConversations,
      canonicalMessage({ conversationId: 'conv_missing' }),
    )
    const matchingPreview = canonicalMessage({
      body: 'Önceki mesaj',
      sentAt: '2026-07-27T09:00:00.000Z',
      senderId: 'person_1',
    })
    const conversations = [conversation]
    const semanticNoOpResult = updateConversationPreview(
      conversations,
      matchingPreview,
    )

    expect(missingConversationResult).toBe(missingConversations)
    expect(semanticNoOpResult).toBe(conversations)
    expect(semanticNoOpResult[0]).toBe(conversation)
  })

  it('labels optimistic and failed conversation previews honestly', () => {
    const pending = pendingMessage('client_2', 'Evi görmek istiyorum')
    const failed = failPendingMessage([pending], 'client_2', 'network')[0]

    expect(updateConversationPreview([conversation], pending)[0]?.lastMessage?.body).toBe(
      'Gönderiliyor: Evi görmek istiyorum',
    )
    expect(updateConversationPreview([conversation], failed)[0]?.lastMessage?.body).toBe(
      'Gönderilemedi: Evi görmek istiyorum',
    )
  })
})
