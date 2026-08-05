---
name: GlassBadge
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassBadge Kuralları

## 1. Amaç

Kısa durum etiketi (rozet): "Acil", "Öne Çıkan", "Satıldı" gibi tek kelimelik
statüleri capsule cam (veya flat'te opak) zeminde gösterir. Salt görseldir,
etkileşimsizdir.

- **Kullan:** kart/başlık üstü statü işaretleri, sayaç dışı kısa etiketler.
- **Kullanma:** tıklanabilir filtre çipi (ayrı component gerekir), uzun cümle,
  aksiyon (→ `GlassButton`).

| İlgili | Farkı |
|---|---|
| GlassButton | Etkileşimli aksiyon; badge tıklanmaz |
| GlassSurface | Taban primitive; badge sabit `thickness=0.15` ile sarar |

## 2. Semantik sözleşme

- Element: `<span>` (`GlassSurface as="span"`). Role yok — dekoratif/statik metin.
- Accessible name: children metni (span içeriği olarak okunur).
- DOM değişmezleri: GlassSurface'ınkiler geçerlidir; kökte `data-material`
  bulunur ve flat tint stili buna bağlıdır.
- Ekran okuyucu için ek anlam gerekiyorsa (`"durum: acil"`) çağıran
  `aria-label` verir; component eklemez.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | kısa metin (+opsiyonel inline ikon) | Tek satır (`white-space: nowrap`); ikonla arası `gap: 0.35em` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| tint | prop | `string` | — | Vurgu rengi; `--glass-tint` CSS var'ına yazılır. Verilmezse nötr cam |
| size | prop | `'sm'\|'md'` | `'sm'` | Padding + font-size |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu (GlassSurface'a geçer) |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `'glass'`) | Katman kuralına göre seçilir |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` | — | Köke geçer |

Ref hedefi: yok (forwardRef edilmemiş). Event sözleşmesi: yok — etkileşimsiz;
`onClick` teknik olarak geçer ama sözleşme dışıdır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=sm`, nötr cam.

| Yasak / türetilen | Davranış |
|---|---|
| `tint` + `material="glass"` | Yarı saydam tint: `color-mix(tint %65, transparent)` — Apple adaptif ton kuralı |
| `tint` + `material="flat"` | **Opak tam renk** (`--glass-tint` doğrudan) — yarı saydam tint opak zeminde soluk kalır |
| `thickness` dışarıdan | ❌ — sabit `0.15` (ince rozet camı), public API'de yok |
| hover/active prop veya CSS | ❌ — etkileşimsiz component |

## 6. State modeli

N/A — hover/focus/active/disabled yok; rozet salt görseldir. Tek görsel eksen
`tint`'in malzemeye göre iki uygulanışıdır (bkz. bölüm 5).

## 7. Davranış

- Pointer/keyboard: N/A — etkileşimsiz, focus almaz.
- `user-select: none` — rozet metni seçilemez (dekoratif).
- Tier/reduced-transparency davranışı GlassSurface'tan miras.

## 8. İçerik

1–2 kelime hedeflenir; `white-space: nowrap` — uzun metin kırpılmaz, rozet
büyür ve satır başı yapmaz; çağıran metni kısa tutar. TR büyük harf dönüşümü
yapılmaz (CSS `text-transform` yok) — metin verildiği gibi görünür.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius | capsule (`shape="capsule"`) |
| tinted | background | `--glass-tint` ← `tint` prop'u |
| flat zemin/kenar | background/border | `--lg-surface` / `--lg-hairline` (GlassSurface'tan) |

**Borç (raw / mikro-geometri):** font-size'lar `--lg-text-caption` (sm) /
`--lg-text-footnote` (md) token'larına bağlandı (birebir 12/13px). Padding'ler
token karşılığı olmadığından (space ölçeğinin arasında) kökte yerel değişkende
toplandı: `.badge { --badge-pad-y-sm: 3px; --badge-pad-x-sm: 10px;
--badge-pad-y-md: 5px; --badge-pad-x-md: 14px; }`. Tint üstü metin `#fff`
bilinçli raw bırakıldı: tint zemini temadan bağımsızdır, `--lg-accent-contrast`
tint renklerinin birebir karşılığı değildir (koyu tint varsayımı;
açık tint'te kontrast çağıranın sorumluluğunda). Story'lerdeki semantic
renkler (`#ff453a`, `#ff9f0a`) henüz token değil (bkz. Token'lar → Açık
Kararlar).

## 10. Storybook kapsamı

Var: Default, Urgent, Featured, Sold, Sizes (sm/md yan yana), Materials
(`flat`'te opak tint görünümü), UzunIcerik (nowrap — tek satırda büyür).
**Eksik:** Playground, Responsive, Erişilebilirlik.
States: N/A — etkileşimsiz.

## 11. Test kabul kriterleri

- [x] içeriğiyle render olur (unit)
- [x] `tint` `--glass-tint` CSS var'ına yazılır
- [x] `size` sınıfı uygulanır
- [ ] `material="flat"` + `tint`'te opak zemin uygulanır (visual/unit)
- [ ] açık renk tint'te metin kontrastı (visual)

## 12. Do / Don't

- ✅ İçerik katmanındaki (flat kart üstü) rozette `material="flat"` ver.
- ✅ Semantic renkleri (danger/warning/success) `tint` ile ver — tema
  renklerini değil.
- ❌ Tıklanabilir yapma; filtre çipi gerekiyorsa ayrı component öner.
- ❌ İki satırlık metin sokma; rozet cümle taşımaz.

**Bilinen kısıtlar:** forwardRef yok; `#fff` metin açık tint'lerde kontrast
riski. **Açık kararlar:** semantic tint'lerin `--lg-danger` vb. token'a
yükseltilmesi · font/padding'in tipografi token'larına bağlanması.
