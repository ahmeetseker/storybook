# AI-first Bölgeler — Tasarım Spesifikasyonu

## Amaç

`/bolgeler`, Türkiye geneli şehir → ilçe → mahalle keşfini; doğal dil AI araması, güvenilir bölge sinyalleri ve emlak/ofis geçişleriyle tek bir enterprise çalışma alanında birleştirir.

## Ürün ilkeleri

- AI sonuçları uygulanmadan URL'yi ve sonuç listesini değiştirmez.
- Her sinyal kaynak, gözlem tarihi, güven seviyesi ve kanıt kimliği taşır.
- Cam yalnız AI arama, harita kontrolü ve tekil kontrol katmanlarında kullanılır; veri kartları düz yüzeydir.
- Bölge hiyerarşisi veriyle bağlıdır: şehir seçilince ilçe, ilçe seçilince mahalle seçenekleri daralır.
- Mobilde aynı anda yalnızca bir drawer açık kalır.

## Sayfa akışı

1. Başlık ve AI keşif çubuğu
2. AI öneri inceleme kartı ve düzenlenebilir kriter chip'leri
3. Eşleşme özeti ve güven/kaynak açıklaması
4. Sol filtre paneli, merkez harita/liste çalışma alanı, sağ bölge istihbarat paneli
5. Bölge kartları ve üç bölgeye kadar karşılaştırma
6. İlanlara, ofislere, kaydetmeye ve alarm oluşturmaya geçiş

## Veri modeli

- `RegionSearchState`: intent, propertyType, city, district, neighborhood, minPrice, maxPrice, view, query.
- `RegionSummary`: hiyerarşi, fiyatlar, trend, ilan arzı, imar/ulaşım/yaşam sinyalleri.
- `RegionSignal`: label, value, source, observedAt, confidence, evidenceId.
- `RegionMatch`: eşleşme skoru, nedenler ve bağlı sinyaller.

İlk sürüm deterministik adapter ile çalışır; gerçek API entegrasyonuna hazır bir sınır korunur.

## Responsive ve erişilebilirlik

- `pointer: coarse` için 44px minimum hedefler.
- `:focus-visible` halkası yalnız accent token'ıyla uygulanır.
- Reduced motion/transparency tercihleri desteklenir.
- Harita görseli, liste ve istihbarat paneli klavye ile erişilebilir eşdeğerler sunar.

## Story/test matrisi

Default, AiProposal, CityDrilldown, MapSelection, CompareThree, Loading, Empty, Error, SavedRegion ve MobileDrawer senaryoları; domain state, AI parser, adapter ve görünüm etkileşim testleriyle doğrulanır.
