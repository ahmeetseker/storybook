---
name: GlassAiSummaryCard
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassAiSummaryCard Kuralları

## 1. Amaç

Bir ilanın AI tarafından üretilmiş 2-3 cümlelik özetini, isteğe bağlı
artı/eksi listesiyle birlikte sunan içerik kartı. AI-first standardının
(Dalga 1 kontratı "AI-first standardı" bölümü) referans uygulamasıdır:
`aiGenerated` rozeti koşulsuz, `confidence` metinle duyurulur, geri bildirim
kullanıcı onayı gerektirir, `loading` kendi flat placeholder'ını çizer.

- **Kullan:** ilan detay sayfasında AI özet bloğu, arama sonucu üstünde kısa
  AI değerlendirmesi.
- **Kullanma:** kullanıcı yorumları (→ `GlassReviewCard`), tekil sayısal
  skor/metre (→ `GlassScoreMeter`), çok satırlı tehlike listesi (→
  `GlassClimateRiskPanel` — benzer flat kart iskeleti ama AI kaynaklı değil).

| İlgili | Farkı |
|---|---|
| GlassReviewCard | Kullanıcı yazdığı gerçek yorum + puan; SummaryCard makine üretimi özet, yıldız/puan yok |
| GlassClimateRiskPanel | Statik risk listesi, etkileşim yok; SummaryCard'da geri bildirim butonları var |
| GlassScoreMeter | Tekil 0-100 `role="meter"`; SummaryCard'daki `confidence` bir meter değil, rozetin yanında metin etiketi |

## 2. Semantik sözleşme

- Kök: `<article>`, "AI Özeti" `<h3>`'üne `aria-labelledby` ile bağlanır
  (başlık her zaman render edilir — koşulsuz).
- `aiGenerated` rozeti (`✦ AI`) `aria-label="Yapay zekâ üretimi"` taşır,
  dekoratif değildir — kendi başına duyurulan bir erişilebilirlik düğümüdür
  (rozetin görünürlüğü de metni de koşulsuzdur, `loading` dahil).
- "Artılar"/"Eksiler" bilinçli olarak `<h4>` DEĞİL, güçlü `<span>`'dir (spec
  gereği doküman başlık hiyerarşisine girmemeli); her biri kendi `<ul>`'unu
  `aria-labelledby` ile adlandırır. ✓/− işaretleri `aria-hidden` — anlam
  yalnız "Artılar"/"Eksiler" etiket metninden gelir (WCAG 1.3.1: bilgi
  yalnız görsel işaretle taşınmaz).
- Geri bildirim: `role="group"` + `aria-label="Bu özet faydalı mıydı?"`
  içinde iki gerçek `<button>` (`aria-pressed`, accessible name "Faydalı" /
  "Faydalı değil"). Roving tabindex/radiogroup DEĞİL — iki bağımsız
  tab-sırasında buton, tek fark tıklamanın karşılıklı dışlaması (aynı anda
  yalnız biri `aria-pressed="true"`).
- Portal yok, ref forwarding yok, odak zorla taşınmaz (buton tıklaması
  kendi odağını korur, başka bir öğeye focus() çağrılmaz).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| başlık ("AI Özeti") | ✅ | sabit metin | `<h3>`, her zaman render edilir |
