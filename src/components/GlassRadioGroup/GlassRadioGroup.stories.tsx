import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassRadioGroup } from './GlassRadioGroup'

const yakit = [
  { value: 'benzin', label: 'Benzin' },
  { value: 'dizel', label: 'Dizel' },
  { value: 'hibrit', label: 'Hibrit' },
  { value: 'elektrik', label: 'Elektrik' },
]

const meta = {
  title: 'Bileşenler/Form/GlassRadioGroup',
  component: GlassRadioGroup,
  tags: ['autodocs'],
  args: { options: yakit, label: 'Yakıt tipi', onChange: fn() },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof GlassRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { defaultValue: 'dizel' } }

/** Açıklamalı seçenekler: sıralama tercihi gibi ikincil metin gereken yerlerde. */
export const WithDescriptions: Story = {
  args: {
    label: 'Sıralama',
    defaultValue: 'yeni',
    options: [
      { value: 'yeni', label: 'Önce en yeni', description: 'İlan tarihine göre azalan' },
      { value: 'ucuz', label: 'Önce en ucuz', description: 'Fiyata göre artan' },
      { value: 'yakin', label: 'Önce en yakın', description: 'Konumunuza uzaklığa göre' },
    ],
  },
}

/** Yatay dizilim — bp-sm (640px) altında otomatik dikeye düşer. */
export const Horizontal: Story = {
  args: { orientation: 'horizontal', defaultValue: 'benzin' },
}

/** Boyut ekseni. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassRadioGroup {...args} size="sm" label="Küçük — Vites" options={[
        { value: 'manuel', label: 'Manuel' },
        { value: 'otomatik', label: 'Otomatik' },
      ]} defaultValue="otomatik" />
      <GlassRadioGroup {...args} size="md" label="Orta — Kasa tipi" options={[
        { value: 'sedan', label: 'Sedan' },
        { value: 'hatchback', label: 'Hatchback' },
      ]} defaultValue="sedan" />
    </div>
  ),
}

/** Disabled seçenek: klavye gezinmesi ve tıklama onu atlar. */
export const DisabledOption: Story = {
  args: {
    label: 'İlan durumu',
    defaultValue: 'aktif',
    options: [
      { value: 'aktif', label: 'Aktif' },
      { value: 'pasif', label: 'Pasif' },
      { value: 'arsiv', label: 'Arşiv (yakında)', disabled: true },
    ],
  },
}

const ControlledDemo = (args: ComponentProps<typeof GlassRadioGroup>) => {
  const [val, setVal] = useState('hibrit')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GlassRadioGroup {...args} value={val} onChange={setVal} />
      <span style={{ fontSize: 13, opacity: 0.7 }}>Seçili: {val}</span>
    </div>
  )
}

/** Controlled kullanım: seçim dışarıdan yönetilir. */
export const Controlled: Story = {
  render: (args) => <ControlledDemo {...args} />,
}

/** Responsive: horizontal grup mobil genişlikte dikeye düşer (media query, flex-wrap değil). */
export const ResponsiveHorizontal: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { orientation: 'horizontal', defaultValue: 'elektrik', label: 'Yakıt tipi (mobil)' },
}
