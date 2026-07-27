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
| brand      | —                   | Logo + kısa açıklama + güven rozeti                       |
| social     | —                   | `aria-label`'lı ikon linkleri                             |
| cta        | yalnız `cta`        | Üst vurgu bandı (accent tint zemin)                       |
| newsletter | yalnız `newsletter` | Kayıt formu slotu (demo-grade)                            |

## 4. Public API

| Ad                                | Type                                                 | Default     |
| --------------------------------- | ---------------------------------------------------- | ----------- |
| columns                           | `GlassFooterColumn[]`                                | `[]`        |
| legal                             | `ReactNode`                                          | — (zorunlu) |
| cta / brand / social / newsletter | `ReactNode`                                          | —           |
| variant                           | `'columns'\|'slim'\|'cta'\|'centered'\|'newsletter'` | `'columns'` |

`...rest` yok.

## 5. Seçenek eksenleri

`material` yok — footer hep flat. `cta`/`newsletter` slot'ları kendi varyantı
dışında sessizce render edilmez.

## 6. State modeli

Stateless. Link hover/focus CSS'te (`:focus-visible` halka, `hover: hover`).

## 7. Davranış

- Responsive: kök `inline-size` container'dır. Genişte dört, orta kapsayıcıda
  iki, dar kapsayıcıda tek sütun görünür. Marka orta genişlikten itibaren
  navigation üstüne çıkar; dar kapsayıcıda legal satırı sola hizalanır.
- `pointer: coarse` ortamda link hedefi 44px'e yükselir.

## 8. İçerik

- Sütun başlıkları kısa ve sentence case yazılır (Keşfet, Karar araçları).
- Sosyal ikon linklerinde `aria-label` zorunlu (story'deki `SocialIcon` deseni, 44px dokunma hedefi).
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
| link dokunma hedefi (coarse)           | `--lg-control-md` (coarse bağlamda birebir 44px)          |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkende toplandı (`.root { --content-max: 1120px; --pad-top:
44px; --section-gap: 28px; --row-gap: 18px; --item-gap: 10px; --band-pad: 26px
28px; --brand-col-min: 220px; --text-sm: 14px; --link-min-h:
24px; }`) — 14px, footnote (13) ile body (15) arasında ara adım; 24px link
yüksekliği kontrol ölçeği (32/40/48/56) dışında olduğundan control token'ı
verilmedi. `pointer: coarse`'ta link `min-height: var(--lg-control-md)` —
44px'e büyüme dokunmatikte tasarımın istediği davranış. Container eşikleri
`64rem` ve `32rem`; CSS custom property media/container koşulunda
kullanılamadığı için doğrudan yazılır. Letter-spacing değerleri (`-0.022em`,
`-0.01em`) token'sız raw kalır.

## 10. Storybook kapsamı

Default(columns), Playground, Slim, Cta, Centered, Newsletter,
VaryantKarsilastirma (5 varyant alt alta — seçim story'si), UzunIcerik,
Responsive (390px), Focus, Erisilebilirlik. Temalar toolbar'dan.

## 11. Test kabul kriterleri

- [x] contentinfo + "Alt bilgi" navigation
- [x] href'siz link onClick
- [x] slim: başlıksız düzleştirilmiş linkler
- [x] cta bandı yalnız cta'da
- [x] newsletter slotu yalnız newsletter'da
- [x] centered yapısı
- [x] data-variant işareti
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
