---
name: GlassDatePicker
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassDatePicker Kuralları

## 1. Amaç

Takvim popover'lı tarih seçici: input görünümlü cam trigger + Pazartesi
başlangıçlı ay grid'i. Tek tarih seçer; aralık seçimi kapsam dışıdır.

- **Kullan:** randevu/ekspertiz tarihi, ilan yayın tarihi, filtre "şu tarihten sonra".
- **Kullanma:** tarih aralığı (→ Açık Kararlar), saat seçimi, serbest metin
  tarih girişi (→ maskeli input ihtiyacı ayrı component).

| İlgili | Farkı |
|---|---|
| GlassTabs | Kapalı küme seçim; takvim değil |
| GlassButton | Aksiyon; değer tutmaz |

## 2. Semantik sözleşme

- Trigger: `<button role="combobox">` + `aria-expanded` + `aria-haspopup="grid"`
  + açıkken `aria-controls` panel id'si.
- Panel: root'a bağlı `position: absolute` (portal YOK — brief overlay kalıbı);
  takvim `role="grid"`, haftalar `role="row"`, hafta başlıkları
  `role="columnheader"`, günler `<button role="gridcell">`.
- Seçili gün `aria-selected="true"`, bugün `aria-current="date"`.
- DOM değişmezleri: (1) trigger gerçek `<button>` kalır, (2) gün hücreleri
  focusable button'dır (roving tabindex).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger value | ✅ | seçili tarih veya placeholder | `Intl.DateTimeFormat(locale, { dateStyle: 'medium' })`; tek satır, taşarsa ellipsis |
| header | ✅ | önceki/sonraki ay + ay başlığı | Nav butonları `aria-label`'lı |
| grid | ✅ | 7 sütun × 6 sabit hafta | Sabit 6 hafta → panel yüksekliği zıplamaz |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| value | prop | `Date \| null` | — | Controlled değer |
| defaultValue | prop | `Date \| null` | — | Uncontrolled başlangıç |
| onChange | event | `(date: Date \| null) => void` | — | Gün seçiminde gün başına yuvarlanmış Date ile çağrılır |
| min / max | prop | `Date` | — | Dışındaki günler disabled; klavye gezinmesi aralığa kıstırılır |
| placeholder | prop | `string` | `'Tarih seç'` | Değer yokken gösterilir |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Trigger yüksekliği `--lg-control-*` |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| invalid | prop | `boolean` | `false` | `aria-invalid` + danger halka |
| disabled | prop | `boolean` | `false` | Trigger disabled; panel açılmaz |
| locale | prop | `string` | `'tr-TR'` | Intl ile ay/gün adları; hafta HER locale'de Pazartesi başlar |
| ...rest | — | `HTMLAttributes<div>` | — | Root wrapper'a (`onChange`/`defaultValue` hariç) |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, `locale=tr-TR`, sınırsız aralık.

| Yasak / türetilen | Davranış |
|---|---|
| `value` verilince | iç state devre dışı; temizleme çağıranın işi (`null` geçer) |
| `min > max` | tanımsız — çağıran garanti eder |
| onChange'den `null` | component üretmez; yalnız controlled temizleme senaryosu için tipte |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| open | iç state | — | Panel scale/opacity ile açılır (reduced-motion: yalnız opacity) |
| selected | value/inner | — | Accent dolgu + contrast metin |
| today | sistem saati | — | Hairline iç halka + bold |
| outside-month | görünen ay | — | Secondary renk |
| out-of-range | min/max | hover, seçim | opacity .3 + disabled |
| invalid | prop | — | Danger iç halka (`aria-invalid`) |
| disabled | prop | open | opacity .45 |

## 7. Davranış

