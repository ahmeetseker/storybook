---
name: GlassMap
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# GlassMap Kuralları

## 1. Amaç

Kütüphanesiz (harici bağımlılıksız) harita yüzeyi v1: seed'den deterministik
üretilen soyut sokak dokusu üzerinde fiyat/cluster pinleri, katman
(yol/uydu) değişimi ve yaklaşık konum dairesi. İlan detay sayfasında konum
bağlamı verir.

- **Kullan:** ilan detay konum bloğu, arama sonuçları harita paneli, mahalle
  önizlemesi.
- **Kullanma:** rota/yol tarifi (zoom/pan dışı bir gezinme deneyimi gerektirir).
  Gerçek coğrafi hassasiyet artık `basemap` prop'uyla desteklenir (bkz. §2, §7,
  Açık Kararlar) — bu, "gerçek üretim haritası" için ayrı bir v2 gerekçesini
  ortadan kaldırır.

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
- `basemap` verildiğinde zemin, `aria-hidden="true"` bir Leaflet konteynerine
  (`.tiles`) döner — bilgi taşımayan dekoratif katman olma sözleşmesi seed'li
  SVG zeminle aynıdır. Zoom kontrolleri Leaflet'in kendi kontrol katmanı
  DEĞİL, GlassMap'in kendi `aria-label`'lı butonlarıdır (`Yakınlaştır` /
  `Uzaklaştır`). Atıf (`basemap.attribution`) lisans gereği her zaman görünür
  ve linklidir, kaldırılamaz/gizlenemez. Zemin yüklenemezse (`status
  ==='error'`) `role="status"` ile bildirim yapılır ve harita seed'li SVG
  zeminine düşer (bkz. §7).
- Katman (Yol/Uydu) toggle'ı **yalnız gerçekten bir şeyi değiştiriyorsa**
  render edilir: `basemap` yokken (sentetik SVG modu) her zaman görünür ve
  `data-layer` ile zemin CSS'ini değiştirir (bugünkü davranış). `basemap`
  verildiğinde ise yalnız `basemap.satelliteTileUrl` de verilmişse görünür —
  o zaman toggle Leaflet tile katmanının kaynağını gerçekten değiştirir
  (`L.TileLayer#setUrl`, harita yeniden kurulmadan). `satelliteTileUrl`
  verilmemiş bir `basemap` ile toggle hiç render EDİLMEZ; aksi halde buton
  `role="radio"`, aktif stil ve focus halkasıyla tam işlevsel görünüp sıfır
  etki üreten yanıltıcı bir kontrol olurdu (bkz. §4, §9, Task 9 review Bulgu 1).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| pins[].id | ✅ | `string` | React key + popup/seçim kimliği |
| pins[].x / y | ⚠️ | `number` (0-1) | `basemap` YOKKEN zorunlu. Normalize konum; harita kutusuna göre. Finite değilse (NaN/Infinity) pin RENDER EDİLMEZ; finite ama 0-1 dışıysa 0-1'e kenetlenir (`clampUnit`) — harita dışında etkileşimli pin üretilmez |
| pins[].lat / lng | ⚠️ | `number` | `basemap` VARKEN kullanılır; Leaflet projeksiyonuyla piksele çevrilir. Render pin başına mevcut geçerli koordinata düşer: önce projeksiyon denenir, o pin için yoksa (bu pin'in `lat`/`lng`'si eksik/finite değil veya zemin `status==='error'`) `x`/`y` varsa ona düşülür (`GlassMap.tsx` pin render bloğu, satır ~376-379); yalnız ikisi de yoksa pin atlanır. ⚠️ Bu düşüş "pin kaybolur" değil **"pin yanlış konumda görünür"** riski taşır — `x`/`y` bir yüzde konumu olarak yorumlanır, bu yüzden `basemap` ile birlikte `x`/`y` de veriliyorsa bunlar rastgele/varsayılan bir değer değil, ilanın coğrafi konumunun kaba bir yüzde karşılığı olmalıdır (bkz. §6, §7) |
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
| basemap | `GlassMapBasemap` | — | — | Gerçek tile zemini (Leaflet projeksiyon/tile motoru). Verilmezse seed'li SVG zemin (bugünkü v1 davranışı) korunur; verildiğinde pin konumu `lat`/`lng` üzerinden hesaplanır (bkz. §3, §7). `basemap.satelliteTileUrl` verilmezse katman toggle'ı `basemap` modunda hiç render EDİLMEZ (bkz. §2, §7) |

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
| basemap durumu | `useBasemap` iç state'i (`idle/loading/ready/error`) — prop değil | pin konum kaynağını (projeksiyon ↔ `x`/`y`) belirler | `error` iken `role="status"` bildirim |

