---
name: GlassDock
category: navigasyon
status: hazır
lastReviewed: 2026-07-24
---

# GlassDock Kuralları

## 1. Amaç

Viewport kenarına sabitlenen ikon-tabanlı hızlı gezinme. Varsayılan
`behavior="fixed"` doğrudan ve sürekli açık bir nav render eder. Açık ray,
`public-site/packages/ui/src/primitives/liquid-glass.tsx` referansındaki
LiquidDock davranışını kullanır: imleç 180px etki alanında izlenir, öğeler
kosinüs eğrisiyle 1×–1.5× büyür, merkezler yeniden hesaplanır ve edge lens
hover edilen öğeyi takip eder. `behavior="morph"` yalnız geriye uyumluluk
için peek↔dock aç/kapa davranışını korur.

- **Kullan:** uygulama genelinde kalıcı, kısa ikon gezinmesi.
- **Kullanma:** sayfa içi sekmeler (→ `GlassTabs`), hiyerarşik menü
  (→ `GlassSidebar`) veya üst seviye marka/durum başlığı
  (→ `GlassIslandHeader`).

| İlgili | Farkı |
|---|---|
| `GlassSidebar` | Metinli, hiyerarşik ve geniş içerik taşıyabilir. Dock kısa ikon gezinmesidir. |
| `GlassIslandHeader` | Üst kenarda marka, durum ve panel taşır. Dock yalnız rota/eylem öğeleri taşır. |
| `GlassToolbar` | İçerik üstü eylem çubuğudur. Dock viewport'a sabit gezinmedir. |

## 2. Semantik sözleşme

- Kök fixed konumlu `<div>` sarmalayıcıdır.
- `fixed`: kökün doğrudan çocuğu
  `<nav aria-label={label} data-behavior="fixed">` olur; peek render edilmez.
- `morph`: kapalı durumda
  `<button aria-label={label} aria-expanded="false">` peek; açık durumda
  `<nav aria-label={label} data-behavior="morph">` render edilir.
- Her öğe `href` varsa gerçek `<a>`, yoksa `<button>` olur; accessible name
  `item.label`, aktif rota `aria-current="page"` ile verilir.
- Modifiyesiz aynı-origin bağlantı tıklaması opsiyonel `onRoute` ile SPA
  router'a delege edilir; modifier/harici/yeni sekme native kalır.
- Tooltip `aria-hidden` görsel destektir. `group` geriye uyumluluk alanıdır,
  fakat hiçbir davranışta grup etiketi render edilmez.
- Portal, focus trap, scroll kilidi ve backdrop yoktur; Dock modal değildir.
- Cam malzeme dekoratif `GlassSurface` (`shape="capsule"`,
  `thickness={0.55}`) arka katmanından gelir. Yüzey `fallback` tier'ında
  Header ile aynı `blur(14px) saturate(180%)` backdrop filtresini ve referans
  dış camına eş %55 surface tint'ini kullanır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| peek | yalnız kapalı morph | boş buton yüzeyi | Fixed davranışta yoktur |
| glass | nav görünürken | `GlassSurface` kapsülü | Dekoratif, `aria-hidden` |
| track | nav görünürken | edge lens + öğeler | Dinamik content length; orientation ekseninde yeniden akar |
| edge lens | aktif/hover hedefinde | dekoratif span | 38px taban, hedef scale/merkezi izler; %82 tint + 6px blur |
| item.icon | her öğede | `ReactNode` | `aria-hidden`; 1×–1.5× transform ile taban/sağ kenara sabit büyür |
| tooltip | hover/focus hedefinde | `item.label` | Görsel, tek satır; coarse/dar viewport'ta gizli |

`children` kabul edilmez; içerik bütünüyle `items` prop'undan gelir.

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| `items` | `GlassDockItem[]` | zorunlu | `{ key, label, icon, href?, target?, rel?, onSelect?, active?, group? }` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Yatay alt-orta, dikey sağ-orta |
| `behavior` | `'fixed' \| 'morph'` | `'fixed'` | Sürekli açık nav veya legacy peek↔nav |
| `open` | `boolean` | — | Yalnız morph için controlled durum |
| `defaultOpen` | `boolean` | `false` | Yalnız morph için uncontrolled başlangıç |
| `onOpenChange` | `(open: boolean) => void` | — | Yalnız morph açma/kapama istekleri |
| `label` | `string` | `'Gezinme'` | Nav ve morph peek accessible name'i |
| `onRoute` | `(href: string) => void` | — | Modifiyesiz aynı-origin SPA delegasyonu |
| `className` | `string` | — | Fixed kök sarmalayıcı sınıfı |

