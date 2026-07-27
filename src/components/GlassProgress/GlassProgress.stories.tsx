import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassProgress } from './GlassProgress'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassProgress',
  component: GlassProgress,
  tags: ['autodocs'],
  args: { label: 'İlan tamamlanma durumu' },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    variant: { control: 'select', options: ['bar', 'circle'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tint: { control: 'color', description: 'Semantik vurgu; verilmezse --lg-accent' },
    showValue: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(480px, 90vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { value: 40 } }

/** value verilmezse indeterminate: kayan bant, `aria-valuenow` yok. */
export const Indeterminate: Story = { args: { label: 'İlan fotoğrafları yükleniyor' } }

export const ShowValue: Story = { args: { value: 62, showValue: true } }

/** Boyut ekseni: ray kalınlığı 4/6/8px. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassProgress size="sm" value={30} label="Küçük" />
      <GlassProgress size="md" value={55} label="Orta" />
      <GlassProgress size="lg" value={80} label="Büyük" />
    </div>
  ),
}

/** Dairesel varyant: determinate + indeterminate + değerli. */
export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <GlassProgress variant="circle" size="sm" value={35} label="Fotoğraf 1" />
      <GlassProgress variant="circle" size="md" value={72} showValue label="Fotoğraf 2" />
      <GlassProgress variant="circle" size="lg" value={100} showValue label="Fotoğraf 3" />
      <GlassProgress variant="circle" size="md" label="Yükleniyor" />
    </div>
  ),
}

/** Semantik tint: durum rengiyle. Tema rengi verme — tint yalnız semantik vurgudur. */
export const Tinted: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassProgress value={100} tint="var(--lg-success)" showValue label="Ekspertiz tamamlandı" />
      <GlassProgress value={45} tint="var(--lg-warning)" showValue label="Doping süresi" />
      <GlassProgress value={12} tint="var(--lg-danger)" showValue label="İlan süresi doluyor" />
    </div>
  ),
}

const AnimatedDemo = () => {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 600)
    return () => clearInterval(t)
  }, [])
  return <GlassProgress value={value} showValue label="Fotoğraflar yükleniyor" />
}

/** Kontrollü örnek: yükleme simülasyonu. */
export const Animated: Story = {
  render: () => <AnimatedDemo />,
}

/** Responsive: bar her genişlikte %100 — dar ekranda konteynerine uyar,
    ek breakpoint davranışı gerekmez. */
export const MobileFullWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { value: 66, showValue: true, label: 'İlan tamamlanma durumu' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}
