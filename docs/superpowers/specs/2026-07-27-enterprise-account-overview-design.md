# Enterprise Hesabım Genel Bakış Tasarım Spesifikasyonu

Tarih: 2026-07-27  
Rota: `/hesabim`  
Durum: Tasarım onaylandı, uygulama planına hazır  
Kapsam: Yalnız hesap genel bakış çalışma alanı

## 1. Amaç

`/hesabim`, alıcı ve bireysel satıcıların hesap durumunu, güncel işlerini ve
güven adımlarını tek bakışta anlayabildiği sakin bir hesap merkezi olacaktır.
Sayfa ayarlar kataloğu veya her ürünü tekrar eden bir kontrol paneli değildir.
Kullanıcının bugün ne yapması gerektiğini, neden önemli olduğunu ve hangi gerçek
rotaya ilerleyeceğini açıkça gösterir.

Birincil başarı ölçütü şudur:

> Kullanıcı ilk görünümde hesap güvenini ve en önemli üç işini anlayabilmeli,
> tek bir belirgin aksiyonla doğru sonraki adıma ilerleyebilmelidir.

## 2. Mevcut durum ve problem tanımı

Mevcut uygulamada `/hesabim` rotası gerçek ürün içeriği yerine
`RoutePlaceholder` gösterir. `/hesabim/mesajlar` rotası da bağımsız bir
placeholder'dır. Buna karşılık Storybook altında eski hesap sayfası örnekleri
bulunur, ancak bunlar:

- uygulama rotalarına bağlı değildir,
- sabit bir sol menüyle henüz var olmayan sayfalara sahte geçişler sunar,
- inline stil ve ham ölçüler kullanır,
- mobil bilgi sırasını çözmez,
- yükleme, kısmi hata, boş hesap ve kısıtlı hesap durumlarını kapsamaz,
- form hatalarını erişilebilir biçimde alanlarla ilişkilendirmez,
- modern `ListingSummary` modeliyle aynı veri sözleşmesini kullanmaz.

Global kabukta hesap rotasına giden kontrolün “Üye girişi” olarak görünmesi de
oturum açmış kullanıcıya ait `/hesabim` içeriğiyle çelişir.

Bu çalışma eski hesap sayfalarını topluca yeniden yazmayacaktır. Yalnız
`/hesabim` için üretime yakın bir genel bakış yüzeyi kuracak ve var olan rota,
tema, global header ile Dock yapısını koruyacaktır.

## 3. Araştırma temeli

Tasarım kararları aşağıdaki güncel ve resmî kaynaklardaki ortak örüntülerden
türetilmiştir:

- [Airbnb hesap ayarları](https://www.airbnb.com/help/article/280): kimlik,
  giriş ve güvenlik, gizlilik, bildirimler ve ödeme gibi görevleri ayrı
  sorumluluk alanları olarak düzenler.
- [Google Güvenlik Kontrolü](https://support.google.com/accounts/answer/12629482?hl=tr):
  kullanıcıyı uzun bir ayar listesi yerine öncelikli güvenlik önerilerine
  yönlendirir.
- [Google hesabına erişen cihazlar](https://support.google.com/accounts/answer/3067630?hl=tr):
  son etkinlik ve oturum güvenini zaman ve cihaz bağlamıyla açıklar.
- [Elektronik İlan Doğrulama Sistemi](https://eids.ticaret.gov.tr/): kimlik ve
  taşınmaz pazarlama yetkisinin doğrulanmasını ilan güveninin ayrı bir katmanı
  olarak tanımlar.
- [Ticaret Bakanlığı EİDS yetki doğrulama duyurusu](https://icticaret.ticaret.gov.tr/haberler/elektronik-ilan-dogrulama-sistemi-eids-yetki-dogrulama-uygulamasi-hayata-gecirildi):
  emlak ilanlarında yetki doğrulamasının ürün içindeki önemini destekler.
- [KVKK kişisel verilerin silinmesi rehberi](https://www.kvkk.gov.tr/Icerik/2038/kisisel-verilerin-silinmesi-yok-edilmesi-veya-anonim-hale-getirilmesi):
  veri silme gibi geri döndürülemez süreçlerin ayrı, açık ve doğrulanabilir bir
  akış gerektirdiğini gösterir.
- [WCAG 2.2 yeni başarı ölçütleri](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/):
  hedef boyutu, görünür odak, gizlenmeyen odak ve tutarlı yardım ilkelerini
  destekler.

Araştırmadan çıkarılan ürün kararı, hesap merkezini bir menü deposu yerine
“kimlik + öncelik + güven + son etkinlik” omurgası üzerinde kurmaktır.

## 4. Tasarım okuması

Bu ekran bir pazarlama landing page'i değil, güven odaklı bir ürün çalışma
alanıdır. Tasarım mevcut arsam.net kimliğini hedefli biçimde geliştirir.

- Tasarım varyansı: 4/10
- Motion yoğunluğu: 3/10
- Bilgi yoğunluğu: 5/10
- Görsel karakter: sakin, sıcak, güvenilir, ölçülü premium
- Temalar: Kağıt ve Grafit
- Tipografi: mevcut Manrope ailesi
- Vurgu: yalnız `--lg-accent`
- İçerik yüzeyleri: flat
- Cam: yalnız navigasyon ve doğrudan kontrol katmanı
- Ayırma yöntemi: boşluk, hairline border ve tipografik hiyerarşi
- Gölge: içerik panellerinde kullanılmaz
- Sayılar: tabular figures
- Başlık ağırlıkları: yalnız mevcut 600 ve 700 kademeleri

Uygulama şu bağlayıcı dokümanlara uyar:

- `src/design/GenelBakis.mdx`
- `src/design/Tokenlar.mdx`
- `src/design/EksenlerVeDurumlar.mdx`
- `src/design/ErisilebilirlikMotionResponsive.mdx`
- `src/design/ComponentSablonu.mdx`

## 5. Hedefler

### 5.1 Ürün hedefleri

1. Hesap kimliği ve doğrulama durumunu görünür kılmak.
2. En önemli en fazla üç işi deterministik biçimde sıralamak.
3. Alıcı ve satıcı faaliyetlerini tek özet içinde birleştirmek.
4. İlan, favori ve ilan verme gibi gerçek rotalara güvenilir geçiş vermek.
5. Veri kaynaklarından biri hata verdiğinde kalan içeriği kullanılabilir
   tutmak.
6. Yeni hesap, kısıtlı hesap ve oturum süresi dolmuş hesap durumlarını açıkça
   tasarlamak.
7. Storybook ve testlerle tekrar üretilebilir bir sayfa sözleşmesi kurmak.

### 5.2 Deneyim hedefleri

- İlk görünümde tek bir birincil aksiyon bulunur.
- Kullanıcı “neden bunu önce yapmalıyım?” sorusunun cevabını aynı bölgede görür.
- Durumlar yalnız renk veya ikonla anlatılmaz.
- Sayfa masaüstünde simetrik bir eksene, mobilde doğru görev sırasına sahiptir.
- Global Dock klavye odağını veya son içeriği örtmez.
- Sayfa, sahte link veya çalışanmış gibi görünen sahte güvenlik kontrolü
  içermez.

## 6. Kapsam dışı

Bu sürüm aşağıdakileri içermez:

- `/hesabim/mesajlar` yeniden tasarımı,
- profil veya hesap ayarları formu,
- şifre değiştirme,
- diğer oturumları sonlandırma,
- hesap silme,
- fatura ve ödeme yönetimi,
- gerçek kimlik veya EİDS servis çağrısı,
- şirket/ofis yönetim paneli,
- yeni backend endpoint'i,
- `GlassListingManagementCard` yaşam döngüsünü genişletme,
- favori listesini `/hesabim` içinde tekrar üretme,
- eski Storybook hesap sayfalarını topluca silme.

Kapsam dışı işlemler çalışıyormuş gibi gösterilmez. Gerçek bir rota yoksa
kontrol da yoktur.

## 7. Kullanıcı rolleri

Sayfa üç görünüm varyasyonunu destekler:

### 7.1 Alıcı

İlanı olmayan, favori ve kayıtlı arama odaklı kullanıcıdır. İlan metrikleri
sıfır olabilir; boş alan yerine faydalı başlangıç yönlendirmesi gösterilir.

### 7.2 Bireysel satıcı

Yayındaki veya işlem gerektiren ilanları bulunan kullanıcıdır. İlan durumu ve
EİDS görevi daha yüksek öncelik alır.

### 7.3 Hibrit

Hem arayan hem ilan veren kullanıcıdır. Aynı sayfada iki ayrı panel hiyerarşisi
kurulmaz; öncelik motoru görevleri önem sırasına dizer.

Kurumsal veya ofis üyeliği bu sürümde yalnız kimlik alanında rol rozeti olarak
gösterilebilir. Ayrı bir kurumsal bilgi mimarisi başlatmaz.

## 8. Bilgi mimarisi

Sayfa `main#main-content` içinde tek bir sınırlı içerik konteyneri kullanır.
Masaüstü ve mobilde DOM sırası aynıdır.

### 8.1 Kimlik başlığı

İçerik:

- avatar,
- “Mehmet Yılmaz” gibi gerçekçi görünen kullanıcı adı,
- hesap rolü,
- e-posta doğrulama durumu,
- telefon doğrulama durumu,
- EİDS durumu,
- yalnız bir belirgin ana aksiyon.

Ana aksiyon seçimi:

1. Satıcı veya hibrit rolünde “Yeni ilan ver” bağlantısı `/ilan-ver` rotasına
   gider. EİDS eksikse doğrulamanın ilan verme akışında tamamlanacağı yardımcı
   metinde dürüstçe belirtilir.
2. Alıcı rolünde “İlanları keşfet” bağlantısı `/emlak` rotasına gider.

Yalnız gerçek rotası olan seçenek render edilir. Birincil aksiyon seçilemezse
başlık eylemsiz kalır; sahte kontrol eklenmez.

### 8.2 Bugünkü gündem

En fazla üç öncelikli iş gösterilir. Her iş şunları taşır:

- doğrudan eylem adı,
- bir cümlelik somut neden,
- durum veya son tarih,
- gerçek sonraki adım.

Örnekler:

- “İlanını yayınlamaya başla”
- “Fiyatı düşen favorilere bak”
- “Kayıtlı aramana uyan yeni ilanları incele”

AI, yalnız bu işlerin neden önceliklendirildiğini açıklayabilir. Kullanıcı
onayı olmadan filtre, ilan, alarm, profil veya güvenlik ayarı değiştiremez.
“AI” etiketi ancak açıklama gerçekten türetilmişse gösterilir.

### 8.3 Hesap metrikleri

Dört ayrı kart yerine tek bir `GlassMetricStrip` kullanılır:

1. Yayındaki ilan
2. İşlem gereken ilan
3. Okunmamış mesaj
4. Aktif alarm

Metrikler domain özetinden türetilir, fixture içinde birbirinden bağımsız
elle yazılmaz. “0” değeri saklanmaz. Değerler yön bilgisi taşımıyorsa trend
okları kullanılmaz.

### 8.4 Ana çalışma alanı

Masaüstünde tek bir 2:1 grid kullanılır:

- Sol kolon: son iki ilan veya alıcı için başlangıç durumu
- Sağ kolon: hesap güvenliği özeti

Sol kolon son iki ilanı `GlassListingManagementCard` ile gösterir. Kartta yalnız
component'in desteklediği yaşam döngüsü durumları kullanılır:
`draft`, `review`, `live`, `changes`, `paused`, `expired`.
`rejected`, `sold` veya EİDS durumu bu değerlerden birine yanlış eşlenmez.
Desteklenmeyen durumdaki ilan özet kartına alınmaz ve domain katmanında
izlenebilir biçimde dışarıda bırakılır.

Sağ kolon:

- e-posta ve telefon doğrulama özeti,
- EİDS özeti,
- son başarılı giriş zamanı ve genel cihaz/konum metni,
- veri kaynağına ait güncellik bilgisi

içerir. “Tüm oturumları kapat” veya “Şifre değiştir” gibi backend'i olmayan
kontroller gösterilmez.

### 8.5 Son etkinlik ve kayıtlı arama

Alt bölüm iki sorumluluğu dengeli biçimde gösterir:

- `GlassTimeline` ile en yeni hesap/ilan olayları,
- en fazla bir kayıtlı arama veya alarm özeti.

Favoriler sayfaya kopyalanmaz. İlgili gerçek geçiş `/favoriler` rotasına gider.
Etkinlik boşsa açıklayıcı bir başlangıç durumu gösterilir.

## 9. Yerleşim ve görsel ritim

### 9.1 Masaüstü

- Tüm bölümler ortak konteyner başlangıç ve bitiş çizgisini kullanır.
- Kimlik başlığı, gündem ve metrik şerit tam genişliktedir.
- Ana çalışma alanı 2:1 oran hissi veren kontrollü grid'dir.
- Alt bölüm masaüstünde 2:1 grid kullanır: etkinlik solda, kayıtlı arama sağda.
  Kayıtlı arama yoksa etkinlik alanı tam genişliğe yayılır; DOM sırası değişmez.
- Bölüm başlıkları aynı baseline ve boşluk sistemini kullanır.
- Paneller gereksiz eş yükseklik zorlaması yapmaz.

### 9.2 Tablet

- Kimlik ve metrikler genişliği korur.
- Ana çalışma alanı tek kolona iner.
- Aksiyonlar okunabilir satır kırılımıyla yerleşir.
- Yatay scroll oluşmaz.

### 9.3 Mobil

Sıra:

1. Kimlik
2. Bugünkü gündem
3. Metrikler
4. İlanlar veya başlangıç durumu
5. Güvenlik
6. Son etkinlik
7. Kayıtlı arama

Mobil düzen container query ile bileşenin bulunduğu alana göre uyarlanır.
Global Dock için alt güvenli alan ve içerik rezervi ayrılır. Eylemler coarse
pointer ortamında en az `--lg-control-md` hedefini kullanır; bu token coarse
ortamda 44px değerine yükselir.

## 10. Katman ve cam bütçesi

Global `GlassIslandHeader` ve `GlassDock` iki cam yüzey tüketir. `/hesabim`
sayfası içinde yalnız kimlik başlığındaki tek birincil kontrol prominent cam
olur. Gündem eylemleri dahil diğer tüm kontroller flat kalır. Hedef toplam cam
yüzey sayısı 3'tür ve hiçbir zaman 6'yı geçmez. Cam üstüne cam yerleştirilmez.

Rozetler içerik katmanında `material="flat"` kullanır. Kartlar glass surface
olmaz. Büyük blur, büyük gölge, dekoratif gradient ve rastgele parıltı
kullanılmaz.

## 11. Kavramsal veri modeli

Uygulama özelliği aşağıdaki kavramları tanımlar:

```ts
type AccountRole = 'buyer' | 'seller' | 'hybrid'
type VerificationState =
  | 'verified'
  | 'pending'
  | 'missing'
  | 'not-applicable'
  | 'unavailable'
type AccountWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'new-account'
  | 'restricted'
  | 'session-expired'

interface AccountIdentity {
  id: string
  displayName: string
  role: AccountRole
  organizationLabel?: string
  avatarUrl?: string
}

interface AccountVerification {
  email: VerificationState
  phone: VerificationState
  eids: VerificationState
}

interface AccountSecuritySummary {
  lastSuccessfulLogin?: {
    occurredAt: string
    deviceLabel: string
    approximateLocation?: string
  }
  dataUpdatedAt?: string
}

type AccountSectionKey =
  | 'identity'
  | 'metrics'
  | 'listings'
  | 'security'
  | 'activity'
  | 'saved-search'

interface AccountSectionError {
  section: AccountSectionKey
  message: string
}

interface AccountListingPreview {
  id: string
  title: string
  state: 'draft' | 'review' | 'live' | 'changes' | 'paused' | 'expired'
  imageSrc?: string
  imageAlt: string
  priceLabel?: string
  referenceLabel: string
  updatedAt: string
  updatedLabel: string
  issue?: string
  stats: Array<{ id: string; label: string; value: string }>
}

interface AccountActivity {
  id: string
  occurredAt: string
  dateLabel: string
  title: string
  description?: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}

interface AccountSavedSearchSummary {
  id: string
  title: string
  criteriaLabel: string
  newMatchCount: number
  updatedAt: string
}

interface AccountAttentionItem {
  id: string
  kind: 'verification' | 'listing' | 'message' | 'favorite' | 'alarm'
  severity: 'critical' | 'high' | 'normal'
  occurredAt: string
  title: string
  reason: string
  action: AccountAction
  explanationSource: 'rule' | 'ai'
}

type AccountAction =
  { kind: 'route'; label: string; to: '/ilan-ver' | '/favoriler' | '/emlak' }

interface AccountDashboardData {
  identity: AccountIdentity
  verification: AccountVerification
  security: AccountSecuritySummary
  listings: AccountListingPreview[]
  unreadMessageCount: number
  activeAlarmCount: number
  priceDropFavoriteCount: number
  attentionCandidates: AccountAttentionItem[]
  activities: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  sectionErrors: AccountSectionError[]
}

interface AccountWorkspaceProps {
  data: AccountDashboardData
  mode?: AccountWorkspaceMode
}

type RawAccountListingState =
  | AccountListingPreview['state']
  | 'rejected'
  | 'sold'
  | 'eids-pending'

interface RawAccountDashboard {
  viewer: {
    id: string
    displayName: string
    role: AccountRole
    organizationLabel?: string
    avatarUrl?: string
  }
  verification: {
    email?: VerificationState
    phone?: VerificationState
    eids?: VerificationState
  }
  security?: {
    lastSuccessfulLogin?: {
      occurredAt: string
      deviceLabel: string
      approximateLocation?: string
    }
    dataUpdatedAt?: string
  }
  listings: Array<
    Omit<AccountListingPreview, 'state'> & { state: RawAccountListingState }
  >
  unreadMessageCount?: number
  activeAlarmCount?: number
  priceDropFavoriteCount?: number
  attentionCandidates?: AccountAttentionItem[]
  activities?: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  sectionErrors?: AccountSectionError[]
}
```

Model uygulama içi görünüm modelidir. Core component paketine ürün domain'i
taşınmaz.

## 12. Veri akışı ve türetme

```text
account fixtures
  -> account-dashboard-adapter
  -> normalize edilmiş AccountDashboardData
  -> account-summary domain fonksiyonları
     -> metrikler
     -> öncelikli işler
     -> son iki desteklenen ilan
     -> çalışma alanı durumu
  -> AccountWorkspace
  -> odaklı alt bileşenler
```

Kurallar:

1. Adapter bilinmeyen veya eksik alanları normalize eder.
2. Domain fonksiyonları saf ve deterministiktir.
3. Öncelik sırası `critical > high > normal`, ardından en yeni `occurredAt`,
   ardından artan `id` sırasıdır.
4. En fazla üç gündem öğesi döndürülür.
5. Bilinmeyen ilan kimlikleri sessizce başka ilana bağlanmaz.
6. Desteklenmeyen ilan yaşam döngüsü yanlış görsel duruma eşlenmez.
7. Kısmi veri hataları bölüm bazında taşınır.
8. UI fixture ayrıntılarını veya ham backend şekillerini bilmez.
9. Gerçek bir route'u olmayan iş gündem listesine alınmaz.
10. Okunmamış mesaj sayısı metrikte görünebilir; placeholder durumundaki
    `/hesabim/mesajlar` rotasına eylem üretilmez.
11. Son ilanlar `updatedAt` azalan, eşitlikte `id` artan sırada seçilir ve en
    fazla iki kayıt döner.
12. “Yayındaki ilan” yalnız `state === 'live'`, “işlem gereken ilan” yalnız
    `state === 'changes'` kayıtlarını sayar.
13. Ana mod önceliği `session-expired > restricted > loading > new-account >
    ready` sırasıdır. `hasAttention` ve `sectionErrors` mod değildir, hazır
    içeriğin türetilmiş özellikleridir.
14. `normalizeAccountDashboard(raw: RawAccountDashboard): AccountDashboardData`
    senkron ve saf bir adapter'dır. Ağ isteği, iptal ve retry bu frontend
    kapsamına dahil değildir.

## 13. Çalışma alanı durumları

### 13.1 Loading

Gerçek geometriyi taklit eden skeleton'lar gösterilir. Tüm sayfa spinner ile
kilitlenmez. `aria-busy` ilgili çalışma alanına uygulanır.

### 13.2 Ready

Kimlik, öncelik, metrik, ilan, güvenlik ve etkinlik verileri gösterilir.

### 13.3 New account

Boş metrikler gizlenmez. İlan alanında tek bir yönlendirici
`GlassEmptyState` gösterilir. Alıcı için “İlanları keşfet”, satıcı için gerçek
rota varsa “İlan ver” önerilir.

### 13.4 Attention required niteliği

`hasAttention`, ayrı bir ana mod değildir. Kritik veya yüksek öncelikli iş
varsa hazır veya yeni hesap içeriğinde gündemin ilk sırasında görünür. Tüm
sayfa alarm rengine boyanmaz.

### 13.5 Partial error niteliği

Hata veren bölüm `GlassAlert` ile yerel açıklama gösterir. Diğer bölümler
çalışmaya devam eder. Yeniden deneme callback'i yoksa “Tekrar dene” butonu
render edilmez.

### 13.6 Restricted

Hesap kısıtlamasının etkisi ve kullanıcıya açık gerçek sonraki adım gösterilir.
Kısıtlama nedeni bilinmiyorsa tahmin üretilmez.

### 13.7 Session expired

Kişisel veri çizilmez. Açık ve tek bir yeniden giriş aksiyonu gösterilir.
Bu aksiyon için gerçek auth rotası yoksa Storybook'ta yalnız demo state olarak
etiketlenir ve production route bu state'i üretmez.

`AccountWorkspaceMode` değerleri birbirini dışlar. `sectionErrors`, hazır veya
yeni hesap içeriğinin bölüm bazlı bozulmuş niteliğidir. `hasAttention` yalnız
türetilmiş bir öncelik işaretidir.

## 14. Etkileşim sözleşmeleri

- Birincil CTA sayfada bir adettir ve feature-local `AccountActionLink`
  bileşeninin `variant="primary"` seçeneğini kullanır.
- `AccountActionLink`, TanStack Router `Link` semantiğini korur. Primary
  varyantta tek bir `GlassSurface` kontrol kabuğu içinde tam alanı kaplayan
  link, secondary ve text varyantlarında flat token tabanlı link render eder.
- İkincil eylemler `AccountActionLink` bileşeninin `secondary` veya `text`
  varyantını kullanır.
- İkon tek başına kullanılırsa `label` zorunludur.
- Navigasyon eylemi gerçek `Link` semantiğiyle çalışır.
- `div` veya kart bütünü butona dönüştürülmez.
- Gündem eylemi yoksa öğe bilgilendirme olarak kalır.
- Başarılı yerel işlem `role="status"` ile duyurulur.
- Hata `role="alert"` ile duyurulur.
- Yükleme sırasında odağın yeri korunur.
- Herhangi bir otomatik AI önerisi kullanıcının verisini veya ayarını
  değiştirmez.

## 15. Erişilebilirlik

- Sayfada bir adet `main#main-content` ve bir adet `h1` bulunur.
- Başlık seviyeleri atlamaz.
- Kimlik, metrik, gündem, ilan, güvenlik ve etkinlik bölgeleri erişilebilir
  adlara sahiptir.
- Durum bilgisi metin ve gerekirse ikonla desteklenir; yalnız renk kullanılmaz.
- `:focus-visible` için
  `outline: var(--lg-focus-ring-width) solid var(--lg-accent)` ve
  `outline-offset: var(--lg-focus-ring-offset)` sözleşmesi uygulanır.
- Mobil dokunma hedefleri `--lg-control-md` altına düşmez.
- Klavye sırası görsel sırayla aynıdır.
- Dock, son odaklanabilir öğeyi örtmez.
- Görsel avatar dekoratifse boş alt kullanır; anlam taşıyorsa uygun ad taşır.
- Skeleton kullanıcı tarafından içerik gibi okunmaz.
- `prefers-reduced-motion` altında geçişler kaldırılır veya anlıklaştırılır.
- `prefers-reduced-transparency` altında cam kontroller opak token yüzeyine
  döner.
- Metin, kontrol ve odak kontrastı Kağıt ve Grafit temada doğrulanır.

## 16. Motion

Motion yalnız durum değişimini açıklamak için kullanılır:

- gündem öğesinin görünmesi,
- bölümün yüklemeden içeriğe geçmesi,
- basınç geri bildirimi.

Yalnız transform, opacity ve gerekiyorsa filter animasyonu kullanılır. Layout
özellikleri animasyonlanmaz. Dekoratif sürekli animasyon, parallax ve ağır
spring kullanılmaz.

## 17. Dosya ve component mimarisi

Yeni özellik uygulama içinde kalır:

```text
apps/web/src/features/account/
├── AccountWorkspace.tsx
├── AccountWorkspace.module.css
├── AccountWorkspace.stories.tsx
├── AccountWorkspace.test.tsx
├── components/
│   ├── AccountOverviewHeader.tsx
│   ├── AccountActionLink.tsx
│   ├── AccountAttentionQueue.tsx
│   ├── AccountListingsPreview.tsx
│   ├── AccountSecuritySummary.tsx
│   ├── AccountActivityList.tsx
│   └── AccountSavedSearchSummary.tsx
├── domain/
│   ├── account-types.ts
│   ├── account-summary.ts
│   └── account-summary.test.ts
├── data/
│   ├── account-dashboard-adapter.ts
│   ├── account-dashboard-adapter.test.ts
│   └── account-fixtures.ts
├── rules.md
└── index.ts
```

Entegrasyon ve E2E dosyaları:

```text
apps/web/src/routes/hesabim.tsx
apps/web/src/routes/hesabim.test.tsx
apps/web/src/components/MarketplaceShell.tsx
apps/web/src/components/MarketplaceShell.test.tsx
apps/web/e2e/account.spec.ts
```

Sorumluluklar:

- `AccountWorkspace`: state orkestrasyonu ve bölüm yerleşimi
- `AccountOverviewHeader`: kimlik, doğrulama ve tek ana CTA
- `AccountActionLink`: gerçek TanStack Router link semantiğiyle primary,
  secondary ve text hesap eylemleri
- `AccountAttentionQueue`: en fazla üç öncelikli iş
- `AccountListingsPreview`: desteklenen son ilanlar veya rol tabanlı boş state
- `AccountSecuritySummary`: doğrulama ve son giriş özeti
- `AccountActivityList`: etkinlik zaman çizelgesi
- `AccountSavedSearchSummary`: tek kayıtlı aramayı flat, eylemsiz tekrar
  içermeyen özet olarak sunma
- `account-types`: ürün domain sözleşmeleri
- `account-summary`: saf türetme ve sıralama
- `account-dashboard-adapter`: ham veriyi görünüm modeline dönüştürme
- `account-fixtures`: gerçekçi ve açıkça demo olan senaryolar
- `rules.md`: feature sözleşmesi, invariants ve erişilebilirlik kararları

Ürün odaklı `GlassAccountDashboard` adlı yeni bir core component eklenmez.
Genel tasarım sistemi yalnız gerçekten tekrar kullanılabilir eksik bir
primitive kanıtlanırsa genişletilir.

## 18. Kullanılacak mevcut component'ler

- `GlassAvatar`
- `GlassBadge` ile `material="flat"`
- `GlassMetricStrip`
- `GlassListingManagementCard`
- `GlassAlert`
- `GlassTimeline`
- `GlassEmptyState`
- `GlassSkeleton`
- `GlassButton`
- `GlassLink`

`GlassSavedSearchCard` bu ekranda kullanılmaz; kendi switch ve butonları hesap
genel bakışının eylem hiyerarşisini tekrarlar. Kayıtlı arama, feature içindeki
flat `AccountSavedSearchSummary` ile sunulur.

## 19. Stil sözleşmesi

`AccountWorkspace.module.css` ve feature alt bileşenlerinin CSS'i:

- yalnız `--lg-*` tokenlarını tüketir,
- raw `px`, raw hex, `rgb`, `hsl`, özel shadow ve `!important` içermez,
- radius için yalnız chip, media, card ve capsule ölçeklerini kullanır,
- kontrol yüksekliğini yalnız `--lg-control-*` tokenlarından alır,
- breakpoint sayıları yerine container ve capability query kullanır,
- içerik panellerine backdrop-filter uygulamaz,
- tek yönlü sıcak nötr paleti korur.

Ham ölçü gerekiyorsa önce `src/index.css` içindeki mevcut tokenın uygunluğu
kanıtlanır. Bu özellik için yeni token eklemek varsayılan çözüm değildir.

## 20. Rota ve kabuk entegrasyonu

### 20.1 `/hesabim`

`apps/web/src/routes/hesabim.tsx`:

- `createPageHead('account')` kullanımını korur,
- noindex davranışını korur,
- `RoutePlaceholder` yerine `AccountWorkspace` render eder,
- frontend aşamasında açıkça demo olarak adlandırılmış
  `defaultAccountDashboardFixture` verisini adapter üzerinden verir.

### 20.2 Global hesap etiketi

Global shell gerçek auth state taşımadığı için ürün genelindeki “Üye girişi”
etiketi kalır. Yalnız `currentRoute.scope === 'account'` olduğunda aynı kontrol
“Hesabım” metnini gösterir. Böylece hesap ekranı kendi bağlamında çelişmez,
diğer rotalarda oturum varsayımı yapılmaz. Shell'in mevcut programatik
navigasyon tekniğini Link'e dönüştürmek bu feature kapsamına dahil değildir.

### 20.3 Route tree

`routeTree.gen.ts` elle düzenlenmez. TanStack Router'ın üretim akışı gerekiyorsa
mevcut proje komutu kullanılır.

### 20.4 Eski Storybook hesap sayfaları

Eski `HesapOzeti` dosyalarına dokunulmaz. Yeni story'nin title değeri
`Sayfalar/Hesabım/Enterprise Genel Bakış` olur ve çakışma yaratmaz.

## 21. Storybook matrisi

`AccountWorkspace.stories.tsx` aşağıdaki senaryoları içerir:

1. `Default`
2. `AliciHesabi`
3. `IslemGerekiyor`
4. `YeniHesap`
5. `Loading`
6. `PartialError`
7. `Restricted`
8. `UzunIcerik`
9. `Mobile390`
10. `Tablet768`
11. `Kagit`
12. `Grafit`
13. `Erisilebilirlik`
14. `SessionExpired`

Story başlığı mevcut sıralamaya uyan ürün sayfası grubunda yer alır. Her story
aynı fixture modelinden türetilir; UI içinde rastgele veri oluşturulmaz.

## 22. Test stratejisi

### 22.1 Domain testleri

- metrikler kaynak listelerden doğru türetilir,
- öncelik severity, tarih ve id ile deterministik sıralanır,
- gündem en fazla üç öğe içerir,
- desteklenmeyen ilan yaşam döngüsü yanlış eşlenmez,
- bilinmeyen ilan kimliği başka bir ilana bağlanmaz,
- rol tabanlı ana aksiyon doğru seçilir,
- ana state'ler birbirini dışlar.

### 22.2 Adapter testleri

- eksik avatar güvenli biçimde normalize edilir,
- eksik güvenlik verisi `unavailable` olur,
- geçersiz tarih kontrollü biçimde dışarıda bırakılır,
- kısmi kaynak hatası yalnız ilgili bölüme taşınır,
- fixture ve gelecekteki API şekli UI'ya sızmaz.

### 22.3 Component testleri

- yalnız bir `main` ve bir `h1` bulunur,
- heading sırası doğrudur,
- gerçek rotası olmayan hesap aksiyonu render edilmez,
- route aksiyonu gerçek link semantiği kullanır,
- kritik durum yalnız renkle anlatılmaz,
- loading, new-account, partial-error ve restricted içerikleri doğrudur,
- AI açıklaması eylem mutasyonu üretmez,
- boş liste için doğru rol tabanlı empty state görünür,
- session-expired modunda kimlik, ilan ve mesaj verileri çizilmez,
- `main#main-content` içindeki `[data-material="glass"]` sayısı biri geçmez;
  global Header ve Dock birleşik navigasyon yüzeyleri olarak ayrıca doğrulanır,
- `AccountActionLink[data-variant="primary"]` sayısı tam olarak birdir.

### 22.4 Rota testi

`apps/web/src/routes/hesabim.test.tsx`, memory router ile gerçek `/hesabim`
rotasını açar ve:

- placeholder'ın bulunmadığını,
- hesap çalışma alanının render edildiğini,
- sayfa head tanımının account rotasını kullandığını,
- gerçek CTA hedeflerinin doğru olduğunu

doğrular.

### 22.5 Görsel ve responsive doğrulama

- Mobile390 görünümünde yatay taşma yoktur.
- Tablet768 görünümünde ana içerik tek kolona doğru sırayla iner.
- Kağıt ve Grafit temada içerik ve odak kontrastı okunur.
- Klavye ile tüm eylemlere mantıklı sırayla ulaşılır.
- Son odaklanabilir kontrol Dock arkasında kalmaz.
- Reduced motion ve reduced transparency tercihleri karşılanır.
- Coarse pointer kontrol hedefleri token sözleşmesine uyar.

`apps/web/e2e/account.spec.ts` gerçek rotada aşağıdakileri otomatik doğrular:

- masaüstü ve mobil ekran görüntüsü,
- `scrollWidth <= clientWidth`,
- Axe serious ve critical ihlal sayısının sıfır olması,
- son klavye odağının Dock tarafından örtülmemesi,
- reduced-motion ortamında nonessential transition bulunmaması,
- `main#main-content` içindeki cam yüzey sayısının biri geçmemesi ve Header ile
  Dock birleşik yüzeylerinin ayrı ayrı var olması.

## 23. Kabul kriterleri

Uygulama tamamlanmış sayılır, ancak aşağıdakilerin tümü sağlanırsa:

1. `/hesabim` placeholder yerine gerçek hesap genel bakışını gösterir.
2. İlk görünümde birden fazla prominent CTA yoktur.
3. En fazla üç öncelikli iş görünür ve her biri somut neden taşır.
4. Metrikler tek bir `GlassMetricStrip` içinde türetilmiş veriden gelir.
5. Son iki ilan yalnız semantik olarak desteklenen durumlarla gösterilir.
6. E-posta, telefon, EİDS ve son giriş bilgisi ayrı anlamlarla görünür.
7. Kısmi veri hatası tüm sayfayı çökertmez.
8. Yeni hesap ve kısıtlı hesap durumları kullanılabilir içerik sunar.
9. Sahte link, noop buton veya gerçekleşmeyen başarı mesajı yoktur.
10. İçerik yüzeylerinde cam, büyük gölge veya gradient yoktur.
11. Feature CSS'i yalnız `--lg-*` tokenlarını kullanır.
12. Kağıt ve Grafit story'leri ile Mobile390 ve Tablet768 story'leri vardır.
13. Domain, adapter, workspace ve rota testleri geçer.
14. Session-expired story'si ve kişisel veri sızıntısını engelleyen testi vardır.
15. `apps/web/e2e/account.spec.ts` Axe, overflow, Dock odağı, reduced motion ve
    cam bütçesini otomatik doğrular.
16. Typecheck, lint ve ilgili testler geçer.
17. Tarayıcıda masaüstü ve mobil görünüm görsel olarak doğrulanır.
18. Global hesap kontrolü hesap scope'unda “Hesabım”, diğer rotalarda “Üye
    girişi” metnini gösterir.

## 24. Kararlar ve değişmezler

- V1'de yerel hesap sidebar'ı yoktur.
- Genel bakışta yalnız bir prominent CTA vardır.
- Gündem en fazla üç öğedir.
- AI yalnız açıklama yapar, işlem yapmaz.
- Favoriler `/favoriler` içinde kalır.
- Gerçek olmayan hesap alt rotaları gösterilmez.
- Core'a ürün özel hesap dashboard component'i eklenmez.
- Desteklenmeyen ilan durumları yaklaşık bir duruma çevrilmez.
- Global header ve Dock korunur.
- `routeTree.gen.ts` elle düzenlenmez.
- Eski kullanıcı dosyaları topluca silinmez.
- Bu sürüm backend veya auth mimarisini genişletmez.

Bu kararların hiçbiri uygulama sırasında sessizce değiştirilmez. Kapsamı
etkileyen yeni bir zorunluluk çıkarsa plan açıkça güncellenir.
