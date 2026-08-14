// Flowbite Blocks tarzı component kataloğu — Storybook docs sayfasında yaşar.
// Sayfa temiz beyaz/gri; cam efekti yalnız kart içi önizleme kutucuklarında
// (pastel gradyan zemin üzerinde) görünür — düz zeminde cam okunmaz.
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassBackButton } from '../components/GlassNavbar'
import { GlassBadge } from '../components/GlassBadge'
import { GlassRibbon } from '../components/GlassRibbon'
import { GlassStarsCard, GlassStarsCardTitle } from '../components/GlassStarsCard'
import { GlassSwitch } from '../components/GlassSwitch'
import { GlassSegmentedControl } from '../components/GlassSegmentedControl'
import { GlassSearchField } from '../components/GlassSearchField'
import { GlassChip } from '../components/GlassChip'
import { GlassAvatar } from '../components/GlassAvatar'

type Category = 'Navigasyon' | 'Kontroller' | 'Overlay' | 'İçerik' | 'Primitive'
type Status = 'hazır' | 'planlandı'

interface CatalogEntry {
  name: string
  description: string
  category: Category
  status: Status
  storyPath?: string
  preview?: ReactNode
}

const noop = () => {}

const ENTRIES: CatalogEntry[] = [
  // ── Kontroller ──────────────────────────────────────────────────────────
  {
    name: 'Button',
    description: 'Capsule cam buton — basınca sıvılaşma, parmak ucundan iç ışıma, bırakınca jöle salınımı; loading ve prominent eksenleri.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassbutton--default',
    preview: <GlassButton size="sm" tone="dark" onClick={noop}>Devam Et</GlassButton>,
  },
  {
    name: 'Icon Button',
    description: 'Dairesel cam ikon butonu — favori/paylaş gibi tekil aksiyonlar, aria-pressed destekli.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassiconbutton--default',
  },
  {
    name: 'Switch',
    description: 'Cam ray + beyaz thumb; spring ile kayar, açıkken tint dolgusu. Anında etkili tercihler için.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassswitch--default',
    preview: <GlassSwitch label="Fiyat düşünce bildir" defaultChecked />,
  },
  {
    name: 'Slider',
    description: 'Cam başparmaklı aralık kontrolü — native input tabanı, tint dolgu ve erişilebilir değer.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassslider--default',
  },
  {
    name: 'PriceRange',
    description: 'Dağılım histogramlı çift kollu fiyat aralığı — seçili bantlar vurgulanır, piller kolları izler.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/bileşenler-form-glasspricerange--default',
  },
  {
    name: 'Stepper',
    description: 'Artır/azalt çifti — spinbutton semantiği, min/max sınırları, basılı tutunca tekrar.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassstepper--default',
  },
  {
    name: 'Segmented Control',
    description: 'Seçili segmentin tek cam damla gibi kaydığı bölmeli kontrol — radiogroup semantiği, roving tabindex.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glasssegmentedcontrol--default',
    preview: (
      <GlassSegmentedControl
        size="sm"
        label="Görünüm"
        options={[
          { value: 'liste', label: 'Liste' },
          { value: 'izgara', label: 'Izgara' },
        ]}
      />
    ),
  },
  {
    name: 'Checkbox',
    description: 'Form onay kutusu — indeterminate desteği, etiketli, native input tabanı.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glasscheckbox--default',
  },
  {
    name: 'Radio Group',
    description: 'Tekil seçim grubu — dikey/yatay yerleşim, native radyo semantiği.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassradiogroup--default',
  },
  {
    name: 'Select',
    description: 'Cam açılır seçim — listbox paneli, klavye gezinmesi, GlassField entegrasyonu.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassselect--default',
  },
  {
    name: 'Input',
    description: 'Cam metin girişi — prefix/suffix slotları, temizle butonu, invalid durumu, iOS zoom önlemi.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassinput--default',
  },
  {
    name: 'Textarea',
    description: 'Çok satırlı giriş — içerikle büyüyen autoResize, minRows/maxRows sınırları.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glasstextarea--default',
  },
  {
    name: 'Search Field',
    description: 'Cam arama kutusu — mercek ikonu, odaklanınca yumuşak genişler, Enter arar, Esc temizler.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glasssearchfield--default',
    preview: <GlassSearchField size="sm" aria-label="Component ara" expandOnFocus={false} style={{ width: 180 }} />,
  },
  {
    name: 'Date Picker',
    description: 'Cam takvim paneli — min/max sınırları, klavye gezinmesi, Türkçe locale.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassdatepicker--default',
  },
  {
    name: 'File Upload',
    description: 'Sürükle-bırak dosya alanı — accept/maxSize doğrulaması, hata listesi, çoklu dosya.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassfileupload--default',
  },
  {
    name: 'Field',
    description: 'Form alanı sarmalayıcısı — label, açıklama, hata metni; id ve aria bağlarını context ile dağıtır.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassfield--default',
  },
  {
    name: 'Chip',
    description: 'Kapsül filtre/etiket — toggle seçimi, kaldırma çarpısı, tint desteği.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glasschip--default',
    preview: <GlassChip defaultSelected onSelectedChange={noop}>Boyasız</GlassChip>,
  },
  {
    name: 'Detail Action Bar',
    description: 'İlan detayının karar/iletişim eylem grubu — tek prominent CTA, ikincil eylem ve utility\'ler tek cam yüzeyde.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/bilesenler-eylemler-glassdetailactionbar--default',
  },
  // ── Navigasyon ──────────────────────────────────────────────────────────
  {
    name: 'SiteHeader',
    description:
      'Tepede görünmez ray, scroll’da yüzen cam kapsüle morflanan site header’ı — mobilde kapsülün içinde açılan menü paneli.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/bileşenler-navigasyon-glasssiteheader--default',
  },
  {
    name: 'Navbar',
    description: "Yüzen navigasyon barı — geri pill'i, başlık, paylaşımlı action grubu ve soft scroll edge.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassnavbar--with-back-and-actions',
    preview: <GlassBackButton onClick={noop} label="Geri" tone="dark" />,
  },
  {
    name: 'Sidebar',
    description: "visionOS tarzı yüzen cam kenar çubuğu — kayan seçim highlight'ı, disclosure grupları. Hesabım sayfa demolarında kullanılıyor.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/sayfalar-hesabım-hesap-özeti--default',
  },
  {
    name: 'Breadcrumb',
    description: 'Kapsül cam kategori yolu — ara adımlar tıklanabilir, son adım sayfa olarak işaretli.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassbreadcrumb--default',
  },
  {
    name: 'Pagination',
    description: 'Sayfa gezintisi — ellipsis mantığı, önceki/sonraki oklar, kontrollü sayfa durumu.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glasspagination--default',
  },
  {
    name: 'Toolbar',
    description: 'İşleve göre cam pill gruplarına toplanan araç çubuğu; primary action ayrı ve tintli, ok tuşlarıyla gezilir.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glasstoolbar--default',
  },
  {
    name: 'Link',
    description: 'Metin bağlantısı — inline ve chevron\'lu standalone varyantları, external güvenlik otomatiği.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glasslink--default',
  },
  {
    name: 'Header',
    description: 'Site seviyesi header — 5 yerleşim varyantı (bar/centered/split/capsule/minimal), flat default + opsiyonel cam, GlassDrawer mobil menü.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassheader--default',
  },
  {
    name: 'Footer',
    description: "Site footer'ı — 5 varyant (columns/slim/cta/centered/newsletter), flat + hairline, sosyal ikon ve bülten slotları.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassfooter--default',
  },
  {
    name: 'Dock',
    description: 'Sürekli açık, sabit geometrili cam ikon gezinmesi — aktif rota göstergesi, tooltip ve opsiyonel legacy morph davranışı.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/bileşenler-navigasyon-glassdock--default',
  },
  {
    name: 'Island Header',
    description: 'Dynamic Island tarzı üst başlık — hover\'da "Şu an" durum chip\'i, tıklamada hızlı gezinme paneli (sayfa kartları → alt navigasyon, extras + arama slotları).',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassislandheader--default',
  },
  // ── Overlay ─────────────────────────────────────────────────────────────
  {
    name: 'Dropdown / Menü',
    description: 'Tetikleyiciden açılan cam menü paneli — item/separator yapısı, klavye gezinmesi, konumlandırma.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glassmenu--default',
  },
  {
    name: 'Context Menu',
    description: 'Sağ tık menüsü — imleç konumunda materialize olur, viewport kenarında kendini düzeltir.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glasscontextmenu--default',
  },
  {
    name: 'Modal',
    description: 'Ortalanmış karar diyaloğu — focus trap, scroll kilidi, kapanışta tetikleyiciye dönüş.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glassmodal--default',
  },
  {
    name: 'Drawer',
    description: 'Kenardan kayan panel — sol/sağ/alt, üç boyut, dismissible sözleşmesi.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glassdrawer--default',
  },
  {
    name: 'Sheet',
    description: 'Yarım sayfa cam panel — tutamaçtan çekilerek duraklar arasında büyür; yükseldikçe opaklaşır ve kalınlaşır.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glasssheet--default',
  },
  {
    name: 'Popover',
    description: 'Kaynağından materialize olan cam balon — başlıklı panel, yerleşim/hizalama eksenleri.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glasspopover--default',
  },
  {
    name: 'Toast',
    description: 'Kısa ömürlü bildirim — provider + useGlassToast API\'si, severity tonları, kuyruk yönetimi.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glasstoast--default',
  },
  {
    name: 'Tooltip',
    description: 'Hover/focus ipucu balonu — gecikmeli açılış, dokunmatikte bilinçli kapalı.',
    category: 'Overlay',
    status: 'hazır',
    storyPath: '/story/components-glasstooltip--default',
  },
  // ── İçerik ──────────────────────────────────────────────────────────────
  {
    name: 'Hero',
    description: 'Sayfa açılış bölümü — 4 varyant (search/split/showcase/centered), flat zemin, titleAs ile heading kontrolü, --lg-scrim overlay.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasshero--default',
  },
  {
    name: 'Bento Vitrin',
    description: "Simetrik vitrin mozaiği — öne çıkan ilan kartı (2×2), istatistik/harita/CTA hücreleri; hero'nun bento slotuna girer.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassbento--default',
  },
  {
    name: 'Vitrin',
    description: 'Yoğun ana sayfa vitrini — 5 varyant (micro/ruled/mosaic/list/banded), 50-60 ilan kapasitesi, mikro kart ölçeği.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassvitrin--default',
  },
  {
    name: 'Fiyat Planı Tablosu',
    description:
      'Abonelik planları — aylık/yıllık anahtarı, odometreyle dönen fiyat, koltuk tabanlı adet kontrolü. Geniş konteynerde kart ızgarası, dar konteynerde seçilebilir liste.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasspricingtable--default',
  },
  {
    name: 'Dönen Şerit',
    description: 'Footer üstü tam genişlikte ilan şeridi — kesintisiz döngü, sabit hız, duraklat düğmesi + hover/odakla durma.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmarquee--default',
  },
  {
    name: 'SSS Rafı',
    description:
      'SSS kartlarının yatay raflar halinde aktığı vitrin bölümü — satır başına hız/yön, fadeInUp başlık, duraklat düğmesi + hover/odakla durma, reduced-motion’da statik raf.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-vitrin-ve-yerlesim-glassfaqmarquee--default',
  },
  {
    name: 'SEO Keşif Rafı',
    description: 'Footer üstü iç bağlantı bloğu — arama niyetine göre kolonlar, uzun kuyruk açılış sayfaları, sıralı liste + hayalet rakam.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassseodiscovery--default',
  },
  {
    name: "Karşılaştırma Tepsisi",
    description: "Sayfa altı sabit karşılaştırma şeridi — mini önizlemeler, N<2 koruması, maxItems ipucu.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasscomparebar--default',
  },
  {
    name: 'Vurgu Kartı',
    description: 'Tonlu gradyan vurgu kartı — noktalı doku, yer imi rozeti, büyük metrik, kapsül aksiyon; doğrulanmış ofis vitrini deseni.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bileşenler-pazar-yeri-glasshighlightcard--default',
  },
  {
    name: "Vergi Geçmişi",
    description: "Yıllık vergi/aidat tablosu — yön oklu değişim yüzdesi, güncel yıl vurgusu.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstaxhistorytable--default',
  },
  {
    name: "Zaman Çizelgesi",
    description: "Dikey olay çizelgesi — tonlu noktalar, line/compact varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstimeline--default',
  },
  {
    name: "Sonsuz Liste",
    description: "IntersectionObserver'lı yükleme sarmalayıcısı — buton-öncelikli, canlı durum satırı.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassinfinitelist--default',
  },
  {
    name: "Komut Paleti",
    description: "⌘K paleti — tr-locale filtre, gruplu komutlar, klavye gezinmesi.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasscommandpalette--default',
  },
  {
    name: "İçgörü Notu",
    description: "Danışman içgörü kartı — yerinde inceleme rozeti; quote/inline varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassinsightnote--default',
  },
  {
    name: "Kişisel Not",
    description: "İlana özel gizli not — aç/düzenle akışı, karakter sayacı, gizlilik satırı.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasspersonalnote--default',
  },
  {
    name: "Değerleme Sürücüleri",
    description: "AI değerleme etkenleri — tornado bar'lar, artırıyor/azaltıyor srOnly metinleri.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassvaluationdrivers--default',
  },
  {
    name: "Uyum Dökümü",
    description: "Uyum skorunun grup grup dökümü — eşik renkli barlar, kriter chip'leri.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmatchbreakdown--default',
  },
  {
    name: "Tur Planı",
    description: "AI çoklu-ilan rota planı — sıralı duraklar, yol notları, zorunlu onay CTA'sı.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstourplanner--default',
  },
  {
    name: "Foto Etiketleri",
    description: "Görsel üstü AI özellik noktaları — etiket toggle'ı, güven ekli balonlar.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassphotofeatureoverlay--default',
  },
  {
    name: "Sesli Arama",
    description: "Mikrofon + canlı transkript çubuğu — idle/listening/processing, kalıcı canlı bölge.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassvoicebar--default',
  },
  {
    name: "Oda Sekmeleri",
    description: "AI oda sınıflandırma sekmeleri — sayaçlı chip'ler, tablist klavye deseni.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassroomclassifiertabs--default',
  },
  {
    name: "AI Uyarı Bandı",
    description: "Moderasyon bandı — severity zeminleri, neden listesi, kapatılabilir.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaiflagbanner--default',
  },
  {
    name: "AI Arama",
    description: "Doğal dil arama rayı — AI'nin çıkardığı filtre chip'leri, öneriler, düşünüyor durumu; role=search.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaisearchbar--default',
  },
  {
    name: "AI Kompozitör",
    description: "Konuşmalı brief alanı — büyüyen textarea, bağlam ekleri (harita/görsel/ses), tek yapılandırılmış cevap (özet + takip önerisi + atıf).",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaicomposer--default',
  },
  {
    name: "AI Değerleme",
    description: "AVM değerleme kartı — tahmin + min-max aralık barı + liste fiyatı kıyası + güven yüzdesi; panel/inline.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassvaluationcard--default',
  },
  {
    name: "AI Özeti",
    description: "AI ilan özeti — artılar/eksiler kolonları, kaynak notu, güven etiketi, geri bildirim.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaisummarycard--default',
  },
  {
    name: "Uyum Skoru",
    description: "Kişisel uyum halkası — eşleşen/eşleşmeyen kriter chip'leri, gerekçe; card/compact.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmatchscore--default',
  },
  {
    name: "İlan Asistanı",
    description: "İlanla sohbet dock'u — yüzen açma butonu, mesaj listesi (role=log), yazıyor göstergesi, modal olmayan panel.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasschatdock--default',
  },
  {
    name: "Güven Kontrolleri",
    description: "Güven sinyalleri — EİDS/tapu/AI moderasyon satırları, otomatik geçti özeti; panel/compact.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstrustsignalpanel--default',
  },
  {
    name: "Karşılaştırma Tablosu",
    description: "2-4 ilanı yan yana kıyaslayan tablo — sticky etiket kolonu, fark vurgusu, en-iyi-değer işareti, sütun kaldırma.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasscomparetable--default',
  },
  {
    name: "Yakın Çevre",
    description: "Mahalle rehberi — kategori ikonlu mesafe listeleri; chips ve tablist (sekmeli) varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassnearbyplaces--default',
  },
  {
    name: "Puan",
    description: "Yıldız puan — display/input/summary varyantları; radiogroup klavye deseni, dağılım barları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassrating--default',
  },
  {
    name: "Yorum Kartı",
    description: "Kullanıcı yorumu — puan, doğrulanmış görüşme rozeti, faydalı sayacı; full ve compact varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassreviewcard--default',
  },
  {
    name: "Ofis Kartı",
    description: "Kurumsal emlak ofisi kartı — logo, istatistikler, doğrulanmış rozet, tek CTA; panel ve inline varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassagencycard--default',
  },
  {
    name: "Risk Paneli",
    description: "İklim/afet risk paneli — 5 birimlik seviye ölçeği, semantik renk + metin etiketi; badges ve detailed varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassclimateriskpanel--default',
  },
  {
    name: "Accordion",
    description: "Genel amaçlı aç/kapa — single/multiple mod, controlled openIds, grid-rows animasyonu, SSS/yardım için.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaccordion--default',
  },
  {
    name: 'Medya Galerisi',
    description: 'Medya tipli ilan galerisi — görsel/video/360° tur/kat planı, stage + tabbed varyantları, tip rozetli thumb şeridi.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmediagallery--default',
  },
  {
    name: 'Harita',
    description: 'Kütüphanesiz harita yüzeyi v1 — fiyat etiketli pin/cluster, popup, yol/uydu katmanı, gizlilik dairesi; MapLibre adaptörü v2.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmap--default',
  },
  {
    name: 'Kredi Hesaplayıcı',
    description: "Konut kredisi anüite hesaplayıcısı — peşinat/vade slider'ları, aylık taksit + anapara/faiz dökümü; full ve compact varyantları.",
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassloancalculator--default',
  },
  {
    name: 'Randevu Planlayıcı',
    description: 'Yerinde görme randevusu — gün şeridi + saat slotu ızgarası + tur tipi (yerinde/video/3D) + onay akışı.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstourscheduler--default',
  },
  {
    name: 'Özellik Grupları',
    description: 'Gruplu künye sunumu — accordion, ikonlu amenity checklist ve gruplu kolon varyantları (İç/Dış Özellikler deseni).',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassfeaturegroup--default',
  },
  {
    name: 'Kat Planı',
    description: 'Kat planı görüntüleyici — pan/zoom, çok katlı sekmeler, oda etiketli hotspot balonları.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassfloorplanviewer--default',
  },
  {
    name: 'Skor Göstergesi',
    description: '0-100 yaşanabilirlik skoru — ring/bar/badge varyantları, eşik bazlı semantik renk, role=meter.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassscoremeter--default',
  },
  {
    name: 'Veri Tablosu',
    description: 'Sıralanabilir veri tablosu — controlled sort, satır seçimi, sticky başlık, mobilde kart görünümü, boş durum slotu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstable--default',
  },
  {
    name: 'Grafik',
    description: 'Saf SVG veri grafiği — line/area/bar, son nokta vurgusu, pointer kılavuzu + değer balonu, sr-only veri tablosu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasschart--default',
  },
  {
    name: 'Trend Grafiği',
    description:
      'Çok serili zaman serisi — bölgeyi üst bölge ve resmî endeksle aynı eksende kıyaslar. Seri sınıfı çizgi desenine bağlı (düz / uzun kesik / kısa kesik), paylaşımlı balon, sr-only veri tablosu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glasstrendchart--default',
  },
  {
    name: 'Dağılım Grafiği',
    description:
      'Fiyat dağılımı histogramı — son bandı değil MEDYAN bandını vurgular, altında persentil şeridi taşır. Örneklem büyüklüğü künyede görünür.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glassdistributionchart--default',
  },
  {
    name: 'Sparkline',
    description:
      'Tablo hücresine sığan eksensiz mikro trend. Dekoratif değil veridir: role="img" + zorunlu label, yön ve uç değerler ekran okuyucuya cümle olarak geçer.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glasssparkline--default',
  },
  {
    name: 'Bar Listesi',
    description:
      'Kategorik payları etiket + yatay bar + değer satırlarıyla okutan dağılım listesi — yaş/eğitim/alt bölge nüfusu gibi demografik kırılımlar. Bar dekoratiftir; bilgi metinde taşınır.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glassbarlist--default',
  },
  {
    name: 'Badge',
    description: 'Kapsül cam rozet — "Acil", "Yeni", "Öne Çıkan" gibi durum vurguları için tintli varyantlar.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassbadge--default',
    preview: <GlassBadge tint="#ff453a">Acil</GlassBadge>,
  },
  {
    name: 'Ribbon',
    description: 'Köşe şeridi — kart medyasını 45° saran ince vitrin vurgusu; "Doğrulanmış" gibi tekil durumlar için.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bileşenler-veri-gösterimi-glassribbon--default',
    preview: (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: 132,
          height: 88,
          borderRadius: 'var(--lg-radius-media)',
          background: 'linear-gradient(160deg, #b9cf93, #55772f)',
        }}
      >
        <GlassRibbon label="Doğrulanmış" />
      </div>
    ),
  },
  {
    name: 'Stars Card',
    description:
      'Yıldızlı gece kartı — mürekkep zeminde kırpışan yıldız matrisi; imleçle tüm matris tutuşur. Bölge dizini gibi vitrin özetleri için.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bileşenler-vitrin-ve-yerleşim-glassstarscard--default',
    preview: (
      <div style={{ width: 220 }}>
        <GlassStarsCard>
          <GlassStarsCardTitle>Bodrum</GlassStarsCardTitle>
        </GlassStarsCard>
      </div>
    ),
  },
  {
    name: 'Avatar',
    description: 'Kullanıcı görseli — baş harf fallback\'i, deterministik pastel zemin, durum noktası.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassavatar--default',
    preview: <GlassAvatar name="Ahmet Şeker" size="lg" />,
  },
  {
    name: 'Alert',
    description: 'Satır içi uyarı paneli — severity tonları, kapatma ve aksiyon slotları.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassalert--default',
  },
  {
    name: 'Divider',
    description: 'İçerik ayracı — yatay/dikey, ortalı etiket, inset liste varyantı.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassdivider--default',
  },
  {
    name: 'Empty State',
    description: 'Boş/hata durumu paneli — ikon, başlık, açıklama ve aksiyon slotu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassemptystate--default',
  },
  {
    name: 'List',
    description: 'iOS Settings kalıbı gruplu liste — header/footer, inset kart görünümü, satır item\'ları.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasslist--default',
  },
  {
    name: 'Skeleton',
    description: 'Yüklenme iskeleti — text/circle/rect varyantları, shimmer animasyonu, çok satır desteği.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassskeleton--default',
  },
  {
    name: 'Progress',
    description: 'İlerleme göstergesi — bar/circle varyantları, indeterminate modu, yüzde etiketi.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassprogress--default',
  },
  {
    name: 'Tabs',
    description: 'Kapsül sekme barı + cam içerik paneli — controlled/uncontrolled, tablist semantiği.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasstabs--default',
  },
  {
    name: 'Gallery',
    description: 'Thumbnail şeritli görsel galerisi — ok tuşları, sayaç ve tam ekran cam lightbox.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassgallery--default',
  },
  {
    name: 'Lightbox',
    description: 'Tam ekran görsel görüntüleyici — karartılmış katman, cam oklar, sayaç ve alt thumbnail şeridi.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasslightbox--default',
  },
  {
    name: 'Carousel',
    description: 'Scroll-snap yatay şerit — cam ok butonlarıyla sayfa sayfa kaydırma.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasscarousel--default',
  },
  {
    name: 'Price Header',
    description: 'İlan başlığı + fiyat bloğu — rozetler, meta satırı ve aksiyon alanıyla.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasspriceheader--default',
  },
  {
    name: 'Listing Detail Header',
    description: 'İlan detayının başlık bloğu — tek h1, yapılandırılmış meta ve para semantiği.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-pazar-yeri-glasslistingdetailheader--default',
  },
  {
    name: 'Spec Table',
    description: 'Etiket/değer özellik tablosu — tek ya da çift sütun, ayraç çizgili.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassspectable--default',
  },
  {
    name: 'Data Provenance',
    description: 'Bir değerin kaynağı, sorgu tarihi, kapsamı, yöntemi ve çelişkisi — açılır kanıt künyesi.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glassdataprovenance--default',
  },
  {
    name: 'Seller Card',
    description: 'Satıcı kartı — baş harfli avatar, doğrulanmış rozeti, maskeli "Telefonu Göster" ve mesaj aksiyonu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasssellercard--default',
  },
  {
    name: 'Location Card',
    description: 'Stilize harita placeholder\'ı + pin ve adres — "Haritada Aç" aksiyonuyla.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasslocationcard--default',
  },
  {
    name: 'Listing Card',
    description: 'İlan kartı — kompakt liste, zengin detay ve görsel-üstü sunum varyantları; olanak, değerlendirme ve fiyat desteği.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bileşenler-pazar-yeri-glasslistingcard--sag-kart-referansi',
  },
  {
    name: 'Listing Row Card',
    description:
      'Yatay ilan kartı — solda medya, sağda fiyat/puan/özellik künyesi ve danışman + iletişim ayağı; kart button değil, iç kontroller bağımsız.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bileşenler-pazar-yeri-glasslistingrowcard--default',
  },
  // ── Dalga 5: Codex boşluk kapatma ──────────────────────────────────────
  {
    name: 'Metric Strip',
    description: 'KPI/metrik şeridi — dl/dt/dd semantiği; trend yönü renk dışında ok glifi + sr-only metinle iletilir.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassmetricstrip--default',
  },
  {
    name: 'Filter Panel',
    description: 'Arama daraltma paneli — adlandırılmış complementary landmark, aria-live sonuç sayısı, koşullu sıfırlama.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassfilterpanel--default',
  },
  {
    name: 'AI Evidence List',
    description: 'AI cevaplarının kaynak/dayanak listesi — numaralı kaynaklar, doğrulama durumu, ilgi oranı; güvenli boş durum.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaievidencelist--default',
  },
  {
    name: 'AI Confidence',
    description: 'AI güven göstergesi — role="meter" + seviye metni + etken listesi; skor yoksa "ölçülmedi" fallback\'i.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaiconfidence--default',
  },
  {
    name: 'AI Risk Review',
    description: 'Risk incelemesi + insan karar kapısı — ağır açık risk varken onay kilitlenir. AI karar vermez, önceliklendirir.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassairiskreview--default',
  },
  {
    name: 'AI Agent Activity',
    description: 'AI ajan denetim kaydı — role="log" canlı akış, needsApproval izin kapısı, kalıcı yetki notu.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassaiagentactivity--default',
  },
  {
    name: 'Saved Search Card',
    description: 'Kayıtlı arama/alarm kartı — article + heading, controlled alarm switch, bağlama duyarlı silme.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasssavedsearchcard--default',
  },
  {
    name: 'Listing Management Card',
    description: 'Satıcı ilan yönetim kartı — yaşam döngüsü durumu, "işlem gerekli" uyarısı, temsili medya; kart button değil.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasslistingmanagementcard--default',
  },
  // ── Primitive ───────────────────────────────────────────────────────────
  {
    name: 'Surface',
    description: 'Tüm cam görünümün temeli — regular/clear varyantları, thickness ölçeği, tier algılamalı refraction.',
    category: 'Primitive',
    status: 'hazır',
    storyPath: '/story/primitives-glasssurface--regular',
  },
]

