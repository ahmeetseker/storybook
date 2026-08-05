---
name: GlassTimeline
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTimeline Kuralları

## 1. Amaç

İlan sürecini (ör. "İlan Yayınlandı" → "Tapu Devri Tamamlandı") veya bina
geçmişini (ör. "Temel Atıldı" → "İskan Alındı") kronolojik, dikey bir liste
olarak gösterir. Salt görüntüleme amaçlıdır — etkileşimli seçim, sıralama
veya düzenleme taşımaz.

- **Kullan:** ilan detay sayfasında süreç/geçmiş özetleyen salt-okunur
  kronoloji.
- **Kullanma:** adım adım ilerleyen bir sihirbaz/form akışı (→ ayrı bir
  stepper component, bu değil), etkileşimli sıralanabilir liste (→
  `GlassTable`), tek bir anlık durum göstergesi (→ `GlassBadge`).

| İlgili | Farkı |
|---|---|
| `GlassNearbyPlaces` | Kategori bazlı, `tabs`/`chips` etkileşimli grup listesi; Timeline etkileşimsiz, tek eksenli kronoloji. |
| `GlassTable` | Satır/sütun veri tablosu, sıralama/seçim taşır; Timeline'ın tek boyutu zaman. |
| `GlassScoreMeter`/`GlassMatchScore` | Tekil skor göstergesi; Timeline çok olaylı bir akışı gösterir. |

## 2. Semantik sözleşme

- Kök: `<div>` — boş `events` durumunda da render edilir (bilgilendirici
  metinle).
- Liste: gerçek `<ul role="list">`; her olay `<li role="listitem">`.
  `role` öznitelikleri açıkça yazılır çünkü `list-style: none` uygulanan
  listelerde Safari/VoiceOver implicit liste semantiğini düşürür — bilinen
  bir motor hatasına karşı kasıtlı bir savunma (bkz. `GlassTable`/
  `GlassNearbyPlaces` ile paylaşılan desen).
- Ray (nokta + dikey bağlantı çizgisi, yalnız `variant="line"`) ve
  `variant="compact"`'taki küçük ton noktası TAMAMEN dekoratif —
  `aria-hidden="true"` taşır. Erişilebilir bilgi yalnız `date`/`title`/
  `description` metinlerinden gelir.
- `date` bir `<time>` elementi olarak render edilir (görsel/semantik, `dateTime`
  attribute'ü YOK — `date` serbest metin formatında geldiği için makine
  okunur bir ISO değeri türetilemez; bilinçli kısıt, bkz. §12).
- Ton bilgisi (`success`/`warning`/`danger`) yalnız nokta rengiyle
  taşınmaz: başlığın sonuna görsel-gizli (`srOnly`) "— Durum: …" metni
  eklenir (`default` tonunda hiçbir ek metin eklenmez — nötr, ayrıca
  duyurulacak bir durum yok).
- `event.id` hiçbir DOM `id` özniteliğine yazılmaz — yalnız React `key`
  olarak kullanılır (ham veri id'sinin DOM'a sızmasını, çakışma/geçersiz
  seçici riskini önler; bkz. `GlassChatDock`/`GlassNearbyPlaces` ile aynı
  karar).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| rail (nokta+çizgi) | Yalnız `variant="line"` | ton renkli nokta, opsiyonel `icon`, dikey bağlantı çizgisi | `aria-hidden`; son olayda bağlantı çizgisi render edilmez |
