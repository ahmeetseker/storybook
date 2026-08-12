---
name: GlassTrendChart
category: içerik
status: hazır
lastReviewed: 2026-08-05
---

# GlassTrendChart Kuralları

## 1. Amaç

Bir değerin seyrini **başka bir seriyle aynı eksende kıyaslar** (mahalle ↔ ilçe ↔ resmî endeks).

**Kullan:** endeks/fiyat sayfalarında bölge–üst bölge–benchmark karşılaştırması, gözlem + tahmin birlikte gösterimi.
**Kullanma:** tek seri gösterimi (→ `GlassChart`), tablo hücresi içi mikro trend (→ `GlassSparkline`), kategorik dağılım (→ `GlassDistributionChart`).

İlgili component'ler:
- **`GlassChart`** — tek serilidir ve `rules.md §12`'de çok serili kullanım açıkça yasaklanmıştır. Bu component onu genişletmez, yanında yaşar; geometri (viewBox 600, PAD_Y 16) bilinçli olarak aynıdır ki iki grafik yan yana durduğunda aynı ritmi paylaşsın.
- **`GlassSparkline`** — eksensiz, künyesiz, hücre ölçeğinde.

## 2. Semantik sözleşme

- Kök `div`, düz kart yüzeyi (`--lg-surface`). Portal yok.
- `title` verilirse görünür `h3` olur ve erişilebilir özetin önekidir.
- Çizim `<svg role="img">`; `aria-label` seri adlarını ve dönem sayısını içerir.
- Altında **ekran okuyucuya açık tam veri tablosu** vardır: bir satır = bir dönem, bir sütun = bir seri. `srOnly` kabı `div`'dir — `overflow: hidden` `table` öğesinde yok sayıldığı için doğrudan tabloya uygulanırsa yatay taşma üretir (GlassChart'ta yaşanmış hata).
- Künye `ul`/`li`; seri adı gerçek metindir, renk örneği `aria-hidden`.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Başlık | Hayır | `title` | Verilirse `h3` |
| Künye | Evet (veri varsa) | seri adı + çizgi örneği + sınıf rozeti | Her seri için bir satır |
| Çizim | Evet | SVG çizgiler + grid + kılavuz | `preserveAspectRatio="none"` |
| Y etiketleri | Evet | min/max | Yalnız iki değer |
| Balon | Hover/tap | dönem + tüm seri değerleri | **Paylaşımlı** |
| X etiketleri | Evet | ilk / orta / son | Seyrek |
| Veri tablosu | Evet | tam seri | `srOnly` |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `series` | zorunlu | `GlassTrendSeries[]` | — | — | Seriler; ilk seri x eksenini belirler |
| `height` | seçenek | `number` | `260` | — | Çizim yüksekliği (px) |
| `valueSuffix` | seçenek | `string` | `' TL'` | — | Değer birimi |
| `showGrid` | seçenek | `boolean` | `true` | — | Yatay grid |
| `title` | seçenek | `string` | — | — | Kart başlığı |

`GlassTrendSeries`: `{ id, label, points, kind?, tint? }` · `GlassTrendPoint`: `{ x: string, y: number | null }`

Ref hedefi yok. Event sözleşmesi yok — hover tamamen içseldir, dışarı olay yaymaz.

## 5. Seçenek eksenleri

| Eksen | Değerler | Etki |
|---|---|---|
| `kind` | `observed` · `benchmark` · `estimated` | Çizgi deseni + rozet + kalınlık |

**Kesik deseni iki bilgi kodlar.** Birincisi seri sınıfı: `observed` düz, `estimated` çizgi-nokta (`5 3 1 3`). İkincisi — `benchmark` serileri arasında — **hiyerarşik uzaklık**: referanslar veriliş sırasına göre seyrelir (`8 4` → `2 3` → `1 5`), yani bölge uzaklaştıkça çizgi zayıflar. Böylece iki referans yan yana konduğunda ayrım yalnız renge kalmaz; renk körlüğünde ve tek renkli baskıda da "hangisi daha yakın bölge" okunur.

Bu desen Emlakjet'in üretimdeki çözümünden alındı (ilçe ortalaması kesikli, il ortalaması noktalı) — sektörde doğrulanmış tek hiyerarşi kodlaması.

Çağıran, referansları **yakından uzağa** sıralamalıdır: mahalle sayfasında önce ilçe, sonra il/ülke.

Varsayılan kombinasyon: `kind="observed"`, palet sırası accent → nötr → karışım → soluk nötr.

**Yasak kombinasyonlar:** yok. **Türetilen seçenekler:** `tint` verilmezse sıradan; `kind` verilmezse `observed`.

**Palet neden semantik token kullanmaz:** `--lg-success`/`--lg-danger` "iyi/kötü" anlamı taşır; bir kıyas serisi ne iyidir ne kötü. Palet `--lg-accent` ve `--lg-label-secondary`'den `color-mix` ile türetilir.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| hover/tap (kılavuz + balon) | iç state (`hoverIndex`) | — | — (balon `aria-hidden`) |
| veri yok | `series` boş | tüm çizim | "Veri yok" metni |

Katman sırası: availability (veri var mı) → value (seri değerleri) → interaction (hover).

`points` kısalınca `hoverIndex` sınır dışı kalabilir; hem efektte hem render anında clamp edilir.

## 7. Davranış

- **Pointer/touch:** `pointermove`/`pointerdown` ile en yakın dönem seçilir, `pointerleave` ile bırakılır. `touch-action: pan-y` — dikey kaydırma engellenmez.
- **Keyboard:** grafik odaklanabilir değildir; veri tablosu ekran okuyucuya zaten açıktır.
- **Focus akışı:** yok.
- **Controlled/uncontrolled:** yok — tamamen sunum.
- **Async / overlay:** N/A.

