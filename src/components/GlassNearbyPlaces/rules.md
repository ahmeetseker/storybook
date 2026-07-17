---
name: GlassNearbyPlaces
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassNearbyPlaces Kuralları

## 1. Amaç

Yakın çevre / mahalle rehberi: bir ilanın etrafındaki noktaları kategoriye
göre gruplayıp mesafeleriyle listeler (ör. "Ulaşım → Metrobüs Durağı, 350 m").
İçerik katmanı component'idir — bilinçli olarak cam DEĞİL: sürekli okunan bir
liste, cam malzemenin anlamı yok.

- **Kullan:** ilan detay sayfasında "Yakın Çevre" / "Mahalle Rehberi" bölümü;
  kategori sayısı 2'den fazlaysa `tabs`, azsa/tek ekranda tarama tercih
  edilecekse `chips`.
- **Kullanma:** tekil bir konum/adres gösterimi (→ `GlassLocationCard`),
  sayısal yaşanabilirlik skoru (→ `GlassScoreMeter`), etiket/değer
  karşılaştırması (→ `GlassSpecTable`).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Düz etiket/değer listesi; NearbyPlaces iki seviyeli (kategori → yer listesi) ve `tabs` modu var |
| GlassFloorPlanViewer | Aynı roving-tabindex tablist deseni paylaşır; FloorPlanViewer görsel/hotspot, NearbyPlaces metin listesi |
| GlassScoreMeter | Tekil sayısal skor; NearbyPlaces sıralı isim + mesafe listesi taşır |

## 2. Semantik sözleşme

- Kök element: `<section>` (`aria-label` opsiyonel prop'tan; sayfada birden
  çok örnek varsa verilmesi önerilir — `GlassTable` ile aynı karar).
- `variant="chips"`: her kategori `<div role="group" aria-labelledby={...}>`
  içinde bir `<p>` etiket (heading DEĞİL — spec gereği) + `<ul>` yer listesi.
- `variant="tabs"`: kategori seçici `role="tablist"`/`role="tab"` +
  `role="tabpanel"` WAI-ARIA tabs deseni (roving tabindex, ok tuşu gezinme) —
  `GlassFloorPlanViewer`'daki kat sekmesi deseniyle birebir aynı iskelet.
- Kategori/yer ikonları (varsa) `aria-hidden` — erişilebilir ad her zaman
  görünür metinden gelir, ikon yalnız dekoratif.
- Portal yok, ref forwarding yok (statik/kontrollü sunum).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| kategori ikonu | — | ReactNode | `aria-hidden`; hem `chips` etiketinde hem `tabs` sekmesinde aynı slot |
| kategori etiketi | ✅ | string | `chips`'te `role="group"` adı; `tabs`'te sekme metni; HEADING DEĞİL |
| yer adı | ✅ (satır başına) | string | Satırın birincil metni |
| yer notu | — | string | İkincil metin, satır içinde adın altında |
| mesafe çipi | ✅ (satır başına) | string | Tabular hizalı, satırın sağında |
| boş kategori satırı | otomatik | sabit metin | `places.length === 0` iken tek bilgilendirici `<li>` |
| tablist (yalnız `tabs`) | ✅ | kategori sekmeleri | roving tabindex |
| tabpanel (yalnız `tabs`) | ✅ | aktif kategorinin yer listesi | `aria-labelledby` aktif sekmeye |

Children kabul edilmez — tamamen `categories` prop'undan türetilir.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| categories | prop | `GlassNearbyCategory[]` | — (zorunlu) | — | `{ id, label, icon?, places }`; boş dizi → `null` render |
| variant | prop | `'chips' \| 'tabs'` | `'chips'` | — | Görsel biçim |
| activeCategoryId | prop | `string` | — | ✅ (`tabs` ile) | Yalnız `variant="tabs"` iken anlamlı; `chips`'te yok sayılır |
| defaultActiveCategoryId | prop | `string` | ilk kategori | — | Uncontrolled başlangıç kategorisi |
| onActiveCategoryIdChange | prop | `(id: string) => void` | — | — | Sekme değişince çağrılır (tıklama + ok tuşu) |
| aria-label | prop | `string` | — | — | Kök `<section>` adı |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`onChange` hariç) | — | — | `className`/`style` birleştirilir |

