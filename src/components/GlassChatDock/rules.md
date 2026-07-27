---
name: GlassChatDock
category: overlay
status: hazır
lastReviewed: 2026-07-17
---

# GlassChatDock Kuralları

## 1. Amaç

İlan detay sayfasında sağ alt köşede sabit duran, ilanla ilgili soru-cevap
akışını taşıyan sohbet dock'u. Kapalıyken yüzen bir "Soru sor" kapsülü,
açıkken sohbet geçmişi + composer içeren küçük bir panel gösterir. AI-first
component: panelin tamamı yapay zekâ ürettiği içerik olduğu için "✦ AI"
rozeti başlıkta zorunlu ve daima görünür.

- **Kullan:** ilan detay sayfasında kalıcı, sayfa boyunca erişilebilir tekil
  bir sohbet giriş noktası.
- **Kullanma:** tam ekran/blocking soru-cevap akışı (→ `GlassModal` içine
  gömülü form), tek seferlik bildirim (→ `GlassToast`), kalıcı yan panel
  navigasyonu (→ `GlassDrawer`).

| İlgili | Farkı |
|---|---|
| `GlassModal`/`GlassDrawer` | Modal overlay: portal, focus trap, scroll kilidi, backdrop tıklaması kapatır. ChatDock BUNLARIN HİÇBİRİNİ taşımaz — arka plan her zaman etkileşimli kalır, dock modal değil "kalıcı widget" desenidir. |
| `GlassToast` | Geçici, kendiliğinden kapanan tek yönlü bildirim; ChatDock çift yönlü, kalıcı bir sohbet arayüzü. |
| `GlassMatchScore` | Aynı AI-first rozet kontratını paylaşır (bkz. §9) ama tekil skor kartı; ChatDock çok mesajlı, etkileşimli bir akış. |

## 2. Semantik sözleşme

