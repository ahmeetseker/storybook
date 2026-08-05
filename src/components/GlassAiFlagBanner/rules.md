---
name: GlassAiFlagBanner
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassAiFlagBanner Kuralları

## 1. Amaç

İlan detay sayfasının en üstünde, bir ilanın yapay zekâ moderasyonu
tarafından incelemeye alındığını duyuran tam genişlik yatay bant. Önem
derecesi (`severity`) + kısa gerekçe + tespit edilen madde listesiyle
"şüpheli ilan işareti"ni özetler. AI-first component: bandın TÜM içeriği
(başlık, açıklama, gerekçeler) doğrudan bir AI moderasyon çıktısı olduğu
için "✦ AI" rozeti koşulsuz ve daima görünür (GlassAiSummaryCard ile aynı
karar — bkz. §9).

- **Kullan:** ilan detay sayfasının üst kısmında AI moderasyon/şüpheli ilan
  duyurusu; satıcıya veya alıcıya "bu ilan incelendi" bilgisini akış içinde
  (overlay değil) iletmek.
- **Kullanma:** genel amaçlı durum bildirimi (başarı/hata/bilgi, AI kaynağı
  olmayan) → `GlassAlert`; çoklu doğrulama sinyali listesi (EİDS/tapu/AI
  moderasyon bir arada) → `GlassTrustSignalPanel`; AI özet paragrafı +
  artı/eksi → `GlassAiSummaryCard`; kesin karar bekleyen kesinti → `GlassModal`.

| İlgili | Farkı |
|---|---|
| GlassAlert | Genel amaçlı banner, AI kaynağı yok, rozet/güven/geri bildirim/yükleme sözleşmesi taşımaz; rol her zaman `status`/`alert` ikilisinden biri (burada `info`/`warning` rolsüz statik) |
| GlassTrustSignalPanel | Çoklu ayrık sinyal listesi (`role="list"`), yalnız `aiGenerated=true` işaretli satırlarda rozet; FlagBanner tek bir bandın TAMAMI AI çıktısıdır |
| GlassAiSummaryCard | Serbest metin özet + artı/eksi kolonları; FlagBanner tek severity + kısa gerekçe listesine odaklanan daha dar/uyarı amaçlı bir bant |

## 2. Semantik sözleşme

- Kök: `<div>` — statik bir bilgilendirme bandı, ayrık bir doküman bölümü
  (`section`/`article`) değil (GlassAlert ile aynı karar).
- Rol yalnız `severity="danger"` için `role="alert"` (assertive): kullanıcının
  hemen bilmesi gereken yüksek riskli tespit — ekran okuyucu mevcut
  konuşmayı keser. `info`/`warning` **hiçbir rol taşımaz** (statik içerik) —
  spec'in bilinçli kararı: `GlassAlert`'in `info/success→status,
  warning/danger→alert` ikili ayrımından FARKLI olarak burada yalnız
  `danger` canlı bölge sayılır, `warning` akışı kesecek kadar acil
  sayılmamıştır.
- Severity ikonu bilgi taşır (dekoratif DEĞİL): `role="img"` + sabit
  `aria-label` (`'Bilgi'`/`'Uyarı'`/`'Tehlike'`) — anlam asla yalnız renkle
  taşınmaz.
- AI rozeti: `<span aria-label="Yapay zekâ üretimi">✦ AI</span>` —
  kontrattaki tanıma birebir, koşulsuz görünür (loading dahil).
- Kapatma butonu: gerçek `<button>` + `aria-label="Kapat"`.
- "Ayrıntılar": gerçek `<button type="button">` — düz metin linki gibi
  stillenir (spec: "metin aksiyonu"), `GlassButton` değil (banner içi ikinci
  bir cam/dolu buton maliyeti gereksiz).
- Geri bildirim düğmeleri `role="group"` + `aria-label="Bu tespit faydalı
  mıydı?"` içinde, her biri `aria-pressed` ile seçili durumunu duyurur.
