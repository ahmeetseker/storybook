# AI Danışman Yeniden Tasarım Spesifikasyonu

Tarih: 2026-07-26
Rota: `/ai-danisman`
Durum: Tasarım onaylandı, uygulama planı bekleniyor

## 1. Amaç

`/ai-danisman`, arsa, konut ve iş yeri arayan kullanıcıların doğal dilde
başlattığı bir ihtiyacı düzenlenebilir kriterlere dönüştüren, uygun ilanları
somut gerekçelerle sıralayan ve kullanıcıyı karşılaştırma veya insan danışman
adımına güvenli biçimde taşıyan karar destek yüzeyi olacaktır.

Sayfanın temel hedefi, çok sayıda özelliği aynı anda göstermek değil, ilgili
özelliği karar yolculuğunun doğru anında açmaktır. İlk görünüm sade olacak;
arama sonrasında sonuç, kriter ve güven bilgileri progressive disclosure ile
genişleyecektir.

## 2. Tasarım okuması

Bu çalışma, alıcı, kiracı ve yatırımcılar için güven odaklı bir emlak karar
ürününün mevcut tasarım sistemi içinde yeniden tasarımıdır.

- Tasarım varyansı: 4/10
- Motion yoğunluğu: 3/10
- Bilgi yoğunluğu: 4/10
- Görsel dil: sakin, simetrik, premium ve işlevsel
- Tema: mevcut Kağıt ve Grafit
- Vurgu: yalnız `--lg-accent`
- İçerik yüzeyleri: `material="flat"`
- Cam yüzeyler: yalnız navigasyon ve temel kontrol katmanı
- Büyük gölge: kullanılmayacak
- Ayırma yöntemi: boşluk ritmi, hairline border ve tipografik hiyerarşi

Tasarım, `src/design/GenelBakis.mdx`, `Tokenlar.mdx`,
`EksenlerVeDurumlar.mdx`, `ErisilebilirlikMotionResponsive.mdx` ve
`ComponentSablonu.mdx` sözleşmelerine uyacaktır.

## 3. Ürün kapsamı

### 3.1 Ana iş

Kullanıcı tek bir doğal dil sorgusuyla doğru ilanı bulup kararını
netleştirecektir.

### 3.2 Desteklenen mülk kapsamı

Arsa, konut, iş yeri, bina, devremülk ve turistik tesis aynı arama sisteminde
değerlendirilebilir. Kullanıcı mülk türü belirtmezse sistem tüm türleri
değerlendirir. Kullanıcı açıkça bir tür belirtirse sonuçlar o türe daralır.

### 3.3 Desteklenen işlem kapsamı

- Satın alma
- Kiralama
- Yatırım

### 3.4 Birincil özellikler

- Doğal dil sorgusu
- Düzenlenebilir arama profili
- Görselli ve açıklanabilir ilan eşleşmeleri
- İlan detayı
- Favoriye ekleme
- En fazla üç ilanı karşılaştırmaya seçme
- Benzer ilanları gösterme
- Kaynak ve kanıt inceleme

### 3.5 İkincil özellikler

- Aramayı kaydetme
- Fiyat alarmı oluşturma
- Konuşma geçmişini inceleme
- Karar ve izin günlüğünü inceleme
- Açık onayla insan danışmana geçme

İkincil özellikler varsayılan sonuç yüzeyinde kalıcı alan tüketmeyecek;
drawer veya ilgili inline disclosure üzerinden açılacaktır.

## 4. Mevcut durum denetimi

Mevcut ekranın temel sorunları şunlardır:

1. Hero araması, prompt chip'leri, inline sohbet input'u ve `GlassChatDock`
   aynı işi tekrarlar.
2. Sohbet, sonuçlar, karar paneli ve karar günlüğü ilk açılışta aynı anda
   gösterilir.
3. CSS önce üç kolon, sonra iki kolon kurarak aynı seçicileri tekrar ezer.
4. Hero, workspace ve aktivite alanları farklı genişlik eksenleri kullanır.
5. Karşılaştırma state'i kullanıcıya seçili durum veya devam aksiyonu sunmaz.
6. Parser tarafından çıkarılan bütçe ve önceliklerin çoğu gerçek
   filtrelemeye katılmaz.
7. Eşleşme puanı ile sorgu yorumlama güveni aynı anlamdaymış gibi sunulur.
8. Mobil görsel sıra ile DOM sırası ayrışır.
9. Shell skip-link hedefi için `main-content` kimliği eksiktir.
10. Cam yüzey bütçesi, içerik katmanında kullanılan chip ve butonlarla aşılır.

