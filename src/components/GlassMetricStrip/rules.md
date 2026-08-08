---
name: GlassMetricStrip
category: içerik
status: hazır
lastReviewed: 2026-08-06
---

# GlassMetricStrip Kuralları

## 1. Amaç

Bir dizi KPI/metriği tek satırda özetleyen gösterge şeridi (dashboard başlığı,
portföy özeti, ilan performansı). İçerik katmanı — bilinçli olarak cam DEĞİL:
sürekli okunan istatistikler, cam malzemenin anlamı yok.

- **Kullan:** satıcı/kurumsal panolarda özet metrikler, ilan yönetim başlığı.
- **Kullanma:** tekil görselleştirilmiş skor (→ `GlassScoreMeter`), etiket/değer
  detay listesi (→ `GlassSpecTable`), süreç ilerlemesi (→ `GlassProgress`).

## 2. Semantik sözleşme

- Kök `<dl>` + `aria-label` (şeridin erişilebilir adı). Her metrik bir
  `<dt>` (label) + `<dd>` (value + change) çiftidir.
- Trend yönü asla yalnız renkle iletilmez: görünür ok glifi `aria-hidden`,
  yanında sr-only yön metni ("Yükseliş:" / "Düşüş:" / "Yatay:") ikinci kanaldır.
- Sayısal değerler tabular-nums ile hizalanır.
- `variant="plain"` (varsayılan) etkileşimsizdir; `tabIndex`/klavye hedefi değildir.
- `variant="gradient"` + item `action` verildiğinde metrik kartı tek bir `<a>`
  taşır. Bağlantı `<dd>` içindedir ve erişilebilir adı görünür metni kapsar
  (`"{label}: {action.label}"`, WCAG 2.5.3). Kartın tamamı link DEĞİLDİR.
- Degrade yüzey cam değildir: yalnız semantik token'ın düşük oranlı karışımı.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| label (`dt`) | ✅ | metrik adı |
| value (`dd > strong`) | ✅ | öne çıkan değer |
| change | — | değişim ifadesi + trend göstergesi |
| hint | — | küçük yardımcı açıklama |
| motif (`svg`) | — | dekoratif şekil, `aria-hidden` — yalnız `gradient` |
| action (`dd > a`) | — | tek metin bağlantısı — yalnız `gradient` |

Children kabul edilmez — tamamen `items` prop güdümlü.

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| items | `GlassMetricStripItem[]` | — (zorunlu) | `{id,label,value,change?,trend?,hint?,tone?,motif?,action?}` |
| label | `string` | `'Temel göstergeler'` | Şeridin `aria-label`'i |
| size | `'md'\|'sm'` | `'md'` | Yoğunluk |
| variant | `'plain'\|'gradient'` | `'plain'` | Sunum ekseni |
| ...rest | `HTMLAttributes<HTMLDListElement>` (aria-label hariç) | — | `className`/`style` birleşir |

`...rest` yönetilen `aria-label`/`className`'den ÖNCE yayılır — caller yönetilen
attribute'u ezemez.

## 5. Seçenek eksenleri

Varsayılan: `size=md`, `variant=plain`. `material`/`thickness`/`prominent` N/A
(cam değil). Eksenler birleştirilmez: `variant` tek başına sunumu belirler,
`size` yoğunluğu. `tone` şerit düzeyinde DEĞİL, item düzeyinde bir alandır —
her metrik kendi semantik rengini taşır.

| Türetilen | Davranış |
|---|---|
| `change` yok | trend göstergesi hiç çizilmez |
| `change` var, `trend` yok | yön `steady` ("Yatay") varsayılır |
| `variant=plain` | `tone`/`motif`/`action` okunmaz — mevcut tüketiciler etkilenmez |
| `variant=gradient`, `tone` yok | `neutral` (`--lg-label`) varsayılır |
| `motif` yok | dekoratif şekil çizilmez |
| `action` yok | bağlantı çizilmez, kart etkileşimsiz kalır |

## 6. State modeli

`plain`: etkileşimsiz, durum yalnız veri (`items`) ile belirlenir.
`gradient`: kart `:hover` ve `:focus-within` durumunda yükselir — ikisi de
CSS'te kalır, prop değildir. `action` bağlantısı `:focus-visible` halkasını
`--lg-accent` ile çizer.

## 7. Davranış

- `plain` responsive: metrikler `flex-wrap` ile dar ekranda alt alta akar;
  her metrik `flex: 1 1 140px`. Animasyon yok.
- `gradient` responsive: kırılımlar **container query** ile — şerit hem geniş
  anasayfada hem dar panelde kullanıldığı için kart kendi kutusuna bakar,
  viewport'a değil. Kök `container-type: inline-size`.

  | Container | Yerleşim |
  |---|---|
  | > 860px | 4 kolon grid |
  | ≤ 860px | 2 kolon grid |
  | ≤ 560px | `scroll-snap`'li yatay şerit; kart `flex: 0 0 61%` |

  Mobilde alt alta yığmak yerine yatay şerit: bölümün "tek sıra gösterge"
  kimliği korunur, dikey yer harcanmaz, sonraki kart kırpılarak görünür ve
  kaydırma olduğunu ayrı bir işaret gerekmeden anlatır.
- `gradient` animasyonu yalnız transform/opacity: hover'da kart 4px yükselir,
  motif `scale(1.1) rotate(3deg)`, ok 4px sağa kayar. `prefers-reduced-motion`
  altında hepsi kapanır.
