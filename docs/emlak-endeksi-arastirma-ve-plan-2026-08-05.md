# Emlak Endeksi — Araştırma ve Ürün Planı

Tarih: 2026-08-05 · Kaynak: 4 paralel araştırma ajanı (sahibinden kaynak kodu · Türkiye rakipleri · global örnekler · repo envanteri) + codex ürün spesifikasyonu

## Özet — üç karar

1. **sahibinden'i birebir kopyalamayacağız.** Onların Emlak Endeksi'i giriş duvarlı bir *araç*; SEO ürünü değil. Derin URL'ler bot'a `302 → login` döndürüyor, `canonical` sabit köke bakıyor, breadcrumb 2 seviyeli (`Emlak360 > Emlak Endeksi`) ve konum hiyerarşisini hiç taşımıyor. Teorik URL uzayı milyonlarca sayfa iken **indekslenebilir sayfa sayısı ~1-2**. Google'da derin bir endeks URL'sinin başlığı literal olarak "sahibinden.com giriş".
2. **Pazarda tek derin oyuncu var: Endeksa.** Zingat kapandı (`zingat.com` → 301 → `hepsiemlak.com`, bölge raporu URL'leri 404). Endeksa ile Emlakjet aynı gruptan — Emlakjet, Endeksa verisiyle beslenen bir vitrin. Hepsiemlak'ın "emlak endeksi"i interaktif araç değil, aylık haber yazısı.
3. **Farkımız görselleştirme + güven + karşılaştırma olacak.** Pazarın tamamı tablo yığını; choropleth, sparkline, bar-in-cell yok. Karşılaştırma ekranı **hiçbirinde** yok. Reel/nominal ayrımı yalnız Emlakjet'te var.

---

## A) Rakip durumu

| Ürün | Derinlik | Güçlü yanı | Kritik eksiği |
|---|---|---|---|
| **sahibinden Emlak360** | il → ilçe → mahalle (ID bazlı) | ODTÜ ortaklığı, 4 yıl penceresi, aylık güncelleme | Giriş duvarı, SEO sıfır, karşılaştırma max 3 konum, günlük sorgu kotası, demografi TÜİK **2013** (13 yıllık) |
| **Endeksa** | ülke → il → ilçe → mahalle, 10+ sayfa tipi | Likidite metrikleri (stok oranı, pazarlama süresi), senaryo bazlı yatırım skoru, en derin demografi, API+widget | Karşılaştırma yok, reel/nominal yok, tamamı tablo, tahmin güven aralığı olmadan |
| **Emlakjet** | aynı ağaç, ~30 emlak tipi | **Nominal/Reel toggle**, MapLibre 3D harita, `/verilerimiz` metodoloji şeffaflığı | Endeksa motorlu (bağımsız değil), karşılaştırma/PDF yok, duplicate content |
| **Hepsiemlak** | — | Aylık bülten içeriği | Interaktif ürün yok; kullanıcı kendi mahallesini seçemiyor |
| **Zingat** (kapandı) | ilçe + mahalle | 9 kriterli topluluk puanı, min–ort–maks bandı, Raporu Kaydet/Paylaş, sekmeler URL'de | Ürün artık yok — bıraktığı boşluk fırsat |

### sahibinden URL'sinin çözümü

`/emlak360/emlak-endeksi/konut/kiralik/tekirdag/1079/40980`

| Segment | Anlam |
|---|---|
| `konut` | emlak tipi (`konut` \| `isyeri` — **arsa endeksi yok**) |
| `kiralik` | işlem türü |
| `tekirdag` | il — slug |
| `1079` | **ilçe sayısal ID'si** |
| `40980` | **mahalle sayısal ID'si** |

Asimetrik ve okunaksız. Bizim kalıbımız tamamen slug tabanlı olacak.

---

## B) Sayfa seti — 7 tip

> **2026-08-05 revizyonu.** İlk taslakta 11 sayfa tipi vardı. İkinci araştırma turu iki tipi
> eledi ve gerekçeleri sağlam:
>
> - **Ayrı "endeks ana sayfası" yok.** Emlakjet, Endeksa ve Zillow'un üçü de **Türkiye kök
>   sayfasını landing olarak** kullanıyor; il/ilçe/mahalle ile birebir aynı şablon, sadece
>   kapsam değişiyor. Ayrı landing tek şablonu ikiye böler, bakım maliyetini iki katına
>   çıkarır ve SEO'da kazanç getirmez. (sahibinden ayrı landing yapıyor ama zaten SEO'ya
>   kapalı bir ürün.)
> - **Ayrı karşılaştırma sayfası yok.** Redfin, Zillow ve sahibinden'in üçünde de
>   karşılaştırma **grafiğin altına gömülü** bir blok. Kullanıcı zaten bir bölgeye bakarken
>   "peki komşusu?" diye soruyor; onu ayrı bir sayfaya göndermek akışı kırıyor.