- Açılış: seçili gün (yoksa bugün, min/max'a kıstırılmış) odaklanır; görünen ay ona ayarlanır.
- Klavye: ←→ ±1 gün, ↑↓ ±7 gün, PageUp/PageDown ±1 ay (gün korunur, kısa ayda
  kıstırılır), Home/End hafta başı/sonu, Enter/Space seçer, Escape kapatır ve
  focus trigger'a döner. Hedef gün min/max dışına düşerse sınıra kıstırılır.
- Dış tıklama kapatır (`pointerdown` document listener); focus çalınmaz.
- Seçim sonrası panel kapanır, focus trigger'a döner.
- `prefers-reduced-motion`: panel yalnız opacity ile açılır; hücre geçişleri kapalı.

## 8. İçerik

Ay başlığı `Intl` `month: 'long', year: 'numeric'` (CSS capitalize); hafta
başlıkları `weekday: 'short'`. Yıl/gün rakamları `tabular-nums`. Placeholder
eylem dilinde kısa tutulur ("Tarih seç", "Randevu tarihi").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| trigger | min-height | `--lg-control-{size}` |
| trigger | font-size | `--lg-text-footnote/body/headline` |
| trigger invalid | outline | `--lg-danger` |
| panel | padding / örtü | `--lg-space-3` / `--lg-bg` color-mix |
| day | radius | `--lg-radius-chip` |
| day selected | background / color | `--lg-accent` / `--lg-accent-contrast` |
| day today | ring | `--lg-hairline` |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** Token'a bağlananlar: popover mobil taşma
payı `calc(100vw - var(--lg-space-7))` (32px). Token karşılığı olmayanlar
component kökünde yerel değişkene toplandı: trigger `--min-w-sm/md/lg:
168/200/232px` (layout token'ı yok) · takvim `--grid-gap: 2px` ·
`--day-size: 40px` (bp-sm 640px'te 36px'e iner) · bugün halkası
`--today-ring: 1.5px`. `--day-size` bilinçli olarak `--lg-control-md`'ye
BAĞLANMADI: control token'ı `pointer: coarse`'ta 44px'e büyür ve mevcut
mobile-first tasarım (base 40px dokunma hedefi + ≥640px'te 36px breakpoint
override'ı) ile çelişip görsel değişiklik yaratırdı; birebir görsel
eşdeğerlik korundu. Bilinçli bırakılanlar: geçiş süreleri `0.16s`/`0.12s
ease-out` (süre/easing token'ı yok) · invalid iç halka `outline: 1.5px`
(focus/outline istisnası).

## 10. Storybook kapsamı

Var: Default, Dolu, Boyutlar, MinMax, Durumlar (invalid+disabled), Controlled,
Mobil (viewport: mobile1). **Eksik:** farklı locale görsel örneği (en-US),
klavye gezinme interaction testi.

## 11. Test kabul kriterleri

- [x] combobox rolü + aria-expanded sözleşmesi
- [x] gün seçimi onChange + kapanma + biçimli değer
- [x] klavye: açılış focus'u, ok gezinmesi, Enter, PageDown, Escape + focus dönüşü
- [x] min/max dışı disabled ve seçilemez
- [x] disabled açılmaz; invalid aria-invalid verir
- [ ] reduced-motion'da yalnız opacity (visual)

## 12. Do / Don't

- ✅ Formda label'ı dışarıdan ver (`aria-labelledby` rest ile geçer).
- ✅ min/max'ı iş kuralından türet (örn. randevu yalnız gelecek 30 gün).
- ❌ Tarih aralığı için iki DatePicker'ı bağlamadan kullanma (min/max senkronla).
- ❌ `locale`'i kullanıcı ayarı dışında sayfa içinde karıştırma.

**Açık kararlar:** aralık (range) modu · temizle butonu trigger içinde mi ·
saat seçimi ayrı component mi.

## Changelog

- 2026-07-16: İlk sürüm — Pazartesi başlangıçlı grid, elle yazılmış tarih
  yardımcıları (date-fns yok), klavye gezinme + min/max kıstırma.
