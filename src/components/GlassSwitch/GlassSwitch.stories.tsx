import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSwitch } from './GlassSwitch'

const meta = {
  title: 'Bileşenler/Form/GlassSwitch',
  component: GlassSwitch,
  tags: ['autodocs'],
  args: { label: 'Fiyat düşünce bildir', onChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    tint: { control: 'color', description: 'Açıkken ray vurgusu; default --lg-accent' },
  },
} satisfies Meta<typeof GlassSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const On: Story = { args: { label: 'Vitrine çıkar', defaultChecked: true } }
export const Tinted: Story = { args: { label: 'Acil ilan', defaultChecked: true, tint: 'var(--lg-danger, #ff3b30)' } }
export const Disabled: Story = { args: { label: 'Doping (pakete dahil değil)', disabled: true } }

/** Boyut ekseni: sm yoğun listeler, md ayar satırları için. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <GlassSwitch size="sm" label="Küçük" defaultChecked />
      <GlassSwitch size="md" label="Orta" defaultChecked />
    </div>
  ),
}

/** State matrisi: kapalı · açık · tint · disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassSwitch label="Kapalı" />
      <GlassSwitch label="Açık" defaultChecked />
      <GlassSwitch label="Tint" defaultChecked tint="var(--lg-success, #34c759)" />
      <GlassSwitch label="Disabled kapalı" disabled />
      <GlassSwitch label="Disabled açık" disabled defaultChecked />
    </div>
  ),
}

const ControlledSettingRowDemo = () => {
  const [on, setOn] = useState(true)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, maxWidth: 360 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Benzer ilan bildirimi</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{on ? 'Açık — günde en fazla 3 bildirim' : 'Kapalı'}</div>
      </div>
      <GlassSwitch label="Benzer ilan bildirimi" checked={on} onChange={setOn} />
    </div>
  )
}

/** Controlled ayar satırı: anında etkili tercih (form submit beklemez). */
export const ControlledSettingRow: Story = {
  render: () => <ControlledSettingRowDemo />,
}

/** Responsive: coarse pointer'da ray/thumb büyür, görünmez halo hedefi 44px'e tamamlar. */
export const MobileSettings: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      {['Fiyat düşünce bildir', 'Yeni ilan bildirimi', 'Mesaj sesi'].map((l) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15 }}>{l}</span>
          <GlassSwitch label={l} defaultChecked={l !== 'Mesaj sesi'} />
        </div>
      ))}
    </div>
  ),
}
