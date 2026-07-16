---
name: GlassCarousel
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassCarousel Kuralları

## 1. Amaç

Yatay kaydırılan içerik şeridi: scroll-snap'li track + iki cam ok butonu.
İçeriği kendisi üretmez; children'ı (tipik olarak `GlassListingCard`) yan yana
dizer.

- **Kullan:** benzer ilanlar, öneri kartları, yatay koleksiyonlar.
- **Kullanma:** görsel galerisi/index kavramı (→ `GlassGallery`), tam genişlik
  sayfalı slider (snap `start`'tır, sayfa sayfa değil), dikey listeler.

| İlgili | Farkı |
|---|---|
| GlassGallery | Tek aktif görsel + lightbox; carousel'de "aktif öğe" yok |
| GlassListingCard | Şeridin tipik çocuğu; carousel karta karışmaz |

## 2. Semantik sözleşme

- Kök: `<div role="region" aria-label={label}>` — adlandırılmış landmark;
  `label` default'u `'İçerik şeridi'`.
- Rest props (`HTMLAttributes<HTMLDivElement>`) kök div'e geçer.
- Ok butonları GlassIconButton (`'Geri kaydır'` / `'İleri kaydır'`).
- DOM değişmezleri: (1) track, scrollbar'ı gizlenmiş native scroll container'dır,
  (2) her doğrudan çocuğa `scroll-snap-align: start; flex: none` uygulanır,
  (3) oklar track'in **dışında**, kökte mutlak konumludur (scroll ile akmaz).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | kartlar/öğeler | Kendi genişliğini getirmeli (`flex: none`); doğrudan çocuk olmalı (snap seçicisi `>` ile) |
| track | otomatik | scroll container | `gap: 14px`, snap `x mandatory`, scrollbar gizli |
| oklar | otomatik | GlassIconButton çifti | Hep cam; içerik sayısından bağımsız hep render |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| label | prop | `string` | `'İçerik şeridi'` | Region'ın accessible name'i |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Ok butonlarına iletilir |
| children | slot | `ReactNode` | — | Şerit içeriği |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | Kök div'e |

Event sözleşmesi: dışa event yok (`onScroll` rest üzerinden köke gider, track'e
değil — dikkat). Ok tıklaması `track.scrollBy({ left: ±0.8 × clientWidth,
behavior: 'smooth' })` çağırır. Ref forward edilmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `label='İçerik şeridi'`, `tone='auto'`.

| Kural | Davranış |
|---|---|
| `material` / `size` / `variant` | ❌ yok — carousel kendisi görünmez iskelet, malzeme çocuklarındır |
| İçerik container'a sığıyor | Oklar yine render olur, tıklama etkisizdir (bkz. Açık Kararlar) |
| Uçlara gelindi | Oklar gizlenmez/disable olmaz; scroll sınırda durur, sarma yok |

## 6. State modeli

Component state tutmaz; scroll konumu tarayıcınındır.

| State | Kaynak | ARIA / DOM |
|---|---|---|
| scroll konumu | native scroll (track) | — (izlenmez, prop'a yansımaz) |
| ok hover/active/focus | GlassIconButton kuralları | bkz. GlassIconButton |

`disabled` / `selected` eksenleri yok. Katman sırası: N/A — kendi görsel
state'i yok.

## 7. Davranış

- Pointer/touch: track native kaydırılır (dokunmatikte parmakla, trackpad'de
  yatay jest); snap `x mandatory` öğe başına hizalar.
- Oklar: görünür genişliğin %80'i kadar smooth kaydırır — bir "sayfada" komşu
  öğeler kısmen görünür kalır.
- Keyboard: oklar Tab akışındadır ve Enter/Space ile kaydırır. Track kendisi
  focus almaz (`tabIndex` yok); scrollbar da gizli olduğundan klavyeyle tek
  gezinme yolu oklardır — bilinen kısıt.
- İçerideki kartlar kendi Tab duraklarıdır; tarayıcı odaklanan kartı görünür
  alana kaydırır.
- `prefers-reduced-motion`: `behavior: 'smooth'` koşulsuz — reduce'ta anlık
  kaydırmaya düşürülmüyor (borç).
- Controlled/uncontrolled, async, overlay: N/A — durum ve katman yok.

## 8. İçerik

- Çocuklar kendi sabit genişliğini getirir (`flex: none` zorlar); yüzde
  genişlikli çocuk şeridi bozar.
- Boş children: track boş render olur, oklar kalır — boş durum görünümü yok
  (çağıran carousel'i hiç render etmemeli).
- `label` Türkçe default; lokalizasyonda anlamlı bölge adı verilmelidir
  (ör. 'Benzer ilanlar').
- Truncation/uzun metin: N/A — metin barındırmaz, çocukların işi.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| oklar | tüm görünüm | GlassIconButton token'ları |
| carousel/track | — | Token kullanımı yok |

**Borç (tümü raw):** track `gap: 14px` (kart arası kural 16 → `--lg-space-4`
ile uyumsuz) · `padding: 4px` · ok ofsetleri `±-8px`. Ayrıca smooth scroll'un
reduced-motion'a bağlanmaması davranış borcudur.

## 10. Storybook kapsamı

Var: `Default` (yalın sabit genişlikli çocuklarla), `SimilarListings`
(GlassListingCard + GlassBadge ile), `TekKart` (sığan içerik — oklar etkisiz),
`CokKart` (18 kart, uçlarda sarma yok), `DarContainer` (320px responsive) —
autodocs açık. Arka plan/tema toolbar'dan (Arka plan + Tier global'leri).
**Eksik:** Playground, Erişilebilirlik (landmark + Tab akışı) story'si.
Ok hover/focus GlassIconButton'ın CSS state'idir — control/story yapılmaz.

## 11. Test kabul kriterleri

- [x] `region` landmark'ı `label` adıyla render olur (unit)
- [x] oklar `track.scrollBy` çağırır (jsdom'da stub ile)
- [ ] kaydırma yönü ve miktarı (`±0.8 × clientWidth`) doğrulanır
- [ ] çocukların snap hizası (visual)
- [ ] klavyeyle ok butonu aktivasyonu (interaction)
- [ ] reduced-motion'da smooth kapanır (davranış eklendiğinde)

## 12. Do / Don't

- ✅ Her carousel'e bağlama özgü `label` ver; default 'İçerik şeridi' geneldir.
- ✅ Çocuklara sabit genişlik ver (ör. GlassListingCard'ın 240px'i).
- ❌ Çocukları ek bir wrapper'a sarma — snap/flex kuralları doğrudan çocuğa işler.
- ❌ Ok butonlarını gizlemek için dışarıdan CSS yazma; ihtiyaçsa API tartışılmalı.

**Bilinen kısıtlar:** klavye kullanıcısı için track'in kendisi kaydırılamaz;
scroll konumu dışarı raporlanmaz. **Açık kararlar:** uçlarda okların
disable/gizlenmesi · `onScrollEnd`/görünür öğe bildirimi ihtiyacı ·
reduced-motion'da `behavior: 'auto'`.