Yeniden tasarım bu sorunları hedefli biçimde çözecek; rota, marka, global
navigasyon ve mevcut tasarım sistemi korunacaktır.

## 5. Bilgi mimarisi

### 5.1 İlk açılış

İlk durumda yalnız şu öğeler görünür:

1. Bir adet konu etiketi
2. En fazla iki satırlık başlık
3. En fazla 20 kelimelik açıklama
4. Tek AI composer
5. Arsa yatırımı, kiralık konut ve ticari mülk için üç flat örnek sorgu

Boş sonuç paneli, karar günlüğü, skor veya insan danışman aksiyonu ilk durumda
gösterilmez.

### 5.2 Analiz durumu

Sorgu gönderildiğinde:

- Composer sorguyu korur.
- Sonuç kartlarının geometrisini taklit eden skeleton görünür.
- Durum erişilebilir biçimde duyurulur.
- Kullanıcı sorguyu değiştirebilir veya işlemi iptal edebilir.
- Gerçek olmayan "Canlı" etiketi kullanılmaz.

### 5.3 Sonuç durumu

Masaüstünde tek bir 12 kolon sistemi kullanılır:

- Sonuç kanvası: 8 kolon
- Arama profili ve karar paneli: 4 kolon

Sonuç kanvasında önce özet, ardından büyük en iyi eşleşme ve iki kolonlu
alternatif ilanlar bulunur. Sağ panelde düzenlenebilir kriterler,
karşılaştırma seçimi, aramayı kaydetme ve güven/kaynak girişi yer alır.

### 5.4 Progressive disclosure

Aşağıdaki içerikler yalnız kullanıcı istediğinde açılır:

- Tam ilan gerekçesi ve kriter bazlı eşleşme
- Kanıtlar ve veri kaynakları
- Arama kriterlerini düzenleme formu
- Konuşma geçmişi
- Karar ve izin günlüğü
- İnsan danışman paylaşım onayı

## 6. Görsel yerleşim

### 6.1 İlk açılış

İçerik tek odaklı, ortalanmış ve en fazla 52rem okunabilir genişlikte
olacaktır. Başlık, açıklama, composer ve örnekler aynı dikey eksende
hizalanacaktır.

### 6.2 Sonuç yerleşimi

Sonuç görünümü, tüm bölümler için ortak bir maksimum genişlik ve ortak yan
padding kullanacaktır. En iyi eşleşme büyük bir birleşik karar kartı,
alternatifler ise daha kompakt iki kolonlu kartlar olacaktır.

Her ilan kartı tek bir flat yüzey içinde şu anatomiyi taşır:

1. Fotoğraf
2. Doğrulama durumu
3. Başlık ve konum
4. Fiyat, alan ve birim fiyat
5. En fazla üç önemli özellik
6. Eşleşme değeri ve somut gerekçe
7. Birincil ve ikincil aksiyonlar

Fotoğraf üzerindeki metin yalnız gerekli durum rozetleriyle sınırlıdır ve
scrim/kontrast sözleşmesini kullanır.

### 6.3 Cam yüzey bütçesi

Global header ve dock iki cam yüzey olarak kabul edilir. Sayfa içinde cam
yalnız composer gönder kontrolü ve gerektiğinde birincil karar aksiyonunda
kullanılır. Kriterler, rozetler, ilan kartları ve ikincil butonlar flat
olacaktır. Cam üstüne cam yerleştirilmeyecektir.

### 6.4 Tipografi

- H1: `--lg-text-display`
- Bölüm başlığı: `--lg-text-title`
- Kart başlığı: `--lg-text-headline`
- Karar gerekçesi ve ana açıklamalar: `--lg-text-body`
- Meta bilgi: `--lg-text-caption`
- Rozet: `--lg-text-badge`

Sayfada en fazla bir uppercase eyebrow bulunacaktır. Sayısal değerlerde
tabular figures kullanılacaktır.

## 7. Etkileşim akışı

### 7.1 Sorgu gönderme

Boş veya yalnız whitespace içeren sorgu gönderilemez. Geçerli sorgu,
Türkçe kriter ayrıştırıcıya iletilir ve analiz state'ine geçilir.

### 7.2 Kriter ayrıştırma

Sistem aşağıdaki alanları ayrıştırır:

- İşlem amacı
- Şehir
- İlçe
- Mülk türleri
- Minimum bütçe
- Maksimum bütçe
- Oda sayısı
- Minimum ve maksimum alan
- İmar, tapu ve yol cephesi tercihleri
- Denize yakınlık, ulaşım ve yaşam öncelikleri

