---
name: GlassTourPlanner
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTourPlanner Kuralları

<!-- Codex Dalga 4 konsolide raporu düzeltmeleri: reset imzası zaten
     yapılandırılmış tuple + JSON.stringify idi (değişmedi); children tip
     yolundan omit edildi; boş stops'ta onay butonu disabled; geri bildirim
     grubu role="group"/aria-labelledby; canlı bölge tamamlanınca da açık
     mesaj yayınlıyor. Bkz. §2-§7, §11 güncellemeleri. -->

## 1. Amaç

AI çoklu-ilan tur planı — kullanıcının seçtiği birden çok ilanı tek bir güne
dizen, yapay zekâ üretimi bir gezi rotası. Durakları dikey bir rotada sıra
numarası rozetli kartlar olarak gösterir (saat + başlık + süre), aralarında
ince bir ulaşım notu satırı taşır. AI-first component: içerik AI tarafından
üretildiği için "✦ AI" rozeti zorunlu ve daima görünür; AI çıktısı asla
otomatik eylem tetiklemediği için "Planı Onayla" butonu her zaman görünür
render edilir (`onConfirm` verilmese bile `disabled` kalır, gizlenmez).

v1'de sıralama **statik**: `onReorder` YOK — bu bilinçli bir tasarım kararı
(spec açık talimatı), sürükle-bırak/manuel yeniden sıralama v2 adayı (bkz.
Açık kararlar).

- **Kullan:** ilan detay/arama sonrası "seçtiğin ilanları gez" akışında AI'nın
  önerdiği çoklu-durak gezi planını sunmak.
- **Kullanma:** tek randevu planlama (→ `GlassTourScheduler`), genel
  zaman çizelgesi/süreç geçmişi (→ `GlassTimeline`), sıralanabilir/sürüklenebilir
  bir liste (bu component'te yok — v1 statik, bkz. Açık kararlar).

| İlgili | Farkı |
|---|---|
| `GlassTourScheduler` | Tekil ilan için görme randevusu talep formu (gün/saat/tip seçimi); TourPlanner ÇOKLU ilan için zaten üretilmiş, salt-okunur bir AI rotasıdır — form değil, onaylanacak bir çıktı. |
| `GlassTimeline` | Genel amaçlı dikey zaman çizelgesi (ton renkli nokta, AI sözleşmesi yok); TourPlanner sıra numaralı rozet + zorunlu AI rozeti/güven/geri bildirim/onay sözleşmesi taşır, dekoratif rail deseni ondan alınmıştır. |
| `GlassChatDock` | Serbest metin AI sohbeti; TourPlanner yapılandırılmış, tek seferlik bir plan çıktısıdır. |

## 2. Semantik sözleşme

- Kök: `<section aria-labelledby>` — görünür `date` metnine bağlanır (başlık
  hem tarihi hem de dolaylı olarak planı adlandırır, `GlassTourScheduler`nin
  `GlassSurface as="section"` kararıyla aynı sınıf, burada flat).
- Durak listesi: gerçek `<ol role="list">` > `<li role="listitem">`.
  `list-style: none` Safari'de liste semantiğini düşürdüğünden `role="list"`
  açıkça verilir (`GlassTimeline`/`GlassClimateRiskPanel` ile aynı desen).
  Liste `aria-label="{date} tur planı durakları"` taşır (metin tekrarı yok —
  başlık zaten yalnız tarihi taşıyor, listenin kendisi "durak" bağlamını
  ekler).
- Sıra numarası rozeti (`badge`) ve bağlantı çizgisi (`connector`) tamamen
  `aria-hidden` — konum bilgisi zaten native/explicit `listitem` sırasıyla
  ekran okuyucuya iletilir, sayı ikinci kez okutulmaz (`GlassTimeline`'daki
  ton noktası ile aynı karar).
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — görünür "✦ AI" metni AT
  için yeterince açıklayıcı olmadığından geçersiz kılınır (kontrat: tüm AI
  component'lerinde birebir aynı, bkz. `GlassMatchScore`/`GlassChatDock`).
- `confidence` metni ("%N güven") görünür düz metin — ayrı ARIA gerekmez.
- `loading=true`: durak listesi yerine tamamen `aria-hidden` skeleton +
  `role="status"` (`srOnly`) "Tur planı hazırlanıyor" metni. Zorunlu "✦ AI"
  rozeti skeleton başlığın yanında normal (aria-hidden OLMAYAN) şekilde
  render edilir — AI-first standardı yükleme durumunu istisna tutmaz;
  `confidence` metni ise loading placeholder'ında hiç gösterilmez (plan
  henüz hesaplanmadı).
- `role="status"` düğümü **HER ZAMAN** mount'lu (sonradan mount edilen canlı
  bölgeler ekran okuyucu tarafından duyurulmaz) VE metni her durumda AÇIK bir
  mesajdır — `loading` biterken boş string'e düşülmez: `stops` doluysa "Tur
  planı hazır", boşsa "Tur planında durak yok" (Codex Dalga 4 bulgusu:
  önceki sürümde tamamlanma metni boşaltılıyordu, durum geçişi güvenilir
  duyurulmuyordu).
