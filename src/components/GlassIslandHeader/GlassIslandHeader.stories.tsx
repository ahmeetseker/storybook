import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAiSearchBar } from '../GlassAiSearchBar'
import { GlassButton } from '../GlassButton'
import {
  GlassIslandHeader,
  type GlassIslandHeaderPage,
  type GlassIslandHeaderSubItem,
} from './GlassIslandHeader'

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}

const brandIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2Zm7 12 1 2.8L23 18l-2.8 1L19 22l-1-2.8L15 18l2.8-1.2L19 14Z" />
  </svg>
)

// ArsaPazar bilgi mimarisi — ekran görüntüsündeki panel ile aynı: 4 üst
// sayfa kartı, sayfa başına 2-3 alt navigasyon öğesi.
const pages: GlassIslandHeaderPage[] = [
  { key: 'search', label: 'Arsa ara', href: '/arsa', icon: <Icon d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm10.5 18-4.8-4.8" /> },
  { key: 'offices', label: 'Ofisler', href: '/ofisler', icon: <Icon d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16M9 7h2m-2 4h2m-2 4h2" /> },
  { key: 'regions', label: 'Bölgeler', href: '/bolgeler', icon: <Icon d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /> },
  { key: 'blog', label: 'Blog', href: '/blog', icon: <Icon d="M12 5.5C10.5 4 8.5 3.5 6 3.5v14c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2v-14c-2.5 0-4.5.5-6 2Zm0 0v14" /> },
]

const subNav: Record<string, GlassIslandHeaderSubItem[]> = {
  search: [
    { key: 'list', label: 'Liste', href: '/arsa', icon: <Icon d="M4 6h16M4 12h16M4 18h16" /> },
    { key: 'map', label: 'Harita', href: '/arsa/harita', icon: <Icon d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Zm0 0v14m6-12v14" /> },
    { key: 'saved', label: 'Kayıtlı aramalar', href: '/hesabim/aramalar', icon: <Icon d="M6 4h12v16l-6-4-6 4V4Z" /> },
  ],
  offices: [
    { key: 'all', label: 'Tüm ofisler', icon: <Icon d="M4 6h16M4 12h16M4 18h16" /> },
    { key: 'cities', label: 'Şehirler', icon: <Icon d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" /> },
  ],
  regions: [
    { key: 'popular', label: 'Popüler', icon: <Icon d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2Z" /> },
    { key: 'all', label: 'Tüm bölgeler', icon: <Icon d="M4 6h16M4 12h16M4 18h16" /> },
  ],
  blog: [
    { key: 'latest', label: 'Son yazılar', icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
    { key: 'categories', label: 'Kategoriler', icon: <Icon d="M4 6h16M4 12h16M4 18h16" /> },
  ],
}

const extras = (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px' }}>
    <GlassButton size="sm" tint="var(--lg-accent)" onClick={() => {}}>TR</GlassButton>
    <GlassButton size="sm" onClick={() => {}}>EN</GlassButton>
    <GlassButton size="sm" onClick={() => {}}>Üye girişi</GlassButton>
    <GlassButton size="sm" prominent onClick={() => {}}>İlan ver</GlassButton>
  </div>
)

const search = (
  <GlassAiSearchBar
    onSubmit={() => {}}
    placeholder="Ne arıyorsun?... örn. 'Çanakkale deniz manzaralı'"
  />
)

const meta = {
  title: 'Bileşenler/Navigasyon/GlassIslandHeader',
  component: GlassIslandHeader,
  tags: ['autodocs'],
  args: {
    brandIcon,
    brandLabel: 'arsam.net',
    brandHref: '/',
    pages,
    subNav,
    activeKey: 'search',
    notificationCount: 0,
    onNotificationsClick: fn(),
    onNavigate: fn(),
    onRoute: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    brandIcon: { control: false },
    pages: { control: false },
    subNav: { control: false },
    extras: { control: false },
    search: { control: false },
    brandLabel: { control: 'text' },
    statusLabel: { control: 'text' },
    statusTrail: { control: 'object' },
    statusVisibility: {
      control: 'inline-radio',
      options: ['auto', 'always', 'hover', 'hidden'],
    },
    activeKey: { control: 'select', options: pages.map((p) => p.key) },
    showClock: { control: 'boolean' },
    initialTime: { control: 'text' },
    timeZone: { control: 'text' },
    notificationCount: { control: { type: 'number', min: 0 } },
    open: { control: false, description: 'Controlled kullanım — Controls yerine kod ile yönetin' },
    onOpenChange: { control: false },
    onRoute: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Apple Dynamic Island tarzı genişleyen üst başlık. Kapalıyken üst-ortada marka + zil taşıyan cam ' +
          'hap; hover\'da hap genişleyip "Şu an: <sayfa> · <saat>" durum chip\'ini gösterir (dokunmatikte hep ' +
          'görünür); tıklayınca "Nereye gitmek istersin?" hızlı gezinme paneline morph eder. Sayfa kartına ' +
          'tıklama alt navigasyonu açar (alt öğesi olmayan sayfa doğrudan `onNavigate` çağırır). `extras` ve ' +
          '`search` slotlarıyla dil/tema/oturum eylemleri ve arama (`GlassAiSearchBar`) kompoze edilir. ' +
          'Cam malzeme açıkça `tier="fallback"`, `thickness={0.55}` ve ' +
          '`blur(14px) saturate(180%)` kullanır; GlassDock dış yüzeyiyle aynıdır. ' +
          '`href` değerleri gerçek bağlantı semantiği üretir; `onRoute` aynı-origin tıklamaları SPA router\'a delege eder. ' +
          'Modal dialog: açılışta odak panel içine alınır, Tab odağı panelde sarar; backdrop tıklaması, Escape ve kapat butonu kapatır.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 560, width: '100%' }}>
        <p style={{ maxWidth: 480, margin: '96px auto 0', color: 'var(--lg-label-secondary)', fontSize: 13, textAlign: 'center' }}>
          Sayfa içeriği — başlık üst-ortada sabittir. Hapın üzerine gel (durum chip'i) veya tıkla (panel).
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassIslandHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: { defaultOpen: true, extras, search },
}

/** Ekran görüntüsündeki açık panel: sayfa kartları + extras şeridi + arama slotu. */
export const AcikPanel: Story = {
  name: 'Açık panel',
  args: { defaultOpen: true, extras, search },
}

/** Zil rozeti — okunmamış bildirim sayısı hap üzerinde görünür. */
export const Bildirimli: Story = {
  name: 'Bildirim rozeti',
  args: { notificationCount: 3 },
}

/** `statusLabel` durum chip'ini geçersiz kılar (ör. breadcrumb özeti); `showClock=false` saati gizler. */
export const OzelDurum: Story = {
  name: 'Özel durum etiketi',
  args: { statusLabel: 'Urla · 3.200 m² zeytinlik', showClock: false, defaultOpen: false },
}

/** Salt-okunur kategori özeti + SSR'da deterministik İstanbul saati. */
export const DurumYoluVeSsrSaati: Story = {
  name: 'Durum yolu ve SSR saati',
  args: {
    statusTrail: ['Emlak', 'Arsa', 'Urla'],
    statusVisibility: 'always',
    initialTime: '2026-07-24T09:56:00.000Z',
    timeZone: 'Europe/Istanbul',
  },
}

/** Uzun rota: ara basamaklar görselde sıkışır, tam yol accessible name'de kalır. */
export const UzunDurumYolu: Story = {
  name: 'Uzun durum yolu',
  args: {
    statusTrail: [
      'Anasayfa',
      'Hesabım',
      'İlan yönetimi',
      'Çanakkale Ayvacık sahil bölgesindeki yayındaki ilanlar',
    ],
    statusVisibility: 'always',
    initialTime: '2026-07-24T09:56:00.000Z',
    timeZone: 'Europe/Istanbul',
  },
}

/** Alt navigasyonu olmayan href öğesi gerçek anchor; onRoute SPA geçişini yakalar. */
export const RotaBaglantilari: Story = {
  name: 'Rota bağlantıları',
  args: {
    defaultOpen: true,
    pages: [
      ...pages,
      {
        key: 'about',
        label: 'Hakkımızda',
        href: '/hakkimizda',
        icon: <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01" />,
      },
    ],
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    defaultOpen: true,
    statusLabel: 'Çanakkale Ayvacık Sahil Mahallesi deniz manzaralı zeytinlik arsa ilanları',
    pages: [
      ...pages,
      { key: 'valuation', label: 'Değerleme Raporları Merkezi', icon: <Icon d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" /> },
      { key: 'consulting', label: 'Gayrimenkul Danışmanlığı', icon: <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" /> },
    ],
  },
}

/** Dokunmatik/dar viewport: hover genişlemesi yok, chip hep görünür; panel 94vw sınırında akışkan daralır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 560, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { defaultOpen: true, notificationCount: 2 },
  parameters: {
    docs: {
      description: {
        story:
          'Hapın tam-yüzey trigger\'ı gerçek `<button aria-haspopup="dialog" aria-expanded>`; marka bağlantısı ' +
          've zil bu trigger\'ın semantik kardeşleridir, iç içe etkileşimli öğe yoktur. Panel `role="dialog"` + ' +
          '`aria-modal="true"` + `aria-labelledby` (görünür "Nereye gitmek istersin?" başlığına bağlı); ' +
          'açılış odağı kapat düğmesine taşır ve Tab odağını panel içinde sarar. Zil `aria-label="Bildirimler, N okunmamış"` ile sayıyı duyurur (rozet ' +
          '`aria-hidden`). Durum chip\'i `aria-label="Şu an: …"` taşır; hover-gizliyken `aria-hidden`. Escape ' +
          'yalnız başlık içi bir hedef odaktayken kapatır ve odağı hapa döndürür; kapanışta odak panel ' +
          'içindeyse hapa iade edilir, body\'ye düşmez.',
      },
    },
  },
}
