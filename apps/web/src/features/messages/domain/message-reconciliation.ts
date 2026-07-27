import type {
  ConversationSummary,
  MarketplaceMessage,
  MessageAttachment,
  MessageBase,
  MessageKind,
  MessagesIntegrationCapabilities,
} from './message-types'

type CanonicalMessage = Extract<MarketplaceMessage, { id: string }>
type PendingMessage = MessageBase & {
  clientMessageId: string
  deliveryState: 'pending'
}
type CanonicalDeliveryState = 'sent' | 'delivered' | 'read'

export type ReconciledMessage = MarketplaceMessage & {
  failureReason?: string
}

export interface CreatePendingMessageInput {
  conversationId: string
  clientMessageId: string
  senderId: string
  body: string
  sentAt: string
  attachments?: MessageAttachment[]
  kind?: Exclude<MessageKind, 'system' | 'safety'>
}

export interface DeliveryStateEvent {
  conversationId: string
  messageId?: string
  clientMessageId?: string
  deliveryState: CanonicalDeliveryState
}

const DELIVERY_STATE_RANK = {
  sent: 1,
  delivered: 2,
  read: 3,
} as const

function isCanonicalMessage(
  message: ReconciledMessage,
): message is CanonicalMessage & { failureReason?: string } {
  return typeof (message as { id?: unknown }).id === 'string'
}

function isSameMessage(left: ReconciledMessage, right: ReconciledMessage) {
  return (
    left.conversationId === right.conversationId &&
    left.sequence === right.sequence &&
    left.senderId === right.senderId &&
    left.kind === right.kind &&
    left.body === right.body &&
    left.deliveryState === right.deliveryState &&
    left.sentAt === right.sentAt &&
    left.clientMessageId === right.clientMessageId &&
    left.failureReason === right.failureReason &&
    left.attachments.length === right.attachments.length &&
    left.attachments.every((attachment, index) =>
      isSameAttachment(attachment, right.attachments[index]),
    )
  )
}

function isSameAttachment(
  left: MessageAttachment,
  right: MessageAttachment | undefined,
) {
  return (
    left.id === right?.id &&
    left.name === right.name &&
    left.mimeType === right.mimeType &&
    left.sizeBytes === right.sizeBytes &&
    left.state === right.state &&
    left.url === right.url &&
    left.failureReason === right.failureReason
  )
}

function pickDeliveryState(
  current: CanonicalMessage['deliveryState'],
  next: CanonicalMessage['deliveryState'],
) {
  if (current === null) return next
  if (next === null) return current

  return DELIVERY_STATE_RANK[next] >= DELIVERY_STATE_RANK[current]
    ? next
    : current
}

function canonicalize(
  incoming: CanonicalMessage,
  existing?: ReconciledMessage,
): ReconciledMessage {
  const existingDeliveryState =
    existing && isCanonicalMessage(existing) ? existing.deliveryState : null
  const deliveryState = pickDeliveryState(
    existingDeliveryState,
    incoming.deliveryState,
  )
  const clientMessageId = existing?.clientMessageId ?? incoming.clientMessageId

  return {
    ...incoming,
    ...(clientMessageId ? { clientMessageId } : {}),
    deliveryState,
  } as ReconciledMessage
}

function findMessageIndex(
  messages: readonly ReconciledMessage[],
  incoming: CanonicalMessage,
) {
  const serverMessageIndex = messages.findIndex(
    (message) => isCanonicalMessage(message) && message.id === incoming.id,
  )
  if (serverMessageIndex !== -1) return serverMessageIndex

  if (!incoming.clientMessageId) return -1

  return messages.findIndex(
    (message) =>
      message.conversationId === incoming.conversationId &&
      message.clientMessageId === incoming.clientMessageId,
  )
}

export function createPendingMessage(
  input: CreatePendingMessageInput,
): ReconciledMessage {
  const message: PendingMessage = {
    conversationId: input.conversationId,
    clientMessageId: input.clientMessageId,
    sequence: null,
    senderId: input.senderId,
    kind: input.kind ?? 'text',
    body: input.body,
    attachments: input.attachments ?? [],
    deliveryState: 'pending',
    sentAt: input.sentAt,
  }

  return message
}

export function acknowledgeMessage(
  messages: readonly ReconciledMessage[],
  ack: CanonicalMessage,
): ReconciledMessage[] {
  const matchingIndex = findMessageIndex(messages, ack)

  if (matchingIndex === -1) return [...messages, canonicalize(ack)]

  const existing = messages[matchingIndex]
  if (!existing) return [...messages, canonicalize(ack)]

  const reconciled = canonicalize(ack, existing)
  if (isSameMessage(existing, reconciled)) return messages as ReconciledMessage[]

  return messages.map((message, index) =>
    index === matchingIndex ? reconciled : message,
  )
}

export function failPendingMessage(
  messages: readonly ReconciledMessage[],
  clientMessageId: string,
  reason: string,
): ReconciledMessage[] {
  let changed = false
  const nextMessages = messages.map((message) => {
    if (
      message.clientMessageId !== clientMessageId ||
      message.deliveryState !== 'pending'
    ) {
      return message
    }

    changed = true
    return {
      ...message,
      deliveryState: 'failed',
      failureReason: reason,
    } as ReconciledMessage
  })

  return changed ? nextMessages : (messages as ReconciledMessage[])
}

