---
name: GlassMap
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassMap Kuralları

## 1. Amaç

Kütüphanesiz (harici bağımlılıksız) harita yüzeyi v1: seed'den deterministik
üretilen soyut sokak dokusu üzerinde fiyat/cluster pinleri, katman
(yol/uydu) değişimi ve yaklaşık konum dairesi. İlan detay sayfasında konum
bağlamı verir.

- **Kullan:** ilan detay konum bloğu, arama sonuçları harita paneli, mahalle
  önizlemesi.
- **Kullanma:** gerçek coğrafi hassasiyet gereken üretim haritası (→ v2
  MapLibre adaptörü, bkz. Açık Kararlar), rota/yol tarifi.

| İlgili | Farkı |
|---|---|
| GlassLocationCard | Statik tekil adres + "Haritada Aç" aksiyonu; pin/etkileşim yok |
| GlassGallery | Görsel galerisi; mekansal veri değil |

## 2. Semantik sözleşme

- Kök: `<div role="group" aria-label>` — `label` prop yoksa "Harita".
- Zemin: `aria-hidden="true"` dekoratif `<svg>` (sokak dokusu, bilgi taşımaz).
- Katman toggle: `role="radiogroup"` + iki `role="radio"` buton, GlassSegmentedControl
  ile birebir aynı roving-tabindex sözleşmesi: yalnız seçili segment `tabIndex=0`,
  diğeri `-1`; `ArrowRight/Down` sonraki, `ArrowLeft/Up` önceki segmente odağı VE
  seçimi taşır (sarar), `Home`/`End` uçlara gider.
- Pinler: gerçek `<button type="button">`; fiyat pini görünür metin =
  accessible name (`pin.price`); cluster pini `aria-label="${count} ilan"`.
- Popup: seçili pinin `pinWrap` sarmalayıcısı içinde `role="group"
  aria-label`; kapatma butonu `aria-label="Popup'ı kapat"`. Portal YOK —
  harita DOM'unun içinde kalır (overlay değil, satır-içi içerik). Kök
  (`.root`) `overflow:hidden` TAŞIMAZ — yalnız zemin SVG'sini saran
  `.canvasClip` kırpılır (rounded-corner için); popup ve pinler kök
  sınırının dışına taşabilir ama asla kırpılıp görünmezleşmez.
- DOM değişmezi: her `pins[]` öğesi tek `pinWrap` üretir; `id` React `key`.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| pins[].id | ✅ | `string` | React key + popup/seçim kimliği |
| pins[].x / y | ✅ | `number` (0-1) | Normalize konum; harita kutusuna göre. Finite değilse (NaN/Infinity) pin RENDER EDİLMEZ; finite ama 0-1 dışıysa 0-1'e kenetlenir (`clampUnit`) — harita dışında etkileşimli pin üretilmez |
| pins[].price | — | `string` | Verilmezse ve `count` yoksa pin boş görünür (kullanıcı hatası) |
| pins[].count | — | `number` | Verilirse cluster rozeti; `price` yok sayılır |
| popupContent | — | `(pinId) => ReactNode` | Yalnız seçili pin için çağrılır |
| privacyCircle | — | `{x,y,r}` | 0-1 normalize; yaklaşık konum. `x`/`y`/`r`'den biri finite değilse daire RENDER EDİLMEZ; finite ama 0-1 dışıysa kenetlenir |

## 4. Public API

| Ad | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|
| pins | `GlassMapPin[]` | — | — | Fiyat/cluster pinleri |
| selectedId | `string \| null` | — | ✅ | Controlled seçili pin — `undefined`=uncontrolled, `null`=controlled BOŞ seçim, `string`=controlled seçili id |
| defaultSelectedId | `string` | — | — | Uncontrolled başlangıç |
| onPinSelect | `(id: string \| undefined) => void` | — | — | Seçim değişince; aynı pine tekrar tıklama → `undefined` |
| popupContent | `(pinId: string) => ReactNode` | — | — | Seçili pin üstü popup içeriği |
| layer | `'yol'\|'uydu'` | — | ✅ | Controlled zemin katmanı |
| defaultLayer | `'yol'\|'uydu'` | `'yol'` | — | Uncontrolled başlangıç |
| onLayerChange | `(layer) => void` | — | — | İç toggle veya dışarıdan değişince |
| privacyCircle | `{x,y,r}` | — | — | Yaklaşık konum dairesi |
| variant | `'inline'\|'panel'` | `'inline'` | — | inline 16:9, panel dikey dolu (üst bileşen yükseklik verir) |
| seed | `number \| string` | `1` | — | Sokak dokusu üretim tohumu — deterministik |
| label | `string` | `'Harita'` | — | Kök `aria-label` |