`GlassDockItem.group` deprecated'tir ve render edilmez. `item.onSelect` her
iki davranışta çağrılır; yalnız morph seçimden sonra kapanır.

## 5. Seçenek eksenleri

`behavior` ve `orientation` bağımsız eksenlerdir. Birleşik variant yoktur.
`material`/`tone`/`size`/`variant`/`thickness` eksenleri N/A'dır; tek cam
malzeme ve tek ikon ölçüsü kullanılır.

- Morph'ta `open !== undefined`, `defaultOpen` değerini bastırır.
- Fixed'te `open`, `defaultOpen` ve `onOpenChange` etkisizdir.
- `group`, orientation'dan bağımsız olarak etkisizdir.

## 6. State modeli

| State | Kaynak | Sonuç |
|---|---|---|
| davranış | `behavior` | fixed doğrudan nav; morph peek↔nav |
| açık/kapalı | `open ?? innerOpen` | yalnız morph görünümünü değiştirir |
| aktif rota | ilk `item.active` | sabit gösterge + `aria-current="page"` |
| pointer konumu | React state + rAF | 180px kosinüs etki alanı, scale ve item merkezleri |
| hover hedefi | en yakın dinamik merkez | edge lens + tooltip |
| focus | focus index | pointer'dan öncelikli outline + tek tooltip; lens odak hedefini gösterir |
| odak hedefi | morph aktivasyon ref'i | peek→ilk öğe, Escape/seçim→peek |

Hover, focus ve active prop değildir. Focus halkası yalnız
`:focus-visible` ile `outline: 2px solid var(--lg-accent)` kullanır.

## 7. Davranış

### Fixed (varsayılan)

- Nav ilk render'da görünürdür ve `data-behavior="fixed"` taşır.
- Escape, dışarı tıklama, blur ve öğe seçimi nav'ı kapatmaz.
- Seçim yine `onSelect` ve uygun durumda `onRoute` çağırır.
- Mouse konumu orientation ekseninde en fazla her 16ms'de örneklenir.
- Magnification yalnız `(hover: hover) and (pointer: fine)` eşleştiğinde
  başlar; coarse-pointer cihazlarda sentetik mouse event'leri de etkisizdir.
- 180px etki alanındaki öğeler kosinüs eğrisiyle 1×–1.5× büyür.
- Scale'lerden yeni item merkezleri ve içerik uzunluğu hesaplanır; kapsül
  alt/sağ anchor'ını koruyarak açılır.
- rAF interpolation imleç içerideyken `.20`, ayrılırken `.12` kullanır.
- Edge lens aktif öğede dinlenir, hover sırasında en yakın öğeyi ve onun
  scale'ini takip eder.
- Reduced-motion'da scale ve merkezler 1× taban değerlerinde kalır; tooltip
  kullanılabilir olmaya devam eder.

### Morph (legacy)

- Hover veya peek tıklaması açar; mouse leave, dışarı tıklama, blur, Escape
  ve seçim kapatır.
- Peek tıklaması/Enter ilk öğeye; Escape/seçim kapanışta peek'e odak taşır.
  Hover odak taşımaz.
- Morph kapsayıcı layout'u ile içeriğin opacity/transform girişini
  animasyonlandırır; açıldıktan sonra aynı LiquidDock magnification rayını
  kullanır.
- Reduced-motion layout transform'unu kapatır; yalnız kısa opacity geçişi
  kalır.

### Responsive

- Safe-area inset'leri alt/sağ konuma katılır.
- Coarse pointer'da peek ve ikon görünmez pseudo-element taşmasıyla en az
  `--lg-control-md` dokunma hedefini korur.
- Coarse pointer veya dar viewport'ta ray ilgili eksende kaydırılır;
  tooltip gizlenir, öğe ölçüleri küçültülmez.

## 8. İçerik kuralları

- `label` kısa ve ayırt edici olmalıdır; tooltip tek satırdır.
- Önerilen öğe sayısı en fazla 10'dur.
- `group` yeni kullanımlarda verilmemelidir; deprecated ve etkisizdir.
- İkonlar yaklaşık 20px çizgi ikon olmalı, metin taşımamalıdır.
- Aktif sayfa yalnız bir öğede `active` ile işaretlenmelidir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| peek | background/radius | `color-mix(var(--lg-label), transparent)` / `--lg-radius-capsule` |
| cam kapsül | material | `GlassSurface`, fallback tier, `blur(14px) saturate(180%)` |
| edge lens | background/filter/rim | %82 `--lg-surface` / `blur(6px) saturate(180%)` / label-highlight mix |
| ikon | color | `--lg-label` |
| tooltip | bg/border/text/radius/type | `--lg-surface` / `--lg-hairline` / `--lg-label` / `--lg-radius-capsule` / `--lg-text-badge` |
| konum | spacing | `--lg-space-3` / `--lg-space-2` |
| focus | outline | `--lg-accent` |

