---
name: GlassIslandHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-24
---

# GlassIslandHeader Kuralları

## 1. Amaç

Apple Dynamic Island tarzı genişleyen üst başlık: kapalıyken üst-ortada
marka + zil taşıyan bir cam hap; hover'da genişleyip "Şu an: <sayfa> ·
<saat>" durum chip'ini gösterir; tıklayınca "Nereye gitmek istersin?" hızlı
gezinme paneline morph eder (sayfa kartları → alt navigasyon + `extras` +
`search` slotları). Kaynak: public-site reposundaki `DynamicIslandHeader`
primitive'inin bu tasarım sistemine uyarlaması.

- **Kullan:** uygulamanın tek üst seviye başlığı — marka, geçerli sayfa
  durumu ve hızlı gezinme tek adada.
- **Kullanma:** sayfa içi başlık çubuğu (→ `GlassNavbar`), sabit görünür tam
  menü (→ `GlassHeader`), komut arama (→ `GlassCommandPalette`).

| İlgili | Farkı |
|---|---|
| `GlassHeader` | Klasik, her zaman görünür yatay menü çubuğu; IslandHeader kapalıyken minimal hap, gezinme talep üzerine açılır. |
| `GlassNavbar` | Sayfa-içi başlık (geri + başlık + eylemler), scroll edge; IslandHeader viewport'a sabit uygulama başlığıdır. |
| `GlassDock` | Alt-kenarda varsayılan sürekli açık LiquidDock; legacy morph opt-in. IslandHeader marka/durum/panel taşır. |
| `GlassCommandPalette` | Klavye odaklı komut arama overlay'i; IslandHeader'ın `search` slotu ona/`GlassAiSearchBar`'a delege edebilir. |

## 2. Semantik sözleşme

- Kök: fixed konumlu `<div>` (genişlik geçişini taşır) → içinde
  `GlassSurface` (cam ada; kapalıyken capsule, açıkken 28px radius).
- Hap satırı etkileşimsiz bir yerleşim kapsayıcısıdır. Tam yüzeyi kaplayan
  trigger gerçek `<button aria-label="Hızlı gezinme" aria-haspopup="dialog"
  aria-expanded>`; opsiyonel marka `<a>`sı ve zil `<button>`u trigger'ın
  semantik kardeşleridir. İç içe etkileşimli öğe yoktur.
- `href` verilen marka/sayfa/alt öğeler gerçek `<a>` olarak render edilir.
  Modifiyesiz aynı-origin tıklama opsiyonel `onRoute` ile SPA router'a
  delege edilir; modifier/harici/yeni sekme native davranışı korur.
- Panel: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (görünür
  "Nereye gitmek istersin?" başlığına bağlı). Açılış odağı kapat düğmesine
  taşır; Tab/Shift+Tab odağı panel içinde sarar. Backdrop tıklaması kapatır.
- Zil: gerçek `<button>`, `aria-label` okunmamış sayıyı içerir
  ("Bildirimler, 3 okunmamış"); rozet `aria-hidden`.
- Durum chip'i: `aria-label="Şu an: <tam etiket/yol>"`. `auto` modunda
  gizlilik `visibility` ile yönetilir (coarse-pointer SSR/no-JS görünümü
  accessible kalır); açık `hover` modunda sarmalayıcı ayrıca
  `aria-hidden` alır. Genişlik 0 iken içerik ölçüm için DOM'da kalır.
  Üç ve üzeri yol basamağında görsel özet `ilk › … › son` olur; tam yol
  accessible name'de korunur.
- Escape dinleyicisi `document` üzerinde DEĞİL, kök kapsayıcının
  `onKeyDown`'unda — yalnız başlık/panel içi bir hedef odaktayken çalışır,
  IME kompozisyonunda yok sayılır (`GlassChatDock` ile aynı karar).
