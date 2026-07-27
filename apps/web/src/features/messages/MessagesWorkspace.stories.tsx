import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { MotionConfig } from 'motion/react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import {
  expect,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test'

import { MessagesWorkspace } from './MessagesWorkspace'
import {
  createMessagesFixtureDataSource,
} from './data/messages-adapter'
import {
  MESSAGE_FIXTURES,
  type CanonicalFixtureMessage,
  type MessagesFixtureData,
} from './data/message-fixtures'
import type {
  ConversationSummary,
  MarketplaceMessage,
  MessagesDataSource,
  MessagesIntegrationCapabilities,
  MessagesRealtimeEvent,
  MessagesRealtimeSource,
  MessagesWorkspaceProps,
} from './domain/message-types'

const DEFAULT_CONVERSATION_ID = 'conversation-urla-ayse'
const DRAFT_KEY_PREFIX = 'message-draft:v1:'

type SourceFactory = () => MessagesDataSource
type WorkspaceStoryArgs = Omit<MessagesWorkspaceProps, 'dataSource'>
type MediaPreference = 'reduced-motion' | 'reduced-transparency'

const SCOPED_MEDIA_CSS = `
  [data-messages-media-preference='reduced-motion'] #main-content *,
  [data-messages-media-preference='reduced-motion'] #main-content *::before,
  [data-messages-media-preference='reduced-motion'] #main-content *::after {
    animation: none;
    scroll-behavior: auto;
    transition: none;
  }

  [data-messages-media-preference='reduced-transparency']
    #main-content [data-material='glass'],
  [data-messages-media-preference='reduced-transparency']
    #main-content .messageComposer,
  [data-messages-media-preference='reduced-transparency']
    #main-content .messageTimeline__incoming,
  [data-messages-media-preference='reduced-transparency']
    #main-content .conversationRail__link[aria-current='page'] {
    background-color: var(--lg-surface);
    backdrop-filter: none;
  }
`

let storyScopeSequence = 0

function nextStoryScope() {
  storyScopeSequence += 1
  return `messages-story-${String(storyScopeSequence).padStart(2, '0')}`
}

function scopeConversationId(storyScope: string, conversationId: string) {
  return `${storyScope}:${conversationId}`
}

function unScopeConversationId(storyScope: string, conversationId: string) {
  const prefix = `${storyScope}:`
  return conversationId.startsWith(prefix)
    ? conversationId.slice(prefix.length)
    : conversationId
}

function scopeConversation(
  storyScope: string,
  conversation: ConversationSummary,
): ConversationSummary {
  return {
    ...conversation,
    id: scopeConversationId(storyScope, conversation.id),
  }
}

function scopeMessage(
  storyScope: string,
  message: MarketplaceMessage,
): MarketplaceMessage {
  return {
    ...message,
    conversationId: scopeConversationId(
      storyScope,
      message.conversationId,
    ),
  } as MarketplaceMessage
}

function scopeRealtimeEvent(
  storyScope: string,
  event: MessagesRealtimeEvent,
): MessagesRealtimeEvent {
  if (event.type === 'conversation.updated') {
    return {
      ...event,
      conversation: scopeConversation(storyScope, event.conversation),
    }
  }
  return {
    ...event,
    message: scopeMessage(storyScope, event.message),
  }
}

