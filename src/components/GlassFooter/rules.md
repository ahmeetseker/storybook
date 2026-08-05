---
name: GlassFooter
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassFooter Kuralları

## 1. Amaç

Site footer'ı — link sütunları, marka bloğu, sosyal linkler ve yasal satır.
Her zaman flat + hairline üst çizgi; cam kullanılmaz (büyük içerik yüzeyi).

- **Kullan:** kamuya açık site sayfalarının alt bölümü.
- **Kullanma:** uygulama içi panel altları, dialog aksiyon satırları.

## 2. Semantik sözleşme

- Kök `<footer>` (contentinfo landmark); link grupları `<nav aria-label="Alt bilgi">`.
  Site footer'ı `<main>` dışında render edilir; aksi halde implicit contentinfo
  semantiği tarayıcı erişilebilirlik ağacında kaybolabilir.
- Sütun başlıkları heading DEĞİL — `<span>` + başlıkla adlandırılmış `<ul>`
  listesi (sayfa outline'ını kirletmez).
- Linkler gerçek `<a>`; `href` yoksa `#` + `preventDefault` + `onClick`.

## 3. Anatomy

| Slot       | Zorunlu             | Kurallar                                                  |
| ---------- | ------------------- | --------------------------------------------------------- |
| legal      | ✅                  | Telif + yasal linkler; her varyantta görünür              |
| columns    | —                   | `{title, links[]}`; slim/centered'da satıra düzleştirilir |
| brand      | —                   | Logo + kısa açıklama + iletişim satırları + güven rozeti  |
| highlights | —                   | Son kolon: yuvarlak görselli mini kartlar (son eklenen ilanlar); yalnız `columns` ailesi |
| socialLinks| —                   | Alt barın sağ ucundaki yuvarlak ikon bağlantıları         |
| social     | —                   | Serbest sosyal slot (ReactNode); `socialLinks` verilirse render edilmez |
| cta        | yalnız `cta`        | Üst vurgu bandı (accent tint zemin)                       |
| newsletter | yalnız `newsletter` | Kayıt formu slotu (demo-grade)                            |

## 4. Public API

| Ad                                | Type                                                 | Default     |
| --------------------------------- | ---------------------------------------------------- | ----------- |
| columns                           | `GlassFooterColumn[]`                                | `[]`        |
| legal                             | `ReactNode`                                          | — (zorunlu) |
| cta / brand / social / newsletter | `ReactNode`                                          | —           |
| highlights                        | `GlassFooterHighlights`                              | —           |
| socialLinks                       | `GlassFooterSocialLink[]`                            | —           |
| variant                           | `'columns'\|'slim'\|'cta'\|'centered'\|'newsletter'` | `'columns'` |

`GlassFooterHighlights`: `{ title, items }` ·
`GlassFooterHighlightItem`: `id · label · href? · onClick? · image? · meta? · previousMeta?`
(`previousMeta` üstü çizili eski değer) ·
`GlassFooterSocialLink`: `id · label · href · icon` (ikon dekoratif, ad `label`'dan).

`...rest` yok.

## 5. Seçenek eksenleri

`material` yok — footer hep flat. `cta`/`newsletter` slot'ları kendi varyantı
dışında sessizce render edilmez.

## 6. State modeli

Stateless. Link hover/focus CSS'te (`:focus-visible` halka, `hover: hover`).

## 7. Davranış

- Responsive: kök `inline-size` container'dır. Genişte marka | link sütunları |
  vitrin üç bloklu ızgara; orta kapsayıcıda bloklar alt alta ve link sütunları
  ikiye, dar kapsayıcıda tek sütuna iner. Dar kapsayıcıda legal satırı sola
  hizalanır, sosyal ikonlar telifin altına geçer.
- Link sütunlarının sayısı veriden gelir (`--footer-columns` inline değişkeni):
  sabit dört yazıldığında üç sütunlu footer'da dördüncü yuva boş kalıyor ve
  vitrin kolonuyla arada boşluk oluşuyordu.
- `pointer: coarse` ortamda link hedefi ve sosyal ikon dairesi 44px'e yükselir.

## 8. İçerik

- Sütun başlıkları kısa ve sentence case yazılır (Keşfet, Karar araçları).
- Marka + üç link sütunu + vitrin = beş blok; dördüncü bir link sütunu eklemek
  yerine başlıkları birleştirin (1120px içerik genişliği fazlasını taşımaz).
- `socialLinks` ikonları dekoratiftir; erişilebilir ad `label`'dan gelir.
  Serbest `social` slotu kullanılırsa `aria-label`'ı çağıran verir.
- Vitrin görselleri dekoratiftir (`alt=""`); bilgi `label`/`meta` ile verilir.
  `previousMeta` yalnız gerçek bir indirimde kullanılır.
- Story ve production içeriğinde yönü olmayan `href="#"` link kullanılmaz.

## 9. Token eşlemesi

| Part                                   | Token                                                     |
| -------------------------------------- | --------------------------------------------------------- |
| zemin / çizgiler                       | `--lg-surface` / `--lg-hairline`                          |
| metinler                               | `--lg-label(-secondary)`                                  |
| cta bandı                              | `color-mix(--lg-accent 10%)` zemin, `--lg-radius-card`    |
| focus halkası                          | `--lg-accent`                                             |
| marka / sütun başlığı / yasal          | `--lg-text-headline` (17px) / `--lg-text-footnote` (13px) |
| gap/padding'ler (4/8/12/16/20/24/32px) | `--lg-space-1..7`                                         |
| link yüksekliği (imleçli)              | `--lg-space-6` (24px — WCAG 2.2 AA 2.5.8 tabanı)          |
| link dokunma hedefi (coarse)           | `--lg-control-hit` (44px)                                 |
| vitrin görseli / sosyal daire          | `--lg-radius-capsule`; satır hedefi `--lg-control-hit`    |
| vitrin fiyatı / eski fiyat             | `--lg-text-caption` / `--lg-danger` (üstü çizili)         |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkende toplandı (`.root { --content-max: 1120px; --pad-top:
44px; --section-gap: 28px; --row-gap: 18px; --item-gap: 10px; --band-pad: 26px
28px; --brand-col-min: 220px; --text-sm: 14px; --thumb-size: 42px;
--social-size: 40px; --meta-gap: 2px; }`) — 14px, footnote (13) ile
body (15) arasında ara adım. `--link-min-h` 2026-08-03'te raw 24px olmaktan
çıkıp `--lg-space-6`'ya bağlandı: footer linki bir metin hedefidir, kontrol
ölçeğinin (36/40/44/52) bir kademesi değil; 24px WCAG 2.2 AA 2.5.8 tabanıdır.
`pointer: coarse`'ta link `min-height: var(--lg-control-hit)` — dokunmatikte
görünür ölçü doğrudan 44px hedefe çıkar (`--lg-control-md` yerine `hit`
yazılıyor: niyet "kontrol boyu" değil "dokunma hedefi", ölçek değişse de 44px
sabit kalmalı). Görünmez `::after` taşması kullanılmadı — footer linkleri
`--lg-space-2` boşluklu bir kolon listesinde ve 20px'lik bir taşma komşu
hedeflerle üst üste binerdi. Container eşikleri
`64rem` ve `32rem`; CSS custom property media/container koşulunda
kullanılamadığı için doğrudan yazılır. Letter-spacing değerleri (`-0.022em`,
`-0.01em`) token'sız raw kalır.

## 10. Storybook kapsamı

Default(columns + vitrin + sosyal), Playground, Slim, Cta, Centered, Newsletter,
VaryantKarsilastirma (5 varyant alt alta — seçim story'si), UzunIcerik,
Responsive (390px), Focus, VitrinsizVeSosyalsiz, SerbestSosyalSlot,
Erisilebilirlik.

## 11. Test kabul kriterleri

- [x] contentinfo + "Alt bilgi" navigation
- [x] href'siz link onClick
- [x] slim: başlıksız düzleştirilmiş linkler
- [x] cta bandı yalnız cta'da
- [x] newsletter slotu yalnız newsletter'da
- [x] centered yapısı
- [x] data-variant işareti
- [x] vitrin kolonu: bağlantı + üstü çizili eski değer + dekoratif görsel
- [x] socialLinks: erişilebilir ad `label`'dan, serbest slotun yerini alır
- [x] responsive + focus Storybook kapsamı
- [ ] 320px responsive (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfada tek GlassFooter (tek contentinfo landmark).
- ✅ Site footer'ını `<main>` sonrasında render et.
- ✅ Sosyal ikonlara `aria-label` ver.
- ❌ Footer'a cam/backdrop-filter ekleme.
- ❌ Sütun başlıklarını heading'e çevirme.

**Açık kararlar:** app-store rozet slotu (v2) · dil seçici slotu (v2) ·
`tone` ekseni bilinçli yok — flat zemin tema token'larından döner; ihtiyaç
doğarsa v2.

## Changelog

- 2026-08-04: Geniş footer anatomisi genişletildi — `highlights` (son eklenen
  ilanlar kolonu, yuvarlak görselli mini kartlar) ve `socialLinks` (alt barın
  sağ ucunda yuvarlak ikon bağlantıları) eklendi. Link sütun sayısı veriden
  okunuyor (`--footer-columns`), sabit dört yuva kaldırıldı. Serbest `social`
  slotu korunuyor; ikisi verilirse `socialLinks` kazanır.
- 2026-08-03: Yeni kontrol ölçeğine uyarlandı. `--link-min-h` raw 24px yerine
  `--lg-space-6`e, `pointer: coarse` link hedefi `--lg-control-md` yerine
  niyeti açık `--lg-control-hit`e bağlandı. Görsel ölçü değişmedi.