- `loading=true`: `div[aria-busy="true"]`, gerçek açıklama/gerekçe/aksiyonlar
  yerine `aria-hidden` dekoratif placeholder render edilir. AI rozeti
  KAYBOLMAZ. Duyuru: her zaman mount'lu bir `aria-live="polite"` (`.srOnly`)
  bölge — hiç yüklenmemiş bir mount'ta boş, `loading=true` iken "Yapay zekâ
  incelemesi yükleniyor", `loading` `true`→`false` geçişinde "Yapay zekâ
  incelemesi tamamlandı" metnini alır (sonradan mount edilen `aria-live`
  bölgeler bazı ekran okuyucularda kaçabilir, bu yüzden koşulsuz mount;
  yalnız "yükleniyor"u boşaltıp sessiz kalmak tamamlanma geçişini de
  kaçırır — Codex bulgusu, bkz. §11/Changelog).
- Portal yok, ref forwarding yok — tamamen prop güdümlü/sunum. `children`
  kabul edilmez: `HTMLAttributes<HTMLDivElement>`'ten `'title' | 'children'`
  tip düzeyinde `Omit` edilir (render ETMEME değil, TİP düzeyinde dışlama —
  yanlışlıkla `children` geçirilirse derleme zamanında hata verir).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| icon | ✅ (otomatik) | severity SVG'si | `role="img"`, sabit `aria-label`, renk `--flag-color` |
| title | ✅ (default var) | `string` | Kalın; her zaman render edilir |
| AI rozeti | ✅ (koşulsuz) | `✦ AI` | Loading dahil her zaman görünür, kopya CSS (bkz. §9) |
| confidence etiketi | yalnız finite `confidence` | `"%N güven"` | Rozetin yanında görünür metin |
| description | — | `string` | Verilmezse render edilmez |
| reasons | — | `string[]` | `<ul><li>` madde listesi; boş/undefined ise render edilmez |
| "Ayrıntılar" | yalnız `onDetails` | metin aksiyonu | `GlassButton` değil, düz metin buton |
| geri bildirim | yalnız `onFeedback` | 👍/👎 | `aria-pressed`, karşılıklı dışlar |
| dismiss | yalnız `onDismiss` | × butonu | `aria-label="Kapat"`, 44px coarse hedef |
| placeholder | yalnız `loading=true` | — | `aria-hidden`, flat/parıltısız, rozet hariç her şeyin yerine geçer |
| loading duyurusu | her zaman mount'lu | — | `aria-live="polite"`; `loading=true`→"yükleniyor", `true`→`false` geçişinde "tamamlandı", hiç yüklenmemişse boş |

Children kabul edilmez — tamamen prop güdümlü; `GlassAiFlagBannerProps`
`HTMLAttributes<HTMLDivElement>`'ten `children`'ı tip düzeyinde `Omit` eder
(yanlışlıkla geçirilirse derleme hatası verir, sessizce yutulmaz).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| severity | prop | `'info'\|'warning'\|'danger'` | `'warning'` | — | Zemin/ikon rengini ve rolü belirler |
| title | prop | `string` | `'Bu ilan yapay zekâ tarafından incelemeye alındı'` | — | Her zaman render edilir |
| description | prop | `string` | — | — | Kısa gerekçe paragrafı |
| reasons | prop | `string[]` | — | — | Madde listesi; boş dizi/undefined render edilmez |
| confidence | prop | `number` (0-100) | — | — | AI rozetinin yanında "%N güven"; sonlu değilse gizlenir, aralık dışıysa clamp |
| onDetails | event | `() => void` | — | — | Verilirse "Ayrıntılar" metin aksiyonu görünür |
| onDismiss | event | `() => void` | — | — | Verilirse × butonu görünür; görünürlük yönetimi çağırana ait (component kendi kendine kapanmaz) |
| onFeedback | event | `(value: 'up'\|'down') => void` | — | — | Verilirse 👍/👎 düğmeleri görünür |
| loading | prop | `boolean` | `false` | — | AI-first yükleme placeholder'ı; rozet hariç gerçek içeriği bastırır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title`, `children` hariç) | — | — | `className` birleştirilir, kalanı köke geçer; `children` tip düzeyinde kabul edilmez |

