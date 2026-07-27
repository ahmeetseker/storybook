# Navigasyon, Ofis Satırı ve Footer Geometri Tasarımı

## Karar

Ana sayfadaki dört sorun sayfa düzeyi yamalarla değil, onları üreten ortak
Storybook bileşenlerinde çözülecek. `/` rotası aynı `@repo/ui` kaynaklarını
kullandığı için düzeltmeler hem Storybook'a hem gerçek siteye tek kaynaktan
yansıyacak.

Değerlendirilen yaklaşımlar:

1. Sayfa CSS'iyle override: hızlıdır; ancak Storybook ile siteyi tekrar
   ayrıştırır ve DOM sırasına bağımlı seçiciler üretir.
2. Ortak bileşen sözleşmesini dar biçimde geliştirmek: arama, Dock, ofis ve
   footer sorunlarını kaynağında çözer. Uygulanacak yaklaşım budur.
3. Bileşenleri baştan yazmak: mevcut erişilebilirlik ve route davranışlarını
   gereksiz yere riske atar.

## Mevcut Durum ve Kök Nedenler

### AI arama

`GlassAiSearchBar`, yalnız ikon taşıyan gönder aksiyonu için yatay padding'li
`GlassButton size="sm"` kullanıyor. Sonuç 43×32 piksel oval bir kutu. Ayrıca
`GlassButton` içindeki inline-flex etiket baseline'a oturduğu için ok ikonu
buton merkezinin 2,75 piksel yukarısında kalıyor.

### Dock

Dock öğeleri imlece yaklaştıkça 1–1,5 arası ölçekleniyor; her karede track
genişliği ve öğelerin `left` değerleri tekrar hesaplanıyor. Bir öğe 38×38'den
57×57'ye çıkıyor, komşular ve tüm kapsül yatayda kayıyor. `item.group` alanları
ayrıca alt tarafta “Şirket” ve “Hesap” etiketlerini üretiyor.

### Ofis satırı

Inline `GlassAgencyCard`, içerik uzunluğını kullanan sarılabilir flex
yerleşimine sahip. Kurum adı, doğrulama rozeti ve metrik genişliği değiştikçe
kolon başlangıçları da değişiyor. Büyük doğrulama rozeti kimlik alanını
sıkıştırıyor.

### Footer

Ana sayfa mevcut zengin `GlassFooter` kapasitesini `slim` varyantıyla
kullanıyor. Bu nedenle marka anlatısı ve bilgi mimarisi görünmüyor. Footer
ayrıca `HomeConceptFrame` içindeki `main` öğesinin altında render edildiğinden
implicit `contentinfo` landmark'ı tarayıcı erişilebilirlik ağacında kayboluyor.

## Bileşen Sözleşmeleri

### `GlassAiSearchBar`

- Gönder butonu `--lg-control-sm` genişlik ve yükseklikte gerçek bir daire
  olacak.
- Ok ve loading göstergesi hem yatay hem dikey eksende en fazla 0,5 piksel
  sapmayla merkezlenecek.
- `type="submit"`, “Ara” erişilebilir adı ve loading semantiği korunacak.
- Ortak `GlassButton` etiket sarmalayıcısı block flex'e geçirilerek baseline
  sapması kaynağında kaldırılacak.

### `GlassDock`

- Varsayılan davranış `fixed` olacak: nav her zaman görünür; hover sırasında
  public-site LiquidDock referansındaki magnification çalışacak.
- `behavior="morph"` eski peek↔open davranışını ihtiyaç duyan tüketiciler için
  opt-in olarak koruyacak.
- İmleç orientation ekseninde izlenecek; 180px etki alanında kosinüs eğrisiyle
  1×–1.5× scale, dinamik item merkezleri ve content length üretilecek.
- Edge lens aktif öğede dinlenecek; hover edilen en yakın öğenin scale ve
  merkezini takip edecek.
- Dock, Header ile aynı fallback cam malzemesini kullanacak:
  `thickness={0.55}` ve `blur(14px) saturate(180%)`.
- `group` alanı geriye uyumluluk için tipte kalabilir; görsel etiket
  render edilmeyecek.
- Aktif öğe göstergesi, route ve klavye semantiği korunacak.

### `GlassAgencyCard`