`3+1` oda değeri bütçe olarak yorumlanmayacaktır. `5 milyon`, `5.000.000 TL`,
`750 bin` ve benzeri Türkçe bütçe biçimleri sayısal değere normalize edilir.

### 7.3 Kriter düzenleme

AI'nin çıkardığı kriterler arama profilinde görünür. Kullanıcı kriteri
kaldırabilir veya kriter drawer'ında değerini değiştirebilir. Her değişiklik
sonuçları yeniden hesaplar ve neden değiştiğini görünür kılar.

### 7.4 Eşleştirme

Eşleştirme iki aşamalıdır:

1. Zorunlu kriterlerle filtreleme
2. Tercih kriterleriyle sıralama

İşlem türü, şehir, ilçe, mülk türü, bütçe ve zorunlu özellikler gerçek
filtrelemede kullanılacaktır. Tercihler eşleşme gerekçesi ve puanlamaya
katılacaktır.

### 7.5 Güven ve uygunluk ayrımı

- Sorgu yorumlama güveni: AI'nin kullanıcının cümlesini ne kadar net
  ayrıştırdığını gösterir.
- İlan eşleşmesi: İlanın onaylanmış kriterlere ne kadar uyduğunu gösterir.

Bu iki değer aynı görsel ağırlıkta sunulmayacaktır. Kullanıcı kararını
doğrudan etkileyen eşleşme gerekçesi, soyut güven yüzdesinden daha baskın
olacaktır.

### 7.6 İlan aksiyonları

Her ilan şu aksiyonları destekler:

- İlanı incele
- Favoriye ekle veya çıkar
- Karşılaştırmaya ekle veya çıkar
- Neden önerildi bilgisini aç
- Benzer ilanları göster

Karşılaştırma butonu `aria-pressed` kullanır. En fazla üç ilan seçilebilir.
Seçim sayısı sağ panelde görünür. Seçilen ilan kimlikleri paylaşılabilir URL
parametreleriyle `/karsilastir` rotasına aktarılır.

### 7.7 İnsan danışmana geçiş

İnsan danışmana geçişte:

1. Paylaşılacak kriterler ve ilanlar özetlenir.
2. Açık onay istenir.
3. Kullanıcı onaylamadan dış aksiyon oluşmaz.
4. Başarı veya vazgeçme sonucu karar günlüğüne eklenir.
5. Prototipte gerçek paylaşım yapılmıyorsa bu durum açıkça belirtilir.

## 8. Component mimarisi

Hedef dosya yapısı:

```text
apps/web/src/features/advisor/
├── AdvisorWorkspace.tsx
├── AdvisorWorkspace.module.css
├── AdvisorWorkspace.test.tsx
├── AdvisorWorkspace.stories.tsx
├── rules.md
├── components/
│   ├── AdvisorWelcome.tsx
│   ├── AdvisorComposer.tsx
│   ├── AdvisorSearchProfile.tsx
│   ├── AdvisorResults.tsx
│   ├── AdvisorListingCard.tsx
│   ├── AdvisorDecisionRail.tsx
│   ├── AdvisorCriteriaDrawer.tsx
│   ├── AdvisorListingDrawer.tsx
│   └── AdvisorTrustDrawer.tsx
├── domain/
│   ├── advisor-types.ts
│   ├── advisor-parser.ts
│   ├── advisor-matcher.ts
│   ├── advisor-reducer.ts
│   └── *.test.ts
└── data/
    └── advisor-search-adapter.ts
```

`AdvisorWorkspace` yalnız sayfa durumunu ve bileşenler arası olayları
koordine eder. Sunum, domain ve veri erişimi birbirinden ayrılır.

Sayfaya özel bileşenler `apps/web` içinde kalır. Tekrar kullanılabilir yeni
bir UI primitive'i gerekirse `src/components` altında tam component klasörü,
Storybook matrisi, test ve `rules.md` ile eklenir.

## 9. State modeli

Ana state:

- `idle`
- `analyzing`
- `results`
- `empty`
- `error`

Overlay state:

- `none`
- `criteria`
- `listing`
- `trust`
- `history`
- `advisorConsent`

State bir reducer tarafından yönetilecektir. Ayrı ayrı ve birbiriyle
çelişebilen çok sayıda `useState` kullanılmayacaktır.

Önemli olaylar:

- `QUERY_SUBMITTED`
- `ANALYSIS_SUCCEEDED`
- `ANALYSIS_FAILED`
- `QUERY_CANCELLED`
- `CRITERION_UPDATED`
- `CRITERION_REMOVED`
- `LISTING_SELECTED`
- `FAVORITE_TOGGLED`
- `COMPARE_TOGGLED`
- `OVERLAY_OPENED`
- `OVERLAY_CLOSED`
- `CONSENT_APPROVED`
- `CONSENT_REJECTED`
- `RETRY_REQUESTED`

