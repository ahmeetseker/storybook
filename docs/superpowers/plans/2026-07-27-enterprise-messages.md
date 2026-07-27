# Enterprise Mesaj Merkezi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Follow the
> checkbox order and do not batch RED/GREEN checkpoints.

**Goal:** `/hesabim/mesajlar` rotasını placeholder ekranından; kişi × ilan
bağlamlı, iki panelli/compact tek panelli, erişilebilir, sanallaştırılmış ve
optimistic gönderimi dürüstçe yöneten premium mesaj merkezine dönüştürmek.

**Architecture:** Özellik `apps/web/src/features/messages` altında
feature-local kalır. `MessagesWorkspace`, injected `MessagesDataSource` ile
TanStack Query cursor sayfalarını ve mutation cache uzlaştırmasını orkestre
eder. Route yalnız typed `konusma` URL state'ini, loader prefetch'ini ve
navigation history'yi sahiplenir. Saf domain helper'ları optimistic kimlik,
dedupe, monoton delivery ve canonical sıralamayı React'ten bağımsız çözer.
Gerçek WebSocket/backend bu teslimatta yazılmaz; capability ve transport
portları hazır olur, fixture adapter sahte presence/read/risk üretmez.

**Tech Stack:** React 19, TypeScript 6, TanStack Router, TanStack Query,
`@tanstack/react-virtual` 3.14.8, CSS Modules, `@repo/ui`, Vitest, Testing
Library, Storybook 10, Playwright ve Axe.

**Tasarım spesifikasyonu:**
`docs/superpowers/specs/2026-07-27-enterprise-messages-design.md`

**Araştırma/denetim:**
`.superpowers/sdd/2026-07-27-messages-planning/`

## Global Constraints

- Görünür ürün dili Türkçe, kod tanımlayıcıları İngilizce olacaktır.
- Conversation kimliği kişi × ilan'dır; aynı kişi/farklı ilan birleşmez.
- `main#main-content` ve `h1` sayısı tam olarak bir olacaktır.
- Global `MarketplaceShell`, Header ve Dock korunacak; yerel AccountShell,
  ikinci sidebar veya ikinci Dock eklenmeyecektir.
- Kalıcı rail, thread, listing context ve composer flat olacaktır. Feature
  içinde kalıcı glass content yüzeyi oluşturulmayacaktır.
- Feature CSS'i yalnız `--lg-*` tokenlarını tüketecek; raw `px`, hex, rgb/hsl,
  gradient, özel shadow ve `!important` kullanılmayacaktır.
- Radius yalnız `--lg-radius-chip`, `--lg-radius-media`,
  `--lg-radius-card`, `--lg-radius-capsule` tokenlarından gelecektir.
- Runtime virtualizer'ın ölçtüğü `height` ve `translateY` CSS pixel değerleri
  tasarım geometrisi değildir; yalnız inline runtime measurement olarak
  kullanılabilir ve `rules.md`te açıklanmalıdır.
- Responsive düzen container query; touch/hover davranışı capability query ile
  kurulacaktır. Public prop/API cihaz adı veya breakpoint taşımayacaktır.
