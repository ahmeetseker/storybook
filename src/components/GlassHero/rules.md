---
name: GlassHero
category: içerik
status: hazır
lastReviewed: 2026-07-16
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
| title | ✅ | Tek cümle; 760px max genişlik |
| subtitle | — | 1-2 cümle; `--lg-label-secondary` |
| search | — | Yalnız `variant="search"` |
| quickLinks | — | Yalnız `variant="search"`; kısa link seti |
| actions | — | Tüm varyantlarda; GlassButton önerilir |
| media | — | split: yan panel · showcase: tam arka plan |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| title | `ReactNode` | — |
| subtitle | `ReactNode` | — |
| actions / media / search / quickLinks | `ReactNode` | — |
| variant | `'search'\|'split'\|'showcase'\|'centered'` | `'search'` |
| align | `'center'\|'start'` | varyanta göre (search/centered→center) |
| titleAs | `'h1'\|'h2'\|'div'` | `'h2'` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` |

## 5. Seçenek eksenleri

`material` yok — hero içerik katmanıdır, hep flat. `search`/`quickLinks` diğer
varyantlarda sessizce render edilmez (yasak kombinasyon yerine no-op).

## 6. State modeli

Stateless sunum component'i. Hover/focus slot içeriğinin kendi kurallarındadır.

## 7. Davranış

- Responsive: split grid `auto-fit + minmax(min(400px,100%),1fr)` — dar ekranda
  tek kolona düşer, 320px'te taşma yok.
- Animasyon yok (v1) — eklenirse yalnız transform/opacity + reduced-motion koşulu.

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

**Borç (raw):** padding 56/150px, clamp font aralığı 30-46px, gap değerleri,
max-width 640/660/760px.

## 10. Storybook kapsamı

Default(search), Playground, Split, Showcase, Centered, H1Baslik,
VaryantKarsilastirma (4 varyant alt alta — seçim story'si). Temalar toolbar'dan.

## 11. Test kabul kriterleri

- [x] default h2 / titleAs h1
- [x] search slotu yalnız search varyantında
- [x] split media paneli
- [x] showcase scrim + aria-hidden medya
- [x] actions render
- [x] data-variant işareti
- [ ] showcase kontrastı (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfa hero'suysa `titleAs="h1"` ver.
- ✅ showcase görseline `alt=""` ver (dekoratif).
- ❌ Hero'ya cam zemin verme; cam yalnız içindeki kontrollerde.
- ❌ `search` slotuna form dışı blok içerik koyma.

**Açık kararlar:** `as`/rest props · giriş animasyonu preset'i (v2) ·
`--lg-space-*` gelince boşluk borcu.
