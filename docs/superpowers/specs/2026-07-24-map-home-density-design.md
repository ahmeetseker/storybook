# Harita Odaklı Yoğun Ana Sayfa Tasarımı

## Karar

Kullanıcının seçtiği Harita Keşfi yönü gerçek `/` ana sayfasına taşınacak.
Konsept rotası korunacak, fakat ana sayfada konsept seçici görünmeyecek.

Değerlendirilen yönler:

1. Seyrek harita vitrini: Konum fikrini iyi anlatıyor, fakat pazaryeri yoğunluğu vermiyor.
2. Haritasız yoğun katalog: Çok ilan gösteriyor, fakat ürünün ayırt edici konum odağını kaybediyor.
3. Harita odaklı yoğun pazaryeri: Kompakt harita ve AI aramayı yoğun ilan akışıyla birleştiriyor. Kullanıcının seçtiği ve uygulanacak yön budur.

## Tasarım Okuması

Bu sayfa, yüksek satın alma niyetine sahip arsa alıcıları için konum ve güven
odaklı bir pazaryeri başlangıç ekranıdır. Görsel dil mevcut sıcak nötr arsam.net
paletini ve Liquid Glass navigasyon kabuğunu korur.

- Tasarım varyansı: 4/10
- Hareket yoğunluğu: 3/10
- Görsel yoğunluk: 8/10
- Yeniden tasarım modu: mevcut marka ve bilgi mimarisini koruyan hedefli evrim
- Bileşen sistemi: yalnız mevcut `@repo/ui` Glass bileşenleri

## Mevcut Durum Denetimi

### Korunacaklar

- `GlassIslandHeader` ve `GlassDock` ortak kabuğu
- arsam.net kelime markası, sıcak turuncu vurgu ve Manrope tipografisi
- gerçek URL yapısı
- Harita Keşfi hero başlığı ve konum önceliği
- açık ve koyu tema tokenları
- klavye odağı, tek `main`, tek `h1` ve mevcut erişilebilir adlar

### Düzeltilecekler

- Ana sayfanın placeholder olması
- Harita konseptinde yalnız 5 kartın görünmesi
- 4 büyük bölge kartının fazla alan kaplaması
- 420 piksel harita yüksekliğinin metni gereğinden aşağı itmesi
- bölümler arasındaki 56 piksel ritmin katalog için fazla seyrek kalması
- `GlassButton` hover ölçeğinin dış kutuyu görsel olarak büyütmesi
- konsept navigasyonunun gerçek ana sayfada yer kaplaması
- ana sayfanın `noindex` olması

## Sayfa Kompozisyonu

1. Kompakt bölünmüş hero
   - Sol: `GlassHero`, `GlassAiSearchBar`
   - Sağ: `GlassMap`
   - Harita yüksekliği masaüstünde yaklaşık 350 piksel
   - Arama ve harita ilk ekranda birlikte görünür

2. Öne çıkan arsa ilanları
   - `GlassVitrin variant="banded"`
   - 5 büyük öne çıkan ilan
   - Altında 25 mikro ilan
   - Toplam 30 benzersiz ilan

3. Bölge kısayolları
   - 8 eşit hücre
   - Masaüstünde 4 sütun, tablette ve mobilde 2 sütun
   - Tüm hücreler eşit yükseklik ve sabit iç hizaya sahip

4. Örnek pazar özeti
   - `GlassMetricStrip`
   - İlan, bölge ve EİDS işaretli örnek portföy sayıları
   - Sayılar fixture verisinden türetilir

5. Yeni eklenen ilanlar
   - `GlassVitrin variant="list"`
   - 18 benzersiz ilan
   - Masaüstünde 3 kolon, tablette 2, mobilde 1

6. Karşılaştırma bandı
   - Fiyat, imar ve konum karşılaştırmasına tek belirgin geçiş
   - Hover durumunda dış geometri değişmez

7. Doğrulanmış bölge ofisleri
   - 3 adet `GlassAgencyCard variant="inline"`
   - Tam genişlik ve eşit dikey ritim

8. Kompakt alt bilgi
   - `GlassFooter variant="slim"`
   - Sayfa sonunda gereksiz büyük kayıt paneli yok

## Etkileşim ve Geometri

- Sayfa içindeki standart butonlar hover sırasında renk ve gölge geri bildirimi verir.
- Hover, butonun `x`, `y`, `width` veya `height` değerini değiştirmez.
- İlan görseli kendi kırpılmış alanı içinde büyüyebilir, kart kutusu sabit kalır.
- Tüm ana CTA etiketleri tek satırda kalır.
- Sayısal alanlar tabular rakamlarla gösterilir.

## Responsive Davranış

- 1440 piksel: 4 bölge sütunu, 8 kolonlu mikro vitrin, 3 kolonlu yeni ilan listesi
- 784 piksel: 2 bölge sütunu, 6 kolonlu mikro vitrin, 2 kolonlu yeni ilan listesi
- 390 piksel: 2 bölge sütunu, 3 kolonlu mikro vitrin, tek kolonlu yeni ilan listesi
- Yatay taşma olmayacak.
- Mobil Dock içerik için güvenli alt boşlukla korunacak.

## SEO ve Semantik

- `/` indekslenebilir olacak ve canonical bağlantısını koruyacak.
- Konsept rotaları `noindex, nofollow` kalacak.
- Ana sayfada tek `main`, tek `h1` ve sıralı bölüm başlıkları bulunacak.
- İlan vitrinleri kendi `aria-labelledby` ilişkisine sahip bölümlerde yer alacak.

## Başarı Ölçütleri

- `/` Harita Keşfi ana sayfasını gösterir.
- Ana sayfada konsept navigasyonu görünmez.
- İlk vitrin 30, ikinci vitrin 18 tıklanabilir ilan gösterir.
- Bölge hücreleri aynı satırda eşit ölçüdedir.
- Arama gönder butonu hover sırasında dış ölçüsünü korur.
- 390 pikselde yatay taşma yoktur.
- Açık ve koyu temada critical veya serious Axe ihlali yoktur.
- Typecheck, lint, unit, E2E ve production build geçer.
