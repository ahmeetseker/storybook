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
nedeni yazılır. Yerleşim "Yön A" şemasıdır — kategori yolu → başlık →
ilk görünüm (medya + karar özeti) → bölüm indeksi → kanıt bölümleri + karar
rayı → satıcı.

Bölüm sırası tek kaynaktan gelir: `components/listing-sections.ts`
(`LISTING_SECTIONS`). Bölüm indeksindeki etiket ile bölümün `<h2>` metni
birebir aynıdır ve her `href="#id"` hedefi DOM'da bulunur
(`ListingDetailAccessibility.test.tsx` bunu tarar).

## 2. Cam bütçesi

Sayfa başına **en fazla 6 cam yüzey**; test `ListingDetailWorkspace.test.tsx`
ve `ListingDetailAccessibility.test.tsx` içinde
`[data-material="glass"]` sayımıyla korunur.

| Cam yüzey | Nerede | Katman |
|---|---|---|
| `GlassBreadcrumb` | sayfa başı kategori yolu | navigasyon |
| `GlassSurface as="nav"` | sticky bölüm indeksi | navigasyon |
| `GlassDetailActionBar` | karar rayı | kontrol |
| `GlassButton` "Numarayı göster" | satıcı bölümü | kontrol |

Kalan iki yüzey **rezervdir** (Faz 2 sohbet dock'u / mobil alt çubuk). Kanıt
bölümlerinin hepsi içerik katmanındadır: düz yüzey (`--lg-surface` +
`--lg-hairline`), cam açmazlar. Cam üstüne cam yoktur — karar rayındaki satıcı
özeti ve `GlassDataProvenance` künyeleri düz yüzeydir.

## 3. EİDS ve doğrulama dili

- EİDS metni ve kapsam notu **tek kaynaktan** gelir: `EIDS_SCOPE_NOTE`
  (`data/listing-detail-fixtures.ts`). Metin kopyalanmaz.
- "Doğrulandı" tek başına kullanılmaz; her doğrulama satırı neyi
  **kapsamadığını** da söyler (`VerificationRow.scopeNote`).
- **TTBS** işletmenin faaliyet yetkisidir; ilan içeriğini doğrulamaz. Satıcı
  bölümünde bu cümle görünür metindir:
  `TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.`
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
`Responsive` · `Temalar` · `Numara alınamadı`. Her story sabit `now` ile
yükler.

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

- 2026-07-27 — Faz 0+1, Yön A (Karar Dosyası) yerleşimiyle ilk sürüm.