Ref hedefi yok. Controlled tespiti **yalnız** `activeCategoryId !== undefined`
üzerinden yapılır (`GlassSegmentedControl`/`GlassFloorPlanViewer` ile aynı
desen): verilirse component kendi state'ini güncellemez, yalnız
`onActiveCategoryIdChange` çağırır; verilmezse dahili state + aynı callback.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=chips`, controlled prop'lar verilmemiş
(→ ilk kategori aktif).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (light/dark/auto) | N/A — component `GlassSurface` kullanmaz, tema `data-theme` kök token'larından otomatik gelir |
| `size` | N/A — spec'te istenmedi (§9 borç yok, zaten token'lı tek ölçek) |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `activeCategoryId`/`defaultActiveCategoryId` bir kategori id'siyle eşleşmiyor | Sessizce ilk kategoriye düşülür (`categories.find(...) ?? categories[0]`) — hem seçili sekme hem panel bu TEK çözümlenmiş kategoriyi baz alır, hata fırlatılmaz |
| `categories` boş dizi | `null` render, hata fırlatılmaz |
| bir kategoride `places` boş | Bilgilendirici sabit metinli tek satır, hem `chips` hem `tabs`'te aynı davranış |
| `activeCategoryId` + `variant="chips"` birlikte | `chips` aktif kategori kavramı taşımaz — prop yok sayılır (tüm kategoriler zaten açık) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| aktif kategori (yalnız `tabs`) | `activeCategoryId` (controlled) veya dahili state (uncontrolled) | — | `aria-selected` (tab), `aria-labelledby` (panel) |
| disabled/hover/focus/active | — | — | Prop olarak YOK; `:focus-visible`/`:hover` yalnız CSS'te tab üzerinde |

Katman sırası: `categories` verisi → controlled/uncontrolled çözümleme
(availability önce id eşleşmesi, sonra ilk kategoriye düşüş) → render.

## 7. Davranış

- Pointer: sekmeye tıklama seçer (`tabs`); `chips`'te tıklanabilir öğe yok.
- Klavye (yalnız `tabs`, tablist üzerinde): `→`/`↓` sonraki, `←`/`↑` önceki
  (sarmalı), `Home` ilk, `End` son kategori — seçim odağı takip eder (roving
  tabindex, `GlassFloorPlanViewer`/`GlassSegmentedControl` ile aynı desen).
  Yalnız seçili sekme `tabIndex=0`, diğerleri `-1`.
- Focus akışı: seçim değiştiğinde yeni seçili sekmeye programatik `focus()`
  çağrılır (fare tıklamasında native focus zaten oradadır; klavye
  gezinmesinde `document.getElementById` ile taşınır).
- Controlled/uncontrolled: bkz. §4/§5.
- Async yok, overlay yok.

## 8. İçerik kuralları

- `label` (kategori adı) kısa olmalı ("Ulaşım", "Eğitim") — heading
  render edilmediğinden sayfa başlık hiyerarşisini etkilemez.
- `distance` serbest metin ("350 m", "1,2 km") — component birim/dönüşüm
  yapmaz, `font-variant-numeric: tabular-nums` ile hizalar.
- `note` opsiyonel, tek kısa cümle/ifade ("8 dk yürüme"); verilmezse satırda
  yer kaplamaz.
- Uzun yer adları `overflow-wrap: anywhere` ile sarar (bkz. UzunIcerik
  story, TR uzun bileşik kelimeler test edilmiştir); mesafe çipi `flex: none`
  ile sabit kalır, asla kırpılmaz.
- Boş `places`: sabit metin `"Bu kategoride yakın nokta eklenmemiş."` —
  lokalize edilecekse component'in kendisi güncellenir (prop ile
  özelleştirilmez, §12 açık karar).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| kategori grupları arası ayraç | border-top | `--lg-hairline` | — |
| satır ayracı | border-bottom | `--lg-hairline` | — |
| kategori etiketi | color/font-size | `--lg-label-secondary` / `--lg-text-footnote` | — |
| yer adı | color/font-size | `--lg-label` / `--lg-text-body` | — |
| yer notu | color/font-size | `--lg-label-secondary` / `--lg-text-caption` | — |
| mesafe çipi | background | `color-mix(in srgb, var(--lg-label) 6%, transparent)` | — |
| mesafe çipi | radius/padding | `--lg-radius-chip` / `--lg-space-1,3` | — |
| tab | radius/min-height | `--lg-radius-chip` / `--lg-control-sm` | seçili → `--lg-accent` zemin + `--lg-accent-contrast` metin |
| tab focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| boşluklar | gap/padding | `--lg-space-1..5` | — |

Raw değer kullanılmadı — tüm renk/radius/boşluk token'lardan; ikon kutusu
18px sabit ölçek borç olarak not düşülür (GlassBadge/GlassSegmentedControl
ikon slotlarındaki aynı gerekçe: ikon boyutu için ayrı token yok).

**Borç (raw):** `.categoryIcon` 18×18px sabit ölçek — ikon boyutu için token
yok (proje genelinde tutarlı borç, bkz. GlassSegmentedControl `.icon`).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (chips/tabs yan yana), Controlled
(dışarıdan yönetilen `activeCategoryId`), States/Durumlar (varsayılan
olmayan başlangıç sekmesi + boş kategori), UzunIcerik, Responsive (mobile1 +
320px konteyner), Erişilebilirlik (docs description'lı).

`Sizes`/`Temalar` ayrı story olarak yok: `size` ekseni tanımlı değil, tema
toolbar'la otomatik doğrulanır (GlassScoreMeter ile aynı karar).

## 11. Test kabul kriterleri

- [x] `chips`: kategori grubu `role="group"` + `aria-labelledby`, sayfada
      gerçek heading YOK
- [x] `chips`: boş kategori bilgilendirici satırla gösterilir, hata
      fırlatmaz
- [x] boş `categories` dizisi hiçbir şey render etmez
- [x] `tabs`: ilk kategori varsayılan seçili, ilgili panel gösterilir
- [x] `tabs`: sekmeye tıklama seçimi değiştirir + `onActiveCategoryIdChange`
      doğru id ile çağrılır
- [x] controlled `activeCategoryId`: tıklama görünümü değiştirmez, yalnız
      callback çağrılır
- [x] roving tabindex: yalnız seçili sekme `tabIndex=0`
- [x] ok tuşları sarmalı gezinir (`ArrowRight`/`ArrowLeft`)
- [x] `Home`/`End` ilk/son kategoriye gider
- [x] `tabpanel` aktif sekmeye `aria-labelledby` ile bağlı
- [ ] `pointer: coarse`'ta tab 44px hedefi (visual/CSS, unit test kapsamı
      dışı — bkz. GlassFloorPlanViewer aynı borç)

## 12. Do / Don't

- ✅ Kategori sayısı arttıkça (4+) `tabs` tercih et — `chips` tüm listeyi
  aynı anda açar, uzun sayfa oluşturabilir.
- ✅ `note`'u yalnız gerçekten faydalıysa doldur ("8 dk yürüme") — boş
  bırakmak satırı sadeleştirir.
- ✅ Sayfada birden çok `GlassNearbyPlaces` varsa her birine ayrı
  `aria-label` ver.
- ❌ `activeCategoryId`'yi `chips` varyantıyla birlikte "aktif kategori"
  anlamında kullanma — o modda kavram yok, prop yok sayılır.
- ❌ Kategori etiketini heading olarak sarmalama/render etme — spec gereği
  bilinçli olarak `role="group"` + `<p>` kullanılır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** boş kategori metni sabit ve lokalize edilemez (prop
yüzeyi sadeliği tercih edildi — ihtiyaç doğarsa `emptyCategoryText` prop'u
v2'de eklenebilir) · `tabs` sekme listesi taşarsa yatay kaydırma davranışı
(`GlassFloorPlanViewer` ile aynı desen, ayrı bir "daha fazla" menüsü yok) ·
mesafe birimi/dönüşümü component sorumluluğunda değil, çağıran formatlı
string verir.

## Changelog

- 2026-07-17: İlk sürüm — `chips`/`tabs` varyantları, WAI-ARIA tablist +
  roving tabindex deseni (`GlassFloorPlanViewer` ile aynı iskelet), boş
  kategori/boş liste güvenli davranışı.
