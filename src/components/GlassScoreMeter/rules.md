---
name: GlassScoreMeter
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassScoreMeter Kuralları

## 1. Amaç

0-100 yaşanabilirlik/skor göstergesi (Walk Score deseni). Bir konumun tek bir
metriğini (yürünebilirlik, ulaşım, okullara yakınlık, sessizlik...) sayısal
skor + kısa açıklamayla özetler. İçerik katmanı component'idir — bilinçli
olarak cam DEĞİL: skor göstergesi devamlı okunan bir istatistik, cam
malzemenin anlamı yok.

- **Kullan:** ilan detay sayfasında konum/yaşanabilirlik metrikleri (4'lü
  grid), kart içi mini özet rozeti (`badge`).
- **Kullanma:** işlem ilerlemesi/yükleme yüzdesi (→ `GlassProgress`), ayrık
  durum etiketi (→ `GlassBadge`), çok satırlı karşılaştırma tablosu (→
  `GlassSpecTable`).

| İlgili | Farkı |
|---|---|
| GlassProgress `circle` | Süreç ilerlemesi (geçici); ScoreMeter kalıcı bir metriği değerlendirir, renk eşiği semantik |
| GlassSpecTable | Etiket/değer listesi; ScoreMeter tekil, görselleştirilmiş bir skor |
| GlassBadge | Ayrık durum rozeti; ScoreMeter sayısal ölçek taşır (`role="meter"`) |

## 2. Semantik sözleşme

- Element: `<div role="meter">` + `aria-valuemin={0}`, `aria-valuemax={100}`,
  `aria-valuenow={clampedValue}` (WAI-ARIA meter — progressbar değil, "işlem"
  değil "değerlendirme" bildirir).
- Accessible name görünür etiketten `aria-labelledby` ile gelir (`aria-label`
  DEĞİL — etiket zaten görsel olarak render edildiği için çift okuma
  yaratılmaz).
- `description` verilirse `aria-describedby` ile bağlanır; `badge`
  varyantında hiç render edilmez (görsel yer yok) — bu durumda
  `aria-describedby` de verilmez.
- Sayı düğümleri (`ringValue`/`barValue`/`badgeValue`) `aria-hidden` — değer
  zaten `aria-valuenow`'da, AT'ye iki kez okutulmaz.
- Portal yok, ref forwarding yok (statik sunum, GlassProgress ile aynı karar).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| ring/track | yalnız `ring` | — | SVG `<circle>`, `--lg-hairline` zemin |
| ring/fill | yalnız `ring` | — | SVG `<circle>`, `stroke-dasharray` ile dolum |
| ring/value | yalnız `ring` | tamsayı | Merkezde, büyük tabular sayı |
| bar/track+fill | yalnız `bar` | — | Yatay ölçek, `GlassProgress.bar` ile aynı desen |
| bar/value | yalnız `bar` | tamsayı | Başlığın yanında |
| badge/value+label | yalnız `badge` | tamsayı + metin | Tek satır, kart içi mini |
| label | ✅ (tüm varyantlar) | metin | Accessible name kaynağı |
| description | — | metin | `ring`/`bar`'da görünür; `badge`'de render edilmez |

Children kabul edilmez — tamamen prop güdümlü (GlassProgress deseniyle
tutarlı).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| value | prop | `number` | — (zorunlu) | — | [0, 100]'e clamp + yuvarlanır; görsel ve `aria-valuenow` aynı tamsayı |
| label | prop | `string` | — (zorunlu) | — | Görünür etiket; `aria-labelledby` kaynağı |
| description | prop | `string` | — | — | `ring`/`bar`'da görünür ikincil metin; `badge`'de yok sayılır |
| variant | prop | `'ring'\|'bar'\|'badge'` | `'ring'` | — | Görsel biçim |
| tone | prop | `'success'\|'accent'\|'danger'` | — | — | Otomatik eşiği geçersiz kılar |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (aria-label hariç) | — | — | `className`/`style` birleştirilir |

