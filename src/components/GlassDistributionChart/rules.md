---
name: GlassDistributionChart
category: içerik
status: hazır
lastReviewed: 2026-08-05
---

# GlassDistributionChart Kuralları

## 1. Amaç

**Dağılım histogramı** — bir değerin tek sayıya (medyana) indirgenmesini engeller: gözlemlerin hangi bantlara düştüğünü ve persentilleri birlikte gösterir.

**Kullan:** fiyat/m² dağılımı, süre dağılımı, herhangi bir kategorik-sıralı bant sayımı.
**Kullanma:** zaman serisi (→ `GlassChart` / `GlassTrendChart`), hücre içi mikro trend (→ `GlassSparkline`), kategoriler arası kıyas (bant sırası anlamlı değilse düz bar tablo), **dağılım üstünden aralık seçtirme** (→ `GlassPriceRange`: histogram orada girdinin parçasıdır, burada okuma yüzeyidir).

**Neden `GlassChart type="bar"` yerine geçmez:** GlassChart **son sütunu** vurgular (`data-last`, `opacity 1`). Zaman serisinde doğru davranıştır — son sütun "bugünkü değer"dir. Dağılımda son bant yalnızca *en pahalı* banttır ve özel bir anlamı yoktur; vurgulanması kullanıcıyı yanıltır. Burada vurgulanan **medyanın düştüğü** banttır.

## 2. Semantik sözleşme

- Kök `div`, düz kart yüzeyi (`--lg-surface`). Portal yok.
- `title` verilirse görünür `h3`.
- Çizim `<svg role="img">`; `aria-label` bant sayısı + toplam gözlem + medyan bandını içerir.
- Persentil şeridi `dl`/`dt`/`dd` — etiket–değer çiftidir, liste değil.
- Altında **ekran okuyucuya açık tam veri tablosu**; medyan bandı satır başlığında `(medyan bandı)` olarak işaretlenir. `srOnly` kabı `div`'dir (bkz. `GlassTrendChart` rules §2 — `overflow` `table`'da yok sayılır).
- Bant etiketleri görsel katmanda `aria-hidden` değildir ama veri tablosu asıl kaynaktır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Başlık | Hayır | `title` | `h3` |
| Örneklem künyesi | Hayır | `n = 121 ilan` | `sampleSize` verilirse |
| Çizim | Evet | sütunlar + medyan işareti | `preserveAspectRatio="none"` |
| Bant etiketleri | Evet | bant adları | Kırpılır (ellipsis) |
| Persentil şeridi | Hayır | `markers` | `dl` |
| Veri tablosu | Evet | bant + sayım | `srOnly` |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `bins` | zorunlu | `GlassDistributionBin[]` | — | — | Soldan sağa artan bantlar |
| `markers` | seçenek | `GlassDistributionMarker[]` | — | — | Persentil şeridi |
| `height` | seçenek | `number` | `200` | — | Sütun alanı yüksekliği |
| `countLabel` | seçenek | `string` | `'ilan'` | — | Gözlem birimi |
| `sampleSize` | seçenek | `number` | — | — | Künyedeki `n` |
| `title` | seçenek | `string` | — | — | Kart başlığı |

`GlassDistributionBin`: `{ id, label, count, containsMedian? }`
`GlassDistributionMarker`: `{ id, label, value, prominent? }`

Ref hedefi yok. Event yok — tamamen sunum.

## 5. Seçenek eksenleri

| Eksen | Değerler | Etki |
|---|---|---|
| `containsMedian` (bant) | `boolean` | Sütun dolgusu tam güç + dikey kesikli işaret + etiket vurgusu |
| `prominent` (marker) | `boolean` | Değer `--lg-text-headline` + accent |

**Yasak kombinasyon:** birden fazla bant `containsMedian: true` olamaz. Component bunu zorlamaz ama ilkini işaretler ve dikey işareti ona koyar — iki medyan mantıksal olarak anlamsızdır.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| veri yok | `bins` boş | tüm çizim | "Veri yok" metni |
| medyan işaretsiz | hiçbir bantta `containsMedian` | vurgu + dikey işaret | — |

Etkileşim state'i yoktur: hover/focus yok, odaklanmaz.

## 7. Davranış

- **Pointer/touch:** yok. Balon yoktur — dağılımda önemli olan şekil ve persentillerdir, tek bandın tam sayısı değil (o da veri tablosunda okunur).
- **Keyboard:** odaklanmaz.
- **Motion:** animasyon yok → `prefers-reduced-motion` kuralı gerekmez.

