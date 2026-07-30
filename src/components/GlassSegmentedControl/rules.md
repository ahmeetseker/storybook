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
| variant | `'capsule'\|'bar'` | `'capsule'` | — | Yerleşim: bağımsız kapsül · kapsayıcı kartın başlık şeridi |
| fill | `'equal'\|'content'` | `'equal'` | — | Yalnız `bar`: segment eşit payı mı, etiket kadar mı (sola hizalı) |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | — | GlassSurface'e geçer |
| label | `string` | — | — | radiogroup aria-label; fiilen zorunlu |
| disabled | `boolean` | `false` | — | Tüm kontrol; segment bazında `options[].disabled` |

Ref hedefi yok; event yalnız seçim değişince çalışır (aynı segmente tıklama
`onChange` tetiklemez — zaten seçilidir, `select` yine çağrılır ama değer aynıdır).

## 5. Seçenek eksenleri

Varsayılan: `md`, `capsule`, ilk seçenek seçili. `lg` bilinçli yok — segmented
control yoğun kontrol satırlarına aittir. Eksenler bağımsızdır; birleşik
variant yok.

**variant** — yerleşim ekseni, malzeme kararını da taşır:

| Değer | Kök | Genişlik | Ne zaman |
|---|---|---|---|
| `capsule` | `GlassSurface` kapsül | içerik kadar | Kendi başına duran kontrol (toolbar, sayfa üstü) |
| `bar` | düz `div`, cam yok | `100%`, segment genişliği `fill`'e bağlı | Bir kart/panelin başlık şeridi |

`bar` cam kurmaz: kapsayıcı yüzey zaten bir katman olduğu için cam üstüne cam
yasağı (GenelBakis.mdx) geçerlidir. Kök payı da olmadığından şerit yüksekliği
tam olarak `--lg-control-*`'a eşittir — kapsülde oluşan `2 × --root-pad`
kaçığı `bar`'da yoktur, aynı satırdaki alan ve butonlarla hizalanır.

**fill** — `bar`'da segment genişliği. Eşit paylaşım (`equal`) yalnızca şerit
dar olduğunda ve etiketler benzer uzunluktayken doğrudur. Geniş kartlarda
(≈ >720px) eşit paylaşım tek bir kelime için yüzlerce piksellik seçim damlası
üretir: tıklama hedefi etiketten kopar, seçili segment "buton" gibi değil "boş
alan" gibi okunur ve şerit kartın geri kalanındaki sola hizalı grid ile
çelişir. Bu durumda `content` kullan — segment etiketi kadar yer kaplar, şerit
sola, altındaki ilk alanla aynı dikey çizgiye hizalanır. Ortalamak bir seçenek
değildir: kartın hiçbir başka satırı ortalı değildir.

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
| segment yüksekliği | height | `--lg-control-sm/md` (kapsülde kök payı dışarıya eklenir) |
| bar alt ayracı | border-bottom | `--lg-stroke-hairline` + `--lg-hairline` |
| bar alt payı | padding-bottom | `--lg-space-3` |
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

Var: Default, WithDefaultValue, Sizes, Variants, States, Controlled,
LongContent, Mobile (viewport). Eksik: Temalar toolbar'dan test edilir (ayrı story yok).

## 11. Test kabul kriterleri

- [x] radiogroup + aria-label + ilk seçenek seçili
- [x] tıklama seçer, onChange(value)
- [x] roving tabindex
- [x] ok tuşları disabled segmenti atlar + sarar
- [x] Home/End
- [x] controlled dışarıdan yönetilir
- [x] disabled etkileşim almaz
- [x] `variant="bar"` cam yüzey kurmaz, radiogroup ve seçim korunur
- [x] `fill="content"` eşit paylaşımı kapatır, semantik korunur
- [ ] damla FLIP geçişi (visual)

## 12. Do / Don't

- ✅ Görünür bağlam yoksa `label` ver ("Görünüm", "Dönem").
- ✅ Toolbar içinde `size="sm"` kullan.
- ✅ Geniş kartın başlık şeridinde `fill="content"` kullan; `equal` dar şeritler
  içindir.
- ✅ Kart/panel içindeki şerit için `variant="bar"` kullan — kapsülü kartın
  içine koymak cam üstüne cam yapar ve yükseklik ritmini 2px kaydırır.
- ❌ İçerik panellerini bununla yönetme — `GlassTabs` kullan.
- ❌ Segment etiketine ikonu tek başına koyma.

**Bilinen kısıtlar:** dikey yerleşim yok (HIG'de segmented control yataydır).

## Changelog

- 2026-07-16: İlk sürüm — radiogroup semantiği, layoutId damla, roving tabindex.
- 2026-07-30: Damla geçişi `layout="position"`a alındı — boyut morph'u (scale)
  kaldırıldı; seçim değişiminde pil büyümeden, sabit boyutta kayar.
- 2026-07-30: `fill` ekseni eklendi (`equal` | `content`). Geniş şeritte eşit
  paylaşımın ürettiği devasa seçim damlası ve sola hizalı grid ile çelişki
  giderildi.
- 2026-07-30: `variant` ekseni eklendi (`capsule` | `bar`). `bar` cam kurmaz,
  tam genişliğe yayılır ve kontrol yüksekliğini birebir korur.
