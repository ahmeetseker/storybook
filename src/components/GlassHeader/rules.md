---
name: GlassHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassHeader Kuralları

## 1. Amaç

Site seviyesi header: logo, nav linkleri, CTA aksiyonları ve mobil menü.
Beş yerleşim varyantı; default görünüm flat (site zeminiyle uyumlu), cam opsiyonel.

- **Kullan:** kamuya açık site sayfalarının üst navigasyonu (ana sayfa, listeleme, kurumsal).
- **Kullanma:** uygulama içi geri+başlık barı (→ `GlassNavbar`), sekmeler (→ `GlassTabBar`).

| İlgili | Farkı |
|---|---|
| GlassNavbar | iOS tarzı kompakt araç çubuğu; GlassHeader site markası + tam nav taşır |
| GlassDrawer | Mobil menünün overlay'i; sözleşmesi (focus trap, focus dönüşü) miras alınır |

## 2. Semantik sözleşme

- Kök `<header>` (banner landmark) + içinde `<nav aria-label="Site">`.
- Linkler gerçek `<a>`; `href` yoksa `#` + `preventDefault` + `onClick`.
- Aktif link `aria-current="page"`.
- Hamburger `GlassIconButton` — `menuLabel` accessible name'idir (default 'Menü').
  `material="glass"` iken hamburger düz `<button>` (cam-üstüne-cam yasağı); accessible
  name yine `menuLabel` — `aria-label` ile korunur.
- Logo `<span>`; heading değildir.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| logo | ✅ | Marka; tek satır |
| links | — | `GlassHeaderLink[]`; boşsa nav + hamburger render edilmez |
| actions | — | `<GlassButton>` önerilir; en fazla 2-3 CTA |
| utility | — | Yalnız `variant="split"`; her zaman flat üst satır |
| mobil menü | otomatik | GlassDrawer sağ panel; href'liler tam genişlik link, href'sizler buton |

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| logo | `ReactNode` | — | Marka alanı |
| links | `GlassHeaderLink[]` | `[]` | `{label, onClick?, href?, active?}` |
| actions | `ReactNode` | — | Sağ CTA alanı |
| utility | `ReactNode` | — | Yalnız split |
| variant | `'bar'\|'centered'\|'split'\|'capsule'\|'minimal'` | `'bar'` | Yerleşim |
| material | `'glass'\|'flat'` | `'flat'` | Cam yalnız kapsayıcıda |
| sticky | `boolean` | `true` | `position: sticky; top: 0` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'a iletilir |
| menuLabel | `string` | `'Menü'` | Hamburger adı + drawer başlığı |

`...rest` yok.

## 5. Seçenek eksenleri

| Kural | Davranış |
|---|---|
| `utility` + variant ≠ split | Render edilmez |
| `variant="minimal"` | Nav listesi hiçbir genişlikte görünmez; linkler yalnız menüde |
| `material="glass"` | Sayfada 1 cam yüzey harcar; cam üstüne cam yasağı gereği linkler düz `<a>` |
| `material="glass"` + `actions` | `actions`'a cam component (GlassButton/GlassIconButton) **verme**; düz buton/link ver — cam üstüne cam yasağı (kod düzeyinde denetlenemez, çağıran sorumluluğunda) |
| `material="glass"` + variant ≠ `capsule` | Desteklenir ama önerilmez — logo/actions saydam zeminde kalır; v1'de glass yalnız `capsule` ile önerilir |

## 6. State modeli

Tek iç state: mobil menü `open`. Link hover/focus CSS'tedir (`:focus-visible` halka,
`@media (hover: hover)` hover). `disabled` ekseni yok.

## 7. Davranış

- `sticky`: `position: sticky; top: 0; z-index: 20`.
- Dar viewport (`max-width: 760px` media query): nav gizlenir, hamburger görünür,
  utility gizlenir. **Container query kullanılmadı** çünkü header sayfa kökünde
  sticky'dir ve containment sticky konumlandırmayı bozar — bilinçli istisna.
- Mobil menü: GlassDrawer (portal + focus trap + kapanışta hamburger'a focus dönüşü).
  Menü öğesi tıklanınca `onClick` çağrılır ve menü kapanır.

## 8. İçerik

- Link etiketleri kısa (1-3 kelime); 6-8 linkten fazlası `UzunIcerik` story'sindeki
  gibi sarmalanır, ideal değildir — bilgi mimarisini sadeleştir.
- `menuLabel` lokalizasyon için dışarıdan verilebilir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| flat kabuk | background / border | `--lg-surface` / `--lg-hairline` |
| link | renk / radius / yükseklik | `--lg-label(-secondary)` / `--lg-radius-chip` / `--lg-control-sm` |
| focus halkası | outline | `--lg-accent` |
| hover/aktif zemin | background | `color-mix(--lg-label 7%)` |
| kapsül (glass) | malzeme | GlassSurface capsule, thickness 0.35 |

**Borç (raw):** min-height 60px (header yüksekliği), padding/gap değerleri,
font-size 15/17/13px, 760px breakpoint, kapsül max-width 960px, `z-index: 20`,
1120px container genişliği.

## 10. Storybook kapsamı

Default, Playground, Centered, Split, Capsule, Minimal, CamMalzeme (gradyan zeminde),
UzunIcerik, VaryantKarsilastirma (5 varyant alt alta — seçim story'si).
Temalar/tier toolbar'dan.

## 11. Test kabul kriterleri

- [x] banner + "Site" navigation landmark
- [x] aktif link `aria-current="page"`
- [x] href'siz link onClick + preventDefault yolu
- [x] hamburger menüyü açar; menü öğesi onClick çağırır
- [x] utility yalnız split'te
- [x] minimal'de nav yok, hamburger var
- [x] data-variant / data-material işaretleri
- [x] links boşken nav + hamburger yok
- [ ] dar viewport nav çökmesi (visual, Chrome)
- [ ] glass kapsülün cam görünümü (visual, Chrome)

## 12. Do / Don't

- ✅ actions'a yalnız buton/link ver; blok içerik verme.
- ✅ Sayfada tek GlassHeader kullan (tek banner landmark).
- ❌ `material="glass"` + sayfada 5'ten fazla başka cam yüzey (≤6 kuralı).
- ❌ Linklere ikon dışında blok element koyma.
- ❌ `material="glass"` iken `actions`'a cam component (GlassButton/GlassIconButton) koyma.
- ❌ `material="glass"`'ı bar/centered/split ile üretimde kullanma — v1'de glass yalnız capsule için tasarlandı.

**Bilinen kısıtlar:** nav çökmesi viewport media query'siyledir; dar bir container
içinde kullanılırsa çökme tetiklenmez. `material="glass"` bar/centered/split ile
kullanılırsa `.glassRoot { background: none }` nedeniyle logo/actions saydam sticky
zeminde kalır (okunabilirlik riski) — bu yüzden glass v1'de yalnız capsule ile
önerilir. **Açık kararlar:** megamenü/dropdown (v2, GlassMenu ile) ·
`--lg-space-*` token'ları gelince raw boşluk borcunun kapanması.