## 8. İçerik kuralları

- Bant etiketleri kısa olmalıdır (`'80–90 bin'`); uzun etiket kırpılır (`text-overflow: ellipsis`) ve tam hâli veri tablosunda kalır.
- Bantlar **sıralı** verilmelidir; component sıralamaz.
- `count: 0` geçerlidir — sıfır yükseklikte sütun çizilir, bant etiketi durur. Bandı listeden çıkarmak dağılımın şeklini bozar.
- `sampleSize` verilmesi güçlü tavsiyedir: dağılımın kaç gözlemden çıktığı gizlenmemelidir (endeks ürününde yayın eşiği kuralı).
- `markers` içinde ortalama ve medyan birlikte verilebilir; çarpık dağılımda ikisinin ayrışması bilgidir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök | background | `--lg-surface` | — |
| kök | border | `--lg-hairline` | — |
| kök | border-radius | `--lg-radius-card` | — |
| kök | padding | `--lg-space-5` | — |
| başlık | font-size | `--lg-text-headline` | — |
| örneklem | font-size | `--lg-text-caption` | — |
| sütun | fill | `color-mix(--lg-accent 32%, --lg-surface)` | medyan → `--lg-accent` |
| bant etiketi | color | `--lg-label-secondary` | medyan → `--lg-accent` + 700 |
| medyan işareti | stroke | `--lg-accent` | — |
| marker değeri | font-size | `--lg-text-footnote` | `prominent` → `--lg-text-headline` |
| şerit ayracı | border-top | `--lg-hairline` | — |

**Borç (raw değer):** SVG içi `PAD_Y: 8`, sütun `rx: 2`, slot doluluk oranı `0.62`, minimum sütun genişliği `6`, medyan işareti `strokeWidth: 1` / `strokeDasharray: '4 3'` / `opacity: 0.55`. Hepsi SVG kullanıcı birimi — CSS token'ına bağlanamaz.

## 10. Storybook kapsamı

| Story | Var |
|---|---|
| Default / Overview | ✅ |
| Playground (Controls) | ✅ |
| Variants / Materials | ✅ `Persentil şeridi olmadan`, `Medyan bandı işaretsiz` |
| Sizes | ✅ `height` control (Playground) |
| States | ✅ `Veri yok`, `Çarpık dağılım` |
| Uzun içerik | ✅ |
| Responsive | ✅ |
| Erişilebilirlik | ✅ |

## 11. Test kabul kriterleri

- **Unit:** bant başına bir `rect`; vurgulanan sütun **medyan bandı**dır, son bant değil (indeks doğrulanır); `containsMedian` yoksa hiç vurgu ve dikey işaret yok; `sampleSize` künyede görünür.
- **Interaction:** N/A (etkileşimsiz).
- **A11y:** veri tablosunda medyan bandı `rowheader`'ında `(medyan bandı)` yazar; persentil şeridi `dl` semantiğindedir.
- **Visual:** N/A.

## 12. Do / Don't

**Do:** medyan bandını işaretle · `sampleSize` ver · sıfır sayımlı bandı listede tut · çarpık dağılımda ortalamayı da marker olarak ekle.
**Don't:** son bandı vurgulamak için `containsMedian` kullanma · bantları sırasız verme · uzun bant etiketi yazma · dağılımı tek sayıya indirip bu component'i atlama.

### Bilinen kısıtlar

- Y ekseni etiketi yoktur; sütun yükseklikleri birbirine göre okunur, mutlak sayım yalnız veri tablosunda ve künyede.
- Box plot değildir; kutu/bıyık gösterimi ayrı component gerektirir (karşılaştırma sayfası için planlandı).
- Bant genişlikleri eşit varsayılır — değişken genişlikli bant (ör. son bant açık uçlu) görsel olarak eşit çizilir.

### Açık kararlar

| Konu | Durum |
|---|---|
| Hover'da bant sayımı balonu | Değerlendirilecek; şimdilik veri tablosu yeterli |
| Değişken bant genişliği | Açık uçlu son bant için görsel işaret düşünülebilir |
| `GlassBoxPlot` | Çoklu bölge dağılım kıyası için ayrı component (P1) |

### Changelog

- 2026-08-05 — ilk sürüm. Emlak Endeksi mahalle sayfasının fiyat dağılımı bloğu için yazıldı; `GlassChart type="bar"`'ın son-sütun vurgusunun histogramda yanıltıcı olması gerekçesiyle.