Ref hedefi yok. Event sözleşmesi yok — tamamen statik/kontrollü görüntüleme
(GlassProgress ile aynı karar: skor dışarıdan hesaplanır, component yalnız
çizer).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=ring`, otomatik ton (value'dan).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (tema bağlamı: light/dark/auto) | N/A — bu component'te `tone` prop'u semantik renk eşiği anlamında kullanılır (Açık Kararlar'da not) |
| `size` | N/A — spec'te istenmedi; ring/bar/badge her biri tek sabit ölçekte (§9 borç) |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `description` + `variant="badge"` | Render edilmez, `aria-describedby` verilmez (sessizce yok sayılır, hata fırlatılmaz) |
| `value` aralık dışı | [0, 100]'e clamp + `Math.round` — hata fırlatılmaz |
| `tone` verilmişse | Otomatik eşik hesaplanmaz, direkt kullanılır |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| değer/ton | `value` (+ opsiyonel `tone`) | — | `aria-valuenow`, `data-tone` |
| disabled/hover/focus/active | — | — | YOK — etkileşimsiz, klavye/touch hedefi değil |

Katman sırası: value (clamp) → tone (auto veya override) → render. Etkileşim
katmanı yok.

## 7. Davranış

- Değer değişimi: ring `stroke-dashoffset`, bar `width` 0.3s ease-out ile
  akar (GlassProgress ile aynı geçiş süresi/eğrisi — tutarlı "dolum" hissi).
- `prefers-reduced-motion: reduce`: geçişler kapanır, değer sıçrayarak
  güncellenir.
- Responsive: `bar` konteynerinin %100 genişliğine uyar; `ring`/`badge` sabit
  ölçekte (kırılım gerekmez — dar ekranda `bar` tercih edilmeli).
- Etkileşim yok: klavye/touch hedefi değildir, `tabIndex` verilmez.

## 8. İçerik kuralları

- `label` kısa bir metrik adı olmalı ("Yürünebilirlik", "Ulaşım",
  "Okullar", "Sessizlik") — yüzdeyi/sayıyı içermez (sayı zaten görsel +
  `aria-valuenow`'da).
- `description` tek cümlelik somut gerekçe ("Günlük işler yürüyerek
  hallediliyor") — `badge`'de yer olmadığından hiç yazılmamalı ya da
  verilirse component sessizce göz ardı eder.
- Uzun `description` ring'de metin sarar (`meta` sütunu `min-width:0` +
  `overflow-wrap`); bar'da satır altında sarar; TR uzun bileşik kelimeler
  test edilmiştir (bkz. UzunIcerik story).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| ringTrack/barTrack | stroke/background | `--lg-hairline` | — |
| ringFill/barFill/değer metni | stroke/background/color | `--glass-score-tone` ← `--lg-success/-accent/-danger` | `tone` prop veya otomatik eşik |
| label | color | `--lg-label` | — |
| description | color | `--lg-label-secondary` | — |
| track (bar) | radius | `--lg-radius-capsule` | — |
| ring/bar aralığı | gap | `--lg-space-2`/`--lg-space-4` | — |
| ring/bar/badge sayı | font-size | `--lg-text-title` (ring) / `--lg-text-headline` (bar, badge) | — |

**Borç (raw):** ring SVG çapı 96px + stroke-width 8, bar track yüksekliği
8px — GlassProgress'teki circle/bar ölçek borcuyla aynı gerekçe: gösterge
kalınlığı/çapı için token yok.

## 10. Storybook kapsamı

Var: Default, Playground, Variants (ring/bar/badge yan yana), ToneEsigi
(otomatik eşik + manuel override), GridKompozisyon (4'lü Walk Score deseni —
Yürünebilirlik/Ulaşım/Okullar/Sessizlik), UzunIcerik, Responsive
(mobile1, bar), Erişilebilirlik (docs description'lı).

`States` story'si N/A — component etkileşimsiz; "durum" ekseni burada renk
eşiğidir ve `ToneEsigi` story'si bu rolü karşılar. `Sizes`/`Temalar` ayrı
story olarak yok: `size` ekseni component'te tanımlı değil, tema toolbar'la
otomatik doğrulanır (GlassProgress ile aynı karar).

## 11. Test kabul kriterleri

- [x] meter rolü + valuemin/valuemax/valuenow + `aria-labelledby` ile ad
- [x] value clamp ([0,100], yuvarlama)
- [x] description varsa `aria-describedby` ile bağlanır (ring/bar)
- [x] badge'de description ne görsel ne `aria-describedby`'de var
- [x] otomatik ton eşiği (≥70/40-69/<40) `data-tone`'a yansır
- [x] `tone` prop'u otomatik eşiği geçersiz kılar
- [x] ring: SVG 2 circle + dashoffset %50'de çevrenin yarısı
- [x] bar: fill genişliği value yüzdesiyle birebir
- [x] badge: sayı + etiket birlikte render edilir
- [ ] reduced-motion'da transition kapanması (visual)

## 12. Do / Don't

- ✅ `label`'ı kısa ve sayısız tut — sayı zaten görsel ve ARIA'da var.
- ✅ Aynı sayfada birden çok metrik gösterirken (Walk Score deseni) her biri
  ayrı `GlassScoreMeter` — tek component çoklu skor taşımaz.
- ✅ `badge` varyantını yalnız zaten çerçeveli bir kart içinde kullan (kendi
  zemini yok).
- ❌ `tone`'a keyfi renk verme — yalnız `success`/`accent`/`danger` semantik
  seti; tema rengi (`--lg-accent` dışı marka rengi) buraya girmez.
- ❌ `value`'yu string/yüzde formatlı verme — sayı prop'u ham `number`.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** `tone` adı burada semantik renk eşiği taşıyor (diğer
component'lerdeki `tone: light|dark|auto` tema bağlamıyla isim çakışıyor —
bu component `material`/tema `tone` eksenini hiç kullanmadığından pratikte
çakışma yok, ama v2'de global isimlendirme netleştirilirse gözden geçirilir)
· `size` ekseni ihtiyacı (kart içi çok küçük ring) · maksimum skor 100 dışı
ölçekler (ör. 1-10) desteği.

## Changelog

- 2026-07-17: İlk sürüm — ring/bar/badge varyantları, otomatik/override renk
  eşiği, `role="meter"` sözleşmesi, 4'lü grid kompozisyon story'si.
