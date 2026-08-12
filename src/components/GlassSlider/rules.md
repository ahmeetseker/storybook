---
name: GlassSlider
category: form
status: hazır
lastReviewed: 2026-08-03
---

# GlassSlider Kuralları

## 1. Amaç

Aralıktan tek değer seçtiren sürgü: native `<input type="range">` görünmez
tüm alanı kaplar (sürükleme/odak/rol bedava), üstünde custom ray + accent
dolgu + beyaz thumb çizilir.

- **Kullan:** fiyat/kilometre/yıl gibi sayısal filtre üst sınırları,
  yüzde ayarları.
- **Kullanma:** kesin sayı girişi (→ `GlassStepper`), aralık (iki uçlu)
  seçimi (→ `GlassPriceRange`) — burada range varyantı yok.

| İlgili | Farkı |
|---|---|
| GlassStepper | Ayrık, kesin değer; ± butonlarıyla |
| GlassPriceRange | İki kol + dağılım histogramı + değer pilleri |

## 2. Semantik sözleşme

- Element: kök `<span>` + native `<input type="range">` (opacity 0, tam alan).
- Rol/değerler: native slider — `aria-valuenow/min/max` tarayıcıdan;
  `formatValue` verilirse `aria-valuetext` eklenir.
- Accessible name: `label` prop → `aria-label`. Görünen ayrı label yoksa zorunlu.
- DOM değişmezleri: input ilk çocuktur; ray/thumb `aria-hidden` + `pointer-events: none`.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| bubble | — | `formatValue(value)` | Yalnız `showValue`; thumb üstünde flat chip |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| min / max / step | prop | `number` | `0 / 100 / 1` | Aralık ve adım |
| value | prop | `number` | — | Controlled değer |
| defaultValue | prop | `number` | `min` | Uncontrolled başlangıç |
| onChange | prop | `(value: number) => void` | — | Değer değişince (kıskaçlanmış sayı) |
| label | prop | `string` | — | `aria-label` |
| showValue | prop | `boolean` | `false` | Thumb üstü değer baloncuğu |
| formatValue | prop | `(v: number) => string` | `String` | Baloncuk + `aria-valuetext` |
| disabled | prop | `boolean` | `false` | Native attribute |
| ...rest | — | `InputHTMLAttributes` | — | `name`, `id` vb. input'a gider |

## 5. Seçenek eksenleri

Varsayılan: 0–100, adım 1, baloncuksuz.

| Yasak / türetilen | Davranış |
|---|---|
| `value` aralık dışı | Render'da min/max'a kıskaçlanır |
| `max <= min` | pct 0 kabul edilir (bölme koruması) |
| size prop'u | ❌ yok — tek ölçü; coarse pointer'da otomatik büyür |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| drag/change | native input | — | Dolgu ve thumb `--pct` ile anlık izler |
| focus-visible | CSS (`:focus-visible ~ .thumb`) | — | 2px `--lg-accent` halka thumb'da |
| disabled | native | tümü | opacity .45, cursor default |

## 7. Davranış

- Keyboard: ←/↓ −step, →/↑ +step, Home/End uçlar, PageUp/Down ±10·step.
  Manuel yönetilir (`preventDefault`) — native davranışın kopyası ama her
  ortamda deterministik ve step'e sadık.
- Thumb konumu native range formülüyle: `left: pct% + (50−pct)·0.01·thumb` —
  uçlarda raydan taşmaz.
- Touch (`pointer: coarse`): thumb 28px, kök 44px; ray 8px.
- Motion: sürükleme doğrudan manipülasyondur — thumb'a transition koyulmaz
  (gecikme hissi verir); reduced-motion etkilenmez.

## 8. İçerik