function createScopedMessagesDataSource(
  source: MessagesDataSource,
  storyScope: string,
): MessagesDataSource {
  const unScope = (conversationId: string) =>
    unScopeConversationId(storyScope, conversationId)
  const capabilities = source.capabilities
  const uploadAttachment = capabilities?.uploadAttachment
  const markConversationUnread = capabilities?.markConversationUnread
  const reportMessage = capabilities?.reportMessage
  const blockParticipant = capabilities?.blockParticipant
  const scopedCapabilities: MessagesIntegrationCapabilities | undefined =
    capabilities
      ? {
          ...capabilities,
          uploadAttachment: uploadAttachment
            ? (input, options) =>
                uploadAttachment(
                  {
                    ...input,
                    conversationId: unScope(input.conversationId),
                  },
                  options,
                )
            : undefined,
          markConversationUnread: markConversationUnread
            ? async (input, options) =>
                scopeConversation(
                  storyScope,
                  await markConversationUnread(
                    {
                      ...input,
                      conversationId: unScope(input.conversationId),
                    },
                    options,
                  ),
                )
            : undefined,
          reportMessage: reportMessage
            ? (input, options) =>
                reportMessage(
                  {
                    ...input,
                    conversationId: unScope(input.conversationId),
                  },
                  options,
                )
            : undefined,
          blockParticipant: blockParticipant
            ? async (input, options) =>
                scopeConversation(
                  storyScope,
                  await blockParticipant(
                    {
                      ...input,
                      conversationId: unScope(input.conversationId),
                    },
                    options,
                  ),
                )
            : undefined,
        }
      : undefined
  const realtime = source.realtime
  const scopedRealtime: MessagesRealtimeSource | undefined = realtime
    ? {
        subscribe(listener) {
          return realtime.subscribe((event) =>
            listener(scopeRealtimeEvent(storyScope, event)),
          )
        },
      }
    : undefined

  return {
    ...source,
    capabilities: scopedCapabilities,
    realtime: scopedRealtime,
    async listConversations(input, options) {
      const page = await source.listConversations(input, options)
      return {
        ...page,
        items: page.items.map((conversation) =>
          scopeConversation(storyScope, conversation),
        ),
      }
    },
    async listMessages(input, options) {
      const page = await source.listMessages(
        {
          ...input,
          conversationId: unScope(input.conversationId),
        },
        options,
      )
      return {
        ...page,
        items: page.items.map((message) =>
          scopeMessage(storyScope, message),
        ),
      }
    },
    async sendMessage(input, options) {
      return scopeMessage(
        storyScope,
        await source.sendMessage(
          {
            ...input,
            conversationId: unScope(input.conversationId),
          },
          options,
        ),
      )
    },
    async archiveConversation(input, options) {
      return scopeConversation(
        storyScope,
        await source.archiveConversation(
          {
            ...input,
            conversationId: unScope(input.conversationId),
          },
          options,
        ),
      )
    },
    async markConversationRead(input, options) {
      return scopeConversation(
        storyScope,
        await source.markConversationRead(
          {
            ...input,
            conversationId: unScope(input.conversationId),
          },
          options,
        ),
      )
    },
  }
}

function scopeWorkspaceProps(
  props: WorkspaceStoryArgs,
  storyScope: string,
): WorkspaceStoryArgs {
  const scopedProps = { ...props }
  if (Object.prototype.hasOwnProperty.call(props, 'conversationId')) {
    scopedProps.conversationId = props.conversationId
      ? scopeConversationId(storyScope, props.conversationId)
      : props.conversationId
  }
  if (
    Object.prototype.hasOwnProperty.call(props, 'defaultConversationId')
  ) {
    scopedProps.defaultConversationId = props.defaultConversationId
      ? scopeConversationId(storyScope, props.defaultConversationId)
      : props.defaultConversationId
  }
  if (props.onConversationChange) {
    const onConversationChange = props.onConversationChange
    scopedProps.onConversationChange = (conversationId) =>
      onConversationChange(
        conversationId
          ? unScopeConversationId(storyScope, conversationId)
          : undefined,
      )
  }
  return scopedProps
}

function storyDraftNamespace(storyScope: string) {
  return `storybook:${storyScope}`
}

function clearStoryDrafts(draftNamespace: string) {
  if (typeof window === 'undefined') return
  const scopedPrefix =
    `${DRAFT_KEY_PREFIX}${encodeURIComponent(draftNamespace)}:`
  const keys: string[] = []
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index)
    if (key?.startsWith(scopedPrefix)) keys.push(key)
  }
  keys.forEach((key) => window.sessionStorage.removeItem(key))
}

function MediaPreferenceScope({
  preference,
  children,
}: {
  preference: MediaPreference
  children: ReactNode
}) {
  const content =
    preference === 'reduced-motion' ? (
      <MotionConfig reducedMotion="always">{children}</MotionConfig>
    ) : (
      children
    )

  return (
    <div data-messages-media-preference={preference}>
      <style>{SCOPED_MEDIA_CSS}</style>
      {content}
    </div>
  )
}

function withMediaPreference(preference: MediaPreference): Decorator {
  return (Story) => (
    <MediaPreferenceScope preference={preference}>
      <Story />
    </MediaPreferenceScope>
  )
}

async function tabToElement(
  target: HTMLElement,
  direction: 'forward' | 'backward' = 'forward',
) {
  for (let step = 0; step < 40; step += 1) {
    if (target.ownerDocument.activeElement === target) return
    await userEvent.tab({ shift: direction === 'backward' })
  }
  throw new Error('Hedef kontrole Tab sırasıyla ulaşılamadı.')
}

function freshQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
      },
      mutations: { retry: false },
    },
  })
}

function storyFixtures(): MessagesFixtureData {
  return {
    conversations: MESSAGE_FIXTURES.conversations.map((conversation) => ({
      ...conversation,
      counterpart: { ...conversation.counterpart },
      listing: {
        ...conversation.listing,
        imageSrc: undefined,
      },
      lastMessage: conversation.lastMessage
        ? { ...conversation.lastMessage }
        : null,
    })),
    messages: MESSAGE_FIXTURES.messages.map((message) => ({
      ...message,
      attachments: message.attachments.map((attachment) => ({
        ...attachment,
        url: undefined,
      })),
    })),
  }
}

const createDefaultSource: SourceFactory = () =>
  createMessagesFixtureDataSource(storyFixtures())

function createUnreadSource() {
  const fixtures = storyFixtures()
  const conversations = fixtures.conversations.filter(
    ({ unreadCount }) => unreadCount > 0,
  )
  const ids = new Set(conversations.map(({ id }) => id))
  return createMessagesFixtureDataSource({
    conversations,
    messages: fixtures.messages.filter(({ conversationId }) =>
      ids.has(conversationId),
    ),
  })
}

const createEmptySource: SourceFactory = () =>
  createMessagesFixtureDataSource({
    conversations: [],
    messages: [],
  })

function createConversationListErrorSource(): MessagesDataSource {
  const source = createDefaultSource()
  return {
    ...source,
    async listConversations() {
      throw new Error('Konuşma listesi şu anda alınamadı.')
    },
  }
}

function createThreadErrorSource(): MessagesDataSource {
  const source = createDefaultSource()
  return {
    ...source,
    async listMessages() {
      throw new Error('Seçili konuşmanın mesajları alınamadı.')
    },
  }
}

function createFailedMessageSource(): MessagesDataSource {
  const source = createDefaultSource()
  const failedMessage: MarketplaceMessage = {
    clientMessageId: 'story-failed-message',
    conversationId: DEFAULT_CONVERSATION_ID,
    sequence: null,
    senderId: 'current-user',
    kind: 'text',
    body: 'Tapu randevusu için yarın 14.00 uygun.',
    attachments: [],
    deliveryState: 'failed',
    sentAt: '2026-07-20T11:45:00.000Z',
  }

  return {
    ...source,
    async listMessages(input, options) {
      const page = await source.listMessages(input, options)
      if (
        input.conversationId !== DEFAULT_CONVERSATION_ID ||
        input.before
      ) {
        return page
      }
      return { ...page, items: [...page.items, failedMessage] }
    },
  }
}

function createAttachmentCapabilitySource(): MessagesDataSource {
  const source = createDefaultSource()
  return {
    ...source,
    capabilities: {
      uploadAttachment: async ({ file }) => ({
        id: `story-upload-${file.name}`,
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        state: 'ready',
      }),
    },
  }
}

function createSafetyCapabilitySource(): MessagesDataSource {
  const fixtures = storyFixtures()
  const source = createMessagesFixtureDataSource(fixtures)
  return {
    ...source,
    capabilities: {
      reportMessage: async () => undefined,
      blockParticipant: async ({ conversationId }) => {
        const conversation = fixtures.conversations.find(
          ({ id }) => id === conversationId,
        )
        if (!conversation) throw new Error('Konuşma bulunamadı.')
        return { ...conversation, status: 'blocked' }
      },
    },
  }
}

