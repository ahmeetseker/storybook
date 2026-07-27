# AI-First 2030 Enterprise İlan Detayı

Araştırma ve tasarım karar raporu

**Tarih:** 2026-07-27

**Hedef rota:** `/ilan/$listingId`

**Öncelikli dikey:** Arsa ve arazi

**Genişleme hedefi:** Konut, ticari, bina, devremülk ve turistik tesis

**Durum:** Araştırma tamamlandı, tasarım kararı verildi, uygulama planına hazır

**Dış kaynak erişim tarihi:** 2026-07-27

> Bu dokümandaki “2030” özellikleri ürün vizyonu ve tasarım senaryosudur;
> gelecek öngörüsü, hukuki görüş, tapu incelemesi, jeoteknik değerlendirme veya
> SPK kapsamındaki profesyonel değerleme değildir. Üretim öncesinde hukuk,
> kişisel veri, gayrimenkul ve değerleme uzmanı incelemesi gerekir.

## 1. Yönetici kararı

İlan detayı bir satış broşürü veya uzun bir kart kataloğu olarak değil,
**kaynakları görülebilen bir karar dosyası** olarak tasarlanacaktır.

Seçilen ürün modeli:

> **Kanıt-öncelikli hibrit karar çalışma alanı**

Bu modelde:

1. Yapılandırılmış ilan ve taşınmaz gerçekleri birincil kaynaktır.
2. AI bu gerçekleri özetler, karşılaştırır, belirsizlikleri ve çelişkileri
   açıklar; gerçeklerin yerine geçmez.
3. Her önemli iddia kaynak, tarih, kapsam ve yöntem bilgisi taşır.
4. AI sohbeti sayfayı ikame etmez; sayfadaki kanıt defterinin konuşmalı
   arayüzüdür.
5. Mesaj, randevu, belge paylaşımı ve benzeri dış etkili işlemler açık kullanıcı
   onayı olmadan gerçekleşmez.
6. AI veya harita servisi çalışmadığında çekirdek ilan detayı kullanılabilir
   kalır.
7. İçerik yüzeyleri düz, cam yalnız navigasyon ve kontrol katmanında ve toplam
   en fazla altı yüzey olacak şekilde kullanılır.

İlk sürüm arsa/araziyi referans dikey kabul eder. Ancak veri modeli tek bir
“arsa sayfası”na kilitlenmez; ortak çekirdek ve kategoriye özgü veri paketleri
üzerinden genişler.

### 1.1 İlk üç zorunlu teslim

Uygulamaya başlamadan önce şu üç temel eksik kapatılmalıdır:

1. **Normalize ilan detay sözleşmesi:** Her alanın kaynağını, güncelliğini,
   kapsamını, doğrulama durumunu ve olası çelişkilerini taşır.
2. **Doğru güven semantiği:** EİDS, tapu, imar, parsel, TTBS, platform
   moderasyonu ve AI tahmini tek bir “doğrulandı” rozetinde birleştirilmez.
3. **Sayfa düzeyi AI yönetişimi:** Atıf, belirsizlik, izin, insan onayı,
   itiraz, audit ve “veri yetersizse sonuç üretmeme” kuralları component
   düzeyinden sayfa ve domain sözleşmesine yükseltilir.

### 1.2 Birinci kritik düzeltme