| compact nokta | Yalnız `variant="compact"` | ton renkli küçük nokta | `aria-hidden` |
| date | ✅ | `event.date` | tabular-nums, küçük/ikincil |
| title | ✅ | `event.title` + (tone'luysa) sr-only durum eki | `--lg-text-body`/600, birincil label rengi |
| description | Yalnız `variant="line"` ve `event.description` verilmişse | `event.description` | `variant="compact"`'ta render EDİLMEZ (spec: "yalnız tarih+başlık") |
| emptyState | Yalnız `events.length === 0` | `emptyState` prop'u ya da varsayılan metin | Liste hiç render edilmez, `role="list"` yok |

Children kabul edilmez — tamamen `events` prop'u güdümlü. Bu, yalnız
dokümantasyonel bir kural değil: `GlassTimelineProps`, `HTMLAttributes<HTMLDivElement>`'tan
`'title' | 'children'` ikisini birden `Omit` eder — `children` tip
seviyesinde public API'den çıkarılmıştır (aksi halde `{...rest}` spread'i
`children`'ı div'e taşıyabilir ve JSX'in açık children'ı sessizce ezmesiyle
veri kaybına yol açardı; bkz. §11 tip-only regresyon testi).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| events | prop | `GlassTimelineEvent[]` | — (zorunlu) | — | `{ id, date, title, description?, tone?, icon? }` |
| variant | prop | `'line' \| 'compact'` | `'line'` | — | Görsel biçim |
| emptyState | prop | `ReactNode` | dahili metin | — | `events` boşken gösterilir |
| aria-label | prop | `string` | — | — | `role="list"` accessible name kaynağı — sayfada birden çok örnek varsa önerilir |
| className | prop | `string` | — | — | Köke birleştirilir |

Ref hedefi yok. Controlled/uncontrolled state modeli N/A — component salt
görüntüleme, iç state taşımaz.

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`thickness`/`prominent` eksenleri **N/A** bileşen
düzeyinde (yalnız `event.tone` her olay bazında bağımsız bir eksen). Tek
bileşen-düzeyi ekseni `variant`.

| Eksen | Değerler | Varsayılan |
|---|---|---|
| `variant` | `line` \| `compact` | `line` |
| `event.tone` | `default` \| `success` \| `warning` \| `danger` | `default` |

| Yasak / türetilen | Davranış |
|---|---|
| `variant="compact"` + `event.description` | Açıklama sessizce render edilmez (spec kararı, veri kaybı yok — yalnız görsel olarak gizli) |
| `variant="compact"` + `event.icon` | İkon render edilmez (yalnız `line` rayındaki markerde yer var); nokta rengi yine `event.tone`'u yansıtır |
| `event.tone` verilmez | `'default'` varsayılır — nötr nokta rengi, sr-only durum metni eklenmez |

## 6. State modeli

N/A — component tamamen prop güdümlü, hiçbir iç React state'i yok. Render
sırası: `events.length === 0` → emptyState; aksi halde her `event` için
`variant` → `tone` sırasıyla görsel çözümlenir.

## 7. Davranış

- Etkileşim yok: pointer/touch/keyboard davranışı, focus yönetimi, async
  akış N/A — bileşen hiçbir zaman odak alan bir eleman render etmez.
- `events` dizisi her render'da olduğu gibi eşlenir (index bazlı sıralama
  değişikliği component tarafından yapılmaz — çağıran zaten istenen sırada
  vermelidir).
- Son olayın altında bağlantı çizgisi çizilmez (`isLast` kontrolü) — ray
  listenin sonunda "boşa" uzamaz.
- Responsive: sabit breakpoint yok; içerik gövdesi (`title`/`description`)
  `overflow-wrap: anywhere` ile daralan konteynerde satır kırar, ray/nokta
  hizası bundan etkilenmez (bkz. UzunIcerik/Responsive story).

## 8. İçerik kuralları

- `title` kısa tutulmalı ama uzun Türkçe kelimeler dahi satır içi kırılır
  (`overflow-wrap: anywhere`) — component taşma/kesme (`text-overflow`)
  uygulamaz, tam metin her zaman okunabilir kalır.
