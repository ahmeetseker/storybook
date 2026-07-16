---
name: GlassCheckbox
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassCheckbox Kuralları

## 1. Amaç

Cam kutulu onay kutusu: native `<input type="checkbox">` görünmez kalır,
yanındaki küçük cam kutu tik/tire işaretini animasyonla gösterir.

- **Kullan:** çoklu seçim filtreleri (Garantili, Takas olur), form onayları
  (KVKK), "tümünü seç" desenleri (indeterminate).
- **Kullanma:** tekli aç/kapa ayarı (→ `GlassSwitch`), birbirini dışlayan
  seçenekler (→ `GlassRadioGroup`).

| İlgili | Farkı |
|---|---|
| GlassSwitch | Anında etkili aç/kapa; form submit beklemez |
| GlassRadioGroup | Tek seçim; daire gösterge |

## 2. Semantik sözleşme

- Element: `<label>` sarmalayıcı + sr-only `<input type="checkbox">`.
- Accessible name: `label` prop içeriği (label elementi native bağlar).
- `indeterminate` ref ile `input.indeterminate`'e yazılır + `aria-checked="mixed"`.
- DOM değişmezleri: (1) gerçek checkbox input kalır, (2) input, kutu ve
  metin aynı `<label>` içindedir (sibling seçiciler buna dayanır).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| label | ✅ | ReactNode | Tıklanabilir alanın parçası; boş verme |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| label | prop | `ReactNode` | — | Accessible name; zorunlu |
| checked | prop | `boolean` | — | Controlled değer |
| defaultChecked | prop | `boolean` | `false` | Uncontrolled başlangıç |
| onChange | prop | `ChangeEventHandler<HTMLInputElement>` | — | Native change event |
| indeterminate | prop | `boolean` | `false` | Karışık durum; görsel tire |
| size | prop | `'sm'\|'md'` | `'md'` | Kutu + metin ölçeği |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| disabled | prop | `boolean` | `false` | Native attribute |
| ...rest | — | `InputHTMLAttributes` | — | `name`, `value` vb. input'a gider |

## 5. Seçenek eksenleri

Varsayılan: `size=md`, boş, nötr cam kutu.

| Yasak / türetilen | Davranış |
|---|---|
| `indeterminate` + `checked` birlikte | Görselde tire kazanır; submit değeri `checked`'ten gelir |
| tint prop'u | ❌ yok — işaret rengi her zaman `--lg-accent` |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| checked | input | — | Kutu accent dolgu + tik path çizimi |
| indeterminate | prop → DOM property | checked görseli | Accent dolgu + tire (scale-in) |
| focus-visible | CSS (`:focus-visible ~ .box`) | — | 2px `--lg-accent` halka kutuda |
| disabled | native | tümü | opacity .45 + `pointer-events: none` |

## 7. Davranış

- Keyboard: Space toggle (native input). Focus halkası kutuda görünür.
- `prefers-reduced-motion`: path çizimi ve scale-in anında biter, renk geçişi kapanır.
- Touch (`pointer: coarse`): kutu büyür (sm 22 / md 26px), satır min 44px.

## 8. İçerik

Etiket kısa ve olumlu yazılır ("Garantili ilanlar", "Bildirimleri kapat" değil).
Çok satır sarabilir; kutu ilk satırla hizalanır.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kutu (checked) | background | `--lg-accent` (color-mix %88) |
| işaret | stroke | `--lg-accent-contrast` |
| metin | font-size | `--lg-text-footnote` / `--lg-text-body` |
| aralık | gap | `--lg-space-2` |
| focus | outline | `--lg-accent` |

Borç: kutu boyutları (18/22px) raw — kontrol token'ı checkbox ölçeğine uymadığı
için bilinçli.

## 10. Storybook kapsamı

Var: Default, Checked, Indeterminate, Disabled, Sizes, States,
ControlledSelectAll, MobileFilterList (viewport: mobile1).

## 11. Test kabul kriterleri

- [x] rol + label ile erişilebilir isim
- [x] tıklama toggle + onChange
- [x] sr-only input odak alır (klavye erişimi)
- [x] disabled aktivasyonu engeller
- [x] indeterminate → DOM property + `aria-checked="mixed"`
- [x] controlled değer dışarıdan yönetilir
- [ ] path animasyonu reduced-motion'da kapalı (visual)

## 12. Do / Don't

- ✅ "Tümünü seç" başlığında `indeterminate` kullan, alt öğeler kısmî seçiliyken.
- ✅ Form gönderiminde `name`/`value`'yu rest ile input'a geçir.
- ❌ Etiketi dışarıda bırakıp yalnız kutu render etme — accessible name kaybolur.
- ❌ Anında etkili ayarlar için kullanma (→ GlassSwitch).

**Açık kararlar:** grup-level hata durumu (aria-invalid) ihtiyacı ortaya
çıkarsa API'ye eklenecek.

## Changelog

- 2026-07-16: İlk sürüm — sr-only native input, motion path tik, indeterminate,
  coarse pointer büyütmesi.
