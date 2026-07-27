# Enterprise Mesaj Merkezi Tasarım Spesifikasyonu

Tarih: 2026-07-27  
Rota: `/hesabim/mesajlar`  
Durum: Tasarım yönü kullanıcı tarafından onaylandı  
Kapsam: Kişi × ilan bağlamlı 1:1 pazar yeri mesajlaşmasının frontend çalışma alanı

## 1. Amaç

`/hesabim/mesajlar`, alıcı veya kiracı ile ilan sahibi ya da emlak danışmanı
arasındaki görüşmeleri hızlı, güvenli ve ilan bağlamını kaybetmeden yöneten
premium bir mesaj merkezi olacaktır.

Bu ekran genel amaçlı sosyal sohbet uygulaması, CRM, ekip inbox'ı veya AI
asistanı değildir. Birincil iş şudur:

> Kullanıcı doğru ilan için doğru kişiyle konuştuğunu anında anlamalı; yeni
> mesajı bulmalı, geçmişi güvenle okumalı ve yanıtını veri kaybetmeden
> gönderebilmelidir.

Tasarımın premium niteliği efekt yoğunluğundan değil; doğru bilgi hiyerarşisi,
kesin durum geri bildirimi, tutarlı boşluk, kontrollü yoğunluk ve güven veren
etkileşimlerden gelir.

## 2. Mevcut durum ve problem tanımı

Gerçek `/hesabim/mesajlar` rotası uygulama router'ına, canonical/noindex head
bilgisine, global `MarketplaceShell` navigasyonuna ve bildirim geçişine
bağlıdır; ancak bugün yalnız `RoutePlaceholder` render eder.

Storybook altında eski bir `src/pages/Mesajlar.tsx` demosu bulunur. Bu demo:

- web uygulaması tarafından import edilmez,
- eski ve yerel bir hesap sidebar'ı tekrar üretir,
- inline ham ölçü/stil kullanır,
- yalnız statik iki kolon yerleşimine sahiptir,
- gerçek gönderim, hata, optimistic durum veya retry modellemez,
- loading, reconnecting, blocked ve uzun geçmiş durumlarını kapsamaz,
- kişi ile ilanı güvenilir domain kimliği olarak ayırmaz,
- erişilebilir sanallaştırma ve scroll-anchor davranışı sağlamaz.

Eski demo üretim rotasına taşınmayacaktır. Yeni çalışma alanı
`apps/web/src/features/messages` altında feature-local kurulacaktır. Eski demo
bu çalışmanın parçası olarak silinmeyecek veya yeniden yazılmayacaktır.

`GlassChatDock` da yeniden kullanılmayacaktır. Bu component ilan detayında
gösterilen AI soru-cevap widget'ıdır; `user | ai` rol modeli, fixed dock
yerleşimi ve AI semantiği gerçek kişi mesajlaşmasının sözleşmesi değildir.
Yalnız erişilebilir `role="log"`, IME-safe composer ve akıllı scroll
davranışlarından ders alınacaktır.

## 3. Araştırma temeli

Kararlar güncel resmî ürün ve standart kaynaklarından türetilmiştir:

