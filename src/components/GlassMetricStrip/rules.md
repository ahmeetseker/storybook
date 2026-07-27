---
name: GlassMetricStrip
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassMetricStrip Kuralları

## 1. Amaç

Bir dizi KPI/metriği tek satırda özetleyen gösterge şeridi (dashboard başlığı,
portföy özeti, ilan performansı). İçerik katmanı — bilinçli olarak cam DEĞİL:
sürekli okunan istatistikler, cam malzemenin anlamı yok.

- **Kullan:** satıcı/kurumsal panolarda özet metrikler, ilan yönetim başlığı.
- **Kullanma:** tekil görselleştirilmiş skor (→ `GlassScoreMeter`), etiket/değer
  detay listesi (→ `GlassSpecTable`), süreç ilerlemesi (→ `GlassProgress`).

## 2. Semantik sözleşme

- Kök `<dl>` + `aria-label` (şeridin erişilebilir adı). Her metrik bir
  `<dt>` (label) + `<dd>` (value + change) çiftidir.
- Trend yönü asla yalnız renkle iletilmez: görünür ok glifi `aria-hidden`,
  yanında sr-only yön metni ("Yükseliş:" / "Düşüş:" / "Yatay:") ikinci kanaldır.
- Sayısal değerler tabular-nums ile hizalanır.
- Etkileşim yok; `tabIndex`/klavye hedefi değildir.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| label (`dt`) | ✅ | metrik adı |
| value (`dd > strong`) | ✅ | öne çıkan değer |
| change | — | değişim ifadesi + trend göstergesi |
| hint | — | küçük yardımcı açıklama |

Children kabul edilmez — tamamen `items` prop güdümlü.

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| items | `GlassMetricStripItem[]` | — (zorunlu) | `{id,label,value,change?,trend?,hint?}` |
| label | `string` | `'Temel göstergeler'` | Şeridin `aria-label`'i |
| size | `'md'\|'sm'` | `'md'` | Yoğunluk |
| ...rest | `HTMLAttributes<HTMLDListElement>` (aria-label hariç) | — | `className`/`style` birleşir |

`...rest` yönetilen `aria-label`/`className`'den ÖNCE yayılır — caller yönetilen
attribute'u ezemez.

## 5. Seçenek eksenleri

Varsayılan: `size=md`. `material`/`thickness`/`prominent` N/A (cam değil).
`tone` ekseni yok — trend her metriğin kendi yönünü taşır.

| Türetilen | Davranış |
|---|---|
| `change` yok | trend göstergesi hiç çizilmez |
| `change` var, `trend` yok | yön `steady` ("Yatay") varsayılır |

## 6. State modeli

Etkileşimsiz. Durum yalnız veri (`items`) ile belirlenir; hover/focus/active yok.

## 7. Davranış

- Responsive: metrikler `flex-wrap` ile dar ekranda alt alta akar; her metrik
  `flex: 1 1 140px`.
- Animasyon yok (statik gösterge); reduced-motion etkisi yok.

## 8. İçerik kuralları

- `label` kısa metrik adı; sayıyı içermez (sayı zaten `value`'da).
- `change` yönle tutarlı olmalı ("%12" + trend `up`). Yön metni renk-kör
  kullanıcılar için tek anlam kanalıdır.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| number | font-size | `--lg-text-title` (md) / `--lg-text-headline` (sm) |
| label/hint | color | `--lg-label-secondary` |
| change up | color | `--lg-success` |
| change down | color | `--lg-danger` |
| gap | gap | `--lg-space-5` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkenlerde toplanır — `--strip-item-basis` (metrik hücresi
`flex: 1 1` taban genişliği 140px; sarma kırılımını belirleyen yerleşim
kararı, kırılım genişliği için token yok) ve `--strip-change-gap` (`change`
ok-metin arası 2px boşluk). Bunların dışında raw px yok.

## 10. Storybook kapsamı

Default, TrendYonleri, DegisimsizDegerler, Kompakt, UzunIcerik, Responsive
(mobile1), Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] `dl`/`dt`/`dd` semantiği + `aria-label`
- [x] varsayılan ad "Temel göstergeler"
- [x] trend yönü sr-only metinle iletilir (3 yön)
- [x] `change` yokken trend göstergesi yok
- [x] `change` var `trend` yok → "Yatay"
- [x] rest-override koruması (aria-label ezilemez)
- [ ] dar ekran flex-wrap akışı (visual)

## 12. Do / Don't

- ✅ `label`'ı kısa tut; sayıyı `value`'ya koy.
- ✅ Trend verirken yönü doğru eşle (renk-kör kullanıcı yön metnine güvenir).
- ❌ Cam yüzey/backdrop ekleme (içerik katmanı).
- ❌ `value`'yu grafik/ilerleme olarak kullanma (→ `GlassScoreMeter`/`GlassProgress`).

## Changelog

- 2026-07-18: İlk sürüm — `dl` KPI şeridi, renk-dışı trend kanalı,
  rest-override koruması. Codex `CodexMetricStrip`/`CodexStat` deseninden türetildi.
