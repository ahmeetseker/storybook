---
name: MessagesWorkspace
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# MessagesWorkspace Kuralları

## 1. Amaç

`MessagesWorkspace`, `/hesabim/mesajlar` için kişi × ilan kimlikli
konuşmaları, mesaj geçmişini, composer'ı ve entegrasyon eylemlerini tek
master-detail çalışma alanında birleştirir.

Kapsamı mesaj merkezi UI'si, Query cache orkestrasyonu, optimistic gönderim ve
private-session temizliğidir. Backend, WebSocket bağlantısı, kimlik doğrulama,
dosya tarama, risk sınıflandırması veya route history politikası üretmez.
`GlassChatDock` ilan detayındaki AI yardımcısıdır; insan konuşmaları için
`MessagesWorkspace` yerine kullanılamaz. Global Header, Dock ve
`MarketplaceShell` bu feature'ın parçası değildir.

## 2. Semantik sözleşme

- Her mod tam olarak bir `<main id="main-content">` ve bir `h1` üretir.
- Hazır modda rail, `nav[aria-label="Konuşmalar"]` içinde sanal scroll
  wrapper'ının taşıdığı `ul > li > a` liste yapısını korur. Seçili link
  `aria-current="page"` taşır; `listbox/option` veya tab semantiği kullanılmaz.
- Thread, karşı taraf adıyla adlandırılmış `role="log"` taşır.
  `aria-live="off"` eski sayfa prepend'inin yeni mesaj gibi okunmasını önler;
  yeni mesaj özeti ayrı polite status bölgesinde duyurulur.
- Composer adlandırılmış bir `<form>` ve `textarea` kullanır. Gönderim gerçek
  submit davranışıdır; ikon-tek ek kontrolünün accessible name'i zorunludur.
- Hatalar kendi panelinde `role="alert"`, bağlantı ve sonuç sayıları
  `role="status"` ile bildirilir.
- Listing/report/block overlay'leri portal kullanan tek controlled
  `GlassDrawer` union'ıdır. `role="dialog"`, `aria-modal`, focus trap, body
  scroll kilidi, Escape ve tetikleyiciye focus dönüşü korunur.
- Kalıcı DOM sırası rail → thread'dir. Compact görünüm CSS ile bir paneli
  saklar; içerik görsel yeniden sıralanmaz.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Page header | Evet | `h1`, açıklama, bağlantı status'ü | Tek `h1`; online durumda banner yok |
| Conversation rail | Evet | Arama, filtre, sonuç status'ü, sanal liste | Flat içerik yüzeyi; `nav/ul/li/a` |
| Conversation row | Veri varsa | Kişi, ilan, tarih, önizleme, unread/status | Kişi × ilan kimliği ayrılmaz; unread yalnız renk değildir |
| Thread header | Seçim varsa | Avatar, kişi, ilan bağlamı, opsiyonel eylemler | Sahte route/capability eylemi çizilmez |
| Timeline | Seçim varsa | Gün ayırıcıları, mesajlar, sistem/güvenlik notları | Adlandırılmış log; bounded virtual DOM |
| Composer | Seçim varsa | Taslak, opsiyonel ek staging'i, send | Blocked/closed/archived state'ine uyar |
| Local state | Gerektiğinde | Loading, empty, list/thread error | Sağlam paneli gereksiz yere bastırmaz |
| Drawer | Hayır | Listing, report veya block | Aynı anda en fazla bir portal |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `dataSource` | prop | `MessagesDataSource` | Yok | Evet | Cursor sorguları, mutasyonlar ve opsiyonel entegrasyon portu |
| `mode` | prop | `'loading' \| 'ready' \| 'restricted' \| 'session-expired'` | `'ready'` | Evet | Erişim ve çalışma alanı modu |
| `conversationId` | prop | `string \| undefined` | `undefined` | Evet | URL sahibinin verdiği opaque aktif konuşma kimliği |
| `defaultConversationId` | prop | `string \| undefined` | `undefined` | Hayır | Yalnız uncontrolled ilk seçim |
| `onConversationChange` | event | `(conversationId?: string) => void` | `undefined` | — | Kullanıcı konuşma seçtiğinde opaque kimlikle çağrılır |
| `connectionState` | prop | `'online' \| 'reconnecting' \| 'offline'` | `'online'` | Evet | Taşıma durumu; history'yi bastırmaz |
| `onOpenListing` | event | `(listingId: string) => void` | `undefined` | — | Gerçek listing route'u varsa eylemi açar |
| `draftNamespace` | prop | `string` | `'messages-workspace'` | Hayır | Session draft'larını workspace örnekleri arasında ayıran storage-only kapsam; URL, log veya telemetry'ye taşınmaz |