Mevcut `src/pages/ArsaIlanDetay.tsx` içindeki “tapu ve imar durumu EİDS
üzerinden doğrulanmıştır” anlamındaki ifade yanlıştır ve üretime taşınmamalıdır.
EİDS, kimlik ve taşınmazı ilan etme/pazarlama yetkisini doğrular; tapu niteliği,
imar doğruluğu, taşınmazın fiziksel durumu veya fiyatın adilliği için toplu bir
garanti vermez. Ticaret Bakanlığı ayrıca bu yetkinin tapu işlemi veya başka bir
tasarruf yetkisi olmadığını açıkça belirtir:
[EİDS yetki doğrulama uygulamasının kapsamı](https://icticaret.ticaret.gov.tr/haberler/elektronik-ilan-dogrulama-sistemi-eids-yetki-dogrulama-uygulamasi-hayata-gecirildi).

Doğru kısa metin:

> **Bu taşınmaz için ilan verme yetkisi EİDS ile doğrulandı.**

Zorunlu kapsam açıklaması:

> Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya
> fiyatı doğrulamaz.

## 2. Araştırma yöntemi

Rapor dört kanıt kolunun sentezidir:

1. **Yerel ürün ve kod denetimi:** Bağlayıcı tasarım sistemi, üretim
   uygulaması, Storybook prototipleri, 98 component klasörü, component
   sözleşmeleri ve eski gap raporları incelendi.
2. **Enterprise ilan detayı araştırması:** Türkiye ve uluslararası emlak
   ürünlerinde alan kapsamı, bilgi mimarisi, fiyat/geçmiş, risk, harita,
   karşılaştırma, responsive düzen ve KPI örüntüleri araştırıldı.
3. **AI-first 2030 ve yönetişim araştırması:** EİDS, TKGM, e-Plan, AFAD, KVKK,
   ayrımcılık, otomatik değerleme, agent güvenliği, medya kökeni, insan
   gözetimi ve erişilebilirlik incelendi.
4. **Birincil kaynak doğrulaması:** Türkiye’de resmî kurumlar; NIST, W3C,
   OECD, AB ve mesleki standart kuruluşları; ardından ürün benchmarkları
   çapraz okundu.

Araştırma üç bağımsız alt ajanla yürütüldü. Karar bu çıktıların doğrudan
birleştirilmesi değil, çelişkilerinin proje gerçekleri ve birincil kaynaklarla
yeniden değerlendirilmesidir.

### 2.1 Kanıt güven düzeyi

| Kaynak türü                               | Kullanım                                   | Güven / sınırlama                                                                |
| ----------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| Türkiye resmî kurum ve mevzuat açıklaması | EİDS, parsel, plan, tehlike, KVKK          | En yüksek; yine de hukuk incelemesinin yerini tutmaz                             |
| Açık standart ve mesleki çerçeve          | AI yönetişimi, erişilebilirlik, provenance | Güçlü tasarım kıyası; tümü Türkiye’de bağlayıcı hukuk değildir                   |
| Ürün sağlayıcısının kendi dokümanı        | Mevcut özellik ve sınırlama örüntüsü       | Ürünün kendi beyanıdır; bağımsız etki kanıtı değildir                            |
| Repo kodu ve sözleşmeleri                 | Bugünkü ürün gerçeği                       | Doğrudan kanıt; “hazır” etiketi tüm kalite kriterlerinin geçtiği anlamına gelmez |
| 2030 senaryosu                            | Gelecek ürün yönü                          | Tasarım kararıdır, dış dünya gerçeği iddiası değildir                            |

## 3. Mevcut proje durumu

### 3.1 Güçlü temel

Kütüphane, eski gap raporlarında eksik sayılan pek çok yeteneğe artık sahiptir:

- `GlassMediaGallery`
- `GlassMap`
- `GlassFeatureGroup`
- `GlassMetricStrip`
- `GlassTable`, `GlassChart`, `GlassTimeline`
- `GlassTrustSignalPanel`
- `GlassValuationCard`, `GlassValuationDrivers`
- `GlassClimateRiskPanel`
- `GlassAiSummaryCard`
- `GlassAiEvidenceList`, `GlassAiConfidence`
- `GlassMatchScore`, `GlassMatchBreakdown`
- `GlassAiRiskReview`, `GlassAiAgentActivity`
- `GlassChatDock`
- `GlassCompareBar`, `GlassCompareTable`
- `GlassSellerCard`, `GlassAgencyCard`
- `GlassTourScheduler`
- loading, alert, empty state ve overlay altyapıları

Bu nedenle 2026-07-17 tarihli gap raporundaki “41 eksik component” sayısı yeni
çalışma için kaynak gerçekliği değildir. Rapor component sayısını artırmayı
başarı ölçütü olarak kabul etmez.

### 3.2 Üretim boşluğu

- `apps/web/vite.config.ts:51` içinde `/ilan/:id` henüz tanımlı olmayan rota
  olarak not edilmiştir.
- Arama sonuçları `apps/web/src/features/listings/EmlakSearchView.tsx`
  satır 467 ve 483’ten `/ilan/${id}` adresine bağlanır; hedef üretim sayfası
  yoktur.
- `apps/web` özet modeli başlık, fiyat, alan, konum ve birkaç liste alanına
  odaklıdır; detay düzeyinde provenance veya kategori paketi taşımaz.
- `src/pages/ArsaIlanDetay.tsx` ve `src/pages/KonutIlanDetay.tsx` Storybook
  prototipidir; üretim rotası, normalize domain sözleşmesi veya gerçek servis
  sınırı değildir.
- Konut prototipi medya, harita, özellik, finansman ve tehlike blokları
  açısından iyi bir kompozisyon referansıdır; ancak kaynaklı AI, doğrulama
  vektörü ve sayfa durum matrisi eksiktir
  (`src/pages/KonutIlanDetay.tsx:181-356`).

### 3.3 Bugünkü teknik ve tasarımsal riskler

| Alan            | Bulgu                                                                         | Rapor kararı                                                       |
| --------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Başlık          | `GlassPriceHeader` sabit `h2`, string `meta` ve efektif cam varsayılanı taşır | Sayfa için semantik `h1` ve yapılandırılmış meta API’si gerekir    |
| EİDS            | Bazı metinler EİDS’yi tapu/imar doğrulaması gibi sunar                        | Repo genelinde kapsam düzeltme geçidi                              |
| Güven paneli    | Örnek/sözleşme metinlerinde “EİDS tapu eşleşmesi” görülebilir                 | Sinyaller ayrı kaynak ve kapsamla modellenir                       |
| Satıcı telefonu | `GlassSellerCard` numarayı prop/DOM’a önceden getirir; maske görseldir        | Reveal anında yetkili fetch veya gerçek sunucu maskelemesi         |
| Satıcı odağı    | Telefon reveal sonrası odak gövdeye düşebilir                                 | Controlled state ve hedefe odak aktarımı                           |
| Sohbet          | `GlassChatDock` yalnız düz mesaj/pending modelidir                            | Citation, tool result ve onaylı aksiyon için yeni mesaj sözleşmesi |
| Cam nesting     | Toolbar yüzeyi içine tekrar `GlassButton`/`GlassIconButton` yüzeyi girebilir  | Grup içinde yüzey üretmeyen kontrol biçimi                         |
| Cam bütçesi     | Altı yüzey kuralını denetleyen linter/runtime guard yok                       | Sayfa spec’inde zorunlu bütçe tablosu ve test                      |
| Dokunmatik      | Bazı küçük ikon kontrolleri coarse pointer’da 44 hedefe büyümez               | Component audit ve proje standardı                                 |
| Motion          | Bazı bileşenler layout/stroke/smooth scroll animasyonu kullanır               | İlan detayında yalnız izinli preset ve reduced-motion              |
| Veri            | Ortak detay modeli source/freshness/conflict taşımaz                          | Kanıt defteri merkezli domain modeli                               |
| Story           | Detay sayfalarında yalnız “Default” ağırlıklı örnekler vardır                 | Enterprise durum matrisi ve iki tema                               |

### 3.4 Tasarım sistemi bağlayıcıdır

Yeni sayfa şu dokümanlara istisnasız uyar:

- `src/design/GenelBakis.mdx`
- `src/design/Tokenlar.mdx`
- `src/design/EksenlerVeDurumlar.mdx`
- `src/design/ErisilebilirlikMotionResponsive.mdx`
- `src/design/ComponentSablonu.mdx`

Özellikle:

- içerik düz,
- cam yalnız navigasyon/kontrol,
- sayfa başına en fazla altı cam yüzey,
- cam üstüne cam yok,
- component CSS’inde yalnız `--lg-*`,
- raw renk/ölçü/gölge/keyfî radius yok,
- state ile variant karıştırılmaz,
- stateful API `value + defaultValue + onXChange`,
- cihaz adı prop’u yok,
- `:focus-visible` halkası standart,
- coarse pointer hedefi en az 44,
- reduced-motion ve reduced-transparency desteği zorunludur.

## 4. Problem tanımı

Arsa veya taşınmaz alıcısı tek bir “beğendim/beğenmedim” kararı vermez.
Birbirine bağlı şu soruları çözmeye çalışır:

1. İlanı yayımlayan kişi veya kurum bu taşınmaz için yetkili mi?
2. İlandaki ada/parsel, konum, alan ve medya aynı taşınmaza mı ait?
3. Tapu niteliği, hisse, imar ve yasal erişim hakkında ne biliyoruz?
4. Hangi bilgiler resmî, hangileri satıcı beyanı, hangileri platform türevi?
5. Fiyat hangi emsallere göre makul veya sıra dışı?
6. Tehlike, altyapı ve çevre katmanları hangi ölçekte ve ne kadar güncel?
7. Hangi kritik belge veya bilgi eksik/çelişkili?
8. Bu taşınmaz kullanıcının amacı, bütçesi, süresi ve risk toleransıyla nasıl
   örtüşüyor?
9. Bir sonraki güvenli adım nedir?

Mevcut portal kalıbı bu soruların cevaplarını çok sayıda kart, rozet ve sekmeye
dağıtır. Tam sohbet odaklı bir arayüz ise gerçekleri hızlı tarama,
karşılaştırma, SEO ve erişilebilirlik açısından zayıflar. Yeni tasarım iki
uçtan birini seçmek yerine yapılandırılmış veri ile konuşmalı açıklamayı aynı
kanıt defterinde birleştirir.

## 5. Kullanıcılar ve karar işleri

### 5.1 Birincil kullanıcılar

| Kullanıcı                 | Birincil iş                                                   | Başarı anı                                          |
| ------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| Bireysel alıcı            | İlanın güvenilirliğini ve uygunluğunu hızla anlamak           | Kritik eksikleri görüp güvenli sonraki adıma geçmek |
| Arsa yatırımcısı          | İmar, erişim, emsal ve senaryo farklarını kıyaslamak          | Varsayımları görünür bir shortlist oluşturmak       |
| Profesyonel alıcı/analist | Çok sayıda alanı kaynak ve tarihleriyle incelemek             | Tekrar üretilebilir karar dosyası çıkarmak          |
| Satıcı                    | Nitelikli talep ve doğru sorular almak                        | Yanlış beklenti yerine uygun görüşme/randevu        |
| Yetkili emlak işletmesi   | Yetki, portföy ve iletişim güvenini göstermek                 | Doğrulanabilir kurumsal bağlamla dönüşüm            |
| Moderasyon/operasyon      | Çelişki, yanıltıcı medya ve sahtecilik sinyallerini incelemek | Gerekçeli insan kararı ve itiraz kaydı              |

### 5.2 İlk görünümde cevaplanacak sorular

Kullanıcı kaydırmadan veya tek kısa kaydırmayla şunları görmelidir:

- ne satılıyor ve nerede,
- toplam fiyat, birim fiyat ve alan,
- ilan durumu ve son güncelleme,
- EİDS kontrolünün **tam kapsamı**,
- önemli bir eksik veya çelişki varsa görünür uyarı,
- birincil iletişim eylemi,
- medyanın ve konumun niteliği,
- detayın kaynaklı bir karar dosyası olduğuna dair giriş.

## 6. “AI-first 2030” ne demektir?

AI-first, sayfaya sohbet balonu eklemek değildir. Bu ürün için şu sözleşmedir:

1. **Niyet çözümleme:** “Yatırıma uygun mu?” gibi belirsiz bir soru; amaç,
   kullanım, bütçe, vade, likidite ve risk toleransı gibi düzenlenebilir
   kriterlere çevrilir.
2. **Kanıt tabanlı açıklama:** Her sonuç mevcut gerçeklere ve kaynaklara
   bağlanır; kaynaksız resmî iddia üretilmez.
3. **Çelişki farkındalığı:** İki kaynak farklıysa AI tek bir “doğru” seçip
   gerçeği gizlemez; farkı, tarihi ve çözüm adımını gösterir.
4. **Tahminden çekinme:** Veri zayıfsa skor veya fiyat uydurmak yerine
   “yeterli veri yok” der.
5. **Kullanıcı kontrollü kişiselleştirme:** Hangi tercihlerin sonuca etki
   ettiği görülebilir, düzenlenebilir ve sıfırlanabilir.
6. **İzinli ajanlık:** AI okuyabilir, hazırlayabilir ve önerebilir; dış etkili
   işlemlerde açık onay ister.
7. **İzlenebilirlik:** Model, veri, kaynak ve eylem sürümleri audit kaydına
   girer.
8. **Zarif gerileme:** AI kapalı veya arızalıyken yapılandırılmış ilan gerçeği
   eksilmez.
9. **Mahremiyet:** Kişisel bağlam, belge ve iletişim verileri amaçla sınırlı,
   asgari ve kullanıcının kontrolünde işlenir.
10. **İnsan ve uzman devri:** Hukuki, jeoteknik, değerleme veya işlem taahhüdü
    gerektiren noktada doğru uzman ve kanıt paketi devralır.

### 6.1 2030 kuzey yıldızı senaryosu

Kullanıcı “Bu araziyi beş yıl içinde küçük bir turizm projesi için almak
mantıklı mı?” diye sorar. Sistem:

- önce eksik amacı ve bütçe sınırlarını netleştirir,
- parsel, plan, erişim, altyapı, tehlike ve emsal verilerini ayrı kaynaklardan
  toplar,
- her cümleyi iddia düzeyinde kaynaklar,
- planın yürürlük/askı durumunu ve belirsizlikleri ayırır,
- baz/iyimser/stres senaryolarını kullanıcı tarafından düzenlenebilir
  varsayımlarla gösterir,
- eksik belge ve uzman kontrol listesini hazırlar,
- benzer ilanlarla farkları açıklar,
- kullanıcı isterse satıcıya gönderilecek soru taslağını hazırlar,
- ancak mesajı göndermez, randevu oluşturmaz, teklif vermez, ödeme veya resmî
  başvuru yapmaz; önce açık onay ve gerektiğinde insan kontrolü ister.

## 7. Yaklaşım alternatifleri

### 7.1 Karşılaştırma

| Ölçüt                 | A — Premium portal + AI yan panel | B — Sohbet-öncelikli AI tuvali | C — Kanıt-öncelikli hibrit |
| --------------------- | --------------------------------- | ------------------------------ | -------------------------- |
| Öğrenilebilirlik      | Yüksek                            | Orta/düşük                     | Yüksek                     |
| Veri taranabilirliği  | Yüksek                            | Düşük                          | Yüksek                     |
| AI’nın görünür değeri | Düşük/orta                        | Yüksek                         | Yüksek                     |
| Kaynak ve audit       | Orta                              | Zor                            | Yüksek                     |
| SEO/SSR               | Yüksek                            | Düşük                          | Yüksek                     |
| Erişilebilirlik       | Yönetilebilir                     | Zor                            | Yönetilebilir              |
| Kişiselleştirme       | Sınırlı                           | Yüksek                         | Yüksek                     |
| Hata halinde gerileme | Güçlü                             | Zayıf                          | Güçlü                      |
| Uygulama riski        | Düşük                             | Çok yüksek                     | Orta                       |
| 2030 vizyonuna uyum   | Orta                              | Yüksek ama kırılgan            | En dengeli                 |

### 7.2 A — Premium portal + AI yan panel

Tanıdık, hızlı uygulanabilir ve SEO açısından güçlüdür. Fakat AI, sayfanın
yanında duran dekoratif bir özet kutusuna dönüşür. Kaynak, tercih, karşılaştırma
ve ajan eylemleri sayfanın veri modeliyle bütünleşmez.

**Neden seçilmedi:** Mevcut portalların daha cilalı kopyası olur; AI-first ürün
farkı yüzeysel kalır.

### 7.3 B — Sohbet-öncelikli AI tuvali

Doğal dil ve çok adımlı araştırma için etkileyicidir. Buna karşılık fiyat,
parsel, plan, kaynak, belge ve emsallerin hızlı taranması zorlaşır. Tek yanıt
akışı; halüsinasyon, erişilebilirlik, karşılaştırma, indeksleme ve servis
arızası risklerini büyütür.

**Neden seçilmedi:** Taşınmaz gibi yüksek değerli ve kanıt yoğun bir kararda
sohbet, temel gerçeklerin yerini alamaz.

### 7.4 C — Kanıt-öncelikli hibrit karar çalışma alanı

Yapılandırılmış gerçekler kalıcı sayfa omurgasıdır. AI aynı kanıt defterini
özetler, sorulara açar ve kullanıcı onaylı iş akışları hazırlar. Sayfa hem hızlı
taranır hem derin araştırmaya izin verir.

**Karar:** C uygulanacaktır.

## 8. Deneyim ve görsel yön

Ürün hissi “gösterişli gelecek ekranı” değil, **kalibre edilmiş bir ölçüm
aleti** olmalıdır:

- kullanıcı eyleminde fiziksel ve kontrollü,
- okuma alanında sessiz,
- karşılaştırmada kesin,
- belirsizlikte dürüst,
- veri yoğunluğunda düzenli,
- birincil vurgu renginde ölçülü.

### 8.1 Premium, sade ve data-dolu birlikte nasıl sağlanır?

“Data-dolu” her değeri ayrı karta koymak değildir. Üç katman kullanılır:

1. **L0 — Karar görüntüsü:** Fiyat, birim fiyat, alan, tür/imar, konum,
   doğrulama kapsamı, güncellik, kritik eksik ve ana eylem.
2. **L1 — Açık kanıt bölümleri:** Parsel, imar/hukuk, erişim/altyapı,
   arazi/tehlike, piyasa/emsal ve belgeler.
3. **L2 — Kaynak ve yöntem çekmecesi:** Sağlayıcı, referans tarihi, sorgu
   zamanı, coğrafi çözünürlük, yöntem, model sürümü, sınırlamalar ve
   çelişkiler.

Kurallar:

- İlk cevap önce, ayrıntı sonra gösterilir.
- Kritik tapu/imar/yasal erişim/çelişki/bayatlık accordion arkasına saklanmaz.
- En fazla iki açıklama derinliği vardır; iç içe accordion yoktur.
- Sayfa düzeyinde tab kullanılarak ana bölümler DOM’dan gizlenmez.
- `GlassTabs` yalnız fotoğraf/plan/video, harita/uydu veya grafik/tablo gibi
  yerel görünüm değişimlerinde kullanılır.
- İçerik bölümleri boşluk, hairline ve tipografiyle ayrılır.
- Tekrarlayan etiket/değer alanları semantik `dl`, yoğun kıyaslar tablo
  kullanır.
- Sayılar tabular figures ile; birimler tutarlı; karşılaştırılan değerler aynı
  baseline üzerinde gösterilir.
- Simetri “eşit büyüklükte kartlar” değil, ortak kolonlar, baseline, bölüm
  ritmi ve hizalı sayısal eksendir.

### 8.2 Kaçınılacak görsel alışkanlıklar

- Her bölümü kartlaştırmak
- Kart içinde kart
- Dekoratif blur veya gradient
- İçerik panellerinde cam
- Çok büyük radius
- Çok büyük pazarlama başlığı
- Birden fazla prominent CTA
- Kırmızı/yeşil tek “yatırım puanı”
- Yalnız ikon veya yalnız renkle durum
- İçeriği örten birden fazla floating kontrol
- “AI” metnini neon/fütüristik süs olarak kullanmak

## 9. Bilgi mimarisi

### 9.1 Sayfa sırası

1. Breadcrumb ve utility eylemleri
2. Tek görünür `h1`, konum, ilan durumu ve yayın/güncelleme zamanı
3. Medya sahnesi + karar rayı
4. Sabit bölüm indeksi
5. AI destekli 30 saniyelik karar özeti
6. Temel metrikler
7. Parsel ve konum
8. İmar ve hukuk
9. Altyapı ve erişim
10. Arazi, çevre ve tehlike göstergeleri
11. Piyasa, fiyat geçmişi ve emsaller
12. Belgeler ve eksik kontrol listesi
13. Satıcı veya yetkili ofis
14. Randevu/mesaj/belge talebi süreci
15. Benzer ilanlar ve karşılaştırma

Önerilen sabit bölüm indeksi:

`Özet · Parsel · İmar ve Hukuk · Altyapı ve Erişim · Arazi ve Tehlike · Piyasa · Belgeler`

### 9.2 İlk görünüm

İlk görünümde şu bilgi sırası korunur:

1. Başlık ve konum
2. Medya
3. Fiyat + TL/m² + alan
4. İlan verme yetkisinin durumu ve son sorgu
5. Kritik eksik/çelişki
6. Birincil “Mesaj gönder” veya “Randevu iste” eylemi

AI özeti çekirdek gerçeklerin önüne geçmez. Özet, üst veriler yüklendikten
sonra kanıtları sıkıştıran ilk içerik bölümü olarak gelir.

### 9.3 Desktop şeması

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Breadcrumb                                      Kaydet · Paylaş · ⋯ │
│ H1 · konum · ilan durumu · yayın/güncelleme                         │
├────────────────────────────────────────────┬─────────────────────────┤
│ Medya sahnesi                              │ Fiyat                   │
│ fotoğraf · video · plan · parsel görünümü  │ TL/m² · alan · tür     │
│                                            │ doğrulama kapsamı       │
│                                            │ kritik eksik            │
│                                            │ birincil eylem          │
├────────────────────────────────────────────┴─────────────────────────┤
│ Özet · Parsel · İmar · Altyapı · Tehlike · Piyasa · Belgeler       │
├────────────────────────────────────────────┬─────────────────────────┤
│ AI karar özeti + iddia düzeyi kanıt        │ Sticky karar/iletişim  │
│ Temel metrikler                            │ rayı; satıcı bölümünde  │
│ Parsel ve konum                            │ sabitlenmeyi bırakır    │
│ İmar ve hukuk                              │                         │
│ Altyapı ve erişim                          │                         │
│ Arazi ve tehlike                           │                         │
│ Piyasa ve belgeler                         │                         │
├────────────────────────────────────────────┴─────────────────────────┤
│ Satıcı/ofis · süreç · benzer ilanlar · karşılaştırma                │
└──────────────────────────────────────────────────────────────────────┘
```

### 9.4 Mobile şeması

```text
Breadcrumb
H1 · konum · durum
Medya sahnesi
Fiyat · TL/m² · alan
EİDS kapsamı · güncellik · kritik eksik
Bölüm indeksi
AI karar özeti
Parsel
İmar ve hukuk
Altyapı ve erişim
Arazi ve tehlike
Piyasa
Belgeler
Satıcı/ofis
Benzerler

[Mesaj gönder] [Randevu iste]  ← safe-area uyumlu tek kontrol grubu
```

Kaydet, karşılaştır, paylaş ve bildir mobilde ikincil utility menüsündedir.
Alt eylem çubuğu sanal klavyeyi, odaklanan alanı veya son içeriği örtmez.

## 10. İçerik ve veri matrisi

Öncelik:

- **P0:** Güvenli ve kullanılabilir çekirdek
- **P1:** İnceleme ve karşılaştırma derinliği
- **P2:** Gelişmiş AI/senaryo

| Bölüm         | L0 karar görüntüsü                       | L1/L2 ayrıntı                                            | Kaynak sınıfı             | Öncelik |
| ------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------------- | ------- |
| İlan kimliği  | Başlık, durum, ilan no, yayın/güncelleme | Değişiklik ve kanonik parsel ilişkisi                    | Platform                  | P0      |
| Fiyat         | Toplam, TL/m², alan                      | Fiyat geçmişi, indirim, nominal/reel görünüm             | Beyan + platform türevi   | P0      |
| Yetki         | EİDS ilan yetkisi, satıcı türü           | Son sorgu, geçerlilik, kapsam dışı                       | Resmî sorgu               | P0      |
| Kurum         | TTBS durumu                              | Belge no, sorgu bağlantısı, geçerlilik                   | Resmî sorgu               | P0      |
| Medya         | Ana görsel, plan/parsel seçimi           | Video, drone, çekim tarihi, AI düzenleme etiketi         | Beyan + medya kökeni      | P0      |
| Parsel        | Ada/parsel, alan, konum hassasiyeti      | Geometri, pin uyuşması, komşuluk, kaynak                 | TKGM/MEGSİS + platform    | P0      |
| Tapu/hukuk    | Nitelik, müstakil/hisseli, pay           | Belge tarihi, bilinen/bilinmeyen takyidat                | Belge + beyan             | P0      |
| İmar          | Kullanım kararı ve plan durumu           | TAKS/KAKS, yükseklik, çekme, plan no/ölçek/not           | e-Plan/belediye/belge     | P0      |
| Erişim        | Yasal ve fiziksel erişim ayrı            | Yol sınıfı, cephe, irtifak, rota ayrımı                  | Resmî + beyan             | P0      |
| Altyapı       | Elektrik/su/kanalizasyon/telekom durumu  | Parselde/sınırda/yolda/teklif gerekli + mesafe           | Kurum/belge/beyan         | P0      |
| Arazi         | Eğim, kot, şekil, cephe                  | Min/ortalama/maks., bakı, çözünürlük ve yöntem           | Coğrafi veri + türev      | P1      |
| Yakın çevre   | İlçe/mahalle, ana merkezlere süre        | POI, koruma/sanayi/tarım alanı, rota varsayımı           | Coğrafi/rota servisi      | P1      |
| Tehlike/iklim | Başlıca bölgesel göstergeler             | Model, dönem, ölçek, eksik değişken ve uzman notu        | AFAD/MTA/MGM/TUCBS        | P1      |
| Piyasa        | Emsal medyanı ve örneklem                | Mesafe, tarih, tür, alan, erişim filtreleri ve aykırılar | İlan/işlem/değerleme ayrı | P1      |
| Değerleme     | Tahmin aralığı                           | Benzerler, düzeltmeler, veri yaşı, model sürümü          | Model tahmini             | P1/P2   |
| Senaryo       | Baz senaryo aralığı                      | İyi/baz/stres, kullanıcı varsayımları                    | Kullanıcı + türetilmiş    | P2      |
| Belgeler      | Mevcut sayı ve kritik eksikler           | Kurum, tarih, geçerlilik, doğrulama, hash/sürüm          | Belge bazlı               | P0/P1   |
| Satıcı/ofis   | Rol, doğrulama, yanıt süresi             | TTBS, platform geçmişi, şikâyet/bildirim                 | Resmî + platform          | P0      |
| İş akışı      | Mesaj, randevu, kaydet, karşılaştır      | Not, belge talebi, süreç zaman çizelgesi                 | Kullanıcı/CRM             | P0      |
| AI            | Neden uygun/uygunsuz olabilir, eksikler  | Kriter, kaynak, çelişki, dışlanan faktör, feedback       | Kaynaklı türetim          | P2      |

### 10.1 Arsa/arazi kategori paketi

Arsa ilk sürümünde ortak çekirdeğe ek olarak şu alanlar gerekir:

- taşınmaz/parsel kimliği,
- ada/parsel ve gösterim hassasiyeti,
- tapu niteliği,
- müstakil/hisseli ve pay,
- yüzölçümü ve sınır geometrisi,
- imar planı durumu,
- kullanım kararı,
- plan numarası, ölçek ve plan notu,
- TAKS/KAKS/emsal, yükseklik ve çekme mesafeleri uygulanıyorsa,
- yapılaşabilir alanın yöntem ve varsayımları,
- yasal yol erişimi ile fiziksel yol erişiminin ayrımı,
- cephe, şekil, eğim, kot ve bakı,
- altyapının parselde/sınırda/yolda olma durumu,
- tarım, koruma veya özel kullanım kısıtları,
- bölgesel tehlike ve iklim göstergeleri,
- ilan emsali, gerçekleşmiş işlem ve profesyonel değerleme ayrımı.

“Yola yakın” yasal yol hakkı değildir. “Elektrik var” altyapının parselde
bağlı olduğu anlamına gelmez. Bu nedenle alanlar boolean yerine kapsamlı durum
taşır.

### 10.2 Diğer kategori paketleri

Ortak sözleşme discriminated union ile genişler:

- **Konut:** oda, net/brüt alan, kat, bina yaşı, ısıtma, aidat, kullanım,
  otopark, bina/ünite ayrımı.
- **Ticari:** kullanım tipi, cephe, tavan, ruhsat, mevcut kiracı, kira/gelir
  ve teslim koşulu.
- **Bina:** bağımsız bölüm sayısı, toplam kullanım, doluluk, teknik durum,
  ruhsat/iskan.
- **Devremülk:** dönem, kullanım hakkı, yıllık gider, sözleşme ve devir
  koşulları.
- **Turistik tesis:** oda/yatak kapasitesi, ruhsat, işletme durumu, doluluk ve
  gelir verisinin kapsamı.

Kategoriye özgü alanlar ortak props listesine doldurulmaz. Her paket kendi tip
güvenli şemasına ve görünürlük kurallarına sahiptir.

## 11. Kanıt ve provenance sözleşmesi

### 11.1 Temel ilke

Her önemli değer şu sorulara cevap vermelidir:

- Değer nedir?
- Kim söyledi veya hangi sistemden geldi?
- Ne zaman geçerliydi ve ne zaman sorgulandı?
- Hangi taşınmaz/coğrafi kapsam için geçerli?
- Doğrudan kayıt mı, belge mi, beyan mı, türev mi, tahmin mi?
- Sınırlaması nedir?
- Başka kaynakla çelişiyor mu?

### 11.2 Önerilen domain tipi

```ts
type EvidenceStatus =
  | "verified"
  | "declared"
  | "derived"
  | "estimated"
  | "unavailable"
  | "conflicting";

type FreshnessStatus = "current" | "aging" | "stale" | "unknown";

type EvidenceSourceClass =
  | "official"
  | "verified_document"
  | "advertiser_declared"
  | "platform_derived"
  | "model_estimate"
  | "unknown";

interface EvidenceValue<T> {
  value?: T;
  status: EvidenceStatus;
  freshness: FreshnessStatus;
  source: {
    id: string;
    name: string;
    sourceClass: EvidenceSourceClass;
    authority?: string;
    url?: string;
  };
  effectiveAt?: string;
  retrievedAt: string;
  validUntil?: string;
  scope: "property" | "parcel" | "building" | "neighborhood" | "district";
  geographicResolution?: string;
  method?: string;
  methodVersion?: string;
  confidence?: number;
  knownLimitations?: string[];
  conflicts?: Array<{
    sourceId: string;
    value: unknown;
    effectiveAt?: string;
  }>;
}
```

Kurallar:

- `confidence` yalnız kalibre edilmiş `derived` veya `estimated` sonuçlarda
  kullanılabilir.
- Narrative AI metnine varsayılan bir yüzde eklenmez.
- `verified`, yalnız gösterilen **spesifik alanın** belirtilen kaynaktan
  doğrulandığı durumda kullanılır.
- Bayatlık köken statüsünden ayrıdır; resmî veri de bayat olabilir.
- `unavailable`, tek bir “veri yok” durumu değildir. UI gerekçeyi ayrıca
  `not_published`, `provider_unavailable`, `not_applicable`,
  `permission_denied`, `out_of_scope` gibi reason code ile taşır.
- Çelişki sessizce çözülmez; iki değer ve iki tarih kullanıcıya açılır.

### 11.3 Görünür kaynak etiketleri

Kısa kullanıcı dili:

- **Resmî kayıttan**
- **Doğrulanmış belgeden**
- **İlan sahibi beyanı**
- **ArsaPazar hesabı**
- **Model tahmini**
- **Senaryo/projeksiyon**
- **Güncel değil**
- **Kaynaklar çelişiyor**
- **Doğrulanamadı**

“Doğrulandı” tek başına kullanılmaz.

### 11.4 Doğrulama vektörü

Tek güven rozeti yerine bağımsız durumlar gösterilir:

1. İlan veren kimliği doğrulandı.
2. Bu taşınmaz için ilan verme/pazarlama yetkisi EİDS ile doğrulandı.
3. Kurumsal ilansa emlak işletmesinin TTBS yetki belgesi geçerli.
4. İlandaki taşınmaz kimliği/parsel ile harita kaydı eşleşti.
5. İmar veya tapu belgesi varsa düzenleyen kurum, belge tarihi ve doğrulama
   yöntemi gösterildi.
6. Platform moderasyonunun kapsamı ve tarihi ayrı belirtildi.
7. AI veya platform türevleri ayrıca etiketlendi.

Bu vektörde bir satırın olumlu olması diğer satırları olumlu yapmaz.

## 12. Türkiye’ye özgü güven kararları

### 12.1 EİDS

EİDS için izin verilen ana metin:

> İlan verme yetkisi EİDS ile doğrulandı.

Detay:

- doğrulanan rol,
- son sorgu tarihi,
- yetki bitiş tarihi varsa,
- resmî kapsam bağlantısı,
- kapsam dışı açıklaması.

Yasak veya yanıltıcı metinler:

- “Tapu EİDS ile doğrulandı”
- “İmar EİDS ile doğrulandı”
- “Tam doğrulanmış ilan”
- “Fiyatı doğrulandı”
- “Sorunsuz taşınmaz”

Yetki süresi dolduğunda olumlu rozet geri çekilir. Son başarılı sorgu,
geçerlilik gibi sunulmaz.

### 12.2 TTBS

TTBS emlak işletmesinin yetki belgesi; EİDS ise ilgili taşınmazı ilan etme
yetkisidir. İki statü ayrı satırda, ayrı kaynakla görünür. TTBS numarası
kopyalanabilir ve resmî sorguya gidebilir; ancak tek başına ilan içeriğini
doğrulamaz.

### 12.3 TKGM, MEGSİS ve belge mahremiyeti

Parsel kimliği veri birleştirmenin ana anahtarıdır. Buna rağmen:

- ilan pini kadastro sınırı gibi çizilmez,
- pin–parsel–fotoğraf–plan uyuşmazlığı görünür bir conflict olur,
- kamusal parsel görünümü ile malik/tapu belgesi aynı veri kabul edilmez,
- malik adı, iletişim ve ham tapu belgesi varsayılan olarak AI modeline veya
  analitik hattına gönderilmez,
- belge gösterilecekse maskeleme, rol yetkisi ve kullanım amacı uygulanır,
- resmî entegrasyon yoksa canlı sorgu varmış gibi demo yapılmaz.

### 12.4 e-Plan ve imar

Plan tek bir boolean değildir:

- öneri/taslak,
- askıda,
- yürürlükte,
- yerine yeni plan gelmiş,
- iptal/uyuşmazlık,
- bilgi alınamadı.

Görünür metaveri:

- plan numarası,
- plan ölçeği,
- kullanım kararı,
- plan notu referansı,
- onay/askı tarihi,
- kaynak ve sorgu tarihi,
- belge veya servis kapsamı.

AI, askıdaki veya öneri durumundaki planı kesin gelecek hak gibi anlatmaz.
Durum ayrımı, [e-Plan Otomasyon Sistemleri](https://cbs.csb.gov.tr/e-plan-otomasyon-sistemleri-102080)
tarafından sunulan askıdaki ve yürürlükteki plan bağlamını korur.

### 12.5 AFAD, MTA ve iklim

AFAD verisi “deprem riski” veya “güvenli parsel” hükmüne çevrilmez.
Doğru başlık:

> Bölgesel deprem tehlike göstergesi

Zorunlu açıklama:

- tehlike ile risk farklıdır,
- risk için maruziyet, kırılganlık ve olası kayıp gerekir,
- yerel zemin/jeoteknik koşullar ayrı inceleme gerektirir,
- harita ölçeği parsel bazında kesin hüküm vermeyebilir.

MTA ve MGM katmanlarında çözünürlük, model, senaryo, baz dönem ve kullanım
sınırlaması görünür olur. Katman bulunmaması “tehlike yok” anlamına gelmez.
Terminoloji için dayanak:
[AFAD’ın tehlike–risk ayrımı](https://www.afad.gov.tr/yeni-deprem-tehlike-haritasi-yayimlandi58).

### 12.6 Değerleme

Otomatik değerleme:

- tek kesin fiyat değil aralık gösterir,
- “ArsaPazar tahmini” olarak etiketlenir,
- “ekspertiz” veya “resmî değerleme” diye sunulmaz,
- veri tarihi, örneklem sayısı ve kapsam taşır,
- benzerlerin neden seçildiğini açıklar,
- ilan fiyatı, gerçekleşmiş işlem ve profesyonel değerleme kaynaklarını
  ayırır,
- heterojen veya seyrek arsa verisinde sonuç üretmekten çekinebilir,
- model sürümü ve yöntem değişimini kaydeder,
- kullanıcıya benzeri çıkarma ve varsayımı düzenleme olanağı verir.

Zillow’ın kendi ürününde bile boş arazi Zestimate kapsamı dışındadır; konut
AVM kalıbı arsa için doğrudan kopyalanmamalıdır:
[Zestimate kapsamı ve sınırlamaları](https://www.zillow.com/zestimate/).

## 13. AI deneyimi

### 13.1 30 saniyelik karar özeti

AI özeti tek paragraf pazarlama metni değildir. Şu anatomiyi taşır:

1. **Neden uygun olabilir?** En fazla üç faktör.
2. **Dikkat edilmesi gerekenler:** En fazla üç somut risk/çelişki.
3. **Bilinmeyenler:** Kararı değiştirecek eksik veriler.
4. **Önerilen sonraki kontroller:** Belge, kaynak veya uzman adımı.
5. **Dayanaklar:** Her iddia için alan ve kaynak bağlantısı.
6. **Tercih temeli:** Kişisel sonuçsa kullanılan bütçe/amaç/vade tercihleri.
7. **Geri bildirim:** Yanlış, ilgisiz, eksik kaynak veya faydalı kategorileri.

Örnek:

> Bütçe sınırınız içinde ve ilan emsallerine göre birim fiyatı daha düşük.
> Ancak yasal yol erişimi doğrulanmadı ve imar planı kaynağı sekiz aydır
> güncellenmedi. Görüşmeden önce yol erişim belgesi ve güncel plan durumunu
> isteyin.

Her cümle ilgili kanıt satırına bağlanır. “%92 güven” gibi çıplak bir sayı
yerine kanıt kapsamı ve eksik alanlar tercih edilir. Yüzde ancak kalibrasyonu,
anlamı ve kullanıcının ne yapacağını açıkladığı durumda gösterilir.

### 13.2 Konuşmalı ilan asistanı

Asistan, sayfadan kopuk genel chatbot değildir. Aynı `ListingDetail` kanıt
defterini sorgular.

Önerilen başlangıç soruları:

- “Bu imar bilgisinin kaynağı ve tarihi ne?”
- “Fiyatı en çok etkileyen üç faktör hangisi?”
- “Benzer ilanlardan hangi yönleriyle ayrılıyor?”
- “Satıcıdan istemem gereken kritik belgeler neler?”
- “Yol erişimi hakkında ne doğrulandı, ne yalnızca beyan?”
- “Bu ilanı kaydettiğim iki ilanla karşılaştır.”

Yanıt anatomisi:

- kısa cevap,
- iddia düzeyi citation,
- eksik/çelişki,
- kullanılan araç veya veri,
- önerilen ama henüz uygulanmayan eylem,
- gerekiyorsa onay ekranı.

Mevcut `GlassChatDock` bu sözleşmenin kabuğu olarak değerlendirilebilir; düz
`text/pending` mesaj modeli citation, structured tool result ve confirmation
taşımadığı için doğrudan yeterli değildir.

### 13.3 Ajan yetki basamakları

| Basamak      | Yapabilecekleri                                              | Onay                                                       |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Gözlemle     | Veri getir, kaynak göster, özetle                            | Ek onay gerekmez                                           |
| Hazırla      | Karşılaştırma, soru listesi, not veya mesaj taslağı üret     | Sonuç taslak olarak görünür                                |
| Öner         | Sıralama, değer aralığı, senaryo, sonraki adım öner          | Dayanak ve tercih görünür                                  |
| Harekete geç | Mesaj gönder, belge paylaş, randevu talep et, kayıt değiştir | Açık işlem özeti ve kullanıcı onayı                        |
| Taahhüt et   | Teklif, ödeme, imza, resmî başvuru                           | Ürün dışında veya sert durak + çok faktörlü/insan kontrolü |

Onay ekranı şu beş bilgiyi gösterir:

1. Ne yapılacak?
2. Kiminle veya hangi sistemle?
3. Hangi veri paylaşılacak?
4. Geri alınabilir mi?
5. Olası sonucu nedir?

Önceden işaretli genel izin veya “AI her şeyi yapsın” seçeneği yoktur.

### 13.4 AI’nın yapmayacağı şeyler

- EİDS sonucundan tapu/imar/fiyat doğruluğu çıkarmak
- Çelişkili kaynağı sessizce bastırmak
- Yetersiz veride yatırım puanı üretmek
- AFAD/MTA verisinden güvenli/güvensiz hükmü vermek
- Hukuki veya profesyonel değerleme görüşü gibi konuşmak
- Kullanıcının hassas veya demografik özelliklerini çıkarsamak
- Korunan özelliklere göre mahalle/kişi yönlendirmesi yapmak
- Kullanıcı onayı olmadan mesaj, randevu, paylaşım, teklif veya ödeme yapmak
- İlan açıklamasındaki talimatları sistem talimatı kabul etmek
- Ham kişisel belgeyi varsayılan olarak modele veya telemetry’ye göndermek

### 13.5 Kanıtlı AI akışı

```text
Resmî/belge/beyan/platform kaynakları
                  │
                  ▼
       Normalize kanıt defteri
          │       │       │
          │       │       └── SSR ilan detayı
          │       └────────── Karşılaştırma / analytics
          └────────────────── AI retrieval
                                   │
Kullanıcı niyeti ──► politika + izin ──► araç çağrıları
                                   │
                                   ▼
                       Kaynaklı taslak yanıt
                                   │
                    dış etkili eylem var mı?
                         │ hayır       │ evet
                         ▼             ▼
                       göster      onay özeti
                                         │
                                         ▼
                                  yürüt + audit
```

## 14. Liquid Glass ve sayfa yüzey bütçesi

### 14.1 Katman kararı

| Katman     | Malzeme                   | Örnek                                                                        |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| İçerik     | `flat`                    | AI özeti, güven listesi, metrikler, tablolar, harita sahnesi, satıcı bilgisi |
| Navigasyon | `glass` olabilir          | Global header, bölüm indeksi                                                 |
| Kontrol    | `glass` olabilir          | Medya kontrolleri, harita katman seçici, eylem grubu, AI launcher            |
| Feedback   | İçeriğe göre flat/overlay | Alert flat; toast ürün overlay sözleşmesiyle                                 |

Harita, grafik, medya, AI özeti, güven paneli ve değerleme “modern görünsün”
diye cam yapılmaz. Cam yalnız kullanıcının gezindiği veya doğrudan eylem
yaptığı yüzeyde işlevsel işaret olarak kullanılır.

### 14.2 Maksimum altı cam yüzey

Cam bütçesi global uygulama kabuğu dahil gerçek render üzerinden sayılır:

| No  | Yüzey                                      | Durum                                                            |
| --- | ------------------------------------------ | ---------------------------------------------------------------- |
| 1   | Global marketplace navigasyonu             | Kalıcı                                                           |
| 2   | Global Dock veya sayfa utility navigasyonu | Kalıcı; ikisi ayrıysa bütçe yeniden düzenlenir                   |
| 3   | Medya kontrol grubu                        | Yalnız medya üzerinde                                            |
| 4   | Sticky bölüm indeksi                       | İçerik kaydırmasında                                             |
| 5   | İletişim/karar eylem grubu                 | Desktop ray veya mobile bottom bar; aynı anda iki kopya görünmez |
| 6   | AI asistan launcher/paneli                 | Koşullu                                                          |

Karşılaştırma barı açıldığında altıncı yüzeyle çakışıyorsa AI launcher kapanır,
Dock yerine geçer veya karşılaştırma barı flat olur. “Görselde altı ayrı
bölge” değil, DOM’da aynı anda render edilen gerçek cam yüzey sayısı test
edilir.

### 14.3 Cam üstüne cam yasağı

Tek bir cam toolbar içinde çocuk kontroller yeniden `GlassSurface` üretmez.
Gerekli altyapı seçenekleri:

- group-context ile child material’ı bastırmak,
- yüzey üretmeyen `ToolbarItem`/plain icon control,
- toolbar yerine yalnız bağımsız cam kontroller kullanmak.

`GlassToolbar` içine varsayılan `GlassIconButton`, `GlassSurface` içine
`GlassButton` yerleştirip nesting oluşturmak kabul edilmez.

### 14.4 Tema ve görsel tokenlar

- Kağıt ve Grafit aynı bilgi hiyerarşisini taşır.
- Tek vurgu `--lg-accent`tir.
- Semantik başarı/uyarı/tehlike tokenları yalnız anlam için kullanılır.
- Component CSS’inde raw hex, rgba, px, gölge veya keyfî radius yoktur.
- Yeni bir layout ölçüsü gerekiyorsa `src/index.css` içinde semantik `--lg-*`
  tokenı tanımlanır; page CSS’inde kaçak sabit oluşturulmaz.
- Radius yalnız chip/media/card/capsule ölçeğinden gelir.
- Başlık ağırlıkları mevcut 600/700 ölçeğini aşmaz.
- Sayısal karşılaştırmalarda `font-variant-numeric: tabular-nums` kullanılır.
- Büyük yüzeylerde tier sistemi refraction’ı kapatabilir; içerik buna bağımlı
  tasarlanmaz.

## 15. Component stratejisi

### 15.1 Doğrudan yeniden kullanılacaklar

| İhtiyaç              | Component                                               | Koşul                                               |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| Breadcrumb           | `GlassBreadcrumb`                                       | Doğru landmark ve isim                              |
| Medya                | `GlassMediaGallery`                                     | Tür, tarih, köken ve AI düzenleme etiketi eklenmeli |
| Özet metrik          | `GlassMetricStrip`                                      | Semantik `dl`; tabular sayı                         |
| Yapılandırılmış alan | `GlassSpecTable`, `GlassFeatureGroup`                   | Her kullanım `material="flat"`                      |
| Harita               | `GlassMap`                                              | Pin/sınır ayrımı, kaynak ve metin/tablo eşdeğeri    |
| AI özeti             | `GlassAiSummaryCard`                                    | Claim-level evidence ile compose edilir             |
| Kanıt                | `GlassAiEvidenceList`                                   | Kaynak türü, tarih ve doğrulama                     |
| Kalibrasyon          | `GlassAiConfidence`                                     | Yalnız gerçekten ölçülmüş değer                     |
| Güven                | `GlassTrustSignalPanel`                                 | EİDS/tapu semantiği düzeltilmeden kullanılmaz       |
| Değerleme            | `GlassValuationCard`, `GlassValuationDrivers`           | Aralık, kapsam, model sürümü ve çekinme             |
| Yoğun veri           | `GlassTable`, `GlassChart`                              | Grafik yanında tablo/metin                          |
| Geçmiş               | `GlassTimeline`                                         | Fiyat/ilan/belge olaylarını ayırır                  |
| Yakın çevre          | `GlassNearbyPlaces`                                     | Rota/kuş uçuşu ve sağlayıcı ayrımı                  |
| Tehlike              | `GlassClimateRiskPanel`                                 | “Risk” yerine kaynaklı gösterge dili ve kapsam notu |
| Satıcı               | `GlassSellerCard`, `GlassAgencyCard`                    | Telefon gizliliği ve focus borcu çözülür            |
| Randevu              | `GlassTourScheduler`                                    | Dış etki öncesi onay ve gerçek servis sınırı        |
| Karşılaştırma        | `GlassCompareBar`, `GlassCompareTable`                  | Cam bütçesi ve mobile davranış                      |
| AI ajan kontrolü     | `GlassAiRiskReview`, `GlassAiAgentActivity`             | Yüksek etkili eylem ve audit                        |
| Durum                | `GlassSkeleton`, `GlassAlert`, `GlassEmptyState`        | Bölüm bazlı state                                   |
| Overlay              | `GlassDrawer`, `GlassSheet`, `GlassModal`, `GlassToast` | Portal/focus/scroll/focus-return sözleşmesi         |

### 15.2 Yeniden kullanmadan önce düzeltilecekler

#### `GlassPriceHeader`

Sorunlar:

- sabit `h2`,
- meta tek string,
- `priceTint` serbest string/raw renk açabilir,
- içerik olmasına rağmen efektif cam varsayılanı,
- eski ağırlık ve mikro-token borçları.

Karar:

- Üretim sayfasında doğrudan kullanılmaz.
- Semantik `h1`, structured meta, para değeri ve flat varsayılanı olan
  `GlassListingDetailHeader` tasarlanır veya başlık feature seviyesinde
  native semantiklerle kurulur.
- Sırf sayfa layout’u için çekirdek component çıkarılmaz; tekrar kullanım
  eşiği doğrulanır.

#### `GlassTrustSignalPanel`

Sorun:

- Örnek/sözleşme dili EİDS ile tapu eşleşmesini aynı sinyalde ima edebilir.

Karar:

- `EİDS ilan yetkisi`,
- `Parsel kaydı eşleşmesi`,
- `İmar belgesi kaynağı`,
- `Platform moderasyonu`,
- `AI içerik kontrolü`

ayrı satır ve ayrı kaynak olur.

#### `GlassSellerCard`

Sorunlar:

- telefon prop olarak DOM’a gelir; görsel maske gizlilik sağlamaz,
- reveal tek yönlü/uncontrolled,
- reveal sonrası odak kaybı olabilir.

Karar:

- numara yetkili reveal anında alınır,
- `revealed + defaultRevealed + onRevealedChange` kontrollü deseni,
- yükleme/hata/rate-limit,
- reveal sonrası telefon linkine odak,
- analytics’e numara değil yalnız event gönderilir.

#### `GlassChatDock`

Sorun:

- mesaj modeli yalnız `text`, `role`, `pending`,
- citation, source preview, tool result, confirmation ve error taşımaz.

Karar:

- mevcut kabuk şişirilmez,
- `GlassAiAnswer` veya `GlassAiChatMessage` gibi yapılandırılmış message
  primitive’i oluşturulur,
- ChatDock bu primitive’i compose eder.

#### `GlassClimateRiskPanel`

Sorun:

- isim ve 1–5 ölçeği bilimsel kapsamdan daha kesin algılanabilir.

Karar:

- arsa bağlamında “tehlike ve çevre göstergeleri” dili,
- kaynak/ölçek/sınırlama,
- uzman yönlendirmesi,
- tek birleşik güvenli/güvensiz sonucu yok.

### 15.3 Gerçek yeni shared component adayları

Yeni component sayısı minimum tutulur:

1. **`GlassListingDetailHeader`**
   - tek ve ayarlanabilir `h1`,
   - structured meta,
   - fiyat ve para semantiği,
   - rozet/utility slotları,
   - varsayılan flat.
2. **`GlassDetailActionBar`**
   - tek prominent CTA,
   - secondary action,
   - kaydet/paylaş/bildir,
   - safe-area,
   - compact/rail varyantı,
   - child nesting üretmeyen tek cam grup.
3. **`GlassDataProvenance`**
   - kaynak sınıfı,
   - effective/retrieved/valid-until,
   - freshness,
   - coğrafi kapsam,
   - yöntem/sürüm,
   - limitation/conflict.
4. **`GlassAiAnswer` / `GlassAiChatMessage`**
   - citation,
   - structured tool result,
   - streaming tamamlanma durumu,
   - suggested action,
   - confirmation handoff,
   - error/refusal/insufficient-evidence.
5. **Yüzey üretmeyen toolbar item altyapısı**
   - glass nesting’i sistemik olarak engeller.

`GlassListingIntegrityBadge` ancak aynı statü özetine en az iki bağımsız ürün
yüzeyinde ihtiyaç kanıtlanırsa eklenir. Aksi halde mevcut badge + provenance
composition yeterlidir.

### 15.4 Feature seviyesinde kalacaklar

Şunlar shared component yapılmaz:

- iki kolonlu ilan sayfası layout’u,
- bölüm wrapper’ı,
- karar rayının sayfa içi sticky sınırı,
- arsa kategori bölüm sırası,
- route loader,
- listing adapter,
- section orchestration.

Bunlar `apps/web/src/features/listing-detail` içinde ürün feature’ıdır.

### 15.5 Yeni shared component sözleşmesi

Her yeni `GlassX`:

```text
src/components/GlassX/
├── GlassX.tsx
├── GlassX.module.css
├── GlassX.stories.tsx
├── GlassX.test.tsx
├── rules.md
└── index.ts
```

Ayrıca:

- `src/index.ts` export’u,
- `src/demo/ComponentCatalog.tsx` kaydı,
- doğru Storybook grubu,
- Default/Playground/variant/size/state/long/responsive/two themes/a11y
  matrisi tamamlanır.

## 16. Uygulama mimarisi

### 16.1 Önerilen dosya sınırları

```text
apps/web/src/routes/ilan.$listingId.tsx

apps/web/src/features/listing-detail/
├── ListingDetailWorkspace.tsx
├── ListingDetailWorkspace.module.css
├── listing-detail-types.ts
├── listing-detail-view-model.ts
├── listing-detail-adapter.ts
├── listing-detail-query.ts
├── listing-detail-fixtures.ts
├── listing-detail-events.ts
├── listing-detail-policy.ts
├── components/
│   ├── ListingIntro.tsx
│   ├── ListingDecisionRail.tsx
│   ├── ListingSectionIndex.tsx
│   ├── ListingEvidenceBrief.tsx
│   ├── ParcelSection.tsx
│   ├── PlanningAndLegalSection.tsx
│   ├── InfrastructureSection.tsx
│   ├── HazardSection.tsx
│   ├── MarketSection.tsx
│   ├── DocumentsSection.tsx
│   └── SellerSection.tsx
└── tests/
```

İsimler uygulama planında repo konvansiyonuna göre kesinleştirilir. Buradaki
amaç veri, policy, presentation ve external adapter sınırlarını ayırmaktır.

### 16.2 Tek domain kaynağı

`ListingSummary`, favori, karşılaştırma, AI danışman ve ilan detayı birbirinden
bağımsız fixture gerçekleri üretmemelidir.

Önerilen ilişki:

```text
ListingEntity
  ├── ListingSummaryProjection
  ├── ListingDetailProjection
  ├── ComparisonProjection
  └── AiEvidenceProjection
```

Fiyat, doğrulama ve parsel kimliği tek kaynaktan projekte edilir. Böylece aynı
ilan listede “EİDS doğrulandı”, detayda “beklemede” görünmez.

### 16.3 Kategoriye göre tip güvenliği

```ts
type ListingDetail =
  | LandListingDetail
  | ResidentialListingDetail
  | CommercialListingDetail
  | BuildingListingDetail
  | TimeshareListingDetail
  | TouristicListingDetail;
```

Ortak alanlar `ListingDetailBase`te, dikey alanları kendi paketi içinde olur.
UI `kind` üzerinden doğru bölüm kompozisyonunu seçer. Bilinmeyen kategori
alanları sessizce yok edilmez; adapter telemetry’sine düşer.

### 16.4 External provider sınırı

Her sağlayıcı adapter arkasındadır:

- EİDS/TTBS
- parsel/harita
- e-Plan/belediye
- coğrafi/tehlike/iklim
- rota/POI
- emsal/değerleme
- AI
- iletişim/randevu

Adapter:

- timeout,
- retry politikası,
- permission,
- source metadata,
- provider error code,
- cache/TTL,
- stale fallback,
- deterministik fixture

taşır. Üretim component’i doğrudan üçüncü taraf cevabını çizmez.

### 16.5 SSR ve progressive enhancement

- Başlık, fiyat, temel gerçekler, görünür kaynak statüleri ve satıcı rolü SSR
  ile gelir.
- AI özeti, interaktif harita ve ağır piyasa analizi progressive enhancement
  olarak yüklenir.
- AI cevabı canonical sayfanın varlığı veya SEO için zorunlu değildir.
- Client hydration öncesinde ana CTA yanlış veya çalışıyormuş gibi görünmez.
- Route loader ve client query aynı normalized schema’yı kullanır.

### 16.6 Bölüm bazlı hata izolasyonu

Tek bir provider hatası tüm ilanı kapatmaz:

```text
route shell
  ├── core listing boundary
  ├── map boundary
  ├── planning boundary
  ├── market boundary
  └── AI boundary
```

Çekirdek ilan verisi yoksa route error; ikincil provider yoksa yalnız o bölüm
partial state gösterir.

### 16.7 Determinizm

- Fixture’da `Math.random()` veya zamana göre kendiliğinden değişen sonuç yok.
- Her state explicit scenario parametresidir.
- AI demo yanıtı kaynak ve model sürümüyle sabittir.
- EİDS demo sonucu gerçek servis gibi etiketlenmez.
- Testte saat ve network kontrollüdür.
- Eylem mutasyonlarında idempotency key kullanılır.

## 17. Durum modeli

| Durum                   | Görünüm                                      | Eylem                                  |
| ----------------------- | -------------------------------------------- | -------------------------------------- |
| Initial loading         | Geometriyi koruyan skeleton, `aria-busy`     | Çekirdek CTA disabled veya yok         |
| Background refresh      | Son bilinen veri görünür, kesin sorgu tarihi | Sessiz yenileme; içerik kaybolmaz      |
| Stale                   | Alan yanında “güncel değil” ve tarih         | Yenile veya resmî kaynağa git          |
| Partial                 | Eksik bölüm kendi açıklamasını gösterir      | Bölüm bazlı tekrar dene                |
| Provider unavailable    | Son veri varsa stale; yoksa nedeni           | Alternatif resmî bağlantı              |
| Permission denied       | Hassas veri gizli, neden açıklanır           | Yetki/oturum adımı                     |
| Empty—not published     | Sağlayıcının yayımlamadığı açık              | Uygunsa belge iste                     |
| Not applicable          | Alan kategori için uygulanamaz               | Eylem yok                              |
| Conflict                | İki değer, iki kaynak, iki tarih             | Hata bildir / belge iste               |
| Exact location withheld | Yaklaşık alan ve hassasiyet                  | İzinli iletişim sonrası talep          |
| Valuation insufficient  | Fiyat tahmini yok                            | Benzerleri ve eksik veriyi göster      |
| AI unavailable          | Yapılandırılmış içerik aynı kalır            | Sonra tekrar dene                      |
| Map unavailable         | Konum/parsel metin ve tablo olarak görünür   | Resmî harita bağlantısı                |
| Contact requires auth   | CTA amacı korunur                            | Giriş sonrası aynı ilana dön           |
| Verification expired    | Olumlu rozet kaldırılır                      | Yeniden doğrulama bekleniyor           |
| Listing inactive        | Banner; iletişim/randevu kapalı              | Benzerleri göster                      |
| Sold/withdrawn          | Son görülen durum ve tarih                   | Kaydetme/karşılaştırma politikaya göre |
| Removed/moderated       | Hassas detay gösterilmez                     | Genel sebep ve itiraz/destek           |
| Offline                 | Cached çekirdek, stale uyarısı               | Online olunca yenile                   |

### 17.1 İlan yaşam döngüsü

- **Aktif:** tüm uygun eylemler.
- **Süresi dolmuş:** iletişim kapalı; yetki ve veri tarihi görünür.
- **Satıldı/kiralandı:** arşiv politikası uygunsa fiyat/geçmiş korunur,
  yeni iletişim yok.
- **Geri çekildi:** sebep yalnız açıklanabilir düzeyde; benzerler.
- **Moderasyonla kaldırıldı:** yanıltıcı detayı tekrar yayımlamadan güvenli
  açıklama.
- **Bulunamadı:** gerçek 404.
- **Kalıcı olarak kaldırıldı:** politika uygunsa 410.

Aktif olmayan ilan sessizce arama sayfasına redirect edilmez.

## 18. Responsive davranış

### 18.1 Desktop

- Ortalanmış 12 kolon.
- Intro: 8 kolon medya, 4 kolon karar özeti.
- Gövde: 8 kolon kanıt akışı, 4 kolon karar/iletişim rayı.
- Ray viewport altında kesilmez; satıcı bölümüne gelince sticky olmayı bırakır.
- Ana içerik bölümleri açık ve kaydırılabilirdir.

### 18.2 Orta genişlik

- Container kapasitesine göre intro stack veya dengeli split olur.
- Medya gerektiğinde tam genişliğe çıkar.
- Karar rayı normal akışa döner.
- Tablo ve harita tam genişlik alır.
- Eylem grubu sayfanın üst veya alt kontrol katmanına taşınır; aynı eylemin iki
  görünür kopyası oluşmaz.

### 18.3 Mobile

- Tek kolon ve aynı mantıksal DOM sırası.
- H1 → medya → fiyat/karar → kaynak durumu → section index → içerik.
- Bottom action bar safe-area kullanır.
- Kaydet/karşılaştır/paylaş/bildir secondary menüye taşınır.
- Kritik veri accordion arkasına saklanmaz.
- Uzun tablo erişilebilir yatay scroll veya alan için uygun definition list
  kullanır; aynı bilgi anlamsız kartlara parçalanmaz.
- Harita için eşdeğer metin/list view bulunur.

### 18.4 Responsive uygulama kuralı

- `mobile`, `tablet`, `desktop` prop’u yoktur.
- Container query, doğal akış, `pointer: coarse` ve `hover: hover` kullanılır.
- Viewport breakpoint ancak tasarım sistemi tarafından açıkça tanımlanmış
  altyapı istisnasıysa belgelenir.
- Hover bilgi için tek erişim yolu değildir.

## 19. Erişilebilirlik

Hedef [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA ve proje standardıdır.

### 19.1 Semantik

- Tek görünür `h1`.
- H2 bölümler, H3 alt gruplar.
- İsimlendirilmiş `nav`, `main`, `aside` ve section landmarkları.
- Breadcrumb native liste/nav semantiği.
- Etiket/değerler `dl`; gerçek kıyaslar `table`.
- Durum yalnız renk veya ikonla anlatılmaz.
- İkon-tek butonda `label` zorunlu.

### 19.2 Klavye ve odak

- Tüm kontroller mantıksal DOM sırasındadır.
- Focus yalnız `:focus-visible` ile `2px solid var(--lg-accent)`.
- Sticky header/action bar odaklanan öğeyi örtmez.
- Anchor navigation hedefi sticky yüzeyin altında kaybolmaz.
- Drawer/modal/sheet portal, focus trap, scroll lock ve kapanışta tetikleyiciye
  focus dönüşü taşır.
- Non-modal AI dock açılış/kapanış odağını çalmaz; programatik açılma ile
  kullanıcı açılması ayrılır.

### 19.3 Harita, grafik ve medya

- Haritadaki her önemli sonuç metin/tablo olarak da erişilebilir.
- Renkli katman tek bilgi taşıyıcısı değildir.
- Katman kontrolleri klavye ile çalışır.
- Grafik yanında veri tablosu veya kısa veri özeti vardır.
- Görsel alt metni fotoğrafta görünen somut içeriği anlatır; ilan başlığını
  tekrar etmez.
- Video caption/transcript ihtiyacı değerlendirilir.
- AI ile üretilmiş veya anlamlı biçimde düzenlenmiş medya görünür etiketlidir.

### 19.4 Motion ve canlı bölgeler

- Motion yalnız transform/opacity/filter.
- `prefers-reduced-motion` tüm spring/lift/typing animasyonlarını kapatır.
- `prefers-reduced-transparency` camı okunaklı opak yüzeye düşürür.
- AI streaming her tokenı canlı bölgeye okumaz; tamamlanan anlamlı mesaj
  duyurulur.
- Loading ve background refresh birbirinden ayrılır; `aria-busy` yalnız
  gerçek bölgeye uygulanır.

### 19.5 Dokunmatik ve reflow

- Coarse pointer’da tüm hedefler proje standardı en az 44.
- Yakın küçük ikon hedefleri birbirine çarpmaz.
- Zoom/reflow’da iki kolon tek kolona düşer, yatay sayfa scroll’u oluşmaz.
- Bottom bar sanal klavye ve safe-area ile test edilir.

## 20. Performans ve güvenilirlik

### 20.1 Yükleme sırası

1. SSR çekirdek gerçekler ve meta
2. LCP ana medya
3. Karar rayı ve kaynak statüleri
4. Aşağıdaki temel bölümler
5. Harita/karşılaştırma
6. AI özeti
7. AI sohbeti yalnız görünürlük veya kullanıcı niyetiyle

### 20.2 Medya

- Ana görsel doğru boyut ve `srcset/sizes`.
- Boyut/aspect ratio önceden ayrılır; CLS üretilmez.
- İkincil görseller lazy.
- Video/360/drone poster ile ve niyet sonrası yüklenir.
- Harita SDK’sı ana görseli bloklamaz.
- Hatalı medya item bazında fallback olur; tüm galeri kapanmaz.

### 20.3 Harita ve üçüncü taraflar

- Client-only ağır katmanlar route hydration’ını bloklamaz.
- Katmanlar ihtiyaç halinde yüklenir.
- Provider timeout ve circuit breaker bulunur.
- Son bilinen veri cache’den gelebilir ama kesin tarih gösterilir.
- Üçüncü taraf cookie/consent gereksinimi çözülmeden görünmez takip başlatılmaz.

### 20.4 AI

- AI sayfa LCP’sinin parçası değildir.
- Kanıt retrieve edilirken boş “düşünüyor” ekranı yerine yapılandırılmış sayfa
  kullanılabilir kalır.
- Model timeout’unda kaynaklı temel gerçekler ve manuel sorular görünür.
- Cevap cache’i listing/data/model version ile anahtarlanır.
- Stale AI özeti yeni kanıtla “güncel” gösterilmez.

### 20.5 Teknik SLO ve gözlem

P75 Core Web Vitals, bölüm/provider hata oranı, timeout, cache hit, hydration
error ve recovery ölçülür. Performans bütçeleri uygulama planında mevcut ürün
baseline’ına göre sayısallaştırılır; rapor içinden rastgele bundle limiti
uydurulmaz.

## 21. SEO ve paylaşılabilirlik

- Kanonik, benzersiz rota `/ilan/$listingId`.
- SSR tek `h1`, doğru title/description/canonical.
- Open Graph/Twitter medyası gerçek ana görsel ve görünür ilan gerçeğiyle
  uyumlu.
- JSON-LD için uygun olduğunda `RealEstateListing`, `Offer` ve `Place`
  kullanılabilir.
- Structured data yalnız sayfada görünür, doğru ve güncel bilgilerden
  üretilir.
- AI özeti veya tahmini resmî property fact gibi JSON-LD’ye yazılmaz.
- `datePosted`, `dateModified`, fiyat ve availability lifecycle ile senkron
  kalır.
- Schema.org `RealEstateListing` alanı gelişmektedir; Google rich result
  garantisi yoktur. SEO iş değeri buna bağımlı planlanmaz.
- Aktif olmayan ilanların index/noindex/404/410 politikası lifecycle ve hukuk
  kararıyla belirlenir.
- Tam konum paylaşımda gizliyse OG veya structured data üzerinden sızdırılmaz.

## 22. Mahremiyet, güvenlik ve adalet

### 22.1 KVKK by design

- Tasarım temeli, KVKK’nın
  [üretken AI rehberi](https://www.kvkk.gov.tr/Icerik/8547/uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi-15-soruda)
  ile kişisel veri işlemede hukuka uygunluk, amaçla sınırlılık, ölçülülük,
  şeffaflık ve güvenlik ilkeleridir.
- Amaç, hukuki sebep, saklama, erişim ve yurt dışı aktarım değerlendirmesi
  feature başlamadan tanımlanır.
- İstemler ve belgeler model eğitimi için varsayılan olarak kullanılmaz.
- Malik adı, telefon, belge görüntüsü, tam koordinat ve ham ada/parsel genel
  analytics hattına girmez.
- Ham belge AI’ya gönderilmeden önce maskeleme ve minimizasyon uygulanır.
- Oturumluk özel mod ve AI kişiselleştirmesini kapatma seçeneği bulunur.
- Kullanıcı bağlamı görülebilir, düzeltilebilir, sıfırlanabilir ve politika
  kapsamına göre silinebilir.
- Hassas veri için rol tabanlı erişim ve audit vardır.

### 22.2 Prompt injection ve ajan güvenliği

İlan açıklaması, belge OCR’ı, harici web içeriği ve mesajlar **güvenilmeyen
veridir; talimat değildir**.

Zorunlu koruyucular:

- izinli araç listesi,
- read/write araç ayrımı,
- en az yetki,
- görev süreli kimlik bilgisi,
- secret izolasyonu,
- URL/domain allowlist,
- tool input/output schema validation,
- kullanıcı ve tenant sınırı,
- dış işlem öncesi explicit confirmation,
- rate limit ve idempotency,
- prompt injection red-team,
- tool ve model audit log,
- hızlı rollback/decommission.

Yönetişim ve üretim sonrası izleme çerçevesi için
[NIST AI RMF](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10)
referans alınır; bu kaynak Türkiye’de bağlayıcı mevzuat olarak sunulmaz.

### 22.3 Ayrımcılık ve steering

- Korunan özellikler veya proxy’leri kişisel “mahalle uygunluğu” ve ilan
  sıralama hedefi olmaz.
- “Şu gruba uygun bölge” gibi ayrımcı talepler reddedilir.
- Kullanıcının işlevsel tercihleri kullanılabilir: bütçe, süre, ulaşım süresi,
  kullanım amacı, erişilebilirlik ihtiyacı.
- Yalnız model çıktısı değil; gerçek gösterim, sıralama, lead ve moderasyon
  sonuçları adalet açısından izlenir.
- Otomatik ilan bastırma, sahtecilik işareti veya hesap kısıtında gerekçe,
  insan incelemesi ve itiraz kanalı vardır.

### 22.4 Medya kökeni

- Orijinal yükleme hash’i ve düzenleme geçmişi tutulur.
- AI ile üretilmiş veya maddi biçimde düzenlenmiş medya etiketlenir.
- C2PA/Content Credentials varsa köken kanıtı olarak gösterilebilir.
- Credential bulunması “görüntü gerçektir”, bulunmaması “sahtedir” anlamına
  getirilmez.
- Geokonum, parsel, tekrar görsel ve zaman tutarlılığı ayrı kontrollerdir.

## 23. Analytics ve başarı ölçümü

### 23.1 Kuzey yıldızı

```text
Kanıtla desteklenmiş nitelikli niyet oranı =
en az bir kanıt bölümünü görüp nitelikli eylem tamamlayan
uygun benzersiz ilan detay oturumları
/
bot, ilan sahibi ve iletişime kapalı ilanlar hariç
uygun benzersiz ilan detay oturumları
```

Nitelikli eylem:

- gönderilmiş mesaj,
- belge talebi,
- randevu talebi/onayı,
- karşılaştırma sonrası iletişim,
- gerçekten tamamlanmış paylaşım,
- kaydetme + değişiklik alarmı gibi açık kullanıcı niyeti.

Ham CTA tıklaması, page dwell veya AI mesaj sayısı tek başına başarı değildir.

### 23.2 Olay sözlüğü

| Event                      | Tetikleyici                | PII olmayan temel alanlar                    |
| -------------------------- | -------------------------- | -------------------------------------------- |
| `listing_detail_viewed`    | Geçerli oturum             | listing, category, referrer, page version    |
| `decision_snapshot_viewed` | Karar özeti görünür        | verification vector, freshness, completeness |
| `evidence_section_viewed`  | Bölüm anlamlı görünür      | section, coverage, source classes            |
| `field_source_opened`      | Kaynak/yöntem açılır       | field, source class, freshness               |
| `data_conflict_viewed`     | Conflict görünür           | field, source count, resolution state        |
| `map_layer_changed`        | Katman değişir             | layer, resolution, load state                |
| `listing_saved`            | Kayıt tamamlanır           | alert enabled, origin                        |
| `listing_compared`         | Karşılaştırmaya eklenir    | set size, origin section                     |
| `listing_shared`           | Paylaşım tamamlanır        | channel class, redaction mode                |
| `contact_started`          | Form başlar                | entry point, seller type                     |
| `contact_sent`             | Mesaj gerçekten gönderilir | entry point; mesaj içeriği yok               |
| `document_requested`       | Talep gönderilir           | document type, status                        |
| `appointment_requested`    | Talep gönderilir           | entry point                                  |
| `appointment_confirmed`    | Karşı taraf onaylar        | time bucket                                  |
| `ai_explanation_opened`    | Dayanaklar açılır          | model version, factors, missing factors      |
| `ai_feedback_submitted`    | Feedback gönderilir        | category; serbest metin ayrı korunur         |
| `ai_action_confirmed`      | Dış eylem onaylanır        | action type, risk tier                       |
| `data_issue_reported`      | Hata bildirilir            | field, issue category, source class          |
| `section_load_failed`      | Provider/module hata       | section, provider, code, latency bucket      |
| `section_load_recovered`   | Recovery                   | section, provider                            |

`viewport_mode` yerine responsive davranışın analizi için gerçek container
bucket ve `input_modality` tutulabilir; bu veri UI prop’una dönüşmez.

### 23.3 KPI katmanları

**Güven ve veri kalitesi**

- resmî kaynak kapsama oranı,
- freshness SLO,
- conflict oranı,
- bozuk source link,
- süresi geçmiş EİDS yetkisinin görünme oranı,
- yanlış parsel eşleşmesi,
- yinelenen kanonik parsel.

**Karar başarısı**

- kullanıcı görevi tamamlama,
- “imar nedir?”, “yasal erişim var mı?”, “fiyat neye dayanıyor?” sorularını
  doğru cevaplama oranı,
- informed action’a kadar geçen süre,
- compare → contact dönüşümü.

**Satıcı kalitesi**

- ilk yanıt süresi,
- randevu onay oranı,
- belge talebi karşılama,
- yanıtsız talep,
- iletişim sonrası block/report.

**AI kalitesi**

- citation coverage,
- desteklenmeyen iddia,
- doğru abstention,
- conflict’i koruma,
- AI feedback,
- kullanıcı override,
- insan onayı olmadan dış işlem: hedef sıfır.

**Teknik ve erişilebilirlik**

- LCP/INP/CLS,
- section/provider error,
- recovery,
- keyboard task completion,
- focus obscured,
- assistive technology görev başarısı.

### 23.4 Deney ilkeleri

Deneylenebilir:

- karar özeti sırası,
- EİDS kapsam metninin anlaşılırlığı,
- sticky CTA yoğunluğu,
- source chip biçimi,
- AI özetinin uzunluğu,
- emsal tablo/grafik varsayılanı.

Deneylenemez:

- zorunlu güven açıklamasını gizlemek,
- kaynakları kaldırmak,
- risk/tehlike sınırlamasını azaltmak,
- consent’i önceden işaretlemek,
- kritik red flag’i accordion arkasına taşımak,
- yanlış anlaşılmayı artırarak CTR kazanmak.

Her deneyde şikâyet, yanlış anlama, veri hatası, performans, accessibility ve
privacy guardrail’i bulunur.

## 24. Aşamalı teslim planı

### Faz 0 — Doğruluk ve domain temeli

Amaç: yanlış güven semantiğini kaldırmak ve tek gerçek modelini kurmak.

- Repo genelinde EİDS metin envanteri ve düzeltme
- `/ilan/$listingId` route sözleşmesi
- kanonik listing/parsel entity
- `EvidenceValue` ve source/freshness/conflict modeli
- kategori discriminated union
- adapter ve deterministik fixture
- lifecycle ve error policy
- analytics privacy sözleşmesi
- AI design/governance sözleşmesini ortak dokümana çıkarma

**Çıkış kapısı:** Aynı ilan liste, favori, compare ve detayda aynı fiyat,
parsel ve doğrulama durumunu gösterir.

### Faz 1 — Arsa ilan detay çekirdeği

- Semantik başlık
- Medya sahnesi
- Karar rayı
- Fiyat/metrik
- EİDS/TTBS kapsamlı doğrulama vektörü
- Parsel/konum
- İmar ve hukuk
- Altyapı/erişim
- Belgeler
- Satıcı/ofis
- Mesaj/randevu
- Desktop/tablet/mobile düzen
- loading/partial/conflict/inactive state

**Çıkış kapısı:** AI ve harita provider’ı kapalıyken bile kullanıcı çekirdek
karar sorularını cevaplayabilir.

### Faz 2 — Piyasa, harita ve tehlike

- Katmanlı harita ve metin eşdeğeri
- Fiyat geçmişi
- Kaynak türüne göre emsal
- Değer aralığı ve abstention
- Arazi/topografya
- Bölgesel tehlike/iklim
- Source/method drawer
- Compare entegrasyonu

**Çıkış kapısı:** Her türetilmiş metrik kaynak, dönem, örneklem ve sınırlama
taşır.

### Faz 3 — Kanıtlı AI ve izinli ajan

- 30 saniyelik evidence brief
- Claim-level citation
- Structured AI chat message
- Preference basis/edit/reset
- Compare soru akışı
- Belge/satıcı soru taslağı
- Action permission tiers
- Confirmation ve audit
- AI unavailable/refusal/insufficient-evidence states
- Offline evaluation ve red-team

**Çıkış kapısı:** Kaynaksız resmî iddia testi geçmez; dış etkili işlem açık
onaysız yürütülemez.

### Faz 4 — Kategori paketleri ve enterprise operasyon

- Konut/ticari/bina/devremülk/turistik paketler
- Değişiklik nöbetçisi
- Uzman devri için kanıt paketi
- Satıcı ve moderasyon operasyon görünümü
- Model/data drift ve rollback paneli
- Kategori bazlı quality SLO

**Çıkış kapısı:** Yeni kategori ortak modele optional alan yığmadan eklenebilir.

## 25. Test ve Storybook matrisi

### 25.1 Sayfa senaryoları

- Default arsa
- Kurumsal satıcı + geçerli EİDS/TTBS
- Bireysel satıcı
- Hisseli tapu
- Yaklaşık konum
- Yasal erişim bilinmiyor
- İmar kaynağı stale
- İki kaynak çelişiyor
- Parsel ve pin uyuşmuyor
- Belge eksik
- Değerleme için yetersiz veri
- AI unavailable
- Harita unavailable
- Provider partial failure
- EİDS expired
- Listing inactive/sold/withdrawn/removed
- Çok uzun Türkçe başlık ve değerler
- Çok az medya
- AI düzenlenmiş medya
- Kağıt ve Grafit
- Reduced motion
- Reduced transparency
- Keyboard only
- Screen reader landmarks
- Coarse pointer
- Zoom/reflow
- Sanal klavye + bottom bar
- Slow network ve offline cached

### 25.2 Unit/contract

- adapter source mapping,
- money/area/unit formatting,
- source/freshness derivation,
- EİDS kapsam metni,
- TTBS/EİDS ayrımı,
- conflict preservation,
- category exhaustiveness,
- lifecycle policy,
- AI output schema,
- citation target existence,
- permission tier,
- PII redaction,
- analytics payload allowlist,
- deterministic fixture.

### 25.3 Integration

- search card → detail route,
- SSR → hydration aynı veri,
- save/compare state,
- auth → contact → detail’e dönüş,
- phone reveal gerçek privacy,
- appointment confirmation,
- source drawer focus return,
- provider partial recovery,
- stale background refresh,
- AI action confirmation/audit,
- inactive listing CTA kapatma.

### 25.4 Accessibility

- tek `h1`,
- heading order,
- landmark name,
- tab/focus order,
- sticky focus visibility,
- icon label,
- map alternative,
- chart table,
- live region discipline,
- dialog focus trap/return,
- non-modal dock focus,
- coarse target,
- contrast both themes,
- reduced preferences.

### 25.5 Visual ve tasarım sistemi

- cam yüzey sayısı `≤ 6`,
- glass-on-glass yok,
- tüm content `flat`,
- raw CSS değeri yok,
- yalnız izinli radius,
- Kağıt/Grafit parity,
- uzun metinde layout,
- media aspect ratio,
- rail sticky sınırı,
- safe-area,
- no overlapping floating actions.

## 26. Uygulama kabul kriterleri

### Ürün

- [ ] Üretim `/ilan/$listingId` rotası vardır.
- [ ] Arama sonuçlarından rota çalışır.
- [ ] İlk görünüm fiyat, alan, birim fiyat, konum, yetki kapsamı, güncellik ve
      ana eylemi açıklar.
- [ ] Tek “doğrulanmış ilan” rozeti yoktur.
- [ ] EİDS yalnız kimlik/ilan yetkisi kapsamında anlatılır.
- [ ] TTBS, parsel, imar, belge, moderasyon ve AI ayrı kaynaklardır.
- [ ] Kritik eksik ve conflict görünürdür.
- [ ] Ana bölümler sayfa-level tabs/accordion arkasında değildir.
- [ ] İnaktif ilan iletişime izin vermez ve sessiz redirect yapmaz.

### Veri

- [ ] Her kritik alan source, effective/retrieved time, scope ve status taşır.
- [ ] Bayatlık görünür ve alan bazındadır.
- [ ] `unavailable` nedeni ayrıdır.
- [ ] İlan, işlem ve profesyonel değerleme kaynakları karışmaz.
- [ ] Parsel pini kadastro sınırı gibi gösterilmez.
- [ ] Yol yakınlığı yasal erişim sayılmaz.
- [ ] AFAD/MTA/MGM çıktıları ölçek ve sınırlama taşır.
- [ ] Yetersiz değerleme verisinde sonuç üretilmez.

### AI

- [ ] Her önemli AI iddiası geçerli kanıta bağlanır.
- [ ] Kaynaksız resmî iddia yerine abstention vardır.
- [ ] Çelişkiler korunur.
- [ ] Kullanılan kişisel kriterler görülebilir ve düzenlenebilir.
- [ ] Narrative AI için uydurma confidence yüzdesi yoktur.
- [ ] AI etiketi görünürdür.
- [ ] Model/data version audit kaydı vardır.
- [ ] Mesaj/randevu/paylaşım açık onay gerektirir.
- [ ] Teklif/ödeme/imza otomatik yapılmaz.
- [ ] Prompt injection ve tool permission testleri vardır.

### Tasarım sistemi

- [ ] İçerik düz, cam yalnız navigasyon/kontrol.
- [ ] Gerçek eşzamanlı cam sayısı en fazla altıdır.
- [ ] Glass-on-glass yoktur.
- [ ] Component CSS yalnız `--lg-*` tüketir.
- [ ] Keyfî radius/renk/gölge/ölçü yoktur.
- [ ] Stateful API controlled/uncontrolled sözleşmesini izler.
- [ ] Cihaz veya interaction state prop’u yoktur.
- [ ] Motion yalnız transform/opacity/filter ve reduced-motion uyumludur.

### Erişilebilirlik ve kalite

- [ ] Tek görünür `h1` ve doğru heading sırası.
- [ ] İkon-tek kontrollerin label’ı vardır.
- [ ] Durum yalnız renkle aktarılmaz.
- [ ] Coarse pointer hedefi en az 44.
- [ ] Harita ve grafik eşdeğer metin/tablo taşır.
- [ ] Sticky kontroller odağı örtmez.
- [ ] Overlay focus/scroll/return sözleşmesi geçer.
- [ ] Loading, partial, stale, conflict, permission, AI unavailable ve
      inactive senaryoları testlidir.
- [ ] Kağıt/Grafit, uzun Türkçe içerik ve reduced preferences Storybook’ta
      doğrulanır.

## 27. Risk kaydı

| Risk                                  | Etki                          | Koruyucu                                       | Sahip            |
| ------------------------------------- | ----------------------------- | ---------------------------------------------- | ---------------- |
| EİDS kapsamının şişirilmesi           | Yanlış güven/hukuki risk      | Ayrı vektör, kapsam metni, expiry              | Product + Legal  |
| Yanlış parsel eşleşmesi               | Yanlış taşınmaz kararı        | Kanonik ID/geometri conflict                   | Data             |
| Bayat plan/veri                       | Yanlış kullanım beklentisi    | Field TTL, tarih, fail-closed kritik badge     | Data + Product   |
| AVM aşırı güveni                      | Finansal zarar                | Aralık, örneklem, abstention, backtest         | Data Science     |
| Model kendi fiyat önerisiyle beslenir | Fiyat manipülasyonu           | İlan/işlem ayrımı, training lineage            | Data Science     |
| Tehlike → risk hükmü                  | Yanlış güvenlik algısı        | Terminoloji, ölçek, uzman eskalasyonu          | Product + Domain |
| Prompt injection                      | Veri sızıntısı/yetkisiz işlem | Trust boundary, allowlist, least privilege     | Security         |
| Onaysız dış eylem                     | Kullanıcı zararı              | Permission tier, step-up confirm, audit        | AI Platform      |
| PII/belge sızıntısı                   | KVKK ve güven kaybı           | Minimizasyon, maskeleme, RBAC, retention       | Privacy          |
| Ayrımcı steering                      | Hak ihlali                    | Feature policy, outcome audit, appeal          | Trust & Safety   |
| Sahte/AI medya                        | Yanıltma                      | Köken, label, geometry/duplicate, human review | Moderation       |
| Provider kesintisi                    | Sayfa kullanılamaz            | Section isolation, cache, fallback             | Platform         |
| Cam bütçesi/nesting drift             | Tasarım sistemi ihlali        | Story/test/manual budget                       | Design System    |
| Sticky UI odak örter                  | A11y başarısızlığı            | Focus-not-obscured test, safe-area             | Frontend         |
| Model/data drift                      | Sessiz kalite düşüşü          | Version, monitoring, rollback, decommission    | AI/Data          |

## 28. Anti-pattern listesi

- EİDS’yi tapu, imar, fiyat veya belge doğrulaması gibi sunmak
- “Tam doğrulanmış ilan”
- Tek güven/yatırım/risk puanı
- İlan beyanı, resmî kayıt ve model tahminini etiketsiz birleştirmek
- AFAD tehlike verisinden parsel güvenliği hükmü üretmek
- Yol yakınlığını yasal yol hakkı saymak
- Pin’i kadastro sınırı gibi çizmek
- Konut fiyat endeksini arsa endeksi gibi kullanmak
- İlan emsaliyle gerçekleşmiş işlemi karıştırmak
- Örneklem ve yöntem olmadan ROI/medyan
- Bayatlığı yalnız global banner’da göstermek
- “Yakın zamanda güncellendi” gibi belirsiz zaman
- Kaynaksız AI özeti
- Conflict’i sessizce çözmek
- Yetersiz veride skor üretmek
- Ücretli öne çıkarmayı güven rozeti gibi göstermek
- Her içeriği cam veya kart yapmak
- İç içe accordion
- Kritik red flag’i gizlemek
- Tek provider hatasında tüm sayfayı kapatmak
- Birden fazla floating CTA
- Hover-only bilgi
- Renk-only durum
- Satıcı puanında örneklem/tarih göstermemek
- Aynı parsel için kanonik ilişki kurmamak
- Telefonu DOM’a önceden koyup “gizli” saymak
- AI’nın ilan/belge içeriğini talimat kabul etmesi
- Genel “AI her şeyi yapsın” izni

## 29. Kesinleşen kararlar

1. Ürün kalıbı kanıt-öncelikli hibrittir.
2. İlk dikey arsa/arazidir; mimari kategoriye uyarlanabilir.
3. Yapılandırılmış facts AI’dan önce gelir.
4. AI özeti ilk derin içerik bölümüdür; hero yerine geçmez.
5. Ana bölümler anchor navigation ile erişilir; page tabs kullanılmaz.
6. Desktop intro 8/4, gövde kanıt + karar rayı düzenidir.
7. Mobilde tek action group ve safe-area vardır.
8. İçerik flat; gerçek cam bütçesi global shell dahil en fazla altıdır.
9. Tek generic “verified” statüsü yoktur.
10. EİDS yalnız ilan yetkisi kapsamındadır.
11. Provenance field-leveldir.
12. Değerleme aralık ve abstention taşır.
13. Tehlike, risk ve senaryo ayrı kavramlardır.
14. AI citation zorunludur.
15. Dış etkili ajan eylemi açık onay gerektirir.
16. AI arızası sayfayı kullanılmaz yapmaz.
17. Yeni shared component sayısı minimumdur.
18. Üretim route ve domain modeli Storybook prototipinden ayrı kurulur.

## 30. Uygulama planından önce dış bağımlılıklar

Bu rapor ürün kararlarını verir; aşağıdakiler ilgili ekiplerle
kesinleştirilmelidir:

- Gerçek EİDS/TTBS entegrasyon erişimi ve veri alanları
- TKGM/e-Plan/TUCBS verisinin erişim, lisans ve kullanım koşulları
- Belediye verisi kapsam farkları
- Parsel/tapu belgesi görüntüleme ve maskeleme politikası
- Konum hassasiyeti ve satıcı onayı
- Emsal/işlem/değerleme veri hakkı
- Harita/rota sağlayıcısı
- AI sağlayıcısı, veri bölgesi ve retention
- KVKK/yurt dışı aktarım değerlendirmesi
- İnaktif ilan arşiv ve SEO politikası
- Mesaj/randevu gerçek backend sözleşmesi
- Moderasyon, itiraz ve insan incelemesi operasyonu
- Performans baseline ve SLO

Bu bağımlılıklar çözülmemişken UI sahte bir “resmî doğrulama” veya canlı servis
başarısı göstermemelidir. Demo fixture’ları görünür biçimde demo olarak
etiketlenir.

## 31. Kaynakça

Aşağıdaki bağlantıların erişim tarihi, aksi belirtilmedikçe
**2026-07-27**’dir.

### 31.1 Türkiye — resmî kaynaklar

- [EİDS resmî hizmeti](https://eids.ticaret.gov.tr/)
- [Ticaret Bakanlığı — EİDS yetki doğrulama uygulamasının kapsamı](https://icticaret.ticaret.gov.tr/haberler/elektronik-ilan-dogrulama-sistemi-eids-yetki-dogrulama-uygulamasi-hayata-gecirildi)
- [Ticaret Bakanlığı — EİDS kuralları ve 2026 uygulaması](https://ticaret.gov.tr/haberler/ticaret-bakanligi-sosyal-medyadaki-sahte-ilanlara-gecit-vermiyor-eids-kurallarina-aykiri-paylasimlara-karsi-yaptirimlar-kararlilikla-uygulaniyor)
- [Ticaret Bakanlığı — taşınmaz ilan fiyatı düzenlemesi](https://ticaret.gov.tr/haberler/tasinmaz-ticareti-hakkinda-yonetmelikte-yapilan-degisiklige-iliskin-basin-aciklamasi)
- [e-Devlet — EİDS taşınmaz ilanı yetkilendirme](https://www.turkiye.gov.tr/ticaret-eids-tasinmaz-ilani-yetkilendirme-islemleri?yetki=Islemleri)
- [TTBS yetki belgesi sorgulama](https://ttbs.gtb.gov.tr/Home/BelgeSorgula)
- [TKGM Parsel Sorgu](https://www.tkgm.gov.tr/parsel-sorgu)
- [TKGM MEGSİS](https://www.tkgm.gov.tr/bt-db/mekansal-gayrimenkul-sistemi-megsis)
- [TKGM Web Tapu](https://www.tkgm.gov.tr/tapu-db/webtapu)
- [CBS Genel Müdürlüğü — e-Plan](https://cbs.csb.gov.tr/e-plan-otomasyon-sistemleri-102080)
- [Ulusal Coğrafi Bilgi Platformu](https://cbs.csb.gov.tr/ulusal-cografi-bilgi-platformu-i-112860)
- [TUCBS Atlas](https://basic.atlas.gov.tr/)
- [AFAD Türkiye Deprem Tehlike Haritası](https://www.afad.gov.tr/turkiye-deprem-tehlike-haritasi)
- [AFAD — tehlike haritası risk haritası değildir](https://www.afad.gov.tr/yeni-deprem-tehlike-haritasi-yayimlandi58)
- [MTA Yerbilimleri Haritası yasal uyarısı](https://yerbilimleri.mta.gov.tr/yasal-uyari.aspx)
- [MTA Türkiye Diri Fay Haritası](https://tdfh.mta.gov.tr/)
- [MGM iklim projeksiyonları](https://mgm.gov.tr/iklim/iklim-degisikligi.aspx?s=projeksiyonlar)
- [MGM kuraklık analizi](https://www.mgm.gov.tr/veridegerlendirme/kuraklik-analizi.aspx)
- [HGM Harita API](https://api.harita.gov.tr/)
- [HGM Sayısal Arazi Modeli](https://www.harita.gov.tr/urun/sayisal-arazi-modeli-sam-30m/3)
- [TCMB Konut Fiyat Endeksi](https://tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Istatistikler/Reel%2BSektor%2BIstatistikleri/Konut%2BFiyat%2BEndeksi)
- [SPK gayrimenkul değerleme kuruluşları tanıtım rehberi](https://spk.gov.tr/kurumlar/gayrimenkul-degerleme-kuruluslari/tanitim-rehberi)
- [KVKK — Yapay zekâ alanında kişisel verilerin korunmasına dair tavsiyeler](https://www.kvkk.gov.tr/Icerik/7048/Yapay-Zeka-Alaninda-Kisisel-Verilerin-Korunmasina-Dair-Tavsiyeler)
- [KVKK — Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi](https://www.kvkk.gov.tr/Icerik/8547/uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi-15-soruda)
- [KVKK — kişisel veri işlemede genel ilkeler](https://www.kvkk.gov.tr/Icerik/6606/General-Principles-in-Processing-of-Personal-Data)
- [TİHEK — taşınmazlarda ayrımcılık yasağı bağlamı](https://www.tihek.gov.tr/konut-kiralamalarinda-ayrimcilik-yasagini-ihlal-eden-uygulamalara-iliskin-basin-aciklamasi)

### 31.2 AI, veri ve erişilebilirlik standartları

- [NIST AI Risk Management Framework 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10)
- [NIST AI RMF — güvenilirlik özellikleri](https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/)
- [NIST AI Agent Standards Initiative](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative)
- [OECD AI Principles](https://oecd.ai/en/principles)
- [OECD transparency and explainability](https://oecd.ai/en/dashboards/ai-principles/P7)
- [OECD human oversight](https://oecd.ai/en/dashboards/ai-principles/P6)
- [AB AI Act resmî metni](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=en)
- [European Commission — AI sistemleri şeffaflık kuralları](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [W3C complex images](https://www.w3.org/WAI/tutorials/images/complex/)
- [W3C Data on the Web Best Practices](https://www.w3.org/TR/dwbp/)
- [W3C PROV overview](https://www.w3.org/TR/prov-overview/)
- [W3C Data Quality Vocabulary](https://www.w3.org/TR/vocab-dqv/)
- [Google PAIR — Explainability and Trust](https://pair.withgoogle.com/guidebook-v2/chapter/explainability-trust/)
- [RICS — Automated Valuation Models](https://www.rics.org/news-insights/wbef/automated-valuation-models-a-property-market-perspective)
- [RICS — Responsible use of AI](https://www.rics.org/profession-standards/rics-standards-and-guidance/conduct-competence/responsible-use-of-ai)
- [International Valuation Standards 2025](https://ivsc.org/new-edition-of-the-international-valuation-standards-ivs-published/)
- [C2PA Content Credentials açıklaması](https://spec.c2pa.org/specifications/specifications/2.2/explainer/Explainer.html)
- [Schema.org RealEstateListing](https://schema.org/RealEstateListing)
- [Google structured data genel politikaları](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

### 31.3 Ürün benchmarkları

- [Zillow AI Mode](https://www.zillow.com/news/how-zillows-new-ai-mode-works-throughout-the-real-estate-journey/)
- [Zillow natural-language home search](https://zillow.mediaroom.com/2024-09-04-Zillows-AI-powered-home-search-gets-smarter-with-new-natural-language-features)
- [Zillow Zestimate kapsamı ve sınırlamaları](https://www.zillow.com/zestimate/)
- [Redfin buying power](https://www.redfin.com/news/new-on-redfin-see-your-buying-power-while-you-search/)
- [Realtor.com flood risk metodolojisi](https://www.realtor.com/flood-risk/)
- [Realtor.com climate risk araştırması](https://www.realtor.com/research/climate-risk-2024/)
- [Hepsiemlak Akıllı Özet](https://www.hepsiemlak.com/emlak-yasam/haberler/bizden-haberler/hepsiemlakta-yenilik-akilli-ozet-ile-ilan-detaylarini-anlamak-cok-kolay)
- [Hepsiemlak ChatGPT uygulaması kullanım ve sınırlamaları](https://www.hepsiemlak.com/chatgpt-app-kullanim-kosullari)
- [Emlakjet veri ve AI destekli dönüşüm](https://www.emlakjet.com/blog/emlakjetten-20-yilinda-stratejik-donusum-veri-ve-yapay-zeka-destekli-yeni-nesil-platform)
- [Emlakjet AI danışman](https://www.emlakjet.com/emlakzeka)
- [Emlakjet yardım ve değerleme sınırlamaları](https://www.emlakjet.com/yardim)
- [Sahibinden ilan verme kuralları](https://www.sahibinden.com/sozlesmeler/ilan-verme-kurallari-48)
- [Idealista favori, özel not ve değişiklik uyarıları](https://www.idealista.com/ayuda/articulos/como-guardar-tus-inmuebles-favoritos/)

### 31.4 Benchmarkların yorumu

Benchmarklardan alınan ortak örüntüler:

- doğal dil arama ve konuşmalı takip,
- fiyat geçmişi ve açıklanabilir tahmin,
- karşılaştırma,
- source-specific risk/tehlike katmanları,
- varsayımı görünür finansal senaryo,
- kaydet/not/değişiklik alarmı,
- AI sınırlamalarını açıkça belirtme.

Kopyalanmaması gerekenler:

- konut AVM modelini arsaya taşımak,
- kurumsal ürün iddiasını bağımsız başarı kanıtı saymak,
- yabancı ülke hukukunu Türkiye’ye doğrudan uygulamak,
- tek skorla karmaşık kararı kapatmak,
- ürünün kendi “AI” pazarlama dilini kanıt yerine kullanmak.

## 32. Sonuç

ArsaPazar’ın 2030 farkı daha fazla cam, daha fazla kart veya daha konuşkan bir
chatbot olmayacaktır. Fark:

- her kritik değerin kökenini göstermek,
- bilinenle beyanı ve tahmini ayırmak,
- çelişkiyi saklamamak,
- veri yetersizse susabilmek,
- kullanıcı niyetini düzenlenebilir bir karar sözleşmesine çevirmek,
- AI’yı izinli ve audit edilebilir bir yardımcı olarak kullanmak,
- tüm bunları sakin, simetrik, taranabilir ve erişilebilir bir arayüzde
  sunmaktır.

Bu yaklaşım hem bugünkü enterprise beklentiyi karşılar hem de 2030’a doğru
agentic özellikler eklenirken ürünün güven omurgasını korur.
