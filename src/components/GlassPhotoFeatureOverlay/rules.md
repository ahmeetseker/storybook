---
name: GlassPhotoFeatureOverlay
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassPhotoFeatureOverlay Kuralları

## 1. Amaç

Bir ilan fotoğrafının üzerine yapay zekânın tespit ettiği özellikleri (ör.
"Ankastre mutfak", "Mermer tezgah") nokta işaretleri + tıklanınca açılan
etiket balonlarıyla gösterir. AI-first component: içerik AI tarafından
üretildiği için "✦ AI" rozeti görselin köşesinde zorunlu ve koşulsuz görünür.
Koordinat clamp/finite-guard deseni `GlassMap`'ten bilinçli olarak taşınır
(aynı sözleşme, farklı görsel bağlam — harita değil fotoğraf).

- **Kullan:** ilan detay sayfasında galeri fotoğraflarından birinin altında/
  yanında "AI bu fotoğrafta neler tespit etti" özeti; tekil bir fotoğrafın AI
  destekli özellik dökümü.
- **Kullanma:** çok noktalı gerçek coğrafi konum (→ `GlassMap`), kat planı
  üzerinde oda etiketleri (→ `GlassFloorPlanViewer`), galerinin kendisi
  (→ `GlassGallery`, bu component tek bir görseli sarmalar, çoklu görsel
  gezinmeyi üstlenmez).

| İlgili | Farkı |
|---|---|
| GlassMap | Coğrafi pin + popup; burada koordinatlar bir FOTOĞRAF üzerinde normalize, AI rozeti/tekil toggle sözleşmesi yok |
| GlassFloorPlanViewer | Kat planı + zoom/pan + hotspot; burada zoom/pan yok, tek amaç AI tespitli özellik etiketleme |
| GlassMatchScore | Aynı AI-first rozet deseni (kopya CSS); burada skor değil konumsal etiket seti taşınır |

## 2. Semantik sözleşme

- Kök: `<div>` (flat kart — `--lg-surface`/`--lg-hairline`/`--lg-radius-card`).
- Görsel sahne: `<div role="group" aria-label="...">` — sayfada birden çok
  örnek varsa çağıran `aria-label` ile ayırt eder (varsayılan: "Görseldeki
  yapay zekâ tespitli özellikler").
- Görsel: `<img>` gerçek `alt` taşır (dekoratif değil — fotoğrafın kendisi
  bilgi taşıyor, `image.alt` zorunlu prop alanı).
- Her nokta: gerçek `<button aria-label={feature.label} aria-expanded>`.
  Accessible name DOĞRUDAN `feature.label` — ayrı bir `aria-labelledby`
  zinciri kurulmaz (spec gereği: "accessible name = label").
- Balon açıkken: görünür metin butonun adıyla birebir aynı olduğundan
  `aria-hidden="true"` (AT'ye iki kez okutulmaz — `GlassMatchScore.ringValue`
  ile aynı karar). Güven yüzdesi (varsa) ayrı bir `<span id=...>` ile
  `aria-describedby` üzerinden butona bağlanır — bu bilgi başka hiçbir yerde
  yok, gizlenmez.
- Ham veri `feature.id` DOM id'sine KONMAZ (boşluk/özel karakter riski +
  ARIA IDREF kırılması); balon açıklama id'si `useId()` + index'ten türetilir
  (`${baseId}-confidence-${index}`).
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — görünür "✦ AI" metni tek
  başına yeterince açıklayıcı değil.
- "Etiketleri göster" butonu: gerçek `<button aria-pressed>`, statik metin
  (durum değişince metin DEĞİŞMEZ, yalnız `aria-pressed` + görsel ton
  değişir — bir "mute" butonuyla aynı desen).