Ref hedefi yok. Geri bildirim seçili durumu component içinde tutulur
(`useState`); dışarıya controlled bir `value` sözleşmesi açılmaz — yalnız
`onFeedback` callback'i (GlassAiSummaryCard ile aynı karar: aynı yöne tekrar
tıklama seçimi kaldırır/toggle eder, her tıklamada callback çağrılır).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `severity='warning'`, `title='Bu ilan yapay zekâ
tarafından incelemeye alındı'`, `loading=false`.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (tema light/dark/auto) | N/A — zemin/ikon rengi `severity`'den otomatik türer, override prop'u yok |
| `size` | N/A — spec'te istenmedi, tek sabit ölçek |
| `variant`/`thickness`/`prominent` | N/A — cam olmayan, tek anlam ekseni (`severity`) taşıyan component |

| Yasak / türetilen | Davranış |
|---|---|
| `confidence` sonlu değil/aralık dışı | Sonlu değilse (`NaN`/`Infinity`) tamamen gizlenir; aralık dışıysa [0,100]'e clamp edilir |
| `loading=true` | `description`/`reasons`/`onDetails`/`onFeedback` içeriği yok sayılır, sabit placeholder render edilir; `onDismiss` yine kullanılabilir (AI içeriğine bağlı değil, arayüz affordance'ı) |
| `severity` → rol | Yalnız `danger` → `role="alert"`; `info`/`warning` → rol yok (statik) — override prop'u yok |
| `reasons=[]` | Boş dizi de `undefined` gibi davranır — liste render edilmez |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| severity/ton | `severity` prop | — | `data-severity`; yalnız `danger` → `role="alert"` |
| geri bildirim seçimi | dahili `useState` | — | `aria-pressed` |
| yükleme | `loading` prop | description/reasons/onDetails/onFeedback | `aria-busy` |
| disabled/hover/focus/active | — | — | Banner geneli etkileşimsiz; yalnız dismiss/Ayrıntılar/geri bildirim düğmeleri odaklanabilir (`:focus-visible`) |

Katman sırası: severity (otomatik ton + rol) → render; `loading` gerçek
içeriği bastırır (rozet hariç, üstte). Geri bildirim seçimi salt görsel/yerel
state — dışarıya `value` olarak açılmaz.

**İçerik-imzalı reset:** `title`/`description`/`reasons` üçlüsü
`JSON.stringify([title, description ?? null, reasons ?? []])` ile
yapılandırılmış bir imzaya dönüştürülür ve önceki render'ın imzasıyla
(`useRef`, render-fazlı karşılaştırma) kıyaslanır; değişirse geri bildirim
seçimi (`selected`) sıfırlanır. Ayraçsız string birleştirme (`${a} ${b}`)
KULLANILMAZ — ör. `reasons=['AB']` ile `reasons=['A','B']` naif
`reasons.join('')` birleşiminde aynı `"AB"` stringine çakışıp farklı bir AI
tespitinin eski geri bildirimini miras alabilirdi (Codex bulgusu, bkz.
Changelog); `JSON.stringify` tuple alan/eleman sınırlarını korur.

## 7. Davranış

- Keyboard/pointer: banner geneli etkileşimsiz; yalnız dismiss/"Ayrıntılar"/
  geri bildirim düğmeleri `Tab`/`Enter`/`Space` ile native `<button>`
  davranışı taşır. Özel klavye deseni (roving tabindex, ok tuşu) gerekmez —
  hiçbir composite widget (tablist/radiogroup) rolü üstlenilmemiştir.
- Geri bildirim tıklaması aynı yöne tekrar tıklanınca seçimi kaldırır
  (toggle, `aria-pressed` `false`'a döner); her tıklamada (seçerken de
  kaldırırken de) `onFeedback` aynı `value` ile çağrılır (GlassAiSummaryCard
  ile birebir aynı karar).
- `onDismiss` verilirse × butonu görünür ve tıklanınca çağrılır; component
  kendi kendine DOM'dan kaybolmaz/gizlenmez — görünürlüğü (render edilip
  edilmeyeceği) çağıran state'i yönetir (`GlassAlert` ile aynı karar).
  `onDismiss` verilmezse × butonu hiç render edilmez, dolayısıyla banner
  kapatılamaz (spec: "verilmezse kapanmaz").
- AI çıktısı (severity, gerekçeler, güven yüzdesi) hiçbir otomatik eylem
  tetiklemez — yalnız bilgilendirme + kullanıcı onaylı `onDetails`/
  `onFeedback`/`onDismiss` aksiyonları.
