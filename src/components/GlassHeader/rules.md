---
name: GlassHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassHeader Kuralları (v2)

## 1. Amaç

Dört farklı anatomili premium site header'ı. Cam bir malzeme ekseni DEĞİLDİR —
her varyantta tek küçük liquid-glass state göstergesi vardır (seçili öğenin
kayan pill/çizgi/boncuğu). Yüzeyler flat/saydam.

- **Kullan:** kamuya açık site sayfalarının üst navigasyonu; varyantı sayfanın
  baskın görevine göre seç (aşağıdaki tablo).
- **Kullanma:** uygulama içi geri+başlık barı (→ `GlassNavbar`), sekmeler (→ GlassTabs).

| Varyant | Baskın görev | İlham |
|---|---|---|
| `islands` (default) | Genel gezinme — wordmark · nav kapsülü · tek CTA | Linear/Stripe |
| `command` | Arama/harita — menü değil arama rayı merkezde | Airbnb/Zillow |
| `masthead` | Kurumsal/analiz — yayın kimliği + sticky indeks rayı | The Modern House |
| `overlay` | Görsel ağırlıklı açılış — yüzeysiz, fotoğraf üstünde | Christie's RE |

## 2. Semantik sözleşme

- Kök `<header>` (banner) + `<nav aria-label="Site">`; aktif link `aria-current="page"`.
- Kayan cam gösterge `aria-hidden` + `data-nav-glass`; motion `layoutId`
  (`presets.springs.sidebar`), reduced-motion'da `duration: 0`.
