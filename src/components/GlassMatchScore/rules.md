---
name: GlassMatchScore
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassMatchScore Kuralları

## 1. Amaç

Kişisel uyum skoru — "senin kriterlerine göre" hesaplanan bir yapay zekâ
çıktısı. Kullanıcının kendi tercihleriyle (oda sayısı, bütçe, konum...) bir
ilanın ne kadar örtüştüğünü tek bir 0-100 skor + kısa gerekçe + eşleşen/
eşleşmeyen kriter listesiyle özetler. AI-first component: içerik AI
tarafından üretildiği için "✦ AI" rozeti zorunlu ve daima görünür. Kendi mini
SVG halkasını çizer — `GlassScoreMeter`'dan bilinçli olarak İTHAL EDİLMEZ
(component bağımsızlığı; AI-first rozet/güven/geri bildirim/yükleme
sözleşmesi `GlassScoreMeter`'da yok, iki component farklı sözleşmeler taşır).

- **Kullan:** ilan detay sayfasında "sana göre" kişisel uyum kartı (`card`),
  ilan/listeleme kartlarına gömülü mini uyum rozeti (`compact`).
- **Kullanma:** nesnel/kalıcı bir konum metriği (→ `GlassScoreMeter`), çok
  satırlı özellik karşılaştırması (→ `GlassCompareTable`/`GlassFeatureGroup`),
  yıldız puanı (→ `GlassRating`).

| İlgili | Farkı |
|---|---|
| GlassScoreMeter | Nesnel/kalıcı metrik, AI rozeti yok, cam değil ama AI-first sözleşmesi taşımaz; MatchScore kişiselleştirilmiş AI çıktısıdır |
| GlassFeatureGroup `checklist` | Ham özellik künyesi (✓/✕ ızgara); MatchScore tekil skor + kişisel kriter altkümesi taşır |
| GlassReviewCard | İnsan yorumu + "Faydalı" aksiyonu; MatchScore AI çıktısı + 👍/👎 geri bildirim deseni benzer ama kaynağı farklı (insan vs AI) |

## 2. Semantik sözleşme

- Kök: `<div>` (`article` değil — tek bir "değerlendirme" bildirimi, ayrık
  bir doküman bölümü değil, `GlassProgress`/`GlassScoreMeter` ile aynı karar).
- Halka + değer: `<div role="meter">` + `aria-valuemin={0}`,
  `aria-valuemax={100}`, `aria-valuenow={clampedValue}`, `aria-labelledby`
  görünür başlığa (`title`) bağlı — `aria-label` DEĞİL (çift okuma olmaz).
- `explanation` verilirse (`variant="card"`) `aria-describedby` ile
  `role="meter"` düğümüne bağlanır; `compact`'te hiç render edilmez, hiç
  `aria-describedby` verilmez.
- Halka içindeki sayı (`ringValue`) `aria-hidden` — değer zaten
  `aria-valuenow`'da, AT'ye iki kez okutulmaz.
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — görünür "✦ AI" metni AT
  için yeterince açıklayıcı olmadığından geçersiz kılınır.
- `confidence` metni ("%N güven") görünür düz metin — ayrı ARIA gerekmez,
  zaten okunabilir içerik.
- Kriter chip'leri: `<ul><li>` — ✓/✕ ikonları `aria-hidden` (dekoratif,
  `GlassFeatureGroup` checklist'inin aksine burada her chip'in kendi
  `role="img"` ihtiyacı yok). Eşleşme durumu AT'ye görünür etiketin yanına
  eklenen görsel-gizli (`srOnly`, `aria-hidden` DEĞİL) "(eşleşti)"/
  "(eşleşmedi)" metniyle iletilir — yalnız `data-matched`'e güvenmek AT
  kullanıcısının kriterin eşleşip eşleşmediğini hiç öğrenememesine yol açardı
  (review düzeltmesi, bkz. Changelog).
- Geri bildirim: gerçek `<button aria-pressed>` (👍/👎), accessible name
  "Faydalı"/"Faydalı değil". `role="radiogroup"` DEĞİL — ikisi bağımsız
  toggle, seçim karşılıklı dışlanır ama tek bir "grup" semantiği taşımaz
  (roving tabindex gerekmez, ikisi de her zaman `tabIndex=0`/doğal Tab sırası).
  Aynı butona tekrar tıklama seçimi geri alır (`aria-pressed` `false`'a
  döner) — gerçek bir toggle, "tekrar basınca aynı yönde kilitlenmiş" bir
  sahte buton değil.
