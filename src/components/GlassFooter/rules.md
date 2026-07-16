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
- Sütun başlıkları heading DEĞİL — `<span>` + `<ul>` listesi (sayfa outline'ını kirletmez).
- Linkler gerçek `<a>`; `href` yoksa `#` + `preventDefault` + `onClick`.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| legal | ✅ | Telif + yasal linkler; her varyantta görünür |
| columns | — | `{title, links[]}`; slim/centered'da satıra düzleştirilir |
| brand | — | Logo + kısa açıklama + güven rozeti |
| social | — | `aria-label`'lı ikon linkleri |
| cta | yalnız `cta` | Üst vurgu bandı (accent tint zemin) |
| newsletter | yalnız `newsletter` | Kayıt formu slotu (demo-grade) |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| columns | `GlassFooterColumn[]` | `[]` |
| legal | `ReactNode` | — (zorunlu) |
| cta / brand / social / newsletter | `ReactNode` | — |
| variant | `'columns'\|'slim'\|'cta'\|'centered'\|'newsletter'` | `'columns'` |

`...rest` yok.

## 5. Seçenek eksenleri

`material` yok — footer hep flat. `cta`/`newsletter` slot'ları kendi varyantı
dışında sessizce render edilmez.

## 6. State modeli

Stateless. Link hover/focus CSS'te (`:focus-visible` halka, `hover: hover`).

## 7. Davranış

- Responsive: sütun grid'i `auto-fit minmax(150px, 1fr)`; 760px altında marka bloğu
  tek kolona iner, legal satırı ortalanır. 320px'te taşma yok.
- `pointer: coarse` ortamda link hedefi 44px'e yükselir.

## 8. İçerik

- Sütun başlıkları tek kelime tercih (Kurumsal, Destek, Yasal, Keşfet).
- Sosyal ikon linklerinde `aria-label` zorunlu (story'deki `SocialIcon` deseni, 44px dokunma hedefi).

## 9. Token eşlemesi

| Part | Token |
|---|---|
| zemin / çizgiler | `--lg-surface` / `--lg-hairline` |
| metinler | `--lg-label(-secondary)` |
| cta bandı | `color-mix(--lg-accent 10%)` zemin, `--lg-radius-card` |
| focus halkası | `--lg-accent` |

**Borç (raw):** padding/gap değerleri, font-size 13/14/17px, 760px breakpoint,
ikon kutusu 44px.

## 10. Storybook kapsamı

Default(columns), Playground, Slim, Cta, Centered, Newsletter,
VaryantKarsilastirma (5 varyant alt alta — seçim story'si), UzunIcerik,
Erisilebilirlik. Temalar toolbar'dan.

Responsive: ayrı story YOK (N/A) — kırılma viewport media query'sindedir
(760px), container'a duyarlı değildir; doğrulama Storybook viewport
toolbar'ıyla yapılır.

## 11. Test kabul kriterleri

- [x] contentinfo + "Alt bilgi" navigation
- [x] href'siz link onClick
- [x] slim: başlıksız düzleştirilmiş linkler
- [x] cta bandı yalnız cta'da
- [x] newsletter slotu yalnız newsletter'da
- [x] centered yapısı
- [x] data-variant işareti
- [ ] 320px responsive (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfada tek GlassFooter (tek contentinfo landmark).
- ✅ Sosyal ikonlara `aria-label` ver.
- ❌ Footer'a cam/backdrop-filter ekleme.
- ❌ Sütun başlıklarını heading'e çevirme.

**Açık kararlar:** app-store rozet slotu (v2) · dil seçici slotu (v2) ·
`tone` ekseni bilinçli yok — flat zemin tema token'larından döner; ihtiyaç
doğarsa v2.
