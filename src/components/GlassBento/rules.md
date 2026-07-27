---
name: GlassBento
category: içerik
status: hazır
lastReviewed: 2026-07-16
---

# GlassBento Kuralları

## 1. Amaç

Simetrik vitrin mozaiği: ilan kartları + canlı veri hücreleri (istatistik,
harita önizleme, CTA) aynı grid'de. "Veri bento'su" konsepti (kullanıcı seçimi
E — Zillow platform hissi). Hero'nun `bento` slotuna veya sayfa gövdesine konur.

- **Kullan:** ana sayfa vitrini, bölge/kategori açılış sayfaları.
- **Kullanma:** salt liste sonuçları (→ GlassListingCard grid'i), tekil kart.

## 2. Semantik sözleşme

- Kök `<div>` grid; hücreler `data-bento-item` sarmalayıcıda.
- `Feature` gerçek `<button>` (tamamı tıklanabilir); accessible name içerikten
  (fiyat + başlık). Görsel dekoratif: `alt=""`.
- Veri hücreleri (`Stat`/`Cell`) statik — etkileşim gerekiyorsa Cell içine
  gerçek link/buton konur.

## 3. Anatomy

| Parça | Span | İçerik |
|---|---|---|
| `GlassBento.Feature` | default 2×2 (`colSpan/rowSpan` ile 1×1 kompakt) | image + price + title + meta + badge |
| `GlassBento.Stat` | 1×1 | value (26px tabular) + label |
| `GlassBento.Cell` | 1×1 | serbest içerik; `accent` zemin opsiyonu |
| `GlassBento.Item` | ayarlanabilir | özel hücreler için ham sarmalayıcı |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| columns | `3 \| 4` | `4` |
| children | hücreler | — |
| Feature: image/price/title | `string` | — (image dekoratif) |
| Feature: meta/badge/onClick/colSpan/rowSpan | — | span default 2×2 |
| Stat: value/label/tone | `string`/`'default'\|'accent'` | `'default'` |
| Cell: accent/children | — | — |

`...rest` kökte HTMLAttributes olarak açık (aria-label verilebilir).

## 5. Seçenek eksenleri

`material` yok — flat içerik yüzeyi. Simetri sorumluluğu çağırandadır:
4 sütunda hücre span toplamı satır başına 4'ün katı olmalı (örn. E dizilimi:
2×2 + 1 + 1 + 1 + 1 = 8 hücre → 4×2).

## 6. State modeli

Stateless. Feature hover'da yükselir (`translateY(-3px)` + gölge), basışta
`scale(0.99)`; yalnız `hover: hover` ortamında.

## 7. Davranış

- Grid: `repeat(4, 1fr)` × `auto-rows 158px`, gap 14px.
- Responsive: 860px altı 2 sütun; 500px altı tek sütun ve tüm span'lar 1'e
  düşer (`!important` — tek istisna, span inline style'ını ezmek için).
- Hero entegrasyonu: `GlassHero bento={<GlassBento>…}` — kademeli girişin son
  bloğu olarak yükselir.

## 8. İçerik

- Fiyatlar tabular; başlıklar tek satır ellipsis.
- Stat label'ları kısa cümle; accent hücre CTA dili taşıyabilir.

## 9. Token eşlemesi

| Part | Token |
|---|---|
| hücre zemini/çizgi | `--lg-surface` / `--lg-hairline` |
| radius | `--lg-radius-card` / rozet `--lg-radius-capsule` |
| Feature gövde gradyanı | `--lg-scrim` + `--lg-on-scrim` |
| accent hücre | `--lg-accent` + `--lg-accent-contrast` |
| rozet | `--lg-success` |

**Borç (raw / mikro-geometri):** Token'a bağlananlar: rozet konumu ve dikey
padding'i (`--lg-space-3`/`--lg-space-1`), rozet fontu `--lg-text-badge`
(11px), meta `--lg-text-caption` (12px), gövde/hücre yatay-dikey 16px'ler
`--lg-space-4`. Token karşılığı olmayanlar component kökünde yerel değişkene
toplandı: `--row-size: 158px` · `--grid-gap: 14px` · `--hover-lift: -3px` ·
rozet `--badge-gap: 5px` / `--badge-pad-x: 10px` · gövde
`--body-pad-top: 40px` / `--body-pad-bottom: 15px` / `--body-gap: 3px` ·
tipografi ölçeği dışı boyutlar `--price-size: 21px` / `--title-size: 14px` /
`--stat-size: 26px` / `--stat-label-size: 12.5px` · hücre `--cell-gap: 2px` /
`--cell-pad-x: 18px`; kompakt varyant aynı değişkenleri `.featureCompact`
üzerinde ezer (15.5/12.5px, 28/13/11px). Bilinçli bırakılanlar: hover gölgesi
`0 14px 34px color-mix(…)` — `--lg-shadow-*` desenlerinin hiçbiriyle birebir
eşleşmediğinden dokunulmadı · geçiş süresi/easing `0.22s ease` (süre token'ı
yok) · 860/500px breakpoint'leri bento'ya özgü, standart bp ölçeği
(sm 640 / md 768) dışında — @media istisnası, yorumla işaretlendi.

## 10. Storybook kapsamı

Default (Konsept E dizilimi), Playground, UcSutun, Erisilebilirlik (docs).
Uzun içerik: başlık ellipsis Default'ta görülür. Responsive: viewport
toolbar'ıyla (breakpoint'ler media query'de). Ana gösterim:
`Components/GlassHero → Bento Vitrin (Konsept E)`.

## 11. Test kabul kriterleri

- [x] hücreler sırayla render
- [x] Feature 2×2 span + buton + onClick
- [x] Feature görseli dekoratif (alt="")
- [x] accent Stat sınıfı
- [x] columns=3
- [ ] responsive katlanma (visual, Chrome)
- [ ] Feature hover yükselmesi (visual)

## 12. Do / Don't

- ✅ Satır başına span toplamını sütun sayısının katı tut (simetri).
- ✅ Feature görseline anlam yükleme — bilgiyi metinle ver.
- ❌ Bento'ya cam yüzey koyma; içerik katmanıdır.
- ❌ 4 sütunda 2'den fazla 2×2 Feature (grid taşar, simetri bozulur).

**Açık kararlar:** diğer bento konseptleri (A/C/D — kullanıcı "sonra başka
varyant" dedi) · Cell için hazır harita önizleme prefab'ı.

**Changelog:** 2026-07-16 — İlk sürüm (Konsept E, kullanıcı mock seçimi).