- Kök: `<div>` (`display:contents` — kendi kutusu yok, `position:fixed`
  çocukları viewport'a göre konumlanır; `className` bu köke uygulanır).
- Kapalı: gerçek `<button aria-haspopup="dialog">` — accessible name görünür
  "Soru sor" metninden gelir (`✦` ikonu `aria-hidden`).
- Açık: panel `role="dialog"` + `aria-labelledby` (görünür `title`'a bağlı).
  **`aria-modal` YOK** — bu bilinçli bir karar: panel modal değil, focus trap
  yok, arka plan her zaman etkileşimli kalır (`GlassPopover`'daki "non-modal
  dialog sözleşmesi" ile aynı karar, bkz. o component'in yorumu).
- Mesaj listesi: `role="log" aria-live="polite"` — yeni mesajlar (kullanıcı
  veya AI) otomatik duyurulur; liste `role="list"` DEĞİL, çünkü sıralı bir
  envanter değil, akan bir kayıt (log) semantiği taşınıyor.
- Portal YOK, focus trap YOK, scroll kilidi YOK — Modal/Drawer/Toast'ın
  paylaştığı overlay sözleşmesine kasıtlı olarak dahil değil (bkz. §7 ve
  kontrat notu). `position: fixed` doğrudan ana ağaçta render edilir.
- Escape dinleyicisi `document` üzerinde DEĞİL, panel kapsayıcısının
  (`role="dialog"` olan `<motion.div>`) `onKeyDown`'unda tanımlıdır — yalnız
  panel içi bir hedef (textarea, kapat butonu, …) odaktayken tetiklenir.
  Sayfadaki başka bir katmanın (ör. arama kutusu) kendi Escape dinleyicisiyle
  çakışıp odak çalması böylece engellenir (bkz. §7).
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — görünür "✦ AI" metni
  AT için yeterince açıklayıcı olmadığından geçersiz kılınır (kontrat: tüm
  AI component'lerinde birebir aynı, bkz. `GlassMatchScore`).
- Her mesaj balonunun konuşmacısı yalnız görsel hizalamayla (sağ/sol) + mini
  ✦ işaretiyle ayırt edilmez — `role="log"` bölgesini dinleyen ekran
  okuyucu için de duyurulur: mesaj metninin başına görsel-gizli (`srOnly`)
  "Siz: " (kullanıcı) / "Asistan: " (AI) öneki eklenir (regresyon, bkz. test
  dosyası).
- Mesaj id'leri (`message.id`) hiçbir DOM `id` özniteliğine yazılmaz —
  yalnız React `key` olarak kullanılır; dışarıdan gelen ham veri id'sinin
  DOM'a sızması (çakışma/geçersiz seçici riski) böylece engellenir.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| launcher | ✅ (yalnız kapalıyken) | `✦` ikon + "Soru sor" metni | Gerçek `<button>`, flat kapsül — `GlassIconButton` KULLANILMAZ (spec kararı) |
| header | ✅ (yalnız açıkken) | `title` + AI rozeti + kapat butonu | Rozet koşulsuz, her zaman render edilir |
| messages | ✅ | `messages[]` → balon listesi | Boş dizi → boş liste (placeholder metni yok, spec'te istenmedi) |
| disclaimer | ✅ | `disclaimer` metni | Panelin altına sabit, her zaman görünür |
| composer | ✅ | `<textarea>` + gönder butonu | Enter gönderir, Shift+Enter satır ekler |

Children kabul edilmez — tamamen prop güdümlü (`GlassMatchScore`/`GlassRating`
ile aynı karar).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| messages | prop | `GlassChatDockMessage[]` | — (zorunlu) | — | `{ id, role: 'user'\|'ai', text, pending? }` |
| onSend | prop | `(text: string) => void` | — (zorunlu) | — | Trimlenmiş, boş olmayan metinle çağrılır |
| open | prop | `boolean` | — | ✅ | Verilirse controlled |
| defaultOpen | prop | `boolean` | `false` | — | Yalnız uncontrolled başlangıç |
| onOpenChange | prop | `(open: boolean) => void` | — | — | Her açma/kapama isteğinde çağrılır (controlled reddi mümkün) |
| title | prop | `string` | `'İlan Asistanı'` | — | Panel accessible name kaynağı |
| placeholder | prop | `string` | `'Bir soru yaz…'` | — | Yalnız görsel placeholder — accessible name sabit "Mesajınız" |
| disclaimer | prop | `string` | `'Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir.'` | — | Panelin altında sabit satır |
| className | prop | `string` | — | — | Köke birleştirilir |

Ref hedefi yok. `onSend` yalnız `open` durumundan bağımsız var olur (panel
kapalıyken de prop olarak geçerlidir, çağrılması yalnız açıkken mümkündür
çünkü composer yalnız açıkken render edilir).

## 5. Seçenek eksenleri

`material`/`tone`/`variant`/`thickness`/`prominent` eksenleri **N/A** — bu
component'te hiçbiri yok. İçerik katmanı tamamen flat, tek bir görsel biçim.

| Yasak / türetilen | Davranış |
|---|---|
| `open` + `defaultOpen` birlikte | `open !== undefined` her zaman kazanır (standart controlled/uncontrolled önceliği) |
| `message.pending=true` | `message.text` yok sayılır, "yazıyor" göstergesi render edilir |
| boş/yalnız boşluk `onSend` girişi | Hiç çağrılmaz — trim edilip boşsa sessizce yok sayılır |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| açık/kapalı | `open` (controlled) ?? iç state (`defaultOpen`) | launcher ⇄ panel | panel varlığı/yokluğu |
| taslak metin (`draft`) | tamamen iç state, dışarı sızmaz | — | — |
| odak hedefi | `userTriggeredRef` — yalnız BU component'in kendi `setOpen` çağrısı (launcher/kapat/panel-içi Escape) tetiklerse açılışta input'a taşınır; bayrak tüketilmeden bir görev turu (setTimeout 0) içinde kendiliğinden sona erer (bkz. §7) | açılışta: dışarıdan programatik `open` değişimi (odak taşımaz), reddedilen bir isteğin DAHA SONRA ilgisiz bir nedenle kabul edilmesi (bayrak süresi dolduğu için odak taşımaz) | — |
| odak hedefi (kapanış) | kullanıcı tetiklediyse (`userTriggeredRef`) OTOMATIK, DEĞİLSE `panelRef.contains(document.activeElement)` — programatik (controlled) kapanış anında odak hâlâ panel içindeyse yine launcher'a taşınır | odak asla body'ye düşmez; panel dışına zaten odaklanmışsa (ör. sayfanın başka bir yerine tıklanmış) dokunulmaz | — |
| mesaj pending | `message.pending` | `message.text` | `srOnly` "yazıyor" metni (`role="log"` bölgesinde duyurulur) |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

Katman sırası: `open` (kapalıyken panel hiç render edilmez) → `message.pending`
(mesaj bazında metni bastırır) → render.

## 7. Davranış

- **Neden overlay değil:** Modal/Drawer/Toast'ın paylaştığı "portal + focus
  trap + scroll kilidi + kapanışta tetikleyiciye focus dönüşü" sözleşmesi
  BİLİNÇLİ OLARAK uygulanmaz. ChatDock modal bir diyalog değil, sayfanın
  köşesinde yaşayan kalıcı bir widget — kullanıcı panel açıkken arkadaki
  ilan içeriğini okumaya/kaydırmaya devam edebilmeli (spec: "Panel overlay
  DEĞİL, arka plan etkileşimi kapanmaz"). Bu yüzden: body scroll kilidi yok,
  backdrop yok, dış tıklama kapatmaz, focus trap yok (Tab, panel dışına
  serbestçe çıkabilir).
- **Odak yönetimi (en kritik davranış):** `GlassModal`/`GlassDrawer`'daki
  "her `open=true` geçişinde koşulsuz odak taşı" deseni BURADA
  KULLANILMAZ — çünkü bu component controlled açılabilir ve dışarıdan
  programatik bir `open` değişimi (ör. sayfa yüklenirken `open` prop'unun
  `true` başlaması, ya da ilgisiz bir state güncellemesi) kullanıcının
  yazmakta olduğu başka bir alandan odağı çalmamalı. Bunun yerine:
  `userTriggeredRef` yalnız bu component'in kendi `setOpen` çağrısı
  (launcher tıklaması, kapat butonu, panel-içi Escape) sırasında `true` olur
  ve hemen ardından tüketilir; yalnız bu durumda açılışta `<textarea>`'ya
  odak taşınır. Controlled modda parent isteği reddedip `open`'ı
  değiştirmezse bayrak tüketilecek bir `isOpen` değişimi hiç olmaz — bu
  durumda bayrağın süresiz askıda kalıp DAHA SONRA gelen tamamen ilgisiz bir
  `open` geçişinde yanlışlıkla tüketilmesini (ve kullanıcının o an başka bir
  alanda yazdığı odağı çalmasını) önlemek için bayrak, tüketilmeden bir görev
  turu içinde (`setTimeout(…, 0)`) kendiliğinden sıfırlanır — normal senkron
  kabul/red akışını etkilemez, yalnız gecikmiş/ilgisiz geç geçişlerde koruma
  sağlar. Bkz. test dosyası: "controlled modda dışarıdan open=true/false→true
  ile odak taşınmaz" ve "parent reddedip daha sonra ilgisiz bir nedenle
  open=true yaparsa odak çalınmaz" senaryoları.
  Kapanış tarafında ise davranış daha geniş: kullanıcı tetiklediyse (kapat/
  panel-içi Escape) OTOMATIK olarak launcher'a odaklanır; kullanıcı
  tetiklemese bile (controlled `open` prop'u parent tarafından programatik
  olarak `false` yapılırsa) `document.activeElement` o an panel içindeyse
  (ör. kullanıcı `<textarea>`'ya yazarken parent paneli kapatırsa) odak yine
  launcher'a taşınır — odak asla body'ye "düşmez". Panel dışına zaten
  odaklanmış durumdaysa (kullanıcı başka bir alana tıklamışsa) bu davranış
  dokunmaz. Bkz. test: "controlled modda programatik kapanış anında odak
  panel içindeyse launcher'a taşınır" senaryosu.
- **Escape kapsamı (regresyon):** dinleyici `document` üzerinde DEĞİL, panel
  kapsayıcısının `onKeyDown`'undadır — yalnız panel içi bir hedef odaktayken
  tetiklenir; kapanışı işledikten sonra `e.stopPropagation()` çağrılır,
  böylece olay üst katmanlara (ör. sayfadaki bir arama kutusunun kendi
  Escape dinleyicisi) sızmaz. IME kompozisyonu sürerken (`isComposing`/
  `key==='Process'`) Escape yok sayılır — kompozisyon adayını iptal etmek
  için kullanılabildiğinden panel yanlışlıkla kapanmaz. Escape her zaman
  kapatır (`dismissible=false` gibi bir kapıyı kapatma seçeneği yok —
  spec'te istenmedi, panel içindeyken her zaman kapatılabilir).
- Yeni mesaj eklendiğinde (`messages` referansı değiştiğinde) liste
  **koşullu** dibe kayar — **davranışsal**, `scrollIntoView` ya da
  `behavior: 'smooth'` KULLANILMAZ (spec: "smooth değil"). Panel yeni
  açıldığında koşulsuz dibe kayar (henüz okunan bir geçmiş yok). Sonraki her
  `messages` değişiminde ise: `scrollHeight - scrollTop - clientHeight < 48`
  (kullanıcı zaten dibe yakınsa) VEYA son mesajın `role`'ü `'user'`
  (kullanıcının kendi gönderdiği mesaj her zaman görünür olmalı) ise dibe
  kayar; aksi halde (geçmişi yukarı kaydırıp okuyan bir kullanıcı, yeni bir
  AI mesajı geldiğinde) liste **zıplatılmaz** — konum korunur (regresyon,
  bkz. test dosyası).
- Composer: `Enter` → gönderir (`preventDefault` + `onSend` + alanı
  temizler); `Shift+Enter` → varsayılan davranış korunur (`preventDefault`
  çağrılmaz), textarea'ya yeni satır eklenir. Gönder butonu taslak boşken
  `disabled`. IME kompozisyonu sürerken (`isComposing`/`keyCode 229`)
  basılan Enter kompozisyonu onaylar, `onSend` tetiklemez — taslağın
  erken/eksik gönderilmesini önler.
- Dokunmatik: launcher/kapat/gönder `pointer: coarse`'ta ≥44px hedefe
  yükselir.
- Responsive: breakpoint yok — panel `min(360px, 100vw - 2·space-6)` ×
  `min(480px, 100dvh - 2·space-6)` içsel akışkan sınırla dar viewport'ta
  kenar boşluklarını koruyarak kendiliğinden daralır/kısalır.

## 8. İçerik kuralları

- `title` kısa kalmalı (varsayılan "İlan Asistanı") — başlık satırında AI
  rozeti ve kapat butonuyla paylaşılan dar alanda tek satırda ellipsis'e
  düşer.
- Mesaj metinleri uzun olabilir — balon `overflow-wrap: anywhere` ile sarar,
  liste dikey kaydırılabilir (bkz. UzunIcerik story).
- Mesaj metni `white-space: pre-wrap` taşır — composer'da `Shift+Enter` ile
  eklenen satır sonları balonda da korunur, tek satıra çökmez (regresyon,
  bkz. `GlassChatDock.module.css` `.bubble`).
- `disclaimer` her zaman görünür kalmalı — AI çıktısının bağlayıcı olmadığı
  uyarısı kaldırılamaz/gizlenemez (prop olarak metni özelleştirilebilir ama
  satırın kendisi koşulsuz render edilir).
- AI rozeti metni sabit "✦ AI" — çağıran tarafından özelleştirilemez
  (kontrat: tüm AI component'lerinde birebir aynı görünmeli).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| launcher/panel zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-capsule`(launcher)/`--lg-radius-card`(panel) | — |
| başlık/metin | color | `--lg-label` | — |
| ikincil metin (disclaimer, ai mesaj arkaplanı türetimi) | color | `--lg-label-secondary` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassMatchScore` ile birebir kopya |
| user balonu | background | `color-mix(in srgb, var(--lg-accent) 18%, var(--lg-surface))` | metin yine `--lg-label` (kontrast: renkli metin değil, label token'ı) |
| ai balonu | background/border | `color-mix(in srgb, var(--lg-label) 5%, var(--lg-surface))` / `--lg-hairline` | — |
| gönder butonu | background/color | `--lg-accent` / `--lg-accent-contrast` | `:disabled` → opacity 0.4 |
| launcher/panel gölgesi | box-shadow | `--lg-shadow-md` (launcher) / `--lg-shadow-lg` (panel) | — |
| AI rozeti font-size | font-size | `--lg-text-badge` | kontrat: tüm AI rozetleri aynı token |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |

**Borç (raw):** mikro-geometri kökte yerel değişkenlerde toplandı
(`display:contents` üzerinden kalıtır): `--glass-chatdock-panel-width/height`
(360×480 spec sabiti — dar viewport'ta `min()` ile içsel akışkan sınır,
breakpoint yok), `--glass-chatdock-launcher-icon` (15px),
`--glass-chatdock-aimark-size/offset` (20px/2px ✦ işareti),
`--glass-chatdock-badge-pad-block/inline` (2px/7px rozet içi — kontrat
sabiti), `--glass-chatdock-bubble-corner` (4px konuşma balonu köşesi),
`--glass-chatdock-textarea-max` (96px), `--glass-chatdock-dot-size/pad`
(5px/2px typing noktaları). Ayrıca `z-index: 60` (z token'ı yok,
`GlassToast` ile aynı gerekçe/değer) ve "dipte sayılır" kaydırma eşiği
`48px` (davranışsal sabit, token ölçeğinde yok — bkz. §7). Dokunmatik 44px
hedefleri (launcher min-height, close, send, textarea min-height)
`pointer: coarse` bloklarında `--lg-control-md`'ye bağlandı — coarse'ta
token birebir 44px'tir, raw 44 kalmadı.

## 10. Storybook kapsamı

Var: Default, Playground, Konusma (interaktif demo — yerel state ile
mesaj gönderimi), Bekleme (pending "yazıyor" göstergesi), UzunIcerik,
Responsive (mobile1, tam genişlik alt yarı), Erişilebilirlik (docs
description'lı).

`Sizes`/`Variants`/`Temalar` ayrı story olarak yok: `size`/`variant`
ekseni tanımlı değil (tek sabit görsel biçim), tema toolbar'la otomatik
doğrulanır.

## 11. Test kabul kriterleri

- [x] kapalıyken yalnız launcher render edilir, panel/log yok
- [x] launcher tıklaması panel açar (dialog rolü, title accessible name), input odak alır
- [x] kapat butonu ve Escape paneli kapatır, odak launcher'a döner
- [x] controlled: dışarıdan `open=true` ilk render'de VE `false→true` değişiminde odak koşulsuz taşınmaz
- [x] controlled: launcher tıklaması yalnız `onOpenChange` çağırır, parent reddederse panel açılmaz
- [x] `defaultOpen` uncontrolled başlangıç durumunu doğru uygular
- [x] "✦ AI" rozeti başlıkta her zaman render edilir, `aria-label` ile adlandırılır
- [x] mesaj listesi `role="log" aria-live="polite"` taşır
- [x] user/ai mesajları metinleriyle render edilir
- [x] `pending` mesaj metin yerine "yazıyor" göstergesi render eder
- [x] yeni mesajda liste `scrollTop = scrollHeight` ile dibe kayar
- [x] Gönder butonu taslak boşken disabled, doluyken aktif
- [x] Enter trimlenmiş metinle `onSend` çağırır ve alanı temizler; boş/yalnız boşlukta çağırmaz
- [x] Shift+Enter `onSend` çağırmaz, varsayılan davranış (satır ekleme) korunur
- [x] document genelinde Escape paneli KAPATMAZ; yalnız panel içi bir hedefte (ör. textarea) Escape kapatır
- [x] panel içinde IME kompozisyonu sürerken Escape paneli kapatmaz
- [x] Escape kapanışı `e.stopPropagation()` çağırır — dış `document` dinleyicileri olayı almaz
- [x] controlled modda programatik kapanış anında odak panel içindeyse (ör. textarea) launcher'a taşınır, body'ye düşmez
- [x] kullanıcı geçmişi okurken (dipte değilken) yeni AI mesajı gelirse liste zıplatılmaz
- [x] kullanıcı dibe yakınken (48px eşiği altında) yeni mesaj gelirse liste dibe kaydırır
- [x] mesaj metninin başında görsel-gizli "Siz:"/"Asistan:" öneki ekran okuyucuya duyurulur
- [ ] mobil akışkan panel daralması + reduced-motion'da statik "…" görünümü (visual, Chrome)

## 12. Do / Don't

- ✅ AI rozetini her zaman göster — sohbetin tamamı yapay zekâ çıktısıdır,
  gizlenemez/opsiyonel yapılamaz.
- ✅ `onSend` içinde asenkron yanıtı `messages` dizisine yeni bir `pending`
  mesaj olarak ekleyip, yanıt gelince aynı id'yi `pending:false` + gerçek
  `text` ile güncelle — component kendi network/async durumunu yönetmez
  (çağıran sorumlu, `GlassTourScheduler.onRequest` ile aynı karar).
- ✅ Sayfa başına tek `GlassChatDock` kullan — birden fazla launcher aynı
  köşede çakışır.
- ❌ `GlassIconButton`'ı launcher için kullanma — spec kararı: kendi flat
  kapsül butonü çizilir (ikon-tek buton değil, ikon+metin kapsülü).
- ❌ Panel'e `aria-modal`/focus trap ekleme — bu component kasıtlı olarak
  non-modal; modal gerekiyorsa `GlassModal`/`GlassDrawer` kullan.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** `confidence`/`onFeedback`/`loading` (AI-first kontratının
genel bölümünde tanımlı opsiyonel eksenler) bu component'e BİLİNÇLİ OLARAK
eklenmedi — spec'in verdiği API tam ve kapalı (`messages`/`onSend`/
`open`/`defaultOpen`/`onOpenChange`/`title`/`placeholder`/`disclaimer`).
Gerekçe: (1) `loading` kavramı zaten mesaj bazlı `pending`/"yazıyor"
göstergesiyle karşılanıyor — ayrı bir üst seviye `loading` prop'u aynı
durumu iki farklı yoldan ifade eder; (2) `confidence` tekil bir skora
(`GlassMatchScore`) anlamlıdır, çok mesajlı bir sohbet akışının tek bir
güven değeri yoktur — mesaj başına confidence spec'te istenmedi ve
`GlassChatDockMessage` şekli (`id`/`role`/`text`/`pending`) sabit verildi;
(3) mesaj başına 👍/👎 geri bildirimi doğal bir v2 adayı ama spec'te
istenmedi, `GlassChatDockMessage`'ı genişletmeden eklenemez. AI-first
kontratının BU component için doğrudan geçerli/uygulanan kısmı: zorunlu
"✦ AI" rozeti (birebir kopya CSS) ve "AI çıktısı asla otomatik eylem
tetiklemez" ilkesi (gönderim yalnız kullanıcının açık `Enter`/tıklama
eylemiyle olur). İleride mesaj başına geri bildirim/güven eklenmek
istenirse `GlassChatDockMessage` genişletilip bu karar revize edilmeli.

## Changelog

- 2026-07-17: İlk sürüm — launcher/panel geçişi, controlled `open`, non-modal
  odak sözleşmesi (yalnız kullanıcı etkileşimiyle taşınan odak), `role="log"`
  mesaj listesi, pending "yazıyor" göstergesi (reduced-motion'da statik "…"),
  zorunlu AI rozeti.
- 2026-07-17: Review düzeltmesi — `userTriggeredRef` bayrağı artık
  tüketilmeden bir görev turu içinde kendiliğinden sona eriyor; reddedilen
  bir açma isteğinden sonra gelen ilgisiz/gecikmiş bir `open` geçişi artık
  odağı çalmıyor (bkz. §6, §7, regresyon testi). Ayrıca composer Enter
  işleyicisi IME kompozisyonu (`isComposing`/`keyCode 229`) sırasında
  `onSend` tetiklemiyor (bkz. §7).
- 2026-07-17: Codex review düzeltmesi — (1) Escape dinleyicisi `document`'tan
  panel kapsayıcısının `onKeyDown`'una taşındı (`e.stopPropagation()` ile
  birlikte), yalnız panel içi hedeflerde çalışır ve IME kompozisyonunu yok
  sayar; üst katmanlarla (ör. arama) artık çakışmıyor (bkz. §2, §7). (2)
  Kapanış anında `document.activeElement` panel içindeyse (programatik
  controlled kapanışlar dahil) odak launcher'a taşınıyor — artık body'ye
  düşmüyor (bkz. §6, §7). (3) Mesaj listesi artık koşulsuz değil, koşullu
  dibe kayıyor: kullanıcı zaten dipteyse (48px eşiği) VEYA son mesaj
  kullanıcıya aitse kayar, aksi halde geçmişi okuyan kullanıcı
  zıplatılmıyor (bkz. §7). (4) Her mesaj metninin başına görsel-gizli "Siz:
  "/"Asistan: " öneki eklendi — konuşmacı artık ekran okuyucuya da
  duyuruluyor (bkz. §2, §8). (5) Mesaj balonuna `white-space: pre-wrap`
  eklendi — `Shift+Enter` ile eklenen satır sonları artık korunuyor (bkz.
  §8). Tüm fix'ler için regresyon testleri eklendi.
