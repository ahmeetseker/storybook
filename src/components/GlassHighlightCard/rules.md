---
name: GlassHighlightCard
category: içerik
status: hazır
lastReviewed: 2026-08-07
---

# GlassHighlightCard Kuralları

## 1. Amaç

Tonlu gradyan zemin, noktalı doku, köşede yer imi (bookmark) rozeti ve büyük
metrikle tek bir kurumu/özeti öne çıkaran vurgu kartı. Ana sayfa "doğrulanmış
ofisler" vitrini gibi az sayıda, yan yana ve renkle ayrışan kart gereken
yerlerde kullanılır.

Kullanılmayacağı durumlar ve ilgili component'ler:

- Liste/satır bağlamında ofis özeti → `GlassAgencyCard` (düz yüzey, avatar,
  yoğun bilgi; vurgu değil tarama için).
- İlan kartı → `GlassListingCard`.
- Cam yüzey gereken navigasyon/kontrol katmanı → bu kart cam DEĞİL, içerik
  katmanında tonlu düz yüzeydir; sayfa başına cam bütçesini harcamaz.

## 2. Semantik sözleşme

- Kök element `<section>`; accessible name `aria-labelledby` ile kartın
  `<h3>` başlığından gelir (`useId`).
- Metrikler `<dl>` içinde `<dt>` (etiket) → `<dd>` (değer) sırasıyla durur;
  görsel sıra (değer üstte) CSS `flex-direction: column-reverse` ile kurulur —
  DOM sırası değiştirilemez.
- Yer imi rozeti default'ta dekoratiftir (`aria-hidden`); `iconLabel`
  verilirse `role="img"` + `aria-label` alır.
- Aksiyon `actionHref` verilirse `<a>`, verilmezse `<button type="button">`
  olarak çizilir. Portal kullanılmaz.
