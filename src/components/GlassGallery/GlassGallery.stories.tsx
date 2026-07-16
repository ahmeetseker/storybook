import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassGallery } from './GlassGallery'
import { placeholderImage } from '../../demo/placeholderImage'

const images = [
  { src: placeholderImage('Ön', '#3a5f8a', '#1f3a5f'), alt: 'Aracın önden görünümü' },
  { src: placeholderImage('Yan', '#5f3a8a', '#3a1f5f'), alt: 'Aracın yandan görünümü' },
  { src: placeholderImage('Arka', '#8a5f3a', '#5f3a1f'), alt: 'Aracın arkadan görünümü' },
  { src: placeholderImage('İç Mekan', '#3a8a5f', '#1f5f3a'), alt: 'Araç iç mekanı' },
  { src: placeholderImage('Motor', '#8a3a3a', '#5f1f1f'), alt: 'Motor bölmesi' },
]

const meta = {
  title: 'Components/GlassGallery',
  component: GlassGallery,
  tags: ['autodocs'],
  args: { onIndexChange: fn() },
} satisfies Meta<typeof GlassGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { images },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassGallery {...args} />
    </div>
  ),
}

export const SingleImage: Story = {
  args: { images: images.slice(0, 1) },
  render: Default.render,
}

export const Wide: Story = {
  args: { images, aspectRatio: '16 / 9' },
  render: Default.render,
}

/** Malzeme ekseni yan yana: sahne çerçevesi cam/flat seçebilir, ok butonları (kontrol katmanı) iki tarafta da cam kalır. */
export const Materials: Story = {
  args: { images },
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: 420 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>material="glass" (default)</p>
        <GlassGallery images={images} />
      </div>
      <div style={{ width: 420 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>material="flat"</p>
        <GlassGallery images={images} material="flat" />
      </div>
    </div>
  ),
}

/** 20+ görsel: thumbnail şeridi yatay taşar ve kayar; sayaç `n / m` toplamı doğru gösterir. */
const odalar = [
  'Salon', 'Mutfak', 'Yatak Odası', 'Çocuk Odası', 'Banyo', 'Balkon', 'Antre', 'Çalışma Odası',
  'Ebeveyn Banyosu', 'Giyinme Odası', 'Kiler', 'Teras', 'Bahçe', 'Otopark', 'Bina Girişi',
  'Asansör', 'Site Havuzu', 'Spor Salonu', 'Manzara', 'Kat Planı',
]
const paletler: [string, string][] = [
  ['#3a5f8a', '#1f3a5f'],
  ['#5f3a8a', '#3a1f5f'],
  ['#3a8a5f', '#1f5f3a'],
  ['#8a5f3a', '#5f3a1f'],
  ['#8a3a3a', '#5f1f1f'],
]
const cokGorsel = odalar.map((oda, i) => ({
  src: placeholderImage(oda, paletler[i % paletler.length][0], paletler[i % paletler.length][1]),
  alt: `Dairenin ${oda.toLocaleLowerCase('tr')} bölümünün geniş açıdan çekilmiş fotoğrafı`,
}))

export const CokGorsel: Story = {
  args: { images: cokGorsel },
  render: Default.render,
}

/** Dar container (320px, telefon genişliği): sahne orana sadık küçülür, thumb şeridi kayar, oklar 44px dokunma hedefi kalır. */
export const DarContainer: Story = {
  args: { images },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassGallery {...args} />
    </div>
  ),
}
