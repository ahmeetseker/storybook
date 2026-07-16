---
name: GlassPagination
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassPagination Kuralları

## 1. Amaç

Sayfalama: capsule cam grup içinde önceki/sonraki oklar + sayfa numaraları;
uzun listelerde (arama sonuçları, ilan listesi) sayfalar arası gezinme.

- **Kullan:** ilan arama sonuçları, satıcının diğer ilanları gibi sayfalı listeler.
- **Kullanma:** içerik değiştiren sekmeler (→ GlassTabs), sonsuz kaydırma
  senaryoları (pagination yerine "daha fazla yükle"), adım sihirbazı (Stepper yok).

| İlgili | Farkı |
|---|---|
| GlassTabs | İçerik paneli değiştirir; pagination yalnız konum bildirir |
| GlassBreadcrumb | Hiyerarşik konum; pagination sıralı liste konumu |

## 2. Semantik sözleşme

- Element: `<nav>` (`GlassSurface as="nav"`) + `aria-label="Sayfalama"` default
  (`...rest` sonda yayıldığı için çağıran override edebilir).
- Aktif sayfa: `aria-current="page"` + accent dolgu.
- Ok butonları: `aria-label="Önceki sayfa"` / `"Sonraki sayfa"`; ok karakterleri
  `aria-hidden`. Ellipsis (`…`) `aria-hidden` span — tıklanamaz.
- Sayfa butonları `aria-label="Sayfa N"` taşır.
- DOM değişmezleri: (1) tek `nav` kökü, (2) `aria-current="page"` yalnız aktif
  sayfada, (3) oklar her iki responsive modda da aynı butonlardır (duplike edilmez).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| önceki ok | ✅ (otomatik) | `‹` | `page === 1`'de disabled |
| sayfa listesi | ✅ (otomatik) | numaralar + ellipsis | ≥ bp-sm görünür |
| kompakt gösterge | ✅ (otomatik) | `X / Y` | < bp-sm görünür |
| sonraki ok | ✅ (otomatik) | `›` | `page === pageCount`'ta disabled |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| page | prop | `number` | — (zorunlu) | 1 tabanlı aktif sayfa; **kontrollü zorunlu** |
| pageCount | prop | `number` | — (zorunlu) | Toplam sayfa; içeride min 1'e clamp'lenir |
| onPageChange | prop | `(page: number) => void` | — (zorunlu) | Yalnız geçerli ve farklı sayfada çağrılır |
| siblingCount | prop | `number` | `1` | Aktifin iki yanındaki komşu sayısı; min 0'a clamp |
| size | prop | `'sm'\|'md'` | `'md'` | Öğe boyutu kontrol token'ından |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| disabled | prop | `boolean` | `false` | Tüm butonlar devre dışı |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | Köke (`nav`) geçer |

Event: `onPageChange` — aralık dışı hedefler clamp'lenir, aynı sayfa için
çağrılmaz. Uncontrolled mod **yok** (bilinçli — sayfa durumu her zaman URL/veri
katmanına aittir).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, `siblingCount=1`, `tone=auto`.

| Yasak / türetilen | Davranış |
|---|---|
| `page` aralık dışı | Render için `[1, pageCount]`'a clamp'lenir |
| `pageCount ≤ 2·siblingCount + 5` | Ellipsis yok, tüm sayfalar listelenir |
| uca yakın aktif sayfa | Tek ellipsis; görünen öğe sayısı sabit (layout zıplamaz) |
| `defaultPage` / uncontrolled | ❌ yok |
| hover/focus prop olarak | ❌ — yalnız CSS |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel / ARIA |
|---|---|---|---|
| active (sayfa) | `page` prop | hover zemini | accent dolgu + `--lg-accent-contrast` metin + `aria-current="page"` |
| hover | CSS (`hover:hover`) | — | opacity 1 + `rgba(255,255,255,.28)` zemin |
| focus-visible | CSS | — | 2px `--lg-accent` halka, offset 1px |
| disabled (uç ok) | `page` konumu | hover, tıklama | opacity .35 + `pointer-events: none` |
| disabled (tümü) | prop | tüm etkileşim | tüm butonlar native disabled |

