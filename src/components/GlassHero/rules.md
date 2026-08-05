---
name: GlassHero
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# GlassHero Kuralları

## 1. Amaç

Sayfa açılış (hero) bölümü — başlık, alt başlık ve slot'lar. Zemin her zaman flat
(içerik katmanı); cam yalnız çağıranın slot'lara koyduğu kontrollerde olabilir.

- **Kullan:** ana sayfa/kurumsal tanıtım/kampanya açılış bölümleri.
- **Kullanma:** sayfa içi ara başlıklar, kart başlıkları.

## 2. Semantik sözleşme

- Kök `<section>` (isimlendirilmemiş — landmark üretmez; gerekiyorsa çağıran
  `aria-label` verir... vermez: rest props yok, Açık Kararlar'da).
- Başlık elementi `titleAs` ile belirlenir (default `h2`); **sayfadaki tek h1
  olacaksa `titleAs="h1"` ver.**
- `showcase` medyası dekoratiftir: sarmalayıcı `aria-hidden`, görsele `alt=""` ver.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| eyebrow | — | Başlığın üstünde; sekme şeridi/etiket/kırıntı yolu; kademeli girişte ilk blok |
| title | ✅ | Tek cümle; 760px max genişlik |
| subtitle | — | 1-2 cümle; `--lg-label-secondary` |
| search | — | Yalnız `variant="search"` ve `variant="split"` |
| quickLinks | — | Yalnız `variant="search"`; kısa link seti |
| actions | — | Tüm varyantlarda; GlassButton önerilir |
| media | — | split: yan panel · showcase: tam arka plan |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| eyebrow | `ReactNode` | — |
| title | `ReactNode` | — |
| subtitle | `ReactNode` | — |
| actions / media / search / quickLinks | `ReactNode` | — |
| variant | `'search'\|'split'\|'showcase'\|'centered'` | `'search'` |
| align | `'center'\|'start'` | varyanta göre (search/centered→center) |
| titleAs | `'h1'\|'h2'\|'div'` | `'h2'` |
| animate | `boolean` | `true` — kademeli giriş + showcase Ken Burns; reduced-motion'da otomatik kapalı |
| ambient | `boolean` | `false` — zeminde süzülen aurora (showcase hariç) |

## 5. Seçenek eksenleri

`material` yok — hero içerik katmanıdır, hep flat.

**Yerleşim değişkenleri (CSS custom property):** çağıran sayfa kökten
ayarlayabilir. `--subtitle-lines` (varsayılan `0`) alt başlık için satır
rezerve eder: sekmeye göre alt başlığı değişen hero'larda 1↔2 satır farkı
kartı ve altındaki her şeyi dikeyde oynatır; en uzun metnin satır sayısı
verilince blok sabit kalır. `--title-size` (varsayılan `clamp(--lg-text-title,
3vw, --lg-text-display)`, 22px→28px) başlık punto akışı — çağıran daha büyük/
küçük bir tavan istiyorsa kök seçicide ezebilir (örn. showcase'te tek başına
kullanılan bir sayfa). `search` yalnız `search` ve
`split` varyantlarında render edilir; `quickLinks` yalnız `search` varyantında.
Diğer varyantlarda sessizce render edilmez (yasak kombinasyon yerine no-op).

## 6. State modeli

Stateless sunum component'i. Hover/focus slot içeriğinin kendi kurallarındadır.

## 7. Davranış

- Responsive: split grid `auto-fit + minmax(min(400px,100%),1fr)` — dar ekranda
  tek kolona düşer, 320px'te taşma yok.
- Kök taşmayı kırpmaz (`overflow: visible`): `search`/`actions` slotuna bağlı
  öneri ve popover panelleri hero sınırının dışında da görünür ve etkileşim alır.
  Görsel kırpma yalnız kendi sınırını yöneten `.showcase` ve `.ambient`
  katmanlarında yapılır. `.ambient` kırpması iki eksenli bir `mask-image` ile
  sönümlendirilir — leke kutudan büyük olduğu için düz kesim, zeminde
  dikdörtgen bir bant olarak görünüyordu; maske kesimi sıfır opaklığa taşır.
- **Animasyon:** kademeli giriş (motion stagger: başlık→alt başlık→slotlar, spring
  260/30); showcase'te Ken Burns (22s scale/translate döngüsü, yalnız transform);
  `ambient` aurora'sı 26-32s süzülme. Hepsi yalnız transform/opacity;
  `prefers-reduced-motion`'da tümü kapalı (JS + CSS çifte koruma).
  Daktilo arama önerisi component'in işi değil — `useTypewriter` hook'u
  (`src/motion/useTypewriter.ts`) slot içeriğinde kullanılır (story örneği).

## 8. İçerik

- Başlık ≤ 8-10 kelime; showcase üstündeki metin `--lg-on-scrim` ile yazılır,
  kontrast scrim token'ının koyuluğuyla garanti edilir.

## 9. Token eşlemesi

| Part | Token |
|---|---|
| zemin | `--lg-bg` |
| başlık/alt başlık | `--lg-label` / `--lg-label-secondary` |
| showcase overlay | `--lg-scrim` (yeni) |
| showcase metin | `--lg-on-scrim` (yeni) |
| alt başlık font-size | `--lg-text-headline` (17px) |
| yatay padding / quickLinks satır gap | `--lg-space-5` (20px) / `--lg-space-2` (8px) |
| başlık font-size | `--title-size`: `clamp(--lg-text-title, 3vw, --lg-text-display)` (22px→28px) |
| dikey padding | `--pad-y`: `clamp(--lg-space-5, 2.4vw, --lg-space-7)` (20px→32px) |
| showcase üst padding | `--showcase-pad-top`: `var(--lg-space-10)` (64px) |
| blob radius | `--lg-radius-capsule` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkende toplandı (`.root { --content-max: 1120px; --stack-gap:
18px; --actions-gap: 10px; --bento-offset: 14px; --quicklink-gap: 14px;
--text-sm: 14px; --title-max-w: 760px; --subtitle-max-w: 640px; --search-max-w:
660px; --split-min: 400px; --split-gap: 36px; --blob-size: 640px; --blob-blur:
110px; }`). `--pad-y`, `--showcase-pad-top` ve başlık punto'su (`--title-size`)
artık token'a bağlı — borç listesinden çıkarıldı. Aurora blob konumları
(−280/−160/−320/−120px) ve keyframe sürüklenme mesafeleri (70/50/−60/−70px)
dekoratif animasyon geometrisi — keyframe içinde `var()` güvenilir
çalışmadığından raw bırakıldı. Animasyon süreleri/easing (22/26/32s,
ease-in-out) token'sız raw kalır.

## 10. Storybook kapsamı

Default(search), Playground, Split, SplitEyebrowVeArama (eyebrow + split'te search),
Showcase, Centered, H1Baslik, VaryantKarsilastirma (4 varyant alt alta — seçim
story'si).

## 11. Test kabul kriterleri

- [x] default h2 / titleAs h1
- [x] eyebrow slotu başlığın önünde render olur
- [x] search slotu search ve split varyantlarında render olur, centered'da olmaz
- [x] split media paneli
- [x] showcase scrim + aria-hidden medya
- [x] actions render
- [x] data-variant işareti
- [x] search/split/centered slot taşmaları kırpılmaz; showcase kendi medyasını
      kırpmaya devam eder
- [ ] showcase kontrastı (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfa hero'suysa `titleAs="h1"` ver.
- ✅ showcase görseline `alt=""` ver (dekoratif).
- ❌ Hero'ya cam zemin verme; cam yalnız içindeki kontrollerde.
- ❌ `search` slotuna form dışı blok içerik koyma.

**Açık kararlar:** `as`/rest props · giriş animasyonu preset'i (v2) ·
ölçek dışı boşluklar (18/14/10/36px) yerel değişkende — token ölçeğine
oturtulması v2 tasarım kararı · `tone` ekseni bilinçli yok — flat zemin tema
token'larından döner; ihtiyaç doğarsa v2.

**Changelog:** 2026-07-30 — Başlık punto'su `--title-size` (`clamp(--lg-text-title,
3vw, --lg-text-display)`, 22px→28px) ile ölçek tavanına bağlandı, sabit
`clamp(30px, 4.5vw, 46px)` kaldırıldı; `--pad-y` (`clamp(--lg-space-5, 2.4vw,
--lg-space-7)`) ve `--showcase-pad-top` (`--lg-space-10`) token'a bağlandı —
her üçü de borç listesinden çıktı.
2026-07-30 — `--subtitle-lines` ile alt başlık satır rezervi;
`.block` tam genişlik (arama slotu `--search-max-w`'yi fiilen kullanır, önceden
içeriğe büzülüyordu) ve ortalı hizada yatay slotlar `justify-content: center`
alır; `.ambient` kenar kesimi maskeyle sönümlendi.
2026-07-27 — `eyebrow` slotu eklendi (başlığın üstünde, kademeli
girişte ilk blok); `search` slotu artık `split` varyantında da render edilir.
2026-07-24 — Kök taşma kırpması kaldırıldı; slot içindeki bağlı paneller hero
dışına çıkabilir. Showcase ve ambient kırpması kendi katmanlarında korundu.
