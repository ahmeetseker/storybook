// Flowbite Blocks tarzı component kataloğu — Storybook docs sayfasında yaşar.
// Sayfa temiz beyaz/gri; cam efekti yalnız kart içi önizleme kutucuklarında
// (pastel gradyan zemin üzerinde) görünür — düz zeminde cam okunmaz.
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassBackButton } from '../components/GlassNavbar'
import { GlassBadge } from '../components/GlassBadge'
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
  // ── Navigasyon ──────────────────────────────────────────────────────────
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
    name: 'Badge',
    description: 'Kapsül cam rozet — "Acil", "Yeni", "Öne Çıkan" gibi durum vurguları için tintli varyantlar.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassbadge--default',
    preview: <GlassBadge tint="#ff453a">Acil</GlassBadge>,
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
    name: 'Spec Table',
    description: 'Etiket/değer özellik tablosu — tek ya da çift sütun, ayraç çizgili.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glassspectable--default',
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
    description: 'Benzer ilan kartı — görsel, iki satır başlık, konum ve fiyat; tamamı tıklanabilir.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasslistingcard--default',
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
