---
name: listing-detail
category: sayfa (feature)
status: hazır (Faz 0+1)
lastReviewed: 2026-07-27
---

# İlan Detayı Feature Kuralları

Bu dosya `apps/web/src/features/listing-detail/` altındaki bütün dosyaları
bağlar. Component sözleşmeleri (`src/components/*/rules.md`) geçerliliğini
korur; burada yazılanlar sayfa düzeyinde onların üzerine gelir.

## 1. Amaç ve yerleşim

İlan detayı bir vitrin değil, **karar dosyasıdır**: her değer kaynağıyla,
tarihiyle ve kapsamıyla birlikte durur; bilinmeyen bir alan boş bırakılmaz,
nedeni yazılır. Yerleşim "Yön A" şemasıdır — kategori yolu → başlık künyesi →
bölüm indeksi → tek ızgara: solda kanıt akışı (özet/medya → doğrulama vektörü
→ karar özeti → göstergeler → kanıt bölümleri → belgeler), sağda karar kolonu;
**satıcı bölümü ızgaranın ikinci satırındadır** — içerik kolonunun
genişliğinde, ama karar kolonunun hareket alanının dışında.

Karar kolonunun hareket alanı bu yüzden birinci satırdır: sticky eşlikçi kanıt
akışıyla birlikte iner, kanıt akışı biterken **serbest kalır** ve satıcı
bölümüyle hiçbir zaman yan yana durmaz. Kural tek cümleyle: *ray okuyucuya
kanıt bölümleri boyunca eşlik eder, satıcı bölümünden önce bırakır.*

## 1b. Yerleşim, ritim ve tipografi

Bunlar süsleme değil, okunabilirlik sözleşmesidir:

- **Bölümler kart değildir.** Kanıt bölümlerinin çerçevesi, zemini ve gölgesi
  yoktur; ayrımı hairline ve boşluk yapar (`--section-rhythm`, iki bölüm
  arasında paylaşılan ~56px; grup içi ritim `--lg-space-3/4`). Sayfanın zemini
  bölümleri taşır. **Kart içinde kart açılmaz.**
- **Ortak dikey eksen.** Kanıt satırı üç sütundur: etiket (`--evidence-label-col`,
  sabit) · değer (akışkan) · kaynak (`--evidence-source-col`, sabit, sağa
  hizalı). İki sabit sütun `.shell` üzerinde tanımlıdır; sayfanın ilk
  bölümünden sonuncusuna kadar aynıdır — hizanın kaynağı içerik uzunluğu değil
  sayfanın kendisidir. Belge satırları ve gösterge ızgarası aynı sol ekseni
  paylaşır.
- **Tip ölçeği sabit adımlardan gelir** (`--lg-text-*`): başlık `display`
  (28) → bölüm başlığı `title` (22) → blok başlığı `headline` (17) → değer
  `body` (15) → etiket/not `footnote`/`caption` (13/12). Etiketler değerlerden
  küçük ve ikincil tondadır. Sayısal her değer `tabular-nums` taşır; görsel
  harf aralığı hiçbir yerde -0.03em'den sıkı değildir.
