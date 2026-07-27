---
name: GlassProgress
category: durum
status: hazır
lastReviewed: 2026-07-16
---

# GlassProgress Kuralları

## 1. Amaç

İşlem ilerlemesini gösteren durum göstergesi: yatay bar veya dairesel halka.
İçerik katmanı component'idir — bilinçli olarak cam DEĞİL: 4–8px'lik ince
yüzeyde cam malzemenin anlamı yok, hairline ray + accent dolgu yeter.

- **Kullan:** yükleme yüzdesi (fotoğraf upload), tamamlanma oranı (ilan
  profili), süresi bilinmeyen işlem (indeterminate).
- **Kullanma:** buton içi bekleme (→ `GlassButton loading`), sayfa geçiş
  spinner'ı (→ indeterminate circle olur ama küçük tut), oran karşılaştırma
  grafiği (→ chart, component değil).

| İlgili | Farkı |
|---|---|
| GlassButton `loading` | Aksiyona bağlı spinner; bağımsız durum göstergesi değil |
| GlassBadge | Ayrık durum etiketi; sürekli değer göstermez |

## 2. Semantik sözleşme

- Element: `<div role="progressbar">` + `aria-valuemin={0}`,
  `aria-valuemax={max}`, determinate'ta `aria-valuenow={clampedValue}`.
- Indeterminate'ta (`value` null/undefined) `aria-valuenow` VERİLMEZ
  (WAI-ARIA sözleşmesi) ve kök `data-indeterminate` taşır.
- Accessible name `label` prop'undan (`aria-label`). Görünür etiket yoksa
  `label` mutlaka verilmelidir.
- `showValue` metni `aria-hidden`'dır — değer zaten `aria-valuenow`'da,
  ekran okuyucuya iki kez okutulmaz.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| track/ray | ✅ | — | `--lg-hairline` zemin, capsule radius |
| fill/dolgu | ✅ | — | `--glass-tint` ← `--lg-accent` |
| value | — | `%N` metni | Yalnız `showValue` + determinate; tabular-nums |

Children kabul edilmez — tamamen prop güdümlü.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| value | prop | `number \| null` | `undefined` | null/undefined → indeterminate; [0, max]'a clamp edilir |
| max | prop | `number` | `100` | `aria-valuemax`; ≤0 verilirse yüzde 0 sayılır |
| variant | prop | `'bar'\|'circle'` | `'bar'` | Circle: SVG stroke-dasharray |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Bar yüksekliği 4/6/8px; circle çapı 28/40/56px |
| tint | prop | `string` | — | `--glass-tint` CSS var; verilmezse `--lg-accent` |
| label | prop | `string` | — | `aria-label`; görünür etiket yoksa zorunlu say |
| showValue | prop | `boolean` | `false` | % metni; indeterminate'ta yok sayılır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | `className`/`style` birleştirilir |

Event sözleşmesi: yok — tamamen statik/kontrollü görüntüleme.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=bar`, `size=md`, accent dolgu.

| Yasak / türetilen | Davranış |
|---|---|
| `showValue` + indeterminate | Metin render edilmez (bilinmeyen değer yazılamaz) |
| `value` aralık dışı | Sessizce [0, max]'a clamp — hata fırlatılmaz |
| kontrol yüksekliği token'ı | ❌ kullanılmaz — gösterge kontrol değildir, ince kalır |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| determinate | `value` sayı | — | Dolgu `scaleX`/dashoffset %'ye göre; transform transition |
| indeterminate | `value` yok/null | showValue | Bar: %40'lık kayan bant; circle: dönen çeyrek yay |
| disabled/hover/focus | — | — | YOK — etkileşimsiz component |

## 7. Davranış

- Değer değişimi: bar `transform: scaleX()` (transform-origin: left), circle
  `stroke-dashoffset` 0.3s ease-out ile akar (canlı yükleme yüzdesi yumuşak
  ilerler) — "animasyon yalnız transform/opacity/filter" kuralına uygun;
  indeterminate bant da `translateX` ile kayar. Not: `stroke-dashoffset` SVG
  geometri özniteliğidir, kuralın bilinçli ve yerleşik istisnasıdır.
- `prefers-reduced-motion`: transition kapanır (değer sıçrayarak güncellenir);
  indeterminate animasyon DURMAZ ama belirgin yavaşlar — "çalışıyor"
  bilgisinin kendisi harekettir, tamamen dondurulamaz.
- Responsive: bar her genişlikte %100 — genişliği çağıranın konteyneri
  belirler; breakpoint davranışı gerekmez. Circle sabit çaplıdır.
- Etkileşim yok: klavye/touch hedefi değildir.

## 8. İçerik

`label` kısa ve işlemi adlandırır ("Fotoğraflar yükleniyor"), yüzdeyi
içermez (yüzde `aria-valuenow`'dadır). `showValue` metni yuvarlanmış
tamsayı yüzdedir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| track | background | `--lg-hairline` |
| track | radius | `--lg-radius-capsule` |
| fill | background | `--glass-tint` ← `--lg-accent` |
| value | font-size | `--lg-text-footnote` (bar) / `--lg-text-caption` (circle) |
| value | color | `--lg-label-secondary` |
| root | gap | `--lg-space-2` |

**Borç (raw / mikro-geometri):** bar yükseklikleri component kökünde yerel
değişkende toplandı (`.root { --track-h-sm: 4px; --track-h-md: 6px;
--track-h-lg: 8px; }` — ince şerit kalınlığı için token yok; kontrol geometrisi
değil, control token bağlanmaz). Circle çapları (28/40/56px) tsx'te SVG
geometrisidir (viewBox ölçüsü) — raw kalır. Süre/easing (`0.3s ease-out`,
indeterminate `1.2s`/`1s` döngüleri) raw — süre token'ı yok. Bar dolgusu %100
genişlik + `transform: scaleX(oran)` ile sürülür (paint-only), bu desen korunur.

## 10. Storybook kapsamı

Var: Default, Indeterminate, ShowValue, Sizes, Circle, Tinted, Animated
(kontrollü), MobileFullWidth (viewport: mobile1). **Eksik:**
reduced-motion görseli (emülasyon ister).

## 11. Test kabul kriterleri

- [x] progressbar rolü + valuemin/valuemax/valuenow
- [x] indeterminate'ta valuenow yok + data-indeterminate
- [x] max'a göre yüzde + clamp
- [x] circle dashoffset doğru (%50 → çevre/2)
- [x] showValue determinate'ta var, indeterminate'ta yok
- [x] tint CSS var'a yazılır
- [ ] indeterminate animasyonu reduced-motion'da yavaşlar (visual)

## 12. Do / Don't

- ✅ Görünür etiket yoksa `label` ver — adsız progressbar bırakma.
- ✅ Süresi bilinmeyen işlemde `value` hiç verme (sahte yüzde yürütme).
- ❌ `tint`'e tema rengi verme; yalnız semantik durum vurgusu
  (`--lg-success/warning/danger`).
- ❌ Yüzdeyi `label` metnine yazma — çift okunur.
- ❌ Skeleton/placeholder yerine kullanma.

**Açık kararlar:** buffer/ikincil dolgu (video önbelleği gibi) ihtiyacı ·
circle içinde ikon (✓ tamamlandı) desteği.

## Changelog

- 2026-07-16: İlk sürüm — bar+circle varyantları, indeterminate,
  showValue, clamp ve reduced-motion davranışı.