function createLongContentSource(): MessagesDataSource {
  const fixtures = storyFixtures()
  const baseConversation = fixtures.conversations.find(
    ({ id }) => id === DEFAULT_CONVERSATION_ID,
  )!
  const longBody =
    'Gayrimenkulün hisseli tapu durumu, imar uygulaması, ulaşım bağlantıları ve randevu seçenekleri hakkında ayrıntılı bilgi rica ediyorum. ' +
    'Bu metin dar görünümde anlam kaybetmeden satırlara ayrılmalı; CokUzunKesintisizTurkceIlanAciklamasiVeReferansNumarasi20260727 de taşmamalıdır.'
  const messages: CanonicalFixtureMessage[] = Array.from(
    { length: 40 },
    (_, index) => ({
      id: `story-long-message-${index + 1}`,
      conversationId: DEFAULT_CONVERSATION_ID,
      sequence: index + 1,
      senderId: index % 2 === 0 ? 'person-ayse' : 'current-user',
      kind: index === 39 ? 'attachment' : 'text',
      body:
        index === 39
          ? longBody
          : `Sabit geçmiş mesajı ${index + 1}: ilan ayrıntıları değerlendiriliyor.`,
      attachments:
        index === 39
          ? [{
              id: 'story-long-attachment',
              name:
                'urla-iskele-tas-ev-detayli-ekspertiz-ve-tapu-inceleme-raporu-2026.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 384_000,
              state: 'ready',
            }]
          : [],
      deliveryState: index % 2 === 0 ? 'delivered' : 'sent',
      sentAt: `2026-07-20T${index < 30 ? '10' : '11'}:${String(index % 30).padStart(2, '0')}:00.000Z`,
    }),
  )

  return createMessagesFixtureDataSource({
    conversations: [{
      ...baseConversation,
      counterpart: {
        ...baseConversation.counterpart,
        displayName: 'Ayşe Nur Kaya Karadeniz',
      },
      listing: {
        ...baseConversation.listing,
        title:
          'Urla İskele’de denize yakın, avlulu, uzun açıklamalı tarihi taş ev ve müştemilat',
        referenceLabel:
          'İlan Referansı TR-IZMIR-URLA-ISKELE-2026-0000000001',
      },
      lastMessage: {
        kind: 'attachment',
        body: longBody,
        sentAt: messages.at(-1)!.sentAt,
        senderId: 'current-user',
      },
    }],
    messages,
  })
}

function IsolatedWorkspace({
  createDataSource,
  storyScope,
  ...props
}: WorkspaceStoryArgs & {
  createDataSource: SourceFactory
  storyScope: string
}) {
  const [environment] = useState(() => ({
    queryClient: freshQueryClient(),
    dataSource: createScopedMessagesDataSource(
      createDataSource(),
      storyScope,
    ),
  }))
  const draftNamespace = storyDraftNamespace(storyScope)
  const [draftStorageReady, setDraftStorageReady] = useState(false)

  useEffect(() => {
    clearStoryDrafts(draftNamespace)
    setDraftStorageReady(true)
    return () => {
      environment.queryClient.clear()
      clearStoryDrafts(draftNamespace)
    }
  }, [draftNamespace, environment])

  if (!draftStorageReady) return null

  return (
    <QueryClientProvider client={environment.queryClient}>
      <MessagesWorkspace
        {...props}
        dataSource={environment.dataSource}
        draftNamespace={draftNamespace}
      />
    </QueryClientProvider>
  )
}

const withMemoryRouter: Decorator = (Story) => {
  const rootRoute = createRootRoute({ component: Outlet })
  const messagesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim/mesajlar',
    component: Story,
  })
  const listingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>İlan keşif rotası</p>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([messagesRoute, listingsRoute]),
    history: createMemoryHistory({
      initialEntries: ['/hesabim/mesajlar'],
    }),
  })

  return <RouterProvider router={router} />
}

const meta = {
  title: 'Sayfalar/Hesabım/Enterprise Mesaj Merkezi',
  component: MessagesWorkspace,
  tags: ['autodocs'],
  decorators: [withMemoryRouter],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Kişi × ilan konuşmalarını, kısmi hata izolasyonunu, optimistic gönderimi ve private-session temizliğini tek master-detail çalışma alanında birleştirir.',
      },
    },
  },
  argTypes: {
    dataSource: { control: false },
    mode: {
      control: 'select',
      options: ['loading', 'ready', 'restricted', 'session-expired'],
    },
    conversationId: { control: 'text' },
    defaultConversationId: { control: 'text' },
    onConversationChange: { control: false },
    connectionState: {
      control: 'select',
      options: ['online', 'reconnecting', 'offline'],
    },
    onOpenListing: { control: false },
  },
} satisfies Meta<typeof MessagesWorkspace>

export default meta
type Story = StoryObj<WorkspaceStoryArgs>

function story(
  createDataSource: SourceFactory,
  args: WorkspaceStoryArgs = {},
  options: Omit<Story, 'args' | 'render'> = {},
): Story {
  const storyScope = nextStoryScope()
  return {
    ...options,
    args,
    render: (workspaceProps) => {
      const scopedProps = scopeWorkspaceProps(workspaceProps, storyScope)
      return (
        <IsolatedWorkspace
          {...scopedProps}
          createDataSource={createDataSource}
          storyScope={storyScope}
        />
      )
    },
  }
}

