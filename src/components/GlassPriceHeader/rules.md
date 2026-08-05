---
name: GlassPriceHeader
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassPriceHeader Kuralları

## 1. Amaç

İlan detay sayfasının tepe bloğu: başlık + fiyat + meta satırı, opsiyonel rozet
ve aksiyon slotlarıyla. İçerik katmanı component'idir; içerik sayfalarında
default olarak `material="flat"` önerilir (cam yalnız hero/medya üstünde).

- **Kullan:** ilan/ürün detayında tek tepe başlık-fiyat bloğu.
- **Kullanma:** liste kartı içinde fiyat gösterimi (→ `GlassListingCard`),
  sayfa başlığı olmayan ara bölüm başlıkları (→ düz `h3` / `GlassSpecTable.title`).

| İlgili | Farkı |
|---|---|
| GlassListingCard | Tıklanabilir liste kartı; bu component statik başlıktır |
| GlassSpecTable | Etiket/değer listesi; fiyat vurgusu yok |

## 2. Semantik sözleşme

- Element: `<header>` (`GlassSurface as="header"`, `shape={20}`, `thickness={0.45}`).
- Başlık `<h2>` sabittir — sayfadaki başlık hiyerarşisine çağıran dikkat eder
  (seviye prop'u yok; bkz. Açık kararlar).
- `meta` ve `price` birer `<p>`; fiyatın özel ARIA'sı yoktur, düz metindir.
- `HTMLAttributes`'tan `title` çıkarılmıştır (`Omit<..., 'title'>`) — native
  tooltip attribute'u ile prop çakışmaz.
- Portal yok. DOM değişmezi: içerik `GlassSurface`'in `.content` sarmalayıcısındadır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | ✅ | string | `h2`, 700; `overflow-wrap: anywhere` ile sarar |
| price | ✅ | string | Biçimlenmiş fiyat metni ("1.185.000 TL") — sayı değil |
| meta | — | string | Konum · tarih · ilan no; verilmezse satır render edilmez |
| badges | — | ReactNode | `GlassBadge` öğeleri beklenir; wrap olur (`flex-wrap`) |
| actions | — | ReactNode | `GlassIconButton` öğeleri; sağ üstte, `flex: none` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| title | prop | `string` | — (zorunlu) | Accessible name kaynağı (`h2`) |
| price | prop | `string` | — (zorunlu) | Biçimleme çağıranda |
| meta | prop | `string` | — | İkincil bilgi satırı |
| badges | prop | `ReactNode` | — | Başlığın üstünde rozet şeridi |
| actions | prop | `ReactNode` | — | Sağ üst aksiyon alanı |
| priceTint | prop | `string` | — | Fiyat rengi; inline `style.color` olarak uygulanır |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | İçerikte `flat` önerilir |
| ...rest | — | `Omit<HTMLAttributes<HTMLElement>, 'title'>` | — | `className` birleştirilir |

Event sözleşmesi: kendi event'i yoktur; tıklanabilirlik `actions` slotundaki
butonlardadır. Ref forward edilmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `tone=auto`, `material` verilmemiş (→ glass),
`priceTint` yok (fiyat `--lg-label` mirası).

| Kural | Davranış |
|---|---|
| `priceTint` yalnız fiyata | Başlık/meta rengini etkilemez |
| `material="flat"` + `tone="light"` | GlassSurface: temadan bağımsız sabit koyu opak kart |
| size ekseni | Yok — tek boyut; genişlik parent'tan |

## 6. State modeli

N/A — statik içerik bloğu; hover/active/focus/disabled durumu yoktur.
Etkileşimli durumlar slot'a konan `GlassIconButton`'ların kendi sözleşmesindedir.

## 7. Davranış

- Keyboard/pointer: component'in kendisi etkileşimsiz; focus sırası `actions`
  içindeki butonların DOM sırasıdır (badges → actions'tan önce gelir).
- Responsive: `heading` `min-width: 0` ile daralır, `actions` sabit kalır;
  dar container'da başlık sarar, aksiyonlar taşmaz.

## 8. İçerik kuralları

- Başlık kırpılmaz, sarar (`overflow-wrap: anywhere`) — uzun TR ilan
  başlıkları için truncation yok; çağıran 2 satırı aşan başlıkları kısaltmalı.
- `price` string'dir; para biçimlendirme (binlik ayraç, "TL") ve lokalizasyon
  çağıranın işidir.
- `badges` boşsa şerit hiç render edilmez (boş div bırakılmaz).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius | `shape={20}` — `--lg-radius-card` ile aynı değer, sayısal |
| root (flat) | background / border / renk | `--lg-surface` / `--lg-hairline` / `--lg-label` (GlassSurface) |
| meta | font-size | `--lg-text-footnote` |
| root | padding / gap | `--lg-space-5` / `--lg-space-3` (root+top) / `--lg-space-2` (actions) |
| price | color | `priceTint` inline; verilmezse miras |

**Borç (raw / mikro-geometri):** `padding: 20px` → `--lg-space-5`, gap 12 →
`--lg-space-3`, gap 8 → `--lg-space-2`, meta 13px → `--lg-text-footnote`
bağlandı (birebir, görsel değişiklik yok). Token karşılığı olmayanlar kökte
yerel değişkende toplandı: `--ph-title-size: 20px` (headline 17 / title 22
arası), `--ph-price-size: 30px` (display 28'den büyük), `--ph-gap-tight: 6px`
(space-1/2 arası sıkı gap). Fiyat `800` ağırlığı **üç-ağırlık kuralını
(400/600/700) ihlal eder** — ayrı tasarım borcu, bu temizlikte değer
değiştirilmedi · letter-spacing em değerleri raw (tipografi token'ı yok).

## 10. Storybook kapsamı

Var: Default (uzun TR başlıkla), WithBadgesAndActions, Materials (glass vs
flat yan yana), UzunIcerik (dar container'da uzun başlık/meta + sabit actions —
Responsive'i de kısmen kapsar). **Eksik:** Playground,
Erişilebilirlik. States N/A (statik).

## 11. Test kabul kriterleri

- [x] title/price/meta render (unit)
- [x] priceTint `style.color`'a uygulanır (unit)
- [x] badges ve actions slotları render (unit)
- [ ] meta/badges/actions verilmeyince DOM'da yer tutmaz
- [ ] flat malzemede hairline kontrastı (visual)
- [ ] başlık hiyerarşisi: sayfada tek `h1` altında `h2` doğru (a11y)

## 12. Do / Don't

- ✅ Sayfada tek GlassPriceHeader; en üstte.
- ✅ İçerik sayfasında `material="flat"` ver; camı hero görsel üstüne sakla.
- ❌ `priceTint`'e tema/marka rengi verme — yalnız semantik vurgu (kampanya vb.).
- ❌ `actions`'a `GlassButton` (metinli) koyma; slot ikon butonlar içindir.

**Bilinen kısıtlar:** başlık seviyesi `h2`'ye sabit · `material` local default'u
yok, efektif default GlassSurface'ten `glass` (öneriyle çelişir).
**Açık kararlar:** başlık seviyesi prop'u (`headingLevel`) · fiyat 800
ağırlığının 700'e çekilmesi · içerik component'lerinde `material` default'unun
`flat` yapılması. **Changelog:** 2026-07-15 ilk sözleşme.
