export type CodexCatalogCategoryId =
  | 'foundations'
  | 'actions-forms'
  | 'navigation'
  | 'overlays-feedback'
  | 'marketplace-content'
  | 'data-comparison'
  | 'media-maps'
  | 'ai-intelligence'
  | 'planning'

export type CodexCoverageStrategy = 'native' | 'composed' | 'compatibility'

export interface CodexCatalogCategory {
  id: CodexCatalogCategoryId
  order: number
  label: string
  description: string
}

export interface CodexComponentCatalogItem {
  original: string
  codex: string
  category: CodexCatalogCategoryId
  purpose: string
  variants: string[]
  strategy: CodexCoverageStrategy
  storyGroup: string
}

export interface CodexPageCatalogItem {
  name: string
  label: string
  audience: 'public' | 'buyer' | 'seller' | 'account' | 'enterprise'
  purpose: string
  states: string[]
  codexComposition: string
}

export const CODEX_CATALOG_CATEGORIES: CodexCatalogCategory[] = [
  { id: 'foundations', order: 1, label: 'Temeller', description: 'Yüzey, ayraç, avatar, badge ve yükleme geometrisinin ortak sözlüğü.' },
  { id: 'actions-forms', order: 2, label: 'Aksiyon ve formlar', description: 'Butondan dosya yüklemeye bütün doğrudan manipülasyon ve veri girişi kontrolleri.' },
  { id: 'navigation', order: 3, label: 'Navigasyon ve komut', description: 'Ürün kabuğu, sayfa yönü, menü, komut paleti ve bağlamsal yardım.' },
  { id: 'overlays-feedback', order: 4, label: 'Overlay ve geri bildirim', description: 'Modal katmanlar, canlı bildirimler, hata/boş durum ve progressive disclosure.' },
  { id: 'marketplace-content', order: 5, label: 'Pazar yeri içeriği', description: 'İlan, satıcı, mağaza, güven, konum ve karar destek içerik aileleri.' },
  { id: 'data-comparison', order: 6, label: 'Veri ve karşılaştırma', description: 'Tablolar, grafikler, skorlar, emsaller ve finansal hesaplama yüzeyleri.' },
  { id: 'media-maps', order: 7, label: 'Medya ve harita', description: 'Fotoğraf, video, kat planı, konum ve medya üstü açıklama araçları.' },
  { id: 'ai-intelligence', order: 8, label: 'AI ve intelligence', description: 'Doğal dil arama, özet, risk incelemesi, sohbet, ses ve insan onayı.' },
  { id: 'planning', order: 9, label: 'Planlama', description: 'İlan gezisi, takvim, rota ve görüşme planlama akışları.' },
]

function item(
  category: CodexCatalogCategoryId,
  original: string,
  codex: string,
  purpose: string,
  variants: string[],
  strategy: CodexCoverageStrategy,
  storyGroup: string,
): CodexComponentCatalogItem {
  return { category, original, codex, purpose, variants, strategy, storyGroup }
}