const CATEGORIES: Array<Category | 'Tümü'> = ['Tümü', 'Navigasyon', 'Kontroller', 'Overlay', 'İçerik', 'Primitive']

const chipStyle = (active: boolean): CSSProperties => ({
  border: active ? '1px solid #111827' : '1px solid #e5e7eb',
  background: active ? '#111827' : '#fff',
  color: active ? '#fff' : '#374151',
  borderRadius: 999,
  padding: '8px 16px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
})

const badgeStyle = (kind: Status): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: 999,
  background: kind === 'hazır' ? '#def7e4' : '#f3f4f6',
  color: kind === 'hazır' ? '#0f7a33' : '#6b7280',
  border: `1px solid ${kind === 'hazır' ? '#b5eac3' : '#e5e7eb'}`,
})

export function ComponentCatalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'Tümü'>('Tümü')

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return ENTRIES.filter((e) => {
      if (category !== 'Tümü' && e.category !== category) return false
      if (!q) return true
      return (e.name + ' ' + e.description).toLocaleLowerCase('tr').includes(q)
    })
  }, [query, category])

  return (
    <div style={{ position: 'relative', borderRadius: 20, background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '2.5rem 2rem 3rem', color: '#111827', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Liquid Glass Componentleri</h2>
      <p style={{ margin: '8px 0 24px', maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: '#4b5563' }}>
        Apple'ın Liquid Glass tasarım dilinin web karşılıkları. Set tamamlandı — {ENTRIES.length} component,
        hepsi story ve test kapsamıyla hazır. Karttan story'sine atla, canlı dene.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Component ara…"
          aria-label="Component ara"
          style={{ border: '1px solid #e5e7eb', outline: 'none', background: '#fff', color: 'inherit', font: 'inherit', fontSize: 14.5, borderRadius: 12, padding: '10px 16px', minWidth: 260 }}
        />
        {CATEGORIES.map((c) => (
          <button key={c} type="button" style={chipStyle(category === c)} onClick={() => setCategory(c)} aria-pressed={category === c}>
            {c}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
          {filtered.length} sonuç gösteriliyor
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 18 }}>
        {filtered.map((entry) => (
          <div key={entry.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 17 }}>{entry.name}</strong>
              <span style={badgeStyle(entry.status)}>{entry.status}</span>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{entry.category}</span>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#4b5563', flex: 1 }}>
              {entry.description}
            </p>
            <div
              style={{
                minHeight: 72,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                background: entry.preview ? '#fff' : '#f3f4f6',
                border: entry.preview ? 'none' : '1px dashed #d1d5db',
              }}
            >
              {entry.preview ?? (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {entry.status === 'hazır' ? "Story'de izle →" : 'Yakında'}
                </span>
              )}
            </div>
            {entry.storyPath ? (
              <a
                href={`?path=${entry.storyPath}`}
                target="_top"
                style={{ fontSize: 13, fontWeight: 600, color: '#1c64f2', textDecoration: 'none' }}
              >
                Story'yi aç →
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
