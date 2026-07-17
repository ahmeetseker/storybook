---
name: GlassMediaGallery
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassMediaGallery Kuralları

## 1. Amaç

İlan detay sayfasının medya galerisi: fotoğraf, video, 360° sanal tur ve kat
planını tek bir bileşende, türe duyarlı biçimde sunar. İki yerleşim varyantı
vardır — `stage` (tek karışık şerit + büyük sahne) ve `tabbed` (türe göre ayrı
sekmeler: Fotoğraflar/Video/Kat Planı/Sanal Tur).

- **Kullan:** ilan detay sayfasının medya bölümü, karma medya türü olan galeriler.
- **Kullanma:** yalnız fotoğraf ve lightbox büyütme gerekiyorsa (→ `GlassGallery`),
  yatay öneri/kart şeridi (→ `GlassCarousel`).

| İlgili | Farkı |
|---|---|
| GlassGallery | Yalnız görsel; lightbox büyütme var, tür ayrımı yok |
| GlassCarousel | Genel amaçlı yatay şerit; medya türü semantiği yok |
| GlassTabs | Sekme birincil bileşeni; bu component kendi tablist'ini kurar, `GlassTabs` **kullanmaz** |

## 2. Semantik sözleşme

- Kök: `<div role="region" aria-label={label}>` — `label` prop'u ile adlandırılır
  (varsayılan "İlan medya galerisi").
- `stage` varyantı: sahne `role="group"` ile sayaç bilgisini taşır; ok/gezinme
  butonu yoktur (yalnız thumbnail).
- `tabbed` varyantı: kendi `role="tablist"` > `role="tab"` (`aria-selected`,
  `aria-controls`) > `role="tabpanel"` (`aria-labelledby`) yapısı — WAI-ARIA
  tabs deseninin tam klavye deseni (roving `tabindex` + ok tuşu gezinmesi,
  `GlassFloorPlanViewer` ile aynı desen) uygulanır (bkz. §7).
- Medya elementleri: `image`/`floorPlan` → `<img>`, `video` → `<video controls
  preload="metadata">` (autoplay yok), `tour360` → sandbox'lı `<iframe>` ile
  **zorunlu `title`** (`item.alt || item.label || '360° sanal tur'` — asla boş
  kalmaz).
