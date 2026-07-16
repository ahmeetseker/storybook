import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassAvatar } from './GlassAvatar'

const meta = {
  title: 'Components/GlassAvatar',
  component: GlassAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'rounded'] },
    status: { control: 'select', options: [undefined, 'online', 'offline', 'busy'] },
    tint: { control: 'color', description: 'Baş harf zemini; verilmezse name’den deterministik pastel' },
  },
} satisfies Meta<typeof GlassAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { src: 'https://i.pravatar.cc/144?img=12', name: 'Ayşe Yılmaz', size: 'lg' },
}

/** src yoksa baş harfler — Türkçe locale ile büyütülür (irem → İ) ve name'den pastel üretilir. */
export const BasHarfler: Story = {
  args: { name: 'irem yıldız', size: 'lg' },
}

/** Kırık URL → onError ile baş harf fallback'ine düşer. */
export const KirikGorsel: Story = {
  args: { src: 'https://example.invalid/yok.jpg', name: 'Mehmet Demir', size: 'lg' },
}

/** Boyut ekseni: 24/32/40/56/72px — sabittir, breakpoint ile değişmez. */
export const Boyutlar: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <GlassAvatar name="Ayşe Yılmaz" size="xs" />
      <GlassAvatar name="Burak Kaya" size="sm" />
      <GlassAvatar name="Ceren Aksoy" size="md" />
      <GlassAvatar name="Deniz Şahin" size="lg" />
      <GlassAvatar name="Emre Öztürk" size="xl" />
    </div>
  ),
}

/** Şekil ekseni: circle (satıcı profili) · rounded (kurumsal/galeri hesabı). */
export const Sekiller: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <GlassAvatar name="Ayşe Yılmaz" size="lg" shape="circle" />
      <GlassAvatar name="Kaya Otomotiv" size="lg" shape="rounded" tint="#f2c894" />
    </div>
  ),
}

/** Durum ekseni: online/offline/busy — sağ altta nokta + ekran okuyucuya gizli metin. */
export const Durumlar: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <GlassAvatar name="Ayşe Yılmaz" size="lg" status="online" />
      <GlassAvatar name="Burak Kaya" size="lg" status="busy" />
      <GlassAvatar name="Ceren Aksoy" size="lg" status="offline" />
    </div>
  ),
}

/**
 * Responsive davranış: avatar boyutu SABİT kalır; mobilde daralan satırda metin kısalır,
 * avatar kimlik simgesi olarak aynı ölçüde durur. (viewport: mobile1)
 */
export const MobilSaticiSatiri: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, maxWidth: '100%' }}>
      <GlassAvatar name="Galeri Kaya Otomotiv" size="md" status="online" shape="rounded" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Galeri Kaya Otomotiv
        </div>
        <div style={{ color: 'var(--lg-label-secondary)', fontSize: 'var(--lg-text-footnote)' }}>
          Üyelik: 2019 · 4,8 puan
        </div>
      </div>
    </div>
  ),
}
