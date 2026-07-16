import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassTextarea } from './GlassTextarea'

const meta = {
  title: 'Components/GlassTextarea',
  component: GlassTextarea,
  tags: ['autodocs'],
  args: { onChange: fn(), 'aria-label': 'Açıklama' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    minRows: { control: 'number' },
    maxRows: { control: 'number' },
  },
} satisfies Meta<typeof GlassTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'İlan açıklaması yazın — hasar kaydı, bakım geçmişi, ekstralar...' },
}

export const Invalid: Story = {
  args: { placeholder: 'Açıklama', invalid: true, defaultValue: 'Kısa' },
}

export const Disabled: Story = {
  args: { defaultValue: 'İlan yayından kaldırıldığı için açıklama düzenlenemez.', disabled: true },
}

/** Boyut ekseni: padding ve tipografi boyuta göre ölçeklenir. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <GlassTextarea size="sm" minRows={2} aria-label="Küçük" placeholder="Küçük — sm" />
      <GlassTextarea size="md" minRows={2} aria-label="Orta" placeholder="Orta — md" />
      <GlassTextarea size="lg" minRows={2} aria-label="Büyük" placeholder="Büyük — lg" />
    </div>
  ),
}

/** Kontrollü + autoResize: içerik büyüdükçe alan büyür, maxRows'ta içeride scroll başlar. */
export const AutoResize: Story = {
  render: function Render() {
    const [value, setValue] = useState('Aracın motoru yeni revizyonlu.\nYazın yeni lastikler takıldı.')
    return (
      <div style={{ maxWidth: 420 }}>
        <GlassTextarea
          autoResize
          minRows={2}
          maxRows={8}
          aria-label="İlan açıklaması"
          placeholder="Yazdıkça büyür (min 2, max 8 satır)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    )
  },
}

/**
 * Responsive: bp-sm altında font 16px'e sabitlenir (iOS Safari'nin odakta zoom
 * yapmasını engeller); genişlik her zaman %100.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { placeholder: 'Mobilde 16px font ile açıklama yazın', autoResize: true, maxRows: 6 },
}
