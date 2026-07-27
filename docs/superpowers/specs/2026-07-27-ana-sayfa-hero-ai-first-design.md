# Ana sayfa hero — AI-first yeniden tasarım

**Tarih:** 2026-07-27
**Kapsam:** `apps/web` ana sayfa hero'su (`MapFirstHome`) + kütüphane tarafında `GlassMap` ve `GlassHero`
**Durum:** Tasarım onaylandı, uygulama planı bekleniyor

## 1. Amaç

Ana sayfa hero'su bugün doğru işi yanlış tonda yapıyor: ham OpenStreetMap tile'ı sitenin fildişi–amber
paletine ait değil, harita paneli çerçevesiz duruyor, sol blok tek bir arama satırından ibaret ve
başlık yalnız arsayı işaret ediyor — oysa platform konut da kapsıyor.

Hedef: hero'yu **AI-first bir ajan girişi** hâline getirmek ve premium hissi haritanın kendisinden
almak. Rakip konumlandırması: Emlakjet'te AI bir buton, Redfin'de sonuç sayfasında; burada hero'nun
kendisi ajan ve söylediği her şeyin arkasında EİDS tapu kaydı var.

## 2. Mevcut durumun teşhisi

Ekran görüntüsü ve kod karşılaştırmasından çıkan bulgular:

| # | Bulgu | Kaynak |
|---|---|---|
| 1 | Ham OSM tile'ı (yeşil orman, mavi deniz, pembe otoyol) fildişi `#faf8f4` + amber `#b45309` paletiyle uyuşmuyor | `LeafletListingMap.tsx` |
| 2 | Leaflet'in kendi zoom kutusu ve mavi linkli atıf şeridi görünüyor; ayrıca kendi `.credit` chip'i de var → çift atıf | `LeafletListingMap.tsx:9` |
| 3 | `.mapRegion`'da radius, kenarlık, gölge ve `overflow: hidden` yok — harita hero'ya yapıştırılmış duruyor | `MapFirstHome.module.css:26` |
| 4 | `.mapRegion .heroMap` ve `.mapPopup` kuralları hiçbir düğüme uygulanmıyor — ölü kod; mobil yükseklik override'ı çalışmıyor | `MapFirstHome.module.css:31,35` |
| 5 | Tüm pin'ler aynı boy dolu daire (`radius: 10`); tekil ilan ile küme ayırt edilemiyor, fiyat ancak tıklayınca görünüyor | `LeafletListingMap.tsx:9` |
| 6 | `circleMarker`'a `'var(--lg-accent)'` string'i veriliyor; Leaflet bunu SVG attribute'una yazıyor, orada değişken çözülmesi garanti değil | `LeafletListingMap.tsx:9` |
| 7 | Sol blokta güven sinyali, hızlı filtre veya sayaç yok; `animate={false}`; sağdaki harita daha uzun olduğu için altta ölü boşluk kalıyor | `MapFirstHome.tsx:111` |

### Kütüphane baypası

`@repo/ui` (`src/index.ts`) ana sayfada yalnız kısmen kullanılıyor. Hazır yetenekler boşta duruyor:

| İhtiyaç | Kütüphanedeki karşılığı | Ana sayfada |
|---|---|---|
| AI arama + çıkarılan filtre chip'leri | `GlassAiSearchBar` — `parsedFilters`, `onRemoveFilter`, `confidence`, `onFeedback` | Yalnız `placeholder` + `suggestions` |
| Sekmeler | `GlassSegmentedControl` | Kullanılmıyor |
| Harita | `GlassMap` — `pins` (`price` → kapsül, `count` → cluster), `popupContent`, yol/uydu katmanı, klavye navigasyonu | Kullanılmıyor; yerel `LeafletListingMap` var |
| Hızlı filtreler | `GlassChip` | Kullanılmıyor |
| Kanıt listesi | `GlassAiEvidenceList` | Yalnız `TrustFirstHome`'da |

Ayrıca `apps/web` içinde **üç ayrı yerel Leaflet sarmalayıcısı** var, üçü de aynı kurulum kodunu
tekrarlıyor ve üçü de tek satıra sıkıştırılmış:

