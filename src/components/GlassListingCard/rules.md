---
name: GlassListingCard
category: içerik
status: hazır
lastReviewed: 2026-08-04
---

# GlassListingCard Kuralları

## 1. Amaç

Tıklanabilir ilan kartı: görsel + başlık + konum + fiyat (+rozet). `compact`,
`details`, `overlay` ve `propertyOverlay` yerleşimleri aynı içerik sözleşmesini paylaşır. Kartın tamamı
tek bir `<button>`'dur; basınca `useGlassPress` ile sıvılaşır/jöle salınımı yapar.
İçerik katmanında yaşar, malzemesi seçilebilir (`material`).

- **Kullan:** ilan/ürün listeleri, `GlassCarousel` içindeki öneri kartları.
- **Kullanma:** içinde ikinci bir tıklanabilir öğe gereken kartlar (buton içinde
  buton olmaz — favori ikonu vb. için ayrı kompozisyon gerekir), salt bilgi
  kartı (tıklanmayacaksa buton semantiği yanlış).

| İlgili | Farkı |
|---|---|
| GlassButton | Aksiyon butonu; kart içerik taşımaz |
| GlassGallery | Görsel gezinme; kart tek görsel gösterir |

## 2. Semantik sözleşme

- Element: `GlassSurface as={motion.button}` → gerçek `<button>`; `role`
  override edilmez.
- Accessible name: kartın **tüm metin içeriği** (başlık + konum + fiyat + rozet
  metni) — ayrı `aria-label` verilmez; başlık öne yazılmalı.
- `type` verilmez → tarayıcı default'u `submit`; form içinde `type="button"`
  geçirin (rest ile mümkün).
- DOM değişmezleri: (1) tüm iç parçalar `<span>`'dır (buton içinde blok element
  yok), (2) görsel `alt ?? ''` ile dekoratife düşebilir, (3) rozet media'nın
  sol-üst köşesinde mutlak konumludur.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| image | ✅ | `{ src, alt? }` | 4/3 oranında `cover` kırpma; radius 13px |
| title | ✅ | string | 2 satır clamp, sonrası kırpılır |
| location | — | string | İkincil metin, opacity .65 |
| price | ✅ | string (biçimlenmiş) | Component para biçimlemez; '785.000 TL' hazır gelir |
| badge | — | ReactNode (GlassBadge) | Sol üst overlay; metni a11y adına karışır — kısa tut |
| statuses | — | `{ label, tone? }[]` | Sol üst dikey istif; opak kapsül (yüzey zemin + semantic metin) — doğrulama HARİÇ tüm statülerin tek dili |
| amenities | — | `{ label, icon? }[]` | Zengin varyantlarda tek satırlık olanak chip'leri |
| reviewCount | — | string | Konum satırının karşı ucundaki hazır değerlendirme metni |
| actionLabel | — | string | Görsel eylem etiketi; ayrı bir iç buton değildir |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| image | prop | `{ src: string; alt?: string }` | — | `alt` yoksa `''` (dekoratif) |
| title | prop | `string` | — | HTML `title` attribute Omit edilmiştir |
| price | prop | `string` | — | Hazır biçimli fiyat metni |
| location | prop | `string` | — | Opsiyonel konum satırı |
| badge | prop | `ReactNode` | — | Sol üst rozet |
| badgePlacement | prop | `'inset'\|'corner'` | `'inset'` | `corner` GlassRibbon gibi köşeye kilitli bileşenler için |
| statuses | prop | `GlassListingCardStatus[]` | — | Opak statü kapsülleri (`tone: 'neutral'\|'success'\|'warning'`); köşe kurdelesi varken istif kurdele penceresinin altından başlar |
| variant | prop | `'compact'\|'details'\|'overlay'` | `'compact'` | Bağımsız yerleşim ekseni |
| priceSuffix | prop | `string` | — | Fiyat dönemi (`/Ay`) |
| reviewCount | prop | `string` | — | Hazır değerlendirme sayısı |
| amenities | prop | `GlassListingCardAmenity[]` | — | Olanak listesi |
| actionLabel | prop | `string` | `'Detayları Gör'` | Zengin varyantların CTA etiketi |
| pricePrefix | prop | `string` | — | Fiyat öncesi kısa etiket (`Liste:`) |
| metrics | prop | `GlassListingCardMetric[]` | — | Konut kartındaki kısa değer/etiket çiftleri |
| seller | prop | `string` | — | İlan sahibi |
| listedAt | prop | `string` | — | Hazır yayın zamanı |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e |
| material | prop | `'glass'\|'flat'` | — (Surface default: `'glass'`) | İçerik katmanında `flat` önerilir |
| disabled | prop | `boolean` | — | Native + basınç animasyonunu da kapatır |
| ...rest | — | `Omit<ButtonHTMLAttributes, 'title'>` | — | `onClick` vb. |

