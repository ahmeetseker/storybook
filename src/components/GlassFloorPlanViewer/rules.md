---
name: GlassFloorPlanViewer
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassFloorPlanViewer Kuralları

## 1. Amaç

Çok katlı ilanlarda kat planı görüntüleyici: üst sekme chip'leriyle kat
seçimi, pointer sürüklemeyle pan, +/- butonu ve Ctrl+wheel ile 1x–4x
yakınlaştırma, "Sıfırla" ile başa dönüş, tıklanabilir hotspot pin'leriyle oda
etiketleri. İçerik katmanı component'idir — malzeme her zaman flat (tek
desen; `variant`/`material` ekseni yok).

- **Kullan:** ilan detayında kat planı/vaziyet planı gösterimi, oda bazlı
  etiketleme (hotspot).
- **Kullanma:** genel görsel galerisi (→ `GlassGallery`), harici harita
  entegrasyonu (→ ayrı bileşen), tek statik görsel (pan/zoom gereksizse
  düz `<img>` yeterli).

| İlgili | Farkı |
|---|---|
| GlassGallery | Çoklu fotoğraf + lightbox; pan/zoom/hotspot yok |
| GlassTabs | Sekme + panel deseni ortak, ama panel burada pan/zoom'lu görsel sahnesidir |

## 2. Semantik sözleşme

- Kök: `<section>` (`GlassSurface as="section"`, `shape={20}`,
  `material="flat"` sabit, `thickness={0.4}`).
- Kat seçimi: `role="tablist"` (`aria-label="Kat seçimi"`) > `role="tab"`
  (`<button type="button">`), seçili sekmede `aria-selected="true"` +
  `tabIndex=0`, diğerlerinde `tabIndex=-1` (roving tabindex).
- Görüntü alanı: `role="tabpanel"`, `aria-labelledby` aktif sekmenin id'sine
  bağlı; tek panel DOM'dadır (kat değişince içerik değişir, ek panel
  render edilmez).
- Hotspot pin'i: gerçek `<button type="button">`, `aria-label` oda adı,
  `aria-expanded` balon açık/kapalı durumunu taşır; açıkken
  `aria-describedby` balonun `id`'sine bağlanır.
