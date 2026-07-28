# ComparisonWorkbench sözleşmesi

- Karşılaştırma tablosu düz yüzeyli ve klavye erişilebilir olmalıdır.
- AI özeti yalnızca bilgilendirir; otomatik işlem başlatmaz.
- En fazla dört ilan karşılaştırılır; kaldırma kullanıcı onayıyla gerçekleşir.
- Risk, doğrulama ve uygunluk sinyalleri metinle birlikte gösterilir.
- Route-driven karşılaştırma URL'deki geçerli ilan sırasını korur; bilinmeyen
  kimlikleri sessizce atar ve kaynakta olmayan alanları `Bilgi sağlanmadı`
  olarak gösterir.
- Route-driven ilan görselinde `getRepresentativeListingImage(listing).src`
  ana kaynak, aynı helper'ın `fallbackSrc` değeri `imageFallback` olmalıdır;
  adapter ve workbench bu çifti `GlassCompareTable`'a eksiksiz taşır.
- Route-driven karşılaştırmada temsili görsel kullanımı görünür olarak tam şu
  metinle açıklanır: `Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.`
  Metin kopyalanmaz; tek kaynak `listings/data/listing-photos.ts` içindeki
  `REPRESENTATIVE_IMAGE_NOTE` sabitidir — ilan detayı da aynı sabiti yazar.
- Changelog: 2026-07-28 — temsili görsel açıklaması tek kaynaklı sabite
  (`REPRESENTATIVE_IMAGE_NOTE`) bağlandı; metin aynen korundu.
- Changelog: 2026-07-27 — temsili görsel fallback zinciri ve görünür açıklama
  route sözleşmesine eklendi.