Ref hedefi yok. `onPinSelect`/`onLayerChange` yalnız kullanıcı etkileşiminde
çalışır (prop değişikliği kendi kendine tetiklemez).

`selectedId` controlled tespiti `selectedId !== undefined` ile yapılır — bu
yüzden `null` ve bir `string` ikisi de controlled sayılır, yalnız prop hiç
verilmemesi (veya açıkça `undefined` geçilmesi) uncontrolled'a düşer.
Controlled bir haritada seçimi temizlemek isteyen tüketici `selectedId`'yi
`undefined`'a DEĞİL `null`'a çekmelidir; aksi halde harita uncontrolled moda
geri döner ve `defaultSelectedId`'den kalan/iç state'teki eski seçim tekrar
görünür olabilir (bkz. §11 regresyon testi).

## 5. Seçenek eksenleri

`material`/`tone`/`size` yok — flat içerik yüzeyi, tek ölçek. Eksenler:
`variant` (inline/panel) ve `layer` (yol/uydu, zemin paleti). Birleşik
variant yok. `seed` görsel bir eksen değil, üretim parametresidir.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selected pin | `selectedId !== undefined` ise prop (`null`=boş), aksi halde iç state | — | `aria-pressed` |
| layer | prop/iç state | — | `aria-checked` (radio) |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| popup açık | `selected && popupContent` türetilmiş | — | `role="group"` |

Katman sırası: layer (zemin) → pins (üstte) → popup (en üstte, `z-index`).

## 7. Davranış