- `description` yalnız `variant="line"`'da anlamlıdır; `variant="compact"`
  veri modelinde tutulabilir (component prop'u yok saymaz, sadece
  render'lamaz) — aynı `events` dizisi iki varyant arasında değiştirilebilir.
- `date` formatı serbest bırakılmıştır (örnek: "12 Tem 2026", "2016") —
  component bir tarih ayrıştırması/sıralaması YAPMAZ, yalnız verilen metni
  gösterir.
- Boş `events`: hata fırlatmaz, `emptyState` prop'u ya da varsayılan
  "Henüz zaman çizelgesi kaydı yok." metni gösterilir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök yüzey | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| nokta (default) | background | `--lg-label-secondary` | `data-tone="success/warning/danger"` → koyulaştırılmış `color-mix(in srgb, var(--lg-success/warning/danger) 68%, var(--lg-label))` |
| ikonlu marker zemin | background | `color-mix(in srgb, var(--lg-label-secondary) 14%, var(--lg-surface))` | ton bazlı `color-mix(... 16%, ...)` eşdeğeri (dekoratif tint — anlamı ikon `color`'ı taşır) |
| ikonlu marker ikon rengi | color | `--lg-label-secondary` | `data-tone="success/warning/danger"` → aynı `color-mix(... 68%, var(--lg-label))` formülü |
| bağlantı çizgisi | background | `--lg-hairline` | — (ton rengi taşımaz, kasıtlı — bkz. §12) |
| tarih | color | `--lg-label-secondary` | — |
| başlık | color | `--lg-label` | — (semantik renk METNE uygulanmaz, yalnız nokta/zemin — kontrat notu) |
| açıklama | color | `--lg-label-secondary` | — |
| focus halkası | outline | N/A | bileşen hiçbir odaklanabilir eleman içermez |

**Kontrast notu (ton noktaları):** ham `var(--lg-success/warning/danger)`
zemin üzerinde WCAG "non-text contrast" ≥3:1 eşiğini açık temada kaçırıyordu
(ölçülen: success ~2.22:1, warning ~2.20:1, danger ~3.55:1 — bkz. Codex
dalga4 konsolide raporu). Fix: `color-mix(in srgb, var(--lg-<tone>) 68%,
var(--lg-label))` — semantik rengin `--lg-label` ile karışımı; `--lg-label`
koyu olduğu için bu formül ≥3:1 eşiğini güvenle sağlar: ölçülen sonuç
success ~3.95:1, warning ~3.90:1, danger ~5.88:1. İkonlu marker'da aynı
formül ikonun `color`'ına uygulanır (zemin tint'i dekoratif
kaldığı için ham renkte bırakılabilir — kontrast hedefi anlam taşıyan
grafiğe, yani ikonun kendisine bakar).

**Borç (raw / mikro-geometri):** token karşılığı olmayan görsel sabitler
component kökünde yerel değişken olarak toplanır (görsel değer değişmedi):
`--tl-rail-w: 24px` · `--tl-marker-size: 10px` · `--tl-marker-icon-size:
22px` · `--tl-marker-glyph: 13px` (marker içi SVG ikon) · `--tl-marker-offset:
6px` · `--tl-connector-w: 2px` · `--tl-dot-size: 8px` · `--tl-dot-offset:
7px` · `--tl-text-gap: 2px`. Ayrıca ton
koyulaştırma karışım oranı `68%` (spec görsel sabiti — `--lg-*` ölçeğinde
"kontrast karışım oranı" token'ı yok; bkz. yukarıdaki kontrast notu).
2026-07-24: `.title` font-size borcu `--lg-text-body`'ye taşınarak kapandı
(14→15px, ≤1.5px kabul aralığında).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (`line` vs `compact` yan yana), Durumlar
(ton ekseni: default/success/warning/danger + boş liste), Uzun İçerik,
Responsive (mobile1, 320px), Erişilebilirlik (docs description'lı).

`Sizes` ayrı story olarak yok: `size` ekseni tanımlı değil.

## 11. Test kabul kriterleri

- [x] `role="list"` + her olay `role="listitem"`, başlık/tarih metniyle render edilir
- [x] `variant="line"` (varsayılan) açıklamayı gösterir
- [x] `variant="compact"` açıklamayı render ETMEZ
- [x] `tone` verilmeyen (`default`) olayda sr-only durum metni eklenmez
- [x] `tone="success"/"warning"/"danger"` olaylarda sr-only "— Durum: …" metni duyurulur
- [x] ray/nokta/bağlantı çizgisi `aria-hidden` taşır, erişilebilir isme katkı vermez
- [x] boş `events` hata fırlatmaz, varsayılan bilgilendirici metni gösterir, `role="list"` render edilmez
- [x] boş `events` + özel `emptyState` prop'u özel içeriği gösterir
- [x] `aria-label` liste accessible name'ini belirler
- [x] `event.id` hiçbir DOM `id` özniteliğine yazılmaz
- [x] `children` prop tipinden omit edilmiştir — tip-only regresyon testi (`@ts-expect-error`) derleme zamanı sözleşmesini doğrular
- [x] Ton noktaları (`marker`/`compactDot`/ikonlu marker `color`) ham semantik renk yerine `color-mix(... 68%, var(--lg-label))` kullanır — kaynak CSS regresyon testiyle statik doğrulanır
- [ ] Nokta/hairline kontrastı (visual, Chrome)

## 12. Do / Don't

- ✅ `events` dizisini zaten istenen kronolojik sırada ver — component
  sıralama yapmaz.
- ✅ Ton bilgisini yalnız `event.tone` üzerinden ver — metne manuel renk
  eklemeye gerek yok, sr-only durum metni otomatik eklenir.
- ✅ `variant="compact"`'ı yalnız kısa özet gerektiğinde kullan (bina
  geçmişi gibi); süreç detayına ihtiyaç varsa `variant="line"` + `icon`
  kullan.
- ❌ `date` alanına ayrıştırılması gereken karmaşık bir format verme —
  component hiçbir tarih mantığı yürütmez, olduğu gibi gösterir.
- ❌ Bağlantı çizgisine ton rengi uygulamaya çalışma — çizgi kasıtlı olarak
  nötr (`--lg-hairline`), yalnız nokta ton taşır (spec: "sol rayda nokta —
  tone rengi", çizgi için ton belirtilmedi).
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** AI-first kontratı (zorunlu "✦ AI" rozeti/`confidence`/
`onFeedback`/`loading`) bu component'e BİLİNÇLİ OLARAK eklenmedi —
`GlassTimeline` yapay zekâ tarafından üretilen bir içerik göstermez, spec'in
verdiği `events` alanları (`id`/`date`/`title`/`description?`/`tone?`/
`icon?`) insan/sistem kaynaklı olay kayıtlarıdır; kontratın "TÜM AI
component'lerinde zorunlu" ibaresi yalnız AI-üretimi içerik gösteren
component'leri bağlar (bkz. `GlassMatchScore`/`GlassChatDock`). `date`'e
`dateTime` attribute'ü eklenmedi çünkü format serbest bırakıldı (spec: "ör.
'12 Tem 2026'") — ISO'ya güvenilir dönüşüm garanti edilemez; ihtiyaç
doğarsa `event.dateTime?: string` opsiyonel bir alan olarak eklenip
`<time dateTime={event.dateTime ?? undefined}>` şeklinde genişletilebilir
(geriye dönük uyumlu).

## Changelog

- 2026-07-17: İlk sürüm — `line`/`compact` varyantları, ton ekseni
  (`default`/`success`/`warning`/`danger`) + sr-only durum metni,
  `role="list"`/`role="listitem"` açık liste semantiği, boş durum,
  ikon destekli ray marker'ı.
- 2026-07-17: Codex dalga4 konsolide rapor fix'leri —
  (1) `GlassTimelineProps`, `HTMLAttributes`'tan `children`'ı da `Omit` eder
  (önceden yalnız `title` omit ediliyordu; `children` tip seviyesinde sızıp
  `{...rest}` ile div'e geçebiliyordu — render yolu değil tip yolu tercih
  edildi, bkz. §3);
  (2) ton noktaları (`marker`/`compactDot`/ikonlu marker ikon rengi) ham
  semantik renk yerine `color-mix(in srgb, var(--lg-<tone>) 68%,
  var(--lg-label))` kullanır — açık temada ~2.2–3.6:1 olan kontrast
  ~3.9–5.9:1'e çıkarılarak WCAG non-text ≥3:1 eşiği karşılandı (bkz. §9).
  İki davranış fix'i için de regresyon testi eklendi (§11).
- 2026-07-24: Tasarım sistemi uyum düzeltmesi — `.title` font-size
  `--lg-text-body`'ye taşındı (14→15px); `@media (max-width: 360px)` padding
  daraltması kaldırıldı (içsel akış kuralı — breakpoint yok); marker/nokta/
  ray/bağlantı çizgisi mikro-geometrisi component kökünde yerel `--tl-*`
  değişkenlerinde toplandı (görsel değer değişmedi, bkz. §9 borç notu).
