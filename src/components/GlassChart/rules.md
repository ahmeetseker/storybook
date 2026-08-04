---
name: GlassChart
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassChart Kuralları

## 1. Amaç

Saf SVG veri grafiği (harici kütüphane yok) — zaman serisi verisini çizgi,
gradyanlı alan veya sütun olarak çizer; son nokta vurgulanır, pointer/tap ile
en yakın noktaya değer balonu açılır.

- **Kullan:** ilan fiyat geçmişi, aylık m² birim fiyat trendi, bölge fiyat
  endeksi — tek serili, sıralı (zaman) veri.
- **Kullanma:** çok serili karşılaştırma (bu component tek `points` dizisi
  alır — ikinci seri gerekiyorsa iki `GlassChart` yan yana kompoze et), anlık
  tek değer vurgusu (→ `GlassPriceHeader`), sıralı liste görünümü
  (→ `GlassSpecTable`).

| İlgili | Farkı |
|---|---|
| GlassPriceHeader | Tek fiyat + meta; zaman serisi/trend göstermez |
| GlassSpecTable | Statik etiket/değer listesi; grafik değil |
| GlassLoanCalculator | Anapara/faiz oranı çubuğu tek an'lık iki değer; bu component çok noktalı seri |

## 2. Semantik sözleşme

- Kök element `<div>`; `title` verilirse önce görünür `<h3>` render eder.
- Görsel grafik `<svg role="img" aria-label="...">` — grafiğin **tamamı** AT
  için tek bir imge olarak sunulur (dahili `<path>`/`<rect>`/kılavuz/nokta
  elemanlarının kendi semantiği yoktur, hepsi `role="img"` gövdesi içindedir).
- `aria-label` özeti: `"{title veya 'Değer grafiği'}: {ilk değerin kısa
  biçimi}'den {son değerin kısa biçimi}'ye"` (tek noktada `"...: {değer}"`).
  Kısa biçim: `3.9M`, `4.25M`, `42.5K` (nokta ondalık ayraç, K/M birim).
- Gerçek erişilebilir veri kaynağı `role="img"` gövdesinin **dışında**,
  görsel gizli (`sr-only`) bir `<table>`dır — `<caption>` özet metnini
  tekrarlar, her satır `<th scope="row">` (dönem) + `<td>` (tam biçimli
  değer, `valueSuffix` dahil).
- Pointer kılavuzu (dikey çizgi + nokta) ve değer balonu dekoratiftir —
  `aria-hidden="true"`; x ekseni alt etiketleri de `aria-hidden="true"`
  (aynı bilgi tabloda tam olarak var).
- DOM değişmezi: `points` boşsa grafik hiç render edilmez, yerine `<p>Veri
  yok</p>` gösterilir (svg/tablo yok).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | `<h3>` | verilmezse render edilmez; aria özetinin de öneki |