URL kalıbı: `/emlak-endeksi/{tip}/{islem}/{il}/{ilce}/{mahalle}`

| # | Sayfa | URL | Öncelik | İndeks |
|---|---|---|---|---|
| 1 | **Türkiye kökü** (landing görevini görür) | `/emlak-endeksi/konut/satilik` | P0 | ✅ |
| 2 | İl sayfası | `.../satilik/istanbul` | P0 | ✅ |
| 3 | İlçe sayfası | `.../istanbul/kadikoy` | P0 | ✅ |
| 4 | **Mahalle sayfası** | `.../istanbul/kadikoy/feneryolu` | P0 | ✅ |
| 5 | Metodoloji | `/emlak-endeksi/metodoloji` | P0 | ✅ |
| 6 | Konut tipi kırılımı | `.../{bolge}/2-arti-1` | P1 | ✅ |
| 7 | Veri kapsamı / changelog | `/emlak-endeksi/veri-kapsami` | P2 | ✅ |

Karşılaştırma, "en çok değerlenen bölgeler" ve yatırım/getiri **ayrı sayfa değil**, yukarıdaki
şablonun blokları: karşılaştırma grafiğin altında (§C.5a), sıralama listeleri il/ilçe
sayfasında (§C.10a), getiri her seviyede KPI + tablo kolonu.

### Şablon recursive'dir

Dört coğrafi seviye **tek şablonu** paylaşır; seviye ilerledikçe bloklar kırpılır:

| Blok | Türkiye | İl | İlçe | Mahalle |
|---|:--:|:--:|:--:|:--:|
| Alt bölge sıralama tablosu | ✅ 81 il | ✅ ilçeler | ✅ mahalleler | ❌ |
| Alt bölge choropleth | ✅ | ✅ | ✅ | ❌ |
| Sıralama listeleri (en çok kazanan/kaybeden) | ✅ | ✅ | ❌ | ❌ |
| Trend grafiği benchmark serisi | ❌ (kendisi referans) | Türkiye | Türkiye + il | Türkiye + il + ilçe |
| Önemli yerler / demografi | ❌ | ❌ | ✅ | ✅ |
| KPI şeridi · trend · kırılımlar · stok · SSS · metodoloji | ✅ | ✅ | ✅ | ✅ |

**Uygulama notu:** sticky sekme çubuğu seviyeye göre **dinamik kırpılmalı** — Emlakjet 4→3,
Endeksa 6→4, Redfin 8→5 sekmeye düşüyor. Sekme sayısını sabit tutup boş bölüm gösterme.

**Kurallar:** Türkçe karakter normalize (`Çankaya → cankaya`), "Mahallesi" eki URL'ye girmez, bölge yeniden adlandırılırsa kalıcı 301, satılık/kiralık canonical'ları ayrı, yetersiz verili sayfa `noindex, follow`.

**Ölçek:** 81 il × ~970 ilçe × 2 işlem × 2 tip → P0'da yaklaşık **4.000 indekslenebilir sayfa**; mahalle katmanıyla on binler. sahibinden'in ~1-2 sayfasına karşı.

---

## C) Blok sırası — mahalle sayfası

Sektörde dört üründe de aynı sıra doğrulandı: **fiyat → sıcaklık → arz → talep**. Arz'ın talepten önce gelmesi bilinçli: "kaç seçenek var" sorusu "ne kadar hızlı satılıyor"dan önce cevaplanır.