- Coarse pointer kritik hedefleri en az `--lg-control-md` olacaktır.
- Focus yalnız `:focus-visible` ve ortak focus tokenlarıyla gösterilecektir.
- `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenmelidir.
- Conversation rail `nav > ul > li`; aktif link `aria-current` kullanacaktır.
  İçinde menu olduğu için `listbox/option` kullanılmayacaktır.
- Timeline accessible name taşıyan `role="log"` olacaktır. Prepend edilen eski
  geçmiş yeni mesaj gibi topluca duyurulmayacaktır.
- Optimistic state tek adla `pending` olacaktır. `queued`, `sending` veya
  `local-pending` paralel enum olarak eklenmeyecektir.
- Retry ilk gönderimde üretilen aynı `clientMessageId` değerini kullanacaktır.
- Backend desteklemiyorsa delivered/read, typing, presence, attachment scan,
  report/block sonucu veya risk sınıflandırması uydurulmayacaktır.
- HTTP/fixture adapter canonical kaynaktır. Feature kendi WebSocket'ini açmaz.
- Tam mesaj geçmişi localStorage/IndexedDB'ye yazılmaz. Yalnız text draft
  sessionStorage'da conversation bazlı tutulur.
- Session expired, restricted veya logout halinde message query cache, memory
  state, object URL ve session draft'ları temizlenir.
- Message body, attachment adı, telefon, e-posta ve serbest search metni URL,
  telemetry, log veya breadcrumb'a yazılmaz.
- `dangerouslySetInnerHTML` kullanılmaz.
- Yeni shared `GlassX` çıkarılmayacaktır. Gerekirse önce eksik primitive
  kanıtlanmalı; o durumda tam component klasör sözleşmesi ayrı iş olur.
- `src/pages/Mesajlar*` ve `src/components/GlassChatDock/**` değişmeyecektir.
- `src/index.ts` ve `src/demo/ComponentCatalog.tsx` değişmeyecektir.
- `apps/web/src/routeTree.gen.ts` elle düzenlenmeyecektir.
- Kullanıcının mevcut ve ilgisiz dirty-worktree değişiklikleri korunacaktır.
- `.git` bu ortamda salt okunur olduğundan commit denenmeyecektir.

## File Map

### Create

- `apps/web/src/features/messages/domain/message-types.ts`
- `apps/web/src/features/messages/domain/message-route-search.ts`
- `apps/web/src/features/messages/domain/message-route-search.test.ts`
- `apps/web/src/features/messages/domain/message-reconciliation.ts`
- `apps/web/src/features/messages/domain/message-reconciliation.test.ts`
- `apps/web/src/features/messages/data/message-fixtures.ts`
- `apps/web/src/features/messages/data/messages-adapter.ts`
- `apps/web/src/features/messages/data/messages-adapter.test.ts`
- `apps/web/src/features/messages/data/messages-query.ts`
- `apps/web/src/features/messages/data/messages-query.test.ts`
- `apps/web/src/features/messages/data/message-draft-storage.ts`
- `apps/web/src/features/messages/data/message-draft-storage.test.ts`
- `apps/web/src/features/messages/components/ConversationRail.tsx`
- `apps/web/src/features/messages/components/MessageComposer.tsx`
- `apps/web/src/features/messages/components/MessageTimeline.tsx`
- `apps/web/src/features/messages/components/MessageTimeline.test.tsx`
- `apps/web/src/features/messages/components/MessageThread.tsx`
- `apps/web/src/features/messages/components/MessageDrawers.tsx`
- `apps/web/src/features/messages/components/MessagesPanels.test.tsx`
- `apps/web/src/features/messages/MessagesWorkspace.tsx`
- `apps/web/src/features/messages/MessagesWorkspace.module.css`
- `apps/web/src/features/messages/MessagesPanels.module.css`
- `apps/web/src/features/messages/MessagesWorkspace.test.tsx`
- `apps/web/src/features/messages/MessagesWorkspace.stories.tsx`
- `apps/web/src/features/messages/rules.md`
- `apps/web/src/features/messages/index.ts`
- `apps/web/src/routes/hesabim_.mesajlar.test.tsx`
- `apps/web/e2e/messages.spec.ts`

### Modify

- `apps/web/src/routes/hesabim_.mesajlar.tsx`
- `apps/web/package.json`
- `package-lock.json`

### Explicitly do not modify

- `src/pages/Mesajlar.tsx`
- `src/pages/Mesajlar.stories.tsx`
- `src/components/GlassChatDock/**`
- `apps/web/src/components/MarketplaceShell.tsx`
- `apps/web/src/config/routes.ts`
- `apps/web/src/routeTree.gen.ts`
- `src/index.ts`
- `src/demo/ComponentCatalog.tsx`

## Public Contracts

`message-types.ts` minimum public contract:

```ts
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
export type MessagesConnectionState =
  | 'online'
  | 'reconnecting'
  | 'offline'
export type MessagesWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'restricted'
  | 'session-expired'

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

export interface MessagesWorkspaceProps {
  dataSource: MessagesDataSource
  mode?: MessagesWorkspaceMode
  conversationId?: string
  defaultConversationId?: string
  onConversationChange?: (conversationId?: string) => void
  connectionState?: MessagesConnectionState
  onOpenListing?: (listingId: string) => void
}
```

`MessagesDataSource` minimum port:

```ts
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
```

Optional capabilities:

```ts
export interface MessagesIntegrationCapabilities {
  uploadAttachment?: UploadAttachmentOperation
  markConversationUnread?: MarkConversationUnreadOperation
  reportMessage?: ReportMessageOperation
  blockParticipant?: BlockParticipantOperation
  deliveryReceipts?: boolean
  readReceipts?: boolean
}
```

Production route yalnız fonksiyon/capability mevcutsa ilgili action'ı gösterir.

---

### Task 1: Domain sözleşmesi ve canonical route search

**Files:**

- Create: `apps/web/src/features/messages/domain/message-types.ts`
- Create: `apps/web/src/features/messages/domain/message-route-search.ts`
- Create: `apps/web/src/features/messages/domain/message-route-search.test.ts`

**Produces:**

- Yukarıdaki public types.
- `MessagesRouteState`
- `parseMessagesRouteSearch(raw)`
- `serializeMessagesRouteSearch(state)`
- `isOpaqueConversationId(value)`

- [ ] **Step 1: Route search için başarısız testleri yaz**

`message-route-search.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  parseMessagesRouteSearch,
  serializeMessagesRouteSearch,
} from './message-route-search'

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

  it('serializes only konusma and never PII fields', () => {
    expect(
      serializeMessagesRouteSearch({ conversationId: 'conv_urla_001' }),
    ).toEqual({ konusma: 'conv_urla_001' })
  })
})
```

- [ ] **Step 2: RED durumunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/domain/message-route-search.test.ts
```

Expected: FAIL; modüller henüz yok.

- [ ] **Step 3: Tipleri ve minimum canonical parser'ı uygula**

Opaque ID allowlist'i yalnız harf, sayı, `_` ve `-` kabul etsin; uzunluğu
mantıklı bir üst sınırla sınırlansın. Parser unknown field'ları sessizce atsın.
Search query, kişi adı veya listing adı serializer tipine hiç girmesin.

- [ ] **Step 4: Domain route testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/domain/message-route-search.test.ts
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: PASS.

---

### Task 2: Cursor adapter, fixture ve query key'leri

**Files:**

- Create: `apps/web/src/features/messages/data/message-fixtures.ts`
- Create: `apps/web/src/features/messages/data/messages-adapter.ts`
- Create: `apps/web/src/features/messages/data/messages-adapter.test.ts`
- Create: `apps/web/src/features/messages/data/messages-query.ts`
- Create: `apps/web/src/features/messages/data/messages-query.test.ts`

**Produces:**

- `createMessagesFixtureDataSource(fixtures?)`
- `MESSAGE_FIXTURES`
- `messagesQueryKeys`
- `conversationInfiniteQueryOptions(dataSource, input)`
- `threadInfiniteQueryOptions(dataSource, conversationId)`
- `flattenConversationPages(data)`
- `flattenMessagePages(data)`

- [ ] **Step 1: Adapter için başarısız testleri yaz**

En az şu vakaları test et:

```ts
it('keeps the same counterpart on two listings as two conversations', async () => {
  const page = await source.listConversations({
    filter: 'all',
    query: '',
    limit: 20,
  })

  const ayseRows = page.items.filter(
    ({ counterpart }) => counterpart.id === 'person-ayse',
  )
  expect(new Set(ayseRows.map(({ listing }) => listing.id)).size).toBe(2)
})

it('returns opaque cursor pages without exposing offsets', async () => {
  const first = await source.listConversations({
    filter: 'all',
    query: '',
    limit: 2,
  })
  const second = await source.listConversations({
    filter: 'all',
    query: '',
    cursor: first.nextCursor,
    limit: 2,
  })

  expect(first.items).toHaveLength(2)
  expect(second.items.map(({ id }) => id)).not.toEqual(
    first.items.map(({ id }) => id),
  )
  expect(first.nextCursor).toMatch(/^cursor_/)
})
```

Ayrıca:

- `unread` yalnız unread conversation döndürür.
- `archived` yalnız archived döndürür.
- Türkçe query kişi, ilan, semt ve ilan numarası eşleşir.
- conversation sırası `lastUserActivityAt` azalan, eşitlikte ID artandır.
- `listMessages` yalnız istenen conversation'ı döndürür.
- `before` eski sayfayı döndürür.
- abort edilmiş signal `AbortError` üretir.
- fixture `sendMessage` en fazla `sent` döndürür; delivered/read uydurmaz.
- fixture adapter module-level mutable history tutmaz; her factory instance'ı
  kendi snapshot'ını taşır.
- capability'siz adapter report/block/scan action'ı sunmaz.

- [ ] **Step 2: Adapter testinin RED olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/data/messages-adapter.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Deterministik fixture ve instance-local adapter'ı uygula**

Fixture:

- İzmir/Urla ağırlıklı en az 12 conversation.
- Aynı kişi için iki ayrı listing conversation.
- unread, archived, blocked, listing-closed.
- text, system, safety ve mevcut attachment mesaj örnekleri.
- tarihleri sabit ISO değerleri.
- resimler mevcut repo asset/URL sözleşmesinden.
- randomness ve gerçek timer yok.

Her `createMessagesFixtureDataSource()` çağrısı closure içinde kendi immutable
snapshot'ını taşır. Mutation, module global array'i mutate etmek yerine
snapshot'ı yeni değerle değiştirir; sonraki `listConversations` ve
`listMessages` refetch'i send/archive/read sonucunu korur. Her test, story,
loader çağrısı ve route component lifecycle'ı fresh instance alır; SSR
request'leri arasında state paylaşılmaz.

`sendMessage`, verilen `clientMessageId` ile deterministic canonical `id` ve
`sequence` döndürür. Adapter testine send/archive/read sonrası invalidate +
refetch sonucunun kaybolmadığı vakaları ekle. Query cache optimistic
uzlaştırması Task 8'de ayrıca yapılır.

- [ ] **Step 4: Adapter testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/data/messages-adapter.test.ts
```

Expected: PASS.

- [ ] **Step 5: Query key/cursor yönü için başarısız testleri yaz**

Testler:

- aynı normalize filter/query aynı key;
- farklı filter/query farklı key;
- conversation `getNextPageParam` `nextCursor` kullanır;
- thread eski geçmiş için `getPreviousPageParam` veya planlanan tek yönlü
  prepend cursor'u kullanır;
- flatten message pages chronological sırayı korur;
- query function `AbortSignal`ı adapter'a aktarır;
- `maxPages` sınırlıdır.

- [ ] **Step 6: Query options'ı minimum kodla uygula ve yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/data/messages-query.test.ts
npx vitest run apps/web/src/features/messages/data
```

Expected: PASS.

---

### Task 3: Optimistic reconciliation state machine

**Files:**

- Create: `apps/web/src/features/messages/domain/message-reconciliation.ts`
- Create: `apps/web/src/features/messages/domain/message-reconciliation.test.ts`

**Produces:**

- `createPendingMessage(input)`
- `acknowledgeMessage(messages, ack)`
- `failPendingMessage(messages, clientMessageId, reason)`
- `retryFailedMessage(messages, clientMessageId)`
- `mergeIncomingMessage(messages, incoming)`
- `applyDeliveryState(messages, event)`
- `sortCanonicalMessages(messages)`
- `updateConversationPreview(conversations, message)`
- `getMessageRenderKey(message)`

- [ ] **Step 1: State machine için başarısız testleri yaz**

Zorunlu vakalar:

```ts
it('reconciles an ack in place without creating a duplicate', () => {
  const pending = createPendingMessage({
    conversationId: 'conv_1',
    clientMessageId: 'client_1',
    senderId: 'me',
    body: 'Merhaba',
    sentAt: '2026-07-27T10:00:00.000Z',
  })

  const result = acknowledgeMessage([pending], {
    ...pending,
    id: 'message_91',
    sequence: 91,
    deliveryState: 'sent',
  })

  expect(result).toHaveLength(1)
  expect(result[0]).toMatchObject({
    id: 'message_91',
    clientMessageId: 'client_1',
    sequence: 91,
    deliveryState: 'sent',
  })
})

it('keeps text and client id after failure and retry', () => {
  const failed = failPendingMessage(
    [makePending('client_1', 'Kaybolmaması gereken mesaj')],
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
```

Ayrıca:

- duplicate ack no-op;
- ack ve realtime `message.created` aynı item;
- pending ve ack sonrası `getMessageRenderKey` aynı
  `clientMessageId ?? id` değerini korur;
- server `sequence` istemci timestamp'inden üstündür;
- eski `sent` event, `delivered/read` state'i geriye götürmez;
- capability yoksa delivered/read uygulanmaz;
- incoming system event conversation sırasını kullanıcı mesajı gibi öne
  taşımayıp product rule'u korur;
- conversation preview optimistic/failure state'i doğru açıklar.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/domain/message-reconciliation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Saf helper'ları minimum kodla uygula**

Helper'lar React, QueryClient, WebSocket, DOM veya storage import etmez.
Delivery rank tek constant map'ten gelir. Bütün array update'leri immutable
olur.

- [ ] **Step 4: Domain testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/domain
```

Expected: PASS.

---

### Task 4: Conversation draft storage ve özel veri temizliği

**Files:**

- Create: `apps/web/src/features/messages/data/message-draft-storage.ts`
- Create: `apps/web/src/features/messages/data/message-draft-storage.test.ts`

**Produces:**

- `createMessageDraftStorage(storage, namespace)`
- `loadDraft(conversationId)`
- `saveDraft(conversationId, text)`
- `removeDraft(conversationId)`
- `clearAllDrafts()`

- [ ] **Step 1: Storage için başarısız testleri yaz**

Testler:

- iki conversation draft'ı birbirinden izole;
- blank text key'i kaldırır;
- malformed JSON güvenli empty döndürür;
- `SecurityError`/quota exception UI'ı çökertmez;
- `clearAllDrafts` yalnız kendi namespace'ini temizler;
- attachment blob, message history ve participant bilgisi persist edilmez.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/data/message-draft-storage.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Minimum session storage wrapper'ını uygula**

Storage dependency injection kullan; modül doğrudan global
`window.sessionStorage`a bağlanmasın. Workspace route browser storage'ı,
testler memory fake'i versin.

- [ ] **Step 4: Testi yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/data/message-draft-storage.test.ts
```

Expected: PASS.

---

### Task 5: Message composer ve capability-gated attachment staging

**Files:**

- Create: `apps/web/src/features/messages/components/MessageComposer.tsx`
- Create: `apps/web/src/features/messages/components/MessagesPanels.test.tsx`

**Interface:**

```ts
interface MessageComposerProps {
  value: string
  onValueChange: (value: string) => void
  onSend: (input: ComposerSubmission) => void
  disabled?: boolean
  disabledReason?: string
  attachmentCapability?: UploadAttachmentOperation
  maxLength: number
}
```

- [ ] **Step 1: Composer davranış testlerini yaz**

`MessagesPanels.test.tsx` içinde:

- boş/whitespace submit olmaz;
- Enter submit;
- Shift+Enter satır açar;
- `compositionStart` → Enter submit etmez → `compositionEnd`;
- send sonrası focus textarea'da kalır;
- disabled reason görünür ve textarea ile ilişkilidir;
- blocked/read-only composer action üretmez;
- capability yoksa attachment control render edilmez;
- capability varsa JPEG/PNG/WebP/PDF staging gösterilir;
- reddedilen tür/limit ilgili attachment row'da hata gösterir;
- object URL remove, successful send ve unmount'ta revoke edilir;
- attachment base64'e çevrilmez.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/components/MessagesPanels.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Composer'ı minimum kodla uygula**

Mevcut `GlassTextarea`, `GlassIconButton`, `GlassButton`,
`GlassFileUpload`/native file input sözleşmelerinden uygun olanı yeniden
kullan. İkon-tek attachment action'ına Türkçe accessible name ver. Auto-grow
yalnız ölçüm/height değiştirir; dekoratif animation ekleme.

Attachment state adapter'dan gelmedikçe “tarandı/güvenli” demez; local client
kontrolü yalnız “Gönderime hazır” olarak adlandırılır.

- [ ] **Step 4: Composer testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/components/MessagesPanels.test.tsx
```

Expected: composer vakaları PASS.

---

### Task 6: Virtualized message timeline ve scroll contract

**Files:**

- Modify: `apps/web/package.json`
- Modify: `package-lock.json`
- Create: `apps/web/src/features/messages/components/MessageTimeline.tsx`
- Create: `apps/web/src/features/messages/components/MessageTimeline.test.tsx`

- [ ] **Step 1: Tek yeni bağımlılığı exact sürümle ekle**

Run:

```bash
npm install @tanstack/react-virtual@3.14.8 --workspace @arsam/web --save-exact
```

Expected:

- yalnız `apps/web/package.json` ve `package-lock.json` dependency diff'i;
- React sürümü veya başka package upgrade'i yok.

- [ ] **Step 2: Timeline için başarısız testleri yaz**

Testler:

- accessible name'li `role="log"`;
- sender'ın görünmez metinsel etiketi;
- incoming/outgoing yalnız renkle ayrılmaz;
- day separator semantic text;
- system/safety flat row;
- yalnız son outgoing grup delivery state'i;
- failed message “Gönderilemedi”, “Tekrar dene”, “Kopyala”;
- older-page prepend live region'a geçmişi duyurmaz;
- kullanıcı dipteyken append follow eder;
- kullanıcı geçmişteyken append scroll'u değiştirmez;
- “N yeni mesaj” button'u latest'e gider;
- “Daha eski mesajları yükle” accessible fallback;
- stabil `clientMessageId ?? message.id` key;
- selected/focused content virtual window dışında kontrolsüz kaybolmaz.

JSDOM ölçümleri için test helper'da deterministic `ResizeObserver`,
`getBoundingClientRect` ve scroll container ölçüsü sağla; production logic'i
test uğruna environment branch'iyle kirletme.

- [ ] **Step 3: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/components/MessageTimeline.test.tsx
```

Expected: FAIL.

- [ ] **Step 4: Timeline'ı minimum kodla uygula**

`useVirtualizer` seçenekleri:

```ts
useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: estimateMessageRow,
  getItemKey: (index) => rows[index].key, // clientMessageId ?? message.id
  anchorTo: 'end',
  followOnAppend: true,
  overscan: 6,
  useFlushSync: false,
})
```

Dynamic message rows `measureElement` kullanır. `followOnAppend`, yalnız
virtualizer'ın dipte olma sözleşmesini takip eder. Smooth scroll
`prefers-reduced-motion` altında kullanılmaz.

- [ ] **Step 5: Timeline testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/components/MessageTimeline.test.tsx
npx vitest run apps/web/src/features/messages/components
```

Expected: PASS.

---

### Task 7: Conversation rail, thread header ve controlled overlays

**Files:**

- Create: `apps/web/src/features/messages/components/ConversationRail.tsx`
- Create: `apps/web/src/features/messages/components/MessageThread.tsx`
- Create: `apps/web/src/features/messages/components/MessageDrawers.tsx`
- Modify: `apps/web/src/features/messages/components/MessagesPanels.test.tsx`

**Interfaces:**

```ts
interface ConversationRailProps {
  conversations: ConversationSummary[]
  totalCount: number
  filter: ConversationFilter
  query: string
  activeConversationId?: string
  hasNextPage: boolean
  loadingMore: boolean
  onFilterChange: (filter: ConversationFilter) => void
  onQueryChange: (query: string) => void
  onConversationChange: (id: string) => void
  onLoadMore: () => void
}

type MessageOverlayState =
  | { kind: 'listing'; conversationId: string }
  | { kind: 'report'; conversationId: string; messageId: string }
  | { kind: 'block'; conversationId: string; participantId: string }
  | undefined
```

- [ ] **Step 1: Rail/thread/overlay için başarısız testleri ekle**

Rail:

- `nav` accessible name;
- `ul/li`, `aria-setsize`, `aria-posinset`;
- `listbox/option` yok;
- active link `aria-current`;
- unread weight + dot/count + screen reader text;
- kişi/ilan/preview/time görünür;
- search status result count;
- Tümü/Okunmamış/Arşiv controlled;
- load-more button;
- focus row arşivlenirse sıradaki row veya rail heading'e focus.

Thread:

- participant + listing context;
- “İlana git” yalnız callback varsa;
- no selection desktop;
- loading/error local;
- listing-closed read-only açıklama;
- archived read-only veya documented policy;
- blocked geçmiş görünür, composer disabled.

Overlay:

- listing drawer mevcut `GlassDrawer`;
- report yalnız capability varsa ve belirli mesajı gösterir;
- block report'tan ayrı action;
- Escape/focus return shared primitive sözleşmesi;
- callback başarısızsa overlay içi error, thread korunur.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/components/MessagesPanels.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Conversation rail'i virtualized uygula**

Row private renderer olarak `ConversationRail.tsx` içinde kalsın; ayrı
`ConversationRow.tsx` oluşturma. Sabit estimate runtime constant olabilir;
görsel spacing/radius CSS tokenlarından gelir.

Rail scroll restoration API'si snapshot/offset'i workspace'e bildirir.
Search/filter değişiminde eski fetch iptal edilir, mevcut cached rows
gereksizce silinmez.

- [ ] **Step 4: Thread ve tek overlay switch'ini uygula**

`MessageThread` header + timeline + composer orkestrasyonudur. Bubble ve safety
notice private timeline renderer olarak kalır. `MessageDrawers` üç ayrı portal
yazmaz; discriminated union ile mevcut overlay primitive'ini compose eder.

- [ ] **Step 5: Panel testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/components
```

Expected: PASS.

---

### Task 8: Workspace query/mutation orkestrasyonu ve responsive CSS

**Files:**

- Create: `apps/web/src/features/messages/MessagesWorkspace.tsx`
- Create: `apps/web/src/features/messages/MessagesWorkspace.module.css`
- Create: `apps/web/src/features/messages/MessagesPanels.module.css`
- Create: `apps/web/src/features/messages/MessagesWorkspace.test.tsx`

- [ ] **Step 1: Workspace için başarısız entegrasyon testlerini yaz**

Memory Router + fresh QueryClient + injected data source wrapper kullan.

Zorunlu testler:

- tek `main#main-content`, tek h1;
- kalıcı local glass content surface sayısı 0;
- controlled `conversationId` callback olmadan iç state'e kopyalanmaz;
- uncontrolled story `defaultConversationId` ile başlar;
- filter/search query key'i değiştirir;
- conversation list error thread uydurmaz;
- thread error sağlıklı rail'i gizlemez;
- empty inbox ile search no-result farklı copy/action taşır;
- `session-expired > restricted > loading > ready` önceliği;
- session/restricted private name/listing/message render etmez;
- session-expired ve restricted önce
  `queryClient.cancelQueries({ queryKey: messagesQueryKeys.all })`, sonra
  `queryClient.removeQueries({ queryKey: messagesQueryKeys.all })` ve
  `clearAllDrafts` çağırır;
- access cleanup idempotenttir; realtime unsubscribe, pending request cancel
  ve bütün attachment object URL revoke işlemlerini kapsar;
- connection online banner yok;
- reconnecting/offline tek sakin status;
- optimistic send cache'e pending ekler;
- deferred send adapter pending ara durumunu deterministik gösterir;
- ack pending item'ı çoğaltmadan sent yapar;
- failure item'ı yerinde tutar;
- retry aynı client ID;
- conversation preview aynı mutation sınırında güncellenir;
- capability yokken attachment/report/block/read receipt UI yok;
- read yalnız visible active unread boundary koşulunda adapter'a gider;
- injected realtime source ile kullanıcı geçmişteyken incoming event scroll'u
  değiştirmez ve “N yeni mesaj” status/action üretir;
- composer draft conversation değişiminde korunur;
- heading sırası ve accessible names;
- CSS raw px/hex/gradient/shadow içermez;
- compact frame Dock + safe-area alt rezervine sahiptir;
- reduced motion/transparency kuralları vardır.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/features/messages/MessagesWorkspace.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Workspace state ve query orkestrasyonunu uygula**

State sahipliği:

- route: controlled conversation ID;
- workspace: filter, search, overlay, local connection presentation;
- TanStack Query: conversation/thread pages;
- mutation cache: pending/ack/failure;
- session storage: yalnız draft;
- realtime: opsiyonel adapter subscription, ikinci store yok.

`useInfiniteQuery` conversation ve active thread için kullanılır. Private mode
hazır değilken query `enabled: false` olur. Realtime source yoksa no-op socket
ve timer oluşturulmaz.

- [ ] **Step 4: CSS'i token tabanlı uygula**

`MessagesWorkspace.module.css`:

- page/container sahipliği;
- desktop rail + thread structural grid;
- compact master-detail;
- main/Dock safe area;
- loading/access state;
- reduced motion/transparency.

`MessagesPanels.module.css`:

- rail row;
- thread header;
- timeline/message/system/safety;
- composer/attachment;
- drawer content.

Content yüzeylerinde blur/gradient/geniş shadow yoktur. Seçim focus yerine
geçmez.

- [ ] **Step 5: Workspace testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/messages/MessagesWorkspace.test.tsx
npx vitest run apps/web/src/features/messages
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: PASS.

---

### Task 9: Route binding, loader prefetch ve browser history

**Files:**

- Modify: `apps/web/src/routes/hesabim_.mesajlar.tsx`
- Create: `apps/web/src/routes/hesabim_.mesajlar.test.tsx`
- Create: `apps/web/src/features/messages/index.ts`

- [ ] **Step 1: Route için başarısız testleri yaz**

Testler:

- `validateSearch` yalnız canonical `konusma`;
- loader ilk conversation page'i prefetch eder;
- valid `konusma` varsa thread son page'i prefetch eder;
- list veya thread prefetch rejection'ı route error boundary'ye düşmez;
- list rejection yalnız rail error, thread rejection yalnız thread error olur;
- invalid ID ilk conversation'a sessiz remap edilmez;
- placeholder copy yok;
- “Mesajlar” h1 ve workspace var;
- selection URL'ye push edilir;
- compact Back param'ı kaldırır;
- noindex/nofollow canonical head aynen korunur.

- [ ] **Step 2: RED'i doğrula**

Run:

```bash
npx vitest run apps/web/src/routes/hesabim_.mesajlar.test.tsx
```

Expected: FAIL; route hâlâ `RoutePlaceholder`.

- [ ] **Step 3: Feature index ve route'u uygula**

Route şekli:

```ts
export const Route = createFileRoute('/hesabim_/mesajlar')({
  validateSearch: (raw) =>
    serializeMessagesRouteSearch(
      parseMessagesRouteSearch(raw as Record<string, unknown>),
    ),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    // Cache warming only: start list/thread prefetch independently and
    // contain each rejection so render-time queries own local error states.
  },
  head: () => createPageHead('messages'),
  component: MessagesRoutePage,
})
```

Loader her invocation'da fresh read snapshot source oluşturur.
`MessagesRoutePage`, `useState(() => createMessagesFixtureDataSource())` veya
eşdeğer lifecycle-safe factory ile kendi instance'ını bir kez oluşturur.
Source module singleton değildir; component instance'ı mutation/refetch
state'ini kendi closure'ında korur. Loader ve client aynı query keys'i
kullanır.

Loader `ensureInfiniteQueryData` rejection'ıyla route'u düşürmez. Liste ve
selected thread için bağımsız `prefetchInfiniteQuery` çağrıları kullanır veya
her rejection'ı ayrı yakalar; render-time queries local error surface'i
sahiplenir.

`onConversationChange` aynı ID için no-op; seçim push, Back doğal browser
history kullanır.

- [ ] **Step 4: Route testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/routes/hesabim_.mesajlar.test.tsx
npx vitest run apps/web/src/features/messages
```

Expected: PASS.

- [ ] **Step 5: Route tree kapsamını denetle**

Run:

```bash
git status --short apps/web/src/routeTree.gen.ts apps/web/src/routes/hesabim_.mesajlar.tsx
```

Expected: route path değişmediği için `routeTree.gen.ts` istemsiz diff
üretmemeli. Generated dosya elle düzeltilmez.

---

### Task 10: Storybook matrisi ve feature rules

**Files:**

- Create: `apps/web/src/features/messages/MessagesWorkspace.stories.tsx`
- Create: `apps/web/src/features/messages/rules.md`

- [ ] **Step 1: QueryClient ve memory-router decorator'ı kur**

Her story fresh QueryClient ve deterministic data source kullanır; story'ler
arası cache sızmaz. Timeout, random ID ve gerçek network yoktur.

- [ ] **Step 2: Zorunlu story matrisini ekle**

Story title:

```ts
title: 'Sayfalar/Hesabım/Enterprise Mesaj Merkezi'
```

Story'ler:

1. `DefaultPaper`
2. `DefaultGraphite`
3. `UnreadConversations`
4. `EmptyInbox`
5. `SearchNoResults`
6. `WorkspaceLoading`
7. `ConversationListError`
8. `ThreadError`
9. `Reconnecting`
10. `OfflineWithDraft`
11. `FailedMessage`
12. `AttachmentCapability`
13. `BlockedConversation`
14. `ListingClosed`
15. `SafetyCapability`
16. `LongContent`
17. `CompactConversationList`
18. `CompactActiveThread`
19. `ReducedMotion`
20. `ReducedTransparency`
21. `SessionExpired`
22. `Restricted`
23. `Accessibility`

Capability story'leri gerçek production adapter'da action varmış izlenimi
vermez; story açıklaması bunun entegrasyon sözleşmesi olduğunu söyler.

- [ ] **Step 3: Interaction story ekle**

`Accessibility.play`:

- search'e Tab;
- conversation linkini Enter ile aç;
- composer'a ulaş;
- Shift+Enter yeni satır;
- Enter send;
- overflow menu/drawer Escape;
- trigger focus return;
- tek h1 ve visible outline.

- [ ] **Step 4: `rules.md`yi eksiksiz yaz**

Başlıklar:

- amaç/anti-amaç;
- anatomy;
- public props;
- controlled/uncontrolled selection;
- data/capability/realtime sınırı;
- state priority;
- optimistic state diagram;
- pagination/virtualization/scroll;
- session/privacy cleanup;
- a11y/keyboard/live regions;
- motion/responsive;
- glass/token bütçesi;
- Storybook matrisi;
- test kabul listesi;
- runtime measurement istisnası.

- [ ] **Step 5: Storybook build'i doğrula**

Run:

```bash
npm run build:storybook
```

Expected: PASS; story import/type hatası yok.

---

### Task 11: Gerçek route E2E, visual ve erişilebilirlik

**Files:**

- Create: `apps/web/e2e/messages.spec.ts`
- Generated by Playwright:
  `apps/web/e2e/messages.spec.ts-snapshots/*`

- [ ] **Step 1: E2E testlerini önce yaz**

Test 1 — desktop:

- `/hesabim/mesajlar`;
- hydrated shell;
- h1;
- Axe serious/critical = 0;
- local persistent glass = 0;
- conversation seçimi URL'de `konusma`;
- listing context;
- gönderim sonrası final `sent` sonucu;
- yatay overflow yok;
- desktop screenshot.

Test 2 — compact:

- 390 × 844;
- başlangıçta yalnız rail;
- conversation açınca yalnız thread;
- browser Back rail'e döner;
- rail scroll/search/filter state'i korunur;
- composer ve focused action Dock tarafından örtülmez;
- list/thread screenshots.

Test 3 — scroll contract:

- uzun thread fixture;
- ilk görünür message ID ve bounding box kaydet;
- older page yükle;
- aynı message'ın ekran pozisyonu tolerans içinde kalır;
- jump-to-latest mevcut kontrolüyle latest'e dön.

Incoming-not-at-bottom ve pending ara durumu gerçek route'a gizli test flag'i
veya timer eklenmeden deterministik tetiklenemez. Bunlar injected deferred data
source kullanan `MessageTimeline.test.tsx` ve `MessagesWorkspace.test.tsx`
kapısında kalır.

Test 4 — preferences:

- reduced motion'da feature transition duration `0s`;
- 320px overflow yok;
- %200 zoom işlev kaybetmez.

Reduced transparency, Chromium'da standart Playwright media emulation seam'i
olmadığı sürece `MessagesWorkspace.test.tsx` CSS contract testiyle doğrulanır.
Session-expired/restricted private-content suppression da injected mode'lu
workspace testinde kalır; production URL'ye test flag'i eklenmez.

- [ ] **Step 2: İlk E2E RED'ini doğrula**

Run:

```bash
npx playwright test apps/web/e2e/messages.spec.ts
```

Expected: yeni snapshot/eksik behavior nedeniyle FAIL.

- [ ] **Step 3: Yalnız gerçek davranış hatalarını düzelt**

Snapshot eksikliğini behavior fix'i gibi ele alma. Önce Axe, overflow, focus,
scroll ve state assertion'ları geçsin.

- [ ] **Step 4: Snapshot'ları Playwright ile üret**

Run:

```bash
npx playwright test apps/web/e2e/messages.spec.ts --update-snapshots=all
npx playwright test apps/web/e2e/messages.spec.ts
```

Expected: ikinci run PASS.

- [ ] **Step 5: Gerçek ekran okuyucu smoke checklist**

Manuel doğrulama kaydını `rules.md` kabul bölümüne ekle:

- VoiceOver veya NVDA ile rail okuma sırası;
- selected/focus ayrımı;
- timeline prepend geçmişi yeniden okumuyor;
- yeni inbound bir kez polite duyuruluyor;
- “N yeni mesaj” çalışıyor;
- drawer focus return.

Otomatik test manuel smoke'un yerine geçtiğini iddia etmez.

---

### Task 12: Tam doğrulama ve kapsam denetimi

- [ ] **Step 1: Hedef testler**

Run:

```bash
npx vitest run \
  apps/web/src/features/messages \
  apps/web/src/routes/hesabim_.mesajlar.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Tam test/type/lint/build**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: PASS. Mevcut ilgisiz baseline failure varsa yeni değişiklikten
ayrıştır, komut/çıktıyı açıkça raporla; kapsam dışı dosyayı düzeltme.

- [ ] **Step 3: E2E**

Run:

```bash
npx playwright test apps/web/e2e/messages.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Kapsam ve whitespace denetimi**

Run:

```bash
git status --short
git diff --check
git diff -- \
  apps/web/src/features/messages \
  apps/web/src/routes/hesabim_.mesajlar.tsx \
  apps/web/src/routes/hesabim_.mesajlar.test.tsx \
  apps/web/e2e/messages.spec.ts \
  apps/web/package.json \
  package-lock.json
```

Kontrol:

- legacy message page/ChatDock diff'i yok;
- shared UI export/katalog diff'i yok;
- MarketplaceShell/routes config diff'i yok;
- generated route tree elle değişmemiş;
- dependency diff'i yalnız `@tanstack/react-virtual` ve lock transitive kaydı;
- feature CSS raw px/hex/gradient/shadow içermiyor.

- [ ] **Step 5: Son kabul özeti**

Rapor:

- uygulanan route ve ana davranışlar;
- test/build/E2E sonuçları;
- Storybook story listesi;
- görsel snapshot yolları;
- capability-gated bırakılan backend işleri;
- manuel VoiceOver/NVDA smoke sonucu;
- kullanıcıya ait korunmuş ilgisiz worktree değişiklikleri.

`.git` salt okunur olduğu için commit/branch işlemi yapma.

## YAGNI Gate

Bu plan sırasında aşağıdakiler eklenmeyecektir:

- Redux, Zustand veya ikinci message cache.
- Socket.io veya başka WebSocket wrapper.
- IndexedDB wrapper ve offline outbox.
- UUID veya tarih paketi.
- Form kütüphanesi.
- Emoji/GIF/reaction/voice/edit/unsend.
- Presence/typing timer'ı.
- Team assignment, SLA, tag, canned reply veya CRM.
- Generic `GlassMessageBubble`, `GlassConversationList` ya da
  `GlassMessageComposer`.
- Üç ayrı listing/report/block portal implementasyonu.

Tek yeni dependency `@tanstack/react-virtual@3.14.8`dir. Bir görev bu sınırı
aşmayı gerektirirse uygulamayı durdurup spesifikasyon değişikliği istemelidir.
