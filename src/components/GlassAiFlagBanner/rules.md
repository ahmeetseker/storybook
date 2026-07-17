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
  bölge — `loading=false` iken boş, `loading=true` iken "Yapay zekâ
  incelemesi yükleniyor" metnini alır (sonradan mount edilen `aria-live`
  bölgeler bazı ekran okuyucularda kaçabilir, bu yüzden koşulsuz mount).
- Portal yok, ref forwarding yok — tamamen prop güdümlü/sunum.

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
| loading duyurusu | her zaman mount'lu | — | `aria-live="polite"`, yalnız `loading=true` iken metin taşır |

Children kabul edilmez — tamamen prop güdümlü.

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
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title` hariç) | — | — | `className` birleştirilir, kalanı köke geçer |

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
| title/description/reasons | color | `--lg-label` / `--lg-label-secondary` | Semantik renk metne SIZMAZ (kontrast dersi) — yalnız ikon/zemin/kenarlık `--flag-color` kullanır |
| icon | color/background | `--flag-color` / `color-mix(in srgb, var(--flag-color) 16%, var(--lg-surface))` | `severity`'den otomatik |
| icon | boyut | `--lg-control-sm` | — |
| **aiBadge** (AI-first, kopya CSS) | background/color | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | Sabit — tüm AI component'lerinde AYNI (GlassAiSummaryCard/GlassTrustSignalPanel ile birebir), `severity`'den bağımsız |
| confidence metni | color | `--lg-label-secondary` | — |
| detailsAction | color | `--lg-label` (hover'da `--lg-label-secondary`) | `@media (hover: hover)` — semantik renk metne sızmaz |
| feedbackButton (seçili) | border/background/color | `color-mix(... var(--lg-accent) ...)` | `aria-pressed` |
| dismiss (hover) | background | `color-mix(in srgb, var(--flag-color) 18%, transparent)` | `@media (hover: hover)` |
| placeholderBar | background | `color-mix(in srgb, var(--flag-color) 22%, var(--lg-hairline))` | `aria-busy` altında opacity animasyonu |

**Borç (raw):** dismiss butonu 28px taban boyutu (coarse'ta 44px'e büyür) —
GlassAlert'in aynı borcuyla aynı gerekçe: gösterge/kontrol ölçeği için özel
token yok. AI rozeti `font-size: 10.5px` — kontratın kendisinde sabitlenmiş
literal değer (tasarım sistemi kararı, token değil).

## 10. Storybook kapsamı

Var: Default, Playground, Severities (`Variants`/`States` eksenlerini
karşılar: 3 severity yan yana + role farkı), Variants (description-only /
reasons-only / minimal kombinasyonları), States (etkileşimli demo:
onDetails/onFeedback/onDismiss birlikte), Yukleniyor (`loading`), UzunIcerik,
Responsive (mobile1), Erişilebilirlik (docs description'lı).

`Sizes`/`Materials`/`Temalar` story'si N/A — tek sabit ölçek, cam olmayan
component, tema toolbar'la otomatik doğrulanır.

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
      taşınır
- [ ] iki temada (Kağıt/Grafit) renk kontrastı (visual)
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
  zemin/kenarlığı sürer, başlık/açıklama/gerekçe metni her zaman
  `--lg-label`/`--lg-label-secondary` (kontrast dersi).
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

- 2026-07-17: İlk sürüm — `info/warning/danger` severity ekseni (yalnız
  `danger` `role="alert"`), tam genişlik flat bant, AI-first rozet/güven/
  geri bildirim/yükleme sözleşmesinin tam uygulanması (Dalga 1 kontratı
  "AI-first standardı"), "Ayrıntılar" metin aksiyonu + `onDismiss` × butonu
  (44px coarse hedef).
