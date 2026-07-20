# Product

## Register

product

## Users

React ürün ekipleri, arayüz geliştiricileri ve tasarım inceleyen karar vericiler bu Storybook kütüphanesini Türkçe ilan ve pazar yeri deneyimleri oluşturmak, bileşen durumlarını karşılaştırmak ve üretime alınacak görsel yönü seçmek için kullanır. Deneyim; masaüstü, dokunmatik, klavye ve yardımcı teknoloji kullanıcılarında aynı sözleşmeyi korumalıdır.

## Product Purpose

Apple Liquid Glass ilkelerini web için progressive enhancement ile uygulayan, ancak içeriği cam efektine feda etmeyen üretim kalitesinde bir React component sistemi sunmak. Başarı; mevcut component ve story'leri bozmadan alternatif tasarım yönlerini yan yana değerlendirebilmek, seçilen yönü tutarlı token ve state kurallarıyla sayfalara taşıyabilmek ve her varyantın erişilebilir biçimde çalışmasıdır.

## Brand Personality

Hassas, sakin, dokunsal. Arayüz gösteriş için değil güven, okunabilirlik ve kontrollü derinlik için tasarlanır. Türkçe ürün dili kısa, doğrudan ve kendinden emindir.

## Anti-references

- Her yüzeyi cam yapan ve içerik hiyerarşisini bulanıklaştıran dekoratif glassmorphism.
- Her öğeyi tam kapsül veya 20–40px radius yapan aşırı yuvarlak Codex görünümü.
- Aynı öğede 1px border ile geniş, yumuşak gölgeyi birleştiren “ghost card” kalıbı.
- Mor-mavi AI gradyanları, rastgele neon vurgular ve birbirinden kopuk tema renkleri.
- Aynı boyda kart ızgaraları, kart içinde kart ve gereksiz modal katmanları.
- Durum iletmeyen hareket, %5 ve üzeri hover büyümeleri ve odak göstergesinin gölgede kaybolması.
- Aynı işi yapan kontrollerin sayfadan sayfaya farklı görünmesi.

## Design Principles

1. Görev önce gelir: standart etkileşimler tanıdık, hızlı ve öngörülebilir kalır.
2. Cam kullanımını hak eder: Liquid Glass yalnız navigasyon, geçici kontrol ve medya üstü işlev katmanında kullanılır.
3. Geometri hiyerarşi kurar: iç öğe dış kapsayıcıdan daha sıkı radius alır; kapsül yalnız gerçek pill davranışına ayrılır.
4. Durumlar eksiksizdir: default, hover, focus, active, disabled, loading, error ve selected aynı görsel sözlükte çözülür.
5. Karşılaştırma açıktır: deneysel Codex varyantları mevcut component ve story'leri değiştirmeden ayrı ad alanında sunulur.

## Accessibility & Inclusion

WCAG 2.2 AA hedeflenir. Normal metin en az 4.5:1, büyük metin ve UI sınırları uygun olduğunda en az 3:1 kontrast taşır. Tüm etkileşimler görünür `:focus-visible` göstergesine, semantik HTML/ARIA'ya ve anlaşılır accessible name'e sahiptir. Dokunmatik ana kontroller en az 44px hedeflenir; `prefers-reduced-motion`, `prefers-reduced-transparency`, %200 metin büyütme ve renk dışı durum işaretleri desteklenir.