- `loading=true`: meter/kriter/geri bildirim render edilmez; tek duyuru
  noktası `role="status"` + görünür olmayan (`srOnly`) "{title} hesaplanıyor"
  metni — görsel placeholder tamamen `aria-hidden`, TEK istisna zorunlu "✦
  AI" rozeti: skeleton satırlarının yanında görünür/erişilebilir kalır (AI-
  first standardı `loading` durumunu istisna tutmaz — veri henüz yokken bile
  içeriğin AI kaynaklı olacağı önceden bildirilir). `confidence` metni ise
  loading placeholder'ında hiç gösterilmez (skor henüz hesaplanmadı).
- Portal yok, ref forwarding yok (statik/kontrollü sunum kararı, diğer içerik
  katmanı component'leriyle tutarlı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| meter/halka | ✅ | SVG 2 circle + merkez sayı | `role="meter"`, dekoratif SVG `aria-hidden` |
| başlık | ✅ | `title` (default "Sana Uygunluk") | Accessible name kaynağı |
| AI rozeti | ✅ (her zaman) | "✦ AI" | Kontrat sabit CSS'i — component'ler arası birebir aynı |
| güven metni | — | "%N güven" | Yalnız `confidence` sonluysa; rozetin yanında |
| açıklama | — (yalnız `card`) | `explanation` | `compact`'te render edilmez |
| kriter chip'leri | — (yalnız `card`) | `criteria[]` | ✓ (success ton) / ✕ (soluk) |
| geri bildirim | — (yalnız `card`) | 👍/👎 | Yalnız `onFeedback` verilirse |

Children kabul edilmez — tamamen prop güdümlü.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| value | prop | `number` | — (zorunlu) | — | [0,100]'e clamp + yuvarlanır; `NaN`/`Infinity` önce 0'a düşer |
| title | prop | `string` | `'Sana Uygunluk'` | — | Accessible name kaynağı |
| criteria | prop | `{ label: string; matched: boolean }[]` | — | — | Yalnız `card`'da render edilir |
| explanation | prop | `string` | — | — | Yalnız `card`'da görünür + `aria-describedby` |
| confidence | prop | `number` | — | — | [0,100]'e clamp; sonlu değilse gizlenir (rozet yine görünür) |
| onFeedback | prop | `(value: 'up' \| 'down') => void` | — | — | Verilirse 👍/👎 butonları görünür |
| loading | prop | `boolean` | `false` | — | true → flat skeleton + `role="status"` |
| variant | prop | `'card' \| 'compact'` | `'card'` | — | `compact`'te açıklama/kriter/geri bildirim yok |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title` hariç) | — | — | `className`/`style` birleştirilir |

Ref hedefi yok. `onFeedback` her tıklamada çağrılır (aynı yöne tekrar tıklama
da dahil, toggle-off anında bile) — component kendi "gönderildi" durumunu
sunucuya iletmez, yalnız `aria-pressed`/`data-selected` ile görsel seçili
durumu tutar. Aynı yöne ikinci tıklama görsel seçimi geri alır (toggle);
`onFeedback` yine de tıklanan yönle çağrılır (callback her zaman "hangi
butona basıldı"nı bildirir, "şu an seçili mi" değil). `value`/`criteria`
GERÇEKTEN değiştiğinde (içerik imzası — bkz. §6) geri bildirim seçimi otomatik
sıfırlanır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=card`, otomatik ton (`value`'dan).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (tema bağlamı) | N/A — bu component'te ayrı bir `tone` prop'u yok, renk eşiği tamamen `value`'dan otomatik (bkz. GlassScoreMeter'daki isim çakışması notu — burada hiç prop olarak açılmadı, çakışma riski yok) |
| `size` | N/A — spec'te istenmedi; ring boyutu yalnız `variant`'a bağlı (§9 borç) |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `compact` + `explanation`/`criteria`/`onFeedback` | Veriler yok sayılır, render edilmez (hata fırlatılmaz) |
| `loading=true` | `criteria`/`explanation`/`onFeedback` verilse de yok sayılır, yalnız placeholder + durum metni |
| `value` aralık dışı/`NaN`/`Infinity` | Önce 0'a düşer (sonlu değilse), sonra [0,100]'e clamp + yuvarlanır |
| `confidence` aralık dışı | [0,100]'e clamp; sonlu değilse (`NaN`/`Infinity`) hiç render edilmez |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| skor/ton | `value` (otomatik eşik: ≥70 success, 40-69 accent, <40 danger) | — | `aria-valuenow`, `data-tone` |
| güven | `confidence` (normalize) | — | görünür metin |
| geri bildirim seçimi | dahili state (`feedback: 'up'\|'down'\|undefined`); aynı yöne tekrar tıklama toggle-off; `value`/`criteria` içerik imzası değişince render sırasında otomatik `undefined`'a sıfırlanır (bkz. aşağıki not) | — | `aria-pressed`, `data-selected` |
| yükleme | `loading` prop | meter/kriter/geri bildirim tamamen (AI rozeti HARİÇ — bkz. §2) | `role="status"` |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

**İçerik imzası (feedback sıfırlama):** `JSON.stringify({ value: clampedValue,
criteria: criteria?.map(c => [c.label, c.matched]) ?? null })` bir önceki
render'ın imzasıyla (ref) karşılaştırılır; farklıysa geri bildirim seçimi
render sırasında (ekstra effect turu olmadan) sıfırlanır — kullanıcı farklı
bir ilana geçtiğinde önceki "faydalı"/"faydalı değil" seçimi görsel olarak
yeni içerikte asılı kalmaz. Referans eşitliği değil İÇERİK eşitliği kontrol
edilir: aynı içerikle yeni bir `criteria` dizisi referansı verilirse seçim
KORUNUR.

Katman sırası: `loading` (varsa AI rozeti hariç her şeyi bastırır) → `value`
(clamp/ton, içerik imzasının parçası) → `criteria` (içerik imzasının parçası)
→ `variant` (`compact` ek içerikleri bastırır) → render.

## 7. Davranış

- Halka dolumu `stroke-dashoffset` 0.3s ease-out geçişle akar (GlassScoreMeter
  ile aynı süre/eğri — tutarlı "dolum" hissi); `prefers-reduced-motion:
  reduce`'ta geçiş kapanır.
- Geri bildirim butonları: `onFeedback` verilmezse hiç render edilmezler
  (sahte buton üretilmez — `GlassReviewCard` ile aynı karar). Tıklamada
  `onFeedback(direction)` çağrılır ve tıklanan yön `aria-pressed="true"`
  olur; diğer yön otomatik `false`'a döner (karşılıklı dışlama, ama iki
  bağımsız `<button>` — roving tabindex/`radiogroup` YOK). Zaten seçili olan
  yöne TEKRAR tıklama seçimi geri alır (`aria-pressed="false"`, toggle);
  `onFeedback` bu tıklamada da çağrılır — component yalnız görsel seçimi
  yönetir, "gönderim" mantığı tamamen çağırana aittir.
- Geri bildirim seçimi `value`/`criteria` GERÇEKTEN değiştiğinde (içerik
  imzası — §6) otomatik sıfırlanır; aksi halde farklı bir ilana/skora geçilse
  bile eski "faydalı" işareti ekranda asılı kalırdı. Sıfırlama render
  sırasında (React'in "adjusting state during rendering" deseniyle) yapılır,
  ekstra bir görünür kare/effect turu üretmez.
- `loading`: skeleton içeriği (`ringBox`/skeleton çizgileri) `aria-hidden`;
  `role="status"` düğümü ekranokuyucuya tek seferlik "{title} hesaplanıyor"
  duyurur. Skeleton animasyonu yalnız `opacity` (shimmer/gradient yok, kendi
  flat placeholder'ı — `GlassSkeleton`'a bağımlı değil). Zorunlu "✦ AI"
  rozeti skeleton başlık satırının yanında normal (aria-hidden OLMAYAN)
  şekilde render edilir — AI-first standardı yükleme durumunu istisna
  tutmaz.
- Odak taşıma yok — component hiçbir zaman kendiliğinden odak almaz/taşımaz;
  tek etkileşim yüzeyi (geri bildirim butonları) doğal Tab sırasında durur.
- Responsive: `card` konteynerin genişliğine uyar (kriter chip'leri
  `flex-wrap`), `compact` satır içi (`inline-flex`) — dar alanda sarar.
  Dokunmatik: geri bildirim butonları `pointer: coarse`'ta 44px'e yükselir.

## 8. İçerik kuralları

- `title` kısa kalmalı ("Sana Uygunluk", "Kriterlerine Uyum") — sayı zaten
  görsel + `aria-valuenow`'da.
- `criteria[].label` kısa tutulmalı (chip tek satırda kalır); uzun etiketler
  `overflow-wrap: anywhere` ile sarar (bkz. UzunIcerik story).
  `criteria` boş dizi veya `undefined` → bölüm hiç render edilmez.
- `explanation` tek cümlelik somut gerekçe; verilmezse `aria-describedby`
  hiç eklenmez (GlassScoreMeter ile aynı desen).
- AI rozeti metni sabit "✦ AI" — çağıran tarafından özelleştirilemez
  (kontrat: tüm AI component'lerinde birebir aynı görünmeli).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| ringTrack | stroke | `--lg-hairline` | — |
| ringFill/ringValue | stroke/color (inline style) | `var(--lg-success/-accent/-danger)` | otomatik eşik (`value`) |
| kart zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | yalnız `card` |
| başlık | color | `--lg-label` | — |
| açıklama/güven metni | color | `--lg-label-secondary` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassAiSummaryCard.module.css`'teki `.badge` bloğuyla görsel olarak birebir aynı (dikey padding 3px yerel `--ms-badge-pad-block` değişkeninde, font boyutu `--lg-text-badge`), component'ler arası kopya |
| kriter chip (matched) | background/color | `color-mix(... var(--lg-success) ...)` / `--lg-success` (ikon) | `data-matched=true` |
| kriter chip (unmatched) | background/color | `color-mix(... var(--lg-label) ...)` / `--lg-label-secondary` | `data-matched=false` |
| geri bildirim butonu | border/background/radius | `--lg-hairline`/`--lg-surface`/`--lg-radius-capsule` | `aria-pressed=true` → `--lg-accent` tint |
| skeleton | background | `color-mix(... var(--lg-label) 8% ...)` | `loading` |

**Borç (raw / mikro-geometri):** ring SVG çapı 72px (`card`)/40px (`compact`)
+ stroke-width 6/4 — `GlassScoreMeter`'daki ring çapı borcuyla aynı gerekçe.
Token karşılığı olmayan mikro ölçüler component kökünde yerel değişkenlerde
toplanır — `--ms-meta-gap` (2px), `--ms-ai-gap` (6px), `--ms-badge-pad-block`
(3px), `--ms-chip-gap` (5px), `--ms-chip-pad-block` (3px),
`--ms-chip-pad-start` (6px), `--ms-skeleton-ring-card/-compact` (72/40px),
`--ms-skeleton-body-mt` (6px). AI rozeti font boyutu `--lg-text-badge`
token'ına bağlandı (eski 10.5px → 11px, ≤1.5px kabul edilen tipografi
kayması); kriter ikonu `font-weight: 700` (eski 800 — ölçek dışıydı).
Coarse geri bildirim hedefi `--lg-control-md` (coarse'ta 44px).

**Bilinçli istisna (animasyon):** `.ringFill`'deki `stroke-dashoffset`
geçişi korunur — SVG stroke ilerlemesi paint-only'dir (layout tetiklemez);
"animasyon yalnız transform/opacity/filter" kuralının kabul edilen SVG
istisnasıdır. `prefers-reduced-motion`'da kapanır.

## 10. Storybook kapsamı

Var: Default, Playground, Variants (`card`/`compact`), RenkEsigi (otomatik
eşik üç örnek), States (Geri Bildirim: `onFeedback` var/yok + `loading`),
UzunIcerik, Responsive (mobile1 + dokunmatik geri bildirim butonları),
Erişilebilirlik (docs description'lı).

`Sizes`/`Temalar` ayrı story olarak yok: `size` ekseni tanımlı değil (yalnız
`variant`'a bağlı iki sabit ölçek), tema toolbar'la otomatik doğrulanır
(GlassScoreMeter ile aynı karar).

## 11. Test kabul kriterleri

- [x] meter rolü + valuemin/valuemax/valuenow + `aria-labelledby` ile ad (default title dahil)
- [x] value clamp ([0,100], yuvarlama), `NaN`/`Infinity` → 0
- [x] otomatik ton eşiği (≥70/40-69/<40) `data-tone`'a yansır
- [x] explanation varsa `card`'da `aria-describedby` ile bağlanır
- [x] `compact`'te explanation/criteria/feedback hiç render edilmez
- [x] criteria matched/unmatched `data-matched` ile ayrışır
- [x] AI rozeti her zaman render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir
- [x] geri bildirim butonları `onFeedback`'i doğru yönle çağırır + `aria-pressed` görsel seçimi işaretler
- [x] `onFeedback` verilmezse buton hiç render edilmez
- [x] `loading=true` iken meter/kriter/feedback yerine `role="status"` durum metni render edilir
- [x] eşleşmeyen kriter chip'inde metne element-genelinde opacity uygulanmaz (WCAG AA kontrast regresyonu)
- [x] kriter chip'lerinde eşleşme durumu görsel-gizli metinle AT'ye iletilir; yalnız ikon `aria-hidden`
- [x] geri bildirim seçimi `value`/`criteria` içerik imzası değişince otomatik sıfırlanır; içerik AYNIYSA (farklı referans dahi olsa) seçim korunur
- [x] aynı yöne tekrar tıklama seçimi geri alır (toggle); `onFeedback` yine de çağrılır
- [x] `loading=true` iken zorunlu "✦ AI" rozeti yine görünür kalır (güven metni gösterilmez)
- [x] AI rozeti CSS bloğu `GlassAiSummaryCard.module.css`'teki `.badge` ile hizalı (padding/letter-spacing/font kaynakta kilitli)
- [ ] reduced-motion'da ring/skeleton geçişlerinin kapanması (visual)

## 12. Do / Don't

- ✅ `criteria`'yı yalnız kullanıcının GERÇEKTEN belirttiği kriterlerle
  doldur — AI çıktısı asla otomatik eylem tetiklemez, yalnız bilgi sunar.
- ✅ AI rozetini her zaman göster — kaynağı insan olan içerikle (ör.
  `GlassReviewCard`) asla karıştırma.
- ✅ `compact`'i yalnız zaten çerçeveli bir kart içinde kullan (kendi zemini
  yok, `GlassScoreMeter.badge` ile aynı karar).
- ❌ `GlassScoreMeter`'ı import edip halka mantığını paylaşma — iki
  component'in ARIA/AI sözleşmesi kasıtlı olarak ayrı.
- ❌ `criteria`/`onFeedback` API'sini `loading` sırasında render etmeye
  çalışma — yükleme durumu her şeyi bastırır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** `size` ekseni ihtiyacı (kart içi daha küçük ring) ·
`criteria` için maksimum eleman sayısı/sıralama önceliği (eşleşenler önce mi
gösterilsin?) · geri bildirim sonrası "gönderildi" mikro-metni gösterip
göstermeme (şu an component kendi başarı durumunu taşımıyor, tamamen
çağırana bırakıldı — `GlassReviewCard.onHelpful` ile aynı karar).

## Changelog

- 2026-07-17: İlk sürüm — `card`/`compact` varyantları, kendi çizilen SVG
  halka, zorunlu AI rozeti + opsiyonel güven metni, kriter chip listesi,
  👍/👎 geri bildirim, flat `loading` placeholder.
- 2026-07-17: Review düzeltmesi — eşleşmeyen kriter chip'inde metni de
  kapsayan element-genelinde `opacity: 0.75` kaldırıldı (WCAG AA kontrast
  ihlali; `--lg-label-secondary` zaten ikincil ton, ek opacity zemin +
  metni birlikte solduruyordu). "Soluk" görünüm artık yalnız zeminden
  (`color-mix(... var(--lg-label) 6% ...)`) geliyor, metin rengi tam
  kontrastta kalıyor. Regresyon testi eklendi (§11).
- 2026-07-17: Codex review düzeltmesi (4 bulgu) —
  1) kriter chip'lerinde eşleşme durumu artık görsel-gizli "(eşleşti)"/
     "(eşleşmedi)" metniyle de AT'ye iletiliyor (ikon dekoratif kalmaya
     devam ediyor, yalnız `data-matched`'e güvenmek AT için yetersizdi);
  2) geri bildirim seçimi artık `value`/`criteria` içerik imzası (ref +
     render sırasında karşılaştırma) değiştiğinde otomatik sıfırlanıyor —
     önceki "faydalı" işareti farklı bir ilana/skora geçince asılı
     kalmıyordu; aynı yöne tekrar tıklama artık gerçek bir toggle (seçimi
     geri alıyor), `onFeedback` yine her tıklamada çağrılıyor;
  3) `loading=true` placeholder'ında kaybolan zorunlu "✦ AI" rozeti geri
     eklendi (AI-first standardı yükleme durumunu istisna tutmuyor);
  4) `.aiBadge` CSS bloğu `GlassAiSummaryCard.module.css`'teki `.badge`
     bloğuyla birebir aynı hale getirildi (`padding: 3px var(--lg-space-2)`
     + `flex: none`). Her bulgu için regresyon testi eklendi (§11).