| # | Blok | İçerik | Component |
|---|---|---|---|
| 1 | Breadcrumb + veri kimliği | `Türkiye › İstanbul › Kadıköy › Feneryolu` + "Temmuz 2026 · aylık güncellenir" | `GlassBreadcrumb` (href eklenecek) + `GlassDataFreshness` |
| 2 | Başlık + tek cümlelik özet | "Fiyatlar son 12 ayda nominal %34 artarken reel %2 geriledi" | — |
| 3 | **KPI şeridi** | Medyan m² · medyan ilan fiyatı · yıllık nominal · **yıllık reel** | `GlassMetricStrip` |
| 4 | **Güven ve kapsam bandı** | Etkin örneklem, güven aralığı, kalite notu | `GlassConfidencePanel` (yeni) |
| 5 | Fiyat eğilimi | Çok serili: mahalle + ilçe + TCMB benchmark; 1/3/5Y; nominal/reel | `GlassTrendChart` (yeni) |
| 6 | Fiyat dağılımı | P10–P90 histogram + medyan çizgisi | `GlassDistributionChart` (yeni) |
| 7 | Üst bölge karşılaştırması | Mahalle vs ilçe vs il — yatay barlar | `GlassComparisonBars` (yeni) |
| 8 | Konut tipi kırılımları | Oda · bina yaşı · m² aralığı · ısıtma sekmeleri | `GlassTabs` + `GlassTable` |
| 9 | **Arz ve piyasa hareketi** | Aktif ilan, yeni ilan, **stok oranı**, **pazarlama süresi**, fiyat indirimi oranı | `GlassMetricStrip` + `GlassChart` |
| 10 | Kira getirisi ve yatırım | Brüt getiri %, kira çarpanı, amortisman — "14 yıl (%7,03)" tek hücrede | `GlassScoreMeter` + `GlassSpecTable` |
| 11 | Yakın mahalleler | Choropleth + sparkline'lı tablo, çift yönlü hover bağı | `GlassChoroplethMap` (yeni) + `GlassIndexTable` (yeni) |
| 12 | AI veri özeti | 3–5 cümle, yalnız görünür metriklerden, "hangi veriye dayanıyor?" açılımı | `GlassAiSummaryCard` |
| 13 | İlgili ilanlar | Mahalle medyanına göre etiketli | `GlassListingCard` |
| 14 | Metodoloji + SSS | Kaynak, örneklem, ilan/işlem farkı | `GlassDataProvenance` + `GlassAccordion` |
| 15 | **İç linkleme rafı** | İlçedeki tüm mahalleler, komşu ilçeler | `GlassSeoDiscovery` |

### C.5a — Karşılaştırma (grafiğin altına gömülü blok, ayrı sayfa değil)

Redfin'in çözümü sektörün en iyisi: **künye, veri ve kaldırma aksiyonu tek yüzeyde.** Ayrı bir
legend bileşeni yok — tablonun ilk sütunundaki renk noktası zaten künyedir.

| Karar | Değer | Gerekçe |
|---|---|---|
| Maksimum bölge | **4** (kendisi + 3) | sahibinden 3 ile sınırlı ve dar geliyor; 5+ hem renk ayrımını hem mobil tabloyu bozar |
| Ekleme akışı | Grafiğin altında `Bölge Ekle` typeahead + `Karşılaştır` | Redfin deseni. sahibinden'in kaskad `select`'i 2020 kalıntısı, yavaş |
| Künye | Ayrı bileşen **yok** — tablonun ilk sütununda renk noktası + ad + `×` | Zillow'un ayrı künyesi gereksiz tekrar |
| Sabit referans | `Türkiye Ortalaması` satırı her zaman tabloda, **kaldırılamaz**, göz ikonuyla gizlenir | Redfin `nationalPlaceholder` + idealista `data-fixed-first-row` |
| Seri rengi | Giriş sırasına göre atanır ve **bölge silinince yeniden atanmaz** | sahibinden `B[c]` indeks tabanlı atıyor → silmede renkler kayıyor. **Bu bir hatadır, kopyalanmayacak** |
| Tablo kolonları | `Bölge · m² Fiyat · 1 Yıllık · 3 Yıllık · 5 Yıllık · Amortisman · Getiri` | sahibinden 1/2/3/4 veriyor; **1/3/5** Redfin+Zillow+idealista ile uyumlu |
| Mobil | Yatay kaydırılabilir tablo, ilk kolon yapışkan | sahibinden'in "cihazınızı yan çevirin" uyarısı 2020 çözümü — **yapılmayacak** |
| Kalıcılık | Seçili bölgeler URL'de, `Paylaş` butonu | Redfin/Zillow'da Share + Embed var |

