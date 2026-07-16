---
name: GlassGallery
category: içerik
status: hazır
lastReviewed: 2026-07-15
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
| GlassIconButton | Galerinin ok/kapat kontrolleri bundan kurulur |

## 2. Semantik sözleşme

- Kök: `<div>` (`HTMLAttributes<HTMLDivElement>` rest'i alır).
- Sahne görseli `<button type="button">` içindedir; accessible name
  `Görseli büyüt: {alt}`. Her görsel için `alt` **zorunlu** (API'de required).
- Thumbnail'lar `<button type="button">`; aktif olan `aria-current` taşır.
- Lightbox: `createPortal(document.body)` + `role="dialog"` + `aria-modal="true"`
  + `aria-label="Görsel {n} / {m}: {alt}"` + `tabIndex={-1}`; açılışta dialog'a
  `focus()` verilir.
- DOM değişmezleri: sayaç metni `{n} / {m}`; ok ikonları `aria-hidden` SVG;
  `images` boşsa component **null** döner.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| stage | ✅ | aktif görsel (buton) | GlassSurface `shape=20`, `thickness 0.4`; tıklama lightbox açar |
| stage okları | `images.length > 1` | GlassIconButton çifti | Hep cam; `material`'dan etkilenmez |
| counter | `images.length > 1` | `n / m` | Koyu pill, sağ-alt |
| thumbs | `images.length > 1` | tüm görseller | Yatay scroll, scrollbar gizli; thumb `alt=""` (ad butonun aria-label'ında) |
| lightbox | tıklamayla | büyük görsel + kontroller | Portal; aşağıda §7 |

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

- **Açılış:** sahne butonuna tıklama/Enter → portal ile `document.body`'ye
  lightbox; dialog `focus()` alır.
- **Kapanış:** Escape · backdrop tıklaması (yalnız `e.target === currentTarget`)
  · Kapat butonu.
- **Keyboard (lightbox açıkken, window düzeyinde):** `Escape` kapatır,
  `ArrowLeft`/`ArrowRight` gezinir — gezinme sayfadaki galeriye de yansır
  (tek state).
- **Focus dönüşü: uygulanmadı.** Kapanınca odak tetikleyen butona dönmez —
  bilinen borç. Focus trap da yok; `aria-modal` var ama Tab arka plana
  kaçabilir (bkz. Açık Kararlar).
- Lightbox içi görsel gezinme butonları `size="lg"` (dokunma hedefi).
- Controlled kullanım: N/A — index dışarıdan sürülemez.

## 8. İçerik

- `alt` zorunlu ve anlamlı olmalı; a11y adları (`Görseli büyüt: …`,
  `{n}. görsele git: …`) alt'tan türetilir.
- Sahne `object-fit: cover` (kırpar); lightbox `object-fit: contain` (tamamını
  gösterir).
- Boş `images` → null; tek görsel → yalnız sahne. Yükleme/hata placeholder'ı yok
  (çağıranın işi).
- Kontrol etiketleri Türkçe sabit ('Önceki görsel', 'Kapat' vb.) — i18n prop'u yok.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| stage | malzeme/gölge | GlassSurface (`thickness 0.4`) |
| stage / thumb | focus outline | `--lg-accent` (fallback `#0a84ff`) |
| oklar, kapat | tüm görünüm | GlassIconButton token'ları |

**Borç:** `shape={20}` sayı olarak raw (değer `--lg-radius-card` ile örtüşür ama
bağlı değil) · sahne iç radius `15px`, thumb `12px`, lightbox görsel `16px` raw ·
thumb ölçüsü `72×54px` · sayaç `12px/600` ve lightbox sayacı `13px/600` (→
`--lg-text-caption/footnote`) · overlay `rgba(0,0,0,.82)` + `blur(18px)` +
`z-index: 1000` raw · boşluklar (`gap: 10px/8px`, ofsetler 14/20/24px) raw.

## 10. Storybook kapsamı

Var: `Default`, `SingleImage`, `Wide` (16/9), `Materials` (glass/flat yan yana,
oklar iki tarafta da cam), `CokGorsel` (20 görsel + uzun `alt` → thumb overflow),
`DarContainer` (320px responsive) — hepsi `onIndexChange: fn()` ile, autodocs
açık. Arka plan/tema toolbar'dan (Arka plan + Tier global'leri). **Eksik:**
Playground, Erişilebilirlik (lightbox klavye akışı) story'si. Thumb hover/focus
CSS state'idir — control/story yapılmaz; aktif thumb tüm story'lerde görünür.

## 11. Test kabul kriterleri

- [x] ilk görsel + sayaç (unit)
- [x] ok gezinmesi + `onIndexChange`
- [x] uçlarda sarma
- [x] lightbox açılır, Escape kapatır
- [x] lightbox'ta ok tuşları gezinir
- [x] thumbnail atlaması
- [x] boş `images` → null
- [ ] kapanışta focus tetikleyiciye döner (yazılmadı — davranış da yok)
- [ ] backdrop tıklaması kapatır, görsele tıklama kapatmaz
- [ ] `material='flat'`te okların cam kaldığı (visual)

## 12. Do / Don't

- ✅ İçerik yoğun sayfada sahneye `material="flat"` ver; kontroller cam kalır.
- ✅ Her görsele gerçek, ayırt edici `alt` yaz — tüm a11y adları ondan türür.
- ❌ Galeriyi controlled index'le sürmeye çalışma; ihtiyaçsa API genişletilmeli.
- ❌ Lightbox'ı kendi modal'ının içine koyma; portal `document.body`'ye gider.

**Bilinen kısıtlar:** `images` dizisi kısalırsa mevcut `index` yeniden
kıstırılmaz. **Açık kararlar:** focus dönüşü + focus trap eklenmesi · controlled
`index` prop'u · kontrol etiketlerinin i18n'i · body scroll kilidi (lightbox
açıkken sayfa kayabiliyor).
