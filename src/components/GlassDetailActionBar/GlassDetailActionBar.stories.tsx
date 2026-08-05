import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassDetailActionBar } from './GlassDetailActionBar'

const meta = {
  title: 'Bileşenler/Eylemler/GlassDetailActionBar',
  component: GlassDetailActionBar,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['rail', 'bar'] },
    material: { control: 'select', options: ['glass', 'flat'] },
  },
} satisfies Meta<typeof GlassDetailActionBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Karar ve iletişim',
    primary: { id: 'message', label: 'Mesaj gönder', onSelect: () => {} },
  },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassDetailActionBar {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    label: 'Karar ve iletişim',
    primary: { id: 'message', label: 'Mesaj gönder', onSelect: () => {} },
    secondary: { id: 'tour', label: 'Randevu iste', onSelect: () => {} },
    utilities: [
      { id: 'save', label: 'Kaydet', onSelect: () => {} },
      { id: 'share', label: 'Paylaş', onSelect: () => {} },
    ],
    note: 'Ören Emlak · yanıt ~4 saat',
  },
  render: Default.render,
}

/** `rail`: masaüstü dikey ray · `bar`: mobil alt çubuk (safe-area). Aynı sayfada ikisi birden görünmez. */
export const Layouts: Story = {
  args: Playground.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480, margin: '48px auto' }}>
      <div style={{ maxWidth: 320 }}>
        <GlassDetailActionBar {...args} layout="rail" />
      </div>
      <GlassDetailActionBar {...args} layout="bar" />
    </div>
  ),
}

/** `material="glass"` (varsayılan) navigasyon/kontrol katmanı camını açar; `flat` içerik katmanında camı tüketmez. */
export const Materials: Story = {
  args: Playground.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 320, margin: '48px auto' }}>
      <GlassDetailActionBar {...args} material="glass" />
      <GlassDetailActionBar {...args} material="flat" />
    </div>
  ),
}

/** Devre dışı primary + basılı (pressed) utility — devre dışı eylem tıklanamaz, pressed `aria-pressed` ile görünür. */
export const States: Story = {
  args: Playground.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 320, margin: '48px auto' }}>
      <GlassDetailActionBar
        {...args}
        primary={{ ...args.primary, disabled: true }}
      />
      <GlassDetailActionBar
        {...args}
        utilities={[
          { id: 'save', label: 'Kaydet', onSelect: () => {}, pressed: true },
          { id: 'share', label: 'Paylaş', onSelect: () => {} },
        ]}
      />
    </div>
  ),
}

/** Uzun Türkçe eylem metinleri — buton içeriği taşmadan sarmalanır/daralır. */
export const UzunIcerik: Story = {
  args: {
    label: 'Karar ve iletişim',
    primary: { id: 'message', label: 'Satıcıya hemen mesaj gönder ve randevu iste', onSelect: () => {} },
    secondary: { id: 'tour', label: 'Yerinde görüşme randevusu talep et', onSelect: () => {} },
    utilities: [
      { id: 'save', label: 'İlanı favorilere kaydet', onSelect: () => {} },
      { id: 'share', label: 'Bağlantıyı paylaş', onSelect: () => {} },
    ],
    note: 'Ören Emlak · ortalama yanıt süresi yaklaşık 4 saat',
  },
  render: Default.render,
}

/** Dar container (360px) + dokunmatik: `bar` düzeni mobil alt çubuk olarak, hedefler ≥44px kalır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile360' } },
  args: Playground.args,
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassDetailActionBar {...args} layout="bar" />
    </div>
  ),
}

/** Düz fildişi zemin: accent dolgu ve hairline kontrastı arka plan sabitlenerek denetlenir. */
export const DuzZemin: Story = {
  parameters: { globals: { backgroundKey: 'light' } },
  args: Playground.args,
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassDetailActionBar {...args} />
    </div>
  ),
}

/**
 * Grup adı `role="group"` + `label` ile duyurulur; sekme sırası DOM sırasıyla
 * eşleşir — primary, secondary, utilities.
 */
export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: Playground.args,
  render: Default.render,
}
