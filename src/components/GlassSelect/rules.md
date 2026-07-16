---
name: GlassSelect
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassSelect Kuralları

## 1. Amaç

Custom cam listbox: önceden tanımlı seçeneklerden tekli seçim (vites, yakıt,
il...). Native `<select>` yerine, cam panel + tam klavye desteğiyle
select-only combobox deseni uygular.

- **Kullan:** 3–30 seçenekli tekli seçim; filtre ve ilan formu alanları.
- **Kullanma:** 2-3 seçenek (→ radyo/segment daha hızlı), serbest metin +
  öneri (autocomplete — Açık Kararlar), çoklu seçim (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassInput | Serbest metin; seçenek listesi yok |
| GlassTabs | İçerik görünümü değiştirir; form değeri değildir |
| GlassField | Label/error sarmalayıcısı; Select onu tüketir |

## 2. Semantik sözleşme

- Trigger: gerçek `<button role="combobox" aria-expanded aria-haspopup="listbox">`;
  açıkken `aria-controls` + `aria-activedescendant` verir. DOM focus'u hep
  trigger'da kalır (APG select-only combobox deseni).
- Panel: `role="listbox"`, seçenekler `role="option" aria-selected`
  (+ `aria-disabled`). Portal YOK — relative kök içinde absolute panel
  (brief'teki overlay kalıbı).
- Accessible name: dışarıdan `aria-label` ya da GlassField label'ı.
- DOM değişmezleri: (1) trigger gerçek button kalır, (2) options sırası
  `options` prop sırasıdır, sıralama yapılmaz.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger değeri | ✅ | seçili label / placeholder | Tek satır, ellipsis |
| chevron | ✅ | otomatik | Dekoratif; açıkken 180° döner |
| panel/listbox | ✅ | options'tan üretilir | Alt kenara hizalı, tam genişlik |
| option | ✅ | `label` metni + seçili tiki | Custom node yok (Açık Kararlar) |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| options | prop | `GlassSelectOption[]` | — (zorunlu) | `{ value, label, disabled? }` |
| value | prop | `string` | — | Controlled değer |
| defaultValue | prop | `string` | — | Uncontrolled başlangıç |
| onChange | prop | `(value: string) => void` | — | Event değil, değer döner |
| placeholder | prop | `string` | `'Seçin'` | Seçim yokken trigger metni |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Yükseklik `--lg-control-*` token'ından |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu |
| invalid | prop | `boolean` | field context ?? `false` | `aria-invalid` + `--lg-danger` çerçeve |
| disabled | prop | `boolean` | `false` | Trigger devre dışı; panel açılmaz |
| ...rest | — | `Omit<HTMLAttributes, 'onChange'\|'defaultValue'>` | — | Kök div'e akar; `id` trigger'a |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, kapalı, seçimsiz (placeholder).

| Yasak / türetilen | Davranış |
|---|---|
| `value` verildi | iç state devre dışı; etiket yalnız prop'la değişir |
| açılışta aktif öğe | seçili seçenek; yoksa ilk enabled seçenek |
| `option.disabled` | klavye gezinmesi atlar, tıklama seçmez |
| `invalid`/`id` verilmedi + GlassField içinde | context'ten türetilir |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| open | click / ok tuşları | — | Panel fade+drop; chevron döner; `aria-expanded` |
| active option | ok tuşları / pointer enter | — | `--lg-accent` %18 dolgu; `aria-activedescendant` |
| selected | value | — | Semibold + accent + tik; `aria-selected` |
| focus-visible | CSS | — | Trigger'da 2px `--lg-accent` halka |
| invalid | prop / context | — | 1.5px inset `--lg-danger` çerçeve |
| disabled | prop | open | opacity .45 + `pointer-events: none` |

## 7. Davranış

- Keyboard (focus trigger'dayken): ArrowDown/Up açar ve gezer (enabled'lar
  arasında sarar), Home/End uçlara, Enter/Space açar/seçer, Escape kapatır,
  Tab kapatıp geçer. **Typeahead:** yazılan harfler 500ms tamponla birikir;
  açıkken aktif öğeyi taşır, kapalıyken ilk eşleşeni doğrudan seçer.
- Dış tıklama (`pointerdown` document listener) kapatır. Seçim/Escape sonrası
  focus trigger'da kalır/geri döner.
- Aktif öğe panel scroll'unda `scrollIntoView({ block: 'nearest' })` ile görünür.
- Animasyon: `AnimatePresence` + opacity/translate/scale (0.16s);
  `prefers-reduced-motion`'da yalnız opacity, chevron dönüşü transition'sız.
- Responsive: genişlik %100. **bp-sm altında** trigger metni 16px (iOS zoom
  kuralıyla tutarlılık) ve panel listesi **max-height 50vh** (bottom-sheet
  hissi, içeride scroll); ≥640px'te 320px.

## 8. İçerik

Option label'ları kısa ve paralel yapıda ("Manuel", "Otomatik"); cümle değil.
Placeholder eylem dili: "Vites seçin". 30+ seçenekte arama/autocomplete
düşünülmeli (Açık Kararlar).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| trigger | min-height | `--lg-control-{size}` |
| trigger/panel | radius | shape 12 (GlassSurface) |
| trigger | focus outline / invalid | `--lg-accent` / `--lg-danger` |
| panel | background | `--lg-surface` %72 (okunurluk dolgusu) |
| option | radius / active bg | `--lg-radius-chip` / `--lg-accent` %18 |
| placeholder, chevron | color | `--lg-label-secondary` |
| boşluklar | gap/padding | `--lg-space-1/2` + raw px (borç) |

## 10. Storybook kapsamı

Var: Default, Preselected, Invalid, Disabled, DisabledOption, Sizes,
Controlled, Mobile (viewport mobile1, uzun il listesi + 50vh scroll).
**Eksik:** çok uzun label ellipsis görseli, RTL, gruplu seçenekler.

## 11. Test kabul kriterleri

- [x] combobox rolü + aria-haspopup/expanded sözleşmesi
- [x] click ile açılır, option click seçer + kapatır + onChange(value)
- [x] klavye: ArrowDown açar/gezer, Enter seçer, aria-activedescendant izler
- [x] Escape kapatır
- [x] disabled trigger açılmaz; disabled option atlanır/seçilmez
- [x] typeahead kapalıyken doğrudan seçer
- [x] invalid → aria-invalid; controlled değer dışarıda kalır

## 12. Do / Don't

- ✅ GlassField ile etiketle; filtre barlarında `aria-label` ver.
- ✅ Seçenekleri kullanıcı sıklığına göre sırala (alfabetik şart değil).
- ❌ 2 seçenek için kullanma — segment/radio daha hızlı.
- ❌ Option label'ına ikon/HTML gömme; düz metin sözleşmesi.
- ❌ Paneli portal'a taşıma — overlay kalıbı relative/absolute'tur; kırpan
  `overflow: hidden` ata varsa yerleşimi üst katmanda çöz.

**Açık kararlar:** çoklu seçim varyantı · aranabilir combobox (30+ seçenek) ·
option grupları (`optgroup` eşleniği) · form submit için hidden input.

## Changelog

- 2026-07-16: İlk sürüm — select-only combobox deseni (aria-activedescendant),
  typeahead, overlay kalıbı (portal'sız), mobil 50vh panel.