export const CODEX_COMPONENT_CATALOG: CodexComponentCatalogItem[] = [
  item('foundations', 'GlassSurface', 'CodexSurface', 'İçerik ve chrome yüzeylerini edge/elevation sözleşmesiyle ayırır.', ['quiet-flat', 'raised-flat', 'chrome-glass'], 'native', '05 İçerik ve Pazar Yeri/00 Temel Kalıplar'),
  item('foundations', 'GlassDivider', 'Codex divider composition', 'İlişkili içerik grupları arasında semantik ve görsel ayrım kurar.', ['subtle', 'labeled', 'inset'], 'composed', '01 Temeller/03 Geometri ve Elevation'),
  item('foundations', 'GlassAvatar', 'Codex identity mark', 'Kişi ve kurum kimliğini görsel, baş harf ve durumla gösterir.', ['image', 'initials', 'status', 'square'], 'composed', '05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza'),
  item('foundations', 'GlassBadge', 'CodexBadge', 'Etkileşimsiz durum ve kategori bilgisini soft-square biçimde taşır.', ['soft', 'outline', 'solid', 'dot'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('foundations', 'GlassSkeleton', 'CodexSkeleton', 'Yüklenen içeriğin gelecekteki geometrisini korur.', ['text', 'control', 'listing', 'table', 'detail', 'message'], 'native', '06 Veri ve Karşılaştırma/03 Listeler ve Durumlar'),

  item('actions-forms', 'GlassButton', 'CodexButton', 'Karar gruplarındaki birincil, ikincil ve tehlikeli aksiyonları sunar.', ['primary', 'secondary', 'quiet', 'danger', 'loading', 'full-width'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassIconButton', 'CodexIconButton', 'Kompakt araç ve toggle aksiyonlarını erişilebilir adla sunar.', ['quiet', 'outline', 'solid', 'pressed', 'square', 'circle'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassChip', 'CodexChip', 'Seçilebilir ve kaldırılabilir gerçek filtreleri kapsül biçimde gösterir.', ['filter', 'selectable', 'removable', 'disabled'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassField', 'CodexField', 'Label, açıklama, gereklilik, hata ve kontrol ilişkisini kurar.', ['default', 'required', 'invalid', 'success'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassInput', 'CodexInput', 'Tek satırlı metin, sayı ve adornment girişlerini sağlar.', ['outlined', 'quiet', 'filled', 'readonly', 'disabled'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassTextarea', 'CodexTextarea', 'Uzun açıklama ve not girişlerini sayaç ve validasyonla yönetir.', ['outlined', 'filled', 'auto-grow', 'character-count'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassSelect', 'CodexSelect', 'Native seçim davranışını ortak kontrol geometrisinde sunar.', ['outlined', 'quiet', 'filled', 'placeholder'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassSearchField', 'CodexSearchField', 'Arama, temizleme, yükleme ve sonuç geri bildirimini birleştirir.', ['compact', 'expandable', 'command', 'loading'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassCheckbox', 'CodexCheckbox', 'Form seçimleri ve mixed state için native checkbox sözleşmesini korur.', ['precision', 'choice-row', 'mixed', 'disabled'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassRadioGroup', 'CodexRadioGroup', 'Bir karar kümesinden tek seçim yapılmasını sağlar.', ['inline', 'choice-card', 'description', 'invalid'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassSwitch', 'CodexSwitch', 'Anında uygulanan boolean ayarları açık switch semantiğiyle değiştirir.', ['subtle', 'contrast', 'description', 'disabled'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassSlider', 'CodexSlider', 'Aralık değerlerini native range ve görünür değerle düzenler.', ['single', 'range-composition', 'value-bubble', 'disabled'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassStepper', 'CodexStepper', 'Sayısal değerleri kontrollü artış ve azalışla değiştirir.', ['inline', 'contained', 'unit', 'bounded'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassSegmentedControl', 'CodexSegmentedControl', 'Az sayıdaki eş düzey görünüm veya filtre arasında seçim yaptırır.', ['contained', 'minimal', 'icons', 'full-width'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassTabs', 'CodexTabs', 'İlişkili içerik panelleri arasında klavye destekli yön değiştirir.', ['underline', 'contained', 'scrollable', 'disabled-tab'], 'native', '02 Aksiyon ve Formlar/01 Çekirdek Kontroller'),
  item('actions-forms', 'GlassDatePicker', 'CodexDatePicker', 'Tek tarih ve tarih aralığı seçimlerini yerel formatla yönetir.', ['field', 'inline-calendar', 'range', 'invalid'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassFileUpload', 'CodexFileUpload', 'Belge ve fotoğraf yükleme kuyruğunu hata/ilerleme durumlarıyla yönetir.', ['dropzone', 'compact-queue', 'uploading', 'error'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassProgress', 'CodexProgress', 'Belirli ve belirsiz işlem ilerlemesini label ile duyurur.', ['linear', 'circular', 'determinate', 'indeterminate'], 'native', '02 Aksiyon ve Formlar/02 Gelişmiş Formlar'),
  item('actions-forms', 'GlassRating', 'Codex rating composition', 'Puan gösterimi, dağılımı ve etkileşimli değerlendirmeyi destekler.', ['display', 'interactive', 'distribution'], 'composed', '05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza'),
  item('actions-forms', 'GlassLink', 'Codex semantic link', 'Satır içi, bağımsız ve navigasyon bağlantılarını ayırt eder.', ['inline', 'standalone', 'navigation', 'external'], 'composed', '01 Temeller/02 Tipografi'),

  item('navigation', 'GlassBreadcrumb', 'CodexBreadcrumb', 'Hiyerarşik konumu ve geri dönüş yolunu açıklar.', ['inline', 'collapsed', 'overflow'], 'native', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassHeader', 'CodexHeader', 'Ürün markası, ana navigasyon, skip link ve global aksiyonları taşır.', ['utility', 'marketplace', 'compact', 'sticky'], 'native', '05 İçerik ve Pazar Yeri/00 Temel Kalıplar'),
  item('navigation', 'GlassNavbar', 'Codex app-bar composition', 'Sayfa başlığı, geri ve bağlamsal aksiyonları kompakt üst çubukta sunar.', ['title', 'back-actions', 'transparent-over-media'], 'composed', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassSidebar', 'CodexSidebar', 'Kurumsal ve hesap içi bilgi mimarisini responsive navigasyona dönüştürür.', ['expanded', 'rail', 'mobile-sheet', 'nested-group'], 'native', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassToolbar', 'CodexToolbar', 'Sayfa ve veri bağlamındaki araçları anlamlı gruplara böler.', ['quiet', 'floating', 'sticky', 'overflow'], 'native', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassFilterPanel', 'CodexFilterPanel', 'Arama daraltma ölçütlerini sonuç sayısı, sıfırlama ve tamamlayıcı landmark ile gruplar.', ['sidebar', 'compact-summary', 'sheet-content', 'empty'], 'native', '13 Mobil Sistem/03 Filtre ve Bottom Sheet'),
  item('navigation', 'GlassPagination', 'CodexPagination', 'Uzun veri kümelerinde sayfa konumu ve hareketini yönetir.', ['numbered', 'compact', 'unknown-total'], 'native', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassFooter', 'Codex footer composition', 'Yasal, destek ve ana navigasyon bağlantılarını sade biçimde tamamlar.', ['compact', 'product', 'legal'], 'composed', '10 Sayfalar/05 Kamusal ve Yasal'),
  item('navigation', 'GlassMenu', 'CodexMenu', 'Bağlamsal aksiyonları açıklama, kısayol ve tehlike ayrımıyla sunar.', ['compact', 'descriptive', 'destructive'], 'native', '03 Navigasyon ve Komut/01 Sistem'),
  item('navigation', 'GlassContextMenu', 'Codex context-menu composition', 'İşaretçi bağlamındaki satır ve medya aksiyonlarını açar.', ['row-actions', 'media-actions', 'destructive'], 'composed', '03 Navigasyon ve Komut/02 Menüler ve Komutlar'),
  item('navigation', 'GlassCommandPalette', 'Codex command composition', 'Hızlı navigasyon ve ürün komutlarını arama odaklı sunar.', ['search', 'grouped', 'recent', 'empty'], 'composed', '03 Navigasyon ve Komut/02 Menüler ve Komutlar'),
  item('navigation', 'GlassTooltip', 'Codex tooltip composition', 'Kompakt kontrollerin adını veya kısayolunu gecikmeli açıklar.', ['plain', 'shortcut', 'multiline'], 'composed', '03 Navigasyon ve Komut/02 Menüler ve Komutlar'),
  item('navigation', 'GlassPopover', 'CodexPopover', 'Tetikleyiciye bağlı kısa form ve ayrıntıları focus kontrollü açar.', ['plain', 'titled', 'form'], 'native', '03 Navigasyon ve Komut/01 Sistem'),

  item('overlays-feedback', 'GlassModal', 'CodexModal', 'Belge düzleminden ayrılması gereken sınırlı kararları native dialog ile yönetir.', ['standard', 'destructive', 'form', 'loading'], 'native', '04 Overlay ve Geri Bildirim/01 Sistem'),
  item('overlays-feedback', 'GlassDrawer', 'CodexDrawer', 'İnceleme ve ayrıntı panellerini sayfa bağlamını koruyarak açar.', ['side', 'inspector', 'filters'], 'native', '04 Overlay ve Geri Bildirim/01 Sistem'),
  item('overlays-feedback', 'GlassSheet', 'Codex mobile sheet composition', 'Mobil filtre ve seçim akışlarını alt yüzeyde sunar.', ['bottom', 'detents', 'selection'], 'composed', '04 Overlay ve Geri Bildirim/02 Mobil Yüzeyler'),
  item('overlays-feedback', 'GlassToast', 'CodexToast', 'Kısa süreli işlem sonucunu canlı bölge ve geri alma aksiyonuyla duyurur.', ['info', 'success', 'warning', 'danger', 'undo'], 'native', '04 Overlay ve Geri Bildirim/01 Sistem'),
  item('overlays-feedback', 'GlassAlert', 'CodexNotice', 'Sayfa içi durum, uyarı ve hata mesajlarını açık çözümle sunar.', ['info', 'success', 'warning', 'danger'], 'native', '04 Overlay ve Geri Bildirim/01 Sistem'),
  item('overlays-feedback', 'GlassEmptyState', 'CodexEmptyState', 'İlk kullanım, sonuç yok ve hata durumlarında sonraki adımı öğretir.', ['first-run', 'no-results', 'error', 'compact'], 'native', '04 Overlay ve Geri Bildirim/01 Sistem'),
  item('overlays-feedback', 'GlassAccordion', 'Codex disclosure composition', 'Uzun yardım ve belge açıklamalarını kontrollü progressive disclosure ile açar.', ['single', 'multiple', 'faq', 'long-content'], 'composed', '12 Durumlar ve Erişilebilirlik/03 Uzun İçerik'),

  item('marketplace-content', 'GlassListingCard', 'CodexListingCard', 'İlan medya, fiyat, konum, favori ve açma sözleşmesini paylaşır.', ['grid', 'row', 'featured', 'static'], 'native', '05 İçerik ve Pazar Yeri/00 Temel Kalıplar'),
  item('marketplace-content', 'GlassSavedSearchCard', 'CodexSavedSearchCard', 'Kayıtlı sorgu, alarm durumu ve yeni sonuç bilgisini hesap akışında yönetir.', ['active', 'paused', 'new-results', 'readonly'], 'native', '09 Pazar Yeri Kalıpları/01 Hesap ve İlan Yönetimi'),
  item('marketplace-content', 'GlassListingManagementCard', 'CodexListingManagementCard', 'İlan yaşam döngüsü, performans ve işlem gereksinimini satıcıya açıklar.', ['draft', 'review', 'live', 'action-required'], 'native', '09 Pazar Yeri Kalıpları/01 Hesap ve İlan Yönetimi'),
  item('marketplace-content', 'GlassAgencyCard', 'CodexAgencyCard', 'Kurumsal mağaza kimliği, performansı ve doğrulamasını sunar.', ['editorial', 'compact', 'verified', 'premium'], 'native', '05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza'),
  item('marketplace-content', 'GlassSellerCard', 'CodexSellerCard', 'Bireysel/profesyonel satıcı güveni ve iletişim aksiyonlarını gösterir.', ['trust', 'compact', 'individual', 'professional'], 'native', '05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza'),
  item('marketplace-content', 'GlassLocationCard', 'CodexLocationCard', 'Yaklaşık konum, gizlilik, mesafe ve çevre bilgisini birleştirir.', ['map-led', 'facts', 'privacy-aware'], 'native', '05 İçerik ve Pazar Yeri/01 İlan İçeriği'),
  item('marketplace-content', 'GlassPriceHeader', 'CodexPriceHeader', 'İlan başlığı, fiyat, birim değer, değişim ve ana aksiyonları önceliklendirir.', ['transactional', 'editorial', 'price-drop', 'mobile'], 'native', '05 İçerik ve Pazar Yeri/01 İlan İçeriği'),
  item('marketplace-content', 'GlassValuationCard', 'CodexValuationCard', 'Değer tahmini, güven aralığı, emsal ve model sınırını açıklar.', ['range', 'confidence', 'compact', 'feedback'], 'native', '05 İçerik ve Pazar Yeri/01 İlan İçeriği'),
  item('marketplace-content', 'GlassReviewCard', 'CodexReviewCard', 'Puan, doğrulanmış işlem ve mağaza yanıtını sunar.', ['verified', 'response', 'compact'], 'native', '05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza'),
  item('marketplace-content', 'GlassPersonalNote', 'Codex note composition', 'Kullanıcının özel ilan notunu inline ve düzenlenebilir tutar.', ['inline', 'private', 'editing'], 'composed', '09 Pazar Yeri Kalıpları/03 Kaydetme ve Notlar'),
  item('marketplace-content', 'GlassInsightNote', 'Codex insight composition', 'Veri veya editör yorumunu kanıt ve bağlamla ayırır.', ['inline', 'evidence', 'editorial'], 'composed', '08 AI ve Güven/03 Açıklanabilirlik'),
  item('marketplace-content', 'GlassFeatureGroup', 'CodexFeatureGroup', 'İlan özelliklerini checklist veya facts yapısında gruplar.', ['checklist', 'facts', 'unavailable'], 'native', '05 İçerik ve Pazar Yeri/01 İlan İçeriği'),
  item('marketplace-content', 'GlassNearbyPlaces', 'CodexNearbyPlaces', 'Yakın yerleri kategori, mesafe ve ulaşım süresiyle sunar.', ['grouped', 'compact', 'travel-time', 'loading', 'empty', 'error'], 'native', '07 Medya ve Harita/03 Konum ve Çevre'),
  item('marketplace-content', 'GlassTrustSignalPanel', 'CodexTrustPanel', 'Kimlik, yetki, tapu, belge ve görsel sinyallerinin zincirini gösterir.', ['compact', 'full', 'mixed-status'], 'native', '08 AI ve Güven/02 Doğrulama ve Risk'),
  item('marketplace-content', 'GlassClimateRiskPanel', 'CodexClimateRiskPanel', 'Bölgesel iklim/afet verisini kaynak ve metodoloji sınırıyla sunar.', ['overview', 'expanded', 'unknown-data'], 'native', '08 AI ve Güven/02 Doğrulama ve Risk'),
  item('marketplace-content', 'GlassHero', 'Codex marketplace hero composition', 'Ana arama, ilan verme ve kurumsal değer önerisini görev odaklı açar.', ['search-led', 'property-led', 'minimal', 'enterprise'], 'composed', '10 Sayfalar/01 Alıcı Akışları'),
  item('marketplace-content', 'GlassVitrin', 'Codex marketplace collection', 'Seçkileri grid, rail ve liste görünümünde sunar.', ['grid', 'rail', 'list', 'sponsored-disclosure'], 'composed', '09 Pazar Yeri Kalıpları/02 Seçki ve Vitrin'),
  item('marketplace-content', 'GlassBento', 'Codex asymmetric content composition', 'Farklı önem ve medya yoğunluğundaki içeriği asimetrik gruplar.', ['editorial-asymmetric', 'dense', 'responsive'], 'composed', '09 Pazar Yeri Kalıpları/02 Seçki ve Vitrin'),

  item('data-comparison', 'GlassTable', 'CodexDataTable', 'Seçim, sıralama, yoğunluk ve mobil kart dönüşümlü veri tablosu sağlar.', ['comfortable', 'compact', 'selectable', 'responsive-cards', 'loading', 'empty'], 'native', '06 Veri ve Karşılaştırma/01 Tablolar'),
  item('data-comparison', 'GlassSpecTable', 'CodexSpecTable', 'Teknik özellikleri tanım listesi ve anlamlı gruplarla gösterir.', ['two-column', 'grouped', 'compact'], 'native', '06 Veri ve Karşılaştırma/01 Tablolar'),
  item('data-comparison', 'GlassCompareTable', 'CodexCompareTable', 'Birden çok ilanı sticky başlık ve farklılık filtresiyle karşılaştırır.', ['sticky', 'differences-only', 'missing-data'], 'native', '06 Veri ve Karşılaştırma/01 Tablolar'),
  item('data-comparison', 'GlassTaxHistoryTable', 'Codex history table composition', 'Vergi/fiyat geçmişini masaüstü tablo ve mobil timeline olarak sunar.', ['table', 'mobile-timeline', 'empty'], 'composed', '06 Veri ve Karşılaştırma/04 Geçmiş ve Kayıt'),
  item('data-comparison', 'GlassList', 'CodexList', 'Bölünmüş, aksiyonlu ve seçilebilir içerik satırlarını yönetir.', ['divided', 'action', 'selection', 'compact'], 'native', '06 Veri ve Karşılaştırma/03 Listeler ve Durumlar'),
  item('data-comparison', 'GlassInfiniteList', 'Codex virtual list composition', 'Uzun akışları yükleme sentinel’i ve hata geri dönüşüyle sunar.', ['comfortable', 'dense', 'loading-more', 'end'], 'composed', '06 Veri ve Karşılaştırma/03 Listeler ve Durumlar'),
  item('data-comparison', 'GlassTimeline', 'CodexTimeline', 'İlan yaşam döngüsü, doğrulama ve fiyat olaylarını kronolojik gösterir.', ['activity', 'milestone', 'compact', 'empty'], 'native', '06 Veri ve Karşılaştırma/03 Listeler ve Durumlar'),
  item('data-comparison', 'GlassChart', 'CodexMiniChart', 'Fiyat ve performans sinyallerini SVG ile ve erişilebilir veri tablosuyla gösterir.', ['line', 'comparative', 'empty', 'annotated'], 'native', '06 Veri ve Karşılaştırma/02 Sinyaller ve Grafik'),
  item('data-comparison', 'GlassMetricStrip', 'CodexMetricStrip', 'Kritik göstergeleri tanım listesi semantiği ve renk dışı trend yönüyle özetler.', ['single-row', 'wrapped', 'stacked', 'trend'], 'native', '06 Veri ve Karşılaştırma/02 Sinyaller ve Grafik'),
  item('data-comparison', 'GlassScoreMeter', 'CodexScoreMeter', 'Skor, güven ve risk değerlerini label ve açıklamayla sunar.', ['bar', 'tone', 'explanation'], 'native', '06 Veri ve Karşılaştırma/02 Sinyaller ve Grafik'),
  item('data-comparison', 'GlassMatchScore', 'Codex AI match composition', 'İlanın kullanıcı ölçütleriyle genel uyumunu özetler.', ['compact', 'explained', 'low-confidence'], 'composed', '08 AI ve Güven/03 Açıklanabilirlik'),
  item('data-comparison', 'GlassMatchBreakdown', 'Codex match evidence composition', 'Uyum skorunun ölçüt bazındaki kanıt ve sapmalarını açar.', ['overview', 'expanded', 'conflict'], 'composed', '08 AI ve Güven/03 Açıklanabilirlik'),
  item('data-comparison', 'GlassValuationDrivers', 'Codex valuation driver composition', 'Değer tahminini yükselten/düşüren etkenleri sıralar.', ['ranked-bars', 'positive-negative', 'waterfall'], 'composed', '08 AI ve Güven/03 Açıklanabilirlik'),
  item('data-comparison', 'GlassLoanCalculator', 'Codex finance composition', 'Kredi tutarı, vade, oran ve senaryoları hesaplar.', ['compact', 'scenario-compare', 'validation'], 'composed', '06 Veri ve Karşılaştırma/05 Finansal Araçlar'),
  item('data-comparison', 'GlassCompareBar', 'Codex compare tray composition', 'Karşılaştırmaya eklenen ilanları inline veya sticky tepside yönetir.', ['inline', 'sticky', 'limit', 'mobile'], 'composed', '09 Pazar Yeri Kalıpları/04 Karşılaştırma'),

  item('media-maps', 'GlassGallery', 'CodexGallery', 'İlan fotoğraflarını ana medya, thumbnail ve sayaçla sunar.', ['immersive', 'contained', 'thumbnail-strip', 'loading', 'empty', 'error'], 'native', '07 Medya ve Harita/01 Galeri'),
  item('media-maps', 'GlassMediaGallery', 'CodexMediaGallery', 'Fotoğraf, video, 360 ve plan medyasını tek gezintide birleştirir.', ['tabs', 'filmstrip', 'lightbox', 'mixed-media'], 'native', '07 Medya ve Harita/01 Galeri'),
  item('media-maps', 'GlassCarousel', 'CodexCarousel', 'İlişkili ilan ve medya koleksiyonlarını yatay gezinmeyle gösterir.', ['edge-to-edge', 'contained', 'keyboard', 'mobile'], 'native', '07 Medya ve Harita/01 Galeri'),
  item('media-maps', 'GlassMap', 'CodexMap', 'İlan pinleri, seçim, privacy circle ve liste senkronunu yönetir.', ['full', 'embedded', 'selected-pin', 'privacy-circle'], 'native', '07 Medya ve Harita/02 Harita'),
  item('media-maps', 'GlassFloorPlanViewer', 'CodexFloorPlanViewer', 'Kat planı, hotspot ve ölçü açıklamalarını erişilebilir biçimde sunar.', ['immersive', 'annotated', 'multi-floor', 'keyboard'], 'native', '07 Medya ve Harita/04 Kat Planı'),
  item('media-maps', 'GlassPhotoFeatureOverlay', 'CodexPhotoFeatureOverlay', 'Fotoğraf üstündeki özellik işaretlerini kontrast kontrollü gösterir.', ['quiet', 'high-contrast', 'selected', 'analyzing'], 'native', '07 Medya ve Harita/05 Görsel Açıklama'),
  item('media-maps', 'GlassRoomClassifierTabs', 'Codex room classifier composition', 'Medya koleksiyonunu AI oda sınıflarıyla yatay gezinmeye açar.', ['compact', 'horizontal-scroll', 'unclassified'], 'composed', '08 AI ve Güven/04 Görsel Analiz'),

  item('ai-intelligence', 'GlassAiSearchBar', 'CodexAiPromptComposer', 'Doğal dil sorgusu, yapılandırılmış filtre ve suggestion akışını yönetir.', ['command', 'conversational', 'results-open', 'voice'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassAiSummaryCard', 'CodexAiAnswer', 'AI yanıtını kaynak, güven, sınır ve geri bildirimle sunar.', ['summary', 'evidence-expanded', 'streaming', 'error'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassAiEvidenceList', 'CodexAiEvidenceList', 'AI yanıtının resmî, piyasa ve ilan dayanaklarını doğrulama bilgisiyle sıralar.', ['official', 'market', 'listing', 'empty'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassAiConfidence', 'CodexAiConfidence', 'Güven seviyesini ölçer, etkenlerini açıklar ve ölçülmeyen durumu güvenle ifade eder.', ['low', 'medium', 'high', 'unmeasured'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassAiFlagBanner', 'CodexAiRiskReview', 'Risk sinyalini neden, önem, insan incelemesi ve itirazla açıklar.', ['subtle', 'review-required', 'cleared', 'false-positive'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassAiRiskReview', 'CodexAiRiskReview', 'Açık riskleri kanıt ve insan karar kapısıyla çözer; ağır riskte onayı kilitler.', ['open', 'blocking', 'resolved', 'decision'], 'native', '08 AI ve Güven/02 Doğrulama ve Risk'),
  item('ai-intelligence', 'GlassAiAgentActivity', 'CodexAiAgentActivity', 'Ajan araç günlüğünü izin, çalışma, başarı ve hata durumlarıyla denetlenebilir kılar.', ['queued', 'running', 'needs-approval', 'error'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassChatDock', 'CodexAiConversation', 'İlan bağlamlı asistan konuşmasını kaynak ve aksiyonlarla sürdürür.', ['collapsed', 'conversation', 'handoff', 'offline'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),
  item('ai-intelligence', 'GlassVoiceBar', 'CodexAiVoiceControl', 'Sesli arama durumlarını izin, kayıt, transkripsiyon ve hata olarak yönetir.', ['idle', 'permission', 'listening', 'transcribing', 'error'], 'native', '08 AI ve Güven/01 AI Bileşenleri'),

  item('planning', 'GlassTourPlanner', 'Codex tour-plan composition', 'Birden çok ilan ziyaretini sıra, rota ve çakışma bilgisiyle planlar.', ['calendar', 'route', 'conflict', 'empty'], 'composed', '09 Pazar Yeri Kalıpları/05 Ziyaret Planlama'),
  item('planning', 'GlassTourScheduler', 'Codex scheduler composition', 'Satıcı uygunluğu ve alıcı tercihini slot seçiminde birleştirir.', ['slot-grid', 'compact', 'request-sent', 'unavailable'], 'composed', '09 Pazar Yeri Kalıpları/05 Ziyaret Planlama'),
]

export const CODEX_PAGE_CATALOG: CodexPageCatalogItem[] = [
  { name: 'AnaSayfa', label: 'Ana sayfa', audience: 'public', purpose: 'Kategori keşfi, doğal dil arama ve güvenli pazar yeri girişi.', states: ['default', 'personalized', 'loading', 'offline', 'mobile'], codexComposition: 'Alıcı keşif merkezi' },
  { name: 'Arama', label: 'Arama sonuçları', audience: 'buyer', purpose: 'Filtre, sıralama, kart/liste/harita ve kayıtlı arama yönetimi.', states: ['results', 'map', 'loading', 'empty', 'error', 'mobile'], codexComposition: 'Workspace arama' },
  { name: 'ArsaIlanDetay', label: 'Arsa ilan detayı', audience: 'buyer', purpose: 'Tapu, imar, değer, konum, risk ve satıcı karar desteği.', states: ['verified', 'warning', 'favorited', 'loading', 'mobile'], codexComposition: 'Parsel intelligence detayı' },
  { name: 'KonutIlanDetay', label: 'Konut ilan detayı', audience: 'buyer', purpose: 'Medya, özellik, konum, fiyat ve görüşme planlama.', states: ['default', 'price-drop', 'tour-open', 'loading', 'mobile'], codexComposition: 'Konut intelligence detayı' },
  { name: 'Karsilastir', label: 'İlan karşılaştırma', audience: 'buyer', purpose: 'Seçilen ilanları özellik, fiyat, konum ve güven bakımından karşılaştırma.', states: ['full', 'differences-only', 'single-item', 'empty', 'mobile'], codexComposition: 'Karar masası' },
  { name: 'Kaydettiklerim', label: 'Kaydedilenler', audience: 'account', purpose: 'Favori ilan, koleksiyon ve özel not yönetimi.', states: ['items', 'collections', 'empty', 'loading', 'mobile'], codexComposition: 'Kaydetme merkezi' },
  { name: 'AramaAlarmlari', label: 'Arama alarmları', audience: 'account', purpose: 'Kayıtlı sorgu, bildirim sıklığı ve yeni sonuç yönetimi.', states: ['active', 'paused', 'empty', 'error', 'mobile'], codexComposition: 'Alarm merkezi' },
  { name: 'Bildirimler', label: 'Bildirimler', audience: 'account', purpose: 'Fiyat, mesaj, moderasyon ve güven bildirimlerini filtreleme.', states: ['unread', 'all', 'empty', 'loading', 'mobile'], codexComposition: 'Bildirim merkezi' },
  { name: 'Mesajlar', label: 'Mesajlar', audience: 'account', purpose: 'Alıcı, satıcı ve destek konuşmalarını ilan bağlamında yürütme.', states: ['conversation', 'empty', 'sending', 'failed', 'mobile'], codexComposition: 'Güvenli mesajlaşma' },
  { name: 'Giris', label: 'Giriş', audience: 'public', purpose: 'E-posta/telefon ile güvenli oturum açma ve kurtarma yönü.', states: ['default', 'invalid', 'loading', 'locked', 'mobile'], codexComposition: 'Kimlik giriş akışı' },
  { name: 'Kayit', label: 'Kayıt', audience: 'public', purpose: 'Bireysel ve kurumsal hesap başlangıcı.', states: ['account-type', 'form', 'invalid', 'success', 'mobile'], codexComposition: 'Üyelik akışı' },
  { name: 'SifreSifirla', label: 'Şifre sıfırlama', audience: 'public', purpose: 'Hesap kurtarma isteği ve yeni şifre belirleme.', states: ['request', 'sent', 'reset', 'expired', 'mobile'], codexComposition: 'Hesap kurtarma' },
  { name: 'HesapDogrula', label: 'Hesap doğrulama', audience: 'public', purpose: 'E-posta, telefon ve kimlik doğrulama durumunu yönetme.', states: ['pending', 'verified', 'expired', 'error', 'mobile'], codexComposition: 'Doğrulama akışı' },
  { name: 'HesapOzeti', label: 'Hesap özeti', audience: 'account', purpose: 'İlan, mesaj, alarm ve ödeme göstergelerini tek görev merkezinde toplama.', states: ['active', 'new-user', 'loading', 'degraded', 'mobile'], codexComposition: 'Hesap çalışma alanı' },
  { name: 'Ayarlar', label: 'Ayarlar', audience: 'account', purpose: 'Profil, gizlilik, bildirim, güvenlik ve tema tercihleri.', states: ['profile', 'privacy', 'security', 'saving', 'error'], codexComposition: 'Hesap ayarları' },
  { name: 'Faturalarim', label: 'Faturalarım', audience: 'account', purpose: 'Fatura geçmişi, belge indirme ve şirket bilgisi yönetimi.', states: ['history', 'empty', 'loading', 'download-error', 'mobile'], codexComposition: 'Finans belgeleri' },
  { name: 'Sikayetlerim', label: 'Şikâyetlerim', audience: 'account', purpose: 'Güvenlik/şikâyet kayıtlarının durum ve kanıt takibi.', states: ['open', 'resolved', 'empty', 'detail', 'mobile'], codexComposition: 'Güvenlik vaka merkezi' },
  { name: 'IlanVer', label: 'İlan ver başlangıcı', audience: 'seller', purpose: 'Kategori ve hesap uygunluğunu belirleyip ilan sihirbazına giriş.', states: ['category', 'eligibility', 'verification-needed', 'mobile'], codexComposition: 'Satıcı başlangıcı' },
  { name: 'YeniIlanSihirbazi', label: 'Yeni ilan sihirbazı', audience: 'seller', purpose: 'Detay, medya, konum, fiyat, doğrulama ve önizleme adımları.', states: ['details', 'media', 'location', 'pricing', 'review', 'error'], codexComposition: 'AI destekli ilan oluşturma' },
  { name: 'Ilanlarim', label: 'İlanlarım', audience: 'seller', purpose: 'Bütün ilanların durum, performans ve toplu işlemlerini yönetme.', states: ['all', 'live', 'review', 'draft', 'empty', 'mobile'], codexComposition: 'Portföy listesi' },
  { name: 'IlanYonetimi', label: 'İlan yönetimi', audience: 'seller', purpose: 'Tek ilanın yayın, performans, mesaj, doping ve geçmişini yönetme.', states: ['live', 'changes-required', 'paused', 'expired', 'analytics'], codexComposition: 'İlan operasyon detayı' },
  { name: 'DopingOdeme', label: 'Öne çıkarma ve ödeme', audience: 'seller', purpose: 'Görünürlük ürünü seçimi, fiyat ve güvenli ödeme akışı.', states: ['plans', 'checkout', 'processing', 'success', 'failure'], codexComposition: 'İlan görünürlüğü' },
  { name: 'KurumsalTanitim', label: 'Kurumsal tanıtım', audience: 'enterprise', purpose: 'Mağaza, toplu ilan, ekip ve raporlama kabiliyetlerini anlatma.', states: ['overview', 'plans', 'contact', 'mobile'], codexComposition: 'Kurumsal ürün vitrini' },
  { name: 'KurumsalBasvuru', label: 'Kurumsal başvuru', audience: 'enterprise', purpose: 'Şirket ve yetkili bilgileriyle kurumsal hesap talebi oluşturma.', states: ['company', 'authority', 'documents', 'review', 'success'], codexComposition: 'Kurumsal onboarding' },
  { name: 'KurumsalDogrulama', label: 'Kurumsal doğrulama', audience: 'enterprise', purpose: 'Vergi, yetki, sözleşme ve belge doğrulama durumunu takip etme.', states: ['pending', 'action-required', 'verified', 'rejected'], codexComposition: 'Kurumsal güven merkezi' },
  { name: 'MagazaVitrin', label: 'Mağaza vitrini', audience: 'public', purpose: 'Kurumsal profil, portföy, değerlendirme ve iletişim sunumu.', states: ['default', 'filters', 'empty-category', 'mobile'], codexComposition: 'Kurumsal mağaza' },
  { name: 'YardimMerkezi', label: 'Yardım merkezi', audience: 'public', purpose: 'Görev odaklı yardım arama, kategori ve destek yönlendirmesi.', states: ['home', 'search-results', 'no-results', 'article', 'mobile'], codexComposition: 'Destek merkezi' },
  { name: 'Yasal', label: 'Yasal belgeler', audience: 'public', purpose: 'KVKK, çerez, üyelik ve kullanım koşullarını okunabilir sunma.', states: ['index', 'document', 'print', 'mobile'], codexComposition: 'Yasal okuma yüzeyi' },
]

export const CODEX_COMPONENT_COUNT = CODEX_COMPONENT_CATALOG.length
export const CODEX_PAGE_COUNT = CODEX_PAGE_CATALOG.length