- Portal YOK — fixed konum doğrudan ana ağaçta.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| brand | ✅ | `brandIcon` + `brandLabel` | Her durumda görünür; `brandHref` varsa ana sayfa bağlantısıdır |
| statusChip | Koşullu | canlı nokta + "Şu an: …" + saat | `statusLabel` veya salt-okunur `statusTrail`; `statusVisibility` görünürlüğü yönetir |
| bell | Opsiyonel | zil + rozet | Yalnız `onNotificationsClick` verilince render edilir |
| panelHeader | ✅ (açıkken) | başlık + kapat | Başlık panel accessible name kaynağı |
| cards / subView | ✅ (açıkken) | `pages` kartları ⇄ seçili sayfa + `subNav` | Alt navigasyonsuz sayfa doğrudan gezinir |
| extras | Opsiyonel | serbest `ReactNode` | Dil/tema/oturum eylemleri; panel alt şeridi |
| search | Opsiyonel | serbest `ReactNode` | En alt şerit; `GlassAiSearchBar` ile kompozisyon önerilir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| brandIcon | prop | `ReactNode` | — (zorunlu) | — | Marka ikonu |
| brandLabel | prop | `string` | — (zorunlu) | — | Marka metni + durum chip fallback'i |
| brandHref | prop | `string` | — | — | Markayı gerçek bağlantı yapar |
| pages | prop | `GlassIslandHeaderPage[]` | — (zorunlu) | — | `{ key, label, icon, href?, target?, rel? }` |
| subNav | prop | `Record<string, GlassIslandHeaderSubItem[]>` | — | — | Sayfa → alt öğeler; boş/eksik sayfa doğrudan gezinir |
| activeKey | prop | `string` | — | — | Durum chip etiketi + kart göstergesi |
| statusLabel | prop | `string` | — | — | Chip metnini geçersiz kılar |
| statusTrail | prop | `readonly string[]` | — | — | Etkileşimsiz kısa kategori/rota özeti; statusLabel'dan öncelikli |
| statusVisibility | prop | `'auto'\|'always'\|'hover'\|'hidden'` | `'auto'` | — | Auto: fine pointer hover/focus, coarse sürekli |
| showClock | prop | `boolean` | `true` | — | tr-TR SS:DD, 30 sn'de bir tazelenir |
| initialTime | prop | `Date\|string\|number` | — | — | SSR ile eşleşen deterministik ilk saat |
| timeZone | prop | `string` | — | — | IANA zaman dilimi |
| open | prop | `boolean` | — | ✅ | Verilirse controlled |
| defaultOpen | prop | `boolean` | `false` | — | Yalnız uncontrolled başlangıç |
| onOpenChange | prop | `(open) => void` | — | — | Her açma/kapama isteğinde |
| notificationCount | prop | `number` | `0` | — | 0 ise rozet çizilmez |
| onNotificationsClick | prop | `() => void` | — | — | Verilirse zil render edilir |
| extras | prop | `ReactNode` | — | — | Panel alt şeridi slotu |
| search | prop | `ReactNode` | — | — | Panel en alt arama slotu |
| onNavigate | prop | `(pageKey, subKey?) => void` | — | — | Seçimde çağrılır; panel kapanır |
| onRoute | prop | `(href) => void` | — | — | Modifiyesiz aynı-origin linkleri SPA router'a delege eder |
| className | prop | `string` | — | — | Fixed köke birleştirilir |

Ref hedefi yok.

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`variant` eksenleri **N/A** — cam malzeme
`GlassSurface` üzerine bileşenin açıkça verdiği `tier="fallback"`,
`thickness={0.55}` ve `blur(14px) saturate(180%)` sabitidir; tek
boyut/biçim kullanılır.

