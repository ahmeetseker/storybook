---
name: GlassPersonalNote
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassPersonalNote Kuralları

## 1. Amaç

Kullanıcının bir ilana özel yazdığı gizli not — ilan sahibine veya başka
kullanıcılara ASLA gösterilmez, yalnız notu yazan kullanıcı görür. İçerik
katmanı component'idir — bilinçli olarak cam DEĞİL: sürekli okunan/düzenlenen
kişisel bir metin alanı, cam malzemenin anlamı yok. Tek istisna kontrol
katmanı: editor'deki Kaydet/Vazgeç eylemleri `GlassButton` compose eder.

- **Kullan:** ilan detay sayfasında "kendine not al" bölümü — kısa, tekil,
  gizli bir metin alanı gerektiğinde.
- **Kullanma:** başkalarıyla paylaşılan/görünür yorum (→ ayrı bir yorum
  component'i, bu kütüphanede yok), çok alanlı form (→ `GlassInput`
  kompozisyonu), AI üretimi özet/öneri (→ `GlassAiSummaryCard`/
  `GlassMatchScore` — bu component'in içeriği KULLANICI ÜRETİMİ, AI değil).

| İlgili | Farkı |
|---|---|
| `GlassChatDock` | Aynı "textarea + Escape vazgeçirir + stopPropagation" dersini paylaşır (bkz. §7) ama ChatDock çok mesajlı AI sohbeti; PersonalNote tekil, kalıcı, kullanıcı-yazımı bir not |
| `GlassInput` | Genel amaçlı tek satır form alanı; PersonalNote üç durumlu (boş/görüntüle/düzenle) kapalı bir mikro-akış, `GlassInput` KULLANILMAZ (spec kararı, kendi flat textarea'sını çizer) |
| `GlassAiSummaryCard`/`GlassMatchScore` | AI-first kontratına tabi (zorunlu "✦ AI" rozeti); PersonalNote AI içerik DEĞİL, bu kontrat bilinçli olarak uygulanmaz (bkz. §12) |

## 2. Semantik sözleşme

- Kök: `<div>` — üç görsel durumu (boş/görüntüle/düzenle) koşullu olarak
  aynı kökün altında render eder, portal yok.
- Boş durum: gerçek `<button>` — accessible name "Not ekle" metninden gelir
  (kalem ikonu `aria-hidden`).
- Görüntüle durumu: not metni düz `<p>`; yanında gerçek `<button>` —
  accessible name "Düzenle" metninden gelir.
- Düzenleme durumu: `<textarea aria-label="Not metni">` + "Kaydet"/"Vazgeç"
  butonları — her ikisi `GlassButton` compose eder (Kaydet:
  `prominent size="sm"`, Vazgeç: `size="sm"`); accessible name buton
  metninden gelir. `<label htmlFor>` KULLANILMAZ — accessible name doğrudan
  `aria-label` ile verilir (spec: "Textarea aria-label").
- "Not kaydedildi" onayı `role="status" aria-live="polite"` bölgesiyle
  duyurulur — bölge state'ten BAĞIMSIZ HER RENDER'DA mount edilir (boşken
  içerik string'i `''`), koşullu mount edilmez: sonradan mount edilen
  `aria-live` bölgeleri bazı ekran okuyucularda duyurulmaz (kontrat notu).
- Gizlilik satırı (`<p>` + kilit ikonu, ikon `aria-hidden`) üç durumda da
  koşulsuz render edilir — DOM'dan hiç kaldırılmaz.
- Not metni `id`'sinin DOM'a yazıldığı bir yer yok; `useId`/index tabanlı bir
  ihtiyaç da yok (dışarıdan gelen tek "veri" düz bir string, ham id değil).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| "Not ekle" satırı | ✅ (yalnız not boşken) | kalem ikonu + "Not ekle" | Gerçek `<button>`, flat kesikli çerçeve |
| not metni + "Düzenle" | ✅ (yalnız kayıtlı not varken) | `<p>` metin + kalem ikonu + "Düzenle" `<button>` | Not metni `white-space: pre-wrap` (çok satırlı) |
| editor | ✅ (yalnız düzenlenirken) | `<textarea>` + sayaç + Kaydet/Vazgeç | Sayaç `editorFooter` içinde textarea'nın altında; Kaydet/Vazgeç `GlassButton` compose eder, yerleşim `editorActions` flex sarmalayıcısında |
| gizlilik satırı | ✅ (her zaman) | kilit ikonu + "Yalnız sen görürsün" | Sabit metin, prop ile özelleştirilemez (bkz. §12) |
| kaydedildi onayı | ✅ (her zaman mount, görsel-gizli) | `role="status"` | İçerik yalnız Kaydet sonrası kısaca dolar |

Children kabul edilmez — tamamen prop güdümlü. `...rest` tipi
`Omit<HTMLAttributes<HTMLDivElement>, 'children'>` olduğundan bu tip
seviyesinde zorlanır (spread ile kök `<div>`'e `children` geçirilse bile
JSX'in kendi literal children'ı — component'in sabit görsel ağacı — her
zaman kazanır, dışarıdan gelen içerik render edilmez; regresyon testi bkz.
`.test.tsx`).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| value | prop | `string` | — | ✅ | Verilirse controlled kayıtlı not metni |
| defaultValue | prop | `string` | `''` | — | Yalnız uncontrolled başlangıç metni |
| onValueChange | prop | `(value: string) => void` | — | — | "Kaydet" tıklanınca trimlenmiş metinle çağrılır |
| onSave | prop | `(text: string) => void` | — | — | "Kaydet" tıklanınca trimlenmiş metinle çağrılır (kalıcılaştırma çağıranın sorumluluğunda) |
| placeholder | prop | `string` | `'Bu ilan hakkında not al — yalnız sen görürsün'` | — | Yalnız textarea boşken görünür ipucu |
| maxLength | prop | `number` | `500` | — | Sonlu değilse/`0` veya negatifse varsayılana düşer |
| ...rest | — | `Omit<HTMLAttributes<HTMLDivElement>, 'children'>` | — | — | `className`/`style` köke birleştirilir; `children` tip düzeyinde omit edilir (bkz. §3 "Children kabul edilmez") |

Ref hedefi yok. `onValueChange` ve `onSave` HER İKİSİ de aynı anda, aynı
trimlenmiş metinle çağrılır — ayrı amaçlar için ayrı callback'ler (state
senkronu vs. kalıcılaştırma), birbirinin yerine geçmez.

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent` eksenleri
**N/A** — bu component'te hiçbiri yok. Üç görsel durum (boş/görüntüle/
düzenle) tamamen state'ten türer, prop değil.

| Yasak / türetilen | Davranış |
|---|---|
| `value` + `defaultValue` birlikte | `value !== undefined` her zaman kazanır (standart controlled/uncontrolled önceliği) |
| yalnız boşluklardan oluşan taslakla Kaydet | Trim edilip boş kalır → not "silinmiş" sayılır, boş duruma döner, `onValueChange('')`/`onSave('')` yine çağrılır |
| `maxLength` sonlu değil/`<=0` | Sessizce `500`'e düşer |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| kayıtlı not | `value` (controlled) ?? iç state (`defaultValue`) | boş/görüntüle durumu seçimi | görüntüle durumunda `<p>` metni |
| düzenleme (`editing`) | tamamen iç state, dışarıdan kontrol edilemez | boş/görüntüle görünümü ⇄ editor | textarea varlığı/yokluğu |
| taslak (`draft`) | tamamen iç state, yalnız Kaydet'te dışarı sızar | — | `aria-label="Not metni"` |
| odak hedefi | `editing` yalnız BU component'in kendi `startEdit`/`save`/`cancelEdit` çağrılarıyla değişir (hepsi doğrudan kullanıcı tıklaması/Escape) — dışarıdan programatik bir "düzenlemeye başla" prop'u YOK, dolayısıyla her `editing` geçişi güvenle kullanıcı-tetiklemeli sayılır | açılışta textarea'ya, kapanışta (Kaydet/Vazgeç/Escape) tetikleyici butona (Not ekle veya Düzenle, hangisi render edildiyse) | — |
| "kaydedildi" onayı (`liveMessage`) | Kaydet çağrısı | — | `role="status" aria-live="polite"`, her zaman mount |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

Katman sırası: `value`/`innerValue` → trim → `hasNote` (boş/görüntüle
seçimi) → `editing` (editor'ün üstüne binmesi) → render.

## 7. Davranış

- **Odak yönetimi:** `GlassChatDock`'taki `userTriggeredRef` bayrağına
  BURADA GEREK YOK — çünkü `editing` controlled bir prop değil, tamamen iç
  state ve yalnız bu component'in kendi buton tıklamalarıyla (`startEdit`/
  `save`/`cancelEdit`) değişir. Dışarıdan programatik bir "düzenlemeye
  zorla" yolu olmadığından her `editing` geçişi kullanıcı etkileşimiyle
  eşdeğerdir; `useLayoutEffect` içinde `was === editing` kontrolü yalnız
  mount anında (her ikisi de `false`) erken çıkış sağlar, sonraki her
  geçişte odak güvenle taşınır (bkz. test dosyası).
- **Escape (regresyon dersi, `GlassChatDock`'tan):** dinleyici `document`
  üzerinde DEĞİL, textarea'nın kendi `onKeyDown`'undadır — yalnız textarea
  odaktayken tetiklenir. Kapanışı işledikten sonra `e.stopPropagation()`
  çağrılır, olay üst katmanlara (ör. sayfadaki başka bir Escape dinleyicisi)
  sızmaz. IME kompozisyonu sürerken (`isComposing`/`key==='Process'`)
  Escape yok sayılır — kompozisyon adayını iptal etmek için
  kullanılabildiğinden taslak yanlışlıkla atılmaz.
- **Kaydet:** taslak trimlenir (yalnız baş/son boşluk — iç satır sonları
  KORUNUR, çok satırlı not desteklenir); uncontrolled modda iç state
  güncellenir, `onValueChange`/`onSave` HER İKİSİ de trimlenmiş metinle
  çağrılır, editor kapanır, "Not kaydedildi" `aria-live` bölgesine yazılır,
  odak (görünüme göre) "Düzenle"/"Not ekle" butonuna taşınır. Trimlenmiş
  metin boşsa not "silinmiş" sayılır — boş duruma dönülür.
- **Vazgeç:** taslak atılır, `onValueChange`/`onSave` ÇAĞRILMAZ, editor
  kapanır, odak önceki tetikleyici butona döner.
- **maxLength:** textarea'nın native `maxLength` özniteliği yazmayı zaten
  sınırlar; `onChange` içinde ayrıca programatik yapıştırma/IME uçlarına
  karşı `slice(0, safeMaxLength)` ile kırpılır (savunma amaçlı, "sayı
  girişlerinde clamp" dersinin metin uzunluğu karşılığı). Kalan karakter
  sayacı `Math.max(0, safeMaxLength - draft.length)` ile asla negatife
  düşmez.
- Controlled/uncontrolled: yalnız `value`/`onValueChange` ekseninde —
  `editing`/`draft` her zaman iç state (bkz. §6).
- Dokunmatik: "Not ekle"/"Düzenle" `pointer: coarse`'ta ≥44px hedefe
  yükselir (`--lg-control-md`). "Kaydet"/"Vazgeç" `GlassButton size="sm"`
  compose ettiğinden kendi token'ını izler (`--lg-control-sm`, coarse'ta
  36px) — GlassButton'a height override yazmak yasak, hedef büyütme
  gerekirse GlassButton sözleşmesi düzeyinde çözülür.
- Async/overlay yok.

## 8. İçerik kuralları

- Not metni uzun olabilir — `overflow-wrap: anywhere` ile sarar, kök
  container'ın genişliğini aşmaz (bkz. UzunIcerik story).
- Not metni `white-space: pre-wrap` taşır — `Enter` ile eklenen satır
  sonları görüntüleme modunda da korunur, tek satıra çökmez.
- `placeholder` yalnız görsel ipucu — textarea'nın accessible name'i sabit
  `"Not metni"` (placeholder içeriğinden bağımsız, WCAG "yalnız placeholder
  = etiket" anti-pattern'inden kaçınmak için).
- Gizlilik satırının metni ("Yalnız sen görürsün") sabit ve prop ile
  özelleştirilemez — spec'in "sabit görünür" ifadesi bilinçli olarak kapalı
  bir API kararına dönüştürüldü (bkz. §12).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| "Not ekle" satırı | border/radius/color | `--lg-hairline` (dashed) / `--lg-radius-chip` / `--lg-label-secondary` | hover → `--lg-label` metin, `color-mix(var(--lg-label) 5%, transparent)` zemin |
| not bloğu zemini | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-chip` | — |
| not metni | color | `--lg-label` | — |
| "Düzenle" butonu | color | `--lg-accent` | hover → `color-mix(var(--lg-accent) 10%, transparent)` zemin |
| textarea | background/border/radius/color | `--lg-surface` / `--lg-hairline` / `--lg-radius-chip` / `--lg-label` | focus-visible → `--lg-accent` outline |
| textarea placeholder | color/opacity | `--lg-label-secondary` / `opacity: 1` | `opacity` açıkça `1`'e kilitlenir — tarayıcı varsayılan placeholder opaklığı efektif kontrastı ~2.1-2.8:1'e düşürebiliyordu; `--lg-label-secondary` kendi başına açık temada ~4.74:1, koyu temada ~6.3:1 sağlıyor (≥4.5:1 eşiği) |
| sayaç | color | `--lg-label-secondary` | sınıra yaklaşınca (`data-near-limit`) → `color-mix(var(--lg-warning) 65%, var(--lg-label))` metin + `color-mix(var(--lg-warning) 16%, transparent)` zemin (AI rozeti tekniğiyle aynı: renk yalnız zemin/metin karışımına, ham semantik renk küçük metne doğrudan uygulanmaz) |
| Vazgeç | — | `GlassButton size="sm"` compose eder — görsel token'lar GlassButton sözleşmesinden | GlassButton state'leri |
| Kaydet | — | `GlassButton prominent size="sm"` compose eder — görsel token'lar GlassButton sözleşmesinden | GlassButton state'leri |
| gizlilik satırı | color | `--lg-label-secondary` | — |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |

**Borç (mikro-geometri, `.root` üzerinde yerel değişken):**
- `--gpn-inline-gap: 6px` — Düzenle butonu ve gizlilik satırı ikon/metin
  arası; `--lg-space-1` (4px) ile `--lg-space-2` (8px) arasında ara değer.
- `--gpn-textarea-max-height: 240px` — textarea büyüme sınırı (spec sabiti,
  tasarım sistemi ölçeğinde yok, `GlassChatDock` composer'ıyla aynı borç
  sınıfı; `min-height` token'lı: `calc(--lg-control-md * 2)`).
- `--gpn-counter-padding-block: 2px` / `--gpn-counter-padding-inline: 7px` —
  sayaç kapsül dolgusu, token ölçeğinde ara değer.

**Borç (raw, değişkene alınmayan):** ikon SVG `viewBox`/stroke ölçüleri (px,
diğer tüm component ikonlarıyla aynı borç — vektör boyutu, layout değeri
değil), sayaç yaklaşma eşiği `20` karakter (davranışsal sabit, token
ölçeğinde yok), geçiş süresi/easing (`0.15s ease-out` — süre token'ı yok).
Dokunmatik `min-height` hedefleri (`addButton`/`editButton`,
`pointer: coarse`) `--lg-control-md`'ye bağlandı — coarse'ta token 44px,
büyüme tasarımın istediği davranıştır; raw 44px kalmadı. Kaydet/Vazgeç
`GlassButton` compose ettiğinden bu borcu taşımaz.

## 10. Storybook kapsamı

Var: Default, Playground, Bos (boş durum), Kayitli (kayıtlı not + Düzenle),
Duzenleme (uçtan uca controlled canlı demo), KarakterSiniri (düşük
`maxLength` ile sayaç vurgusu), UzunIcerik, Responsive (mobile1 + dar
konteyner), Erişilebilirlik (docs description'lı).

`Sizes`/`Variants`/`Temalar` ayrı story olarak yok: `size`/`variant` ekseni
tanımlı değil (üç durum state'ten türer, prop değil), tema toolbar'la
otomatik doğrulanır.

## 11. Test kabul kriterleri

- [x] not yokken yalnız "Not ekle" satırı render edilir, textarea/"Düzenle"
      yok
- [x] gizlilik satırı boş durumda da her zaman görünür
- [x] `defaultValue` ile kayıtlı not varsa metin + "Düzenle" render edilir,
      "Not ekle" yok
- [x] "Not ekle" tıklanınca textarea açılır (`aria-label="Not metni"`),
      odak alır, gizlilik satırı yine görünür
- [x] Kaydet trimlenmiş metinle `onValueChange` + `onSave` çağırır, görünüm
      not metnine döner, odak "Düzenle" butonuna taşınır
- [x] Vazgeç taslağı atar, `onValueChange`/`onSave` çağrılmaz, odak "Not
      ekle" butonuna döner
- [x] mevcut notu Düzenle ile açıp boş/yalnız-boşluk metinle kaydedince not
      "silinmiş" sayılır, boş duruma (`"Not ekle"`) döner
- [x] textarea içinde Escape düzenlemeyi vazgeçirir
- [x] regresyon: IME kompozisyonu sürerken Escape düzenlemeyi kapatmaz
- [x] regresyon: Escape kapanışı `e.stopPropagation()` çağırır — dış
      `document` dinleyicileri olayı almaz
- [x] varsayılan `maxLength=500` iken kalan karakter sayacı doğru
      hesaplanır
- [x] özel düşük `maxLength` ile girdi sınırın üzerine kırpılır, sayaç
      `0`'da kalır (negatife düşmez)
- [x] sonlu olmayan/negatif `maxLength` sessizce `500`'e düşer
- [ ] sayaç `data-near-limit` görsel vurgusu + `pointer: coarse` 44px hedefi
      (visual, Chrome)

## 12. Do / Don't

- ✅ `onSave`'i sunucuya kalıcılaştırma için kullan, `onValueChange`'i
  yalnız controlled state senkronu için — ikisi farklı amaç taşır, biri
  diğerinin yerine geçmez.
- ✅ Sayfa başına tek `GlassPersonalNote` kullan (ilan başına bir not) —
  birden fazla kullanılacaksa her biri kendi `value`/`defaultValue`'suyla
  bağımsız çalışır, çakışma yoktur ama UX olarak tekil kullanım öngörülür.
- ❌ `GlassInput`'u textarea yerine kullanma — spec kararı: kendi flat
  textarea'sı çizilir, üç durumlu (boş/görüntüle/düzenle) kapalı bir
  mikro-akış `GlassInput`'un genel amaçlı sözleşmesine uymaz.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.
- ❌ Gizlilik satırını koşullu render etme/gizleme — spec: "sabit görünür",
  üç durumda da DOM'da kalmalı.

**Açık kararlar:** AI-first kontratı (zorunlu "✦ AI" rozeti, `confidence`,
`onFeedback`, `loading`) bu component'e BİLİNÇLİ OLARAK eklenmedi — içerik
yapay zekâ üretimi DEĞİL, kullanıcının kendi yazdığı özel bir metin;
kontratın "AI çıktısı asla otomatik eylem tetiklemez" ilkesi zaten geçerli
değil çünkü ortada bir AI çıktısı yok. Gizlilik satırının metni prop
yüzeyine eklenmedi (spec'te "sabit görünür" olarak tarif edildi, `GlassChatDock`
`disclaimer`'ının aksine burada özelleştirme istenmedi) — ihtiyaç doğarsa
v2'de `privacyText` prop'u eklenebilir. `editing` durumu controlled değil
(spec'te böyle bir eksen istenmedi) — dışarıdan "düzenlemeye zorla" gerekirse
v2'de `open`/`defaultOpen`/`onOpenChange` üçlüsü `GlassChatDock` deseniyle
eklenebilir.

## Changelog

- 2026-07-24: Buton kompozisyon düzeltmesi — editor'deki elle çizilmiş
  "Kaydet"/"Vazgeç" butonları `GlassButton` kompozisyonuna çevrildi
  (Kaydet: `prominent size="sm"`, Vazgeç: `size="sm"`); ölü
  `.saveButton`/`.cancelButton` CSS sınıfları silindi, yerleşim
  `editorActions` sarmalayıcısında kaldı. Davranış (onClick, odak dönüşü,
  role/isim tabanlı erişilebilir adlar) değişmedi. Not: coarse pointer'da
  bu iki buton artık GlassButton `sm` token'ını izler (36px) — önceki yerel
  44px büyütme GlassButton sözleşmesine devredildi. "Not ekle"/"Düzenle"
  elle çizilmiş kaldı (sınırda vakalar, ayrı karar bekliyor).
- 2026-07-24: Uyum düzeltmesi — mikro-geometri değerleri (`6px` inline gap,
  `240px` textarea max-height, `2px 7px` sayaç dolgusu) `.root` üzerinde
  yerel CSS değişkenlerine toplandı; §9 borç notu güncellendi. Görsel
  değişiklik yok.
- 2026-07-17: Codex dalga4 QA fix — `...rest` tipi
  `Omit<HTMLAttributes<HTMLDivElement>, 'children'>`'a çevrildi (önceden
  `children` tip seviyesinde kabul ediliyor ama JSX'in kendi literal
  children'ı tarafından sessizce eziliyordu — spread edilen `children`
  hiçbir zaman render edilmiyordu); `.textarea::placeholder` için
  `opacity: 1` eklendi (tarayıcı varsayılan placeholder opaklığı efektif
  kontrastı düşürüyordu, renk zaten `--lg-label-secondary` ile ≥4.5:1
  sağlıyordu). İkisi için de regresyon testi eklendi.
- 2026-07-17: İlk sürüm — boş/görüntüle/düzenle üç durumlu akış, controlled
  `value` + `onValueChange` + ayrı `onSave` kalıcılaştırma callback'i,
  textarea-scoped Escape (`stopPropagation` + IME guard, `GlassChatDock`
  dersi), her zaman mount edilmiş `aria-live` kaydedildi onayı, `maxLength`
  clamp + kalan karakter sayacı (sınıra yaklaşınca yalnız renkle değil
  sayının kendisiyle + color-mix zemin/metin vurgusuyla işaretlenir).
