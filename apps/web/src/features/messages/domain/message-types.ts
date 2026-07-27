export type ConversationFilter = 'all' | 'unread' | 'archived'

export type ConversationStatus =
  | 'active'
  | 'archived'
  | 'blocked'
  | 'listing-closed'

export type MessageKind = 'text' | 'attachment' | 'system' | 'safety'

export type MessageDeliveryState =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

export type MessageAttachmentState =
  | 'selected'
  | 'uploading'
  | 'scanning'
  | 'ready'
  | 'failed'
  | 'blocked'

export type MessagesConnectionState = 'online' | 'reconnecting' | 'offline'

export type MessagesWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'restricted'
  | 'session-expired'

export interface MessageCounterpart {
  id: string
  displayName: string
  avatarUrl?: string
}

export interface MessageListingContext {
  id: string
  title: string
  imageSrc?: string
  imageAlt: string
  priceLabel?: string
  referenceLabel: string
  status?: string
}

export interface MessagePreview {
  kind: MessageKind
  body: string
  sentAt: string
  senderId: string | 'system'
}

export interface MessageAttachment {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
  state: MessageAttachmentState
  url?: string
  failureReason?: string
}

export interface ConversationSummary {
  id: string
  counterpart: MessageCounterpart
  listing: MessageListingContext
  lastMessage: MessagePreview | null
  unreadCount: number
  lastUserActivityAt: string
  status: ConversationStatus
}

export interface MessageBase {
  conversationId: string
  sequence: number | null
  senderId: string | 'system'
  kind: MessageKind
  body: string
  attachments: MessageAttachment[]
  deliveryState: MessageDeliveryState | null
  sentAt: string
}

export type MarketplaceMessage =
  | (MessageBase & {
      id?: never
      clientMessageId: string
      deliveryState: 'pending' | 'failed'
    })
  | (MessageBase & {
      id: string
      clientMessageId?: string
      deliveryState: 'sent' | 'delivered' | 'read' | null
    })

export interface ConversationListInput {
  filter: ConversationFilter
  query: string
  cursor?: string
  limit: number
}

export interface ConversationPage {
  items: ConversationSummary[]
  nextCursor?: string
}

export interface MessageListInput {
  conversationId: string
  before?: string
  limit: number
}

export interface MessagePage {
  items: MarketplaceMessage[]
  nextCursor?: string
}

export interface SendMessageInput {
  conversationId: string
  clientMessageId: string
  body: string
  attachments: MessageAttachment[]
}

export interface UploadAttachmentInput {
  conversationId: string
  file: File
}

export type UploadAttachmentOperation = (
  input: UploadAttachmentInput,
  options?: { signal?: AbortSignal },
) => Promise<MessageAttachment>

export type MarkConversationUnreadOperation = (
  input: { conversationId: string; throughSequence: number },
  options?: { signal?: AbortSignal },
) => Promise<ConversationSummary>

export type ReportMessageOperation = (
  input: { conversationId: string; messageId: string },
  options?: { signal?: AbortSignal },
) => Promise<void>

export type BlockParticipantOperation = (
  input: { conversationId: string; participantId: string; blocked: boolean },
  options?: { signal?: AbortSignal },
) => Promise<ConversationSummary>

export interface MessagesIntegrationCapabilities {
  uploadAttachment?: UploadAttachmentOperation
  markConversationUnread?: MarkConversationUnreadOperation
  reportMessage?: ReportMessageOperation
  blockParticipant?: BlockParticipantOperation
  deliveryReceipts?: boolean
  readReceipts?: boolean
}

export type MessagesRealtimeEvent =
  | { type: 'message.created'; message: MarketplaceMessage }
  | { type: 'message.updated'; message: MarketplaceMessage }
  | { type: 'conversation.updated'; conversation: ConversationSummary }

export interface MessagesRealtimeSource {
  subscribe(listener: (event: MessagesRealtimeEvent) => void): () => void
}

export interface MessagesDataSource {
  listConversations(
    input: ConversationListInput,
    options?: { signal?: AbortSignal },
  ): Promise<ConversationPage>
  listMessages(
    input: MessageListInput,
    options?: { signal?: AbortSignal },
  ): Promise<MessagePage>
  sendMessage(
    input: SendMessageInput,
    options?: { signal?: AbortSignal },
  ): Promise<MarketplaceMessage>
  archiveConversation(
    input: { conversationId: string; archived: boolean },
    options?: { signal?: AbortSignal },
  ): Promise<ConversationSummary>
  markConversationRead(
    input: { conversationId: string; throughSequence: number },
    options?: { signal?: AbortSignal },
  ): Promise<ConversationSummary>
  capabilities?: MessagesIntegrationCapabilities
  realtime?: MessagesRealtimeSource
}

export interface MessagesWorkspaceProps {
  dataSource: MessagesDataSource
  mode?: MessagesWorkspaceMode
  conversationId?: string
  defaultConversationId?: string
  onConversationChange?: (conversationId?: string) => void
  connectionState?: MessagesConnectionState
  onOpenListing?: (listingId: string) => void
  /** Taslakları sessionStorage içinde ayırır; URL, log veya telemetry'ye taşınmaz. */
  draftNamespace?: string
}
