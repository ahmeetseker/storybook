import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassListingDetailHeader, type GlassListingMetaItem } from './GlassListingDetailHeader'

const META_ITEMS: GlassListingMetaItem[] = [
  { id: 'no', label: 'İlan no', value: '2026-114-8207' },
  { id: 'updated', label: 'Güncelleme', value: '21 Tem 2026' },
  { id: 'type', label: 'Tip', value: 'Tarla' },
]

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassListingDetailHeader',
  component: GlassListingDetailHeader,
  tags: ['autodocs'],
  argTypes: {
    headingLevel: { control: 'select', options: [1, 2, 3] },
    material: { control: 'select', options: ['flat', 'glass'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
  },
} satisfies Meta<typeof GlassListingDetailHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: "Ören'de 4.850 m² tarla",
    price: '8.750.000 ₺',
    priceUnit: '1.804 ₺/m²',
    meta: META_ITEMS,
  },
  render: (args) => (
    <div style={{ maxWidth: 860, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: "Ören'de 4.850 m² tarla",
    price: '8.750.000 ₺',
    priceUnit: '1.804 ₺/m²',
    priceNote: '4.850 m² beyan',
    meta: META_ITEMS,
    status: { label: 'Aktif ilan', tone: 'success' },
  },
  render: Default.render,
}

/** `material="flat"` (varsayılan) düz yüzey üretir; `material="glass"` içerik katmanına açık bir opt-in'dir. */
export const Materials: Story = {
  args: Default.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} material="flat" />
      <GlassListingDetailHeader {...args} material="glass" />
    </div>
  ),
}

/** `headingLevel` 1-2-3 — sayfa başına tek görünür `h1` kuralı için ayarlanabilir. */
export const Sizes: Story = {
  args: Default.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} headingLevel={1} />
      <GlassListingDetailHeader {...args} headingLevel={2} />
      <GlassListingDetailHeader {...args} headingLevel={3} />
    </div>
  ),
}

/** Durum metni her zaman görünür yazıyla taşınır; ton yalnız vurgu rengidir. */
export const States: Story = {
  args: Default.args,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} status={{ label: 'Aktif ilan', tone: 'success' }} />
      <GlassListingDetailHeader {...args} status={{ label: 'Fiyat güncellendi', tone: 'warning' }} />
      <GlassListingDetailHeader {...args} status={{ label: 'Yayından kaldırıldı', tone: 'danger' }} />
      <GlassListingDetailHeader {...args} status={{ label: 'İncelemede', tone: 'neutral' }} />
    </div>
  ),
}

/** Uzun Türkçe başlık + altı meta öğesi — başlık `text-wrap: balance` ile satır kırar, meta sarmalanır. */
export const UzunIcerik: Story = {
  args: {
    title:
      'Muğla Milas Selimiye mevkii, zeytinlik ve bağ arasında deniz manzaralı büyük tarla imarlı arsa — köşe parsel, iki cepheli',
    price: '24.500.000 ₺',
    priceUnit: '3.245 ₺/m²',
    priceNote: 'Beyan edilen 7.550 m² üzerinden hesaplanmıştır',
    meta: [
      { id: 'no', label: 'İlan no', value: '2026-330-1147' },
      { id: 'updated', label: 'Güncelleme', value: '27 Tem 2026' },
      { id: 'type', label: 'Tip', value: 'Tarla / İmarlı arsa' },
      { id: 'area', label: 'Yüzölçümü', value: '7.550 m²' },
      { id: 'block', label: 'Ada/Parsel', value: '112/4' },
      { id: 'zoning', label: 'İmar durumu', value: 'Konut, E:0.30' },
    ],
    status: { label: 'Aktif ilan', tone: 'success' },
  },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} />
    </div>
  ),
}

/** Dar container (360px): container query iki kolonu tek kolona indirir, fiyat blok sola yaslanır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile360' } },
  args: Playground.args,
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} />
    </div>
  ),
}

/** Düz fildişi zemin: durum tonları ve fiyat okunurluğu arka plan sabitlenerek denetlenir. */
export const DuzZemin: Story = {
  parameters: { globals: { backgroundKey: 'light' } },
  args: Playground.args,
  render: (args) => (
    <div style={{ maxWidth: 860, margin: '48px auto' }}>
      <GlassListingDetailHeader {...args} />
    </div>
  ),
}

/**
 * `h1` sayfanın tek görünür başlığıdır; `utilities` slotundaki gerçek
 * `<button>` DOM sırasında başlıktan sonra, klavye focus akışında doğal
 * sekme sırasındadır.
 */
export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    ...Playground.args,
    utilities: (
      <>
        <button type="button">Kaydet</button>
        <button type="button">Paylaş</button>
      </>
    ),
  },
  render: Default.render,
}
