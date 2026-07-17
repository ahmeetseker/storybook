# İlan Detay Gap Raporu — Emlak Genişlemesi + AI-First 2030

**Tarih:** 2026-07-17
**Metodoloji:** 6 paralel araştırma agent'ı (sahibinden anatomi, küresel piyasa taraması,
AI-first 2030 vizyonu, repo kod-kanıtlı gap analizi, enterprise altyapı kıyası, Codex
bağımsız danışma) + sentez agent'ı. Kaynak: workflow `wf_1f6f4ab5-4be` (7/7 agent, 0 hata).
**Kapsam:** sahibinden konut ilan detayı referansıyla arsa→emlak genişlemesi; MVP+ öncelikli.

## Yönetici özeti

6 raporun sentezi 41 birleşik eksik component veriyor: 17 ilan-detay, 6 genel altyapı, 18 AI-first. En güçlü konsensüs (5 rapor) medya-tipi ayrımlı galeri (GlassMediaGallery: video/360°/kat planı) üzerinde; 4'er rapor gerçek harita (GlassMap — hem GlassLocationCard hem Arama.tsx'te bugün açıkça placeholder), kredi hesaplayıcı (GlassLoanCalculator), karşılaştırma tablosu (GlassCompareTable) ve tur randevusu (GlassTourScheduler) öneriyor. Kritik yol netleşiyor: önce KonutIlanDetay sayfası + veri modeli genişletmesi (ArsaIlan arsa'ya kilitli), onu mümkün kılan 5'li set (GlassMap, GlassMediaGallery, GlassFeatureGroup, GlassLoanCalculator, GlassTourScheduler) ve mevcut sahte/placeholder alanları gerçekleyen GlassTable + GlassChart. AI-first 2030 hattı ayrı bir dalga: minimum 'AI-first ilan detayı' seti GlassChatDock + GlassAiSearchBar + GlassValuationCard + GlassMatchScore + GlassTrustSignalPanel + GlassAiSummaryCard. Üç mimari karar bekliyor: (1) sayfa başına max-6-cam-yüzey kuralı — ilan detayı zaten sınıra yakın, yeni bölümler flat/sekme-içi olmalı ve chart/map/table veri alanları flat kalıp yalnız kontrol çubukları cam olabilir; (2) harita+grafik için bağımlılık kararı (package.json'da yalnız motion+ogl var — hafif kütüphane vs sıfırdan SVG/Canvas); (3) AI disclosure için eksen modeline 'aiGenerated/confidence' prop seti + semantik status tint token'ları eklenmesi (regülasyon gereği). Not: sahibinden.com doğrulaması bot koruması nedeniyle dolaylı kaldı; kod tarafı bulgular ise satır referanslı doğrulandı.

## 1. Eksik component'ler (41)

### İlan Detay (17)

#### GlassMediaGallery — KRİTİK · 5 rapor önerdi
GlassGallery yalnız statik {src,alt} görsel destekliyor (rules.md video/turu açıkça kapsam dışı bırakıyor); video, 360°/sanal tur ve kat planını tip ayrımlı medya öğesi + thumbnail rozeti ile sunan galeri hiçbir yerde yok.
Varyant fikirleri: mediaType: image|video|tour360|floorPlan + thumbnail üzeri rozet (GlassBadge) · tıkla-oynat inline video (autoplay yok, reduced-motion uyumlu) · Matterport/panorama iframe embed slotu · Fotoğraf/Video/Kat Planı/Sanal Tur sekmeleri (GlassTabs ile)

#### GlassMap — KRİTİK · 4 rapor önerdi
Hem GlassLocationCard'daki harita (aria-hidden dekoratif pin) hem Arama.tsx'teki harita ('temsilî' placeholder, satır 71-96) sahte; pin/cluster/katman toggle içeren gerçek harita yüzeyi kütüphanenin en görünür boşluğu.
Varyant fikirleri: pin + popup ilan kartı, cluster rozeti · yaklaşık konum gizlilik dairesi overlay · uydu/yol/hibrit katman segmented control + sokak görünümü paneli · liste-harita split senkronizasyonu (hover→pin vurgu) · inline-panel / fullscreen-drawer

#### GlassLoanCalculator — KRİTİK · 4 rapor önerdi
Kredi/taksit hesaplama hiçbir component veya sayfada yok (grep 'kredi hesap|taksit|mortgage' boş); fiyatın yanındaki 'Kredi Hesapla' + aylık maliyet dökümü hem sahibinden hem Zillow/Redfin'de standart dönüşüm aracı.
Varyant fikirleri: peşinat/vade slider girişi + tahmini taksit çıktısı · banka bazlı karşılaştırma tablosu · kalem kalem döküm (taksit+vergi+sigorta+aidat) itemized-bar · GlassModal/GlassSheet içinde kompakt sürüm

#### GlassTourScheduler — KRİTİK · 4 rapor önerdi
Yerinde görme randevusu akışı hiç modellenmemiş (grep 'randevu' boş); GlassDatePicker tekil tarih seçiyor, saat slotu + tur tipi + onay adımını birleştiren randevu bileşeni yok.
Varyant fikirleri: gün+saat slotu ızgarası (müsaitlik durumlu) · tur tipi seçimi: yerinde / canlı video / kendi-kendine-3D · GlassSheet içinde çok adımlı akış + onay · iCal/takvime aktar aksiyonu

#### GlassFeatureGroup — KRİTİK · 3 rapor önerdi
GlassSpecTable kasıtlı tek seviyeli (rules.md:126 gruplama/karşılaştırmayı kapsam dışı bırakıyor) ve ArsaIlanDetay aynı veriyi iki düz tabloyla elle tekrarlıyor; 'İç/Dış Özellikler' tarzı başlıklı grup + ikonlu boolean amenity grid'i sahibinden'in imza deseni.
Varyant fikirleri: accordion (daraltılabilir grup başlıkları) · checklist (ikon+etiket amenity grid, Asansör✓ Otopark✓) · columns 1|2 (GlassSpecTable eksenini miras alır) · mobilde tek kolona düşen kompakt mod

#### GlassFloorPlanViewer — KRİTİK · 2 rapor önerdi
Kat planı görüntüleme hiçbir yerde yok; Rightmove verisine göre kat planı tek başına %52 daha fazla tıklama getiren, alıcıların %31'inin en değerli bulduğu özellik.
Varyant fikirleri: statik görsel + pan/zoom (pinch/wheel) · çok katlı sekmeler (bodrum/zemin/1.kat) · oda etiketli tıklanabilir hotspot overlay

#### GlassScoreMeter — KRİTİK · 1 rapor önerdi
Walk/Transit/Bike ve okul skoru gibi 0-100 yaşanabilirlik skorları tüm premium portallarda standart; GlassProgress lineer ilerleme için var ama etiket+sayı+görsel ölçek+kategori rengi taşıyan semantik skor rozeti yok.
Varyant fikirleri: ring (dairesel gösterge) · bar (yatay ölçek) · compact-badge (kart içi mini) · grid (4 skor yan yana)

#### GlassCompareTable — Yüksek · 4 rapor önerdi
Çoklu ilan yan yana özellik karşılaştırması hiçbir component/sayfada yok (grep 'karşılaştır|compare' boş) ve GlassSpecTable rules.md'si bunu açıkça kapsam dışı bırakıyor.
Varyant fikirleri: 2-4 sütun ilan matrisi, sticky ilk kolon (etiketler) · farklı değerleri otomatik vurgulama · sütun kaldırma aksiyonu · m² başına fiyat / mesafe hesaplı satırlar

#### GlassNearbyPlaces — Yüksek · 3 rapor önerdi
Yakın çevre bilgisi (okul/market/durak mesafeleri, POI kategorileri, mahalle özeti) hiçbir component'te yok; GlassLocationCard yalnız adres metni + dekoratif pin düzeyinde.
Varyant fikirleri: kategori ikonlu mesafe chip listesi · sekmeli mahalle rehberi (Genel/Ulaşım/Okullar/Yaşam) · GlassMap ile senkron harita+özet split

#### GlassRating — Yüksek · 2 rapor önerdi
Pazaryerinde satıcı/kurumsal güven sinyali için yıldız/puan gösterimi hiçbir component'te yok; GlassSellerCard puan taşımıyor.
Varyant fikirleri: salt-okunur yıldız gösterimi · etkileşimli input (yorum formu) · özet: ortalama puan + dağılım barı

#### GlassReviewCard — Yüksek · 2 rapor önerdi
Satıcı/ofis sayfalarında yorum listesi deseni yok; GlassRating ile birlikte güven katmanını tamamlar.
Varyant fikirleri: avatar + puan + metin + tarih + doğrulanmış rozet · 'faydalı buldum' sayaç aksiyonu · kompakt liste modu (SellerCard içine gömülü)

#### GlassAgencyCard — Yüksek · 1 rapor önerdi
GlassSellerCard yalnız bireysel satıcı modelini destekliyor; MagazaVitrin.tsx kurumsal başlığı GlassAvatar+GlassBadge+GlassButton'ı elle birleştirerek kuruyor (satır 23-51) — reusable kurumsal/ofis kartı yok (alternatif: SellerCard'a kurumsal eksen).
Varyant fikirleri: logo + ofis adı + ajan/ilan sayısı · 'X ilanı görüntüle' link aksiyonu · WhatsApp/telefon çoklu iletişim aksiyonları

#### GlassClimateRiskPanel — Yüksek · 1 rapor önerdi
İklim/afet riski (sel/yangın/ısı/rüzgar; arsada zemin/imar riski karşılığı) hiçbir yerde yok; Zillow 2026 verisinde ilan içeriğinde en hızlı büyüyen bölüm ve renk kodlu semantik risk göstergesi gerektiriyor.
Varyant fikirleri: compact-badges (tehlike ikonu + seviye) · detailed-panel (tehlike başına açıklama+kaynak)

#### GlassCompareBar — Orta · 2 rapor önerdi
'Karşılaştırmaya ekle' seçiminden sonra sayfa altında sabit duran, seçili ilanları taşıyıp karşılaştırma tablosuna geçiren tepsi/çubuk mekaniği yok.
Varyant fikirleri: sticky floating bar (2-4 ilan mini önizleme) · GlassDrawer/GlassSheet tabanlı alt tepsi · kart üstü toggle (GlassIconButton varyantı) ile besleme

#### GlassTaxHistoryTable — Orta · 1 rapor önerdi
Fiyat geçmişi var ama vergi/aidat geçmişi (yıl + tutar + değişim yüzdesi + trend oku) ayrı veri seti olarak modellenmiyor; RPR deseni listing history ile public record history'yi bilinçli ayırıyor.
Varyant fikirleri: yıllık trend satırları (tutar + değişim %) · aidat (HOA) kalem dökümü

#### GlassInsightNote — Düşük · 1 rapor önerdi
Redfin 'Tour Insights' tarzı, yerinde gezen ajanın doğrulanmış editoryal notu — GlassAlert (sistem bildirimi) ve GlassSellerCard'dan (statik profil) farklı bir insan-kaynaklı içgörü kartı deseni.
Varyant fikirleri: quote-style (avatar+isim+tarih+doğrulanmış rozet) · compact-inline (liste içinde tek satır)

#### GlassPersonalNote — Düşük · 1 rapor önerdi
Kullanıcının yalnız kendisinin gördüğü ilana özel not alanı sahibinden'de mevcut; teknik olarak Textarea+Button ile kurulabilir ama adlandırılmış desen olarak tanımlı değil.
Varyant fikirleri: ilan kartına gömülü inline not (kalem ikonlu aç/kapa) · popover içinde kısa not formu

### Genel Altyapı (6)

#### GlassTable — KRİTİK · 1 rapor önerdi
Sıralanabilir/satır seçilebilir veri tablosu yok — İlanYonetimi, Faturalarim, Sikayetlerim gibi yönetim sayfaları GlassList ile idare ediliyor ve pratik olarak inşa edilemiyor.
Varyant fikirleri: sıralanabilir kolon başlığı (asc/desc) · satır seçim checkbox'ı (GlassCheckbox ile) · sticky header · mobilde kart-listeye dönüşen responsive mod · GlassEmptyState entegre boş durum

#### GlassChart — KRİTİK · 1 rapor önerdi
Hiçbir veri görselleştirme component'i yok — ArsaIlanDetay 'Fiyat Geçmişi' sekmesi düz GlassList metni (satır 176-197); trend ve m² karşılaştırması görselleştirilemiyor (bağımlılık kararı gerekli: hafif kütüphane vs sıfırdan SVG).
Varyant fikirleri: line (tooltip + eksen etiketli fiyat trendi) · sparkline (kart içi eksensiz mini) · bar (bu ilan vs mahalle m² ortalaması, yatay/gruplu) · çoklu seri

#### GlassAccordion — Yüksek · 1 rapor önerdi
Dikey collapse/genişletme paterni yok; SSS (YardimMerkezi) ve mobilde uzun özellik grupları için gerekli, GlassFeatureGroup'un accordion varyantı da bunu tüketebilir.
Varyant fikirleri: tekli açık / çoklu açık · ikon+başlık satırı, chevron rotasyonu (motion presets ile)

#### GlassTimeline — Orta · 1 rapor önerdi
İlan durum geçmişi (yayında/incelemede/reddedildi), fatura/doping geçmişi için dikey zaman çizelgesi yok; GlassStepper yalnız ileri dönük sihirbaz adımları için.
Varyant fikirleri: dikey durum noktaları · yatay kompakt (kart içi özet) · ikon+açıklama+zaman damgası

#### GlassInfiniteList — Düşük · 1 rapor önerdi
GlassPagination mevcut ve yeterli; infinite scroll mesajlaşma/galeri akışlarında konfor sağlar ama MVP'yi bloklamaz.
Varyant fikirleri: sentinel + skeleton yükleme (GlassSkeleton'ı tüketir) · erişilebilirlik için 'daha fazla yükle' buton fallback'i

#### GlassCommandPalette — Düşük · 1 rapor önerdi
Cmd+K hızlı gezinme yalnız kurumsal/yönetim tarafında fayda sağlar; tüketici pazaryerinde öncelik düşük.
Varyant fikirleri: fuzzy arama listesi · kategori grupları · klavye navigasyonu + kısayol ipucu chip'leri

### AI-First 2030 (18)

#### GlassChatDock — KRİTİK · 2 rapor önerdi
İlanla sohbet ve genel AI asistanı için sayfa boyunca kalıcı, daraltılabilir tek kontrol-katmanı paneli (Compass'ın kalıcı asistan modeli); açıkken diğer cam yüzeyleri flat'e düşürerek 6-cam-yüzey kuralına uymalı.
Varyant fikirleri: docked-corner / fullscreen-mobile · context: ilan/genel/tur · collapsed pill / expanded panel · suggestion chips + kaynak göster linki

#### GlassTrustSignalPanel — KRİTİK · 2 rapor önerdi
AI moderasyon/güven sinyallerini (kimlik doğrulandı, tapu eşleşti, fotoğraf orijinal, fiyat tutarlı) toplu ve açıklanabilir ('glass box') gösteren panel yok; sahte ilan oranının %40'ı aşabildiği pazarda güven inşasının çekirdeği.
Varyant fikirleri: checklist (durum ikonlu satırlar) · aggregate-score header (progress ring) · güven kaynakları + 'iyileştir' linki

#### GlassAiSearchBar — KRİTİK · 1 rapor önerdi
GlassSearchField salt filtre-tabanlı; doğal dil araması, sesli giriş ve prompt-starter çipleri taşıyan agentic arama girişi (Zillow AI Mode paritesi) yok.
Varyant fikirleri: mode: filtre | dogal-dil toggle · voiceEnabled · suggestions slot (prompt starter çipleri) · size sm/md/lg

#### GlassValuationCard — KRİTİK · 1 rapor önerdi
AI-AVM sonucu tek sayı değil aralık + güven bandı + veri-yetersizliği uyarısı üçlüsü gerektiriyor; GlassPriceHeader statik fiyat için tasarlanmış, belirsizlik boyutunu taşımıyor.
Varyant fikirleri: compact (kart içi) / detailed (tam sayfa) · güven aralığı barı (düşük-orta-yüksek + istek fiyatı marker'ı) · tone: confident/uncertain (semantic token) · veri-yetersiz uyarı rozeti + trend oku

#### GlassAiSummaryCard — KRİTİK · 1 rapor önerdi
İlanın AI-üretilmiş TL;DR özeti için, zorunlu 'AI tarafından oluşturuldu' etiketi taşıyan flat içerik kartı — AI disclosure regülasyon gereği tasarım tercihi değil zorunluluk.
Varyant fikirleri: zorunlu AI-etiketi rozeti · kısa/uzun özet · kaynak sayısı göstergesi

#### GlassMatchScore — KRİTİK · 1 rapor önerdi
Kişiselleştirilmiş uyum skorunu (0-100) detay sayfasında radial, GlassListingCard üzerinde kompakt rozet olarak gösteren bileşen yok.
Varyant fikirleri: radial (detay sayfası) / compact-badge (kart içi) · tone: yüksek/orta/düşük uyum (semantic token)

#### GlassListingIntegrityBadge — Yüksek · 2 rapor önerdi
İlan/aracı güven durumu (doğrulanmış/inceleniyor/işaretlendi, lisanslı aracı) için sabit ikonografi/renk sözleşmeli kompakt rozet — genel amaçlı GlassBadge bu sözleşmeyi taşımıyor.
Varyant fikirleri: dogrulanmis/inceleniyor/isaretlendi · lisans/sertifika tooltip'i · tıklanabilir (GlassTrustSignalPanel'i açar)

#### GlassChatMessage — Yüksek · 1 rapor önerdi
Sohbet balonu — kullanıcı/asistan ayrımı, kaynak-atıflı yanıt ve chat içinden kart/aksiyon üretimi (generative UI) için; saf metin balonu 2026 beklentisini karşılamıyor.
Varyant fikirleri: role: kullanici/asistan · citation footnote slot · inline aksiyon slotu (tur planla, ara)

#### GlassAiQueryTrace — Yüksek · 1 rapor önerdi
Serbest metin sorgusunun hangi filtrelere döküldüğünü kaldırılabilir çipler halinde geri gösteren şeffaflık katmanı — AI açıklanabilirlik ilkesi ve Fair Housing tarzı denetim ihtiyacının UI karşılığı.
Varyant fikirleri: collapsed/expanded · kaldırılabilir filtre çip listesi · 'sonuç neden bu sırada' açıklama satırı

#### GlassValuationDrivers — Yüksek · 1 rapor önerdi
Değerlemeyi etkileyen faktörleri (konum, m², emsal satışlar) listeleyen açıklanabilirlik bileşeni — Interagency AVM Rule kara kutu değerlemeyi kabul etmiyor.
Varyant fikirleri: ikon+etiket+etki yönü listesi · emsal ilan mini-kart bağlantılı

#### GlassProsConsList — Yüksek · 1 rapor önerdi
AI artı/eksi analizini gerekçe metinli, success/danger token'lı yapılandırılmış liste olarak sunan bileşen — GlassChip tekil etiket, gerekçe taşımıyor.
Varyant fikirleri: iki-kolon/tek-kolon (responsive) · madde başına kısa gerekçe metni

#### GlassMatchBreakdown — Yüksek · 1 rapor önerdi
Uyum skorunun hangi kriterlerden (bütçe, mesafe, evcil hayvan) oluştuğunu açan detay paneli — skorun kara kutu kalmamasını sağlar.
Varyant fikirleri: kriter bazlı bar listesi · ağırlık düzenleme slotu (tercihleri canlı değiştirme)

#### GlassTourPlanner — Yüksek · 1 rapor önerdi
Çoklu ilan gezmek için otomatik rota/zaman çizelgesi oluşturucu (sürükle-sırala duraklar, durak-arası seyahat süresi) — ayrı bir akış, hiçbir karşılığı yok.
Varyant fikirleri: liste / harita+liste split · sürükle-yeniden-sırala · durak kartı: saat slotu rozeti + seyahat süresi konektörü

#### GlassPhotoFeatureOverlay — Yüksek · 1 rapor önerdi
Görselden AI özellik çıkarımının galeri üzerindeki karşılığı: fotoğraf üstünde tespit edilen özellikleri (ankastre, parke) işaretleyen hotspot/etiket katmanı.
Varyant fikirleri: hotspot (tap/hover ile açılan etiket) · alt-özet şeridi (tüm tespitler tek satırda)

#### GlassVoiceButton — Yüksek · 1 rapor önerdi
Sesli gezinme için bas-konuş mikrofon kontrolü; idle/listening/thinking/speaking durumlarını dalga formuyla gösterir, reduced-motion'da statik ikona düşer.
Varyant fikirleri: floating-orb / inline-icon-button · state: idle/listening/thinking/speaking

#### GlassVoiceTranscriptBar — Yüksek · 1 rapor önerdi
Sesli etkileşimin canlı transkripti — 'ses-only etkileşim her zaman görsel/metinsel eşdeğer taşır' erişilebilirlik zorunluluğunun karşılığı.
Varyant fikirleri: canlı altyazı · geçmiş transkript genişletme

#### GlassRoomClassifierTabs — Orta · 1 rapor önerdi
AI'nin fotoğrafları oda tipine göre otomatik sınıflandırıp (Mutfak/Salon/Banyo) galeriyi filtrelemesi — GlassTabs'ın AI-üretilmiş-etiket türevi, otomatik üretildiği için ayrı adlandırılmalı.
Varyant fikirleri: oto-üretilmiş etiket rozeti · oda başına foto sayacı

#### GlassAiFlagBanner — Orta · 1 rapor önerdi
AI moderasyonun ilanı şüpheli/incelemede işaretlediği durumlar için gerekçe + itiraz aksiyonu taşıyan uyarı şeridi — GlassAlert'in moderasyon bağlamına özel türevi.
Varyant fikirleri: severity: inceleniyor/kısıtlandı · itiraz-et aksiyon butonu slotu

## 2. Mevcut component'lerde eksen genişletmeleri (yeni component değil)

| Component | Eksik eksen | Öncelik |
|---|---|---|
| GlassLocationCard | Harita alanı tamamen dekoratif aria-hidden pin (GlassLocationCard.tsx:33-37); gerçek GlassMap entegrasyonu veya statik harita görseli + gizlilik dairesi slotu, ayrıca opsiyonel yakın-yerler alt bölümü (GlassNearbyPlaces ile) eklenmeli — ya da bu sorumluluk GlassMap'e devredilip kart ince sarmalayıcıya indirgenmeli. | KRİTİK |
| GlassPriceHeader | meta tek serbest string (ArsaIlanDetay.tsx:212'de 6 bilgi elle birleştiriliyor); yapısal stat dizisi (m² fiyatı, tarih, ilan no, görüntülenme), 'Kredi Hesapla' aksiyon slotu ve AVM karşılaştırma/trend rozeti slotu eklenmeli. | Yüksek |
| GlassSellerCard | Yalnız bireysel satıcı modeli var; kurumsal alanlar (logo, ofis adı, 'diğer ilanları' linki), çoklu iletişim kanalı (WhatsApp), puan/yorum özeti (GlassRating) ve randevu aksiyonu slotu eklenmeli — GlassAgencyCard kararına göre kapsam netleşmeli. | Yüksek |
| GlassListingCard | location tek serbest string (elle '${konum} · ${m2}' birleştiriliyor); yapısal meta çipleri (oda/m²/kat ikonlu), matchScore rozet slotu, güven (integrity) rozet slotu ve 'karşılaştırmaya ekle' toggle slotu eklenmeli. | Yüksek |
| Eksen modeli (EksenlerVeDurumlar.mdx + Tokenlar.mdx) | AI-üretilmiş içerik için zorunlu 'aiGenerated' + 'confidence' prop seti (regülasyon gereği, variant olarak modellenemez) ve risk/skor/güven renkleri için semantik status tint token tartışması; ayrıca ErişilebilirlikMotionResponsive.mdx'e 'ses-only etkileşim her zaman görsel/metinsel eşdeğer taşır' maddesi. | Yüksek |
| GlassGallery | GlassGalleryImage {src,alt} ile sabit; GlassMediaGallery yerine mevcut component'e mediaType (image|video|floorplan|tour) item ekseni + thumbnail rozeti eklemek alternatif çözüm — iki yoldan biri seçilmeli, rules.md'deki 'video oynatıcı kullanma' kuralı güncellenmeli. | Orta |
| GlassSpecTable | Konut/işyeri alanları (oda sayısı, brüt/net m², kat, ısıtma, aidat, bina yaşı) için yalnız içerik genişletmesi yeterli, yeni eksen gerekmiyor; gruplama/karşılaştırma ihtiyacı rules.md'ye uygun olarak GlassFeatureGroup ve GlassCompareTable'a devredilmeli. | Düşük |

## 3. Sayfa/bölüm düzeyi eksikler

- KonutIlanDetay / IsyeriIlanDetay sayfası yok — 23 sayfada yalnız ArsaIlanDetay var; veri modeli de arsa'ya kilitli (ArsaIlan, src/pages/shared/data.ts:56 — oda sayısı, kat, bina yaşı, ısıtma, aidat, brüt/net m² alanları tanımsız). Emlak genişlemesinin ana kalemi: künye + amenity grid + kredi hesaplayıcı + gerçek harita + medya galerisi bir arada (6 rapor içinden 5'i işaret etti).
- Arama sayfasının haritası açıkça 'temsilî' placeholder (src/pages/Arama.tsx:71-96) — GlassMap ile gerçek pin/cluster/split-view implementasyonu gerekiyor.
- ArsaIlanDetay 'Fiyat Geçmişi' sekmesi grafik değil düz GlassList metni (satır 176-197) — GlassChart ile trend görselleştirmesi.
- Karşılaştır sayfası/akışı hiç yok — Kaydettiklerim favorileri listeler ama yan yana kıyaslama sunmuyor; GlassCompareBar + GlassCompareTable'ı kullanan hedef sayfa gerekli (4 rapor işaret etti).
- Randevu/tur planlama akışı hiçbir sayfada yok — yalnız 'bildir' ve mesaj/telefon aksiyonları var; GlassTourScheduler'ı kullanan gösterim talebi akışı eksik.
- Alıcı tarafı kredi hesaplama akışı hiçbir sayfada yok (DopingOdeme ilan doping ödemesidir, karıştırılmamalı).
- Satıcı puanı/yorumları bölümü hiçbir sayfada yok — ilan detayı ve MagazaVitrin'de güven katmanı eksik; MagazaVitrin ayrıca kurumsal başlığı component'siz elle kuruyor (satır 23-51).
- İlanYonetimi / Faturalarim / Sikayetlerim sıralanabilir veri tablosu olmadan GlassList ile idare ediliyor; YardimMerkezi SSS accordion'suz.
- İlan detayda sayfa düzeyi eksik desenler: scroll'da görünür kalan sticky CTA/aksiyon şeridi, paylaş modalı (sosyal + QR + link kopyalama), koşullu gösterim (telefon için login zorunluluğu) — breadcrumb ve benzer-ilanlar carousel'i mevcut component'lerle zaten karşılanıyor.
- İlan detayda içerik bölümü eksikleri: kat planı, 3D/video tur, yaşanabilirlik/okul skorları, mahalle rehberi, iklim riski, vergi/aidat geçmişi — cam yüzey bütçesi (max 6) nedeniyle bunlar ayrı cam yüzey değil, mevcut sekme yapısı içinde flat alt-bölümler olarak eklenmeli.
- AI-first yol haritası sayfaları: (1) AiKesif — filtre-öncelikli Arama'dan ayrı tam-ekran konuşmalı keşif (GlassAiSearchBar + GlassAiQueryTrace + generative sonuç kartları); (2) Degerleme — 'evimin değeri nedir' aracı (GlassValuationCard + GlassValuationDrivers), İlanVer'e entegre giriş noktalı; (3) TurPlanla — Kaydettiklerim'den çoklu ilan seçip rota/zaman çizelgesi; (4) GuvenMerkezi — AI moderasyon metodolojisi + kullanıcının kendi ilanının güven skoru (regülasyon uyumu); (5) Kaydettiklerim'e uyum skoru sıralaması + Ayarlar'a 'AI Tercihlerim' bölümü.
- ArsaIlanDetay'a AI-first bölüm eklemeleri: galeri üstüne GlassPhotoFeatureOverlay + GlassRoomClassifierTabs, fiyat yanına AVM karşılaştırması, yeni 'AI Özet' sekmesi (GlassAiSummaryCard + GlassProsConsList), satıcı kartı yanına GlassMatchScore + GlassTrustSignalPanel, sayfa geneli GlassChatDock.

## 4. Önerilen üretim sırası (Faz 2)

**Dalga 1 — İlan detay MVP+ (kritik, konsensüslü):**
GlassMediaGallery · GlassMap · GlassLoanCalculator · GlassTourScheduler ·
GlassFeatureGroup · GlassFloorPlanViewer · GlassScoreMeter + altyapıdan GlassTable, GlassChart.

**Dalga 2 — Güven + karşılaştırma (yüksek):**
GlassCompareTable(+CompareBar) · GlassNearbyPlaces · GlassRating · GlassReviewCard ·
GlassAgencyCard · GlassClimateRiskPanel · GlassAccordion + eksen genişletmeleri
(GlassLocationCard→GlassMap entegrasyonu, GlassPriceHeader yapısal meta, GlassSellerCard kurumsal).

**Dalga 3 — AI-first çekirdek (kritik AI):**
GlassAiSearchBar · GlassValuationCard · GlassAiSummaryCard · GlassMatchScore ·
GlassChatDock(+ChatMessage) · GlassTrustSignalPanel + `aiGenerated/confidence` eksen standardı.

**Dalga 4 — AI-first derinlik + kalanlar (yüksek/orta/düşük):**
GlassProsConsList · GlassValuationDrivers · GlassMatchBreakdown · GlassTourPlanner ·
GlassPhotoFeatureOverlay · GlassVoice* · GlassTimeline · Glass*Note · sayfa entegrasyonları
(KonutIlanDetay, Karsilastir, AiKesif sayfaları).

Her dalga: paralel implementer agent'lar (component başına) + task review + dalga sonu
entegrasyon doğrulaması; Codex kod tarafında ikinci göz. Her component tam konvansiyon
setiyle (tsx+css+stories+test+rules.md+katalog) ve birden çok varyantla gelir.