- Portal yok, ref forwarding yok (statik/kontrollü sunum, diğer içerik
  katmanı component'leriyle tutarlı).
- `children` prop tipinden AÇIKÇA omit edilir (`Omit<HTMLAttributes<HTMLDivElement>,
  'title' | 'children'>`) — component tamamen prop güdümlü sabit bir anatomi
  render eder (sahne/rozet/araç çubuğu); tip yolu tercih edilir çünkü kök
  `<div>` zaten kendi JSX çocuklarını render eder ve dışarıdan sızan bir
  `children` prop'u (tip atlanırsa) sessizce hiçbir etki YAPMAZ — TS bunu
  derleme zamanında engelleyerek yanıltıcı kullanım örneklerinin önüne geçer.
- AI rozeti (`.badgeCorner`) `pointer-events: none` taşır — sağ üst köşeye
  yakın (`x>0.82`, `y<0.22`) bir nokta rozetle görsel olarak çakışsa bile
  tıklama/dokunma olayını rozet ASLA yakalamaz, altındaki nokta her zaman
  erişilebilir kalır.
- Nokta odak halkası STANDART desen: `outline: 2px solid var(--lg-accent)` +
  `outline-offset: 2px`, yalnız `:focus-visible`. Değişken fotoğraf zemininde
  tek renkli halka 3:1 kontrastı garanti edemediği için outline'ın ALTINA
  `box-shadow: 0 0 0 2px var(--lg-surface)` kontrast katmanı eklenir — outline
  korunur, katman yalnız zeminle ayrışmayı garanti eder.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| görsel | ✅ | `image.src`/`image.alt` | Gerçek `alt`, dekoratif değil |
| AI rozeti | ✅ (her zaman) | "✦ AI" | Görselin köşesi, koşulsuz — kontrat sabit CSS'i |
| nokta işaretleri | ✅ (features varsa) | accent nokta, pulse YOK | Gerçek buton, `aria-expanded` |
| etiket balonu | — (yalnız açıkken) | `feature.label` + confidence eki | Flat chip, kenara göre yön/hiza döner |
| araç çubuğu | ✅ | "Etiketleri göster" + özet sayı | Global toggle + salt bilgi metni |

Children kabul edilmez — tamamen prop güdümlü.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| image | prop | `{ src: string; alt: string }` | — (zorunlu) | — | Gerçek `alt` bekler |
| features | prop | `GlassPhotoFeatureOverlayFeature[]` | — (zorunlu) | — | `{ id, label, x, y, confidence? }` |
| showLabels | prop | `boolean` | — | ✅ | Verilirse component kontrollü; iç state kullanılmaz |
| defaultShowLabels | prop | `boolean` | `false` | — | Yalnız uncontrolled başlangıç |
| onShowLabelsChange | prop | `(value: boolean) => void` | — | — | Global togglea her tıklamada (yeni değerle) çağrılır |
| aria-label | prop | `string` | `'Görseldeki yapay zekâ tespitli özellikler'` | — | Görsel sahnenin `role="group"` adı |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title` hariç) | — | — | `className`/`style` birleştirilir |

`GlassPhotoFeatureOverlayFeature`: `id: string`, `label: string`, `x: number`
(0-1), `y: number` (0-1), `confidence?: number` (0-100).

Ref hedefi yok. Tekil nokta açık/kapalı durumu component'in KENDİ dahili
state'idir — dışarı prop olarak açılmaz (yalnız `showLabels` controlled'dır,
her noktanın kendi override'ı değil).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `defaultShowLabels=false` (yalnız noktalar).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone`/`variant`/`thickness`/`prominent` | N/A — spec'te istenmedi, cam olmayan component |
| `size` | N/A — nokta/balon ölçüsü sabit (§9 borç) |

| Yasak / türetilen | Davranış |
|---|---|
| `x`/`y` sonlu değil (`NaN`/`Infinity`) | Nokta hiç render EDİLMEZ (harita dışında etkileşimli öğe üretilmez) |
| `x`/`y` sonlu ama [0,1] dışı | [0,1]'e KENETLENİR, render edilir (reddedilmez — GlassMap.clampUnit ile aynı sözleşme) |
| `confidence` sonlu değil | Balon eki hiç render edilmez (rozet/nokta yine görünür) |
| `features=[]` | Görsel + AI rozeti + araç çubuğu render edilir, hiç nokta yok, "0 özellik tespit edildi" |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| global etiket görünürlüğü | `showLabels` (controlled) → yoksa dahili `innerShowLabels` (`defaultShowLabels` başlangıçlı) | — | `aria-pressed` (toggle butonu) |
| tekil sapma kümesi | dahili `overriddenIds: Set<string>` — bir noktanın global varsayılandan BAĞIMSIZ açık/kapalı olduğunu işaretler | — | `aria-expanded` (o noktanın butonu) |
| efektif nokta görünürlüğü | `overriddenIds.has(id) ? !global : global` | — | `aria-expanded` |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

**İçerik imzası (sapma sıfırlama):** `JSON.stringify([effectiveShowLabels,
features.map(f => f.id)])` bir önceki render'ın imzasıyla (ref) karşılaştırılır;
farklıysa `overriddenIds` render sırasında (ekstra effect turu olmadan)
boşaltılır. Yani: (a) global toggle'a basmak TÜM tekil sapmaları temizler —
"tümünü göster/gizle" niyeti temiz bir global duruma dönmektir; (b)
`features` dizisinin kimliği (id listesi) GERÇEKTEN değişirse (farklı bir
fotoğrafa geçildi) eski sapmalar yeni veri setine taşınmaz.

Katman sırası: koordinat guard (`x`/`y` sonlu değilse nokta hiç yok) → global
`showLabels`/`overriddenIds` (efektif görünürlük) → render.

## 7. Davranış

- Nokta tıklaması: `overriddenIds` içindeki üyeliği toggle eder (ekleme/
  çıkarma) — global durumu HİÇ değiştirmez, yalnız o noktanın efektif
  görünürlüğünü globalin tersine çevirir/geri döndürür.
- "Etiketleri göster" tıklaması: `showLabels` controlled değilse dahili state
  güncellenir; her durumda `onShowLabelsChange(next)` çağrılır. Bu tıklama
  aynı render turunda tüm `overriddenIds`'i sıfırlar (içerik imzası, §6).
- Nokta üstünde `Escape`: yalnız o düğmenin kendi `onKeyDown`'ında işlenir
  (`e.stopPropagation()` ile) — document-genelinde dinleyici YOK, kapsayıcı-
  scoped. Balon açıksa kapatır (tekil toggle geri alınır); kapalıysa hiçbir
  şey yapmaz.
- Balon yönü/hizası pin konumuna göre hesaplanır (`balloonVertical`/
  `balloonAlign`, `GlassMap.popupVertical`/`popupAlign` ile aynı eşikler):
  üst kenara (`y<0.22`) yakın noktalarda balon aşağı açılır; sol/sağ kenara
  (`x<0.18`/`x>0.82`) yakın noktalarda hizası kenara göre kayar.
  `.imageClip` yalnız görseli kırpar, kök `overflow:hidden` taşımaz — balon
  kenara taştığında görünmez olmaz (GlassMap ile aynı karar).
- Nokta hover'ı (`hover:hover`) yalnız kapalıyken hafif büyür; açıkken zaten
  büyümüş durur (`aria-expanded='true'` seçicisi hover'ı ezmez, aynı görsel
  büyüklükte kalır).
- Odak taşıma yok — component hiçbir zaman kendiliğinden odak almaz/taşımaz;
  noktalar ve toggle doğal Tab sırasında durur (roving tabindex YOK — her
  nokta bağımsız bir toggle, tek seçimli bir grup değil, `GlassMatchScore`
  geri bildirim butonlarıyla aynı karar).
- Responsive: kart konteynerin genişliğine uyar; sahne `aspect-ratio: 4/3`
  sabit oranda kalır. Dokunmatik: nokta butonları ve "Etiketleri göster"
  `pointer: coarse`'ta 44px hedefe büyür.
- Görsel `object-fit: contain` ile render edilir (`cover` DEĞİL) — `feature.x`/
  `feature.y` koordinatları görselin KENDİSİNE göre normalize edildiğinden,
  `cover` kırpması koordinat/nokta eşleşmesini kaydırır (görselin kırpılan
  kısmına düşen bir nokta yanlış yerde görünür). `contain` ile görsel HİÇ
  kırpılmaz; koordinatlar güvenilir kalır. **Oran notu:** `image.src` fotoğrafı
  sahnenin `4/3` oranına yakın verilmelidir — oran ne kadar yakınsa nokta
  konumları o kadar isabetli görünür. Oran uyuşmazsa `contain` üstte/altta
  veya yanlarda boşluk (letterbox, sahne zemin rengiyle dolar) bırakır; bu
  boşluk alanına düşen normalize koordinatlar görselin dışında kalır (nokta
  görsel kenarına yakın ama üstünde değilmiş gibi görünebilir) — bu, `cover`'ın
  sessiz kırpma kaymasından tercih edilen, GÖRÜNÜR ve öngörülebilir bir
  ödünleşimdir.

## 8. İçerik kuralları

- `feature.label` kısa tutulmalı (balon `max-width: 200px`, uzun etiketler
  `overflow-wrap: anywhere` ile sarar — bkz. UzunIcerik story).
- `image.alt` gerçek betimleyici metin olmalı (dekoratif değil) — fotoğraf
  kendisi bilgi taşıyor, boş `alt=""` YASAK.
- Araç çubuğundaki özet metin ("N özellik tespit edildi") `features.length`'
  ten otomatik türetilir, çağıran tarafından özelleştirilemez.
- "✦ AI" rozeti metni sabit — kontrat: tüm AI component'lerinde birebir aynı
  görünmeli.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | — |
| sahne zemini | background | `color-mix(... var(--lg-label) 4% ... var(--lg-bg))` | — |
| sahne radius | border-radius | `--lg-radius-media` | — |
| nokta | background/border | `var(--lg-accent)` / `var(--lg-surface)` (halka) | `aria-expanded=true` → `scale(1.2)` (transform, pulse YOK) |
| nokta odak halkası | outline + kontrast katmanı | `outline: 2px solid var(--lg-accent)` (standart) + altında `box-shadow: 0 0 0 2px var(--lg-surface)` | yalnız `:focus-visible` |
| balon zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-chip` | — |
| balon güven eki | color | `color-mix(... var(--lg-accent) 75% ... var(--lg-label))` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassMatchScore.module.css`'teki `.aiBadge` ile birebir aynı (ek gölge YOK — `.badgeCorner` sarmalayıcısı da diğer AI component'leriyle tutarlı olması için gölgesiz) |
| toggle butonu | border/background/radius | `--lg-hairline`/`--lg-surface`/`--lg-radius-capsule` | `aria-pressed=true` → `--lg-accent` tint |
| özet metin | color | `--lg-label-secondary` | — |