- Dokunmatikte (`pointer: coarse`) `action` bağlantısı `--lg-control-hit`e çıkar.

## 8. İçerik kuralları

- `label` kısa metrik adı; sayıyı içermez (sayı zaten `value`'da).
- `change` yönle tutarlı olmalı ("%12" + trend `up`). Yön metni renk-kör
  kullanıcılar için tek anlam kanalıdır.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| number | font-size | `--lg-text-title` (md) / `--lg-text-headline` (sm) |
| label/hint | color | `--lg-label-secondary` |
| change up | color | `--lg-success` |
| change down | color | `--lg-danger` |
| gap | gap | `--lg-space-5` (plain) / `--lg-space-3` (gradient) |
| tile bg | background | `color-mix(--tone 13%→4%, --lg-surface)` |
| tile radius | border-radius | `--lg-radius-media` |
| tile shadow | box-shadow | `--lg-shadow-xs` → `--lg-shadow-md` (hover/focus) |
| badge | background | `color-mix(--lg-surface 72%, transparent)` |
| badge | font-size | `--lg-text-badge` |
| gradient number | font-size | `--lg-text-display` (md) / `--lg-text-title` (sm) |
| tone accent | `--tone` | `--lg-accent` |
| tone success | `--tone` | `--lg-success` |
| tone warning | `--tone` | `--lg-warning` |
| tone danger | `--tone` | `--lg-danger` |
| tone neutral | `--tone` | `--lg-label` |
| action focus | outline | `--lg-focus-ring-width` / `--lg-accent` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkenlerde toplanır — `--strip-item-basis` (metrik hücresi
`flex: 1 1` taban genişliği 140px; sarma kırılımını belirleyen yerleşim
kararı, kırılım genişliği için token yok) ve `--strip-change-gap` (`change`
ok-metin arası 2px boşluk).

`gradient` varyantının mikro-geometrisi de aynı yerde toplanır:
`--strip-tile-min-height` (158px kart taban yüksekliği),
`--strip-dot-size` (7px rozet noktası), `--strip-arrow-size` (16px ikon),
`--strip-arrow-shift` (4px hover kayması), `--strip-action-height` (24px
metin-link yüksekliği), `--strip-snap-basis` (61% snap kart genişliği),
`--strip-motif-width` / `-right` / `-bottom` (motif yerleşimi),
`--strip-lift` (-4px hover yükselmesi). Bunların dışında raw px yok;
renkler istisnasız token karışımıdır.

## 10. Storybook kapsamı

Default, TrendYonleri, DegisimsizDegerler, Kompakt, UzunIcerik, Responsive
(mobile1), Erişilebilirlik (docs), Degrade, Degrade · Aksiyonsuz,
Degrade · Tablet (704px), Degrade · Mobil (382px).

## 11. Test kabul kriterleri

- [x] `dl`/`dt`/`dd` semantiği + `aria-label`
- [x] varsayılan ad "Temel göstergeler"
- [x] trend yönü sr-only metinle iletilir (3 yön)
- [x] `change` yokken trend göstergesi yok
- [x] `change` var `trend` yok → "Yatay"
- [x] rest-override koruması (aria-label ezilemez)
- [x] gradient'te `dl`/`dt`/`dd` semantiği korunur
- [x] `action` bağlantısı çizilir; erişilebilir ad görünür metni içerir
- [x] `action` yokken bağlantı çizilmez
- [x] `tone` yokken `neutral` varsayılır
- [x] `plain` varyantta `tone`/`motif`/`action` okunmaz (regresyon koruması)
- [x] motif `aria-hidden`
- [ ] dar ekran flex-wrap akışı (visual)
- [ ] container query kırılımları 4→2→snap (visual)

## 12. Do / Don't

- ✅ `label`'ı kısa tut; sayıyı `value`'ya koy.
- ✅ Trend verirken yönü doğru eşle (renk-kör kullanıcı yön metnine güvenir).
- ❌ Cam yüzey/backdrop ekleme (içerik katmanı).
- ❌ `value`'yu grafik/ilerleme olarak kullanma (→ `GlassScoreMeter`/`GlassProgress`).
- ✅ `gradient`'te `tone`'u anlamla eşle (doğrulama → `success`, vitrin → `warning`).
- ❌ Hedefi olmayan `action` verme; filtre yoksa bağlantıyı hiç koyma.
- ❌ Kartın tamamını link yapma — `action` tek ve adlandırılmış bir hedeftir.

## Changelog

- 2026-08-06: `variant` ekseni eklendi (`plain` | `gradient`). Gradient kart
  sunumu: item düzeyinde `tone`, dekoratif `motif`, opsiyonel `action`
  bağlantısı; container query ile 4→2→snap kırılımı. `plain` varsayılan
  kaldığı için mevcut tüketiciler değişmedi.
- 2026-07-18: İlk sürüm — `dl` KPI şeridi, renk-dışı trend kanalı,
  rest-override koruması. Codex `CodexMetricStrip`/`CodexStat` deseninden türetildi.
- 2026-08-07: Mobil kırılım değişti — gradient'in ≤560px scroll-snap yatay
  şeridi KALDIRILDI (ürün kararı: dar ekranda kesik kart "devamı var"
  affordance'ı olarak okunmuyordu). Yeni kademeler: ≤860 iki kolon, ≤400 tek
  kolon; sayı display→title, kart dolgusu space-5→space-3, rozet nowrap
  kaldırıldı. Snap'e dönülecekse Degrade · Mobil story'siyle birlikte ele al.
