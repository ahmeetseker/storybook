---
name: GlassSparkline
category: içerik
status: hazır
lastReviewed: 2026-08-05
---

# GlassSparkline Kuralları

## 1. Amaç

Tablo hücresine sığan **eksensiz mikro trend** — bir satırın yönünü sayıya ek olarak tek bakışta okutur.

**Kullan:** sıralama/kıyas tablolarında satır başına trend sütunu, KPI kartında değerin altında mini seyir.
**Kullanma:** okunacak eksen/değer gerektiğinde (→ `GlassChart`), çok serili kıyasta (→ `GlassTrendChart`), dağılımda (→ `GlassDistributionChart`).

**Neden ayrı component:** `GlassChart` min 220px yükseklik, eksen etiketleri, grid, başlık ve tooltip taşır; hücreye giremez. Küçültmek değil, çıkarmak gerekiyordu.

## 2. Semantik sözleşme

- Kök `span` (satır içi; `td` içinde yaşar). **Kendi yüzeyi yoktur** — kabın zeminini kullanır.
- Çizim `<svg role="img">`; `aria-label` = `"{label}: {yön}, {ilk}'den {son}'e"`.
- Sparkline **dekoratif değil veridir** → `role="img"` + `label` zorunlu. `aria-hidden` yapılmaz.
- Yetersiz veride SVG hiç render edilmez; `srOnly` gerekçe metni + görünür tire.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Çizgi | Evet (≥2 nokta) | `path` | Eksen/grid yok |
| Son nokta | Evet | `circle` r=2 | Serinin bittiği yeri işaretler |
| Tire | Yetersiz veride | `—` | `aria-hidden`; gerekçe `srOnly`'de |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `points` | zorunlu | `number[]` | — | — | Soldan sağa değerler; <2 ise tire |
| `label` | zorunlu | `string` | — | — | Erişilebilir ad kaynağı |
| `trend` | seçenek | `'up' \| 'down' \| 'steady'` | türetilir | — | Yönü açıkça belirler |
| `tint` | seçenek | `string` | yönden | — | Çizgi rengi |
| `width` | seçenek | `number` | `72` | — | px |
| `height` | seçenek | `number` | `24` | — | px |

Ref hedefi yok. Event yok.

## 5. Seçenek eksenleri

| Eksen | Değerler | Etki |
|---|---|---|
| `trend` | `up` · `down` · `steady` | sr-only yön metni + varsayılan renk |

Türetme kuralı: `(son − ilk) / |ilk|`; mutlak değeri **%1'in altındaysa `steady`**. `ilk === 0` özel durumu ayrıca ele alınır (sıfıra bölme yok).

`trend` açıkça verilirse türetme geçersiz kılınır — hesaplanmış yön (ör. mevsimsellikten arındırılmış) dışarıdan gelebilir.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| yetersiz veri | `points.length < 2` | çizim | gerekçe metni |

Etkileşim state'i yoktur: hover/focus/active yok, odaklanmaz.

## 7. Davranış

- **Pointer/touch:** yok — tıklanabilir değildir. Satırın tamamı link ise onun içinde yaşar.
- **Keyboard:** odaklanmaz (`tabindex` yok).
- **Motion:** animasyon yok → `prefers-reduced-motion` kuralı gerekmez.

## 8. İçerik kuralları

- `label` satırın hangi veriye ait olduğunu söylemelidir: `"Göztepe · son 12 ay medyan m² fiyatı"`. Yalnız `"trend"` yazmak yetersizdir.
- Uzun TR etiket yalnız erişilebilir ada girer; görsel genişliği etkilemez.
- Nokta sayısı üstten sınırlı değildir ama 60'tan fazlası 72px'de okunmaz — çağıran seyreltmelidir.
- Yetersiz veri gizlenmez, gerekçesiyle bildirilir (endeks ürününde "veri yok" bir bilgidir).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| tire | font-size | `--lg-text-footnote` | — |
| tire | color | `--lg-label-secondary` | — |
| çizgi (`up`) | stroke | `--lg-success` | — |
| çizgi (`down`) | stroke | `--lg-danger` | — |
| çizgi (`steady`) | stroke | `--lg-label-secondary` | — |

**Borç (raw değer):** `width`/`height` prop'ları px sayısıdır (SVG viewBox birimi — token'a bağlanamaz); `strokeWidth: 1.5`, son nokta `r: 2`, iç `pad: 2` de SVG kullanıcı birimidir.

**Not:** yön renkleri burada semantik token kullanır ve bu bilinçlidir — `GlassTrendChart`'ın aksine sparkline'da renk *yönü* anlatır, seriyi değil; yükseliş/düşüş semantik olarak success/danger ile eşleşir. Yön ayrıca `aria-label` metninde de geçer, yani renk tek kanal değildir.

## 10. Storybook kapsamı

| Story | Var |
|---|---|
| Default / Overview | ✅ |
| Playground (Controls) | ✅ |
| Variants / Materials | ✅ `Yönler` |
| Sizes | ✅ `Boyutlar` |
| States | ✅ `Yetersiz veri` |
| Uzun içerik | ✅ |
| Responsive | ✅ |
| Erişilebilirlik | ✅ |
| (ek) Gerçek bağlam | ✅ `Tablo içinde` |

## 11. Test kabul kriterleri

- **Unit:** `aria-label` yön + uç değerleri içerir; yön türetme (up/down/steady, %1 eşiği); açık `trend` türetmeyi ezer; `points.length < 2` → SVG yok + gerekçe metni; segment sayısı = nokta − 1.
- **Interaction:** N/A (etkileşimsiz).
- **A11y:** `role="img"` mevcut; label zorunluluğu tip düzeyinde.
- **Visual:** N/A.

## 12. Do / Don't

**Do:** `label`'a bölge adını ve dönemi yaz · yetersiz veriyi olduğu gibi göster · tabloda sayı sütununun yanında kullan.
**Don't:** `aria-hidden` yapma · tek başına (sayı olmadan) kullanma — sparkline ölçek vermez, sayının yerine geçmez · 60+ noktayı seyreltmeden verme.

### Bilinen kısıtlar

- Ölçek yoktur: iki sparkline yan yana geldiğinde her biri kendi min/max'ına normalize olur, yükseklikleri kıyaslanamaz. Kıyas gerekiyorsa ortak eksen (`GlassTrendChart`) gerekir.
- `null` (eksik dönem) desteklenmez — `points` düz `number[]`. Kopuk seri gerekiyorsa `GlassTrendChart`.

### Açık kararlar

| Konu | Durum |
|---|---|
| Ortak ölçek (`domain` prop'u) | Tablo genelinde kıyas istenirse eklenecek |
| `null` nokta desteği | İhtiyaç doğarsa `(number \| null)[]`'a genişletilir |

### Changelog

- 2026-08-05 — ilk sürüm. Emlak Endeksi mahalle/ilçe sıralama tabloları için yazıldı.
- 2026-08-12: Recharts 3 geçişi. Saf SVG geometri Recharts'a devredildi;
  public sözleşme (props, sr-only veri tablosu, boş durum, tr-TR biçim)
  değişmedi. ResponsiveContainer yerine `useElementSize` (jsdom/SSR 600px
  fallback — deterministik test/hidrasyon). Tooltip içeriği bizim, konum ve
  crosshair Recharts'ın; `accessibilityLayer` v3 varsayılanıyla grafik
  klavyeyle gezilebilir (sparkline'da bilinçli kapalı). Giriş animasyonu
  kapalı kaldı. Eksenler gerçek tiklerle çizilir (kısa biçim).