- `features/home-concepts/map-first/LeafletListingMap.tsx`
- `features/regions/LeafletRegionMap.tsx`
- `features/listing-create/LeafletPropertyPicker.tsx`

Bu spec yalnız birincisini kaldırır; diğer ikisi Bölüm 9'da sonraki dalgaya bırakılmıştır.

## 3. Kararlar

| Konu | Karar |
|---|---|
| Kapsam | **Arsa + konut.** Başlık kapsayıcı olacak, hero'da tür seçimi sekmeyle yapılacak |
| Yön | Dokuz varyant değerlendirildi; **G + F + A + C birleşimi** seçildi |
| Harita | `GlassMap`'e gerçek tile adaptörü eklenecek; `LeafletListingMap` silinecek |
| Başlık | `Önce haritada gör, sonra karar ver` (sekme değişince tür-özel başlığa geçer) |

Seçilen katmanlar:

- **G — sekme:** `Arsa / Konut / Proje`. Başlık kapsam sorunu burada çözülüyor.
- **F — ajan satırı:** aramanın yerine geçen niyet satırı; AI'ın anladığı düzenlenebilir chip'ler ve sonuç sayacı.
- **A — sessiz harita:** tasarım diline sokulmuş basemap, fiyat kapsülleri, cam zoom kontrolleri, tek atıf.
- **C — güven şeridi:** hero'nun altında ince bant; doğrulama sayacı.

Değerlendirilip **kapsam dışı** bırakılanlar: B (immersive sahne) ve H (sinematik uydu) aynı işi
yapıyor, ikisi de kampanya sayfası malzemesi; D (editoryal sessizlik) ve I (pazar nabzı) ayrı konsept
sayfası olarak `/konseptler/*` altında değerlendirilecek. Bu spec bunları uygulamıyor.

## 4. `GlassMap` v2 — tile adaptörü

`GlassMap` bugün seed'li deterministik SVG sokak dokusu üretiyor; kendi `rules.md`'sinde gerçek
adaptör "v2" olarak açık karar bırakılmış. Bu spec o kararı kapatıyor.

### Sözleşme eki

Mevcut API'nin tamamı korunur — `basemap` verilmediğinde davranış bugünküyle birebir aynıdır.

```ts
export interface GlassMapBasemap {
  /** Tile şablonu, ör. 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' */
  tileUrl: string
  /** Lisans gereği görünür kalması zorunlu atıf metni/düğümü */
  attribution: ReactNode
  /** Başlangıç merkezi [lat, lng] */
  center: [number, number]
  zoom: number
  minZoom?: number
  maxZoom?: number
  /** Zemin tonu — CSS filtresiyle uygulanır, tile sağlayıcısından bağımsız */
  tone?: 'quiet' | 'raw' | 'satellite'
}

export interface GlassMapPin {
  id: string
  /** basemap yokken kullanılan 0-1 normalize konum */
  x?: number
  y?: number
  /** basemap varken kullanılan coğrafi konum */
  lat?: number
  lng?: number
  price?: string
  count?: number
}
```

### Çalışma biçimi

- Leaflet **yalnız projeksiyon motoru** olarak kullanılır. Pin'ler Leaflet marker'ı değildir;
  `latLngToContainerPoint` ile piksel konumu hesaplanır ve mevcut `pinWrap` / `pinPrice` /
  `pinCluster` JSX'i hiç değişmeden kullanılır. Böylece bulgu 5 ve 6 birlikte kapanır: pin'ler
  tasarım dilinde kalır, renk CSS'ten gelir, `var()` hiç SVG attribute'una yazılmaz.
- Harita `move`/`zoom` olaylarında pin konumları yeniden hesaplanır; hesap `requestAnimationFrame`
  ile sınırlanır.
- `zoomControl: false` — zoom kontrolleri `GlassIconButton` ile component içinde render edilir.
- `attributionControl: false` — atıf `basemap.attribution` düğümünden, component'in kendi
  `.attribution` yüzeyinde, lisans gereği görünür ve linkli olarak render edilir. Çağıranın ayrıca
  atıf koymasına gerek kalmaz (bulgu 2).
