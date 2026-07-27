import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassInput } from './GlassInput'

const meta = {
  title: 'Bileşenler/Form/GlassInput',
  component: GlassInput,
  tags: ['autodocs'],
  args: { onChange: fn(), 'aria-label': 'Arama' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    clearable: { control: 'boolean' },
    // focus halkası CSS state'idir, control değildir (bkz. rules.md)
  },
} satisfies Meta<typeof GlassInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { placeholder: 'Marka, model veya kelime ara' } }

export const Invalid: Story = {
  args: { placeholder: 'Fiyat', invalid: true, defaultValue: '0 TL' },
}

export const Disabled: Story = { args: { placeholder: 'Plaka', disabled: true } }

/** Boyut ekseni: yükseklikler --lg-control-* token'ından (dokunmatikte otomatik 44px+). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <GlassInput size="sm" aria-label="Küçük" placeholder="Küçük — sm" />
      <GlassInput size="md" aria-label="Orta" placeholder="Orta — md" />
      <GlassInput size="lg" aria-label="Büyük" placeholder="Büyük — lg" />
    </div>
  ),
}

/** prefix/suffix adornment slotları: ikon, para birimi vb. Dekoratiftir (aria-hidden). */
export const Adornments: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <GlassInput aria-label="Fiyat" placeholder="Fiyat" prefix="₺" suffix="TL" inputMode="numeric" />
      <GlassInput
        aria-label="Konum ara"
        placeholder="İl / ilçe ara"
        prefix={
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      />
    </div>
  ),
}

/** Kontrollü kullanım + clearable: değer varken Temizle butonu görünür. */
export const ClearableSearch: Story = {
  render: function Render() {
    const [value, setValue] = useState('Volkswagen Golf')
    return (
      <div style={{ maxWidth: 360 }}>
        <GlassInput
          type="search"
          clearable
          aria-label="İlan ara"
          placeholder="İlan ara"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p style={{ font: '13px var(--lg-font)', color: 'var(--lg-label-secondary)' }}>Değer: {value || '—'}</p>
      </div>
    )
  },
}

/**
 * Responsive: bp-sm altında font 16px'e sabitlenir (iOS Safari'nin odakta zoom
 * yapmasını engeller); genişlik her zaman %100 — kolonu üst layout daraltır.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { placeholder: 'Araç ara (mobilde 16px font)', clearable: true, type: 'search' },
}