### C.10a — Sıralama listeleri (Türkiye ve il sayfasında)

`En Çok Değer Kazanan / Kaybeden İlçeler` + `Amortisman Süresi En Kısa / En Uzun`. Görselleştirme
sahibinden'in `basic-chart` deseni: **yatay bar, genişlik = değer/maks, dolgu opaklığı da aynı
orandan**, değer barın içinde. Tek değerlik bir seride sparkline'a en yakın Türkçe çözüm.

---

İl sayfası mahallenin büyütülmüş kopyası **değil** — keşif ve alt bölge seçimi odaklı: choropleth + ilçe sıralaması öne çıkar, dağılım/kırılım geri çekilir.

---

## C.7a — Alt bölge sıralama tablosu (ürünün ana gezinme aracı)

Üç Türk sitesinin de en çok kullanılan bloğu. Kararlar doğrudan araştırmadan:

| Karar | Değer | Gerekçe |
|---|---|---|
| **Sayfalama** | **Yok.** Tüm satırlar DOM'da (81 il / 39 ilçe / 21 mahalle), yerine tablo içi `Bölge ara…` | Emlakjet, Endeksa ve idealista'nın **üçü de** böyle. "Daha fazla göster" de yok |
| **Sıralama** | Tüm sayısal kolonlar sıralanabilir | idealista her `<td>`'ye `data-sortable` ham değeri koyuyor |
| **Getiri** | **Ayrı kolon** | Emlakjet parantez içine gömüyor (`22 yıl (%4.57)`) — okunmuyor ve sıralanamıyor. Endeksa ayrı kolon yapıyor, doğrusu bu |
| **`Zirveye Uzaklık`** | Yeni kolon: değer + tarih (`%-12 · Mar 2024`) | idealista'nın `Máximo histórico` fikri. **Türkiye'de kimsede yok**; enflasyonist piyasada "reel olarak zirvenin neresindeyiz" en değerli soru |
| **İlanlar** | Sayı değil, **link** | Emlakjet deseni |
| Yapışkan | Başlık satırı + ilk kolon | idealista `js-scroll-header` + `data-fixed-first-row` |
| Sparkline | **Ek** kolon, sıralanabilir değil | Hiçbir portalda yok (§H). Sıralanabilirlikten ödün vermemek için sayısal kolonlar sıralamayı taşır |

Kolon seti: `Bölge · m² Fiyat · 12 ay (sparkline) · Ortalama Fiyat · Amortisman · Getiri · Yıllık Değişim · Zirveye Uzaklık · İlanlar`

## C.11a — Choropleth kademe modeli

Kademe sayıları siteden siteye: **Redfin 3 · idealista 6 · sahibinden 7 · Endeksa 11.**
Okunabilirlik tatlı noktası **5–7**; Endeksa'nın 11 kademesi künyede ayırt edilemiyor,
Redfin'in 3'ü fazla kaba.

**sahibinden'in modeli alınacak** — hem okunabilir hem token'lanabilir: **7 kademe, diverging,
yalnız 2 hue + 3 opaklık kademesi** (`0.2 / 0.6 / 1`), nötr orta nokta gri-mavi.

| Aralık | Kademe |
|---|---|
| `< -20` / `-20…-10` / `-10…0` | düşüş hue, opaklık `1 / 0.6 / 0.2` |
| `= 0` | nötr |
| `0…10` / `10…20` / `> 20` | artış hue, opaklık `0.2 / 0.6 / 1` |

İki uyarlama:
- Künye etiketleri sahibinden'de **simetrik ve işaretsiz** (`%20+` iki uçta da) — yön yalnız
  renkle veriliyor. Bizde işaret konulacak (`−%20+` / `+%20+`), renk tek kanal olmayacak.
- **Veri yok = dokulu desen** (Redfin'in 45° çizgili `linearGradient` çözümü), gri dolgu değil.
  Renk körlüğünde "veri yok" ile "nötr" ayrımı ancak böyle korunur.

Endeksa'nın **ters semantiği** de not: onlarda yeşil = ucuz, kırmızı = pahalı (fırsat ekseni,
artış ekseni değil). İki ekseni aynı haritada karıştırmamak gerekiyor — katman seçicisiyle
ayrılacak.

---

## D) Component durumu

