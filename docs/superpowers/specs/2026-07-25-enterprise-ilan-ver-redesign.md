# Enterprise İlan Verme Deneyimi — Tasarım Spesifikasyonu

## Amaç

`/ilan-ver` sayfasını, arsa ve emlak ilanı yayınlayan bireysel kullanıcılar ile yetkili emlak işletmelerinin aynı akışta kullanabileceği; AI destekli fakat kullanıcı kontrollü; EİDS doğrulamasını yayın öncesi zorunlu kapı olarak ele alan; sade, güven veren ve mobilde de tamamlanabilir bir ilan oluşturma deneyimine dönüştürmek.

## Başarı ölçütleri

- Kullanıcı ilk ekranda AI ile hızlı başlangıç veya elle giriş yolunu açıkça seçebilir.
- Akış, kullanıcıya gerçek ilerlemeyi gösteren beş adımdan oluşur ve geçmiş adımlar veri kaybetmeden düzenlenebilir.
- Her ekranda tek bir ana görev ve tek bir birincil eylem bulunur.
- Arsa, konut, iş yeri ve bina için kategoriye bağlı alanlar dinamik olarak açılır.
- Fotoğraflar kapak seçimi, sıralama, kalite durumu ve açıklama ile yönetilebilir.
- AI önerileri kullanıcı onayı olmadan forma uygulanmaz ve ilanı yayınlamaz.
- EİDS kimlik/yetki doğrulaması tamamlanmadan yayın eylemi etkinleşmez.
- Son kontrol ekranı tüm bölümleri özetler ve her bölümü doğrudan düzenlemeye götürür.
- Klavye, ekran okuyucu, reduced-motion ve dokunmatik kullanım sözleşmeleri tasarım sistemiyle uyumludur.

## Araştırma temeli

- Ticaret Bakanlığı EİDS, elektronik taşınmaz ilanlarında kimlik ve pazarlama yetkisi doğrulamasını zorunlu kılar. Akış bu nedenle doğrulamayı opsiyonel rozet değil yayın kapısı olarak ele alır.
- Airbnb ilan editörü, içerik kalitesini fotoğraflar, başlık, açıklama ve yapılandırılmış özellikler üzerinden kurar; fotoğraf turunu düzenlenebilir AI önerisi olarak sunar.
- Baymard araştırması, adım sayısından çok görünür alan sayısının ve algılanan iş yükünün önemli olduğunu; ilerleme göstergesinin gerçek akışla birebir eşleşmesini ve geçmiş adımların düzenlenebilir olmasını önerir.
- GOV.UK “Check answers” örüntüsü, gönderimden önce bölümlenmiş özet ve doğrudan düzenleme bağlantılarıyla kullanıcı güvenini ve hata yakalamayı destekler.

## Tasarım yönü

### Görsel karakter

- Kağıt temasında sıcak fildişi zemin, koyu grafit metin ve tek amber vurgu korunur.
- Büyük içerik yüzeyleri düz malzemedir; cam yalnız üst araç çubuğu ve eylem kontrollerinde kullanılır.
- Aynı ekranda en fazla dört cam yüzey bulunur; bu sayı form kontrollerini de kapsar ve cam üstüne cam yerleştirilmez.
- Uzun formlardaki input, select, radio ve checkbox alanları token tabanlı düz HTML kontrolleridir. Cam yalnız geri/ileri gibi yüksek öncelikli eylemlerde kullanılır.
- Sayfa, eşit üç kart kolonundan kaçınır. Ana çalışma alanı geniş, bağlamsal yardımcı panel dardır.
- Başlıklar cümle biçiminde, metin satırları yaklaşık 60–65 karakter genişliğinde ve sayısal değerler tabular olarak gösterilir.
- Dekoratif gölge kullanılmaz; hiyerarşi yüzey tonu, boşluk, çizgi ve tipografi ile kurulur.

### Masaüstü yerleşimi

1. Üst çalışma çubuğu:
   - Arsam.net işareti ve “İlanlarım” geri bağlantısı.
   - Taslak adı.
   - Gerçek kayıt durumu: “Kaydediliyor”, “Kaydedildi 21:42”, “Kayıt başarısız”.
   - “Çık ve taslağı sakla” eylemi.
2. Yatay ilerleme hattı:
   - Beş adımın birebir haritası.
   - Tamamlanan adımlar tıklanabilir; eksik adımlar durum metni taşır.
