import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, userEvent, within } from 'storybook/test'
import { GlassTourScheduler, type GlassTourDay } from './GlassTourScheduler'

// İzmir, Urla — deniz manzaralı imarlı arsa için yerinde görme randevusu takvimi.
// Tarihler bugünün (Cum 17 Tem 2026) hafta içi/sonu dağılımına sadık.
const days: GlassTourDay[] = [
  {
    date: '2026-07-17',
    label: 'Cum 17 Tem',
    slots: [
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
      { time: '16:00', available: false },
    ],
  },
  {
    date: '2026-07-18',
    label: 'Cmt 18 Tem',
    slots: [
      { time: '09:30', available: true },
      { time: '10:30', available: true },
      { time: '12:00', available: true },
      { time: '15:00', available: false },
    ],
  },
  {
    date: '2026-07-19',
    label: 'Paz 19 Tem',
    slots: [],
  },
  {
    date: '2026-07-20',
    label: 'Pzt 20 Tem',
    slots: [
      { time: '10:00', available: false },
      { time: '11:00', available: false },
      { time: '14:00', available: false },
    ],
  },
  {
    date: '2026-07-21',
    label: 'Sal 21 Tem',
    slots: [
      { time: '09:00', available: true },
      { time: '11:30', available: true },
      { time: '13:30', available: true },
      { time: '16:30', available: true },
    ],
  },
  {
    date: '2026-07-22',
    label: 'Çar 22 Tem',
    slots: [
      { time: '10:00', available: true },
      { time: '15:30', available: true },
    ],
  },
]

const meta = {
  title: 'Components/GlassTourScheduler',
  component: GlassTourScheduler,
  tags: ['autodocs'],
  args: { days, onRequest: fn() },
  argTypes: {
    variant: { control: 'select', options: ['grid', 'compact'] },
    material: { control: 'select', options: ['glass', 'flat'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    tourTypes: { control: false, description: 'Varsayılan: Yerinde · Canlı video · 3D self-tur' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'İzmir, Urla — "Zeytinlik İçinde Deniz Manzaralı İmarlı Arsa" ilanı için yerinde görme ' +
          'randevusu akışı: gün şeridi → saat ızgarası (dolu slotlar disabled) → tur tipi → "Randevu iste". ' +
          'Gönderim sonrası iç state onay ekranına (✓ özet) geçer; "Yeni randevu planla" ile forma dönülür.',
      },
    },
  },
} satisfies Meta<typeof GlassTourScheduler>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480, margin: '48px auto' }}>
      <GlassTourScheduler {...args} />
    </div>
  ),
}

export const Playground: Story = { render: Default.render }

/** Varyant ekseni: `grid` çok kolonlu saat ızgarası — `compact` tek kolon, dar panel. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;grid&quot; (varsayılan)</p>
        <GlassTourScheduler {...args} variant="grid" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;compact&quot;</p>
        <GlassTourScheduler {...args} variant="compact" />
      </div>
    </div>
  ),
}

/** Malzeme karşılaştırması: içerik sayfasında `material="flat"` önerilir. */
export const Materials: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;glass&quot;</p>
        <GlassTourScheduler {...args} material="glass" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;flat&quot; (önerilen)</p>
        <GlassTourScheduler {...args} material="flat" />
      </div>
    </div>
  ),
}

/**
 * State matrisi: boş form (hiçbir şey seçilmedi, "Randevu iste" disabled) · saat seçilmiş
 * (gönderim aktif) · tamamen dolu gün ("Dolu" rozeti + "uygun saat bulunmuyor") · onay ekranı
 * (play function ile gün + saat seçilip gönderilerek ulaşılır — onay `submitted` internal state'tir, prop'la açılamaz).
 */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', maxWidth: 1200 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Boş form</p>
        <GlassTourScheduler {...args} />
      </div>
      <div data-testid="dolu-gun">
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Tamamen dolu gün seçili (play ile)</p>
        <GlassTourScheduler {...args} onRequest={fn()} />
      </div>
      <div data-testid="onay-ekrani">
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Onay ekranı (play ile gönderilmiş)</p>
        <GlassTourScheduler {...args} onRequest={fn()} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const doluGun = within(await canvas.findByTestId('dolu-gun'))
    await userEvent.click(doluGun.getByRole('radio', { name: /Pzt 20 Tem/ }))

    const onayEkrani = within(await canvas.findByTestId('onay-ekrani'))
    await userEvent.click(onayEkrani.getByRole('radio', { name: '14:00' }))
    await userEvent.click(onayEkrani.getByRole('button', { name: 'Randevu iste' }))
  },
}

/**
 * Uzun içerik: özel `tourTypes` uzun etiketlerle segment barını daraltmaz (yatay scroll'a
 * düşer — GlassSegmentedControl sözleşmesi); gün şeridi de aynı şekilde taşar.
 */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    tourTypes: ['Danışmanla Yerinde Ziyaret', 'Canlı Görüntülü Bağlantı', '3D Sanal Tur Deneyimi', 'Drone ile Hava Turu'],
    days: [
      {
        date: '2026-07-17',
        label: 'Cuma, 17 Temmuz — Zeytin Hasadı Öncesi',
        slots: [
          { time: '10:00', available: true },
          { time: '11:00', available: true },
        ],
      },
      ...days.slice(1),
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 400, margin: '48px auto' }}>
      <GlassTourScheduler {...args} />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story:
          'Gün şeridi ve saat ızgarası birer `radiogroup` — ok tuşlarıyla dolaşılır (roving tabindex), ' +
          'disabled saatler gezinmede atlanır. Tur tipi GlassSegmentedControl\'ün kendi radiogroup ' +
          'sözleşmesini kullanır. Onay ekranı `role="status" aria-live="polite"` ile duyurulur. ' +
          'Klavyeyle gezinip odak halkasını (`:focus-visible`) doğrulayın.',
      },
    },
  },
}

/** Responsive: dar viewport'ta gün/saat chip'leri dokunma hedefi ≥44px'e büyür (pointer: coarse). */
export const Mobil: Story = {
  render: (args) => (
    <div style={{ maxWidth: 340, margin: '24px auto' }}>
      <GlassTourScheduler {...args} variant="compact" />
    </div>
  ),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