- Zemin `.canvasClip` içinde kırpılır; kök `overflow: hidden` almaz, popup taşması korunur.
- `tone` CSS filtresiyle uygulanır: `quiet` → doygunluğu düşürüp sıcak tonlayan filtre, `raw` →
  filtresiz, `satellite` → koyu tema için hafif kontrast düzeltmesi. Koyu temada `quiet` ters
  çevirme değil, ayrı bir filtre değeri kullanır.
- Leaflet dinamik `import()` ile, yalnız `basemap` verildiğinde ve yalnız istemcide yüklenir. SSR'da
  (TanStack Start) zemin boş yüzey olarak render edilir, hidrasyondan sonra tile'lar gelir.
- Yükleme başarısız olursa mevcut seed'li SVG zemine düşer ve `role="status"` ile sessizce bildirilir
  — harita hiçbir zaman boş kutu olmaz.
- `prefers-reduced-motion` altında Leaflet'in zoom/pan animasyonları kapatılır.
- `basemap` verilip pin'de `lat`/`lng` yoksa (veya tersi) pin render edilmez; mevcut `clampUnit`
  güvenliğiyle aynı sessiz atlama davranışı.

### Tile sağlayıcısı

Sağlayıcı seçimi uygulamanın kararıdır, kütüphane yalnız tonu taşır. Ana sayfa için varsayılan:
mevcut OSM tile'ı + `tone="quiet"`. Böylece yeni bir servis bağımlılığı ve hesap gereksinimi
doğmadan bulgu 1 kapanır. Sessiz bir sağlayıcıya (CARTO Positron vb.) geçiş yalnız `tileUrl`
değişikliğidir.

## 5. Hero kompozisyonu

### `GlassHero` eki

İki geriye uyumlu ekleme gerekiyor:

