---
name: GlassListingManagementCard
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassListingManagementCard Kuralları

## 1. Amaç

Satıcı tarafı ilan yönetim kartı: yaşam döngüsü durumu, "işlem gerekli"
uyarısı, performans metrikleri ve yönetim aksiyonları. Alıcı-yüzü
`GlassListingCard`'dan farklıdır.

- **Kullan:** satıcı "İlanlarım", ilan yönetimi/moderasyon kuyruğu.
- **Kullanma:** alıcıya gösterilen ilan kartı (→ `GlassListingCard`), kayıtlı
  arama (→ `GlassSavedSearchCard`).

## 2. Semantik sözleşme

- Kök `<article>` — kartın tamamı button DEĞİL (GlassListingCard hatası
  tekrarlanmaz); başlık gerçek heading (`headingAs`).
- Durum ("Taslak/İncelemede/Yayında/Değişiklik istendi/Duraklatıldı/Süresi
  doldu") renk dışında metinle iletilir; sol kenar rengi ikincil kanaldır.
- `issue` verilirse `role="status"` "İşlem gerekli" bölümü.
- Görsel yoksa temsili medya `role="img"` + `aria-label`.
- Başlık yalnız `onOpen` verildiğinde erişilebilir `<button>` olur; aksi halde
  statik (false affordance yok).
- Metrikler `dl/dt/dd`.
- `actions` ayrı erişilebilir kontroller içindir.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| media / placeholder | ✅ | görsel veya temsili medya |
| top | ✅ | referans + başlık + durum rozeti |
| price | — | fiyat |
| issue | — | `role="status"` uyarı |
| stats | — | `dl` metrikler |
| updated | — | güncelleme etiketi |
| actions | — | yönetim butonları |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| title | `string` | — (zorunlu) | başlık |
| state | `GlassListingState` | — (zorunlu) | yaşam döngüsü |
| issue | `string` | — | "işlem gerekli" |
| stats | `GlassListingStat[]` | — | `{id,label,value}` |
| imageSrc / imageAlt | `string` | — | görsel; yoksa temsili medya |
| priceLabel / referenceLabel / updatedLabel | `string` | — | metin slotları |
| actions | `ReactNode` | — | yönetim kontrolleri |
| onOpen | `()=>void` | — | verilirse başlık tetikleyici olur |
| headingAs | `'h2'\|'h3'\|'h4'` | `'h3'` | — |
| ...rest | `HTMLAttributes<HTMLElement>` (title hariç) | — | önce yayılır |

`state`: draft\|review\|live\|changes\|paused\|expired.

## 5. Seçenek eksenleri

Varsayılan: `headingAs=h3`. Cam yok (içerik katmanı).

| Türetilen | Davranış |
|---|---|
| `imageSrc` yok | temsili medya `role="img"` |
| `onOpen` yok | statik başlık |
| `issue` yok | uyarı bölümü yok |

## 6. State modeli

Kart durumu tamamen prop (`state`); iç etkileşim state'i yok. Başlık butonu
yalnız `onOpen`'a bağlı.

## 7. Davranış

- Başlık butonu `:focus-visible` + hover underline.
- Dar container'da medya üste yığılır — breakpoint yok, içsel akışla:
  kök `flex-wrap`, gövde `flex: 999 1 min(100%, var(--card-body-basis))`
  (≈376px taban). Gövdeye taban genişliği kalmayınca medya tek başına ilk
  satırda kalır, tam genişliğe büyür ve `max-height` (140px) ile kırpılır.
- `.titleButton:hover` yalnız `@media (hover: hover)` içinde tanımlıdır.
- Animasyon yok.

## 8. İçerik kuralları

- `state` gerçek yaşam döngüsünü yansıtmalı; metin birincil, renk ikincil kanal.
- `issue` somut ve eyleme çağıran olmalı ("Tapu belgesi yüklenmeli").
- Temsili medya etiketi bağlamlı ("… — görsel yok").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` |
| sol kenar | border-inline-start | duruma göre danger/warning/success/hairline |
| state rozeti | background | `color-mix(semantik ...)` |
| issue | background/border | `color-mix(--lg-danger ...)` |
| price | font-size | `--lg-text-title` |

Mikro-geometri borcu: token karşılığı olmayan raw ölçüler component kökünde
yerel değişkenlerde toplanır — `--card-strip-w` (sol durum şeridi 3px),
`--card-media-size` (96px), `--card-media-stack-h` (yığılmış medya 140px),
`--card-heading-gap` (2px), `--card-stat-gap` (1px), `--card-state-pad-block`
(2px), `--card-body-basis` (içsel sarma tabanı 376px). Görsel değerler
değişmedi; `@media (max-width: 520px)` kırılımı kaldırıldı (bkz. §7).
Metrik değerleri `font-weight: 600` (eski 650 — ölçek dışıydı).

## 10. Storybook kapsamı

Default, Tüm Durumlar, İşlem Gerekli, Görselsiz Temsili Medya, Statik Başlık,
Responsive (mobile1), Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] article + gerçek heading (kart button değil)
- [x] durum rozeti metin kanalı
- [x] `issue` → `role="status"`
- [x] görselsiz temsili medya `role="img"` + etiket
- [x] `onOpen` → başlık butonu + callback
- [x] `onOpen` yok → statik başlık
- [x] metrikler `dl/dt/dd`
- [x] actions footer

## 12. Do / Don't

- ✅ Kartı `<article>` tut; başlığı heading yap.
- ✅ Durumu metinle ilet; rengi yalnız pekiştirici kullan.
- ❌ Kartın tamamını button yapma (GlassListingCard hatası).
- ❌ `onOpen` olmadan başlığı tıklanabilir gösterme.

## Changelog

- 2026-07-18: İlk sürüm — article + heading, yaşam döngüsü durumu, işlem-gerekli
  uyarısı, temsili medya. Codex `CodexListingManagementCard` deseninden türetildi.