| Yasak / türetilen | Davranış |
|---|---|
| `open` + `defaultOpen` birlikte | `open !== undefined` kazanır |
| `subNav[key]` boş dizi | Alt görünüm açılmaz, doğrudan `onNavigate(key)` |
| `notificationCount` > 0 + `onNotificationsClick` yok | Zil hiç çizilmez (sayı tek başına anlamsız) |
| `statusLabel` verilmiş | `activeKey` etiketi bastırılır |
| `statusTrail` dolu | `statusLabel` ve `activeKey` etiketi bastırılır |
| `statusVisibility='hidden'` | Durum chip'i DOM'a hiç eklenmez |
| Sayfa `href` + dolu `subNav[key]` | Mevcut disclosure davranışı kazanır; kart button kalır |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| açık/kapalı | `open` ?? iç state | hap genişliği ⇄ panel varlığı; kapanışta `selected` sıfırlanır | `aria-expanded`, dialog varlığı |
| seçili sayfa (`selected`) | iç state, dışarı sızmaz | kart ızgarası ⇄ alt görünüm | — |
| hap hover / focus-within | birbirinden bağımsız iç state; hover yalnız `(hover:hover) and (pointer:fine)` | ikisinden biri sürerken durum chip genişliği korunur | `data-visible`; auto'da CSS `visibility`, açık hover modunda `aria-hidden` |
| saat (`now`) | 30 sn interval; `showClock=false` iken interval kurulmaz | — | — |
| odak (açılış) | dialog açılır | odak kapat düğmesine taşınır; Tab/Shift+Tab panel içinde sarar | `aria-modal="true"` |
| odak (kapanış) | odak panel içindeyse hapa iade | odak body'ye düşmez | — |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media (hover:hover) and (pointer:fine)` |

## 7. Davranış