| aiGenerated rozeti | ✅ | sabit "✦ AI" | Koşulsuz, `loading` dahil her durumda görünür |
| confidence etiketi | — | `"%N güven"` | Rozetin yanında; `loading`'de gizlenir |
| summary | ✅ | `string` | `loading`'de yerine skeleton gösterilir |
| pros kolonu | — | `string[]` | Boş/`undefined` → kolon hiç render edilmez |
| cons kolonu | — | `string[]` | Boş/`undefined` → kolon hiç render edilmez |
| sourceNote | ✅ (default var) | `string` | Küçük gri metin, altta |
| geri bildirim butonları | — | 👍/👎 | Yalnız `onFeedback` verilirse render edilir |
| loading placeholder | — | 3 flat çubuk | `aria-hidden`, yalnız `loading=true` iken |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| summary | prop | `string` | — (zorunlu) | — | `loading=true` iken görünmez ama yine de geçilmelidir (tip zorunlu) |
| pros | prop | `string[]` | — | — | Boş dizi kolonu render etmez |
| cons | prop | `string[]` | — | — | Boş dizi kolonu render etmez |
| confidence | prop | `number` | — | — | [0,100] clamp; sonlu değilse/`undefined` → gizli |
| sourceNote | prop | `string` | `'İlan verisi ve bölge istatistiklerinden üretildi'` | — | — |
| onFeedback | prop | `(value: 'up'\|'down') => void` | — | — | Verilirse geri bildirim butonları render edilir |
| loading | prop | `boolean` | `false` | — | Özet/kolonlar/geri bildirim yerine placeholder |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`children` hariç) | — | — | `className` birleştirilir, kalanı `<article>`'a geçer |

Ref hedefi yok. Geri bildirim seçili durumu (`selected: 'up'|'down'|null`)
tamamen component içinde tutulur — dışarıya `value`/`defaultValue` sözleşmesi
açılmaz; yalnız `onFeedback` callback'i ve görsel `aria-pressed` durumu
gözlemlenebilir (kontrat: "Geri bildirim deseni" maddesi bir controlled value
istemiyor, yalnız callback + görsel seçili durum istiyor). Aynı yöne tekrar
tıklama `selected`'ı `null`'a döndürür (toggle); `summary`/`pros`/`cons`
değişince de `selected` otomatik `null`'a sıfırlanır (bkz. §6).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `pros`/`cons`/`confidence`/`onFeedback` verilmemiş,
yalnız `summary` + `sourceNote` default'u.

| Eksen | Durum |
|---|---|
| `material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent` | N/A — flat içerik kartı, tek sabit ölçek, cam eksen yok |

| Yasak / türetilen | Davranış |
|---|---|
| `confidence` [0,100] dışı | Sessizce clamp (150→100, -30→0) |
| `confidence` `NaN`/`Infinity` | Etiket tamamen gizlenir (uydurma değer gösterilmez) |
| `pros`/`cons` boş dizi | `undefined` ile aynı davranır — kolon render edilmez |
| `loading=true` | `summary`/`pros`/`cons`/`confidence`/geri bildirim yok sayılır, yalnız başlık+rozet+placeholder görünür |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `loading` | prop | summary/columns/footer render'ı | kök `aria-busy`, `data-loading` |
| geri bildirim seçimi | iç state (tıklama) | önceki seçili yön | her butonun `aria-pressed` |
| hover/focus/active | — | — | prop değil; yalnız CSS `:hover`/`:focus-visible` |

Katman sırası: `loading` → (özet/kolon/footer availability) → geri bildirim
seçimi.

Geri bildirim seçimi iki yoldan değişir:

1. **Kullanıcı tıklaması** — aynı yöne tıklamak seçer (`aria-pressed=true`,
   `onFeedback(value)` çağrılır); **aynı yöne tekrar tıklamak seçimi
   kaldırır** (toggle — `selected` `null`'a döner, `aria-pressed=false`,
   `onFeedback(value)` yine aynı `value` ile çağrılır — component "geri
   alındı" bilgisini ayrı bir sinyal olarak taşımaz, çağıran tıklama
   sırasını/sayacını kendi tarafında yorumlar).
2. **İçerik değişimi** — `summary`/`pros`/`cons`'tan herhangi biri
   önceki render'a göre değişirse (yeni bir özet geldiyse) `selected`
   otomatik `null`'a sıfırlanır. Bu, effect ile değil, render sırasında bir
   `ref`'te tutulan önceki içerik imzasıyla karşılaştırma yapılarak yapılır
   (React "prop değişince state resetle" deseni) — amaç, yeni özetin eski
   `aria-pressed` durumunu miras almasını önlemek. Aynı içerikle tekrar
   render (örn. parent re-render) seçimi bozmaz.

Hiçbir durumda `selected` bir prop veya effect ile zorla dışarıdan
taşınmaz — yalnız yukarıdaki iki iç mekanizma değiştirir.

