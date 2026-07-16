import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassCheckbox } from './GlassCheckbox'

const meta = {
  title: 'Components/GlassCheckbox',
  component: GlassCheckbox,
  tags: ['autodocs'],
  args: { label: 'Garantili ilanlar', onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    indeterminate: { control: 'boolean' },
    // checked'i Controls'tan kurcalamak controlled moda kilitler — render örneklerine bak
  },
} satisfies Meta<typeof GlassCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Checked: Story = { args: { label: 'Pazarlık payı var', defaultChecked: true } }
export const Indeterminate: Story = { args: { label: 'Tüm filtreleri seç', indeterminate: true } }
export const Disabled: Story = { args: { label: 'Kapora ile rezerve (yakında)', disabled: true } }

/** Boyut ekseni: sm filtre listeleri, md form gövdesi için. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GlassCheckbox size="sm" label="Küçük — Takas olur" defaultChecked />
      <GlassCheckbox size="md" label="Orta — Kredi kartına taksit" defaultChecked />
    </div>
  ),
}

/** State matrisi: boş · seçili · karışık · disabled birlikte. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GlassCheckbox label="Boş" />
      <GlassCheckbox label="Seçili" defaultChecked />
      <GlassCheckbox label="Karışık (tümünü seç)" indeterminate />
      <GlassCheckbox label="Disabled" disabled />
      <GlassCheckbox label="Disabled + seçili" disabled defaultChecked />
    </div>
  ),
}

/** Controlled kullanım: "tümünü seç" + alt öğeler — indeterminate senaryosu. */
export const ControlledSelectAll: Story = {
  render: () => {
    const [items, setItems] = useState([true, false, true])
    const all = items.every(Boolean)
    const some = items.some(Boolean)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GlassCheckbox
          label="Tüm ilan tiplerini seç"
          checked={all}
          indeterminate={some && !all}
          onChange={(e) => setItems(items.map(() => e.target.checked))}
        />
        {['Sahibinden', 'Galeriden', 'Yetkili bayiden'].map((l, i) => (
          <div key={l} style={{ paddingLeft: 24 }}>
            <GlassCheckbox
              label={l}
              checked={items[i]}
              onChange={(e) => setItems(items.map((v, j) => (j === i ? e.target.checked : v)))}
            />
          </div>
        ))}
      </div>
    )
  },
}

/** Responsive: dar ekran + coarse pointer'da kutu büyür, satır 44px dokunma hedefi olur. */
export const MobileFilterList: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 320 }}>
      <GlassCheckbox label="Boyasız / değişensiz" defaultChecked />
      <GlassCheckbox label="Garanti süresi devam ediyor" />
      <GlassCheckbox label="İlk sahibinden" />
      <GlassCheckbox label="Videolu ilan" />
    </div>
  ),
}