Ref hedefi: N/A — imperative ref export edilmez.

`conversationId` prop'unun varlığı controlled modu seçer; değer `undefined`
olsa bile `defaultConversationId`'den üstündür. `onConversationChange` yalnız
kullanıcı seçimiyle çalışır; prop senkronizasyonu veya query sonucu callback
üretmez. `onOpenListing` yoksa ilgili eylem render edilmez.

## 5. Seçenek eksenleri

Görsel `material`, `tone`, `size`, `variant`, `thickness`, `tint` veya
`prominent` ekseni public workspace API'si değildir. Renkler `:root`
token'larından gelir. `mode` ve `connectionState` görsel variant değil domain
state'idir; capability'ler veri kaynağının entegrasyon sözleşmesidir.

Varsayılan kombinasyon:
`mode="ready" + connectionState="online" + seçim yok`.

Yasak kombinasyonlar:

- `conversationId` ile seçimi iç state'e kopyalamak;
- `hover`, `focus`, `active`, cihaz adı veya breakpoint prop'u eklemek;
- capability fonksiyonu yokken upload/report/block/unread sonucu çizmek;
- kalıcı rail, thread veya listing bağlamını glass yapmak;
- aynı anda birden çok drawer state'i tutmak.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / görünür kanıt |
|---|---|---|---|
| `session-expired` | `mode` | Tüm kişisel içerik, query/cache, draft, realtime | Tek erişim başlığı |
| `restricted` | `mode` | Tüm kişisel içerik, query/cache, draft, realtime | Tek erişim başlığı |
| `loading` | `mode` | Hazır rail/thread | `main[aria-busy=true]` |
| list error | Conversation query | Yalnız rail verisi | Yerel alert + retry |
| thread error | Thread query | Yalnız aktif timeline/composer | Yerel alert |
| `reconnecting` / `offline` | `connectionState` | Hiçbir geçmişi bastırmaz | Sakin status banner |
| blocked | Conversation status | Yeni gönderim | Disabled composer + neden |
| listing-closed / archived | Conversation status | Yeni gönderim | Read-only composer + neden |
| pending | Optimistic mutation | — | “Gönderiliyor” |
| failed | Send rejection | pending | Metin + “Tekrar dene” + “Kopyala” |
| sent/delivered/read | Canonical adapter | Daha düşük delivery state | Capability kadar receipt metni |
| focus/hover/active | CSS/DOM | — | Yalnız `:focus-visible` outline |

Öncelik:
`session-expired / restricted > loading > availability > value > interaction >
tema`. List ve thread hataları birbirinden bağımsızdır.

Optimistic akış tek isimli ve tek kimliklidir:

```text
draft
  └─ send → pending(clientMessageId)
                ├─ ack → sent → delivered → read
                └─ error → failed ─ retry(same clientMessageId) ─┘
```

Ack/realtime payload'ı `id` veya `clientMessageId` ile aynı render kaydına
uzlaştırılır. Delivery state geriye gitmez; retry yeni client kimliği üretmez.

## 7. Davranış

### Selection ve veri akışı

- Controlled seçim route/URL sahibindedir; uncontrolled seçim yalnız story ve
  bağımsız kullanım içindir.
- Search ve `all/unread/archived` filtresi workspace-local kalır; URL,
  telemetry veya breadcrumb'a yazılmaz.
- Query key'leri normalize filtre/query ve opaque conversation ID'den oluşur.
  Conversation ve thread cursor'ları adapter dışında parse edilmez.
- Conversation preview ve aktif thread aynı mutation sınırında güncellenir.
- HTTP/fixture adapter canonical kaynaktır. Opsiyonel `realtime.subscribe`
  uygulama seviyesindeki bağlantıyı tüketir; feature kendi WebSocket'ini açmaz.
- Delivered/read yalnız ilgili capability gerçekten `true` ise gösterilir.
  Presence, typing, scan, report veya block sonucu tahmin edilmez.

### Pointer ve keyboard