Event: `onClick` — `disabled` iken çalışmaz (native + `pointer-events: none`).
Basınç `onPointerDown/Up/Leave/Cancel` handler'ları `useGlassPress`'ten gelir,
dışarı sızmaz (rest'teki aynı isimli handler'lar **ezilir** — bilinen kısıt).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant='compact'`, `tone='auto'`, `material` verilmez
(compact için Surface default cam; zengin varyantlar flat), rozet yok.

| Kural / türetilen | Davranış |
|---|---|
| `size` ekseni | ❌ yok — geometri `variant` yerleşiminden türetilir |
| `variant='details'` | 420px açık içerik kartı; medya üstte, bilgi altta |
| `variant='overlay'` | 420px medya üstü içerik; scrim ile okunurluk |
| `variant='propertyOverlay'` | 320px, 4/5 konut medyası; alt scrim üstünde fiyat, adres, metrik ve satıcı künyesi |
| `disabled` | hover + basınç animasyonu bastırılır |
| `prefers-reduced-motion` | `useGlassPress` kendini kapatır (spring'ler çalışmaz) |
| hover/active prop olarak | ❌ — yalnız CSS + press hook |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| hover | CSS (`hover:hover`, `:not(:disabled)`) | — | `rgba(255,255,255,.16)` zemin |
| active (basılı) | `useGlassPress` | — | `pressLiquefy`: displacement + `transformScale` küçülme, bırakınca jöle spring'iyle dönüş |
| focus-visible | CSS | — | 2px `--lg-accent` halka, offset 2px |
| disabled | native + hook opsiyonu | hover, active | opacity .45 + `pointer-events: none` + cursor default |

Katman sırası: availability (disabled) → interaction (hover/active/focus).
Hook'un `glowX/glowY/glowOpacity` değerleri kartta **kullanılmaz** (parmak ucu
ışıması yalnız GlassButton'da).

## 7. Davranış

- Keyboard: Enter/Space aktive eder (native button). Klavye aktivasyonunda
  basınç animasyonu oynamaz (yalnız pointer event'leri dinlenir) — kabul edilen
  davranış.
- Pointer: `onPointerDown` basınç konumunu ölçer ve sıvılaşmayı başlatır;
  Up/Leave/Cancel hepsi bırakır (parmak kart dışına kayarsa animasyon takılı
  kalmaz).
- `-webkit-tap-highlight-color: transparent` — dokunmatik native vurgu kapalı.
- Controlled/uncontrolled, async, overlay: N/A — durum tutmaz, katman açmaz.

## 8. İçerik

- Başlık 2 satırla sınırlı (`-webkit-line-clamp: 2`); uzun TR başlıklar kırpılır,
  tam metin detay sayfasının işidir.
- `price` serbest metindir; biçim tutarlılığı ('1.050.000 TL') çağıranın
  sorumluluğu.
- `image.alt`: bilgi taşıyorsa doldurun; başlık zaten kartı adlandırıyorsa boş
  bırakmak (dekoratif) doğrudur — ikisi aynı metni tekrarlamasın.
- Rozet metni 1-2 kelime (a11y adına ve dar köşeye girer).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | malzeme/gölge | GlassSurface (`thickness 0.35`, `interactive`) |
| root | focus outline | `--lg-accent` (fallback `#0a84ff`) |
| root | font | miras (`font: inherit`) |

