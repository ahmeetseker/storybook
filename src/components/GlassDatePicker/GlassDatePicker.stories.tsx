import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassDatePicker } from './GlassDatePicker'

const meta = {
  title: 'Bileşenler/Form/GlassDatePicker',
  component: GlassDatePicker,
  tags: ['autodocs'],
  args: { onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    locale: { control: 'text', description: 'Ay/gün adları Intl.DateTimeFormat ile; hafta Pazartesi başlar' },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
  },
} satisfies Meta<typeof GlassDatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Randevu tarihi dolu geldi — trigger `dateStyle: 'medium'` ile biçimler. */
export const Dolu: Story = {
  args: { defaultValue: new Date(2026, 6, 15) },
}

/** Boyut ekseni — yükseklikler kontrol token'larından gelir. */
export const Boyutlar: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <GlassDatePicker {...args} size="sm" placeholder="Küçük" />
      <GlassDatePicker {...args} size="md" placeholder="Orta" />
      <GlassDatePicker {...args} size="lg" placeholder="Büyük" />
    </div>
  ),
}

/** Ekspertiz randevusu yalnız belirli aralıkta alınabilir — dışı disabled. */
export const MinMax: Story = {
  args: {
    defaultValue: new Date(2026, 6, 15),
    min: new Date(2026, 6, 10),
    max: new Date(2026, 7, 20),
    placeholder: 'Randevu tarihi',
  },
}

/** State matrisi: default · invalid · disabled birlikte. */
export const Durumlar: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <GlassDatePicker {...args} placeholder="Default" />
      <GlassDatePicker {...args} invalid placeholder="Geçersiz (invalid)" />
      <GlassDatePicker {...args} disabled placeholder="Devre dışı" />
    </div>
  ),
}

/** Controlled kullanım: değer dışarıda tutulur, temizleme dışarıdan yapılır. */
export const Controlled: Story = {
  render: function Render(args) {
    const [date, setDate] = useState<Date | null>(new Date(2026, 6, 15))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <GlassDatePicker
          {...args}
          value={date}
          onChange={(d) => {
            setDate(d)
            args.onChange?.(d)
          }}
          placeholder="İlan yayın tarihi"
        />
        <button type="button" onClick={() => setDate(null)}>
          Temizle
        </button>
      </div>
    )
  },
}

/**
 * Responsive davranış: bp-sm altında panel `max-width: calc(100vw - 32px)` ile
 * ekrana sığar, gün hücreleri ≥40px dokunma hedefine büyür.
 */
export const Mobil: Story = {
  args: { defaultValue: new Date(2026, 6, 15) },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