- Pointer: pine tıklama seçer; aynı pine tekrar tıklama seçimi kaldırır
  (popup kapanır). Katman butonuna tıklama anında değiştirir (animasyonsuz
  buton state'i; zemin paleti CSS ile geçişsiz değişir — `data-layer`).
- Keyboard: pinler `Tab` ile doğal DOM sırasıyla gezilir; odaklı bir pinde
  `ArrowRight/Down` sonraki, `ArrowLeft/Up` önceki pine odağı taşır (sarar).
  `Enter/Space` native buton aktivasyonu ile seçer. `Escape` seçimi/popup'ı
  kapatır. Katman toggle'ı ayrı bir roving-tabindex radiogroup'tur: `Tab`
  yalnız seçili segmente durur, `ArrowRight/Left/Up/Down/Home/End` segmentler
  arasında odağı VE seçimi birlikte taşır (GlassSegmentedControl ile aynı
  desen).
- Popup konumu pin koordinatına göre otomatik seçilir: `pin.y < 0.24` ise
  popup pinin ALTINDA açılır (`data-vertical="below"`), aksi halde üstünde
  (`"above"`). `pin.x < 0.18` sol kenara (`data-align="start"`), `x > 0.82`
  sağ kenara (`"end"`) hizalanır, aradaki değerlerde ortalanır (`"center"`).
  Bu, kökün `overflow:hidden` taşımamasıyla birlikte popup'ın kenara yakın
  pinlerde kırpılıp kaybolmasını engeller (eşikler yaklaşık; DOM ölçümü
  yapılmaz — bkz. §9 borç).
- Controlled/uncontrolled: `selectedId`/`layer` verilirse iç state
  yazılmaz — `onPinSelect`/`onLayerChange` yine çağrılır, görünür durum
  yalnız prop güncellenince değişir (bkz. test: controlled senaryo).
- Zemin üretimi saf fonksiyon: `seed` aynıysa `vLines/hLines/blocks` birebir
  aynıdır (memoize edilir, `Math.random` kullanılmaz).
- Koordinat güvenliği: `pins[].x/y` ve `privacyCircle.x/y/r` `clampUnit` ile
  işlenir — `Number.isFinite` değilse (NaN/Infinity, ör. API'den bozuk veri)
  o pin/daire hiç render edilmez (butonun kendisi DOM'a yazılmaz, tıklanabilir
  bir "harita dışı" öğe oluşmaz); finite ama 0-1 aralığı dışındaysa 0-1'e
  kenetlenir (ör. `x=4` → `1`, `y=-2` → `0`).

## 8. İçerik kuralları

- Fiyat metni proje formatı ("4.250.000 TL"); `font-variant-numeric:
  tabular-nums`.
- Cluster rozetinde yalnız sayı görünür; erişilebilir ad "N ilan" ile
  netleştirilir.
- Popup içeriği tüketici sorumluluğunda (`popupContent`); uzun başlıklarda
  `max-width: 240px` ile satır kırılır (raw değer, §9).
- Katman etiketleri sabit "Yol"/"Uydu" — i18n gerekirse prop'a açılır (Açık
  Kararlar).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kök yüzey/çizgi | background/border | `--lg-surface` / `--lg-hairline` |
| zemin (yol) | fill | `color-mix(--lg-label/--lg-bg)` türevleri |
| zemin (uydu) | fill | `color-mix(--lg-success/--lg-label/--lg-accent)` türevleri |
| pin fiyat | background/color | `--lg-surface` → seçili `--lg-accent` |
| pin cluster | background/color | `--lg-accent` → seçili `--lg-label` |
| toggle aktif | background | `--lg-accent` |
| radius | — | `--lg-radius-media` (kök), `--lg-radius-capsule` (pin/toggle), `--lg-radius-chip` (popup) |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçülerin tamamı
component kökünde yerel değişkenlerde toplanır — `--map-toggle-gap` (2px),
`--map-toggle-pad` (3px), `--map-toggle-btn-pad[-coarse]` (5px 11px /
10px 13px), `--map-pin-price-h` (26px), `--map-pin-price-pad` (5px 10px),
`--map-pin-price-pad-inline-coarse` (14px), `--map-pin-cluster-size` (30px),
`--map-pin-cluster-pad-inline` (6px), `--map-popup-close-size` (22px),
`--map-popup-close-glyph[-coarse]` (15/17px), `--map-popup-min-w` /
`--map-popup-max-w` (168/240px), `--map-popup-offset` (10px),
`--map-popup-in-shift` (4px — giriş animasyonu yer değiştirmesi; sayısal
olarak `--lg-space-1`'e eşit ama boşluk ölçeğine bilinçli bağlanmadı, spacing
token'ı değişirse animasyon etkilenmemeli), `--map-panel-min-h` (420px —
dikey dolu panel varsayılan yüksekliği). Coarse hedefler
`--lg-control-md`/`--lg-control-sm` token'larına bağlıdır (coarse'ta 44/36px).
Bilinçli bırakılan: pin/popup gölgeleri (`0 1px 3px` / `0 6px 18px`, renk
`color-mix` token türevi) — hiçbir `--lg-shadow-*` deseniyle birebir
eşleşmediğinden offset/blur raw; popup yön/hizalama eşikleri (`y<0.24`,
`x<0.18`/`x>0.82`) sabit sayı — gerçek DOM ölçümü değil, tahmini sınır (§7);
SVG `stroke-width`/`stroke-dasharray` vektör gereği raw; süre/easing
(`0.15s`/`0.16s ease[-out]`) süre token'ı olmadığından raw. Font ağırlıkları
ölçeğe çekildi: toggle 600 (eski 650), pin fiyat 700 (eski 750), cluster 700
(eski 800).

## 10. Storybook kapsamı

Var: Default(Inline), Playground, Panel, UyduKatmani, Cluster,
PrivacyCircle, Controlled, UzunIcerik, Erisilebilirlik (docs). Eksik:
Sizes N/A — tek ölçek.

## 11. Test kabul kriterleri

- [x] fiyat/cluster pinleri erişilebilir buton olarak render edilir
- [x] tıklama seçer, popup içeriği görünür
- [x] seçili pine tekrar tıklama seçimi kaldırır
- [x] controlled: `selectedId` dışarıdan yönetilir, `onPinSelect` döner
- [x] katman toggle `data-layer` değiştirir + `onLayerChange`
- [x] `privacyCircle` SVG circle render eder
- [x] `Escape` seçimi kaldırır
- [x] ok tuşlarıyla pinler arası klavye gezinmesi
- [x] aynı `seed` deterministik doku üretir
- [x] `panel` varyantı `data-variant` ile işaretlenir
- [x] katman toggle roving-tabindex + ok tuşu ile Yol/Uydu arası odak taşır
- [x] üst/sol/sağ kenara yakın pinlerde popup yön/hizalama attribute'ları
      doğru hesaplanır (data-vertical/data-align)
