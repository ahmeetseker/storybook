---
name: GlassListingDetailHeader
category: içerik
status: hazır
lastReviewed: 2026-07-28
---

# GlassListingDetailHeader Kuralları

## 1. Amaç

İlan detay sayfasının tepe bloğu: sayfanın tek görünür `h1`'i, yapılandırılmış
(`dt`/`dd`) meta bilgisi ve ayrı okunabilir fiyat/birim fiyat/not metinleri.
`GlassPriceHeader`'ın üretim sayfasında kullanılamamasına yol açan üç açık
karar burada kapatılır: sabit `h2` yerine ayarlanabilir `headingLevel`, string
`meta` yerine yapılandırılmış `GlassListingMetaItem[]`, efektif `glass`
default'u yerine içerik katmanına uygun `flat` default.

- **Kullan:** ilan detay sayfasının sayfa başlığı + fiyat bloğu (sayfa başına
  tek örnek, en üstte).
- **Kullanma:** liste kartı içinde fiyat gösterimi (→ `GlassListingCard`),
  navigasyon/kontrol katmanında yüzen başlık (→ `GlassNavbar`/`GlassIslandHeader`),
  tek başına etiket/değer listesi olup fiyat vurgusu gerekmeyen bölümler
  (→ `GlassSpecTable`).

| İlgili | Farkı |
|---|---|
| GlassPriceHeader | Sabit `h2`, string `meta`, efektif `glass` default'u — üretim sayfası için yerini bu component alır |
| GlassListingCard | Tıklanabilir liste kartı; bu component statik sayfa başlığıdır |
| GlassSpecTable | Genel etiket/değer listesi; fiyat semantiği ve tek-`h1` sözleşmesi yok |

## 2. Semantik sözleşme

- Element: `<header>` (`GlassSurface as="header"`, `shape={20}`, `thickness={0.4}`).
- Başlık elementi `headingLevel` (`1 | 2 | 3`, varsayılan `1`) ile seçilir —
  sayfa kontratı tam olarak bir görünür `h1` gerektirdiği için component bunu
  sabitlemez, çağıranın sayfa hiyerarşisine göre ayarlamasına izin verir.
  Varsayılan `1` çünkü bu component üretim sayfasında sayfanın tek `h1`'i
  olarak kullanılır; `2`/`3` yalnız iç içe/alt bağlamlar (ör. modal içi
  önizleme) için mevcuttur.
- Meta öğeleri bir paragrafta ayraçla birleştirilmiş metin değil, `<dl>` içinde
  her biri `<dt>`(etiket)/`<dd>`(değer) çifti — ekran okuyucu her çifti ayrı
  bir tanım olarak duyurur.
- Durum (`status`) bir `<p data-tone>` — renk yalnız `data-tone`'a bağlı bir
  vurgu katmanıdır, görünür metin (`status.label`) her zaman DOM'dadır; bilgi
  hiçbir zaman yalnız renkle taşınmaz.
- Fiyat/birim fiyat/not birer `<p>`; component `Intl` çağırmaz, sayı biçimlendirmesi
  ve para birimi sembolü çağırandan pre-formatted string olarak gelir.