**Borç (raw / mikro-geometri):** birebir karşılığı olanlar token'a bağlandı —
konum 12px → `--lg-text-caption`, rozet ofseti 8px → `--lg-space-2`, gövde
yan/alt padding 8px → `--lg-space-2`, fiyat üst boşluğu 4px → `--lg-space-1`.
Token karşılığı olmayanlar component kökünde yerel değişkene toplandı:
`.card { --card-w: 240px; --card-pad: 6px; --media-radius: 13px;
--body-gap: 3px; --body-pad-top: 10px; --title-text: 14px;
--price-text: 16px; }` (media radius 13px ve tipografi 14/16px ölçek dışı —
"yakın" token'a yuvarlanmadı; `shape={18}` tsx tarafında, bu fazda
dokunulmadı). Bilinçli bırakılanlar: hover `rgba(255,255,255,.16)` beyaz-alfa
cam vurgusu (color-mix'e çevrilmez) · geçiş süresi `0.18s ease` (süre token'ı
yok) · fiyat `800` ağırlığı — **"en fazla 400/600/700" kuralını ihlal etmeye
devam ediyor** (görsel değişiklik yasağı nedeniyle bu fazda düzeltilmedi,
bkz. Açık Kararlar).

## 10. Storybook kapsamı

Var: `Default`, `Playground`, `ReferansVaryantlar`, `SagKartReferansi`, `Variants`, `WithBadge`, `Materials` (glass/flat yan yana), `States`
(default · disabled · flat+disabled), `UzunBaslik` (2 satır clamp), `GridKullanimi`
(carousel-dışı, `auto-fill 240px` grid), `Responsive`, `Erisilebilirlik` — autodocs,
`onClick: fn()`. Arka plan toolbar'dan (Arka plan + Tier global'leri).
Hover/focus/active CSS + press
hook state'idir — control/story yapılmaz (bkz. GlassButton kuralı).

## 11. Test kabul kriterleri

- [x] başlık, fiyat, konum, görsel render (unit)
- [x] `role=button` ile tıklanır, `onClick` çağrılır
- [x] badge verilince görünür
- [x] details/overlay zengin içeriği ve varyant veri niteliğini render eder
- [x] propertyOverlay fiyat, metrik, satıcı ve tarihi render eder
- [x] varsayılan `type="button"` ile form submit etmez
- [ ] `disabled` tıklamayı ve basınç animasyonunu engeller
- [ ] klavye (Enter/Space) aktivasyonu (interaction)
- [ ] 2 satır clamp (visual)
- [ ] reduced-motion'da spring çalışmaz

## 12. Do / Don't

- ✅ İçerik listelerinde `material="flat"` kullan; cam, navigasyon katmanına aittir.
- ✅ Form içinde kullanırken `type="button"` geçir.
- ❌ `badge` içine tıklanabilir öğe koyma — buton içinde buton olur.
- ❌ Karta `onPointerDown` verme; press hook'u onu ezer.

**Bilinen kısıtlar:** rest'teki pointer handler'ları press handler'larınca
ezilir; genişlik sabit olduğundan grid'de esnemez. **Açık kararlar:** genişliğin
prop/parent'a taşınması · fiyat ağırlığının 700'e çekilmesi (token kuralı) ·
tipografinin `--lg-text-*` token'larına bağlanması · `type="button"` default'u.

**Changelog**

- 2026-08-13 — Statü sunumu standardı: yeni `statuses` prop'u. Doğrulama köşe
  kurdelesi (GlassRibbon, `badge` + `badgePlacement="corner"`) olarak kalır;
  DİĞER tüm statü metinleri («Yetki bekliyor · Temsili», «Fiyat düştü»,
  «İnceleniyor» vb.) görselin sol üstünde OPAK, yüksek kontrastlı kapsül
  istifidir (`--lg-surface` zemin + semantic metin rengi + `--lg-shadow-xs`).
  Yarı saydam tonlu pill'ler fotoğraf üstünde okunmuyordu; kontrast artık
  görsele bırakılmaz. Köşe kurdelesiyle birlikte kullanımda istif kurdelenin
  76px penceresinin (GlassRibbon sm `--ribbon-size`, mikro-geometri) altından
  başlar — kırpılma/çakışma olmaz. İlk tüketiciler: `EmlakSearchView` ızgara
  kartı ve `FavoritesWorkspace`.
