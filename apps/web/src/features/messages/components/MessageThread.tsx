import { GlassAvatar, GlassButton } from '@repo/ui'
import type { ComposerSubmission } from './MessageComposer'
import { MessageComposer } from './MessageComposer'
import { MessageTimeline } from './MessageTimeline'
import type { MessageOverlayState } from './MessageDrawers'
import type {
  ConversationSummary,
  MarketplaceMessage,
  UploadAttachmentOperation,
} from '../domain/message-types'

export type MessageThreadState = 'ready' | 'loading' | 'error'

export interface MessageThreadProps {
  /** Seçili konuşma; yoksa thread sakin bir seçim bekleme durumu gösterir. */
  conversation?: ConversationSummary
  /** Thread sorgusunun yerel sonucu; rail'in hata durumundan bağımsızdır. */
  state?: MessageThreadState
  error?: string
  messages?: readonly MarketplaceMessage[]
  currentUserId?: string
  hasOlder?: boolean
  loadingOlder?: boolean
  onLoadOlder?: () => void
  onRetry?: (message: MarketplaceMessage) => void
  onCopy?: (message: MarketplaceMessage) => void
  draft?: string
  onDraftChange?: (value: string) => void
  onSend?: (
    input: ComposerSubmission,
  ) => void | boolean | Promise<void | boolean>
  maxLength?: number
  attachmentCapability?: UploadAttachmentOperation
  /** Uygulama route'u gerçek ilan sayfasını açabiliyorsa görünür olur. */
  onOpenListing?: (listingId: string) => void
  /** Controlled drawer state'ini workspace'e yükseltir. */
  onOverlayStateChange?: (state: MessageOverlayState) => void
}

const unavailableSend = () => undefined

function composerState(conversation: ConversationSummary, canSend: boolean) {
  switch (conversation.status) {
    case 'listing-closed':
      return { readOnly: true, disabled: false, reason: 'Bu ilan yayından kaldırıldığı için yeni mesaj gönderemezsiniz.' }
    case 'archived':
      return { readOnly: true, disabled: false, reason: 'Bu konuşma arşivlendiği için yeni mesaj gönderemezsiniz.' }
    case 'blocked':
      return { readOnly: false, disabled: true, reason: 'Bu kişi engellendiği için yeni mesaj gönderemezsiniz.' }
    default:
      return canSend
        ? { readOnly: false, disabled: false, reason: undefined }
        : { readOnly: false, disabled: true, reason: 'Mesaj gönderme şu anda kullanılamıyor.' }
  }
}

/** Seçili konuşmanın başlığını, geçmişini ve kontrollü composer'ını bir arada orkestre eder. */
export function MessageThread({
  conversation,
  state = 'ready',
  error,
  messages = [],
  currentUserId = '',
  hasOlder,
  loadingOlder,
  onLoadOlder,
  onRetry,
  onCopy,
  draft = '',
  onDraftChange = () => undefined,
  onSend,
  maxLength = 2_000,
  attachmentCapability,
  onOpenListing,
  onOverlayStateChange,
}: MessageThreadProps) {
  if (state === 'loading') {
    return <section className="messageThread" aria-label="Mesaj içeriği" aria-busy="true"><p>Mesajlar yükleniyor</p></section>
  }

  if (state === 'error') {
    return <section className="messageThread" aria-label="Mesaj içeriği"><p role="alert">{error ?? 'Mesajlar alınamadı.'}</p></section>
  }

  if (!conversation) {
    return <section className="messageThread" aria-label="Mesaj içeriği"><p>Bir konuşma seçin</p></section>
  }

  const composer = composerState(conversation, typeof onSend === 'function')

  return (
    <section className="messageThread" aria-label={`${conversation.counterpart.displayName} ile konuşma`}>
      <header className="messageThread__header">
        <GlassAvatar
          src={conversation.counterpart.avatarUrl}
          name={conversation.counterpart.displayName}
          size="md"
        />
        <div>
          <h2>{conversation.counterpart.displayName}</h2>
          <p>{conversation.listing.title}</p>
          <p>{conversation.listing.referenceLabel}</p>
          {conversation.listing.priceLabel ? <p>{conversation.listing.priceLabel}</p> : null}
          {conversation.listing.status ? <p>{conversation.listing.status}</p> : null}
        </div>
        <div className="messageThread__actions">
          {onOpenListing ? (
            <GlassButton size="sm" onClick={() => onOpenListing(conversation.listing.id)}>İlana git</GlassButton>
          ) : null}
          {onOverlayStateChange ? (
            <GlassButton size="sm" onClick={() => onOverlayStateChange({ kind: 'listing', conversationId: conversation.id })}>İlan ayrıntıları</GlassButton>
          ) : null}
        </div>
      </header>
      <MessageTimeline
        conversationId={conversation.id}
        messages={messages}
        currentUserId={currentUserId}
        counterpartName={conversation.counterpart.displayName}
        hasOlder={hasOlder}
        loadingOlder={loadingOlder}
        onLoadOlder={onLoadOlder}
        onRetry={onRetry}
        onCopy={onCopy}
      />
      <MessageComposer
        value={draft}
        onValueChange={onDraftChange}
        onSend={onSend ?? unavailableSend}
        maxLength={maxLength}
        attachmentCapability={attachmentCapability}
        readOnly={composer.readOnly}
        disabled={composer.disabled}
        disabledReason={composer.reason}
      />
    </section>
  )
}