- DOM değişmezi: her thumbnail gerçek `<button>`; aktif öğe `aria-current="true"`
  taşır (sekmede `aria-selected`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| items[].type | ✅ | `'image'\|'video'\|'tour360'\|'floorPlan'` | Render türünü belirler |
| items[].src | ✅ | string (URL) | img `src` / video `<source>` / iframe `src` |
| items[].alt | — | string | img/floorPlan alt metni; tour360'ta iframe title'a düşer; yoksa img `alt=""` (dekoratif) |
| items[].poster | — | string | Yalnız `video`; verilmezse thumbnail'de tür rozetiyle yer tutucu gösterilir |
| items[].label | — | string | Sahne altyazısı + thumbnail erişilebilir adı + (varsa) `alt`/`title` fallback'i |

Thumbnail rozetleri (yalnız ilgili türde, `aria-hidden`): video `▶`,
tour360 `360°`, floorPlan `PLAN`. `image` rozet almaz.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassMediaGalleryItem[]` | — (zorunlu) | Boşsa component `null` render eder |
| variant | prop | `'stage'\|'tabbed'` | `'stage'` | Yerleşim eksenidir; birleşik variant yok |
| label | prop | `string` | `'İlan medya galerisi'` | Kök `role="region"` adı |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | `className` birleştirilir |

Controlled/Ref: yok — aktif sahne indeksi ve (tabbed'de) aktif tür tamamen iç
state'tir; dışa `value`/`onChange` açılmaz (kapsam dışı — Açık Kararlar).

## 5. Seçenek eksenleri

`material`/`tone` **yok** — bu component her zaman düz içerik yüzeyi
(`--lg-surface` + `--lg-hairline`); cam malzeme kullanılmaz (dalga 1 kontratı,
bkz. §9). `variant` yalnız yerleşimi değiştirir, veri modelini değiştirmez.

| Kural | Davranış |
|---|---|
| `items.length === 0` | `null` (hiçbir şey render edilmez) |
| `items.length === 1` (bir sahne bloğunda) | thumbnail şeridi ve sayaç gizlenir |
| `tabbed` + boş tür | o türün sekmesi hiç render edilmez ("yalnız dolu tipler görünür") |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| aktif sahne (stage) | iç `useState`, thumbnail tıklaması | — | `aria-current` (thumbnail) |
| aktif tür (tabbed) | iç `useState`, sekme tıklaması | — | `aria-selected` (tab), `role="tabpanel"` içeriği değişir |
| aktif sahne (tabbed, tür başına) | iç `useState` (`Record<type, index>`) — tür değiştirince korunur | — | `aria-current` |
| focus-visible | CSS | — | outline `--lg-accent` |

Katman sırası: veri (items boş/tek) → seçim (aktif tür/sahne) → etkileşim
(hover/focus).

## 7. Davranış

- Keyboard: thumbnail butonları native Tab akışındadır (hepsi odaklanabilir);
  ok tuşuyla thumbnail gezinmesi **zorunlu değildir** (spec kararı, thumbnail
  Tab akışında olması yeterli). Sekme çubuğu (`tabbed`) ise tam WAI-ARIA Tabs
  klavye desenini uygular: roving `tabindex` (aktif sekme `0`, diğerleri
  `-1`) + Sol/Sağ/Yukarı/Aşağı ok, `Home`/`End` ile gezinme ve odak transferi
  — `GlassFloorPlanViewer`'daki kat sekmesi deseniyle birebir aynı.
- Sahne değişimi anlıktır; `.frame` üzerinde yalnız `opacity` (`mediaFadeIn`,
  160ms) — `prefers-reduced-motion: reduce`'ta tamamen kapanır.
- `video`: `controls` + `preload="metadata"`; **autoplay yok**. `tour360`:
  `sandbox="allow-scripts"` ile kısıtlı (yalnız script çalıştırma izni;
  `allow-same-origin` **bilinçli olarak eklenmez** — `item.src` üçüncü
  taraf/kullanıcı girdisi olabileceğinden, `allow-scripts` + `allow-same-origin`
  birlikte sandbox izolasyonunun büyük kısmını etkisizleştiren bilinen bir
  anti-pattern olduğu için), `title` zorunlu.
- Responsive: thumbnail şeridi ve sekme çubuğu yatay `overflow-x: auto`
  (`scrollbar-width: none`); dokunmatikte thumbnail 72px'e büyür
  (`pointer: coarse`).
- Controlled/async/overlay: yok.

## 8. İçerik kuralları

- `label` kısa tutulmalı (thumbnail erişilebilir adına ve sahne altyazısına
  girer); uzun açıklama gerekiyorsa `alt`'a değil `label`'a yazın.
- `alt` boş bırakılırsa görsel dekoratif sayılır — başlık/label zaten bilgiyi
  taşıyorsa (ör. galeri dışında ayrı başlık varsa) bilinçli tercih edilebilir.
- `poster` verilmeyen video thumbnail'i metin yer tutucuyla ("Video") gösterilir
  — üretimde poster **önerilir**.
- Boş `items` component'i tamamen render etmez; çağıran boş durumu ayrı ele almalı.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| sahne/panel yüzeyi | background/border | `--lg-surface` / `--lg-hairline` |
| sahne köşesi | radius | `--lg-radius-card` |
| thumbnail köşesi | radius | `--lg-radius-media` |
| sayaç/tür rozeti | background/renk/radius | `--lg-scrim` / `--lg-on-scrim` / `--lg-radius-chip` |
| metin (altyazı/tab) | renk | `--lg-label` / `--lg-label-secondary` |
| aktif kenarlık/odak | renk | `--lg-accent` |
| tab yüksekliği | min-height | `--lg-control-md` |
| sayılar | — | `font-variant-numeric: tabular-nums` (sayaç, sekme sayacı) |

**Borç (raw, mevcut konvansiyon):** sahne oranı `aspect-ratio: 4/3` · thumbnail
boyutu `64px`/`72px` (coarse) · thumbnail kenarlık kalınlığı `2px` · tür rozeti
font-size `10px` (token ölçeğinde yok, caption'dan küçük) · boşluklar (`gap:
8/12px`, `padding` değerleri) raw.

## 10. Storybook kapsamı

Var: `Default` (stage), `Playground`, `Tabbed` (varyant), `EksikTurler` (dolu
olmayan tür sekmesi görünmez), `TekMedya` (tek öğede thumbnail/sayaç gizli),
`UzunIcerik` (14 öğe, dar container, uzun label), `Erisilebilirlik` (docs
açıklamalı). **Eksik:** Temalar (Kağıt/Grafit toolbar ile — token tüketimi
zaten tema-duyarlı, ayrı story eklenmedi), States (statik — hover/focus CSS'te,
control gerekmiyor), Responsive'in ayrı story olarak izole edilmesi
(`UzunIcerik` dar container ile kısmen kapsıyor).

## 11. Test kabul kriterleri

- [x] `region` adlandırması + ilk medya + sayaç (unit)
- [x] thumbnail tıklaması sahneyi değiştirir + `aria-current` (unit)
- [x] video: `controls` var, `autoplay` yok, `poster` doğru (unit)
- [x] tour360: `iframe` `sandbox` + zorunlu `title` (unit)
- [x] floorPlan/image `<img>` render (unit)
- [x] tabbed: yalnız dolu türler sekme olur (unit)
- [x] tabbed: sekme değişince panel/`aria-selected` güncellenir (unit)
- [x] tek öğede thumbnail/sayaç gizlenir (unit)
- [x] boş `items` → render yok (unit)
- [x] thumbnail tür rozetleri doğru (▶/360°/PLAN, image rozetsiz) (unit)
- [x] tabbed: roving `tabindex` + ok tuşu gezinmesi odak/seçim günceller (unit)
- [ ] thumbnail/sekme şeridi yatay kaydırma taşması (visual)
- [ ] `prefers-reduced-motion`'da sahne geçiş animasyonu kapanır (visual)

## 12. Do / Don't

- ✅ Karma medya türü olan ilanlarda `tabbed`, yalnız/ağırlıklı fotoğrafta
  `stage` kullan.
- ✅ `tour360` öğesine her zaman anlamlı `alt` veya `label` ver — iframe title
  fallback'i son çare ("360° sanal tur") jenerik kalır.
- ✅ Video için `poster` ver — thumbnail'de metin yer tutucu yerine gerçek kare
  görünür.
- ❌ `GlassTabs`'ı bu component içine gömmeye çalışma — tablist/panel yapısı
  kasıtlı olarak bağımsızdır (bkz. §2).
- ❌ Sahneye ok/gezinme butonu ekleme — spec kararı thumbnail'i yeterli sayar;
  ihtiyaç doğarsa ayrı bir eksen olarak eklenmeli (breaking değil, opsiyonel).
- ❌ `tour360` iframe'ine `allow-same-origin` ekleme — `allow-scripts` ile
  birlikte kullanıldığında sandbox izolasyonunu büyük ölçüde etkisizleştirir
  (bkz. §7).

**Bilinen kısıtlar:** aktif sahne/tür dışa controlled açılmıyor · video
thumbnail'i poster yoksa metin yer tutucu.

**Açık kararlar:** `activeIndex`/`onIndexChange` gibi controlled bir API'nin
gerekip gerekmediği · tür rozeti font-size'ının token ölçeğine
(`--lg-text-caption` altına yeni bir "micro" token) bağlanması.

**Changelog:** 2026-07-17 — İlk sürüm (dalga 1 kontratı: içerik katmanı tümüyle
düz, `material`/`tone` ekseni yok). 2026-07-17 — Review düzeltmesi: tabbed
sekme çubuğuna roving `tabindex` + ok tuşu/`Home`/`End` gezinmesi eklendi
(GlassFloorPlanViewer deseniyle tutarlı); `tour360` iframe sandbox'ından
`allow-same-origin` çıkarıldı (güvenlik); thumbnail tür rozeti testleri
eklendi; `label` prop'larının çakışan isimlendirmesi JSDoc'ta netleştirildi.
