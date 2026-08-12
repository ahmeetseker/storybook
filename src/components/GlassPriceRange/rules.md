---
name: GlassPriceRange
category: kontroller
status: hazır
lastReviewed: 2026-08-06
---

# GlassPriceRange Kuralları

## 1. Amaç

Dağılım histogramının üstünde çift kollu aralık seçici: kullanıcı aralığı
seçmeden **önce** yoğunluğun nerede olduğunu görür, seçtikten sonra hangi
bandı kapsadığını sütun vurgusundan okur.

- **Kullan:** fiyat / m² / kira aralığı, arama daraltma panelleri.
- **Kullanma:** tek değer seçimi (→ `GlassSlider`), okuma amaçlı dağılım
  analizi (→ `GlassDistributionChart`), kategorik daraltma (→ `GlassChip`).

| İlgili | Farkı |
|---|---|
| GlassSlider | Tek kol, tek değer; histogram ve pil kavramı yok |
| GlassDistributionChart | Girdi değil okuma yüzeyi: medyan bandını vurgular, persentil şeridi taşır, seçim yapılamaz |
| GlassFilterPanel | Bunun oturduğu landmark kabuğu (başlık + sonuç sayısı + sıfırlama) |

## 2. Semantik sözleşme

- Kök: `<div role="group">`; `label` verilirse görünen başlıkla
  `aria-labelledby`, verilmezse ad çağıranın (`aria-label` rest ile geçer).
- İki kol native `<input type="range">` → `slider` rolü, sürükleme, odak ve
  `aria-valuemin/max/now` bedava. Adlar `{label}: en düşük` / `{label}: en yüksek`.
- `aria-valuetext` her zaman `formatValue`'dan gelir (ham sayı değil).
- Histogram (`aria-hidden`) ve skala satırı (`aria-hidden`) **dekoratiftir**:
  taşıdıkları bilgi kolların ARIA değerlerinde ve dağılımın sr-only özetinde
  zaten vardır — çift okuma yapılmaz.
- DOM değişmezleri: sütunlar `[data-part="bin"]`, seçili olanlar
  `[data-active="true"]`; kollar/thumb'lar `[data-handle="min"|"max"]`;
  piller `[data-part="pill"]`, birleşik olan ayrıca `[data-merged="true"]`.
  Portal yok. Ölçüm için DOM'a **gizli metin kopyası eklenmez** (bkz. §7):
  aynı değer sayfada iki kez geçmez.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| head | `label` \|\| `hint` | başlık + ikincil not | Not sağa yaslı, ikincil renk |
| plot | `bins?.length` | histogram sütunları | Eşit genişlik; seçimle **kesişen** bant vurgulanır |
| slider | ✅ | ray + dolgu + 2 kol | Dolgu iki kol arası; kollar ray uçlarından taşmaz |
| scale | ✅ | alan sınırları + değer pilleri | Tek satır: sınırlar uçlarda, piller kolların altında |
| özet | `bins?.length` | sr-only dağılım cümlesi | "seçili aralıkta n / m {countLabel}" |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| min / max | prop | `number` | — | — | Skalanın uçları; zorunlu |
| step | prop | `number` | `1` | — | Sürükleme ve klavye bu adıma yuvarlar |
| value | prop | `[number, number]` | — | controlled | Ters sıra gelirse normalize edilir, alan dışı kıstırılır |
| defaultValue | prop | `[number, number]` | `[min, max]` | uncontrolled | — |
| onChange | prop | `(v: [number, number]) => void` | — | — | Yalnız değer **gerçekten** değişince |
| label | prop | `string` | — | — | Görünen başlık + kol adlarının kökü (`'Aralık'` fallback) |
| hint | prop | `ReactNode` | — | — | Başlığın sağındaki ikincil not |
| bins | prop | `number[]` | — | — | Soldan sağa eşit bantların gözlem sayısı; boş/yok → histogram çizilmez |
| countLabel | prop | `string` | `'ilan'` | — | sr-only özetteki birim |
| formatValue | prop | `(v: number) => string` | `toLocaleString('tr-TR')` | — | Pil, sınır etiketi ve `aria-valuetext` |
| minGap | prop | `number` | `step` | — | İki kol arası en küçük mesafe |
| disabled | prop | `boolean` | `false` | — | Kollar kapanır, opaklık düşer |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | — | Kök div'e; `style` yerel değişkenlerin üstüne biner |

Ref forward edilmez. `onChange` yalnız kıstırma/yuvarlama **sonrası** değer
farklıysa çalışır: sağ uca yapışmış kolu daha da itmek olay üretmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `step=1`, `minGap=step`, `bins` yok, `disabled=false`.

| Kural / türetilen | Davranış |
|---|---|
| `bins` yok | Histogram + sr-only özet render edilmez (düz aralık seçici) |
| `label` yok | Başlık satırı yalnız `hint` varsa çizilir; kol adları `Aralık: …` |
| kollar arası < %18 **veya** piller sığmıyor | İki pil tek pile birleşir (`{min} – {max}`) |
| pil sınıra < %12 | Alan sınırı etiketi söner (değer pilde okunuyor) |
| `pointer: coarse` | Kol 28px, ray 8px; dokunma hedefi 44px |

