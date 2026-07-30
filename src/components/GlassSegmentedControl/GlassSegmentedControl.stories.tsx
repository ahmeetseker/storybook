import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSegmentedControl } from './GlassSegmentedControl'

const viewOptions = [
  { value: 'list', label: 'Liste' },
  { value: 'grid', label: 'Izgara' },
  { value: 'map', label: 'Harita' },
]

const meta = {
  title: 'Bileşenler/Navigasyon/GlassSegmentedControl',
  component: GlassSegmentedControl,
  tags: ['autodocs'],
  args: { options: viewOptions, label: 'Görünüm', onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    variant: { control: 'inline-radio', options: ['capsule', 'bar'] },
    value: { control: false, description: 'Controlled seçili değer' },
  },
} satisfies Meta<typeof GlassSegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDefaultValue: Story = { args: { defaultValue: 'grid' } }

/** Boyut ekseni: sm toolbar içi, md bağımsız kullanım. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <GlassSegmentedControl size="sm" label="Görünüm (sm)" options={viewOptions} />
      <GlassSegmentedControl size="md" label="Görünüm (md)" options={viewOptions} />
    </div>
  ),
}

/** State matrisi: seçili · tek segment disabled · tüm kontrol disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <GlassSegmentedControl label="Seçili" options={viewOptions} defaultValue="grid" />
      <GlassSegmentedControl
        label="Segment disabled"
        options={[viewOptions[0], { ...viewOptions[1], disabled: true }, viewOptions[2]]}
      />
      <GlassSegmentedControl label="Disabled" options={viewOptions} disabled />
    </div>
  ),
}

const ControlledDemo = () => {
  const [view, setView] = useState('list')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassSegmentedControl label="Görünüm" options={viewOptions} value={view} onChange={setView} />
      <span style={{ fontSize: 13, opacity: 0.7 }}>
        Aktif görünüm: {viewOptions.find((o) => o.value === view)?.label}
      </span>
    </div>
  )
}

/** Controlled kullanım: seçim dışarıdan yönetilir, görünüm anında değişir. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

/** Uzun içerik: segmentler daralmaz, bar yatay scroll'a düşer. */
export const LongContent: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <GlassSegmentedControl
        label="Kategori"
        options={[
          { value: 'otomobil', label: 'Otomobil' },
          { value: 'arazi', label: 'Arazi, SUV & Pickup' },
          { value: 'motosiklet', label: 'Motosiklet' },
          { value: 'ticari', label: 'Minivan & Panelvan' },
        ]}
      />
    </div>
  ),
}

/**
 * Yerleşim ekseni. `capsule` kendi cam kapsülünde duran bağımsız kontrol;
 * `bar` bir kartın başlık şeridi — cam kurmaz, tam genişliğe yayılır,
 * segmentler eşit payı alır ve altta saç teli ayraç bırakır.
 */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420, alignItems: 'flex-start' }}>
      <GlassSegmentedControl {...args} variant="capsule" label="Kapsül" />
      <div
        style={{
          alignSelf: 'stretch',
          padding: 'var(--lg-space-3)',
          border: '1px solid var(--lg-hairline)',
          borderRadius: 'var(--lg-radius-card)',
          background: 'var(--lg-surface)',
        }}
      >
        <GlassSegmentedControl {...args} variant="bar" label="Kart başlığı" />
        <p style={{ margin: 'var(--lg-space-3) 0 0', fontSize: 'var(--lg-text-footnote)', opacity: 0.7 }}>
          Şeridin altındaki kart içeriği
        </p>
      </div>
    </div>
  ),
}

/**
 * fill: geniş şeritte `equal` tek kelime için devasa seçim damlası üretir;
 * `content` segmenti etiket kadar tutar ve şeridi sola hizalar.
 */
export const BarFill: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 760 }}>
      {(['equal', 'content'] as const).map((fill) => (
        <div
          key={fill}
          style={{
            padding: 'var(--lg-space-3)',
            border: '1px solid var(--lg-hairline)',
            borderRadius: 'var(--lg-radius-card)',
            background: 'var(--lg-surface)',
          }}
        >
          <GlassSegmentedControl {...args} variant="bar" fill={fill} label={`fill=${fill}`} />
          <p style={{ margin: 'var(--lg-space-3) 0 0', fontSize: 'var(--lg-text-footnote)', opacity: 0.7 }}>
            fill=&quot;{fill}&quot;
          </p>
        </div>
      ))}
    </div>
  ),
}

/** Responsive: dokunmatik yüksekliği --lg-control token'ından büyür. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultValue: 'grid' },
}