3. İki kolonlu çalışma alanı:
   - Sol/ana kolon: aktif adımın formu.
   - Sağ/yardımcı kolon: aktif adıma göre değişen kalite kontrolü, örnek ve önizleme.
4. Alt eylem rayı:
   - Geri bağlantısı, otomatik kayıt bilgisi ve tek bir prominent “Devam et” eylemi.

### Mobil yerleşimi

- Üst çalışma çubuğu yalnız geri, taslak durumu ve menü eylemini gösterir.
- İlerleme “Adım 2 / 5 — Konum” biçiminde kompakt olur; tüm adımlar açılır görev listesinde görülebilir.
- Yardımcı panel, ilgili alanın hemen altında açılan düz içerik bloğuna dönüşür.
- Alt eylem rayı safe-area üzerinde sabitlenir; butonlar en az 44px dokunma hedefi sağlar.

## Kullanıcı akışı

### Başlangıç — hibrit giriş

Yeni taslakta ilk ekran iki yol sunar:

- “Mülkü AI’ya anlat”: Kullanıcı serbest metin yazar. Sistem mülk türü, işlem türü, konum, alan, öne çıkan özellikler ve eksik bilgileri bir öneri olarak çıkarır. Kullanıcı “Önerileri incele” ekranında her alanı görür ve “Forma uygula” demeden veri değişmez.
- “Bilgileri kendim gireceğim”: Kullanıcı doğrudan yapılandırılmış forma geçer.

AI yolu kapatılamayan bir sohbet penceresi değildir; bir kerelik hızlı başlangıç aracıdır. Sonraki adımlarda AI bağlamsal, küçük öneriler halinde görünür.

### Adım 1 — Mülk

- İlan amacı: Satılık veya kiralık.
- Mülk ailesi: Arsa/Arazi, Konut, İş Yeri, Bina.
- Kategoriye göre alt tür.
- İlan veren rolü: Mülk sahibi, yakını/eşi, yetkili emlak işletmesi.
- Kategoriye bağlı temel alanlar:
  - Arsa: nitelik, imar durumu, tapu türü, toplam alan.
  - Konut: konut tipi, oda sayısı, brüt/net alan, bina yaşı.
  - İş yeri: iş yeri tipi, kullanım durumu, brüt/net alan.
  - Bina: kat sayısı, bağımsız bölüm, toplam alan.

Devam koşulu: amaç, mülk ailesi, alt tür, ilan veren rolü ve kategoriye bağlı zorunlu alanlar geçerli olmalıdır.

### Adım 2 — Konum ve taşınmaz

- İl, ilçe, mahalle seçimleri birbirine bağlıdır.
- Açık adres, harita üzerinde yaklaşık konum ve “ilanda tam konumu gösterme” tercihi bulunur.
- Arsa için ada/parsel; diğer kategoriler için bina ve kapı bilgisi ilgili olduğunda gösterilir.
- EİDS için taşınmaz kimliği bu adımda hazırlanır, fakat doğrulama işlemi son adımda tamamlanır.
- Harita alanı içerik yüzeyidir ve Leaflet/OSM tabanlı mevcut harita yaklaşımıyla uyumludur.

Devam koşulu: il, ilçe, mahalle ve kategoriye bağlı taşınmaz kimliği alanları geçerli olmalıdır.

### Adım 3 — Fotoğraf stüdyosu

- Sürükle-bırak ve dosya seçimi desteklenir.
- Yüklenen fotoğraflar görsel ızgarada gösterilir; ilk öğe “Kapak” olarak işaretlenir.
- Kullanıcı kapak seçebilir, sıralayabilir, silebilir ve açıklama ekleyebilir.
- Durumlar: yükleniyor, hazır, düşük çözünürlük, tekrar görsel, yükleme hatası.
- AI kalite kontrolü yalnız öneri üretir: karanlık, bulanık, dikey/kırpılma riski ve önerilen sıra.
- Yerel prototipte gerçek yükleme servisi yerine `File` nesneleri ve object URL kullanılır; durum modeli üretim API’sine uyumlu tutulur.

Devam koşulu: en az üç geçerli fotoğraf ve bir kapak seçimi bulunmalıdır.

### Adım 4 — Fiyat ve ilan metni

