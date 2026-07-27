const OPAQUE_CONVERSATION_ID = /^[A-Za-z0-9_-]{1,128}$/

export interface MessagesRouteState {
  conversationId?: string
}

export type MessagesRouteSearch = {
  konusma?: string
}

export function isOpaqueConversationId(value: unknown): value is string {
  return typeof value === 'string' && OPAQUE_CONVERSATION_ID.test(value)
}

export function parseMessagesRouteSearch(
  raw: Record<string, unknown>,
): MessagesRouteState {
  const conversationId =
    typeof raw.konusma === 'string' ? raw.konusma.trim() : undefined

  return conversationId && isOpaqueConversationId(conversationId)
    ? { conversationId }
    : {}
}

export function serializeMessagesRouteSearch(
  state: MessagesRouteState,
): MessagesRouteSearch {
  const conversationId = state.conversationId?.trim()

  return conversationId && isOpaqueConversationId(conversationId)
    ? { konusma: conversationId }
    : {}
}