`material` / `tone` **ekseni yoktur**: bu component içerik katmanındadır, cam
yüzeyi taşıyıcı kurar (cam üstüne cam yok).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / DOM |
|---|---|---|---|
| değer (aralık) | `value` ?? internal | — | Kolların `aria-valuenow` / `aria-valuetext` |
| bant aktif | değer × bant kesişimi | — | `[data-active="true"]` |
| pil birleşik | kollar arası mesafe | iki ayrı pil | `[data-merged="true"]` |
| sınır sönük | pil yakınlığı | sınır etiketi | `[data-dim="true"]` (opacity 0) |
| ön kol | sağ kol uçta mı | diğer kolun tıklanabilirliği | `.slider[data-front]` z-index |
| disabled | prop | tüm etkileşim | `input:disabled` |
| focus-visible | CSS | — | `--lg-accent` halkası ilgili thumb'da |

Katman: availability (disabled) → value (aralık, bant vurgusu) → interaction
(focus).

## 7. Davranış

- **Pointer:** girdi kutuları tıklamayı yutmasın diye `pointer-events` yalnız
  native thumb'da açıktır; iki kol da bağımsız yakalanır. Ray boşluğuna
  tıklamak değeri **atlatmaz** (belirsiz sıçrama yerine kasıtlı sürükleme).
- **Klavye** (kol odaktayken): `←/↓` −step, `→/↑` +step, `PageUp/PageDown`
  ±10 step, `Home` alan başı, `End` alan sonu. Tuşlar manuel yönetilir
  (`preventDefault`) — GlassSlider ile aynı gerekçe: her ortamda deterministik
  ve `step`e sadık.
- **Geçişme yok:** sol kol `max - minGap`'i, sağ kol `min + minGap`'i aşamaz;
  kıstırma hem sürükleme hem klavye yolunda aynı yerde (`commit`) yapılır.
- **Ön kol:** sağ kol sağ uca yapıştığında artık sağa gidemeyeceği için sol kol
  öne alınır — yoksa üst üste binen kollar aralığı kilitlerdi.
- **Controlled/uncontrolled:** `value` verilirse iç state hiç yazılmaz;
  `onChange` çağrılır ve DOM ancak dışarıdan gelen değerle değişir.
- **Pil çakışması:** yüzde eşiği tek başına yetmez — metin uzunluğunu CSS
  bilmez, "3.750.000 ₺" ile "850 ₺" aynı yüzdede çok farklı yer kaplar. Pil
  genişliği bu yüzden **canvas'ta** ölçülür (pilin computed font + padding'i
  okunur, `ResizeObserver` kap genişliğini izler). Üç kural bu ölçümü güvenli
  kılar:
  1. Ölçüm birleşme kararından **bağımsızdır** (kaynağı metin, kap genişliği ve
     yüzde) — "birleş → yer açıldı → ayrıl → çakıştı" salınımı oluşamaz;
     sınırda tam bir adımlık tek geçiş olur.
  2. Ölçümden önce rakamlar eşitlenir (`normalizeDigits`): piller
     `tabular-nums` çizilir, canvas bu ayarı bilmez — normalize edilmezse karar
     komşu adımlar arasında zıplardı.
  3. Yerleşim ölçülemiyorsa (jsdom, `display: none` kap) yalnız yüzde kuralı
     çalışır; canvas o durumda hiç kurulmaz.
- Overlay / async: N/A.

## 8. İçerik kuralları

- `formatValue` para birimini ve binlik ayracını **çağıran** verir; component
  ham sayıyı `tr-TR` yerelinde yazmakla yetinir.
- Piller sarmalanmaz (`white-space: nowrap`) ve konumları kendi genişlikleriyle
  kıstırılır: %0'da sola, %100'de sağa yaslanır — uzun değerlerde bile kaptan
  taşmaz.
- `hint` tek satırlık ikincil bilgidir (ortalama, medyan, ilan sayısı); uzun
  metin sağa yaslı sarmalanır, başlığı ezmez.
- Sayılar tabular (`font-variant-numeric: tabular-nums`) — sürüklerken
  rakamlar zıplamaz.
- Etiket dili Türkçe sabittir (`en düşük` / `en yüksek`, `Dağılım: …`); i18n
  prop'u yok.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| sütun | zemin | `color-mix(--lg-label 14%)` | aktif → `--lg-accent` |