**Borç (mikro-geometri, `.root` üzerinde yerel değişken):**
- `--gpfo-dot-hit: 28px` — nokta buton hedefi (coarse'ta `--lg-control-md`
  ile 44px'e yükselir — birebir; toggle butonu coarse minimumu da aynı token).
- `--gpfo-dot-size: 12px` / `--gpfo-dot-ring: 2px` — görünür nokta + halkası.
- `--gpfo-focus-ring: 2px` — odak halkası altındaki `--lg-surface` kontrast
  katmanının kalınlığı (box-shadow spread'i).
- `--gpfo-dot-shadow` — noktanın zeminden ayrışma gölgesi (`0 1px 3px`
  label-mix; `--lg-shadow-xs`'ten belirgin koyu, token karşılığı yok).
- `--gpfo-badge-padding-block: 3px` — AI rozeti dikey dolgusu (kontrat sabiti).
- `--gpfo-balloon-max-width: 200px` — balon genişlik sınırı.

**Borç (raw, değişkene alınmayan):** sahne `aspect-ratio: 4/3` (fotoğraf
oranı, token yok); AI rozeti tipografisi artık token'lı
(`--lg-text-badge`/700 — kontrat sabiti). Balon gölgesi `--lg-shadow-sm`
token'ına taşındı. Görsel `object-fit: contain` (`cover` DEĞİL) — bkz. §7
oran notu.

## 10. Storybook kapsamı

Var: Default, Playground, Durumlar (`defaultShowLabels` false/true yan yana),
Controlled, UzunIcerik (uzun etiket + NaN/kenetlenen koordinat), Responsive
(mobile1 + dokunmatik 44px), Erişilebilirlik (docs description'lı).

`Variants`/`Sizes` ayrı story olarak yok: `material`/`variant`/
`size` ekseni tanımlı değil (bkz. §5, `GlassMatchScore`/`GlassMap` ile aynı
karar).

## 11. Test kabul kriterleri

- [x] görsel gerçek `alt` ile render edilir; sahne `role="group"`; AI rozeti her zaman görünür
- [x] her nokta gerçek buton, accessible name `feature.label`
- [x] `x`/`y` sonlu değilse (`NaN`/`Infinity`) nokta hiç render edilmez
- [x] `x`/`y` sonlu ama aralık dışıysa [0,1]'e kenetlenir, REDDEDİLMEZ
- [x] varsayılan: etiketler kapalı, `aria-expanded=false`, balon metni yok
- [x] "Etiketleri göster" tüm noktaların `aria-expanded`'ını + kendi `aria-pressed`'ini değiştirir
- [x] tekil nokta tıklaması yalnız o noktayı global varsayılandan bağımsız açar/kapatır
- [x] `confidence` geçerliyse balonda "%N" + `aria-describedby` ile bağlı; yoksa hiç eklenmez
- [x] controlled `showLabels`: dahili state değişmez, yalnız `onShowLabelsChange` çağrılır
- [x] regresyon: global toggle değişince tekil sapmalar sıfırlanır
- [x] odaklı noktada `Escape` açık balonu kapatır (kapsayıcı-scoped)
- [x] özellik sayısı özet metni `features.length`'ten doğru türetilir
- [x] regresyon: `children` tip düzeyinde omit edilir — kaçak geçilse (`as any`)
  bile render edilmez, component sabit anatomisini korur
- [ ] reduced-motion'da nokta/toggle geçişlerinin kapanması (visual)
- [ ] `object-fit: contain` + standart outline halka (altındaki kontrast
  katmanıyla) + rozet `pointer-events:
  none` (visual — CSS module gerçek stilleri jsdom'da uygulanmadığından bu
  üçü yalnız görsel/manuel QA ile doğrulanır, bkz. Storybook Erişilebilirlik
  story'si)

## 12. Do / Don't

- ✅ `features`'ı yalnız AI'nin GERÇEKTEN tespit ettiği noktalarla doldur —
  AI çıktısı asla otomatik eylem tetiklemez, yalnız bilgi sunar.
- ✅ AI rozetini her zaman göster — koşulsuz, `loading`/boş durum yok
  (component zaten senkron/statik veriyle çalışır).
- ✅ Koordinatları [0,1] normalize ver; kenetleme/guard component'in işi.
- ❌ `feature.id`'yi DOM id'sine koyma — yalnız state/callback anahtarı.
- ❌ Noktaları `radiogroup`/`tablist` gibi tek-seçimli bir ARIA rolüne sarma
  — her nokta bağımsız bir toggle, roving tabindex gerekmez.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.
- ❌ AI rozetine `pointer-events` geri verme (`auto`'ya çevirme) — köşedeki
  bir nokta rozetle çakışırsa tıklanamaz hale gelir.
- ❌ `image.src`'i sahnenin `4/3` oranından ÇOK uzak vermeme — `contain`
  kırpmaz ama uzak oranlarda geniş letterbox alanı nokta yoğunluğunu
  görsel olarak seyreltir (bkz. §7 oran notu).

**Açık kararlar:** `feature.label` için maksimum karakter sınırı ·
noktaların üst üste binmesi durumunda (çok yakın `x`/`y`) çakışma önleme
(cluster) ihtiyacı · balonun aynı anda kaç tanesinin açık kalabileceğine dair
bir üst sınır (şu an sınırsız — kullanıcı isterse tüm noktaları tek tek
açabilir).

## Changelog

- 2026-07-24: Uyum düzeltmesi — nokta odak halkası çift katmanlı
  `box-shadow`'dan STANDART desene döndü: `outline: 2px solid var(--lg-accent)`
  + `outline-offset: 2px`, fotoğraf kontrastı için `--lg-surface` katmanı
  outline'ın ALTINDA `box-shadow` olarak korunuyor (§2 istisna notu
  kaldırıldı). AI rozeti `--lg-text-badge` token'ına, balon gölgesi
  `--lg-shadow-sm` token'ına geçti; `border-radius: 50%` →
  `--lg-radius-capsule`; font-weight 650→600, 750→700; balon gap/padding/
  offset `--lg-space-1/2`; nokta/balon mikro-geometrisi `.root` üzerinde
  yerel değişkenlere toplandı (§9).
- 2026-07-17: İlk sürüm — görsel üstü AI özellik noktaları, global
  "Etiketleri göster" toggle'ı + tekil nokta bazlı bağımsız açma/kapama,
  confidence eki, zorunlu "✦ AI" rozeti, kenar-duyarlı balon yönü/hizası.
- 2026-07-17: Codex ekip incelemesi düzeltmeleri — `children` prop tipinden
  omit edildi (`Omit<..., 'title' | 'children'>`, render yolu değil tip
  yolu); görsel `object-fit: cover` → `contain` (kırpma kaynaklı hotspot
  kayması giderildi, §7 oran notu eklendi); AI rozeti `.badgeCorner`'a
  `pointer-events: none` eklendi (köşedeki nokta artık her koşulda
  tıklanabilir) ve yerel `drop-shadow` kaldırıldı (diğer AI rozetleriyle
  görsel tutarlılık); nokta odak halkası tek renkli `outline`'dan çift
  katmanlı `box-shadow`'a (`--lg-surface` iç + `--lg-accent` dış) geçti
  (değişken fotoğraf zemininde 3:1 kontrast garantisi). İçerik imzası
  (`JSON.stringify` tuple, §6) incelemede zaten sözleşmeye uygun bulundu,
  değişiklik gerekmedi.
