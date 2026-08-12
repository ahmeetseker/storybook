import type { ConversationSummary } from '../domain/message-types'
import {
  MESSAGE_FIXTURES,
  type CanonicalFixtureMessage,
  type MessagesFixtureData,
} from './message-fixtures'

/**
 * Ofis dizininden ("Mesaj" aksiyonu) yazılan serbest metin mesajların oturum
 * ömürlü mock deposu. Randevu store'uyla aynı sözleşme: sessionStorage'a
 * yazılır ki footer üzerinden gelen TAM SAYFA yüklemesi mesajı silmesin;
 * sekme kapanınca sıfırlanır. `withOfficeConversations` bu kayıtları mesaj
 * merkezinin fixture'larına ekler — Hesabım → Mesajlar ofis sohbetini
 * gerçek bir sohbet gibi listeler.
 */

const STORAGE_KEY = 'arsam:ofis-mesajlari'
/** Kalıcı şeklin sürümü: uyuşmazlıkta payload TÜMÜYLE atılır (mock veri —
 * eski şekli taşımak yerine temiz başlamak güvenli olandır). */
const SCHEMA_VERSION = 1

export interface OfficeMessageInput {
  officeId: string
  officeName: string
  /** Sohbet bağlam etiketi için ilçe (ör. "Ofis · kadıköy") */
  district?: string
  body: string
}

interface OfficeThread {
  conversation: ConversationSummary
  messages: CanonicalFixtureMessage[]
}

interface PersistedState {
  version: number
  threads: OfficeThread[]
}

let threads: OfficeThread[] = []

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    // Erişim engelli (gizli mod/kota) — kalıcılık sessizce devre dışı kalır.
    return null
  }
}

function persist() {
  const store = storage()
  if (!store) return
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, threads } satisfies PersistedState))
  } catch {
    // Yazma hatası mock akışı durdurmaz.
  }
}

function isValidThread(thread: OfficeThread): boolean {
  return Boolean(
    thread &&
      thread.conversation &&
      typeof thread.conversation.id === 'string' &&
      thread.conversation.id &&
      typeof thread.conversation.counterpart?.displayName === 'string' &&
      Array.isArray(thread.messages) &&
      thread.messages.every(
        (message) => typeof message?.body === 'string' && typeof message?.conversationId === 'string',
      ),
  )
}

function hydrate() {
  threads = []
  const store = storage()
  if (!store) return
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.threads)) return
    // Geçersiz kayıt tek başına atılır: bir sohbet bozuldu diye diğerleri kaybolmaz.
    threads = parsed.threads.filter(isValidThread)
  } catch {
    threads = []
  }
}

hydrate()

/** Ofis mesajını gönderir: sohbet yoksa açar, varsa sonuna ekler. */
export function sendOfficeMessage(input: OfficeMessageInput): { conversationId: string } {
  const body = input.body.trim()
  if (!body) throw new Error('Mesaj gövdesi boş olamaz.')

  const conversationId = `conversation-ofis-${input.officeId}`
  const sentAt = new Date().toISOString()
  let thread = threads.find((item) => item.conversation.id === conversationId)

  if (!thread) {
    thread = {
      conversation: {
        id: conversationId,
        counterpart: { id: `office-${input.officeId}`, displayName: input.officeName },
        // Ofis sohbetinin ilan bağlamı yoktur; bağlam satırı ofisin kendisidir.
        listing: {
          id: `office-${input.officeId}`,
          title: 'Ofis görüşmesi',
          imageAlt: `${input.officeName} ofis görüşmesi`,
          referenceLabel: input.district ? `Ofis · ${input.district}` : 'Ofis',
        },
        lastMessage: null,
        unreadCount: 0,
        lastUserActivityAt: sentAt,
        status: 'active',
      },
      messages: [],
    }
    threads = [...threads, thread]
  }

  const sequence = thread.messages.length + 1
  const message: CanonicalFixtureMessage = {
    id: `${conversationId}-mesaj-${sequence}`,
    conversationId,
    sequence,
    senderId: 'current-user',
    kind: 'text',
    body,
    attachments: [],
    deliveryState: 'sent',
    sentAt,
  }

  threads = threads.map((item) =>
    item.conversation.id === conversationId
      ? {
          conversation: {
            ...item.conversation,
            lastMessage: { kind: 'text', body, sentAt, senderId: 'current-user' },
            lastUserActivityAt: sentAt,
          },
          messages: [...item.messages, message],
        }
      : item,
  )
  persist()
  return { conversationId }
}

/** Mesaj merkezi fixture'larına oturumdaki ofis sohbetlerini ekler. */
export function withOfficeConversations(
  fixtures: MessagesFixtureData = MESSAGE_FIXTURES,
): MessagesFixtureData {
  if (threads.length === 0) return fixtures
  return {
    conversations: [...fixtures.conversations, ...threads.map((item) => item.conversation)],
    messages: [...fixtures.messages, ...threads.flatMap((item) => item.messages)],
  }
}

/** Oturumda kaç ofis sohbeti var — mount sonrası query tazeleme kararı için. */
export function officeThreadCount(): number {
  return threads.length
}

/** Yalnız testler için: bellek durumunu depodan yeniden kurar. */
export function __rehydrateForTests(): void {
  hydrate()
}

/** Yalnız testler için: belleği ve depoyu sıfırlar. */
export function resetOfficeMessageStore(): void {
  threads = []
  try {
    storage()?.removeItem(STORAGE_KEY)
  } catch {
    // Depo erişilemezse sıfırlanacak bir şey de yoktur.
  }
}