- Responsive: banner konteynerin %100 genişliğine uyar; ≤480px'te dismiss
  butonu sağ üste yaslanır (`order: -1`), "Ayrıntılar"/geri bildirim alt
  satıra sarar (`flex-wrap`). Dismiss/geri bildirim düğmeleri
  `pointer: coarse`'ta 44px hedefe büyür (spec: sabit zorunlu, opsiyonel
  büyütme değil).
- Animasyon yalnız `loading` placeholder'ının opacity nabzı ve buton
  hover/focus geçişleri; `prefers-reduced-motion: reduce`'ta ikisi de kapanır.

## 8. İçerik kuralları

- `title` varsayılanı genel bir moderasyon mesajıdır ("Bu ilan yapay zekâ
  tarafından incelemeye alındı"); daha spesifik bir bulgu varsa (ör. "Bu ilan
  şüpheli bulundu") özel `title` verilmelidir.
- `description` tek-iki cümlelik gerekçe özeti; `reasons` somut, ölçülebilir
  maddeler olmalı ("İlan fiyatı bölge ortalamasının %38 altında") — genel
  ifadeler ("şüpheli görünüyor") yerine.
- `confidence` yalnız gerçekten ölçülmüş bir güven değeri varsa verilmeli —
  uydurulmuş/varsayılan bir yüzde asla gösterilmemeli (bu yüzden `undefined`
  varsayılanı yok, yalnız gizlenir).
- Uzun `title`/`description`/`reasons` metinleri sarar (`overflow-wrap:
  anywhere`); TR uzun bileşik kelimeler test edilmiştir (bkz. UzunIcerik
  story).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| root | background | `color-mix(in srgb, var(--flag-color) 9%, var(--lg-surface))` | `severity`'den otomatik (`--flag-color`) |
| root | border | `color-mix(in srgb, var(--flag-color) 28%, var(--lg-hairline))` | — |
| root | radius | `--lg-radius-media` | — |
| title | color | `--lg-label` | — |
| description/reasons/confidence metni | color | `color-mix(in srgb, var(--lg-label) 10%, var(--lg-label-secondary))` | Semantik renk metne SIZMAZ (kontrast dersi) — yalnız ikon/zemin/kenarlık `--flag-color` kullanır. Ham `--lg-label-secondary` banner'ın %9 tonlu zemininde ~4.2-4.4:1'e düşüyordu (Codex bulgusu); iki label token'ının karışımıyla tüm severity durumlarında ≥4.5:1'e koyulaştırıldı |
| icon | color/background | `color-mix(in srgb, var(--flag-color) 70%, var(--lg-label))` / `color-mix(in srgb, var(--flag-color) 16%, var(--lg-surface))` | `severity`'den otomatik. Ham `--flag-color` kendi %16 zemine karşı ~1.9-2.9:1'e düşüyordu (Codex bulgusu, anlam taşıyan grafik ≥3:1 eşiğini kaçırıyordu); diğer AI component'lerindeki "semantik %70 + label" desenine uyuldu |
| icon | boyut | `--lg-control-sm` | — |
| **aiBadge** (AI-first, kopya CSS) | background/color | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | Sabit — tüm AI component'lerinde AYNI (GlassAiSummaryCard/GlassTrustSignalPanel ile birebir), `severity`'den bağımsız |
| confidence metni | color | `--lg-label-secondary` | — |
| detailsAction | color | `--lg-label` (hover'da `--lg-label-secondary`) | `@media (hover: hover)` — semantik renk metne sızmaz |
| feedbackButton (seçili) | border/background/color | `color-mix(... var(--lg-accent) ...)` | `aria-pressed` |
| dismiss (hover) | background | `color-mix(in srgb, var(--flag-color) 18%, transparent)` | `@media (hover: hover)` |
| placeholderBar | background | `color-mix(in srgb, var(--flag-color) 22%, var(--lg-hairline))` | `aria-busy` altında opacity animasyonu |

**Borç (raw / mikro-geometri):** token karşılığı olmayan tüm ölçüler component
kökünde yerel değişkende toplandı — `.banner { --nudge: 2px;
--textlink-height: 24px; --content-basis: 240px; --underline-offset: 2px;
--badge-pad-y: 3px; --dismiss-size: 28px; --placeholder-bar-h: 11px; }`
(hizalama nudge'ları, metin-link taban yüksekliği, içerik sarma eşiği,
alt çizgi ofseti, rozet dikey padding'i, dismiss taban boyutu — kontrol ölçeği
28px'e uymadığından control token'ı verilmedi (GlassAlert'le aynı gerekçe),
placeholder bar yüksekliği — 11px `--lg-text-badge` ile aynı değer ama font
token'ı boy geometrisine bağlanmaz). Coarse'taki 44px dokunma hedefleri
(dismiss kare boyutu, feedback min-width/height, detailsAction min-height)
`--lg-control-md`'ye bağlandı — `pointer: coarse` bloğunda token birebir
44px'tir, spec'in "sabit zorunlu 44px" isteği aynen korunur. Süre/easing raw
kalır (token yok): buton geçişleri `0.15s ease-out`, placeholder nabzı
`1.6s ease-in-out`.

AI rozeti font'u `--lg-text-badge` token'ına bağlandı (10.5→11px kabul edilen
tipografi kayması — kontrattaki literal, token'a devredildi).

**Responsive:** `@media (max-width: …)` KULLANILMAZ — kök `flex-wrap: wrap` +
`.content { flex-basis: var(--content-basis) }` içsel akışı: dar konteynerde
içerik kendi satırına sarar, dismiss içerik satırının sonunda kalır.

**Bilinçli istisna (paint-only geçişler):** feedback/dismiss/detailsAction
`background-color/border-color/color` geçişleri layout tetiklemez (paint-only)
ve reduced-motion'da kapanır — transform/opacity/filter kuralının kabul edilen
istisnasıdır.

## 10. Storybook kapsamı

Var: Default, Playground, Severities (`Variants`/`States` eksenlerini
karşılar: 3 severity yan yana + role farkı), Variants (description-only /
reasons-only / minimal kombinasyonları), States (etkileşimli demo:
onDetails/onFeedback/onDismiss birlikte), Yukleniyor (`loading`), UzunIcerik,
Responsive (mobile1), Erişilebilirlik (docs description'lı).

`Sizes`/`Materials` story'si N/A — tek sabit ölçek, cam olmayan
component.

## 11. Test kabul kriterleri

- [x] varsayılan başlık render edilir, `severity="warning"` (varsayılan)
      hiçbir ARIA rolü taşımaz
- [x] `severity="info"` de rolsüz; yalnız `severity="danger"` `role="alert"`
      alır
- [x] severity ikonu `role="img"` + sabit `aria-label` taşır (üç severity)
- [x] "✦ AI" rozeti koşulsuz görünür; `confidence` verilince "%N güven"
      metni yanında görünür
- [x] `confidence` sonlu değilse gizlenir, aralık dışıysa clamp edilir
- [x] `reasons` verilince madde listesi render edilir; boş/undefined ise
      render edilmez
- [x] `onDetails` verilince "Ayrıntılar" görünür ve tıklanınca çağrılır;
      verilmezse render edilmez
- [x] `onDismiss` verilince "Kapat" görünür ve tıklanınca çağrılır;
      verilmezse render edilmez
- [x] `onFeedback` verilince 👍/👎 görünür, tıklanınca değerle çağrılır,
      `aria-pressed` günceller (toggle davranışı dahil)
- [x] `onFeedback` verilmezse düğmeler render edilmez
- [x] `loading=true`: `aria-busy="true"`, gerçek içerik/aksiyonlar gizli,
      AI rozeti kaybolmaz
- [x] loading duyurusu her zaman mount'lu `aria-live="polite"` bölgede
      taşınır; hiç yüklenmemiş mount'ta boş kalır
- [x] `loading` `true`→`false` geçişinde canlı bölge "Yapay zekâ incelemesi
      tamamlandı" mesajını duyurur (yalnız sessizliğe dönmez)
- [x] içerik imzası (`title`/`description`/`reasons`) `JSON.stringify`
      tuple'dır; `reasons.join('')` tarzı ayraçsız birleşimlerin çakıştığı
      girdilerde (ör. `['AB']` vs `['A','B']`) geri bildirim seçimi doğru
      sıfırlanır
- [x] `children` prop tip düzeyinde kabul edilmez (`Omit<..., 'children'>`);
      geçirilse bile render edilmez
- [x] description/reasonItem/confidence metin rengi ve severity ikon rengi
      component CSS'inde belgelenen koyulaştırılmış color-mix token'larını
      kullanır (kontrast regresyonu)
- [ ] `loading` placeholder'ının reduced-motion'da animasyonsuz kalması
      (visual)

## 12. Do / Don't

- ✅ `confidence`'ı yalnız gerçekten ölçülmüş bir değer varken ver.
- ✅ `reasons` maddelerini somut/ölçülebilir yaz ("fiyat %X altında") —
  genel "şüpheli" ifadesi yerine.
- ✅ `onDismiss` verilmiyorsa banner'ın kapatılamaz olması bilinçli bir
  tercihtir (kritik/danger bulgular kullanıcı tarafından atlanamamalı).
- ❌ `severity`'nin rengini/rolünü dışarıdan override etme — moderasyon
  bulgusunun keyfi renklendirilmesi/rol değişimi yanıltıcı olur.
- ❌ Metin rengini `--flag-color`'a bağlama — semantik renk yalnız ikon/
  zemin/kenarlığı sürer, başlık/açıklama/gerekçe/confidence metni her zaman
  `--lg-label` veya `color-mix(in srgb, var(--lg-label) 10%,
  var(--lg-label-secondary))` (kontrast dersi — ham `--lg-label-secondary`
  banner'ın tonlu zemininde 4.5:1 eşiğini kaçırıyordu).
- ❌ Severity ikonunu ham `--flag-color` ile boyama — kendi %16 zemine karşı
  3:1 eşiğini kaçırır; `color-mix(in srgb, var(--flag-color) 70%,
  var(--lg-label))` kullan (diğer AI component'leriyle aynı desen).
- ❌ `onFeedback`/`onDetails` içinde otomatik bir eylem tetikleme (ör. ilanı
  otomatik kaldırma) — component yalnız kullanıcı onaylı sinyal iletir, eylem
  çağıranın sorumluluğundadır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (Dalga 1 §15).

**Açık kararlar:** `severity` için `success` durumu olmaması (spec yalnız
`info/warning/danger` istedi — "AI incelemesi olumlu sonuçlandı" senaryosu
için ayrı bir component/`GlassAlert` düşünülebilir) · `info`/`warning`'in
rolsüz kalması (GlassAlert'in `status` deseninden bilinçli sapma, spec'in
açık isteği) · banner'ın kendi kendine kapanmaması (görünürlük her zaman
çağıranda, `GlassToast`'ın aksine kendi state yığını yok).

## Changelog

- 2026-07-17: Codex konsolide raporu düzeltmeleri —
  (1) içerik-imzalı reset artık `JSON.stringify([title, description ?? null,
  reasons ?? []])` tuple'ı kullanıyor (eski ayraçsız `${a} ${b}` birleşimi
  `reasons.join('')` gibi alanlarda çakışabiliyordu);
  (2) `children` `HTMLAttributes<HTMLDivElement>`'ten tip düzeyinde `Omit`
  edildi (`'title' | 'children'`) — sessizce yutulan bir prop yerine derleme
  zamanı hatası;
  (3) description/reasonItem/confidence metin rengi
  `color-mix(in srgb, var(--lg-label) 10%, var(--lg-label-secondary))`'a,
  severity ikon rengi `color-mix(in srgb, var(--flag-color) 70%,
  var(--lg-label))`'a koyulaştırıldı (açık temada ham değerler sırasıyla
  ~4.2-4.4:1 ve ~1.9-2.9:1'e düşüyordu; yeni değerler tüm severity durumlarında
  metin ≥4.5:1, ikon ≥3:1 sağlıyor);
  (4) `loading` `true`→`false` geçişinde canlı bölge artık boşalmak yerine
  "Yapay zekâ incelemesi tamamlandı" mesajı yayınlıyor (önceki davranış
  yalnızca sessizliğe dönüyordu, tamamlanma SR'a güvenilir duyurulmuyordu).
- 2026-07-17: İlk sürüm — `info/warning/danger` severity ekseni (yalnız
  `danger` `role="alert"`), tam genişlik flat bant, AI-first rozet/güven/
  geri bildirim/yükleme sözleşmesinin tam uygulanması (Dalga 1 kontratı
  "AI-first standardı"), "Ayrıntılar" metin aksiyonu + `onDismiss` × butonu
  (44px coarse hedef).
