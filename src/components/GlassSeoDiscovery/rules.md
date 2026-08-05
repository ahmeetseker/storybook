---
name: GlassSeoDiscovery
category: içerik
status: hazır
lastReviewed: 2026-08-04
---

# GlassSeoDiscovery Kuralları

## 1. Amaç

Programatik SEO keşif rafı: sayfanın en altında, footer'ın hemen üstünde duran
iç bağlantı bloğu. Her kolon bir arama niyeti kümesi (yatırım · tarım · sahil ·
yazlık), her satır o kümenin uzun kuyruk açılış sayfası — "Balıkesir Ayvalık'ta
zeytinlik sahibi olun".

- **Kullan:** ana sayfa ve kategori sayfalarının alt bandı, bölge hub'ı, arama
  sonucu sayfasının dibi. Amaç hem kullanıcıyı bir sonraki niyete taşımak hem de
  uzun kuyruk sayfaları taranabilir kılmak.
- **Kullanma:** ilan listesi (→ `GlassVitrin`), site gezinmesi (→ `GlassFooter`
  kolonları — orada bağlantılar kurumsaldır ve her sayfada aynıdır), az sayıda
  öne çıkan kart (→ `GlassBento`).

`GlassFooter`'dan farkı: footer navigasyon boilerplate'idir ve sayfa başına
değişmez; bu raf sayfanın konusuna göre değişen, sıralı ve ölçülebilir bir
bağlantı kümesidir.

| Varyant | Karakter |
|---|---|
| `ranked` (default) | Kartlı satır — görsel + iki satır metin + hayalet sıra rakamı |
| `plain` | Çerçevesiz yoğun metin listesi — dar kolon, ikincil sayfa |

## 2. Semantik sözleşme

- Satırlar **gerçek `<a href>`** — buton değil. Bot da kullanıcı da aynı cümleyi
  okur; `onClick` yalnız router gezinmesi için href'in üstüne biner, href her
  zaman gerçek URL kalır.
- Liste `<ol>`: sıralama bilgi taşır ("en çok aranan"). Sağdaki iri rakam bu
  sıranın görsel karşılığıdır ve `aria-hidden` — ekran okuyucu sırayı listeden
  alır, iki kez duymaz.
- Kolon başlığı `h2|h3|h4` (`headingLevel`); sayfanın `h2` bölüm başlığının
  altında `h3` varsayılanı kullanılır.
