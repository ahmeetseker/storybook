---
name: GlassToolbar
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassToolbar Kuralları

## 1. Amaç

İşlevce akraba kontrolleri cam pill gruplarına toplayan araç çubuğu; birincil
aksiyon gruplardan **ayrı ve tintli** olarak sağda durur (HIG toolbar kalıbı).

- **Kullan:** sayfa/panel üstü aksiyon şeridi (düzenle/paylaş/sil + Yayınla).
- **Kullanma:** sayfalar arası gezinme (→ `GlassNavbar`), tekil buton çifti
  (grup gerekmez, doğrudan `GlassButton` yan yana).

| İlgili | Farkı |
|---|---|
| GlassNavbar | Sayfa kimliği + geri navigasyonu; toolbar içerik aksiyonlarıdır |
| GlassSegmentedControl | Tekil seçim; toolbar'ın grubu bağımsız komutlar taşır |

## 2. Semantik sözleşme

- Kök: `role="toolbar"` + `aria-label` (fiilen zorunlu). Kök cam DEĞİL —
  cam olan pill gruplarıdır (katman kuralı: kontrol katmanı).
- Grup: `GlassSurface` kapsül + `role="group"` + `aria-label`.
- Tek tab durağı: WAI-ARIA toolbar deseni; ok tuşları kontroller arasında gezer.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | `GlassToolbarGroup`'lar (+ segmented control gibi kontroller) | Grup başına 2–5 kontrol |
| primary | — | Tek prominent/tintli `GlassButton` | Gruplara girmez; sağa yaslanır |

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| label | `string` | — | toolbar aria-label; fiilen zorunlu |
| primary | `ReactNode` | — | Birincil aksiyon slotu |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | Gruplara veri özniteliğiyle geçer |
| children | `ReactNode` | — | Gruplar / kontroller |

`GlassToolbarGroup`: `label` (group aria-label), `tone`, `children`.

Event sözleşmesi: toolbar kendi event'i üretmez; kontroller kendi
`onClick`'lerini taşır.

## 5. Seçenek eksenleri

Boyut ekseni yok — yükseklik içerikteki kontrollerden gelir (`size="sm"`
önerilir). Dikey oryantasyon bilinçli yok (HIG toolbar yataydır).

## 6. State modeli

| State | Kaynak | ARIA |
|---|---|---|
| kontrol durumları | çocuk component'ler | kendi sözleşmeleri (aria-pressed vb.) |
| focus-visible | çocuk CSS | tek tab durağı, roving tabindex |

## 7. Davranış

- Keyboard: **ArrowRight/Left** sarmalı gezinme, **Home/End** ilk/son.
  Odaklanan kontrol durak olur (`onFocusCapture` ile tabindex güncellenir).
- Disabled kontroller `FOCUSABLE` sorgusuna girmez — gezinme atlar.
- Dar container: gruplar yatay scroll'a düşer (scrollbar gizli), `primary`
  sabit kalır.

## 8. İçerik kuralları

Gruplama işleve göredir (düzenleme / yönetim), sıklığa göre değil. İkon-tek
kontroller `label` zorunluluğunu kendi taşır (GlassIconButton). Primary etiketi
fiil öbeğidir ("İlanı Yayınla").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kök gap | gap | `--lg-space-3` |
| gruplar arası | gap | `--lg-space-2` |
| grup kapsülü | radius/malzeme | GlassSurface `capsule`, thickness .25 |

Borç: grup içi 3px dolgu ve 2px kontrol arası raw — kapsül geometrisi
(GlassTabs/SegmentedControl ile aynı değerler).

## 10. Storybook kapsamı

Var: Default, WithPrimary, MixedControls, States, NarrowContainer,
Mobile (viewport).

## 11. Test kabul kriterleri

- [x] toolbar rolü + group semantiği
- [x] ok tuşları sarmalı gezinme
- [x] Home/End
- [x] roving tabindex (odak = tek durak)
- [x] primary slotu render + gezinmeye dahil
- [ ] dar container scroll (visual)

## 12. Do / Don't

- ✅ Grup başına tek işlev ailesi; 5'ten fazla kontrolü ikinci gruba böl.
- ✅ Primary'ye `prominent` GlassButton ver.
- ❌ Toolbar'ı navigasyon için kullanma.
- ❌ Grupsuz serbest buton yığını koyma — en az bir Group kullan.

**Bilinen kısıtlar:** overflow menüsü ("…" taşma davranışı) yok — talep
gelirse GlassMenu ile birleşik desen eklenecek.

## Changelog

- 2026-07-16: İlk sürüm — pill grupları, ayrık tintli primary, WAI-ARIA
  toolbar roving tabindex.