- **Fiyat sayfada tek bir yerde büyür:** karar kolonunun giriş bloğunda,
  `display` ölçeğinde, tabular. Başlık künyesi fiyatı **taşımaz**
  (`GlassListingDetailHeader`'a `price` verilmez) — aynı sayı iki yüzeyde iki
  farklı vurguyla durmaz. Sticky eşlikçideki tek satırlık fiyat çapası bu
  kuralın istisnası değildir: `body` ölçeğinde, ikincil tonda ve **tek metin
  düğümü** olarak (`toplam · birim`) yazılır — kaydırılıp gitmiş bir değerin
  referansıdır, ikinci bir vurgu değil. Çapa ayrı bir öğeye bölünmez; bölünse
  aynı sayı sayfada iki kez "büyümüş" olurdu.
- **Karar kolonu iki parçadır.** Giriş bloğu (`railIntro`) bir kez okunur ve
  akıp gider: fiyat, birim fiyatın dayanağı, doğrulama özeti, görüşme öncesi
  çözülmesi gerekenler. Eşlikçi (`railSticky`) okuyucuyla kalır ve yalnız
  kanıt taranırken hâlâ gereken üç şeyi taşır: **fiyat çapası · birincil eylem
  · satıcı satırı.** Eşlikçi giriş bloğunun kopyası değildir — kritik konu
  listesi ve doğrulama özeti oraya taşınmaz; onlar okunacak metindir, yanında
  taşınacak araç değil. Eşlikçi sticky bölüm indeksinin altından başlar
  (`--rail-sticky-top`) ve tek kolonlu yerleşimde yapışmaz.
- **Yapay zekâ karar özeti de kutusuz akar.** Bölüm çerçeveli bir panel
  açmaz (`GlassAiSummaryCard` bu sayfada kullanılmaz — kutusuz bir bölümün
  içindeki çerçeveli kart, kart içinde kart olurdu). İddiaların dayanak
  bağlantısı **dolu buton değildir**: cümlenin sonunda duran, altçizgili,
  ikincil tonlu satır içi bir kaynak işaretidir ve gittiği bölümü adıyla söyler
  (`Dayanak: Parsel`). Etiket bölüm indeksiyle aynı kaynaktan gelir
  (`sectionLabel`), ikinci bir sözlük tutulmaz. Yapay zekâ atfı kaybolmaz:
  bölüm başlığı ve altındaki kaynak künyesi (asistan · model sürümü · kanıt
  kesiti) görünür kalır.
- **Yüzen alt dock için pay sayfa tarafından ayrılır.** Kabuğun dock'u
  viewport'un ortasına sabitlenmiştir ve sayfanın ızgarasını tanımaz; bu yüzden
  `.shell` üzerinde tek bir `--dock-clearance` yerel özelliği tanımlıdır
  (`--lg-shell-dock-offset` + `env(safe-area-inset-bottom)`). Hem gövdenin alt
  dolgusu (son etkileşimli öğe: satıcı bölümündeki numara kontrolü) hem karar
  rayının hareket alanı bunu okur. Sabit bir piksel değeri yazılmaz.
- **Doğrulama vektörü dar kolona sıkışmaz.** Vektörün tamamı Özet bölümünde,
  kendi iki kolonlu ızgarasındadır (`#dogrulama`); karar kolonunda yalnız
  özeti durur (kaç kontrol olumlu · olumsuz satırların başlıkları · eksik
  sayısı) ve özet vektöre bağlanır. Bilgi kaybolmaz, yer değiştirir.
- **Renkli kenar şeridi yoktur.** Durum (doğrulama satırı, belge durumu, künye)
  kelimeyle yazılır; renk yalnız küçük bir durum noktasıyla ikincil kanal
  olarak eklenir ve yalnız dikkat gerektiren durumlarda (olumsuz/eksik ·
  çelişki · bayatlık · cevapsızlık) doygunlaşır.
- **Kaynak künyesi damga değildir.** `GlassDataProvenance` rozeti normal
  yazımlı, çerçevesiz, ikincil tonlu bir işarettir; annote ettiği değerle
  yarışmaz. Çekmece davranışı değişmez — açıldığında satırın altına tam
  genişlikte iner (kök `display: contents`), değerin üstüne binmez.

## 1c. Medya

- Kayıtlarda **gerçek ilan fotoğrafı yoktur**. Gösterilen kareler kategoriyi
  temsil eden stok fotoğraflardır ve kaynak tek yerdedir:
  `features/listings/data/listing-photos.ts`. Arama, karşılaştırma ve ilan
  detayı aynı havuzdan okur.
- Temsili kullanım **gizlenmez**: medya sahnesinin altında tek kaynaklı cümle
  görünür durur — `REPRESENTATIVE_IMAGE_NOTE`
  (`Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.`).
  Karşılaştırma tezgâhı aynı sabiti kullanır; iki ayrı cümle iki ayrı iddia
  demek olurdu.
- **Fotoğraf olmayan kaleme temsili kare iliştirilmez.** Parsel görünümü ve
  plan notu (PDF) `representative` alanını hiç taşımaz; künyeleriyle (tür,
  çekim tarihi, yapay zekâ düzenleme etiketi) birlikte döküm satırı olarak
  görünür. Kayıtta hiç fotoğraf yoksa eski dürüst gerileme korunur — döküm
  metin olarak, **derli toplu** bir blokta durur; bir kolonu baştan aşağı
  işgal etmez.
- Yüklenemeyen kare sessizce kaybolmaz: `fallbackSrc` (kategori zeminli yer
  tutucu) devreye girer.

Bölüm sırası tek kaynaktan gelir: `components/listing-sections.ts`
(`LISTING_SECTIONS`). Bölüm indeksindeki etiket ile bölümün `<h2>` metni
birebir aynıdır ve her `href="#id"` hedefi DOM'da bulunur
(`ListingDetailAccessibility.test.tsx` bunu tarar).

## 1a. İki paket, tek birleşim

`ListingDetail` bir birleşimdir ve `kind` ile ayrışır:

- **`land`** (`LandListingDetail`) — elle yazılmış kanıt defteri. Bugün yalnız
  referans ilan `arsa-214-7` bu paketi taşır. Parsel, imar, altyapı, arazi ve
  piyasa bölümleri yalnız burada açılır.
- **`generic`** (`GenericListingDetail`) — arama kaydından **yansıtılmış**
  ilan (`data/listing-detail-projection.ts`). Arama özeti (`ListingSummary`)
  bir kanıt defteri değildir: tapu, imar, parsel, tehlike ve emsal bilgisi
  taşımaz. Yansıtma yalnız gerçekten var olanı taşır.

**Uydurma yasağı burada mutlak.** Referans defterin hiçbir değeri başka bir
ilana kopyalanmaz; olmayan kanıt "isteğe bağlı alan" olarak da taşınmaz —
`undefined` bir parsel ile sorgulanmamış bir parsel görünüm katmanında aynı
şeye benzerdi. Bu yüzden arsa paketleri `LandListingDetail`'e opsiyonel alan
olarak eklenmez; `kind` üzerinden daraltılır (`criticalIssues`,
`metricStripItems`, `sectionsFor`, workspace kompozisyonu).

Yansıtma eşlemesi (kaynak → alan):

| Özet alanı | Detayda | Köken |
|---|---|---|
| `price` · `area` | `price.amount` · `price.declaredArea` | ilan sahibi beyanı |
| türetim | `price.unitPrice` | ikisinden hesaplanır (ArsaPazar) |
| `attributes` · `highlights` | `declaredAttributes` · `highlights` | `advertiser_declared` |
| `verified` | **yalnız** EİDS satırı | olumlu/bilinmez |
| `owner` · `sellerName` | `seller` | yetki belgesi değeri **yoktur** |
| `publishedDays` + `now` | `publishedAt` | güncelleme kaydı yoktur |
| `image` · `imageCount` | `media` (tek kalem, sayı beyan olarak) | — |
| cevabı olmayanlar | `openQuestions` | `not_published` / `out_of_scope` |

Kurallar:

- **`verified` genişletilmez.** Bayrak yalnız EİDS satırına dönüşür. `true` →
  repo genelinde tek izinli olumlu cümle + `EIDS_SCOPE_NOTE`. `false` →
  `state: 'unknown'` ve görünür gerekçe: *sorgunun bulunmaması yetkinin
  olmadığı anlamına gelmez*. Bayraktan tapu, içerik veya fiyat iddiası
  türetilmez.
- **Yetki belgesi uydurulmaz.** `owner === 'agency'` ilanlarda TTBS numarası
  kayıtta yoktur; hem doğrulama satırı hem satıcı bölümü "kayıt bulunamadı"
  okur, `seller.licence` hiç doldurulmaz.
- **Değerleme çekinir.** Emsal kesiti ve gerçekleşmiş işlem verisi yoktur;
  `valuation` her zaman `{ kind: 'insufficient' }`.
- **Karar özeti üretilmez.** `aiBrief` gerekçesiyle `unavailable` döner.
  Gerekçe: yansıtılmış ilanda özetlenecek kanıt defteri yoktur; sayfadaki
  bütün içerik ilan sahibinin beyanıdır. Bu beyanları "ArsaPazar asistanı"
  imzasıyla özetlemek doğrulanmamış bilgiye platformun sesini ödünç vermek
  olurdu. `briefFor` bu ilanlarla **çağrılamaz**: parametre tipi
  `LandListingDetail`'dir, yani kural tip düzeyinde korunur.
- **Bölüm indeksi yalnız render edilen bölümleri bağlar** (`sectionsFor`).
  Yansıtılmış ilanda üç bölüm vardır: `ozet` · `beyan` · `belgeler`.
  Boş bir "Parsel" bölümü açıp içine gerekçe yazmak **yapılmaz**: sorulmamış
  bir sorunun cevapsız kaldığını iddia etmek olurdu. Sayfanın her ilan için
  gerçekten sorduğu alanlar (mahalle, tapu/takyidat, imar durumu, emsal
  kesiti) ise Beyan Edilen Özellikler bölümünde `openQuestions` olarak,
  nedeni ve kaynağıyla durur.
- **Bilinmeyen temel alanlar boş string ile taklit edilmez.** `neighbourhood`
  ve `updatedAt` artık `ListingDetailBase`'de isteğe bağlıdır: mahalle yoksa
  kategori yolu kısalır, güncelleme kaydı yoksa başlık künyesi "Bu kayıtta
  güncelleme tarihi yok" yazar — yayın tarihi "son güncelleme" diye tekrar
  edilmez.
- **`listingNumber`** yansıtılmış ilanda kaydın kendi anahtarıdır
  (`listing-3-1`); ayrı bir ilan numarası kayıtta yoktur, uydurulmaz.
- Türkçe etiket sözlüğü **veriyle aynı yerde** yaşar:
  `features/listings/data/listing-attributes.ts` (kategori, işlem türü,
  özellik anahtar/değer çiftleri, yer adı). Arama ve ilan detayı aynı
  sözlükten okur.
- Ne referans ilana ne de `LISTING_FIXTURES` kimliklerinden birine uyan kimlik
  **404 kalır** — `loadListingDetail` `null` döner.

## 2. Cam bütçesi

Sayfa başına **en fazla 6 cam yüzey**; test `ListingDetailWorkspace.test.tsx`
ve `ListingDetailAccessibility.test.tsx` içinde
`[data-material="glass"]` sayımıyla korunur.

| Cam yüzey | Nerede | Katman |
|---|---|---|
| `GlassBreadcrumb` | sayfa başı kategori yolu | navigasyon |
| `GlassSurface as="nav"` | sticky bölüm indeksi | navigasyon |
| `GlassSurface` "Görsel gezinmesi" | medya sahnesinde kare geçişi | kontrol |
| `GlassDetailActionBar` | karar kolonu | kontrol |
| `GlassButton` "Numarayı göster" | satıcı bölümü | kontrol |

Kalan **bir** yüzey rezervdir (Faz 2 sohbet dock'u / mobil alt çubuk). Medya
kontrol grubu yalnız birden çok kare varken render edilir — tek kareli
ilanlarda o yüzey de açılmaz. Kanıt bölümlerinin hepsi içerik katmanındadır:
kutusuz düz akış, cam açmazlar. Cam üstüne cam yoktur — karar kolonundaki
fiyat/özet/satıcı blokları ve `GlassDataProvenance` künyeleri düz yüzeydir;
medya kontrolü camdır ama fotoğrafın üstündedir, camın üstünde değil.

## 3. EİDS ve doğrulama dili

- EİDS metni ve kapsam notu **tek kaynaktan** gelir: `EIDS_SCOPE_NOTE`
  (`data/listing-detail-fixtures.ts`). Metin kopyalanmaz.
- "Doğrulandı" tek başına kullanılmaz; her doğrulama satırı neyi
  **kapsamadığını** da söyler (`VerificationRow.scopeNote`).
- **TTBS** işletmenin faaliyet yetkisidir; ilan içeriğini doğrulamaz. Satıcı
  bölümünde bu cümle görünür metindir:
  `TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.`
- **TTBS yalnız emlak ofislerine uygulanır.** `seller.type === 'individual'`
  satıcı için yetki belgesi bir **kontrol değildir**: ne "doğrulandı" ne
  "doğrulanamadı" yazılabilir — ikisi de yapılmamış bir kontrolün sonucunu
  bildirir. Bireysel satıcıda yalnız kapsam bildirilir:
  `Bireysel ilan sahipleri TTBS yetki belgesi kapsamında değildir.`
  `Yetki belgesi doğrulanamadı.` cümlesi **yalnız** yetki belgesi değeri
  bulunamayan emlak ofisi ilanında geçer.
- Satıcı hakkında sayfada iki yüzey konuşur (karar rayının özeti ve satıcı
  bölümü) ve **ikisi de aynı cümleyi** kullanır: metinler
  `components/seller-copy.ts` içinde tek kaynaktan gelir. İki ayrı ifade iki
  ayrı iddia demektir; aynı satıcı için çelişen iki metin bırakılmaz. Koruma:
  `ProjectedListingDetail.test.tsx` içindeki bireysel/ofis satıcı testleri ve
  `ListingDetailWorkspace.test.tsx` içindeki belge numarası testi.
- Bir kontrolün olumlu olması diğerlerini olumlu yapmaz; doğrulama bir vektördür,
  tek rozet değildir.

## 4. Kritik bilgi saklanmaz

Tapu türü/hisse, imar durumu, yasal yol erişimi, kaynaklar arası çelişki ve
kaynak bayatlığı **accordion arkasına saklanmaz**. Bunlar ilk görünümde
"Görüşmeden önce çözülmesi gerekenler" listesinde durur.

**Kritik konu eylemleri buton değildir.** `CriticalIssue.action`
(`Paydaş durumunu sor`, `Yol erişim belgesi iste`, `Aplikasyon krokisi iste`)
`Sonraki adım: …` metni olarak render edilir. Gerekçe: bu adımları platform
kullanıcı adına atmaz — mesaj taslağı üreten bir akış Faz 1'de yoktur ve
tıklandığında hiçbir şey yapmayan bir buton, yapılmış bir işlem izlenimi
verir. Bunun yerine aynı adımlar satıcı bölümünde
**"Görüşmede sorulacaklar"** listesi olarak, yani eylemin gerçekten
yapılabildiği yerde tekrar görünür. Faz 2'de mesaj bestecisi geldiğinde bu
liste tek tek "taslağa ekle" eylemlerine bağlanabilir; o zamana kadar metin
kalır.

**Bağlanmamış eylem etkin render edilmez — tek kural.** Sayfadaki her eylem
kontrolü (karar rayının birincil `Mesaj gönder` ve ikincil
`Satıcı bilgilerine git` eylemleri, karar özetindeki `Yanlış bilgi bildir`)
işleyicisini prop olarak alır. İşleyici verilmezse kontrol **`disabled`
render edilir ve gerekçesi aynı yüzeyde görünür metin olarak durur**
("… bu sürümde bağlı değil"). Etkin görünüp hiçbir şey yapmayan kontrol
bırakılmaz; yetenek sessizce yok da sayılmaz — kullanıcı yeteneğin var
olduğunu ama henüz bağlanmadığını okur. Kural
`ListingDetailWorkspace.test.tsx` içindeki
"bağlanmamış eylem etkin render edilmez" testiyle korunur: sayfa işleyicisiz
render edildiğinde üç kontrolün de `disabled` olduğu ve gerekçelerinin
göründüğü, işleyici verildiğinde etkinleştiği doğrulanır.

Tek istisna satıcı bölümündeki numara kontrolüdür (§7): orada kontrolün
yerini gerekçe metni alır, çünkü "Numarayı göster" yazan devre dışı bir buton
bağlı olmayan bir servis hakkında verilmiş bir söz olurdu. Gerekçe yine
görünürdür — kural aynı, taşıyıcı farklıdır.

## 5. Sayfa düzeyinde tab yok

Bölüm indeksi bir tab seti değil, **çapa gezinmesidir**: bütün bölümler DOM'da
kalır (yazdırma, Ctrl+F, ekran okuyucu ve derin bağlantı bozulmaz). `GlassTabs`
yalnız medya/harita görünüm değişiminde kullanılabilir.

## 6. Değerleme çekinmesi

`ValuationOutcome.kind === 'insufficient'` bir hata değil, **geçerli bir
sonuçtur**. Örneklem eşiğin altındaysa uydurma bir aralık gösterilmez;
"ArsaPazar fiyat tahmini üretilmedi" başlığı ve gerekçesi gösterilir.
Emsal satırları yalnız **ilan fiyatıdır**; gerçekleşmiş işlem veya ekspertiz
değildir ve bu görünür biçimde yazılır.

## 7. Telefon numarası

- `SellerSection`'ın **`phone` prop'u yoktur.** Numara ne normalize şemada
  (`ListingSeller`) ne fixture'da durur; dolayısıyla sunucudan gelen HTML'de,
  prerender çıktısında ve ilk DOM'da bulunmaz.
- Numara yalnız istek anında `onRevealPhone(): Promise<string>` ile getirilir.
  Uç nokta sözleşmesi `data/listing-phone.ts` içindedir
  (`GET /api/ilan/:listingId/telefon` → `{ phone: string }`).
- Kontrollü desen: `revealed` + `defaultRevealed` + `onRevealedChange`.
  `defaultRevealed` ile açık başlayan görünüm numarayı yine istek anında alır
  ama **odağı çalmaz**; odak yalnız kullanıcının kendi bastığı açılıştan sonra
  numaraya taşınır.
- Yükleme sırasında kontrol `aria-busy` taşır. Hata durumunda
  `GlassAlert severity="warning"` gerekçeyi yazar
  (`Numara şu anda gösterilemiyor. Birkaç dakika sonra tekrar deneyin.`) ve
  kontrol **tekrar denenebilir** kalır — çıkmaz sokak yoktur.
- İletişim kapalıyken (`contactClosedReason`) numara açma kontrolü hiç
  render edilmez; yerine gerekçe metni durur.
- `onRevealPhone` verilmezse **buton hiç render edilmez.** Çalışmayan buton
  gösterilmez.
- **Numara sayfada tam olarak tek yerde açılır: satıcı bölümü.** Başka hiçbir
  eylem açılış mantığını kopyalamaz. Karar rayının ikincil eylemi
  (`Satıcı bilgilerine git`) yalnız **gezinir**: `SELLER_REVEAL_CONTROL_ID`
  kimlikli kontrolü görünür alana getirir ve odağı ona taşır. Kimlik her zaman
  o an canlı olan öğededir — açılıştan önce butonda, sonra `tel:` bağlantısında.
  Kaydırma `prefers-reduced-motion` altında anidir (`behavior: 'auto'`).
- Satıcı bölümünde kontrol yoksa (`hasSellerRevealControl` false: sağlayıcı
  bağlı değil veya iletişim kapalı) **rayın ikincil eylemi `disabled` render
  edilir** ve gerekçesi rayın notunda yazılıdır (§4). Ray asla etkin ama
  işlevsiz bir buton göstermez.
- **Analitiğe numara gönderilmez.** `onAnalyticsEvent` yalnız olay adı alır
  (`seller_phone_reveal_requested` · `_succeeded` · `_failed`); tip bir string
  union'dır, numara taşıyan bir yük geçemez. **Not:** bu sözleşme tanımlıdır
  ama route henüz bir telemetri hedefi bağlamaz — `onAnalyticsEvent`
  çağrılmadan durur; çalışan bir altyapı sanılmamalıdır.
- `GlassSellerCard` numarayı `phone` prop'uyla alıp görsel olarak maskeler; bu
  sözleşmeyi ihlal ettiği için bu sayfada **kullanılmaz**. Satıcı kimliği
  `GlassAgencyCard` ile (numara prop'u verilmeden), açılan numara ise düz
  `<a href="tel:…">` ile render edilir.

## 8. Erişilebilirlik

- Sayfada **tek görünür `h1`** (`GlassListingDetailHeader`); bölümler `<h2>`,
  bölüm içi bloklar `<h3>`.
- Etiket/değer çiftleri `<dl>` (`EvidenceList`/`EvidenceRow`); gerçek kıyaslar
  `<table>` (`GlassTable`, emsal karşılaştırması).
- Durum **yalnız renkle taşınmaz**: doğrulama satırları (`Olumlu` ·
  `Olumsuz` · `Eksik`), belge durumları (`Sunuldu` · `Kritik eksik` ·
  `Eksik`) ve künye rozetleri kelimeyle de yazılır. Bu kelimeler sayfada
  birden çok kez geçer — testler `getAllByText` kullanır.
- Doğrulama vektörünün durum kelimeleri **nötr sonuç** bildirir, doğrulama
  iddiası değil: olumlu her satır bir doğrulama değildir (ör.
  `platform_moderation` yalnız yasak içerik/yinelenen ilan kontrolüdür).
  Bu yüzden `Doğrulandı` damgası satır etiketi olarak kullanılmaz; neyin
  kontrol edildiği satırın `title`/`scopeNote` metnindedir. `Çelişkili`
  yalnız çelişkinin gerçekten bildirildiği yerde geçer (kanıt künyesindeki
  `Kaynaklar çelişiyor` rozeti).
- Focus halkası yalnız `:focus-visible`
  (`outline: var(--lg-focus-ring-width) solid var(--lg-accent)`).
- Dokunmatik hedefler ≥44px: kontrol yükseklikleri `--lg-control-*`
  token'larından gelir, `pointer: coarse` altında token'lar zaten büyür.
  Tek istisna **cümlenin içinde duran** bağlantılardır (karar özetindeki
  `Dayanak: …` işaretleri): boyutları çevreleyen metnin satır yüksekliğine
  bağlıdır ve bir kontrol yüksekliğine zorlanamazlar. Orada `pointer: coarse`
  altında dolgu ile isabet alanı büyütülür — dolgu satır kutusunu değiştirmez.
- Animasyon yalnız transform/opacity/filter; `prefers-reduced-motion` altında
  kapalı (component'lerin kendi sözleşmesi).

## 9. Responsive

Viewport breakpoint'i yoktur. Sorgu kabı `.shell`'i saran `.page`'tir —
`.shell` kendi kabı olsaydı `@container` içindeki `.shell` kuralları (dar
genişlikte iç boşluk azaltması) hiçbir zaman eşleşmezdi. İki kolonlu
yerleşimler `@container` sorgularıyla tek kolona iner (64rem gövde, 52rem ilk
görünüm, 40rem iç boşluk). Yetenek sorguları `hover: hover` /
`pointer: coarse` ile yapılır.

## 10. Token disiplini

Feature CSS'i yalnız `--lg-*` token'ları tüketir: raw hex/rgba/px/gölge veya
keyfî radius yoktur. Radius yalnız chip/media/card/capsule ölçeğinden gelir.

## 11. Determinizm ve hata izolasyonu

- `loadListingDetail` **zamanı kendisi okumaz**: `now` çağıran tarafından
  verilir. Fixture ve adapter içinde `Math.random()` ve argümansız `new Date()`
  yasaktır; testler ve story'ler sabit `NOW` kullanır.
- `now` **okunur**: adapter defterdeki her `EvidenceValue`'nun `freshness`
  alanını `freshnessFrom(retrievedAt, now, effectiveAt)` ile yeniden hesaplar.
  Fixture'daki güncellik bayrakları yalnız varsayılandır; elle yazılan bir
  bayrak sayfa bir yıl sonra açıldığında da eski sorguya "güncel" derdi.
  Cevapsız değerde (`isAnswered` false) güncellik `unknown` kalır — sorgunun
  dün yapılmış olması olmayan veriyi güncel yapmaz.
- **Her kanıt takvimle bayatlamaz.** `EvidenceValue.freshnessPolicy`
  (`domain/evidence.ts`) iki sınıfı ayırır:
  - `time_sensitive` (**varsayılan**) — doğruluğu iki sorgu arasında
    değişebilen değer: ilan sahibi beyanları, plan durumu ve plan notu, emsal
    kesiti, uydu görüntüsünden türetilmiş erişim/eğim bilgisi, orman yangını
    duyarlılık sınıfı. Bunlarda geçen zaman gerçek bir belirsizliktir;
    güncellik 90/180 günlük eşikten hesaplanır.
  - `durable` — takvimle değil **olayla** değişen değer. Bugün yalnız iki
    tanesi işaretlidir: kadastral kimlik (`parcel.blockParcel` — ada/parsel
    numarası ancak yeniden ölçüm, ifraz veya tevhitle değişir) ve yürürlükteki
    ulusal deprem tehlike haritası sürümü (`terrain.hazards[earthquake]` —
    yeni sürüm yayımlanana kadar resmî standart olarak geçerlidir). Adapter
    bunların güncelliğine dokunmaz.
- Varsayılanın `time_sensitive` olması bilinçlidir: **dayanıklılık iddia
  edilmelidir, varsayılamaz.** İşaret ancak "bu değer neden takvimle
  bayatlamaz" sorusunun yazılı bir cevabıyla birlikte konur. Gerekçe fixture'da
  işaretin yanında durur.
- Gerekçe: sağlam resmî veriye "Güncel değil" demek, aşırı iddianın ters
  yönüdür — kaynağın güvenilirliği hakkında dayanağı olmayan bir şüphe üretir.
  Bu sayfa hangi yönde olursa olsun dayanaksız iddia üretmez.
- Koruma: `listing-detail-adapter.test.ts` içinde (a) dayanıklı değerlerin
  `now` yıllarca ilerlediğinde değişmediği, (b) zamana duyarlı değerlerin
  değiştiği, (c) `durable` işaretinin defterde **yalnız o iki değerde**
  bulunduğu taranır; `EvidenceSections.test.tsx` künye rozetlerini render
  düzeyinde doğrular.
- Tarih biçimlendirme `format.ts`'te `Europe/Istanbul`'a sabitlenmiştir —
  sunucu ve tarayıcı aynı tarihi yazar.
- `withScenario` derin kopya döner: bir tüketicinin mutasyonu modül düzeyindeki
  fixture'ı bozamaz.
- Bölüm bazlı gerileme: tek sağlayıcı hatası tüm ilanı kapatmaz
  (`sections.map`, `aiBrief`). Harita düşerse konum metin/tablo olarak kalır;
  asistan düşerse yapılandırılmış kanıt bölümleri eksiksiz durur.

## 12. Story matrisi

`ListingDetailWorkspace.stories.tsx` — `Sayfalar/Public/İlan Detayı`:
`Default` · `Bayat plan kaynağı` · `AI kullanılamıyor` ·
`Harita kullanılamıyor` · `Süresi dolmuş` · `Yükleniyor` · `Uzun içerik` ·
`Responsive` · `Temalar` · `Yansıtılmış ilan (arama sonucu)` ·
`Numara alınamadı`. Her story sabit `now` ile yükler.

## 13. Bilinen kabuller

- `GlassMap` Faz 1'de gerçek tile servisi kullanmaz (seed'li şematik zemin);
  parsel sınırı kadastral doğrulukta çizilmez.
- `/api/ilan/:id/telefon` uç noktası **Faz 1'de mevcut değildir**; çağrı görünür
  bir gerekçeyle başarısız olur ve kontrol tekrar denenebilir kalır. Numaranın
  istemci paketine gömülmesi bilinçli olarak yapılmamıştır. Aynı biçimde
  `onAnalyticsEvent` bir sözleşmedir, bağlı bir telemetri hedefi yoktur —
  ikisi de çalışan altyapı değil, tanımlanmış arayüzdür.
- Faz 2+'ye bırakılanlar: sohbet ve ajan basamakları, JSON-LD, analytics olay
  sözlüğü, SLO ölçümü.

## Changelog

- 2026-07-29 — Görsel ikinci geçiş (§1, §1b, §8): yapay zekâ karar özeti
  kutusundan çıktı ve dayanak butonları sessiz satır içi kaynak işaretlerine
  indi; karar kolonu giriş bloğu + sticky eşlikçi olarak ikiye ayrıldı, satıcı
  bölümü ızgaranın ikinci satırına alınarak rayın hareket alanı kanıt akışıyla
  sınırlandı; yüzen alt dock payı tek bir `--dock-clearance` yerel
  özelliğinden okunuyor. Bilgi mimarisi, metinler ve dürüstlük kuralları
  değişmedi; 133 feature testinin hiçbiri değiştirilmedi.
- 2026-07-28 — Görsel yapı yeniden kuruldu (§1b, §1c): bölümler kart olmaktan
  çıktı, kanıt satırları sayfa genelinde ortak dikey eksene oturdu, doğrulama
  vektörü kendi iki kolonlu ızgarasına taşındı, fiyat karar kolonuna alındı,
  kaynak künyeleri damgadan sessiz işarete döndü ve medya sahnesi tek kaynaklı
  temsili fotoğraflarla açıldı. Bilgi mimarisi ve dürüstlük kuralları
  değişmedi.
- 2026-07-28 — Arama sonuçlarından yansıtılan ilan paketi (`generic`) eklendi
  (§1a): 72 arama kaydı artık dürüst bir detay sayfasına çözülüyor, arsa
  kanıt paketi yalnız `kind === 'land'` ilanında açılıyor.
- 2026-07-27 — Faz 0+1, Yön A (Karar Dosyası) yerleşimiyle ilk sürüm.
