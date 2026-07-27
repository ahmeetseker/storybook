import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSkeleton } from './GlassSkeleton'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassSkeleton',
  component: GlassSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
    lines: { control: { type: 'number', min: 1, max: 8 } },
    animate: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassSkeleton {...args} />
    </div>
  ),
}

/** Çok satırlı metin: son satır %60 genişlikte biter (paragraf ritmi). */
export const CokSatir: Story = {
  args: { lines: 3 },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassSkeleton {...args} />
    </div>
  ),
}

/** Varyant matrisi: text · circle · rect. Genişlikler % tabanlı verilebilir. */
export const Varyantlar: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <GlassSkeleton variant="text" width="80%" />
      <GlassSkeleton variant="circle" width={56} height={56} />
      <GlassSkeleton variant="rect" width="100%" height={140} />
    </div>
  ),
}

/** animate=false: statik zemin — prefers-reduced-motion'da shimmer zaten kapanır. */
export const Statik: Story = {
  args: { lines: 2, animate: false },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassSkeleton {...args} />
    </div>
  ),
}

/** İlan kartı iskeleti: gerçek yerleşimi taklit eden kompozisyon (marketplace). */
export const IlanKartiIskeleti: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 360,
        padding: 16,
        borderRadius: 'var(--lg-radius-card)',
        background: 'var(--lg-surface)',
        boxShadow: 'inset 0 0 0 1px var(--lg-hairline)',
      }}
      aria-busy="true"
    >
      <GlassSkeleton variant="rect" height={180} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <GlassSkeleton variant="circle" />
        <div style={{ flex: 1 }}>
          <GlassSkeleton variant="text" width="70%" />
          <div style={{ height: 8 }} />
          <GlassSkeleton variant="text" width="45%" />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <GlassSkeleton lines={3} />
      </div>
    </div>
  ),
}

/**
 * Responsive: genişlikler % tabanlıdır — iskelet, dolduracağı içerikle aynı
 * akışkan grid'de daralır/genişler. (viewport: mobile1)
 */
export const MobilListeIskeleti: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 12 }} aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <GlassSkeleton variant="rect" width="35%" height={72} />
          <div style={{ flex: 1 }}>
            <GlassSkeleton variant="text" width="90%" />
            <div style={{ height: 8 }} />
            <GlassSkeleton variant="text" width="55%" />
          </div>
        </div>
      ))}
    </div>
  ),
}