- `verifiedBy?: string` doğrulama kaynağını taşıyacak; yalnız `verified=true`
  olduğunda gösterilecek.
- Büyük metin rozeti yerine erişilebilir adlı küçük doğrulama işareti ve
  “Doğrulama ayrıntısı” bilgi düğmesi kullanılacak.
- Tooltip metni:
  “Kurumsal kimlik {verifiedBy} tarafından doğrulandı.”
- Bilgi düğmesinin `aria-label` ve `title` değeri kaynak bilgisini tam olarak
  taşıyacak; tooltip'in coarse pointer bağlamında kapanması bilgiyi erişilemez
  bırakmayacak.
- Inline düzen üç sabit alan kullanacak: kimlik, metrikler, aksiyonlar.
  `data-part="identity|verification|stats|actions"` ölçüm ve test kancaları
  sağlayacak.

### `HomeFooter` / `GlassFooter`

- Ana sayfa `columns` yerleşimini kullanacak.
- Marka bloğunda arsam.net, kısa ürün vaadi ve güven cümlesi bulunacak.
- Dört sütun yalnız gerçek rotalara gidecek:
  Keşfet, Karar araçları, İlan ve hesap, Güven.
- Konsept bağlantısı yalnız konsept önizlemelerinde gösterilecek.
- `slim` geriye uyumluluk için korunacak ve kısa link seti kullanacak.
- `HomeConceptFrame`, footer'ı `main` sonrasında render eden bir `footer` slotu
  sunacak; böylece tek, üst düzey `contentinfo` landmark oluşacak.
- Footer grid'i container genişliğine göre genişte dört, ortada iki, darda tek
  kolon olacak; mobilde yasal satır sola hizalı ve dikey akacak.

## Responsive Geometri

- 1024 piksel ve üzeri: ofis satırı `minmax(0, 2fr) 1fr 1fr`; marka + dört
  footer kolonu.
- 641–1023 piksel: ofis kimliği ilk satırı kaplar; metrik ve aksiyonlar ikinci
  satırda simetrik kalır; footer iki kolon olur.
- 640 piksel ve altı: ofis alanları tek sütuna geçer; aksiyonlar tam genişlik
  alabilir; footer kolonları ve legal satır dikey akar.
- Tüm varyantlarda yatay taşma olmayacak.

## Etkileşim ve Erişilebilirlik

- Dock alt/sağ anchor'ı hover sırasında sabit kalır; kapsül ve öğe ölçüleri
  public-site magnification eğrisine göre akıcı biçimde değişir.
- Reduced-motion'da öğeler 1× taban scale ve merkezlerinde kalır.
- Dock tooltip'i mouse hover ve klavye focus hedefinde görsel destek verir;
  erişilebilir ad link/butonun kendi `aria-label` değerinde kalır.
- Doğrulama işareti tek başına renk bağımlı değildir; erişilebilir adı vardır.
- Footer bağlantılarında `href="#"` veya kayıtlı olmayan yasal rota
  üretilmez.
- Sayfada tek `main`, onun ardından tek `contentinfo` bulunur.
- Açık/koyu temada token tabanlı renkler ve görünür focus halkaları korunur.

## Başarı Ölçütleri

- Arama düğmesi kare/daire ve ok merkezi en fazla 0,5 piksel sapmalıdır.
- Dock'ta “Şirket”/“Hesap” metni görünmemeli; hover hedefi yaklaşık 57px
  (1.5×) olmalı, komşular kademeli büyümeli ve mouse leave sonrası 38px'e
  dönmelidir.
- Dock edge lens/tooltip'i görünür olmalı ve Dock backdrop filtresi Header'ın
  `blur(14px) saturate(180%)` değeriyle eşleşmelidir.
- Üç inline ofis satırındaki kimlik, metrik ve aksiyon kolon başlangıçları aynı
  olmalıdır.
- Doğrulanmış ofiste küçük işaret, bilgi düğmesi ve kaynak tooltip'i
  bulunmalıdır.
- Ana sayfada kapsamlı marka ve dört footer grubu görünmelidir.
- 1440, 784 ve 390 pikselde yatay taşma olmamalıdır.
- Typecheck, lint, unit, E2E ve production build geçmelidir.
