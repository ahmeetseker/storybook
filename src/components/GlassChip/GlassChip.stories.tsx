import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassChip } from './GlassChip'

const meta = {
  title: 'Bileşenler/Eylemler/GlassChip',
  component: GlassChip,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    tint: { control: 'color', description: 'Semantik vurgu; tema rengi verme' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Sahibinden', onClick: fn() } }

/** Toggle modu: defaultSelected ile uncontrolled seçim — aria-pressed verilir. */
export const Secilebilir: Story = {
  args: { children: 'Boyasız', defaultSelected: true, onSelectedChange: fn() },
}

/** Kaldırılabilir filtre etiketi: sağda × butonu (aria-label="Kaldır"); Delete/Backspace de kaldırır. */
export const Kaldirilabilir: Story = {
  args: { children: 'İstanbul', onRemove: fn(), onClick: fn() },
}

export const Disabled: Story = {
  args: { children: 'Hasar Kayıtlı', defaultSelected: false, disabled: true, onSelectedChange: fn() },
}

/** Boyut ekseni; ikonlu kullanım. */
export const Boyutlar: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassChip size="sm" onClick={() => {}}>
        Otomatik
      </GlassChip>
      <GlassChip size="md" onClick={() => {}}>
        Dizel
      </GlassChip>
      <GlassChip
        size="md"
        icon={
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 14.5s5-4.8 5-8.2a5 5 0 1 0-10 0c0 3.4 5 8.2 5 8.2Z M8 8.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z" />
          </svg>
        }
        onClick={() => {}}
      >
        Kadıköy
      </GlassChip>
    </div>
  ),
}

/** Kontrollü filtre grubu: seçim dışarıda tutulur, chip'ler durumu yansıtır. */
export const FiltreGrubu: Story = {
  render: function FiltreGrubuStory() {
    const [secili, setSecili] = useState<string[]>(['Sahibinden'])
    const filtreler = ['Sahibinden', 'Boyasız', 'Değişensiz', 'Garantili', 'Takasa Uygun']
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 420 }}>
        {filtreler.map((f) => (
          <GlassChip
            key={f}
            selected={secili.includes(f)}
            onSelectedChange={(on) => setSecili((prev) => (on ? [...prev, f] : prev.filter((x) => x !== f)))}
          >
            {f}
          </GlassChip>
        ))}
      </div>
    )
  },
}

/** Seçili + tint: accent yerine semantik vurgu rengi dolgu olur. */
export const TintliSecim: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <GlassChip defaultSelected tint="var(--lg-success, #34c759)">
        Uygun Fiyat
      </GlassChip>
      <GlassChip tint="var(--lg-warning, #ff9500)" onClick={() => {}}>
        Acil
      </GlassChip>
    </div>
  ),
}

/**
 * Responsive: dar ekranda chip'ler sarar; coarse pointer'da min-height 36px'e
 * yükselir (dokunma hedefi). (viewport: mobile1)
 */
export const MobilFiltreSatiri: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function MobilFiltreSatiriStory() {
    const [etiketler, setEtiketler] = useState(['İstanbul', 'Max 1.5M ₺', '3+1', 'Asansörlü', 'Eşyalı'])
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12 }}>
        {etiketler.map((e) => (
          <GlassChip key={e} size="sm" onRemove={() => setEtiketler((prev) => prev.filter((x) => x !== e))}>
            {e}
          </GlassChip>
        ))}
      </div>
    )
  },
}
