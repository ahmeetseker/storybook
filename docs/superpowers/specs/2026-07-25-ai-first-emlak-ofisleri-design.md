# AI-First Emlak Ofisleri Tasarım Spesifikasyonu

## Ürün amacı

`/ofisler` rotası; alıcı, kiracı, satıcı ve mülk sahibini tek bir AI görüşmesi
üzerinden doğru emlak ofisiyle buluşturan kurumsal keşif ve güven yüzeyi olur.
Sayfa yalnız ofis kartlarını listelemez; kullanıcının amacını yapılandırır,
kanıta dayalı eşleşme üretir ve iletişim/randevu/teklif aksiyonlarını kullanıcı
onayından sonra başlatır.

## Tasarım okuması

Güvenin kritik olduğu emlak pazarında, premium fakat yüksek bilgi yoğunluklu bir
enterprise ürün dili kullanılacaktır. AI-first giriş, düz ve taranabilir filtre
rail'i, yoğun ofis sonuçları ve kanıt paneli birlikte çalışır. Sayfada tek ana
AI yüzeyi bulunur; filtre ve sonuç katmanları gereksiz cam katmanları oluşturmaz.

## Hedef kullanıcılar ve niyetler

- Alıcı: uygun bölgede ve mülk tipinde uzman ofis bulur.
- Kiracı: hızlı yanıt veren, kiralama portföyü güçlü ofis bulur.
- Satıcı: mülkünü pazarlayabilecek bölge uzmanlarını karşılaştırır.
- Mülk sahibi: değerleme, satış veya kiralama teklifi toplar.

Niyetler: `buy`, `rent`, `sell`, `valuate`. AI görüşmesi bu niyetlerden birini
ve aşağıdaki yapılandırılmış alanları üretir: `propertyType`, `location`,
`budget`, `timeline`, `expertise`, `communicationPreference`.

## Bilgi mimarisi

### Header ve giriş yüzeyi

Mevcut marketplace shell korunur. Sayfa başında tek kompakt AI arama alanı
bulunur. Placeholder örneği:

> İzmir Urla'da arsasını satmak isteyen, imar konusunda uzman bir ofis arıyorum.

Hızlı niyet seçenekleri: Ev almak istiyorum, Ev kiralamak istiyorum, Mülkümü
satmak istiyorum, Arsa veya ticari mülk için uzman arıyorum.

### AI eşleşme özeti

Parse sonrası kullanıcıya kısa bir özet gösterilir: “Urla’da arsa satışı ve
imar danışmanlığı konusunda 8 doğrulanmış ofis bulundu.” Özet; parse edilen
niyet chip’lerini, temizleme/düzenleme aksiyonunu ve eşleşme durumunu içerir.

### Enterprise workspace

Masaüstünde üç bölge vardır:

1. Sol filtre rail'i: amaç, mülk tipi, bölge, uzmanlık, doğrulama, yanıt süresi,
   dil, ofis büyüklüğü, aktif portföy ve işlem tecrübesi.
2. Orta sonuç alanı: yoğun, taranabilir ofis kartları ve sıralama.
3. Sağ AI içgörü paneli: seçili ofisin eşleşme gerekçesi, kanıtları ve sonraki
   adımı.

Mobilde filtre rail'i drawer'a dönüşür; AI içgörü paneli seçili ofis drawer'ı
olarak açılır. Karşılaştırma bar'ı sabit alt kontrol olarak çalışır.

## Ofis kartı sözleşmesi

Her kart aşağıdaki bilgileri açıkça gösterir:

- Ofis adı, şehir/bölge ve doğrulama rozeti
- Profil veya ofis görseli
- Uzmanlık alanları
- AI eşleşme skoru ve “Neden önerildi?” özeti
- Aktif portföy sayısı
- Doğrulanmış değerlendirme özeti
- Ortalama yanıt süresi ve son aktiflik
- `Karşılaştır`, `Mesaj gönder`, `Görüşme talep et` aksiyonları

Kartın iddia ettiği performans verisi bir kanıt etiketiyle kaynaklandırılır:
`İlan verisi`, `Ofis profili`, `Doğrulanmış işlem`, `Kullanıcı değerlendirmesi`.
Veri yoksa değer uydurulmaz; “Veri yok” veya “Doğrulanmadı” gösterilir.

