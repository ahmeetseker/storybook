import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassField } from './GlassField'
import { GlassInput } from '../GlassInput'
import { GlassTextarea } from '../GlassTextarea'
import { GlassSelect } from '../GlassSelect'

const meta = {
  title: 'Bileşenler/Form/GlassField',
  component: GlassField,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    description: { control: 'text' },
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Fiyat' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassField {...args}>
        <GlassInput placeholder="450.000" prefix="₺" inputMode="numeric" />
      </GlassField>
    </div>
  ),
}

export const WithDescription: Story = {
  args: { label: 'Kilometre', description: 'Noktasız girin; örn. 78500' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassField {...args}>
        <GlassInput placeholder="78500" inputMode="numeric" />
      </GlassField>
    </div>
  ),
}

/** error varken description gizlenir; hata aria-live="polite" ile duyurulur. */
export const WithError: Story = {
  args: {
    label: 'Fiyat',
    description: 'TL cinsinden girin',
    error: 'Fiyat 0 olamaz',
    required: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassField {...args}>
        <GlassInput placeholder="450.000" prefix="₺" defaultValue="0" />
      </GlassField>
    </div>
  ),
}

/** Canlı doğrulama: yazarken hata gelir/gider; kontrol invalid'i context'ten alır. */
export const LiveValidation: Story = {
  args: { label: 'Başlık', required: true },
  render: function Render(args) {
    const [value, setValue] = useState('')
    const error = value.trim().length > 0 && value.trim().length < 10 ? 'Başlık en az 10 karakter olmalı' : undefined
    return (
      <div style={{ maxWidth: 360 }}>
        <GlassField {...args} description="İlanınızı en iyi anlatan başlık" error={error}>
          <GlassInput placeholder="Sahibinden temiz Golf 1.6" value={value} onChange={(e) => setValue(e.target.value)} clearable />
        </GlassField>
      </div>
    )
  },
}

/** Farklı kontrollerle: Input, Select ve Textarea aynı context sözleşmesini tüketir. */
export const FormComposition: Story = {
  args: { label: '' },
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
      <GlassField label="İlan Başlığı" required>
        <GlassInput placeholder="2019 Passat 1.6 TDI Comfortline" />
      </GlassField>
      <GlassField label="Vites" required>
        <GlassSelect
          placeholder="Vites seçin"
          options={[
            { value: 'manuel', label: 'Manuel' },
            { value: 'otomatik', label: 'Otomatik' },
          ]}
        />
      </GlassField>
      <GlassField label="Açıklama" description="En az 50 karakter">
        <GlassTextarea autoResize minRows={3} maxRows={8} placeholder="Aracınızı anlatın..." />
      </GlassField>
    </form>
  ),
}

/**
 * Responsive: alan her viewport'ta %100 genişlik; mobilde içerideki kontroller
 * 16px font kuralına (iOS zoom) kendileri geçer.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { label: 'Fiyat', description: 'TL cinsinden girin', required: true },
  render: (args) => (
    <GlassField {...args}>
      <GlassInput placeholder="450.000" prefix="₺" inputMode="numeric" clearable />
    </GlassField>
  ),
}