| ray | zemin / kenar | `color-mix(--lg-label 10%)` + `--lg-hairline` | — |
| dolgu | zemin | `--lg-accent` | — |
| kol | zemin / gölge | `--lg-surface` + `--lg-shadow-sm` | focus-visible → `--lg-accent` halka |
| pil | zemin / metin | `--lg-label` / `--lg-bg` | — |
| sınır etiketi | renk / boyut | `--lg-label-secondary` / `--lg-text-caption` | dim → `opacity: 0` |
| başlık | boyut | `--lg-text-footnote` | — |
| boşluklar | gap | `--lg-space-1..3` | — |
| dokunma hedefi | yükseklik | `--lg-control-hit` | — |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler kökte yerel
değişkende toplandı — `--price-thumb: 20px` (coarse 28px), `--plot-h: 56px`,
`--bin-gap: 2px`, `--bin-min-h: 3px`, `--bin-radius: 2px`, `--track-h: 6px`
(coarse 8px), `--slider-h: 24px`, `--scale-h: 24px`, `--pill-pad-y: 3px`,
`--fade: 0.18s` (süre token'ı yok). Kol konum formülündeki `0.01` ve `50`
sabitleri native range telafisidir (GlassSlider ile aynı). Pil/sınır çakışma
eşikleri (`MERGE_THRESHOLD 18`, `EDGE_THRESHOLD 12` yüzde; `PILL_GAP 12px`) TS
tarafında sabittir — metin genişliği CSS'te ölçülemediği için. `PILL_GAP`
aynı zamanda ölçüm hatasının payıdır: kol konumundaki uç telafisi
(`--pos-*`) hesaba katılmaz, ölçülen sapma ≤ 2px'tir.

## 10. Storybook kapsamı

Var: `Default`, `Playground`, `Histogramsız` (variant ekseni), `Birleşik Pil`,
`Uçlarda Seçim`, `Controlled Değer` (canlı sonuç sayısıyla), `Uzun İçerik`
(8 haneli değer + uzun not), `Responsive` (280px + mobile1), `Durumlar`
(etkin/kapalı), `Erişilebilirlik`. `size` ekseni yok (component tek ölçüdür,
dokunmatikte kendi büyür) → `Sizes` N/A. hover/focus CSS state'idir, control
yapılmaz.

## 11. Test kabul kriterleri

- [x] adlandırılmış grup + iki kol, doğru `aria-valuetext` (unit)
- [x] alan sınırları ve kol değerleri pil olarak görünür
- [x] kollar yaklaşınca tek birleşik pil
- [x] `formatValue` pil / sınır / `aria-valuetext` üçünde de geçerli
- [x] yalnız seçimle kesişen bantlar vurgulanır
- [x] sr-only dağılım özeti doğru sayar
- [x] `bins` yoksa histogram ve özet yok
- [x] sol kol sağı, sağ kol solu geçemez (`minGap`)
- [x] klavye: ok / Home / End
- [x] controlled değer kendi kendine oynamaz
- [x] ters sıralı `value` normalize edilir
- [x] `disabled` etkileşimi kapatır
- [x] uzun değerlerde piller çakışmadan birleşir ve sınırda salınmaz
      (tarayıcı doğrulaması: 110 adım sola + 110 adım sağa taramada tam 2 geçiş,
      hiçbir adımda örtüşme yok — jsdom'da ölçüm olmadığı için unit test bunu
      kapsayamaz)
- [ ] iki kol üst üsteyken ön kol seçimi (visual/e2e — pointer gerektirir)

## 12. Do / Don't

- ✅ `bins`'i gerçek dağılımdan üret; uydurma histogram veri dürüstlüğünü bozar.
- ✅ Para birimini `formatValue` ile ver, `hint`'e ortalamayı yaz.
- ✅ Sonuç sayısını panelin başlığında canlı göster (`GlassFilterPanel`).
- ❌ Aralığı iki ayrı `GlassSlider` ile kurma: geçişme, pil ve histogram
  vurgusu kaybolur.
- ❌ `bins`'i sonuç listesiyle karıştırma — sütunlar **alan** dağılımıdır,
  seçim onları filtrelemez, yalnız vurgular.
- ❌ Component'e cam yüzey giydirme; taşıyıcı panel zaten yüzeydir.

**Bilinen kısıtlar:** ray boşluğuna tıklama kolu taşımaz; iki kolun 44px'lik
dokunma hedefleri yaklaşınca üst üste biner (ön kol kuralı yalnız uç durumu
çözer); `bins` eşit genişlikte bant varsayar (değişken bant genişliği
desteklenmez); pil genişliği canvas'ta ölçülür — `letter-spacing` ve bağlı
yazı biçimleri hesaba katılmaz, `PILL_GAP` payı bu hatayı yutar. **Açık kararlar:** logaritmik skala seçeneği · kolların
sürüklenirken canlı sonuç sayısını debounce'lu duyurması.

## Changelog

- 2026-08-06 — İlk sürüm. Referans emlak filtresindeki "price range" bloğunun
  karşılığı: histogram + çift kol + kolları izleyen değer pilleri tek
  sözleşmede toplandı. `GlassSlider` tek kollu kaldı, `GlassDistributionChart`
  okuma yüzeyi olarak ayrıldı.
