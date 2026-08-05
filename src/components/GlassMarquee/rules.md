---
name: GlassMarquee
category: içerik
status: hazır
lastReviewed: 2026-08-04
---

# GlassMarquee Kuralları

## 1. Amaç

Sayfanın en altında, footer'ın hemen üstünde dönen tam genişlikte şerit.
İçindekiler gerçek bağlantıdır (öne çıkan ilanlar, bölge sayfaları): bant
dekor değil, hareket eden bir bağlantı rafıdır.

- **Kullan:** footer üstü ilan/kampanya şeridi, tek satırlık duyuru bandı.
- **Kullanma:** okunması gereken metin (hareket okumayı bozar), kritik bilgi
  (tek geçişte kaçırılır), taranabilir bağlantı kümesi
  (→ `GlassSeoDiscovery`), ilan listesi (→ `GlassVitrin`).

`GlassSeoDiscovery`'den farkı: raf sabittir ve tarama içindir; şerit hareket
eder ve göz ucuyla yakalanır. İkisi aynı sayfada arka arkaya durabilir — raf
niyeti, şerit güncelliği taşır.

| Varyant | Karakter |
|---|---|
| `accent` (default) | Marka amber bandı — kampanya/vitrin tonu |
| `ink` | Mürekkep bandı — sayfayı footer'dan sessizce ayırır |

## 2. Semantik sözleşme

- Öğeler `href` verildiğinde gerçek `<a>`, verilmediğinde `<span>`; liste
  `<ul>` ve `aria-label={label}` ile adlandırılır (`label` zorunlu).
- Kesintisiz döngü için liste **iki kez** basılır. İkinci grup `aria-hidden` +
  `inert` + bağlantılarında `tabIndex={-1}`: ekran okuyucu aynı ilanı iki kez
  okumaz, klavye kopyaya takılmaz.
- Duraklat/sürdür düğmesi gerçek `<button>`; erişilebilir adı eyleme göre
  değişir ("Şeridi duraklat" / "Şeridi sürdür"), ikon `aria-hidden`.
- Kök `<div>`; hareket durumu `data-paused`, yön `data-direction` ile DOM'da
  görünür (test ve hata ayıklama kancası).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| `item.label` | ✅ | İlan başlığı gibi tek satır | Kırpılmaz, tek satırda akar |
| `item.meta` | — | Fiyat/konum | Etiketten sonra sönük (%78 opaklık) |
| `item.href` | — | Hedef URL | Yoksa öğe düz metin kalır |
| Ayraç | otomatik | `·` | `::after` ile, ayrı DOM düğümü değil |
| Duraklat düğmesi | otomatik | Bandın sağ ucu | Şeritle kaymaz, sabit durur |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| `items` | `GlassMarqueeItem[]` | — | Şeridin içeriği |
| `label` | `string` | — | Şeridin erişilebilir adı (zorunlu) |
| `speed` | `number` | `60` | Saniyedeki piksel — içerikten bağımsız sabit hız |
| `direction` | `'start' \| 'end'` | `'start'` | Sağdan sola / soldan sağa |
| `variant` | `'accent' \| 'ink'` | `'accent'` | Bandın rengi |
| `size` | `'sm' \| 'md'` | `'md'` | Bant yüksekliği (`--lg-control-sm/lg`) |

`GlassMarqueeItem`: `id · label · meta? · href? · onClick?`
Ref hedefi: N/A. Duraklatma durumu component içinde yaşar — controlled değil;
kullanıcı tercihidir, sayfanın işi değil.

## 5. Seçenek eksenleri

`material` yok — flat içerik katmanı (tam genişlikte bant cam olamaz; katman
kuralı camı navigasyon/kontrole ayırır ve sayfa başına 6 cam yüzey sınırı var).
`tint` yok: serbest renk, metin kontrastını component'in garanti edemeyeceği bir
yere taşır. İki varyant token'a bağlıdır (`--lg-accent` / `--lg-label`), ikisi de
kendi kontrast eşini (`--lg-accent-contrast` / `--lg-bg`) taşır.

Yasak kombinasyon: `size="sm"` + iki satırlık içerik — şerit tek satırlıktır.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / DOM |
|---|---|---|---|
| running | varsayılan | — | — |
| paused (kullanıcı) | düğme (internal state) | animasyon | `data-paused="true"`, düğme adı değişir |
| paused (hover) | CSS `:hover` | animasyon | — |
| paused (odak) | CSS `:focus-within` | animasyon | — |
| reduced motion | `prefers-reduced-motion` | animasyon + kopya + düğme | — |

Katman sırası: reduced-motion → kullanıcı duraklatması → hover/odak.

## 7. Davranış