- [x] controlled: `selectedId` prop `null`'a çekilince eski iç/uncontrolled
      seçim geri sızmaz, sonraki tıklama yalnız `onPinSelect` döner
- [x] finite olmayan (`NaN`/`Infinity`) pin koordinatı render edilmez,
      geçerli pinler etkilenmez
- [x] finite ama 0-1 dışı pin koordinatı 0-1'e kenetlenir
- [x] finite olmayan `privacyCircle` koordinatı/yarıçapı render edilmez
- [ ] zemin dokusunun görsel yoğunluğu (visual, Chrome)
- [ ] popup'ın gerçek DOM ölçümüyle (ör. ResizeObserver) tam kenar-güvenli
      konumlanması — v1 yalnız pin koordinatına göre eşiklenmiş tahmin
      kullanır (visual, Chrome + dar konteyner)

## 12. Do / Don't

- ✅ `label` ver; sayfada birden çok harita varsa adlandır.
- ✅ Yoğun bölgede `count` ile cluster kullan; her ilanı tek tek pinleme.
- ✅ Kesin konum gerekmiyorsa `privacyCircle` ile yaklaşık alanı göster.
- ❌ Harita yüzeyine cam/backdrop-filter verme — içerik katmanı flat kalır.
- ❌ `popupContent` içine ikinci seviye interaktif harita kontrolü koyma
  (zoom/pan v1'de yok).
- ❌ Controlled bir haritada seçimi kaldırmak için `selectedId`'yi
  `undefined` yapma — bu, bileşeni uncontrolled moda düşürüp eski iç seçimi
  geri getirebilir; `null` kullan.

**Bilinen kısıtlar:** zoom/pan yok (v1 statik kutu); cluster'a tıklama
"genişletme" değil, yalnız seçim/popup tetikler — gerçek gruplama v2'de.

**Açık kararlar:** gerçek MapLibre/coğrafi veri adaptörü (v2 — bu component
v1'de tamamen sentetik, seed'li SVG zemin kullanır) · katman etiketlerinin
("Yol"/"Uydu") i18n'i · cluster tıklamasının alt-pinleri açması (v2) ·
`privacyCircle`'ın sürüklenebilir/ayarlanabilir olması (v2) · popup'ın
gerçek DOM ölçümüyle (ResizeObserver/`getBoundingClientRect`) tam kenar-
güvenli konumlanması — v1 yalnız pin koordinatına göre sabit eşiklerle
(y/x) yön ve hizalama tahmin eder, kökün `overflow:hidden` taşımaması
sayesinde en kötü durumda bile popup görünmez olmaz, yalnız kök sınırının
biraz dışına taşabilir.

**Changelog:** 2026-07-17 — İlk sürüm: seed'li deterministik SVG sokak
dokusu, fiyat/cluster pinleri, controlled seçim + katman, popup, privacy
circle, inline/panel varyantları.
2026-07-17 — Review düzeltmesi: katman toggle GlassSegmentedControl ile
aynı roving-tabindex + ok tuşu sözleşmesine taşındı; kökten
`overflow:hidden` kaldırıldı (yalnız yeni `.canvasClip` sarmalayıcısı zemin
SVG'sini kırpar), popup artık pin konumuna göre `data-vertical`/`data-align`
ile yön/hizalama değiştirir ve kenara yakın pinlerde asla tamamen
görünmezleşmez; `popupClose` `pointer: coarse`'ta 36px'e büyür.
2026-07-17 — Code review düzeltmesi: `selectedId` tipi `string | null`
oldu (`undefined`=uncontrolled, `null`=controlled boş seçim), controlled
tespiti `selectedId !== undefined` ile yapılır — parent'ın seçimi
temizlemesi artık eski iç/uncontrolled seçimi geri sızdırmaz; `pins[].x/y`
ve `privacyCircle.x/y/r` `clampUnit` ile finite kontrolünden geçirilip
0-1'e kenetlenir, finite olmayan değer render edilmez (harita dışında
etkileşimli pin üretilmesi engellendi).
