---
name: GlassSegmentedControl
category: kontroller
status: hazır
lastReviewed: 2026-07-16
---

# GlassSegmentedControl Kuralları

## 1. Amaç

Az sayıda (2–5) eşdeğer görünüm/mod arasında anında geçiş: seçili segmentin
altındaki cam damla FLIP ile segmentler arasında süzülür.

- **Kullan:** görünüm değiştirme (liste/ızgara/harita), kısa mod seçimleri.
- **Kullanma:** içerik panelleri değişiyorsa (→ `GlassTabs`), form değeri
  taşıyorsa (→ `GlassRadioGroup`), 5'ten fazla seçenek (→ `GlassSelect`).

| İlgili | Farkı |
|---|---|
| GlassTabs | tablist/tabpanel semantiği; panel içeriği yönetir |
| GlassRadioGroup | Form değeri; submit ile işlenir; dikey yerleşim var |
| GlassChip (toggle) | Bağımsız çoklu seçim; segmentler tekil-seçimdir |

## 2. Semantik sözleşme

- Kök: `GlassSurface` kapsül; içinde `role="radiogroup"` + `aria-label`.
- Segment: `<button type="button" role="radio" aria-checked>`.
- Damla `aria-hidden`; DOM'da yalnız seçili segmentin içinde yaşar.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| options[].label | ✅ | Kısa metin | 1–2 kelime; kısaltma yok |
| options[].icon | — | Dekoratif ikon | `aria-hidden`; etiketsiz ikon yasak |

## 4. Public API

| Ad | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|
| options | `GlassSegmentedOption[]` | — | — | value/label/icon/disabled |
| value | `string` | — | ✅ | Controlled seçim |
| defaultValue | `string` | ilk seçenek | — | Uncontrolled başlangıç |
| onChange | `(value: string) => void` | — | — | Yeni değeri döner |
| size | `'sm'\|'md'` | `'md'` | — | `--lg-control-*` yüksekliği |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | — | GlassSurface'e geçer |
| label | `string` | — | — | radiogroup aria-label; fiilen zorunlu |
| disabled | `boolean` | `false` | — | Tüm kontrol; segment bazında `options[].disabled` |

Ref hedefi yok; event yalnız seçim değişince çalışır (aynı segmente tıklama
`onChange` tetiklemez — zaten seçilidir, `select` yine çağrılır ama değer aynıdır).

## 5. Seçenek eksenleri

Varsayılan: `md`, ilk seçenek seçili. `lg` bilinçli yok — segmented control
yoğun kontrol satırlarına aittir. Birleşik variant yok.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selected | prop/iç state | — | `aria-checked` |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| disabled (segment) | native | hover, seçim | `disabled` |
| disabled (kontrol) | prop | tümü | opacity + `pointer-events: none` |

## 7. Davranış

- Pointer: tıklama seçer; seçim damlası spring (`presets.springs.sidebar`) ile kayar.
  Kayış **yalnız konum** animasyonudur (`layout="position"`): damla ilk kareden
  hedef segmentin boyutunu alır, boyut morph'u (scale) yapılmaz — farklı
  genişlikte segmentler arasında pil büyüyüp esniyormuş gibi görünmez.
- Keyboard (radiogroup deseni): Ok tuşları önceki/sonraki **etkin** segmente
  sarar; Home/End ilk/son; seçim focus'u izler (roving tabindex).
- Controlled/uncontrolled: `value` verilirse iç state yazılmaz.
- `prefers-reduced-motion`: damla anında atlar.

## 8. İçerik kuralları

Etiketler tekil isim ("Liste", "Harita"); cümle yok. Uzun listede bar daralmaz,
yatay scroll'a düşer (scrollbar gizli). Boş `options` render etmez (radiogroup boş kalır).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| segment yüksekliği | height | `--lg-control-sm/md` − kök padding |
| segment font | font-size | `--lg-text-footnote` (sm) |
| damla, segment | border-radius | `--lg-radius-capsule` |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler kökte yerel
değişkenlerde toplandı: `--root-pad` (3px iç çerçeve — segment yüksekliği
`calc(--lg-control-* − --root-pad × 2)` bundan türetilir), `--list-gap`
(2px), `--segment-gap` (6px ikon-etiket arası), `--pad-x-sm/md` (14/18px
segment yatay padding'leri), `--font-md` (14px — footnote 13 ile body 15
arası, ölçek dışı). Bilinçli bırakılan: damla dolgusu `rgba(255,255,255,.28)`
raw — GlassTabs `tabActive` ile aynı değer; cam-üstü highlight token'ı açık
karar (bkz. Tokenlar.mdx); damla gölgesi `0 1px 4px rgba(0,0,0,.12),
0 0 1px rgba(0,0,0,.08)` shadow token'larıyla birebir eşleşmiyor. Süre/easing
(`0.18s ease`) raw — token yok.

## 10. Storybook kapsamı

Var: Default, WithDefaultValue, Sizes, States, Controlled, LongContent,
Mobile (viewport). Eksik: Temalar toolbar'dan test edilir (ayrı story yok).

## 11. Test kabul kriterleri

- [x] radiogroup + aria-label + ilk seçenek seçili
- [x] tıklama seçer, onChange(value)
- [x] roving tabindex
- [x] ok tuşları disabled segmenti atlar + sarar
- [x] Home/End
- [x] controlled dışarıdan yönetilir
- [x] disabled etkileşim almaz
- [ ] damla FLIP geçişi (visual)

## 12. Do / Don't

- ✅ Görünür bağlam yoksa `label` ver ("Görünüm", "Dönem").
- ✅ Toolbar içinde `size="sm"` kullan.
- ❌ İçerik panellerini bununla yönetme — `GlassTabs` kullan.
- ❌ Segment etiketine ikonu tek başına koyma.

**Bilinen kısıtlar:** dikey yerleşim yok (HIG'de segmented control yataydır).

## Changelog

- 2026-07-16: İlk sürüm — radiogroup semantiği, layoutId damla, roving tabindex.
- 2026-07-30: Damla geçişi `layout="position"`a alındı — boyut morph'u (scale)
  kaldırıldı; seçim değişiminde pil büyümeden, sabit boyutta kayar.
