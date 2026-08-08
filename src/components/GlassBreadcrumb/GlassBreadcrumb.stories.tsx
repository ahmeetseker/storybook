import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassBreadcrumb } from './GlassBreadcrumb'

const meta = {
  title: 'Bileşenler/Navigasyon/GlassBreadcrumb',
  component: GlassBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text', description: 'Ayraç (aria-hidden render edilir); default ›' },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    maxItems: { control: 'number', description: 'Görünür öğe tavanı (min 3); aşan ara seviyeler "…" altında toplanır' },
    // hover/focus control değildir — CSS state'idir (bkz. rules.md)
  },
} satisfies Meta<typeof GlassBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Vasıta', onClick: fn() },
      { label: 'Otomobil', onClick: fn() },
      { label: 'Volkswagen', onClick: fn() },
      { label: 'Golf 1.6 TDI' },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Emlak', onClick: fn() }, { label: 'Satılık Daire' }],
  },
}

/** Özel ayraç: ayraç yalnız görseldir (aria-hidden) — tıklanabilir öğe koymayın. */
export const CustomSeparator: Story = {
  args: {
    separator: '/',
    items: [
      { label: 'İkinci El ve Sıfır Alışveriş', onClick: fn() },
      { label: 'Bilgisayar', onClick: fn() },
      { label: 'Dizüstü' },
    ],
  },
}

/**
 * Gerçek URL'li öğeler: `href` verilen ara öğeler `<a>` render edilir — orta tık,
 * yeni sekme ve SEO çalışır. `onClick` birlikte verildiğinde sade sol tık SPA
 * gezinmesine devredilir; modifier'lı tık tarayıcıda kalır.
 */
export const GercekLinkler: Story = {
  args: {
    items: [
      { label: 'Anasayfa', href: '/', onClick: fn() },
      { label: 'Emlak ara', href: '/emlak', onClick: fn() },
      { label: 'Satılık Daire' },
    ],
  },
}

/**
 * Derin hiyerarşi daraltması: `maxItems` tavanını aşan ara seviyeler "…" butonunda
 * toplanır. Buton yerinde açar — cam kapsülün içine ikinci bir cam panel (menü)
 * açılmaz (cam üstüne cam yok); odak açılan ilk öğeye taşınır.
 */
export const DaraltilmisYol: Story = {
  args: {
    maxItems: 3,
    items: [
      { label: 'Anasayfa', href: '/', onClick: fn() },
      { label: 'İkinci El ve Sıfır Alışveriş', href: '#', onClick: fn() },
      { label: 'Mobilya ve Aksesuar', href: '#', onClick: fn() },
      { label: 'Oturma Odası Takımları', href: '#', onClick: fn() },
      { label: 'Üçlü Kanepe Modelleri' },
    ],
  },
}

/**
 * Uzun içerik + dar container: çok seviyeli hiyerarşi ve uzun Türkçe kategori adlarında
 * öğeler kırpılmaz; liste dar alanda satır atlayarak (flex-wrap) devam eder.
 */
export const UzunIcerik: Story = {
  args: {
    items: [
      { label: 'İkinci El ve Sıfır Alışveriş', onClick: fn() },
      { label: 'Ev Dekorasyon ve Bahçe Ürünleri', onClick: fn() },
      { label: 'Mobilya ve Aksesuar', onClick: fn() },
      { label: 'Oturma Odası Takımları', onClick: fn() },
      { label: 'Üçlü Kanepe ve Köşe Koltuk Modelleri' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <GlassBreadcrumb {...args} />
    </div>
  ),
}
