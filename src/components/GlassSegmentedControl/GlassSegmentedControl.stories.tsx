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
  title: 'Components/GlassSegmentedControl',
  component: GlassSegmentedControl,
  tags: ['autodocs'],
  args: { options: viewOptions, label: 'Görünüm', onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
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

/** Controlled kullanım: seçim dışarıdan yönetilir, görünüm anında değişir. */
export const Controlled: Story = {
  render: () => {
    const [view, setView] = useState('list')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <GlassSegmentedControl label="Görünüm" options={viewOptions} value={view} onChange={setView} />
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          Aktif görünüm: {viewOptions.find((o) => o.value === view)?.label}
        </span>
      </div>
    )
  },
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

/** Responsive: dokunmatik yüksekliği --lg-control token'ından büyür. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultValue: 'grid' },
}