- Görseller dekoratif: `alt=""`, `loading="lazy"`, `decoding="async"`.
- Kök `<div>`; `...rest` açık — bölüm başlığını ve `aria-labelledby`'yi sayfa
  verir (component sayfanın `h2`'sini sahiplenmez). Kökün içindeki ikinci `div`
  ızgaradır ve korunması gereken bir değişmezdir: kök container query kabıdır,
  kap kendi genişliğini sorgulayamaz (§7).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| `column.title` | ✅ | Küme adı | Kısa, tek satır; büyük harfe çevrilmez (TR `i/İ`) |
| `link.label` | ✅ | Uzun kuyruk anahtar ifadesi | Hedef sayfanın H1'i; iki satırda kırpılır |
| `link.meta` | — | Bağlam ("Ankara · 128 ilan") | Tek satır, ellipsis |
| `link.image` | — | 44px dekoratif görsel | Kolon içinde ya hepsinde ya hiçbirinde |
| Sıra rakamı | otomatik | 1..n | `ranked`'da; dekoratif |
| `column.href` | — | Kümenin hub sayfası | Kolonun altına "tümünü gör" satırı ekler; `hubLabel` yoksa erişilebilir ad küme adıyla genişler (`aria-label`), görünür etiket adın içinde kalır (WCAG 2.5.3) |

## 4. Public API

| Ad | Tür | Default | Controlled | Açıklama |
|---|---|---|---|---|
| `columns` | `GlassSeoDiscoveryColumn[]` | — | — | Küme listesi |
| `variant` | `'ranked' \| 'plain'` | `'ranked'` | — | Satır yoğunluğu |
| `columnCount` | `3 \| 4 \| 5` | `4` | — | Geniş ekran kolon sayısı |
| `headingLevel` | `2 \| 3 \| 4` | `3` | — | Kolon başlığı düzeyi |

`GlassSeoDiscoveryLink`: `id · label · href · meta? · image? · onClick?`
`GlassSeoDiscoveryColumn`: `id · title · links · href? · hubLabel? · onHubClick?`

Ref hedefi: N/A — stateless sunum. Event sözleşmesi: `onClick` / `onHubClick`
native anchor event'idir; `preventDefault` çağırmak çağıranın işidir.

## 5. Seçenek eksenleri

`material` yok — flat içerik katmanı (sayfa altı metin yoğunluğunda cam
okunmaz, katman kuralı gereği cam navigasyon/kontrole ayrılır).
`size` yok: yoğunluk `variant` ekseninde çözülür — `ranked` ile `plain` arasında
tipografi ölçeği değil satırın anatomisi değişir; ikisinin arasında üçüncü bir
ölçek gerçek bir kullanım karşılığı bulmadı.
`columnCount` yalnız geniş ekranı etkiler; kırılımlar sabittir (§7).

Yasak kombinasyon: `plain` + `image` — plain satırında görsel render edilmez
(varyant kazanır), veri temizlenmelidir.

## 6. State modeli

Stateless. Hover (`hover: hover`): `ranked` satırında kenarlık `--lg-accent`'e
döner, rakam amberleşir, görsel %6 yakınlaşır; `plain` satırında %8 amber zemin
belirir. `:focus-visible` halkası satır ve hub bağlantısında.
Katman sırası: availability (yok) → value (yok) → interaction (hover/focus).

## 7. Davranış

- Kolon kırılımları **rafın kendi genişliğine** bakar (container query, viewport
  değil): `64rem` altında 2 kolon, `36rem` altında tek kolon. Kök yalnız kabı
  kurar, ızgara bir katman içeridedir — bir kap kendi genişliğini sorgulayamaz.
  Ölçek değil okunabilirlik belirler: kolon ~15rem altına inince uzun kuyruk
  ifadesi üç satıra bölünüyordu.
- **Satır hizası:** kolonların tek sıra olduğu genişlikte (`64rem` üstü) raf tek
  bir ızgaradır; kolonlar ve listeler satırları `subgrid` ile paylaşır, böylece
  iki satırlık bir ifade komşu kolonun sıra rakamlarını kaydırmaz. Kolonlar alt
  alta sardığında bu kapanır (aynı satır bandına yığılırlardı) ve her kolon
  kendi içinde eşitlenir; `subgrid` desteklenmeyen tarayıcıda da davranış budur.
- Satır yüksekliği `--lg-control-hit` (44px) tabanına bağlı; dokunmatikte hedef
  bu değerin altına düşmez.
- `prefers-reduced-motion: reduce` → görsel yakınlaşması ve ok kayması kapanır,
  yalnız renk geçişi kalır.
- Görseller `loading="lazy"` — raf viewport'un altında doğar, ilk boyamayı
  yavaşlatmaz.

## 8. İçerik kuralları

- `label` **hedef sayfanın anahtar ifadesidir**, kısaltılmış etiketi değil:
  "Ankara yatırımlık arsa" değil "Ankara yatırımlık arsa fırsatları".
- Anchor metinleri sayfa genelinde benzersiz olmalı; aynı ifade iki farklı URL'e
  bağlanırsa hem kullanıcı hem tarayıcı için ayırt edilemez olur.
- Blok başına ~20-40 bağlantı; üstü hem tarama bütçesini hem sayfanın alt
  bandını seyreltir.
- Kolon başlığı büyük harfe çevrilmez: `text-transform: uppercase` Türkçe'de
  `i → I` üretir (`lang="tr"` olmayan kaplarda), küme adları bozulur.
- Boş kolon render edilmez — `links` boşsa kolonu veriden düşürün.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| satır zemini | `background` | `--lg-surface` | plain: `none`, hover: `--lg-accent` %8 karışım |
| satır kenarlığı | `border` | `--lg-hairline` | hover: `--lg-accent` |
| satır radius | `border-radius` | `--lg-radius-media` | plain: `--lg-radius-chip` |
| görsel | `border-radius` | `--lg-radius-chip` | — |
| başlık/metin | `color` | `--lg-label` / `--lg-label-secondary` | — |
| hub bağlantısı | `color` | `--lg-accent` | — |
| sıra rakamı | `color` | `color-mix(--lg-label %22, --lg-surface)` | hover: `--lg-accent` %45 |
| tipografi | `font-size` | `--lg-text-footnote` / `--lg-text-caption` / `--lg-text-title` | — |
| boşluk | `gap`/`padding` | `--lg-space-1..6` | — |
| dokunma hedefi | `min-block-size` | `--lg-control-hit` | — |
| odak | `outline` | `--lg-focus-ring-width/offset` + `--lg-accent` | `:focus-visible` |

**Borç (raw / mikro-geometri):** `--seo-thumb: 2.75rem` (44px görsel hücresi —
boşluk token'ı değil, dokunma tabanıyla eşitlenmiş kutu), `--seo-body-gap:
0.125rem` (başlık/meta arası; `--lg-space-1` bu ölçekte satırları ayırıyordu),
`--seo-label-lines: 2` (satır kırpma), `--seo-rows` (en uzun kolonun satır
sayısı — subgrid için veriden gelir, inline style ile geçer). Kenarlık `1px` —
hairline kalınlığının token'ı yok, kütüphane genelindeki konvansiyon (73
kullanım). Kırılımlar `64rem/36rem` ve subgrid eşiği `64.0625rem` bp ölçeği
dışıdır, CSS'te gerekçeli yorumla duruyor. Geçiş
süre/easing değerleri (0.18s/0.3s ease) token karşılığı olmadığı için raw.

## 10. Storybook kapsamı

| Story | Durum |
|---|---|
| Default / Overview | ✅ `Ranked — footer üstü raf` |
| Playground (Controls) | ✅ yalnız public API |
| Variants | ✅ `Varyantlar` (ranked/plain etiketli) |
| Sizes | N/A — `size` ekseni yok (§5); yoğunluk `variant`'ta |
| States | ✅ `Durumlar — görselsiz, sayaçsız, hub linksiz` |
| Uzun içerik | ✅ `Uzun içerik` (TR bileşik kelime + iki satır kırpma) |
| Responsive | ✅ `Responsive — dar kap` (+ viewport toolbar) |
| Erişilebilirlik | ✅ `Erişilebilirlik` (docs notu) |

## 11. Test kabul kriterleri

- [x] Satırlar `<a href>` ve href birebir korunur
- [x] `<ol>`/`<li>` sıralama semantiği; rakam `aria-hidden`
- [x] `headingLevel` kolon başlığı düzeyini değiştirir
- [x] Hub bağlantısı yalnız `href` verilen kolonda; adı küme adıyla ayrışır
- [x] Görseller `alt=""` + `loading="lazy"`
- [x] `plain` görseli ve rakamı düşürür
- [x] `onClick` bağlantının üstüne biner
- [ ] 4→2→1 kolon kırılımları (visual, Chrome)
- [ ] Hover'da kenarlık/rakam/görsel geçişi (visual)

## 12. Do / Don't

- ✅ Bloğu `<section aria-labelledby>` + `h2` ile sar; raf sayfanın başlığını
  sahiplenmez.
- ✅ Bağlantıları gerçek, indekslenebilir URL'lere ver; yönlendirme zinciri
  (301'e giden bir yol) kullanma — kullanıcı da bot da bir adım fazla yürür.
- ✅ Sıralamayı gerçek bir sinyale (arama hacmi, tıklama) dayandır; rakam
  "en çok aranan" vaadi verir.
- ❌ Satırı `<button>` + `navigate()` yapma — bağlantı taranamaz hale gelir.
- ❌ Aynı anchor metnini birden çok URL'e verme.
- ❌ Rafa cam yüzey verme; footer'ın hemen üstünde ikinci bir cam katman
  sayfanın cam bütçesini (max 6) boşa harcar.

**Bilinen kısıtlar:** görsel/görselsiz satırların karışması kolon içinde hizayı
bozar (§8 içerik kuralı); component bunu zorlamaz.

**Açık kararlar:** sıra rakamının veri kaynağı (şimdilik dizi sırası) · kolon
başına bağlantı sayısının üst sınırının API'de zorlanıp zorlanmayacağı ·
`plain` varyantında hub satırının ayrı bir stile ihtiyaç duyup duymadığı.

**Changelog:** 2026-08-04 — İlk sürüm: ana sayfa footer üstü SEO rafı
(referans yerleşim: dört kolonlu sıralı kart listesi).