- Portal yok. DOM değişmezi: içerik `GlassSurface`'in `.content` sarmalayıcısındadır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | ✅ | string | `headingLevel` ile seçilen heading, 700 ağırlık, `text-wrap: balance` |
| status | — | `{ label, tone? }` | Verilmezse render edilmez; `tone` yalnız renk, `label` her zaman görünür |
| meta | — | `GlassListingMetaItem[]` | Boş/undefined ise `<dl>` hiç render edilmez |
| price | — | string | Biçimlenmiş fiyat metni — sayı değil. Verilmezse **fiyat bloğunun tamamı** render edilmez (fiyatını kendi karar kolonunda taşıyan sayfalar için); boş sütun bırakılmaz |
| priceUnit | — | string | Birim fiyat ("1.804 ₺/m²"); ayrı `<p>`, price'tan bağımsız okunur |
| priceNote | — | string | Fiyatın altında küçük açıklama (alan kaynağı, çelişki notu) |
| badges | — | ReactNode | `GlassBadge` öğeleri beklenir; wrap olur |
| utilities | — | ReactNode | Kaydet/paylaş gibi kontroller; başlık bölgesinin altında ayrı satır |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| title | prop | `string` | — (zorunlu) | — | Heading içeriği |
| headingLevel | prop | `1 \| 2 \| 3` | `1` | — | Render edilen heading elementini seçer |
| price | prop | `string` | — | — | Biçimleme çağıranda; component `Intl` çağırmaz. Verilmezse fiyat bloğu (price/priceUnit/priceNote) hiç render edilmez |
| priceUnit | prop | `string` | — | — | Birim fiyat metni |
| priceNote | prop | `string` | — | — | Fiyatın altında küçük not |
| meta | prop | `GlassListingMetaItem[]` | — | — | `dl` içinde `dt`/`dd` çiftleri |
| status | prop | `{ label: string; tone?: 'success'\|'warning'\|'danger'\|'neutral' }` | — | — | `label` her zaman görünür; `tone` yalnız renk |
| badges | prop | `ReactNode` | — | — | Rozet slotu |
| utilities | prop | `ReactNode` | — | — | Kaydet/paylaş gibi kontroller |
| material | prop | `'glass' \| 'flat'` | `'flat'` | — | İçerik katmanı için varsayılan düz yüzey |
| tone | prop | `'light' \| 'dark' \| 'auto'` | `'auto'` | — | `GlassSurface`'e geçer |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | — | `className` birleştirilir |

`GlassListingMetaItem`: `{ id: string; label: string; value: string }` — `id`
yalnız React `key` için, DOM'a yansımaz.

Ref hedefi yok. Event sözleşmesi: kendi event'i yoktur; etkileşim
`utilities`/`badges` slotlarındaki elemanlardadır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `headingLevel=1`, `material='flat'`, `tone='auto'`,
`status`/`meta`/`badges`/`utilities`/`priceUnit`/`priceNote` verilmemiş.

| Kural | Davranış |
|---|---|
| `material` verilmezse | `'flat'` — cam bütçesini tüketmez (test: `[data-material="glass"]` sıfır) |
| `material="glass"` | Açık opt-in; hero/vitrin gibi görsel-ağır bağlamlar için |
| `headingLevel` | Yalnız render edilen element (`h1`/`h2`/`h3`) değişir, görünüm/`--lg-text-display` boyutu sabit kalır |
| size ekseni | Yok — tek boyut; genişlik parent'tan, container query ile iç düzen değişir |

## 6. State modeli

N/A — statik içerik bloğu; hover/active/focus/disabled durumu component'in
kendisinde yoktur. `status.tone` bir prop-türetilmiş görünüm değeridir, iç
state değildir. Etkileşimli durumlar `utilities` slotuna konan kontrollerin
kendi sözleşmesindedir.

## 7. Davranış

- Keyboard/pointer: component'in kendisi etkileşimsiz; focus sırası DOM
  sırasıyla eşleşir — başlık/meta önce, `utilities` içindeki kontroller sonra.
- Responsive: kök öğede `container-type: inline-size`; `@container (max-width:
  640px)` altında iki kolonlu `.head` (başlık/fiyat) tek kolona düşer, fiyat
  blok sola yaslanır. Viewport breakpoint'i veya bir "device" prop'u
  kullanılmaz — davranış component'in kendi genişliğine bağlıdır.
- Async: yok — tüm veri prop olarak senkron gelir.
- Overlay: yok — portal kullanılmaz.

## 8. İçerik kuralları

- Başlık kırpılmaz, `text-wrap: balance` ile dengeli satır kırar +
  `overflow-wrap: anywhere` ile uzun TR kelimeler taşmaz.
- `price`/`priceUnit`/`priceNote` component içinde **hiçbir biçimde
  yeniden biçimlendirilmez** — `Intl.NumberFormat` veya benzeri bir çağrı
  component kaynağında yoktur; binlik ayraç, para birimi sembolü, ondalık
  kuralı tamamen çağırana aittir.
- `status.label` her zaman metindir; `tone` yalnızca ek bir renk katmanıdır,
  metnin yerine geçmez veya onu gizlemez.
- `meta` boş dizi/undefined ise `<dl>` hiç render edilmez (boş sarmalayıcı
  bırakılmaz); doluysa her öğe `id` ile key'lenir.
