import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSpecTable } from './GlassSpecTable'

const carSpecs = [
  { label: 'Marka', value: 'Volkswagen' },
  { label: 'Seri', value: 'Golf' },
  { label: 'Model', value: '1.6 TDI Comfortline' },
  { label: 'Yıl', value: '2019' },
  { label: 'Kilometre', value: '87.500 km' },
  { label: 'Vites', value: 'Otomatik' },
  { label: 'Yakıt', value: 'Dizel' },
  { label: 'Renk', value: 'Beyaz' },
  { label: 'Hasar Kaydı', value: 'Yok' },
  { label: 'Takas', value: 'Evet' },
]

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassSpecTable',
  component: GlassSpecTable,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'select', options: [1, 2] },
  },
} satisfies Meta<typeof GlassSpecTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs },
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassSpecTable {...args} />
    </div>
  ),
}

export const TwoColumns: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs, columns: 2 },
  render: (args) => (
    <div style={{ maxWidth: 720, margin: '48px auto' }}>
      <GlassSpecTable {...args} />
    </div>
  ),
}

export const WithoutTitle: Story = {
  args: { items: carSpecs.slice(0, 4) },
  render: Default.render,
}

/**
 * Malzeme karşılaştırması — bu component'in ayırt edici davranışı: satır ayracı
 * `data-material` ile değişir (cam beyaz-alfa, flat koyu). İçerik sayfasında
 * `material="flat"` önerilir (bkz. rules.md §12).
 */
export const Materials: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs.slice(0, 6) },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: 860, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;glass&quot; — beyaz-alfa ayraç</p>
        <GlassSpecTable {...args} material="glass" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;flat&quot; — koyu ayraç (önerilen)</p>
        <GlassSpecTable {...args} material="flat" />
      </div>
    </div>
  ),
}

/**
 * Sütun ekseni yan yana: `columns=1` dar sütun için, `columns=2` 8+ item'lı geniş
 * kartlar için. Responsive collapse YOK — dar container'da `columns=1` vermek çağıranın işi.
 */
export const Columns: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>columns=1 (default) — dar sütun</p>
        <div style={{ maxWidth: 420 }}>
          <GlassSpecTable {...args} columns={1} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>columns=2 — geniş kart, satır-yönlü dolar</p>
        <GlassSpecTable {...args} columns={2} />
      </div>
    </div>
  ),
}

/**
 * Uzun içerik: `value` sağa hizalı ve `overflow-wrap: anywhere` ile kırılır — uzun
 * adres de kesintisiz şasi no da güvenlidir. `label` sarmaz (nowrap); uzun açıklamayı
 * value'ya koy, etiketi kısa tut.
 */
export const UzunIcerik: Story = {
  args: {
    title: 'Araç ve Satıcı Bilgileri',
    items: [
      { label: 'Model', value: '1.6 TDI Comfortline DSG Highline Paket' },
      { label: 'Şasi No', value: 'WVWZZZ1KZAW123456' },
      { label: 'Adres', value: 'Barbaros Mahallesi, Mimar Sinan Caddesi No: 24/3, Ataşehir / İstanbul' },
      { label: 'Durum', value: 'Boyasız, değişensiz; tüm bakımları yetkili serviste yapılmış' },
      { label: 'Takas', value: 'Yalnız model yılı 2020 ve üzeri SUV sınıfı araçlarla değerlendirilir' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 300, margin: '48px auto' }}>
      <GlassSpecTable {...args} />
    </div>
  ),
}