export function retryFailedMessage(
  messages: readonly ReconciledMessage[],
  clientMessageId: string,
): ReconciledMessage[] {
  let changed = false
  const nextMessages = messages.map((message) => {
    if (
      message.clientMessageId !== clientMessageId ||
      message.deliveryState !== 'failed'
    ) {
      return message
    }

    changed = true
    const { failureReason: _failureReason, ...retryingMessage } = message
    return {
      ...retryingMessage,
      deliveryState: 'pending',
    } as ReconciledMessage
  })

  return changed ? nextMessages : (messages as ReconciledMessage[])
}

export function mergeIncomingMessage(
  messages: readonly ReconciledMessage[],
  incoming: CanonicalMessage,
): ReconciledMessage[] {
  return acknowledgeMessage(messages, incoming)
}

export function applyDeliveryState(
  messages: readonly ReconciledMessage[],
  event: DeliveryStateEvent,
  capabilities?: Pick<
    MessagesIntegrationCapabilities,
    'deliveryReceipts' | 'readReceipts'
  >,
): ReconciledMessage[] {
  if (
    (event.deliveryState === 'delivered' &&
      capabilities?.deliveryReceipts !== true) ||
    (event.deliveryState === 'read' && capabilities?.readReceipts !== true)
  ) {
    return messages as ReconciledMessage[]
  }

  const isInEventConversation = (message: ReconciledMessage) =>
    isCanonicalMessage(message) &&
    message.conversationId === event.conversationId
  const serverMessageIndex = messages.findIndex(
    (message) => isInEventConversation(message) && message.id === event.messageId,
  )
  const matchingIndex =
    serverMessageIndex !== -1 || !event.clientMessageId
      ? serverMessageIndex
      : messages.findIndex(
          (message) =>
            isInEventConversation(message) &&
            message.clientMessageId === event.clientMessageId,
        )
  const message = messages[matchingIndex]

  if (!message || !isCanonicalMessage(message)) {
    return messages as ReconciledMessage[]
  }

  const deliveryState = pickDeliveryState(message.deliveryState, event.deliveryState)
  if (deliveryState === message.deliveryState) {
    return messages as ReconciledMessage[]
  }

  return messages.map((current, index) =>
    index === matchingIndex
      ? ({ ...current, deliveryState } as ReconciledMessage)
      : current,
  )
}

export function sortCanonicalMessages(
  messages: readonly ReconciledMessage[],
): ReconciledMessage[] {
  return [...messages].sort((left, right) => {
    if (left.sequence !== null && right.sequence !== null) {
      const sequenceDifference = left.sequence - right.sequence
      if (sequenceDifference !== 0) return sequenceDifference
    } else if (left.sequence !== null) {
      return -1
    } else if (right.sequence !== null) {
      return 1
    }

    return (
      left.sentAt.localeCompare(right.sentAt) ||
      getMessageRenderKey(left).localeCompare(getMessageRenderKey(right))
    )
  })
}

function getPreviewBody(message: ReconciledMessage) {
  if (message.deliveryState === 'pending') {
    return `Gönderiliyor: ${message.body}`
  }

  if (message.deliveryState === 'failed') {
    return `Gönderilemedi: ${message.body}`
  }

  return message.body
}

export function updateConversationPreview(
  conversations: readonly ConversationSummary[],
  message: ReconciledMessage,
): ConversationSummary[] {
  const conversationIndex = conversations.findIndex(
    (conversation) => conversation.id === message.conversationId,
  )
  const conversation = conversations[conversationIndex]

  if (!conversation) return conversations as ConversationSummary[]

  const isSystemEvent = message.senderId === 'system'
  const lastUserActivityAt = isSystemEvent
    ? conversation.lastUserActivityAt
    : conversation.lastUserActivityAt > message.sentAt
      ? conversation.lastUserActivityAt
      : message.sentAt
  const shouldUpdatePreview =
    !conversation.lastMessage || conversation.lastMessage.sentAt <= message.sentAt
  const nextLastMessage = shouldUpdatePreview
    ? {
        kind: message.kind,
        body: getPreviewBody(message),
        sentAt: message.sentAt,
        senderId: message.senderId,
      }
    : conversation.lastMessage
  if (!nextLastMessage) return conversations as ConversationSummary[]
  const previewChanged =
    conversation.lastMessage?.kind !== nextLastMessage.kind ||
    conversation.lastMessage?.body !== nextLastMessage.body ||
    conversation.lastMessage?.sentAt !== nextLastMessage.sentAt ||
    conversation.lastMessage?.senderId !== nextLastMessage.senderId

  if (!previewChanged && lastUserActivityAt === conversation.lastUserActivityAt) {
    return conversations as ConversationSummary[]
  }

  const nextConversation: ConversationSummary = {
    ...conversation,
    lastMessage: nextLastMessage,
    lastUserActivityAt,
  }

  return conversations.map((current, index) =>
    index === conversationIndex ? nextConversation : current,
  )
}

export function getMessageRenderKey(message: ReconciledMessage) {
  if (message.clientMessageId) return message.clientMessageId
  if (isCanonicalMessage(message)) return message.id

  return message.clientMessageId
}