- `badges`/`utilities` boşsa kendi sarmalayıcı `div`'leri render edilmez.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | padding | `--lg-space-5` |
| head | gap | `--lg-space-5` |
| title | font-size | `--lg-text-display` |
| title | font-weight | `700` (sabit tipografi ağırlık ekseni içinde) |
| status | renk (varsayılan/`neutral`) | `--lg-label-secondary` |
| status | renk (`success`) | `--lg-success` |
| status | renk (`warning`) | `--lg-warning` |
| status | renk (`danger`) | `--lg-danger` |
| meta | gap | `--lg-space-1` `--lg-space-4` |
| metaItem dt | renk | `--lg-label-secondary` |
| metaItem dt/dd | font-size | `--lg-text-footnote` |
| price | font-size | `--lg-text-display` |
| price | font-variant-numeric | `tabular-nums` |
| priceUnit/priceNote | font-size | `--lg-text-footnote` / `--lg-text-caption` |
| badges/utilities | gap | `--lg-space-2` |

**Borç:** yok. Tüm CSS değerleri `--lg-*` token'ları (fallback'leriyle
birlikte) üzerinden gelir; raw hex/px/shadow/keyfi radius yok — radius
`GlassSurface`'in `shape={20}` (`--lg-radius-card` ile aynı sayısal değer)
prop'undan gelir.

## 10. Storybook kapsamı

Var: Default, Playground (tam public API), Materials (flat/glass yan yana),
Sizes (`headingLevel` 1-2-3), States (dört `status.tone`), UzunIcerik (uzun TR
başlık + altı meta öğesi, dar container), Responsive (360px + container
query), Erişilebilirlik (h1 + `utilities`
içindeki gerçek butonların focus sırası). Eksik yok — matris tam.

## 11. Test kabul kriterleri

- [x] varsayılan olarak `h1` render eder (unit)
- [x] `headingLevel` ile başlık seviyesi ayarlanabilir (unit)
- [x] meta öğeleri `dl` içinde `dt`/`dd` çifti olarak render edilir (unit)
- [x] varsayılan malzeme `flat` — `[data-material="glass"]` üretmez (unit)
- [x] fiyat/birim fiyat/not ayrı okunabilir metinler olarak render edilir (unit)
- [x] `price` verilmediğinde fiyat bloğu hiç render edilmez (unit)
- [x] `utilities` slotu başlık bölgesinde render edilir (unit)
- [x] durum metni yalnız renkle değil görünür metinle taşınır (unit)
- [ ] container query'nin 640px altında tek kolona düştüğü (visual)
- [ ] durum tonlarının kontrastı (visual)

## 12. Do / Don't

- ✅ Sayfada tek `GlassListingDetailHeader`; en üstte, `headingLevel=1` ile.
- ✅ İçerik sayfasında `material` prop'unu boş bırak (varsayılan `flat` zaten
  doğru); camı yalnız açık bir görsel gerekçeyle `material="glass"` yap.
- ✅ Fiyatı/birim fiyatı/notu component'e girmeden önce biçimlendir.
- ❌ `meta`'yı tek bir string'e birleştirip ayraçla ayırma — her öğe kendi
  `dt`/`dd` çiftinde kalmalı.
- ❌ `status.tone`'u tek başına anlam taşıyıcı olarak kullanma — `label`
  olmadan `tone` vermek (mümkün değil, `label` zorunlu) veya `label`'ı boş
  string bırakma.

**Bilinen kısıtlar:** `headingLevel` yalnız element tipini değiştirir, görsel
boyutu sabittir (`--lg-text-display`) — üç seviye görsel olarak ayrışmaz,
yalnız semantik ayrışır. **Açık kararlar:** `status` tonlarının `GlassBadge`
ile mi yoksa mevcut `<p data-tone>` deseniyle mi ilerleyeceği (şu an ikincisi,
`GlassDataProvenance` rozet deseninden daha hafif) · `priceUnit`/`priceNote`
sırasının sabit mi kalacağı yoksa çağırana mı bırakılacağı.
**Changelog:** 2026-07-28 — `price` isteğe bağlı oldu: fiyatı kendi karar
kolonunda taşıyan sayfalarda başlık yalnız künye bloğudur ve boş bir fiyat
sütunu bırakmaz. · 2026-07-28 — ilk sürüm; `GlassPriceHeader`'ın üretim sayfası
yerine geçer.