## 8. İçerik kuralları

- Seri adı **zorunludur**; renk tek başına kanal değildir.
- `y: null` → çizgi kopar. Düz çizgiyle doldurulmaz: yayımlanmayan dönemle sıfır arasında fark vardır.
- Uzun TR seri adları künyede sarar, grafiği daraltmaz.
- Tüm seriler aynı x etiketlerini paylaşmalıdır. Farklı uzunlukta seri verilirse eksik dönemler `undefined` → "veri yok" okunur; hizalama ilk seriye göredir.
- Palet 4 serilik; daha fazlası döngüye girer ve ayırt edilemez → **en fazla 4 seri**.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök | background | `--lg-surface` | — |
| kök | border | `--lg-hairline` | — |
| kök | border-radius | `--lg-radius-card` | — |
| kök | padding | `--lg-space-5` | — |
| başlık | font-size | `--lg-text-headline` | — |
| künye | font-size | `--lg-text-footnote` | — |
| rozet | font-size | `--lg-text-badge` | — |
| grid | stroke | `--lg-hairline` | — |
| seri 1 | stroke | `--lg-accent` | — |
| seri 2 | stroke | `--lg-label-secondary` | — |
| balon | box-shadow | `--lg-shadow-sm` | — |

**Borç (raw değer):** mikro-geometri `--glass-trend-swatch-w: 24px`, `-swatch-h: 8px`, `-dot: 8px`, `-row-gap: 2px`. Token ölçeğinde karşılığı yok; çizgi örneği ve balon noktası bu ölçekte okunur. SVG içi `strokeWidth` (2 / 2.5) ve dash desenleri (`8 4` / `2 3` / `1 5` / `5 3 1 3`) de raw'dır — SVG kullanıcı birimi CSS token'ına bağlanamaz.

## 10. Storybook kapsamı

| Story | Var |
|---|---|
| Default / Overview | ✅ |
| Playground (Controls) | ✅ |
| Variants / Materials | ✅ `Üç seri`, `Tahmin serisi` (kind ekseni) |
| Sizes | ✅ `height` control (Playground) |
| States | ✅ `Eksik dönem`, `Veri yok` |
| Uzun içerik | ✅ |
| Responsive | ✅ |
| Erişilebilirlik | ✅ |

## 11. Test kabul kriterleri

- **Unit:** seri başına bir `path`; `kind` → doğru `stroke-dasharray`; `null` değerde iki ayrı `M` komutu (kopuk çizgi); boş seride "Veri yok".
- **Interaction:** hover'da paylaşımlı balon açılır ve tüm seri adlarını içerir.
- **A11y:** veri tablosunda seri başına bir `columnheader`; benchmark/estimated başlığında sınıf notu; `null` → "veri yok".
- **Visual:** N/A (görsel regresyon kurulu değil).

## 12. Do / Don't

**Do:** kıyas serisini `kind="benchmark"` ver · yayımlanmayan dönemi `null` bırak · seri adını cümle gibi yaz ("Kadıköy ortalaması").
**Don't:** 4'ten fazla seri verme · `tint`'i semantik token'a bağlama · tek seri için bunu kullanma (→ `GlassChart`) · `null` yerine 0 yazma.

### Bilinen kısıtlar

- Üçten fazla `benchmark` serisi kesik deseni bakımından ayırt edilemez (`BENCHMARK_DASHES` üç desen taşır, sonrası son desene sabitlenir) — zaten 4 seri tavanı var.
- X ekseni yalnız üç etiket gösterir (ilk/orta/son) — GlassChart ile aynı sınır.
- Y ekseni yalnız min/max gösterir; ara değer yok.
- Güven aralığı bandı henüz yok (`showConfidenceBand` planlandı, uygulanmadı).
- Seriler hizalamayı ilk seriye göre yapar; farklı x etiketli seriler sessizce yanlış hizalanabilir.

### Açık kararlar

| Konu | Durum |
|---|---|
| Güven aralığı bandı (yarı saydam) | P1 — endeks güven aralığı için gerekli |
| Seri aç/kapa (künyeye tıklayarak) | Karşılaştırma sayfası için değerlendirilecek |
| Y ekseninde ara değer | Grafik yüksekliği 300px üstündeyse anlamlı olabilir |

### Changelog

- 2026-08-05 — ilk sürüm. Emlak Endeksi mahalle sayfasının "mahalle ↔ ilçe ↔ TCMB" kıyas bloğu için yazıldı.
- 2026-08-05 — kesik deseni artık benchmark'lar arasında hiyerarşik uzaklığı da kodluyor (`8 4` / `2 3` / `1 5`); önceki sürümde tüm referanslar `7 5` paylaşıyor ve yalnız renkle ayrılıyordu. `estimated` deseni `2 4` → `5 3 1 3` (çizgi-nokta) olarak ayrıştırıldı.
- 2026-08-12: Recharts 3 geçişi. Saf SVG geometri Recharts'a devredildi;
  public sözleşme (props, sr-only veri tablosu, boş durum, tr-TR biçim)
  değişmedi. ResponsiveContainer yerine `useElementSize` (jsdom/SSR 600px
  fallback — deterministik test/hidrasyon). Tooltip içeriği bizim, konum ve
  crosshair Recharts'ın; `accessibilityLayer` v3 varsayılanıyla grafik
  klavyeyle gezilebilir (sparkline'da bilinçli kapalı). Giriş animasyonu
  kapalı kaldı. Eksenler gerçek tiklerle çizilir (kısa biçim). Varsayılan
  palet açıklık zıtlığıyla yeniden dizildi — dataviz doğrulayıcısında komşu
  çiftler ΔE ≥ 25 (eskisi 5.9 ile normal görüşte bile ayırt edilemiyordu).