## 7. Davranış

- Keyboard: butonlar native `<button>` — Tab ile gezilir, Enter/Space aktive
  eder. Ok tuşu gezintisi **yok** (bilinçli — APG'de pagination bir `nav`'dır,
  composite widget değildir; roving tabindex gerekmez).
- Pointer: yalnız click; basınç animasyonu/useGlassPress yok (metin ağırlıklı
  yoğun buton grubu — jöle salınımı gürültü olur).
- `prefers-reduced-motion`: renk geçişleri kapatılır.
- Responsive: **iki DOM bloğu** — tam sayfa listesi (`.pages`) mobile-first
  gizli, `/* bp-sm */ 640px`'te görünür; kompakt gösterge (`X / Y`) tersi.
  Oklar iki modda ortaktır. JS/matchMedia yok — saf CSS.

## 8. İçerik

- Sayılar `tabular-nums` — basamak genişliği sabit, geçişte zıplamaz.
- Çok büyük sayılar (999+) butonu genişletir, kırpılmaz.
- `pageCount=1`: tek sayfa + iki ok da disabled render edilir — gizlemek
  çağıranın kararı.
- Lokalizasyon: `aria-label="Sayfalama"` ve ok etiketleri Türkçe hardcoded —
  farklı dilde `aria-label` override edilebilir, ok etiketleri edilemez (borç).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius / padding | capsule / `--lg-space-1` |
| item | min-width/height | `--lg-control-{sm,md}` (dokunmatikte otomatik 44px'e yaklaşır) |
| item | font-size | `--lg-text-footnote` (sm) / `--lg-text-body` (md) |
| item | radius | `--lg-radius-capsule` |
| active | background / color | `--lg-accent` / `--lg-accent-contrast` |
| item | focus outline | `--lg-accent` |
| ellipsis | min-width | `--lg-space-6` |

Borç: hover zemini `rgba(255,255,255,.28)` (GlassTabs ile aynı raw değer),
opacity değerleri (.75/.55/.35) raw.

## 10. Storybook kapsamı

Var: Default (kontrollü), Ellipsis (orta + iki uç), SiblingCountTwo, Sizes,
UcDurumlar (ilk/son/tek sayfa), Disabled, MobilKompakt (viewport: mobile1).
**Eksik:** forced hover/focus görselleri, RTL.

## 11. Test kabul kriterleri

- [x] navigation landmark + aktif sayfada `aria-current="page"`
- [x] tıklama onPageChange'i doğru sayfayla çağırır
- [x] ellipsis dizilimi 1 … 4 5 6 … 20
- [x] uçlarda ok disabled; disabled prop tüm aktivasyonu keser
- [x] kompakt gösterge DOM'da
- [ ] bp-sm altında yalnız kompakt görünür (visual)
- [ ] klavye aktivasyonu Enter/Space (interaction — native)

## 12. Do / Don't

- ✅ `page`'i URL'den türet, `onPageChange`'te URL'i güncelle.
- ✅ Uzun listelerde `siblingCount`'u 1'de tut — kapsül dar kalır.
- ❌ İçerik paneli değiştirmek için kullanma (→ GlassTabs).
- ❌ Sayfa butonlarını linke çevirmeden SEO beklentisi kurma
  (bkz. Bilinen kısıtlar).

**Bilinen kısıtlar:** `href` desteği yok — butonlar client-side gezinme
varsayar; orta tık/yeni sekme çalışmaz. **Açık kararlar:** `renderPage(page)`
ile `<a>` render override'ı · ok etiketlerinin i18n'i · `boundaryCount` prop'u
(MUI paritesi) gerekli mi?

## Changelog

- 2026-07-16: İlk sürüm — kontrollü API, ellipsis mantığı, CSS-tabanlı
  responsive kompakt mod (iki DOM bloğu, ortak oklar).
