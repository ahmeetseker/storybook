---
name: GlassLightbox
category: overlay
status: hazır
lastReviewed: 2026-08-05
---

# GlassLightbox Kuralları

## 1. Amaç

Bir görsel dizisini **tam ekran** gösteren karartılmış katman: tek büyük kare +
ok kontrolleri + sayaç + alt thumbnail şeridi. Sayfadaki herhangi bir kare
(kart, bento ızgarası, galeri sahnesi) tek tıklamayla buraya açılır; arada
ikinci bir panel açılmaz.

- **Kullan:** ilan/ürün görsellerini büyütme, ızgaradan tam ekrana geçiş.
- **Kullanma:** metin/eylem içeren diyalog (→ `GlassModal`), kenardan açılan
  panel (→ `GlassDrawer`), sayfa içi galeri sahnesi (→ `GlassGallery`).

| İlgili | Farkı |
|---|---|
| GlassGallery | Sayfa içi sahne + şerit; büyütme için bu bileşeni kullanır |
| GlassModal | Cam panel + başlık/footer; içerik diyaloğudur, medya görüntüleyici değil |
| GlassIconButton | Lightbox'ın ok/kapat kontrolleri bundan kurulur |

## 2. Semantik sözleşme

- Portal: `createPortal(document.body)`. Kök `role="dialog"` + `aria-modal="true"`
  + `tabIndex={-1}`; açılışta kök `focus()` alır.