### Değişiklik gerekmeden kullanılacaklar (10)

`GlassMetricStrip` (KPI şeridi — `value`+`change`+`trend`+`hint`; nominal değeri `value`'da, reel'i `hint`'te taşırız) · `GlassSegmentedControl` (dönem 1/3/5Y, satılık/kiralık, nominal/reel) · `GlassDataProvenance` (metodoloji künyesi — `method`/`methodVersion`/`limitations[]`/`geographicResolution` alanları zaten endeks için biçilmiş kaftan) · `GlassSeoDiscovery` (gerçek `<a href>` üreten iç linkleme rafı) · `GlassCompareTable` (2–4 bölge) · `GlassCompareBar` (karşılaştırma tepsisi) · `GlassScoreMeter` (yatırım/likidite skoru) · `GlassTabs` · `GlassAccordion` (SSS) · `GlassEmptyState`.

### Genişletilecekler (3)

| Component | Eksik | Neden gerekli |
|---|---|---|
| `GlassBreadcrumb` | **`href` yok**, yalnız `onClick` | SEO'lu bölge hiyerarşisi bot tarafından okunmalı |
| `GlassTable` | sticky header, sparkline hücre, kendi sıralaması yok | 100+ ilçe/mahalle tablosu |
| `GlassMap` | **choropleth/polygon yok** — sadece pin; repoda hiç GeoJSON yok | Endeksin ana görseli; pin haritası ilan listesi içindir |

### Yeni yazılacaklar (7)

| Component | Sorumluluk | Durum |
|---|---|---|
| `GlassTrendChart` | Çok serili zaman serisi + benchmark. Kesik deseni hem seri sınıfını hem **hiyerarşik uzaklığı** kodlar (`8 4` → `2 3` → `1 5`) | ✅ **yazıldı** (2026-08-05) |
| `GlassDistributionChart` | Histogram + **medyan bandı vurgusu** + persentil şeridi + örneklem künyesi | ✅ **yazıldı** |
| `GlassSparkline` | Tablo hücresi içi mikro trend (eksen yok), zorunlu `label` | ✅ **yazıldı** |
| `GlassConfidencePanel` | Etkin örneklem, güven aralığı, kalite notu, bastırma nedeni | P0 — sayfada `GlassScoreMeter` + künye ile vekâleten |
| `GlassRegionTable` | Sıralanabilir + tablo içi arama + yapışkan başlık/ilk kolon + sayfalama YOK (§C.7a) | P0 |
| `GlassChoroplethMap` | 7 kademe diverging, 2 hue × 3 opaklık, dokulu "veri yok", tabloyla çift yönlü hover (§C.11a) | P1 |
| `GlassCompareTray` | Künye+veri+kaldırma birleşik tablo, sabit referans satırı, kalıcı seri rengi (§C.5a) | P1 |
| `GlassRankBars` | Yatay bar; genişlik **ve opaklık** aynı orandan, değer bar içinde (§C.10a) | P1 |

### Cam katman dağılımı (sayfa başına max 6)

Cam: (1) navbar/breadcrumb çubuğu · (2) sticky filtre/segment çubuğu · (3) mobil sticky KPI barı · (4) harita kontrol paneli · (5) karşılaştırma tepsisi · (6) export/CTA katmanı.

**Grafik kartları, tablolar, KPI kartları ve link rafları `material="flat"` kalır** — veri okunabilirliği refraction'la yarışmaz ve cam üstüne cam yasağı zaten bunu dayatır. Choropleth gibi büyük yüzeylerde `src/core/tier.ts` refraction'ı otomatik kapatır.

---

## E) Veri modeli

Kilit primitif — her metrik kaynağını, örneklemini ve bastırılıp bastırılmadığını kendi taşır:

```ts
interface MetricValue {
  metricKey: string
  value: number | null
  unit: 'TRY' | 'TRY_PER_SQM' | 'PERCENT' | 'COUNT' | 'DAYS' | 'YEARS' | 'INDEX'
  observationType: 'observed' | 'estimated' | 'proxy' | 'official'
  source: 'LISTINGS' | 'TRANSACTIONS' | 'TUIK' | 'TCMB' | 'TKGM' | 'PARTNER'
  sampleSize?: number
  effectiveSampleSize?: number
  confidence?: { level: number; lower: number; upper: number }
  qualityGrade: 'A' | 'B' | 'C' | 'INSUFFICIENT'
  suppressed: boolean
  suppressionReason?: string
}
```

`null ≠ 0 ≠ gizlenmiş` ayrımı baştan kurulu. `observationType` mevcut `GlassDataProvenance.sourceClass` ile birebir eşleşiyor (`official` ↔ TCMB/TÜİK, `platform_derived` ↔ kendi ilan verimiz, `model_estimate` ↔ hedonik çıktı).

Diğer tipler: `Region` (level + parentId + path + validFrom/validTo — **bölge ID'si addan bağımsız ve değişmez**), `IndexSnapshot` (dönem + segment + methodologyVersion + revision), `TimeSeriesPoint` (lower/upperBound + sampleSize + `published|provisional|revised|suppressed`), `ComparisonSet`.

**Yerleşim:** `apps/web/src/features/price-index/` — mevcut `features/regions/` (6 sabit bölge, tek skaler `priceTrend`, sıkıştırılmış tek satır JSX) **genişletilmeyecek**, yanına kurulacak. `listing-detail` desenine uyulacak: `domain/` (tipler + saf hesap + test) · `data/` (fixture + adapter + test) · `components/`.

---

## F) Yayın eşikleri — pazarda kimsede olmayan katman

| Etkin örneklem | Ürün davranışı |
|---:|---|
| `<10` | Hiçbir fiyat metriği yayımlanmaz; üst bölge önerilir |
| `10–19` | Yalnız geniş fiyat aralığı; değişim ve sıralama gizlenir |
| `20–29` | Medyan gösterilebilir; güven aralığı + belirgin uyarı zorunlu |
| `30–59` | Temel fiyat ve değişim; ayrıntılı kırılımlar kısıtlanır |
| `60+` | Standart metrik seti |

"Etkin örneklem" ham ilan sayısı **değildir**: yinelenen ilanlar birleştirildikten, yeniden yayımlananlar tek yaşam döngüsüne bağlandıktan, aynı projedeki yoğun ilanların ağırlığı sınırlandıktan ve aykırı kayıtlar çıkarıldıktan sonra kalan bağımsız gözlem sayısı.

Az verili mahallede pencere sırayla 30 → 90 → 180 güne genişletilir, ama ekranda **"son 6 aylık ilanlara göre"** açıkça yazılır. Komşu mahalle verisi doğrudan mahalle sonucu gibi sunulmaz; hiyerarşik model kullanılırsa "model tahmini" olarak işaretlenir.

"Yetersiz veri" durumunda boş ekran yerine: neden üretilemediği, kaç ilan bulunduğu, hangi üst bölgede güvenilir sonuç olduğu, alarm kurma seçeneği, son güvenilir dönemin tarihi.

---

## G) Terminoloji disiplini

Bu ürünün savunulabilirliği görsel zenginlikten çok bu ayrımlara bağlı:

- Ekranda "m² fiyatı" değil, **"medyan ilan m² fiyatı"**. İşlem verisi yoksa "satış fiyatı" denmez.
- İlanın pasifleşmesi satış demek **değildir** (vazgeçme, süre dolması, yinelenen ilan silinmesi, başka platformda işlem). Bu yüzden "satış hızı" değil **"ilan kapanma hızı"**, "doluluk" değil **"devir hızı vekili"**.
- İlk liste → son liste farkı = **ilan fiyatı indirimi**. Son liste → işlem fiyatı farkı = **gerçek pazarlık payı**. İşlem verisi yoksa pazarlık payı gösterilmez.
- Reel formülü `(1 + nominal) / (1 + enflasyon) − 1`. Nominalden TÜFE'yi çıkarmak yüksek enflasyonda anlamlı hata verir.
- Basit medyan serisine "endeks" denebilir ama **"kalite-ayarlı değildir"** açıkça belirtilir. Hedonik endeks P1 işi.

---

## H) Farklılaştırıcılar

| # | Özellik | Pazardaki durum |
|---|---|---|
| 1 | **Reel/nominal toggle her yerde varsayılan** | Yalnız Emlakjet'te; sahibinden ve Endeksa'da yok |
| 2 | **Bölge karşılaştırma ekranı** | Hiçbirinde yok |
| 3 | **Veri güven katmanı** (örneklem, güven aralığı, bastırma) | Hiçbirinde yok |
| 4 | **Deprem / zemin riski katmanı** | Hiçbirinde yok — TR'de kararın birinci belirleyicisi. `GlassClimateRiskPanel` repoda hazır |
| 5 | **Choropleth + sparkline görselleştirme** | Pazarın tamamı tablo yığını |
| 6 | **"Aynı bütçeyle ne alırım?"** | Hiçbirinde yok |
| 7 | **Topluluk bölge puanı** (9 kriter: gece aydınlatması, park, gürültü) | Zingat kapanınca boşaldı |
| 8 | **Likidite/satılabilirlik skoru** | "Değeri artıyor ama çıkışı zor" — kimsede yok |
| 9 | **Rejim değişimi tespiti** | "Bu mahallede son 3 ayda normalden farklı ne oldu?" |
| 10 | **Raporu kaydet / PDF / paylaş** | Zingat kapanınca boşaldı; danışman-müşteri akışının anahtarı |
| 11 | **Kanıtlı AI özeti** | Her cümlenin arkasında dayanak metriği |
| 12 | **TCMB benchmark'ını yan yana gösterme** | Kimse resmî seriyle kendi serisini kıyaslamıyor |

---

## I) Veri kaynağı stratejisi

| Kaynak | Çözünürlük | Sıklık | Gecikme | Erişim |
|---|---|---|---|---|
| **Kendi ilan verimiz** | mahalle | günlük | yok | ✅ birincil |
| **TCMB EVDS** | il (TL/m²), Düzey-1/2 endeks | aylık | ~15 gün | ✅ ücretsiz REST (JSON/CSV), API anahtarı **header'da** |
| **TÜİK SDMX** | il — satış hacmi | aylık | ~17 gün | ✅ ücretsiz |
| **REIDIN** | **1.255 mahalle** | aylık | ~21 gün | 💰 ticari lisans |

TCMB KFE: hedonik regresyon, banka değerleme raporlarından, **2023=100**, Ocak 2010'a kadar geriye hesaplanmış. Temmuz 2024'te üç aylıktan aylığa geçti, gecikme 45→15 gün. `YKKE` (Yeni Kiracı Kira Endeksi) 17 Şubat 2026'da yayına başladı — kira tarafı için benchmark.

⚠️ **REIDIN-GYODER Yeni Konut Fiyat Endeksi 2022'den beri güncellenmemiş — kullanılmayacak.**
⚠️ EVDS ve TÜİK'in ticari kullanım şartları için yazılı teyit alınmalı.

---

## J) Fazlar

**P0 — güvenilir çekirdek:** landing + il + ilçe + mahalle sayfaları · satılık/kiralık · medyan m² ve toplam fiyat · nominal/reel değişim · fiyat dağılımı · arz ve pazarlama süresi · bölge karşılaştırma · veri güven skoru · metodoloji sayfası · tekilleştirme ve aykırı değer hattı.

**P1 — karar desteği:** kalite-ayarlı hedonik endeks · konut tipi sayfaları · getiri ve amortisman · choropleth haritalar · bölge sıralamaları · yatırım simülatörü · bölge alarmı · AI özetleri.

**P2 — veri hendeği:** doğrulanmış işlem verisi · gerçek pazarlık payı · yaşam/ulaşım/afet katmanları · likidite skoru · profesyonel rapor/API.

**En kritik ürün kararı:** P0'da çok sayıda iddialı metrik göstermek yerine az sayıda ama kaynağı, güveni ve anlamı açık metrik yayımlamak. Bu ürünün savunulabilirliği tekilleştirme kalitesine, ilan–işlem ayrımına, reel fiyat sunumuna ve düşük örneklem disiplinine bağlı.

---

## K) Bilinmeyenler

- sahibinden'in ilan detay sayfasındaki endeks entegrasyonu **doğrulanamadı** — arşivde kanıt yok.
- sahibinden yapısal analizi Kasım 2019 arşivine dayanıyor; grafik tipleri ve tablo kolonlarının bugün de aynı olduğu doğrulanamadı.
- Hepsiemlak sayfa yapısı birinci elden doğrulanamadı (Cloudflare).
- sahibinden'in minimum örneklem eşiği ve aykırı değer yöntemi açıklanmıyor.
- TÜİK SDMX REST endpoint'inin tam adresi bulunamadı.
