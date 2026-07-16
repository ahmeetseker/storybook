import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSlider } from './GlassSlider'

const meta = {
  title: 'Components/GlassSlider',
  component: GlassSlider,
  tags: ['autodocs'],
  args: { label: 'Azami fiyat', onChange: fn() },
  argTypes: {
    showValue: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 32 }}><Story /></div>],
} satisfies Meta<typeof GlassSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { defaultValue: 40 } }

/** Değer baloncuğu + para formatı: fiyat filtresi senaryosu. */
export const PriceWithBubble: Story = {
  args: {
    label: 'Azami fiyat',
    min: 100_000,
    max: 5_000_000,
    step: 50_000,
    defaultValue: 1_250_000,
    showValue: true,
    formatValue: (v) => `${new Intl.NumberFormat('tr-TR').format(v)} TL`,
  },
}

/** Kilometre aralığı: adımlı kaba değerler. */
export const Kilometre: Story = {
  args: { label: 'Azami kilometre', min: 0, max: 300_000, step: 10_000, defaultValue: 120_000, showValue: true, formatValue: (v) => `${v / 1000} bin km` },
}

export const Disabled: Story = { args: { defaultValue: 60, disabled: true, showValue: true } }

/** Controlled kullanım: değer dışarıdan yönetilir, onChange number döner. */
export const Controlled: Story = {
  render: (args) => {
    const [val, setVal] = useState(25)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GlassSlider {...args} label="İlan yaşı (gün)" min={0} max={90} value={val} onChange={setVal} />
        <span style={{ fontSize: 13, opacity: 0.7 }}>Son {val} günün ilanları</span>
      </div>
    )
  },
}

/** Responsive: coarse pointer'da thumb 28px, kök 44px dokunma hedefi olur. */
export const MobilePriceFilter: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    label: 'Azami fiyat (mobil)',
    min: 0,
    max: 100,
    defaultValue: 65,
    showValue: true,
    formatValue: (v) => `%${v}`,
  },
}