## 10. Veri akışı ve adaptör sözleşmesi

```text
Doğal dil sorgusu
  -> Türkçe kriter ayrıştırıcı
  -> Kullanıcının düzenleyebildiği kriter taslağı
  -> Arama adaptörü
  -> Zorunlu filtreleme
  -> Tercih bazlı eşleştirme
  -> Sonuçlar, gerekçeler ve kanıtlar
```

İlk uygulama fixture verisini kullanır. `advisor-search-adapter` gerçek API
entegrasyonuna uygun bir asenkron arayüz sunar. UI, fixture implementasyonuna
doğrudan bağlı olmaz.

Arama sorgusu ve karşılaştırma kimlikleri URL search parametreleriyle
korunur. Geri bildirim yalnız mevcut oturum state'ini günceller; gerçek modele
gönderilmiş gibi bir başarı mesajı göstermez.

## 11. Responsive sözleşme

Yerleşim CSS container sorgularıyla yönetilir. Cihaz adı veya component prop'u
üzerinden mobil/masaüstü varyantı oluşturulmaz.

### Geniş container

- 12 kolon, 8/4 düzen
- Sağ panel sticky
- Alternatif sonuçlar iki kolon

### Orta container

- Arama profili sonuçların üstünde kompakt satıra dönüşür
- Sağ panel sticky davranışı kapanır
- Sonuç kartları uygun alana göre akar

### Dar container

DOM ve görsel sıra aynıdır:

1. Sorgu
2. Arama profili
3. En iyi eşleşme
4. Alternatifler
5. Karar aksiyonları

Tüm kartlar tam genişliktedir. İç içe scroll kullanılmaz. Global dock,
safe-area ve `--lg-shell-dock-offset` rezervi korunur.

`pointer: coarse` ortamında tüm etkileşimli hedefler en az
`--lg-control-md` boyutuna çıkar. Hover yalnız `hover: hover` ortamında
uygulanır.

## 12. Erişilebilirlik

- Sayfa `<main id="main-content">` kullanır.
- Composer `role="search"` ve açık accessible name taşır.
- Analiz ve sonuç sayısı `aria-live="polite"` ile duyurulur.
- Karşılaştırma seçimleri `aria-pressed` ile yansıtılır.
- İkon-tek kontroller label taşır.
- Tüm custom kontroller sistem focus-visible halkasını kullanır.
- Drawer'lar portal, focus trap, Escape ile kapanma, scroll lock ve
  tetikleyiciye focus dönüşü sözleşmesini korur.
- Görsel sıra ile DOM sırası ayrışmaz.
- Anlam yalnız renkle aktarılmaz.
- `prefers-reduced-motion` durumunda transform hareketleri kapanır.
- `prefers-reduced-transparency` durumunda cam yüzeyler donuklaşır.

## 13. Hata ve sınır durumları

### 13.1 Sıfır sonuç

Sistem hangi kriterlerin sonucu fazla daralttığını açıklar. Kullanıcıya ilgili
kriteri kaldırma veya düzenleme aksiyonu sunulur.

### 13.2 Arama hatası

Sorgu ve düzenlenmiş kriterler korunur. Inline hata mesajı, tekrar deneme ve
kriterleri düzenleme aksiyonları gösterilir.

### 13.3 Düşük yorumlama güveni

Sistem tahmin yürütmek yerine tek bir netleştirme sorusu sorar. Kullanıcı
yanıtı kriter taslağını günceller.

### 13.4 Eksik ilan verisi

Eksik değerler boş veya sahte veriyle doldurulmaz. Kullanıcıya
`Bilgi sağlanmadı` metni gösterilir ve eşleşme gerekçesi eksik veriyi
olumlu sinyal olarak kullanmaz.

### 13.5 Karşılaştırma limiti

Üç ilan seçildikten sonra yeni seçim engellenir. Mevcut seçimlerden birini
kaldırma önerilir ve durum erişilebilir biçimde duyurulur.

### 13.6 İptal

Devam eden fixture/API isteği `AbortController` ile iptal edilebilir. İptal
edilen istek error state'e düşmez; kullanıcı önceki geçerli durumuna döner.

## 14. Motion

Motion yalnız hiyerarşi, geri bildirim ve state geçişini açıklamak için
kullanılır.

- Idle'dan analiz durumuna: hafif opacity geçişi
- Skeleton'dan sonuçlara: opacity ve küçük transform
- Seçim geri bildirimi: basınç preset'i
- Drawer: mevcut overlay motion sözleşmesi