- Balon: `role="tooltip"` — yalnız tıklamayla açılıp kapanan basit bir bilgi
  kutusu (hover tooltip'i değil).
- DOM değişmezleri: (1) sekmeler gerçek `<button>` kalır, (2) hotspot'lar
  görsel ile aynı transform edilen katmandadır (pan/zoom'u takip eder),
  (3) yakınlaştırma yüzdesi `aria-live="polite"` ile duyurulur.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| plans[].label | ✅ | `string` | Sekme metni; tek satır, kısa tut |
| plans[].src | ✅ | `string` | Kat planı görseli; `aspect-ratio: 4/3` sahneye `object-fit: cover` ile oturur |
| plans[].hotspots[].x / y | — | `number` (0–1) | Görselin sol/üstüne göre oran; sahne boyutundan bağımsız |
| plans[].hotspots[].label | — | `string` | Pin `aria-label`'ı + balon metni |
| controls | otomatik | Sıfırla + Uzaklaştır/Yakınlaştır + yüzde | Her zaman render edilir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| plans | prop | `GlassFloorPlanPlan[]` | — (zorunlu) | — | Kat listesi, sekme sırasıyla aynı |
| activeIndex | prop | `number` | — | ✅ | Verilirse iç state devre dışı |
| defaultActiveIndex | prop | `number` | `0` | uncontrolled | Başlangıç katı |
| onActiveIndexChange | prop | `(index: number) => void` | — | — | Her sekme seçiminde (klavye dahil) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | Kök `GlassSurface` + iç `GlassButton`/`GlassIconButton`'a geçer |
| ...rest | — | `Omit<HTMLAttributes<HTMLElement>,'onChange'>` | — | — | Kök `section`'a |

`material`/`variant` prop'u **yok** — panel her zaman flat (bilinçli, bkz.
§12). Zoom seviyesi (`scale`) ve pan (`x`/`y`) ile hotspot balon durumu
dışa açılan prop değildir; yalnız `onActiveIndexChange` dışa event verir.
Ref forward edilmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `activeIndex` verilmemiş → ilk kat (`0`), `tone=auto`,
`scale=1`, pan `{0,0}`, tüm hotspot balonları kapalı.

| Kural | Davranış |
|---|---|
| `material` / `variant` | ❌ yok — spec gereği tek flat desen |
| `size` | ❌ yok — sahne sabit `aspect-ratio: 4/3`, genişlik parent'tan |
| Kat değişimi | pan/zoom ve açık balon otomatik sıfırlanır (her kat kendi başlangıç görünümüyle açılır) |
| `plans=[]` | Component `null` render eder (bkz. GlassGallery ile aynı desen) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| activeIndex | prop/iç state | — | `aria-selected` (sekme), `aria-labelledby` (panel) |
| scale (1x–4x) | iç state | Uzaklaştır (`scale<=1`) / Yakınlaştır (`scale>=4`) butonunu `disabled` yapar | `aria-live="polite"` yüzde metni |
| pan {x,y} | iç state (pointer sürükleme) | — | — (görsel; AT'ye rapor edilmez) |
| dragging | iç state | `imageWrap` geçişini kapatır (anlık takip) | `data-dragging` (yalnız cursor için) |
| openHotspot | iç state | — | pin `aria-expanded`, balon `role="tooltip"` |

Katman sırası: availability (kat listesi) → value (activeIndex/scale/pan) →
interaction (hover/focus CSS state'i, hiçbiri prop değil).

## 7. Davranış

- Pointer: görüntü alanında `pointerdown` (hotspot pin'i hariç — `closest('button')`
  ile hariç tutulur) sürüklemeyi başlatır ve o pointer'ın `pointerId`'sini
  `dragState` ref'inde tutar; `setPointerCapture` ile takip edilir (jsdom'da
  yok, optional chaining bilinçli). Sürükleme aktifken ikinci bir pointer'ın
  `pointerdown`'ı yoksayılır (tek pointer takibi); `pointermove`/`pointerup`/
  `pointercancel` yalnız `dragState`'teki pointerId ile eşleşen event'lerde
  işlenir. `lostpointercapture` (tarayıcı capture'ı bizden bağımsız geri
  alırsa — sistem jesti, sekme değişimi vb.) aynı pointerId kontrolüyle
  drag state'i temizler. Kat/plan değişiminde (`currentIndex` effect'i)
  `dragState` ve `dragging` sıfırlanır — sürükleme ortasında kat
  değiştirilirse state yeni katta sızmaz. Transform sırası
  `translate() scale()` — `translate` outer olduğundan px teslimi zoom
  seviyesinden bağımsız 1:1'dir.
- Zoom: `+`/`-` butonları `0.5` adımla `1`–`4` aralığında kıskaçlanır;
  `Ctrl` + wheel aynı adımı uygular. Wheel, React'ın sentetik (passive)
  `onWheel`'i ile DEĞİL, `viewportRef` üzerine native
  `addEventListener('wheel', h, { passive: false })` ile bağlanır (effect +
  cleanup) — aksi halde `preventDefault` etkisiz kalır ve `Ctrl`+wheel
  tarayıcının kendi sayfa zoom'unu da tetikler. `preventDefault` yalnız
  `ctrlKey` true iken çağrılır — düz wheel sayfa kaydırmasına karışmaz.
- Keyboard (kat sekmeleri, WAI-ARIA tabs deseni): ArrowRight/Down,
  ArrowLeft/Up sarmalı gezinir, Home/End uçlara gider; seçim focus'u izler.
- Hotspot: tıklama balonu açar/kapar (toggle); aynı anda yalnız bir balon
  açık kalır (yeni hotspot'a tıklamak öncekini kapatır).
- Reset: `scale=1`, pan `{0,0}` — balon durumunu etkilemez.
- Async / overlay: N/A — senkron, portal yok.

## 8. İçerik kuralları

- Kat etiketi tek satır (`white-space: nowrap`); çok kat varsa sekme listesi
  yatay kayar (scrollbar gizli).
- Hotspot `label` balon içinde tek satır (`white-space: nowrap`); çok uzun
  oda adı balonun kendisini genişletir, kırpılmaz — kısa tutulması önerilir.
- `src` görseli dekoratif değildir — `alt="{kat} kat planı"` otomatik üretilir,
  ayrı `alt` prop'u yok.
- Boş `hotspots`: pin/balon hiç render edilmez, sahne yalnız pan/zoom'lu
  görsel olur.
- **Kaynak oranı:** `.image` `object-fit: contain` kullanır (kat planı bir
  çizimdir — `cover` kırpardı). Hotspot `x`/`y` oranları görselin kendisine
  değil, `.imageWrap` kutusuna (sahnenin tamamı, `aspect-ratio: 4/3`) göre
  hesaplanır. Kaynak görsel de `4:3` ise `imageWrap` == görüntülenen içerik
  kutusu olur ve pin'ler tam isabetli konumlanır. Kaynak `4:3` değilse
  `contain` letterbox (boşluk) bırakır ve pin koordinatları görüntülenen
  içeriğe göre kayar — bu yüzden `src` görselini olabildiğince `4:3`
  oranında sağlamak gerekir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background / border / renk | `--lg-surface` / `--lg-hairline` / `--lg-label` (`GlassSurface material="flat"`) |
| root | radius | `shape={20}` — `--lg-radius-card` değeriyle aynı, sayısal |
| viewport | radius | `--lg-radius-media` |
| tab | radius | `--lg-radius-chip` |
| tab | yükseklik | `--lg-control-sm` (+ `pointer:coarse`'ta `--glass-floorplan-touch-target`) |
| tab / balon / zoom yüzdesi | font-size | `--lg-text-footnote` / `--lg-text-caption` |
| tab (seçili) | zemin/metin | `--lg-accent` / `--lg-accent-contrast` |
| tab / hotspot | focus outline | `--lg-accent` (yalnız `:focus-visible`) |
| hotspot | zemin/kenarlık | `--lg-accent` / `--lg-on-scrim` |
| balon | zemin/metin | `--lg-scrim` / `--lg-on-scrim` |
| Sıfırla / zoom butonları | tüm görünüm | `GlassButton`/`GlassIconButton` token'ları |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkenlerde toplandı: `--glass-floorplan-root-gap` (14px),
`--glass-floorplan-tab-gap` (6px), `--glass-floorplan-tab-pad` (14px),
`--glass-floorplan-stage-gap` / `--glass-floorplan-cluster-gap` (10px),
`--glass-floorplan-hotspot-size` (26px — kasıtlı küçük pin),
`--glass-floorplan-hotspot-ring` (2px),
`--glass-floorplan-tooltip-pad-block/-inline` (6/10px),
`--glass-floorplan-touch-target` (44px — dokunmatik hedef sabiti; sekme ince
pointer'da `--lg-control-sm` kullandığından coarse 44px'i control token'ına
bağlanmadı). Token'a bağlananlar: tab 13px → `--lg-text-footnote`, balon ve
zoom yüzdesi 12px → `--lg-text-caption`, balon dikey ofseti 20px →
`--lg-space-5`, zoom grubu `gap` 8px → `--lg-space-2`. Bilinçli bırakılan:
hotspot gölgesi `0 2px 6px rgba(0,0,0,0.3)` — hiçbir `--lg-shadow-*` deseniyle
birebir eşleşmiyor; geçiş süreleri/easing (`0.16s`/`0.2s ease-out`) süre
token'ı olmadığından raw; zoom adımı (`0.5`) ve sınırları (`1`–`4`) token
değil, spec sabiti.

## 10. Storybook kapsamı

Var: **Default** (4 kat, hotspot'lu) · **Playground** (Controls) ·
**Controlled** (`activeIndex=2` sabit) · **States** (1x açılış kilidi +
hotspot etkileşim daveti) · **UzunIcerik** (6 kat, uzun TR etiketler + uzun
oda adı, dar container) · **Responsive** (300px, dokunma hedefi) ·
**Erişilebilirlik** (ARIA sözleşmesi dokümante). **Eksik:** Sizes/Variants —
N/A (eksen yok). Temalar dedike story değil, global toolbar'la kapsanır
(kütüphane geneli konvansiyon).

## 11. Test kabul kriterleri

- [x] ilk kat varsayılan seçili + doğru görsel (unit)
- [x] sekme tıklaması görseli değiştirir + `onActiveIndexChange` doğru index (interaction)
- [x] controlled `activeIndex` belirleyicidir (unit)
- [x] hotspot toggle: tıklama balonu açar/kapar (interaction)
- [x] zoom butonları erişilebilir isimli + 1x/4x'te `disabled` (unit + interaction)
- [x] Sıfırla `scale`'i başa döndürür (interaction)
- [x] kat değişince zoom otomatik sıfırlanır (interaction)
- [x] Ctrl+wheel yakınlaştırır, düz wheel etkisizdir (interaction)
- [x] pointer sürükleme `translate` değerini değiştirir (interaction)
- [x] farklı `pointerId`'li ikinci pointer'ın move/up'ı aktif sürüklemeyi etkilemez (interaction)
- [x] `lostpointercapture` ve kat değişimi sürükleme state'ini temizler (interaction)
- [x] kaynak görsel kırpılmasın diye `.image` `object-fit: contain` kullanır (statik/CSS)
- [ ] klavye (ok tuşu/Home/End) sekme gezinmesi (interaction — henüz otomatik test yok, davranış GlassTabs ile birebir aynı desende)

## 12. Do / Don't

- ✅ `plans` dizisini kat sırasıyla ver — sekme sırası dizinin sırasıdır.
- ✅ Hotspot koordinatlarını görselin kendi oranına göre ver (0–1); sahne
  boyutu değişse de pin doğru konumda kalır.
- ❌ `material`/`variant` prop'u ekleme isteme — spec bilinçli olarak tek
  flat desen istiyor (bkz. Amaç).
- ❌ `plans=[]` verme — component `null` render eder, boş durum tasarımı yok.
- ❌ Hotspot pin'ine ekstra children/ikon koyma — pin salt bir nokta,
  bilgi balonla taşınır.

**Bilinen kısıtlar:** pan sınırsız (görsel kadraj dışına taşınabilir, sınır
klempi yok) · hotspot pin'i zoom ile birlikte büyür/küçülür (karşı-ölçekleme
yok — 1x altına inilmediği için dokunma hedefi her zaman güvenli) · tek
balon aynı anda açık kalır · klavye ile pan/zoom yok (yalnız buton/wheel) ·
kaynak görsel `4:3` değilse `object-fit: contain` letterbox bırakır ve
hotspot pin'leri (yüzde bazlı, `.imageWrap`'e göre) görüntülenen içerik
kutusuna göre kayar — bkz. §8 Kaynak oranı.

**Açık kararlar:** pan'e yumuşak sınır (image ölçüsüne göre) eklenmeli mi ·
hotspot pin'i için karşı-ölçekleme (`scale(1/scale)`) gerekli mi ·
`onZoomChange`/`onPanChange` gibi dışa event ihtiyacı.

**Changelog:** 2026-07-17 ilk sözleşme. 2026-07-17 code review fix'leri:
pointer drag artık `pointerId` ile takip edilir (`lostpointercapture` +
kat değişimi cleanup'ı eklendi — drag state sızması giderildi); wheel
zoom native `addEventListener({ passive: false })` ile bağlanıyor (React
sentetik wheel'in etkisiz `preventDefault`'ı ve Ctrl+wheel sayfa zoom
çakışması giderildi); `.image` `object-fit: cover` → `contain` (kat planı
kırpılmasın, kaynak oranı notu eklendi).