Katman sırası: layer (zemin) → pins (üstte) → popup (en üstte, `z-index`).
Pin konumu `basemap` yokken her zaman `x`/`y` (0-1 normalize) üzerinden gelir.
`basemap` varken önce Leaflet projeksiyonu (o pinin `lat`/`lng`'sinden
hesaplanan piksel) denenir; **bu pin için** projeksiyon yoksa (ör. bu pinde
`lat`/`lng` eksik/finite değil, ya da zemin `status==='error'`) ve pin'de
`x`/`y` varsa render ona düşer — pin ATLANMAZ, yüzde konumuyla render
edilmeye devam eder. Pin yalnız her iki kaynak da (projeksiyon VE geçerli
`x`/`y`) yoksa atlanır; bu koşul `basemap`'in genel `status`'undan bağımsız,
pin başına değerlendirilir — yani `basemap` sağlıklı (`ready`) olsa bile
yalnız `x`/`y` verilmiş (lat/lng'si olmayan) bir pin, x/y yüzde konumunda
render edilmeye devam eder, atlanmaz. Bu davranış "pin kaybolmasın" diye
bilinçli tasarlandı ama bir risk taşır: `x`/`y` gerçek coğrafi konumla
ilgisizse (ör. tutarsız/rastgele bir yüzde), pin harita üzerinde coğrafi
olarak yanlış bir yerde görünür — bu, hiç render edilmemekten daha
yanıltıcı olabilir. Bu yüzden `basemap` kullanan tüketicilerin `x`/`y`
sağladığında bunun konumun kaba bir yüzde karşılığı olmasına özen göstermesi
gerekir (bkz. §3, §7).

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
- `basemap.satelliteTileUrl` verilmişse katman toggle'ı Leaflet'in aktif tile
  katmanını **gerçekten** değiştirir: `currentLayer==='uydu'` olduğunda tile
  kaynağı `satelliteTileUrl`'e, `'yol'` olduğunda `tileUrl`'e döner
  (`L.TileLayer#setUrl`, zemin yeniden kurulmadan, pan/zoom konumu korunarak).
  Bu geçiş `basemap.tone` filtresinden (data-tone/CSS) bağımsızdır — ikisi
  ayrı eksenler: `tone` görsel filtre, katman ise tile KAYNAĞI. `satelliteTileUrl`
  verilmemişse toggle zaten render edilmediği için bu dal hiç tetiklenmez.
- Zemin (`basemap`) modunda zarif düşüş: `basemap` verilip gerçek tile zemini
  kurulamazsa (`status==='error'`) harita seed'li SVG dokusuna döner ve pin
  konumu artık lat/lng projeksiyonundan gelmez. Bu anda pin'e `x`/`y` de
  verilmişse pin yüzde koordinatla render edilmeye DEVAM EDER (harita hiçbir
  zaman boş kutu olmaz); yalnız `lat`/`lng` verilmiş, `x`/`y` verilmemiş
  pin'ler zemin hatasında render edilmez. Bu yüzden `basemap` kullanan
  tüketicilerin pin'lere mümkünse kaba `x`/`y` de vermesi önerilir — bu,
  zemin servisi (ağ/CSP/adblock) çökse bile ilanların kaba konumla görünür
  kalmasını sağlar.
- Buna karşılık zemin ÇALIŞIRKEN `x`/`y`'ye düşülmez: konum yalnız
  projeksiyondan gelir. Görünür alan dışına çıkan pin (harita kaydırıldığında
  ya da kadraj dışında kalan konum) render EDİLMEZ. Aksi halde elenen pin
  yüzde koordinatına düşüp zeminden kopar ve haritayla ilgisiz sabit bir
  noktada belirirdi.
- Kadraj `basemap.bounds` verilerek bölge sınırından hesaplanabilir; bu,
  sabit `zoom`'a yeğlenir çünkü sabit zoom dar panelde bölgenin bir kısmını
  kadraj dışında bırakıp o bölgedeki pinlerin elenmesine yol açar. Panel
  yeniden boyutlandığında kadraj `ResizeObserver` ile tazelenir.

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

**Borç (v2 — gerçek zemin mikro-geometrisi):** `--map-zoom-btn-size` (30px),
`--map-zoom-radius` (10px), `--map-attr-pad` (2px 7px — atıf/hata bildirimi
iç boşluğu), `--map-corner-surface-max-w` (`calc(50% - var(--lg-space-2) *
1.5)` — atıf ve hata bildirimi aynı satırda yan yana durduğunda çakışmasınlar
diye her biri genişliğin yarısından biraz azını alır). `tone` filtre
değerlerinin (`saturate`/`sepia`/`brightness`/`contrast` katsayıları; `quiet`/
`raw`/`satellite` + yalnız `quiet` ve `satellite` için ayrı koyu tema
varyantları — `raw`'ın `filter: none`'u koyu temada da değişmez, bilinçli
olarak filtresiz bırakılır) token karşılığı yok — bunlar tile
sağlayıcısının (OSM) kendi paletini sitenin sıcak nötrlerine yaklaştırmak için
ampirik olarak ayarlanmış, tasarım tokenlarına bilinçli bağlanmamış değerler.
`.zoomBtn:hover` arka planı için `--lg-fill-quaternary` token'ı projede
tanımsız çıktı; onun yerine `color-mix(in srgb, var(--lg-label) 6%,
transparent)` kullanıldı (aynı görsel niyet, mevcut token setiyle).

## 10. Storybook kapsamı

Var: Default(Inline), Playground, Panel, UyduKatmani, Cluster,
PrivacyCircle, Controlled, UzunIcerik, Erisilebilirlik (docs),
GercekZeminSessiz, GercekZeminHam, GercekZeminPopup (gerçek OSM tile zemini —
sırasıyla varsayılan sessiz ton, filtresiz ham ton, popup ile birlikte),
GercekZeminUyduToggle (`satelliteTileUrl` verilmiş — Yol/Uydu toggle görünür
ve gerçekten iki tile katmanı arasında geçiş yapar; `GercekZemin*` story'lerinde
`satelliteTileUrl` YOK, bu yüzden onlarda toggle hiç render edilmez).
Eksik: Sizes N/A — tek ölçek.

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
- [x] `basemap` modunda `satelliteTileUrl` verilmezse katman toggle render
      edilmez; verilince render edilir ve Yol/Uydu tıklaması tile katmanının
      `setUrl` ile gerçek kaynağını değiştirir (bkz. Task 9 review Bulgu 1)
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
  (sentetik/`basemap`'siz modda zoom/pan hiç yok; `basemap` modunda da
  Leaflet'in zoom/pan'i GlassMap'in kendi zoom butonları/atıf yüzeyiyle
  birlikte zaten yönetiliyor — `popupContent` bunun üstüne ikinci bir
  kontrol eklememeli).
- ❌ Controlled bir haritada seçimi kaldırmak için `selectedId`'yi
  `undefined` yapma — bu, bileşeni uncontrolled moda düşürüp eski iç seçimi
  geri getirebilir; `null` kullan.

**Bilinen kısıtlar:** sentetik modda (`basemap` verilmemişse) zoom/pan yok —
seed'li SVG statik bir kutudur. `basemap` modunda sürükleme `basemap.pannable`
ile yönetilir (varsayılan `true`): vitrin haritalarında `false` verilir, böylece
kadraj sabit kalır — açıkken kullanıcı bölgeyi kaybediyor ve pinler görünür
alandan çıkıp eleniyordu. Zoom butonları merkezi koruduğu için bu ayardan
etkilenmez. Çift tıklama/dokunmatik zoom da `pannable`'a bağlıdır; fare
tekerleğiyle yakınlaştırma (`scrollWheelZoom`) her koşulda kapalıdır —
sayfa kaydırılırken haritanın istemsizce yakınlaşmasını önlemek için
(`useBasemap.ts`). Leaflet'in kendi klavye tutamacı (`keyboard`) da kapalı:
açıkken konteyner kendi `tabindex=0`'ını alıp Tab sırasına tasarım sistemi
dışı bir odak halkasıyla (mavi outline) giriyor ve ok tuşlarını GlassMap'in
pin gezinme sözleşmesiyle (`onPinKeyDown`) çakışacak şekilde haritayı
kaydırmaya bağlıyordu — Tab, zoom/katman kontrollerinden sonra pinlere değil
bu görünmez konteynere ulaşıyordu (Task 9 Chrome/Playwright QA'sında
bulundu, bkz. task-9-report.md). Zoom yalnız GlassMap'in kendi butonları ve
çift tıklamayla yapılabilir. Cluster'a tıklama "genişletme" değil, yalnız
seçim/popup tetikler — gerçek gruplama v2'de. `basemap.attribution` tek bir
sabit içerik olduğundan Yol/Uydu katmanları arasında AYRI atıf metni
göstermez (ör. Esri World Imagery atfı OSM'den farklıdır) — tüketici birden
fazla sağlayıcı karıştırıyorsa `attribution` içeriğini her iki sağlayıcıyı da
kapsayacak şekilde vermelidir (v1 sınırı, ayrı bir düzeltme değil).

**Açık kararlar:** katman etiketlerinin ("Yol"/"Uydu") i18n'i · cluster
tıklamasının alt-pinleri açması (v2) · `privacyCircle`'ın sürüklenebilir/
ayarlanabilir olması (v2) · popup'ın gerçek DOM ölçümüyle
(ResizeObserver/`getBoundingClientRect`) tam kenar-güvenli konumlanması — v1
yalnız pin koordinatına göre sabit eşiklerle (y/x) yön ve hizalama tahmin
eder, kökün `overflow:hidden` taşımaması sayesinde en kötü durumda bile popup
görünmez olmaz, yalnız kök sınırının biraz dışına taşabilir.

**Kapatılan kararlar:** gerçek coğrafi veri adaptörü (v2) — karar `basemap`
prop'u (bkz. §4) lehine verildi: Leaflet YALNIZ projeksiyon/tile motoru
olarak kullanılır, kendi marker ve kontrol katmanları (zoom butonları, atıf)
bilerek kullanılmaz — bunların yerine GlassMap'in kendi tasarım-dili DOM
öğeleri (`.pin`, `.zoomBtn`, `.attribution`) render edilir, böylece pin
tipografisi/rengi ve kontrol görünümü tasarım sisteminden gelir, hiçbir CSS
değişkeni Leaflet'in kendi stiline/SVG attribute'una sızmaz. `basemap`
verilmezse component v1'deki gibi tamamen sentetik, seed'li SVG zeminde
kalmaya devam eder (geriye dönük uyumlu, kırılma yok).

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
2026-07-27 — Review düzeltmesi: `basemap` zemini kurulamadığında (`status
==='error'`) pin dallanması artık yalnız `usingTiles`'a değil, projeksiyon
sonucunun varlığına bakıyor — projeksiyon yoksa ve pin'de `x`/`y` varsa pin
yüzde koordinatla render edilmeye devam ediyor (önceden yalnız `lat`/`lng`
verilen pin'ler zemin hatasında sessizce kayboluyordu).
2026-07-27 — Dokümantasyon: gerçek OSM tile zemini için üç yeni story
(`GercekZeminSessiz`/`GercekZeminHam`/`GercekZeminPopup`) eklendi; §1/§2/§3/
§4/§6/§9 gerçek zemin (`basemap`) sözleşmesiyle güncellendi; "gerçek coğrafi
veri adaptörü" açık kararı `basemap` + Leaflet-yalnız-projeksiyon lehine
kapatıldı. Chrome + Playwright (gerçek Chromium) ile görsel doğrulama
yapıldı: sessiz ton sağlayıcı paletini nötrlüyor, pin/cluster tasarım
dilinde (Leaflet'in kendi mavi işaretçileri yok), zoom kontrolleri sağ üstte
cam yüzeyde (Leaflet kutusu yok), atıf sol altta tek/linkli, koyu temada
zemin kararıyor ama etiketler okunur kalıyor, dar viewport'ta atıf ellipsis
alıyor ve zorlanmış hata durumunda atıf ile hata bildirimi çakışmıyor, popup
okunaklı ve doğru konumlanıyor (ayrıntılar için task-4-report.md).
2026-07-27 — Task 9 uçtan uca Chrome/Playwright QA'sında bulunan düzeltme:
`useBasemap.ts`'te Leaflet kurulumuna `keyboard: false` eklendi — açıkken
Leaflet konteyneri kendi `tabindex=0`'ını alıp Tab sırasına tasarım sistemi
dışı bir odak halkasıyla giriyor, ok tuşlarını GlassMap'in pin gezinme
sözleşmesiyle çakışacak şekilde haritayı kaydırmaya bağlıyor ve Tab'ın
zoom/katman kontrollerinden sonra doğrudan pinlere ulaşmasını engelliyordu.
Regresyon testi eklendi (`GlassMap.test.tsx`: "Leaflet kurulumunda kendi
klavye tutamacı kapalıdır").
2026-07-27 — Task 9 review Bulgu 1 düzeltmesi: `basemap` modunda Yol/Uydu
toggle'ı önceden HER ZAMAN görünüyor ama `data-layer` yalnız sentetik SVG
sınıflarını (`.ground`/`.road`/`.block*`) hedeflediği için `basemap` modunda
(gerçek tile) hiçbir şeyi değiştirmiyordu — kullanıcıya işlevsiz bir kontrol
gösteriliyordu. `GlassMapBasemap`'e opsiyonel `satelliteTileUrl` eklendi;
`useBasemap` artık aktif katmanı parametre olarak alıp `satelliteTileUrl`
verilmişse Leaflet tile katmanını `setUrl` ile gerçekten değiştiriyor (harita
yeniden kurulmadan). `GlassMap.tsx`'te toggle artık yalnız `!basemap ||
basemap.satelliteTileUrl` iken render ediliyor — `basemap` verilip
`satelliteTileUrl` verilmemişse toggle hiç render edilmiyor. Yeni Storybook
story'si `GercekZeminUyduToggle` eklendi; regresyon testleri eklendi
(toggle'ın gizlenmesi, gerçek `setUrl` çağrısı, sentetik moddaki eski
davranışın korunduğu).