- Fiyat ve alan üzerinden birim fiyat canlı hesaplanır.
- Bölge karşılaştırması; önerilen aralık, benzer ilan sayısı ve veri güncelliğiyle gösterilir. Bu değerler “tahmin” olarak etiketlenir.
- Başlık 50 karakter hedefiyle sayılır; konum ve yapılandırılmış alanlarda zaten görünen bilgi tekrar önerilmez.
- Açıklama editörü, öne çıkan özellikler ve bilinmesi gerekenler olarak iki bölümlüdür.
- AI eylemleri: “Başlığı iyileştir”, “Açıklama taslağı oluştur”, “Riskli ifadeleri kontrol et”. Her eylem önce değişiklik önizlemesi gösterir, sonra kullanıcı uygular.
- Yan panelde arama sonucu kartına benzeyen gerçek zamanlı ilan önizlemesi görünür.

Devam koşulu: fiyat, başlık ve açıklama geçerli; riskli/yanıltıcı ifade uyarıları kullanıcı tarafından çözülmüş veya açıkça kabul edilmiş olmalıdır.

### Adım 5 — Doğrulama ve yayın

- EİDS kartı, ilan veren rolüne göre uygun doğrulama yolunu açıklar.
- Durumlar: başlamadı, doğrulanıyor, doğrulandı, yetki bulunamadı, servis geçici olarak kullanılamıyor.
- Doğrulama tamamlanınca taşınmaz ve yetki özeti salt okunur gösterilir.
- Bölümlenmiş son kontrol listesi: Mülk, Konum, Fotoğraflar, Fiyat ve Metin, Doğrulama.
- Her bölümün “Düzenle” eylemi ilgili adıma gider ve dönüşte son kontrol ekranına geri getirir.
- Yayın eylemi yalnız tüm zorunlu bölümler tamam ve EİDS doğrulandıysa etkinleşir.
- Yayın öncesi açık rıza/onay kutuları yalnız hukuken gerekli metinler için kullanılır; pazarlama izni zorunlu değildir.

## Durum modeli

`ListingDraft` aşağıdaki bölümlere ayrılır:

- `entryMode`: `ai | manual | null`
- `property`: amaç, aile, alt tür, ilan veren rolü ve kategori alanları
- `location`: idari konum, adres, koordinat, görünürlük ve taşınmaz kimliği
- `media`: dosya kimliği, object URL, sıra, kapak, açıklama ve kalite durumu
- `content`: fiyat, başlık, açıklama, özellikler ve AI inceleme durumu
- `verification`: EİDS durumu, doğrulanan rol, taşınmaz özeti ve hata kodu
- `meta`: taslak kimliği, kayıt durumu, son kayıt zamanı ve aktif adım
- `meta.returnToReview`: son kontrolden düzenlemeye gidildiğinde, geçerli adım tamamlanınca Adım 5 özetine dönülmesini sağlayan bağlam

Otomatik kayıt, AI önerisi ve EİDS demo akışı `listing-create-adapters.ts` içindeki enjekte edilebilir, deterministik adapter sözleşmelerinden geçer. Adapter sonuçları senaryo parametresiyle `success`, `unauthorized`, `unavailable` ve `save-error` olarak seçilebilir; üretim bileşenlerinde rastgele sonuç üretilmez.

Adım tamamlama bilgisi ayrıca saklanmaz; her bölümün doğrulama sonucundan türetilir. Bir kullanıcı ileri adıma geçerek eksik adımı “tamamlandı” yapamaz.

## Bileşen sınırları

- `ListingCreateWorkspace`: akış orkestrasyonu ve draft state.
- `ListingCreateHeader`: geri dönüş, taslak adı ve kayıt durumu.
- `ListingProgress`: beş adımın durum ve navigasyonu.
- `ListingEntryChoice`: hibrit başlangıç ve AI öneri incelemesi.
- `PropertyStep`: kategoriye bağlı mülk alanları.
- `LocationStep`: idari konum, adres ve harita.
- `MediaStudioStep`: dosya seçimi ve medya ızgarası.
- `ContentPricingStep`: fiyat, metin ve AI revizyonları.
- `VerificationReviewStep`: EİDS durumları, kontrol özeti ve yayın.
- `ListingContextPanel`: aktif adıma göre kalite/yardım/önizleme içeriği.
- `ListingActionBar`: geri, kayıt durumu ve birincil ilerleme eylemi.
- `listing-create-domain.ts`: draft, doğrulama, formatlama ve adım tamamlama saf fonksiyonları.
- `listing-create-adapters.ts`: otomatik kayıt, AI ve EİDS için deterministik asenkron sınırlar.
- `listing-create-fixtures.ts`: prototip fiyat karşılaştırması ve AI öneri verileri.

