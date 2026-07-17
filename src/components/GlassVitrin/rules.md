---
name: GlassVitrin
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassVitrin Kuralları

## 1. Amaç

Yoğun ana sayfa vitrini: sahibinden'in alan verimi (50-60 ilan, ~106×80px
görsel hücreleri) modern disiplinle — tutarlı görsel oranı, taranabilir fiyat
tipografisi, sakin hover. Beş yerleşim varyantı (kullanıcı mock seti L-P).

- **Kullan:** ana sayfa vitrini, kategori açılışları, "tüm vitrin ilanları" sayfası.
- **Kullanma:** az sayıda öne çıkan ilan (→ `GlassBento`), arama sonuç listesi
  (sayfalamalı liste ayrı desen).

| Varyant | Mock | Karakter |
|---|---|---|
| `micro` (default) | L | 4:3 mini kart, fiyat önde, 9 sütun |
| `ruled` | M | Sıfır boşluk — hairline hücreler, kadastral doku |
| `mosaic` | N | Kare görsel duvarı, fiyat buzlu chip'te, başlık hover'da |
| `list` | O | Üç kolonlu 56px mikro satırlar, sağa hizalı fiyat |
| `banded` | P | Üstte 5'li doping bandı (VİTRİN rozeti) + micro ızgara |

## 2. Semantik sözleşme

- Kartların tamamı gerçek `<button>`; accessible name başlık + fiyattan
  (mosaic'te başlık görsel-gizli `<span>` ile butona bağlanır).
- Görseller dekoratif: `alt=""`, `loading="lazy"`. EİDS rozeti `aria-hidden`
  (doğrulama bilgisi liste düzeyinde ayrıca sunulmalı — Açık Kararlar).
- `...rest` kökte açık — `aria-label` ("Ana sayfa vitrini") verilmesi önerilir.

## 3. Anatomy

| Alan | Zorunlu | Not |
|---|---|---|
| item.image | ✅ | URL — dekoratif |
| item.price / title | ✅ | fiyat tabular, başlık tek satır ellipsis |
| item.location | — | list/mosaic/banded'de görünür |
| item.eids | — | 16px mini tik |
| item.featured | — | banded: banda giriş önceliği |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| items | `GlassVitrinItem[]` | — |
| variant | `'micro'\|'ruled'\|'mosaic'\|'list'\|'banded'` | `'micro'` |
| columns | `7\|8\|9\|10` | `9` (mosaic +1 kullanır; list sabit 3 kolon) |
| bandCount | `number` | `5` — banded bandının kart sayısı |

Controlled/Ref: N/A — stateless sunum.

## 5. Seçenek eksenleri

`material` yok — flat içerik yüzeyi. `columns` yalnız geniş ekranı etkiler;
kırılımlar sabittir (§7). `banded`'de `featured` işaretli ilan yoksa ilk
`bandCount` ilan banda alınır.

## 6. State modeli

Stateless. Hover: micro/mosaic/banded görsel %4.5-6 scale; ruled hücre zemini
%4 amber; list satırı %3 mürekkep. `:focus-visible` halkası kartta; mosaic
başlık overlay'i focus'ta da açılır.

## 7. Davranış

- Responsive kademeler (media query): 1000px altı 6-7 sütun (list 2 kolon),
  700px altı 4-5 (list 1, band 2), 480px altı 3 sütun.
- `loading="lazy"` — 60 görsel tek seferde inmez.
- Mosaic dokunmatik takası: başlık hover'a saklıdır; ilk dokunuş overlay'i
  açmaz (buton doğrudan tetiklenir) — başlık bilgisi gizli metinle AT'ye açık,
  görsel kullanıcı fiyat chip'iyle tarar. Bilinçli yoğunluk takası.

## 8. İçerik

- Başlıklar kısa (il + tip); fiyatlar nokta ayraçlı + "TL".
- Band rozet metni sabit "VİTRİN" (doping ürün adı) — i18n gerekirse prop'a
  açılır (Açık Kararlar).

## 9. Token eşlemesi

| Part | Token |
|---|---|
| yüzey/çizgi | `--lg-surface` / `--lg-hairline` |
| metin | `--lg-label(-secondary)` |
| overlay/scrim | `--lg-scrim` + `--lg-on-scrim` |
| rozetler | `--lg-success` (EİDS), `--lg-accent` (VİTRİN) |
| radius | `--lg-radius-chip/media/capsule` (iç hücreler 6-9px raw — mikro ölçek) |

**Borç (raw):** mikro font kademesi 9-12px, gap 6-12px, 64px list thumb,
1000/700/480px kırılımları, hücre iç radius 6/7/9px.

## 10. Storybook kapsamı

Default(Micro), Ruled, Mosaic, List, Banded, Playground, UzunIcerik,
Erisilebilirlik (docs), VaryantKarsilastirma (5 varyant etiketli).
Responsive: viewport toolbar'ıyla (kırılımlar media query'de).

## 11. Test kabul kriterleri

- [x] micro: ilan sayısı + kart tıklaması
- [x] 4 varyant data-variant işareti
- [x] banded: featured band ayrımı + fallback (ilk bandCount)
- [x] görseller alt="" + koşullu EİDS
- [x] mosaic: gizli başlık adı + fiyat chip
- [x] list: konum satırı
- [ ] 9→3 sütun kırılımları (visual, Chrome)
- [ ] mosaic hover overlay (visual)

## 12. Do / Don't

- ✅ Köke `aria-label` ver; sayfada birden çok vitrin varsa adlandır.
- ✅ 40+ ilanla kullan — az ilanda GlassBento'ya geç.
- ❌ Kart içine ikinci etkileşim koyma (favori vb.) — buton içinde buton olur;
  ihtiyaçta kart yapısı `<a>` + ayrı aksiyon katmanına evriltilir (v2).
- ❌ Vitrine cam yüzey verme; mikro ölçekte cam okunmaz.

**Açık kararlar:** favori kalbi (buton-içinde-buton çözümü gerektirir, v2) ·
EİDS bilgisinin AT'ye metinle sunumu · VİTRİN rozet metninin i18n'i ·
sayfalama/"tümünü gör" entegrasyonu.

**Changelog:** 2026-07-17 — İlk sürüm: mock seti L-P beş varyant olarak
(kullanıcı kararı: "hepsi dursun, ihtiyaçta kullanırız").