Baloncuk metnini kısa tut ("1.250.000 TL", "%65"); uzun format ray genişliğini
aşarsa taşar. Birimi `formatValue` içinde ver, ayrı etiket koyma.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| dolgu | background | `--lg-accent` |
| ray | border/iç gölge | `--lg-hairline`, `--lg-label` (color-mix %10) |
| ray | radius | `--lg-radius-capsule` |
| bubble | background/border/font | `--lg-surface` / `--lg-hairline` / `--lg-text-caption` |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** kök/ray/baloncuk mikro-geometrisi component
kökünde yerel değişkene toplandı (`.root { --slider-height: 28px;
--track-height: 6px; --bubble-gap: 6px; --bubble-pad-y: 2px; }` — coarse'ta
`--track-height: 8px`); baloncuk gölgesi `--lg-shadow-sm`'e, baloncuk yatay
padding'i `--lg-space-2`'ye bağlandı; coarse'ta `--slider-height` doğrudan
`--lg-control-hit`e (44px) eşitlenir — dokunmatikte görünür alanın kendisi
hedeftir. Bilinçli bırakılanlar: thumb beyazı (`#fff`) ve
thumb gölgeleri (`0 1px 4px rgba(0,0,0,.3), 0 0 1px rgba(0,0,0,.2)`) raw —
kontrast gereği, hiçbir gölge token deseniyle birebir değil; ray iç gölgesi
`inset 0 1px 1px rgba(0,0,0,.06)` de token dışı (inset desen yok) — raw; ray
cam yerine hairline kanal — filtre maliyeti olmadan cam hissi (Açık Kararlar).

**Dokunma hedefi:** görünür alan imleçli cihazda 28px kalır (ray + thumb
oranı bu yükseklikte doğru duruyor), ama sürükleme hedefi öyle değil: kökü
kaplayan görünmez native `<input>` `inset-block: min(0px, calc((var(
--slider-height) - var(--lg-control-hit)) / 2))` ile dikeyde 44px'e uzar.
Kökte `overflow: hidden` olmadığı için bu taşma gerçekten tıklanır/sürüklenir
(AAA 2.5.5). Dokunmatikte `--slider-height` zaten 44px olduğundan genişletme
0'a düşer.

## 10. Storybook kapsamı

Var: Default, PriceWithBubble, Kilometre, Disabled, Controlled,
MobilePriceFilter (viewport: mobile1).

## 11. Test kabul kriterleri

- [x] slider rolü + aria-label + min/max/value
- [x] change → onChange(number)
- [x] klavye: ok/Home/End
- [x] kıskaçlama (uçta onChange çağrılmaz)
- [x] disabled
- [x] formatValue → aria-valuetext + baloncuk
- [ ] sürükleme (gerçek pointer; jsdom dışı)

## 12. Do / Don't

- ✅ Kaba aralıklarda büyük `step` ver (fiyat: 50.000) — sürgü hassas sayı aracı değildir.
- ✅ Kesin değer de gerekiyorsa yanına `GlassStepper`/sayı girişi koy.
- ❌ İki uçlu aralık için iki slider üst üste bindirme.
- ❌ `label`'sız kullanma (görünen label'ı `aria-labelledby` ile bağlamıyorsan).

**Açık kararlar:** çift thumb'lı range varyantı ayrı component olarak
değerlendirilecek · ray için GlassSurface (gerçek cam) denemesi — içerik
sarmalayıcı boyutlandırması çözülürse.

## Changelog

- 2026-07-16: İlk sürüm — görünmez native range, `--pct` CSS var konumlama,
  değer baloncuğu, coarse pointer 28px thumb.
- 2026-08-03: Yeni kontrol ölçeği. Coarse kök yüksekliği `--lg-control-md`
  yerine `--slider-height: var(--lg-control-hit)` (değer aynı 44px, kontrol
  ölçeği küçülse de sabit). İmleçli cihazda görünür yükseklik 28px'te kaldı
  ama native input `inset-block` ile dikeyde 44px hedefe genişletildi
  (görsel değişiklik yok, sürükleme alanı 28→44px).
- 2026-08-12: Sıvı basış (Apple liquid glass davranışı). Sürükleme boyunca
  thumb cama dönüp 1.25× büyür (`data-liquid`: yarı saydam yüzey + backdrop
  blur + specular rim), bırakınca beyaza oturur. Değer baloncuğu ters ölçekle
  telafi edilir (büyümez). Native range pointer'ı örtük yakaladığı için
  pointerup her durumda input'a düşer — pencere dinleyicisi yok.
  `prefers-reduced-motion`'da büyüme yok; `prefers-reduced-transparency`'de
  cam durum opak kalır.
- 2026-08-12 (rev 2): Takılma düzeltmesi. background/box-shadow/backdrop-filter
  transition'ı paint aşamasında donmaya yol açıyordu; thumb artık iki sabit
  katman (`::before` beyaz disk / `::after` cam disk) ve geçiş yalnız
  transform (büyüme) + opacity crossfade (compositor).