- Geri bildirim buton grubu: görünür soru metni (`feedbackPrompt`) bir `id`
  taşır, buton sarmalayıcısı `role="group" aria-labelledby={id}` ile bu
  soruya bağlanır — `GlassAiFlagBanner`'daki gruplama deseniyle aynı (Codex
  Dalga 4 bulgusu: önceki sürümde görünür soru butonlarla programatik
  ilişkili değildi).
- "Planı Onayla": gerçek `<button type="button">`, **her zaman** DOM'da —
  `onConfirm` verilmezse `disabled` (buton yok sayılmaz/gizlenmez, AI
  çıktısının otomatik eylem tetiklememesi ilkesi görsel olarak sürekli
  hatırlatılır). `loading` sırasında da `disabled` (henüz onaylanacak bir
  plan yok).
- Geri bildirim: gerçek `<button aria-pressed>` (👍/👎), accessible name
  "Faydalı"/"Faydalı değil" — `GlassMatchScore` ile birebir aynı desen (bkz.
  o component'in §2 yorumu).
- Portal yok, ref forwarding yok (statik/kontrollü sunum kararı, diğer içerik
  katmanı component'leriyle tutarlı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| başlık | ✅ | `date` | Accessible name kaynağı (`aria-labelledby`) |
| AI rozeti | ✅ (her zaman) | "✦ AI" | Kontrat sabit CSS'i — component'ler arası birebir aynı |
| güven metni | — | "%N güven" | Yalnız `confidence` sonluysa VE `loading=false`'ken |
| toplam süre özeti | — | `totalNote` | Olduğu gibi gösterilir, component hesaplamaz |
| durak rotası | ✅ (`stops` boş değilse) | `stops[]` → sıra numaralı kartlar | `stops=[]` → sabit boş durum metni |
| ulaşım notu | — | `stop.travelNote` | Yalnız 2. ve sonraki duraklarda; ilk durakta yok sayılır |
| geri bildirim | — | 👍/👎 | Yalnız `onFeedback` verilirse VE `stops` boş değilken VE `loading=false`'ken |
| onay butonu | ✅ (her zaman) | "Planı Onayla" | `onConfirm` yoksa/`loading`sa/`stops` boşsa `disabled`, asla gizlenmez |

Children kabul edilmez — tamamen prop güdümlü (`GlassMatchScore`/
`GlassTourScheduler` ile aynı karar). Bu **tip düzeyinde** uygulanır:
`GlassTourPlannerProps`, `HTMLAttributes<HTMLElement>`'i `Omit<…, 'children'>`
ile genişletir — `children` prop olarak kabul EDİLMEZ (render edilmeyen bir
prop'un sessizce kaybolması yerine derleme zamanında engellenir; Codex
Dalga 4 bulgusu).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| stops | prop | `GlassTourPlannerStop[]` | — (zorunlu) | — | `{ id, title, time, duration?, travelNote?, image? }`; sıra numarası dizindeki konumdan türetilir |
| date | prop | `string` | — (zorunlu) | — | Başlık + accessible name kaynağı (ör. "Cmt 18 Tem") |
| totalNote | prop | `string` | — | — | Toplam süre özeti; component durak sayısından/saatlerinden KENDİ hesaplamaz |
| onConfirm | prop | `() => void` | — | — | "Planı Onayla" tıklanınca çağrılır; verilmezse VEYA `stops=[]` ise buton `disabled` (gizlenmez); handler'da da boşluk koruması var |
| confidence | prop | `number` | — | — | [0,100]'e clamp; sonlu değilse gizlenir (rozet yine görünür); `loading`da hiç gösterilmez |
| onFeedback | prop | `(value: 'up' \| 'down') => void` | — | — | Verilirse 👍/👎 butonları görünür |
| loading | prop | `boolean` | `false` | — | true → flat skeleton + `role="status"`, onay butonu disabled |
| ...rest | — | `Omit<HTMLAttributes<HTMLElement>, 'children'>` | — | — | `className`/`style` birleştirilir, köke (`<section>`) uygulanır; `children` tip düzeyinde kabul edilmez |

Ref hedefi yok. `onFeedback` her tıklamada çağrılır (aynı yöne tekrar tıklama
da dahil, toggle-off anında bile) — component kendi "gönderildi" durumunu
sunucuya iletmez. `date`/`stops` GERÇEKTEN değiştiğinde (içerik imzası — bkz.
§6) geri bildirim seçimi otomatik sıfırlanır.

## 5. Seçenek eksenleri

`material`/`tone`/`variant`/`size`/`thickness`/`prominent` eksenleri **N/A**
— bu component'te hiçbiri yok. İçerik katmanı tamamen flat, tek bir görsel
biçim; `onReorder` yokluğu nedeniyle `variant` gibi bir "düzenlenebilir mod"
ekseni de yok.

| Yasak / türetilen | Davranış |
|---|---|
| `stops` boş | Rota render edilmez, sabit metin: "Bu tur planında henüz durak eklenmemiş."; geri bildirim butonları render edilmez; onay butonu `disabled` |
| `stop.travelNote` ilk durakta verilmiş | Yok sayılır, render edilmez (önceki durak yok) |
| `confidence` aralık dışı/`NaN`/`Infinity` | [0,100]'e clamp; sonlu değilse hiç render edilmez (rozet yine görünür) |
| `loading=true` | `stops`/`totalNote`/`confidence`/`onFeedback` verilse de yok sayılır; yalnız skeleton + durum metni + (disabled) onay butonu |
| `onConfirm` verilmemiş | Buton DOM'da kalır, `disabled` — sahte/no-op tıklama üretilmez ama buton da gizlenmez (AI-first ilkesi) |
| `stops=[]` VE `onConfirm` verilmiş | Buton yine `disabled` — onaylanacak bir plan yoksa `onConfirm` asla tetiklenmez; tıklama handler'ı da (`stops.length === 0`) ikinci bir koruma katmanı olarak boşta döner (Codex Dalga 4 bulgusu) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| güven | `confidence` (normalize) | — | görünür metin, yalnız `loading=false`'ken |
| geri bildirim seçimi | dahili state (`feedback: 'up'\|'down'\|undefined`); aynı yöne tekrar tıklama toggle-off; `date`/`stops` içerik imzası değişince render sırasında otomatik `undefined`'a sıfırlanır | — | `aria-pressed`, `data-selected` |
| yükleme | `loading` prop | rota/toplam süre özeti/güven/geri bildirim tamamen (AI rozeti HARİÇ — bkz. §2) | `role="status"` |
| onay butonu aktifliği | `!onConfirm \|\| loading \|\| stops.length === 0` | tıklanabilirlik | native `disabled` (+ handler içinde boşluk koruması) |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

**İçerik imzası (feedback sıfırlama):** `JSON.stringify({ date, stops:
stops.map(s => [s.id, s.time, s.title, s.duration ?? null, s.travelNote ??
null]) })` bir önceki render'ın imzasıyla (ref) karşılaştırılır; farklıysa
geri bildirim seçimi render sırasında (ekstra effect turu olmadan) sıfırlanır
— `GlassMatchScore`'daki `value`/`criteria` imzasıyla aynı desen. Referans
eşitliği değil İÇERİK eşitliği kontrol edilir.

Katman sırası: `loading` (varsa AI rozeti hariç her şeyi bastırır) → `stops`
(boşsa boş durum metni, dolu duraklar içerik imzasının parçası) → render.

## 7. Davranış

- Sıra numarası, `stops` dizisindeki KONUMDAN türetilir (`i + 1`) — `stop.id`
  hiçbir zaman DOM `id`'sine yazılmaz, yalnız React `key` olarak kullanılır
  (ham veri id'sinin DOM'a sızıp ARIA IDREF/`querySelector` çakışması riski
  oluşturmaması için, `GlassNearbyPlaces`/`GlassTimeline` ile aynı karar).
- `stop.travelNote` yalnız `i > 0` iken render edilir — ilk durağın "önceki
  duraktan" notu anlamsızdır, veri hatalı verilse bile component kendini
  savunur (render edilmez).
- Geri bildirim butonları: `onFeedback` verilmezse hiç render edilmezler.
  Tıklamada `onFeedback(direction)` çağrılır ve tıklanan yön
  `aria-pressed="true"` olur; diğer yön otomatik `false`'a döner. Zaten
  seçili olan yöne TEKRAR tıklama seçimi geri alır (toggle); `onFeedback` bu
  tıklamada da çağrılır — component yalnız görsel seçimi yönetir.
- Geri bildirim seçimi `date`/`stops` GERÇEKTEN değiştiğinde (içerik imzası —
  §6) otomatik sıfırlanır; aksi halde farklı bir plana geçilse bile eski
  "faydalı" işareti ekranda asılı kalırdı.
- "Planı Onayla": tıklamada `stops.length === 0` ise handler hiçbir şey
  yapmadan döner (boş plan asla onaylanamaz — Codex Dalga 4 bulgusu: eskiden
  `stops=[]`iken `onConfirm` varsa buton aktif kalıp boş plan callback'i
  tetikleyebiliyordu); aksi halde YALNIZ `onConfirm?.()` çağrılır — component
  kendi "onaylandı" durumunu tutmaz/göstermez (iyimser onay ekranı YOK, bu
  `GlassTourScheduler`'dan bilinçli bir sapma: TourPlanner zaten üretilmiş
  bir planı ONAYLAMAK için var, yeni bir kayıt/randevu YARATMIYOR — onay
  sonrası UI'ı göstermek tamamen çağırana bırakılır, ör. sayfa geçişi/toast).
  `onConfirm` verilmemişse VEYA `stops` boşsa buton `disabled` — component
  sahte bir "başarı" göstermez, ama AI çıktısının onay affordance'ı görsel
  olarak asla kaybolmaz (AI-first ilkesi: kullanıcı her zaman "bunu
  onaylayabilirim" seçeneğini görür, gerçekte tıklanabilir olup olmaması
  ayrı bir katman). `disabled` native davranışı tıklamayı zaten engeller;
  handler içindeki `stops.length === 0` kontrolü programatik tetiklemeye
  (ör. test/otomasyon, `disabled` bypass) karşı ikinci bir koruma katmanıdır.
- `loading`: skeleton içeriği tamamen `aria-hidden`; `role="status"` düğümü
  ekranokuyucuya "Tur planı hazırlanıyor" duyurur; `loading` `false`'a
  döndüğünde AYNI düğüm boşaltılmaz, `stops` doluysa "Tur planı hazır",
  boşsa "Tur planında durak yok" mesajıyla güncellenir — durum geçişi HER
  ZAMAN açık bir mesajla duyurulur (Codex Dalga 4 bulgusu: eskiden
  tamamlanınca metin boşaltılıyordu). Skeleton animasyonu yalnız `opacity`
  (shimmer/gradient yok, kendi flat placeholder'ı).
- Geri bildirim sorusu (`feedbackPrompt`) ile buton grubu `role="group"
  aria-labelledby` ile programatik olarak ilişkilendirilir — ekran okuyucu
  kullanıcısı buton grubuna girdiğinde hangi soruya cevap verdiğini duyar
  (Codex Dalga 4 bulgusu: eskiden yalnız görsel yakınlık vardı).
- Odak taşıma yok — component hiçbir zaman kendiliğinden odak almaz/taşımaz.
- Responsive: kart konteynerin genişliğine uyar; durak kartları
  `overflow-wrap: anywhere` ile uzun başlıklarda sarar. Dokunmatik: geri
  bildirim/onay butonları `pointer: coarse`'ta 44px'e yükselir.

## 8. İçerik kuralları

- `date` kısa kalmalı ("Cmt 18 Tem") — başlık satırında AI rozetiyle
  paylaşılan alanda `overflow-wrap: anywhere` ile sarar.
- `stop.title` uzun olabilir, kart `overflow-wrap: anywhere` ile sarar (bkz.
  UzunIcerik story). `stop.time`/`stop.duration` format serbest, component
  doğrulama/parse yapmaz (tabular hizalanır ama string olarak taşınır).
- `totalNote` component tarafından KESİNLİKLE hesaplanmaz — çağıran gerçek
  toplam süreyi (trafik, mola vb. dahil) kendi hesaplayıp string olarak
  geçirir; verilmezse özet satırı hiç render edilmez.
- AI rozeti metni sabit "✦ AI" — çağıran tarafından özelleştirilemez
  (kontrat: tüm AI component'lerinde birebir aynı görünmeli).
- "Planı Onayla" buton metni sabit — i18n borcu (bkz. §9).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök/durak kartı zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | — |
| başlık | color | `--lg-label` | — |
| ikincil metin (totalNote, süre, ulaşım notu) | color | `--lg-label-secondary` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassMatchScore`/`GlassChatDock` ile birebir kopya |
| sıra numarası rozeti | background/color | `color-mix(in srgb, var(--lg-accent) 14%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | dekoratif, `aria-hidden` |
| bağlantı çizgisi | background | `--lg-hairline` | — |
| durak görseli | border-radius | `--lg-radius-media` | — |
| onay butonu | background/color | `--lg-accent` / `--lg-accent-contrast` | `:disabled` → opacity 0.4 |
| geri bildirim butonu | border/background/radius | `--lg-hairline`/`--lg-surface`/`--lg-radius-capsule` | `aria-pressed=true` → `--lg-accent` tint |
| skeleton | background | `color-mix(... var(--lg-label) 8% ...)` | `loading` |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |

**Borç (raw):** rail genişliği 26px, sıra numarası rozeti çapı 24px, durak
görseli 48px, `.stopTitle` font-size 14px (tasarım sistemi ölçeğinde yok —
`GlassTimeline .title` ile aynı gerekçe/değer), AI rozeti font-size
10.5px/700 (kontrat sabiti), skeleton satır yüksekliği 56px, "Planı Onayla"/
"Bu plan faydalı mıydı?"/"Bu tur planında henüz durak eklenmemiş." metinleri
hardcoded Türkçe (i18n borcu, kütüphane genelinde tutarlı).

## 10. Storybook kapsamı

Var: Default, Playground, GeriBildirim (`onFeedback` var/yok karşılaştırması),
OnaySozlesmesi (`onConfirm` var/yok — buton her iki durumda da görünür),
Yukleniyor (`loading`), TekDurak (bağlantı çizgisi/travelNote yokluğu),
UzunIcerik, Responsive (mobile1 + dokunmatik hedefler), Erişilebilirlik (docs
description'lı).

`Sizes`/`Variants`/`Temalar` ayrı story olarak yok: `size`/`variant` ekseni
tanımlı değil (tek sabit görsel biçim), tema toolbar'la otomatik doğrulanır.

## 11. Test kabul kriterleri

- [x] `date` başlığıyla `<section aria-labelledby>` render eder, durak
  listesi `role="list"` + doğru sayıda `listitem` (saat/başlık/süre metniyle)
- [x] AI rozeti daima render edilir; `confidence` geçerliyse metin eklenir,
  sonlu değilse gizlenir
- [x] `totalNote` verilirse görünür, verilmezse hiç render edilmez
- [x] `travelNote` yalnız 2. ve sonraki duraklarda render edilir; ilk durakta
  verilse bile gösterilmez
- [x] "Planı Onayla" butonu her zaman render edilir; `onConfirm` yoksa
  `disabled`, varsa tıklamada çağrılır
- [x] `loading=true` iken liste yerine skeleton + `role="status"` durum
  metni; AI rozeti yine görünür, güven metni gösterilmez, onay butonu
  `disabled`
- [x] geri bildirim butonları `onFeedback`'i doğru yönle çağırır +
  `aria-pressed` görsel seçimi işaretler; verilmezse hiç render edilmez
- [x] aynı yöne tekrar tıklama seçimi geri alır (toggle)
- [x] geri bildirim seçimi `date`/`stops` içerik imzası değişince otomatik
  sıfırlanır
- [x] boş `stops` dizisinde liste render edilmez, sabit boş durum metni
  gösterilir
- [x] `role="status"` düğümü her zaman mount'lu; `loading` biterken metin
  boşalmaz — `stops` doluysa "Tur planı hazır", boşsa "Tur planında durak
  yok" duyurulur
- [x] geri bildirim buton grubu `role="group"` ile görünür soruya
  `aria-labelledby` üzerinden bağlanır
- [x] `stops=[]` iken `onConfirm` verilmiş olsa bile "Planı Onayla"
  `disabled` kalır ve tıklama `onConfirm`'i tetiklemez
- [x] `stops=[]` iken `onFeedback` verilmiş olsa bile geri bildirim
  butonları render edilmez
- [ ] `:focus-visible` halkası ve dokunma hedefi ≥44px (visual, Chrome)
- [ ] reduced-motion'da skeleton animasyonunun kapanması (visual)

## 12. Do / Don't

- ✅ AI rozetini her zaman göster — planın tamamı yapay zekâ çıktısıdır.
- ✅ "Planı Onayla" butonunu HER ZAMAN render et — `onConfirm` yoksa
  `disabled` yap, ama gizleme (AI-first ilkesi: otomatik eylem yok, kullanıcı
  onayı için görünür bir affordance her zaman olmalı).
- ✅ `totalNote`'u kendin (gerçek trafik/mola dahil) hesapla — component
  durak sayısından/saatlerinden bir toplam ÜRETMEZ.
- ✅ `onConfirm` içinde gerçek onay/kayıt akışını başlat (ör. API çağrısı,
  sayfa geçişi) — component kendi "onaylandı" ekranını göstermez.
- ❌ `onReorder`/sürükle-bırak ekleme beklentisiyle kullanma — v1 sabit
  sıralama (spec kararı, bkz. §1 ve Açık kararlar).
- ❌ `stops` boşken component'i "her zaman dolu" varsayımıyla kullanma — boş
  durumda sabit metin gösterir, hata fırlatmaz.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** `onReorder`/sürükle-bırak ile manuel yeniden sıralama (v1
BİLİNÇLİ OLARAK dışarıda bırakıldı — spec'in açık talimatı: "onReorder YOK
(v1 statik)"); onay sonrası component-içi "Onaylandı" durumu (şu an tamamen
çağırana bırakıldı, `GlassTourScheduler`'ın iyimser onay ekranından BİLİNÇLİ
bir sapma — TourPlanner yeni bir kayıt yaratmıyor, var olan bir planı
onaylıyor); `stop.image` yoksa görsel alanı için sabit bir placeholder ikon
(şu an görsel tamamen render edilmiyor, alan yeniden akıyor); durak başına
maksimum sayı/uzunluk sınırı.

## Changelog

- 2026-07-17: Codex Dalga 4 konsolide rapor düzeltmeleri — `children`
  `Omit<HTMLAttributes<HTMLElement>, 'children'>` ile tip düzeyinde
  kaldırıldı; `stops=[]` iken "Planı Onayla" `onConfirm` verilse bile
  `disabled` (+ handler'da boşluk koruması); geri bildirim buton grubu
  `role="group" aria-labelledby` ile görünür soruya bağlandı; `role="status"`
  canlı bölgesi `loading` bitince metni boşaltmak yerine açık "Tur planı
  hazır"/"Tur planında durak yok" mesajı yayınlıyor. (İçerik imzası zaten
  yapılandırılmış tuple + `JSON.stringify` kullanıyordu, değişiklik yok.)
- 2026-07-17: İlk sürüm — dikey rota (sıra numaralı rozet + bağlantı
  çizgisi), duraklar arası ulaşım notu, zorunlu AI rozeti + opsiyonel güven
  metni, her zaman görünür (gerekirse disabled) "Planı Onayla" onay butonu,
  👍/👎 geri bildirim, flat `loading` placeholder. `onReorder` v1'de
  bilinçli olarak yok.
