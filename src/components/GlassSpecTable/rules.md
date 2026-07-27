---
name: GlassSpecTable
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassSpecTable Kuralları

## 1. Amaç

Etiket/değer çiftlerini `dl` semantiğiyle listeleyen özellik tablosu (ilan
bilgileri, teknik özellikler). İçerik katmanı component'idir; içerik
sayfalarında `material="flat"` önerilir.

- **Kullan:** anahtar–değer çiftleri (Marka: Volkswagen, Yıl: 2019).
- **Kullanma:** sıralanabilir/karşılaştırmalı veri (→ gerçek `<table>`),
  serbest metin paragrafları, fiyat vurgusu (→ `GlassPriceHeader`).

| İlgili | Farkı |
|---|---|
| GlassPriceHeader | Tek başlık+fiyat bloğu; liste değil |
| GlassLocationCard | Tek adres + harita; çift listesi değil |

## 2. Semantik sözleşme

- Element: `<section>` (`GlassSurface as="section"`, `shape={20}`,
  `thickness={0.4}` — set'teki diğer kartlardan ince).
- Liste `<dl>` > `<div class="row">` > `<dt>` + `<dd>`. `div` sarmalayıcı
  HTML spec'inde `dl` içinde geçerlidir; ayraç ve satır hizası bu div'dedir.
- Başlık `<h3>` sabittir; verilmezse render edilmez.
- DOM değişmezi: her item tam bir `dt`+`dd` çifti üretir; `key`
  `label + index` olduğundan tekrarlanan etiketler güvenlidir.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | string | `h3`, 17px/700 |
| items[].label | ✅ | `string` | `dt`; `white-space: nowrap` — kısa tut |
| items[].value | ✅ | `ReactNode` | `dd`; sağa hizalı, `overflow-wrap: anywhere` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassSpecItem[]` (`{label: string; value: ReactNode}`) | — (zorunlu) | Sıra verilen dizinin sırasıdır |
| columns | prop | `1 \| 2` | `1` | Grid sütun sayısı; responsive collapse yok |
| title | prop | `string` | — | Kart başlığı |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | Ayraç rengi `data-material` ile değişir |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | `className` birleştirilir |

Event sözleşmesi: yok — tamamen statik. Satır tıklaması/expand desteklenmez;
`value` içine link konabilir ama satırın kendisi hedef yapılmaz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `columns=1`, `tone=auto`, `material` verilmemiş (→ glass).

| Kural | Davranış |
|---|---|
| `columns=2` | Item'lar satır-yönlü (row-major) dolar; okuma sırası soldan sağa |
| `columns=2` + dar container | Daralma YOK — çağıran dar yerde `columns=1` vermeli |
| Son satır | `:last-child` + iki sütunda `nth-last-child(2):nth-child(odd)` çifti ayraçsız |

## 6. State modeli

N/A — statik içerik; hover/active/focus/disabled/selected durumu yoktur.
Ayraç rengi state değil malzeme türevi: `[data-material='flat'] .row`
ile cam beyaz-alfa ayraç yerine koyu ayraç uygulanır.

## 7. Davranış

- Keyboard/pointer: etkileşimsiz; focus yalnız `value` içine konan
  odaklanabilir öğelere gider (DOM sırası = dizi sırası).
- Responsive: sütun sayısı yalnız prop'tur; container query/breakpoint yok.
- `dt`/`dd` `baseline` hizalı; `min-height: 36px` satır ritmini korur.

## 8. İçerik kuralları

- `label` sarmaz (`nowrap`) — uzun TR etiketlerde ("Motor Hacmi (cc)") satır
  taşabilir; etiketleri kısa tut, uzun açıklamayı `value`'ya koy.
- `value` sağa hizalı ve `overflow-wrap: anywhere` ile kırılır; uzun
  değerler güvenlidir.
- Boş `items` dizisi boş `dl` render eder — çağıran boş durumda kartı hiç
  koymamalı (boş durum tasarımı yok).
- Değer biçimlendirme (binlik ayraç, birim) çağıranın işidir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root (flat) | background / border / renk | `--lg-surface` / `--lg-hairline` / `--lg-label` (GlassSurface) |
| root | radius | `shape={20}` — `--lg-radius-card` değeriyle aynı, sayısal |
| title | font-size | `--lg-text-headline` |

**Borç (raw / mikro-geometri):** satır ayracı iki malzemede de bilinçli raw —
cam `rgba(255,255,255,.16)` beyaz-alfa malzeme etkisi; flat `rgba(0,0,0,.08)`
`--lg-hairline` (`rgba(36,33,27,.09)`) ile birebir aynı olmadığından bağlamak
tema başına görsel değişiklik yaratırdı (hairline'a geçiş ayrı görsel karar
olarak bekliyor). Label/value 14px hiçbir tipografi token'ına denk değil
(footnote 13 / body 15 arası); satır min-height 36px ve dikey padding 7px ile
birlikte component kökünde yerel değişkene toplandı (`.card {
--row-min-height: 36px; --row-pad-block: 7px; --cell-font-size: 14px; }`).
Bağlananlar: padding 20px → `--lg-space-5`, başlık 17px → `--lg-text-headline`,
başlık alt boşluğu 12px → `--lg-space-3`, column-gap 32px → `--lg-space-7`,
satır gap 16px → `--lg-space-4`.

## 10. Storybook kapsamı

Var: Default, TwoColumns, WithoutTitle (+ `columns` control'ü argTypes'ta),
Materials (flat'te ayraç farkı — glass vs flat yan yana), Columns (1 vs 2
karşılaştırma), UzunIcerik (uzun değer + kesintisiz şasi no, dar container).
**Eksik:** Playground (tam), Responsive (dar container'da `columns=2`
taşması), Temalar, Erişilebilirlik. States N/A.

## 11. Test kabul kriterleri

- [x] etiket/değer çiftleri render (unit)
- [x] title verilince `h3` heading (unit)
- [x] `columns=2` → `twoColumns` sınıfı (unit)
- [ ] `dl > div > dt+dd` yapısı korunur (unit — semantik regresyon)
- [ ] flat'te ayraç rengi değişir (`data-material` üzerinden, visual)
- [ ] son satır(lar) ayraçsız — tek ve çift item sayısıyla (visual)

## 12. Do / Don't

- ✅ İçerik sayfasında `material="flat"`; cam varyantı yalnız görsel üstü overlay'lerde.
- ✅ 8+ item'lı geniş kartlarda `columns=2`, dar sütunda `columns=1`.
- ❌ `value`'ya blok komponent (kart, tablo) koyma — inline içerik içindir.
- ❌ Sıralama/filtreleme ihtiyacında bu component'i genişletme — ayrı DataTable.

**Bilinen kısıtlar:** `columns=2` responsive daralmaz · boş durum tasarımı yok.
**Açık kararlar:** flat ayracının `--lg-hairline` token'ına taşınması ·
container query ile otomatik sütun düşürme · 14px etiket boyutunun token
ölçeğine oturtulması. **Changelog:** 2026-07-15 ilk sözleşme.