- Mobil menü GlassDrawer: `href`'liler gerçek `<a>`, `href`'sizler `<button>`.
- Hamburger `GlassIconButton` — accessible name `menuLabel` (default 'Menü').
- `overlay` kompakt rayı scroll öncesi `inert` (focus/AT sızmaz); linkler rayda
  TEKRARLANMAZ (layoutId çakışması + çift landmark önlenir).

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| logo | ✅ | Wordmark/monogram — harf-kutusu kalıbı kullanılmaz |
| links | — | Boşsa nav + hamburger render edilmez |
| action | — | TEK birincil CTA; ikili buton kalıbı yok |
| secondaryAction | — | Sade metin aksiyonu — CSS link görünümüne stiller |
| meta | yalnız `masthead` | Otorite satırı ("81 il · EİDS doğrulamalı") |
| search / searchSummary | yalnız `command` | Ray slotu + scroll'da kapanan özet |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| logo | `ReactNode` | — |
| links | `GlassHeaderLink[]` | `[]` |
| action / secondaryAction / meta / search / searchSummary | `ReactNode` | — |
| variant | `'islands'\|'command'\|'masthead'\|'overlay'` | `'islands'` |
| sticky | `boolean` | `true` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` |
| menuLabel | `string` | `'Menü'` |

`...rest` yok. Controlled/Ref: N/A — tek iç state mobil menü + scroll bayrağı.

## 5. Seçenek eksenleri

| Kural | Davranış |
|---|---|
| `meta` + variant ≠ masthead | Sessizce render edilmez |
| `search`/`searchSummary` + variant ≠ command | Sessizce render edilmez |
| `material` | ❌ YOK (v2'de kaldırıldı) — cam yalnız state göstergesi |
| `sticky=false` | islands/command kök akışta kalır; masthead indeksi sabitlenmez; overlay kompakt rayı render edilmez |

## 6. State modeli

İç state: mobil menü `open` + `useScrolled` bayrağı (passive scroll listener →
`data-scrolled`; görsel geçişler tamamen CSS transition'da). Link hover/focus
CSS'te; basışta `scale(0.98)`.

## 7. Davranış

- `islands`: scroll'da dikey padding daralır, zemin `--lg-bg` karışımına döner,
  nav kapsülü gölgelenir ("raya kenetlenme").
- `command`: scroll'da arama rayı `searchSummary` özetine kapanır
  (opacity/transform), `:focus-within` yeniden açar. Merkez nav yoktur; linkler
  her genişlikte hamburger menüsündedir.
- `masthead`: kimlik satırı akışta kaybolur; yalnız 42px indeks rayı sticky.
  Dar ekranda indeks menüye çökmez, yatay kayar (editorial desen).
- `overlay`: kök `position: absolute` — çağıran onu `position: relative` bir
  hero kapsayıcısının İÇİNE koyar; scroll eşiğinde `position: fixed` kompakt
  ray süzülür. Metin renkleri `--lg-on-scrim`.
- Dar viewport (760px media query): islands/overlay nav'ı hamburger'a çöker.
  Container query kullanılmadı — kök sticky, containment sticky'i bozar.

## 8. İçerik

- Link etiketleri 1-3 kelime; islands kapsülü 5-6 linkten fazlasında UzunIcerik
  story'sindeki gibi sıkışır — bilgi mimarisini sadeleştir.
- `secondaryAction` içine cam component verme; sade `<a>`/`<button>` ver
  (görünümü component stiller).

## 9. Token eşlemesi

| Part | Token |
|---|---|
| yüzey/çizgiler | `--lg-bg` / `--lg-surface` / `--lg-hairline` |
| metinler | `--lg-label(-secondary)`; overlay: `--lg-on-scrim` |
| cam pill | `color-mix(--lg-surface)` zemin + blur(8px) + iç kenar ışıması |
| refraktif çizgi | `color-mix(--lg-accent 78%)` + blur(4px) |
| radius/kontrol | `--lg-radius-capsule/chip`, `--lg-control-sm/lg` |

**Borç (raw):** padding/gap değerleri, font-size 13-17px + clamp 24-32px,
760px breakpoint, z-index 30/40, 1120px container, scroll eşiği 24px,
kapsül gölge blur değerleri.

## 10. Storybook kapsamı

Default(Islands), Command, Masthead, Overlay (hero görsel bağlamında),
Playground, UzunIcerik, Erisilebilirlik (docs), VaryantKarsilastirma
(4 varyant kendi bağlamıyla — seçim story'si). Responsive: ayrı story YOK (N/A) —
kırılma viewport media query'sinde, doğrulama viewport toolbar'ıyla.
Scroll davranışları story zeminleri 180vh olduğu için canlı denenebilir.

## 11. Test kabul kriterleri

- [x] banner + "Site" navigation landmark
- [x] aktif link `aria-current` + `data-nav-glass` göstergesi
- [x] href'siz link onClick; drawer'da href → `<a>`, href'siz → `<button>`
- [x] 4 varyant `data-variant` + varyanta özgü içerik (search/meta)
- [x] meta/search yalnız kendi varyantında
- [x] action + secondaryAction render
- [x] scroll eşiği → `data-scrolled` (ileri/geri)
- [x] overlay kompakt rayı `inert` döngüsü
- [x] links boşken nav + hamburger yok
- [ ] kayan cam pill'in görsel süzülüşü (visual, Chrome)
- [ ] command rayının kapanma/açılma geçişi (visual, Chrome)

## 12. Do / Don't

- ✅ Varyantı sayfanın görevine göre seç (§1 tablosu); tüm sitede tek varyantta karar kıl.
- ✅ `overlay`'i yalnız güçlü görselli açılışta ve `position: relative` kapsayıcıda kullan.
- ❌ `action`'a birden çok buton koyma — tek CTA sözleşmesi.
- ❌ Nav linklerine/secondaryAction'a cam component koyma — cam yalnız göstergede.

**Bilinen kısıtlar:** overlay kompakt rayı `position: fixed` — Storybook docs
iframe'inde viewport'a göre konumlanır. **Açık kararlar:** overlay dikey köşe
nav (Codex konseptinin tam hâli, v2+) · megamenü (GlassMenu ile) · command
arama segmenti cam merceği (slot içeriğinin işi).

**Changelog:** 2026-07-16 v2 — KIRICI: `bar/centered/split/capsule/minimal`
varyantları ve `material`/`utility`/`actions` prop'ları kaldırıldı; yerine
`islands/command/masthead/overlay` + `action/secondaryAction/meta/search/
searchSummary` geldi (kullanıcı reddi + web araştırması + Codex danışması).