## AI eşleşme ve kanıt modeli

İlk sürümde deterministik mock adapter kullanılır. AI proposal şu şekildedir:

```ts
interface OfficeSearchBrief {
  intent: 'buy' | 'rent' | 'sell' | 'valuate'
  propertyType?: string
  location?: string
  budget?: { min?: number; max?: number }
  timeline?: 'urgent' | 'this-month' | 'this-quarter' | 'exploring'
  expertise?: string[]
  communicationPreference?: 'message' | 'call' | 'meeting'
}

interface OfficeMatchEvidence {
  label: string
  value: string
  source: 'listing-data' | 'office-profile' | 'verified-transaction' | 'review'
  observedAt?: string
}

interface OfficeMatch {
  officeId: string
  score: number
  reasons: string[]
  evidence: OfficeMatchEvidence[]
}
```

Skor tek başına karar verdirmez. Kullanıcı “neden?” açılımıyla gerekçeleri ve
kanıtları görür. AI belirsizlikleri açıklar; hukuki, değerleme veya fiyat
önerilerini bağlayıcı sonuç gibi sunmaz.

## Kullanıcı onaylı aksiyonlar

AI hiçbir dış aksiyonu kendiliğinden başlatmaz. Kullanıcı bir ofis seçtiğinde:

1. AI mesaj/randevu/teklif brief'i taslağı oluşturur.
2. Kullanıcı alıcıları, taslağı ve gönderilecek bilgileri görür.
3. Kullanıcı açıkça onaylar.
4. Mock sürümde aksiyon başarı durumu ve işlem özeti gösterilir.

Onay metni: “Bu bilgileri seçtiğiniz ofise iletmek istediğinizi onaylıyor
musunuz?”

## Durumlar ve hata davranışı

- İlk durum: AI prompt, hızlı niyet seçenekleri ve açıklayıcı boş yüzey.
- Parse ediliyor: skeleton prompt sonucu ve ilerleme açıklaması.
- Sonuç: eşleşme özeti, kartlar ve kanıt paneli.
- Sonuç yok: prompt'u düzenleme, filtreleri gevşetme ve yeni niyet seçme.
- Servis hatası: son geçerli brief korunur, yeniden dene aksiyonu sunulur.
- Eksik veri: skor ve kanıtlar eksikliği açıkça belirtir.
- Onay sonrası: gönderildi, taslak kaydedildi veya başarısız durumları.

## Responsive ve erişilebilirlik

- Masaüstü üç panel; tablet iki bölge; mobil tek akış + drawer.
- Kontroller coarse pointer ortamında minimum 44px hedef kullanır.
- Combobox/listbox ve drawer için mevcut Glass bileşenlerinin klavye/focus
  sözleşmeleri korunur.
- Focus yalnız `:focus-visible` ile gösterilir.
- `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenir.
- AI önerileri ve skorları yalnız renk ile ifade edilmez; metinsel açıklama ve
  ikon/etiket birlikte kullanılır.

## Faz kapsamı

### İlk implementasyon

- Gerçekçi mock ofis adapter'ı
- AI brief parser ve explicit proposal paneli
- Eşleşme skoru + kanıt listesi
- Filtreleme, sıralama ve ofis karşılaştırma
- Mesaj/randevu/teklif onay drawer'ı
- Loading, error, empty ve no-data durumları
- Storybook matrisi, unit/component testleri

### Gelecek entegrasyonları

- Gerçek ofis profilleri ve yetki belgesi doğrulama
- CRM, mesajlaşma ve takvim entegrasyonu
- Bölgesel piyasa sinyalleri ve işlem geçmişi
- Ofis tarafı lead workspace'i
- AI görüşme geçmişi ve kişiselleştirilmiş takip

## Başarı ölçütleri

- Kullanıcı AI brief'ini düzenleyebilmeli ve kaynağını görebilmeli.
- Her ofis önerisi en az bir gerekçe ve kanıt etiketi göstermeli.
- Dış aksiyonlar açık kullanıcı onayı olmadan tetiklenmemeli.
- Eşleşme, filtre, karşılaştırma ve onay akışları klavye ile tamamlanabilmeli.
- Sayfa tüm loading/error/empty durumlarında kullanılabilir kalmalı.
