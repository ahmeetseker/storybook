import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTooltip } from './GlassTooltip'
import { GlassButton } from '../GlassButton/GlassButton'
import { GlassBadge } from '../GlassBadge/GlassBadge'

const meta = {
  title: 'Components/GlassTooltip',
  component: GlassTooltip,
  tags: ['autodocs'],
  args: {
    content: 'Fiyat, benzer ilan ortalamasına göre %8 düşük',
    children: <GlassButton size="sm">Fiyat analizi</GlassButton>,
  },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    delay: { control: 'number', description: 'Hover açılış gecikmesi (ms); kapanış anında' },
    // content accessible name değildir — tetikleyicinin kendi adı olmalı (bkz. rules.md)
  },
} satisfies Meta<typeof GlassTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Dört yerleşim tek bakışta. Panel tetikleyiciye 8px mesafede konumlanır. */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
      <GlassTooltip content="Üstte açılır" placement="top">
        <GlassButton size="sm">top</GlassButton>
      </GlassTooltip>
      <GlassTooltip content="Altta açılır" placement="bottom">
        <GlassButton size="sm">bottom</GlassButton>
      </GlassTooltip>
      <GlassTooltip content="Solda açılır" placement="left">
        <GlassButton size="sm">left</GlassButton>
      </GlassTooltip>
      <GlassTooltip content="Sağda açılır" placement="right">
        <GlassButton size="sm">right</GlassButton>
      </GlassTooltip>
    </div>
  ),
}

/** Gecikme ekseni: 0ms anında, 800ms sabırlı kullanıcıya. Kapanış her zaman anında. */
export const Delays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 60 }}>
      <GlassTooltip content="Anında açıldı" delay={0}>
        <GlassButton size="sm">delay=0</GlassButton>
      </GlassTooltip>
      <GlassTooltip content="800ms bekledi" delay={800}>
        <GlassButton size="sm">delay=800</GlassButton>
      </GlassTooltip>
    </div>
  ),
}

/** Rozet gibi etkileşimsiz tetikleyiciler: hover açar; klavye erişimi için
    tetikleyici odaklanabilir olmalı (buton/link tercih et). */
export const OnBadge: Story = {
  render: () => (
    <div style={{ padding: 60 }}>
      <GlassTooltip content="Satıcı kimliği ve telefonu doğrulandı" placement="bottom">
        <GlassBadge tint="var(--lg-success)">Doğrulanmış satıcı</GlassBadge>
      </GlassTooltip>
    </div>
  ),
}

/** Uzun içerik 240px'te sarar; tooltip cümle uzunluğunu aşan içerik için yanlış araçtır. */
export const LongContent: Story = {
  args: {
    content:
      'Bu ilanın fiyatı, son 90 günde aynı model ve yıl için yayınlanan 42 ilanın ortalamasına göre %8 daha düşük.',
    placement: 'bottom',
  },
}

/** Responsive: dokunmatik cihazda (pointer: coarse) tooltip HİÇ açılmaz — long-press
    desteklenmez, kritik bilgi tooltip'e konmaz. Bu story masaüstü pointer'la yine açılır;
    gerçek davranış cihaz emülasyonunda (touch) görülür. */
export const TouchDevice: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    content: 'Dokunmatikte bu panel görünmez',
    children: <GlassButton size="sm">Dokunmatikte tooltip yok</GlassButton>,
  },
}
