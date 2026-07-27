---
name: GlassRadioGroup
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassRadioGroup Kuralları

## 1. Amaç

Birbirini dışlayan seçenekler için cam daire göstergeli radyo grubu.
Native input'lar görünmez kalır; form değeri ve erişilebilirlik onlardan gelir.

- **Kullan:** tekli seçim filtreleri (yakıt tipi, vites), sıralama tercihleri,
  2–6 seçenekli kararlar.
- **Kullanma:** 7+ seçenek (→ Select/Menu bileşeni gelecek), aç/kapa
  (→ `GlassSwitch`), çoklu seçim (→ `GlassCheckbox`).

| İlgili | Farkı |
|---|---|
| GlassCheckbox | Bağımsız çoklu seçim |
| GlassTabs | Görünüm değiştirir, form değeri taşımaz |

## 2. Semantik sözleşme

- Kök: `role="radiogroup"` + `aria-label` (`label` prop).
- Her seçenek: `<label>` + sr-only `<input type="radio">`; hepsi aynı `name`.
- Accessible name (seçenek): label + description (label elementi bağlar).
- DOM değişmezleri: input, daire ve metin aynı `<label>` içinde sibling'dir.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| options[].label | ✅ | ReactNode | Kısa; tek satır ideal |
| options[].description | — | ReactNode | İkincil satır, caption boyutu |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| options | prop | `GlassRadioOption[]` | — | `{ value, label, description?, disabled? }` |
| value | prop | `string` | — | Controlled seçim |
| defaultValue | prop | `string` | — | Uncontrolled başlangıç (yoksa hiçbiri seçili değil) |
| onChange | prop | `(value: string) => void` | — | Kullanıcı seçiminde |
| name | prop | `string` | otomatik | Native grup adı; form submit için ver |
| orientation | prop | `'vertical'\|'horizontal'` | `'vertical'` | Yatay yalnız ≥bp-sm |
| size | prop | `'sm'\|'md'` | `'md'` | Daire + metin ölçeği |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| label | prop | `string` | — | Grup aria-label; her zaman ver |
| ...rest | — | `HTMLAttributes<div>` | — | Kök div'e gider |

## 5. Seçenek eksenleri

Varsayılan: dikey, `md`, seçimsiz başlar.

| Yasak / türetilen | Davranış |
|---|---|
| grup-level `disabled` | ❌ yok — seçenek bazında `disabled` kullan |
| tint | ❌ yok — gösterge her zaman `--lg-accent` |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| checked | input | — | Daire accent dolgu + nokta scale-in |
| focus-visible | CSS | — | 2px `--lg-accent` halka dairede |
| disabled (seçenek) | native | hover, seçim | opacity .45 + `pointer-events: none` |

## 7. Davranış

- Keyboard: ↑/←  önceki, ↓/→ sonraki; seçim focus'u izler, disabled atlanır,
  uçlarda sarar (native radio semantiği; deterministiklik için manuel yönetilir,
  `preventDefault` ile çift tetikleme yoktur). Tab grupta tek durak (native).
- `prefers-reduced-motion`: nokta scale-in ve renk geçişleri kapanır.
- Responsive: `orientation="horizontal"` yalnız `/* bp-sm */ ≥640px`'de yatay;
  altında media query ile dikeye düşer (flex-wrap değil).
- Touch: satır min 44px, daire büyür.

## 8. İçerik

Seçenek etiketleri paralel yapıda yazılır (hepsi isim ya da hepsi cümle).
Description'ı yalnız ayrım gerektiren seçeneklerde değil, ya hepsinde ya
hiçbirinde kullan.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| daire (checked) | background | `--lg-accent` (color-mix %88) |
| nokta | background | `--lg-accent-contrast` |
| etiket | font-size | `--lg-text-footnote` / `--lg-text-body` |
| description | font-size / color | `--lg-text-caption` / `--lg-label-secondary` |
| grup boşluğu | gap | `--lg-space-3` (dikey) / `--lg-space-5` (yatay) |

**Borç (raw / mikro-geometri):** kontrol token ölçeğine uymayan ölçüler
component kökünde yerel değişkenlerde toplandı: `--radio-circle-sm/md`
(18/20px) ve `--radio-dot-sm/md` (7/8px) — `pointer: coarse`'ta kök
değişkenleri 22/24 ve 9/10px'e büyütülür (dokunmatik büyüme tasarımın istediği
davranıştır); `--radio-text-gap` (2px); `--radio-touch-target` (44px —
dokunmatik satır hedefi sabiti; satır bir `<label>`'dır, `--lg-control-*`
kontrol yüksekliği ölçeğine bağlanmadı). Daire/ilk metin satırı optik hizası
`margin-top: 1px` (hairline istisnası). Geçiş süresi/easing (`0.16s ease-out`,
`0.18s cubic-bezier(0.34, 1.56, 0.64, 1)` nokta scale-in yayı) süre token'ı
olmadığından bilinçli raw.

## 10. Storybook kapsamı

Var: Default, WithDescriptions, Horizontal, Sizes, DisabledOption, Controlled,
ResponsiveHorizontal (viewport: mobile1).

## 11. Test kabul kriterleri

- [x] radiogroup rolü + aria-label; seçenekler radio rolünde
- [x] tıklama seçer, onChange değer döner
- [x] ok tuşları: taşıma + sarma + disabled atlama
- [x] disabled seçenek seçilemez
- [x] ortak `name` (native grup sözleşmesi)
- [x] controlled değer dışarıdan yönetilir

## 12. Do / Don't

- ✅ `label` prop'unu her zaman ver — adsız radiogroup ekran okuyucuda kaybolur.
- ✅ Form içinde `name` ver; otomatik ad yalnız UI-state kullanımı içindir.
- ❌ Tek seçenekli grup kurma; ❌ seçenek etiketine tıklanabilir link koyma.

**Açık kararlar:** kart-görünümlü (bordered) seçenek varyantı talep gelirse
ayrı prop olarak değerlendirilecek.

## Changelog

- 2026-07-16: İlk sürüm — sr-only native inputlar, manuel ok tuşu gezinmesi,
  horizontal→vertical responsive düşüş.
