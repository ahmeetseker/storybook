---
name: GlassBreadcrumb
category: navigasyon
status: hazır
lastReviewed: 2026-07-15
---

# GlassBreadcrumb Kuralları

## 1. Amaç

Kategori yolu (breadcrumb): capsule cam şerit içinde hiyerarşik konum gösterir;
ara öğeler tıklanarak üst kategoriye dönülür, son öğe mevcut sayfadır.

- **Kullan:** ilan/detay sayfası üstünde kategori hiyerarşisi; sayfa üstü rota
  yolu (kabuk `statusTrail`'i). SEO-kritik yerlerde `href` ver — öğe gerçek
  `<a>` render edilir.
- **Kullanma:** sekme/adım gezintisi (→ Tabs/Stepper), tek seviyeli geri linki
  (tek buton yeter).

| İlgili | Farkı |
|---|---|
| GlassSurface | Taban primitive; breadcrumb `as="nav"` + sabit `thickness=0.2` |
| GlassButton | Bağımsız aksiyon; breadcrumb linkleri cam buton değildir |

## 2. Semantik sözleşme

- Element: `<nav>` (`GlassSurface as="nav"`) + içinde `<ol>`/`<li>` sıralı liste.
- Landmark: `aria-label="Kategori yolu"` default — `...rest` sonda yayıldığı
  için çağıran override edebilir.
- Son öğe: `<span aria-current="page">`. Ara öğeler `href` varsa `<a>`,
  yalnız `onClick` varsa `<button type="button">`, ikisi de yoksa düz `<span>`.
- `href` + `onClick` birlikteyse sade sol tık `preventDefault` + `onClick`
  (SPA gezinmesi); modifier'lı/orta tık tarayıcıya bırakılır —
  `GlassSiteHeader.linkClick` ile aynı sözleşme.
- Ayraçlar `aria-hidden` — ekran okuyucu yalnız öğeleri okur.
- Daraltılmış yolda "…" bir `<button>`'dır; `aria-label` gizlenen seviye
  sayısını söyler ("Gizlenen N seviyeyi göster").
- DOM değişmezleri: (1) `nav > ol > li` yapısı korunur, (2) son öğe asla
  buton/link olmaz, (3) `aria-current="page"` yalnız son öğede.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| items | ✅ | `{ label, href?, onClick? }[]` | Sıra = hiyerarşi; son öğe mevcut sayfa |
| separator | — | ReactNode (default `'›'`) | Her ara öğeden sonra, `aria-hidden` |
| "…" (türetilen) | — | `maxItems` aşımında | Yerinde açar; menü/overlay açmaz |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassBreadcrumbItem[]` | — (zorunlu) | `{ label: string; href?: string; onClick?: () => void }` |
| separator | prop | `ReactNode` | `'›'` | Ayraç karakteri/ikonu |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu (GlassSurface'a geçer) |
| maxItems | prop | `number` | `undefined` | Görünür öğe tavanı ("…" dahil; 3'ün altı 3'e yuvarlanır). `undefined` = daraltma yok |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | Köke (`nav`) geçer; `aria-label` override edilebilir |

Event: öğe başına `item.onClick` — yalnız ara öğelerde çalışır; son öğeye
verilse bile render edilen span tıklanamaz. `href` yalnız ara öğelerde `<a>`
üretir; son öğede yok sayılır. Ref hedefi: yok (forwardRef edilmemiş).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: default ayraç, `tone=auto`.

| Yasak / türetilen | Davranış |
|---|---|
| son öğe + `onClick` | Yok sayılır — son öğe her zaman `aria-current` span |
| ara öğe + `onClick` yok | Düz span (tıklanamaz, `aria-current` de almaz) |
| `size` / `material` / `thickness` | ❌ public API'de yok — tek boyut, sabit cam `0.2` |
| hover/focus prop olarak | ❌ — yalnız CSS |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel / ARIA |
|---|---|---|---|
| current (son öğe) | items sırası | tıklanabilirlik | `font-weight: 600` + `aria-current="page"` |
| collapsed | `maxItems` < items sayısı, iç `expanded=false` | ara seviyelerin görünürlüğü | "…" butonu + gizli seviye sayısı `aria-label`'da |
| expanded | "…" tıklaması (tek yönlü — tekrar daralmaz) | collapsed | Tam yol; odak ilk açılan öğeye taşınır |
| hover (link) | CSS `:hover` | — | opacity .75 → 1 + `rgba(255,255,255,.14)` zemin |
| focus-visible (link) | CSS | — | 2px `--lg-accent` halka, offset 1px |
| disabled | — | — | N/A — öğe bazlı disabled desteklenmiyor |

Not: link hover'ı `@media (hover: hover)` guard'ı olmadan tanımlı — dokunmatikte
yapışık hover kalabilir (borç).

## 7. Davranış

- Keyboard: öğeler native `<a href>`/`<button>` — Tab ile sırayla gezilir,
  Enter (linkte) / Enter+Space (butonda) aktive eder. Span öğeleri focus almaz.
- Pointer: yalnız click; basınç animasyonu/useGlassPress **yok** (bilinçli —
  metin linki, cam buton değil).
- Daraltma "…" yerinde açar, overlay/menü **açmaz**: kök `GlassSurface`
  `overflow: hidden` panel açılışını kırpardı ve cam kapsül üstüne cam panel
  katman modelini (cam üstüne cam yok) ihlal ederdi. Açılış tek yönlüdür;
  items değişince (yeni sayfa) component yeniden kurulup daralır.
- Odak: "…" DOM'dan kalkarken odak ilk açılan öğeye taşınır — odak belgede
  kaybolmaz (WCAG 2.4.3).
- `prefers-reduced-motion`: N/A — animasyon yok.
- Controlled/uncontrolled: yalnız iç `expanded` state'i; dışarıdan kontrol yok.

## 8. İçerik

- Uzun yol: `flex-wrap: wrap` — öğeler satır atlar, kırpma/ellipsis yok; öğe
  içi `white-space: nowrap` (TR uzun kategori adı bölünmez, bütün öğe atlar).
- Derin hiyerarşi: `maxItems` ile daraltma — ilk öğe + "…" + son
  `maxItems - 2` öğe görünür; gizlenenler "…" tıklamasıyla yerinde açılır.
- Boş `items`: boş `ol` render edilir — sözleşme ihlali, en az 1 öğe verilmeli.
- Lokalizasyon: `label`'lar çağırandan; ancak `aria-label="Kategori yolu"`
  default'u **Türkçe hardcoded** — farklı dilde çağıran override etmeli (borç).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius | capsule (`shape="capsule"`) |
| link | focus outline | `--lg-accent` |
| root | font | miras (`font: inherit` link'te) |

**Dolgu dengesi (2026-08-03):** Yeni kontrol ölçeğiyle birlikte şerit dolgusu
öğeye devredildi: `--bar-pad-block` 6px → `--lg-space-1` (4px), `--item-pad`
`2px 6px` → `--lg-space-1 --lg-space-2` (4px 8px). Şeridin toplam yüksekliği
değişmez (~35px) ama link dokunma hedefi 22px'ten ~27px'e çıkar — WCAG 2.2 AA
2.5.8 tabanının (24px) üstü. Görünmez `::after` taşması UYGULANAMAZ: kök bir
`GlassSurface` (`overflow: hidden`) ve 44px'e ulaşmak için gereken ~9px taşma
yüzeyin dolgusunu (4px) aşıp kırpılırdı. Breadcrumb ikon-tek kontrol değil,
metin hedefi taşır — AAA 44px hedefi bu şerit için sözleşme dışı.

**Borç (raw / mikro-geometri):** token karşılığı olmayan değerler component
kökünde yerel değişken olarak toplandı — `.breadcrumb { --gap-tight: 2px; }`.
Bağlananlar: kök yatay padding 16px → `--lg-space-4`, dikey dolgu ve öğe
dolgusu → `--lg-space-1/2`, link radius 8px → `--lg-radius-chip` (10px, ölçek
içi en yakın kademe), liste font'u 13px → `--lg-text-footnote`.
Link hover zemini `rgba(255,255,255,.14)` bilinçli
beyaz-alfa malzeme etkisi — token'a bağlanmadı; opacity değerleri (.75/.45)
raw.

## 10. Storybook kapsamı

Var: Default (4 seviye), TwoLevels, CustomSeparator, GercekLinkler (href +
SPA devri), DaraltilmisYol (maxItems + "…" yerinde açılış), UzunIcerik (çok
seviyeli + uzun TR kategori adları, dar container'da wrap). **Eksik:**
Playground, Erişilebilirlik (landmark + aria-current gösterimi). States:
hover/focus CSS state'i olduğundan zorlanmaz. Variants/Sizes: N/A — eksen yok.

## 11. Test kabul kriterleri

- [x] ara öğeler tıklanabilir; onClick çağrılır (unit)
- [x] son öğe span + `aria-current="page"`
- [x] navigation landmark adıyla render olur
- [x] `href` verilen ara öğe `<a>` render olur; sade sol tık SPA'ya devreder
- [x] modifier'lı tık tarayıcıya bırakılır (onClick çağrılmaz)
- [x] son öğeye verilen `href` yok sayılır (span kalır)
- [x] `maxItems` aşımında ara seviyeler gizlenir; "…" `aria-label`'ı sayı verir
- [x] "…" tıklaması yolu yerinde açar; odak ilk açılan öğeye taşınır
- [ ] klavye gezintisi Tab sırası (interaction)
- [ ] dar container'da wrap (visual)

## 12. Do / Don't

- ✅ Son öğeyi mevcut sayfa yap; ona `onClick` verme.
- ✅ Farklı dil bağlamında `aria-label`'ı override et.
- ❌ Ayraca tıklanabilir öğe koyma (`aria-hidden`).
- ❌ Sekme/adım gezintisi için kullanma.

**Bilinen kısıtlar:** Öğe bazlı disabled yok. Daraltma tek yönlü — açılan yol
tekrar daraltılamaz (items değişince sıfırlanır). "…" ve gizli etiketler
Türkçe hardcoded (default `aria-label` gibi i18n borcu). **Açık kararlar:**
default `aria-label`'ın i18n'i.

## Changelog

- 2026-08-07: `href` desteği eklendi — ara öğeler gerçek `<a>` render edilir,
  `onClick` ile birlikteyken sade sol tık SPA'ya devredilir (GlassSiteHeader
  `linkClick` sözleşmesi). `maxItems` daraltması eklendi: aşan ara seviyeler
  "…" butonunda toplanır, tıklanınca yerinde açılır (overlay yok — kök
  `overflow: hidden` + cam üstüne cam yasağı). İki açık karar kapandı.
- 2026-08-03: Yeni kontrol ölçeğine uyarlandı. Şerit/öğe dolgu dengesi
  token'a bağlandı (`--bar-pad-block` 6px → `--lg-space-1`, `--item-pad`
  `2px 6px` → `--lg-space-1 --lg-space-2`), link radius `--lg-radius-chip`e
  geçti. Şerit yüksekliği sabit kaldı, link hedefi 22px → ~27px.