Layout ölçülerini animasyonla değiştiren `width`, `height`, `top` veya `left`
geçişleri kullanılmaz. Reduced motion durumunda geçişler anlık olur.

## 15. Storybook matrisi

Zorunlu sayfa story'leri:

1. İlk açılış
2. Analiz ediliyor
3. Sonuçlar
4. Karşılaştırma seçili
5. Sıfır sonuç
6. Hata
7. Düşük güven ve netleştirme
8. Uzun Türkçe içerik
9. Dar container
10. Orta container
11. Kağıt tema
12. Grafit tema
13. Erişilebilirlik ve klavye akışı

Sayfa bileşeni gerekli başlangıç state'lerini kontrollü fixture/prop veya
Storybook loader ile yeniden üretilebilir biçimde sunacaktır.

## 16. Test kabul kriterleri

### 16.1 Domain testleri

- Türkçe şehir ve ilçe ayrıştırma
- Arsa, konut ve iş yeri türleri
- Satın alma, kiralama ve yatırım amacı
- `3+1` değerinin bütçe sanılmaması
- `5 milyon`, `5.000.000 TL` ve `750 bin` normalizasyonu
- Minimum ve maksimum bütçe
- Tüm zorunlu kriterlerin filtrelemeye katılması
- Tercihlerin eşleşme gerekçesine katılması
- Eksik verinin olumlu sinyal sayılmaması

### 16.2 Component testleri

- İlk açılışta yalnız tek composer bulunması
- Boş sorgunun gönderilmemesi
- Analiz, sonuç, empty ve error geçişleri
- Kriter kaldırma ve düzenleme
- Favori toggle
- Karşılaştırma ekleme, çıkarma ve üç ilan limiti
- İlan drawer'ı içeriği ve focus dönüşü
- Güven/kaynak drawer'ı
- İnsan danışman consent onay ve ret akışı
- URL search parametrelerinin korunması
- `main-content`, live region ve accessible control adları
- IME composition sırasında erken gönderim olmaması

### 16.3 Görsel ve responsive kabul

- Geniş container'da 8/4 hizası
- Orta container'da profil satırına dönüşüm
- 390px dar görünümde taşma olmaması
- Kağıt ve Grafit temada kontrast
- Uzun başlık, fiyat ve Türkçe kelimelerde taşma olmaması
- Global header ve dock ile içerik çakışmaması

## 17. Doğrulama

Uygulama tamamlandığında şu kontroller çalıştırılır:

```bash
npm test
npx tsc -b
npm run typecheck:web
npm run lint
npm run build
```

Tarayıcı bağlantısı kullanılabilir olduğunda `/ai-danisman` masaüstü, tablet
ve mobil boyutlarda Kağıt/Grafit temalarda görsel ve etkileşimli olarak
incelenir. Tarayıcı bağlantısı kullanılamazsa bu eksik doğrulama açıkça
raporlanır; test veya build sonucu görsel kontrol yerine sunulmaz.

## 18. Kapsam dışı

- Gerçek üretim AI servisi
- Gerçek kullanıcı hesabına favori yazma
- Gerçek fiyat alarmı gönderme
- Gerçek danışmana mesaj veya randevu iletme
- Ödeme, kredi skoru veya hukuki uygunluk kararı
- Global navigasyon veya rota adlarını değiştirme
- Mevcut marka kimliğini değiştirme

Frontend prototipi, bu işlemleri yapılmış gibi göstermeyecektir. Dış aksiyon
gerektiren yüzeyler açıkça demo/önizleme durumunu belirtir.

## 19. Kaynak ilkeleri

Tasarım kararları doğal dilde aramayı merkezde tutar; açıklanabilirlik,
kullanıcı düzeltmesi ve yüksek etkili aksiyonlarda açık onayı zorunlu kılar.
Referanslar:

- Google PAIR, Explainability + Trust:
  https://pair.withgoogle.com/guidebook-v2/chapter/explainability-trust/
- Google PAIR, Feedback + Control:
  https://pair.withgoogle.com/guidebook-v2/chapter/feedback-controls/
- Microsoft HAX, Guidelines for Human-AI Interaction:
  https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/
- Zillow doğal dil emlak araması:
  https://investors.zillowgroup.com/news-and-events/news/news-details/2023/Zillows-new-AI-powered-natural-language-search-is-a-first-in-real-estate/default.aspx
- Realtor.com RealAssist:
  https://mediaroom.realtor.com/2026-06-02-Realtor-com-R-Launches-RealAssist-TM-AI-A-Completely-Reimagined-Way-to-Find-A-Home
