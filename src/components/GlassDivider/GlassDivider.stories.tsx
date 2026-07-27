import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassDivider } from './GlassDivider'

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassDivider',
  component: GlassDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    spacing: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    inset: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <p>2019 Model · 78.000 km · Dizel</p>
      <GlassDivider {...args} />
      <p>Boyasız, değişensiz, tek elden.</p>
    </div>
  ),
}

/** Ortada footnote etiket; çizgi iki yana bölünür. */
export const Etiketli: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <p>İlan sahibiyle mesajlaş.</p>
      <GlassDivider label="veya" />
      <p>Hemen ara: 0212 000 00 00</p>
      <GlassDivider label="Benzer İlanlar" spacing="lg" />
      <p>Aynı bütçede 12 ilan daha var.</p>
    </div>
  ),
}

/** Spacing ekseni: sm/md/lg dikey ritim token'ları. */
export const Bosluklar: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <p>sm boşluk</p>
      <GlassDivider spacing="sm" />
      <p>md boşluk (default)</p>
      <GlassDivider spacing="md" />
      <p>lg boşluk</p>
      <GlassDivider spacing="lg" />
      <p>son satır</p>
    </div>
  ),
}

/** Liste kullanımı: inset ayraç soldan içeriden başlar (iOS kalıbı). */
export const ListeInset: Story = {
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 420 }}>
      <li style={{ padding: '10px 0 10px 16px' }}>Motor Hacmi — 1.5 lt</li>
      <GlassDivider inset spacing="sm" />
      <li style={{ padding: '10px 0 10px 16px' }}>Yakıt — Dizel</li>
      <GlassDivider inset spacing="sm" />
      <li style={{ padding: '10px 0 10px 16px' }}>Vites — Otomatik</li>
    </ul>
  ),
}

/** Dikey ayraç: satır içinde metaveri ayırır; aria-orientation="vertical". */
export const Dikey: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 600 }}>1.450.000 ₺</span>
      <GlassDivider orientation="vertical" />
      <span>Kadıköy, İstanbul</span>
      <GlassDivider orientation="vertical" />
      <span style={{ color: 'var(--lg-label-secondary)' }}>3 gün önce</span>
    </div>
  ),
}

/**
 * Responsive: spacing token'ları her breakpoint'te AYNIDIR — dar ekranda da
 * ritim değişmez; yalnız içerik daralır. (viewport: mobile1)
 */
export const MobilRitim: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ padding: 12 }}>
      <p>İlan Açıklaması</p>
      <GlassDivider spacing="md" />
      <p>Konum Bilgisi</p>
      <GlassDivider label="Satıcı" spacing="lg" />
      <p>Galeri Kaya Otomotiv</p>
    </div>
  ),
}