- **Üç aşamalı hap:** kapalı (260px) → hover (550px, durum chip'i açılır) →
  panel (580px). Genişlikler `min(vw)` sınırlıdır. Hover boyut değişimi
  anlık layout + Motion FLIP `transform` projeksiyonuyla 220ms'de çizilir;
  her kare `width` animasyonu yapılmaz. Dokunmatikte hover aşaması yok —
  chip hep görünür, hap geniş başlar.
- Durum chip'i üç kolonun tamamına yayılan merkez katmanında geometrik
  olarak tam ortalanır; marka için ayrılan simetrik güvenli alan chip'in
  marka/zille çakışmasını önler. Chip içeriği kompakt `inline-flex` akar:
  durum noktası, breadcrumb ve saat arasında yalnız spacing token'ı kalır;
  sabit meta kolonları veya içeriğin solunda yapay rezerv üretilmez.
- Durum chip doğal genişliği ölçüm tabanlıdır: içerik kısa süreli
  `max-content` ölçüm modunda doğal genişliğini verir; fontlar hazır
  olduğunda ölçüm yenilenir. Ölçülen genişlik layout hedefidir; görünürlük
  yalnız 180ms `opacity + translateY(2px)` geçişiyle değişir.
- Hover ve focus-within ayrı tutulur: pointer adadan ayrıldığında klavye
  odağı içerideyse, ya da odak ayrıldığında pointer içerideyse ada kapanmaz.
- `statusVisibility="auto"` için coarse-pointer görünümü yalnız hydration
  state'ine bırakılmaz: aynı geniş hap + görünür chip CSS media kuralıyla
  SSR/no-JS ilk boyasında da üretilir; React mount sonrasında durumu devralır.
- Saat ilk SSR render'ında `initialTime` yoksa `--:--` üretir; istemci mount
  sonrası canlı saate geçer. `initialTime` + `timeZone` server/client
  çıktısını deterministik yapar.
- Tam-yüzey trigger tıklaması/Enter/Space ile toggle olur; marka bağlantısı
  ve zil ayrı etkileşim hedefleridir, paneli açmaz.
- Panel: backdrop tıklaması, kapat butonu ve (başlık içi odakta) Escape
  kapatır. Açılışta odak panel içindeki kapat düğmesine taşınır; Tab odağı
  panel içinde sarar. Açık kaldığı sürece `body` + `documentElement`
  overflow kilidi arka sayfanın wheel/touch scroll'unu engeller ve kapanışta
  önceki inline değerleri aynen geri yükler. Kapanış gerçekten
  gerçekleştiğinde Kapat/Escape odağı
  hapa döndürür; controlled parent kapanışı reddederse modal ve odak içeride
  kalır. Controlled programatik kapanışta odak panel içindeyse yine hapa
  iade edilir (body'ye düşmez).
- Kart akışı: alt navigasyonu olan sayfa → alt görünüm (diğer sayfalar chip
  şeridi + seçili kart + alt öğe ızgarası); olmayan sayfa → `onNavigate` +
  kapanış. Alt öğe → `onNavigate(pageKey, subKey)` + kapanış. Panel her
  kapanışta kart ızgarasına sıfırlanır.
- Animasyon: panel `height 0 ⇄ auto` spring (`presets.springs.sidebar`),
  görünüm geçişleri kısa y+opacity; canlı nokta ping keyframe'i.
  `prefers-reduced-motion`'da hepsi kısa opacity/geçişsiz.
- Ada genişliği sürekli morph ettiği için bu component kendi sınırında
  `fallback` tier kullanır ve kaynak header ile aynı `blur(14px)
  saturate(180%)` malzemesini sabitler. Boyuta bağlı SVG displacement
  filtresi genişlik geçişi sırasında yeniden üretilmez; böylece Chromium
  compositor'ında arka planın boşalması ve her karede map hesaplanması
  önlenir.
- Dokunma hedefi: zil/kapat HER cihazda `--lg-control-hit`e (44px) ulaşır —
  görünür ölçü `--lg-control-sm` (imleçlide 36px), fark görünmez `::after`
  taşmasıyla kapanır. Kart/alt öğe min yükseklikleri kontrol token'larından.
- Responsive: breakpoint yok — genişlikler `min(vw, px)`, panel gövdesi
  `max-height: 100dvh - 2rem` içinde dikey kaydırılır.

## 8. İçerik kuralları

- `brandLabel` kısa (tek kelime/alan adı) — hap dar durumda marka + zil ile
  paylaşılır, sarmaz.
- `statusTrail` üç veya daha fazla basamak içeriyorsa görsel yol
  `ilk › … › son` olarak sıkıştırılır; tam yol `aria-label` içinde kalır.
  Son basamak ya da `statusLabel` kalan güvenli alanı aşarsa tek satır CSS
  ellipsis ile kesilir. Chip daima adanın geometrik merkezinde kalır.
- Kart etiketi 1-2 kelime; kart ızgarası `auto-fill minmax(140px)` ile TR
  uzun kelimelerde satır kırar.
- Panel başlığı sabit "Nereye gitmek istersin?" — accessible name kaynağı
  (özelleştirme ihtiyacı doğarsa prop'a açılmalı, bkz. Açık kararlar).
- Saat `tr-TR` biçiminde; lokalizasyon gerekirse `showClock=false` +
  `statusLabel` ile dışarıdan yönetilir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| cam ada | — | `GlassSurface` (capsule ⇄ 28, thickness 0.55) | component-scope fallback tier + sabit blur/saturate; rim/gölge GlassSurface'ta |
| backdrop | background | `color-mix(var(--lg-label) 20%, transparent)` | — |
| marka ikonu | color | `--lg-accent` | — |
| metinler | color/font-size | `--lg-label`/`--lg-label-secondary`; caption/footnote/headline token'ları | — |
| durum chip'i | bg/border/radius | `color-mix(var(--lg-surface) 30%)`/`--lg-hairline`/`--lg-radius-capsule` | — |
| canlı nokta | background | `--lg-success` | reduced-motion'da ping kapalı |
| zil/kapat | boyut/bg | `--lg-control-sm` görünür + `--lg-control-hit` hedef (`::after`)/surface color-mix | hover yalnız `@media (hover:hover) and (pointer:fine)` |
| rozet | bg/text | `--lg-danger`/`--lg-on-scrim` | — |
| kartlar/alt öğeler | bg/border/radius | surface–label color-mix'leri/`--lg-hairline`/`--lg-radius-media`/`--lg-radius-chip` | aktif nokta `--lg-success` |
| boşluklar | padding/gap | `--lg-space-*` | — |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |

**Dokunma hedefi (2026-08-03):** Ada `GlassSurface` olduğu için
`overflow: hidden` taşır; buna rağmen görünmez `::after` taşması UYGULANABİLİR,
çünkü taşma yüzeyin dışına değil dolgusunun içine düşer. Zil için taşma 4px ve
hap satırının dikey dolgusu (`--lg-space-2`, 8px) bunu kapsar; kapat butonu
için taşma yine 4px ve panel başlığının dolgusu (12-16px) fazlasıyla yeterli.
Eski `@media (pointer: coarse)` büyütmeleri kaldırıldı — token dokunmatikte
zaten 44px verdiği için `min()` taşmayı kendiliğinden 0'a indiriyor. Kapalı hap
satırı bu değişiklikle imleçli cihazda 60px'ten 52px'e indi.

**Borç (raw):** mikro-geometri kökte yerel değişkenlerde:
`--glass-island-w-closed/hover/open` (260/550/580 min(vw) — içerik uyarlaması),
`--glass-island-radius-open` (28px — card token'ı 20px'ten
bilinçli büyük, kaynak birebir), nokta/rozet ölçüleri (6/8/16px, rozet
font 9px — badge token'ı 11px altı, kaynak birebir), divider 12px,
durum chip'i için marka güvenli alanı 100px (≤340px'te ikon-only 36px), panel
max-height `100dvh - 2rem`. FLIP 220ms ve chip 180ms güçlü ease-out
eğrileri; `z-index: 65/70` — z token'ı yok, dock (60) üstünde kalması
bilinçli.

## 10. Storybook kapsamı

Var: Default, Playground, AcikPanel (extras + `GlassAiSearchBar`
kompozisyonu), Bildirimli, OzelDurum (statusLabel + showClock=false),
DurumYoluVeSsrSaati, UzunDurumYolu (`ilk › … › son` + son etiket
ellipsis), RotaBaglantilari, UzunIcerik, Responsive (mobile1),
Erisilebilirlik.

`Sizes`/`Variants` ayrı story olarak yok: eksen tanımlı değil.

## 11. Test kabul kriterleri

- [x] kapalıyken hap (`aria-haspopup`, `aria-expanded=false`) var, panel yok
- [x] durum chip'i "Şu an: <aktif sayfa>" duyurur; `statusLabel` geçersiz kılar
- [x] `statusTrail` önceliği, görünürlük eksenleri ve deterministik SSR saati
- [x] 3+ basamakta `ilk › … › son`, tam accessible name ve uzun son etikette ellipsis
- [x] status chip geometrik merkezi + marka güvenli alanı + kompakt iç akış
- [x] hover ve focus-within birbirini bastırmadan açık durumu korur
- [x] coarse pointer SSR/no-JS ilk boyasında durum chip'i görünür
- [x] marka/sayfa/alt öğe `href` semantiği + aynı-origin `onRoute` delegasyonu
- [x] trigger, marka bağlantısı ve zil semantik kardeştir; nested interactive yoktur
- [x] zil yalnız `onNotificationsClick` ile render edilir; sayıyı `aria-label`'da duyurur; tıklaması paneli açmaz
- [x] hap tıklaması paneli açar (modal dialog, görünür başlığa bağlı ad,
  açılış odağı ve Tab sarma)
- [x] açık panel arka sayfa scroll'unu kilitler, kapanışta stilleri geri yükler
- [x] kapat/Escape kapatır, odak hapa döner; document Escape kapatmaz
- [x] controlled: açılış/kapanış parent reddi + programatik kapanışta odak iadesi
- [x] alt navigasyonsuz kart doğrudan `onNavigate` + kapanış
- [x] alt navigasyonlu kart alt görünümü açar; alt öğe `onNavigate(page, sub)` + kapanış
- [x] alt görünümden başka sayfaya doğrudan geçiş
- [x] yeniden açılışta kart ızgarasına sıfırlanma
- [x] `extras`/`search` slotları yalnız açıkken render
- [ ] hap genişleme/chip reveal (visual, Chrome)

## 12. Do / Don't

- ✅ `search` slotuna `GlassAiSearchBar` ver — arama davranışı (öneriler,
  loading, confidence) orada yaşar; header yalnız yerleşim sağlar.
- ✅ `extras`'a `GlassButton`/dil seçici gibi hazır kontroller koy.
- ✅ Sayfa başına tek IslandHeader — iki fixed ada üst üste biner.
- ✅ `GlassDock` ile birlikte kullanılabilir (üst + alt kenar) — z-index
  sıralaması buna göre ayarlandı (header 70 > dock 60).
- ❌ Panel içine ikinci bir cam yüzey (GlassSurface) koyma — cam üstüne cam
  yasak; kart/şerit zeminleri color-mix türevleridir.
- ❌ Backdrop açıkken odağı panel dışına kaçırma — modal dialog sözleşmesi
  açılış odağı ve Tab/Shift+Tab sarma gerektirir.
- ❌ Zili bildirim paneli sanma — panel v1'de yok, tıklama dışarı delege
  edilir (bkz. Açık kararlar).

**Açık kararlar:** (1) Kaynaktaki gömülü AI arama akışı (thinking stages,
sahte cevap, mini bar chart) TAŞINMADI — bu sistemde arama davranışı
`GlassAiSearchBar`'ın sorumluluğu, header `search` slotuyla kompoze eder
(tek sorumluluk + AI-first kontratı zaten orada). (2) Kaynaktaki bildirim
paneli (popover) v1'e alınmadı — `onNotificationsClick` dışarı delege
eder; ihtiyaç doğarsa `notificationsPanel` slotu eklenebilir. (3) Kaynak
breadcrumb'lı `statusChipContent` yerine etkileşimsiz `statusTrail` alındı;
gerçek linkli breadcrumb içerik yüzeyinde kalmalı. (4) Panel
başlığı sabit metin — lokalizasyon ihtiyacında prop'a açılmalı.

## Changelog

- 2026-07-24: Durum chip'indeki 45px simetrik meta kolonları kaldırıldı;
  canlı nokta, breadcrumb ve saat ölçüm tabanlı kompakt `inline-flex` akışa
  geçirildi. Chip ada merkezinde kalırken sol taraftaki yapay boşluk ve marka
  çakışması giderildi.
- 2026-07-24: Backdrop davranışıyla uyumlu modal dialog sözleşmesine geçildi;
  açılış odağı, `aria-modal` ve iki yönlü Tab sarma eklendi.
- 2026-07-24: Native `href`/`onRoute`, `brandHref`, salt-okunur
  `statusTrail`, `statusVisibility`, SSR-uyumlu `initialTime`/`timeZone`;
  marka-trigger-zil nested interactive yapısı semantik kardeşlere ayrıldı.
- 2026-07-24: İlk sürüm — public-site `DynamicIslandHeader` uyarlaması:
  üç aşamalı hap (kapalı/hover/panel), ölçüm tabanlı durum chip reveal'ı,
  canlı saat, zil rozeti, sayfa kartları → alt navigasyon akışı, `extras`/
  `search` slotları, controlled `open`, non-modal odak sözleşmesi.
- 2026-08-03: Yeni kontrol ölçeğine uyarlandı. Zil ve kapat butonlarının
  `pointer: coarse` büyütmeleri kaldırılıp görünmez `::after` dokunma hedefi
  taşmasıyla değiştirildi (36px görünür / 44px hedef, her cihazda). Kapalı hap
  satırı imleçli cihazda 60px → 52px.