| Girdi | Davranış |
|---|---|
| Conversation link click / `Enter` | Konuşmayı seçer; modifier'lı link davranışını bozmaz |
| `Tab` / `Shift+Tab` | DOM sırasındaki kontrol ve linkleri gezer |
| Filtrede ok tuşları / Home / End | Roving radio focus ve seçimini değiştirir |
| Composer `Enter` | IME açık değilse ve metin boş değilse gönderir |
| Composer `Shift+Enter` | Yeni satır ekler |
| Drawer `Escape` | Dismissible drawer'ı kapatır, focus tetikleyiciye döner |
| Drawer uçlarında `Tab` / `Shift+Tab` | Focus trap içinde sarar |

Coarse pointer'da kritik hedefler en az `--lg-control-md` olur. Focus yalnız
`:focus-visible` ile ortak focus tokenlarını kullanır.

### Pagination, virtualization ve scroll

- Rail start-cursor, thread end-cursor/older prepend modeliyle sayfalanır.
- Conversation rail ve timeline sınırlı DOM penceresi kullanır; aktif,
  focused ve seçili satırlar pencere dışında kalsa da pinlenir.
- Ölçülen satır yüksekliği değişince üst anchor korunur. Eski mesaj prepend'i
  viewport'u sıçratmaz.
- Kullanıcı dipteyse append en sona takip eder. Dipte değilse scroll gasp
  edilmez; “En yeni mesaja dön” eylemi sunulur. Görünmeyen inbound mesaj
  varsa aynı kontrol “N yeni mesajı göster” metnine geçer.
- Reduced motion altında smooth scroll ve geçişler anlık olur.

### Overlay, attachment ve private cleanup

- Attachment yalnız `uploadAttachment` capability'si ile seçilebilir. Client
  yalnız JPEG/PNG/WebP/PDF, en fazla 10 dosya ve dosya başına 10 MB staging
  doğrulaması yapar; sunucu tarama sonucu uydurmaz.
- Session expired, restricted veya unmount: realtime unsubscribe edilir,
  in-flight controller'lar abort edilir ve object URL'ler revoke edilir.
- Session expired/restricted ayrıca
  `cancelQueries({ queryKey: messagesQueryKeys.all })` tamamlandıktan sonra
  `removeQueries` çalıştırır; memory draft, overlay ve feature namespace'indeki
  session draft'ları idempotent temizlenir. Temizlik yalnız o workspace'in
  `draftNamespace` kapsamına dokunur; eşzamanlı başka namespace'leri silmez.
- Tam mesaj geçmişi localStorage/IndexedDB'ye yazılmaz. Yalnız conversation
  bazlı düz metin draft sessionStorage'da tutulur.

## 8. İçerik kuralları

- Görünür ürün dili Türkçedir; kod tanımlayıcıları İngilizcedir.
- Kişi adı ve ilan başlığı birlikte görünür; aynı kişi/farklı ilan
  konuşmaları birleşmez.
- Unread, delivery, blocked, closed, archived ve connection state'leri yalnız
  renk/ikonla anlatılmaz; görünür metin taşır.
- Uzun kişi adı, ilan başlığı, mesaj ve dosya adı `overflow-wrap` ile sarılır;
  anlamlı metin keyfî ellipsis ile kesilmez.
- Boş inbox, boş filtre ve arama sonucu yok durumları birbirinden farklı metin
  ve geri kazanım eylemi kullanır.
- Sistem ve güvenlik mesajları kullanıcı balonu veya sahte gönderici gibi
  gösterilmez.
- Message body düz React text'i olarak render edilir;
  `dangerouslySetInnerHTML` kullanılmaz.
- Message body, attachment adı, telefon/e-posta ve serbest search metni URL,
  log, telemetry veya breadcrumb'a taşınmaz.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| Page | zemin / metin | `--lg-bg`, `--lg-label` | N/A |
| Flat workspace | zemin / border / radius | `--lg-surface`, `--lg-hairline`, `--lg-stroke-hairline`, `--lg-radius-card` | Compact grid |
| Rows / bubbles | radius / border / renk | `--lg-radius-media`, `--lg-hairline`, `--lg-accent`, `--lg-accent-contrast` | Selected/outgoing |
| Status / chips | radius / type | `--lg-radius-chip`, `--lg-text-caption`, `--lg-text-badge` | Connection/unread |
| Layout | padding / gap | `--lg-space-*` | Container query |
| Controls | yükseklik / focus | `--lg-control-*`, `--lg-focus-ring-width`, `--lg-focus-ring-offset`, `--lg-accent` | Coarse pointer / focus-visible |
| Dock reserve | alt padding | `--lg-shell-dock-offset`, `env(safe-area-inset-bottom)` | Compact frame |