/** Kağıt temada dolu iki panel ve kişi × ilan bağlamı. */
export const DefaultPaper = story(
  createDefaultSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  { globals: { backgroundKey: 'light' } },
)

/** Grafit tema aynı semantik token ve içerik hiyerarşisini korur. */
export const DefaultGraphite = story(
  createDefaultSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  { globals: { backgroundKey: 'dark' } },
)

/** Okunmamış filtresi, sayaçları renk dışı metinle de ifade eder. */
export const UnreadConversations = story(
  createUnreadSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      const unreadFilter = await canvas.findByRole('radio', {
        name: 'Okunmamış',
      })
      await userEvent.click(unreadFilter)
      await expect(unreadFilter).toHaveAttribute('aria-checked', 'true')
      await canvas.findByText(/okunmamış/)
    },
  },
)

/** Konuşma olmayan hesap gerçek keşif rotasına yönlendirir. */
export const EmptyInbox = story(createEmptySource)

/** Dolu kaynakta eşleşmeyen yerel arama ve temizleme eylemi. */
export const SearchNoResults = story(createDefaultSource, {}, {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = await canvas.findByRole('searchbox', {
      name: 'Konuşmalarda ara',
    })
    await userEvent.type(search, 'eşleşmeyen sabit arama')
    await canvas.findByText('Aramanızla eşleşen konuşma bulunamadı')
  },
})

/** Kişisel veri göstermeyen ve ana landmark'ı busy işaretleyen yükleme modu. */
export const WorkspaceLoading = story(createDefaultSource, {
  mode: 'loading',
})

/** Liste hatası thread içeriği uydurmadan yerel yeniden deneme sunar. */
export const ConversationListError = story(
  createConversationListErrorSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
)

/** Rail çalışırken yalnız aktif thread sorgusu hata verir. */
export const ThreadError = story(
  createThreadErrorSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
)

/** Yeniden bağlanma bildirimi geçmişi ve composer'ı bastırmaz. */
export const Reconnecting = story(createDefaultSource, {
  defaultConversationId: DEFAULT_CONVERSATION_ID,
  connectionState: 'reconnecting',
})

/** Çevrimdışı bildirimi altında conversation-bazlı taslak korunur. */
export const OfflineWithDraft = story(
  createDefaultSource,
  {
    defaultConversationId: DEFAULT_CONVERSATION_ID,
    connectionState: 'offline',
  },
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      const composer = await canvas.findByRole('textbox', { name: 'Mesaj' })
      await userEvent.type(
        composer,
        'Bağlantı gelince gönderilecek sabit taslak',
      )
      await expect(composer).toHaveValue(
        'Bağlantı gelince gönderilecek sabit taslak',
      )
    },
  },
)

/** Başarısız optimistic kayıt metni korur; retry ve kopyalama görünürdür. */
export const FailedMessage = story(
  createFailedMessageSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
)

/** Yalnız entegrasyon capability'si açıkken ek kontrolü ve tarama state'i görünür. */
export const AttachmentCapability = story(
  createAttachmentCapabilitySource,
  { defaultConversationId: 'conversation-izmir-elif' },
  {
    parameters: {
      docs: {
        description: {
          story:
            'Bu story upload entegrasyon sözleşmesini kanıtlar; production fixture ek yükleme capability’si varmış gibi davranmaz.',
        },
      },
    },
  },
)

/** Geçmiş okunabilir; engellenen kişiye composer kapalı ve nedeni metinseldir. */
export const BlockedConversation = story(createDefaultSource, {
  defaultConversationId: 'conversation-urla-deniz',
})

/** Yayından kaldırılmış ilan geçmişi korunur ve yeni gönderim salt-okunurdur. */
export const ListingClosed = story(createDefaultSource, {
  defaultConversationId: 'conversation-izmir-ozge',
})

/** Güvenlik notu ve report/block eylemleri yalnız capability fixture'ında görünür. */
export const SafetyCapability = story(
  createSafetyCapabilitySource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  {
    parameters: {
      docs: {
        description: {
          story:
            'Bu story report/block entegrasyon sözleşmesini gösterir; gerçek adapter sonucu veya risk sınıflandırması uydurmaz.',
        },
      },
    },
  },
)

