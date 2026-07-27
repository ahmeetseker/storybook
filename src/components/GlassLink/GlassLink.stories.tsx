import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassLink } from './GlassLink'

const meta = {
  title: 'Bileşenler/Eylemler/GlassLink',
  component: GlassLink,
  tags: ['autodocs'],
  args: { href: '#', onClick: fn(), children: 'Satıcının diğer ilanları' },
  argTypes: {
    variant: { control: 'select', options: ['inline', 'standalone'] },
    external: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassLink>

export default meta
type Story = StoryObj<typeof meta>

/** inline (default): gövde metni içinde akar, alt çizgi + accent. */
export const Default: Story = {
  render: (args) => (
    <p style={{ maxWidth: 480, margin: 0 }}>
      Bu araç için ekspertiz raporu mevcut. Detayları görmek için{' '}
      <GlassLink {...args}>ekspertiz raporunu inceleyin</GlassLink> veya satıcıyla iletişime geçin.
    </p>
  ),
}

/** standalone: chevron'lu bağımsız satır linki — alt çizgi yok. */
export const Standalone: Story = {
  args: { variant: 'standalone', children: 'Satıcının diğer ilanları' },
}

/** external: target=_blank + rel otomatik, ↗ ikonu + sr-only "(yeni sekme)". */
export const External: Story = {
  args: { external: true, href: 'https://ekspertiz.example.com', children: 'Ekspertiz kuruluşunun sitesi' },
}

export const Disabled: Story = {
  args: { disabled: true, variant: 'standalone', children: 'İlan yayından kaldırıldı' },
}

/** Varyant/durum matrisi tek bakışta. */
export const Varyantlar: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassLink href="#">inline link</GlassLink>
      <GlassLink href="#" variant="standalone">
        standalone link
      </GlassLink>
      <GlassLink href="https://example.com" external>
        inline + external
      </GlassLink>
      <GlassLink href="https://example.com" variant="standalone" external>
        standalone + external
      </GlassLink>
      <GlassLink href="#" disabled>
        inline + disabled
      </GlassLink>
    </div>
  ),
}

/**
 * Responsive: linkin özel responsive davranışı yok — her yerde aynı, metinle
 * birlikte sarar. Bu story mobil viewport'ta dar paragraf akışını gösterir.
 */
export const MobilAkis: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <p style={{ margin: 0 }}>
      2019 model, 45.000 km'de, boyasız. Aracın{' '}
      <GlassLink href="#">tramer kaydını görüntüleyin</GlassLink>, benzer fiyatlar için{' '}
      <GlassLink href="https://fiyat.example.com" external>
        piyasa analizine bakın
      </GlassLink>{' '}
      veya doğrudan teklif verin.
    </p>
  ),
}
