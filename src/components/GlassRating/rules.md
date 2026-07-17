---
name: GlassRating
category: kontroller
status: hazır
lastReviewed: 2026-07-17
---

# GlassRating Kuralları

## 1. Amaç

Yıldız puan gösterimi/toplama — tek component altında üç bağımsız kullanım
biçimi: salt-okunur özet (`display`), etkileşimli 5 yıldızlı giriş (`input`),
ortalama + dağılım özeti (`summary`). İçerik/kontrol katmanı — cam DEĞİL:
puan, ilan/satıcı kartlarında sürekli okunan bir veri, cam malzemenin anlamı
yok (GlassScoreMeter ile aynı gerekçe).

- **Kullan:** ilan/satıcı kartında ortalama puan rozeti (`display`), yorum
  formunda puan toplama (`input`), satıcı profili puan dağılımı (`summary`).
- **Kullanma:** 0-100 tekil skor/metrik (→ `GlassScoreMeter`), ayrık durum
  etiketi (→ `GlassBadge`), çok satırlı özellik karşılaştırması (→
  `GlassSpecTable`).

| İlgili | Farkı |
|---|---|
| GlassScoreMeter | 0-100 tekil metrik, renk eşikli; Rating 0-5 yıldız ölçeği, tek renk (`--lg-accent`) |
| GlassSegmentedControl | Eşdeğer mod seçimi; Rating `input` sıralı/kümülatif bir ölçek seçer (roving tabindex deseni ortak) |
| GlassProgress | Süreç ilerlemesi; Rating kalıcı bir değerlendirme |

## 2. Semantik sözleşme

- `display`: kök `<div role="img" aria-label="…">` — "5 üzerinden 4,6 yıldız"
  (+ `count` verilmişse ", 128 değerlendirme"). Yıldız SVG'leri ve görünür
  metin (`count` varsa) `aria-hidden` — bilgi zaten kökün `aria-label`'ında,
  çift okuma olmasın.
- `input`: `<div role="radiogroup" aria-label={label ?? 'Puan'}>` içinde 5×
  `<button role="radio" aria-checked aria-label="N yıldız">`. `label`
  verilmezse radiogroup isimsiz kalmaz, varsayılan erişilebilir ad `'Puan'`
  olur. `value`/`defaultValue` sonlu değilse (`NaN`/`Infinity`) önce 0'a
  düşer, sonra en yakın tamsayıya yuvarlanıp [0,5]'e clamp edilir — yalnız
  bu normalize edilmiş değer radio eşleşmesinde/roving hedefte kullanılır.
  Radiogroup deseni `GlassSegmentedControl` ile birebir — roving tabindex,
  ok tuşu.
- `summary`: özel ARIA rolü yok; ortalama sayı + toplam adet **görünür metin**
  olarak render edilir (AT normal okuma sırasıyla alır). Dağılım satırları
  `<dl>`; `dt`="N yıldız", `dd`= çubuk (dekoratif, `aria-hidden`) + görünür
  adet metni.