/** Uzun Türkçe başlık, kesintisiz sözcük, mesaj ve dosya adı sarılır. */
export const LongContent = story(
  createLongContentSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
)

/** 390px container'da seçim yokken yalnız conversation rail görünür. */
export const CompactConversationList = story(createDefaultSource, {}, {
  globals: { viewport: { value: 'mobile390', isRotated: false } },
})

/** 390px container'da seçim varken yalnız aktif thread ve composer görünür. */
export const CompactActiveThread = story(
  createDefaultSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  { globals: { viewport: { value: 'mobile390', isRotated: false } } },
)

/** Reduced-motion emülasyonu scroll ve geçişleri anlıklaştırır. */
export const ReducedMotion = story(
  createDefaultSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  {
    decorators: [withMediaPreference('reduced-motion')],
  },
)

/** Reduced-transparency emülasyonu transient glass yüzeyleri opaklaştırır. */
export const ReducedTransparency = story(
  createDefaultSource,
  { defaultConversationId: DEFAULT_CONVERSATION_ID },
  {
    decorators: [withMediaPreference('reduced-transparency')],
  },
)

/** Süresi dolmuş oturum kişisel rail, thread, cache ve draft'ı bastırır. */
export const SessionExpired = story(createDefaultSource, {
  mode: 'session-expired',
  defaultConversationId: DEFAULT_CONVERSATION_ID,
})

/** Kısıtlı hesapta yalnız erişim açıklaması bulunur; kişisel veri çizilmez. */
export const Restricted = story(createDefaultSource, {
  mode: 'restricted',
  defaultConversationId: DEFAULT_CONVERSATION_ID,
})

/** Klavye seçim/gönderim ve portal drawer Escape/focus dönüşü sözleşmesi. */
export const Accessibility = story(
  createSafetyCapabilitySource,
  {},
  {
    name: 'Accessibility',
    parameters: { a11y: { element: 'main' } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await canvas.findByRole('heading', { level: 1, name: 'Mesajlar' })

      const search = await canvas.findByRole('searchbox', {
        name: 'Konuşmalarda ara',
      })
      ;(canvasElement.ownerDocument.activeElement as HTMLElement | null)?.blur()
      await userEvent.tab()
      await expect(search).toHaveFocus()
      expect(window.getComputedStyle(search).outlineStyle).not.toBe('none')

      const conversationLink = (
        await canvas.findAllByRole('link')
      ).find((link) =>
        link.getAttribute('href')?.includes(DEFAULT_CONVERSATION_ID),
      )
      if (!conversationLink) {
        throw new Error('Deterministic conversation link bulunamadı.')
      }
      await userEvent.tab()
      await expect(
        canvas.getByRole('radio', { name: 'Tümü' }),
      ).toHaveFocus()
      await tabToElement(conversationLink)
      await userEvent.keyboard('{Enter}')
      await expect(conversationLink).toHaveAttribute('aria-current', 'page')

      const composer = await canvas.findByRole('textbox', { name: 'Mesaj' })
      await tabToElement(composer)
      await userEvent.type(composer, 'İlk satır')
      await userEvent.keyboard('{Shift>}{Enter}{/Shift}')
      await userEvent.type(composer, 'İkinci satır')
      await expect(composer).toHaveValue('İlk satır\nİkinci satır')

      const uuid = spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
        '00000000-0000-4000-8000-000000000010',
      )
      try {
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(composer).toHaveValue(''))
        await canvas.findByText(/İlk satır\s+İkinci satır/)
        await canvas.findByText('Gönderildi')
      } finally {
        uuid.mockRestore()
      }

      const drawerTrigger = await canvas.findByRole('button', {
        name: 'Kişiyi engelle',
      })
      await waitFor(() => expect(composer).toHaveFocus())
      await tabToElement(drawerTrigger, 'backward')
      await userEvent.keyboard('{Enter}')
      const body = within(document.body)
      await body.findByRole('dialog', { name: 'Kişiyi engelle' })
      await userEvent.keyboard('{Escape}')
      await waitFor(() => {
        expect(
          body.queryByRole('dialog', { name: 'Kişiyi engelle' }),
        ).not.toBeInTheDocument()
        expect(drawerTrigger).toHaveFocus()
      })

      await expect(
        canvas.getAllByRole('heading', { level: 1 }),
      ).toHaveLength(1)
    },
  },
)
