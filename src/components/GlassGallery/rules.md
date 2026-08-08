---
name: GlassGallery
category: içerik
status: hazır
lastReviewed: 2026-08-05
---

# GlassGallery Kuralları

## 1. Amaç

İlan/ürün görsel galerisi: ana sahne (stage) + thumbnail şeridi + tam ekran
lightbox. Sahne çerçevesi malzeme seçebilir (`material`); ok butonları kontrol
katmanı olduğu için **her zaman cam** kalır.

- **Kullan:** ilan detayında çoklu görsel gezinme, büyütülebilir tek görsel.
- **Kullanma:** kart şeridi kaydırma (→ `GlassCarousel`), video oynatıcı,
  serbest içerik slider'ı.

| İlgili | Farkı |
|---|---|
| GlassCarousel | İçerik kartları kaydırır; index/lightbox kavramı yok |
| GlassLightbox | Tam ekran katmanın kendisi; galeri onu sahnesinden açar |
| GlassIconButton | Galerinin ok kontrolleri bundan kurulur |

## 2. Semantik sözleşme

- Kök: `<div>` (`HTMLAttributes<HTMLDivElement>` rest'i alır).
- Sahne görseli `<button type="button">` içindedir; accessible name
  `Görseli büyüt: {alt}`. Her görsel için `alt` **zorunlu** (API'de required).
- Thumbnail'lar `<button type="button">`; aktif olan `aria-current` taşır.
- Lightbox **bu bileşende yaşamaz**: tam ekran görünüm `GlassLightbox`'a
  devredilir (portal + `role="dialog"` + `aria-modal` + focus trap + scroll
  kilidi + focus dönüşü). Galeri yalnız `open` ve `index`'i sürer; sözleşmenin
  tamamı `GlassLightbox/rules.md`'dedir.
- DOM değişmezleri: sayaç metni `{n} / {m}`; ok ikonları `aria-hidden` SVG;
  `images` boşsa component **null** döner.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| stage | ✅ | aktif görsel (buton) | GlassSurface `shape=20`, `thickness 0.4`; tıklama lightbox açar |
| stage okları | `images.length > 1` | GlassIconButton çifti | Hep cam; `material`'dan etkilenmez |
| counter | `images.length > 1` | `n / m` | Koyu pill, sağ-alt |
| thumbs | `images.length > 1` | tüm görseller | Yatay scroll, scrollbar gizli; thumb `alt=""` (ad butonun aria-label'ında) |
| lightbox | tıklamayla | `GlassLightbox` | Sahneyle tek indeks; şerit orada da var |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| images | prop | `{ src: string; alt: string }[]` | — | — | Boş dizi → null render |
| aspectRatio | prop | `string` | `'4 / 3'` | — | Sahnenin CSS `aspect-ratio`'su |
| initialIndex | prop | `number` | `0` | uncontrolled | `[0, length-1]`'e kıstırılır; sonradan değişimi izlenmez |
| onIndexChange | prop | `(index: number) => void` | — | — | Her gezinmede (ok, thumb, lightbox oku) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | Sahne GlassSurface'ine |
| material | prop | `'glass'\|'flat'` | — (Surface default: `'glass'`) | — | Yalnız sahne çerçevesi; oklar cam kalır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | — | Kök div'e |

Controlled `index` prop'u **yok** — yalnız `initialIndex + onIndexChange`
(defaultValue deseni). Ref forward edilmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `aspectRatio='4 / 3'`, `material` verilmez (cam), `tone='auto'`.

| Kural / türetilen | Davranış |
|---|---|
| `images.length <= 1` | Oklar, sayaç ve thumbs render edilmez |
| `material='flat'` | Sahne opaklaşır; ok/kapat butonları cam kalır (katman kuralı) |
| Gezinme uçlarda | Sarmalar (modulo): son→ilk, ilk→son |
| lightbox kontrolleri | Her zaman `tone="light"` (koyu overlay üstü) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / DOM |
|---|---|---|---|
| index (değer) | internal state | — | thumb `aria-current`; sayaç metni |
| lightboxOpen | internal state | — | `role=dialog` + `aria-modal` |
| thumb hover | CSS | — | opacity .7 → 1 |
| thumb aktif | index | hover görseli | beyaz border + tam opacity |
| focus-visible | CSS | — | 2px `--lg-accent` outline (stage + thumb) |

`disabled` ekseni yok. Katman: value (aktif thumb) → interaction (hover).

## 7. Davranış (overlay dahil)

- **Açılış:** sahne butonuna tıklama/Enter → `GlassLightbox` `open=true`.
- **Kapanış, klavye, focus trap, scroll kilidi, focus dönüşü:** tamamı
  `GlassLightbox`'ın sözleşmesidir (bkz. onun §7). Galeri bunları kendi
  yazmaz — daha önce eksik olan focus dönüşü ve scroll kilidi bu devirle
  birlikte kapandı.
- **Tek indeks:** lightbox'a `index` + `onIndexChange` controlled verilir;
  orada gezinmek sayfadaki sahneyi de ilerletir, kapanışta aynı karede kalınır.
- Controlled kullanım (dışarıdan): N/A — galerinin kendi indeksi dışarıdan
  sürülemez.

## 8. İçerik

- `alt` zorunlu ve anlamlı olmalı; a11y adları (`Görseli büyüt: …`,
  `{n}. görsele git: …`) alt'tan türetilir.
- Sahne `object-fit: cover` (kırpar); lightbox `contain` (bkz. GlassLightbox).
- Boş `images` → null; tek görsel → yalnız sahne. Yükleme/hata placeholder'ı yok
  (çağıranın işi).
- Kontrol etiketleri Türkçe sabit ('Önceki görsel', 'Kapat' vb.) — i18n prop'u yok.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| stage | malzeme/gölge | GlassSurface (`thickness 0.4`) |
| stage / thumb | focus outline | `--lg-accent` (fallback `#0a84ff`) |
| oklar | tüm görünüm | GlassIconButton token'ları |
| sayaç | font-size | `--lg-text-caption` |
| sayaç pili | radius / metin | `--lg-radius-capsule` / `--lg-on-scrim` (scrim üstünde sabit `#ffffff`) |
| thumbs gap | boşluk | `--lg-space-2` (8px) |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçü ve renkler
component kökünde yerel değişkende toplandı (`.gallery { --stack-gap: 10px;
--stage-pad: 6px; --stage-radius: 15px; --stage-inset: 14px; --thumb-w: 72px;
--thumb-h: 54px; --thumb-radius: 12px; --thumb-ring: 2px; --thumb-active-border:
rgba(255,255,255,.9); --media-placeholder: rgba(0,0,0,.2); --counter-bg:
rgba(0,0,0,.55); --counter-pad: 3px 10px; }`). Sayaç zemini `rgba(0,0,0,.55)`
alfa olarak `--lg-scrim` ile aynı görünse de scrim `rgba(10,12,16,.55)` — birebir
örtüşmediğinden token'a bağlanmadı. Geçiş süresi `0.18s ease` (süre token'ı yok),
`z-index: 2` ve `shape={20}` sayısal prop'u raw kalır. Tam ekran katmanın raw
değerleri artık burada değil, `GlassLightbox/rules.md` §9'dadır.

## 10. Storybook kapsamı

Var: `Default`, `SingleImage`, `Wide` (16/9), `Materials` (glass/flat yan yana,
oklar iki tarafta da cam), `CokGorsel` (20 görsel + uzun `alt` → thumb overflow),
`DarContainer` (320px responsive) — hepsi `onIndexChange: fn()` ile, autodocs
açık. Arka plan toolbar'dan (Arka plan + Tier global'leri). **Eksik:**
Playground, Erişilebilirlik (lightbox klavye akışı) story'si. Thumb hover/focus
CSS state'idir — control/story yapılmaz; aktif thumb tüm story'lerde görünür.

## 11. Test kabul kriterleri

- [x] ilk görsel + sayaç (unit)
- [x] ok gezinmesi + `onIndexChange`
- [x] uçlarda sarma
- [x] lightbox açılır, Escape kapatır (çıkış animasyonu bitince DOM'dan düşer)
- [x] lightbox'ta ok tuşları gezinir ve sahne de aynı kareye gelir
- [x] thumbnail atlaması
- [x] boş `images` → null
- [x] kapanışta focus tetikleyiciye döner → `GlassLightbox` testinde
- [x] backdrop tıklaması kapatır, görsele tıklama kapatmaz → `GlassLightbox`
- [ ] `material='flat'`te okların cam kaldığı (visual)

## 12. Do / Don't

- ✅ İçerik yoğun sayfada sahneye `material="flat"` ver; kontroller cam kalır.
- ✅ Her görsele gerçek, ayırt edici `alt` yaz — tüm a11y adları ondan türür.
- ❌ Galeriyi controlled index'le sürmeye çalışma; ihtiyaçsa API genişletilmeli.
- ❌ Lightbox'ı kendi modal'ının içine koyma; portal `document.body`'ye gider.

**Bilinen kısıtlar:** `images` dizisi kısalırsa mevcut `index` yeniden
kıstırılmaz. **Açık kararlar:** controlled `index` prop'u · kontrol
etiketlerinin i18n'i.

## Changelog

- 2026-08-05 — Tam ekran görünüm `GlassLightbox`'a devredildi: iç lightbox
  markup'ı ve `.lightbox*` CSS'i kaldırıldı. Bu devirle focus trap, `body`
  scroll kilidi, kapanışta focus dönüşü ve tam ekranda thumbnail şeridi
  bedava geldi; galerinin public API'si değişmedi.
