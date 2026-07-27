import { useEffect, useRef, useState } from 'react'
import { GlassButton, GlassDrawer } from '@repo/ui'
import type {
  BlockParticipantOperation,
  ConversationSummary,
  MarketplaceMessage,
  ReportMessageOperation,
} from '../domain/message-types'

export type MessageOverlayState =
  | { kind: 'listing'; conversationId: string }
  | { kind: 'report'; conversationId: string; messageId: string }
  | { kind: 'block'; conversationId: string; participantId: string }
  | undefined

export interface MessageDrawersProps {
  /** Tek controlled overlay kaynağı; aynı anda birden fazla portal açılmaz. */
  state: MessageOverlayState
  onStateChange: (state: MessageOverlayState) => void
  /** Aktif konuşma; listing drawer bu veri olmadan tahminde bulunmaz. */
  conversation?: ConversationSummary
  /** Report bağlamı için, yalnız state'teki messageId ile eşleşirse kullanılır. */
  reportMessage?: MarketplaceMessage
  onReportMessage?: ReportMessageOperation
  onBlockParticipant?: BlockParticipantOperation
}

interface RequestIdentity {
  key: string
  token: symbol
}

interface DrawerFeedback {
  key: string
  submitting: boolean
  error?: string
}

function overlayKey(state: MessageOverlayState) {
  if (!state) return 'closed'
  if (state.kind === 'report') return `report:${state.conversationId}:${state.messageId}`
  if (state.kind === 'block') return `block:${state.conversationId}:${state.participantId}`
  return `listing:${state.conversationId}`
}

function errorText(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'İşlem şu anda tamamlanamadı.'
}

/** Listing, report ve block akışlarını ortak GlassDrawer sözleşmesinde controlled yönetir. */
export function MessageDrawers({
  state,
  onStateChange,
  conversation,
  reportMessage,
  onReportMessage,
  onBlockParticipant,
}: MessageDrawersProps) {
  const mountedRef = useRef(true)
  const stateRef = useRef(state)
  const activeRequestRef = useRef<RequestIdentity | undefined>(undefined)
  const activationGuardRef = useRef<string | undefined>(undefined)
  const previousKeyRef = useRef(overlayKey(state))
  const [feedback, setFeedback] = useState<DrawerFeedback>()
  const currentKey = overlayKey(state)
  stateRef.current = state

  if (previousKeyRef.current !== currentKey) {
    previousKeyRef.current = currentKey
    activeRequestRef.current = undefined
    if (activationGuardRef.current !== currentKey) activationGuardRef.current = undefined
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      activeRequestRef.current = undefined
      activationGuardRef.current = undefined
    }
  }, [])

  if (!state || !conversation || state.conversationId !== conversation.id) return null

  const close = () => {
    activeRequestRef.current = undefined
    activationGuardRef.current = undefined
    onStateChange(undefined)
  }

  const runOperation = async (operation: () => Promise<unknown>) => {
    if (activationGuardRef.current === currentKey) return
    const request = { key: currentKey, token: Symbol(currentKey) }
    activationGuardRef.current = currentKey
    activeRequestRef.current = request
    setFeedback({ key: currentKey, submitting: true })

    try {
      await operation()
      const stillCurrent = mountedRef.current
        && activeRequestRef.current?.token === request.token
        && overlayKey(stateRef.current) === request.key
      if (!stillCurrent) return
      setFeedback({ key: request.key, submitting: false })
      onStateChange(undefined)
    } catch (reason) {
      const stillCurrent = mountedRef.current
        && activeRequestRef.current?.token === request.token
        && overlayKey(stateRef.current) === request.key
      if (!stillCurrent) return
      activeRequestRef.current = undefined
      activationGuardRef.current = undefined
      setFeedback({ key: request.key, submitting: false, error: errorText(reason) })
    }
  }

  const submitting = feedback?.key === currentKey && feedback.submitting
  const error = feedback?.key === currentKey ? feedback.error : undefined

  if (state.kind === 'listing') {
    return (
      <GlassDrawer open onClose={close} title="İlan ayrıntıları">
        <div className="messageDrawers__listing">
          {conversation.listing.imageSrc ? (
            <img src={conversation.listing.imageSrc} alt={conversation.listing.imageAlt} className="messageDrawers__listingImage" />
          ) : null}
          <p className="messageDrawers__listingTitle">{conversation.listing.title}</p>
          <p className="messageDrawers__listingMeta">{conversation.listing.referenceLabel}</p>
          {conversation.listing.priceLabel ? (
            <p className="messageDrawers__listingPrice">{conversation.listing.priceLabel}</p>
          ) : null}
          {conversation.listing.status ? (
            <p className="messageDrawers__listingMeta">{conversation.listing.status}</p>
          ) : null}
        </div>
      </GlassDrawer>
    )
  }

  if (state.kind === 'report') {
    const messageMatches = reportMessage?.id === state.messageId
      && reportMessage.conversationId === conversation.id
    if (typeof onReportMessage !== 'function' || !messageMatches) return null
    return (
      <GlassDrawer
        open
        onClose={close}
        title="Mesajı bildir"
        description="Rapor, seçilen mesajın bağlamıyla birlikte incelenir."
        footer={(
          <GlassButton
            prominent
            loading={submitting}
            onClick={() => runOperation(() => onReportMessage({
              conversationId: state.conversationId,
              messageId: state.messageId,
            }))}
          >
            Mesajı bildir
          </GlassButton>
        )}
      >
        <blockquote>{reportMessage.body}</blockquote>
        {error ? <p role="alert">{error}</p> : null}
      </GlassDrawer>
    )
  }

  const participantMatches = state.participantId === conversation.counterpart.id
  if (typeof onBlockParticipant !== 'function' || !participantMatches) return null
  return (
    <GlassDrawer
      open
      onClose={close}
      title="Kişiyi engelle"
      description="Engellenen kişi bu konuşmaya yeni mesaj gönderemez."
      footer={(
        <GlassButton
          prominent
          loading={submitting}
          onClick={() => runOperation(() => onBlockParticipant({
            conversationId: state.conversationId,
            participantId: state.participantId,
            blocked: true,
          }))}
        >
          Kişiyi engelle
        </GlassButton>
      )}
    >
      <p>{conversation.counterpart.displayName} adlı kişiyi engellemek üzeresiniz.</p>
      {error ? <p role="alert">{error}</p> : null}
    </GlassDrawer>
  )
}