**Yerel mikro-geometri borcu:** JS'te `BASE_ICON=38`, `ICON_GAP=6`,
`MIN_SCALE=1`, `MAX_SCALE=1.5` ve `EFFECT_LENGTH=180` tutulur. CSS'te aynı
38px ikon ölçüsü, 140×24 peek, 8/6px ray padding'i ve tooltip
letter-spacing yerel değişkenlerdir. Cam highlight gölgelerindeki rgba ve
`z-index: 60` için henüz global token yoktur.

## 10. Storybook kapsamı

Var: `Default` (fixed), `Playground`, `HoverVeHeaderMalzemesi`,
`LegacyMorph`, `Dikey`, `UzunIcerik`, `Responsive`, `Erisilebilirlik`.

`Sizes`/`Variants`/`States` ayrı story değildir; ilgili eksenler tanımlı
değildir. Tema Storybook toolbar'ı ile doğrulanır.

## 11. Test kabul kriterleri

- [x] varsayılan doğrudan nav render eder ve `data-behavior="fixed"` taşır
- [x] fixed Escape, dışarı tıklama ve seçimle kapanmaz
- [x] fixed seçimde `onSelect` çağrılır
- [x] fixed `group` metinlerini render etmez
- [x] morph kapalıyken yalnız peek butonu render eder
- [x] morph peek tıklamasında açılır ve odağı ilk öğeye taşır
- [x] morph Escape/dışarı tıklama/seçimle kapanır
- [x] morph controlled ve uncontrolled desenleri destekler
- [x] aktif öğe `aria-current="page"` taşır
- [x] `href` gerçek linktir; aynı-origin `onRoute` delegasyonu korunur
- [x] Dock ve Header backdrop materyali `blur(14px) saturate(180%)` ile eşittir
- [x] hover öğesi yaklaşık 57px'e (1.5×) büyür; komşu etki ve dinamik track çalışır
- [x] edge lens hedef scale/konumunu izler ve `blur(6px) saturate(180%)` taşır
- [x] mouse leave sonrası ray 1× taban ölçülerine döner
- [x] coarse-pointer sentetik mouse hareketinde 1× kalır ve tooltip üretmez
- [x] klavye odağı pointer hedefine üstün gelir; tek tooltip/lens hedefi kalır
- [x] reduced-motion büyütmeyi ve morph layout transform'unu kapatır

## 12. Do / Don't

- ✅ Marketplace ve yeni entegrasyonlarda açıkça `behavior="fixed"` kullan.
- ✅ Public rotalarda `href`, SPA geçişi için `onRoute` ver.
- ✅ Aktif sayfayı `active` ile işaretle.
- ❌ Yeni kodda `group` etiketi veya referans eğrisinden bağımsız ikinci bir
  hover halo sistemi ekleme.
- ❌ Fixed davranışı Escape, blur, dışarı tıklama veya seçimle kapatma.
- ❌ Dock'a görünür metinli öğe koyma; metinli gezinme için `GlassSidebar`.
- ❌ Focus trap/backdrop ekleme; Dock modal değildir.

**Açık karar:** Tooltip'e `role="tooltip"` verilmez; accessible name zaten
link/buton üzerindedir.

## Changelog

- 2026-07-24: `fixed` varsayılan davranış eklendi; doğrudan/sürekli açık nav,
  sabit item/nav geometrisi ve `data-behavior` kontratı tanımlandı.
  Bu ilk geçici adımda magnification, mouse-position/rAF ve dinamik track
  kaldırıldı; sonraki LiquidDock aktarımında geri getirildi. Grup etiketleri
  kaldırıldı. Legacy aç/kapa `behavior="morph"` altında korundu.
- 2026-07-24: Native `href`/`onRoute`, safe-area ve kaydırılabilir responsive
  ray desteği eklendi.
- 2026-07-24: Geçici sabit-halo yaklaşımı kaldırıldı. public-site LiquidDock
  kaynağındaki 180px kosinüs etki alanı, 1×–1.5× magnification, dinamik
  merkez/content length ve hareketli edge lens taşındı. Dış cam Header ile
  aynı fallback tier, `thickness={0.55}` ve
  `blur(14px) saturate(180%)`; iç lens 6px blur ve %82 tint kullanır.
- 2026-07-24: Magnification fine-pointer sorgusuyla sınırlandı; klavye odağı
  pointer hedefinden öncelikli yapıldı ve reduced-motion layout transform'u
  kapatıldı.
