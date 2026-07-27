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

- **Kullan:** ilan/detay sayfası üstünde kategori hiyerarşisi.
- **Kullanma:** sekme/adım gezintisi (→ Tabs/Stepper), tek seviyeli geri linki
  (tek buton yeter), URL tabanlı gerçek link gereken SEO-kritik yerlerde
  (bkz. Bilinen kısıtlar — `href` yok).

| İlgili | Farkı |
|---|---|
| GlassSurface | Taban primitive; breadcrumb `as="nav"` + sabit `thickness=0.2` |
| GlassButton | Bağımsız aksiyon; breadcrumb linkleri cam buton değildir |

## 2. Semantik sözleşme

- Element: `<nav>` (`GlassSurface as="nav"`) + içinde `<ol>`/`<li>` sıralı liste.
- Landmark: `aria-label="Kategori yolu"` default — `...rest` sonda yayıldığı
  için çağıran override edebilir.
- Son öğe: `<span aria-current="page">`. Ara öğeler `onClick` varsa
  `<button type="button">`, yoksa düz `<span>`.
- Ayraçlar `aria-hidden` — ekran okuyucu yalnız öğeleri okur.
- DOM değişmezleri: (1) `nav > ol > li` yapısı korunur, (2) son öğe asla
  buton olmaz, (3) `aria-current="page"` yalnız son öğede.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| items | ✅ | `{ label, onClick? }[]` | Sıra = hiyerarşi; son öğe mevcut sayfa |
| separator | — | ReactNode (default `'›'`) | Her ara öğeden sonra, `aria-hidden` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassBreadcrumbItem[]` | — (zorunlu) | `{ label: string; onClick?: () => void }` |
| separator | prop | `ReactNode` | `'›'` | Ayraç karakteri/ikonu |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu (GlassSurface'a geçer) |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | Köke (`nav`) geçer; `aria-label` override edilebilir |

Event: öğe başına `item.onClick` — yalnız ara öğelerde çalışır; son öğeye
verilse bile render edilen span tıklanamaz. Ref hedefi: yok (forwardRef edilmemiş).

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
| hover (link) | CSS `:hover` | — | opacity .75 → 1 + `rgba(255,255,255,.14)` zemin |
| focus-visible (link) | CSS | — | 2px `--lg-accent` halka, offset 1px |
| disabled | — | — | N/A — öğe bazlı disabled desteklenmiyor |

Not: link hover'ı `@media (hover: hover)` guard'ı olmadan tanımlı — dokunmatikte
yapışık hover kalabilir (borç).

## 7. Davranış

- Keyboard: linkler native `<button>` — Tab ile sırayla gezilir, Enter/Space
  aktive eder. Span öğeleri focus almaz.
- Pointer: yalnız click; basınç animasyonu/useGlassPress **yok** (bilinçli —
  metin linki, cam buton değil).
- `prefers-reduced-motion`: N/A — animasyon yok.
- Controlled/uncontrolled: N/A — state tutmaz, tamamen `items`'tan render.

## 8. İçerik

- Uzun yol: `flex-wrap: wrap` — öğeler satır atlar, kırpma/ellipsis yok; öğe
  içi `white-space: nowrap` (TR uzun kategori adı bölünmez, bütün öğe atlar).
- Derin hiyerarşide (5+) kısaltma/collapse davranışı yok — çağıran items'ı kırpar.
- Boş `items`: boş `ol` render edilir — sözleşme ihlali, en az 1 öğe verilmeli.
- Lokalizasyon: `label`'lar çağırandan; ancak `aria-label="Kategori yolu"`
  default'u **Türkçe hardcoded** — farklı dilde çağıran override etmeli (borç).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius | capsule (`shape="capsule"`) |
| link | focus outline | `--lg-accent` |
| root | font | miras (`font: inherit` link'te) |

**Borç (raw / mikro-geometri):** token karşılığı olmayan değerler component
kökünde yerel değişken olarak toplandı — `.breadcrumb { --bar-pad-block: 6px;
--gap-tight: 2px; --item-pad: 2px 6px; --link-radius: 8px; }`; `--link-radius`
8px radius ölçeğinde yok (chip 10px'e yuvarlamak görsel değişiklik olurdu).
Bağlananlar: kök yatay padding 16px → `--lg-space-4`, liste font'u 13px →
`--lg-text-footnote`. Link hover zemini `rgba(255,255,255,.14)` bilinçli
beyaz-alfa malzeme etkisi — token'a bağlanmadı; opacity değerleri (.75/.45)
raw.

## 10. Storybook kapsamı

Var: Default (4 seviye), TwoLevels, CustomSeparator, UzunIcerik (çok seviyeli +
uzun TR kategori adları, dar container'da wrap). **Eksik:** Playground,
Temalar, Erişilebilirlik (landmark + aria-current gösterimi). States: hover/focus
CSS state'i olduğundan zorlanmaz. Variants/Sizes: N/A — eksen yok.

## 11. Test kabul kriterleri

- [x] ara öğeler tıklanabilir; onClick çağrılır (unit)
- [x] son öğe span + `aria-current="page"`
- [x] navigation landmark adıyla render olur
- [ ] son öğeye verilen onClick yok sayılır
- [ ] klavye gezintisi Tab sırası (interaction)
- [ ] dar container'da wrap (visual)

## 12. Do / Don't

- ✅ Son öğeyi mevcut sayfa yap; ona `onClick` verme.
- ✅ Farklı dil bağlamında `aria-label`'ı override et.
- ❌ Ayraca tıklanabilir öğe koyma (`aria-hidden`).
- ❌ Sekme/adım gezintisi için kullanma.

**Bilinen kısıtlar:** `href` desteği yok — öğeler buton olarak render edilir;
orta tık/yeni sekme/SEO çalışmaz. Öğe bazlı disabled yok. **Açık kararlar:**
`GlassBreadcrumbItem`'a `href` eklenip `<a>` render'ı desteklenmeli mi? ·
default `aria-label`'ın i18n'i · link hover'ına `hover:hover` guard'ı ·
derin hiyerarşi için collapse ("…") deseni.
