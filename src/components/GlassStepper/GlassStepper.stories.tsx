import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassStepper } from './GlassStepper'

const meta = {
  title: 'Components/GlassStepper',
  component: GlassStepper,
  tags: ['autodocs'],
  args: { label: 'Adet', onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof GlassStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { min: 0, max: 10, defaultValue: 1 } }

/** Formatlı değer: ilan yayın süresi (hafta). */
export const Formatted: Story = {
  args: {
    label: 'Yayın süresi',
    min: 1,
    max: 8,
    defaultValue: 2,
    formatValue: (v) => `${v} hafta`,
  },
}

/** min/max sınırları: uçta ilgili buton disabled olur. */
export const AtBounds: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassStepper {...args} label="Alt sınırda" min={0} max={5} defaultValue={0} />
      <GlassStepper {...args} label="Üst sınırda" min={0} max={5} defaultValue={5} />
    </div>
  ),
}

export const Disabled: Story = { args: { min: 0, max: 10, defaultValue: 3, disabled: true } }

/** Boyut ekseni: yükseklikler kontrol token'larından (dokunmatikte 44px'e yaklaşır). */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassStepper {...args} size="sm" label="Küçük" defaultValue={1} max={9} />
      <GlassStepper {...args} size="md" label="Orta" defaultValue={1} max={9} />
      <GlassStepper {...args} size="lg" label="Büyük" defaultValue={1} max={9} />
    </div>
  ),
}

/** Controlled kullanım: oda sayısı filtresi. */
export const ControlledRoomCount: Story = {
  render: (args) => {
    const [rooms, setRooms] = useState(3)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Oda sayısı</span>
        <GlassStepper {...args} label="Oda sayısı" min={1} max={10} value={rooms} onChange={setRooms} formatValue={(v) => `${v}+1`} />
      </div>
    )
  },
}

/** Responsive: coarse pointer'da butonlar kontrol token'ıyla büyür (md → 44px). */
export const MobileQuantity: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { label: 'Doping adedi', min: 0, max: 5, defaultValue: 1, size: 'md' },
}