- `eyebrow?: ReactNode` — başlığın üstünde render edilen slot. Sekme şeridi buraya girer.
- `search` slotu `variant="split"` için de render edilir (bugün yalnız `variant="search"`'te).
  Ajan satırı buraya girer, `actions` CTA'lara ayrılmış kalır.

Her ikisi de mevcut `blocks` dizisine eklenir; kademeli giriş sırası: eyebrow → başlık → alt başlık →
arama → aksiyonlar.

### Slot yerleşimi

| Slot | İçerik | Bileşen |
|---|---|---|
| `eyebrow` | Arsa / Konut / Proje | `GlassSegmentedControl` |
| `title` | Sekmeye göre değişen başlık | — |
| `subtitle` | Sekmeye göre değişen alt başlık | — |
| `search` | Niyet satırı + çıkarılan filtre chip'leri + sonuç sayacı | `GlassAiSearchBar` (`parsedFilters`, `confidence`, `onRemoveFilter`) |
| `actions` | Hızlı filtreler | `GlassChip` |
| `media` | Sessiz harita, fiyat kapsülleri, cluster rozetleri | `GlassMap` (`basemap`) |
| Hero altı | Doğrulama sayacı bandı | `GlassMetricStrip size="sm"` |

`animate` açılır — `GlassHero` zaten `prefers-reduced-motion`'da kendini kapatıyor.

### Sekme davranışı

Sekme değişince başlık, alt başlık, arama yer tutucusu, hızlı filtreler, harita pin kümesi ve
doğrulama sayacı birlikte değişir. Sekme durumu URL'e yazılır (`?tur=arsa|konut|proje`) — paylaşılan
bağlantı doğru sekmeyi açar. Varsayılan `arsa`.

### Ajan satırı

`GlassAiSearchBar` bugünkü sözleşmesiyle yeterli; yeni prop gerekmiyor. Ana sayfa demo verisinde
`parsedFilters` sabit fixture'dan gelir ve `onRemoveFilter` filtreyi listeden çıkarır. Gerçek varlık
çıkarımı bu spec'in kapsamı dışında — arayüz sözleşmesi hazır bırakılır.

Chip'ler yanlış çıkarım riski taşıdığı için `confidence` değeri her zaman gösterilir; kullanıcı her
chip'i tek dokunuşla kaldırabilir. "AI'ın çıktısı görsel olarak doğrulanabilir olmalı" ilkesi budur.

## 6. Dosya değişiklikleri

**Kütüphane (`src/`)**

- `components/GlassMap/GlassMap.tsx` — `basemap` prop'u, tile adaptörü, projeksiyon tabanlı pin konumlandırma, kendi zoom kontrolleri ve atıf yüzeyi
- `components/GlassMap/GlassMap.module.css` — tile katmanı, `tone` filtreleri, atıf ve zoom kontrol yüzeyleri
- `components/GlassMap/GlassMap.stories.tsx` — `basemap` story'leri (quiet / raw / satellite, yükleme hatası)
- `components/GlassMap/GlassMap.test.tsx` — adaptör testleri; Leaflet mock'lanır
- `components/GlassMap/rules.md` — §2 semantik sözleşme, §9 borç notu ve Açık Kararlar güncellenir (v2 kararı kapanır)
- `components/GlassHero/GlassHero.tsx` — `eyebrow` slotu, split'te `search` slotu
- `components/GlassHero/GlassHero.module.css` — eyebrow yerleşimi
- `components/GlassHero/GlassHero.stories.tsx` — eyebrow + split-search story'si
- `components/GlassHero/GlassHero.test.tsx` — yeni slotların render testi
- `components/GlassHero/rules.md` — slot tablosu güncellenir

**Uygulama (`apps/web/`)**

- `features/home-concepts/map-first/MapFirstHome.tsx` — yeni kompozisyon, sekme durumu, URL senkronu
- `features/home-concepts/map-first/MapFirstHome.module.css` — ölü kural temizliği (bulgu 4), harita paneli çerçevesi
- `features/home-concepts/map-first/LeafletListingMap.tsx` — **silinir**
- `features/home-concepts/map-first/LeafletListingMap.module.css` — **silinir**
- `features/home-concepts/fixtures.ts` — sekme başına pin/başlık/chip fixture'ları

## 7. Erişilebilirlik, motion, performans

- Sekme şeridi `GlassSegmentedControl`'ün mevcut roving-tabindex sözleşmesini kullanır; ek iş yok.
- Harita pin'leri bugünkü gibi `<button>`; ok tuşu navigasyonu ve `Escape` ile seçim temizleme korunur.
- Zoom kontrolleri ikon-tek buton olduğu için `label` zorunlu (tasarım sistemi kuralı).
- Focus halkası yalnız `:focus-visible`, `outline: 2px solid var(--lg-accent)`.
- Tile katmanı `prefers-reduced-transparency` altında filtresiz ve gölgesiz render edilir.
- Leaflet yalnız `basemap` verildiğinde dinamik import edilir; ana sayfa dışındaki `GlassMap`
  kullanımları (`EmlakSearchView`) bundle'a Leaflet çekmez.
- Harita paneli LCP adayı olduğu için tile isteği hero metninin render'ını bloklamaz; zemin önce
  yüzey rengiyle boyanır.

## 8. Test

- `GlassMap`: `basemap` yokken mevcut testlerin tamamı değişmeden geçer (geriye uyum kanıtı).
- `GlassMap`: `basemap` varken Leaflet mock'uyla — tile katmanı kurulur, pin'ler projeksiyon
  sonucuna göre konumlanır, yükleme hatasında SVG zemine düşülür, `lat`/`lng` eksik pin atlanır.
- `GlassHero`: `eyebrow` render edilir; `search` slotu hem `search` hem `split` variantında görünür.
- `MapFirstHome`: sekme değişimi başlığı, chip'leri ve pin kümesini değiştirir; URL parametresi
  okunur ve yazılır; filtre chip'i kaldırılınca listeden çıkar.
- `npm test`, `npx tsc -b`, `npm run lint` temiz geçmeli.

## 9. Kapsam dışı

- `LeafletRegionMap` ve `LeafletPropertyPicker`'ın `GlassMap`'e taşınması. Aynı adaptör ikisini de
  emebilir; ayrı bir dalga olarak ele alınacak.
- Gerçek varlık çıkarımı (niyet satırının arkasındaki NLP) — arayüz sözleşmesi hazır, servis yok.
- B, D, H, I varyantlarının konsept sayfası olarak uygulanması.
- Sessiz tile sağlayıcısına (CARTO/Stadia) geçiş ve buna bağlı hesap/lisans işleri.
