import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassLocationCard } from './GlassLocationCard'

const meta = {
  title: 'Bileşenler/Medya ve Harita/GlassLocationCard',
  component: GlassLocationCard,
  tags: ['autodocs'],
} satisfies Meta<typeof GlassLocationCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    address: 'İstanbul, Kadıköy — Fenerbahçe Mah.',
    note: 'Güvenlik nedeniyle konum yaklaşık gösterilir.',
    onOpenMap: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassLocationCard {...args} />
    </div>
  ),
}

export const WithoutButton: Story = {
  args: { address: 'Ankara, Çankaya — Bahçelievler Mah.' },
  render: Default.render,
}

/**
 * Malzeme karşılaştırması: içerik sayfasında `material="flat"` önerilir — harita
 * görseli zaten doygun renklidir (bkz. rules.md §12). Harita deseni her iki malzemede
 * aynı render edilir (bilinen borç: malzeme duyarsız).
 */
export const Materials: Story = {
  args: {
    address: 'İzmir, Karşıyaka — Bostanlı Mah.',
    note: 'Güvenlik nedeniyle konum yaklaşık gösterilir.',
    onOpenMap: fn(),
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 760, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;glass&quot; — yalnız medya üstü</p>
        <GlassLocationCard {...args} material="glass" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;flat&quot; — içerik sayfası (önerilen)</p>
        <GlassLocationCard {...args} material="flat" />
      </div>
    </div>
  ),
}

/**
 * Uzun içerik: adres kırpılmaz, sarar (line-height 1.4); uzun mahalle/site adı ve
 * çok satırlı dipnot dar container'da güvenlidir. Harita yüksekliği 150px sabit kalır.
 */
export const UzunIcerik: Story = {
  args: {
    address: 'İstanbul, Büyükçekmece — Pınartepe Mahallesi, Atatürk Bulvarı Deniz Konakları Sitesi B Blok Çevresi',
    note: 'Güvenlik nedeniyle konum yaklaşık gösterilir; kesin adres, randevu onaylandıktan sonra mesaj üzerinden paylaşılır.',
    onOpenMap: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 280, margin: '48px auto' }}>
      <GlassLocationCard {...args} />
    </div>
  ),
}
