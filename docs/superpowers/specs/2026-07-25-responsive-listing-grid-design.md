# Responsive Listing Grid Design

## Amaç

Emlak arama sonuçlarının ızgara görünümünde geniş ekran alanını daha verimli
kullanmak ve aynı anda daha fazla ilan karşılaştırılmasını sağlamak.

## Onaylanan düzen

- Mobil sonuç alanında bir kart gösterilir.
- Tablet sonuç alanında iki kart gösterilir.
- Standart masaüstü sonuç alanında üç kart gösterilir.
- Geniş masaüstü sonuç alanında dört kart gösterilir.
- Bölünmüş harita görünümü dar sonuç alanına göre bir veya iki sütun kullanır.
- Kart başlığı en fazla iki satır görünür; fiyat, konum ve temel özellikler korunur.
- Liste görünümünün mevcut yatay yapısı değişmez.

## Tasarım sistemi sınırları

- CSS yalnız `--lg-*` token’larını tüketir; breakpoint değerleri açıklamalı
  container query olarak yazılır.
- Cam yüzey sayısı ve katman modeli değişmez.
- Focus, reduced-motion ve coarse-pointer davranışları korunur.

## Doğrulama

- Component testleri kart sayısını değil görünüm sınıfının doğru uygulanmasını
  doğrular.
- Typecheck, lint ve production build çalıştırılır.