Hiçbir adım bileşeni yayın işlemi yapmaz; yalnız bölüm verisini ve doğrulama sonucunu üst orkestratöre iletir.

## Hata ve bekleme davranışı

- Alan hataları ilgili alanın altında ve hata özetinde gösterilir; kullanıcı girdisi silinmez.
- Otomatik kayıt başarısız olursa alt rayda kalıcı “Tekrar dene” eylemi görünür; kullanıcı akışa devam edebilir.
- AI servisi başarısız olursa manuel form tam kullanılabilir kalır.
- Fotoğraf yükleme hatası yalnız ilgili görseli etkiler ve yeniden deneme sunar.
- EİDS geçici hatasında yayın kilitli kalır, taslak kaydedilir ve kullanıcı daha sonra dönebilir.
- Ağ/servis beklemelerinde yerleşimi koruyan skeleton veya yerel durum göstergesi kullanılır; tam ekran spinner kullanılmaz.

## Erişilebilirlik ve hareket

- Tüm alanlarda kalıcı üst etiket bulunur; placeholder etiket yerine kullanılmaz.
- Adım navigasyonu `aria-current="step"`, durum metinleri ve klavye erişimi taşır.
- AI uygulama ve yayın gibi sonuç doğuran eylemler açık fiillerle adlandırılır.
- İkon-tek butonlar erişilebilir ad taşır.
- Focus halkası yalnız `:focus-visible` durumunda tasarım token’ını kullanır.
- Hareket yalnız transform ve opacity ile sınırlıdır; reduced-motion altında kaldırılır.
- Fotoğraf sıralama için sürükle-bırak dışında klavye ile “sola/sağa taşı” eylemleri bulunur.

## Veri ve prototip sınırı

- Bu teslimat frontend prototipidir; gerçek EİDS, AI, dosya depolama ve otomatik kayıt API çağrıları yapılmaz.
- Servis sınırları gerçekçi durum makineleri ve deterministik gecikmeli adapter’larla temsil edilir.
- Kullanıcı hiçbir noktada prototip sonucunu gerçek devlet doğrulaması sanmamalıdır; EİDS kartında “demo bağlantısı” etiketi gösterilir.
- Taslak state’i sayfa yaşam döngüsü boyunca korunur. Kalıcı backend entegrasyonu sonraki uygulama katmanıdır.
- Başlıkta 50 karakter kalite hedefidir; 70 karakter üzeri doğrulama hatasıdır. Sayaç her zaman görünür.

## Test stratejisi

- Domain testleri: kategoriye bağlı zorunlu alanlar, adım tamamlama, birim fiyat, başlık limiti, yayın kapısı.
- Bileşen testleri: giriş modu seçimi, AI önerisini onaylama, geçmiş adıma dönüş, fotoğraf durumları, EİDS hata/başarı, son kontrol düzenleme bağlantıları.
- Erişilebilirlik kontrolleri: adım `aria-current`, form adları, hata ilişkileri, klavye medya kontrolleri.
- Responsive Storybook durumları: geniş masaüstü, dar masaüstü, mobil; açık ve koyu tema; reduced-motion.
- Üretim doğrulaması: web typecheck, hedefli Vitest, web build ve `/ilan-ver` canlı sayfa görsel denetimi.

## Kabul kriterleri

1. `/ilan-ver` placeholder veya eski üç kolonlu kart düzenini göstermez.
2. Kullanıcı AI ya da manuel giriş seçip beş adımı veri kaybetmeden tamamlayabilir.
3. Arsa ve konut seçimi farklı zorunlu alanlar gösterir.
4. En az üç fotoğraf ve kapak olmadan medya adımı tamamlanmaz.
5. AI önerileri uygulanmadan önce kullanıcı onayı ister.
6. Son kontrol bölümlenmiş özet ve doğrudan düzenleme eylemleri içerir.
7. EİDS doğrulanmadan yayın butonu etkinleşmez.
8. Sayfa tasarım tokenlarını kullanır; içerik kartlarında cam, raw hex ve keyfî radius bulunmaz.
9. Mobilde form tek kolon, ilerleme kompakt ve alt eylem rayı erişilebilirdir.
10. Hedefli testler, typecheck ve production build başarılıdır.
11. İlerleme hattında tam olarak beş öğe bulunur; son kontrol ayrı altıncı adım değildir.
