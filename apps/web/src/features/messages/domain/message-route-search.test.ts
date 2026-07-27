import { describe, expect, it } from 'vitest'
import {
  isOpaqueConversationId,
  parseMessagesRouteSearch,
  serializeMessagesRouteSearch,
} from './message-route-search'
import type { MarketplaceMessage } from './message-types'

const messageBase = {
  conversationId: 'conv_urla_001',
  sequence: 1,
  senderId: 'viewer-1',
  kind: 'text' as const,
  body: 'Merhaba',
  attachments: [],
  sentAt: '2026-07-27T10:00:00.000Z',
}

const localPendingMessage = {
  ...messageBase,
  clientMessageId: 'client-message-1',
  deliveryState: 'pending' as const,
} satisfies MarketplaceMessage

const canonicalMessage = {
  ...messageBase,
  id: 'message-1',
  deliveryState: 'sent' as const,
} satisfies MarketplaceMessage

// @ts-expect-error Yerel pending mesaj canonical id taşıyamaz.
const pendingMessageWithId: MarketplaceMessage = {
  ...messageBase,
  id: 'message-1',
  clientMessageId: 'client-message-1',
  deliveryState: 'pending',
}

// @ts-expect-error Canonical mesajın id değeri zorunludur.
const canonicalMessageWithoutId: MarketplaceMessage = {
  ...messageBase,
  deliveryState: 'sent',
}

// @ts-expect-error Canonical mesaj pending delivery state'i taşıyamaz.
const canonicalMessageWithPendingState: MarketplaceMessage = {
  ...messageBase,
  id: 'message-1',
  deliveryState: 'pending',
}

void localPendingMessage
void canonicalMessage
void pendingMessageWithId
void canonicalMessageWithoutId
void canonicalMessageWithPendingState

describe('message route search', () => {
  it('keeps only a trimmed opaque conversation id', () => {
    expect(
      parseMessagesRouteSearch({
        konusma: '  conv_urla_001  ',
        kisi: 'Ayşe',
        mesaj: 'özel içerik',
      }),
    ).toEqual({ conversationId: 'conv_urla_001' })
  })

  it('drops blank, array and unsafe values', () => {
    expect(parseMessagesRouteSearch({ konusma: '   ' })).toEqual({})
    expect(parseMessagesRouteSearch({ konusma: ['conv_1'] })).toEqual({})
    expect(parseMessagesRouteSearch({ konusma: '../Ayşe?telefon=1' })).toEqual({})
  })

  it.each([
    ['harf, sayı, alt çizgi ve tire', 'conv_Ab9_-', true],
    ['boş değer', '', false],
    ['Unicode karakter', 'konuşma_1', false],
    ['boşluk', 'conv 1', false],
    ['128 karakter', 'a'.repeat(128), true],
    ['129 karakter', 'a'.repeat(129), false],
  ])('validates %s', (_label, value, expected) => {
    expect(isOpaqueConversationId(value)).toBe(expected)
  })

  it('keeps opaque ID length limits while parsing and serializing', () => {
    const maximumLengthId = 'a'.repeat(128)
    const overLimitId = 'a'.repeat(129)

    expect(parseMessagesRouteSearch({ konusma: maximumLengthId })).toEqual({
      conversationId: maximumLengthId,
    })
    expect(parseMessagesRouteSearch({ konusma: overLimitId })).toEqual({})
    expect(
      serializeMessagesRouteSearch({ conversationId: maximumLengthId }),
    ).toEqual({ konusma: maximumLengthId })
    expect(
      serializeMessagesRouteSearch({ conversationId: overLimitId }),
    ).toEqual({})
  })

  it('serializes only konusma and never PII fields', () => {
    const serialized = serializeMessagesRouteSearch({
      conversationId: 'conv_urla_001',
    })

    expect(serialized).toEqual({ konusma: 'conv_urla_001' })

    // @ts-expect-error Serializer PII anahtarlarını açmamalıdır.
    serialized.kisi
  })
})