Kalıcı içerik cam bütçesi **0**'dır: rail ve thread
`data-material="flat"` taşır. Cam yalnız shared search/segmented/composer
kontrolleri ve tek transient drawer'da kullanılabilir. Sayfa + global shell
toplamı altı cam yüzeyi aşamaz; yeni glass kontrol eklemek bütçe denetimi ve
gerekirse konsolidasyon gerektirir. Cam üstüne cam konmaz.

Raw hex/rgb, keyfî shadow/radius ve CSS `px` borcu yoktur. `92rem` sayfa ekseni,
`52rem` container eşiği ve `dvh` değerleri app-level akış geometrisidir.

**Runtime virtual px istisnası:** `ConversationRail` ve `MessageTimeline`,
gözlenen DOM satır yüksekliğini tarayıcının CSS pixel biriminde tutar ve yalnız
inline `height` ile `transform: translateY(...)` değerine yazar. Başlangıç
tahminleri ile bottom tolerance da sadece virtual window/scroll matematiğidir.
Bunlar görsel spacing, radius veya kontrol boyutu değildir; CSS token
sözleşmesini aşan yeni tasarım geometrisi için kullanılamaz.

## 10. Storybook kapsamı

| Story | Kanıt |
|---|---|
| `Default` | Dolu master-detail |
| `UnreadConversations` | Unread filtre ve metinsel sayaç |
| `EmptyInbox` | Gerçek inbox boş durumu |
| `SearchNoResults` | Dolu kaynağa karşı sıfır arama sonucu |
| `WorkspaceLoading` | PII içermeyen access loading |
| `ConversationListError` | Yerel rail hatası |
| `ThreadError` | Rail korunurken thread hatası |
| `Reconnecting` | Geçmişi koruyan reconnect status |
| `OfflineWithDraft` | Conversation-bazlı taslak |
| `FailedMessage` | Retry/kopya ve korunan metin |
| `AttachmentCapability` | Capability-only upload + scanning |
| `BlockedConversation` | Disabled composer nedeni |
| `ListingClosed` | Read-only composer nedeni |
| `SafetyCapability` | Güvenlik notu + capability-only report/block |
| `LongContent` | Uzun içerik + virtual history |
| `CompactConversationList` | 390px master görünümü |
| `CompactActiveThread` | 390px detail görünümü |
| `ReducedMotion` | Reduced-motion metadata/contract |
| `ReducedTransparency` | Reduced-transparency metadata/contract |
| `SessionExpired` | PII bastırma ve cleanup |
| `Restricted` | PII bastırma ve cleanup |
| `Accessibility` | Keyboard, send, drawer Escape/focus return, tek h1 |

Her story kendi mount'ında fresh QueryClient ve closure-owned fixture source
üretir. Query retry kapalıdır; timeout, gerçek network, rastgele fixture veya
module singleton yoktur. Capability story açıklamaları production adapter'da
entegrasyon varmış izlenimi vermez. Conversation kimlikleri deterministik
story scope'u ile ayrılır; her story aynı scope'tan türetilen deterministik bir
`draftNamespace` kullanır ve session draft temizliği yalnız bu namespace'e
dokunur. Namespace URL veya görünür içeriğe taşınmaz. Reduced-motion
`MotionConfig` + scope CSS'iyle, reduced-transparency ise token tüketen scope
CSS'iyle gösterilir; global `matchMedia` mutasyonu yapılmaz.

## 11. Test kabul kriterleri

- Unit: kişi × ilan izolasyonu, Türkçe normalize arama, cursor, immutable
  factory snapshot ve abort davranışı.
- Domain: optimistic pending, stabil render key, ack dedupe, monoton delivery,
  fail/retry aynı `clientMessageId`, out-of-order event.
- Workspace: tek main/h1, controlled/uncontrolled seçim, list/thread kısmi
  hata, empty/loading, reconnect/offline, cache preview uzlaştırması.