- `href` verilirse başlık, `::after` ile tüm kartı kaplayan (stretched) bir
  link olur — kartın her yeri gezinme hedefidir; aksiyon kapsülü `z-index`
  ile üstte bağımsız tıklanabilir kalır. `onNavigate` sade sol tıkta SPA
  gezinmesini üstlenir, modifier'lı/orta tık tarayıcıya bırakılır
  (GlassBreadcrumb/GlassSiteHeader `linkClick` sözleşmesi). Focus halkası
  metne değil kartın tamamına çizilir (`:has(.titleLink:focus-visible)`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | ✅ | Düz metin | `<h3>`; uzun metin sarar (`overflow-wrap: anywhere`) |
| description | — | Düz metin | Başlık altı tek paragraf, `--lg-measure` ile sınırlı |
| metrics | — | `{label, value}[]` | En çok 2 önerilir; değer biçimi çağıranındır |
| action | — | `actionLabel` + `onAction`/`actionHref` | Etiket yoksa hiç çizilmez |
| icon | — | ReactNode | Rozet içi; verilmezse doğrulama tiki |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| title | prop | `string` | — | — | Başlık + accessible name kaynağı |
| description | prop | `string` | — | — | Kısa açıklama |
| metrics | prop | `GlassHighlightCardMetric[]` | — | — | `{label, value}` listesi |
| actionLabel | prop | `string` | — | — | Kapsül aksiyon etiketi |
| onAction | event | `() => void` | — | — | Tıklamada; href'li linkte de çalışır |
| actionHref | prop | `string` | — | — | Verilirse aksiyon `<a>` olur (ör. `tel:`) |
| icon | prop | `ReactNode` | doğrulama tiki | — | Rozet ikonu |
| iconLabel | prop | `string` | — | — | Rozetin erişilebilir adı; yoksa rozet dekoratif |
| tint | prop | `string` (CSS renk) | `var(--lg-accent)` | — | Tüm kart renkleri bundan türer |
| href | prop | `string` | — | — | Başlığı kartı kaplayan linke çevirir |
| onNavigate | event | `() => void` | — | — | Sade sol tıkta SPA gezinmesi; modifier'lı tık tarayıcıda |

Ref hedefi: yok (gerekirse `HTMLAttributes` spread'i ile `id`/`data-*`
geçilebilir). Event sözleşmesi: `onAction` yalnız kullanıcı tıklamasında
çalışır; giriş animasyonu event üretmez.

## 5. Seçenek eksenleri

- Tek görünüm ekseni `tint`tir; `material`/`size`/`variant` ekseni yoktur
  (tek boy, tek malzeme). hover/focus/active asla prop olmaz.
- Türetilen değerler: gradyan uçları `color-mix(tint, --lg-surface)` ve
  `color-mix(tint, --lg-label)`; rozet ikonu tint renginde; metin her zaman
  `--lg-accent-contrast`.
- Yasak kombinasyon: `actionLabel` olmadan `onAction`/`actionHref` — aksiyon
  çizilmez (sessiz no-op).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| rest | — | — | — |
| hover (aksiyon) | `:hover` + `(hover: hover)` | — | — |
| focus-visible (aksiyon) | klavye | — | — |

Katman sırası: availability → value → interaction (bu kartta yalnız
interaction katmanı var). disabled durumu yoktur — aksiyonsuz kart statik
içeriktir.

## 7. Davranış

- Giriş animasyonu: viewport'a girişte bir kez (`whileInView`, `once: true`)
  opacity+scale ile belirir; çocuklar 0.1s arayla sıralanır. Yalnız
  transform/opacity anime edilir.
- `prefers-reduced-motion`: `useReducedMotion()` ile `initial={false}` —
  kart animasyonsuz, son halinde çizilir.
- Keyboard: aksiyon doğal `<a>`/`<button>` sırasında; ek focus yönetimi yok.
- Dokunmatik: `(pointer: coarse)` altında aksiyon min `--lg-control-hit`
  (44px) yüksekliğe çıkar.

## 8. İçerik kuralları

- Başlık sarar, kesilmez; rozetle çakışmayı `padding-inline-end` önler.
- Metrik değerleri `tabular-nums`; biçimlendirme (binlik ayracı, birim)
  çağıranın sorumluluğudur.
- Boş `metrics`/aksiyonsuz kullanım geçerlidir; alt satır tamamen düşer.
- Lokalizasyon: component metin üretmez, tüm metin prop'tan gelir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| card | radius / padding / shadow | `--lg-radius-card` / `--lg-space-6` / `--lg-shadow-sm` | — |
| card | zemin | `color-mix(--hl-tint, --lg-surface/--lg-label)` + nokta dokusu | — |
| card | metin | `--lg-accent-contrast` | — |
| nokta dokusu | boyut/çap | `--lg-space-2` / `--lg-stroke-hairline` | — |
| bookmark | boyut | `--lg-space-9` × `--lg-space-10` | — |
| bookmark | zemin | `color-mix(--lg-surface 95%, transparent)` | — |
| title / description | font | `--lg-text-title` / `--lg-text-footnote` | — |
| metricValue | font | `--lg-text-display` | — |
| action | yükseklik / radius | `--lg-control-sm` / `--lg-radius-capsule` | coarse'ta `--lg-control-hit` |
| action | zemin | `color-mix(--hl-foreground 28%, transparent)` | hover 40% |
| action | focus | `--lg-focus-ring-width` solid `--hl-foreground` | — |

Bilinçli sapma: focus halkası `--lg-accent` yerine kartın kontrast renginde
(`--hl-foreground`) çizilir — tonlu koyu zeminde accent halkası görünmez.
Raw değer borcu: `letter-spacing` (-0.02em/-0.03em) ve clip-path yüzdeleri
token'sızdır (tipografik/geometrik sabit).

## 10. Storybook kapsamı

Default ✅ · Playground ✅ · Tintler (variants) ✅ · Sizes N/A (tek boy) ·
States (Erisilebilirlik story'sinde focus) ✅ · UzunIcerik ✅ · Responsive ✅ ·
Erisilebilirlik ✅ · DogrulanmisOfisler (kullanım örneği) ✅

## 11. Test kabul kriterleri

- Unit: section accessible name'i başlıktan alır; dt→dd DOM sırası; href'li
  aksiyon link, href'siz button; etiketsiz aksiyon çizilmez; `iconLabel`
  rozet rolünü değiştirir; `tint` CSS değişkenine yansır. (7 test ✅)
- Interaction: aksiyon tıklaması `onAction` çağırır. ✅
- Visual: story matrisi üzerinden. A11y: rozet default aria-hidden. ✅

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do:** Yan yana en çok 3–4 kart, her karta ayırt edici `tint` ver; telefon
aksiyonunu `actionHref="tel:…"` ile ver.
**Don't:** Kartı liste satırı olarak tekrarlama (o iş `GlassAgencyCard`);
`tint`e açık renk verme — metin `--lg-accent-contrast` (beyaz) sabittir,
kontrast çağıranın sorumluluğunda kalır.

Bilinen kısıtlar: koyu tema yok (Kağıt tek tema); `tint` açık renk seçilirse
beyaz metin kontrastı düşer — açık tonlar desteklenmez.

Açık kararlar: metrik sayısı 2'yi aşarsa yatay sıkışma; şimdilik çağıran
sınırlar, gerekirse `variant` ekseni açılır.

Changelog:
- 2026-08-07 — İlk sürüm (ana sayfa doğrulanmış ofisler vitrini için).
- 2026-08-07 — `href` + `onNavigate`: başlık stretched link olarak tüm kartı
  gezinme hedefi yapar; aksiyon kapsülü üstte bağımsız kalır.
- 2026-08-07 — Kompakt kademe: kart kendi sorgu kabıdır
  (`container-type: inline-size`; dolgu bu yüzden `.body`'ye taşındı — öğe
  kendi kabına yanıt veremez). ≤24rem kartta başlık headline, metrik title,
  dolgu space-4, kurdele 40×48, telefon kapsülü 36px tam genişlik (bilinçli
  AAA istisnası, arama kartı emsali). Dar kart NEREDE olursa olsun kompakt
  davranır — 3 kolonlu gridde ~384px altına inen kart da bu kademeyi alır.
