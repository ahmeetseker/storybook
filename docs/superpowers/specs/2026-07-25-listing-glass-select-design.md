# Listing Glass Select Design

## Amaç

Emlak aramasındaki native işletim sistemi seçim menülerini kaldırarak Kategori,
Şehir ve Sıralama alanlarında tasarım sistemiyle uyumlu tek bir seçim deneyimi
sunmak.

## Onaylanan çözüm

- Mevcut erişilebilir `GlassSelect` yeniden kullanılır.
- Seçim paneli Kağıt/Grafit tema token’larını, amber aktif durumunu ve seçili
  satır tikini kullanır.
- Kapalı kontrol, açık panel ve hata durumunda gölge kullanılmaz.
- Gölgesiz kontrolün sınırı hairline border, token radius ve hafif yüzey
  dolgusu ile okunur tutulur; açık durumda border accent renge geçer.
- Kategori, Şehir ve Sıralama aynı görsel ve etkileşim sözleşmesini paylaşır.
- Klavye yön tuşları, Home, End, Enter, Escape ve typeahead korunur.
- Mobil dokunma hedefi en az 44px olur.
- Native `<select>` elemanları bu üç alandan kaldırılır.

## Doğrulama

- Component testi şehir listbox’ının açıldığını, seçenek seçiminin state
  değişikliği ürettiğini ve native select bulunmadığını doğrular.
- Tam test, lint, typecheck ve production build çalıştırılır.