| y max/min etiketi | `points` doluysa ✅ | iki `<span>` | grid üst/alt çizgisine hizalı, tabular |
| grafik gövdesi | `points` doluysa ✅ | `<svg role="img">` | grid (opsiyonel) + line/area/bar + son nokta |
| son nokta işareti | `points` doluysa ✅ | dolu daire + değer etiketi | her `type`'ta ortak |
| x ekseni etiketleri | `points.length>1` ✅ | ilk/orta/son 3 `<span>` | seyrek, `aria-hidden` |
| pointer kılavuzu + balon | hover/tap'te | dikey çizgi + nokta + tek tooltip `<div>` | `aria-hidden`, `pointerleave`'de kaybolur |
| sr-only tablo | `points` doluysa ✅ | `<table>` (caption+thead+tbody) | tam veri, görsel gizli |
| boş durum | `points=[]` | `<p>Veri yok</p>` | grafik/tablo yok |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| type | prop | `'line'\|'area'\|'bar'` | `'line'` | — | Render stratejisi |
| points | prop | `GlassChartPoint[]` (`{x:string; y:number}`) | — (zorunlu) | — | Sırayla soldan sağa çizilir |
| tint | prop | `string` (CSS renk) | `'var(--lg-accent)'` | — | Çizgi/dolgu/nokta rengi |
| height | prop | `number` | `220` | — | Grafik alanı yüksekliği (px) |
| valueSuffix | prop | `string` | `' TL'` | — | Değer sonuna eklenen birim |
| showGrid | prop | `boolean` | `true` | — | Yatay hairline grid çizgileri |
| title | prop | `string` | — | — | Görünür başlık + aria özet öneki |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title` hariç) | — | — | Köke akar |

Ref hedefi: yok. Event sözleşmesi: yok (dışarı hiçbir callback vermez —
tamamen kendi kendine yeten görsel/pointer davranışı; `onChange` gibi bir
API bilinçli olarak eklenmemiştir, bkz. §12 Açık Kararlar).

## 5. Seçenek eksenleri

`type` tek eksendir (`material`/`tone`/`size`/`thickness`/`prominent` N/A —
flat içerik kartı, tek görsel stil, kontrol değil).

| Kural | Davranış |
|---|---|
| `type='line'` | Yalnız stroke path, dolgu yok |
| `type='area'` | Line path + üstte `color-mix(tint 26%, transparent)` → `transparent` dikey gradyanlı dolgu |
| `type='bar'` | Sütunlar; son sütun `opacity:1`, diğerleri `opacity:0.5` |
| Tüm türlerde ortak | Son nokta konumunda dolu daire + değer etiketi, grid (opsiyonel), y max/min, x ilk/orta/son |
| `points.length===1` | Tek nokta ortalanır (`x` orta), aria özeti `"...: {değer}"` (`'den...'ye` yok) |
| `points.length===0` | Grafik/tablo render edilmez, `<p>Veri yok</p>` |
| `points.length<3` | X ekseni orta etiketi gösterilmez (yalnız ilk/son, çakışma önlenir) |
| `type='bar'` taban | Y ekseni tabanı negatif değer yoksa `0`'a sabitlenir (yalnız veri aralığına — `yMin`e — değil); negatif değer varsa gerçek `yMin` kullanılır. Bu sayede eşit/az değişken serilerde sütunlar `yMin`e eşitlenip sıfır yükseklikte kaybolmaz. |
| Dejenere aralık (`yMax===yMin`, tüm değerler eşit) | Yapay ±%5 (min ±1 birim) dikey aralık uygulanır: `line`/`area` çizgisi plot alanının ortasında durur, `bar` (taban 0 değilse, ör. tüm değerler 0) tabana yapışmaz. |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| hoverIndex | iç `useState` (`pointermove`/`pointerdown` ile `pointerleave`'de `null`) | — | kılavuz + balon `aria-hidden`, AT'ye yansımaz |

Katman sırası: `points` (girdi) → geometri hesapları (saf fonksiyonlar,
`xScale`/`yScale`) → statik render; `hoverIndex` yalnız kılavuz/balonun
görünürlüğünü kontrol eder, veri/geometri hesaplarını etkilemez.

**Stale index güvenliği:** hover açıkken (`hoverIndex` non-null) `points`
prop'u dışarıdan kısaltılırsa eski index sınır dışına düşebilir. İki katmanlı
korunur: (1) render'da türetilen `clampedHoverIndex = Math.min(hoverIndex,
lastIndex)` — ilk boyamada bile `points[hoverIndex]` sınır dışı erişimini
engeller; (2) `useEffect([hasData, lastIndex])` — state'in kendisini de
`lastIndex`e (veya veri kalmadıysa `null`'a) düzeltir, sonraki render'lara
stale değer taşınmaz.

## 7. Davranış

- Pointer: `pointermove` en yakın noktayı (container genişliğine oranla)
  bulur, dikey kılavuz + nokta + değer balonu gösterir; `pointerleave`
  gizler.
- Dokunmatik: `pointerdown` (tap) aynı hesaplamayı yapar ve balonu açar —
  ayrı bir dokunma yolu yoktur, Pointer Events türleri birleşiktir.
- Klavye: yok — grafik etkileşimsiz bir görsel (`role="img"`), odak almaz;
  veri tabanlı gezinme ihtiyacı sr-only tablo ile karşılanır.
- Controlled/uncontrolled: N/A — `hoverIndex` tamamen iç, dışarı sızmaz.
- Async: yok. Overlay: yok — tooltip `position: absolute` ile kendi
  konteynerine göre konumlanır, portal kullanmaz.
- Giriş animasyonu **yoktur** — veri mount anında nihai konumunda render
  edilir; kılavuz/balon da geçişsiz (anlık) görünür/gizlenir. Bu nedenle
  ayrı bir `prefers-reduced-motion` kuralına gerek yoktur (zaten üretilen
  hiçbir animasyon yok).

## 8. İçerik kuralları

- Sayılar `font-variant-numeric: tabular-nums`; değerler
  `Math.round(y).toLocaleString('tr-TR') + valueSuffix` ile biçimlenir
  (ör. `"4.250.000 TL"`).
- Aria özetinde kısa biçim kullanılır (`3.9M`, `42.5K`) — tam hassasiyet
  yalnız sr-only tabloda; bu bilinçli bir katmanlama (bkz. §12).
- `x` etiketleri kısa tutulmalı (ör. `"Oca 26"`) — uzun etiketlerde x ekseni
  satırı `justify-content: space-between` ile taşabilir (Açık Kararlar).
- Boş `points` dizisi `<p>Veri yok</p>` gösterir; çağıran isterse kartı hiç
  render etmemeyi tercih edebilir (boş durum tasarımı minimaldir).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart | background / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| başlık | font-size | `--lg-text-headline` | — |
| grid çizgisi | stroke | `--lg-hairline` | — |
| çizgi/dolgu/nokta | stroke/fill | `tint` prop → varsayılan `--lg-accent` | — |
| area gradyan üst durak | stop-color | `color-mix(in srgb, tint 26%, transparent)` | — |
| son nokta etiketi | color | `--lg-accent` | — |
| y/x etiketleri, tooltip | font-size / color | `--lg-text-caption`/`--lg-text-footnote` / `--lg-label-secondary` | — |
| tooltip yüzeyi | background / border / radius / shadow | `--lg-surface` / `--lg-hairline` / `--lg-radius-chip` / `--lg-shadow-sm` | — |
| boşluklar | gap/padding | `--lg-space-1/2/3/5` | — |

Borç (raw): `VIEW_WIDTH=600` mantıksal SVG genişliği + `PAD_Y=16` dikey
boşluk ve grid satır sayısı (4) component-özel geometri sabitleri, token
karşılığı yok · `svg`'de `preserveAspectRatio="none"` ile yatay ölçekleme
konteyner genişliği 600'den belirgin saparsa son nokta/kılavuz daireleri
hafifçe eliptikleşebilir (küçük yarıçapta — 4-5px — pratikte fark edilmez;
tam pixel-doğru ölçek için `ResizeObserver` ile ölçüm gerekir, bilinçli
olarak eklenmedi, bkz. Açık Kararlar) · mikro-geometri kökte yerel
değişkenlerde toplandı: `--glass-chart-edge-inset: 2px` (son etiket sağ
ofseti), `--glass-chart-tooltip-gap: 1px` (tooltip satır arası) — token
ölçeğine girmeyen küçük UI ofsetleri.

## 10. Storybook kapsamı

Var: Default (fiyat geçmişi, `type='line'`), Playground (tüm public API
kontrol edilebilir), Turler (`line`/`area`/`bar` yan yana karşılaştırma),
AylikM2FiyatTrendi (ikinci gerçek örnek — sütun + `valueSuffix=' TL/m²'`),
UzunIcerik (24 aylık geçmiş, büyük rakamlar), Erisilebilirlik (docs
description — role/aria-label/sr-only tablo).

Eksik: Responsive (dar container'da 600 mantıksal genişlik ölçekleme
davranışı — görsel QA borcu), Temalar (toolbar'daki Arka plan/Tier
global'leriyle dolaylı kapsanır, component kendi tema prop'u almaz), States
(N/A — hover/focus/active prop değil, yalnız pointer'a bağlı iç state).

## 11. Test kabul kriterleri

- [x] `svg role="img"` + `aria-label` özeti (kısa biçim, ilk→son) doğru
- [x] sr-only veri tablosu tüm noktaları tam değerle listeler
- [x] son nokta değer etiketi doğru biçimlenir
- [x] y max/min etiketleri doğru ve tabular
- [x] `showGrid=false` grid çizgilerini kaldırır
- [x] `type='bar'` her nokta için sütun render eder, son sütun işaretli
- [x] `type='area'` gradyanlı path + `linearGradient` render eder
- [x] x ekseni yalnız ilk/orta/son etiketleri gösterir
- [x] `pointermove` en yakın noktaya kılavuz + balon açar, `pointerleave` gizler
- [x] `pointerdown` (tap) aynı işi yapar
- [x] `valueSuffix` özelleştirilebilir
- [x] boş `points` dizisinde "Veri yok" gösterir
- [x] hover açıkken `points` kısalırsa sınır dışı index TypeError atmadan
      clamp edilir (regresyon: rerender ile daraltma)
- [x] `type='bar'` tek değerli (eşit) seride sütunlar sıfır yükseklikte
      kaybolmaz (taban 0'a sabit)
- [x] `type='line'` tek değerli (eşit) seride çizgi dejenere olmadan plot
      alanının ortasında durur
- [ ] görsel: `preserveAspectRatio="none"` ölçeklemesinde son nokta
      dairesinin eliptikleşme derecesi (Chrome görsel QA)

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

- ✅ Tek serili, sıralı (zaman) veri için kullan; `points` dizisini zaten
  soldan sağa sıralı ver — component kendi sıralamaz.
- ✅ `title` her zaman ver — hem görünür başlık hem aria özetinin öneki
  olduğundan atlanırsa özet jenerik `"Değer grafiği"`ye düşer.
- ❌ Çok serili karşılaştırma için genişletmeye çalışma — ayrı bir çok-serili
  component gerekir, bu component'in `points` sözleşmesini bozma.
- ❌ Kart yüzeyine ikinci bir cam katman/backdrop-filter ekleme — içerik
  katmanı bilinçli olarak flat'tir.

**Bilinen kısıtlar:** `preserveAspectRatio="none"` ile mantıksal 600 birim
genişlik gerçek konteyner genişliğinden çok saparsa son nokta/kılavuz
daireleri hafifçe eliptikleşir · x ekseni etiketleri çok uzun metinde
sıkışabilir (kısa tutulmalı) · klavye ile veri noktaları arasında gezinme
yok (yalnız pointer/tap + sr-only tablo).

**Açık kararlar:** pixel-doğru ölçek için `ResizeObserver` tabanlı gerçek
genişlik ölçümüne geçiş (şu an mantıksal sabit `VIEW_WIDTH=600` +
`preserveAspectRatio="none"`, basitlik için tercih edildi) · çok serili
(`points2`/`series[]`) API ihtiyacı doğarsa ayrı component mi yoksa bu
component'in genişletilmesi mi · dokunmatikte `pointerup` sonrası balonun
otomatik kapanması (şu an yalnız `pointerleave` kapatıyor, dokunmatikte bu
olay güvenilir tetiklenmeyebilir — dış tıklamayla kapanma ihtiyacı olabilir).

**Changelog:**
- 2026-08-03 — Ekran okuyucu veri tablosu blok bir kapta gizleniyor: `.srOnly`
  doğrudan `<table>`'a uygulanınca `overflow: hidden` yok sayılıyor ve grafik
  dar ekranlarda sayfada yatay taşma üretiyordu.
- 2026-07-17 — İlk sürüm: `line`/`area`/`bar`, son nokta
vurgusu, pointer/tap kılavuz + balon, `role="img"` + sr-only veri tablosu.

2026-07-17 — Code review fix'leri: (1) hover açıkken `points` kısaldığında
oluşabilecek sınır dışı `hoverIndex` erişimi giderildi (render'da clamp +
`useEffect` ile state düzeltme); (2) `type='bar'` tabanı negatif değer
yoksa `0`'a sabitlendi (eşit değerli serilerde sütunların sıfır yükseklikte
kaybolması giderildi) ve `line`/`area` için dejenere (`yMax===yMin`) aralıkta
yapay ±%5 (min ±1) dikey boşluk eklendi.