- [Apple Split Views](https://developer.apple.com/design/human-interface-guidelines/split-views):
  kalıcı birincil liste, seçili öğe ve ayrıntı ilişkisi; compact genişlikte
  tek panel.
- [Apple Searching](https://developer.apple.com/design/human-interface-guidelines/searching):
  tek ve öngörülebilir arama konumu, gerektiğinde kapsam/filtre.
- [Airbnb mesaj yönetimi](https://www.airbnb.com/help/article/3558):
  birleşik inbox, hızlı filtre, arama, read receipt, ek ve kapalı thread.
- [Airbnb güvenli iletişim](https://www.airbnb.com/help/article/1121):
  görüşmeyi platform içinde tutma, dolandırıcılık ve güvenlik incelemesi.
- [Slack unread yönetimi](https://slack.com/help/articles/226410907-View-all-your-unread-messages):
  okunmamış filtreleme, mark unread, okuma bağlamını bozmayan yeni içerik.
- [Slack arama](https://slack.com/help/articles/202528808-Search-in-Slack):
  global arama ile aktif konuşmada aramayı ayırma.
- [TanStack Query Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries):
  iki yönlü cursor sayfalama.
- [TanStack Virtual Chat](https://tanstack.com/virtual/latest/docs/chat):
  end anchoring, prepend sırasında viewport koruma, yalnız dipteyken follow.
- [React useOptimistic](https://react.dev/reference/react/useOptimistic) ve
  [TanStack optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates):
  gecikmeyi gizlemeden anlık gönderim geri bildirimi.
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API):
  standart WebSocket'in backpressure sağlamaması ve sınırlı event kuyruğu
  gereksinimi.
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  ve [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum):
  compact reflow, canlı durum duyurusu ve erişilebilir hedef boyutu.

Detaylı kaynak ve çıkarımlar:

- `.superpowers/sdd/2026-07-27-messages-planning/local-audit.md`
- `.superpowers/sdd/2026-07-27-messages-planning/ux-research.md`
- `.superpowers/sdd/2026-07-27-messages-planning/scale-research.md`

## 4. Ürün yönü ve reddedilen alternatifler

### 4.1 Seçilen yön: odaklı pazar yeri inbox

Konuşmanın kimliği yalnız kişi değildir:

```text
conversation = account × counterpart × listing
```

Aynı kişiyle iki farklı ilan hakkında yapılan görüşme iki ayrı konuşmadır.
İlan görseli, başlığı, fiyatı ve yayın durumu hem conversation row'da hem aktif
thread header'da görünür. İlan değişiklikleri kişi mesajı gibi değil, açık
system event olarak zaman çizelgesine eklenir.

### 4.2 Bu sürümde seçilmeyen: ekip inbox'ı

Emlak ofisleri için atama, ekip üyesi, SLA, hazır yanıt, etiket ve iç not
değerli olabilir; ancak bunlar bireysel kullanıcıların temel inbox deneyimini
karmaşıklaştırır. Domain'e kullanılmayan `assignee`, `queue`, `sla` alanları
eklenmeyecek. Ekip inbox'ı ayrı bir ürün ve sürüm kararıdır.

### 4.3 Reddedilen: sosyal veya AI sohbet merkezi

Reaction, GIF, sticker, sesli mesaj, kanal, bot, AI rewrite ve otomatik özet
ilk sürümde yer almaz. İnsanlar arası pazarlık ve güven konuşmasına AI
personası yerleştirilmez. AI ancak gelecekte gerçek bir güvenlik servisi risk
sinyali üretirse, insan dilinde bağlamsal uyarı açıklaması sağlayabilir.

## 5. Tasarım okuması

Bu ekran yoğun ama sakin bir ürün çalışma alanıdır:

- Tasarım varyansı: 3/10
- Motion yoğunluğu: 2/10
- Bilgi yoğunluğu: 6/10
- Görsel karakter: ölçülü, güvenilir, exact, tanıdık
- Varsayılan tema: Kağıt
- Alternatif tema: Grafit
- Tipografi: mevcut Manrope
- Accent: yalnız `--lg-accent`
- İçerik: flat
- Cam: global navigasyon ve geçici kontrol katmanı
- Kenar yöntemi: hairline veya tonal ayrım; geniş gölge yok
- Animasyon: yalnız işlevsel state değişiminde transform/opacity/filter

Uygulama bağlayıcı olarak şunlara uyar:

- `src/design/GenelBakis.mdx`
- `src/design/Tokenlar.mdx`
- `src/design/EksenlerVeDurumlar.mdx`
- `src/design/ErisilebilirlikMotionResponsive.mdx`
- `src/design/ComponentSablonu.mdx`

Ham `px`, hex, rgb/hsl, gradient, özel shadow ve `!important` feature CSS'inde
kullanılmaz. Token fallback'i dışında tek kaynak `src/index.css`tir.

## 6. Hedefler

### 6.1 Ürün hedefleri

1. Kişi ve ilan bağlamını aynı bakışta anlaşılır kılmak.
2. Okunmamış konuşmayı hızlı buldurmak.
3. Geçmişi okurken scroll konumunu korumak.
4. Mesaj gönderimini anlık ama dürüst durumlarla göstermek.
5. Hata halinde kullanıcının yazdığı içeriği kaybetmemek.
6. Platform dışı iletişim ve kişisel veri risklerini bağlamsal göstermek.
7. Mobil ve masaüstünde aynı bilgi sırasını korumak.
8. Backend geldiğinde UI'ı yeniden yazmadan adapter bağlayabilmek.
9. Büyük conversation/thread koleksiyonlarında DOM ve bellek sınırını korumak.

### 6.2 Deneyim hedefleri

- Sayfa açıldığında odak tek bir büyük hero veya metrik alanına gitmez; inbox
  doğrudan kullanılabilir görünür.
- Bir conversation row beş saniye içinde taranabilecek yoğunluktadır.
- Seçim, focus, unread ve delivery durumları birbirinden ayrıdır.
- Kullanıcının okumakta olduğu geçmiş yeni event yüzünden hareket etmez.
- Composer her zaman aktif thread'e ait olduğunu açıkça gösterir.
- Mobil geri dönüş listede önceki scroll ve filtreyi korur.
- Hata yalnız toast ile kaybolmaz; ilgili mesaj veya yüzey üzerinde çözüm
  sunar.

## 7. Kapsam

### 7.1 İlk frontend sürümünün çekirdeğinde olmalı

- Kişi × ilan conversation modeli.
- Tümü, Okunmamış ve Arşiv ana filtreleri.
- Kişi, ilan başlığı, semt ve ilan numarasıyla conversation araması.
- Conversation listesi ve aktif thread.
- İlan bağlamlı thread header.
- Text ve system mesaj görünümleri.
- Conversation bazlı taslak.
- Optimistic send, ack, failed ve retry görünümü.
- Sent bilgisinin yalnız adapter ack'i varsa gösterilmesi.
- Arşivleme görünümü.
- Reconnecting/offline banner.
- Yeni mesaj geldiğinde “N yeni mesaj” jump kontrolü.
- Loading, empty, no-results, error, blocked ve listing-closed durumları.
- Desktop iki panel, compact tek panel master-detail.
- Kağıt/Grafit Storybook matrisi.
- Cursor, virtualization ve realtime adapter sözleşmesi.

### 7.2 Capability-gated entegrasyon yüzeyleri

Aşağıdaki durumların UI, Storybook ve type sözleşmesi hazırlanabilir; ancak
gerçek production route yalnız ilgili adapter capability/callback varsa action
ve sonucu gösterir:

- Görsel/PDF ek seçimi, yükleme, tarama ve signed URL.
- Delivered/read receipt.
- Mark unread.
- Belirli mesajı raporlama.
- Kişiyi engelleme.
- Sunucu tarafından üretilmiş safety notice.
- Rate-limit geri sayımı veya yeniden deneme zamanı.

Backend capability yokken fixture route sahte tarama, read/delivery, risk,
rapor veya engelleme sonucu üretmez. Bu yüzeyler Storybook'ta deterministik
capability-enabled fixture ile incelenebilir.

### 7.3 Sonraki sürüme bırakılır

- Tüm mesajlarda full-text arama.
- Aktif thread içinde mesaj araması ve result jump endpoint'i.
- Edit ve unsend.
- Reaction, GIF, sticker ve voice.
- Typing indicator ve presence.
- Group chat.
- Emlak ofisi assignment/SLA/etiket/iç not.
- Quick replies ve scheduled replies.
- Kalıcı offline outbox.
- Çoklu sekme socket leader election.
- Aracılı/geçici telefon numarası.
- AI yazım yardımı veya konuşma özeti.

### 7.4 Frontend planının dışında

- Backend veritabanı ve partitioning.
- WebSocket gateway/fanout.
- Kimlik doğrulama ve yetkilendirme.
- Dosya depolama, virüs tarama ve signed URL servisi.
- Moderasyon ve rapor inceleme altyapısı.
- İçerik risk sınıflandırma servisi.
- E2E encryption kararı.
- Push notification teslim altyapısı.

Frontend bu servisler varmış gibi sahte sonuç üretmez. Capability veya callback
yoksa ilgili action gizlenir ya da dürüstçe disabled nedeni gösterilir.

## 8. Bilgi mimarisi

Sayfa global `MarketplaceShell` içinde tek `main#main-content` ve tek `h1`
kullanır. Yerel account sidebar veya ikinci Dock eklenmez.

### 8.1 Sayfa başlığı

Başlık alanı minimaldir:

- `h1`: Mesajlar
- yardımcı metin: yalnız gerektiğinde unread conversation özeti
- network/reconnect durumu

Büyük pazarlama başlığı, dekoratif eyebrow veya genel metrik şerit yoktur.

### 8.2 Conversation rail

Sıra:

1. başlık ve unread conversation sayısı,
2. tek search alanı,
3. Tümü / Okunmamış / Arşiv segmented filter,
4. sanallaştırılmış conversation listesi,
5. gerekiyorsa görünür “Daha fazla yükle” fallback'i.

Her row:

- ilan thumbnail,
- karşı taraf adı,
- rol veya verification metni,
- ilan kısa başlığı,
- son mesaj önizlemesi,
- son kullanıcı etkinlik zamanı,
- unread dot/count,
- archived/blocked gibi ikincil durum.

Row içindeki ana hedef gerçek link veya button semantiğidir. Row'da ikincil
menu bulunacaksa `listbox/option` kullanılmaz; `nav > ul > li` içinde ana
konuşma linki ve ayrı accessible menu control kullanılır.

### 8.3 Thread header

İçerik:

- compact ortamda geri kontrolü,
- karşı taraf avatarı, adı, rolü ve doğrulama durumu,
- ilan thumbnail, kısa başlık, fiyat ve ilan durumu,
- “İlana git” gerçek route'u,
- overflow menu: mark unread, arşivle, raporla, engelle,
- “İlan ayrıntıları” drawer kontrolü.

Verification yalnız gerçek source verisi varsa gösterilir. “Çevrimiçi”,
“yazıyor” veya response time sahte biçimde üretilmez.

### 8.4 Message timeline

Timeline en yeni mesajlarla dipte açılır:

- eski sayfa yukarıdan cursor ile prepend edilir,
- ilk görünür mesajın konumu korunur,
- kullanıcı dipteyse yeni mesajı izler,
- geçmişteyse viewport korunur ve “N yeni mesaj” kontrolü gösterilir,
- gün ayırıcıları tarih etiketi olarak görünür,
- kişi mesajları sender gruplarıyla sadeleştirilir,
- delivery/read yalnız son giden grup için gösterilir,
- system event ve safety notice balon kılığına sokulmaz.

Timeline `role="log"` ve açık accessible name taşır. Eski geçmiş prepend
edilirken yüzlerce eski mesaj “yeni” diye canlı bölgeye duyurulmaz.

### 8.5 Composer

Composer thread'in alt yapısal yüzeyidir; floating glass bar değildir:

- attachment control,
- auto-growing textarea,
- staged attachment preview,
- durum/açıklama satırı,
- primary gönder action'ı.

Davranış:

- Enter gönderir,
- Shift+Enter yeni satır,
- IME composition sırasında Enter göndermez,
- boş/yalnız whitespace göndermez,
- attachment taranıyorsa neden görünür biçimde send disabled olur,
- konuşma değişince her conversation taslağı ayrı korunur,
- başarılı enqueue sonrası textarea temizlenir,
- failure mesajı composer'a sessizce geri koymaz.

Taslaklar ilk sürümde sessionStorage'a conversation ID ile yazılır. Tam
mesaj geçmişi kalıcı tarayıcı storage'ına yazılmaz.

### 8.6 İlan ayrıntı drawer'ı

Desktop ana yerleşim iki paneldir. Üçüncü kalıcı kolon yoktur. Drawer:

- ilan görseli,
- başlık, fiyat, konum,
- yayın durumu,
- ilan sahibinin/danışmanın doğrulama özeti,
- gerçek ilana git bağlantısı

gösterir. İlan içeriğini kopyalayan uzun galeri veya detail page üretmez.
Mevcut `GlassDrawer` portal/focus trap/scroll lock/focus return sözleşmesi
yeniden kullanılır.

## 9. Responsive davranış

### 9.1 Geniş container

Tek structural outer panel içinde yaklaşık 1:2 oran hissi:

```text
conversation rail | active thread
```

Kolonlar eşit olmak zorunda değildir; “simetri” ortak baseline, tutarlı
padding ve tam hizalı ayırıcılarla sağlanır. Rail okunabilir sabit/minmax
genişlikte, thread kalan alanı kullanır.

### 9.2 Orta container

İki panel korunabildiği sürece rail sıkılaşır; ilan header metni clamp olur.
Kalıcı üçüncü panel açılmaz. Composer yatay kontrollere yer bulamazsa ek ve
gönder kontrolleri işlev kaybetmeden yeniden akar.

### 9.3 Compact container

Tek panel:

- `?konusma` yoksa conversation listesi,
- `?konusma` varsa aktif thread,
- geri eylemi search param'ı kaldırır ve liste scroll'unu geri yükler.

Mobilde global Dock ile composer arasında safe area rezervi bulunur. 320 CSS
px genişlikte sayfa düzeyinde yatay scroll oluşmaz.

Responsive CSS feature container query kullanır. Dokunma boyutu
`pointer: coarse`, hover ayrıntıları `hover: hover` sorgularıyla çözülür.

## 10. Görsel sistem

### 10.1 Yüzeyler

- Page canvas: `--lg-bg`
- Structural workspace: flat surface
- Rail/thread ayrımı: hairline
- Active row: tonal selected surface
- Incoming bubble: subtle flat surface
- Outgoing bubble: accent veya accent-soft token sözleşmesi
- System/safety: kendi semantic foreground/surface tokenları

Bir yüzey border ve geniş gölgeyi aynı anda kullanmaz. Content panelinde blur
yoktur.

### 10.2 Geometri

- workspace ve drawer: card radius
- listing thumbnail ve attachment preview: media radius
- input, row menu ve send: control radius
- filter: yalnız gerçek segmented/capsule davranışında capsule
- status badge: compact radius

Her öğe capsule yapılmaz. Message bubble radius'u content hiyerarşisini
bozmayacak ölçüde media/card tokenlarından seçilir.

### 10.3 Tipografi

- `h1`: mevcut title/display product scale
- panel heading: headline
- row primary: label/control weight
- preview/body: body
- metadata: label
- fiyat ve unread sayıları: tabular figures

Message text 65–75ch üst sınırını geçmez. Çok uzun URL ve kesintisiz metin
layout'u bozmaz.

### 10.4 Cam bütçesi

Global `GlassIslandHeader` ve `GlassDock` zaten cam navigasyon yüzeyidir.
Messages workspace içerik yüzeyleri flat kalır. Yalnız açık menu/drawer gibi
geçici kontrol chrome'u mevcut component sözleşmesine göre cam olabilir.
Sayfa içinde sürekli üçüncü cam yüzey hedeflenmez; toplam conceptual yüzey
sayısı altıyı geçmez ve cam üstüne cam olmaz.

### 10.5 Motion

- Row seçimi: kısa tonal/opacity geçişi.
- Compact list → thread: yalnız yön ilişkisini anlatan kısa transform/opacity.
- Pending message: layout zıplatmayan küçük state değişimi.
- Jump-to-latest: reduced motion yoksa kısa scroll; reduced motion'da instant.

Decorative entrance choreography, stagger, springy bubble ve hover scale yoktur.
`prefers-reduced-motion` altında zorunlu olmayan motion kaldırılır.

## 11. Domain modeli

### 11.1 Conversation

```ts
type ConversationStatus =
  | 'active'
  | 'archived'
  | 'blocked'
  | 'listing-closed'

interface ConversationSummary {
  id: string
  counterpart: MessageCounterpart
  listing: MessageListingContext
  lastMessage: MessagePreview | null
  unreadCount: number
  lastUserActivityAt: string
  status: ConversationStatus
}
```

`lastUserActivityAt`, read receipt veya sessiz metadata event'i yüzünden
değişmez. Conversation sırası bu alanın azalan değeridir; eşitlikte stabil ID
kullanılır.

### 11.2 Message

```ts
type MessageKind = 'text' | 'attachment' | 'system' | 'safety'

type MessageDeliveryState =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

interface MessageBase {
  conversationId: string
  sequence: number | null
  senderId: string | 'system'
  kind: MessageKind
  body: string
  attachments: MessageAttachment[]
  deliveryState: MessageDeliveryState | null
  sentAt: string
}

type ConversationMessage =
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
```

System ve safety mesajlarında delivery state olmaz. Incoming kullanıcı
mesajında outgoing delivery state gösterilmez.

### 11.3 Attachment

İlk sürüm izinli ürün türleri:

- JPEG
- PNG
- WebP
- PDF

Boyut, MIME allowlist ve scan sonucu adapter capability/config içinden gelir;
UI içinde rastgele limit uydurulmaz.

Attachment state:

```text
selected → uploading → scanning → ready
                    ↘ failed
                              ↘ blocked
```

Dosya URL'si production contract'ta kısa ömürlü ve yetki kontrollüdür.

### 11.4 Read state

Conversation açmak tek başına read değildir. Mark read ancak:

- document görünür,
- thread aktif,
- unread boundary viewport'ta görünür,
- adapter read capability'si mevcut

olduğunda gönderilir. `lastReadSequence` monoton ilerler. Kullanıcı ayrıca
mark unread yapabilir.

## 12. Optimistic send ve uzlaştırma

Gönderim akışı:

1. trim edilmiş body ve ready attachments doğrulanır,
2. `crypto.randomUUID()` ile `clientMessageId` üretilir,
3. message timeline'a `pending` eklenir,
4. conversation preview aynı optimistic message ile güncellenir,
5. adapter aynı ID ile send çağrısı yapar,
6. ack `messageId`, `sequence`, server timestamp döndürür,
7. optimistic item yerinde canonical item'a dönüşür,
8. event ve HTTP ack aynı anda gelirse ID'lerle dedupe edilir,
9. hata halinde item `failed` olur; içerik kaybolmaz,
10. retry aynı `clientMessageId` ile yapılır.

Pending item canonical `id` taşımaz; render anahtarı
`clientMessageId ?? id` sırasıyla çözülür. Ack canonical server `id` değerini
eklerken `clientMessageId` değerini korur; böylece virtualizer aynı DOM/message
kaydını tanır ve scroll ölçümü gereksiz yere sıfırlanmaz.

Delivery state monoton ilerler:

```text
pending → sent → delivered → read
        ↘ failed → pending
```

Geri sıradaki event canonical state'i düşürmez. `delivered` desteği olmayan
backend için UI sent durumundan ileri gitmez.

## 13. Veri ve realtime sınırı

### 13.1 HTTP/cursor

Beklenen port:

```text
GET  /conversations?cursor&limit&filter&query
GET  /conversations/:id/messages?before&limit
POST /conversations/:id/messages
POST /conversations/:id/read
POST /conversations/:id/mark-unread
POST /conversations/:id/archive
```

Cursor opaque'tir; frontend yorumlamaz. Query keys:

```text
['messages', 'conversations', filters]
['messages', 'thread', conversationId]
```

### 13.2 Realtime

Transport adapter event'leri:

- `conversation.updated`
- `message.created`
- `message.acknowledged`
- `message.deliveryChanged`
- `conversation.readChanged`

Envelope:

```ts
interface MessagingEvent<TPayload> {
  eventId: string
  eventCursor: string
  conversationId: string
  occurredAt: string
  version: number
  payload: TPayload
}
```

WebSocket canonical veri değildir. Event queue sınırlıdır. Reconnect cursor
resume başarısızsa aktif thread ve conversation list HTTP ile refetch edilir.

İlk frontend görsel uygulamasında gerçek HTTP/WebSocket servisi
eklenmeyecektir. Feature kendi socket'ini açmayacak; uygulama düzeyindeki tek
bağlantıya ileride transport adapter üzerinden abone olacaktır. UI domain ve
adapter portları gerçek entegrasyona hazır olacak; fixture adapter sahte
presence, typing, delivery/read, scan veya risk ilerlemesi üretmeyecektir.

Fixture data source module singleton değildir. Her route component, Storybook
story veya test kendi instance'ını oluşturur. Instance closure'ı immutable
snapshot güncellemeleriyle send/archive/read sonucunu sonraki refetch'te
korur; başka SSR request veya story ile state paylaşmaz.

### 13.3 Bellek ve storage

- conversation list cursor sayfaları sınırlı cache'te,
- aktif/inaktif thread cache'i TanStack Query gc sözleşmesinde,
- DOM yalnız virtual window,
- event kuyruğu bounded,
- full history persistence yok,
- yalnız draft sessionStorage'da.

Global Redux/Zustand message cache oluşturulmaz.

Oturum kapatma, session expiration veya hesap değişiminde messages query
cache'i, feature memory state'i, object URL'ler ve conversation draft'ları
temizlenir. Mesaj gövdesi, attachment adı veya serbest arama metni analytics,
log, breadcrumb ya da URL'ye yazılmaz.

Restricted state de aynı private cleanup kapısını kullanır: in-flight message
query'leri iptal edilir, realtime subscription kapatılır, query cache
`messages` kök anahtarıyla kaldırılır, draft ve object URL temizliği idempotent
çalışır.

## 14. Route ve navigation

Rota typed search param kullanır:

```text
/hesabim/mesajlar?konusma=<opaque-id>
```

Kurallar:

- ID opaque, PII içermez.
- Geçersiz/erişilemeyen ID thread-not-found state verir; route çökmez.
- Session-expired ve restricted state bütün private rail/thread içeriğini
  bastırır.
- Loader prefetch yalnız cache ısıtır; list veya thread prefetch rejection'ı
  route error boundary'ye taşınmaz. Render-time query hatayı ilgili panelde
  gösterir.
- Desktop'ta seçim URL'yi değiştirir.
- Compact'ta Back param'ı kaldırır.
- Search/filter başlangıçta URL'ye yazılmaz; session state'te korunur.
- `routeTree.gen.ts` elle düzenlenmez.
- Global Header ve Dock yeniden üretilmez.

## 15. Etkileşim ve güvenlik

### 15.1 Unread

- Global/rail summary unread message değil unread conversation sayısıdır.
- Row unread durumu ağırlık + dot/count + accessible text ile verilir.
- Thread açılması bütün mesajları hemen read yapmaz.
- Mark unread menü eylemi sunulur.

### 15.2 Report ve block

İlk frontend sürümü mevcut overlay primitive'leriyle giriş noktası ve
doğrulanabilir akış sağlar:

- belirli mesajdan “Raporla”,
- seçili mesajın salt okunur önizlemesi,
- neden seçimi,
- ayrı “Bu kişiyi engelle” tercihi,
- success/error feedback.

Capability yoksa gerçek route'ta action gösterilmez. Storybook sözleşme
durumları callback ile gösterilebilir.

Engelleme sonucu:

- composer read-only olur,
- geçmiş görünür kalır,
- yeni mesaj gönderilmez,
- kullanıcıya somut sonuç metni gösterilir.

### 15.3 Safety notice

Safety event sunucudan gelirse mesaj yanında:

- riskin kısa nedeni,
- “Neden riskli?” açıklaması,
- platformda kalma önerisi,
- rapor action'ı

gösterilir. Frontend kendi başına regEx ile dolandırıcılık kararı vermez.

### 15.4 Text güvenliği

- Kullanıcı message body HTML olarak render edilmez.
- Plain text ve güvenli link tokenization kullanılır.
- `dangerouslySetInnerHTML` yoktur.
- URL'ler güvenli protocol allowlist'inden geçer.
- Telefon/e-posta maskeleme yalnız frontend gizleme sanılmaz; server policy
  sorumluluğu açık kalır.

## 16. Erişilebilirlik

### 16.1 Semantik

- tek `main#main-content`,
- tek `h1`,
- conversation rail `nav` + `ul/li`,
- aktif conversation linkinde `aria-current`,
- timeline accessible name'li `role="log"`,
- network/search/send durumları `role="status"`,
- gerçek kritik güvenlik hatası dışında assertive alert yok,
- icon-only controls zorunlu `label`,
- system/safety mesajları metinsel olarak ayrılır.

### 16.2 Focus

- `:focus-visible` yalnız
  `outline: var(--lg-focus-ring-width) solid var(--lg-accent)` ve token offset,
- selection focus değildir,
- compact Back sonrası conversation listesinde önceki selected row'a focus,
- drawer/modal kapanınca trigger'a focus,
- sanallaştırılan focus item overscan veya kontrollü restore ile kaybolmaz,
- composer ve focused control global Dock tarafından örtülmez.

### 16.3 Klavye

- Tab doğal DOM sırasını izler.
- Conversation ana linki Enter ile açılır.
- Row menu ayrı tab stop'tur.
- Escape açık transient menu/drawer'ı kapatır.
- Composer Enter/Shift+Enter/IME sözleşmesini korur.
- Send sonrası focus textarea'da kalır.
- Positive tabindex kullanılmaz.

### 16.4 Touch, reflow ve zoom

- coarse pointer kritik hedefler en az `--lg-control-md`,
- 320 CSS px genişlikte çift yönlü page scroll yok,
- %200 text zoom'da başlık, row ve composer işlev kaybetmez,
- status yalnız renkle verilmez,
- non-text sınırlar yeterli kontrast taşır.

### 16.5 Motion/transparency

- `prefers-reduced-motion` işlevsiz transition'ları kaldırır,
- `prefers-reduced-transparency` transient glass yüzeyleri opaklaştırır,
- scroll-to-latest reduced motion'da instant olur.

## 17. Component sınırı ve yeniden kullanım

Başlangıçta yeni generic library `GlassX` component'i çıkarılmaz. Feature şu
mevcut primitive'leri tüketebilir:

- `GlassAvatar`
- `GlassBadge`
- `GlassButton`
- `GlassIconButton`
- `GlassSearchField`
- `GlassSegmentedControl`
- `GlassDrawer`
- `GlassModal`
- `GlassMenu` veya `GlassContextMenu`
- `GlassAlert`
- `GlassSkeleton`
- `GlassEmptyState`
- `GlassFileUpload`
- `GlassTooltip`

Feature-local parçalar:

- `ConversationRail`
- `ConversationRow`
- `ThreadHeader`
- `MessageTimeline`
- `MessageItem`
- `MessageComposer`
- `AttachmentPreview`
- `ListingContextDrawer`
- `SafetyNotice`
- `ConnectionBanner`

Yalnız conversation ve message windowing için
`@tanstack/react-virtual` bağımlılığı gerekçelidir. Mevcut
`GlassInfiniteList` görünür load-more fallback'i için kullanılabilir fakat DOM
windowing yerine geçmez.

## 18. State matrisi

Workspace:

- session expired
- restricted
- loading
- ready
- empty inbox
- list error
- partial thread error
- invalid conversation
- reconnecting
- offline

Conversation rail:

- default
- unread
- archived
- search results
- no results
- load more
- load more error

Thread:

- selected
- no selection desktop
- loading
- long history
- listing closed
- blocked
- safety notice
- incoming while reading history

Send:

- idle
- attachment selected
- uploading
- scanning
- pending
- sent
- delivered
- read
- failed/retry
- rate limited

Hiçbir state yalnız spinner ile bütün sayfayı gizlemez. Thread error rail'i,
rail error cached thread'i kullanılmaz hale getirmez.

## 19. Storybook matrisi

Feature story title:

```text
Sayfalar/Hesabım/Enterprise Mesaj Merkezi
```

Zorunlu story'ler:

1. DefaultPaper
2. DefaultGraphite
3. UnreadConversations
4. EmptyInbox
5. SearchNoResults
6. WorkspaceLoading
7. ConversationListError
8. ThreadLoading
9. Reconnecting
10. OfflineWithDraft
11. FailedMessage
12. AttachmentScanning
13. BlockedConversation
14. ListingClosed
15. SafetyNotice
16. LongContent
17. CompactConversationList
18. CompactActiveThread
19. ReducedMotion
20. ReducedTransparency

Stories gerçek network timer'ı kullanmaz; deterministik props/fixtures ile
state gösterir.

## 20. Test stratejisi

### 20.1 Domain

- kişi × ilan kimliği,
- deterministic conversation sort,
- unread conversation count,
- Turkish search normalization,
- filter composition,
- optimistic enqueue,
- ack dedupe,
- monotonic delivery,
- failure/retry aynı client ID,
- out-of-order event,
- reconnect reconciliation,
- route search validation.

### 20.2 Component

- conversation selection ve `aria-current`,
- unread non-color cues,
- menu accessible name,
- timeline `role="log"`,
- prepend live-announcement suppression,
- user-in-history new message davranışı,
- Enter/Shift+Enter/IME,
- whitespace send engeli,
- draft per conversation,
- attachment disabled reason,
- failed message retry,
- blocked composer,
- drawer focus return.

### 20.3 Workspace/route

- gerçek route placeholder göstermez,
- tek main/h1,
- no-selection desktop,
- compact master-detail,
- typed `konusma` param,
- invalid ID state,
- global shell korunur,
- capability olmayan fake action render edilmez.

### 20.4 E2E ve visual

- desktop Paper/Graphite screenshots,
- compact list/thread screenshots,
- axe,
- keyboard-only flow,
- 320px overflow,
- 200% zoom,
- Dock/composer overlap,
- prepend scroll anchor,
- injected workspace/component testinde not-at-bottom incoming message,
- reduced motion E2E ve reduced transparency CSS contract,
- bounded rendered row count.

## 21. Kabul kriterleri

1. `/hesabim/mesajlar` placeholder yerine gerçek workspace render eder.
2. Sayfada tek main ve tek h1 vardır.
3. Global header/dock dışında yerel sidebar veya ikinci dock yoktur.
4. Aynı kişi iki ilan için iki ayrı doğru context'li conversation üretir.
5. Row; kişi, ilan, preview, zaman ve unread bilgisini taşır.
6. Aktif selection focus'tan bağımsız ve kalıcı görünür.
7. Conversation açmak görünmeyen mesajları otomatik read yapmaz.
8. Search/filter list scroll'unu kontrolsüz sıfırlamaz.
9. Eski mesaj prepend edildiğinde viewport zıplamaz.
10. Kullanıcı geçmişteyken incoming message scroll'u gasp etmez.
11. Optimistic message anında görünür fakat pending olduğu anlaşılır.
12. Ack/event duplicate message üretmez.
13. Failed message kaybolmaz; aynı client ID ile retry edilir.
14. Backend desteklemiyorsa delivered/read/typing/presence uydurulmaz.
15. Draft conversation değişiminde korunur.
16. Attachment state ve disabled nedeni görünürdür.
17. Blocked conversation geçmişi gösterir, composer read-only olur.
18. Safety uyarısı mesaj bağlamında, düz ve eyleme dönüktür.
19. Report ve block aynı belirsiz action değildir.
20. Paper/Graphite aynı bilgi ve interaction sözleşmesine sahiptir.
21. Feature CSS'i yalnız `--lg-*` tokenlarını tüketir.
22. Content surface'te blur, gradient, geniş shadow veya nested card yoktur.
23. 320px ve %200 zoom'da kritik işlev kaybolmaz.
24. Klavye, focus restore, role log/status ve 44px coarse hedefleri geçer.
25. Conversation/message DOM sayısı veri sayısıyla sınırsız büyümez.
26. Tam message cache kalıcı browser storage'a yazılmaz.
27. Session-expired/restricted state hiçbir private rail/thread içeriği
    göstermez; session draft ve message cache temizlenir.
28. Sanallaştırılmış rail ve timeline gerçek VoiceOver veya NVDA smoke testinde
    mantıksal okuma/focus sırasını korur.
29. Geçici attachment object URL'leri kaldırma, gönderim ve unmount sırasında
    serbest bırakılır.
30. Eski `src/pages/Mesajlar*` ve `GlassChatDock` API'si bozulmaz.
31. Route tree elle değiştirilmez.

## 22. Başarı ölçümü

Üretim entegrasyonunda izlenecek ürün/teknik sinyaller:

- conversation open başarısı,
- send success/failure/retry oranı,
- duplicate prevention sayısı,
- reconnect reconciliation sayısı,
- mark unread kullanımı,
- search no-result oranı,
- kullanıcı geçmişteyken gelen mesajlarda jump-to-latest kullanımı,
- attachment reject/scan failure,
- report/block tamamlanma oranı,
- rendered conversation/message node sayısı,
- composer input responsiveness,
- route/thread error oranı.

Telemetry message body, attachment içeriği, telefon, e-posta veya açık adres
toplamaz. Kimlikler ölçüm katmanında gerekli olduğunda pseudonymous olur.

## 23. Uygulama yaklaşımı

Uygulama sırası:

1. saf domain sözleşmesi ve state machine,
2. adapter/fixture,
3. conversation rail ve virtualization,
4. message timeline ve scroll contract,
5. composer/attachment/optimistic state,
6. header/drawer/safety actions,
7. workspace responsive orchestration,
8. route/search-param integration,
9. Storybook/rules,
10. E2E/performance/accessibility hardening.

Her adım kırmızı testle başlar, minimum uygulamayla yeşile gelir ve kapsamlı
doğrulama kapısıyla tamamlanır. Production backend entegrasyonu ayrı iş olarak
adapter portuna bağlanır; görsel implementasyon socket veya server varmış gibi
davranmaz.
