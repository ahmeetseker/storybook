import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassButton } from './GlassButton'

const meta = {
  title: 'Bileşenler/Eylemler/GlassButton',
  component: GlassButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    material: { control: 'inline-radio', options: ['glass', 'flat'] },
    tint: { control: 'color', description: 'Semantik vurgu; tema rengi verme (tema token’dan gelir)' },
    loading: { control: 'boolean' },
    // hover/focus/active bilinçli olarak control değildir — CSS state'idir (bkz. rules.md)
  },
} satisfies Meta<typeof GlassButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Devam Et' } }
export const Tinted: Story = { args: { children: 'Satın Al', tint: 'var(--lg-accent, #b45309)', tone: 'light' } }
export const Prominent: Story = { args: { children: 'Bitti', prominent: true } }
export const ExtraLarge: Story = { args: { children: 'Başlayalım', size: 'xl' } }
export const Disabled: Story = { args: { children: 'Devre Dışı', disabled: true } }
export const Loading: Story = { args: { children: 'Gönderiliyor', prominent: true, loading: true } }

/**
 * Malzeme ekseni. `flat` bir stil tercihi değil **katman kararıdır**: sayfa
 * başına cam bütçesi altıdır, içerik katmanındaki bir kartın içindeki buton bu
 * payı hak etmez. Eylem dili (renk, metin, ağırlık) iki malzemede de aynıdır —
 * fark yalnız yüzeyin kendisidir.
 */
export const Materials: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['glass', 'flat'] as const).map((material) => (
        <div key={material} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <code style={{ inlineSize: '4rem', fontSize: 12 }}>{material}</code>
          <GlassButton material={material} prominent>
            Birincil
          </GlassButton>
          <GlassButton material={material}>İkincil</GlassButton>
          <GlassButton material={material} disabled>
            Devre dışı
          </GlassButton>
        </div>
      ))}
    </div>
  ),
}

/** Boyut ekseni tek bakışta — yükseklikler kontrol token'larından gelir (dokunmatikte 44px+). */
export const Sizes: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassButton size="sm">Küçük</GlassButton>
      <GlassButton size="md">Orta</GlassButton>
      <GlassButton size="lg">Büyük</GlassButton>
      <GlassButton size="xl">Extra</GlassButton>
    </div>
  ),
}

/** Görsel state matrisi: default · disabled · loading · prominent birlikte. */
export const States: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassButton>Default</GlassButton>
      <GlassButton disabled>Disabled</GlassButton>
      <GlassButton loading>Loading</GlassButton>
      <GlassButton prominent>Prominent</GlassButton>
      <GlassButton prominent loading>
        Prominent + Loading
      </GlassButton>
    </div>
  ),
}

/** Uzun içerik: buton kırpmaz, tek satır büyür — metni kısaltmak çağıranın işi. */
export const LongContent: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', maxWidth: 320 }}>
      <GlassButton>Değerlendirmeyi Tamamla ve Devam Et</GlassButton>
      <GlassButton size="sm">Uzun etiketli küçük buton örneği</GlassButton>
    </div>
  ),
}