## 7. Davranış

- Pointer/touch: geri bildirim butonları gerçek `<button>`, `pointer: coarse`
  altında 44px'e yükselir (base `--lg-control-sm`).
- Klavye: `Tab` sırasıyla iki butona ayrı ayrı ulaşılır (roving yok, doğal
  sıra); `Enter`/`Space` native buton davranışıyla tetiklenir.
- Focus: butona tıklama kendi odağını korur; hiçbir etkileşim başka bir
  öğeye `focus()` çağırmaz (kontrat: "controlled modda koşulsuz odak taşıma"
  hatasından kaçınmak için component'te programatik focus yönetimi yoktur).
- Async yok — `loading` dışarıdan kontrol edilen salt bir görüntü modu,
  component kendi zamanlayıcısı/fetch'i yok.
- Overlay yok, portal yok.

## 8. İçerik kuralları

- `summary` 2-3 cümle; uzun metinde satır kırılır (`overflow-wrap`), kesme
  yok (bkz. UzunIcerik story).
- `pros`/`cons` öğeleri kısa cümle/ifade; liste taşarsa satır sarar,
  kesilmez.
- `sourceNote` tek satır kısa atıf; varsayılanı override edilebilir ama
  boş string geçilirse component onu olduğu gibi (boş) render eder —
  görünmezlik için `undefined` bırakılmalı.
- AI çıktısı hiçbir zaman otomatik bir eylem tetiklemez (sayfa yönlendirme,
  form doldurma vb.) — yalnız bilgilendirme + kullanıcı onaylı geri bildirim.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| root | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| title/summary/listItem metni | color | `--lg-label` | Ton (success/danger) yalnız işarete uygulanır, metne asla — WCAG 1.4.3 |
| confidence/sourceNote | color | `--lg-label-secondary` | — |
| badge | background/color | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | Kontrat "AI-first standardı" — tüm AI component'lerinde AYNI, kopya CSS kabul |
| markerSuccess/markerDanger | color | `--lg-success` / `--lg-danger` | Yalnız işaret rengi, liste metni değil |
| feedbackButton seçili | border/background/color | `color-mix(in srgb, var(--lg-success|danger) 45%, var(--lg-hairline))` / `14%` zemin / düz ton | Yalnız `aria-pressed=true` iken |
| radius | — | `--lg-radius-card` (kök) / `--lg-radius-capsule` (rozet, geri bildirim butonu, skeleton çubuğu) | — |
| boşluk | gap/padding | `--lg-space-1..5` | — |
| yazı | font-size | `--lg-text-caption/footnote/body/headline` | — |

Rozet font'u `--lg-text-badge` token'ına bağlandı (10.5→11px kabul edilen
tipografi kayması — kontrat literal'i token'a devredildi, tüm AI
component'lerinde aynı).

**Borç (mikro-geometri):** token karşılığı olmayan değerler component
kökünde yerel değişken olarak toplandı — `.card { --skeleton-line: 13px;
--column-min: 220px; --badge-pad-y: 3px; }` (skeleton çubuğu yüksekliği,
kolon sarma eşiği, rozet dikey padding'i — 3px `--lg-space-1`'in [4px]
birebir karşılığı değil, yuvarlanmadı). `pointer: coarse` geri bildirim
hedefi (44px) `--lg-control-md`'ye bağlandı — coarse'ta birebir 44px,
dokunmatikte büyüme tasarımın istediği davranıştır.

**Responsive:** `@media (max-width: …)` KULLANILMAZ — `.columns`
`repeat(auto-fit, minmax(min(var(--column-min), 100%), 1fr))` içsel akışı:
dar konteynerde artı/eksi ızgarası kendiliğinden tek kolona düşer.

## 10. Storybook kapsamı

Var: Default, Playground, Variants (İçerik Varyantları: yalnız özet / yalnız
Artılar / yalnız Eksiler), States (Durumlar: geri bildirimli kart + loading),
UzunIcerik, Responsive (mobile1), Erişilebilirlik (docs description'lı).

`Sizes`/`Materials`/`Temalar` story'si N/A — tek sabit ölçek, cam eksen yok,
tema toolbar'la otomatik doğrulanır (GlassClimateRiskPanel ile aynı karar).

## 11. Test kabul kriterleri

- [x] "AI Özeti" başlığı + `aiGenerated` rozeti koşulsuz render edilir
- [x] özet metni render edilir
- [x] confidence "%N güven" olarak rozetin yanında görünür
- [x] confidence [0,100] dışı clamp edilir, `NaN`/`Infinity` tamamen gizlenir
- [x] pros verildiğinde "Artılar" kolonu + işaretler `aria-hidden`
- [x] cons verilmediğinde/boş dizide "Eksiler" kolonu render edilmez
- [x] ne pros ne cons verilmezse yalnız özet render edilir (`<ul>` yok)
- [x] sourceNote default değeri + override
- [x] onFeedback: butonlar render edilir, tıklama çağırır, `aria-pressed` karşılıklı dışlar
- [x] aynı yöne tekrar tıklama seçimi kaldırır (toggle), `onFeedback` yine çağrılır
- [x] `summary` değişince önceki geri bildirim seçimi sıfırlanır
- [x] `pros`/`cons` değişince (summary aynı kalsa da) önceki geri bildirim seçimi sıfırlanır
- [x] aynı içerikle yeniden render geri bildirim seçimini korur (gereksiz reset yok)
- [x] onFeedback verilmezse butonlar render edilmez
- [x] `loading=true`: özet/kolon/geri bildirim gizli, rozet görünür, kök `aria-busy="true"`
- [ ] iki temada (Kağıt/Grafit) rozet/marker kontrastı (visual)
- [ ] dar container'da columns→1 kolon kırılması (visual)

## 12. Do / Don't

- ✅ `confidence` yalnız gerçek bir model çıktısı varsa geç — uydurma/sabit
  değer verme (rozetin anlamı zedelenir).
- ✅ `onFeedback` geçtiğinde sonucu (beğenildi/beğenilmedi) kendi tarafında
  kaydet — component hiçbir state'i dışarı senkronize etmez.
- ✅ `pros`/`cons` kısa ve somut tut; uzun gerekçe gerekiyorsa `summary`
  içine yaz.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (Dalga 1 §15).
- ❌ `confidence`/marker rengini metne uygulama — yalnız rozet zemini ve
  ✓/− işaretinde kalmalı (WCAG 1.4.3).
- ❌ `loading` sırasında `summary`'i boş string olarak zorunlu geçmekten
  kaçınma gerekçesiyle atlamayı düşünme — tip hâlâ zorunlu, boş string
  geçilebilir (görüntülenmeyecektir).
- ❌ Geri bildirim tıklamasında başka bir öğeye programatik `focus()`
  çağırma — controlled/uncontrolled odak sözleşmesi yalnız kullanıcı
  etkileşimiyle sınırlı kalmalı.

**Açık kararlar:** geri bildirim "gönderildi" durumunun kalıcılığı (sayfa
yenilemede sıfırlanır — çağıranın localStorage/API senkronizasyonu
sorumluluğu) · `pros`/`cons` madde sayısı üst sınırı (şu an sınırsız,
UzunIcerik story'de kontrol edildi) · `confidence` için `role="meter"`
alternatifinin gerekip gerekmediği (şimdilik metin etiketi kontrat
gereği yeterli görüldü).

## Changelog

- 2026-07-17: Code review düzeltmesi — geri bildirim seçimi artık
  `summary`/`pros`/`cons` değiştiğinde otomatik sıfırlanıyor (yeni özet eski
  `aria-pressed`'i miras almıyor); aynı yöne tekrar tıklama artık engellenmek
  yerine seçimi kaldırıyor (toggle, `onFeedback` yine çağrılıyor). Regresyon
  testleri eklendi.
- 2026-07-17: İlk sürüm — AI-first standardının referans uygulaması:
  koşulsuz `aiGenerated` rozeti, metinle duyurulan `confidence`, karşılıklı
  dışlayan geri bildirim butonları, flat/parıltısız `loading` placeholder'ı.
