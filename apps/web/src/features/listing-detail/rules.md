---
name: listing-detail
category: sayfa (feature)
status: hazır (Faz 0+1)
lastReviewed: 2026-08-03
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

Karar kolonunun hareket alanı bu yüzden birinci satırdır: yapışkan karar kartı
kanıt akışıyla birlikte iner, kanıt akışı biterken **serbest kalır** ve satıcı
bölümüyle hiçbir zaman yan yana durmaz. Kural tek cümleyle: *kart okuyucuya
kanıt bölümleri boyunca eşlik eder, satıcı bölümünden önce bırakır.*

## 1b. Yerleşim, ritim ve tipografi

Bunlar süsleme değil, okunabilirlik sözleşmesidir:

- **Bölümler yapraktır.** *(2026-08-04'te değişti — önceki kural: "bölümler
  kart değildir, çerçevesi/zemini/gölgesi yoktur".)* Her kanıt bölümü kendi
  yüzeyini taşır: `--lg-surface` zemin, hairline çerçeve, `--lg-radius-card`
  yarıçap ve **yalnız** `--lg-shadow-xs` — gölge ölçeğinin en hafif kademesi.
  Ayrımı yaprağın kenarı ve komşusuyla arasındaki pay yapar; ritim artık
  bölümün İÇİNDE değil, **ARASINDA**dır (`.flow` ızgarasının `--lg-space-4`
  boşluğu). İç dolgu tek kaynaktan gelir: `--sheet-pad` (= `--lg-space-5`,
  `GlassAgencyCard` ile aynı kademe).

  Kuralın **değişmeyen** yarısı: **kart içinde kart açılmaz.** Yaprak
  geldiğinde bunun tek ihlali satıcı künyesiydi (`GlassAgencyCard` kendi
  yüzeyini taşıyordu) ve düzleştirildi. Bir yaprağın içinde ikinci bir yüzey
  açan her yeni bileşen bu kuralı çiğner — tonlu zemin ve ayraç serbest,
  çerçeve + yarıçap + gölge üçlüsü değil.

  Satıcı bölümünün **künye bandı** (`.callBand`) bu iznin sınırındadır ve
  bilerek izin tarafında durur: tonlu zemini ve alt hairline'ı vardır, kendi
  yarıçapı/gölgesi/çerçevesi **yoktur**. Yaprağın iç dolgusunu negatif payla
  iptal edip kenardan kenara uzanır — ayrı bir nesne değil, yaprağın
  tonlanmış bir bölgesidir. Bandın bölümün ortasında (başlığın altında)
  durması bunun için gerekir: yaprağın yalnız düz dikey kenarlarına değer,
  yuvarlatılmış köşelerine değmez.

  Yaprak **cam değildir**: içerik katmanındadır, `backdrop-filter` almaz ve
  §2'nin cam bütçesine girmez.

  Gerekçe: sekiz bölüm aynı fildişi zeminde aynı ağırlıkta akarken kaydırma
  hızında nesne olarak kaydedilmiyordu ve tek yüzeyi olan karar kartı kıyası
  eziyordu — "kart bitmiş, sayfa taslak" okuması. Bedeli bilinerek kabul
  edildi: sayfa artık bir yaprak destesidir ve kenar sayısı arttı.
- **Ortak dikey eksen.** Kanıt satırı üç sütundur: etiket (`--evidence-label-col`,
  sabit) · değer (akışkan) · kaynak (`--evidence-source-col`, sabit, sağa
  hizalı). İki sabit sütun `.shell` üzerinde tanımlıdır; sayfanın ilk
  bölümünden sonuncusuna kadar aynıdır — hizanın kaynağı içerik uzunluğu değil
  sayfanın kendisidir. Belge satırları ve gösterge ızgarası aynı sol ekseni
  paylaşır. Şemanın iki uygulaması vardır ve **ikisi de aynı sütunlara oturur**:
  alan adı taşıyan satırlar `EvidenceRow`, satır kimliği taşıyan satırlar
  (Belgeler, doğrulama defteri) `.evidenceRow`. Kendi ızgarasını elle yazan bir
  bölüm bandın hizasını kırar.
- **Gruplama kolon açmaz.** Satırlar gruplanacaksa grup bir `h3` başlıkla
  ayrılır, ikinci bir kolona bölünmez: eşit olmayan dağılımda (2'ye 3) bir kolon
  erken biter, altında ölü alan bırakır ve ortak ekseni kırar. Başlık
  `aria-hidden` olmaz — severity'yi ("kritik") taşıyan tek yer orasıdır.
- **Durum işareti tektir.** Olumlu/Olumsuz/Eksik her yerde `EvidenceState`
  ile çizilir (nokta + kelime); değişen yalnız `variant`tır (`inline` bantta,
  `chip` dar kartta). Aynı üç durumu üç ayrı geometriyle çizmek, gözü her
  bölümde işareti yeniden aramaya zorlar.
- **Tip ölçeği sabit adımlardan gelir** (`--lg-text-*`): başlık `display`
  (28) → bölüm başlığı `title` (22) → blok başlığı `headline` (17) → değer
  `body` (15) → etiket/not `footnote`/`caption` (13/12). Etiketler değerlerden
  küçük ve ikincil tondadır. Sayısal her değer `tabular-nums` taşır; görsel
  harf aralığı hiçbir yerde -0.03em'den sıkı değildir.
  **Satır kimliği istisnası:** ilk sütun bir alan adı değil de satırın kimliği
  ise ("İmar durum belgesi", "Platform moderasyonu"), vurgu tersine döner —
  kimlik `body`/600/birincil, durum kelimesi `footnote`/600 olur. Gerekçe:
  vurgu satırlar arasında **değişene** gider. Aksi hâlde bir grupta üst üste
  duran satırlar aynı durum kelimesini en kalın yazıyla tekrarlar ve ayırt
  edici bilgi en silik yerde kalır.
- **Fiyat sayfada tek bir yerde büyür:** karar kartının fiyat bloğunda,
  `display` ölçeğinde, tabular. Başlık künyesi fiyatı **taşımaz**
  (`GlassListingDetailHeader`'a `price` verilmez) — aynı sayı iki yüzeyde iki
  farklı vurguyla durmaz. Kart içinde de fiyat **ikinci kez geçmez**: eski
  sticky "fiyat çapası" kaldırılmıştır. Birim fiyat kartta bir kez, fiyatın
  hemen altında durur; hangi alana dayandığı (ve kayıtla çelişiyorsa çelişki)
  Özet panelinde tek cümleyle yazılır. Dar yerleşimde dock'un tek satırlık
  çapası bu kuralın istisnası değildir: orada kart hiç çizilmez, çapa akıştaki
  fiyat bloğunun kaydırılıp gitmiş hâlinin referansıdır.
- **Karar kolonu tek bir üründür: sekmeli karar kartı.** Kart tek yüzeydir
  (hairline çerçeve, kart yarıçapı, kağıt zemin — hesap bölümleriyle aynı kart
  dili) ve **iskeleti sabittir**; yalnız ortadaki panel değişir:

  1. **Fiyat bloğu (sabit)** — fiyat + birim fiyat.
  2. **Sekme şeridi (sabit)** — `Özet · Doğrulama · Satıcı`.
  3. **Panel** — `Özet`: olgu ızgarası (beyan edilen alan · doğrulama sayacı ·
     yayın tarihi · ilan no), birim fiyatın dayanağı ve **görüşmeden önce
     çözülmesi gerekenler** listesi. `Doğrulama`: kontrol listesi (satır adı +
     durum çipi) ve vektörün tamamına giden ölçülü bağlantı. `Satıcı`: aktif
     ilan/yanıt/üyelik olguları, TTBS kapsam cümlesi ve satıcı bölümüne giden
     bağlantı — **numara burada açılmaz** (§7).
  4. **Eylem bölgesi (sabit)** — satıcı künyesi (ad · tür · yetki belgesi),
     tek birincil eylem, `Kaydet` ve bağlanmamış yeteneğin tek satırlık notu.
     Ayrı bir iç kutu değildir; kartın alt bölgesidir. **Kart içinde kart
     açılmaz.**

  Panelin yüksekliği **sabittir** (`.tabPanel` `block-size`): sekme değişince
  kart zıplamaz ve kartın tamamı yapışkan kalabilir. Üst sınır ekran
  yüksekliğiyle küçülür (`clamp(… 100dvh − --rail-panel-chrome …)`), böylece
  kart hiçbir ekranda taşmaz; içerik sığmazsa panel kendi içinde kayar ve
  kayarlığı gölgeyle görünür olur. Bu bir accordion değildir (§4): hiçbir şey
  tıklamayla açılmaz, metin baştan yerindedir.

  Kart yapışkandır ve durağı kabuğun yüzen başlığının altındadır
  (`--rail-sticky-top`, `--lg-shell-header-offset`'ten okunur). Yalnız aktif
  panel DOM'dadır: kapalı panel sayfanın kanıt bölümlerindeki metinleri ikinci
  kez üretmez.

  **Sekme sözleşmesi yerel yazılmıştır.** `GlassTabs` WAI-ARIA sözleşmesini
  karşılar ama her zaman **cam bir sekme çubuğu + ikinci bir `GlassSurface`
  panel** açar — bu kartın içinde o, kart içinde kart olurdu ve cam sayısını
  artırırdı; ayrıca panelin sabit yüksekliği dışarıdan verilemezdi.
  `GlassSegmentedControl`'ün `bar` varyantı doğru görsel dildir ama
  `radiogroup`'tur, sekme değildir. Bu yüzden şerit kütüphaneye yeni bileşen
  eklemeden feature içinde yazılmıştır ve tam deseni uygular:
  `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`,
  `aria-labelledby`, roving tabindex, ←/→/↑/↓ ve Home/End.
- **Dar yerleşimde kart yoktur, dock vardır — ve ikisi aynı kontrolü iki kez
  çizmez.** Kap 1100px'in altındayken kartın tamamı (fiyat bloğu, sekmeler,
  eylem bölgesi) yerleşimden düşer; `ListingDock` iki şey taşır: **fiyat
  çapası** ve **satıcı bölümüne götüren tek bağlantı** (`Satıcıya git`).
  Dock'ta buton yoktur: kararın kanıtı akıştaki bölümlerde, iletişim satıcı
  bölümündedir; dock oraya götürür. Bağlantı olduğu için kartın butonlarıyla
  aynı erişilebilir adı da taşımaz — sayfada tek bir eylemin iki kez çizilmiş
  hâli gibi okunmaz. Dock'un alt dolgusu kabuğun yüzen dock'unun payını
  (`--dock-clearance`) okur: çubuk ekranın alt kenarına dayanır ama içeriği
  yüzen kapsülün üstünde durur.
- **Yapay zekâ karar özeti kendi yaprağında akar.** Bölüm, yaprağının İÇİNDE
  ikinci bir çerçeveli panel açmaz (`GlassAiSummaryCard` bu sayfada
  kullanılmaz — yaprağın içindeki çerçeveli kart, kart içinde kart olurdu;
  bkz. §1b'nin değişmeyen yarısı). İddiaların dayanak
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
  dolgusu (son etkileşimli öğe: satıcı bölümündeki numara kontrolü), karar
  kartının hareket alanı ve dar yerleşimdeki dock'un alt dolgusu bunu okur.
  Sabit bir piksel değeri yazılmaz.
- **Doğrulama vektörü dar kolona sıkışmaz.** Vektörün tamamı kanıt akışındaki
  doğrulama defterindedir (`#dogrulama`, `ListingLedger`) — her satır kaynağı
  ve tarihiyle orada durur. Karar kartında yalnız **özeti** vardır: `Özet`
  panelinde sayaç (`4/7 olumlu`), `Doğrulama` panelinde satır adı + durum
  çipi, altında deftere giden bağlantı. Bilgi kaybolmaz, yer değiştirir.
- **Renkli kenar şeridi yoktur.** Durum (doğrulama satırı, belge durumu, künye)
  kelimeyle yazılır; renk yalnız küçük bir durum noktasıyla ikincil kanal
  olarak eklenir ve yalnız dikkat gerektiren durumlarda (olumsuz/eksik ·
  çelişki · bayatlık · cevapsızlık) doygunlaşır.
- **Kaynak künyesi damga değildir.** `GlassDataProvenance` rozeti normal
  yazımlı, çerçevesiz, ikincil tonlu bir işarettir; annote ettiği değerle
  yarışmaz. Çekmece davranışı değişmez — açıldığında satırın altına tam
  genişlikte iner (kök `display: contents`), değerin üstüne binmez.

## 1c. Medya ve hero galerisi

Sayfayı açan sahne iki parçadır (`components/ListingStage.tsx`): önce
**bento galerisi** (`components/ListingGallery.tsx`), altında **künye**
(tek `h1` + konum satırı). Künye cam değildir — cam yalnız navigasyon/kontrol
katmanının malzemesidir ve bir başlık kontrol değildir; başlığı kapak
karesinin üstüne örtmek hem okunurluğu hem fotoğrafı bozardı. **Fiyat sahnede
hiç geçmez** (§1b): sayfanın en büyük sayısı karar kolonundadır.

Galerinin yerleşimi tek markup'tan doğar ve eşik viewport değil **kap**
genişliğidir (`@container page`, kap `PageContainer`):

- **Dar kap** — yatay kaydırmalı tek şerit (`scroll-snap`, son kare kenardan
  görünür) ve sağ altta sayaç. Sayaç dekoratiftir (`aria-hidden`): aynı bilgi
  kare butonlarının erişilebilir adında zaten vardır.
- **Geniş kap (≥52rem)** — bento ızgarası: solda büyük kapak, sağda iki küçük
  kare ve altlarında geniş bir kare (`data-tiles` sayısına göre kalanlar
  yayılır, ızgarada delik kalmaz). Son karenin üstünde `Tümünü gör (N)`
  örtüsü durur; örtü dekoratif bir `span`'dır, iç içe buton açılmaz — aynı
  bilgi o karenin butonunun adındadır (`Tüm görselleri gör: N görsel`).
- Kapak karesinin üstünde **ilan no rozeti** ve tek kapsülde **favori/paylaş**
  ikonları bulunur. İkisi de ikon-tektir ve `aria-label` taşır; favori
  `aria-pressed` ile durumunu bildirir, paylaş `navigator.share` yoksa
  bağlantıyı panoya kopyalar ve sonucu `role="status"` satırında yazar —
  hiçbiri tıklandığında sessiz kalmaz.
- **Tam ekran görünüm kütüphaneden gelir**: `GlassLightbox` (portal, focus trap,
  scroll kilidi, kapanışta tetikleyiciye focus dönüşü, ok/thumbnail/klavye
  gezinmesi). Bu sayfa kendi overlay'ini yazmaz. Bir kareye tıklamak **tek
  adımda** tam ekranı açar — arada panel yoktur; tıklanan karenin indeksi
  görüntüleyiciye controlled (`index` + `onIndexChange`) verilir, kareler
  arasında geçiş alttaki thumbnail şeridinden, oklardan veya ok tuşlarından
  yapılır. Katman karartmadır, üstüne cam panel açılmaz — yalnız kontroller
  camdır.
- Kayıtlarda **gerçek ilan fotoğrafı yoktur**. Gösterilen kareler kategoriyi
  temsil eden stok fotoğraflardır ve kaynak tek yerdedir:
  `features/listings/data/listing-photos.ts`. Arama, karşılaştırma ve ilan
  detayı aynı havuzdan okur.
- Temsili kullanım **gizlenmez**: tam ekran görünümde (`GlassLightbox`'ın
  `note` satırı) tek kaynaklı cümle görünür durur — `REPRESENTATIVE_IMAGE_NOTE`
  (`Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.`).
  Sayfa içinde ızgara altına ayrıca yazılmaz (ürün kararı, 2026-08-07).
  Karşılaştırma tezgâhı aynı sabiti kullanır; iki ayrı cümle iki ayrı iddia
  demek olurdu.
- **Hero her ilanda foto bento'dur; temsili kareler çoğaltılır ama kare başına
  künye uydurulmaz.** Yansıtılmış kayıtta ilanın kendi fotoğrafı yoktur;
  ızgarayı kurmak için kareler kategori havuzundan çoğaltılır
  (`mediaFor` → `getCategoryStockPhoto`, ilk kare arama kartıyla aynı).
  Sınır tek cümleyle: **çoğaltılan şey karedir, künye değildir.** Bütün
  kareler aynı nötr etiketi taşır (`Temsili görsel`), `capturedAt` verilmez,
  hiçbirine içerik açıklaması ("salon", "deniz cephesi") yazılmaz — bir
  fotoğrafın neyi gösterdiğini bilmediğimiz halde söylemek iddia üretmek
  olurdu. Kare sayısı **havuzdaki farklı kare sayısıyla** sınırlıdır
  (`stockPhotoCount`) ve en çok 4'tür: aynı fotoğrafı ızgarada iki kez
  göstermek "iki ayrı görsel var" izlenimi verirdi. Erişilebilir adlar
  ızgaradaki konumla ayrışır (`… · 2/4`) — bu kayıttan gelen bir iddia değil,
  hücrenin yeridir.
- **İlanda bildirilen görsel sayısı kare olarak çizilmez.**
  `declaredMediaCount` ekrana yazılmaz (künye satırı 2026-08-07'de üründen
  kaldırıldı) ama sınır ilkesi durur: bildirilen sayı kadar kare çizmek,
  gösterilmeyen dosyaları gösteriliyormuş gibi yapardı.
- **Fotoğraf olmayan kaleme temsili kare iliştirilmez.** Parsel görünümü ve
  plan notu (PDF) `representative` alanını hiç taşımaz; künyeleriyle (tür,
  çekim tarihi, yapay zekâ düzenleme etiketi) birlikte döküm satırı olarak
  görünür. Yalnız `representative` taşıyan kalem kare olarak çizilir — bu bir
  kanıt kuralıdır, bento'nun boş kalan hücresi onu bozmaz. Kayıtta hiç
  fotoğraf yoksa eski dürüst gerileme korunur — döküm metin olarak, **derli
  toplu** bir blokta durur; bir kolonu baştan aşağı işgal etmez ve künyeyi ilk
  görünümün dışına itmez (satır olarak akar).
- Yüklenemeyen kare sessizce kaybolmaz: `fallbackSrc` (kategori zeminli yer
  tutucu) devreye girer.

## 1d. Konum çizimi: coğrafi ve şematik iki varyant

`ListingApproximateGeo` **ayrık bir birleşimdir** ve iki varyantı hiçbir yerde
aynı cümleyi paylaşmaz:

- **`geographic`** (`lat` · `lng` · `radiusMeters` · `sourceLabel`) — gerçek
  yaklaşık koordinat. Mahremiyet dairesi burada anlamlıdır: nokta parselin tam
  merkezi değildir, `radiusMeters` yarıçaplı alanın merkezidir ve bu görünür
  metindir. Başlık `Yaklaşık konum`, haritanın adı `Yaklaşık konum haritası`.
- **`schematic`** (`x` · `y` · `sourceLabel`) — coğrafi **olmayan** yerleşim.
  0-1 normalize düzlem koordinatıdır, arama kaydının kendi şematik
  yerleşiminden (`ListingSummary.map`) gelir ve **enlem/boylam değildir**.
  Çizim yine gösterilir (bölüm çıplak kalmaz) ama metin bunu adıyla söyler:
  `Şematik yerleşim · coğrafi koordinat kaydı yok`. Başlık `Şematik yerleşim`,
  haritanın adı `Şematik konum yerleşimi`.

Şematik varyantta **mahremiyet dili hiç geçmez** ve `radiusMeters` alanı tipte
**yoktur**: gizlenecek gerçek bir koordinat olmadığı yerde mahremiyet iddiası
üretmek, olmayan bir kesinliği ima etmek olurdu. İşaretin büyüklüğü sabittir ve
metin bunun bir yarıçap/mesafe bildirmediğini yazar. Ayrık birleşim bilinçlidir:
opsiyonel `lat`/`lng` taşıyan tek bir düz tip, şematik yerleşimi görünüm
katmanında coğrafi koordinatla aynı şeye benzetirdi. Geo hiç yoksa çizim
çizilmez (§ eski davranış korunur), yalnız idari konum metni kalır.

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
| `image` · `imageCount` | `media` (çoklu temsili kare) + `declaredMediaCount` | kare havuzdan gelir; sayı ayrı beyandır |
| `map` | `geo` (`kind: 'schematic'`) | şematik yerleşim, koordinat değil |
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
- **Görsel sayısı beyandır, albüm değildir.** `declaredMediaCount` ilan
  kaydında bildirilen sayıdır; `media` dizisinin uzunluğu değildir. İkisi
  sahnede aynı cümlede, ayrı ayrı yazılır ve bildirilen sayı kadar kare
  üretilmez (§1c).
- **Konum çizimi şematiktir, koordinat değildir.** `summary.map` bir liste
  yerleşimidir; yansıtma onu `kind: 'schematic'` geo olarak taşır ve görünüm
  katmanı coğrafi koordinat kaydı olmadığını görünür yazar (§1d). Şematik
  yerleşimden mesafe, yön veya yakınlık iddiası türetilmez.
- **Soru-cevap boşluğu "henüz" değildir.** Yansıtılmış kayıtta soru dosyası
  hiç tutulmaz; bölüm bunu adıyla yazar (`Bu kayıtta soru-cevap dosyası yok.`
  + kaydın yansıtılmış olduğu ve sorular satıcı bağlandığında açılacağı) ve
  `ListingQnaSection projected` bayrağıyla bu metne geçer. Boş durum yeni bir
  buton veya eylem açmaz (§4).
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
| Hero örtüleri (ilan no · favori/paylaş kapsülü · "Tümünü gör") | bento kapağının üstünde | kontrol |

| `GlassButton` "Numarayı göster" | satıcı bölümü | kontrol |
| `GlassButton` birincil eylem | karar kartı | kontrol |
| `GlassButton` "Kaydet" | karar kartı | kontrol |

**Eylem butonları camdır — bütçe bilerek aşılmıştır.** Ürün kararı: sayfadaki
her buton kabuktaki `İlan ver` ile aynı görünmeli, malzeme dahil. Bu, katman
kuralını değil **bütçe sayısını** esnetir; eylemler zaten kontrol katmanına
aittir.

Gerçek sayı: sayfa genelinde **8 cam yüzey** (kabuk: `Üye
girişi` · `İlan ver` · menü — sayfa: iki hero/gezinme örtüsü — eylemler: üç
buton). `GenelBakis.mdx` sayfa başına altı önerir; bu sayfa ikiyi aşar.

**Testlerin ölçtüğü sayı bu değildir.** `ListingDetailWorkspace` testleri
kabuğu render etmez; oradaki sayım beştir ve `<= 6` iddiası geçmeye devam eder.
Yani mevcut testler bu aşımı yakalamaz — bütçeyi gerçekten kontrol etmek
isteyen bir test kabukla birlikte render etmelidir.

**Bilinen bedel:** cam buton zeminini arkasındaki yüzeyden alır. Satıcı
bölümünün tonlu künye bandının üstünde `Numarayı göster` bandın bejini alır ve
düz beyaz hâline göre daha soluk okunur. Bu, malzeme tercihinin doğrudan
sonucudur; bandın tonu düşürülerek veya o tek buton `material="flat"` yapılarak
geri alınabilir.

**Karar kartının yüzeyi hâlâ cam değildir.** Kart içerik katmanındadır:
hairline çerçeve + kağıt zemin, sekme şeridi düz kontrol. Cam olan kartın
kendisi değil içindeki eylemlerdir. Eskiden burada duran `GlassDetailActionBar`
kaldırıldı — kartın içindeki cam bir eylem **kutusu** kart içinde kart
oluyordu; tekil cam butonlar ayrı bir yüzey açmaz. Dar yerleşimdeki dock cam
kalır ama kartla asla aynı anda görünmez.

Kalan yüzeyler rezervdir (Faz 2 sohbet dock'u / mobil alt çubuk).
Hero'nun sayacı ve "Tümünü gör" örtüsü yalnız birden çok kare varken çizilir —
tek kareli ilanda o işaretler hiç açılmaz. Kanıt bölümlerinin hepsi içerik
katmanındadır: yaprak düz bir yüzeydir, `backdrop-filter` almaz ve cam
bütçesine girmez (bkz. §1b). Cam üstüne cam yoktur — karar
kartının fiyat/panel/eylem blokları, `GlassDataProvenance` künyeleri ve
sahnenin künyesi düz yüzeydir; hero örtüleri camdır ama fotoğrafın
üstündedir, camın üstünde değil. Tam ekran görünümde de aynı kural işler:
`GlassLightbox`'ın karartılmış katmanı düz bir malzemedir, üstünde yalnız cam
kontroller (ok, kapat) durur.

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
- Satıcı hakkında sayfada iki yüzey konuşur (karar kartının satıcı künyesi ve
  satıcı bölümü) ve **ikisi de aynı cümleyi** kullanır: metinler
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
**"Görüşme gündemi"** olarak, yani eylemin gerçekten yapılabildiği yerde
tekrar görünür. Faz 2'de mesaj bestecisi geldiğinde bu liste tek tek "taslağa
ekle" eylemlerine bağlanabilir; o zamana kadar metin kalır.

**Gündem maddesi adımı ve gerekçesini birlikte taşır.** Satıcı bölümünde her
madde `issue.action` (yapılacak iş) ile `issue.title` (kapattığı açık konu)
çiftidir; `issue.detail` orada tekrarlanmaz — uzun gerekçe zaten özet
bölümünde ve karar kartında durur, iki yerde birden yazılırsa sayfa kendi
kendini tekrar eder. Gündemin **numaralandırması** karar kartındaki listenin
aksine anlam taşır: maddeler `criticalIssues()` sırasını korur ve telefonda
ilerlenecek sıradır, bu yüzden işaretleyici `<ol>`'dur.

**Rotası olmayan kontrol çizilmez; gerekçesi yine yazılır.** Kural iki
duruma ayrılır ve ayrım bilinçlidir:

- **Yeteneğin kendisi yoksa kontrol hiç çizilmez.** Mesajlaşma bu sürümde
  bağlı değildir; karar kartında `Mesaj gönder` diye bir buton **yoktur**.
  Yerine tek satırlık not durur: *"Mesajlaşma sonraki fazda açılacak; mesaj
  gönderme bu sürümde bağlı değil."* Gerekçe: pasif duran dolu bir birincil
  buton kullanıcıya bozuk bir ekran izlenimi veriyordu ve sayfanın tek
  prominent CTA'sını ölü bir eyleme harcıyordu. Yetenek sessizce yok
  sayılmaz — geleceği kelimeyle söylenir. Mesajlaşma bağlandığında (`onContact`
  verildiğinde) buton çizilir ve **birincil eylemi devralır**.
- **Yetenek var ama bu görünümde bulunamıyorsa kontrol `disabled` durur** ve
  nedeni aynı yüzeyde yazılır. `Satıcı bilgilerine git` böyledir: sayfada
  gerçekten bir numara kontrolü olabilir; yoksa (sağlayıcı bağlı değil veya
  iletişim kapalı) eylem devre dışı kalır, gerekçesi altında okunur.

**Sayfanın tek birincil eylemi her zaman gerçekten çalışan eylemdir.** Dolu
buton (`[data-variant="primary"]`, sayfada tek) mesajlaşma bağlıysa
`Mesaj gönder`, değilse `Satıcı bilgilerine git`'tir. Karar özetindeki
`Yanlış bilgi bildir` de aynı sözleşmeyi paylaşır (işleyicisi yoksa `disabled`
+ görünür gerekçe).

Kural şu testlerle korunur: `ListingDetailWorkspace.test.tsx` →
"karar kartında sayfanın tek birincil eylemi bulunur" ve "bağlanmamış eylem
çizilmez ya da devre dışı durur"; `components/ListingDecisionRail.test.tsx` →
"mesajlaşma bağlı değilken buton çizilmez, tek satır not durur" ve "mesajlaşma
bağlandığında birincil eylemi devralır".

Tek istisna satıcı bölümündeki numara kontrolüdür (§7): orada kontrolün
yerini gerekçe metni alır, çünkü "Numarayı göster" yazan devre dışı bir buton
bağlı olmayan bir servis hakkında verilmiş bir söz olurdu. Gerekçe yine
görünürdür — kural aynı, taşıyıcı farklıdır.

**Görüşme gündeminin işaret kutucukları kuralı ihlal etmez.** Kutucuk hiçbir
şeye "bağlanmayı" beklemez: yaptığı işin tamamı, telefondayken nerede
kalındığını tutmaktır ve bunu gerçekten yapar. Sunucuya gitmez, taslak
üretmez, kalıcı değildir; kapsamı listenin altında görünür yazılır —
*"İşaretler yalnız bu görüntülemede tutulur; kaydedilmez."* Kural bağlanmamış
kontrolü değil, **yapmadığı şeyi vaat eden** kontrolü yasaklar. Kalıcılık
Faz 2'de eklenirse cümle kalkar, kontrol aynı kalır.

## 5. Sayfa düzeyinde tab yok

Bölüm indeksi bir tab seti değil, **çapa gezinmesidir**: bütün bölümler DOM'da
kalır (yazdırma, Ctrl+F, ekran okuyucu ve derin bağlantı bozulmaz). Kanıt
bölümleri hiçbir zaman sekme arkasına konmaz.

**Karar kartının sekmeleri bu kuralın istisnası değildir**, çünkü kart bir
kanıt bölümü değil **özet yüzeyidir**: her panelin içeriği sayfanın kendi
bölümlerinde tam hâliyle zaten vardır (`Doğrulama` → doğrulama defteri,
`Satıcı` → satıcı bölümü) ve ilk görünümde durması gereken şey — görüşmeden
önce çözülmesi gerekenler — **varsayılan panelde** (`Özet`) durur. Sekme
kapalıyken hiçbir bilgi sayfadan kaybolmaz; yalnız kartın içinde saklanır.
Kartın sekme şeridi feature içinde yazılır (bkz. §1b gerekçesi); `GlassTabs`
sayfada yalnız medya/harita görünüm değişiminde kullanılabilir.

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
  kontrol **tekrar denenebilir** kalır — çıkmaz sokak yoktur. Uyarı kontrolün
  yanına değil, künye bandının **altındaki sabit yuvaya** (`.revealStatus`)
  girer: aynı yuvayı kapalı iletişim gerekçesi ve bağlı olmayan servis notu da
  paylaşır. Gerekçe: uyarı kontrolün yanında belirdiğinde künyeyi aşağı
  itiyordu ve başarısız denemeden sonra göz kontrolü yeni yerinde arıyordu.
  Yuva kontrolün **altındadır**, bu yüzden band hiç kımıldamaz.
- İletişim kapalıyken (`contactClosedReason`) numara açma kontrolü hiç
  render edilmez; yerine gerekçe metni durur.
- `onRevealPhone` verilmezse **buton hiç render edilmez.** Çalışmayan buton
  gösterilmez.
- **Numara sayfada tam olarak tek yerde açılır: satıcı bölümü.** Başka hiçbir
  eylem açılış mantığını kopyalamaz — karar kartının `Satıcı` sekmesi de
  numarayı göstermez, yalnız nerede açıldığını yazar ve bölüme bağlanır.
  Kartın `Satıcı bilgilerine git` eylemi yalnız **gezinir**:
  `SELLER_REVEAL_CONTROL_ID`
  kimlikli kontrolü görünür alana getirir ve odağı ona taşır. Kimlik her zaman
  o an canlı olan öğededir — açılıştan önce butonda, sonra `tel:` bağlantısında.
  Kaydırma `prefers-reduced-motion` altında anidir (`behavior: 'auto'`).
- Satıcı bölümünde kontrol yoksa (`hasSellerRevealControl` false: sağlayıcı
  bağlı değil veya iletişim kapalı) **kartın bu eylemi `disabled` render
  edilir** ve gerekçesi eylemin altında yazılıdır (§4). Kart asla etkin ama
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

## 7b. Soru-cevap: yetki, görünürlük ve katlama

Bölüm bir yazışmadır ama sayfa bir **kanıt dosyası**dır; iki tarafın da
kuralları burada birleşir.

- **Yetki rolden değil SAHİPLİKTEN türer.** Kendi yazdığını silersin,
  başkasınınkini bildirirsin. Karar görünen ada değil `ListingQnaAuthor.id`
  ile `ListingQnaViewer.id` eşitliğine bakar. İlan sahibinin iki fazladan
  yetkisi vardır ve **yalnız ikisi**: kendi yanıtını gizlemek ve gizlenmiş
  içeriği okumak. **Soruyu silemez** — silebilseydi bölüm bir kanıt dosyası
  değil, seçilmiş sorular vitrini olurdu. Uygunsuz soru için yol bildirim ve
  moderasyondur.
- **Bağlanmamış işlem menüde çizilmez** (§4'ün buradaki uygulaması). Her
  menü kalemi kendi geri çağrısının varlığına bağlıdır; hiçbiri yoksa
  "İşlemler" kontrolü de hiç render edilmez. Oturum kapalıyken menü yoktur.
- **İki ayrı gizleme vardır ve aynı görünmezler.**
  `visibility: 'hidden'` ilan sahibinin **tercihidir**, geri alınabilir;
  `visibility: 'masked'` platformun **kuralıdır** (telefon/e-posta herkese
  açık alanda yayımlanmaz), geri alınamaz ve bu yüzden maskeli yanıtta
  gizle/göster kalemi **hiç açılmaz** — bir kural bir tercih gibi sunulmaz.
  İkisinde de içerik yalnız yazarına ve ilan sahibine okunur.
- **Gizleme sessizdir** *(04.08.2026 kararı)*. Gizlenen yanıt başkalarında
  hiçbir iz bırakmaz: açıklama satırı, damga, üstü çizili göz — hiçbiri
  çizilmez, satır yoktur. Sahibine damgalı (`Gizli · yalnız siz`) olarak
  okunur kalır; kendi yazdığının yayında olup olmadığını bilemeyen kullanıcı
  bırakılmaz.
- **Ama "yanıtsız" da denmez.** `Henüz yanıtlanmadı` etiketi YALNIZ
  `replies.length === 0` iken yazılır. Tek yanıtı gizlenmiş soru sessizce
  yanıtsız durur — boş bırakmak bir şey söylememektir, yanlış söylemek
  değil. Aynı gerekçeyle sayaç ve katlama sayısı **görünen** yanıtları sayar:
  gizli bir yanıt "yanıtlandı" izlenimi üretmez.
- **Son cevap görünür, gerisi katlanır.** Bir soruda birden çok görünen yanıt
  varsa varsayılan olarak yalnız sonuncusu çizilir; öncekiler
  `Tüm cevapları gör · N cevap` kontrolünün arkasındadır. Sayı önceden
  yazılır — açmadan önce ne geleceği bilinir.
- **Avatar fotoğraf taşımaz.** Baş harfler + tonlanmış zemin; ton **rolü**
  söyler (satıcı vurgu tonunda, görüntüleyenin kendisi halkalı, diğerleri
  nötr). Tam ad taşınmaz.
- **Oturum kapalılığı ile kanal kapalılığı ayrı durumlardır.** Kanal açık ama
  oturum kapalıysa kullanıcının **çözebileceği** bir durum vardır: paragraf
  değil kontrol çizilir (`onGirisIste`, giriş sonrası `donus` yolunu kurmak
  çağıranın işidir). Kanal kapalıysa (`askDisabledReason` ya da
  `onSoruGonder` yok) giriş kontrolü **çizilmez** — giriş yapmak kapalı bir
  kanalı açmaz ve o kontrolü göstermek yalan olurdu.
- **Yaprağın içinde ikinci kart yoktur** (§1b). Yanıtlar tonlu bir ray ve
  girintiyle bağlanan bir **alt bölgedir**; çerçevesi, zemini ve gölgesi
  yoktur. İşlemler menüsü kontrol katmanındadır ama **cam açmaz** — sayfanın
  cam bütçesi navigasyona ayrılmıştır (§2).
- **Aynı erişilebilir ad iki kontrolde kullanılmaz.** Satırdaki yanıt
  kontrolü `Yanıtla`, yanıt kutusunun gönder butonu `Yanıtı gönder`'dir.

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
`Responsive` · `Yansıtılmış ilan (arama sonucu)` ·
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

- 2026-08-05 — **Görsel tek tıkta tam ekran açılıyor** (§1c, §2). Bento
  karesine tıklamak önce cam bir panel (`GlassModal` + `GlassGallery`) açıyor,
  tam ekrana ancak ikinci tıklamayla geçiliyordu: aynı iş için iki katman, iki
  tıklama. Panel kaldırıldı; kare doğrudan `GlassLightbox`'a açılıyor ve
  kareler arasında geçiş katmanın **alt thumbnail şeridinden** yapılıyor.
  Görüntüleyici kütüphaneye yeni bir overlay olarak eklendi (`GlassGallery`'nin
  iç lightbox'ı oraya taşındı) — böylece focus trap, `body` scroll kilidi ve
  kapanışta tetikleyiciye focus dönüşü artık sözleşmenin parçası. Medya
  dürüstlük kuralları değişmedi: temsili görsel cümlesi tam ekranda da `note`
  satırı olarak görünür durur.
- 2026-08-04 — **Görüşme gündemi satır olmaktan çıkıp kart oldu** (§1b, §4,
  §9, §10). Üç ayrı şikâyet aynı kökten geliyordu: gündem, ölçüsü içeriğinden
  değil **kolondan** gelen bir satır listesiydi.

  (a) **Kutucuk maddesinden koptu.** Satır üç sütunluydu (numara · metin ·
  kutucuk) ve orta sütun okuma ölçüsüne kadar uzuyordu; 35 karakterlik bir
  maddede kutucuk metnin ~800px sağına düşüyor, hangi maddeye ait olduğunu
  söylemez oluyordu. Sütun daha önce `1fr`'den `--lg-measure`'a çekilmişti —
  aynı hatanın küçüğü. Çözüm ölçüyü değil **yapıyı** değiştirdi: sıra numarası
  ile işaret kutucuğu TEK rozette birleşti. Madde işaretlendiğinde numara
  yerini onay işaretine bırakır; aralarında kapatılacak bir mesafe kalmaz.

  (b) **Hover neyi hedeflediğini değil satırın nereye kadar uzandığını
  gösteriyordu.** Tam genişlik gri bant yerine maddenin kendi zemini yanıyor:
  nötr tondan accent tonuna döner ve madde 1px yükselir. Hareket yalnız
  transform/opacity/filter kanalında; `prefers-reduced-motion` açıkken yer
  değiştirme ve ölçek düşer, renk konuşmaya devam eder.

  Madde bir **kart değildir** — §1b'nin izin verdiği tarafta durur: tonlu
  zemin + yarıçap var, **çerçeve ve gölge yok**. İlk denemede hover'da
  çerçeve + yarıçap + gölge üçlüsü açılıyordu; bu, yaprağın içinde ikinci bir
  kart demekti. Zemin tek başına hem durumu hem hedefi taşıyor.

  (c) **Yaprağın sağ yarısı boştu.** Maddeler artık
  `repeat(auto-fill, minmax(16rem, 1fr))` ızgarasında — yer varsa yan yana
  dizilir. İnce baskı da yaprak 56rem'i geçtiğinde gündemin YANINA geçer
  (`.sellerBody` iki kolon). Eşik **yaprağın kendi kabındadır**
  (`.seller` → `container: sellerSheet / inline-size`), sayfanın değil: karar
  kolonu açıldığında yaprak sayfadan ~372px dar kalır ve sayfa eşiği bu farkı
  göremez. Alt ağaçtaki isimsiz kap sorguları etkilenmedi — `.evidenceGrid` ve
  `GlassAgencyCard` zaten kendi kaplarını kuruyor; kanıt satırı 336px'lik
  kolonda kendi eşiğiyle çöküyor.

  **Rozetin rengi eylem dilinden gelir, uydurulmaz** (§10). Boşta
  `GlassButton`'ın tonlu hâli (accent'in seyreltilmişi), işaretliyken dolu hâli
  (`--lg-action-prominent` + `--lg-action-prominent-label`), hover'da
  `--lg-action-prominent-hover`. Önceki hâl yerli kutucuğun `accent-color`'ıydı
  ve sistemin buton diliyle akraba değildi.

  **Numara kontrolü yine `prominent` YAPILMADI.** Rozet dolu eylem rengini
  taşıyor ama bir buton değil; sayfanın tek birincil eylemi `Satıcı bilgilerine
  git` olarak kalıyor (§4 ve onu koruyan tek `[data-variant="primary"]` testi).

  Yerli kutucuk DOM'da ve odak sırasında kaldı — durum, rol ve klavye davranışı
  tarayıcıdan geliyor, boyanan yalnız rozet. Odak halkası kutucuğa değil rozete
  çizilir: kullanıcı kutucuğu değil maddeyi işaretliyor. Dokunma hedefi kart
  yüksekliğinden geliyor (66px, `--lg-control-hit` üstünde).

- 2026-08-04 — **Eylem dili tek kaynağa bağlandı** (§2, §4). Sayfadaki
  butonlar aynı işi yapıp farklı görünüyordu: kabuğun `İlan ver` butonu
  accent'i %85 saydamlıkla, karar rayının `Satıcı bilgilerine git` eylemi DÜZ
  accent + ağırlık 700 + 44px ile, `Kaydet` beyaz + 600 + 40px ile, satıcı
  bölümündeki `Numarayı göster` ise camla çiziliyordu — yan yana iki farklı
  kahve ve iki farklı yükseklik.

  Sebep yapısaldı: `GlassButton` her zaman cam açıyordu ve sayfanın cam
  bütçesi altı olduğu için (§2) kart içindeki her buton feature CSS'inde elle
  çizilmek zorunda kalıyordu; elle çizilen her buton da kendi rengini
  uyduruyordu. Çözüm iki parçalı:

  (a) `GlassButton` **`material` eksenini** açtı (`'glass' | 'flat'`) —
  `GlassSurface`'te zaten vardı, component dışarı vermiyordu. Kartın ve satıcı
  bölümünün eylemleri artık gerçekten `GlassButton`.

  Malzeme önce `flat` seçildi (cam bütçesi), sonra **ürün kararıyla `glass`e
  döndü**: sayfadaki her buton kabuktaki `İlan ver` ile malzeme dahil aynı
  görünmeli. Bütçe aşımı ve görünürlük bedeli §2'de kayıtlı.

  (b) Görünüm **`--lg-action-*` token'larına** taşındı. Token seviyesinde
  olmasının sebebi: aynı görünümü paylaşması gereken kontrollerin hepsi
  `<button>` değil — dock'un `Satıcıya git` eylemi bilerek `<a>`'dır (§1b) ve
  component'i kullanamaz. Zemin `transparent` yerine `--lg-surface` ile
  karışır, yani opaktır: aynı buton beyaz kartta, fildişi zeminde ve tonlu
  bantta artık aynı renktir.

  `.primaryAction`/`.secondaryAction` yalnız satırdaki yerlerini taşır.
  Vurgu ölçüden değil dolgudan geldiği için ikisi de aynı yüksekliktedir.

- 2026-08-04 — **Satıcı bölümü görüşme kartına döndü** (§1b, §4, §7). Bölüm
  aynı içeriği taşıyor ama artık farklı bir soruyu cevaplıyor: "satıcı kim"
  değil, **"bu görüşmeyi nasıl yapacağım"**. Yerleşim künye bandı → gündem →
  ince baskı sırasına geçti. Çözülen dört kusur:

  (a) **TTBS feragati sayfanın ortasındaydı.** İki cümlelik hukuki kapsam
  künye ile eylem arasında duruyor, kimsenin okumadığı metin en görünür yeri
  tutuyordu. İnce baskıya (`.sellerFinePrint`) indi — cümleler harfiyen aynı
  kaldı (§3 metinleri `seller-copy.ts`'ten gelir), yalnız sıradaki yeri
  değişti.

  (b) **Hata uyarısı yerleşimi kaydırıyordu.** `GlassAlert` kontrolün yanında
  belirip künyeyi aşağı itiyordu. Artık bandın altındaki sabit yuvada
  (`.revealStatus`) — kapalı iletişim gerekçesi ve bağlı olmayan servis notu da
  aynı yuvayı paylaşır. Band hiç kımıldamaz (§7).

  (c) **Numaralandırma anlamsızdı.** Önceki tur listeyi "sıralı hazırlık"
  diyerek `01/02`'ye çevirmişti ama işaretleyici `<ul>`'du ve sıra hiçbir
  şey ifade etmiyordu. Liste artık gerçekten sıra taşıyor
  (`criticalIssues()` düzeni = telefonda ilerlenecek düzen) ve semantiği de
  bunu söylüyor: `<ol>`.

  (d) **Adım gerekçesiz duruyordu.** Her gündem maddesi `issue.action` ile
  birlikte `issue.title`'ı da yazıyor — hangi açık konuyu kapattığı görünür.
  Yeni içerik modeli **gerekmedi**: `CriticalIssue` bu alanı zaten taşıyordu.
  `issue.detail` bilerek tekrarlanmadı; uzun gerekçe özet ve karar kartında.

  **Numara kontrolü `prominent` YAPILMADI.** Görüşme kartının doğal hâli dolu
  bir CTA isterdi ama sayfanın tek birincil eylemi `Satıcı bilgilerine git`'tir
  (§4, `ListingDetailWorkspace.test.tsx` → tek `[data-variant="primary"]`).
  Kontrol vurgusunu dolgudan değil **yerinden** alıyor: bandın sağ ucu.
  Bu sıralama değişirse iki yer birden değişmeli.

  Gündem maddelerine oturum içi işaret kutucuğu eklendi; kapsamı listenin
  altında yazılı ve §4'ün "rotası olmayan kontrol" kuralına takılmama gerekçesi
  orada. Künye bandı §1b'nin "kart içinde kart yok" kuralının izin verdiği
  tarafta: tonlu zemin + hairline, yarıçap/gölge/çerçeve yok.

- 2026-08-04 — **Soru-cevap her ilanda var** (§7b). Yazışma artık yalnız
  referans defterde değil, **yansıtılmış ilanlarda da** taşınıyor
  (`projectQna`). Gerekçe bir doktrin ayrımıdır: soru-cevap bir **kanıt
  kaynağı değildir** — alıcıların yazdığı içeriktir ve TAKBİS/kadastro sorgusu
  yapılmamış olmasıyla ilgisi yoktur. Yansıtılmış ilanın "kanıt dosyası yok"
  bildirimi bu yüzden soru-cevabı kapsamaz.

  Üretim `summary.id`'den **deterministiktir**: aynı ilan her yüklemede aynı
  yazışmayı gösterir, `Math.random`/`Date.now` kullanılmaz, SSR ve hydration
  ayrışmaz. Tohumun beşe bölümünden kalan sıfırsa ilan **soru taşımaz** — boş
  durum gerçek bir hâldir ve erişilebilir kalır. İlk soru üç replikli kurulur
  ki katlama ("Tüm cevapları gör") gerçek veriyle sınansın; son replik
  maskelidir ve yükten çıkarılır.

  **Redaksiyon loader'ın TEK çıkışına taşındı.** Önceki hâlinde filtre yalnız
  referans ilanın yolundaydı; yansıtılmış ilanlara yazışma eklenince maskeli
  numara o yoldan sızardı. Artık her iki dönüş yolu da `redactQna`'dan geçer.
  Canlı sayfada altı ilanda doğrulandı: hiçbirinde maskeli numara yok.
- 2026-08-04 — **Görünürlük filtresi veri katmanına indi** (§7b, §7). Gizlenmiş
  ve maskelenmiş yanıtların metni, ekranda çizilmese de loader'ın döndürdüğü
  nesnede duruyordu — TanStack Start bunu **hidrasyon yükü olarak sunucudan
  gelen HTML'e gömüyor** ve kaynağı açan herkes okuyabiliyordu. Yani "gizleme"
  yalnız bir CSS numarasıydı. `redactQna` artık `public` olmayan her yanıtı
  yükten siler; bileşendeki `canSee` bu filtreyi tekrarlar ve iki katman
  birbirinin yedeği olur. Bu, telefon için zaten yazılı olan kuralın
  (§7 — "numara loader'da getirilmez") soru-cevap karşılığıdır.
  Regresyon testi: yükün serileştirilmiş hâlinde gizli yanıt metni ve maskeli
  numara **geçmez**. Sonuç: ilan sahibi şu anda kendi gizlediğini sayfada
  okuyamaz — bunun için oturumu doğrulayan ayrı bir uç nokta gerekir (§7b
  "kalan iş"); bileşen o veriyi aldığında doğru davranmayı sürdürür.
- 2026-08-04 — **Satıcı bölümü toparlandı** (§1b). Yapraklara geçişte ortaya
  çıkan üç kusur: (a) `GlassAgencyCard`'ın eylem bölgesi bu sayfada **boştur**
  (satıcı eylemleri bölümün kendisinde ve karar kartında yaşar) ama boş `div`
  ızgaranın boşluğunu tüketip künye ile yetki belgesi arasında sahipsiz bir
  aralık bırakıyordu — `:empty` ile düşürüldü; (b) bölüm yaprağın tam
  genişliğini kapladığı için kanıt satırının kaynak sütunu ("Resmî kayıttan")
  değerinden ~1000px uzağa düşüyordu — içerik `58rem` ölçüsüyle sınırlandı,
  kontrol etkilediği şeyin yanına döndü; (c) "Görüşmede sorulacaklar" disk
  madde işaretli düz bir listeydi, oysa **sıralı bir hazırlıktır** — numaralı
  ve hairline ayraçlı satırlara geçti.

  **Avatarın pastel tonuna bilerek dokunulmadı:** `GlassAvatar`'ın baş harf
  mürekkebi temayla dönmez ve zemin tam bu yüzden algısal olarak sabit açıklıkta
  (`oklch(88% 0.05 h)`) seçilmiştir. Token'lı bir tonla değiştirmek
  kontrastı düşürürdü.
- 2026-08-04 — **Soru-cevap yazışmaya dönüştü** (§7b — yeni bölüm, §4, §1b).
  `ListingQnaSection` artık avatarlı bir yazışma taşıyor: her soru ve yanıt
  bir kişiye ait (`ListingQnaAuthor`), yanıtlar tek bir `answer` alanı değil
  kronolojik bir `replies` dizisi ve **alıcılar da yanıt yazabiliyor**.
  Eklenenler: İşlemler menüsü (klavyeyle gezilir, Esc kapatır ve odağı
  tetikleyiciye döndürür), kendi sorusunu/yanıtını silme, ilan sahibinin
  kendi yanıtını gizleyip geri açması, `Tüm cevapları gör · N cevap`
  katlaması ve oturum kapalıyken çizilen giriş kapısı.

  Kararlar §7b'de yazılı; üç tanesi bilinçli ve tartışmalı: (a) **gizleme
  sessizdir** — gizlenen yanıt başkalarında hiçbir iz bırakmaz (iz bırakması
  önerilmişti, sessiz olması tercih edildi); (b) buna karşılık yanıtı
  gizlenmiş soru **"yanıtsız" diye etiketlenmez**, sessizce yanıtsız durur —
  gizleme bilgi saklar ama yanlış bilgi üretmez; (c) **ilan sahibi soru
  silemez**, yalnız kendi yanıtını gizler.

  Görünürlük iki ayrı sebep taşıyor ve ayrı sunuluyor: `hidden` ilan
  sahibinin tercihi, `masked` platformun kuralı (telefon/e-posta). Maskeli
  yanıtta gizle/göster kalemi hiç açılmaz — kural tercih gibi sunulmaz.
  Sayaç ve katlama sayısı **görünen** yanıtları sayar.

  Yetki artık rolden değil sahiplikten türüyor (`ListingQnaViewer.id`);
  bağlanmamış hiçbir işlem menüde çizilmiyor (§4). Oturum kapalılığı ile
  kanal kapalılığı ayrıldı: birine kontrol, diğerine gerekçe.

  **Kalan iş:** gizleme bir **moderasyon sözleşmesi** ister — kim, neyi, ne
  kadar süre gizleyebilir ve gizleme kaydı tutuluyor mu? Uyuşmazlıkta "o
  yanıtı vermişti" iddiasını çözecek şey arayüz değil bu kayıttır. Bileşen
  `onYanitGizle`/`onYanitGoster` geri çağrılarını taşıyor ama **route bunları
  bağlamıyor**; bağlanmadığı sürece gizleme kalemi menüde çizilmez.
- 2026-08-04 — **DOKTRİN DEĞİŞİKLİĞİ: bölümler artık yapraktır** (§1b, §2, §5).
  §1b'nin "bölümler kart değildir; çerçevesi, zemini ve gölgesi yoktur"
  cümlesi **kaldırıldı**. Her kanıt bölümü kendi yüzeyine oturuyor:
  `--lg-surface` + hairline + `--lg-radius-card` + `--lg-shadow-xs`, iç dolgu
  `--sheet-pad` (= `--lg-space-5`). Ritim bölümün içinden **arasına** taşındı
  (`.flow` ızgarasının `--lg-space-4` boşluğu); `--section-rhythm`'in bölüm
  dolgusu olarak kullanımı bitti.

  Gerekçe — beş maddelik tanı: (a) sekiz bölüm aynı zeminde aynı ağırlıkta
  akıyordu, ayrımı yalnız bir hairline taşıyordu ve kaydırma hızında bölümler
  **nesne olarak kaydedilmiyordu**; (b) sayfada iki tipografik ses vardı
  (başlık 22/700, gövde 15/400), göze giriş veren üçüncü ses yoktu; (c) boş
  durumlar dört ayrı gri cümleyle aynı şeyi söylüyordu; (d) durum ("1/1
  olumlu", "derlenmedi", "sorulmadı") yalnız düz metinde taşınıyordu, bir
  bakışta yakalanan işaret yoktu; (e) yüzeyi, sekmeleri ve dolu butonu olan
  **tek** öğe karar kartıydı ve yan yana durduğunda "kart bitmiş, sayfa
  taslak" okunuyordu.

  Değerlendirilen dört yön: **A · Yaprak** (ağırlık yüzeyden — seçildi),
  B · Künye (tipografiden; §1b'ye dokunmuyordu), C · Şerit (kenardan),
  D · Kayıt defteri (yapıdan). A bilinerek seçildi; bedeli kayda geçirilir:
  sayfa artık bir yaprak destesidir ve kenar sayısı arttı.

  Kuralın **değişmeyen** yarısı: kart içinde kart açılmaz. Tek ihlal satıcı
  künyesiydi — `GlassAgencyCard` kendi yüzeyini bırakıyor (`.sellerCard`
  düzleştirmesi). Yaprak cam değildir: içerik katmanındadır ve §2'nin cam
  bütçesine girmez.

  **Kalan iş:** tanının (c) ve (d) maddeleri — boş durum metinlerinin
  kısaltılması ve bölüm başına durum çipi — bu değişikliğe dahil değildir;
  yönden bağımsız oldukları için ayrı ele alınmalıdır.
- 2026-08-04 — **Soru omurgası açıldığını söylüyor: yakın chevron** (§1b, §2).
  `ListingQuestions` satırının açılır kontrolü dört ayrı eksiği aynı anda
  taşıyordu: chevron satırın en sağındaydı (geniş yerleşimde etkilediği
  başlıktan ~1300px uzağa düşüyordu), `:hover`/`:active` geri bildirimi hiç
  yoktu, açık durumu yalnız ikonun 180° dönüşü taşıyordu ve açılan gövde
  hiçbir hizayla sorusuna bağlanmıyordu. Uygulanan yön — **kutu açmadan,
  hizayla**: (a) chevron başlığın soluna geçti ve kapalıyken 90° yatıyor
  (`--lg-space-5` kolon + `--lg-space-3` boşluk); (b) tetikleyici basınç ve
  hover'da `color-mix(… --lg-label 4–5%)` zeminiyle tonlanıyor, geri bildirim
  bırakışta değil **pointer-down**'da başlıyor; (c) açık chevron
  `--lg-accent`'e geçiyor; (d) gövde `--lg-space-7` içeri alınarak sorunun
  metniyle aynı eksene oturuyor. Gövde artık `hidden` ile değil
  `grid-template-rows: 0fr → 1fr` ile kapanıyor: yükseklik ölçülmüyor, açılış
  her an kesilip mevcut değerden geri çevrilebiliyor ve chevron'un dönüşüyle
  aynı eğriyi paylaşıyor (`cubic-bezier(.32,.72,0,1)`, 300ms, aşma yok).
  Kapalı gövde odak sırasından ve erişilebilirlik ağacından `inert` ile
  çıkıyor — DOM'da kalması `display: none`'un aksine artık bir maliyet değil.
  Yeni token yok, yeni yüzey yok: §1b'nin "bölümler kart değildir" kuralı
  korunuyor.

  Üstüne **sıralı kanıt** eklendi (varyant B): gövde açılırken kanıt satırları
  peş peşe biner — her biri bir öncekinden 45ms sonra, `--lg-space-2` kadar
  aşağıdan; altıncıdan sonrası birlikte gelir ki uzun listede bekleme
  birikmesin. Kapanışta gecikme **yoktur**, hepsi birlikte iner: çıkış
  girişten hızlıdır, çünkü kapatan kişi okumayı zaten bitirmiştir. Kanıtın
  ardından gelen sınırlama notu en son oturur — basamak okuma sırasını
  tekrarlar, süslemez. Animasyon yalnız `opacity` ve `transform` üzerindedir;
  yerleşim yeniden hesaplanmaz. Değerlendirilen ve **elenen** yönler: basınç
  diski (aşma, momentum taşımayan bir tıka eklendiğinde sayfanın sakin
  diliyle çelişiyor), inen ray ve devralan zemin (ikisi de açık — soru sayısı
  yediyi geçtiğinde ilk sırada onlar var; zemin seçilirse üstündeki rozet
  kontrastı AAA 7:1 için ölçülmeli).
- 2026-08-03 — **Karar kartı yeniden kuruldu: sekmeli yoğunluk** (§1b, §2, §4,
  §5, §7). Sağdaki karar kolonu "giriş bloğu + sticky eşlikçi" ikilisinden tek
  bir **ürün kartına** dönüştü: sabit fiyat bloğu → `Özet · Doğrulama · Satıcı`
  sekmeleri → sabit yükseklikli panel → sabit eylem bölgesi. Kapatılan
  sorunlar: (a) fiyat kartta iki kez yazılıyordu — sticky fiyat çapası
  kaldırıldı, fiyat ve birim fiyat kartta birer kez geçiyor; (b) pasif
  `Mesaj gönder` birincil butonu ölü görünüyordu — mesajlaşma bağlı olmadığı
  için buton **hiç çizilmiyor**, yerini tek satırlık "yakında" notu aldı ve
  sayfanın tek dolu butonu gerçekten çalışan eyleme (`Satıcı bilgilerine git`)
  geçti; (c) eylemler kartın içindeki cam bir kutudaydı — `GlassDetailActionBar`
  kaldırıldı, eylemler kartın alt bölgesi oldu, cam sayısı 2'den 1'e indi;
  (d) dikey ritim ve ayraçlar kartın sabit iskeletine bağlandı, "vektörün
  tamamı" düz altçizgili bağlantı olmaktan çıkıp ölçülü bir çip aksiyona
  döndü. Sekme sözleşmesi (tablist/tab/tabpanel, roving tabindex, ok/Home/End)
  feature içinde yazıldı — gerekçe §1b'de; kütüphaneye yeni bileşen
  eklenmedi. Panel yüksekliği sabit ve ekranla birlikte küçülüyor, böylece
  kartın tamamı yapışkan kalıyor ve kabuğun yüzen başlığının altında duruyor.
  Dar yerleşimde iş bölümü netleşti: kart hiç çizilmez, `ListingDock` yalnız
  fiyat çapası + `Satıcıya git` bağlantısı taşır (buton yok, kartın uyarı
  cümlesini tekrar etmez) ve içeriği kabuk dock'unun üstünde durur. Doğrulama
  defterine `#dogrulama` çapası eklendi (kartın bağlantısının hedefi kayıptı).
- 2026-08-03 — Yansıtılmış ilan paritesi (§1a, §1c, §1d): hero **her ilanda
  foto bento** oldu. Yansıtma artık kategori havuzundan çoklu temsili kare
  üretiyor (ilk kare arama kartıyla aynı, en çok 4 ve havuzdaki farklı kare
  sayısıyla sınırlı); kare başına künye uydurulmuyor — hepsi `Temsili görsel`
  etiketli, çekim tarihsiz. İlanda bildirilen görsel sayısı ızgaranın altında
  gösterilen kare sayısıyla birlikte künye satırında duruyor. Havuzlar bu
  yüzden kategori başına dörde çıkarıldı (`listing-photos.ts`; her kategorinin
  ilk karesi değişmedi, arama/karşılaştırma etkilenmedi). **Geri alınan
  deneme:** aynı gün kısa süre yaşayan "veri karoları" (bento'nun boş
  hücrelerini alan/doğrulama/yayın yaşı karolarıyla doldurmak) kaldırıldı;
  hero bir kanıt tablosu değil, galeridir. `ListingApproximateGeo` ayrık
  birleşime çevrildi
  (`geographic` | `schematic`); yansıtma `summary.map`'ten şematik geo üretir,
  konum bölümü şematik varyantta da çizim gösterir ama coğrafi koordinat kaydı
  olmadığını yazar ve mahremiyet dilini hiç kullanmaz. Soru-cevap boş durumu
  kaydın yansıtılmış olduğunu söyler; yeni eylem eklenmedi. Tam kayıtlı ilanın
  (`arsa-214-7`) foto-bento'su ve coğrafi harita davranışı değişmedi.
- 2026-08-03 — Hero bento galerisi (§1c, §2): sahnenin tek kapak karesi
  `ListingGallery` bento ızgarasına dönüştü (geniş kapta kapak + kareler, dar
  kapta kaydırmalı şerit + sayaç), kapağa ilan no rozeti ve favori/paylaş
  kapsülü eklendi, tam ekran görünüm `GlassModal` + `GlassGallery` ile
  bağlandı. Sahnenin künyesi cam plakadan düz `header`'a indi. Medya dürüstlük
  kuralları değişmedi: temsili cümle tek kaynaktan görünür kalır, fotoğraf
  olmayan kalemler döküm satırı olarak durur, yüklenemeyen kare `fallbackSrc`'e
  düşer. **Bilinen sınır:** favori durumu hero'da ve karar rayının `Kaydet`
  yardımcı eyleminde ayrı ayrı yerel state'tir; kalıcı favori servisi
  bağlandığında ikisi tek kaynağa çekilmelidir.
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