- **Hız sabittir:** bir grubun genişliği `ResizeObserver` ile ölçülür,
  `süre = genişlik / speed`. 8 ilanla 40 ilan aynı hızda akar; uzun liste turu
  uzatır, bandı hızlandırmaz. Ölçüm gelene kadar CSS `40s` yedeğini kullanır
  (SSR'da ilk boyama).
- Animasyon yalnız `transform` üzerinde (`translate3d`), layout tetiklemez.
- Hover ve `:focus-within` şeridi durdurur: hareket eden bağlantıya tıklamak ya
  da klavyeyle gezmek aksi halde kovalamaca olur.
- `prefers-reduced-motion: reduce` → şerit hiç dönmez, kopya kaldırılır, bant
  yatay kaydırılabilir bir listeye iner, duraklat düğmesi gizlenir.
- Kenarlarda maske ile eriyerek giriş/çıkış; metin kesik kalmaz.

## 8. İçerik kuralları

- Öğe metni **tek satır** ve kısa olmalı: şerit taranır, okunmaz.
- Kritik veya süreli bilgi şeride konmaz — tek geçişte kaçırılabilir.
- 6-12 öğe idealdir; azı boşluk bırakır (grup kabın genişliğini dolduramazsa
  döngüde boşluk görünür), fazlası turu gereksiz uzatır.
- Aynı sayfada birden çok şerit kullanılmaz.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| bant zemini | `background` | `--lg-accent` / `--lg-label` (`ink`) |
| bant metni | `color` | `--lg-accent-contrast` / `--lg-bg` (`ink`) |
| yükseklik | `min-block-size` | `--lg-control-sm` / `--lg-control-lg` |
| tipografi | `font-size` | `--lg-text-caption` / `--lg-text-footnote` |
| öğe arası | `gap` | `--lg-space-6` |
| düğme hedefi | `min-inline/block-size` | `--lg-control-hit` |
| odak | `outline` | `--lg-focus-ring-width` + `currentcolor` |

**Borç (raw / mikro-geometri):** `--marquee-fade: 3rem` (kenar maskesi payı),
maske gradyanındaki `#000` (maske kanalı, renk değil), `--marquee-duration`
yedeği `40s` (ölçüm gelene kadar), animasyon `linear` (easing token'ı yok).
Odak halkası `currentcolor` kullanır — bant zemini `--lg-accent` olduğunda
halkanın `--lg-accent` olması onu görünmez yapardı; halka içe kaydırılır
(negatif offset) çünkü şerit `overflow: hidden` taşır.

## 10. Storybook kapsamı

| Story | Durum |
|---|---|
| Default / Overview | ✅ `Accent — footer üstü şerit` |
| Playground (Controls) | ✅ yalnız public API |
| Variants | ✅ `Varyantlar` (accent/ink) |
| Sizes | ✅ `Ölçekler` (sm/md) |
| States | ✅ `Durumlar — bağlantısız öğe` + `Yön ve hız` |
| Uzun içerik | ✅ `Uzun içerik` |
| Responsive | ✅ fullscreen layout + viewport toolbar |
| Erişilebilirlik | ✅ `Erişilebilirlik` (duraklatma sözleşmesi) |

## 11. Test kabul kriterleri

- [x] Öğeler `<a href>`; liste `label` ile adlandırılır
- [x] Döngü kopyası `aria-hidden` + `tabIndex=-1`, bağlantı sayısı ikiye katlanmaz
- [x] Duraklat düğmesi `data-paused` çevirir, adı eyleme göre değişir
- [x] `href` yoksa öğe düz metin kalır
- [x] `direction` / `variant` kökte işaretlenir
- [x] `onClick` bağlantının üstüne biner
- [ ] Hover/odakla duraklama (visual/interaction, Chrome)
- [ ] `prefers-reduced-motion` altında kopya ve düğmenin kalkması (visual)

## 12. Do / Don't

- ✅ Şeridi footer'ın hemen üstünde, tam genişlikte kullan; sayfa
  container'ının içine sokma (bant kırpılır, tam genişlik hissi kaybolur).
- ✅ İçeriği güncel tut — şerit "şu an ne var" sorusunun cevabıdır.
- ❌ Şeridi okunması gereken metinle doldurma; hareket okumayı bozar.
- ❌ Duraklatma kancalarını (düğme, hover, focus) kaldırma — WCAG 2.2.2
  otomatik başlayan ve 5 saniyeden uzun süren hareket için durdurma
  mekanizması ister.
- ❌ Aynı sayfada ikinci bir şerit açma.

**Bilinen kısıtlar:** öğe toplam genişliği kaptan darsa döngüde görünür boşluk
oluşur (§8 içerik kuralı; component öğeyi çoğaltarak doldurmaz) ·
`ResizeObserver` yoksa (çok eski tarayıcı) süre CSS yedeğinde kalır.

**Açık kararlar:** boşluk durumunda grubun otomatik çoğaltılması ·
duraklatma tercihinin oturum boyunca hatırlanması · şeridin sayfa görünürlüğü
dışındayken (`IntersectionObserver`) durdurulması (pil).

**Changelog:** 2026-08-04 — İlk sürüm: footer üstü ilan şeridi
(referans yerleşim: sayfa dibinde dönen tam genişlikte bant).