- Portal yok, ref forwarding yok, children kabul edilmez (tamamen prop
  güdümlü, GlassScoreMeter deseniyle tutarlı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| stars (display/summary) | ✅ | 5× dolu/yarım/boş SVG | `aria-hidden`, tek grup |
| text (display) | yalnız `count` verilirse | "4,6 · 128 değerlendirme" | `aria-hidden` (kökte zaten `aria-label`) |
| radio (input) | ✅ ×5 | — | `role="radio"`, `aria-label="N yıldız"` |
| avgValue (summary) | ✅ | tamsayı/ondalık | Büyük, görünür |
| totalText (summary) | ✅ | "N değerlendirme" | `distribution` toplamından hesaplanır |
| distRow (summary) | ✅ ×5 | etiket + çubuk + adet | `dt`/`dd`; çubuk dekoratif |

## 4. Public API

Üç varyant ayrık union ile modellenir (`variant` diskriminant).

**`display`** (varsayılan, `variant` verilmezse bu):

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| value | `number` | — (zorunlu) | [0,5]'e clamp; yarım yıldıza yuvarlanarak çizilir |
| count | `number` | — | Verilirse "değer · adet değerlendirme" metni görünür + `aria-label`'a eklenir |

**`input`**:

| Ad | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|
| value | `number` | — | ✅ | 1-5 controlled seçim; `0`/`undefined` → seçim yok; sonlu olmayan/tamsayı olmayan/[0,5] dışı değerler normalize edilir (bkz. §5) |
| defaultValue | `number` | `0` | — | Uncontrolled başlangıç; aynı normalize kuralına tabi |
| onValueChange | `(value: number) => void` | — | — | Seçim her tetiklendiğinde çağrılır (aynı yıldıza tekrar tıklamak dahil — SegmentedControl ile aynı karar) |
| label | `string` | `'Puan'` | — | radiogroup `aria-label`; verilmesi önerilir (görünür bağlam yoksa mutlaka ver), verilmezse `'Puan'`'a düşer |
| disabled | `boolean` | `false` | — | Tüm kontrolü kapatır |

**`summary`**:

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| value | `number` | — (zorunlu) | Ortalama puan, [0,5]'e clamp |
| distribution | `number[]` (uzunluk 5) | — (zorunlu) | 5→1 yıldız sırasıyla adetler; toplam bu diziden hesaplanır, ayrı `count` prop'u yok |

Tüm varyantlarda `...rest`: `HTMLAttributes<HTMLDivElement>` (`aria-label`
hariç — kök `aria-label`/rol component tarafından hesaplanır; `input`'ta
ayrıca `onChange` hariç). `className`/`style` birleştirilir. Ref hedefi yok.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant="display"`. Birleşik variant yok — her
varyant kendi prop kümesini taşır (TS discriminated union derleme zamanında
yanlış kombinasyonu engeller, ör. `input`'a `distribution` geçilemez).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik/kontrol yüzeyi, cam eksen yok |
| `tone` | N/A — tek vurgu rengi `--lg-accent`, semantik ton eşiği yok (ScoreMeter'dan farklı: rating'de "kötü/iyi" renk ayrımı yok) |
| `size` | N/A — spec'te istenmedi, tek sabit ölçek (§9 borç) |
| `thickness`/`prominent`/`tint` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `value` aralık dışı (`display`/`summary`) | [0,5]'e clamp, `NaN`/`Infinity` önce 0'a düşer (yarım yıldız korunur) |
| `input` `value`/`defaultValue` sonlu değil veya tamsayı değil veya [0,5] dışı (`2.5`, `6`, `Infinity`) | Önce sonlu değilse 0, sonra `Math.round` + [0,5] clamp — normalize edilmiş değer her zaman 1-5 bir radio'ya (veya seçim-yok için 0'a) eşlenir, hiçbir seçenek kalıcı `tabIndex=-1` kilidine düşmez |
| `input` seçim yok (`value`/`defaultValue` verilmez veya normalize sonrası 0) | Hiçbir radio `checked` değil, ilk yıldız roving hedefi |
| `input` `label` verilmez | radiogroup `aria-label` `'Puan'`'a düşer, isimsiz radiogroup üretilmez |
| `distribution` 5'ten kısa/negatif adet | Eksik index 0 sayılır, negatif adet 0'a clamp edilir — hata fırlatılmaz |
| `distribution` toplamı 0 | Çubuklar %0 genişlikte render edilir, 0'a bölme olmaz |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| değer (display/summary) | `value` (+ clamp) | — | kökte `aria-label` / görünür metin |
| seçim (input) | `value`/`defaultValue` (+ normalize + iç state) | — | `aria-checked`, roving `tabindex` |
| disabled (input) | prop | hover, tıklama, klavye | native `disabled` + kök `pointer-events:none` |
| focus-visible (input) | CSS | — | 2px `--lg-accent` halka, yalnız `:focus-visible` |

Katman sırası: `display`/`summary` → value (clamp) → render (etkileşim yok).
`input` → availability (disabled) → value (controlled/uncontrolled) →
interaction (click/keyboard).

## 7. Davranış

- `display`/`summary`: statik, etkileşim yok, `tabIndex` verilmez.
- `input` pointer: tıklama seçer (`onValueChange` her tıklamada çağrılır).
- `input` keyboard (radiogroup deseni, `GlassSegmentedControl` ile birebir):
  Ok sağ/aşağı → sonraki yıldız (5'ten 1'e sarar), ok sol/yukarı → önceki
  (1'den 5'e sarar), Home → 1 yıldız, End → 5 yıldız; seçim focus'u izler
  (roving tabindex).
- Controlled/uncontrolled: `value` verilirse iç state yazılmaz, yalnız
  `onValueChange` çağrılır (SegmentedControl'daki controlled karar aynen).
- Odak yönetimi: ok tuşu handler'ı bir "pending focus" hedefi talep eder;
  gerçek `.focus()` çağrısı yalnız committed değer (`currentValue`, yani
  normalize edilmiş `value`/iç state) o hedefe ulaştığında yapılır. Uncontrolled
  modda bu her zaman aynı render'da gerçekleşir (iç state anında güncellenir).
  Controlled modda parent güncellemeyi reddederse (`value` prop'u değişmezse)
  `currentValue` hiç değişmez, pending hedef hiç eşleşmez, DOM odağı hiç
  taşınmaz — böylece odak asla `tabIndex=-1` bir öğede kilitli kalmaz; bir
  sonraki ok tuşu her zaman GÖRÜNEN (`currentValue`/prop) değerden hesaplanır.
- Responsive: `input` yıldız dokunma hedefi `@media (pointer: coarse)`'ta
  44×44px'e büyür; `summary` dağılım çubukları konteynerin %100 genişliğine
  uyar.
- `prefers-reduced-motion`: dağılım çubuğu genişlik geçişi ve input hover
  büyütme kapanır.

## 8. İçerik kuralları

- `display`'de `count` yalnız gerçek bir adet varsa verilmeli; `count`
  atlanırsa metin hiç render edilmez (yalnız yıldızlar) — ara bir "count=0"
  durumu için component sessizce metni gösterir ("0 değerlendirme" render
  edilebilir, çağıran taraf anlamlı olup olmadığına karar verir).
  `count`, `count !== undefined && count !== null` kontrolüyle metni
  tetikler; `0` da geçerli bir adettir.
- `summary`'de `distribution` her zaman 5 eleman olmalı (5→1 yıldız sırası);
  eksik/negatif değerler sessizce 0'a düşer, hata fırlatılmaz.
- `input`'ta `label` görünür bağlam yoksa mutlaka verilmeli ("Satıcıyı
  puanlayın", "Deneyiminizi puanlayın") — radiogroup'un tek accessible name
  kaynağı.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| dolu yıldız | fill | `var(--lg-accent)` |
| boş yıldız | fill | `color-mix(in srgb, var(--lg-label-secondary) 32%, transparent)` |
| display metni | color | `var(--lg-label)` |
| toplam adet metni (summary) | color | `var(--lg-label-secondary)` |
| ortalama sayı (summary) | font-size | `var(--lg-text-display)` |
| dağılım çubuğu track | background | `var(--lg-hairline)` |
| dağılım çubuğu dolgu | background | `var(--lg-accent)` |
| dağılım çubuğu radius | border-radius | `var(--lg-radius-capsule)` |
| input yıldız buton radius | border-radius | `var(--lg-radius-chip)` |
| focus halkası | outline | `var(--lg-accent)` |
| boşluklar | gap/padding | `var(--lg-space-*)` |

**Borç (raw):** yıldız glif hücresi 18px (display/summary) / 22px (input
buton içi), input buton kutusu 32px (coarse'ta 44px), dağılım çubuğu
yüksekliği 8px — GlassScoreMeter'daki ring/bar ölçek borcuyla aynı gerekçe:
gösterge boyutu için özel token yok.

## 10. Storybook kapsamı

Var: Default, Playground, Variants (display/input/summary yan yana),
DisplayVaryanti (adetli/adetsiz), Controlled (input), States (boş/seçili/
disabled), UzunIcerik (büyük adet sayısı + sıfır dağılım), Responsive
(mobile1, dokunmatik hedef), Erişilebilirlik (docs description'lı).

`Sizes`/`Temalar` ayrı story olarak yok: `size` ekseni tanımlı değil, tema
toolbar'la otomatik doğrulanır (GlassScoreMeter ile aynı karar).

## 11. Test kabul kriterleri

- [x] display: `role="img"` + hesaplanmış `aria-label` (değer + opsiyonel adet)
- [x] display: `count` verilmezse görünür metin yok, `aria-label`'da adet yok
- [x] display: `value` [0,5]'e clamp edilir
- [x] display: yıldız/metin düğümleri `aria-hidden`
- [x] input: radiogroup + 5× "N yıldız" radio
- [x] input: seçim yokken hiçbiri checked değil, ilk yıldız roving hedefi
- [x] input: tıklama seçer, `onValueChange` döner, roving tabindex izler
- [x] input: ok tuşları sarar, Home/End uçlara gider
- [x] input: controlled dışarıdan yönetilir (`value` sabit kalır, callback çalışır)
- [x] input: disabled hiçbir etkileşim almaz
- [x] input: `value`/`defaultValue` sonlu değil/tamsayı değil/[0,5] dışı (`2.5`,
  `6`, `Infinity`) → normalize edilir, roving hedef her zaman bir radio'ya eşlenir
- [x] input: controlled reddinde (parent `value`'yu güncellemezse) DOM odağı
  taşınmaz, mevcut (tabIndex=0) öğede kalır
- [x] input: `label` verilmezse radiogroup'un erişilebilir adı `'Puan'`'a düşer
- [x] summary: ortalama + toplam adet görünür metin
- [x] summary: 5 satır, 5→1 sırayla adet
- [x] summary: çubuk genişliği yüzdeyle birebir
- [ ] reduced-motion'da geçişlerin kapanması (visual)

## 12. Do / Don't

- ✅ `input`'ta `label` ver — radiogroup'un tek accessible name kaynağı.
- ✅ `summary.distribution`'ı her zaman 5→1 yıldız sırasıyla ver (index 0 =
  5 yıldız adedi).
- ✅ `display`'i yalnız zaten bağlamlı bir kart içinde kullan (kendi zemini
  yok, GlassScoreMeter `badge` ile aynı karar).
- ❌ `input`'a yarım yıldız seçtirmeye çalışma — giriş yalnız 1-5 tamsayı
  (yarım yıldız yalnız `display`/`summary`'nin salt-okunur özetinde var).
- ❌ Cam yüzey/backdrop-filter ekleme — içerik/kontrol katmanı kuralı.
- ❌ `distribution`'ı toplam sayı yerine yüzde olarak verme — ham adet
  bekleniyor, yüzdeyi component hesaplar.

**Açık kararlar:** `size` ekseni ihtiyacı (kart içi mini `display`) ·
`input`'ta hover-önizleme (fareyle üzerine gelince o yıldıza kadar dolması) —
v1'de yalnız hover edilen tek yıldız büyür, komşu yıldızları önizlemez (CSS-only
sibling-highlight deseni karmaşıklık/RTL riskini artırdığından ertelendi) ·
`display`'de `count=0` metninin anlamlı olup olmadığı çağıran tarafın kararı.

## Changelog

- 2026-07-17: Code review fix — `input`'ta `value`/`defaultValue` normalize
  edilmiyordu (`2.5`/`6`/`Infinity` hiçbir radio'yla eşleşmiyordu); ok tuşu
  odak taşıma controlled reddinde `tabIndex=-1` öğeye kilitleniyordu; `label`
  verilmeden isimsiz radiogroup üretilebiliyordu. Üçü de düzeltildi + regresyon
  testleri eklendi.
- 2026-07-17: İlk sürüm — display/input/summary üç varyant, radiogroup +
  roving tabindex giriş deseni, yarım yıldız SVG clip-path dolgusu.
