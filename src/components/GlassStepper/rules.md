---
name: GlassStepper
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassStepper Kuralları

## 1. Amaç

Ayrık sayı girişi: `[−] değer [+]`. Ortadaki değer `role="spinbutton"` ile
odaklanabilir; butonlar GlassIconButton tarzı cam kapsüllerdir (kendi içinde,
`useGlassPress` + `GlassSurface`).

- **Kullan:** küçük aralıklı kesin sayılar — adet, oda sayısı, yayın süresi.
- **Kullanma:** geniş aralıklar (→ `GlassSlider` veya sayı girişi),
  serbest metin/sayı yazımı (input varyantı yok — Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassSlider | Sürekli aralıktan kaba değer |
| GlassIconButton | Bağımsız ikon aksiyonu; değer taşımaz |

## 2. Semantik sözleşme

- Kök: düz `<div>`; değer `<span role="spinbutton" tabIndex=0>` +
  `aria-valuenow/min/max` (+ `formatValue` varsa `aria-valuetext`).
- Accessible name: `label` prop → spinbutton `aria-label`; fiilen zorunlu.
- Butonlar: gerçek `<button aria-label="Azalt/Artır" tabIndex=-1>` —
  WAI-ARIA spinbutton deseni gereği sekme durağı tektir (spinbutton).
- `aria-valuemax` yalnız `max` sonluysa yazılır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| değer | ✅ | `formatValue(value)` | Tek satır, tabular-nums |
| − / + | ✅ | SVG glif | İçeriden gelir, değiştirilemez |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| min / max / step | prop | `number` | `0 / ∞ / 1` | Aralık ve adım |
| value | prop | `number` | — | Controlled değer |
| defaultValue | prop | `number` | `min` (sonluysa, değilse 0) | Uncontrolled başlangıç |
| onChange | prop | `(value: number) => void` | — | Kıskaçlanmış yeni değer |
| disabled | prop | `boolean` | `false` | Tümünü kapatır |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Buton çapı kontrol token'ından |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| label | prop | `string` | — | Spinbutton aria-label |
| formatValue | prop | `(v: number) => string` | `String` | Görünen metin + aria-valuetext |
| ...rest | — | `HTMLAttributes<div>` | — | Kök div'e gider |

## 5. Seçenek eksenleri

Varsayılan: `md`, 0'dan sonsuza, adım 1.

| Yasak / türetilen | Davranış |
|---|---|
| `value` aralık dışı | Render'da kıskaçlanır |
| uçta buton | İlgili buton `disabled` (min'de −, max'ta +) |
| basılı tutunca tekrar (repeat) | ❌ bilinçli yok — basit tutuldu |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| at-min / at-max | türetilen | ilgili buton | Buton opacity .4 + pointer-events none |
| press (buton) | useGlassPress | — | Sıvılaşma + jöle scale |
| focus-visible | CSS | — | 2px `--lg-accent` halka (buton ve spinbutton) |
| disabled | prop | tümü | Kök opacity .45 + pointer-events none; spinbutton tabIndex -1 + aria-disabled |

## 7. Davranış

- Keyboard (spinbutton odaktayken): ↑ +step, ↓ −step, Home/End sonlu uçlara.
  `preventDefault` ile sayfa kaydırması engellenir.
- Değer değişmiyorsa (uçta) `onChange` çağrılmaz.
- `prefers-reduced-motion`: basınç spring'leri (useGlassPress içinde) ve
  renk geçişleri kapanır.
- Touch: buton çapları `--lg-control-*` token'ından — coarse pointer'da
  otomatik büyür (md → 44px).

## 8. İçerik

`formatValue` çıktısını kısa tut ("3+1", "2 hafta"); değer alanı `min-width`
2.5em'dir, uzun metin onu genişletir. Birim değere bitişik yazılır, ayrı
etiket koyulmaz.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| buton | width/height | `--lg-control-{size}` |
| değer | font-size | `--lg-text-footnote/body/headline` |
| değer | radius (focus) | `--lg-radius-chip` |
| aralık | gap | `--lg-space-2` |
| focus | outline | `--lg-accent` |

Borç: buton hover beyazı raw (GlassButton ile aynı borç).

## 10. Storybook kapsamı

Var: Default, Formatted, AtBounds, Disabled, Sizes, ControlledRoomCount,
MobileQuantity (viewport: mobile1).

## 11. Test kabul kriterleri

- [x] spinbutton rolü + aria-valuenow/min/max
- [x] +/− tıklama + onChange
- [x] klavye: ↑/↓/Home/End
- [x] uçlarda buton disabled + kıskaçlama
- [x] disabled tüm etkileşimi kapatır
- [x] formatValue → görünen metin + aria-valuetext (valuenow ham kalır)
- [x] controlled değer dışarıdan yönetilir

## 12. Do / Don't

- ✅ Dar aralıklarla kullan (≤ ~20 adım); genişse GlassSlider'a geç.
- ✅ `label` her zaman ver — değer tek başına anlam taşımaz.
- ❌ Basılı-tut tekrarına güvenme; yok (bilinçli).
- ❌ Para gibi hassas büyük sayılar için kullanma.

**Açık kararlar:** yazılabilir değer alanı (contenteditable/input hibriti) ·
basılı tutunca tekrar (repeat) talebi gelirse eklenmesi.

## Changelog

- 2026-07-16: İlk sürüm — spinbutton deseni, cam ± butonları (tek sekme durağı),
  sonsuz max desteği, uç kıskaçlama.