- Privacy: session-expired/restricted kişisel veri çizmez; cancel → remove,
  unsubscribe, abort, object URL revoke ve draft clear idempotenttir; iki
  eşzamanlı workspace'ten biri kapanınca diğer namespace'in draft'ı korunur.
- Interaction: conversation `Enter`, filtre roving keys, composer
  Enter/Shift+Enter/IME/whitespace, failed retry, capability gating.
- Overlay: tek portal, dialog adı, focus trap, Escape, scroll lock ve
  tetikleyiciye focus dönüşü.
- Virtualization: bounded DOM, focused row pinning, prepend anchor, dipte
  olmayan kullanıcıya scroll gasp etmeme.
- Visual: 390px list/thread, uzun Türkçe içerik, blocked/closed,
  reduced motion/transparency ve Dock safe-area rezervi.
- A11y: `nav/ul/li/a`, `aria-current`, named log, live-region ayrımı,
  non-color state cues, visible `:focus-visible`, coarse pointer hedefleri.
- CSS contract: raw px/hex/rgb/gradient/custom shadow/`!important` yok; kalıcı
  message content glass yüzeyi yok.

### Manuel ekran okuyucu smoke

Otomatik testler bu manuel kabul adımının yerine geçmez. VoiceOver veya NVDA
ile aşağıdakiler doğrulanır:

**Durum — bekliyor (2026-07-27):** Bu sandbox'ta gerçek ekran okuyucu oturumu
bulunmadığı için manuel smoke ortam nedeniyle çalıştırılamadı.
AT/tarayıcı/platform, uygulayan kişi ve pass/fail sonucu kaydedilene kadar
aşağıdaki maddeler yürütülmüş doğrulama kaydı sayılmaz.

- rail mantıksal sırada okunur;
- selected conversation ile klavye focus'u ayrı anlaşılır;
- timeline prepend edilen eski geçmişi yeniden okumaz;
- yeni inbound mesaj polite bölgede yalnız bir kez duyurulur;
- “N yeni mesaj” kontrolü duyurulur ve çalışır;
- drawer kapandıktan sonra focus açan tetikleyiciye döner.

### Visual snapshot baseline durumu

**Durum — bekliyor (2026-07-27):** Playwright web server bu sandbox'ta
`listen EPERM: operation not permitted 127.0.0.1` ile başlayamadığı için
snapshot güncelleme ve karşılaştırma ortam nedeniyle çalıştırılamadı. Üç
baseline görüntüsü bind izni ve Chrome bulunan bir ortamda
`npx playwright test apps/web/e2e/messages.spec.ts --update-snapshots=all`
ile üretilip ardından normal hedef koşusuyla doğrulanmalıdır; bu kayıtta
baseline varmış veya görsel test geçmiş gibi kabul edilmez.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- Conversation kimliğini kişi × ilan olarak koru.
- Panel hata ve loading state'lerini yerel tut.
- Capability ve receipt görünürlüğünü adapter'ın gerçek sözleşmesine bağla.
- Draft, query, request, realtime ve object URL yaşam döngüsünü private erişim
  kapanışıyla birlikte temizle.
- Virtual row focus ve scroll anchor'larını veri değişiminde koru.

**Don't**

- Thread metnini URL, kalıcı storage, log veya telemetry'ye yazma.
- Typing, presence, delivered/read, upload scan, report veya block sonucu
  uydurma.
- Feature içinde WebSocket, ikinci shell/sidebar/Dock veya kalıcı glass panel
  açma.
- Pending için `queued`, `sending` veya ikinci bir geçici state adı ekleme.
- Runtime ölçüm istisnasını normal padding/gap/radius geometrisine genişletme.

Bilinen kısıtlar:

- Varsayılan fixture source realtime ve entegrasyon capability'si sunmaz.
- `prefers-reduced-transparency` tarayıcı/platform desteğine bağlıdır; CSS
  sözleşmesi yine bulunur.
- Compact master/detail history ve “listeye dön” politikası route sahibinindir;
  workspace seçim callback'ini sağlar, kendi browser history'sini yazmaz.

Açık karar: Backend delivery/read ve attachment scan sözleşmeleri bağlandığında
yalnız gerçekten desteklenen capability/state'ler açılacaktır; bugünkü fixture
bu sonucu belirlemez.

Changelog: 2026-07-27 — Enterprise mesaj merkezi sözleşmesi ve 23-story
deterministik matris oluşturuldu.