- Accessible name: `{label · }Görsel {n} / {m}: {alt}` — `alt` her görselde
  **zorunludur** (API'de required).
- `note` verilirse `aria-describedby` ile bağlanır (footer'daki `<p id>`).
- Thumbnail'lar `<button type="button">`; aktif olan `aria-current` taşır,
  `<img alt="">` dekoratiftir (ad butonun `aria-label`'ındadır).
- DOM değişmezleri: sayaç metni `{n} / {m}`; ikonlar `aria-hidden` SVG;
  `open=false` **veya** `images` boşken hiçbir düğüm render edilmez.
- Sahne cam DEĞİLDİR (karartma zaten katmandır); yalnız kontroller cam.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| stage | ✅ | yatay ray üstünde tüm kareler | `object-fit: contain`; ray sürüklenebilir (`drag="x"`); aktif olmayan kareler `aria-hidden`; boş kare alanına tıklama kapatır (sürükleme jesti sayılmaz), görsele tıklama kapatmaz |
| nav | `images.length > 1` | GlassIconButton çifti | `size="lg"`, `tone="light"`; sahnenin dikey ortası |
| close | ✅ | GlassIconButton | Sağ üst; `tone="light"` |
| counter | `images.length > 1` | `n / m` | Beyaz-alfa kapsül, şeridin üstünde |
| thumbs | `thumbnails && length > 1` | tüm kareler | Film şeridi: aktif kare genişler (120px), komşular daralır (36px / dokunmatikte 44px); yatay scroll (scrollbar gizli); aktif kare ortalanır |
| note | `note` verilirse | tek satır açıklama | Şeridin altında, ortalanmış, soluk |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| open | prop | `boolean` | — | controlled | Görünürlük yalnız dışarıdan sürülür |
| onClose | prop | `() => void` | — | — | Escape · backdrop · Kapat butonu |
| images | prop | `{ src: string; alt: string }[]` | — | — | Boş dizi → render yok |
| index | prop | `number` | — | controlled | Verilirse indeks tamamen çağıranındır |
| defaultIndex | prop | `number` | `0` | uncontrolled | **Her açılışta** yeniden uygulanır |
| onIndexChange | prop | `(index: number) => void` | — | — | Ok butonu, ok tuşu, thumbnail |
| label | prop | `string` | — | — | Dialog adının başına eklenen bağlam |
| note | prop | `ReactNode` | — | — | Görünür açıklama satırı + `aria-describedby` |
| thumbnails | prop | `boolean` | `true` | — | Alt şerit; tek karede zaten çizilmez |
| className | prop | `string` | — | — | Kök katmana |

Ref forward edilmez. Rest prop yayılmaz (kök, katmanın kendisidir).
`index` ile `defaultIndex` birlikte kullanılmaz: `index` verildiği anda bileşen
kendi state'ini tutmaz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `thumbnails=true`, `defaultIndex=0`, `label`/`note` yok.

| Kural / türetilen | Davranış |
|---|---|
| `images.length <= 1` | Ok, sayaç ve şerit render edilmez; ray sürüklenmez; yalnız kare + kapat |
| `thumbnails=false` | Şerit yok; gezinme oklar, klavye ve sürüklemeyle |
| Ok/klavye uçlarda | Sarmalar (modulo): son→ilk, ilk→son |
| Sürükleme uçlarda | Kıstırır (sarmaz): uçta ters yöne çekmek geri yaylanır — sarma bir jestte ekranı ters yöne uçururdu |
| Kontroller | Her zaman cam + `tone="light"` (koyu katman üstü) |
| `material`/`tone` ekseni | Yok — katman tek malzemedir (karartma), cam üstüne cam açılmaz |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / DOM |
|---|---|---|---|
| open | prop | — | Kapalıyken portal içeriği yok |
| index (değer) | `index` prop ya da internal | — | `aria-label` sayacı, thumb `aria-current` |
| thumb hover | CSS | — | opacity .6 → 1 |
| thumb aktif | index | hover görseli | beyaz border + tam opacity + genişleme (120px) |
| dragging | pointer | ray yay animasyonu | Sürükleme sürerken ray ele bırakılır; jest bitince aktif kareye yaylanır |
| focus-visible | CSS | — | 2px `--lg-accent` outline (thumb) |

`disabled` ekseni yok. Katman: availability (open) → value (index) →
interaction (hover).

## 7. Davranış (overlay sözleşmesi)

- **Açılış:** `open=true` → portal; kök `focus()` alır, `body` scroll kilitlenir
  (`overflow: hidden`), uncontrolled ise indeks `defaultIndex`'e döner.
- **Kapanış:** `Escape` · katman boşluğuna tıklama (`e.target === currentTarget`,
  hem kök hem sahne) · Kapat butonu. Kapanışta `body` eski `overflow`'una döner
  ve odak **tetikleyici öğeye geri verilir**.
- **Keyboard:** `Escape` kapatır; `ArrowLeft`/`ArrowRight` gezinir (pencere
  düzeyinde dinlenir, tek kare varsa yok sayılır); `Tab` focus trap ile
  kontroller arasında sarar — arka plana kaçmaz.
- **Motion:** katman opacity ile açılır/kapanır (`AnimatePresence`). Sahne
  yatay bir raydır: açılışta animasyonsuz aktif kareye oturur (`x.jump`),
  sonraki her indeks değişiminde `springs.sidebar` ile kayar (transform).
  Pencere boyutu değişince ray animasyonsuz yeniden hizalanır.
  `prefers-reduced-motion` altında kayma kısa bir tween'e (0.15s), şerit
  genişlemesi anlık geçişe düşer.
- **Sürükleme (swipe):** ray `drag="x"` taşır (`dragMomentum` kapalı). Jest
  sonu kararı: |yatay hız| > 500 → hız yönünde bir kare; değilse |ofset| >
  sahne genişliğinin %30'u → ofset yönünde bir kare; ikisi de değilse geri
  yaylanır. Uçlarda kıstırır. Sürükleme de `onIndexChange` yayar; jestin
  bıraktığı click kapatma sayılmaz.
- **Şerit:** kare değişince aktif thumbnail genişler (width animasyonu motion
  ile TSX sabitlerinden sürülür — bilinçli istisna: film şeridi etkisi
  transform ile verilemez, şerit küçük olduğundan layout maliyeti sınırlı) ve
  `scrollIntoView` ile ortalanır (jsdom'da metod yoksa sessizce atlanır).
- **Controlled/uncontrolled:** `index` verilirse gezinme yalnız `onIndexChange`
  yayar; çağıran state'i güncellemezse gösterilen kare değişmez.

## 8. İçerik kuralları

- `alt` zorunlu ve ayırt edici olmalı — dialog adı ve thumb adları ondan türer.
- `label` bağlamdır, başlık değildir: ekranda **yazılmaz**, yalnız erişilebilir
  ada girer (tam ekranda görselin önüne metin konmaz).
- `note` görünür metindir; uzun cümle sarar (`text-wrap: pretty`), genişliği
  görselin genişliğiyle sınırlıdır.
- Kare `contain` ile gösterilir: dikey/yatay oran korunur, kırpma yapılmaz.
- Yükleme/hata yer tutucusu yoktur — gerileme karesini çağıran seçer.
- Kontrol etiketleri Türkçe sabittir ('Önceki görsel', 'Sonraki görsel',
  'Kapat', '{n}. görsele git: …') — i18n prop'u yok.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| sahne / footer boşlukları | padding, gap | `--lg-space-6` / `--lg-space-5` / `--lg-space-3` / `--lg-space-2` |
| sayaç | radius / renk / tipografi | `--lg-radius-capsule` / `--lg-on-scrim` / `--lg-text-footnote` |
| note | renk / tipografi | `--lg-on-scrim` / `--lg-text-caption` |
| thumb | focus outline | `--lg-accent` (fallback `#0a84ff`) |
| ok / kapat | tüm görünüm | GlassIconButton token'ları |

**Borç (raw / mikro-geometri):** token karşılığı olmayan değerler katman
kökünde yerel değişkende toplandı (`.lightbox { --overlay-bg: rgba(0,0,0,.82);
--overlay-blur: 18px; --image-radius: 16px; --image-max-w: 1200px;
--image-shadow: 0 24px 80px rgba(0,0,0,.5); --pill-bg: rgba(255,255,255,.14);
--pill-pad: 4px 14px; --thumb-h: 54px; --thumb-gap: 2px; --thumb-radius: 12px;
--thumb-ring: 2px; --thumb-active-border: rgba(255,255,255,.9);
--media-placeholder: rgba(0,0,0,.2); --fade: .18s ease; }`). Thumb
GENİŞLİKLERİ CSS'te değil TSX sabitlerindedir (`THUMB_FULL_PX: 120`,
`THUMB_COLLAPSED_PX: 36`, dokunmatikte `THUMB_COLLAPSED_COARSE_PX: 44`) —
motion width'i sürdüğü için tek kaynak oradadır. `--overlay-bg`,
`--lg-scrim` (`rgba(10,12,16,.55)`) ile birebir örtüşmez — medya için bilinçli
daha koyu. Görsel gölgesi hiçbir `--lg-shadow-*` ile örtüşmediğinden raw kaldı.
`z-index: 1000` ve motion süreleri (`.12s`/`.2s`) de raw.

## 10. Storybook kapsamı

Var: `Default` (tetikleyici + focus dönüşü), `Playground` (Controls),
`TekGorsel` (tek kare → kontrolsüz), `SeritsizGezinme` (`thumbnails=false`),
`ControlledIndeks` (dışarıdan sürülen indeks), `UzunIcerik` (20 kare + uzun TR
`alt`/`note` → şerit taşması), `Erisilebilirlik` (focus/Tab/Escape akışı).
Autodocs açık. **Eksik:** görsel regresyon (koyu katman + cam kontrol
kontrastı) story'si. Hover/focus CSS state'idir — control yapılmaz.

## 11. Test kabul kriterleri

- [x] açıkken dialog + `aria-modal` + ad; kapalıyken/`images` boşken render yok
- [x] ok butonları gezinir, uçlarda sarar
- [x] ok tuşları gezinir, thumbnail atlar
- [x] Escape · Kapat · boşluk tıklaması `onClose`; görsele tıklama çağırmaz
- [x] controlled `index` dışarıdan sürülür, kendi kendine değişmez
- [x] `note` → `aria-describedby`
- [x] `thumbnails=false` şeridi kaldırır
- [x] açılışta scroll kilidi, kapanışta odak tetikleyiciye döner
- [x] Tab odağı katman içinde tutar
- [x] ray bütün kareleri çizer; aktif olmayanlar `aria-hidden`
- [ ] koyu katmanda kontrol kontrastı (visual)
- [ ] sürükleme jestinin kendisi (jsdom pointer jestini süremez — davranış var,
      test tarayıcıda elle/Playwright ile)

## 12. Do / Don't

- ✅ Izgaradaki kareyi doğrudan buraya aç: tek tıklamada tam ekran.
- ✅ Temsili/telifli görsel gibi künye cümlelerini `note` ile görünür tut.
- ✅ Sayfadaki galeriyle indeks paylaşmak için `index` + `onIndexChange` kullan.
- ❌ Katmanın içine cam panel/kart koyma (cam üstüne cam yok).
- ❌ `label`'ı başlık yerine kullanma; ekranda görünmez.
- ❌ Kendi modalının içine gömme — portal `document.body`'ye gider.

**Bilinen kısıtlar:** zoom/pan yok; `images` dizisi kısalırsa controlled
`index` çağıranın sorumluluğundadır (bileşen yalnız görüntülerken kıstırır);
şerit genişleme animasyonu width sürer (transform değil) — bilinçli, belgeli
istisna (bkz. §7).
**Açık kararlar:** pinch-zoom · kontrol etiketlerinin i18n'i · video/360°
kalemlerin aynı katmanda gösterilmesi.

## Changelog

- 2026-08-07 — Sahne sürüklenebilir raya çevrildi (drag="x", hız/ofset eşikli
  snap, uçlarda kıstırma); thumbnail şeridi film şeridine çevrildi (aktif kare
  genişler, komşular daralır — genişlikler TSX sabitlerinde). Ok/klavye sarma
  davranışı ve overlay sözleşmesi değişmedi.
- 2026-08-05 — İlk sürüm. `GlassGallery`'nin iç lightbox'ı buraya taşındı;
  üzerine alt thumbnail şeridi, `note` satırı, focus trap, scroll kilidi,
  kapanışta focus dönüşü ve controlled indeks eklendi.
